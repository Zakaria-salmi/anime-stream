<template>
    <div
        class="anime-card bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-lg dark:shadow-gray-600/30 dark:hover:shadow-gray-600/30 transition-all duration-300 cursor-pointer relative group"
    >
        <div @click="$emit('click')" class="w-full h-full">
            <img
                :src="anime.image_url"
                :alt="anime.name"
                class="w-full h-56 object-cover"
            />
            <div class="p-4">
                <h3
                    class="text-lg font-semibold truncate text-gray-800 dark:text-gray-200"
                >
                    {{ anime.name }}
                </h3>
            </div>
        </div>

        <button
            v-if="user && route.path !== '/'"
            @click.stop="toggleFavorite"
            :class="[
                'absolute flex items-center justify-center top-2 right-2 p-2 rounded-full transition-all duration-300 transform',
                'hover:scale-110 active:scale-95',
                isFavorite
                    ? 'opacity-100'
                    : 'lg:opacity-0 lg:group-hover:opacity-100 opacity-100',
                'bg-black/50 backdrop-blur-sm',
            ]"
        >
            <UIcon
                :name="
                    isFavorite ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'
                "
                class="w-5 h-5 text-white transition-colors duration-300"
                :class="{ 'text-red-500': isFavorite }"
            />
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps({
    anime: {
        type: Object,
        required: true,
    },
});

defineEmits(["click"]);

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isFavorite = ref(false);

const checkFavoriteStatus = async () => {
    if (!user.value || !props.anime.id || route.path === "/") return;

    const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", user.value?.id)
        .eq("anime_id", props.anime.id);

    if (error) {
        console.error("Erreur lors de la récupération des favoris:", error);
        return;
    }

    isFavorite.value = data.length > 0;
};

const toggleFavorite = async () => {
    if (!user.value || !props.anime.id) return;

    try {
        if (isFavorite.value) {
            const { error } = await supabase
                .from("user_favorites")
                .delete()
                .eq("user_id", user.value?.id)
                .eq("anime_id", props.anime.id);

            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from("user_favorites")
                .insert([
                    {
                        user_id: user.value?.id,
                        anime_id: props.anime.id,
                    },
                ])
                .select();

            if (error) throw error;
        }

        isFavorite.value = !isFavorite.value;
    } catch (error) {
        console.error("Erreur lors de la modification des favoris:", error);
    }
};

onMounted(() => {
    checkFavoriteStatus();
});
</script>

<style scoped>
.anime-card {
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.anime-card:hover {
    transform: translateY(-5px);
}

@keyframes heartBeat {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}

.active\:scale-95:active {
    animation: heartBeat 0.3s ease-in-out;
}
</style>
