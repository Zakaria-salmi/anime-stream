<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Catalogue d'animes</h1>

        <div class="mb-6">
            <UInput
                v-model="searchQuery"
                icon="i-heroicons-magnifying-glass-20-solid"
                size="xl"
                color="white"
                trailing
                placeholder="Rechercher un anime..."
            />
        </div>

        <div
            v-if="!isInitialLoading && animes.length"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            <AnimeCard
                v-for="anime in animes"
                :key="anime.id"
                :anime="anime"
                @click="navigateToAnimeDetails(anime.name)"
            />
        </div>

        <div
            v-else-if="isInitialLoading"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            <AnimeCardSkeleton v-for="i in itemsPerPage" :key="i" />
        </div>

        <div
            v-else-if="!isInitialLoading && animes.length === 0"
            class="text-center py-8"
        >
            <p class="text-xl text-gray-600">
                {{
                    loading
                        ? "Recherche en cours..."
                        : "Aucun anime trouvé pour cette recherche."
                }}
            </p>
        </div>

        <div class="mt-8 flex justify-center">
            <UPagination
                v-model="currentPage"
                :page-count="itemsPerPage"
                :total="totalCount"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAnimes } from "~/composables/useAnimes";
import AnimeCard from "~/components/AnimeCard.vue";
import AnimeCardSkeleton from "~/components/AnimeCardSkeleton.vue";
import { useRouter } from "vue-router";

const {
    animes,
    loading,
    isInitialLoading,
    error,
    fetchAnimes,
    currentPage,
    itemsPerPage,
    totalCount,
    searchQuery,
} = useAnimes();

const router = useRouter();

onMounted(() => {
    fetchAnimes();
});

const navigateToAnimeDetails = (animeName: string) => {
    router.push(`/anime/${animeName}`);
};
</script>
