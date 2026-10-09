from fastapi import APIRouter, Query, Depends, UploadFile, File, HTTPException
from datetime import date
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models.userModel import User
from app.db.models.expenseModel import CategoryEnum
from app.db.database import get_db
from app.modules.expenses.crud import create_expense, read_expense, update_expense, delete_expense, get_dashboard_summary
from app.core.services import receipt_to_expense
from app.modules.expenses.schemas import ExpenseCreate, ExpenseRead, ExpenseUpdate, DashboardSummary, ExpensePagination
from app.modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/expense", tags=["Expenses"])

@router.post("/", response_model=ExpenseRead)
def add_expense(expense_data: ExpenseCreate, session: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> ExpenseRead:
    return create_expense(session, expense_data, current_user)


@router.get("/", response_model=ExpensePagination)
def get_all_expense(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[CategoryEnum] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    session: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> List[ExpenseRead]:

    return read_expense(
        session=session,
        current_user=user,
        page=page,
        page_size=page_size,
        start_date=start_date,
        end_date=end_date,
        category=category,
        search=search,
        sort=sort,
    )

@router.patch("/{expense_id}", response_model=ExpenseRead)
def modify_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    current_user: User=Depends(get_current_user),
    session: Session=Depends(get_db)
):
    return update_expense(session, expense_id, expense_data, current_user)

@router.delete("/{expense_id}")
def remove_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return delete_expense(session, expense_id, current_user)


@router.get("/summary", response_model=DashboardSummary)
def get_expense_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_summary(session, current_user, start_date, end_date)


@router.post("/extract")
async def extract_expense_from_receipt(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported.")

    try:
        file_bytes = await file.read()
        extracted_data = receipt_to_expense(file_bytes)
        return extracted_data
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))