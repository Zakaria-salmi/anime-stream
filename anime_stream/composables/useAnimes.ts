import { ref } from "vue";

export const useAnimes = () => {
    const animes = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchAnimes = async () => {
        const supabase = useSupabaseClient();
        loading.value = true;
        error.value = null;

        try {
            const { data, error: supabaseError } = await supabase
                .from("animes")
                .select("*");

            if (supabaseError) throw supabaseError;

            animes.value = data;
        } catch (e) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    return {
        animes,
        loading,
        error,
        fetchAnimes,
    };
};
