# Lume Store — Business Dashboard
Dashboard de gestão para uma pequena loja, feito com React, Vite, Flask e SQLite.

## Como executar

### 1. Backend (Flask + SQLite)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
O servidor roda na porta 5000 e cria o banco local com dados de exemplo.

### 2. Frontend (React + Vite)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
Abra o endereço informado pelo Vite (normalmente http://localhost:5173). As chamadas `/api` são encaminhadas ao backend.

## O que tem no dashboard
- Indicadores de vendas, clientes, produtos vendidos e faturamento
- Gráficos de vendas e categorias
- Pedidos recentes e alertas de estoque
- Calendário de pedidos e faturamento mensal
- Cardápio, produtos mais vendidos e detalhes com fotos

As imagens dos produtos ficam em `frontend/public/products/`.
