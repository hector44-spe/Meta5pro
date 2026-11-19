export interface MiningPool {
  id: string;
  name: string;
  symbol: string;
  badge: string;
  icon?: string | null;
  hardwareImage?: string | null;
  min: number;
  max: number;
  roi: number; // percentage
  cycle: string;
  hashrate: string;
  status?: string;
}

export interface UserMiningRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userFullName?: string | null;
  username?: string | null;
  poolId?: string | null;
  poolName: string;
  symbol: string;
  amount: number;
  usdValue: number;
  durationDays: number;
  roi: number;
  expectedReturnUsd: number;
  accruedProfitUsd: number;
  daysRemaining: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
}

export const DEFAULT_MINING_POOLS: MiningPool[] = [
  {
    id: "mine-bitminer",
    name: "BitMiner",
    symbol: "BTC",
    badge: "BTC Pool",
    icon: "/assets/coins/BTC.svg",
    hardwareImage: "/assets/coins/l9.png",
    min: 1,
    max: 10,
    roi: 100,
    cycle: "Daily",
    hashrate: "18,036,473 GH/s",
  },
  {
    id: "mine-s19pro",
    name: "Antminer S19 Pro",
    symbol: "BTC",
    badge: "BTC Pool",
    icon: "/assets/coins/BTC.svg",
    hardwareImage: "/assets/coins/l9.png",
    min: 0.5,
    max: 5,
    roi: 95,
    cycle: "Daily",
    hashrate: "12,450,000 GH/s",
  },
  {
    id: "mine-m30s",
    name: "WhatsMiner M30S+",
    symbol: "BTC",
    badge: "BTC Pool",
    icon: "/assets/coins/BTC.svg",
    hardwareImage: "/assets/coins/l9.png",
    min: 0.2,
    max: 3,
    roi: 90,
    cycle: "Daily",
    hashrate: "9,800,000 GH/s",
  },
  {
    id: "mine-hydro",
    name: "MicroBT Hydro",
    symbol: "BTC",
    badge: "BTC Pool",
    icon: "/assets/coins/BTC.svg",
    hardwareImage: "/assets/coins/l9.png",
    min: 2,
    max: 20,
    roi: 110,
    cycle: "Daily",
    hashrate: "24,500,000 GH/s",
  },
];
