'use client';

import React from 'react';

const statusMap: Record<string, string> = {
  'Dalam Antrian': 'badge-antrian',
  'Proses Pengerjaan': 'badge-proses',
  'Menunggu QC': 'badge-qc',
  'Perlu Revisi': 'badge-revisi',
  'Siap Diambil': 'badge-siap',
  'Selesai Diambil': 'badge-selesai',
  'Dibatalkan': 'badge-batal',
};

export function OrderStatusBadge({ status }: { status: string }) {
  const className = statusMap[status] || 'badge-selesai';
  return <span className={`badge ${className}`}>{status}</span>;
}
