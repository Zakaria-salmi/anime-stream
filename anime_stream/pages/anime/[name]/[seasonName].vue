<template>
    <div>
        <NuxtLink :to="`/anime/${animeName}`" class="mb-4 inline-block">
            <UButton
                icon="i-heroicons-arrow-left-20-solid"
                variant="soft"
                class="light:bg-gray-500 dark:bg-gray-700"
            >
                Retour aux saisons
            </UButton>
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-4">
            {{ seasonName }}
        </h1>
        <div v-if="loading" class="container mx-auto px-4 py-8 mb-8 rounded-lg">
            <div class="flex flex-row items-center space-x-4 mb-4">
                <div
                    class="h-10 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                ></div>
                <div
                    class="h-10 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
                ></div>
            </div>
            <div
                class="w-full h-[600px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
            ></div>
        </div>
        <div v-else class="flex flex-col space-y-4">
            <div class="flex flex-row items-center space-x-4">
                <USelectMenu
                    searchable
                    id="episodeSelect"
                    v-model="selectedEpisode"
                    :options="episodeOptions"
                    class="mb-4 lg:w-48"
                >
                </USelectMenu>
                <USelectMenu
                    searchable
                    id="playerSelect"
                    v-model="selectedPlayer"
                    :options="playersOptions"
                    class="mb-4 lg:w-48"
                >
                </USelectMenu>
            </div>
            <div class="mt-4">
                <iframe
                    :src="selectedPlayerUrl"
                    width="100%"
                    height="600px"
                    frameborder="0"
                    class="rounded-lg mb-4"
                    allowfullscreen
                ></iframe>
            </div>
        </div>
        <div class="flex flex-row items-center justify-end space-x-4 mb-24">
            <UButton @click="previousEpisode"> Précédent </UButton>
            <UButton @click="nextEpisode"> Suivant </UButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const animeName = route.params.name as string;
const seasonName = route.params.seasonName as string;

interface Episode {
    id: number;
    episode_number: string;
    players: Player[];
}

interface Player {
    id: number;
    name: string;
    src: string;
}

const episodes = ref<Episode[]>([]);
const selectedEpisode = ref<Episode | null>(null);
const selectedPlayer = ref<Player | null>(null);
const selectedPlayerUrl = ref("");
const loading = ref(true);

const episodeOptions = computed(() =>
    episodes.value
        .map((ep) => ({
            ...ep,
            label: ep.episode_number,
            value: ep.id,
        }))
        .sort((a, b) => {
            return a.episode_number.localeCompare(b.episode_number, "fr", {
                numeric: true,
                sensitivity: "base",
            });
        })
);

const playersOptions = computed(() =>
    (selectedEpisode.value?.players || [])
        .map((p) => ({
            label: p.name,
            src: p.src,
        }))
        .sort((a, b) =>
            a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
        )
);

const supabase = useSupabaseClient();

async function fetchEpisodes() {
    loading.value = true;
    try {
        const { data: animeData, error: animeError } = await supabase
            .from("animes")
            .select("id")
            .eq("name", animeName)
            .single();

        if (animeError) throw animeError;

        const { data: seasonData, error: seasonError } = await supabase
            .from("seasons")
            .select("id")
            .eq("anime_id", animeData.id)
            .eq("name", seasonName)
            .single();

        if (seasonError) throw seasonError;

        const { data: episodesData, error: episodesError } = await supabase
            .from("episodes")
            .select(
                `
                *,
                players (
                    id,
                    name,
                    src
                )
            `
            )
            .eq("season_id", seasonData.id);

        if (episodesError) throw episodesError;

        episodes.value = episodesData || [];
        if (episodes.value.length > 0) {
            selectedEpisode.value = episodeOptions.value[0];
            selectedPlayer.value =
                selectedEpisode.value.players.find(
                    (p) => p.name === "Lecteur 1"
                ) || null;
            selectedPlayerUrl.value = selectedPlayer.value?.src || "";
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
    } finally {
        loading.value = false;
    }
}

function previousEpisode() {
    const currentIndex = episodeOptions.value.findIndex(
        (ep) => ep.id === selectedEpisode.value?.id
    );
    if (currentIndex > 0) {
        selectedEpisode.value = episodeOptions.value[currentIndex - 1];
    }
}

function nextEpisode() {
    const currentIndex = episodeOptions.value.findIndex(
        (ep) => ep.id === selectedEpisode.value?.id
    );
    if (currentIndex < episodeOptions.value.length - 1) {
        selectedEpisode.value = episodeOptions.value[currentIndex + 1];
    }
}

onMounted(fetchEpisodes);

watch(selectedEpisode, (newEpisode) => {
    selectedPlayer.value = newEpisode?.players[0] || null;
    selectedPlayer.value = playersOptions.value[0] || null;
    selectedPlayerUrl.value = selectedPlayer.value?.src || "";
});

watch(selectedPlayer, (newPlayer) => {
    selectedPlayerUrl.value = newPlayer?.src || "";
});
</script>
