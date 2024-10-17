const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");
const cliProgress = require("cli-progress");

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
    await delay(500);
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
    await delay(500);
    await vostfrCheckbox.click();
    await delay(500);
    await filterButton.click();
    await delay(500);
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

async function fetchAnimeData(anime, browser) {
    const newPage = await browser.newPage();
    await newPage.goto(anime.link);

    const seasonsDiv = await newPage.waitForSelector(
        "#sousBlocMilieu > div.mx-3.md\\:mx-10 > div.flex.flex-wrap.overflow-y-hidden.justify-start.bg-slate-900.bg-opacity-70.rounded.mt-2.h-auto"
    );

    const seasonsData = await newPage.evaluate((seasonsDiv) => {
        const links = seasonsDiv.querySelectorAll("a");
        return Array.from(links).map((link) => {
            const href = link.getAttribute("href");
            const seasonName =
                link.querySelector("div")?.textContent.trim() ||
                "Name not found";
            return { href, seasonName };
        });
    }, seasonsDiv);

    const data = {};
    data.id = anime.id;
    data.url = anime.link;
    data.animeName = anime.name;
    data.img = anime.img;
    data.seasons = seasonsData;

    await newPage.close();
    return data;
}

async function fetchAllEpisodes(animeData, browser) {
    const allEpisodes = [];

    for (const season of animeData.seasons) {
        const seasonPage = await browser.newPage();
        await seasonPage.goto(`${animeData.url}/${season.href}`);

        const episodesData = await seasonPage.evaluate(async () => {
            const episodeElements = document.querySelectorAll(
                "#selectEpisodes option"
            );
            const episodes = [];

            for (const episode of episodeElements) {
                const episodeNumber = episode.textContent.trim();
                const players = [];

                episode.selected = true;
                episode.dispatchEvent(new Event("change"));

                await new Promise((resolve) => setTimeout(resolve, 1000));

                const playerButtons =
                    document.querySelectorAll(".buttonPlayer");
                for (const button of playerButtons) {
                    button.click();
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    const iframe = document.querySelector("#playerDF");
                    if (iframe) {
                        players.push({
                            name: button.textContent.trim(),
                            src: iframe.src,
                        });
                    }
                }

                episodes.push({
                    episodeNumber: episodeNumber,
                    players: players,
                });
            }

            return episodes;
        });

        allEpisodes.push({
            seasonName: season.seasonName,
            episodes: episodesData,
        });
        console.log(allEpisodes);

        await seasonPage.close();
    }

    animeData.episodes = allEpisodes;
    console.log("Données complètes de l'anime avec épisodes :", animeData);

    return animeData;
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
    } catch (error) {
        console.error(
            `Erreur lors de l'écriture dans le fichier ${filename}:`,
            error
        );
    }
}

async function scrapeAnime() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    try {
        await page.goto("https://anime-sama.fr/catalogue/");
        await delay(500);

        await handleCookieBanner(page);
        await applyFilters(page);

        const animes = await fetchAnimes(page);
        console.log("Nombre d'animes : ", animes.length);

        const progressBar = new cliProgress.SingleBar(
            {},
            cliProgress.Presets.shades_classic
        );
        progressBar.start(animes.length, 0);

        for (let i = 0; i < animes.length; i++) {
            const data = await fetchAnimeData(animes[i], browser);
            const dataWithEpisodes = await fetchAllEpisodes(data, browser);
            await writeToJson(dataWithEpisodes, "animes.json");
            progressBar.increment();
        }

        progressBar.stop();
        console.log(
            "\n Scraping terminé, nombre d'animes traités : ",
            animes.length
        );

        await page.close();
    } catch (error) {
        console.error("Erreur pendant le scraping:", error);
    } finally {
        if (browser) await browser.close();
    }

    if (global.gc) {
        global.gc();
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

// Exécuter scrapeAnime dans process.nextTick pour permettre au garbage collector de fonctionner entre les itérations
process.nextTick(scrapeAnime);
