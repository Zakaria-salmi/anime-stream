const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");

async function launchBrowser() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    return { browser, page };
}

async function handleCookieBanner(page) {
    const cookieBanner = await page.$(
        "#qc-cmp2-ui > div.qc-cmp2-footer.qc-cmp2-footer-overlay.qc-cmp2-footer-scrolled > div > button.css-k8o10q"
    );

    if (cookieBanner) {
        await cookieBanner.click();
        await page.waitForSelector(
            "#qc-cmp2-ui > div.qc-cmp2-footer.qc-cmp2-footer-overlay.qc-cmp2-footer-scrolled > div > button.css-k8o10q",
            { hidden: true }
        );
    }
}

async function applyFilters(page) {
    const vostfrCheckbox = await page.waitForSelector(
        "#sousBlocMilieu > div.w-full > div.flex.flex-wrap.justify-center.bg-gray-900.w-full.py-2.bg-opacity-50 > label:nth-child(5)"
    );
    const animeCheckbox = await page.waitForSelector(
        "#sousBlocMilieu > div.w-full > div.flex.flex-wrap.justify-center.bg-gray-900.w-full.py-2.bg-opacity-50 > label:nth-child(1)"
    );
    const filterButton = await page.waitForSelector("#btnTriList");

    await animeCheckbox.click();
    await vostfrCheckbox.click();
    await filterButton.click();
}

async function fetchAnimes(page) {
    return await page.evaluate(() => {
        const resultCatalog = document.querySelector("#result_catalogue");
        const visibleAnimes = Array.from(resultCatalog.children).filter(
            (child) => {
                const style = window.getComputedStyle(child);
                return style.display !== "none";
            }
        );

        return visibleAnimes.map((anime, index) => {
            const linkElement = anime.querySelector("div > a");
            const imgElement = anime.querySelector("div > a > img");
            const h1Element = anime.querySelector("div > h1");
            const link = linkElement ? linkElement.href : "Link not found";
            const img = imgElement ? imgElement.src : "Image not found";
            const name = h1Element ? h1Element.textContent : "Name not found";
            return { id: index + 1, link, img, name };
        });
    });
}

async function checkSeasons(browser, anime) {
    let season = 1;
    let pageExists = true;
    let allSeasons = {};

    while (pageExists) {
        const seasonUrl = `${anime.link}/saison${season}/vostfr`;
        console.log(`Vérification de l'URL : ${seasonUrl}`);

        try {
            const newPage = await browser.newPage();
            const response = await newPage.goto(seasonUrl, {
                waitUntil: "domcontentloaded",
            });

            if (response.status() === 404) {
                console.log(`La saison ${season} n'existe pas pour cet anime.`);
                pageExists = false;
            } else {
                const errorMsg = await newPage.$("#msgErrorEp");
                if (errorMsg && (await errorMsg.isVisible())) {
                    console.log(`Passage à l'anime suivant.`);
                    pageExists = false;
                } else {
                    console.log(
                        `Récupération des épisodes pour la saison ${season} de ${anime.name}`
                    );
                    const episodes = await newPage.evaluate(() => {
                        const episodeSelect =
                            document.querySelector("#selectEpisodes");
                        const results = [];

                        if (episodeSelect) {
                            for (
                                let i = 0;
                                i < episodeSelect.options.length;
                                i++
                            ) {
                                episodeSelect.selectedIndex = i;
                                episodeSelect.dispatchEvent(
                                    new Event("change")
                                );

                                const defaultPlayer =
                                    document.querySelector("#playerDF");
                                const playerSelect =
                                    document.querySelector("#selectLecteurs");
                                const players = [];

                                if (defaultPlayer) {
                                    players.push({
                                        name: "Default Player",
                                        link: defaultPlayer.src,
                                    });
                                }

                                if (playerSelect) {
                                    for (
                                        let j = 0;
                                        j < playerSelect.options.length;
                                        j++
                                    ) {
                                        playerSelect.selectedIndex = j;
                                        playerSelect.dispatchEvent(
                                            new Event("change")
                                        );
                                        const player =
                                            document.querySelector("#playerDF");
                                        if (player) {
                                            players.push({
                                                name: playerSelect.options[j]
                                                    .text,
                                                link: player.src,
                                            });
                                        }
                                    }
                                }

                                results.push({
                                    episode: episodeSelect.options[i].text,
                                    players: players,
                                });
                            }
                        }

                        return results;
                    });

                    allSeasons[season] = episodes;
                    season++;
                }
            }

            await newPage.close();
        } catch (error) {
            console.error(
                `Erreur lors de la vérification de l'URL ${seasonUrl}:`,
                error
            );
            pageExists = false;
        }
    }

    const data = {
        id: anime.id,
        anime: anime.name,
        img: anime.img,
        seasons: allSeasons,
    };

    await writeToJson(data, "animes.json");

    return season - 1;
}

async function writeToJson(data, filename) {
    try {
        let existingData = [];
        try {
            const fileContent = await fs.readFile(filename, "utf8");
            existingData = JSON.parse(fileContent);
        } catch (error) {
            console.log(
                `Le fichier ${filename} n'existe pas encore ou est vide. Création d'un nouveau fichier.`
            );
        }

        if (!Array.isArray(existingData)) {
            existingData = [];
            console.log(
                `Le contenu de ${filename} n'est pas un tableau. Initialisation d'un nouveau tableau.`
            );
        }

        const animeIndex = existingData.findIndex(
            (anime) => anime.id === data.id
        );
        if (animeIndex !== -1) {
            existingData[animeIndex] = data;
        } else {
            existingData.push(data);
        }

        const jsonData = JSON.stringify(existingData, null, 2);
        await fs.writeFile(filename, jsonData, "utf8");
        console.log(`Les données ont été écrites avec succès dans ${filename}`);
    } catch (error) {
        console.error(
            `Erreur lors de l'écriture dans le fichier ${filename}:`,
            error
        );
    }
}

async function scrapeAnime() {
    try {
        const { browser, page } = await launchBrowser();
        await page.goto("https://anime-sama.fr/catalogue/");

        await handleCookieBanner(page);
        await applyFilters(page);

        const animes = await fetchAnimes(page);
        let animeCount = 0;

        for (const anime of animes) {
            let retries = 3;
            while (retries > 0) {
                try {
                    const seasonCount = await checkSeasons(browser, anime);
                    console.log(
                        `L'anime ${anime.link} a ${seasonCount} saison(s).`
                    );
                    break;
                } catch (error) {
                    console.error(
                        `Erreur lors du scraping de ${anime.name}, tentative restante : ${retries}`
                    );
                    retries--;
                    if (retries === 0) throw error;
                    await delay(5000); // Attendre 5 secondes avant de réessayer
                }
            }
            animeCount++;
        }

        console.log("scraped finished, anime count : ", animeCount);

        await page.close();
        await browser.close();
    } catch (error) {
        console.error("Error during scraping:", error);
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

scrapeAnime();
