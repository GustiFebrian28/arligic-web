import { NextRequest } from 'next/server';
import { findOrderById, saveOrder } from '../../../../lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await findOrderById(params.id);
  if (!order) {
    return new Response(JSON.stringify({ error: 'Order tidak ditemukan.' }), { status: 404 });
  }
  return new Response(JSON.stringify({ order }), { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await findOrderById(params.id);
  if (!order) {
    return new Response(JSON.stringify({ error: 'Order tidak ditemukan.' }), { status: 404 });
  }

  const body = await req.json();
  const updated = {
    ...order,
    ...body,
  };

  if (body.docPhotos) {
    updated.docPhotos = body.docPhotos;
  }
  if (body.photos) {
    updated.photos = body.photos;
  }

  const saved = await saveOrder(updated);
  return new Response(JSON.stringify({ order: saved }), { status: 200 });
}
