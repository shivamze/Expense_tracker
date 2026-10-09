from sqlalchemy.orm import Session
import math
from typing import Optional
from sqlalchemy import func, desc
from datetime import date
from fastapi import HTTPException
from app.db.models.expenseModel import Expense, CategoryEnum
from app.modules.expenses.schemas import ExpenseCreate, ExpenseUpdate, ExpenseRead
from app.db.models.userModel import User

def create_expense(session: Session, expense_data: ExpenseCreate, current_user: User):
    new_expense = Expense(
        user_id= current_user.id,
        category = expense_data.category,
        amount = expense_data.amount,
        title = expense_data.title,
        tags = expense_data.tags,
        expense_date = expense_data.expense_date or date.today(),
    )

    session.add(new_expense)
    session.commit()
    session.refresh(new_expense)
    return new_expense

def read_expense(
    session: Session,
    current_user: User,
    page: int = 1,
    page_size: int = 10,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[CategoryEnum] = None,
    search: Optional[str] = None,
    sort: str = "newest",
):
    query = session.query(Expense).filter(
        Expense.user_id == current_user.id
    )

    # Date filter
    if start_date:
        query = query.filter(
            Expense.expense_date >= start_date
        )

    if end_date:
        query = query.filter(
            Expense.expense_date <= end_date
        )

    # Category filter
    if category:
        query = query.filter(
            Expense.category == category
        )

    # Search filter
    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            Expense.title.ilike(search_term)
        )

    # Sorting
    if sort == "oldest":
        query = query.order_by(
            Expense.expense_date.asc(),
            Expense.id.asc()
        )
    else:
        query = query.order_by(
            Expense.expense_date.desc(),
            Expense.id.desc()
        )

    total = query.count()

    offset = (page - 1)  * page_size

    expenses = (
        query
        .offset(offset)
        .limit(page_size)
        .all()
    )

    total_pages = math.ceil(total/page_size) if total else 1

    return {
        "items": expenses,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

def update_expense(session: Session, expense_id: int, expense_data: ExpenseUpdate, current_user: User):
    db_expense = session.query(Expense).filter(Expense.id == expense_id).first()

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense Does not Exist")

    update_data = expense_data.model_dump(exclude_unset=True)

    # 3. Apply the updated values directly to the SQLAlchemy object attributes
    for key, value in update_data.items():
        setattr(db_expense, key, value)

    session.commit()
    session.refresh(db_expense)
    return db_expense

def delete_expense(session: Session, expense_id: int, current_user: User):
    db_expense = session.query(Expense).filter(
        Expense.id == expense_id, 
        Expense.user_id == current_user.id
    ).first()
    
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    session.delete(db_expense)
    session.commit()
    return {"message": "Expense deleted successfully"}

def get_dashboard_summary(
        session: Session,
        current_user: User,
        start_date: date | None = None,
        end_date: date | None = None
    ):
    # Get the first day of the current month

    if (start_date is None) != (end_date is None):
        raise ValueError("Both start_date and end_date must be provided")
    
    today = date.today()

    if start_date is None and end_date is None:
        start_date = today
        end_date = today

    # 1. Core KPI: Total spent this month
    total_expense = session.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_date,
        Expense.expense_date <= end_date
    ).scalar() or 0.0

    # 2. Pie Chart Data: Category breakdown for this month
    category_data = session.query(
        Expense.category, 
        func.sum(Expense.amount).label("total")
    ).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_date,
        Expense.expense_date <= end_date
    ).group_by(Expense.category).all()

    # 3. Line Graph Data: Daily trend for this month
    daily_data = session.query(
        Expense.expense_date, 
        func.sum(Expense.amount).label("total")
    ).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start_date,
        Expense.expense_date <= end_date
    ).group_by(Expense.expense_date).order_by(Expense.expense_date).all()

    # 4. Feed: 5 most recent transactions (overall)
    recent = session.query(Expense).filter(
        Expense.user_id == current_user.id
    ).order_by(desc(Expense.expense_date), desc(Expense.created_at)).limit(5).all()

    total_transactions = session.query(Expense).filter(Expense.user_id == current_user.id, Expense.expense_date >= start_date,
    Expense.expense_date <= end_date).count()

    # Format the raw database rows to match our Pydantic schemas
    return {
        "total_expense": total_expense,
        "category_breakdown": [{"category": row.category.value, "total": row.total} for row in category_data],
        "daily_trend": [{"date": row.expense_date, "total": row.total} for row in daily_data],
        "recent_transactions": recent,
        "total_transactions": total_transactions
    }