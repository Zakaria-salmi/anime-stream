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
        <div v-if="!loading" class="flex flex-col space-x-4">
            <div class="flex flex-row items-center space-x-4">
                <USelectMenu
                    searchable
                    id="episodeSelect"
                    :options="episodeOptions"
                    class="mb-4 lg:w-48"
                >
                </USelectMenu>
                <USelectMenu
                    searchable
                    id="playerSelect"
                    :options="playersOptions"
                    class="mb-4 lg:w-48"
                >
                </USelectMenu>
            </div>
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
const loading = ref(true);

const episodeOptions = computed(() =>
    episodes.value
        .map((ep) => ({ label: ep.episode_number, value: ep.id }))
        .sort((a, b) => {
            return a.label.localeCompare(b.label, "fr", {
                numeric: true,
                sensitivity: "base",
            });
        })
);

const playersOptions = computed(() =>
    (selectedEpisode.value?.players || [])
        .map((p) => ({
            label: p.name,
            value: p.id,
        }))
        .sort((a, b) =>
            a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
        )
);

const selectedPlayerUrl = computed(() => selectedPlayer.value?.src || "");

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
            selectedEpisode.value = episodes.value[0];
            selectedPlayer.value = selectedEpisode.value.players[0];
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
    } finally {
        loading.value = false;
    }
}

function updateSelectedEpisode(episodeId: number) {
    selectedEpisode.value =
        episodes.value.find((ep) => ep.id === episodeId) || null;
    if (selectedEpisode.value) {
        selectedPlayer.value = selectedEpisode.value.players[0];
    }
}

function updateSelectedPlayer(playerId: number) {
    selectedPlayer.value =
        selectedEpisode.value?.players.find((p) => p.id === playerId) || null;
}

function previousEpisode() {
    const currentIndex = episodes.value.findIndex(
        (ep) => ep.id === selectedEpisode.value?.id
    );
    if (currentIndex > 0) {
        updateSelectedEpisode(episodes.value[currentIndex - 1].id);
    }
}

function nextEpisode() {
    const currentIndex = episodes.value.findIndex(
        (ep) => ep.id === selectedEpisode.value?.id
    );
    if (currentIndex < episodes.value.length - 1) {
        updateSelectedEpisode(episodes.value[currentIndex + 1].id);
    }
}

onMounted(fetchEpisodes);
</script>
