import React from 'react';
import { Seat, SeatStatus } from '../types';

type ExampleType = 'normal' | 'abnormal' | 'processed';

interface HeatMapExamplesProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToList: () => void;
}

const generateExampleSeats = (type: ExampleType): Seat[] => {
  const seats: Seat[] = [];
  const rows = 4;
  const cols = 6;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let status: SeatStatus = 'available';

      if (type === 'normal') {
        if ((row + col) % 3 === 0) status = 'occupied';
        else if ((row + col) % 7 === 0) status = 'cleaning';
      } else if (type === 'abnormal') {
        if ((row + col) % 2 === 0) status = 'occupied';
        else if ((row + col) % 5 === 0) status = 'closed';
        else if (row === 1 && col === 2) status = 'cleaning';
        else if (row === 2 && col === 4) status = 'cleaning';
      } else if (type === 'processed') {
        if ((row + col) % 4 === 0) status = 'occupied';
        else status = 'available';
      }

      seats.push({
        id: `example-${type}-${row}-${col}`,
        floorId: `example-${type}`,
        code: `${String.fromCharCode(65 + row)}${col + 1}`,
        row,
        col,
        status,
        area: type === 'normal' ? '示例区A' : type === 'abnormal' ? '示例区B' : '示例区C'
      });
    }
  }
  return seats;
};

const exampleData = {
  normal: {
    title: '正常状态样例',
    description: '座位分布均匀，大部分座位可预约',
    seats: generateExampleSeats('normal'),
    tag: 'bg-green-100 text-green-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  abnormal: {
    title: '异常状态样例',
    description: '存在大量占用和关闭座位，需管理员处理',
    seats: generateExampleSeats('abnormal'),
    tag: 'bg-red-100 text-red-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  processed: {
    title: '已处理状态样例',
    description: '异常已处理，座位恢复正常可用状态',
    seats: generateExampleSeats('processed'),
    tag: 'bg-blue-100 text-blue-800',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  }
};

const HeatMapExamples: React.FC<HeatMapExamplesProps> = ({ isOpen, onClose, onBackToList }) => {
  const [activeExample, setActiveExample] = React.useState<ExampleType>('normal');

  if (!isOpen) return null;

  const currentExample = exampleData[activeExample];
  const maxRow = Math.max(...currentExample.seats.map(s => s.row), 0);
  const maxCol = Math.max(...currentExample.seats.map(s => s.col), 0);

  const getSeatColor = (seat: Seat): string => {
    if (seat.status === 'closed') return 'bg-seat-closed';
    if (seat.status === 'cleaning') return 'bg-seat-cleaning';
    if (seat.status === 'occupied') return 'bg-seat-occupied';
    return 'bg-seat-available';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="heatmap-examples-modal"
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">热力图样例展示</h3>
              <p className="text-sm text-gray-500 mt-1">查看不同状态下的座位分布样例</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onBackToList}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                data-testid="back-to-list-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回列表
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="close-examples"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(exampleData) as ExampleType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveExample(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeExample === type
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`example-tab-${type}`}
              >
                {exampleData[type].icon}
                {exampleData[type].title}
              </button>
            ))}
          </div>

          <div className={`p-4 rounded-lg ${currentExample.tag} mb-4`}>
            <div className="flex items-center gap-2">
              {currentExample.icon}
              <span className="font-medium">{currentExample.title}</span>
            </div>
            <p className="text-sm mt-1 opacity-80">{currentExample.description}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 md:p-6">
            <div className="flex flex-wrap gap-3 text-xs mb-4 justify-center">
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

            <div className="overflow-x-auto">
              <div 
                className="grid gap-2 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${maxCol + 1}, minmax(36px, 1fr))`,
                  maxWidth: `${(maxCol + 1) * 52}px`
                }}
              >
                {Array.from({ length: maxRow + 1 }).map((_, rowIndex) =>
                  Array.from({ length: maxCol + 1 }).map((_, colIndex) => {
                    const seat = currentExample.seats.find(s => s.row === rowIndex && s.col === colIndex);
                    if (!seat) {
                      return <div key={`empty-${rowIndex}-${colIndex}`} className="w-9 h-9 md:w-10 md:h-10"></div>;
                    }
                    return (
                      <div
                        key={seat.id}
                        className={`
                          w-9 h-9 md:w-10 md:h-10 rounded-lg text-xs font-medium
                          flex items-center justify-center
                          ${getSeatColor(seat)}
                          text-white shadow-sm
                        `}
                        title={`座位 ${seat.code} - ${seat.status}`}
                        data-testid={`example-seat-${seat.code}`}
                      >
                        {seat.code}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              讲台方向 ↑
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={onBackToList}
              className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              回到原列表查询
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              关闭样例
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMapExamples;
