export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: Record<string, FaqItem[]> = {
  TRADING: [
    {
      q: "What is leverage trading?",
      a: "Leverage trading allows you to trade with borrowed funds to increase your position size and potential profits. Our platform offers up to 100x leverage for advanced traders, giving you the ability to amplify your trading power while managing risk through our responsive controls and clear risk boundaries.",
    },
    {
      q: "How do I start trading?",
      a: "To start trading, login to your account and navigate to the Markets or Trading page. You can begin with a demo account to practice risk-free, or start with real funds. Select your preferred asset (crypto, stocks, or forex), choose your leverage if applicable, and place your trade. Our platform provides real-time market data and analysis tools to help you make informed decisions.",
    },
    {
      q: "What trading tools are available?",
      a: "Our platform offers comprehensive trading tools including real-time market data, portfolio management, advanced charting and analysis tools, demo accounts for practice, and 24/7 live-chat support. You can manage multiple assets simultaneously and scale your exposure confidently with tools built for fast-moving markets.",
    },
    {
      q: "What is the minimum amount I can trade with?",
      a: "The minimum trading amount varies depending on the asset type and market you choose. Minimum amounts are displayed when you select a specific asset or market. You can start with a demo account to practice trading strategies before committing real funds.",
    },
  ],
  STOCKS: [
    {
      q: "What stocks and ETFs can I trade?",
      a: "You can trade a wide range of stocks and ETFs, from blue-chip companies to breakthrough stocks. Our platform offers access to major stocks like Apple, Tesla, Amazon, Nvidia, and Netflix, as well as ETFs from providers like SPDR, Invesco, Vanguard, and Schwab. Visit the Stocks page to see all available options.",
    },
    {
      q: "How do I invest in stocks?",
      a: "To invest in stocks, login to your account and visit the Stocks & ETFs page. Browse through available stocks and ETFs, select the ones you want to invest in, choose your investment amount, and place your order. You can invest in your favorite stocks with just a few clicks.",
    },
    {
      q: "What is the difference between stocks and ETFs?",
      a: "Stocks represent ownership in individual companies, while ETFs (Exchange-Traded Funds) are investment funds that hold a collection of stocks or other assets. ETFs allow you to diversify your portfolio by investing in multiple companies or sectors through a single trade, which can help spread risk across different investments.",
    },
    {
      q: "What is the minimum amount I can invest in stocks?",
      a: "The minimum investment amount for stocks and ETFs varies depending on the specific asset you choose. Minimum amounts are displayed when you select a stock or ETF. You can start investing with amounts that fit your budget and investment goals.",
    },
  ],
  REAL_ESTATE: [
    {
      q: "What is real estate investing on your platform?",
      a: "Real estate investing on our platform allows you to invest in large-scale real estate projects with other investors without having to buy an entire building. It's a passive investment approach that gives you the potential to earn income like a landlord without the maintenance or operational responsibilities of owning property.",
    },
    {
      q: "How do I invest in real estate?",
      a: "To invest in real estate, login to your account and visit the Real Estate page. Browse available real estate investment opportunities, review the project details, select your investment amount within the minimum and maximum limits, and complete your investment. The process is simple and requires just a few clicks.",
    },
    {
      q: "How do I earn money from real estate investments?",
      a: "You earn money through passive income from real estate investments. Returns are generated from rental income, property appreciation, or project profits, depending on the specific investment opportunity. Your earnings are distributed periodically based on your investment share in the project.",
    },
    {
      q: "What is the minimum and maximum amount I can invest?",
      a: "The minimum and maximum investment amounts vary depending on the specific real estate project you choose. These limits are displayed when you view each investment opportunity. This allows you to invest in large-scale projects with other investors without having to foot the entire bill yourself.",
    },
  ],
  CRYPTO: [
    {
      q: "What cryptocurrencies can I trade?",
      a: "You can trade a wide range of cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Ripple (XRP), Cardano (ADA), Stellar (XLM), Solana (SOL), and many more. Our platform provides access to real-time market data and comprehensive analysis tools for all major cryptocurrencies.",
    },
    {
      q: "How do I trade cryptocurrencies?",
      a: "To trade cryptocurrencies, login to your account and visit the Crypto page. Browse available cryptocurrencies, select the one you want to trade, choose your position size and leverage if applicable, and place your trade. Our user-friendly interface and educational resources make it easy to engage with the crypto market, whether you're a seasoned trader or just starting out.",
    },
    {
      q: "What features are available for crypto trading?",
      a: "Our crypto trading platform offers real-time market data, comprehensive analysis tools, up to 100x leverage for advanced traders, portfolio management, demo accounts for practice, and dedicated customer support. You can trade 24/7 and access all the tools you need to navigate the dynamic world of digital currencies.",
    },
    {
      q: "What is the minimum amount I can trade crypto with?",
      a: "The minimum trading amount for cryptocurrencies varies depending on the specific crypto asset you choose. Minimum amounts are displayed when you select a cryptocurrency. You can start trading with amounts that fit your budget, and our platform supports both small and large trades.",
    },
  ],
  COPY_TRADING: [
    {
      q: "What is copy trading?",
      a: "Copy Trading is an automated feature that allows you to follow top traders and experts on our platform, copy their trades, and earn profits.",
    },
    {
      q: "How do I copy an expert?",
      a: "To copy an expert, login to your account and visit the Copy trading page. After finding the expert you wish to copy, click the 'Copy' button on the expert's profile card. You can copy as many experts as you want.",
    },
    {
      q: "How do I stop copying an expert?",
      a: "To stop copying a trader, visit the 'Copy trading' page, switch the tab to 'Copying' and click the 'Cancel' button on the trader's profile card. This button will only appear if you are currently copying the trader.",
    },
    {
      q: "What is the minimum amount I can copy an expert with?",
      a: "The minimum amount or minimum startup is determined by the expert you choose. If the expert has a minimum startup amount, it is displayed as 'Min. startup' on the expert's profile card.",
    },
  ],
  STAKING: [
    {
      q: "How do I stake?",
      a: "Crypto staking is locking up your coins to help secure a proof-of-stake network, and in return you earn additional coins as a reward.",
    },
    {
      q: "How long does a staking duration last?",
      a: "The duration of a staking duration is displayed when staking. The duration you select is the number of days the staking will last.",
    },
    {
      q: "What is the minimum and maximum amount I can stake?",
      a: "The minimum and maximum amount you can stake is determined by the pool you choose. The minimum amount is the minimum amount you can stake, and the maximum amount is the maximum amount you can stake in your selected pool.",
    },
    {
      q: "How do I make money with staking?",
      a: "You lock up your crypto to help secure the network and earn periodic rewards based on how much you stake. The more you stake, the more you earn. The ROI is an estimate of your potential profits.",
    },
  ],
};
