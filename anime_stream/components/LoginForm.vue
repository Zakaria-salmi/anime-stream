<template>
    <form @submit.prevent="handleSubmit">
        <UFormGroup label="Email">
            <UInput v-model="email" type="email" required />
        </UFormGroup>
        <UFormGroup label="Mot de passe">
            <UInput v-model="password" type="password" required />
        </UFormGroup>
        <UButton type="submit" color="primary" class="w-full"
            >Se connecter</UButton
        >
    </form>
</template>

<script setup lang="ts">
const email = ref("");
const password = ref("");

const handleSubmit = () => {
    console.log("Tentative de connexion avec:", email.value, password.value);
};
</script>
