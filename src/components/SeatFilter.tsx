import React from 'react';
import { Building, TimeSlot, SeatStatus } from '../types';

interface SeatFilterProps {
  buildings: Building[];
  selectedBuildingId: string;
  selectedFloorId: string;
  selectedDate: string;
  selectedTimeSlotId: string;
  timeSlots: TimeSlot[];
  statusFilter: SeatStatus | 'all';
  areaFilter: string;
  areas: string[];
  onBuildingChange: (id: string) => void;
  onFloorChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onTimeSlotChange: (id: string) => void;
  onStatusFilterChange: (status: SeatStatus | 'all') => void;
  onAreaFilterChange: (area: string) => void;
  onKeyboardShortcutsClick?: () => void;
  onHeatMapExamplesClick?: () => void;
}

const SeatFilter: React.FC<SeatFilterProps> = ({
  buildings,
  selectedBuildingId,
  selectedFloorId,
  selectedDate,
  selectedTimeSlotId,
  timeSlots,
  statusFilter,
  areaFilter,
  areas,
  onBuildingChange,
  onFloorChange,
  onDateChange,
  onTimeSlotChange,
  onStatusFilterChange,
  onAreaFilterChange,
  onKeyboardShortcutsClick,
  onHeatMapExamplesClick
}) => {
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  const floors = selectedBuilding?.floors || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4" data-testid="seat-filter-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">筛选条件</h3>
        <div className="flex gap-2">
          {onKeyboardShortcutsClick && (
            <button
              onClick={onKeyboardShortcutsClick}
              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              data-testid="keyboard-shortcuts-btn"
              title="键盘快捷键 (?)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              键盘操作
              <kbd className="px-1 py-0.5 bg-blue-100 rounded text-[10px]">?</kbd>
            </button>
          )}
          {onHeatMapExamplesClick && (
            <button
              onClick={onHeatMapExamplesClick}
              className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5"
              data-testid="heatmap-examples-btn"
              title="查看热力图样例 (E)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              热力图样例
              <kbd className="px-1 py-0.5 bg-green-100 rounded text-[10px]">E</kbd>
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">楼栋</label>
          <select
            value={selectedBuildingId}
            onChange={(e) => onBuildingChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">楼层</label>
          <select
            value={selectedFloorId}
            onChange={(e) => onFloorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {floors.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">时段</label>
          <select
            value={selectedTimeSlotId}
            onChange={(e) => onTimeSlotChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeSlots.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">座位状态</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as SeatStatus | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="available">可预约</option>
            <option value="occupied">已占用</option>
            <option value="cleaning">清洁中</option>
            <option value="closed">已关闭</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">区域</label>
          <select
            value={areaFilter}
            onChange={(e) => onAreaFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部区域</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SeatFilter;
