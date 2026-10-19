import { useEffect, useState } from "react";
import { Thumb } from "./Thumb.jsx";

const brl = v => (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const DESC = {"Café Latte": "Espresso com bastante leite vaporizado e uma fina camada de espuma. Suave e cremoso, combina com um brownie ou um pão de queijo.", "Capuccino": "Partes iguais de espresso, leite vaporizado e espuma, com um toque de cacau por cima.", "Chocolate quente": "Cremoso e bem quentinho, finalizado com chantilly. Perfeito para os dias frios.", "Brownie": "Bolo de chocolate denso e úmido, com a casquinha crocante por cima.", "Pão de queijo": "Macio por dentro, douradinho por fora e feito com queijo de verdade."};

export default function Menu({ page, d, onSelect }) {
  const [cat, setCat] = useState("Todos"), [prods, setProds] = useState([]);
  useEffect(() => { fetch("/api/products").then(r => r.json()).then(setProds); }, []);
  const rank = d["top-products"], mx = rank[0]?.qty || 1;
  const items = prods.filter(p => p.category !== "Outros" && (cat === "Todos" || p.category === cat));
  return <>
    <div className="hello"><div><h1>{page}</h1><p>{page === "Cardápio" ? "Toque em um item para ver os detalhes." : "Ranking do mês, com o preço de cada item."}</p></div></div>
    {page === "Cardápio" ? <>
      <div className="chips">{["Todos", "Bebidas", "Doces", "Salgados"].map(c => <button key={c} className={`chip${c === cat ? " on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="pgrid">{items.map(p => <button key={p.id} className="card pcard" onClick={() => onSelect(p)}><Thumb n={p.name} big /><h3>{p.name}</h3><small>{p.category}</small><b>{brl(p.price)}</b></button>)}</div></>
    : <section className="card"><ol className="rk">{rank.map((p, i) => <li key={p.name} onClick={() => onSelect(p)}><span>{i + 1}</span><Thumb n={p.name} />
        <div className="rn"><b>{p.name}</b><div className="bar"><i style={{ width: `${p.qty / mx * 100}%` }} /></div></div>
        <div className="rv"><b>{brl(p.price)}</b><small>{p.qty} un. · {brl(p.qty * p.price)}</small></div></li>)}</ol></section>}
  </>;
}
