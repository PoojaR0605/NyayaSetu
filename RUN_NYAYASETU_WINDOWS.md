# Running NyayaSetu on Windows

## Prerequisites
- Python virtual environment at `backend\venv` (already installed)
- Node.js + npm (already installed via `frontend\node_modules`)
- Ollama running locally with `llama3.2:3b` model

## 1 — Start Ollama (separate terminal, required for AI features)
```
ollama serve
```
If `llama3.2:3b` is not yet downloaded:
```
ollama pull llama3.2:3b
```

## 2 — Start the Backend (Terminal 1)
Open a terminal and run **exactly** these two commands:
```
cd "C:\Users\Pooja Rajappa\Downloads\NyayaSetu_complete_project\NyayaSetu\backend"
venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend URL: http://localhost:8000  
API docs (debug mode): http://localhost:8000/api/docs  
Health check: http://localhost:8000/health

## 3 — Start the Frontend (Terminal 2)
Open a second terminal and run **exactly** these two commands:
```
cd "C:\Users\Pooja Rajappa\Downloads\NyayaSetu_complete_project\NyayaSetu\frontend"
npm run dev
```
Frontend URL: http://localhost:5173

## 4 — Run Backend Tests
```
cd "C:\Users\Pooja Rajappa\Downloads\NyayaSetu_complete_project\NyayaSetu\backend"
venv\Scripts\pytest.exe tests/ -v
```
Expected result: 24 passed (Ollama-dependent tests take 30-90 sec each)

## 5 — Run Frontend Type-Check and Build
```
cd "C:\Users\Pooja Rajappa\Downloads\NyayaSetu_complete_project\NyayaSetu\frontend"
npx tsc --noEmit
npm run build
```
Both should exit with code 0 and no errors.

## Environment Variables
| File | Location | Purpose |
|------|----------|---------|
| `backend\.env` | `backend\.env` | Port, CORS, DB, Ollama settings |
| `frontend\.env` | `frontend\.env` | Sets `VITE_API_BASE_URL=http://localhost:8000` |

**Never commit `.env` files to git.**

## Without Ollama (Demo Mode)
Edit `backend\.env` and change:
```
DEMO_MODE=True
```
This returns static predefined responses without requiring the AI model.

## Port Configuration
| Service | Port | Configured In |
|---------|------|---------------|
| Backend API | 8000 | `backend\.env` HOST/PORT, uvicorn command |
| Frontend dev | 5173 | Vite default |
| Ollama | 11434 | `backend\.env` OLLAMA_BASE_URL |

The frontend `.env` sets `VITE_API_BASE_URL=http://localhost:8000` which must
match the backend port. Do not change either without updating both.

## Key URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/health |
| API status | http://localhost:8000/api/v1/status |
| Swagger docs | http://localhost:8000/api/docs |
| Ollama | http://localhost:11434 |
