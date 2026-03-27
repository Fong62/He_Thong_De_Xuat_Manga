"use client";

import { useState } from "react";
import MangaList from "../components/MangaList/MangaList";

const Home = () => {
  const [selectedMangaId, setSelectedMangaId] = useState<string | null>(null);

  const handleMangaClick = (mangaId: string) => {
    setSelectedMangaId(mangaId); 
  };

  return (
    <div>
      <MangaList onMangaClick={handleMangaClick} />

      {selectedMangaId && (
        <div className="mt-8 p-4 border-t border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Đã chọn manga:
          </h2>
          <p className="text-blue-600 text-lg">{selectedMangaId}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
