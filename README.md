# Lume Store — Business Dashboard

Dashboard de gestão para uma cafeteria, com interface em React e API em Python. O projeto mostra indicadores de vendas, pedidos recentes, produtos mais vendidos, alertas de estoque e faturamento mensal.

## Tecnologias

- **Frontend:** React, Vite e Recharts
- **Backend:** Python, Flask e Flask-CORS
- **Banco de dados:** SQLite
- **Interface:** layout responsivo com paleta rosa suave

## Como executar localmente

### 1. Inicie a API

```bash
cd backend
python -m venv .venv
```

No Windows, ative o ambiente:

```powershell
.venv\Scripts\Activate.ps1
```

Instale as dependências e inicie o servidor:

```bash
pip install -r requirements.txt
python app.py
```

A API fica disponível em `http://localhost:5000`. Na primeira execução, o banco `lume.db` é criado automaticamente com dados de demonstração.

### 2. Inicie o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`). O Vite encaminha as chamadas `/api` para o backend na porta 5000.

## Estrutura

```text
backend/
  app.py
  requirements.txt
  schema.sql
frontend/
  public/products/
  src/
    App.jsx
    Menu.jsx
    Thumb.jsx
    main.jsx
    styles.css
  index.html
  package.json
  vite.config.js
```

Os dados são fictícios e servem para demonstração. Este projeto é uma base de portfólio e não deve ser usado como sistema de produção sem autenticação, validação adicional e revisão de segurança.
