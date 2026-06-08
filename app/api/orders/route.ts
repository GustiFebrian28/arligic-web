import { NextRequest } from 'next/server';
import { listOrders, saveOrder } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const orders = await listOrders();
  const data = status ? orders.filter((order) => order.status === status) : orders;
  return new Response(JSON.stringify({ orders: data }), { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ['customer', 'phone', 'brand', 'model', 'issue'];
  for (const field of required) {
    if (!body[field]) {
      return new Response(JSON.stringify({ error: `Field ${field} harus diisi.` }), { status: 400 });
    }
  }

  const newOrder = {
    id: `SRV-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    customer: body.customer,
    phone: body.phone,
    brand: body.brand,
    model: body.model,
    serial: body.serial || '',
    issue: body.issue,
    notes: body.notes || '',
    status: 'Dalam Antrian' as const,
    createdAt: new Date().toISOString(),
    technicianId: null,
    workStartAt: null,
    workEndAt: null,
    photos: Array.isArray(body.photos) ? body.photos : [],
    docPhotos: [],
    notesTech: '',
    services: [],
    parts: [],
    qcApproved: false,
    qcNote: '',
    discount: 0,
    extraCost: 0,
    qcBy: null,
    qcAt: null,
    pickupAt: null,
  };

  const saved = await saveOrder(newOrder);
  return new Response(JSON.stringify({ order: saved }), { status: 201 });
}
