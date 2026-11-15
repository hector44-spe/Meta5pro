import { describe, it, expect } from "vitest";
import { getPrice, getPrices } from "../lib/prices";

describe("Multi-Asset Market Prices", () => {
  it("should return realistic, non-distorted prices for crypto assets", async () => {
    const btc = await getPrice("BTC");
    const eth = await getPrice("ETH");
    const sol = await getPrice("SOL");

    expect(typeof btc).toBe("number");
    expect(btc).toBeGreaterThan(40000);

    expect(typeof eth).toBe("number");
    expect(eth).toBeGreaterThan(1000);

    expect(typeof sol).toBe("number");
    expect(sol).toBeGreaterThan(50);
  });

  it("should resolve stock and commodity assets without failing", async () => {
    const aapl = await getPrice("AAPL");
    const tsla = await getPrice("TSLA");
    const nvda = await getPrice("NVDA");
    const xau = await getPrice("XAU");

    expect(typeof aapl).toBe("number");
    expect(aapl).toBeGreaterThan(100);

    expect(typeof tsla).toBe("number");
    expect(tsla).toBeGreaterThan(100);

    expect(typeof nvda).toBe("number");
    expect(nvda).toBeGreaterThan(50);

    expect(typeof xau).toBe("number");
    expect(xau).toBeGreaterThan(1500);
  });

  it("should provide full snapshot with crypto, fiat, and equities", async () => {
    const snap = await getPrices();
    expect(snap.prices).toBeDefined();
    expect(snap.prices["USD"]).toBe(1);
    expect(snap.prices["BTC"]).toBeGreaterThan(0);
    expect(snap.prices["AAPL"]).toBeGreaterThan(0);
  });
});
