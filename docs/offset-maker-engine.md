# OffsetMakerEngine 文档

## 概述

`OffsetMakerEngine` 是一个偏移做市引擎类，负责实现基于深度偏移的做市策略。该引擎通过监控市场深度、账户状态和订单信息，自动执行买卖挂单操作，实现做市功能。

## 文件位置

- **文件路径**: `src/core/offset-maker-engine.ts`
- **类名**: `OffsetMakerEngine`
- **导出**: 默认导出

## 核心接口

### DesiredOrder 接口
```typescript
interface DesiredOrder {
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  reduceOnly: boolean;
}
```

### OffsetMakerEngineSnapshot 接口
```typescript
export interface OffsetMakerEngineSnapshot extends MakerEngineSnapshot {
  buyDepthSum10: number;
  sellDepthSum10: number;
  depthImbalance: "balanced" | "buy_dominant" | "sell_dominant";
  skipBuySide: boolean;
  skipSellSide: boolean;
}
```

## 类结构

### 构造函数
```typescript
constructor(private readonly config: MakerConfig, private readonly exchange: ExchangeAdapter)
```

### 主要属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `accountSnapshot` | `AsterAccountSnapshot \| null` | 账户快照 |
| `depthSnapshot` | `AsterDepth \| null` | 市场深度快照 |
| `tickerSnapshot` | `AsterTicker \| null` | 价格快照 |
| `openOrders` | `AsterOrder[]` | 当前挂单列表 |
| `locks` | `OrderLockMap` | 订单锁管理 |
| `timers` | `OrderTimerMap` | 订单计时器 |
| `pending` | `OrderPendingMap` | 待处理订单 |
| `tradeLog` | `ReturnType<typeof createTradeLog>` | 交易日志 |
| `listeners` | `Map<MakerEvent, Set<MakerListener>>` | 事件监听器 |

### 核心方法

#### 生命周期管理
- `start(): void` - 启动引擎
- `stop(): void` - 停止引擎

#### 事件管理
- `on(event: MakerEvent, handler: MakerListener): void` - 注册事件监听器
- `off(event: MakerEvent, handler: MakerListener): void` - 移除事件监听器

#### 状态获取
- `getSnapshot(): OffsetMakerEngineSnapshot` - 获取当前引擎快照

### 私有方法（核心逻辑）

#### 初始化流程
- `private bootstrap(): void` - 初始化订阅和数据监听
- `private syncLocksWithOrders(orders: AsterOrder[]): void` - 同步订单锁状态

#### 主循环逻辑
- `private async tick(): Promise<void>` - 主循环处理逻辑
- `private isReady(): boolean` - 检查引擎是否就绪

#### 深度分析
- `private evaluateDepth(depth: AsterDepth): {...}` - 分析市场深度状态
- `private async handleImbalanceExit(...): Promise<boolean>` - 处理深度不平衡退出

#### 订单管理
- `private async syncOrders(targets: DesiredOrder[]): Promise<void>` - 同步订单状态
- `private async flushOrders(): Promise<void>` - 清空所有订单

#### 风险管理
- `private async checkRisk(...): Promise<void>` - 风险检查和止损处理
- `private async enforceRateLimitStop(): Promise<void>` - 限频强制平仓

#### 启动清理
- `private async ensureStartupOrderReset(): Promise<boolean>` - 启动时订单清理

#### 状态更新
- `private emitUpdate(): void` - 触发状态更新事件
- `private buildSnapshot(): OffsetMakerEngineSnapshot` - 构建引擎快照

## 核心逻辑流程

### 1. 初始化阶段
1. 订阅账户、订单、深度、价格等数据流
2. 设置事件监听器
3. 启动定时器执行主循环

### 2. 主循环处理
1. 检查限频状态
2. 验证数据就绪状态
3. 分析市场深度
4. 处理深度不平衡情况
5. 计算期望订单
6. 同步订单状态
7. 执行风险检查
8. 触发状态更新

### 3. 订单策略
- **零持仓时**: 在买一价下方和卖一价上方挂单
- **有持仓时**: 优先平仓，再考虑开仓
- **深度不平衡**: 自动执行市价平仓

### 4. 风险管理
- 止损机制：基于配置的损失限制
- 限频保护：遇到限频时强制平仓
- 异常处理：完善的错误日志记录

## 依赖模块

- `../config` - 配置类型定义
- `../exchanges/adapter` - 交易所适配器
- `../exchanges/types` - 交易所数据类型
- `../utils/*` - 各种工具函数
- `./order-coordinator` - 订单协调器
- `./lib/*` - 核心库模块

## 特点

1. **实时性**: 基于WebSocket推送的实时数据
2. **容错性**: 完善的错误处理和重试机制
3. **可观测性**: 详细的交易日志和状态快照
4. **可配置性**: 支持多种策略参数配置
5. **模块化**: 清晰的职责分离和模块设计

## 使用示例

```typescript
const engine = new OffsetMakerEngine(config, exchange);
engine.on('update', (snapshot) => {
  console.log('引擎状态更新:', snapshot);
});
engine.start();
```

## 注意事项

- 引擎需要交易所API的实时数据订阅支持
- 建议在生产环境中启用完整的日志记录
- 定期监控引擎状态和性能指标
- 注意配置合理的风险控制参数