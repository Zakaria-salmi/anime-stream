<template>
    <footer
        class="bg-white/75 dark:bg-gray-900/75 backdrop-blur-md shadow-sm mt-[100px]"
    >
        <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-10">
            <div class="flex flex-wrap justify-between items-start gap-8">
                <div
                    class="flex flex-col justify-center items-start max-w-[782px] gap-6"
                >
                    <NuxtLink
                        to="/"
                        class="flex-shrink-0 font-bold text-xl text-gray-900 dark:text-white flex items-end gap-1.5"
                    >
                        Anime Stream
                        <span
                            class="inline-flex items-center font-medium rounded-md text-xs px-2 py-1 bg-primary-50 dark:bg-primary-400 dark:bg-opacity-10 text-primary-500 dark:text-primary-400 ring-1 ring-inset ring-primary-500 dark:ring-primary-400 ring-opacity-25 dark:ring-opacity-25 mb-0.5"
                        >
                            Beta
                        </span>
                    </NuxtLink>
                    <div class="flex flex-col gap-2.5">
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            Le site Anime Stream n'héberge aucun fichier vidéo,
                            que ce soit pour du streaming ou du téléchargement.
                            Celui-ci consiste en une indexation de liens vidéos
                            sur différents hébergeurs publiques et connus.
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            Images provenant de anime-sama.fr (Aucune
                            affiliation directe avec Anime Stream)
                        </p>
                        <p class="text-base text-gray-800 dark:text-gray-100">
                            © {{ new Date().getFullYear() }} Anime Stream - Tous
                            droits réservés.
                        </p>
                    </div>
                </div>
                <div class="flex flex-wrap justify-center items-center gap-6">
                    <UButton
                        v-for="(link, index) in socialLinks"
                        :key="index"
                        :to="link.url"
                        color="gray"
                        variant="ghost"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <UIcon :name="link.icon" class="w-6 h-6" />
                    </UButton>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { ref } from "vue";

const socialLinks = ref([
    {
        url: "#",
        icon: "i-simple-icons-tiktok",
    },
    {
        url: "#",
        icon: "i-simple-icons-twitter",
    },
    {
        url: "#",
        icon: "i-simple-icons-discord",
    },
    {
        url: "#",
        icon: "i-simple-icons-instagram",
    },
]);
</script>
