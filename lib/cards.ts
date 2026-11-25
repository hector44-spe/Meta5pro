export interface CardOption {
  id: string;
  name: string;
  title: string;
  kycRequired: boolean;
  issuanceFee: number;
  depositTotalMinimum: number | null;
  enabled: boolean;
}

export const DEFAULT_CARD_OPTIONS: CardOption[] = [
  {
    id: "opt_regular",
    name: "Regular",
    title: "Regular Card",
    kycRequired: false,
    issuanceFee: 1000,
    depositTotalMinimum: null,
    enabled: true,
  },
  {
    id: "opt_virtual",
    name: "Virtual",
    title: "Virtual Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 10000,
    enabled: true,
  },
  {
    id: "opt_physical",
    name: "Physical",
    title: "Physical Card",
    kycRequired: true,
    issuanceFee: 1000,
    depositTotalMinimum: 50000,
    enabled: true,
  },
];
