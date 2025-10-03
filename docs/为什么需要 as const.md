# 为什么需要 as const
s const 在这里的作用是类型窄化（Type Narrowing），确保 TypeScript 将字符串字面量识别为具体的字面量类型，而不是普通的 string 类型。

让我解释一下具体原因：

为什么需要 as const
在 TypeScript 中，当你这样写：


typescript
Apply
{ key: "id", header: "ID", align: "left" }
TypeScript 会推断 align 的类型为 string，而不是具体的字面量类型 "left"。

但是 TableColumn 接口定义中：


typescript
Apply
export interface TableColumn {
  key: string;
  header: string;
  align?: Align;  // Align = "left" | "right"
}
align 的类型是 "left" | "right"，这是具体的字面量联合类型。

问题所在
如果不加 as const：


typescript
Apply
{ key: "id", header: "ID", align: "left" }
// TypeScript 推断 align 为 string 类型
// 但 TableColumn 接口要求 align 是 "left" | "right"
// 这会导致类型不匹配错误
加上 as const：


typescript
Apply
{ key: "id", header: "ID", align: "left" as const }
// TypeScript 将 "left" 识别为字面量类型 "left"
// 符合 TableColumn 接口的 Align 类型要求
替代方案
你也可以这样写，效果相同：


typescript
Apply
{ key: "id", header: "ID", align: "left" as Align }
或者直接使用类型断言：


typescript
Apply
{ key: "id", header: "ID", align: "left" as "left" }
总结
as const 在这里确保了：

字符串字面量被正确识别为具体的字面量类型
符合 TableColumn 接口的类型约束
提供了更好的类型安全性
这是一种常见的 TypeScript 模式，用于处理字面量类型和接口约束之间的匹配问题。