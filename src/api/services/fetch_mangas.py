import json
import os
from fastapi import HTTPException

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
DATA_FILE = os.path.join(PROJECT_DIR, "manga_data.json")

SENSITIVE_TAGS = {"horror", "sexual violence", "gore", "boys' love", "girls' love", "doujinshi"}
SENSITIVE_KEYWORDS = {"succubus", "doujinshi", "ntr", "slave", "enslave", "succusbus", "sex", "boobs", "kill", "killed"}

def is_sensitive(manga):
    tags = set(tag.lower() for tag in manga.get("tag", []))
    if tags & SENSITIVE_TAGS:
        return True
    title = manga.get("title", "").lower()
    desc = manga.get("description", "").lower()
    for kw in SENSITIVE_KEYWORDS:
        if kw in title or kw in desc:
            return True
    return False

def fetch_mangas(page: int = 1, limit: int = 20):
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=404, detail="File dữ liệu manga không tồn tại.")

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            all_mangas = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Lỗi khi đọc file JSON.")

    # Phân loại rõ ràng và không trùng nhau
    non_sensitive = []
    sensitive = []
    suggestive_or_erotica = []

    for manga in all_mangas:
        rating = manga.get("content_rating", "").lower()
        if rating in {"erotica", "suggestive"}:
            suggestive_or_erotica.append(manga)
        elif is_sensitive(manga):
            sensitive.append(manga)
        else:
            non_sensitive.append(manga)

    sorted_mangas = non_sensitive + sensitive + suggestive_or_erotica

    total = len(sorted_mangas)
    total_pages = (total + limit - 1) // limit
    start = (page - 1) * limit
    end = start + limit
    paginated = sorted_mangas[start:end]

    simplified = []
    for manga in paginated:
        simplified.append({
            "id": manga["id"],
            "title": manga["title"],
            "author": manga.get("author", "Unknown"),
            "description": manga.get("description", "No description available."),
            "status": manga.get("status", "unknown"),
            "tags": manga.get("tag", []),
            "coverUrl": manga.get("cover_image", "https://via.placeholder.com/100x150"),
            "backgroundUrl": manga.get("background_image", "https://via.placeholder.com/800x400"),
            "createdAt": manga.get("created_at", "Unknown"),
            "updatedAt": manga.get("updated_at", "Unknown"),
            "views": manga.get("views", 0),
            "contentRating": rating
        })

    return {
        "mangas": simplified,
        "total": total,
        "totalPages": total_pages
    }
