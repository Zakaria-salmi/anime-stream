<template>
    <div class="container mx-auto px-4 py-8">
        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4">À la une</h2>
            <div v-if="carouselItems.length > 0" class="relative rounded-lg">
                <div
                    class="overflow-hidden cursor-grab carousel-container rounded-lg"
                    @mousedown="startDrag"
                    @mousemove="onDrag"
                    @mouseup="endDrag"
                    @mouseleave="endDrag"
                    @touchstart="startDrag"
                    @touchmove="onDrag"
                    @touchend="endDrag"
                >
                    <div
                        class="flex transition-transform duration-300 ease-in-out"
                        :style="{
                            transform: `translateX(-${
                                currentIndex * 100 - dragOffset
                            }%)`,
                            transition: isDragging
                                ? 'none'
                                : 'transform 300ms ease-in-out',
                        }"
                    >
                        <div
                            v-for="item in carouselItems"
                            :key="item.id"
                            class="w-full flex-shrink-0"
                        >
                            <div class="relative h-72 md:h-96">
                                <img
                                    :src="item.image_url"
                                    :alt="item.name"
                                    class="w-full h-full object-cover"
                                />
                                <div
                                    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4"
                                >
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <h3
                                            class="text-xl md:text-2xl font-bold text-white"
                                        >
                                            {{ item.name }}
                                        </h3>
                                        <UButton
                                            :to="`/anime/${item.name}`"
                                            color="primary"
                                            >Voir plus</UButton
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    @click="prevSlide"
                    class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <Icon name="heroicons:chevron-left" class="w-6 h-6" />
                </button>
                <button
                    @click="nextSlide"
                    class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <Icon name="heroicons:chevron-right" class="w-6 h-6" />
                </button>
            </div>
            <div v-else class="h-64 md:h-96">
                <div
                    class="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"
                ></div>
            </div>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4">Animés populaires</h2>
            <div class="relative">
                <div
                    ref="scrollContainer"
                    class="flex space-x-6 w-full overflow-x-auto whitespace-nowrap overflow-hidden pr-4 py-4 scrollbar-hide"
                >
                    <NuxtLink
                        v-for="anime in popularAnimes"
                        :key="anime.id"
                        :to="`/anime/${anime.name}`"
                        class="transition-transform duration-300 hover:scale-105 flex-shrink-0 w-64"
                    >
                        <AnimeCard :anime="anime" />
                    </NuxtLink>
                </div>

                <button
                    @click="handleScrollLeft"
                    class="hidden sm:flex absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full w-10 h-10 items-center justify-center"
                >
                    <Icon name="heroicons:chevron-left" class="w-6 h-6" />
                </button>
                <button
                    @click="handleScrollRight"
                    class="hidden sm:flex absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full w-10 h-10 items-center justify-center"
                >
                    <Icon name="heroicons:chevron-right" class="w-6 h-6" />
                </button>
            </div>
        </section>

        <section>
            <h2 class="text-2xl font-bold mb-4">Dernières sorties</h2>
            <div
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
                <NuxtLink
                    v-for="anime in latestReleases"
                    :key="anime.id"
                    :to="`/anime/${anime.name}`"
                    class="transition-transform duration-300 hover:scale-105"
                >
                    <AnimeCard :anime="anime" />
                </NuxtLink>
            </div>
            <div class="mt-4 text-center">
                <UButton to="/catalogue?sort=latest" color="primary"
                    >Voir plus</UButton
                >
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AnimeCard from "~/components/AnimeCard.vue";

const supabase = useSupabaseClient();

interface Anime {
    id: string;
    name: string;
}

interface CarouselItem {
    id: string;
    name: string;
    image_url: string;
}

const carouselItems = ref<CarouselItem[]>([]);
const popularAnimes = ref<Anime[]>([]);
const latestReleases = ref<Anime[]>([]);
const currentIndex = ref(0);
const dragStart = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % carouselItems.value.length;
};

const prevSlide = () => {
    currentIndex.value =
        (currentIndex.value - 1 + carouselItems.value.length) %
        carouselItems.value.length;
};

const mustSeeAnimeIds = [
    "c0f34461-9759-47ab-82fc-0d5b915359e5",
    "d61c1768-9caf-468c-b056-360bcbfb3661",
    "0eb62ea3-7181-4ded-ace7-4ae9e3568a34",
    "c4312fb6-c0c2-44b7-be04-9a1e8599e1e5",
    "4dd0c3b2-15f3-4e17-9aeb-83efc5455364",
];

const fetchCarouselAnimes = async () => {
    const { data, error } = await supabase
        .from("animes")
        .select("*")
        .in("id", mustSeeAnimeIds);

    if (error)
        console.error(
            "Erreur lors de la récupération des animes du carrousel:",
            error
        );
    else carouselItems.value = data;
};

const popularAnimeIds = [
    "7a5b5f5f-893b-4d91-834e-7f0cb060f69d",
    "5518047a-6640-4c11-b62a-0586b28200de",
    "9837990f-6358-45ea-ad70-2852d16251a7",
    "a8d2e192-1407-446d-8808-de6e6dd572ee",
    "a85a0bd9-fda3-4d43-b2f1-901690110a28",
    "2fd305a1-36b3-45d8-a480-a37726a9a3c9",
    "ed7fec31-3ae7-4640-b1b2-9f403e2be6df",
    "7f84ede1-26d5-4926-ba43-99e222957b9b",
];

const fetchPopularAnimes = async () => {
    const { data, error } = await supabase
        .from("animes")
        .select("*")
        .in("id", popularAnimeIds)
        .limit(8);

    if (error)
        console.error(
            "Erreur lors de la récupération des animés populaires:",
            error
        );
    else popularAnimes.value = data;
};

const fetchLatestReleases = async () => {
    const { data, error } = await supabase
        .from("animes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

    if (error)
        console.error(
            "Erreur lors de la récupération des dernières sorties:",
            error
        );
    else latestReleases.value = data;
};

const getClientX = (event: MouseEvent | TouchEvent): number => {
    if ("touches" in event) {
        return event.touches[0].clientX;
    }
    return event.clientX;
};

const startDrag = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    isDragging.value = true;
    dragStart.value = getClientX(event);
};

const onDrag = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    if (!isDragging.value) return;
    const currentX = getClientX(event);
    const diff = currentX - dragStart.value;
    const containerWidth = (event.target as HTMLElement).clientWidth;
    dragOffset.value = (diff / containerWidth) * 100;
};

const endDrag = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    if (!isDragging.value) return;
    isDragging.value = false;
    const threshold = 10;
    if (Math.abs(dragOffset.value) > threshold) {
        if (dragOffset.value > 0) {
            prevSlide();
        } else {
            nextSlide();
        }
    }
    dragOffset.value = 0;
};

const scrollContainer = ref<HTMLElement | null>(null);

const handleScrollLeft = () => {
    if (!scrollContainer.value) return;

    const isAtStart = scrollContainer.value.scrollLeft <= 0;
    if (isAtStart) {
        const targetScroll = scrollContainer.value.scrollWidth;
        const duration = 500;
        const startScroll = scrollContainer.value.scrollLeft;
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeProgress = 1 - Math.pow(1 - progress, 3);

            scrollContainer.value!.scrollLeft =
                startScroll + (targetScroll - startScroll) * easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    } else {
        scrollContainer.value.scrollBy({
            left: -300,
            behavior: "smooth",
        });
    }
};

const handleScrollRight = () => {
    if (!scrollContainer.value) return;

    const isAtEnd =
        Math.ceil(
            scrollContainer.value.scrollLeft + scrollContainer.value.clientWidth
        ) >= scrollContainer.value.scrollWidth;
    if (isAtEnd) {
        const startScroll = scrollContainer.value.scrollLeft;
        const duration = 500;
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeProgress = 1 - Math.pow(1 - progress, 3);

            scrollContainer.value!.scrollLeft =
                startScroll * (1 - easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    } else {
        scrollContainer.value.scrollBy({
            left: 300,
            behavior: "smooth",
        });
    }
};

onMounted(() => {
    fetchPopularAnimes();
    fetchLatestReleases();
    fetchCarouselAnimes();
});
</script>

<style scoped>
.cursor-grab {
    cursor: grab;
}

.cursor-grab:active {
    cursor: grabbing;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
