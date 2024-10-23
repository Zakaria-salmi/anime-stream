import { ref, watch } from "vue";

interface Anime {
    id: number;
    name: string;
    url_image: string;
}

export const useAnimes = () => {
    const animes = ref<Anime[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(12);
    const totalCount = ref(0);
    const searchQuery = ref("");
    const isInitialLoading = ref(true);

    const fetchAnimes = async (page: number = 1) => {
        const supabase = useSupabaseClient();
        loading.value = true;
        error.value = null;

        try {
            const from = (page - 1) * itemsPerPage.value;
            const to = from + itemsPerPage.value - 1;

            let query = supabase
                .from("animes")
                .select("*", { count: "exact" })
                .order("name", { ascending: true });

            if (searchQuery.value) {
                query = query.ilike("name", `%${searchQuery.value}%`);
            }

            const {
                data,
                error: supabaseError,
                count,
            } = await query.range(from, to);

            if (supabaseError) throw supabaseError;

            animes.value = data || [];
            totalCount.value = count || 0;
            currentPage.value = page;
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
            isInitialLoading.value = false;
        }
    };

    watch(
        [currentPage, searchQuery],
        ([newPage, newQuery], [oldPage, oldQuery]) => {
            if (newQuery !== oldQuery) {
                currentPage.value = 1;
            }
            fetchAnimes(currentPage.value);
        }
    );

    return {
        animes,
        loading,
        isInitialLoading,
        error,
        fetchAnimes,
        currentPage,
        itemsPerPage,
        totalCount,
        searchQuery,
    };
};
