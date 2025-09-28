import React from "react";
import { render } from "ink";
import { DataTable } from "../src/ui/components/DataTable";

// 定义测试数据类型
type TradeData = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  timestamp: string;
  profit?: number;
} & Record<string, unknown>;

type UserData = {
  name: string;
  age: number;
  email: string;
  status: "active" | "inactive";
  balance: number;
} & Record<string, unknown>;

// 测试数据
const tradeData: TradeData[] = [
  { id: "1", symbol: "BTC/USDT", side: "BUY", price: 45000.50, quantity: 0.1, timestamp: "2024-01-15 10:30:00", profit: 250.75 },
  { id: "2", symbol: "ETH/USDT", side: "SELL", price: 2800.25, quantity: 2.5, timestamp: "2024-01-15 11:15:00", profit: -120.30 },
  { id: "3", symbol: "SOL/USDT", side: "BUY", price: 95.80, quantity: 10, timestamp: "2024-01-15 12:00:00", profit: 45.20 },
  { id: "4", symbol: "ADA/USDT", side: "SELL", price: 0.4850, quantity: 500, timestamp: "2024-01-15 13:45:00", profit: 12.50 },
];

const userData: UserData[] = [
  { name: "张三", age: 28, email: "zhangsan@example.com", status: "active", balance: 12500.75 },
  { name: "李四", age: 35, email: "lisi@example.com", status: "inactive", balance: 8500.25 },
  { name: "王五", age: 42, email: "wangwu@example.com", status: "active", balance: 21000.50 },
];

// 交易数据表格配置
const tradeColumns = [
  { key: "id", header: "ID", align: "left" as const, minWidth: 4 },
  { key: "symbol", header: "交易对", align: "left" as const, minWidth: 10 },
  { key: "side", header: "方向", align: "left" as const, minWidth: 6 },
  { key: "price", header: "价格", align: "right" as const, minWidth: 12 },
  { key: "quantity", header: "数量", align: "right" as const, minWidth: 10 },
  { key: "timestamp", header: "时间", align: "left" as const, minWidth: 16 },
  { key: "profit", header: "盈亏", align: "right" as const, minWidth: 10 },
];

// 用户数据表格配置
const userColumns = [
  { key: "name", header: "姓名", align: "left" as const, minWidth: 8 },
  { key: "age", header: "年龄", align: "right" as const, minWidth: 6 },
  { key: "email", header: "邮箱", align: "left" as const, minWidth: 20 },
  { key: "status", header: "状态", align: "left" as const, minWidth: 8 },
  { key: "balance", header: "余额", align: "right" as const, minWidth: 12 },
];

function TestApp() {
  return (
    <>
      <DataTable<TradeData> 
        columns={tradeColumns} 
        rows={tradeData} 
      />
      
      <DataTable<UserData> 
        columns={userColumns} 
        rows={userData} 
      />
    </>
  );
}

render(<TestApp />);