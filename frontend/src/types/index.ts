export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'MECHANIC' | 'CLIENT';
  createdAt?: string;
}

export interface Vehicle {
  id: number;
  clientId: number;
  client?: User;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsedPart {
  id: number;
  appointmentId: number;
  itemId: number;
  item: InventoryItem;
  quantity: number;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED';
  assignedAt: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  client?: User;
  mechanicId?: number;
  mechanic?: User;
  vehicleId: number;
  vehicle?: Vehicle;
  dateTime: string;
  category: string;
  description: string;
  imageUrl?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'CANCEL_REQUESTED';
  comments?: Comment[];
  usedParts?: UsedPart[];
  totalAmount?: number;
  paymentStatus: 'PENDING' | 'PAID';
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  author: User;
  appointmentId?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}