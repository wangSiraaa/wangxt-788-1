const generateSeats = (floorId, rows, cols) => {
  const seats = [];
  const areas = ['A区', 'B区', 'C区', 'D区'];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const areaIndex = Math.floor((row * cols + col) / (rows * cols / 4));
      let status = 'available';
      
      if (row === 2 && col === 2) status = 'occupied';
      if (row === 2 && col === 3) status = 'occupied';
      if (row === 3 && col === 0) status = 'cleaning';
      if (row === 0 && col === 0) status = 'closed';
      
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

const buildings = [
  { id: 'building-1', name: '图书馆主楼', floors: [] },
  { id: 'building-2', name: '教学楼A座', floors: [] }
];

const floors = [
  { id: 'floor-1-1', buildingId: 'building-1', name: '1楼自习室', level: 1, seats: generateSeats('floor-1-1', 6, 8), closedAreas: [] },
  { id: 'floor-1-2', buildingId: 'building-1', name: '2楼自习室', level: 2, seats: generateSeats('floor-1-2', 6, 8), closedAreas: [] },
  { id: 'floor-1-3', buildingId: 'building-1', name: '3楼自习室', level: 3, seats: generateSeats('floor-1-3', 6, 8), closedAreas: [] },
  { id: 'floor-2-1', buildingId: 'building-2', name: '1楼自习区', level: 1, seats: generateSeats('floor-2-1', 5, 6), closedAreas: [] },
  { id: 'floor-2-2', buildingId: 'building-2', name: '2楼自习区', level: 2, seats: generateSeats('floor-2-2', 5, 6), closedAreas: [] }
];

buildings[0].floors = floors.filter(f => f.buildingId === 'building-1');
buildings[1].floors = floors.filter(f => f.buildingId === 'building-2');

const today = new Date().toISOString().split('T')[0];

const initialReservations = [
  {
    id: 'res-1',
    userId: 'user-1',
    seatId: 'floor-1-1-seat-2-2',
    floorId: 'floor-1-1',
    buildingId: 'building-1',
    date: today,
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
    date: today,
    timeSlotId: 'slot-1',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const allSeats = floors.flatMap(f => f.seats);

const checkReservationConflict = (seat, userId, date, timeSlotId, reservations, seats) => {
  const currentSeat = seats.find(s => s.id === seat.id);
  
  if (currentSeat?.status === 'occupied') {
    return { hasConflict: true, message: '该座位已被占用，请选择其他座位', type: 'seat_occupied' };
  }
  
  if (currentSeat?.status === 'cleaning') {
    return { hasConflict: true, message: '该座位正在清洁中，暂时无法预约', type: 'seat_cleaning' };
  }
  
  if (currentSeat?.status === 'closed') {
    return { hasConflict: true, message: '该座位已关闭，请选择其他座位', type: 'seat_closed' };
  }
  
  const seatReservation = reservations.find(
    r => r.seatId === seat.id && r.date === date && r.timeSlotId === timeSlotId && r.status === 'active'
  );
  
  if (seatReservation) {
    return { hasConflict: true, message: '该座位在此时段已被预约', type: 'seat_occupied' };
  }
  
  const userReservation = reservations.find(
    r => r.userId === userId && r.date === date && r.timeSlotId === timeSlotId && r.status === 'active'
  );
  
  if (userReservation) {
    return { hasConflict: true, message: '您在此时段已有预约，同一时段只能预约一个座位', type: 'user_has_reservation' };
  }
  
  return { hasConflict: false, message: '' };
};

const getAlternativeFloors = (currentFloorId, date, timeSlotId, floors, buildings, reservations, seats) => {
  const currentFloor = floors.find(f => f.id === currentFloorId);
  if (!currentFloor) return [];
  
  const alternatives = [];
  
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

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ 断言失败: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

function runTests() {
  console.log('========================================');
  console.log('开始运行 E2E 检查脚本');
  console.log('========================================\n');

  const timeSlotId = 'slot-1';
  const userId = 'user-1';

  console.log('测试 1: 选择已占座位，断言冲突反馈');
  console.log('--------------------------------------------------');
  
  const occupiedSeat = allSeats.find(s => s.status === 'occupied');
  assert(occupiedSeat !== undefined, '找到已占用的座位');
  
  const occupiedConflict = checkReservationConflict(
    occupiedSeat, userId, today, timeSlotId, initialReservations, allSeats
  );
  assert(occupiedConflict.hasConflict === true, '已占用座位检测到冲突');
  assert(occupiedConflict.type === 'seat_occupied', '冲突类型为 seat_occupied');
  assert(occupiedConflict.message.includes('已被占用'), '冲突消息包含"已被占用"');
  console.log('');

  console.log('测试 2: 制造同一时段重复预约，验证替代楼层列表');
  console.log('--------------------------------------------------');
  
  const userExistingReservation = initialReservations.find(r => r.userId === userId && r.timeSlotId === timeSlotId);
  assert(userExistingReservation !== undefined, '用户在该时段已有预约');
  
  const sameFloorSeats = allSeats.filter(
    s => s.floorId === userExistingReservation.floorId && s.status === 'available'
  );
  assert(sameFloorSeats.length > 0, '同楼层有可用座位');
  
  const testSeat = sameFloorSeats[0];
  
  const userConflict = checkReservationConflict(
    testSeat, userId, today, timeSlotId, initialReservations, allSeats
  );
  assert(userConflict.hasConflict === true, '同一时段重复预约检测到冲突');
  assert(userConflict.type === 'user_has_reservation', '冲突类型为 user_has_reservation');
  assert(userConflict.message.includes('同一时段只能预约一个座位'), '冲突消息包含时段限制说明');
  
  const alternatives = getAlternativeFloors(
    userExistingReservation.floorId, today, timeSlotId, floors, buildings, initialReservations, allSeats
  );
  assert(alternatives.length > 0, '替代楼层列表不为空');
  console.log(`找到 ${alternatives.length} 个替代楼层:`);
  alternatives.forEach((alt, idx) => {
    console.log(`  ${idx + 1}. ${alt.buildingName} - ${alt.floorName} (${alt.availableSeats}个可用座位)${alt.isAdjacent ? ' [相邻楼层]' : ''}`);
  });
  
  const hasAdjacent = alternatives.some(a => a.isAdjacent);
  if (hasAdjacent) {
    assert(alternatives[0].isAdjacent === true, '相邻楼层优先排序');
  }
  console.log('');

  console.log('测试 3: 清洁中座位只能展示不能预约');
  console.log('--------------------------------------------------');
  
  const cleaningSeat = allSeats.find(s => s.status === 'cleaning');
  if (cleaningSeat) {
    const cleaningConflict = checkReservationConflict(
      cleaningSeat, userId, today, timeSlotId, initialReservations, allSeats
    );
    assert(cleaningConflict.hasConflict === true, '清洁中座位检测到冲突');
    assert(cleaningConflict.type === 'seat_cleaning', '冲突类型为 seat_cleaning');
    assert(cleaningConflict.message.includes('清洁中'), '冲突消息包含"清洁中"');
  } else {
    console.log('⚠️  当前数据中无清洁中座位，跳过此测试');
  }
  console.log('');

  console.log('测试 4: 已关闭座位不可预约');
  console.log('--------------------------------------------------');
  
  const closedSeat = allSeats.find(s => s.status === 'closed');
  if (closedSeat) {
    const closedConflict = checkReservationConflict(
      closedSeat, userId, today, timeSlotId, initialReservations, allSeats
    );
    assert(closedConflict.hasConflict === true, '已关闭座位检测到冲突');
    assert(closedConflict.type === 'seat_closed', '冲突类型为 seat_closed');
    assert(closedConflict.message.includes('已关闭'), '冲突消息包含"已关闭"');
  } else {
    console.log('⚠️  当前数据中无已关闭座位，跳过此测试');
  }
  console.log('');

  console.log('测试 5: 可用座位无冲突');
  console.log('--------------------------------------------------');
  
  const availableSeat = allSeats.find(s => s.status === 'available');
  const noConflictUser = 'user-999';
  
  const noConflict = checkReservationConflict(
    availableSeat, noConflictUser, today, timeSlotId, initialReservations, allSeats
  );
  assert(noConflict.hasConflict === false, '可用座位无冲突');
  assert(noConflict.message === '', '无冲突时消息为空');
  console.log('');

  console.log('========================================');
  console.log('🎉 所有测试通过！');
  console.log('========================================');
}

runTests();
