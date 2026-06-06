export type SeatStatus = 'available' | 'occupied' | 'cleaning' | 'closed';

export type UserRole = 'student' | 'admin' | 'cleaner';

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  level: number;
  seats: Seat[];
  closedAreas: ClosedArea[];
}

export interface Seat {
  id: string;
  floorId: string;
  code: string;
  row: number;
  col: number;
  status: SeatStatus;
  area: string;
}

export interface ClosedArea {
  id: string;
  floorId: string;
  name: string;
  seatIds: string[];
  reason: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface Reservation {
  id: string;
  userId: string;
  seatId: string;
  floorId: string;
  buildingId: string;
  date: string;
  timeSlotId: string;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  studentId?: string;
}

export interface ConflictInfo {
  hasConflict: boolean;
  message: string;
  type?: 'seat_occupied' | 'user_has_reservation' | 'seat_cleaning' | 'seat_closed';
}

export interface AlternativeFloor {
  floorId: string;
  floorName: string;
  buildingId: string;
  buildingName: string;
  availableSeats: number;
  isAdjacent: boolean;
}
