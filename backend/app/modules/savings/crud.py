from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import date
from fastapi import HTTPException
from typing import Optional
import math

from app.db.models.savingsModel import Savings, SavingsTypeEnum
from app.modules.savings.schemas import SavingsCreate, SavingsUpdate
from app.db.models.userModel import User

def create_savings(session: Session, savings_data: SavingsCreate, current_user: User):
    new_savings = Savings(
        user_id=current_user.id,
        savings_type=savings_data.savings_type,
        amount=savings_data.amount,
        source=savings_data.source,
        transaction_date=savings_data.transaction_date or date.today(),
    )

    session.add(new_savings)
    session.commit()
    session.refresh(new_savings)
    return new_savings

def read_savings(
    session: Session,
    current_user: User,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    savings_type: Optional[SavingsTypeEnum] = None,
    sort: str = "newest",
):
    query = session.query(Savings).filter(
        Savings.user_id == current_user.id
    )

    # Search
    if search:
        query = query.filter(
            Savings.source.ilike(f"%{search}%")
        )

    # Date filters
    if start_date:
        query = query.filter(
            Savings.transaction_date >= start_date
        )

    if end_date:
        query = query.filter(
            Savings.transaction_date <= end_date
        )

    # Savings type filter
    if savings_type:
        query = query.filter(
            Savings.savings_type == savings_type
        )

    # Total matching records BEFORE pagination
    total = query.count()

    # Sorting
    if sort == "oldest":
        query = query.order_by(
            Savings.transaction_date.asc(),
            Savings.id.asc()
        )
    else:
        query = query.order_by(
            Savings.transaction_date.desc(),
            Savings.id.desc()
        )

    # Pagination
    offset = (page - 1) * page_size

    savings = (
        query
        .offset(offset)
        .limit(page_size)
        .all()
    )

    total_pages = math.ceil(total / page_size) if total else 1

    return {
        "items": savings,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

def update_savings(session: Session, savings_id: int, savings_data: SavingsUpdate, current_user: User):
    db_savings = session.query(Savings).filter(
        Savings.id == savings_id, 
        Savings.user_id == current_user.id
    ).first()

    if not db_savings:
        raise HTTPException(status_code=404, detail="Savings record does not exist")

    update_data = savings_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_savings, key, value)

    session.add(db_savings)
    session.commit()
    session.refresh(db_savings)
    return db_savings

def delete_savings(session: Session, savings_id: int, current_user: User):
    db_savings = session.query(Savings).filter(
        Savings.id == savings_id, 
        Savings.user_id == current_user.id
    ).first()
    
    if not db_savings:
        raise HTTPException(status_code=404, detail="Savings record not found")
    
    session.delete(db_savings)
    session.commit()
    return {"message": "Savings record deleted successfully"}

def get_savings_summary(
        db: Session,
        user_id: int,
        start_date: date | None = None,
        end_date: date | None = None
    ):

    if (start_date is None) != (end_date is None):
        raise ValueError("Both start_date and end_date must be provided")

    today = date.today()

    if start_date is None and end_date is None:
        start_date = today
        end_date = today
    # 1. Total Income
    total_income = db.query(
        func.sum(Savings.amount)
    ).filter(
        Savings.user_id == user_id,
        Savings.savings_type == SavingsTypeEnum.INCOME,
        Savings.transaction_date >= start_date,
        Savings.transaction_date <= end_date
    ).scalar() or 0.0

    # 2. Total Savings
    # Exclude INCOME from savings
    total_savings = db.query(
        func.sum(Savings.amount)
    ).filter(
        Savings.user_id == user_id,
        Savings.savings_type != SavingsTypeEnum.INCOME,
        Savings.transaction_date >= start_date,
        Savings.transaction_date <= end_date
    ).scalar() or 0.0

    # 3. Savings breakdown by type
    # INCOME is excluded
    type_breakdown = db.query(
        Savings.savings_type,
        func.sum(Savings.amount)
    ).filter(
        Savings.user_id == user_id,
        Savings.savings_type != SavingsTypeEnum.INCOME,
        Savings.transaction_date >= start_date,
        Savings.transaction_date <= end_date
    ).group_by(
        Savings.savings_type
    ).all()

    # 4. Recent savings transactions
    # INCOME is excluded
    recent_savings = db.query(
        Savings
    ).filter(
        Savings.user_id == user_id,
        Savings.savings_type != SavingsTypeEnum.INCOME,
        Savings.transaction_date >= start_date,
        Savings.transaction_date <= end_date
    ).order_by(
        Savings.transaction_date.desc()
    ).limit(5).all()

    # 5. Recent income transactions
    recent_income = db.query(
        Savings
    ).filter(
        Savings.user_id == user_id,
        Savings.savings_type == SavingsTypeEnum.INCOME,
        Savings.transaction_date >= start_date,
        Savings.transaction_date <= end_date
    ).order_by(
        Savings.transaction_date.desc()
    ).limit(5).all()

    total_deposits = db.query(Savings).filter(Savings.user_id == user_id, Savings.savings_type != SavingsTypeEnum.INCOME, Savings.transaction_date >= start_date, Savings.transaction_date <= end_date).count()

    return {
        "income": {
            "total_income": total_income,
            "recent_transactions": recent_income
        },
        "savings": {
            "total_savings": total_savings,
            "breakdown_by_type": [
                {
                    "type": t[0].value,
                    "amount": t[1]
                }
                for t in type_breakdown
            ],
            "recent_transactions": recent_savings,
            "total_deposits": total_deposits
        }
    }