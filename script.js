const deck = document.querySelector(".snap-deck");
const panels = [...document.querySelectorAll(".panel")];
const dotsWrap = document.querySelector(".dots");
const progressFill = document.querySelector(".progress-bar span");
const slideStatus = document.querySelector("#slideStatus");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const menuButtons = [...document.querySelectorAll(".section-menu button")];

const patternData = {
  pipelines: {
    label: "Use Pipelines",
    title: "Complex orchestration with control flow and triggers.",
    text: "Use Data Factory Pipelines when the job needs Copy activity, parameters, if/else logic, ForEach loops, triggers, managed identity, gateways, or VNet integration.",
    icon: "assets/image6.png",
    detailTitle: "Pipelines: the workhorse.",
    intro: "When you need control flow, orchestration, and 200+ connectors, this is the natural next step from Azure Data Factory.",
    best: "Best for data engineers",
    body: "Use for multi-step jobs, on-prem ingestion, lift-and-shift from Azure Data Factory, parameters, triggers, and managed connectors.",
    features: [
      "200+ managed connectors across databases, files, SaaS, REST, and on-prem systems",
      "Control flow: If/else, ForEach, Until, Lookup, Set Variable, Switch",
      "Triggers, schedules, managed identity, gateway, and VNet integration"
    ]
  },
  dataflows: {
    label: "Use Dataflows Gen2",
    title: "Low-code transformation by an analyst.",
    text: "Use Dataflows Gen2 when analysts already know Power Query and need to shape messy source data into Lakehouse or Warehouse destinations.",
    icon: "assets/image7.png",
    detailTitle: "Dataflows Gen2: Power Query for the lakehouse.",
    intro: "Same Power Query experience from Excel and Power BI, running on Fabric compute and landing in OneLake.",
    best: "Best for citizen developers",
    body: "Use for citizen integration, Excel-shaped sources, exploratory shaping, and low-code transformations owned by the business.",
    features: [
      "Visual M-query editor with full M language underneath",
      "Analyst-friendly authoring with no SQL, Spark, or code required",
      "Native Lakehouse and Warehouse output with 150+ Power Query sources"
    ]
  },
  copyjob: {
    label: "Use Copy Job",
    title: "Bulk and incremental copy without choreography.",
    text: "Use Copy Job for the 80% case: pick a source, destination, copy mode, and schedule without building a DAG.",
    icon: "assets/image8.png",
    detailTitle: "Copy Job: the set-and-forget option.",
    intro: "A wizard-driven Fabric item for full or incremental source-to-destination copy without orchestration overhead.",
    best: "Best for anyone moving data",
    body: "Use when the requirement is simply to move data between systems with full or incremental copy, no transformations, and no control flow.",
    features: [
      "Wizard-driven setup: source, destination, schedule",
      "Full and incremental copy with watermark or change tracking",
      "Lowest CU profile for raw movement among the Data Factory items"
    ]
  },
  shortcuts: {
    label: "Use Shortcuts",
    title: "Zero-copy access to data where it already lives.",
    text: "Use Shortcuts when data already lives in ADLS Gen2, Amazon S3, Google Cloud Storage, Dataverse, or another OneLake.",
    icon: "assets/image9.png",
    detailTitle: "Shortcuts: ingestion without ingestion.",
    intro: "A virtual pointer from OneLake to external data. Reads happen on the source. No copy, no sync job, no drift.",
    best: "Best for architects",
    body: "Use when the customer wants to keep existing storage, governance, and bills while making the data available to Fabric workloads.",
    features: [
      "No duplication and zero OneLake storage cost for the shortcut itself",
      "Instant freshness because reads hit the source",
      "Cross-cloud targets: S3, GCS, Dataverse, ADLS Gen2, another OneLake"
    ]
  },
  mirroring: {
    label: "Use Mirroring",
    title: "Near-real-time operational database replication.",
    text: "Use Mirroring when the source is supported and the customer needs low-latency changes in OneLake without scheduled CDC pipelines.",
    icon: "assets/image10.png",
    detailTitle: "Mirroring: keeping OneLake in sync.",
    intro: "Continuous replication of operational databases into Delta tables in OneLake with no ETL code.",
    best: "Best for DBAs and engineers",
    body: "Use for supported OLTP sources that need continuous CDC, typically under one minute of latency, without maintaining pipelines.",
    features: [
      "Continuous change data capture from the source",
      "No Fabric CU consumed on the replicate side",
      "Supported and preview sources include Azure SQL, SQL Server, Cosmos DB, Snowflake, Databricks Unity Catalog, PostgreSQL, MySQL, and Oracle"
    ]
  }
};

let activeIndex = 0;
let isProgrammaticScroll = false;

function clampIndex(index) {
  return Math.max(0, Math.min(index, panels.length - 1));
}

function scrollToPanel(index) {
  const nextIndex = clampIndex(index);
  isProgrammaticScroll = true;
  panels[nextIndex].scrollIntoView({ behavior: "smooth", block: "start" });
  setActive(nextIndex);
  window.setTimeout(() => {
    isProgrammaticScroll = false;
  }, 450);
}

function setActive(index) {
  activeIndex = clampIndex(index);
  panels.forEach((panel, panelIndex) => {
    panel.classList.toggle("is-visible", panelIndex === activeIndex);
  });
  [...dotsWrap.children].forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === activeIndex);
    dot.setAttribute("aria-current", dotIndex === activeIndex ? "step" : "false");
  });
  const progress = ((activeIndex + 1) / panels.length) * 100;
  progressFill.style.height = `${progress}%`;
  slideStatus.textContent = `${activeIndex + 1} / ${panels.length}`;
  prevBtn.disabled = activeIndex === 0;
  nextBtn.disabled = activeIndex === panels.length - 1;
  const activeId = panels[activeIndex].id;
  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === activeId);
  });
}

function setupDots() {
  panels.forEach((panel, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to ${panel.dataset.title || `section ${index + 1}`}`);
    dot.addEventListener("click", () => scrollToPanel(index));
    dotsWrap.appendChild(dot);
  });
}

function setupIntersection() {
  const observer = new IntersectionObserver((entries) => {
    if (isProgrammaticScroll) return;
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = panels.indexOf(visible.target);
    if (index >= 0) setActive(index);
  }, {
    root: deck,
    threshold: [0.45, 0.65, 0.85]
  });

  panels.forEach((panel) => observer.observe(panel));
}

function setupNavigation() {
  prevBtn.addEventListener("click", () => scrollToPanel(activeIndex - 1));
  nextBtn.addEventListener("click", () => scrollToPanel(activeIndex + 1));

  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.dataset.target);
      const index = panels.indexOf(panel);
      if (index >= 0) scrollToPanel(index);
    });
  });

  document.addEventListener("keydown", (event) => {
    const tag = event.target.tagName.toLowerCase();
    if (["input", "textarea", "select"].includes(tag)) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      scrollToPanel(activeIndex + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      scrollToPanel(activeIndex - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      scrollToPanel(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      scrollToPanel(panels.length - 1);
    }
  });
}

function updateDecision(key) {
  const data = patternData[key];
  document.querySelector("#answerIcon").src = data.icon;
  document.querySelector("#answerLabel").textContent = data.label;
  document.querySelector("#answerTitle").textContent = data.title;
  document.querySelector("#answerText").textContent = data.text;
}

function updateDetail(key) {
  const data = patternData[key];
  document.querySelector("#detailTitle").textContent = data.detailTitle;
  document.querySelector("#detailIntro").textContent = data.intro;
  document.querySelector("#detailIcon").src = data.icon;
  document.querySelector("#detailBest").textContent = data.best;
  document.querySelector("#detailBody").textContent = data.body;
  const features = document.querySelector("#detailFeatures");
  features.replaceChildren(...data.features.map((feature) => {
    const span = document.createElement("span");
    span.textContent = feature;
    return span;
  }));
}

function setupInteractions() {
  document.querySelectorAll(".decision").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".decision").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateDecision(button.dataset.answer);
    });
  });

  document.querySelectorAll(".pattern-card").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".pattern-card").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateDetail(button.dataset.pattern);
      const detailIndex = panels.findIndex((panel) => panel.id === "pattern-detail");
      scrollToPanel(detailIndex);
    });
  });

  document.querySelectorAll("[data-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-detail]").forEach((item) => item.setAttribute("aria-selected", "false"));
      button.setAttribute("aria-selected", "true");
      updateDetail(button.dataset.detail);
    });
  });
}

setupDots();
setupNavigation();
setupIntersection();
setupInteractions();
setActive(0);
