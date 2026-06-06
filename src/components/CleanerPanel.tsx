import React from 'react';
import { Floor, Seat } from '../types';

interface CleanerPanelProps {
  floor: Floor;
  seats: Seat[];
  onToggleCleaning: (seatId: string) => void;
}

const CleanerPanel: React.FC<CleanerPanelProps> = ({
  floor,
  seats,
  onToggleCleaning
}) => {
  const floorSeats = seats.filter(s => s.floorId === floor.id);
  const cleaningSeats = floorSeats.filter(s => s.status === 'cleaning');
  const areas = [...new Set(floorSeats.map(s => s.area))];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">保洁人员 - 清洁状态管理</h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-yellow-800">
            当前有 <span className="font-bold">{cleaningSeats.length}</span> 个座位标记为清洁中
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {areas.map(area => {
          const areaSeats = floorSeats.filter(s => s.area === area);
          return (
            <div key={area} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">{area}</h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {areaSeats.map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => onToggleCleaning(seat.id)}
                    className={`
                      py-2 px-1 rounded text-xs font-medium transition-colors
                      ${seat.status === 'cleaning'
                        ? 'bg-yellow-500 text-white'
                        : seat.status === 'closed'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                      }
                    `}
                    disabled={seat.status === 'closed'}
                  >
                    {seat.code}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>提示：点击座位可切换清洁状态。清洁中座位学生无法预约。</p>
      </div>
    </div>
  );
};

export default CleanerPanel;
