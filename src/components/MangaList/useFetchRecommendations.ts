import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchRecommendations = (mangaId: string) => {
  const [mangas, setMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mangaId) return;

    const fetchRecommendations = async () => {
      try {
        const responses = await axios.get(`http://localhost:8000/api/mangas/${mangaId}/more_recommendations`);
        setMangas(responses.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [mangaId]);

  return { mangas, loading, error };
};

export default useFetchRecommendations;