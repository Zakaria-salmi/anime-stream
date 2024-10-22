<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimeCard v-for="anime in animes" :key="anime.id" :anime="anime" />
    </div>
</template>

<script setup lang="ts">
import AnimeCard from "./AnimeCard.vue";

defineProps({
    animes: {
        type: Array,
        required: true,
    },
});
</script>
