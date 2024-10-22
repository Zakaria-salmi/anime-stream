<template>
    <UContainer>
        <h1 class="text-2xl font-bold my-8">Catalogue d'animes</h1>
        <AnimeList :animes="allAnimes" />
    </UContainer>
</template>

<script setup lang="ts">
import AnimeList from "~/components/AnimeList.vue";

const allAnimes = [
    { id: 1, title: "One Piece", image: "/images/one-piece.jpg" },
    { id: 2, title: "Naruto", image: "/images/naruto.jpg" },
    { id: 3, title: "Attack on Titan", image: "/images/attack-on-titan.jpg" },
    // Ajoutez plus d'animes ici
];
</script>
