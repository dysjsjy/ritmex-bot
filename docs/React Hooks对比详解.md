# React Hooks对比详解：useState vs useMemo

## 概述

React Hooks 是函数组件中管理状态和副作用的工具。`useState` 和 `useMemo` 是两个最常用的Hook，它们有不同的用途和工作方式。

## useState Hook详解

### 基本语法
```typescript
const [state, setState] = useState(initialValue);
```

### 重载形式

#### 1. 直接值初始化
```typescript
// 基本类型
const [count, setCount] = useState(0);
const [name, setName] = useState('');

// 对象类型
const [user, setUser] = useState({ name: '', age: 0 });
```

#### 2. 惰性初始化（函数形式）
```typescript
// 复杂计算的初始值
const [data, setData] = useState(() => {
  const expensiveValue = calculateExpensiveValue();
  return expensiveValue;
});

// 从localStorage读取初始值
const [settings, setSettings] = useState(() => {
  const saved = localStorage.getItem('settings');
  return saved ? JSON.parse(saved) : defaultSettings;
});
```

#### 3. 函数式更新
```typescript
// 基于前一个状态更新
setCount(prevCount => prevCount + 1);
setUser(prevUser => ({ ...prevUser, age: prevUser.age + 1 }));
```

### 使用场景
- 管理组件内部状态
- 响应用户交互
- 跟踪UI状态变化

## useMemo Hook详解

### 基本语法
```typescript
const memoizedValue = useMemo(() => computeValue(), dependencies);
```

### 重载形式

#### 1. 无依赖（只计算一次）
```typescript
const config = useMemo(() => ({ theme: 'dark', version: '1.0' }), []);
```

#### 2. 有依赖（依赖变化时重新计算）
```typescript
const expensiveValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);
```

#### 3. 复杂对象缓存
```typescript
const formattedData = useMemo(() => {
  return data.map(item => ({
    ...item,
    formattedDate: formatDate(item.timestamp),
    status: getStatus(item)
  }));
}, [data]);
```

### 使用场景
- 昂贵的计算缓存
- 避免不必要的重新渲染
- 稳定对象引用

## 核心区别对比

| 特性 | useState | useMemo |
|------|----------|---------|
| **目的** | 管理状态 | 优化性能 |
| **返回值** | 状态值和更新函数 | 记忆化的值 |
| **触发条件** | 显式调用setState | 依赖项变化 |
| **重新执行** | 每次渲染都可用 | 依赖变化时才重新计算 |
| **引用稳定性** | 状态值可能变化 | 返回值引用稳定 |

## 实际案例解析

### 案例：策略选择界面
```typescript
export function App() {
  // useState: 管理交互状态
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<StrategyOption | null>(null);
  
  // useMemo: 缓存计算结果
  const copyright = useMemo(() => loadCopyrightFragments(), []);
  const integrityOk = useMemo(() => verifyCopyrightIntegrity(), []);

  // 事件处理
  useInput((input, key) => {
    if (selected) return;
    
    if (key.upArrow) {
      // useState的函数式更新
      setCursor(prev => (prev - 1 + STRATEGIES.length) % STRATEGIES.length);
    } else if (key.return) {
      const strategy = STRATEGIES[cursor];
      setSelected(strategy);
    }
  });

  if (selected) {
    const Selected = selected.component;
    return <Selected onExit={() => setSelected(null)} />;
  }

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      {/* useMemo缓存的值 */}
      <Text color="gray">{copyright.bannerText}</Text>
      
      {/* 渲染策略列表 */}
      {STRATEGIES.map((strategy, index) => {
        const active = index === cursor; // useState管理的状态
        return (
          <Box key={strategy.id} flexDirection="column" marginBottom={1}>
            <Text color={active ? "greenBright" : undefined}>
              {active ? "➤" : "  "} {strategy.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
```

## 性能优化技巧

### 1. 合理使用useState
```typescript
// 不好的做法：不必要的状态拆分
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');

// 好的做法：相关状态合并
const [user, setUser] = useState({ firstName: '', lastName: '' });
```

### 2. 明智使用useMemo
```typescript
// 不需要useMemo：简单计算
const fullName = `${firstName} ${lastName}`;

// 需要useMemo：昂贵计算
const expensiveResult = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// 需要useMemo：稳定对象引用
const config = useMemo(() => ({ theme: 'dark' }), []);
```

### 3. 组合使用
```typescript
function UserProfile({ userId }) {
  // useState管理UI状态
  const [isEditing, setIsEditing] = useState(false);
  
  // useMemo缓存数据转换
  const userData = useMemo(() => {
    return fetchUserData(userId);
  }, [userId]);
  
  const formattedData = useMemo(() => {
    return formatUserData(userData);
  }, [userData]);
  
  return (
    <div>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? '保存' : '编辑'}
      </button>
      <UserInfo data={formattedData} />
    </div>
  );
}
```

## 常见误区

### 误区1：过度使用useMemo
```typescript
// 不必要的useMemo
const name = useMemo(() => 'John', []);

// 直接使用即可
const name = 'John';
```

### 误区2：useState用于计算
```typescript
// 错误：用useState存储计算结果
const [calculated, setCalculated] = useState(0);
useEffect(() => {
  setCalculated(a + b);
}, [a, b]);

// 正确：直接计算或使用useMemo
const calculated = a + b;
// 或对于复杂计算
const calculated = useMemo(() => complexCalc(a, b), [a, b]);
```

### 误区3：忽略依赖数组
```typescript
// 错误的依赖数组
const value = useMemo(() => a + b, []); // 缺少依赖

// 正确的依赖数组
const value = useMemo(() => a + b, [a, b]);
```

## 最佳实践

1. **useState用于**：用户交互、UI状态、表单数据
2. **useMemo用于**：昂贵计算、稳定引用、避免不必要渲染
3. **优先考虑可读性**：不要过度优化简单的计算
4. **合理拆分状态**：相关状态放在一起，独立状态分开管理
5. **使用TypeScript**：为状态和记忆化值提供明确的类型

## 总结

- `useState` 是**状态管理**工具，用于存储和更新组件状态
- `useMemo` 是**性能优化**工具，用于缓存计算结果和稳定引用
- 两者可以组合使用，但目的不同
- 理解它们的区别有助于编写更高效、更可维护的React代码

通过合理使用这两个Hook，你可以构建出既响应迅速又性能优异的React应用程序。