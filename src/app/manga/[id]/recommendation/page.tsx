"use client";

import MangaList from "../../../../components/MangaList/MangaList";
interface PageProps {
  params: { id: string };
  searchParams: { /* nếu cần */ };
}

export default function RecommendationPage({ params }: PageProps) {
  // Truyền id cho MangaList để tự động bật recommendation mode
  return <MangaList mangas={undefined} onMangaClick={undefined} />;
}
