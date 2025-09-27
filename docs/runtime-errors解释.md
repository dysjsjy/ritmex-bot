# runtime-errors
runtime-errors.ts 文件解析
文件概述
runtime-errors.ts 是一个用于设置全局错误处理器的 TypeScript 模块，主要功能是捕获和记录各种运行时错误，确保应用程序中的未处理异常、Promise 拒绝等问题能够被记录下来，便于调试和问题排查。

核心功能和结构
1. 导入和类型定义

/d:/Project/ritmex-bot/src/runtime-errors.ts
Apply
import { extractMessage } from "./utils/errors";

declare const Bun: { on?: (event: string, listener: (payload: any) => void) => void } | undefined;

type Handler = (error: unknown) => void;

let installed = false;
const lastLogAt = new Map<string, number>();
导入了 extractMessage 工具函数用于提取错误信息
声明了 Bun 对象类型（Bun 是一个现代 JavaScript 运行时）
定义了 Handler 类型用于错误处理函数
维护了 installed 标志防止重复安装处理器
使用 lastLogAt Map 记录最后一次记录错误的时间，避免短时间内重复记录相同错误
2. 错误日志记录函数

/d:/Project/ritmex-bot/src/runtime-errors.ts
Apply
function logRuntimeIssue(kind: string, error: unknown): void {
  const message = extractMessage(error);
  const now = Date.now();
  const key = `${kind}:${message}`;
  const previous = lastLogAt.get(key) ?? 0;
  if (now - previous < 1000) return;
  lastLogAt.set(key, now);
  console.error(`[RuntimeGuard] ${kind}: ${message}`);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}
接收错误类型和错误对象作为参数
使用 extractMessage 获取错误信息
实现了防抖动机制，相同错误在 1 秒内不会重复记录
打印错误类型和信息，并在错误有堆栈时打印堆栈信息
3. 进程事件绑定函数

/d:/Project/ritmex-bot/src/runtime-errors.ts
Apply
function bindProcessEvent(event: string, handler: Handler): void {
  if (typeof process === "undefined" || typeof process.on !== "function") return;
  process.on(event as any, (error: unknown) => {
    try {
      handler(error);
    } catch (loggingError) {
      console.error(`[RuntimeGuard] Failed to log ${event}:`, loggingError);
    }
  });
}
安全地为 Node.js 进程绑定事件处理器
检查 process 对象是否存在及其 on 方法是否可用
添加了错误处理，确保日志记录过程本身的错误不会导致应用崩溃
4. 全局错误处理器设置函数

/d:/Project/ritmex-bot/src/runtime-errors.ts
Apply
export function setupGlobalErrorHandlers(): void {
  if (installed) return;
  installed = true;

  // Node.js 进程事件处理
  bindProcessEvent("uncaughtException", (error) => {
    logRuntimeIssue("uncaughtException", error);
  });
  
  // 其他事件绑定...

  // 浏览器环境全局事件处理
  const globalWithEvents = globalThis as unknown as {
    addEventListener?: (type: string, listener: (event: any) => void) => void;
  };
  
  // Bun 运行时事件处理
  if (typeof Bun !== "undefined" && typeof Bun?.on === "function") {
    // Bun 事件绑定...
  }
}
这是模块的主要导出函数，用于设置所有错误处理器
首先检查是否已安装，避免重复安装
为 Node.js 环境绑定了 uncaughtException、unhandledRejection、multipleResolves 事件
为浏览器环境绑定了 unhandledrejection 和 error 全局事件
为 Bun 运行时绑定了 unhandledRejection 和 error 事件
对所有事件监听器都添加了错误捕获，确保日志记录过程不会抛出异常
设计亮点
跨环境兼容性：同时支持 Node.js、浏览器和 Bun 运行时环境
防抖动机制：防止短时间内大量重复错误日志淹没控制台
安全防护：多层错误处理确保日志系统本身不会成为故障点
模块化设计：分离了错误记录和事件绑定逻辑，便于维护
TypeScript 类型安全：使用类型定义确保代码的类型安全性
实际应用场景
此模块通常在应用程序启动时调用 setupGlobalErrorHandlers() 函数，以确保整个应用生命周期中的所有未捕获错误都能被记录下来，大大提高了应用的可观测性和问题排查效率，特别适合生产环境中的错误监控和调试。