/* Renders the publication, press and project tabs from the files in /data. */
const TYPES = {all:"All", J:"Journal", C:"Conference & workshop", B:"Book chapter", T:"Thesis", O:"Other"};
const TAG = {J:"Journal", C:"Conference", B:"Chapter", T:"Thesis", O:"Other"};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pubs = PUBS.map(([title,authors,venue,year,type,link]) => ({
  title, authors, venue, year, type,
  url: link.startsWith("http") ? link : SCH + link
}));
let state = {type:"all", q:""};

function authorsHTML(a){
  return a.split(", ").map(n => n === "J Schmidt" ? "<b>J Schmidt</b>" : esc(n)).join(", ");
}
function pubHTML(p){
  return `<li class="pub">
    <p class="pub-title"><a href="${esc(p.url)}">${esc(p.title)}</a></p>
    <p class="pub-authors">${authorsHTML(p.authors)}</p>
    <p class="pub-meta"><span class="venue">${esc(p.venue)}</span><span class="tag">${TAG[p.type]}</span></p>
  </li>`;
}
function renderPubs(){
  const q = state.q.trim().toLowerCase();
  let list = pubs.filter(p =>
    (state.type === "all" || p.type === state.type) &&
    (!q || (p.title + " " + p.authors + " " + p.venue + " " + p.year).toLowerCase().includes(q))
  );
  const out = document.getElementById("pub-list");
  document.getElementById("pub-count").textContent = list.length === pubs.length ? pubs.length : `${list.length} of ${pubs.length}`;
  if (!list.length){ out.innerHTML = `<p class="empty">No publications match “${esc(state.q)}”.</p>`; return; }
  const years = [...new Set(list.map(p => p.year))].sort((a,b) => b - a);
  out.innerHTML = years.map(y => `<div class="year-group"><div class="year">${y}</div><ul class="pubs">${
    list.filter(p => p.year === y).map(pubHTML).join("")}</ul></div>`).join("");
}
function renderFilters(){
  const box = document.getElementById("pub-filters");
  box.innerHTML = Object.entries(TYPES).map(([k,label]) => {
    const n = k === "all" ? pubs.length : pubs.filter(p => p.type === k).length;
    return `<button type="button" class="chip" data-type="${k}" aria-pressed="${state.type === k}">${label} · ${n}</button>`;
  }).join("");
  box.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
    state.type = b.dataset.type; renderFilters(); renderPubs();
  }));
}
function renderChart(){
  const counts = {}; pubs.forEach(p => counts[p.year] = (counts[p.year] || 0) + 1);
  const y0 = 2005, y1 = Math.max(...pubs.map(p => p.year));
  const years = []; for (let y = y0; y <= y1; y++) years.push(y);
  const max = Math.max(...Object.values(counts));
  const W = 280, H = 96, top = 12, base = H - 16, slot = W / years.length, bw = Math.max(slot - 3, 2);
  const yScale = v => (v / max) * (base - top);
  const bars = years.map((y,i) => {
    const v = counts[y] || 0, h = yScale(v), x = i * slot + (slot - bw) / 2;
    return v ? `<rect class="bar${y === y1 ? " now" : ""}" x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="1"><title>${y}: ${v}</title></rect>` : "";
  }).join("");
  const peakYear = years.find(y => counts[y] === max), pi = years.indexOf(peakYear);
  document.getElementById("chart").innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" x2="${W}" y1="${base}" y2="${base}"/>
      ${bars}
      <text x="${(pi * slot + slot / 2).toFixed(1)}" y="${(base - yScale(max) - 3).toFixed(1)}" text-anchor="middle">${max}</text>
      <text x="0" y="${H - 2}">${y0}</text>
      <text x="${W}" y="${H - 2}" text-anchor="end">${y1}</text>
    </svg>`;
}
function renderPress(){
  const fmt = d => d.length === 4 ? d : new Date(d + "T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  const list = [...PRESS].sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById("press-count").textContent = list.length;
  document.getElementById("press-list").innerHTML = list.map(p => `<li>
    <time datetime="${esc(p.date)}">${fmt(p.date)}</time>
    <div>
      <p class="outlet">${esc(p.outlet)} · <span class="kind">${esc(p.kind)}</span> · ${esc(p.lang)}</p>
      <h3><a href="${esc(p.url)}" ${p.lang === "DE" ? 'lang="de"' : ""}>${esc(p.title)}</a></h3>
      ${p.sum ? `<p class="sum">${esc(p.sum)}</p>` : ""}
    </div>
  </li>`).join("");
}

function renderProjects(){
  document.getElementById("project-count").textContent = PROJECTS.length;
  document.getElementById("project-list").innerHTML = PROJECTS.map(p => `<li class="project">
    <p class="kind">${esc(p.kind)}</p>
    <h3><a href="${esc(p.url)}">${esc(p.title)}</a></h3>
    <p class="sum">${esc(p.sum)}</p>
    <div class="actions">
      <a class="visit" href="${esc(p.url)}">Open project ↗</a>
      ${p.paper ? `<a class="paper" href="${esc(p.paper.url)}">Paper: ${esc(p.paper.label)}</a>` : ""}
    </div>
  </li>`).join("");
}

document.getElementById("pub-search").addEventListener("input", e => { state.q = e.target.value; renderPubs(); });
document.getElementById("copy-email").addEventListener("click", async e => {
  const btn = e.currentTarget, text = document.getElementById("email").textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
  catch { const r = document.createRange(); r.selectNodeContents(document.getElementById("email"));
          const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Selected"; }
  setTimeout(() => btn.textContent = "Copy", 1600);
});

/* tabs: click, arrow keys, and #publications / #press / #projects deep links */
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus){
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
  if (focus) tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => {
    selectTab(t);
    history.replaceState(null, "", "#" + t.getAttribute("aria-controls"));
  });
  t.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next, true);
  });
});
function tabFromHash(){
  const t = tabs.find(t => "#" + t.getAttribute("aria-controls") === location.hash);
  if (t) selectTab(t);
}
window.addEventListener("hashchange", tabFromHash);

renderFilters(); renderPubs(); renderChart(); renderPress(); renderProjects(); tabFromHash();
