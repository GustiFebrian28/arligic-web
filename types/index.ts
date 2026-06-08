export type UserRole = 'admin' | 'teknisi' | 'supervisor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface PhotoItem {
  id: string;
  type: 'initial' | 'documentation';
  name: string;
  url: string;
  caption: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ServiceItem {
  name: string;
  harga: number;
}

export interface PartItem {
  name: string;
  qty: number;
  harga: number;
}

export type OrderStatus =
  | 'Dalam Antrian'
  | 'Proses Pengerjaan'
  | 'Menunggu QC'
  | 'Perlu Revisi'
  | 'Siap Diambil'
  | 'Selesai Diambil'
  | 'Dibatalkan';

export interface Order {
  id: string;
  customer: string;
  phone: string;
  brand: string;
  model: string;
  serial?: string;
  issue: string;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  technicianId: string | null;
  workStartAt: string | null;
  workEndAt: string | null;
  photos: PhotoItem[];
  docPhotos: PhotoItem[];
  notesTech: string;
  services: ServiceItem[];
  parts: PartItem[];
  qcApproved: boolean;
  qcNote: string;
  discount: number;
  extraCost: number;
  qcBy: string | null;
  qcAt: string | null;
  pickupAt: string | null;
}

export interface DatabaseSchema {
  users: User[];
  orders: Order[];
}
