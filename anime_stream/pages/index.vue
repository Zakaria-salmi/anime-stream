<template>
    <UContainer>
        <UCard class="my-8">
            <template #header>
                <h1 class="text-2xl font-bold">Bienvenue sur Anime Stream</h1>
            </template>
            <p class="mb-4">
                Découvrez et regardez vos animes préférés en streaming !
            </p>
            <UButton color="primary" to="/catalogue" class="mb-4">
                Parcourir le catalogue
            </UButton>
            <AnimeList :animes="popularAnimes" />
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import AnimeList from "~/components/AnimeList.vue";

const popularAnimes = [
    { id: 1, title: "One Piece", image: "/images/one-piece.jpg" },
    { id: 2, title: "Naruto", image: "/images/naruto.jpg" },
    { id: 3, title: "Attack on Titan", image: "/images/attack-on-titan.jpg" },
];
</script>
