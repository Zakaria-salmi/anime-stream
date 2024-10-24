<template>
    <div class="flex flex-col min-h-screen w-full">
        <Navbar class="w-full" />
        <NuxtPage class="flex-grow w-full" />
        <FooterApp class="w-full" />
    </div>
</template>

<script setup lang="ts">
useHead({
    script: [
        {
            innerHTML: `
        if (localStorage.getItem('nuxt-color-mode') === 'dark' || (!localStorage.getItem('nuxt-color-mode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      `,
            tagPriority: "critical",
        },
    ],
});
</script>

<style>
body {
    background-color: #f8f8f8;
}

.dark body {
    background-color: #1f2937;
}

.backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
</style>
