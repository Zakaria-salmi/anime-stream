<template>
    <nav
        class="bg-white/75 dark:bg-gray-900/75 backdrop-blur-md shadow-sm sticky top-0 z-50"
    >
        <div
            class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between gap-3 h-16"
        >
            <!-- Logo et titre -->
            <div class="lg:flex-1 flex items-center gap-1.5">
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
            </div>

            <!-- Navigation links -->
            <ul
                class="items-center ring-1 ring-gray-200 dark:ring-gray-800 px-3 gap-x-0 rounded-full hidden lg:flex"
            >
                <li
                    v-for="(item, index) in navItems"
                    :key="index"
                    class="relative"
                >
                    <NuxtLink
                        :to="item.to"
                        class="text-sm/6 flex items-center gap-1 py-2 px-4 font-medium transition-colors relative after:absolute after:-bottom-px after:inset-x-2 after:h-px after:rounded-full after:opacity-0 after:bg-gray-900 dark:after:bg-white after:transition-opacity"
                        :class="[
                            $route.path === item.to
                                ? 'text-gray-900 dark:text-white after:opacity-100'
                                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                        ]"
                    >
                        {{ item.label }}
                    </NuxtLink>
                </li>
            </ul>

            <!-- Right side buttons -->
            <div class="flex items-center justify-end lg:flex-1 gap-1.5">
                <UButton
                    color="gray"
                    variant="ghost"
                    label="Connexion"
                    to="/login"
                    class="hidden lg:flex"
                >
                    Connexion
                    <UIcon name="i-heroicons-arrow-right-20-solid" />
                </UButton>
                <ThemeToggle />
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-bars-3-20-solid"
                    class="lg:hidden"
                    @click="toggleMobileMenu"
                />
            </div>
        </div>

        <!-- Mobile menu (hidden by default) -->
        <div v-if="mobileMenuOpen" class="lg:hidden">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <UButton
                    v-for="(item, index) in navItems"
                    :key="index"
                    :to="item.to"
                    block
                    color="gray"
                    variant="ghost"
                    @click="mobileMenuOpen = false"
                >
                    {{ item.label }}
                </UButton>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const mobileMenuOpen = ref(false);

const navItems = [
    { label: "Catalogue", to: "/catalogue" },
    { label: "Ma Liste", to: "/my-list" },
    { label: "À propos", to: "/about" },
];

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>
