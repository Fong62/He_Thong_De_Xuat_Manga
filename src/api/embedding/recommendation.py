from .Generate_candiate import generate_candidates
from .Re_ranking import re_rank_candidates

def get_recommendations_from_list(manga_ids):
    all_recommendations = []

    for manga_id in manga_ids:
        # Sinh ứng viên từ từng manga_id
        candidates = generate_candidates(manga_id, top_k=100)
        # Re-rank lại để lấy top_5 và phần còn lại
        top_5, _ = re_rank_candidates(manga_id)
        # Gộp top_5 vào danh sách kết quả
        all_recommendations.extend(top_5)

    return all_recommendations

