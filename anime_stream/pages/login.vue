<template>
    <div class="h-screen flex items-center justify-center overlay">
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
                        Vous n'avez pas de compte ?
                        <NuxtLink to="/signup" class="text-primary font-medium"
                            >S'inscrire</NuxtLink
                        >
                    </p>
                </div>
            </template>

            <div class="space-y-6">
                <UButton
                    color="gray"
                    variant="outline"
                    class="w-full"
                    @click="signInWithGitHub"
                >
                    <UIcon name="i-simple-icons-github" class="mr-2" />
                    Continuer avec GitHub
                </UButton>

                <UDivider label="ou" />

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <UFormGroup label="Email">
                        <UInput
                            v-model="email"
                            type="email"
                            placeholder="Entrez votre email"
                        />
                    </UFormGroup>

                    <UFormGroup label="Mot de passe">
                        <UInput
                            v-model="password"
                            type="password"
                            placeholder="Entrez votre mot de passe"
                        />
                        <template #help>
                            <div class="flex justify-end">
                                <NuxtLink
                                    to="/forgot-password"
                                    class="text-sm text-primary"
                                >
                                    Mot de passe oublié ?
                                </NuxtLink>
                            </div>
                        </template>
                    </UFormGroup>

                    <UButton type="submit" color="primary" class="w-full">
                        Continuer
                        <UIcon
                            name="i-heroicons-arrow-right-20-solid"
                            class="ml-2"
                        />
                    </UButton>
                </form>
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
const email = ref("");
const password = ref("");

const handleSubmit = () => {
    // Logique de connexion à implémenter
    console.log("Connexion avec:", {
        email: email.value,
        password: password.value,
    });
};

const signInWithGitHub = () => {
    // Logique de connexion avec GitHub à implémenter
    console.log("Connexion avec GitHub");
};
</script>

<style scoped></style>
