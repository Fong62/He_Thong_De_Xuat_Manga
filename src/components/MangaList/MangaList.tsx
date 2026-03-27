"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import useFetchMangas from "./useFetchMangas";
import useFetchRecommendations from "./useFetchRecommendations"
import MangaCard from "../MangaCard/MangaCard";
import { title } from "process";

interface MangaListProps {
  mangas?: any[];
  onMangaClick?: (mangaId: string) => void;
  isRecommendationMode?: boolean;
}

const MangaList: React.FC<MangaListProps> = ({ mangas: externalMangas, onMangaClick }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageQuery = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState(pageQuery);
  const recommendationsFor = searchParams.get("recommendations_for");

  const { mangas: fetchedMangas, totalPages, loading, error } = useFetchMangas(page);
  const mangas = externalMangas || fetchedMangas;

  const [isRecommendationMode, setIsRecommendationMode] = useState(false);
  const { mangas: recommendations, loading: recsLoading, error: recsError  } = useFetchRecommendations(recommendationsFor || "");
  const { id } = useParams<{ id: string }>();

  const [customPageInput, setCustomPageInput] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredMangas = mangas.filter((manga) =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecs = recommendations.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //Xu ly Backward
  useEffect(() => {
    const title_query = searchParams.get("title") || "";
    setSearchTerm(title_query);
    setInputValue(title_query);
    setPage(pageQuery);
  }, [pageQuery,searchParams]);

  const changePage = (pageNumber: number,search_name: string ) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", pageNumber.toString());
    if(search_name){
    newParams.set("title",search_name);
    }
    else newParams.delete(title);
    router.push(`?${newParams.toString()}`);
  };

  useEffect(() => {
    setIsRecommendationMode(!!recommendationsFor);
  }, [recommendationsFor]);

  const handlePrev = () => changePage(Math.max(1, page - 1), searchTerm);
  const handleNext = () => changePage(Math.min(totalPages, page + 1), searchTerm);

  const handleSearch = () => {
    setSearchTerm(inputValue); 
    changePage(1,inputValue); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!externalMangas && loading)
    return <div>Loading...</div>;
  if (!externalMangas && error)
    return <div>Error: {error}</div>;

  return (
    <div className="w-full px-6 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-white"
        style={{
          textShadow: "0 0 8px rgba(59,130,246,0.8), 0 0 12px rgba(59,130,246,0.5)",
        }}>
        {isRecommendationMode 
          ? `Recommendations for this manga` 
          : <>Welcome to <span className="text-blue-500">MangaDex</span></>}
      </h1>

      {isRecommendationMode && (
        <button 
          onClick={() => router.push('/')}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to All Mangas
        </button>
      )}

      {/* Loading state */}
      {isRecommendationMode && recsLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error state */}
      {isRecommendationMode && recsError && (
        <div className="text-center p-4 text-red-500">
          Failed to load recommendations
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {isRecommendationMode && recommendations.length === 0 && !recsLoading && (
        <div className="text-center p-4">
          <p>No recommendations found for this manga</p>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search manga..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 md:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-6 border border-black-200 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
          {(isRecommendationMode ? filteredRecs : filteredMangas ? filteredMangas.slice(0,20) :  mangas.slice(0,20)).map((manga) => {
            const card = <MangaCard key={manga.id} {...manga} />;

            return onMangaClick ? (
              <div
                key={manga.id}
                onClick={() => onMangaClick(manga.id)}
                className="cursor-pointer"
              >
                {card}
              </div>
            ) : (
              card
            );
          })}
        </div>

        {/* Pagination controls */}
        {!isRecommendationMode && !externalMangas && (
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex flex-wrap justify-center gap-2">
            {(() => {
              const pageButtons = [];
              const visibleRange = 2;
              const minPage = Math.max(1, page - visibleRange);
              const maxPage = Math.min(totalPages, page + visibleRange);

              const renderButton = (pageNumber: number) => (
                <button
                  key={pageNumber}
                  onClick={() => changePage(pageNumber, searchTerm)}
                  className={`w-10 h-10 rounded-full border font-semibold transition ${
                    page === pageNumber
                      ? "bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-md"
                      : "bg-white text-blue-600 border border-blue-300 hover:bg-blue-100 hover:text-blue-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );

              if (minPage > 1) {
                pageButtons.push(renderButton(1));

                if (minPage > 2) {
                  pageButtons.push(
                    customPageInput === 0 ? (
                      <input
                        key="input-start"
                        type="number"
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const targetPage = parseInt(inputValue);
                            if (isNaN(targetPage) || targetPage < 1) {
                              changePage(1, searchTerm);
                            } else if (targetPage > totalPages) {
                              changePage(totalPages, searchTerm); // Chuyển đến trang cuối nếu nhập quá
                            } else {
                              changePage(targetPage, searchTerm);
                            }
                            setCustomPageInput(null);
                            setInputValue("");
                          }
                        }}
                        onBlur={() => setCustomPageInput(null)}
                        className="w-16 h-10 rounded-md border border-blue-300 text-center text-blue-600 focus:outline-none focus:ring focus:border-blue-400"
                        autoFocus
                      />
                    ) : (
                      <span
                        key="ellipsis-start"
                        className="w-10 h-10 flex items-center justify-center text-blue-500 cursor-pointer"
                        onClick={() => {
                          setCustomPageInput(0);
                          setInputValue("");
                        }}
                      >
                        ...
                      </span>
                    )
                  );
                }
              }

              for (let i = minPage; i <= maxPage; i++) {
                pageButtons.push(renderButton(i));
              }

              if (maxPage < totalPages) {
                if (maxPage < totalPages - 1) {
                  pageButtons.push(
                    customPageInput === 1 ? (
                      <input
                        key="input-end"
                        type="number"
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const targetPage = parseInt(inputValue);
                            if (isNaN(targetPage) || targetPage < 1) {
                              changePage(1, searchTerm);
                            } else if (targetPage > totalPages) {
                              changePage(totalPages, searchTerm); // Chuyển đến trang cuối nếu nhập quá
                            } else {
                              changePage(targetPage, searchTerm);
                            }
                            setCustomPageInput(null);
                            setInputValue("");
                          }
                        }}
                        onBlur={() => setCustomPageInput(null)}
                        className="w-16 h-10 rounded-md border border-blue-300 text-center text-blue-600 focus:outline-none focus:ring focus:border-blue-400"
                        autoFocus
                      />
                    ) : (
                      <span
                        key="ellipsis-end"
                        className="w-10 h-10 flex items-center justify-center text-blue-500 cursor-pointer"
                        onClick={() => {
                          setCustomPageInput(1);
                          setInputValue("");
                        }}
                      >
                        ...
                      </span>
                    )
                  );
                }

                pageButtons.push(renderButton(totalPages));
              }

              return pageButtons;
            })()}
          </div>
            
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            
            <span className="text-blue-700 font-medium ml-4">
              Page {page} of {totalPages}
            </span>

          </div>
        )}
      </div>
    </div>
  );
};

export default MangaList;
