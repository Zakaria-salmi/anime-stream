<template>
    <div
        class="anime-card bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-lg dark:shadow-gray-600/30 dark:hover:shadow-gray-600/30 transition-all duration-300 cursor-pointer"
        @click="$emit('click')"
    >
        <img
            :src="anime.image_url"
            :alt="anime.name"
            class="w-full h-56 object-cover"
        />
        <div class="p-4">
            <h3
                class="text-lg font-semibold truncate text-gray-800 dark:text-gray-200"
            >
                {{ anime.name }}
            </h3>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    anime: {
        type: Object,
        required: true,
    },
});

defineEmits(["click"]);
</script>

<style scoped>
.anime-card {
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.anime-card:hover {
    transform: translateY(-5px);
}
</style>
