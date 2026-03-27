import React, { useEffect, useState } from "react";
import axios from "axios";

interface Chapter {
  id: string;
  title: string;
  chapter: string;
  createdAt: string;
}

interface MangaChaptersProps {
  mangaId: string;
}

const MangaChapters: React.FC<MangaChaptersProps> = ({ mangaId }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/manga/mangas/${mangaId}/chapters`
        );
        setChapters(response.data);
      } catch (err: any) {
        setError("Failed to load chapters.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [mangaId]);

  if (loading)
    return <p className="text-gray-500 italic">Loading chapters...</p>;

  if (error)
    return <p className="text-red-500 font-semibold">{error}</p>;

  if (chapters.length === 0)
    return <p className="text-gray-500 italic">No chapters found.</p>;

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Chapters</h2>
      <ul className="space-y-2">
        {chapters.map((chap) => (
          <li
            key={chap.id}
            className="border rounded-lg p-4 shadow hover:bg-gray-50 transition"
          >
            <p className="font-medium text-lg">
              Chapter {chap.chapter || "?"}: {chap.title || "Untitled"}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(chap.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MangaChapters;
