"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface MangaCardProps {
  id: string;
  title: string;
  status: string;
  tags: string[];
  coverUrl: string;
}

const MangaCard: React.FC<MangaCardProps> = ({ id, title, status, tags, coverUrl }) => {
  return (
    <Link href={`/manga/${id}`} className="flex flex-col justify-between w-60 cursor-pointer rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105">
        <Image src={coverUrl} alt={title} width="180" height="250" className="w-full h-80 object-cover" />
        <div className="p-3 flex flex-col justify-between h-30">
          <h3 className="text-sm font-bold text-gray-900 break-words line-clamp-2">{title}</h3>
          <p className="text-xs font-small text-gray-600">Status: {status}</p>
          <p className="text-xs font-medium text-gray-500 break-words line-clamp-1">Tags: {tags.join(", ")}</p>
        </div>
    </Link>
  );
};

export default MangaCard;
