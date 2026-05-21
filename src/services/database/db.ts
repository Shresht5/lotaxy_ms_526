import { DatabaseSync } from 'node:sqlite';
import { app } from 'electron';
import path from 'path';

let db: DatabaseSync;

export const initDb = (userDataPath: string) => {
  db = new DatabaseSync(path.join(userDataPath, 'app.db'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT,
    position TEXT,
    date_of_joining DATE,
    date_of_birth DATE,
    total_experience REAL DEFAULT 0,
    performance TEXT DEFAULT 'Average',
    potential TEXT DEFAULT 'Medium',
    ctc REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
    CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    check_in TEXT NOT NULL,     
    status TEXT NOT NULL DEFAULT 'Present',
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  company_name TEXT,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  detail TEXT,
  what_done TEXT,
  what_todo TEXT,
  completion INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

   CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    mrp REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    detail TEXT,
    image_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT,
      product_price REAL,
      receiver_name   TEXT    NOT NULL,
      phone           TEXT,
      email           TEXT,
      address         TEXT,
      discount REAL    NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      final_amount    REAL    NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const getDb = () => {
  if (!db) throw new Error('DB not initialized');
  return db;
};