import React from 'react';
import { Seat, Floor, Reservation, UserRole } from '../types';

interface HeatMapProps {
  floor: Floor;
  seats: Seat[];
  reservations: Reservation[];
  selectedSeatId: string | null;
  onSeatClick: (seat: Seat) => void;
  date: string;
  timeSlotId: string;
  userRole: UserRole;
}

const HeatMap: React.FC<HeatMapProps> = ({
  floor,
  seats,
  reservations,
  selectedSeatId,
  onSeatClick,
  date,
  timeSlotId,
  userRole
}) => {
  const floorSeats = seats.filter(s => s.floorId === floor.id);
  const reservedSeatIds = reservations
    .filter(r => r.date === date && r.timeSlotId === timeSlotId && r.status === 'active')
    .map(r => r.seatId);
  const closedAreaSeatIds = floor.closedAreas.flatMap(ca => ca.seatIds);

  const getSeatColor = (seat: Seat): string => {
    if (seat.id === selectedSeatId) return 'bg-seat-selected ring-2 ring-blue-300';
    if (closedAreaSeatIds.includes(seat.id)) return 'bg-seat-closed opacity-60';
    if (seat.status === 'closed') return 'bg-seat-closed';
    if (seat.status === 'cleaning') return 'bg-seat-cleaning';
    if (seat.status === 'occupied' || reservedSeatIds.includes(seat.id)) return 'bg-seat-occupied';
    return 'bg-seat-available hover:ring-2 hover:ring-green-300';
  };

  const isSeatClickable = (seat: Seat): boolean => {
    if (closedAreaSeatIds.includes(seat.id)) return false;
    if (seat.status === 'closed') return false;
    if (seat.status === 'cleaning' && userRole === 'student') return false;
    if (seat.status === 'occupied' && userRole === 'student') return false;
    if (reservedSeatIds.includes(seat.id) && userRole === 'student') return false;
    return true;
  };

  const maxRow = Math.max(...floorSeats.map(s => s.row), 0);
  const maxCol = Math.max(...floorSeats.map(s => s.col), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{floor.name} - 座位分布图</h3>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-seat-available"></div>
            <span>可预约</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-seat-occupied"></div>
            <span>已占用</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-seat-cleaning"></div>
            <span>清洁中</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-seat-closed"></div>
            <span>已关闭</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div 
          className="grid gap-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${maxCol + 1}, minmax(40px, 1fr))`,
            maxWidth: `${(maxCol + 1) * 56}px`
          }}
        >
          {Array.from({ length: maxRow + 1 }).map((_, rowIndex) =>
            Array.from({ length: maxCol + 1 }).map((_, colIndex) => {
              const seat = floorSeats.find(s => s.row === rowIndex && s.col === colIndex);
              if (!seat) {
                return <div key={`empty-${rowIndex}-${colIndex}`} className="w-10 h-10 md:w-12 md:h-12"></div>;
              }

              const clickable = isSeatClickable(seat);

              return (
                <button
                  key={seat.id}
                  data-testid={`seat-${seat.code}`}
                  data-seat-id={seat.id}
                  data-seat-status={seat.status}
                  onClick={() => clickable && onSeatClick(seat)}
                  disabled={!clickable}
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-lg text-xs font-medium
                    flex items-center justify-center transition-all duration-200
                    ${getSeatColor(seat)}
                    ${clickable ? 'cursor-pointer transform hover:scale-105' : 'cursor-not-allowed'}
                    text-white shadow-sm
                  `}
                  title={`座位 ${seat.code} (${seat.area}) - ${seat.status}`}
                >
                  {seat.code}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        讲台方向 ↑
      </div>
    </div>
  );
};

export default HeatMap;
