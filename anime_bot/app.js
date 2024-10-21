const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cliProgress = require("cli-progress");
const dotenv = require("dotenv");
const randomUseragent = require("random-useragent");

dotenv.config();

if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: ".env.development", override: true });
}

puppeteer.use(StealthPlugin());

const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let browser;

function handleCookieBanner(page) {
    return new Promise(async (resolve) => {
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
        resolve();
    });
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
    return page.evaluate(() => {
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
    await newPage.setCacheEnabled(true);
    await newPage.goto(anime.link, {
        waitUntil: "load",
        timeout: 6000000,
    });
    await newPage.waitForSelector("#sousBlocMilieu", { timeout: 6000000 });

    const seasonsDiv = await newPage.waitForSelector(
        "#sousBlocMilieu > div.mx-3.md\\:mx-10 > div.flex.flex-wrap.overflow-y-hidden.justify-start.bg-slate-900.bg-opacity-70.rounded.mt-2.h-auto",
        { timeout: 6000000 }
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

async function fetchAllEpisodes(animeData, currentBrowser) {
    const browser = currentBrowser || (await ensureBrowser());
    const allEpisodes = [];

    for (const season of animeData.seasons) {
        const seasonPage = await browser.newPage({
            timeout: 6000000,
        });
        await seasonPage.setCacheEnabled(false);
        await seasonPage.deleteCookie(...(await seasonPage.cookies()));

        await seasonPage.goto(`${animeData.url}/${season.href}`, {
            timeout: 6000000,
            waitUntil: "load",
        });

        const episodesData = await seasonPage.evaluate(async () => {
            const episodes = [];
            const episodeSelect = document.querySelector("#selectEpisodes");
            const lecteurSelect = document.querySelector("#selectLecteurs");
            const iframe = document.querySelector("#playerDF");

            if (episodeSelect && lecteurSelect && iframe) {
                const episodeOptions = Array.from(episodeSelect.options);
                const lecteurOptions = Array.from(lecteurSelect.options);

                for (const episodeOption of episodeOptions) {
                    const episodeNumber = episodeOption.textContent.trim();
                    const players = [];

                    episodeSelect.value = episodeOption.value;
                    episodeSelect.dispatchEvent(new Event("change"));

                    for (const lecteurOption of lecteurOptions) {
                        const lecteurName = lecteurOption.textContent.trim();
                        const lecteurValue = lecteurOption.value;

                        lecteurSelect.value = lecteurValue;
                        lecteurSelect.dispatchEvent(new Event("change"));

                        players.push({
                            name: lecteurValue,
                            src: iframe.src,
                        });
                    }

                    episodes.push({
                        episodeNumber,
                        players,
                    });
                }
            }

            console.log(episodes);
            return episodes;
        });

        allEpisodes.push({
            seasonName: season.seasonName,
            episodes: episodesData,
        });

        await seasonPage.close();
    }

    animeData.episodes = allEpisodes;

    return animeData;
}

async function insertAnimeData(animeData) {
    try {
        let animeUpdated = false;
        let seasonsUpdated = false;
        let episodesUpdated = false;
        let playersUpdated = false;

        let { data: existingAnime, error: animeError } = await supabase
            .from("animes")
            .select("*")
            .eq("name", animeData.animeName)
            .single();

        if (animeError && animeError.code !== "PGRST116") throw animeError;

        if (!existingAnime || existingAnime.image_url !== animeData.img) {
            const { data: anime, error: upsertError } = await supabase
                .from("animes")
                .upsert({
                    name: animeData.animeName,
                    image_url: animeData.img,
                })
                .select()
                .single();

            if (upsertError) throw upsertError;
            existingAnime = anime;
            animeUpdated = true;
        }

        for (const season of animeData.episodes) {
            let { data: existingSeason, error: seasonError } = await supabase
                .from("seasons")
                .select("*")
                .eq("anime_id", existingAnime.id)
                .eq("name", season.seasonName)
                .single();

            if (seasonError && seasonError.code !== "PGRST116")
                throw seasonError;

            if (
                !existingSeason ||
                existingSeason.url !== `${animeData.url}/${season.seasonName}`
            ) {
                const { data: seasonData, error: upsertError } = await supabase
                    .from("seasons")
                    .upsert({
                        anime_id: existingAnime.id,
                        name: season.seasonName,
                        url: `${animeData.url}/${season.seasonName}`,
                    })
                    .select()
                    .single();

                if (upsertError) throw upsertError;
                existingSeason = seasonData;
                seasonsUpdated = true;
            }

            for (const episode of season.episodes) {
                let { data: existingEpisode, error: episodeError } =
                    await supabase
                        .from("episodes")
                        .select("*")
                        .eq("season_id", existingSeason.id)
                        .eq("episode_number", episode.episodeNumber)
                        .single();

                if (episodeError && episodeError.code !== "PGRST116")
                    throw episodeError;

                if (!existingEpisode) {
                    const { data: episodeData, error: upsertError } =
                        await supabase
                            .from("episodes")
                            .upsert({
                                season_id: existingSeason.id,
                                episode_number: episode.episodeNumber,
                            })
                            .select()
                            .single();

                    if (upsertError) throw upsertError;
                    existingEpisode = episodeData;
                    episodesUpdated = true;
                }

                for (const player of episode.players) {
                    let { data: existingPlayer, error: playerError } =
                        await supabase
                            .from("players")
                            .select("*")
                            .eq("episode_id", existingEpisode.id)
                            .eq("name", player.name)
                            .single();

                    if (playerError && playerError.code !== "PGRST116")
                        throw playerError;

                    if (!existingPlayer || existingPlayer.src !== player.src) {
                        const { error: upsertError } = await supabase
                            .from("players")
                            .upsert({
                                episode_id: existingEpisode.id,
                                name: player.name,
                                src: player.src,
                            });

                        if (upsertError) throw upsertError;
                        playersUpdated = true;
                    }
                }
            }
        }

        if (
            animeUpdated ||
            seasonsUpdated ||
            episodesUpdated ||
            playersUpdated
        ) {
            console.log(` Anime "${animeData.animeName}" mis à jour :`);
            if (animeUpdated)
                console.log("- Informations de l'anime mises à jour");
            if (seasonsUpdated)
                console.log("- Nouvelles saisons ajoutées ou mises à jour");
            if (episodesUpdated) console.log("- Nouveaux épisodes ajoutés");
            if (playersUpdated)
                console.log("- Nouveaux lecteurs ajoutés ou mis à jour");
        } else {
            console.log(
                ` Anime "${animeData.animeName}" : Aucune mise à jour nécessaire.`
            );
        }
    } catch (error) {
        console.error(
            ` Erreur lors de la vérification ou de la mise à jour de l'anime "${animeData.animeName}":`,
            error
        );
    }
}

async function scrapeAnime() {
    try {
        browser = await puppeteer.launch({
            headless: true,
            timeout: 6000000,
            protocolTimeout: 6000000,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-features=site-per-process",
            ],
        });
        const page = await browser.newPage();
        await page.setCacheEnabled(false);
        const userAgent = randomUseragent.getRandom();
        await page.setUserAgent(userAgent);

        try {
            await page.deleteCookie(...(await page.cookies()));

            await page.goto("https://anime-sama.fr/catalogue/", {
                timeout: 6000000,
                waitUntil: "load",
                maxRedirects: 100000000,
            });
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

            const batchSize = 5;
            for (let i = 0; i < animes.length; i += batchSize) {
                const batch = animes.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(async (anime) => {
                        try {
                            const data = await retryOperation(() =>
                                fetchAnimeData(anime, browser)
                            );
                            if (data) {
                                const dataWithEpisodes = await retryOperation(
                                    () => fetchAllEpisodes(data, browser)
                                );
                                await insertAnimeData(dataWithEpisodes);
                            }
                        } catch (error) {
                            console.error(
                                `Erreur lors du traitement de l'anime ${anime.name}:`,
                                error
                            );
                        } finally {
                            progressBar.increment();
                        }
                    })
                );

                await delay(5000);

                if (global.gc) {
                    global.gc();
                }
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
    } catch (error) {
        console.error("Erreur pendant le scraping:", error);
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

async function retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await delay(5000);
        }
    }
}

async function ensureBrowser() {
    if (!browser || !browser.isConnected()) {
        if (browser) {
            await browser.close();
        }
        browser = await puppeteer.launch({
            headless: true,
            timeout: 6000000,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
    }
    return browser;
}

process.nextTick(scrapeAnime);
