import fs from 'fs/promises';
import path from 'path';
import { DatabaseSchema, Order, User } from '../types';

const dbFile = path.join(process.cwd(), 'data', 'db.json');

const initialDb: DatabaseSchema = {
  users: [],
  orders: [],
};

async function readDbFile(): Promise<DatabaseSchema> {
  try {
    const content = await fs.readFile(dbFile, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') {
      await writeDbFile(initialDb);
      return initialDb;
    }
    throw error;
  }
}

async function writeDbFile(db: DatabaseSchema): Promise<void> {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2), 'utf-8');
}

export async function getDb(): Promise<DatabaseSchema> {
  return readDbFile();
}

export async function saveDb(db: DatabaseSchema): Promise<void> {
  await writeDbFile(db);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  const db = await getDb();
  return db.users.find((user) => user.id === id);
}

export async function saveUser(user: User): Promise<User> {
  const db = await getDb();
  const index = db.users.findIndex((item) => item.id === user.id);
  if (index >= 0) {
    db.users[index] = user;
  } else {
    db.users.unshift(user);
  }
  await saveDb(db);
  return user;
}

export async function findOrderById(id: string): Promise<Order | undefined> {
  const db = await getDb();
  return db.orders.find((order) => order.id === id);
}

export async function saveOrder(order: Order): Promise<Order> {
  const db = await getDb();
  const index = db.orders.findIndex((item) => item.id === order.id);
  if (index >= 0) {
    db.orders[index] = order;
  } else {
    db.orders.unshift(order);
  }
  await saveDb(db);
  return order;
}

export async function listOrders(): Promise<Order[]> {
  const db = await getDb();
  return db.orders;
}

export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  return db.users;
}
