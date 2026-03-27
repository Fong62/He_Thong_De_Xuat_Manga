
import ChapterReader from "../../../../../components/ChapterPage/ChapterReader";

export default function ChapterPage({
  params,
}: {
  params: { mangaId: string; chapterId: string };
}) {
  return <ChapterReader chapterId={params.chapterId} />;
}