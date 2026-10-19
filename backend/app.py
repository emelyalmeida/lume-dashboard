import os, random, sqlite3
from datetime import date, timedelta
from flask import Flask, jsonify, g
from flask_cors import CORS

DB = os.path.join(os.path.dirname(__file__), "lume.db")
app = Flask(__name__); CORS(app)

def db():
    if "db" not in g:
        g.db = sqlite3.connect(DB); g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close(_):
    d = g.pop("db", None)
    if d: d.close()

def q(sql, *a): return [dict(r) for r in db().execute(sql, a)]
def one(sql, *a): return db().execute(sql, a).fetchone()[0] or 0

def init():
    if os.path.exists(DB): return
    c = sqlite3.connect(DB)
    c.executescript(open(os.path.join(os.path.dirname(__file__), "schema.sql")).read())
    prods = [("Café Latte","Bebidas",12),("Capuccino","Bebidas",11),("Chocolate quente","Bebidas",13),("Brownie","Doces",9),("Chocolate","Outros",15),("Pão de queijo","Salgados",6),("Café em grãos","Outros",35),("Leite","Outros",6),("Copos descartáveis","Outros",12)]
    for i,(n,cat,p) in enumerate(prods,1):
        c.execute("INSERT INTO products VALUES(?,?,?,?,?,?)",(i,n,cat,p,random.choice([5,8,12,20,50]),10))
    names = ["Mariana Silva","Lucas Almeida","Fernanda Costa","Juliana Santos","Rafael Pereira","Bianca Rocha","Pedro Lima","Camila Dias"]
    for i,n in enumerate(names,1): c.execute("INSERT INTO customers VALUES(?,?,?)",(i,n,(date.today()-timedelta(days=random.randint(1,300))).isoformat()))
    oid = 0
    for d in range(330, -1, -1):
        day = date.today() - timedelta(days=d)
        for _ in range(random.randint(2, 6) + (330-d)//60):
            oid += 1; items = random.sample(range(1,10), random.randint(1,3)); tot = 0
            for pid in items:
                qty = random.randint(1,3); pr = prods[pid-1][2]; tot += qty*pr
                c.execute("INSERT INTO order_items(order_id,product_id,qty,price) VALUES(?,?,?,?)",(oid,pid,qty,pr))
            st = random.choices(["Entregue","Em preparo","Cancelado"],[85,10,5])[0] if d else random.choice(["Entregue","Em preparo"])
            c.execute("INSERT INTO orders VALUES(?,?,?,?,?)",(oid,random.randint(1,8),f"{day} {random.randint(8,20):02d}:{random.randint(0,59):02d}",st,tot))
    c.commit(); c.close()

def pct(a, b): return round((a-b)/b*100) if b else 0

def period(start, end):
    ok = "o.status!='Cancelado' AND date(o.created_at) BETWEEN ? AND ?"
    return (one(f"SELECT COUNT(*) FROM orders o WHERE {ok}", start, end),
            one(f"SELECT SUM(total) FROM orders o WHERE {ok}", start, end),
            one(f"SELECT SUM(qty) FROM order_items i JOIN orders o ON o.id=i.order_id WHERE {ok}", start, end))

@app.get("/api/summary")
def summary():
    t = date.today(); ms = t.replace(day=1); ps = (ms - timedelta(days=1)).replace(day=1)
    pe = ps + timedelta(days=t.day-1)
    n, rev, it = period(ms.isoformat(), t.isoformat()); pn, prev, pit = period(ps.isoformat(), pe.isoformat())
    cust = one("SELECT COUNT(*) FROM customers")
    return jsonify(sales={"value":rev,"delta":pct(rev,prev),"orders":n}, customers={"value":cust,"delta":8},
                   items={"value":it,"delta":pct(it,pit)}, revenue={"value":rev,"delta":pct(rev,prev)})

@app.get("/api/sales-7d")
def sales7():
    return jsonify(q("""SELECT strftime('%d/%m',created_at) day, ROUND(SUM(total),2) total FROM orders
        WHERE status!='Cancelado' AND date(created_at)>=date('now','-6 day','localtime') GROUP BY date(created_at) ORDER BY date(created_at)"""))

@app.get("/api/categories")
def cats():
    return jsonify(q("""SELECT p.category name, ROUND(SUM(i.qty*i.price),2) value FROM order_items i JOIN products p ON p.id=i.product_id
        JOIN orders o ON o.id=i.order_id WHERE o.status!='Cancelado' AND strftime('%Y-%m',o.created_at)=strftime('%Y-%m','now','localtime')
        GROUP BY p.category ORDER BY value DESC"""))

@app.get("/api/top-products")
def top():
    return jsonify(q("""SELECT p.name, p.price, SUM(i.qty) qty FROM order_items i JOIN products p ON p.id=i.product_id JOIN orders o ON o.id=i.order_id
        WHERE o.status!='Cancelado' AND strftime('%Y-%m',o.created_at)=strftime('%Y-%m','now','localtime') AND p.category!='Outros' GROUP BY p.id ORDER BY qty DESC LIMIT 5"""))

@app.get("/api/orders")
def orders():
    return jsonify(q("""SELECT o.id, c.name customer, date(o.created_at) date, o.total, o.status FROM orders o
        JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC LIMIT 5"""))

@app.get("/api/stock")
def stock():
    return jsonify(q("SELECT name, stock qty, CASE WHEN stock<=min_stock THEN 'Baixo' ELSE 'OK' END status FROM products ORDER BY stock LIMIT 5"))

@app.get("/api/monthly")
def monthly():
    return jsonify(q("""SELECT CAST(strftime('%m',created_at) AS INT) m, ROUND(SUM(total),2) total FROM orders
        WHERE status!='Cancelado' AND strftime('%Y',created_at)=strftime('%Y','now','localtime') GROUP BY m ORDER BY m"""))

@app.get("/api/order-days")
def order_days():
    return jsonify([r["d"] for r in q("SELECT DISTINCT CAST(strftime('%d',created_at) AS INT) d FROM orders WHERE strftime('%Y-%m',created_at)=strftime('%Y-%m','now','localtime')")])

@app.get("/api/sales")
def sales():
    return jsonify(q("SELECT o.id, c.name customer, date(o.created_at) date, o.total, o.status FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC LIMIT 200"))

@app.get("/api/customers")
def customers():
    return jsonify(q("""SELECT c.id, c.name, c.created_at since, COUNT(o.id) orders,
        ROUND(COALESCE(SUM(CASE WHEN o.status!='Cancelado' THEN o.total END),0),2) spent
        FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id ORDER BY spent DESC"""))

@app.get("/api/products")
def products():
    return jsonify(q("SELECT id, name, category, price, stock, min_stock FROM products ORDER BY name"))

@app.post("/api/products/<int:pid>/restock")
def restock(pid):
    db().execute("UPDATE products SET stock=stock+10 WHERE id=?", (pid,)); db().commit()
    return jsonify(ok=True)

if __name__ == "__main__":
    init(); app.run(port=5000, debug=True)
