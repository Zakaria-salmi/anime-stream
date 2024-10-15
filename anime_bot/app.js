const puppeteer = require("puppeteer");
const fs = require("fs");
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

        return visibleAnimes.map((anime) => {
            const linkElement = anime.querySelector("div > a");
            const imgElement = anime.querySelector("div > a > img");
            const h1Element = anime.querySelector("div > h1");
            const link = linkElement ? linkElement.href : "Link not found";
            const img = imgElement ? imgElement.src : "Image not found";
            const name = h1Element ? h1Element.textContent : "Name not found";
            return { link, img, name };
        });
    });
}

async function checkSeasons(browser, anime) {
    let season = 1;
    let pageExists = true;

    while (pageExists) {
        const seasonUrl = `${anime.link}/saison${season}/vostfr`;
        console.log(`Checking URL: ${seasonUrl}`);

        try {
            const newPage = await browser.newPage();
            const response = await newPage.goto(seasonUrl, {
                waitUntil: "networkidle0",
            });

            if (response.status() === 404) {
                console.log(`Season ${season} does not exist for this anime.`);
                pageExists = false;
            } else {
                const errorMsg = await newPage.$("#msgErrorEp");
                if (errorMsg && (await errorMsg.isVisible())) {
                    console.log(
                        `Error message #msgErrorEp is present and visible for season ${season}. Moving to next anime.`
                    );
                    pageExists = false;
                } else {
                    console.log(
                        `Fetching episodes for season ${season} for ${anime.name}`
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

                    console.log(
                        `Season ${season} - Episodes fetched:`,
                        episodes
                    );
                    season++;
                }
            }

            await newPage.close();
        } catch (error) {
            console.error(`Error while checking URL ${seasonUrl}:`, error);
            pageExists = false;
        }

        await delay(500);
    }

    return season;
}

async function scrapeAnime() {
    try {
        const { browser, page } = await launchBrowser();
        await page.goto("https://anime-sama.fr/catalogue/");

        await handleCookieBanner(page);
        await applyFilters(page);

        const animes = await fetchAnimes(page);

        for (const anime of animes) {
            const seasonCount = await checkSeasons(browser, anime);
            console.log(
                `The anime ${anime.link} has ${seasonCount} season(s).`
            );
        }

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
