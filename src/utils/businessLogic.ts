import { Seat, Reservation, Floor, ConflictInfo, AlternativeFloor, Building } from '../types';

export const checkReservationConflict = (
  seat: Seat,
  userId: string,
  date: string,
  timeSlotId: string,
  reservations: Reservation[],
  seats: Seat[]
): ConflictInfo => {
  const currentSeat = seats.find(s => s.id === seat.id);
  
  if (currentSeat?.status === 'occupied') {
    return {
      hasConflict: true,
      message: '该座位已被占用，请选择其他座位',
      type: 'seat_occupied'
    };
  }
  
  if (currentSeat?.status === 'cleaning') {
    return {
      hasConflict: true,
      message: '该座位正在清洁中，暂时无法预约',
      type: 'seat_cleaning'
    };
  }
  
  if (currentSeat?.status === 'closed') {
    return {
      hasConflict: true,
      message: '该座位已关闭，请选择其他座位',
      type: 'seat_closed'
    };
  }
  
  const seatReservation = reservations.find(
    r => r.seatId === seat.id && 
         r.date === date && 
         r.timeSlotId === timeSlotId && 
         r.status === 'active'
  );
  
  if (seatReservation) {
    return {
      hasConflict: true,
      message: '该座位在此时段已被预约',
      type: 'seat_occupied'
    };
  }
  
  const userReservation = reservations.find(
    r => r.userId === userId && 
         r.date === date && 
         r.timeSlotId === timeSlotId && 
         r.status === 'active'
  );
  
  if (userReservation) {
    return {
      hasConflict: true,
      message: '您在此时段已有预约，同一时段只能预约一个座位',
      type: 'user_has_reservation'
    };
  }
  
  return { hasConflict: false, message: '' };
};

export const getAlternativeFloors = (
  currentFloorId: string,
  date: string,
  timeSlotId: string,
  floors: Floor[],
  buildings: Building[],
  reservations: Reservation[],
  seats: Seat[]
): AlternativeFloor[] => {
  const currentFloor = floors.find(f => f.id === currentFloorId);
  if (!currentFloor) return [];
  
  const alternatives: AlternativeFloor[] = [];
  
  for (const floor of floors) {
    if (floor.id === currentFloorId) continue;
    
    const floorSeats = seats.filter(s => s.floorId === floor.id);
    const reservedSeatIds = reservations
      .filter(r => r.date === date && r.timeSlotId === timeSlotId && r.status === 'active')
      .map(r => r.seatId);
    
    const availableSeats = floorSeats.filter(
      s => s.status === 'available' && !reservedSeatIds.includes(s.id)
    ).length;
    
    if (availableSeats > 0) {
      const building = buildings.find(b => b.id === floor.buildingId);
      const isAdjacent = 
        floor.buildingId === currentFloor.buildingId && 
        Math.abs(floor.level - currentFloor.level) <= 1;
      
      alternatives.push({
        floorId: floor.id,
        floorName: floor.name,
        buildingId: floor.buildingId,
        buildingName: building?.name || '',
        availableSeats,
        isAdjacent
      });
    }
  }
  
  alternatives.sort((a, b) => {
    if (a.isAdjacent && !b.isAdjacent) return -1;
    if (!a.isAdjacent && b.isAdjacent) return 1;
    return b.availableSeats - a.availableSeats;
  });
  
  return alternatives;
};

export const getFloorStatistics = (floor: Floor, reservations: Reservation[], date: string, timeSlotId: string) => {
  const totalSeats = floor.seats.length;
  const reservedSeatIds = reservations
    .filter(r => r.date === date && r.timeSlotId === timeSlotId && r.status === 'active')
    .map(r => r.seatId);
  
  let occupied = 0;
  let available = 0;
  let cleaning = 0;
  let closed = 0;
  
  for (const seat of floor.seats) {
    if (seat.status === 'closed' || floor.closedAreas.some(ca => ca.seatIds.includes(seat.id))) {
      closed++;
    } else if (seat.status === 'cleaning') {
      cleaning++;
    } else if (seat.status === 'occupied' || reservedSeatIds.includes(seat.id)) {
      occupied++;
    } else {
      available++;
    }
  }
  
  return {
    total: totalSeats,
    occupied,
    available,
    cleaning,
    closed,
    occupancyRate: totalSeats > 0 ? Math.round((occupied / totalSeats) * 100) : 0
  };
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
