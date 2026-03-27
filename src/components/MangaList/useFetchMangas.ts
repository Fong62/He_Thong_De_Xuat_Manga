import { useEffect, useState } from "react";
import axios from "axios";

interface Manga {
  id: string;
  title: string;
  status: string;
  tags: string[];
  coverUrl: string;
}

interface MangaResponse {
  mangas: Manga[];
  page: number;
  total: number;
  totalPages: number;
}

const useFetchMangas = (page: number = 1) => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMangas = async () => {
      setLoading(true);
      try {
        const response = await axios.get<MangaResponse>(
          `http://localhost:8000/api/mangas?page=${page}`
        );
        setMangas(response.data.mangas);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch mangas");
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, [page]);

  return { mangas, totalPages, loading, error };
};

export default useFetchMangas;
