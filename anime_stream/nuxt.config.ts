// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    modules: ["@nuxtjs/supabase", "@nuxtjs/color-mode", "@nuxt/ui"],
    css: ["~/assets/css/tailwind.css"],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    supabase: {
        redirect: false,
    },
    colorMode: {
        classSuffix: "",
    },
});
