# MakerEngine中的长连接与短连接

长连接（WebSocket连接）
使用场景：实时市场数据订阅

账户信息推送：this.exchange.watchAccount() - 持续监听账户余额和持仓变化
订单状态推送：this.exchange.watchOrders() - 实时获取订单状态更新
深度数据推送：this.exchange.watchDepth() - 持续接收买卖盘深度数据
价格推送：this.exchange.watchTicker() - 实时获取最新价格信息
特点：

在bootstrap()方法中一次性建立，贯穿整个策略生命周期
通过回调函数实时处理数据更新
提供低延迟的市场数据，支持快速决策
短连接（HTTP/REST API调用）
使用场景：订单操作和状态查询

启动清理：this.exchange.cancelAllOrders() - 启动时清理历史挂单
订单撤销：safeCancelOrder() - 撤销不匹配的订单
订单挂单：placeOrder() - 创建新的限价单
市价平仓：marketClose() - 紧急情况下的市价平仓
特点：

在tick()循环中按需调用，每次调用建立新的连接
主要用于主动操作，如创建、撤销订单
受速率限制控制，避免过度频繁调用
相互配合机制
1. 数据流与决策流分离
长连接：负责实时数据输入（市场深度、账户状态、订单状态）
短连接：负责策略决策输出（订单操作）
2. 状态同步机制

typescript
Apply
// 长连接实时更新状态
this.exchange.watchOrders((orders) => {
    this.syncLocksWithOrders(orders);  // 同步订单锁状态
    this.openOrders = orders.filter(...);  // 更新活跃订单列表
});

// 短连接基于最新状态决策
await this.syncOrders(desired);  // 根据期望状态调整实际订单
3. 速率控制协调

typescript
Apply
// 长连接不受速率限制，持续接收数据
this.exchange.watchDepth(this.config.symbol, (depth) => {
    this.depthSnapshot = depth;  // 实时更新深度数据
});

// 短连接受速率限制，避免API限制
const decision = this.rateLimit.beforeCycle();
if (decision === "paused" || decision === "skip") {
    return;  // 跳过本次操作周期
}
4. 容错与重试机制
长连接断开：通过异常处理重新建立连接
短连接失败：记录错误日志，等待下次循环重试
数据一致性：通过状态快照确保决策基于最新数据
5. 实时响应与批量处理结合
长连接：提供毫秒级响应，支持快速止损和风险控制
短连接：在固定间隔内批量处理订单调整，提高效率
这种设计确保了策略既能快速响应市场变化，又能遵守交易所的API限制，实现了高效稳定的做市操作。