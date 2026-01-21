/* =========================================================
   app.js
   Loads content.json and renders dynamic sections
   ========================================================= */
function resizeAirtableEmbeds() {
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  document.querySelectorAll("iframe.airtable-embed").forEach((iframe) => {
    iframe.style.height = isMobile ? "900px" : "600px";
  });
}

window.addEventListener("load", resizeAirtableEmbeds);
window.addEventListener("resize", resizeAirtableEmbeds);


async function loadContent() {
  try {
    const response = await fetch("./content.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`content.json not found (${response.status})`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error loading content.json:", err);
    return null;
  }
}

/* Utility: create an element */
function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(options).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  });

  children.forEach((child) => {
    node.appendChild(
      typeof child === "string" ? document.createTextNode(child) : child
    );
  });

  return node;
}

/* ---------------------------------------------------------
   Announcements (index.html)
   --------------------------------------------------------- */
function renderAnnouncements(data) {
  const list = document.getElementById("announcements");
  if (!list || !data?.announcements) return;

  list.innerHTML = "";

  data.announcements.forEach((item) => {
    const li = document.createElement("li");

    if (item.url) {
      const a = el("a", { href: item.url }, [item.text]);
      a.style.textDecoration = "none";
      a.style.borderBottom = "1px dashed rgba(167,179,195,.4)";
      a.style.color = "var(--text)";
      li.appendChild(a);
    } else {
      li.textContent = item.text;
    }

    list.appendChild(li);
  });
}

/* ---------------------------------------------------------
   Links page (links.html)
   --------------------------------------------------------- */
function renderLinks(data) {
  const container = document.getElementById("linksByGroup");
  if (!container || !data?.linkGroups) return;

  container.innerHTML = "";

  data.linkGroups.forEach((group) => {
    const groupEl = el("div", { class: "group" }, [
      el("div", { class: "group-title" }, [
        el("h2", {}, [group.title]),
        el("span", { class: "pill" }, [
          `${group.links.length} link${group.links.length !== 1 ? "s" : ""}`
        ])
      ])
    ]);

    const linksGrid = el("div", { class: "links" });

    group.links.forEach((link) => {
      linksGrid.appendChild(
        el(
          "a",
          {
            class: "link",
            href: link.url,
            target: "_blank",
            rel: "noopener noreferrer"
          },
          [
            el("div", {}, [link.label]),
            el("small", {}, [link.note || ""])
          ]
        )
      );
    });

    groupEl.appendChild(linksGrid);
    container.appendChild(groupEl);
  });
}

/* ---------------------------------------------------------
   Dashboards & Forms (iframe embeds)
   --------------------------------------------------------- */
function renderEmbeds(targetId, items) {
  const container = document.getElementById(targetId);
  if (!container || !Array.isArray(items)) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const card = el("div", { class: "group" }, [
      el("div", { class: "group-title" }, [
        el("h2", {}, [item.title || "Embed"]),
        el("span", { class: "pill" }, ["Airtable"])
      ]),
      el("p", { class: "muted" }, [item.description || ""])
    ]);

    const embed = el("div", { class: "embed" }, [
      el("iframe", {
        src: item.embedUrl,
        loading: "lazy",
        referrerpolicy: "no-referrer-when-downgrade"
      })
    ]);

    card.appendChild(embed);
    container.appendChild(card);
  });
}

/* ---------------------------------------------------------
   Footer info
   --------------------------------------------------------- */
function setBuildInfo() {
  const node = document.getElementById("buildInfo");
  if (!node) return;

  const now = new Date();
  node.textContent =
    "Updated " +
    now.toLocaleDateString() +
    " " +
    now.toLocaleTimeString();
}

/* ---------------------------------------------------------
   Initialize
   --------------------------------------------------------- */
(async function init() {
  setBuildInfo();

  const data = await loadContent();
  if (!data) return;

  renderAnnouncements(data);
  renderLinks(data);
  renderEmbeds("dashboards", data.dashboards);
  renderEmbeds("forms", data.forms);
})();
