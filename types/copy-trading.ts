export interface CopyExpert {
  id: string;
  ref: string;
  name: string;
  username: string;
  picture: string;
  bio: string;
  winRate: number;
  profitShare: number;
  wins: number;
  losses: number;
  tradesCount: number;
  minimumStartUp: number;
  followers: number;
  tickType?: "gold" | "blue" | "none";
  subscriberList: string[];
}
