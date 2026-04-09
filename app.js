const stocks = [
  {
    name: "Infosys",
    symbol: "INFY",
    bucket: "Long Term",
    price: "Rs1,648",
    dayChange: 1.8,
    priceBucket: "Rs500-2000",
    volumeBucket: "High Volume",
    profitStatus: "Profitable",
    stability: "High",
    revenueTrend: "Up 7% YoY",
    netProfitTrend: "Up 9% YoY",
    debtToEquity: "0.09",
    operatingCashFlow: "Positive",
    roe: "29.4%",
    promoterPledge: "0%",
    evidence: [
      "Large-cap IT company with consistent profitability and strong cash generation.",
      "Low debt and zero promoter pledge support balance sheet stability.",
      "High trading volume makes it easier for users to track and enter or exit."
    ]
  },
  {
    name: "Tata Motors",
    symbol: "TATAMOTORS",
    bucket: "Short Term",
    price: "Rs1,024",
    dayChange: 2.4,
    priceBucket: "Rs500-2000",
    volumeBucket: "Volume Spike",
    profitStatus: "Profitable",
    stability: "Medium",
    revenueTrend: "Up 12% YoY",
    netProfitTrend: "Up 14% YoY",
    debtToEquity: "1.18",
    operatingCashFlow: "Positive",
    roe: "19.1%",
    promoterPledge: "0%",
    evidence: [
      "Recent momentum and stronger-than-usual volume make it suitable for short-term tracking.",
      "Profit growth remains healthy, but debt is higher than conservative long-term picks.",
      "Auto sector updates and delivery trends often move the stock quickly."
    ]
  },
  {
    name: "Hindustan Aeronautics",
    symbol: "HAL",
    bucket: "Long Term",
    price: "Rs4,112",
    dayChange: -0.7,
    priceBucket: "Above Rs2000",
    volumeBucket: "High Volume",
    profitStatus: "Profitable",
    stability: "High",
    revenueTrend: "Up 13% YoY",
    netProfitTrend: "Up 16% YoY",
    debtToEquity: "0.00",
    operatingCashFlow: "Positive",
    roe: "27.8%",
    promoterPledge: "0%",
    evidence: [
      "Debt-free profile and strong return ratios are positive stability markers.",
      "Order book visibility can support long-term conviction if execution remains strong.",
      "Good profitability and government-linked defense demand make it worth monitoring."
    ]
  },
  {
    name: "Indian Railway Finance Corporation",
    symbol: "IRFC",
    bucket: "Watchlist",
    price: "Rs176",
    dayChange: 0.9,
    priceBucket: "Rs100-500",
    volumeBucket: "Volume Spike",
    profitStatus: "Profitable",
    stability: "Medium",
    revenueTrend: "Up 6% YoY",
    netProfitTrend: "Up 5% YoY",
    debtToEquity: "7.85",
    operatingCashFlow: "Mixed",
    roe: "13.5%",
    promoterPledge: "0%",
    evidence: [
      "Frequently attracts market attention because of price accessibility and retail interest.",
      "Profitable, but high leverage means it should be reviewed with extra care.",
      "Good for a watchlist card because users often compare yield, valuation, and government backing."
    ]
  },
  {
    name: "Tata Consumer Products",
    symbol: "TATACONSUM",
    bucket: "Long Term",
    price: "Rs1,178",
    dayChange: -0.4,
    priceBucket: "Rs500-2000",
    volumeBucket: "High Volume",
    profitStatus: "Profitable",
    stability: "High",
    revenueTrend: "Up 10% YoY",
    netProfitTrend: "Up 11% YoY",
    debtToEquity: "0.14",
    operatingCashFlow: "Positive",
    roe: "16.8%",
    promoterPledge: "0%",
    evidence: [
      "Consumer-facing businesses can offer steadier demand than highly cyclical sectors.",
      "Healthy profitability and low debt improve long-term comfort for conservative users.",
      "Widely known brand can help older users feel more confident reading the card."
    ]
  },
  {
    name: "Suzlon Energy",
    symbol: "SUZLON",
    bucket: "Short Term",
    price: "Rs58",
    dayChange: 3.2,
    priceBucket: "Under Rs100",
    volumeBucket: "Volume Spike",
    profitStatus: "Profitable",
    stability: "Needs Review",
    revenueTrend: "Up 8% YoY",
    netProfitTrend: "Volatile",
    debtToEquity: "0.28",
    operatingCashFlow: "Mixed",
    roe: "15.6%",
    promoterPledge: "0%",
    evidence: [
      "Low share price and sharp volume shifts make it popular for short-term watchlists.",
      "Business quality has improved, but earnings trend is still less steady than mature large-caps.",
      "This is the type of stock that needs clear warnings and plain-language explanation."
    ]
  },
  {
    name: "Zomato",
    symbol: "ETERNAL",
    bucket: "Watchlist",
    price: "Rs214",
    dayChange: -1.1,
    priceBucket: "Rs100-500",
    volumeBucket: "High Volume",
    profitStatus: "Profitable",
    stability: "Medium",
    revenueTrend: "Up 23% YoY",
    netProfitTrend: "Improving",
    debtToEquity: "0.05",
    operatingCashFlow: "Positive",
    roe: "9.8%",
    promoterPledge: "0%",
    evidence: [
      "Fast revenue growth and strong user attention keep it on many watchlists.",
      "Valuation and competitive pressure make it more of a monitor closely card than a calm long-term card.",
      "Low debt helps, but stability depends on margin consistency."
    ]
  },
  {
    name: "Vodafone Idea",
    symbol: "IDEA",
    bucket: "Watchlist",
    price: "Rs14",
    dayChange: -2.9,
    priceBucket: "Under Rs100",
    volumeBucket: "High Volume",
    profitStatus: "Loss-making",
    stability: "Needs Review",
    revenueTrend: "Flat",
    netProfitTrend: "Negative",
    debtToEquity: "Very High",
    operatingCashFlow: "Negative",
    roe: "Negative",
    promoterPledge: "Not Ideal",
    evidence: [
      "Included as an example of a high-interest stock that still carries major financial risk.",
      "Losses, leverage, and funding concerns mean the card should warn users clearly.",
      "A good product should show risky names, but label them honestly."
    ]
  }
];

const searchInput = document.querySelector("#search-input");
const bucketFilter = document.querySelector("#bucket-filter");
const priceFilter = document.querySelector("#price-filter");
const volumeFilter = document.querySelector("#volume-filter");
const profitFilter = document.querySelector("#profit-filter");
const stabilityFilter = document.querySelector("#stability-filter");
const stockGrid = document.querySelector("#stock-grid");
const filterSummary = document.querySelector("#filter-summary");
const template = document.querySelector("#stock-card-template");

const totalCount = document.querySelector("#total-count");
const profitableCount = document.querySelector("#profitable-count");
const stableCount = document.querySelector("#stable-count");

function formatChange(value) {
  const arrow = value >= 0 ? "▲" : "▼";
  const sign = value >= 0 ? "+" : "";
  return `${arrow} ${sign}${value.toFixed(1)}% today`;
}

function getFilteredStocks() {
  const searchValue = searchInput.value.trim().toLowerCase();

  return stocks.filter((stock) => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchValue) ||
      stock.symbol.toLowerCase().includes(searchValue);
    const matchesBucket = bucketFilter.value === "all" || stock.bucket === bucketFilter.value;
    const matchesPrice = priceFilter.value === "all" || stock.priceBucket === priceFilter.value;
    const matchesVolume = volumeFilter.value === "all" || stock.volumeBucket === volumeFilter.value;
    const matchesProfit = profitFilter.value === "all" || stock.profitStatus === profitFilter.value;
    const matchesStability = stabilityFilter.value === "all" || stock.stability === stabilityFilter.value;

    return (
      matchesSearch &&
      matchesBucket &&
      matchesPrice &&
      matchesVolume &&
      matchesProfit &&
      matchesStability
    );
  });
}

function updateSummary(filteredStocks) {
  totalCount.textContent = `${stocks.length} Stocks`;
  profitableCount.textContent = `${stocks.filter((stock) => stock.profitStatus === "Profitable").length}`;
  stableCount.textContent = `${stocks.filter((stock) => stock.stability === "High").length}`;

  const summaryParts = [];

  if (bucketFilter.value !== "all") {
    summaryParts.push(bucketFilter.value);
  }
  if (priceFilter.value !== "all") {
    summaryParts.push(priceFilter.value);
  }
  if (volumeFilter.value !== "all") {
    summaryParts.push(volumeFilter.value);
  }
  if (profitFilter.value !== "all") {
    summaryParts.push(profitFilter.value);
  }
  if (stabilityFilter.value !== "all") {
    summaryParts.push(stabilityFilter.value);
  }
  if (searchInput.value.trim()) {
    summaryParts.push(`search for "${searchInput.value.trim()}"`);
  }

  if (summaryParts.length === 0) {
    filterSummary.textContent = `Showing ${filteredStocks.length} demo stock cards. Use the filters above to simplify the list.`;
    return;
  }

  filterSummary.textContent = `Showing ${filteredStocks.length} stock cards for ${summaryParts.join(", ")}.`;
}

function createTag(text, extraClassName) {
  const tag = document.createElement("span");
  tag.textContent = text;
  tag.className = `tag ${extraClassName}`.trim();
  return tag;
}

function renderStocks() {
  const filteredStocks = getFilteredStocks();
  updateSummary(filteredStocks);
  stockGrid.innerHTML = "";

  if (filteredStocks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No stocks match these filters. Try clearing one or two filters.";
    stockGrid.appendChild(emptyState);
    return;
  }

  filteredStocks.forEach((stock) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".stock-card");
    const changeEl = node.querySelector(".stock-change");

    node.querySelector(".stock-bucket").textContent = stock.bucket;
    node.querySelector(".stock-name").textContent = stock.name;
    node.querySelector(".stock-symbol").textContent = stock.symbol;
    node.querySelector(".stock-price").textContent = stock.price;

    changeEl.textContent = formatChange(stock.dayChange);
    changeEl.classList.add(stock.dayChange >= 0 ? "up" : "down");

    const tagRow = node.querySelector(".tag-row");
    tagRow.innerHTML = "";
    tagRow.appendChild(createTag(stock.priceBucket, "price-tag"));
    tagRow.appendChild(createTag(stock.volumeBucket, "volume-tag"));
    tagRow.appendChild(
      createTag(stock.stability, stock.stability === "High" ? "stability-high" : stock.stability === "Medium" ? "stability-medium" : "stability-low")
    );
    tagRow.appendChild(
      createTag(stock.profitStatus, stock.profitStatus === "Profitable" ? "profit-good" : "profit-bad")
    );

    node.querySelector(".revenue-trend").textContent = stock.revenueTrend;
    node.querySelector(".profit-trend").textContent = stock.netProfitTrend;
    node.querySelector(".debt-level").textContent = stock.debtToEquity;

    const cashFlowEl = node.querySelector(".cash-flow");
    cashFlowEl.textContent = stock.operatingCashFlow;
    cashFlowEl.classList.add(stock.operatingCashFlow === "Positive" ? "cash-good" : stock.operatingCashFlow === "Negative" ? "cash-bad" : "");

    node.querySelector(".roe").textContent = stock.roe;
    node.querySelector(".pledge").textContent = stock.promoterPledge;

    const evidenceList = node.querySelector(".evidence-list");
    stock.evidence.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      evidenceList.appendChild(li);
    });

    card.dataset.bucket = stock.bucket;
    stockGrid.appendChild(node);
  });
}

[
  searchInput,
  bucketFilter,
  priceFilter,
  volumeFilter,
  profitFilter,
  stabilityFilter
].forEach((control) => {
  control.addEventListener("input", renderStocks);
  control.addEventListener("change", renderStocks);
});

renderStocks();
