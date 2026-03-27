import { useEffect, useState } from "react";
import axios from "axios";

interface ChapterData {
  chapterId: string;
  title: string;
  pages: string[];
}

const useFetchChapterPages = (mangaId: string, chapterId: string) => {
  const [data, setData] = useState<{
    pages: string[];
    title: string;
    loading: boolean;
    error: string | null;
  }>({
    pages: [],
    title: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!mangaId || !chapterId) return;

    const fetchPages = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const res = await axios.get(
          `http://localhost:8000/api/mangas/${mangaId}/chapters/${chapterId}`
        );
        
        if (!res.data?.pages) {
          throw new Error("Invalid chapter data format");
        }

        setData({
          pages: res.data.pages,
          title: res.data.title || "Untitled Chapter",
          loading: false,
          error: null,
        });
      } catch (err) {
        setData({
          pages: [],
          title: "",
          loading: false,
          error: axios.isAxiosError(err) 
            ? err.message 
            : "Failed to load chapter",
        });
      }
    };

    fetchPages();
  }, [mangaId, chapterId]);

  return data;
};

export default useFetchChapterPages;