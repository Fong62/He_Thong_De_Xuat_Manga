from fastapi import FastAPI, Request

app = FastAPI()

@app.get("/recommender")
async def recommender(request: Request):
    id_manga = request.cookies.get("id_manga")
    if not id_manga:
        return {"message": "Không có manga nào được chọn!"}

    return {"message": f"Manga ID: {id_manga}"}
