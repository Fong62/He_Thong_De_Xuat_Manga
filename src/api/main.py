from fastapi import FastAPI
import uvicorn
from core.config import setup_cors
from routers.mangas import router as mangas_router
from cookie.click import recommender
app = FastAPI()
setup_cors(app)
app.include_router(mangas_router, prefix="/api")

@app.get("/")
def home():
    return {"message": "Welcome to FastAPI Manga API!"}
recommender(mangas_router)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
