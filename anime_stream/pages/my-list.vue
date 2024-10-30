<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Ma Liste</h1>

        <div
            v-if="loading"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            <AnimeCardSkeleton v-for="i in 8" :key="i" />
        </div>

        <template v-else>
            <div
                v-if="favoriteAnimes.length"
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
                <AnimeCard
                    v-for="anime in favoriteAnimes"
                    :key="anime.id"
                    :anime="anime"
                    @click="navigateToAnimeDetails(anime.name)"
                />
            </div>

            <div v-else class="text-center py-16 px-4">
                <UIcon
                    name="i-heroicons-heart"
                    class="w-16 h-16 mx-auto mb-4 text-gray-400"
                />
                <h2 class="text-xl font-semibold mb-2">
                    Aucun anime dans votre liste
                </h2>
                <p class="text-gray-500 mb-6">
                    Commencez à ajouter des animes à votre liste en cliquant sur
                    le cœur
                </p>
                <UButton to="/catalogue" color="primary">
                    Parcourir le catalogue
                    <UIcon
                        name="i-heroicons-arrow-right-20-solid"
                        class="ml-2"
                    />
                </UButton>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

interface Anime {
    id: string;
    name: string;
    image_url: string;
}

const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const loading = ref(true);
const favoriteAnimes = ref<Anime[]>([]);

const fetchFavoriteAnimes = async () => {
    if (!user.value) {
        router.push("/login");
        return;
    }

    try {
        loading.value = true;

        const { data, error } = await supabase
            .from("user_favorites")
            .select(
                `
                anime_id,
                animes (
                    id,
                    name,
                    image_url
                )
            `
            )
            .eq("user_id", user.value?.id);

        if (error) throw error;

        favoriteAnimes.value = data.map((item) => ({
            id: item.animes.id,
            name: item.animes.name,
            image_url: item.animes.image_url,
        }));
    } catch (error) {
        console.error("Erreur lors de la récupération des favoris:", error);
    } finally {
        loading.value = false;
    }
};

const navigateToAnimeDetails = (animeName: string) => {
    router.push(`/anime/${animeName}`);
};

onMounted(() => {
    fetchFavoriteAnimes();
});

definePageMeta({
    middleware: "auth",
});
</script>

<style></style>
