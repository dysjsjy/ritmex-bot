# React重新渲染机制详解

## 什么是重新渲染？

**重新渲染（Re-rendering）** 是React的核心机制，指的是当组件的状态或属性发生变化时，React会重新调用组件函数来生成新的UI。

### 重新渲染的本质
- **不是DOM的直接更新**：重新渲染首先发生在虚拟DOM层面
- **函数重新执行**：组件函数会被重新调用
- **状态保持**：`useState`等Hook会记住之前的状态值
- **对比更新**：React会比较新旧虚拟DOM，只更新实际变化的部分

## 什么情况下会触发重新渲染？

### 1. 状态变化（State Changes）
```typescript
const [count, setCount] = useState(0);

// 以下操作会触发重新渲染：
setCount(1);                    // 状态值改变
setCount(prev => prev + 1);     // 函数式更新
```

### 2. 属性变化（Props Changes）
```typescript
// 父组件传递新的props
<ChildComponent name="新名称" />
```

### 3. 上下文变化（Context Changes）
```typescript
const value = useContext(MyContext);
// 当Context.Provider的value变化时，所有使用该Context的组件都会重新渲染
```

### 4. 父组件重新渲染
```typescript
// 如果父组件重新渲染，默认情况下所有子组件也会重新渲染
function Parent() {
  const [state, setState] = useState(0);
  return (
    <div>
      <Child1 />  {/* 会重新渲染 */}
      <Child2 />  {/* 会重新渲染 */}
    </div>
  );
}
```

## 什么情况下不会触发重新渲染？

### 1. 状态值相同
```typescript
const [count, setCount] = useState(0);

// 以下操作不会触发重新渲染：
setCount(0);                    // 新值与旧值相同
setCount(prev => prev);         // 返回相同的值
```

### 2. 使用React.memo的组件（props未变化）
```typescript
const MemoizedComponent = React.memo(MyComponent);
// 只有当props真正变化时才会重新渲染
```

### 3. 使用useMemo/useCallback优化
```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => { doSomething(a, b); }, [a, b]);
// 依赖项未变化时，不会重新计算
```

## 重新渲染的执行流程

### 1. 触发阶段
```typescript
// 用户交互或数据变化触发状态更新
setSelected(strategy);  // ← 触发点
```

### 2. 调度阶段
- React将更新加入调度队列
- 决定何时执行重新渲染（可能是批量处理）

### 3. 渲染阶段
```typescript
function App() {
  // 整个函数会被重新调用
  const [selected, setSelected] = useState(null);
  
  // 所有Hook都会重新执行，但会记住之前的状态
  const copyright = useMemo(() => loadCopyrightFragments(), []);
  
  // 条件渲染会重新评估
  if (selected) {
    return <SelectedComponent />;  // ← 这里会执行
  }
  
  return <div>菜单界面</div>;
}
```

### 4. 提交阶段
- React比较新旧虚拟DOM
- 只更新实际变化的真实DOM
- 执行useLayoutEffect

### 5. 清理阶段
- 执行useEffect的清理函数（如果依赖项变化）
- 执行新的useEffect

## 实际案例分析

### 案例：策略选择界面
```typescript
export function App() {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<StrategyOption | null>(null);

  useInput((input, key) => {
    if (selected) return;
    
    if (key.upArrow) {
      setCursor(prev => (prev - 1 + STRATEGIES.length) % STRATEGIES.length);
      // ↑ 触发重新渲染：cursor状态变化
    } else if (key.return) {
      const strategy = STRATEGIES[cursor];
      setSelected(strategy);
      // ↑ 触发重新渲染：selected状态变化
    }
  });

  // 重新渲染时，这个条件会重新评估
  if (selected) {
    const Selected = selected.component;
    return <Selected onExit={() => setSelected(null)} />;
    // ↑ 只有selected不为null时才会执行
  }

  return <div>策略选择菜单</div>;
}
```

### 执行顺序说明：
1. **用户按回车** → `useInput`回调执行
2. **设置状态** → `setSelected(strategy)`
3. **React调度重新渲染** → 将App组件加入渲染队列
4. **重新调用App函数** → 整个函数重新执行
5. **条件评估** → `if (selected)`现在为true
6. **返回新组件** → 渲染`<SelectedComponent />`
7. **DOM更新** → React只更新变化的部分

## 性能优化技巧

### 1. 避免不必要的重新渲染
```typescript
// 不好的做法：每次渲染都创建新对象
function Component() {
  const config = { theme: 'dark' };  // 每次渲染都创建新对象
  return <Child config={config} />;
}

// 好的做法：使用useMemo
function Component() {
  const config = useMemo(() => ({ theme: 'dark' }), []);
  return <Child config={config} />;
}
```

### 2. 使用React.memo
```typescript
const ExpensiveComponent = React.memo(function({ data }) {
  // 只有当data变化时才会重新渲染
  return <div>{expensiveCalculation(data)}</div>;
});
```

### 3. 合理使用依赖数组
```typescript
useEffect(() => {
  // 只有count变化时才执行
  document.title = `Count: ${count}`;
}, [count]);  // ← 依赖数组
```

## 常见误区

### 误区1：重新渲染等于性能问题
**事实**：虚拟DOM的对比机制很高效，大多数重新渲染不会导致性能问题。

### 误区2：所有子组件都会重新渲染
**事实**：使用React.memo或合理的状态设计可以避免不必要的子组件渲染。

### 误区3：useState设置相同值不会触发渲染
**事实**：React会进行浅比较，如果值相同（使用Object.is）就不会触发重新渲染。

## 总结

React的重新渲染机制是其响应式编程的核心：
- **声明式**：你描述UI应该是什么样子，而不是如何更新
- **自动**：状态变化自动触发UI更新
- **高效**：通过虚拟DOM对比最小化实际DOM操作
- **可预测**：遵循明确的规则，便于调试和优化

理解重新渲染机制有助于编写更高效、更可维护的React应用程序。