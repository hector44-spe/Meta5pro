export interface RealEstateProject {
  id: string;
  ref: string;
  title: string;
  description: string;
  overview: string;
  minimum: number;
  roi: number;
  strategy: string;
  minDuration?: number;
  minDurationUnit?: "DAY" | "WEEK" | "MONTH" | "YEAR";
  maxDuration?: number;
  maxDurationUnit?: "DAY" | "WEEK" | "MONTH" | "YEAR";
  thumbnail: string;
  images: string[];
  breakdown: { name: string; value: string }[];
  whyThisProperty: string[];
  whyThisSponsor: string[];
  documents: { title: string; link: string; size?: string }[];
  status: "open" | "closed";
  closedByDefault?: boolean;
}

export const OPEN_REAL_ESTATE_PROJECTS: RealEstateProject[] = [
  {
    id: "bridge-labs",
    ref: "bridgeLabs",
    title: "Bridge Labs at Pegasus Park",
    description:
      "Life science redevelopment within a thriving new biotech-focused campus in Dallas, recognized as one of the top emerging life science markets.",
    overview:
      "Bridge Labs at Pegasus Park is an institutional-quality life science conversion located in the heart of Dallas' premier biotech cluster. The project features purpose-built laboratory and office infrastructure designed for high-growth biotechnology, pharmaceutical, and genomics enterprises. Anchored by major regional health science universities and venture funds, the campus enjoys unparalleled connectivity, robust tax incentives, and low regional cost of operation.",
    minimum: 12000,
    roi: 85,
    strategy: "Fixed income",
    thumbnail:
      "/assets/imgs/real-estate/20230118_Cam-01_Final_NEIGHBOURHOOD-1689090909077-1689090941800.png",
    images: [
      "/assets/imgs/real-estate/20230118_Cam-01_Final_NEIGHBOURHOOD-1689090909077-1689090941800.png",
      "/assets/imgs/real-estate/Screenshot_2023-06-06_at_9.29.28_AM-1686069140171-1686069352059.png",
      "/assets/imgs/real-estate/Screenshot_2023-07-13_at_8.53.17_AM-1689252808543-1689252843333.png",
    ],
    breakdown: [
      { name: "Type", value: "Life Sciences / Lab" },
      { name: "Location", value: "Dallas, TX" },
      { name: "Size", value: "135,000 RSF" },
      { name: "Strategy", value: "Fixed income" },
      { name: "Target Hold", value: "24-36 Months" },
      { name: "Target ROI", value: "85%" },
    ],
    whyThisProperty: [
      "Positioned within Pegasus Park, a 23-acre life sciences and technology ecosystem in central Dallas.",
      "Benefit from significant state and local grant subsidies alongside strong commercial biotech demand.",
      "Pre-leasing underway with accredited institutional biotech research tenants.",
    ],
    whyThisSponsor: [
      "Developed by nationally recognized life science developers with over 4.5M sq ft delivered.",
      "Substantial 20% co-investment alignment from lead sponsors.",
      "15-year unblemished track record in health science commercial conversions.",
    ],
    documents: [
      { title: "Executive Offering Memorandum", link: "#", size: "4.8 MB" },
      { title: "Floor & Laboratory Specifications", link: "#", size: "2.3 MB" },
      { title: "Independent Market Valuation", link: "#", size: "1.9 MB" },
      { title: "Sponsor Track Record & Audit", link: "#", size: "1.2 MB" },
    ],
    status: "open",
    closedByDefault: false,
  },
  {
    id: "nashville",
    ref: "nashville",
    title: "Go Store It Nashville",
    description:
      "Class A self-storage development in one of Nashville's fastest growing suburbs with constrained supply and a high barrier to entry.",
    overview:
      "Go Store It Nashville is a ground-up, self-storage development opportunity presented by Madison Capital Group. The Project is located in Franklin, TN, a rapidly expanding submarket (five-year population growth projection of 9%) located approximately 25 miles south of Nashville. When complete, the Class A property will include 1,286 climate-controlled units and be managed by Go Store It, a wholly-owned subsidiary of Madison Capital.",
    minimum: 15000,
    roi: 75,
    strategy: "Fixed income",
    thumbnail:
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_12.43.42_PM-1687981437202-1687981462106.png",
    images: [
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_12.43.42_PM-1687981437202-1687981462106.png",
      "/assets/imgs/real-estate/20230118_Cam-01_Final_NEIGHBOURHOOD-1689090909077-1689090941800.png",
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_9.01.22_AM-1687957298551-1687957428350.png",
    ],
    breakdown: [
      { name: "Type", value: "Self storage" },
      { name: "Acres", value: "3.02" },
      { name: "Location", value: "Franklin, TN" },
      { name: "Strategy", value: "Fixed income" },
      { name: "Units", value: "1,286 Climate-controlled" },
      { name: "Target ROI", value: "75%" },
    ],
    whyThisProperty: [
      "We believe this deal could be well-positioned to capitalize on significant population growth in Franklin, TN.",
      "Franklin's multifamily inventory has more than doubled since 2010, indicating strong unmet self-storage demand.",
      "High barrier to entry with only one competitor within a 3-mile radius.",
    ],
    whyThisSponsor: [
      "Madison's in-house management company, Go Store It, operates nearly 100 self-storage facilities across the U.S.",
      "In-house general contractor enables tight control over build timelines and construction costs.",
      "Significant 25% sponsor equity co-investment.",
    ],
    documents: [
      { title: "Investment Deck", link: "#", size: "3.4 MB" },
      { title: "Architectural Floor Plans", link: "#", size: "1.7 MB" },
      { title: "Zoning & Environmental Clearances", link: "#", size: "2.1 MB" },
      { title: "Sponsor Track Record", link: "#", size: "1.5 MB" },
    ],
    status: "open",
    closedByDefault: false,
  },
  {
    id: "fabian-labs",
    ref: "fabianLabs",
    title: "Fabian Labs, Palo Alto",
    description:
      "Two-building life science conversion in the heart of Silicon Valley and minutes from Stanford University, one of the top U.S. research institutions.",
    overview:
      "Fabian Labs is a core life-sciences acquisition and lab retrofit located in prestigious Palo Alto, California. Situated within walking distance of elite Stanford University research parks, the asset provides essential wet and dry lab capacity for burgeoning biotechnology spin-offs. Tight local zoning restrictions safeguard high barriers to entry, guaranteeing sustained long-term tenancy.",
    minimum: 24000,
    roi: 57,
    strategy: "Growth & Income",
    thumbnail:
      "/assets/imgs/real-estate/Screenshot_2023-06-06_at_9.29.28_AM-1686069140171-1686069352059.png",
    images: [
      "/assets/imgs/real-estate/Screenshot_2023-06-06_at_9.29.28_AM-1686069140171-1686069352059.png",
      "/assets/imgs/real-estate/20230118_Cam-01_Final_NEIGHBOURHOOD-1689090909077-1689090941800.png",
    ],
    breakdown: [
      { name: "Type", value: "Life Sciences / Tech" },
      { name: "Location", value: "Palo Alto, CA" },
      { name: "Strategy", value: "Growth & Income" },
      { name: "Buildings", value: "2 Commercial Buildings" },
      { name: "Target Hold", value: "3 Years" },
      { name: "Target ROI", value: "57%" },
    ],
    whyThisProperty: [
      "Irreplaceable Silicon Valley location minutes from Stanford University medical center.",
      "Extremely constrained local lab market with sub-3% historical vacancy.",
      "Triple-net (NNN) leases with annual 3.5% rental rate escalation clauses.",
    ],
    whyThisSponsor: [
      "Veteran Bay Area commercial syndicator with $1.8B in completed real estate exits.",
      "Longstanding relationships with prime institutional venture capital tenants.",
      "Strong historical delivery of projected target investor cash distributions.",
    ],
    documents: [
      { title: "Offering Memorandum", link: "#", size: "4.1 MB" },
      { title: "Property Appraisal Report", link: "#", size: "2.9 MB" },
      { title: "Phase I Environmental Audit", link: "#", size: "1.4 MB" },
    ],
    status: "open",
    closedByDefault: false,
  },
  {
    id: "palmetto",
    ref: "palmetto",
    title: "Palmetto Industrial Park",
    description:
      "Acquisition of a newly constructed three-building industrial property, already garnering interest from prospective tenants.",
    overview:
      "Palmetto Industrial Park is a newly constructed, three-building industrial logistics asset located in Palmetto, FL, approximately 45 miles south of Tampa. Stonemont Financial Group is acquiring the asset at substantial basis discount upon construction completion. The facility caters to e-commerce, third-party logistics, and light industrial distribution tenants in a thriving submarket.",
    minimum: 25000,
    roi: 78.8,
    strategy: "Fixed income",
    thumbnail:
      "/assets/imgs/real-estate/Screenshot_2023-07-13_at_8.53.17_AM-1689252808543-1689252843333.png",
    images: [
      "/assets/imgs/real-estate/Screenshot_2023-07-13_at_8.53.17_AM-1689252808543-1689252843333.png",
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_12.43.42_PM-1687981437202-1687981462106.png",
    ],
    breakdown: [
      { name: "Type", value: "Industrial Logistics" },
      { name: "Location", value: "Palmetto, FL" },
      { name: "Acres", value: "~38 Acres" },
      { name: "Strategy", value: "Fixed income" },
      { name: "Target Hold", value: "24 Months" },
      { name: "Target ROI", value: "78.8%" },
    ],
    whyThisProperty: [
      "Acquisition timing at post-construction completion reduces raw material and labor volatility.",
      "Submarket vacancy currently stands under 2%, driving competitive tenant lease bids.",
      "Direct transit access to I-75 logistics corridor serving Tampa and Sarasota.",
    ],
    whyThisSponsor: [
      "Stonemont Financial Group manages over 38M sq ft of industrial assets nationally.",
      "Exceptional institutional track record with Fortune 500 logistics tenants.",
      "High equity co-investment commitment on the general partner side.",
    ],
    documents: [
      { title: "Webinar Investment Presentation", link: "#", size: "3.2 MB" },
      { title: "Demographics & Trade Corridor Study", link: "#", size: "2.5 MB" },
      { title: "Sponsor Execution Track Record", link: "#", size: "1.1 MB" },
    ],
    status: "open",
    closedByDefault: false,
  },
  {
    id: "the-mirage",
    ref: "theMirage",
    title: "The Mirage - Texas State Student Housing",
    description:
      "A Texas State University student housing acquisition assuming below-market fixed-rate debt, with a renovation and rebranding strategy to seek higher rents and NOI.",
    overview:
      "The Mirage is a high-yield student housing community serving Texas State University in San Marcos, TX. The sponsor is assuming attractive below-market fixed-rate debt (3.85%) and deploying targeted capital improvements to amenity spaces, clubhouse facilities, and individual apartment units to drive rental yields.",
    minimum: 32500,
    roi: 84.35,
    strategy: "Growth & Income",
    thumbnail:
      "/assets/imgs/real-estate/Screenshot_2023-06-12_at_2.33.59_PM-1686605907291-1686606220626.png",
    images: [
      "/assets/imgs/real-estate/Screenshot_2023-06-12_at_2.33.59_PM-1686605907291-1686606220626.png",
      "/assets/imgs/real-estate/Screenshot_2023-06-06_at_9.29.28_AM-1686069140171-1686069352059.png",
    ],
    breakdown: [
      { name: "Type", value: "Student Housing / Multifamily" },
      { name: "Location", value: "San Marcos, TX" },
      { name: "Beds", value: "540 Beds / 180 Units" },
      { name: "Strategy", value: "Growth & Income" },
      { name: "Assumed Debt", value: "3.85% Fixed Rate" },
      { name: "Target ROI", value: "84.35%" },
    ],
    whyThisProperty: [
      "Texas State University enrollment continues to set record highs year-over-year.",
      "Assumed fixed-rate financing provides massive spread over current market debt yields.",
      "Proven value-add business plan with premium rents already achieved on initial model units.",
    ],
    whyThisSponsor: [
      "Over 12,000 student housing beds currently under active asset management.",
      "Specialized in university-adjacent value-add syndication strategies.",
      "Consistently achieved top-quartile realized returns across previous 8 student housing exits.",
    ],
    documents: [
      { title: "Offering Memorandum & Pro Forma", link: "#", size: "4.5 MB" },
      { title: "Renovation Budget & Scope of Work", link: "#", size: "1.8 MB" },
      { title: "Title & Property Survey", link: "#", size: "2.0 MB" },
    ],
    status: "open",
    closedByDefault: false,
  },
  {
    id: "hilton-philly",
    ref: "hiltonPhilly",
    title: "Hilton Philadelphia City Avenue",
    description:
      "Discounted acquisition of a recently renovated hotel property in Philadelphia with below-market, assumable debt.",
    overview:
      "The Hilton Philadelphia City Avenue is a prime 202-key hospitality asset acquired at a deep discount to replacement cost. Featuring comprehensive guestroom updates, full-service dining, and 35,000 square feet of banquet facilities, the property capitalizes on university, corporate, and medical center travel throughout the Greater Philadelphia metropolitan market.",
    minimum: 33000,
    roi: 68.7,
    strategy: "Growth & Income",
    thumbnail:
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_9.01.22_AM-1687957298551-1687957428350.png",
    images: [
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_9.01.22_AM-1687957298551-1687957428350.png",
      "/assets/imgs/real-estate/Screenshot_2023-07-13_at_8.53.17_AM-1689252808543-1689252843333.png",
    ],
    breakdown: [
      { name: "Type", value: "Hospitality" },
      { name: "Location", value: "Philadelphia, PA" },
      { name: "Keys", value: "202 Guest Rooms" },
      { name: "Strategy", value: "Growth & Income" },
      { name: "Basis", value: "42% Below Replacement" },
      { name: "Target ROI", value: "68.7%" },
    ],
    whyThisProperty: [
      "Acquired at 42% discount to historical replacement cost with assumable low-rate financing.",
      "Comprehensive $6.5M property improvement plan completed prior to acquisition.",
      "Strong demand generators from nearby university hospital networks and corporate campuses.",
    ],
    whyThisSponsor: [
      "Hospitality management firm overseeing $900M+ in branded franchise assets (Hilton, Marriott, Hyatt).",
      "Robust operational synergy reducing corporate overhead by 180 basis points.",
      "Decade-long history of outperforming competitive RevPAR indices in major MSAs.",
    ],
    documents: [
      { title: "Offering Memorandum", link: "#", size: "3.7 MB" },
      { title: "Historical STR RevPAR Reports", link: "#", size: "2.1 MB" },
      { title: "Franchise Agreement Terms", link: "#", size: "1.6 MB" },
    ],
    status: "open",
    closedByDefault: false,
  },
];

export const CLOSED_REAL_ESTATE_PROJECTS: RealEstateProject[] = [
  {
    id: "tesla-build",
    ref: "teslaBuild",
    title: "Tesla Build-to-Suit Orlando",
    description:
      "Development of a custom-built dealership and service center for Tesla, a Fortune 100 company with $850B market cap.",
    overview:
      "Long-term net lease development facility designed and constructed for Tesla Automotive in Orlando, Florida. Fully funded and successfully closed.",
    minimum: 18733,
    roi: 40,
    strategy: "Fixed income",
    thumbnail:
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_9.01.22_AM-1687957298551-1687957428350.png",
    images: [
      "/assets/imgs/real-estate/Screenshot_2023-06-28_at_9.01.22_AM-1687957298551-1687957428350.png",
    ],
    breakdown: [
      { name: "Type", value: "Net Lease Retail" },
      { name: "Tenant", value: "Tesla, Inc." },
      { name: "Strategy", value: "Fixed income" },
      { name: "Status", value: "Completed / Closed" },
    ],
    whyThisProperty: [
      "100% leased to investment-grade corporate tenant Tesla, Inc.",
      "Long-term 15-year initial lease with contractual rental increases.",
    ],
    whyThisSponsor: [
      "National build-to-suit commercial contractor with 50+ delivered flagship retail sites.",
    ],
    documents: [{ title: "Project Closeout Summary", link: "#", size: "1.2 MB" }],
    status: "closed",
    closedByDefault: true,
  },
  {
    id: "novi-concord",
    ref: "noviAtConcord",
    title: "Novi at Concord - Preferred Equity",
    description:
      "Three luxury apartment buildings in advanced stages of development in downtown Concord, N.C., a fast-growing Charlotte suburb.",
    overview:
      "Class A multifamily residential development providing luxury living options in the high-growth Charlotte metropolitan corridor. Fully subscribed and successfully closed.",
    minimum: 17500,
    roi: 53,
    strategy: "Value-add",
    thumbnail:
      "/assets/imgs/real-estate/Screenshot_2023-06-12_at_2.33.59_PM-1686605907291-1686606220626.png",
    images: [
      "/assets/imgs/real-estate/Screenshot_2023-06-12_at_2.33.59_PM-1686605907291-1686606220626.png",
    ],
    breakdown: [
      { name: "Type", value: "Multifamily" },
      { name: "Location", value: "Concord, NC" },
      { name: "Strategy", value: "Value-add" },
      { name: "Status", value: "Fully Subscribed" },
    ],
    whyThisProperty: [
      "Direct adjacency to corporate research and high-wage aerospace employers.",
      "Rapidly growing Charlotte MSA with strong rental demand fundamentals.",
    ],
    whyThisSponsor: [
      "Southeast regional apartment builder with over 6,000 units delivered.",
    ],
    documents: [{ title: "Subscription Confirmation", link: "#", size: "1.4 MB" }],
    status: "closed",
    closedByDefault: true,
  },
];

export const REAL_ESTATE_HOW_IT_WORKS = [
  {
    id: 1,
    title: "How does real estate investing work on Meta Gold 5?",
    content:
      "Meta Gold 5 partners with premier institutional sponsors to offer fractional commercial real estate opportunities. Investors can participate in institutional-quality developments, self-storage, life science laboratories, and student housing projects with lower capital requirements than traditional private equity syndications.",
  },
  {
    id: 2,
    title: "How do I earn returns from real estate investments?",
    content:
      "Returns typically come from two sources: (1) Periodic distribution yields generated from rental operations and property cash flows, and (2) Capital appreciation distributed upon project completion, refinancing, or property exit.",
  },
  {
    id: 3,
    title: "How do I invest in a project?",
    content:
      "Navigate to any Open project, review the investment metrics, property breakdown, and offering documents. Click 'Invest now', specify the amount you wish to invest (meeting or exceeding the project minimum), and confirm using your available account balance.",
  },
  {
    id: 4,
    title: "How much can I earn?",
    content:
      "Projected ROIs range from 40% to over 85% depending on the asset class, investment strategy (e.g., Fixed Income vs. Growth & Income), and targeted holding period. Historical returns are outlined in each project's documentation.",
  },
  {
    id: 5,
    title: "What is the typical investment duration?",
    content:
      "Real estate projects typically range from 1 to 5 years. Target hold periods and planned exit timelines are clearly outlined in each offering's project details.",
  },
  {
    id: 6,
    title: "Can I invest in multiple projects simultaneously?",
    content:
      "Yes! Diversification across property types (e.g., life science, industrial, self-storage, multifamily) and geographic markets is recommended to build a balanced portfolio.",
  },
  {
    id: 7,
    title: "What is the minimum investment required?",
    content:
      "Minimums vary by project and typically range from $12,000 to $33,000. Each card displays the exact minimum threshold required to participate.",
  },
  {
    id: 8,
    title: "Where can I monitor my real estate portfolio value?",
    content:
      "Your active real estate holdings, accrued distributions, and maturity timelines can be viewed under the 'Your investments' tab on this page as well as on your main dashboard.",
  },
];
