<template>
    <div class="flex items-center justify-center overlay mt-16 sm:mt-0">
        <UCard
            class="w-full max-w-sm bg-white/75 dark:bg-white/5 backdrop-blur-md"
        >
            <template #header>
                <div class="text-center">
                    <UIcon
                        name="i-heroicons-lock-closed"
                        class="w-8 h-8 mx-auto mb-2 text-gray-900 dark:text-white"
                    />
                    <h1 class="text-2xl font-bold">Bienvenue</h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">
                        Connectez-vous avec votre compte préféré
                    </p>
                </div>
            </template>

            <div class="space-y-4">
                <UButton
                    color="gray"
                    variant="outline"
                    class="w-full"
                    :loading="loading"
                    @click="signInWithGoogle"
                >
                    <UIcon name="i-simple-icons-google" class="mr-2" />
                    Continuer avec Google
                </UButton>

                <UButton
                    color="indigo"
                    variant="outline"
                    class="w-full"
                    :loading="loading"
                    @click="signInWithDiscord"
                >
                    <UIcon name="i-simple-icons-discord" class="mr-2" />
                    Continuer avec Discord
                </UButton>

                <p v-if="errorMessage" class="text-red-500 mt-4 text-center">
                    {{ errorMessage }}
                </p>
            </div>

            <template #footer>
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                    En vous connectant, vous acceptez nos
                    <NuxtLink to="/" class="text-primary font-medium"
                        >Conditions d'utilisation</NuxtLink
                    >.
                </p>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const supabase = useSupabaseClient();
const errorMessage = ref("");
const loading = ref(false);
const config = useRuntimeConfig();

const signInWithGoogle = async () => {
    try {
        loading.value = true;
        errorMessage.value = "";

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${config.public.siteUrl}/callback`,
            },
        });

        if (error) {
            errorMessage.value = "Erreur lors de la connexion avec Google";
            console.error("Erreur de connexion avec Google:", error.message);
        }
    } catch (e) {
        errorMessage.value = "Une erreur est survenue lors de la connexion";
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const signInWithDiscord = async () => {
    try {
        loading.value = true;
        errorMessage.value = "";

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: `${config.public.siteUrl}/callback`,
            },
        });

        if (error) {
            errorMessage.value = "Erreur lors de la connexion avec Discord";
            console.error("Erreur de connexion avec Discord:", error.message);
        }
    } catch (e) {
        errorMessage.value = "Une erreur est survenue lors de la connexion";
        console.error(e);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>
