<template>
    <UContainer class="flex items-center w-full justify-between">
        <NuxtLink to="/" class="font-bold text-xl mr-8">Anime Stream</NuxtLink>
        <nav
            class="flex justify-center items-center py-4 shadow-lg rounded-3xl mt-4 border border-gray-700"
        >
            <div class="flex space-x-4">
                <UInput
                    icon="i-heroicons-magnifying-glass-20-solid"
                    size="sm"
                    color="white"
                    trailing
                    placeholder="Search..."
                />
                <UButton to="/catalogue" variant="ghost">Catalogue</UButton>
            </div>
        </nav>
        <div class="flex items-center space-x-4">
            <UButton to="/login" variant="ghost">
                Connexion
                <UIcon name="i-heroicons-arrow-right-20-solid" />
            </UButton>
            <ThemeToggle class="ml-8" />
        </div>
    </UContainer>
</template>

<script lang="ts" setup></script>

<style></style>
