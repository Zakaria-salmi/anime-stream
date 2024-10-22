<template>
    <UContainer class="flex items-center justify-center min-h-screen">
        <UCard
            class="w-full max-w-sm bg-white/75 dark:bg-white/5 backdrop-blur"
        >
            <template #header>
                <div class="text-center">
                    <UIcon
                        name="i-heroicons-lock-closed"
                        class="w-8 h-8 mx-auto mb-2 text-gray-900 dark:text-white"
                    />
                    <h1 class="text-2xl font-bold">Créer un compte</h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">
                        Vous avez déjà un compte ?
                        <NuxtLink to="/login" class="text-primary font-medium"
                            >Connexion</NuxtLink
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
                    <UFormGroup label="Nom">
                        <UInput v-model="name" placeholder="Entrez votre nom" />
                    </UFormGroup>

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
                    </UFormGroup>

                    <UButton type="submit" color="primary" class="w-full">
                        Créer un compte
                    </UButton>
                </form>
            </div>

            <template #footer>
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
                    En vous inscrivant, vous acceptez nos
                    <NuxtLink to="/" class="text-primary font-medium"
                        >Conditions d'utilisation</NuxtLink
                    >.
                </p>
            </template>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
const name = ref("");
const email = ref("");
const password = ref("");

const handleSubmit = () => {
    console.log("Inscription avec:", {
        name: name.value,
        email: email.value,
        password: password.value,
    });
};

const signInWithGitHub = () => {
    console.log("Connexion avec GitHub");
};
</script>
