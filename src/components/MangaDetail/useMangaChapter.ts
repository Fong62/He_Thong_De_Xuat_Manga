    import { useEffect, useState } from "react";
    import axios from "axios";

    export const useMangaChapters = (mangaId: string) => {
      const [chapters, setChapters] = useState<any[]>([]);
      const [error, setError] = useState<string>("");
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchChapters = async () => {
          try {
            const res = await axios.get(
              `http://localhost:8000/api/mangas/${mangaId}/chapters`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const data = res.data;
            const sortedChapters = data.chapters.sort((a: any, b: any) => {
              if (a.chapter === "Unknown") return 1;
              if (b.chapter === "Unknown") return -1;
              return parseFloat(b.chapter) - parseFloat(a.chapter);
            });
            
            setChapters(sortedChapters);
          } 
          catch (err) {
            console.error(err);
            setError("Failed to load chapter");
          } 
          finally {
            setLoading(false);
          }
        };

        if (mangaId) fetchChapters();
      }, [mangaId]);

      return { chapters, loading, error };
    };
