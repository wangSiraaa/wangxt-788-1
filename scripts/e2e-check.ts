import { checkReservationConflict, getAlternativeFloors, getFloorStatistics } from '../src/utils/businessLogic';
import { 
  buildings, 
  floors, 
  timeSlots, 
  initialReservations, 
  initialClosedAreas,
  INITIAL_SEATS 
} from '../src/data/mockData';
import { Seat, Reservation, ClosedArea } from '../src/types';

const allSeats: Seat[] = INITIAL_SEATS;
const reservations: Reservation[] = initialReservations;
const today: string = new Date().toISOString().split('T')[0];
const timeSlotId: string = 'slot-1';
const userId: string = 'user-1';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ 断言失败: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runTests(): Promise<void> {
  console.log('========================================');
  console.log('开始运行 E2E 检查脚本（共享页面源码数据源）');
  console.log('========================================\n');

  console.log('📊 数据源验证:');
  console.log(`   - 总座位数: ${allSeats.length}`);
  console.log(`   - 已占座位数: ${allSeats.filter(s => s.status === 'occupied').length}`);
  console.log(`   - 清洁中座位数: ${allSeats.filter(s => s.status === 'cleaning').length}`);
  console.log(`   - 已关闭座位数: ${allSeats.filter(s => s.status === 'closed').length}`);
  console.log(`   - 已有预约数: ${reservations.length}`);
  console.log(`   - 楼层数: ${floors.length}`);
  console.log(`   - 时段数: ${timeSlots.length}`);
  console.log('');

  console.log('测试 1: 选择已占座位，断言冲突反馈');
  console.log('--------------------------------------------------');
  
  const occupiedSeat = allSeats.find(s => s.status === 'occupied');
  assert(occupiedSeat !== undefined, '找到已占用的座位');
  console.log(`   已占座位: ${occupiedSeat.code} (${occupiedSeat.id})`);
  
  const occupiedConflict = checkReservationConflict(
    occupiedSeat, userId, today, timeSlotId, reservations, allSeats
  );
  assert(occupiedConflict.hasConflict === true, '已占用座位检测到冲突');
  assert(occupiedConflict.type === 'seat_occupied', '冲突类型为 seat_occupied');
  assert(occupiedConflict.message.includes('已被占用'), '冲突消息包含"已被占用"');
  console.log('');

  console.log('测试 2: 制造同一时段重复预约，验证替代楼层列表');
  console.log('--------------------------------------------------');
  
  const userExistingReservation = reservations.find(r => r.userId === userId && r.timeSlotId === timeSlotId);
  assert(userExistingReservation !== undefined, '用户在该时段已有预约');
  console.log(`   用户已有预约: 座位 ${userExistingReservation.seatId}，时段 ${timeSlotId}`);
  
  const sameFloorSeats = allSeats.filter(
    s => s.floorId === userExistingReservation.floorId && s.status === 'available'
  );
  assert(sameFloorSeats.length > 0, '同楼层有可用座位');
  
  const testSeat = sameFloorSeats[0];
  
  const userConflict = checkReservationConflict(
    testSeat, userId, today, timeSlotId, reservations, allSeats
  );
  assert(userConflict.hasConflict === true, '同一时段重复预约检测到冲突');
  assert(userConflict.type === 'user_has_reservation', '冲突类型为 user_has_reservation');
  assert(userConflict.message.includes('同一时段只能预约一个座位'), '冲突消息包含时段限制说明');
  
  const alternatives = getAlternativeFloors(
    userExistingReservation.floorId, today, timeSlotId, floors, buildings, reservations, allSeats
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
    console.log(`   清洁中座位: ${cleaningSeat.code} (${cleaningSeat.id})`);
    const cleaningConflict = checkReservationConflict(
      cleaningSeat, userId, today, timeSlotId, reservations, allSeats
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
    console.log(`   已关闭座位: ${closedSeat.code} (${closedSeat.id})`);
    const closedConflict = checkReservationConflict(
      closedSeat, userId, today, timeSlotId, reservations, allSeats
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
    availableSeat, noConflictUser, today, timeSlotId, reservations, allSeats
  );
  assert(noConflict.hasConflict === false, '可用座位无冲突');
  assert(noConflict.message === '', '无冲突时消息为空');
  console.log('');

  console.log('测试 6: 验证楼层占用统计函数');
  console.log('--------------------------------------------------');
  
  const testFloor = floors[0];
  const stats = getFloorStatistics(testFloor, reservations, today, timeSlotId);
  assert(stats.total > 0, '统计返回总座位数 > 0');
  assert(stats.total === testFloor.seats.length, '总座位数与楼层座位数一致');
  assert(typeof stats.occupancyRate === 'number', '占用率是数字类型');
  assert(stats.occupancyRate >= 0 && stats.occupancyRate <= 100, '占用率在 0-100 之间');
  console.log(`   ${testFloor.name}: 总${stats.total} / 已占${stats.occupied} / 可用${stats.available} / 清洁${stats.cleaning} / 关闭${stats.closed} / 占用率${stats.occupancyRate.toFixed(1)}%`);
  console.log('');

  console.log('========================================');
  console.log('🎉 所有测试通过！');
  console.log('✓ 自检脚本与页面共享相同的数据源和业务逻辑');
  console.log('✓ 业务规则已验证可复现');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
