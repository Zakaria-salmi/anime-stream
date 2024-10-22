<template>
    <UButton
        color="gray"
        variant="ghost"
        :icon="
            colorMode.value === 'dark'
                ? 'i-heroicons-sun-20-solid'
                : 'i-heroicons-moon-20-solid'
        "
        :ui="{ rounded: 'rounded-full' }"
        @click="toggleColorMode"
    />
</template>

<script setup lang="ts">
const colorMode = useColorMode();

const toggleColorMode = () => {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>
