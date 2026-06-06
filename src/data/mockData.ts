import { Building, Floor, Seat, TimeSlot, Reservation, User, ClosedArea } from '../types';

const generateSeats = (floorId: string, rows: number, cols: number): Seat[] => {
  const seats: Seat[] = [];
  const areas = ['A区', 'B区', 'C区', 'D区'];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const areaIndex = Math.floor((row * cols + col) / (rows * cols / 4));
      const random = Math.random();
      let status: Seat['status'] = 'available';
      
      if (random < 0.3) status = 'occupied';
      else if (random < 0.35) status = 'cleaning';
      else if (random < 0.38) status = 'closed';
      
      seats.push({
        id: `${floorId}-seat-${row}-${col}`,
        floorId,
        code: `${String.fromCharCode(65 + row)}${col + 1}`,
        row,
        col,
        status,
        area: areas[areaIndex] || 'A区'
      });
    }
  }
  return seats;
};

export const buildings: Building[] = [
  {
    id: 'building-1',
    name: '图书馆主楼',
    floors: []
  },
  {
    id: 'building-2',
    name: '教学楼A座',
    floors: []
  }
];

export const floors: Floor[] = [
  {
    id: 'floor-1-1',
    buildingId: 'building-1',
    name: '1楼自习室',
    level: 1,
    seats: generateSeats('floor-1-1', 6, 8),
    closedAreas: []
  },
  {
    id: 'floor-1-2',
    buildingId: 'building-1',
    name: '2楼自习室',
    level: 2,
    seats: generateSeats('floor-1-2', 6, 8),
    closedAreas: []
  },
  {
    id: 'floor-1-3',
    buildingId: 'building-1',
    name: '3楼自习室',
    level: 3,
    seats: generateSeats('floor-1-3', 6, 8),
    closedAreas: []
  },
  {
    id: 'floor-2-1',
    buildingId: 'building-2',
    name: '1楼自习区',
    level: 1,
    seats: generateSeats('floor-2-1', 5, 6),
    closedAreas: []
  },
  {
    id: 'floor-2-2',
    buildingId: 'building-2',
    name: '2楼自习区',
    level: 2,
    seats: generateSeats('floor-2-2', 5, 6),
    closedAreas: []
  }
];

buildings[0].floors = floors.filter(f => f.buildingId === 'building-1');
buildings[1].floors = floors.filter(f => f.buildingId === 'building-2');

export const timeSlots: TimeSlot[] = [
  { id: 'slot-1', startTime: '08:00', endTime: '10:00', label: '上午第一节 (08:00-10:00)' },
  { id: 'slot-2', startTime: '10:00', endTime: '12:00', label: '上午第二节 (10:00-12:00)' },
  { id: 'slot-3', startTime: '14:00', endTime: '16:00', label: '下午第一节 (14:00-16:00)' },
  { id: 'slot-4', startTime: '16:00', endTime: '18:00', label: '下午第二节 (16:00-18:00)' },
  { id: 'slot-5', startTime: '19:00', endTime: '21:00', label: '晚间时段 (19:00-21:00)' }
];

export const users: User[] = [
  { id: 'user-1', name: '张同学', role: 'student', studentId: '2024001' },
  { id: 'user-2', name: '李同学', role: 'student', studentId: '2024002' },
  { id: 'admin-1', name: '王管理员', role: 'admin' },
  { id: 'cleaner-1', name: '赵保洁', role: 'cleaner' }
];

export const initialReservations: Reservation[] = [
  {
    id: 'res-1',
    userId: 'user-1',
    seatId: 'floor-1-1-seat-2-2',
    floorId: 'floor-1-1',
    buildingId: 'building-1',
    date: new Date().toISOString().split('T')[0],
    timeSlotId: 'slot-1',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'res-2',
    userId: 'user-2',
    seatId: 'floor-1-2-seat-3-3',
    floorId: 'floor-1-2',
    buildingId: 'building-1',
    date: new Date().toISOString().split('T')[0],
    timeSlotId: 'slot-1',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export const closedAreas: ClosedArea[] = [
  {
    id: 'closed-1',
    floorId: 'floor-1-1',
    name: 'A区维护',
    seatIds: floors.find(f => f.id === 'floor-1-1')?.seats.filter(s => s.area === 'A区').map(s => s.id) || [],
    reason: '设备维护',
    createdAt: new Date().toISOString()
  }
];
