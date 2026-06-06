import React, { useState } from 'react';
import { Floor, Seat, ClosedArea } from '../types';
import { generateId } from '../utils/businessLogic';

interface AdminPanelProps {
  floor: Floor;
  seats: Seat[];
  closedAreas: ClosedArea[];
  onCloseArea: (area: ClosedArea) => void;
  onOpenArea: (areaId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  floor,
  seats,
  closedAreas,
  onCloseArea,
  onOpenArea
}) => {
  const [areaName, setAreaName] = useState('');
  const [areaReason, setAreaReason] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'close' | 'manage'>('close');

  const floorSeats = seats.filter(s => s.floorId === floor.id);
  const areas = [...new Set(floorSeats.map(s => s.area))];

  const handleAreaSelect = (area: string) => {
    const areaSeats = floorSeats.filter(s => s.area === area).map(s => s.id);
    setSelectedSeats(prev => 
      prev.length === areaSeats.length && areaSeats.every(id => prev.includes(id))
        ? []
        : areaSeats
    );
  };

  const handleCloseArea = () => {
    if (!areaName || selectedSeats.length === 0) return;
    
    const newArea: ClosedArea = {
      id: generateId(),
      floorId: floor.id,
      name: areaName,
      seatIds: selectedSeats,
      reason: areaReason,
      createdAt: new Date().toISOString()
    };
    
    onCloseArea(newArea);
    setAreaName('');
    setAreaReason('');
    setSelectedSeats([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">楼层管理员 - 关闭区域管理</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('close')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'close' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          关闭区域
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'manage' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          管理已关闭
        </button>
      </div>

      {activeTab === 'close' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">快速选择区域</label>
            <div className="flex flex-wrap gap-2">
              {areas.map(area => (
                <button
                  key={area}
                  onClick={() => handleAreaSelect(area)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    floorSeats.filter(s => s.area === area).every(s => selectedSeats.includes(s.id))
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">已选座位数</label>
            <p className="text-lg font-bold text-gray-800">{selectedSeats.length} 个座位</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">区域名称</label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="请输入区域名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关闭原因</label>
            <input
              type="text"
              value={areaReason}
              onChange={(e) => setAreaReason(e.target.value)}
              placeholder="请输入关闭原因"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleCloseArea}
            disabled={!areaName || selectedSeats.length === 0}
            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
              !areaName || selectedSeats.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            确认关闭选中区域
          </button>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-3">
          {closedAreas.filter(ca => ca.floorId === floor.id).length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无已关闭区域</p>
          ) : (
            closedAreas.filter(ca => ca.floorId === floor.id).map(area => (
              <div key={area.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{area.name}</h4>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">已关闭</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">原因：{area.reason || '未填写'}</p>
                <p className="text-sm text-gray-500 mb-3">涉及 {area.seatIds.length} 个座位</p>
                <button
                  onClick={() => onOpenArea(area.id)}
                  className="w-full py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                >
                  开放此区域
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
