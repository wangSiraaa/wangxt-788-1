import React from 'react';
import { Seat, Floor, TimeSlot, Reservation, ConflictInfo, AlternativeFloor } from '../types';

interface ReservationSidebarProps {
  selectedSeat: Seat | null;
  selectedFloor: Floor | undefined;
  selectedDate: string;
  selectedTimeSlot: TimeSlot | undefined;
  userReservations: Reservation[];
  conflictInfo: ConflictInfo | null;
  alternativeFloors: AlternativeFloor[];
  onReserve: () => void;
  onFloorSelect: (floorId: string) => void;
  onCancel: () => void;
}

const ReservationSidebar: React.FC<ReservationSidebarProps> = ({
  selectedSeat,
  selectedFloor,
  selectedDate,
  selectedTimeSlot,
  userReservations,
  conflictInfo,
  alternativeFloors,
  onReserve,
  onFloorSelect,
  onCancel
}) => {
  const activeReservations = userReservations.filter(r => r.status === 'active');

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-fit sticky top-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">预约详情</h3>

      {selectedSeat ? (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">已选座位</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">楼栋：</span>{selectedFloor ? selectedFloor.name : '-'}</p>
              <p><span className="text-gray-600">座位号：</span>{selectedSeat.code}</p>
              <p><span className="text-gray-600">区域：</span>{selectedSeat.area}</p>
              <p><span className="text-gray-600">日期：</span>{selectedDate}</p>
              <p><span className="text-gray-600">时段：</span>{selectedTimeSlot?.label || '-'}</p>
            </div>
          </div>

          {conflictInfo && conflictInfo.hasConflict && (
            <div 
              data-testid="conflict-alert"
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-red-800">预约冲突</p>
                  <p className="text-sm text-red-700 mt-1" data-testid="conflict-message">{conflictInfo.message}</p>
                </div>
              </div>
            </div>
          )}

          {conflictInfo && conflictInfo.hasConflict && alternativeFloors.length > 0 && (
            <div 
              data-testid="alternative-floors"
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <h4 className="font-medium text-yellow-800 mb-2">推荐替代楼层</h4>
              <div className="space-y-2">
                {alternativeFloors.map((alt, index) => (
                  <button
                    key={alt.floorId}
                    data-testid={`alternative-floor-${index}`}
                    onClick={() => onFloorSelect(alt.floorId)}
                    className="w-full text-left p-3 bg-white rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {alt.buildingName} - {alt.floorName}
                          {alt.isAdjacent && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">相邻楼层</span>}
                        </p>
                        <p className="text-sm text-gray-600">可用座位：{alt.availableSeats} 个</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onReserve}
              disabled={!selectedSeat || (conflictInfo?.hasConflict ?? false)}
              className={`
                flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors
                ${!selectedSeat || conflictInfo?.hasConflict
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              确认预约
            </button>
            <button
              onClick={onCancel}
              className="py-2.5 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p>请在左侧热力图中选择座位</p>
        </div>
      )}

      {activeReservations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">我的预约</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeReservations.map(r => (
              <div key={r.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-800">座位 {r.seatId.split('-').slice(-2).join('')}</p>
                <p className="text-gray-600">{r.date} | {r.timeSlotId}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationSidebar;
