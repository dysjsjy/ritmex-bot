# TypeScript 访问控制与模块系统详解

## 概述

作为Java开发者学习TypeScript时，访问控制和模块系统是最容易混淆的概念之一。本文将从Java开发者的角度，详细解释TypeScript的访问控制和模块系统。

## 1. 访问控制（Access Control）

### 1.1 TypeScript确实有访问修饰符

```typescript
class User {
  public name: string;        // 公开（默认）
  private id: string;         // 私有（只能在类内部访问）
  protected email: string;    // 受保护（类内部和子类可访问）
  
  constructor(name: string, id: string, email: string) {
    this.name = name;
    this.id = id;
    this.email = email;
  }
  
  // 私有方法
  private generateToken(): string {
    return `${this.id}_${Date.now()}`;
  }
  
  // 公开方法
  public getDisplayName(): string {
    return `${this.name} (${this.email})`;
  }
}
```

### 1.2 与Java的关键区别

**TypeScript的访问控制是编译时的**，不是运行时的：

```typescript
class Test {
  private secret = "confidential";
}

const test = new Test();
// 编译时：❌ 错误 - Property 'secret' is private
// console.log(test.secret);

// 但运行时可以通过JavaScript绕过：
console.log((test as any).secret); // ✅ 可以访问！
```

**Java的访问控制是运行时的**：

```java
public class Test {
    private String secret = "confidential";
}

Test test = new Test();
// 编译时：❌ 错误 - secret has private access
// 运行时：❌ 也会阻止访问（反射除外）
```

### 1.3 访问修饰符总结

| 修饰符 | 作用域 | 说明 |
|--------|--------|------|
| `public` | 任何地方 | 默认修饰符，可以省略 |
| `private` | 类内部 | 只能在定义它的类中访问 |
| `protected` | 类内部和子类 | 可以在类及其子类中访问 |
| `readonly` | 属性级别 | 只能在构造函数中初始化 |

## 2. 模块系统（Module System）

### 2.1 文件级别的可见性控制

TypeScript使用`export`关键字来控制文件间的可见性：

```typescript
// file1.ts

// 导出 - 其他文件可以导入
export class PublicClass { }
export function publicFunc() { }
export const PUBLIC_CONST = 123;

// 不导出 - 文件私有（其他文件不能导入）
class PrivateClass { }
function privateFunc() { }
const PRIVATE_CONST = 456;
```

```typescript
// file2.ts
import { PublicClass, publicFunc, PUBLIC_CONST } from './file1';

// ✅ 这些可以导入使用
const obj = new PublicClass();
publicFunc();
console.log(PUBLIC_CONST);

// ❌ 这些不能导入（编译错误）
// import { PrivateClass } from './file1';
```

### 2.2 导出方式

#### 命名导出（Named Exports）
```typescript
// 方式1：在声明时导出
export const name = "TypeScript";
export function greet() { return "Hello"; }

// 方式2：统一导出
export { name, greet };

// 方式3：重命名导出
export { name as appName, greet as sayHello };
```

#### 默认导出（Default Export）
```typescript
// 每个文件只能有一个默认导出
export default class UserService {
  // ...
}

// 导入时不需要花括号
import UserService from './UserService';
```

### 2.3 导入方式

```typescript
// 命名导入
import { PublicClass, publicFunc } from './file1';

// 重命名导入
import { PublicClass as MyClass } from './file1';

// 全部导入（不推荐，容易命名冲突）
import * as File1 from './file1';

// 默认导入
import UserService from './UserService';

// 混合导入
import UserService, { User, UserRole } from './user-module';
```

## 3. 实际项目示例

### 3.1 项目中的实际使用

查看项目中的<mcfile name="runtime-errors.ts" path="src/runtime-errors.ts"></mcfile>文件：

```typescript
// 这些没有export，是文件私有的：
let installed = false;
const lastLogAt = new Map<string, number>();
function logRuntimeIssue(kind: string, error: unknown): void { }
function bindProcessEvent(event: string, handler: Handler): void { }

// 只有这个函数被export了，其他文件可以导入使用：
export function setupGlobalErrorHandlers(): void { }
```

### 3.2 推荐的项目结构

```typescript
// services/UserService.ts
export class UserService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
  }
  
  public async getUser(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
  
  private validateUser(user: User): boolean {
    // 私有验证逻辑
    return user.email.includes('@');
  }
}

// 工具函数 - 不导出，文件私有
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

// 配置常量 - 选择性导出
export const USER_CONFIG = {
  maxAge: 120,
  minAge: 18
};

const INTERNAL_CONFIG = {
  debug: true,
  logLevel: 'info'
}; // 不导出，文件私有
```

## 4. 与Java的对比

### 4.1 访问控制对比

| 特性 | TypeScript | Java |
|------|------------|------|
| 访问控制级别 | 编译时 | 运行时 |
| 私有属性绕过 | 可以通过`any`类型绕过 | 严格限制（反射除外） |
| 默认访问级别 | `public` | 包级私有 |

### 4.2 模块系统对比

| 特性 | TypeScript | Java |
|------|------------|------|
| 可见性控制 | `export`关键字 | `public`等访问修饰符 |
| 文件组织 | 每个文件是一个模块 | 包目录结构 |
| 导入方式 | `import { name } from './file'` | `import package.Class` |
| 默认导出 | `export default class` | 无此概念 |
| 命名空间 | 文件路径作为命名空间 | 包名作为命名空间 |

## 5. 最佳实践

### 5.1 访问控制最佳实践

```typescript
class BankAccount {
  // ✅ 推荐：明确指定访问修饰符
  public readonly accountNumber: string;
  private balance: number;
  protected owner: string;
  
  constructor(accountNumber: string, owner: string) {
    this.accountNumber = accountNumber;
    this.balance = 0;
    this.owner = owner;
  }
  
  // ✅ 公开方法提供受控访问
  public deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }
  
  public getBalance(): number {
    return this.balance;
  }
  
  // ✅ 私有方法封装内部逻辑
  private validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 10000;
  }
}
```

### 5.2 模块系统最佳实践

```typescript
// ✅ 明确导出公共API
export class UserService {
  public getUser(id: string) { }
  public createUser(user: User) { }
}

// ✅ 工具函数不导出（文件私有）
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ 常量选择性导出
export const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3
};

const INTERNAL_DEBUG = false; // 不导出

// ✅ 使用默认导出表示主要功能
export default UserService;
```

### 5.3 文件组织最佳实践

```
src/
├── services/           # 服务层
│   ├── UserService.ts  # 用户服务（导出主要类）
│   └── AuthService.ts # 认证服务
├── models/            # 数据模型
│   ├── User.ts        # 用户模型
│   └── types.ts       # 类型定义
├── utils/             # 工具函数
│   ├── validators.ts  # 验证工具
│   └── helpers.ts     # 辅助函数
└── index.ts           # 主入口文件
```

## 6. 常见问题与解决方案

### 6.1 循环依赖问题

**问题**：两个文件相互导入导致循环依赖

**解决方案**：
```typescript
// ❌ 避免这样
// file1.ts
import { funcFromFile2 } from './file2';

// file2.ts  
import { funcFromFile1 } from './file1';

// ✅ 使用依赖注入或中间文件
// services/UserService.ts
export class UserService {
  constructor(private authService: AuthService) { }
}

// services/AuthService.ts
export class AuthService {
  // 不直接导入UserService
}

// main.ts
import { UserService } from './services/UserService';
import { AuthService } from './services/AuthService';
const authService = new AuthService();
const userService = new UserService(authService);
```

### 6.2 命名冲突问题

**问题**：不同文件导出同名内容导致冲突

**解决方案**：
```typescript
// ✅ 使用命名空间或重命名
import { User as ApiUser } from './api/User';
import { User as DbUser } from './database/User';

// ✅ 或使用模块别名
import * as Api from './api';
import * as Db from './database';
const user1 = new Api.User();
const user2 = new Db.User();
```

## 7. 总结

TypeScript的访问控制和模块系统虽然与Java有所不同，但其设计哲学更符合现代前端开发的需求：

1. **编译时安全**：在开发阶段就发现错误
2. **明确的模块边界**：每个文件都是独立的模块
3. **树摇优化友好**：未使用的代码可以被自动删除
4. **灵活的导入导出**：支持多种导入导出方式

作为Java开发者，理解这些差异有助于更好地掌握TypeScript的开发模式。关键是要记住：
- **访问控制**主要作用于类内部
- **模块系统**主要作用于文件之间
- **`export`**是TypeScript中最重要的可见性控制机制

通过合理使用这些特性，可以构建出结构清晰、易于维护的TypeScript应用程序。