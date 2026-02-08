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

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = item.name;

    const preview = document.createElement("div");
    preview.className = "preview";
    preview.dataset.src = item.url;

    const link = document.createElement("a");
    link.className = "item-link";
    link.href = item.url;
    link.textContent = "Open JSON";
    link.target = "_blank";
    link.rel = "noreferrer";

    li.appendChild(preview);
    li.appendChild(title);
    li.appendChild(link);
    fragment.appendChild(li);
  });
  listEl.appendChild(fragment);

  document.querySelectorAll(".preview").forEach((node) => {
    const src = node.dataset.src;
    if (!src || !window.lottie) {
      return;
    }
    try {
      window.lottie.loadAnimation({
        container: node,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: src,
      });
    } catch {
      // If a JSON is not a valid Lottie animation, keep the empty box.
    }
  });
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
