export interface StakingPool {
  id: string;
  name: string;
  symbol: string;
  icon?: string | null;
  min: number;
  max: number;
  cycle: string;
  roi: number; // percentage
  status?: string;
}

export interface UserStakeRecord {
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

export const DEFAULT_STAKING_POOLS: StakingPool[] = [
  {
    id: "pool-avax",
    name: "Avalanche",
    symbol: "AVAX",
    icon: "/assets/coins/AVAX.svg",
    min: 9,
    max: 1000,
    cycle: "Daily",
    roi: 84,
  },
  {
    id: "pool-eth",
    name: "Ethereum",
    symbol: "ETH",
    icon: "/assets/coins/ETH.svg",
    min: 1,
    max: 10,
    cycle: "Daily",
    roi: 84,
  },
  {
    id: "pool-matic",
    name: "Polygon",
    symbol: "MATIC",
    icon: "/assets/coins/MATIC.svg",
    min: 40,
    max: 87,
    cycle: "Daily",
    roi: 84,
  },
  {
    id: "pool-sol",
    name: "Solana",
    symbol: "SOL",
    icon: "/assets/coins/SOL.svg",
    min: 6,
    max: 18,
    cycle: "Daily",
    roi: 84,
  },
  {
    id: "pool-btc",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "/assets/coins/BTC.svg",
    min: 0.05,
    max: 5,
    cycle: "Daily",
    roi: 84,
  },
  {
    id: "pool-usdt",
    name: "Tether USD",
    symbol: "USDT",
    icon: "/assets/coins/USDT.svg",
    min: 100,
    max: 50000,
    cycle: "Daily",
    roi: 84,
  },
];
