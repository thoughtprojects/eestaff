function setStatus(msg, isError = false) {
  const s = document.getElementById("status");
  if (!s) return;
  s.textContent = msg;
  s.style.color = isError ? "#ffb4b4" : "var(--muted)";
  s.style.borderColor = isError ? "rgba(255,100,100,.45)" : "rgba(34,48,68,.8)";
}

function setBuildInfo() {
  const node = document.getElementById("buildInfo");
  if (!node) return;
  const d = new Date();
  node.textContent = `Updated ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

async function loadCurrentJson() {
  try {
    const res = await fetch("./content.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load content.json (${res.status})`);
    const data = await res.json();
    document.getElementById("jsonText").value = JSON.stringify(data, null, 2);
    setStatus("Loaded content.json.");
  } catch (e) {
    console.error(e);
    setStatus(String(e.message || e), true);
  }
}

function parseJsonFromTextarea() {
  const text = document.getElementById("jsonText").value.trim();
  if (!text) throw new Error("Textarea is empty.");
  return JSON.parse(text);
}

function validateJson() {
  try {
    const data = parseJsonFromTextarea();

    // Light “shape” checks (optional but helpful)
    if (!Array.isArray(data.announcements)) data.announcements = [];
    if (!Array.isArray(data.linkGroups)) data.linkGroups = [];
    if (!Array.isArray(data.dashboards)) data.dashboards = [];
    if (!Array.isArray(data.forms)) data.forms = [];

    setStatus("JSON is valid ✅");
  } catch (e) {
    setStatus(`JSON invalid: ${e.message}`, true);
  }
}

function formatJson() {
  try {
    const data = parseJsonFromTextarea();
    document.getElementById("jsonText").value = JSON.stringify(data, null, 2);
    setStatus("Formatted JSON.");
  } catch (e) {
    setStatus(`Cannot format: ${e.message}`, true);
  }
}

function downloadJson() {
  try {
    const data = parseJsonFromTextarea();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "content.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    setStatus("Downloaded content.json. Upload it to GitHub to publish changes.");
  } catch (e) {
    setStatus(`Cannot download: ${e.message}`, true);
  }
}

async function copyToClipboard() {
  try {
    const text = document.getElementById("jsonText").value;
    await navigator.clipboard.writeText(text);
    setStatus("Copied to clipboard.");
  } catch (e) {
    setStatus("Copy failed (browser permission issue).", true);
  }
}

function wireUp() {
  document.getElementById("btnLoad").addEventListener("click", loadCurrentJson);
  document.getElementById("btnValidate").addEventListener("click", validateJson);
  document.getElementById("btnFormat").addEventListener("click", formatJson);
  document.getElementById("btnDownload").addEventListener("click", downloadJson);
  document.getElementById("btnCopy").addEventListener("click", copyToClipboard);
}

setBuildInfo();
wireUp();
