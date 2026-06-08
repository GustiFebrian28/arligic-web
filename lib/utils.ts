export function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function totalOrder(order: any) {
  const serviceTotal = order.services?.reduce((sum: number, item: any) => sum + Number(item.harga || 0), 0) || 0;
  const partsTotal = order.parts?.reduce((sum: number, item: any) => sum + Number(item.harga || 0) * Number(item.qty || 0), 0) || 0;
  return serviceTotal + partsTotal + Number(order.extraCost || 0) - Number(order.discount || 0);
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case 'Dalam Antrian':
      return 'badge-antrian';
    case 'Proses Pengerjaan':
      return 'badge-proses';
    case 'Menunggu QC':
      return 'badge-qc';
    case 'Perlu Revisi':
      return 'badge-revisi';
    case 'Siap Diambil':
      return 'badge-siap';
    case 'Selesai Diambil':
      return 'badge-selesai';
    case 'Dibatalkan':
      return 'badge-batal';
    default:
      return 'badge-selesai';
  }
}
