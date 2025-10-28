# 💬 Your_Friend — AI Chat Web App

**Your_Friend** is a full-stack conversational AI web application that lets users chat with different AI personas — just like Instagram DMs.  
It’s built using **FastAPI**, **React**, **PostgreSQL**, **ChromaDB**, and **LangChain** for intelligent, context-aware responses.

---

## 🧠 Features

- 🔐 **JWT Authentication** (Access + Refresh Tokens)
- 💬 **Real-time-like Chat UI** (React + TailwindCSS)
- 👤 **Multiple Personas** (Alice, Ethan, Sora, etc.)
- 🧠 **AI-powered Conversations** (LangChain + ChromaDB)
- 💾 **Persistent Chat History** (Postgres)
- ⚡ **FastAPI Backend** with endpoints for auth, ai, and user
- 🧩 **Vector-based Memory** for responses
- 🧰 **Modern Dependency Management** using [uv](https://docs.astral.sh/uv/#__tabbed_1_1)

---

## 🏗️ Project Structure

```
your_friend/
│
├── app/ # Backend FastAPI application
│ ├── core/ # Config, database, utils
│ ├── models/ # SQLAlchemy ORM models
│ ├── routers/ # API routes (auth, ai, users, etc.)
│ ├── schemas/ # Pydantic schemas
│ ├── personas/ # JSON of Personas (Alice, Ethan, Sora, etc)
│ └── main.py # FastAPI entry point
│
├── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── data/ # A single JSON file that holds all personas
│ │ ├── pages/ # App pages (Login, Signup, Dashboard)
│ │ ├── context/ # Auth context
│ │ ├── modals/ # Login-in/Signup modals
│ │ └── api.js # Axios setup
│ └── package.json
│
├── .env # Environment variables
├── pyproject.toml # Backend dependencies (uv)
├── uv.lock # Lock file
├── LICENSE
└── README.md
```

---

## ⚙️ Requirements

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- [uv](https://github.com/astral-sh/uv) - Fast Python package manager
- ChromaDB 

---

## 🚀 Backend Setup

### 1️⃣ Create virtual environment

```bash
uv venv
```

2️⃣ Activate environment
```bash
# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

3️⃣ Install dependencies
```bash
uv sync
```

4️⃣ Setup environment variables

Copy the example file:
```
cp .env.example .env
```

Then fill in your configuration:

```.env
DATABASE_URL=postgresql://username:password@localhost:5432/your_friend
SECRET_KEY=your_secret_key # Random string (get from uuid.uuid4() PYTHON)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
GROQ_API_KEY=your_groq_api_key
```

5️⃣ Run the FastAPI server
```bash
uv run uvicorn app.main:app --reload
```

Server runs at:
```
➡️ http://127.0.0.1:8000
```

## 💻 Frontend Setup

1️⃣ Move to frontend folder
```bash
cd frontend
```

2️⃣ Install dependencies
```bash
npm install
```

3️⃣ Run development server
```bash
npm run dev
```

Frontend runs at:
```
➡️ http://localhost:5173
```

## 🧰 Tech Stack

| Layer                  | Technology                    |
| ---------------------- | ----------------------------- |
| **Frontend**           | React, TailwindCSS, Axios     |
| **Backend**            | FastAPI, SQLAlchemy, Pydantic |
| **Database**           | PostgreSQL                    |
| **AI Engine**          | LangChain, ChromaDB           |
| **Auth**               | JWT (Access + Refresh Tokens) |
| **Dependency Manager** | uv                            |
| **Vector Store**       | ChromaDB                      |


## License

This project is licensed under the MIT License — see the LICENSE
 file for details.

##  Credits

Developed by Cyrus Gahatraj

Made with ❤️ using FastAPI + React