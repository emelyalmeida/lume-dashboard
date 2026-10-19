CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, stock INTEGER NOT NULL, min_stock INTEGER NOT NULL DEFAULT 10);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), created_at TEXT NOT NULL, status TEXT NOT NULL, total REAL NOT NULL);
CREATE TABLE order_items(id INTEGER PRIMARY KEY, order_id INTEGER REFERENCES orders(id), product_id INTEGER REFERENCES products(id), qty INTEGER NOT NULL, price REAL NOT NULL);
CREATE INDEX idx_orders_date ON orders(created_at);
