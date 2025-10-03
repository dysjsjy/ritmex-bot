// useState 和 useMemo 本质区别演示
// 证明它们不能互相替代

import React, { useState, useMemo } from 'react';

// 场景1：useState 能做，useMemo 不能做
export function StateVsMemoDemo() {
  // useState 可以存储和更新状态
  const [count, setCount] = useState(0);
  
  // 尝试用 useMemo "替代" useState - 这是错误的！
  // const [memoCount, setMemoCount] = useMemo(() => {
  //   // useMemo 没有 setter 函数，无法更新状态！
  //   return [0, () => {}]; // 这行不通
  // }, []);

  // useMemo 只能缓存计算结果
  const doubledCount = useMemo(() => count * 2, [count]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>useState vs useMemo 本质区别演示</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>useState 的功能（useMemo 无法实现）</h3>
        <p>当前计数: {count}</p>
        <button onClick={() => setCount(count + 1)}>
          增加计数（只有useState能做到）
        </button>
        <p style={{ color: 'red', fontSize: '14px' }}>
          ❌ useMemo 无法提供 setter 函数来更新状态
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>useMemo 的功能（useState 不擅长）</h3>
        <p>计算后的值: {doubledCount}</p>
        <p style={{ color: 'green', fontSize: '14px' }}>
          ✅ useMemo 缓存计算结果，避免重复计算
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #87ceeb'
      }}>
        <h3>💡 关键区别总结</h3>
        <ul>
          <li><strong>useState</strong>: 存储和更新状态（有setter函数）</li>
          <li><strong>useMemo</strong>: 缓存计算结果（没有setter函数）</li>
          <li><strong>useState</strong> 触发重新渲染</li>
          <li><strong>useMemo</strong> 防止不必要的重新渲染</li>
        </ul>
      </div>
    </div>
  );
}

// 场景2：实际应用中的分工合作
export function CollaborationDemo() {
  // useState 管理用户输入状态
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<string[]>([]);

  // useMemo 缓存处理结果
  const filteredItems = useMemo(() => {
    console.log('过滤项目...');
    return items.filter(item => 
      item.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [items, inputValue]);

  // useMemo 缓存配置对象
  const config = useMemo(() => ({
    maxItems: 10,
    theme: 'light',
    allowDuplicates: false
  }), []);

  const addItem = () => {
    if (inputValue && !config.allowDuplicates && items.includes(inputValue)) {
      alert('重复项目不允许！');
      return;
    }
    
    if (items.length >= config.maxItems) {
      alert('达到最大项目数！');
      return;
    }
    
    setItems(prev => [...prev, inputValue]);
    setInputValue('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>分工合作示例</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          value={inputValue}
          // @ts-ignore
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入项目"
          style={{ marginRight: '10px' }}
        />
        <button onClick={addItem}>添加项目</button>
        <span style={{ marginLeft: '10px', color: 'gray' }}>
          最大项目数: {config.maxItems}
        </span>
      </div>

      <div>
        <h4>过滤后的项目 ({filteredItems.length} 个):</h4>
        <ul>
          {filteredItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#fff0f0', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h4>🔍 观察控制台</h4>
        <p>每次输入时，"过滤项目..." 只在输入或项目列表变化时打印</p>
        <p>这说明 useMemo 在正确工作，避免了不必要的重复计算</p>
      </div>
    </div>
  );
}

// 场景3：错误用法演示
export function WrongUsageDemo() {
  // ❌ 错误：试图用 useMemo 替代 useState
  const wrongCount = useMemo(() => {
    // 这里无法更新状态！
    return 0;
  }, []);

  // ❌ 错误：试图用 useState 缓存昂贵计算
  const [expensiveValue, setExpensiveValue] = useState(() => {
    console.log('昂贵的初始化...');
    return heavyCalculation(); // 每次渲染都会执行！
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>❌ 错误用法演示</h2>
      
      <div style={{ color: 'red', marginBottom: '20px' }}>
        <p><strong>错误1:</strong> 无法用 useMemo 更新状态</p>
        <p>wrongCount: {wrongCount} ← 这个值永远无法改变！</p>
        
        <p><strong>错误2:</strong> useState 不适合缓存计算</p>
        <p>检查控制台，"昂贵的初始化..." 会在每次渲染时打印</p>
      </div>
    </div>
  );
}

// 模拟昂贵计算
function heavyCalculation() {
  // 模拟复杂计算
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.random();
  }
  return result;
}

export function App() {
  return (
    <div>
      <StateVsMemoDemo />
      <hr style={{ margin: '40px 0' }} />
      <CollaborationDemo />
      <hr style={{ margin: '40px 0' }} />
      <WrongUsageDemo />
    </div>
  );
}