# backend/main.py
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from chatbot.chatbot_logic import get_bot_response
from database import get_db

app = FastAPI(title="FASHION Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to our frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request, db=Depends(get_db)):
    try:
        payload = await request.json()
        user_message = payload.get("message", "") or payload.get("text", "")
        user_id = payload.get("user_id", "anonymous")
        # db may be a generator result (session) or None
        response = get_bot_response(user_message, user_id=user_id, db_session=db)
        return response
    except Exception as e:
        print("[main.chat] error:", e)
        return {"text": f"[SERVER ERROR]: {e}", "navigate_to": None}


@app.get("/health")
def health():
    return {"status": "ok", "message": "server running"}
