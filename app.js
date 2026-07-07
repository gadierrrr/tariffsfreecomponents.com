const DATA_URL = "data/suppliers.json";
const INITIAL_VISIBLE_COUNT = 18;

let suppliers = [];
let visibleCount = INITIAL_VISIBLE_COUNT;
let activeRfqSupplier = null;

const searchInput = document.querySelector("#searchInput");
const industryFilter = document.querySelector("#industryFilter");
const originFilter = document.querySelector("#originFilter");
const verifyFilter = document.querySelector("#verifyFilter");
const dutyFilter = document.querySelector("#dutyFilter");
const clearFilters = document.querySelector("#clearFilters");
const listingGrid = document.querySelector("#listingGrid");
const resultCount = document.querySelector("#resultCount");
const loadMore = document.querySelector("#loadMore");
const bomInput = document.querySelector("#bomInput");
const analyzeBom = document.querySelector("#analyzeBom");
const bomResult = document.querySelector("#bomResult");
const modal = document.querySelector("#rfqModal");
const modalSupplier = document.querySelector("#modalSupplier");
const modalSupplierId = document.querySelector("#modalSupplierId");
const closeModal = document.querySelector("#closeModal");
const rfqForm = document.querySelector("#rfqForm");
const supplierForm = document.querySelector("#supplierForm");
const stats = {
  total: document.querySelector("#statTotalSuppliers"),
  priority: document.querySelector("#statPrioritySuppliers"),
  documented: document.querySelector("#statDocumentedSuppliers"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitList(value) {
  return String(value ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSupplier(row) {
  const countries = splitList(row.country_focus);
  const htsFamilies = splitList(row.likely_hts_families);
  const targetComponents = splitList(row.target_components);
  const priority = Number(row.outreach_priority || 3);
  const leadScore = Number(row.lead_score || 0);
  const dutyProfile = deriveDutyProfile(row);

  return {
    id: row.supplier_id,
    supplier: row.company_name,
    website: row.website,
    sourceUrl: row.source_url,
    part: row.subcategory || row.category,
    industry: row.category,
    origin: countries[0] || "Multiple",
    countries,
    hts: htsFamilies.join(", ") || "Review needed",
    htsFamilies,
    verification: row.verification_status || "Unverified candidate",
    duty: dutyProfile,
    lead: priority === 1 ? "Priority outreach" : priority === 2 ? "Qualified prospect" : "Longer-cycle target",
    moq: `Lead score ${leadScore}`,
    summary: row.tariff_advantage_hypothesis || row.buyer_fit || "Supplier candidate for tariff-advantaged sourcing review.",
    buyerFit: row.buyer_fit,
    evidenceNeeded: row.evidence_needed,
    tags: [
      row.category,
      row.subcategory,
      ...countries.slice(0, 2),
      dutyProfile,
      row.verification_status,
    ].filter(Boolean),
    premium: priority === 1,
    priority,
    leadScore,
    targetComponents,
  };
}

function deriveDutyProfile(row) {
  const text = `${row.country_focus} ${row.tariff_advantage_hypothesis} ${row.notes}`.toLowerCase();
  if (text.includes("mexico") || text.includes("canada") || text.includes("usmca") || text.includes("north american")) {
    return "North America source";
  }
  if (text.includes("alternative")) {
    return "Alternative source";
  }
  if (text.includes("united states") || text.includes("domestic") || text.includes("made-in-usa")) {
    return "US manufacturing candidate";
  }
  return "Verification needed";
}

function supplierMatches(supplier) {
  const query = searchInput.value.trim().toLowerCase();
  const queryMatch = [
    supplier.part,
    supplier.supplier,
    supplier.hts,
    supplier.summary,
    supplier.buyerFit,
    supplier.evidenceNeeded,
    ...supplier.tags,
    ...supplier.targetComponents,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);

  return (
    (!query || queryMatch) &&
    (industryFilter.value === "all" || supplier.industry === industryFilter.value) &&
    (originFilter.value === "all" || supplier.countries.includes(originFilter.value)) &&
    (verifyFilter.value === "all" || supplier.verification === verifyFilter.value) &&
    (dutyFilter.value === "all" || supplier.duty === dutyFilter.value)
  );
}

function getMatches() {
  return suppliers
    .filter(supplierMatches)
    .sort((a, b) => {
      if (Number(b.premium) !== Number(a.premium)) return Number(b.premium) - Number(a.premium);
      return b.leadScore - a.leadScore;
    });
}

function renderStats() {
  if (!stats.total) return;
  stats.total.textContent = suppliers.length;
  stats.priority.textContent = suppliers.filter((supplier) => supplier.priority === 1).length;
  stats.documented.textContent = suppliers.filter((supplier) => supplier.verification === "Documented candidate").length;
}

function renderListings() {
  const matches = getMatches();
  const visibleMatches = matches.slice(0, visibleCount);

  resultCount.textContent = matches.length;

  if (!matches.length) {
    listingGrid.innerHTML = `
      <article class="listing-card">
        <div class="listing-body">
          <h3>No candidates match these filters</h3>
          <p>Try a broader category, origin, or verification filter. The sourcing team can also run a custom supplier scout for this component family.</p>
        </div>
      </article>
    `;
    loadMore.hidden = true;
    return;
  }

  listingGrid.innerHTML = visibleMatches.map(renderSupplierCard).join("");
  loadMore.hidden = matches.length <= visibleCount;
  loadMore.textContent = `Show ${Math.min(INITIAL_VISIBLE_COUNT, matches.length - visibleCount)} more suppliers`;

  document.querySelectorAll("[data-rfq]").forEach((button) => {
    button.addEventListener("click", () => {
      const supplier = matches.find((item) => item.id === button.dataset.rfq);
      if (supplier) openRfqModal(supplier);
    });
  });
}

function renderSupplierCard(supplier) {
  const tags = supplier.tags.slice(0, 5).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const components = supplier.targetComponents.slice(0, 3).join("; ") || supplier.part;

  return `
    <article class="listing-card ${supplier.premium ? "premium" : ""}">
      <div class="listing-body">
        <div class="listing-top">
          <div>
            <h3>${escapeHtml(supplier.part)}</h3>
            <div class="supplier-name">${escapeHtml(supplier.supplier)}</div>
          </div>
          <span class="badge ${supplier.premium ? "sponsored" : ""}">
            ${supplier.premium ? "Priority target" : escapeHtml(supplier.verification)}
          </span>
        </div>
        <p>${escapeHtml(supplier.summary)}</p>
        <div class="component-note">${escapeHtml(components)}</div>
        <div class="listing-tags">${tags}</div>
        <div class="listing-meta">
          <div class="metric"><span>HTS families</span><strong>${escapeHtml(supplier.hts)}</strong></div>
          <div class="metric"><span>Country focus</span><strong>${escapeHtml(supplier.countries.join(", ") || "Review")}</strong></div>
          <div class="metric"><span>Pipeline</span><strong>${escapeHtml(supplier.lead)}</strong></div>
          <div class="metric"><span>Score</span><strong>${escapeHtml(supplier.moq)}</strong></div>
        </div>
      </div>
      <div class="listing-actions">
        <a class="text-button" href="${escapeHtml(supplier.website)}" target="_blank" rel="noopener">Website</a>
        <button class="text-button" type="button" data-rfq="${escapeHtml(supplier.id)}">Request quote</button>
      </div>
    </article>
  `;
}

function openRfqModal(supplier) {
  activeRfqSupplier = supplier;
  modalSupplier.textContent = `${supplier.supplier} is a ${supplier.verification.toLowerCase()} for ${supplier.part}. Ask for product-level origin, HTS, lead time, and documentation before relying on tariff treatment.`;
  modalSupplierId.value = supplier.id;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeRfqModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activeRfqSupplier = null;
}

function analyzeBomLines() {
  const lines = bomInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    bomResult.textContent = "Add at least two BOM lines to generate a sourcing brief.";
    return;
  }

  const text = lines.join(" ").toLowerCase();
  const relevant = suppliers.filter((supplier) => {
    const supplierText = [supplier.part, supplier.hts, ...supplier.targetComponents, ...supplier.tags].join(" ").toLowerCase();
    return text.split(/\W+/).some((token) => token.length > 4 && supplierText.includes(token));
  });
  const fallback = relevant.length ? relevant : suppliers.filter((supplier) => supplier.priority === 1).slice(0, 6);
  const htsFamilies = [...new Set(fallback.flatMap((supplier) => supplier.htsFamilies))].slice(0, 8);

  bomResult.innerHTML = `
    <strong>${escapeHtml(lines.length)} BOM lines parsed.</strong>
    Review likely HTS families: ${escapeHtml(htsFamilies.join(", ") || "classification needed")}.
    Found ${escapeHtml(fallback.length)} candidate suppliers for RFQ screening.
  `;
}

async function loadSuppliers() {
  listingGrid.innerHTML = `
    <article class="listing-card">
      <div class="listing-body">
        <h3>Loading supplier candidates</h3>
        <p>Reading the launch database and preparing buyer filters.</p>
      </div>
    </article>
  `;

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Supplier data returned ${response.status}`);
    const rows = await response.json();
    suppliers = rows.map(normalizeSupplier);
    renderStats();
    renderListings();
  } catch (error) {
    resultCount.textContent = "0";
    loadMore.hidden = true;
    listingGrid.innerHTML = `
      <article class="listing-card">
        <div class="listing-body">
          <h3>Supplier data could not load</h3>
          <p>The marketplace data file is unavailable. Check that <code>${escapeHtml(DATA_URL)}</code> is deployed with the site.</p>
        </div>
      </article>
    `;
    console.error(error);
  }
}

[searchInput, industryFilter, originFilter, verifyFilter, dutyFilter].forEach((control) => {
  control.addEventListener("input", () => {
    visibleCount = INITIAL_VISIBLE_COUNT;
    renderListings();
  });
});

clearFilters.addEventListener("click", () => {
  searchInput.value = "";
  industryFilter.value = "all";
  originFilter.value = "all";
  verifyFilter.value = "all";
  dutyFilter.value = "all";
  visibleCount = INITIAL_VISIBLE_COUNT;
  renderListings();
});

loadMore.addEventListener("click", () => {
  visibleCount += INITIAL_VISIBLE_COUNT;
  renderListings();
});

analyzeBom.addEventListener("click", analyzeBomLines);
closeModal.addEventListener("click", closeRfqModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeRfqModal();
});

rfqForm.addEventListener("submit", () => {
  if (activeRfqSupplier) {
    modalSupplierId.value = activeRfqSupplier.id;
  }
});

supplierForm.addEventListener("submit", () => {
  const submitButton = supplierForm.querySelector("button[type='submit']");
  submitButton.textContent = "Submitting...";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeRfqModal();
  }
});

loadSuppliers();
