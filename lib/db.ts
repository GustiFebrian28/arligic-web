import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { DatabaseSchema, Order, User } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fallbackUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Budi Santoso',
    email: 'admin@arlogic.test',
    password: 'sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    role: 'admin',
  },
  {
    id: 'user-teknisi',
    name: 'Agus Prasetyo',
    email: 'teknisi@arlogic.test',
    password: 'sha256$3ac40463b419a7de590185c7121f0bfbe411d6168699e8014f521b050b1d6653',
    role: 'teknisi',
  },
  {
    id: 'user-supervisor',
    name: 'Dewi Rahayu',
    email: 'supervisor@arlogic.test',
    password: 'sha256$1c8b3a939e438b44507d10fe725bc34c206a0a9d0189be00e47300b4e8e6d6d9',
    role: 'supervisor',
  },
  {
    id: 'user-mq0zsr0a',
    name: 'Binta',
    email: 'teknisi2@arlogic.id',
    password: 'sha256$98fe185e96c7040b30fa5b6231906f14e0e5debb1dc44ee9d0b1fae15483f36d',
    role: 'teknisi',
  },
];

function isMissingTableError(error: unknown) {
  return ['PGRST205', '42P01'].includes((error as { code?: string }).code || '');
}

function isMissingColumnError(error: unknown) {
  return ['PGRST204', '42703'].includes((error as { code?: string }).code || '');
}

function getMissingColumn(error: unknown) {
  if (!error) return undefined;
  const message = (error as { message?: string }).message || '';
  return message.match(/'([^']+)' column/)?.[1];
}

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type OrderRow = {
  id: string;
  invoice_id?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  watch_brand?: string | null;
  watch_model?: string | null;
  watch_serial?: string | null;
  issue_description?: string | null;
  customer_notes?: string | null;
  initial_photos?: Order['photos'] | null;
  description?: string | null;
  phone: string | null;
  brand: string | null;
  model: string | null;
  serial: string | null;
  issue: string | null;
  notes: string | null;
  status: Order['status'];
  technician_id: string | null;
  work_start_at: string | null;
  work_end_at: string | null;
  photos: Order['photos'] | null;
  doc_photos: Order['docPhotos'] | null;
  notes_tech: string | null;
  services: Order['services'] | null;
  parts: Order['parts'] | null;
  qc_approved: boolean | null;
  qc_note: string | null;
  discount: number | null;
  extra_cost: number | null;
  qc_by: string | null;
  qc_at: string | null;
  pickup_at: string | null;
  created_at: string;
};

async function readFallbackDb(): Promise<DatabaseSchema> {
  try {
    const dbFile = path.join(process.cwd(), 'data', 'db.json');
    const content = await fs.readFile(dbFile, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch {
    return { users: fallbackUsers, orders: [] };
  }
}

function parseOrderDescription(row: OrderRow): Partial<Order> {
  if (!row.description) return {};

  try {
    const parsed = JSON.parse(row.description);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {
      issue: row.description,
    };
  }
}

function rowToOrder(row: OrderRow): Order {
  const details = parseOrderDescription(row);

  return {
    id: row.id,
    customer: details.customer || row.customer_name,
    phone: details.phone || row.customer_phone || row.phone || '',
    brand: details.brand || row.watch_brand || row.brand || '',
    model: details.model || row.watch_model || row.model || '',
    serial: details.serial || row.watch_serial || row.serial || '',
    issue: details.issue || row.issue_description || row.issue || '',
    notes: details.notes || row.customer_notes || row.notes || '',
    status: row.status,
    createdAt: details.createdAt || row.created_at,
    technicianId: details.technicianId === undefined ? row.technician_id : details.technicianId,
    workStartAt: details.workStartAt === undefined ? row.work_start_at : details.workStartAt,
    workEndAt: details.workEndAt === undefined ? row.work_end_at : details.workEndAt,
    photos: details.photos || row.initial_photos || row.photos || [],
    docPhotos: details.docPhotos || row.doc_photos || [],
    notesTech: details.notesTech || row.notes_tech || '',
    services: details.services || row.services || [],
    parts: details.parts || row.parts || [],
    qcApproved: details.qcApproved === undefined ? Boolean(row.qc_approved) : details.qcApproved,
    qcNote: details.qcNote || row.qc_note || '',
    discount: details.discount === undefined ? row.discount || 0 : details.discount,
    extraCost: details.extraCost === undefined ? row.extra_cost || 0 : details.extraCost,
    qcBy: details.qcBy === undefined ? row.qc_by : details.qcBy,
    qcAt: details.qcAt === undefined ? row.qc_at : details.qcAt,
    pickupAt: details.pickupAt === undefined ? row.pickup_at : details.pickupAt,
  };
}

function orderToRow(order: Order) {
  return {
    id: order.id,
    invoice_id: (order as Order & { invoiceId?: string }).invoiceId || order.id,
    customer_name: order.customer,
    customer_phone: order.phone,
    watch_brand: order.brand,
    watch_model: order.model,
    watch_serial: order.serial || '',
    issue_description: order.issue,
    customer_notes: order.notes,
    initial_photos: order.photos || [],
    phone: order.phone,
    brand: order.brand,
    model: order.model,
    serial: order.serial || '',
    issue: order.issue,
    notes: order.notes,
    status: order.status,
    technician_id: order.technicianId,
    work_start_at: order.workStartAt,
    work_end_at: order.workEndAt,
    photos: order.photos || [],
    doc_photos: order.docPhotos || [],
    notes_tech: order.notesTech || '',
    services: order.services || [],
    parts: order.parts || [],
    qc_approved: order.qcApproved,
    qc_note: order.qcNote || '',
    discount: order.discount || 0,
    extra_cost: order.extraCost || 0,
    qc_by: order.qcBy,
    qc_at: order.qcAt,
    pickup_at: order.pickupAt,
    created_at: order.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function orderToLegacyRow(order: Order) {
  return {
    id: order.id,
    invoice_id: (order as Order & { invoiceId?: string }).invoiceId || order.id,
    customer_name: order.customer,
    customer_phone: order.phone,
    watch_brand: order.brand,
    watch_model: order.model,
    watch_serial: order.serial || '',
    issue_description: order.issue,
    customer_notes: order.notes,
    initial_photos: order.photos || [],
    status: order.status,
    description: JSON.stringify(order),
    created_at: order.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function orderToMinimalRow(order: Order) {
  return {
    id: order.id,
    invoice_id: (order as Order & { invoiceId?: string }).invoiceId || order.id,
    customer_name: order.customer,
    customer_phone: order.phone,
    watch_brand: order.brand,
    watch_model: order.model,
    watch_serial: order.serial || '',
    issue_description: order.issue,
    customer_notes: order.notes,
    initial_photos: order.photos || [],
    status: order.status,
    created_at: order.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export async function getDb(): Promise<DatabaseSchema> {
  const [users, orders] = await Promise.all([listUsers(), listOrders()]);
  return { users, orders };
}

export async function saveDb(db: DatabaseSchema): Promise<void> {
  const supabase = getSupabase();

  if (db.users.length) {
    const { error } = await supabase.from('app_users').upsert(db.users);
    if (error) throw error;
  }

  if (db.orders.length) {
    const { error } = await supabase.from('service_orders').upsert(db.orders.map(orderToRow));
    if (error) throw error;
  }
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .ilike('email', email)
    .maybeSingle();

  if (isMissingTableError(error)) {
    return fallbackUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }
  if (error) throw error;
  return data as User | undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('app_users').select('*').eq('id', id).maybeSingle();

  if (isMissingTableError(error)) {
    return fallbackUsers.find((user) => user.id === id);
  }
  if (error) throw error;
  return data as User | undefined;
}

export async function saveUser(user: User): Promise<User> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('app_users').upsert(user).select('*').single();

  if (error) throw error;
  return data as User;
}

export async function findOrderById(id: string): Promise<Order | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('service_orders').select('*').eq('id', id).maybeSingle();

  if (error) {
    const fallback = await readFallbackDb();
    return fallback.orders.find((order) => order.id === id);
  }
  return data ? rowToOrder(data as OrderRow) : undefined;
}

export async function saveOrder(order: Order): Promise<Order> {
  const supabase = getSupabase();
  async function upsertOrderRow(row: Record<string, unknown>) {
    const payload = { ...row };

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const result = await supabase.from('service_orders').upsert(payload).select('*').single();
      const missingColumn = getMissingColumn(result.error);

      if (!result.error || !missingColumn || !(missingColumn in payload)) {
        return result;
      }

      delete payload[missingColumn];
    }

    return supabase.from('service_orders').upsert(payload).select('*').single();
  }

  const result = await upsertOrderRow(orderToRow(order));

  if (!result.error) {
    return {
      ...order,
      ...rowToOrder(result.data as OrderRow),
      photos: rowToOrder(result.data as OrderRow).photos.length ? rowToOrder(result.data as OrderRow).photos : order.photos,
    };
  }

  if (!isMissingColumnError(result.error)) {
    throw result.error;
  }

  const legacyResult = await upsertOrderRow(orderToLegacyRow(order));

  if (isMissingColumnError(legacyResult.error)) {
    const minimalResult = await upsertOrderRow(orderToMinimalRow(order));

    if (minimalResult.error) throw minimalResult.error;
    return {
      ...order,
      ...rowToOrder(minimalResult.data as OrderRow),
    };
  }

  if (legacyResult.error) throw legacyResult.error;
  return {
    ...order,
    ...rowToOrder(legacyResult.data as OrderRow),
    photos: rowToOrder(legacyResult.data as OrderRow).photos.length ? rowToOrder(legacyResult.data as OrderRow).photos : order.photos,
  };
}

export async function listOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    const fallback = await readFallbackDb();
    return fallback.orders;
  }

  const orders = (data || []).map((row) => rowToOrder(row as OrderRow));
  if (orders.length === 0) {
    const fallback = await readFallbackDb();
    return fallback.orders;
  }

  return orders;
}

export async function listUsers(): Promise<User[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('app_users').select('*').order('name');

  if (isMissingTableError(error)) {
    return fallbackUsers;
  }
  if (error) throw error;
  return (data || []) as User[];
}
