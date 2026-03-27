import { useState, useEffect } from "react";
import axios from "axios";

interface Manga {
  title: string;
  status: string;
  tags: string[];
  coverUrl: string;
  description: string;
  author: string;
  artist: string;
  year: string;
  publicationDemographic: string;
  originalLanguage: string;
  createdAt: string;
  updatedAt: string;
  externalLinks: string[];
}

interface Recommendation {
  id: string;
  title: string;
  coverUrl: string;
}

export const useMangaDetail = (id: string) => {
  const [manga, setManga] = useState<Manga | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMangaDetails = async () => {
      try {
        if (!id) return;

        const response = await axios.get(`http://localhost:8000/api/mangas/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const mangaData = response.data;

        setManga(mangaData.manga);

        const allRecs = mangaData.recommendations?.flat() || [];
        const top5Recs = allRecs.slice(0, 5);
        setRecommendations(top5Recs);

      } 
      catch (error: any) {
        console.error(error);
        setError("Failed to load detail");
      }
    };

    fetchMangaDetails();
  }, [id]);

  return { manga, recommendations, error };
};
