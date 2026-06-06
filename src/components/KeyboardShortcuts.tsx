import React from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['↑', '↓', '←', '→'], description: '在热力图中导航选择座位' },
  { keys: ['Enter'], description: '确认选择当前座位 / 确认预约' },
  { keys: ['Esc'], description: '取消选择 / 关闭弹窗' },
  { keys: ['1', '2', '3'], description: '快速切换用户角色（学生/管理员/保洁）' },
  { keys: ['F'], description: '聚焦到筛选条件区域' },
  { keys: ['H'], description: '返回热力图顶部' },
  { keys: ['?'], description: '显示/隐藏键盘快捷键帮助' },
  { keys: ['Tab'], description: '在可交互元素间切换' },
  { keys: ['Shift + Tab'], description: '反向切换可交互元素' }
];

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="keyboard-shortcuts-modal"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">键盘快捷键</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="close-keyboard-shortcuts"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-1 flex-shrink-0">
                  {item.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      {keyIndex > 0 && <span className="text-gray-400 self-center">+</span>}
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm font-mono shadow-sm">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
                <span className="text-sm text-gray-700 self-center">{item.description}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              提示：按 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">?</kbd> 键可随时打开此帮助面板
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
