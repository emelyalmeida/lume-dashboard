import { useEffect, useState } from "react";
import { Thumb } from "./Thumb.jsx";
import Menu, { DESC } from "./Menu.jsx";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const NAV = ["Dashboard", "Cardápio", "Mais vendidos"];
const brl = v => (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const COLORS = ["#ec6f9b", "#b48bd8", "#f7c06b", "#7fcfb0", "#8fb7dc"];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const ENDPOINTS = ["summary","sales-7d","categories","top-products","orders","stock","monthly","order-days"];

function useData() {
  const [d, setD] = useState(null);
  useEffect(() => {
    Promise.all(ENDPOINTS.map(e => fetch(`/api/${e}`).then(r => r.json()))).then(r => setD(Object.fromEntries(ENDPOINTS.map((e, i) => [e, r[i]]))));
  }, []);
  return d;
}

const Card = ({ title, children, className = "" }) => <section className={`card ${className}`}>{title && <h3>{title}</h3>}{children}</section>;
const Badge = ({ s }) => <span className={`badge ${s.toLowerCase().replace(" ", "-")}`}>{s}</span>;

function Stat({ label, value, delta }) {
  return <Card className="stat"><div><span>{label}</span><strong>{value}</strong></div><p><b>↑ {delta}%</b> em relação ao mês anterior</p></Card>;
}

function Calendar({ days }) {
  const t = new Date(), first = new Date(t.getFullYear(), t.getMonth(), 1).getDay(), n = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)];
  return <Card title="Calendário de pedidos" className="s3">
    <p className="month">{t.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
    <div className="cal">{["D","S","T","Q","Q","S","S"].map((d, i) => <small key={i}>{d}</small>)}
      {cells.map((c, i) => <span key={i} className={c === t.getDate() ? "today" : days.includes(c) ? "has" : ""}>{c}</span>)}</div>
  </Card>;
}

export default function App() {
  const d = useData();
  const [page, setPage] = useState("Dashboard"), [sel, setSel] = useState(null);
  useEffect(() => { const k = e => e.key === "Escape" && setSel(null); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  if (!d) return <p className="loading">Carregando…</p>;
  const total = d.categories.reduce((a, c) => a + c.value, 0);
  const s = d.summary, hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return <div className="app">
    <aside><div className="logo"><b>Lume Store</b><small>Sonhos em cada detalhe</small></div>
      <nav>{NAV.map(m => <a key={m} role="button" tabIndex={0} className={m === page ? "on" : ""} onClick={() => setPage(m)} onKeyDown={e => e.key === "Enter" && setPage(m)}>{m}</a>)}</nav>
      <div className="quote">Grandes resultados são fruto de pequenos passos diários. <i>Você consegue! ♡</i></div></aside>
    <main>
      <header><input placeholder="Buscar por produto, cliente ou pedido…" /><div className="user"><span className="avatar">E</span><div><b>Emely Almeida</b><small>Administrador</small></div></div></header>
      {page !== "Dashboard" ? <Menu page={page} d={d} onSelect={setSel} /> : <>
      <div className="hello"><div><h1>Olá, Emely! ♡</h1><p>Aqui está um resumo do desempenho da sua loja hoje.</p></div><span className="date">{hoje}</span></div>
      <div className="grid">
        <div className="stats">
          <Stat label="Total de Vendas" value={brl(s.sales.value)} delta={s.sales.delta} />
          <Stat label="Total de Clientes" value={s.customers.value} delta={s.customers.delta} />
          <Stat label="Produtos Vendidos" value={s.items.value} delta={s.items.delta} />
          <Stat label="Faturamento" value={brl(s.revenue.value)} delta={s.revenue.delta} />
        </div>
        <Card title="Vendas nos últimos 7 dias" className="c-sales"><ResponsiveContainer height={220}><AreaChart data={d["sales-7d"]}>
          <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ec6f9b" stopOpacity=".35"/><stop offset="1" stopColor="#ec6f9b" stopOpacity=".02"/></linearGradient></defs>
          <CartesianGrid stroke="#f3dfe7" /><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$ ${v}`} width={70} />
          <Tooltip formatter={brl} /><Area dataKey="total" stroke="#ec6f9b" strokeWidth={2} fill="url(#g)" dot={{ r: 3 }} /></AreaChart></ResponsiveContainer></Card>
        <Card title="Vendas por categoria" className="c-cat"><div className="donut"><div className="pie"><ResponsiveContainer height={190}><PieChart>
          <Pie data={d.categories} dataKey="value" innerRadius={55} outerRadius={85}>{d.categories.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}</Pie></PieChart></ResponsiveContainer>
          <div className="center"><b>{brl(total)}</b><small>Total</small></div></div>
          <ul>{d.categories.map((c, i) => <li key={c.name}><i style={{ background: COLORS[i % 5] }} />{c.name}<b>{Math.round(c.value / total * 100)}%</b></li>)}</ul></div></Card>
        <Card title="Produtos mais vendidos" className="c-top"><ol>{d["top-products"].map((p, i) => <li key={p.name}><span>{i + 1}</span><Thumb n={p.name} />{p.name}<b>{p.qty} un.</b></li>)}</ol></Card>
        <Card title="Pedidos recentes" className="c-orders"><table><thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{d.orders.map(o => <tr key={o.id}><td>#{o.id}</td><td>{o.customer}</td><td>{o.date.split("-").reverse().join("/")}</td><td>{brl(o.total)}</td><td><Badge s={o.status} /></td></tr>)}</tbody></table></Card>
        <Card title="Estoque (alertas)" className="c-stock"><table><thead><tr><th>Produto</th><th>Quantidade</th><th>Status</th></tr></thead>
          <tbody>{d.stock.map(p => <tr key={p.name}><td><span className="nm"><Thumb n={p.name} />{p.name}</span></td><td>{p.qty}</td><td><Badge s={p.status} /></td></tr>)}</tbody></table></Card>
        <Calendar days={d["order-days"]} />
        <Card title="Faturamento por mês" className="c-month"><ResponsiveContainer height={200}><BarChart data={d.monthly.map(m => ({ ...m, mes: MESES[m.m - 1] }))}>
          <CartesianGrid stroke="#f3dfe7" vertical={false} /><XAxis dataKey="mes" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={v => `R$ ${v}`} />
          <Tooltip formatter={brl} /><Bar dataKey="total" fill="#f08fb2" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></Card>
        <Card className="s4 feat"><div className="top"><Thumb n={d["top-products"][0].name} big /><div><h3>{d["top-products"][0].name}</h3><p>O mais pedido do mês!</p><button type="button" onClick={() => setSel(d["top-products"][0])}>Ver detalhes</button></div></div>
          <div className="mini"><div>Vendas<b>{d["top-products"][0].qty} un.</b></div><div>Faturamento<b>{brl(d["top-products"][0].qty * d["top-products"][0].price)}</b></div></div></Card>
        <Card title="Notificações" className="s12"><div className="nt">{[["🛍️", `Novo pedido #${d.orders[0].id}`, "Há 12 minutos"], ["🍫", `Estoque baixo: ${(d.stock.find(p => p.status === "Baixo") || d.stock[0]).name}`, "Há 34 minutos"], ["👤", `Cliente cadastrado: ${d.orders[3].customer}`, "Há 1 hora"], ["✅", "Pagamento confirmado", "Há 2 horas"]].map(n => <div key={n[1]}><span className="ic">{n[0]}</span><p><b>{n[1]}</b><small>{n[2]}</small></p></div>)}</div></Card>
      </div>
      </>}
      <footer><span><b>Lume Store</b> · Sistema de gestão · v1.0</span><i>“Sonhos, café e boas vendas!” ♡</i></footer>
      {sel && (() => { const q = (d["top-products"].find(x => x.name === sel.name) || {}).qty || 0; return <div className="overlay" onClick={() => setSel(null)}>
        <div className="modal" role="dialog" aria-modal="true" aria-label={sel.name} onClick={e => e.stopPropagation()}>
          <Thumb n={sel.name} big /><div className="dd"><h2>{sel.name}</h2><p>{DESC[sel.name] || "Um dos favoritos dos clientes da Lume Store."}</p>
            <div className="mini"><div>Preço<b>{brl(sel.price)}</b></div><div>Vendas no mês<b>{q} un.</b></div></div>
            <button type="button" className="mini-btn" autoFocus onClick={() => setSel(null)}>Fechar</button></div></div></div>; })()}
    </main></div>;
}
