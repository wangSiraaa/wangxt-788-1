import React from 'react';

interface StatisticsProps {
  total: number;
  occupied: number;
  available: number;
  cleaning: number;
  closed: number;
  occupancyRate: number;
}

const Statistics: React.FC<StatisticsProps> = ({
  total,
  occupied,
  available,
  cleaning,
  closed,
  occupancyRate
}) => {
  const statItems = [
    { label: '总座位数', value: total, color: 'bg-gray-100 text-gray-800' },
    { label: '已占用', value: occupied, color: 'bg-red-100 text-red-800' },
    { label: '可预约', value: available, color: 'bg-green-100 text-green-800' },
    { label: '清洁中', value: cleaning, color: 'bg-yellow-100 text-yellow-800' },
    { label: '已关闭', value: closed, color: 'bg-gray-200 text-gray-600' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">占用统计</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">占用率：</span>
          <span className={`text-lg font-bold ${
            occupancyRate >= 80 ? 'text-red-600' : 
            occupancyRate >= 50 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {occupancyRate}%
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${
            occupancyRate >= 80 ? 'bg-red-500' : 
            occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${occupancyRate}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statItems.map((item, index) => (
          <div key={index} className={`${item.color} rounded-lg p-3 text-center`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs mt-1 opacity-80">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
