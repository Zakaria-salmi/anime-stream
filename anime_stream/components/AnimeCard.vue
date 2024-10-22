<template>
    <UCard>
        <img
            :src="anime.image"
            :alt="anime.title"
            class="w-full h-48 object-cover"
        />
        <h3 class="text-lg font-semibold mt-2">{{ anime.title }}</h3>
        <UButton class="mt-2" variant="soft">Voir plus</UButton>
    </UCard>
</template>

<script setup lang="ts">
defineProps({
    anime: {
        type: Object,
        required: true,
    },
});
</script>
