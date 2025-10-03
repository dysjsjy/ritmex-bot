// React Hooks 实战示例
// 展示 useState 和 useMemo 的配合使用

import React, { useState, useMemo } from 'react';

// 模拟昂贵计算函数
const expensiveCalculation = (data: number[]) => {
  console.log('执行昂贵计算...');
  return data.reduce((sum, num) => sum + num, 0) / data.length;
};

// 模拟数据格式化
const formatData = (numbers: number[]) => {
  return numbers.map(num => ({
    value: num,
    formatted: `$${num.toFixed(2)}`,
    isPositive: num > 0
  }));
};

export function FinancialDashboard() {
  // useState: 管理UI状态和用户交互
  const [data, setData] = useState<number[]>([10, 20, 30, 40, 50]);
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState('');

  // useMemo: 缓存昂贵计算结果
  const average = useMemo(() => expensiveCalculation(data), [data]);
  
  // useMemo: 缓存格式化数据（避免每次渲染重新格式化）
  const formattedData = useMemo(() => formatData(data), [data]);
  
  // useMemo: 缓存配置对象（稳定引用）
  const config = useMemo(() => ({
    currency: 'USD',
    precision: 2,
    showDetails: true
  }), []);

  // 事件处理函数
  const handleAddValue = () => {
    if (newValue) {
      const num = parseFloat(newValue);
      if (!isNaN(num)) {
        // useState的函数式更新
        setData(prev => [...prev, num]);
        setNewValue('');
      }
    }
  };

  const handleReset = () => {
    // useState的直接值更新
    setData([10, 20, 30]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>财务数据仪表板</h2>
      
      {/* 显示useMemo缓存的计算结果 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>统计信息</h3>
        <p>平均值: {average.toFixed(2)}</p>
        <p>数据点数: {data.length}</p>
        <p>配置: {config.currency} (精度: {config.precision})</p>
      </div>

      {/* 显示格式化数据 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>数据明细</h3>
        {formattedData.map((item, index) => (
          <div key={index} style={{ 
            color: item.isPositive ? 'green' : 'red',
            margin: '5px 0'
          }}>
            {item.formatted} {item.isPositive ? '↑' : '↓'}
          </div>
        ))}
      </div>

      {/* 交互控件 - 使用useState管理状态 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '完成编辑' : '添加数据'}
        </button>
        
        {isEditing && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="number"
              value={newValue}
              // @ts-ignore
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewValue(e.target.value)}
              placeholder="输入数值"
              style={{ marginRight: '10px' }}
            />
            <button onClick={handleAddValue}>添加</button>
            <button onClick={handleReset} style={{ marginLeft: '10px' }}>
              重置
            </button>
          </div>
        )}
      </div>

      {/* 性能提示 */}
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <strong>性能说明:</strong>
        <ul>
          <li>平均值计算使用了 useMemo，只在数据变化时重新计算</li>
          <li>数据格式化使用了 useMemo，避免每次渲染重新格式化</li>
          <li>配置对象使用了 useMemo，保持稳定引用</li>
          <li>UI状态使用 useState 管理，响应式更新</li>
        </ul>
      </div>
    </div>
  );
}

// 使用示例
export function App() {
  return <FinancialDashboard />;
}