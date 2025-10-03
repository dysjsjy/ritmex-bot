# useEffect 详解

`useEffect` 是 React Hooks 中最核心和常用的 Hook 之一，用于处理组件中的副作用（side effects）。

## 什么是副作用？

在 React 中，副作用指的是那些在组件渲染过程中无法直接完成的操作，比如：
- 数据获取
- 订阅事件
- 手动修改 DOM
- 设置定时器
- 日志记录

## 基本语法

```typescript
useEffect(() => {
  // 副作用逻辑
  
  return () => {
    // 清理函数（可选）
  };
}, [dependencies]); // 依赖数组
```

## 三种使用模式

### 1. 每次渲染后都执行

```typescript
useEffect(() => {
  // 每次组件渲染后都会执行
  console.log('组件已渲染');
});
```

### 2. 仅在挂载时执行一次

```typescript
useEffect(() => {
  // 仅在组件挂载时执行一次
  console.log('组件已挂载');
  
  return () => {
    // 组件卸载时执行清理
    console.log('组件已卸载');
  };
}, []); // 空依赖数组
```

### 3. 依赖特定状态变化时执行

```typescript
const [count, setCount] = useState(0);

useEffect(() => {
  // 当 count 发生变化时执行
  console.log(`Count 已更新为: ${count}`);
  
  document.title = `计数: ${count}`;
}, [count]); // 依赖 count 状态
```

## 清理函数（Cleanup）

清理函数用于防止内存泄漏和清理副作用：

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('定时器执行');
  }, 1000);
  
  return () => {
    clearInterval(timer); // 清理定时器
    console.log('定时器已清理');
  };
}, []);
```

## 常见使用场景

### 数据获取

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };
  
  fetchData();
}, []);
```

### 事件监听

```typescript
useEffect(() => {
  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

### 与第三方库集成

```typescript
useEffect(() => {
  const chart = new Chart(ctx, {
    type: 'line',
    data: chartData
  });
  
  return () => {
    chart.destroy(); // 清理图表实例
  };
}, [chartData]);
```

## 执行时机

- **挂载阶段**：组件首次渲染后执行
- **更新阶段**：依赖项发生变化时执行
- **卸载阶段**：组件卸载前执行清理函数

## 最佳实践

### 1. 明确依赖项

```typescript
// ✅ 正确：明确列出所有依赖
useEffect(() => {
  const result = computeValue(a, b);
  setValue(result);
}, [a, b, computeValue]);

// ❌ 错误：遗漏依赖
useEffect(() => {
  const result = computeValue(a, b);
  setValue(result);
}, [a]); // 遗漏了 b 和 computeValue
```

### 2. 避免无限循环

```typescript
// ❌ 错误：会导致无限循环
useEffect(() => {
  setCount(count + 1);
}, [count]);

// ✅ 正确：使用函数式更新
useEffect(() => {
  setCount(prev => prev + 1);
}, []); // 不需要依赖 count
```

### 3. 合理使用空依赖数组

```typescript
// ✅ 正确：仅在挂载时执行一次
useEffect(() => {
  // 初始化操作
}, []);

// ❌ 错误：需要依赖但使用了空数组
useEffect(() => {
  document.title = `Hello ${name}`;
}, []); // 应该依赖 name
```

## 与 useLayoutEffect 的区别

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 渲染完成后异步执行 | 渲染完成后、浏览器绘制前同步执行 |
| 使用场景 | 大多数副作用操作 | 需要同步更新 DOM 的场景 |
| 性能影响 | 较小 | 可能阻塞浏览器绘制 |

## 常见陷阱和解决方案

### 1. 过时的闭包

```typescript
// ❌ 问题：使用过时的 state
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // 总是打印初始值
  }, 1000);
  
  return () => clearInterval(timer);
}, []);

// ✅ 解决：使用 ref 或函数式更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => {
      console.log(prev); // 总是最新值
      return prev + 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

### 2. 异步操作处理

```typescript
// ✅ 正确：处理组件卸载后的异步操作
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    try {
      const data = await api.fetchData();
      if (isMounted) {
        setData(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };
  
  fetchData();
  
  return () => {
    isMounted = false;
  };
}, []);
```

## 总结

`useEffect` 是 React 函数组件中处理副件的标准方式。正确使用它需要：

1. **理解执行时机**：知道何时执行副作用和清理
2. **管理依赖关系**：正确设置依赖数组避免不必要的执行
3. **处理异步操作**：妥善处理组件生命周期内的异步任务
4. **进行资源清理**：防止内存泄漏和资源浪费

通过合理使用 `useEffect`，可以构建出高效、可靠的 React 应用程序。