const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");

let allItems = [];
let lastCount = -1;

function setStatus(text) {
  statusEl.textContent = text;
}

function render(items) {
  listEl.innerHTML = "";
  if (!items.length) {
    emptyEl.classList.remove("hidden");
    return;
  }
  emptyEl.classList.add("hidden");

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "list-item";

    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.name;
    link.target = "_blank";
    link.rel = "noreferrer";

    li.appendChild(link);
    fragment.appendChild(li);
  });
  listEl.appendChild(fragment);
}

function filterItems() {
  const term = searchEl.value.trim().toLowerCase();
  if (!term) {
    render(allItems);
    return;
  }
  const filtered = allItems.filter((item) => item.name.toLowerCase().includes(term));
  render(filtered);
}

async function loadAnimations() {
  try {
    const res = await fetch("/api/animations", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Request failed");
    }
    const data = await res.json();
    allItems = Array.isArray(data.items) ? data.items : [];

    if (allItems.length !== lastCount) {
      lastCount = allItems.length;
      filterItems();
    } else if (searchEl.value.trim() !== "") {
      filterItems();
    }
    setStatus(`Updated ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    setStatus("Unable to load animations");
  }
}

searchEl.addEventListener("input", () => {
  filterItems();
});

loadAnimations();
setInterval(loadAnimations, 3000);
