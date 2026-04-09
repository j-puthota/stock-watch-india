let stocks = [];
let visibleCount = 10;
const pageSize = 10;

const searchInput = document.querySelector("#search-input");
const bucketFilter = document.querySelector("#bucket-filter");
const priceFilter = document.querySelector("#price-filter");
const volumeFilter = document.querySelector("#volume-filter");
const profitFilter = document.querySelector("#profit-filter");
const stabilityFilter = document.querySelector("#stability-filter");
const stockGrid = document.querySelector("#stock-grid");
const filterSummary = document.querySelector("#filter-summary");
const template = document.querySelector("#stock-card-template");
const loadMoreButton = document.querySelector("#load-more-button");
const resetFiltersButton = document.querySelector("#reset-filters-button");

const totalCount = document.querySelector("#total-count");
const profitableCount = document.querySelector("#profitable-count");
const stableCount = document.querySelector("#stable-count");

function formatChange(value) {
  const arrow = value >= 0 ? "▲" : "▼";
  const sign = value >= 0 ? "+" : "";
  return `${arrow} ${sign}${value.toFixed(1)}% today`;
}

function renderError(message) {
  stockGrid.innerHTML = "";
  const errorState = document.createElement("div");
  errorState.className = "empty-state";
  errorState.textContent = message;
  stockGrid.appendChild(errorState);
  filterSummary.textContent = "The stock file could not be loaded.";
}

function parseNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeScore(stock) {
  let score = 50;
  const debt = parseNumber(stock.debtToEquity);
  const roe = parseNumber(stock.roe);

  if (stock.profitStatus === "Profitable") {
    score += 12;
  } else {
    score -= 18;
  }

  if (stock.operatingCashFlow === "Positive") {
    score += 10;
  } else if (stock.operatingCashFlow === "Negative") {
    score -= 10;
  }

  if (stock.volumeBucket === "Volume Spike") {
    score += 8;
  } else if (stock.volumeBucket === "High Volume") {
    score += 6;
  } else {
    score -= 4;
  }

  if (stock.stability === "High") {
    score += 14;
  } else if (stock.stability === "Medium") {
    score += 5;
  } else {
    score -= 10;
  }

  if (debt !== null) {
    if (debt <= 0.3) {
      score += 10;
    } else if (debt <= 1.2) {
      score += 3;
    } else if (debt > 3) {
      score -= 8;
    }
  }

  if (roe !== null) {
    if (roe >= 20) {
      score += 10;
    } else if (roe >= 12) {
      score += 5;
    } else if (roe < 8) {
      score -= 6;
    }
  }

  if (stock.bucket === "Long Term") {
    score += 8;
  } else if (stock.bucket === "Short Term") {
    score += 5;
  }

  return Math.max(1, Math.min(99, Math.round(score)));
}

function toInr(value) {
  if (value >= 100) {
    return `Rs${Math.round(value).toLocaleString("en-IN")}`;
  }
  return `Rs${value.toFixed(1).replace(".0", "")}`;
}

function buildFallbackStocks() {
  const seedNames = [
    ["Reliance Industries", "RELIANCE", "Energy"],
    ["TCS", "TCS", "Information Technology"],
    ["HDFC Bank", "HDFCBANK", "Banking"],
    ["ICICI Bank", "ICICIBANK", "Banking"],
    ["Infosys", "INFY", "Information Technology"],
    ["ITC", "ITC", "Consumer Staples"],
    ["Bharti Airtel", "BHARTIARTL", "Telecom"],
    ["Larsen & Toubro", "LT", "Infrastructure"],
    ["State Bank of India", "SBI", "Banking"],
    ["Axis Bank", "AXISBANK", "Banking"],
    ["Kotak Mahindra Bank", "KOTAKBANK", "Banking"],
    ["Bajaj Finance", "BAJFINANCE", "Financial Services"],
    ["Asian Paints", "ASIANPAINT", "Consumer"],
    ["Maruti Suzuki", "MARUTI", "Automobile"],
    ["Sun Pharmaceutical", "SUNPHARMA", "Pharmaceuticals"],
    ["Titan Company", "TITAN", "Retail"],
    ["UltraTech Cement", "ULTRACEMCO", "Cement"],
    ["Tata Motors", "TATAMOTORS", "Automobile"],
    ["NTPC", "NTPC", "Utilities"],
    ["Power Grid", "POWERGRID", "Utilities"],
    ["Tata Steel", "TATASTEEL", "Metals"],
    ["JSW Steel", "JSWSTEEL", "Metals"],
    ["Mahindra & Mahindra", "M&M", "Automobile"],
    ["Wipro", "WIPRO", "Information Technology"],
    ["Nestle India", "NESTLEIND", "Consumer Staples"],
    ["HCL Tech", "HCLTECH", "Information Technology"],
    ["Tech Mahindra", "TECHM", "Information Technology"],
    ["Adani Ports", "ADANIPORTS", "Infrastructure"],
    ["ONGC", "ONGC", "Energy"],
    ["Coal India", "COALINDIA", "Mining"]
  ];

  const result = [];

  for (let i = 0; i < 120; i += 1) {
    const base = seedNames[i % seedNames.length];
    const name = i < seedNames.length ? base[0] : `${base[0]} ${Math.floor(i / seedNames.length) + 1}`;
    const symbol = i < seedNames.length ? base[1] : `${base[1]}${Math.floor(i / seedNames.length) + 1}`;
    const sector = base[2];

    const rawPrice = 60 + ((i * 73) % 4400);
    const dayChange = ((((i * 19) % 70) - 35) / 10).toFixed(1);
    const dayChangeNum = Number(dayChange);
    const previousClose = rawPrice / (1 + dayChangeNum / 100);
    const high52 = rawPrice * (1.15 + (i % 5) * 0.02);
    const low52 = rawPrice * (0.7 - (i % 4) * 0.03);
    const weekHigh = rawPrice * (1.02 + (i % 3) * 0.01);
    const weekLow = rawPrice * (0.95 - (i % 3) * 0.01);
    const debt = ((i % 8) * 0.24).toFixed(2);
    const roeValue = (9 + (i % 14) * 1.1).toFixed(1);

    const priceBucket =
      rawPrice < 100 ? "Under Rs100" :
      rawPrice < 500 ? "Rs100-500" :
      rawPrice < 2000 ? "Rs500-2000" :
      "Above Rs2000";

    const volumeBucket =
      i % 9 === 0 ? "Low Liquidity" :
      i % 5 === 0 ? "Volume Spike" :
      "High Volume";

    const profitStatus = i % 17 === 0 ? "Loss-making" : "Profitable";
    const operatingCashFlow = profitStatus === "Loss-making" ? "Negative" : (i % 6 === 0 ? "Mixed" : "Positive");
    const stability = profitStatus === "Loss-making" ? "Needs Review" : (i % 4 === 0 ? "Medium" : "High");
    const bucket = stability === "High" ? "Long Term" : (volumeBucket === "Volume Spike" ? "Short Term" : "Watchlist");

    const stock = {
      name,
      symbol,
      sector,
      price: toInr(rawPrice),
      previousClose: toInr(previousClose),
      dayChange: dayChangeNum,
      priceBucket,
      volumeBucket,
      profitStatus,
      revenueTrend: `Up ${6 + (i % 11)}% YoY`,
      netProfitTrend: profitStatus === "Loss-making" ? "Negative" : `Up ${5 + (i % 9)}% YoY`,
      debtToEquity: profitStatus === "Loss-making" ? "Very High" : debt,
      operatingCashFlow,
      roe: profitStatus === "Loss-making" ? "Negative" : `${roeValue}%`,
      promoterPledge: i % 19 === 0 ? "Low" : "0%",
      high52w: toInr(high52),
      low52w: toInr(Math.max(20, low52)),
      weekHigh: toInr(weekHigh),
      weekLow: toInr(Math.max(15, weekLow)),
      bucket,
      stability,
      evidence: [
        `${sector} trend is a key driver for this stock.`,
        `${volumeBucket} is one reason this is being watched.`,
        profitStatus === "Profitable" ? "Profitability supports this card." : "Losses make this higher risk."
      ]
    };

    stock.recommendationScore = computeScore(stock);
    result.push(stock);
  }

  return result.sort((a, b) => b.recommendationScore - a.recommendationScore);
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
  profitableCount.textContent = `${Math.min(visibleCount, filteredStocks.length)} Shown`;
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
    filterSummary.textContent = `Showing ${Math.min(visibleCount, filteredStocks.length)} of ${filteredStocks.length} ranked stock cards. Use the filters above to narrow the list.`;
    return;
  }

  filterSummary.textContent = `Showing ${Math.min(visibleCount, filteredStocks.length)} of ${filteredStocks.length} stock cards for ${summaryParts.join(", ")}.`;
}

function resetFilters() {
  searchInput.value = "";
  bucketFilter.value = "all";
  priceFilter.value = "all";
  volumeFilter.value = "all";
  profitFilter.value = "all";
  stabilityFilter.value = "all";
  visibleCount = pageSize;
}

function createTag(text, extraClassName) {
  const tag = document.createElement("span");
  tag.textContent = text;
  tag.className = `tag ${extraClassName}`.trim();
  return tag;
}

function renderStocks() {
  const filteredStocks = getFilteredStocks()
    .slice()
    .sort((a, b) => (b.recommendationScore ?? computeScore(b)) - (a.recommendationScore ?? computeScore(a)));
  updateSummary(filteredStocks);
  stockGrid.innerHTML = "";

  if (filteredStocks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No stocks match these filters. Try clearing one or two filters.";
    stockGrid.appendChild(emptyState);
    loadMoreButton.hidden = true;
    return;
  }

  filteredStocks.slice(0, visibleCount).forEach((stock) => {
    const node = template.content.cloneNode(true);
    const changeEl = node.querySelector(".stock-change");

    node.querySelector(".stock-bucket").textContent = stock.bucket;
    node.querySelector(".stock-name").textContent = stock.name;
    node.querySelector(".stock-symbol").textContent = stock.symbol;
    node.querySelector(".stock-sector").textContent = stock.sector;
    node.querySelector(".stock-price").textContent = stock.price;
    node.querySelector(".stock-prev-close").textContent = `Prev close: ${stock.previousClose}`;
    node.querySelector(".stock-score").textContent = `Score ${stock.recommendationScore ?? computeScore(stock)}/99`;

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
    node.querySelector(".year-range").textContent = `${stock.low52w} - ${stock.high52w}`;
    node.querySelector(".profit-trend").textContent = stock.netProfitTrend;
    node.querySelector(".debt-level").textContent = stock.debtToEquity;

    const cashFlowEl = node.querySelector(".cash-flow");
    cashFlowEl.textContent = stock.operatingCashFlow;
    cashFlowEl.classList.add(stock.operatingCashFlow === "Positive" ? "cash-good" : stock.operatingCashFlow === "Negative" ? "cash-bad" : "");

    node.querySelector(".roe").textContent = stock.roe;
    node.querySelector(".pledge").textContent = stock.promoterPledge;
    node.querySelector(".week-high").textContent = stock.weekHigh || "Not available";
    node.querySelector(".week-low").textContent = stock.weekLow || "Not available";
    node.querySelector(".high-52w").textContent = stock.high52w || "Not available";
    node.querySelector(".low-52w").textContent = stock.low52w || "Not available";

    const evidenceList = node.querySelector(".evidence-list");
    const evidenceItems = Array.isArray(stock.evidence) && stock.evidence.length > 0
      ? stock.evidence
      : ["No evidence summary available yet."];

    evidenceItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      evidenceList.appendChild(li);
    });

    stockGrid.appendChild(node);
  });

  if (visibleCount >= filteredStocks.length) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "All Matching Stocks Shown";
  } else {
    loadMoreButton.disabled = false;
    loadMoreButton.textContent = "Show 10 More";
  }
}

[
  searchInput,
  bucketFilter,
  priceFilter,
  volumeFilter,
  profitFilter,
  stabilityFilter
].forEach((control) => {
  control.addEventListener("input", () => {
    visibleCount = pageSize;
    renderStocks();
  });
  control.addEventListener("change", () => {
    visibleCount = pageSize;
    renderStocks();
  });
});

loadMoreButton.addEventListener("click", () => {
  visibleCount += pageSize;
  renderStocks();
});

resetFiltersButton.addEventListener("click", () => {
  resetFilters();
  renderStocks();
});

async function loadStocks() {
  const dataCandidates = [
    "./data/stocks.json",
    "./stocks.json",
    "/data/stocks.json"
  ];
  const errors = [];

  try {
    let payload = null;

    for (const path of dataCandidates) {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) {
          errors.push(`${path} -> HTTP ${response.status}`);
          continue;
        }

        const parsed = await response.json();
        if (!Array.isArray(parsed)) {
          errors.push(`${path} -> JSON is not an array`);
          continue;
        }

        payload = parsed;
        break;
      } catch (candidateError) {
        errors.push(`${path} -> ${candidateError.message}`);
      }
    }

    if (!payload) {
      console.warn("Falling back to built-in stock universe:", errors.join(" | "));
      stocks = buildFallbackStocks();
      resetFilters();
      renderStocks();
      filterSummary.textContent = `Showing ${Math.min(visibleCount, stocks.length)} of ${stocks.length} cards using built-in fallback data because stock JSON could not be fetched.`;
      return;
    }

    stocks = payload.map((stock) => ({
      ...stock,
      recommendationScore: stock.recommendationScore ?? computeScore(stock)
    }));
    resetFilters();
    renderStocks();
  } catch (error) {
    console.error(error);
    stocks = buildFallbackStocks();
    resetFilters();
    renderStocks();
    filterSummary.textContent = `Showing ${Math.min(visibleCount, stocks.length)} of ${stocks.length} cards using built-in fallback data because stock JSON could not be fetched.`;
  }
}

loadStocks();
