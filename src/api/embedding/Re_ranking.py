from .Generate_candiate import generate_candidates

def re_rank_candidates(manga_id):
    
    candidates = generate_candidates(manga_id, top_k=100)
    top_5 = candidates[:5]
    temp = candidates[5:]

    print(f"\nTop 5 đề xuất cho manga_id: {manga_id}")
    for item in top_5:
        print(f"- {item['id']} (similarity: {item['similarity']:.4f} ")

    print(f"\nĐã tạm lưu {len(temp)} bộ còn lại để dùng sau.")
    return top_5, temp, candidates
