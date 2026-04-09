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
      throw new Error(errors.join(" | "));
    }

    stocks = payload;
    stocks = stocks.map((stock) => ({
      ...stock,
      recommendationScore: stock.recommendationScore ?? computeScore(stock)
    }));
    resetFilters();
    renderStocks();
  } catch (error) {
    console.error(error);
    renderError("Stock data could not be loaded. Check data/stocks.json (or stocks.json at root) on GitHub Pages.");
  }
}

loadStocks();
