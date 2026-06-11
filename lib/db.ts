import { createClient } from '@supabase/supabase-js';
import { DatabaseSchema, Order, User } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  customer_name: string;
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

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customer: row.customer_name,
    phone: row.phone || '',
    brand: row.brand || '',
    model: row.model || '',
    serial: row.serial || '',
    issue: row.issue || '',
    notes: row.notes || '',
    status: row.status,
    createdAt: row.created_at,
    technicianId: row.technician_id,
    workStartAt: row.work_start_at,
    workEndAt: row.work_end_at,
    photos: row.photos || [],
    docPhotos: row.doc_photos || [],
    notesTech: row.notes_tech || '',
    services: row.services || [],
    parts: row.parts || [],
    qcApproved: Boolean(row.qc_approved),
    qcNote: row.qc_note || '',
    discount: row.discount || 0,
    extraCost: row.extra_cost || 0,
    qcBy: row.qc_by,
    qcAt: row.qc_at,
    pickupAt: row.pickup_at,
  };
}

function orderToRow(order: Order) {
  return {
    id: order.id,
    customer_name: order.customer,
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

  if (error) throw error;
  return data as User | undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('app_users').select('*').eq('id', id).maybeSingle();

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

  if (error) throw error;
  return data ? rowToOrder(data as OrderRow) : undefined;
}

export async function saveOrder(order: Order): Promise<Order> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('service_orders')
    .upsert(orderToRow(order))
    .select('*')
    .single();

  if (error) throw error;
  return rowToOrder(data as OrderRow);
}

export async function listOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => rowToOrder(row as OrderRow));
}

export async function listUsers(): Promise<User[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('app_users').select('*').order('name');

  if (error) throw error;
  return (data || []) as User[];
}
