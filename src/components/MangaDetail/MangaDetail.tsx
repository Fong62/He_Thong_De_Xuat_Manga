"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useMangaDetail } from "./useMangaDetail";
import { useMangaChapters } from "./useMangaChapter";

const MangaDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { manga, recommendations, error } = useMangaDetail(id || "");
  const { chapters, loading: chaptersLoading, error: chaptersError } = useMangaChapters(id || "");

   // Thêm state sắp xếp
   const [sortNewestFirst, setSortNewestFirst] = useState(true);

   // Sắp xếp chapters
   const sortedChapters = useMemo(() => {
     if (!chapters) return [];
     
     return [...chapters].sort((a, b) => {
       if (a.chapter === "Unknown") return 1;
       if (b.chapter === "Unknown") return -1;
       
       const chapterA = parseFloat(a.chapter);
       const chapterB = parseFloat(b.chapter);
       
       return sortNewestFirst 
         ? chapterB - chapterA  // Mới nhất trước
         : chapterA - chapterB; // Cũ nhất trước
     });
   }, [chapters, sortNewestFirst]);

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!manga) return <p className="text-center">Loading...</p>;

  return (
      <div className="w-full min-h-screen p-6 bg-black-200">
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Phần chi tiết manga - bên trái */}
          <div className="lg:w-5/6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative group w-full md:w-auto">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl">
                  <Image
                    src={manga.coverUrl}
                    alt={manga.title}
                    width={280}
                    height={400}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.1]"
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Hiệu ứng overlay tinh tế */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>


              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900">{manga.title}</h1>
                <p className="text-gray-700 mt-4">{manga.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {manga.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Thông tin Manga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {[
                { label: "Status", value: manga.status },
                { label: "Year", value: manga.year },
                { label: "Author", value: manga.author },
                { label: "Demographic", value: manga.publicationDemographic },
                { label: "Language", value: manga.originalLanguage },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500"
                >
                  <h3 className="text-gray-700 font-semibold">{item.label}</h3>
                  <p className="text-gray-600 mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Phần Chapters */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
                  Chapters
                </h2>
                
                {/* Di chuyển button sắp xếp sang bên phải và thêm khoảng cách */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSortNewestFirst(true)}
                    className={`px-3 py-1 text-sm rounded-md ${sortNewestFirst ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Newest
                  </button>
                  <button 
                    onClick={() => setSortNewestFirst(false)}
                    className={`px-3 py-1 text-sm rounded-md ${!sortNewestFirst ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Oldest
                  </button>
                </div>
              </div>
            
            {chaptersLoading ? (
              <div className="flex text-gray-700 justify-center py-4">
                <p>Loading chapters...</p>
              </div>
            ) : chaptersError ? (
              <div className="text-red-500 text-center py-4">
                Error loading chapters: {chaptersError}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedChapters.map((chap, index) => (
                  <div
                    key={chap.id}
                    onClick={() => router.push(`/manga/${id}/chapters/${chap.id}`)}
                    className={`p-3 rounded-lg border-b ${
                      index === 0 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                        : 'border-gray-100 hover:bg-gray-50'
                    } cursor-pointer transition-colors duration-200 group flex justify-between items-center`}
                  >
                      <div className="flex items-baseline">
                        <h3 className="font-medium text-gray-800 group-hover:text-blue-600">
                          {chap.chapter !== "Unknown" ? `Chapter ${chap.chapter}` : "Oneshot"}:
                        </h3>
                        {chap.title && chap.title !== "Untitled" && (
                          <p className="text-sm text-gray-500 group-hover:text-gray-700 ml-1">
                            {chap.title}
                          </p>
                        )}
                      </div>

                      <span className="text-sm text-gray-400 group-hover:text-gray-600">
                        {chap.createdAt ? new Date(chap.createdAt).toLocaleDateString() : "Unknown date"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* External Links */}
            {manga.externalLinks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-gray-700 font-semibold text-lg">External Links:</h3>
                <ul className="space-y-2 mt-2">
                  {manga.externalLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Phần recommendations - bên phải */}
          <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
                Recommendations
              </h2>
              <button 
                onClick={() => router.push(`/manga/${id}/recommendation?recommendations_for=${id}`)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <path d="M17 8l4 4-4 4M7 8l-4 4 4 4" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {recommendations.flat().slice(0, 5).map((rec) => (
                <div key={rec.id} onClick={() => router.push(`/manga/${rec.id}`)} className="flex gap-4 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="relative cursor-pointer w-20 h-28 flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={rec.coverUrl || '/default-cover.jpg'}
                      alt={rec.title || 'Manga cover'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.1]"
                      sizes="80px"
                    />
                    {/* Hiệu ứng overlay tinh tế */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="flex-1  min-w-0">
                    <h3 className="font-medium text-black cursor-pointer group-hover:text-blue-600 break-words line-clamp-1">
                      {rec.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

export default MangaDetail;
