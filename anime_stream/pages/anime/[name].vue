<template>
    <div>
        <div class="container mx-auto px-4 py-8 mb-8 rounded-lg">
            <h1 class="text-4xl md:text-6xl font-bold text-start mb-4">
                {{ anime?.name }}
            </h1>
            <div class="w-full h-64 md:h-96 overflow-hidden">
                <img
                    :src="anime?.image_url"
                    :alt="anime?.name"
                    class="w-full h-full object-cover rounded-lg"
                />
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
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                    <NuxtLink
                        v-for="season in seasons"
                        :key="season.id"
                        :to="`/anime/${anime?.id}/season/${season.id}`"
                        class="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden cursor-pointer season-card"
                    >
                        <img
                            :src="anime?.image_url"
                            :alt="anime?.name"
                            class="w-full h-full object-cover season-image"
                        />
                        <div
                            class="absolute inset-x-0 bottom-0 p-2 flex flex-col items-start"
                        >
                            <span
                                class="dark-badge backdrop-blur-md text-white text-sm px-3 py-1 rounded-full font-semibold"
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
    await fetchSeasons();
};

const fetchSeasons = async () => {
    if (!anime.value?.id) return;

    const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .eq("anime_id", anime.value.id)
        .order("name", { ascending: true });

    if (error) {
        console.error("Erreur lors de la récupération des saisons:", error);
        return;
    }

    seasons.value = (data as Season[]).sort((a, b) => {
        const aNum = parseInt(a.name.replace(/\D/g, ""));
        const bNum = parseInt(b.name.replace(/\D/g, ""));
        return aNum - bNum;
    });
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

.season-card .season-image {
    transition: all 0.3s ease-in-out;
}

.season-card:hover .season-image {
    transform: scale(1.1);
    filter: brightness(60%);
}

.dark-badge {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
