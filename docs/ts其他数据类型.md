# 其他数据类型

我来帮你了解TypeScript中的数据结构！首先让我看看当前文件的内容，然后为你详细介绍TypeScript中的各种数据结构。


src\runtime-errors.ts
很好！我看到你正在查看的代码中确实使用了TypeScript的Map。作为Java开发者，你会发现TypeScript的数据结构与Java有很多相似之处，但也有一些重要的区别。让我为你详细介绍TypeScript中的各种数据结构：

TypeScript中的数据结构
1. Map（映射）
就像你在代码中看到的：


typescript
Apply
const lastLogAt = new Map<string, number>();
特点：类似于Java的HashMap，存储键值对
键类型：可以是任意类型（不像Java的Map限制为对象）
方法：set(), get(), has(), delete(), clear(), size属性
2. Set（集合）

typescript
Apply
const uniqueValues = new Set<string>();
uniqueValues.add("hello");
uniqueValues.add("world");
特点：存储唯一值，类似于Java的HashSet
方法：add(), has(), delete(), clear(), size属性
3. Array（数组）

typescript
Apply
const numbers: number[] = [1, 2, 3];
const strings: Array<string> = ["a", "b", "c"];
特点：动态数组，类似于Java的ArrayList
方法：丰富的数组方法如map(), filter(), reduce(), forEach()等
4. Object（对象）

typescript
Apply
const person = {
  name: "John",
  age: 30,
  address: {
    city: "New York",
    country: "USA"
  }
};
特点：键值对集合，类似于Java的Map但更轻量
访问：person.name 或 person["name"]
5. WeakMap 和 WeakSet

typescript
Apply
const weakMap = new WeakMap<object, string>();
const weakSet = new WeakSet<object>();
特点：弱引用版本，不会阻止垃圾回收
用途：用于存储私有数据或缓存
6. Record（记录类型）

typescript
Apply
type UserRoles = Record<string, boolean>;
const roles: UserRoles = {
  admin: true,
  user: false
};
特点：类型安全的键值对对象
7. Tuple（元组）

typescript
Apply
const tuple: [string, number] = ["hello", 42];
特点：固定长度和类型的数组
8. Enum（枚举）

typescript
Apply
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}
特点：命名常量集合
与Java的主要区别
类型灵活性：TypeScript有更灵活的类型系统，支持联合类型、交叉类型等
动态特性：数组和对象可以动态扩展
函数式编程：内置丰富的函数式方法（map、filter、reduce等）
可选链操作符：obj?.prop 安全访问嵌套属性
空值合并：?? 操作符提供默认值
在你当前项目中的应用
在你看到的代码中，Map被用来实现防重复日志功能：

lastLogAt Map存储每种错误类型的最后记录时间
键是错误类型和消息的组合：${kind}:${message}
值是该错误最后记录的时间戳
通过时间差判断是否需要再次记录（避免重复日志）
这种用法非常类似于Java中使用HashMap来缓存或跟踪状态！

## 完整的例子

```typescript
// TypeScript 数据结构完整示例 - 用户管理系统

// 1. Enum（枚举） - 定义用户角色
enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  GUEST = "GUEST"
}

// 2. Tuple（元组） - 定义用户基本信息
type UserInfo = [string, number, UserRole]; // [姓名, 年龄, 角色]

// 3. Record（记录类型） - 定义权限映射
type Permissions = Record<string, boolean>;

// 4. 自定义类型 - 用户对象
interface User {
  id: string;
  name: string;
  age: number;
  role: UserRole;
  permissions: Permissions;
  lastLogin?: Date; // 可选属性
}

// 用户管理类 - 综合使用各种数据结构
class UserManager {
  // 5. Map - 存储用户数据（键：用户ID，值：用户对象）
  private users = new Map<string, User>();
  
  // 6. Set - 存储在线用户ID
  private onlineUsers = new Set<string>();
  
  // 7. Array - 存储用户操作日志
  private operationLogs: string[] = [];
  
  // 8. WeakMap - 存储私有数据（不会阻止垃圾回收）
  private userPrivateData = new WeakMap<User, { password: string; secret: string }>();

  // 构造函数
  constructor() {
    this.logOperation("UserManager initialized");
  }

  // 添加用户
  addUser(userInfo: UserInfo, privateData: { password: string; secret: string }): User {
    const [name, age, role] = userInfo;
    const id = this.generateId();
    
    // 创建用户对象
    const user: User = {
      id,
      name,
      age,
      role,
      permissions: this.getDefaultPermissions(role)
    };

    // 使用Map的set方法
    this.users.set(id, user);
    
    // 使用WeakMap存储私有数据
    this.userPrivateData.set(user, privateData);
    
    this.logOperation(`User added: ${name} (${id})`);
    return user;
  }

  // 获取用户
  getUser(id: string): User | undefined {
    // 使用Map的get方法
    return this.users.get(id);
  }

  // 用户登录
  login(userId: string, password: string): boolean {
    const user = this.getUser(userId);
    if (!user) return false;

    const privateData = this.userPrivateData.get(user);
    if (privateData?.password === password) {
      // 使用Set的add方法
      this.onlineUsers.add(userId);
      user.lastLogin = new Date();
      this.logOperation(`User logged in: ${user.name}`);
      return true;
    }
    return false;
  }

  // 用户登出
  logout(userId: string): void {
    // 使用Set的delete方法
    this.onlineUsers.delete(userId);
    const user = this.getUser(userId);
    if (user) {
      this.logOperation(`User logged out: ${user.name}`);
    }
  }

  // 获取在线用户列表
  getOnlineUsers(): User[] {
    // 使用Array的map方法和Set的forEach方法
    const onlineUsers: User[] = [];
    this.onlineUsers.forEach(userId => {
      const user = this.getUser(userId);
      if (user) onlineUsers.push(user);
    });
    return onlineUsers;
  }

  // 根据角色过滤用户
  getUsersByRole(role: UserRole): User[] {
    // 使用Array的filter方法
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // 更新用户权限
  updateUserPermissions(userId: string, newPermissions: Permissions): boolean {
    const user = this.getUser(userId);
    if (user) {
      // 合并权限（使用展开运算符）
      user.permissions = { ...user.permissions, ...newPermissions };
      this.logOperation(`Permissions updated for user: ${user.name}`);
      return true;
    }
    return false;
  }

  // 删除用户
  deleteUser(userId: string): boolean {
    const user = this.getUser(userId);
    if (user) {
      // 使用Map的delete方法
      this.users.delete(userId);
      this.onlineUsers.delete(userId);
      this.logOperation(`User deleted: ${user.name}`);
      return true;
    }
    return false;
  }

  // 获取用户统计信息
  getUserStats(): { total: number; online: number; byRole: Record<UserRole, number> } {
    // 使用Map的size属性
    const total = this.users.size;
    // 使用Set的size属性
    const online = this.onlineUsers.size;
    
    // 统计各角色用户数量
    const byRole = {} as Record<UserRole, number>;
    Object.values(UserRole).forEach(role => {
      byRole[role] = this.getUsersByRole(role).length;
    });

    return { total, online, byRole };
  }

  // 搜索用户（使用数组方法）
  searchUsers(query: string): User[] {
    return Array.from(this.users.values()).filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.id.includes(query)
    );
  }

  // 获取操作日志（使用数组切片）
  getRecentLogs(count: number = 10): string[] {
    // 使用数组的slice方法
    return this.operationLogs.slice(-count);
  }

  // 清空所有数据
  clearAll(): void {
    // 使用Map的clear方法
    this.users.clear();
    // 使用Set的clear方法
    this.onlineUsers.clear();
    this.operationLogs.length = 0; // 清空数组
    this.logOperation("All data cleared");
  }

  // 私有方法
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultPermissions(role: UserRole): Permissions {
    const basePermissions = { canRead: true, canWrite: false };
    
    switch (role) {
      case UserRole.ADMIN:
        return { ...basePermissions, canWrite: true, canDelete: true, canManageUsers: true };
      case UserRole.USER:
        return { ...basePermissions, canWrite: true };
      case UserRole.GUEST:
        return { ...basePermissions };
      default:
        return basePermissions;
    }
  }

  private logOperation(message: string): void {
    const timestamp = new Date().toISOString();
    this.operationLogs.push(`[${timestamp}] ${message}`);
  }
}

// 使用示例
function demonstrateDataStructures(): void {
  console.log("=== TypeScript 数据结构演示 ===\n");

  // 创建用户管理器实例
  const userManager = new UserManager();

  // 1. 添加用户（使用Tuple）
  const adminInfo: UserInfo = ["张三", 30, UserRole.ADMIN];
  const userInfo: UserInfo = ["李四", 25, UserRole.USER];
  const guestInfo: UserInfo = ["王五", 20, UserRole.GUEST];

  const admin = userManager.addUser(adminInfo, { password: "admin123", secret: "secret1" });
  const user = userManager.addUser(userInfo, { password: "user123", secret: "secret2" });
  const guest = userManager.addUser(guestInfo, { password: "guest123", secret: "secret3" });

  // 2. 用户登录（使用Set跟踪在线用户）
  userManager.login(admin.id, "admin123");
  userManager.login(user.id, "user123");

  // 3. 显示统计信息
  const stats = userManager.getUserStats();
  console.log("用户统计:", stats);

  // 4. 显示在线用户
  const onlineUsers = userManager.getOnlineUsers();
  console.log("在线用户:", onlineUsers.map(u => u.name));

  // 5. 搜索用户（使用数组filter）
  const searchResults = userManager.searchUsers("张");
  console.log("搜索'张'的结果:", searchResults.map(u => u.name));

  // 6. 更新权限（使用Record类型）
  userManager.updateUserPermissions(user.id, { canDelete: true });
  console.log("用户权限更新完成");

  // 7. 获取操作日志（使用数组）
  const logs = userManager.getRecentLogs(5);
  console.log("最近5条操作日志:");
  logs.forEach(log => console.log("  -", log));

  // 8. 角色过滤（使用数组filter和Enum）
  const admins = userManager.getUsersByRole(UserRole.ADMIN);
  console.log("管理员用户:", admins.map(a => a.name));

  // 9. 用户登出（使用Set删除）
  userManager.logout(user.id);
  console.log("用户登出后的在线用户:", userManager.getOnlineUsers().map(u => u.name));

  // 10. 删除用户（使用Map删除）
  userManager.deleteUser(guest.id);
  console.log("删除用户后的统计:", userManager.getUserStats());

  console.log("\n=== 演示完成 ===");
}

// 运行演示
demonstrateDataStructures();

```

这个完整的示例展示了TypeScript中各种数据结构的实际应用：

主要特点：
Enum - 定义用户角色常量
Tuple - 表示用户基本信息元组
Record - 定义权限映射类型
Map - 存储用户数据（键值对）
Set - 跟踪在线用户（唯一值集合）
Array - 存储操作日志和用户列表
WeakMap - 存储私有数据（弱引用）
Interface - 定义用户对象结构
常用方法演示：
Map: set(), get(), delete(), clear(), size, values()
Set: add(), delete(), has(), forEach(), size
Array: push(), filter(), map(), slice(), forEach()
对象操作: 展开运算符 ..., 可选链 ?., 空值合并 ??
这个用户管理系统示例将各种数据结构有机地结合在一起，展示了它们在真实场景中的应用。你可以运行这个代码来查看实际效果！