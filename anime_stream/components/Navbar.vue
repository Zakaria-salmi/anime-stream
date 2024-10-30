<template>
    <nav
        class="bg-white/75 dark:bg-gray-900/75 backdrop-blur-md shadow-sm sticky top-0 z-50"
    >
        <div
            class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between gap-3 h-16"
        >
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

            <div class="flex items-center justify-end lg:flex-1 gap-3">
                <UButton
                    v-if="!user"
                    color="gray"
                    variant="ghost"
                    to="/login"
                    class="flex items-center"
                >
                    Connexion
                    <UIcon name="i-heroicons-arrow-right-20-solid" />
                </UButton>

                <UDropdown
                    v-else
                    :items="dropdownItems"
                    :ui="{
                        container:
                            'min-w-[280px] max-w-[calc(100vw-2rem)] sm:max-w-[400px]',
                        item: {
                            disabled: 'cursor-text select-text',
                        },
                    }"
                    :popper="{
                        placement: 'bottom-end',
                        strategy: 'fixed',
                    }"
                    class="flex"
                >
                    <UAvatar
                        :src="user?.user_metadata?.avatar_url"
                        :alt="user?.user_metadata?.full_name"
                        size="md"
                    />

                    <template #account="{ item }">
                        <div class="text-left p-2 w-full">
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Connecté en tant que
                            </p>
                            <p
                                class="font-medium text-gray-900 dark:text-white break-words"
                            >
                                {{ item.label }}
                            </p>
                        </div>
                    </template>

                    <template #item="{ item }">
                        <span class="truncate dark:text-gray-200">{{
                            item.label
                        }}</span>
                        <UIcon
                            :name="item.icon"
                            class="flex-shrink-0 h-6 w-6 text-gray-400 dark:text-gray-200 ms-auto"
                        />
                    </template>
                </UDropdown>

                <ThemeToggle class="ml-2" />
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-bars-3-20-solid"
                    class="lg:hidden"
                    @click="toggleMobileMenu"
                />
            </div>
        </div>

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
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const mobileMenuOpen = ref(false);

const navItems = [
    { label: "Catalogue", to: "/catalogue" },
    { label: "Ma Liste", to: "/my-list" },
    { label: "À propos", to: "/about" },
];

const dropdownItems = computed(() => [
    [
        {
            label: formatEmail(
                user.value?.user_metadata?.email || user.value?.email
            ),
            slot: "account",
            disabled: true,
        },
    ],
    [
        {
            label: "Historique",
            icon: "i-heroicons-clock",
            to: "/history",
        },
    ],
    [
        {
            label: "Ma Liste",
            icon: "i-heroicons-heart",
            to: "/my-list",
        },
    ],
    [
        {
            label: "Déconnexion",
            icon: "i-heroicons-arrow-left-on-rectangle",
            click: handleLogout,
        },
    ],
]);

const handleLogout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        await router.push("/");
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
    }
};

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
};

const formatEmail = (email: string) => {
    if (!email) return "";
    if (email.length > 35) {
        const [username, domain] = email.split("@");
        if (username.length > 20) {
            return `${username.slice(0, 20)}...@${domain}`;
        }
    }
    return email;
};
</script>

<style scoped>
.break-words {
    word-break: break-word;
    overflow-wrap: break-word;
}
</style>
