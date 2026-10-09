from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.models.userModel import User
from app.db.database import get_db
from app.modules.auth.dependencies import get_current_user

from app.modules.savings.crud import create_savings, read_savings, update_savings, delete_savings, get_savings_summary

from app.modules.savings.schemas import SavingsCreate, SavingsRead, SavingsUpdate, SavingsPagination
from app.db.models.savingsModel import SavingsTypeEnum

router = APIRouter(prefix="/savings", tags=["Savings"])

@router.post("/", response_model=SavingsRead)
def add_savings(
    savings_data: SavingsCreate, 
    session: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> SavingsRead:
    return create_savings(session, savings_data, current_user)

@router.get("/", response_model=SavingsPagination)
def get_all_savings(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),

    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    savings_type: Optional[SavingsTypeEnum] = None,
    sort: str = "newest",

    session: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return read_savings(
        session=session,
        current_user=user,
        page=page,
        page_size=page_size,
        search=search,
        start_date=start_date,
        end_date=end_date,
        savings_type=savings_type,
        sort=sort,
    )

@router.patch("/{savings_id}", response_model=SavingsRead)
def modify_savings(
    savings_id: int,
    savings_data: SavingsUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return update_savings(session, savings_id, savings_data, current_user)

@router.delete("/{savings_id}")
def remove_savings(
    savings_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    return delete_savings(session, savings_id, current_user)

from app.modules.savings.crud import get_savings_summary
# ... your existing imports ...

@router.get("/summary")
def get_savings_dashboard_stats(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns aggregated savings data for the frontend dashboard.
    """
    return get_savings_summary(db=db, user_id=current_user.id, start_date=start_date, end_date=end_date)