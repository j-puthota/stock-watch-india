let stocks = [];

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

function renderError(message) {
  stockGrid.innerHTML = "";
  const errorState = document.createElement("div");
  errorState.className = "empty-state";
  errorState.textContent = message;
  stockGrid.appendChild(errorState);
  filterSummary.textContent = "The stock file could not be loaded.";
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
    node.querySelector(".stock-sector").textContent = stock.sector;
    node.querySelector(".stock-price").textContent = stock.price;
    node.querySelector(".stock-prev-close").textContent = `Prev close: ${stock.previousClose}`;

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
    node.querySelector(".week-high").textContent = stock.weekHigh;
    node.querySelector(".week-low").textContent = stock.weekLow;
    node.querySelector(".high-52w").textContent = stock.high52w;
    node.querySelector(".low-52w").textContent = stock.low52w;

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

async function loadStocks() {
  try {
    const response = await fetch("./data/stocks.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();

    if (!Array.isArray(payload)) {
      throw new Error("Stock data must be an array.");
    }

    stocks = payload;
    renderStocks();
  } catch (error) {
    console.error(error);
    renderError("The stock cards could not be loaded. Make sure data/stocks.json is present on the site.");
  }
}

loadStocks();
