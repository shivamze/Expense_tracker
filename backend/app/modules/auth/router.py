from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.models.userModel import User

from app.db.database import SessionLocal
from app.modules.auth.crud import register_user, login_user, refresh_user_token, logout_user, delete_user, update_user
from app.modules.auth.schemas import UserRegister, UserLogin, UserUpdate
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.crud import get_refresh_token
router = APIRouter(prefix="/auth", tags=["Authentication"])
from app.db.database import get_db
from app.core.config import settings


@router.post("/register")
def register(user_data: UserRegister, session: Session=Depends(get_db)):
    return register_user(session, user_data)


@router.put("/update")
def update(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session=Depends(get_db)
):
    return update_user(session, current_user, user_data)

@router.delete("/delete")
def delete(
    current_user: User = Depends(get_current_user),
    session: Session=Depends(get_db)
):
    return delete_user(session, current_user)

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "name": user.name,
        "email": user.email,
        "id": user.id
    }

from fastapi import Response, Cookie

def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=False,          # True in production (HTTPS)
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth",          # only sent to /auth/* endpoints
    )

@router.post("/login")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db),
):
    user_data = UserLogin(email=form_data.username, password=form_data.password)
    result = login_user(session, user_data)
    set_refresh_cookie(response, result.pop("refresh_token"))
    return result   # now only contains access_token + token_type

@router.post("/refresh")
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    result = refresh_user_token(session, refresh_token)
    set_refresh_cookie(response, result.pop("refresh_token"))
    return result

@router.post("/logout")
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_db),
):
    if refresh_token:
        record = get_refresh_token(session, refresh_token)
        if record and record.revoked_at is None:
            record.revoked_at = datetime.now(timezone.utc)
            session.commit()
    response.delete_cookie("refresh_token", path="/auth")
    return {"ok": True}