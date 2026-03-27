"use client";

import useFetchChapterPages from "./useFetchChapterPages";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMangaChapters } from "../MangaDetail/useMangaChapter";

const ChapterReader = ({ chapterId }: { chapterId: string }) => {
  const router = useRouter();
  const params = useParams();
  const mangaId = params.id as string;
  
  const { pages, loading, error } = useFetchChapterPages(mangaId, chapterId);
  const { chapters } = useMangaChapters(mangaId);
  const containerRef = useRef<HTMLDivElement>(null);
  // const [showChapterList, setShowChapterList] = useState(false);
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCurrentChapterDropdown, setShowCurrentChapterDropdown] = useState(false);

  const [lastScrollY, setLastScrollY] = useState(0);
  const [showHeader, setShowHeader] = useState(true);

  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  const pressedKeys = useRef<{ [key: string]: boolean }>({});
  const [isNavigating, setIsNavigating] = useState(false);

  // Sắp xếp chapters theo số chapter giảm dần (chapter lớn nhất đầu tiên)
  const sortedChapters = [...chapters].sort((a, b) => {
    if (a.chapter === "Unknown") return 1;
    if (b.chapter === "Unknown") return -1;
    return parseFloat(b.chapter) - parseFloat(a.chapter);
  });

  // Tìm chapter hiện tại và các chapter liền kề
  const currentChapterIndex = sortedChapters.findIndex(chap => chap.id === chapterId);
  const currentChapter = sortedChapters[currentChapterIndex];
  const prevChapter = currentChapterIndex < sortedChapters.length - 1 ? sortedChapters[currentChapterIndex + 1] : null;
  const nextChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1] : null;

   // Hàm xử lý scroll
   const startScrolling = (direction: 'up' | 'down') => {
    const scrollStep = direction === 'up' ? -100 : 100;
    if (!scrollInterval.current) {
      scrollInterval.current = setInterval(() => {
        window.scrollBy({ top: scrollStep, behavior: 'smooth' });
      }, 10);
    }
  };

  // Hàm dừng scroll
  const stopScrolling = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  // Xử lý sự kiện bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showChapterDropdown && !showDropdown && !showCurrentChapterDropdown) {
        pressedKeys.current[e.key] = true;

        // Xử lý mũi tên lên/xuống
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          startScrolling(e.key === 'ArrowUp' ? 'up' : 'down');
        }

        // Xử lý mũi tên trái/phải
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !isNavigating) {
          e.preventDefault();
          setIsNavigating(true);
          
          if (e.key === 'ArrowLeft' && prevChapter) {
            router.push(`/manga/${mangaId}/chapters/${prevChapter.id}`);
          } else if (e.key === 'ArrowRight' && nextChapter) {
            router.push(`/manga/${mangaId}/chapters/${nextChapter.id}`);
          }

          setTimeout(() => setIsNavigating(false), 300); // Chống spam phím
        }

        // Xử lý phím cách
        if (e.key === ' ') {
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current[e.key] = false;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        stopScrolling();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopScrolling();
    };
  }, [prevChapter, nextChapter, showChapterDropdown, showDropdown, showCurrentChapterDropdown, isNavigating]);

  // Scroll to top khi chapter thay đổi
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [chapterId]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Scroll xuống
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        // Scroll lên
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p className="text-black">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Thanh điều hướng cố định trên cùng */}
      <div className={`sticky top-0 bg-white/90 backdrop-blur-sm z-10 p-2 border-b flex justify-between items-center ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/manga/${mangaId}`)}
            className="p-2 bg-blue-300 hover:bg-blue-500 text-black rounded-full flex items-center cursor-pointer"
          >
            ← Detail
          </button>
          
          {/* <button
            onClick={() => setShowChapterList(true)}
            className="px-3 py-1 bg-blue-300 hover:bg-blue-500 rounded text-sm text-black cursor-pointer"
          >
            ≡ All Chapters
          </button> */}

          <div className="relative mx-2">
            <button
              onClick={() => setShowChapterDropdown(!showChapterDropdown)}
              className="px-4 py-2 bg-blue-300 hover:bg-blue-500 rounded-full text-black flex items-center gap-2 cursor-pointer"
            >
              ≡ All Chapters
            </button>
            
            {showChapterDropdown && (
              <div className="absolute left-0 top-full mt-1 w-64 max-h-96 overflow-y-auto bg-white rounded shadow-lg z-30 border">
                <div className="p-2 border-b sticky top-0 bg-white flex justify-between items-center">
                  <h4 className="font-bold text-black">All Chapters</h4>
                </div>
                <div className="divide-y">
                  {sortedChapters.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => {
                        router.push(`/manga/${mangaId}/chapters/${chap.id}`);
                        setShowChapterDropdown(false);
                        window.scrollTo(0, 0);
                      }}
                      className={`w-full text-left p-2 hover:bg-blue-100 text-black text-sm ${chap.id === chapterId ? 'bg-blue-50 font-medium' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          {chap.chapter !== "Unknown" ? `Chapter ${chap.chapter}` : "Oneshot"}
                          {chap.title && chap.title !== "Untitled" && (
                            <span className="text-gray-600 ml-2 ">- {chap.title}</span>
                          )}
                        </span>
                        {chap.id === chapterId && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            height="20px"
                            width="20px" 
                            viewBox="0 -960 960 960"  
                            fill="#000000"
                          >
                            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => prevChapter && router.push(`/manga/${mangaId}/chapters/${prevChapter.id}`)}
            disabled={!prevChapter}
            className={`p-2 bg-blue-300 hover:bg-blue-500 rounded-full flex items-center ${
              prevChapter 
                ? 'bg-gray-150 hover:bg-gray-500 text-black cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="24px" 
              width="24px"
              viewBox="0 -960 960 960" 
              fill={prevChapter ? "currentColor" : "#9CA3AF"}
            >
              <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
            </svg>
          </button>
          
          <div className="relative mx-2">
            <button
              onClick={() => setShowCurrentChapterDropdown(!showCurrentChapterDropdown)}
              className="px-4 py-2 bg-blue-300 hover:bg-blue-500 rounded-full text-black flex items-center gap-2 cursor-pointer"
            >
              <span className="font-medium">
                {currentChapter?.chapter !== "Unknown" ? `Chapter ${currentChapter?.chapter}` : "Oneshot"}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showCurrentChapterDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCurrentChapterDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 max-h-[70vh] overflow-y-auto bg-white rounded shadow-lg z-30 border">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <h4 className="font-bold text-black">Chapter</h4>
                </div>
                <div className="divide-y">
                  {sortedChapters.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => {
                        router.push(`/manga/${mangaId}/chapters/${chap.id}`);
                        setShowCurrentChapterDropdown(false);
                      }}
                      className={`w-full text-left p-3 hover:bg-blue-100 text-black ${chap.id === chapterId ? 'bg-blue-50 font-medium' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          {chap.chapter !== "Unknown" ? `Chapter ${chap.chapter}` : "Oneshot"}
                          {chap.title && chap.title !== "Untitled" && (
                            <span className="text-gray-600 ml-2">- {chap.title}</span>
                          )}
                        </span>
                        {chap.id === chapterId && (
                          <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                            height="20px"
                            width="20px" 
                            viewBox="0 -960 960 960"  
                            fill="#000000"
                          >
                            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => nextChapter && router.push(`/manga/${mangaId}/chapters/${nextChapter.id}`)}
            disabled={!nextChapter}
            className={`p-2 bg-blue-300 hover:bg-blue-500 rounded-full flex items-center ${
              nextChapter 
                ? 'bg-gray-150 hover:bg-gray-500 text-black cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="24px" 
              width="24px" 
              viewBox="0 -960 960 960" 
              fill={nextChapter ? "currentColor" : "#9CA3AF"}
            >
              <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
            </svg>
          </button>
        </div>
        
        <div className="w-10"></div>

      </div>

      {/* Modal hiển thị danh sách chapter */}
      {/* {showChapterList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-center items-start pt-16">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white flex justify-between items-center">
              <h3 className="font-bold text-black">All Chapters</h3>
              <button 
                onClick={() => setShowChapterList(false)}
                className="text-black hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="divide-y">
              {sortedChapters.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => {
                    router.push(`/manga/${mangaId}/chapters/${chap.id}`);
                    setShowChapterList(false);
                  }}
                  className={`w-full text-left p-3 hover:bg-blue-400 text-black ${chap.id === chapterId ? 'bg-blue-50 font-medium' : ''}`}
                >
                  <span>
                    {chap.chapter !== "Unknown" ? `Chapter ${chap.chapter}` : "Oneshot"}
                    {chap.title && chap.title !== "Untitled" && (
                      <span className="text-gray-600 ml-2">- {chap.title}</span>
                    )}
                  </span>
                  {chap.id === chapterId && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      height="20px" 
                      viewBox="0 -960 960 960" 
                      width="20px" 
                      fill="#000000"
                      className="ml-2"
                    >
                      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {/* Nội dung chapter */}
      <div ref={containerRef} className="p-4 bg-gray">
        <h1 className="text-4xl font-bold mb-4 text-center text-white">
          {currentChapter?.chapter !== "Unknown" ? `Chapter ${currentChapter?.chapter}` : "Oneshot"}
        </h1>
        
        <div className="space-y-4">
          {pages.map((pageUrl, index) => (
            <div key={index} className="relative">
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Page {index + 1}
              </div>
              <img
                src={pageUrl}
                alt={`Page ${index + 1}`}
                className="w-full rounded shadow"
                loading={index < 3 ? "eager" : "lazy"}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/image-error.png";
                  target.alt = "Failed to load image";
                }}
              />
            </div>
          ))}
        </div>

        {/* Thanh điều hướng phía dưới */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t flex justify-between mt-4">
          <button 
            onClick= {() => {
              router.push('/');
            }}
            className="px-4 py-2 bg-blue-300 hover:bg-blue-500 rounded-full text-black flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>
          </button>
          
          <div className="flex items-center gap-4">
          <button
              onClick={() => prevChapter && router.push(`/manga/${mangaId}/chapters/${prevChapter.id}`)}
              disabled={!prevChapter}
              className={`p-2 bg-blue-300 hover:bg-blue-500 rounded-full flex items-center ${
                prevChapter 
                  ? 'bg-gray-150 hover:bg-gray-500 text-black cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                height="24px" 
                width="24px" 
                viewBox="0 -960 960 960" 
                fill={prevChapter ? "#000000" : "#9CA3AF"}
              >
                <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
              </svg>
            </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-3 py-2 bg-blue-300 hover:bg-blue-500 rounded-full text-black flex items-center gap-2 cursor-pointer"
            >
              {currentChapter?.chapter !== "Unknown" ? `Chapter ${currentChapter?.chapter}` : "Oneshot"}
              <svg 
                className={`ml-2 w-4 h-4 transition-transform ${showDropdown ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-64 max-h-96 overflow-y-auto bg-white rounded shadow-lg z-30 border">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <h4 className="font-bold text-black">Chapters</h4>
                </div>
                <div className="divide-y">
                  {sortedChapters.map((chap) => (
                    <button
                      key={chap.id}
                      onClick={() => {
                        router.push(`/manga/${mangaId}/chapters/${chap.id}`);
                        setShowDropdown(false);
                        window.scrollTo(0, 0);
                      }}
                      className={`w-full text-left p-2 hover:bg-blue-100 text-black text-sm ${chap.id === chapterId ? 'bg-blue-50 font-medium' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          {chap.chapter !== "Unknown" ? `Chapter ${chap.chapter}` : "Oneshot"}
                          {chap.title && chap.title !== "Untitled" && (
                            <span className="text-gray-600 ml-2">- {chap.title}</span>
                          )}
                        </span>
                        {chap.id === chapterId && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            height="20px" 
                            width="20px" 
                            viewBox="0 -960 960 960" 
                            fill="#000000"
                          >
                            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => nextChapter && router.push(`/manga/${mangaId}/chapters/${nextChapter.id}`)}
            disabled={!nextChapter}
            className={`p-2 bg-blue-300 hover:bg-blue-500 rounded-full flex items-center ${
              nextChapter 
                ? 'bg-gray-150 hover:bg-gray-500 text-black cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="24px" 
              width="24px" 
              viewBox="0 -960 960 960" 
              
              fill={nextChapter ? "#000000" : "#9CA3AF"}
            >
              <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
            </svg>
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;