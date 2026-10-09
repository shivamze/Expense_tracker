from fastapi import FastAPI, HTTPException, UploadFile, File, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.modules.auth.router import router as auth_router
from app.modules.expenses.router import router as expense_router
from app.modules.savings.router import router as savings_router
from app.core.services import receipt_to_expense

app = FastAPI(
    title="Authentication check",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:8000"
    ], # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(expense_router)
app.include_router(savings_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    image_bytes = await file.read()

    try:
        return receipt_to_expense(image_bytes)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )