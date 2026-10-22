@echo off
cd /d "C:\Users\Pooja Rajappa\Downloads\NyayaSetu_complete_project\NyayaSetu\backend"
venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
