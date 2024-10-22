<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Catalogue d'animes</h1>

        <div v-if="loading" class="flex justify-center items-center h-64">
            <USpinner size="large" />
        </div>

        <div
            v-else-if="error"
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
        >
            <strong class="font-bold">Erreur !</strong>
            <span class="block sm:inline">{{ error }}</span>
        </div>

        <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            <AnimeCard
                v-for="anime in animes"
                :key="anime.id"
                :anime="anime"
                @click="navigateToAnimeDetails(anime.name)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAnimes } from "~/composables/useAnimes";
import AnimeCard from "~/components/AnimeCard.vue";
import { useRouter } from "vue-router";

const { animes, loading, error, fetchAnimes } = useAnimes();
const router = useRouter();

onMounted(() => {
    fetchAnimes();
});

const navigateToAnimeDetails = (animeName: string) => {
    router.push(`/anime/${animeName}`);
};
</script>
