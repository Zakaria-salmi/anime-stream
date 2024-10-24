<template>
    <div>
        <div class="relative mb-8">
            <div class="w-full h-64 md:h-96 overflow-hidden">
                <img
                    :src="anime?.image_url"
                    :alt="anime?.name"
                    class="w-full h-full object-cover"
                />
            </div>
            <div
                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h1
                    class="text-4xl md:text-6xl font-bold text-white text-center"
                >
                    {{ anime?.name }}
                </h1>
            </div>
        </div>

        <div class="container mx-auto px-4">
            <div v-if="anime?.description" class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Description</h2>
                <p>{{ anime.description }}</p>
            </div>

            <div v-if="seasons.length" class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Saisons</h2>
                <div
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                >
                    <NuxtLink
                        v-for="season in seasons"
                        :key="season.id"
                        :to="`/anime/${anime?.id}/season/${season.id}`"
                        class="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden cursor-pointer group"
                    >
                        <img
                            :src="anime?.image_url"
                            :alt="anime?.name"
                            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div
                            class="absolute inset-x-0 bottom-0 p-2 flex flex-col items-start"
                        >
                            <span
                                class="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-semibold"
                            >
                                {{ season.name }}
                            </span>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const supabase = useSupabaseClient();

interface Anime {
    id: string;
    name: string;
    description: string;
    image_url: string;
}

interface Season {
    id: string;
    name: string;
    anime_id: string;
}

const anime = ref<Anime | null>(null);
const seasons = ref<Season[]>([]);
const animeName = ref(route.params.name);

const fetchAnime = async () => {
    const { data, error } = await supabase
        .from("animes")
        .select("*")
        .eq("name", animeName.value)
        .single();

    if (error) {
        console.error("Erreur lors de la récupération de l'anime:", error);
        return;
    }

    anime.value = data;
    console.log(anime.value);
    await fetchSeasons();
};

const fetchSeasons = async () => {
    const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .eq("anime_id", anime.value?.id)
        .order("name");

    if (error) {
        console.error("Erreur lors de la récupération des saisons:", error);
        return;
    }

    seasons.value = data;
};

onMounted(async () => {
    await fetchAnime();
});
</script>

<style scoped>
.aspect-w-16 {
    position: relative;
    padding-bottom: 56.25%;
}

.aspect-w-16 > * {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}
</style>
