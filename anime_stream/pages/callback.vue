<script setup lang="ts">
const user = useSupabaseUser();
const router = useRouter();

watchEffect(() => {
    if (user.value) {
        router.push("/");
    }
});
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <p>Redirection en cours...</p>
    </div>
</template>
