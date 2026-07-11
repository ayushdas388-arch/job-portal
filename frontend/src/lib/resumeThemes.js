/**
 * Resume template library.
 *
 * Each theme is a pure function: (resume) => full HTML document string.
 * `resume` is your existing JSON Resume object (from toJSONResume()).
 * The returned HTML is self-contained (inline CSS) so it renders cleanly
 * inside an <iframe srcDoc={...}> for both thumbnails and full preview,
 * and prints to A4 without extra setup.
 *
 * Themes are grouped into categories so the gallery can show
 * "Modern", "Professional", etc. like a real resume site.
 */

// ---------------------------------------------------------------------------
// Small helpers shared by all themes
// ---------------------------------------------------------------------------

const esc = (s = "") =>
    String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const dateRange = (a, b) => {
    const start = a ? esc(a) : "";
    const end = b ? esc(b) : "Present";
    if (!start && !end) return "";
    return `${start}${start ? " - " : ""}${end}`;
};

const bullets = (arr = []) =>
    arr.filter(Boolean).map((h) => `<li>${esc(h)}</li>`).join("");

const skillList = (resume) => {
    const s = resume.skills || [];
    const kws = s.flatMap((g) => g.keywords || []);
    return kws.filter(Boolean);
};

// A shared HTML shell so every theme prints to A4 consistently.
const page = (bodyCss, bodyHtml, fontLink = "") => `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
${fontLink}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 0; }
  html, body { background: #eee; }
  .sheet {
    width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff;
    position: relative; overflow: hidden;
  }
  ul { list-style: none; }
  a { color: inherit; text-decoration: none; }
  @media print { html, body { background: #fff; } .sheet { margin: 0; box-shadow: none; } }
  ${bodyCss}
</style></head>
<body><div class="sheet">${bodyHtml}</div></body></html>`;

// ---------------------------------------------------------------------------
// MODERN
// ---------------------------------------------------------------------------

function modernAurora(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Inter', system-ui, sans-serif; color: oklch(28% 0.02 260); }
    .grid { display: grid; grid-template-columns: 68mm 1fr; min-height: 297mm; }
    .side { background: oklch(32% 0.09 260); color: oklch(96% 0.01 260); padding: 16mm 10mm; }
    .side .photo { width: 34mm; height: 34mm; border-radius: 50%; object-fit: cover;
      border: 3px solid oklch(70% 0.14 260); margin-bottom: 8mm; display:block; }
    .side h1 { font-size: 20pt; font-weight: 700; line-height: 1.1; margin-bottom: 2mm; }
    .side .label { color: oklch(78% 0.13 260); font-size: 10.5pt; font-weight: 600; margin-bottom: 8mm; }
    .side h3 { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .12em;
      color: oklch(78% 0.13 260); margin: 7mm 0 2.5mm; }
    .side p, .side li { font-size: 9pt; line-height: 1.5; word-break: break-word; }
    .side li { margin-bottom: 1.5mm; }
    .main { padding: 16mm 14mm; }
    .main section { margin-bottom: 8mm; }
    .main h2 { font-size: 12pt; font-weight: 700; color: oklch(45% 0.13 260);
      border-bottom: 2px solid oklch(90% 0.02 260); padding-bottom: 1.5mm; margin-bottom: 4mm; }
    .item { margin-bottom: 5mm; }
    .item .top { display: flex; justify-content: space-between; gap: 4mm; }
    .item .role { font-weight: 650; font-size: 10.5pt; }
    .item .org { color: oklch(50% 0.06 260); font-size: 9.5pt; }
    .item .when { color: oklch(60% 0.03 260); font-size: 8.5pt; white-space: nowrap; }
    .item ul { margin: 1.5mm 0 0 4mm; }
    .item li { font-size: 9pt; line-height: 1.5; list-style: disc; margin-bottom: 1mm; }
    .item p { font-size: 9pt; line-height: 1.5; }
  `;
    const body = `
    <div class="grid">
      <aside class="side">
        ${b.image ? `<img class="photo" src="${b.image}" />` : ""}
        <h1>${esc(b.name)}</h1>
        <div class="label">${esc(b.label)}</div>
        <h3>Contact</h3>
        <ul>
          ${b.email ? `<li>${esc(b.email)}</li>` : ""}
          ${b.phone ? `<li>${esc(b.phone)}</li>` : ""}
          ${b.location?.address ? `<li>${esc(b.location.address)}</li>` : ""}
          ${b.url ? `<li>${esc(b.url)}</li>` : ""}
        </ul>
        ${skillList(r).length ? `<h3>Skills</h3><ul>${skillList(r).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
        ${(r.certificates || []).length ? `<h3>Certifications</h3><ul>${r.certificates.map((c) => `<li>${esc(c.name)}</li>`).join("")}</ul>` : ""}
      </aside>
      <main class="main">
        ${b.summary ? `<section><h2>Profile</h2><p>${esc(b.summary)}</p></section>` : ""}
        ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `
          <div class="item"><div class="top">
            <div><div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)}</div></div>
            <div class="when">${dateRange(w.startDate, w.endDate)}</div>
          </div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
        ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `
          <div class="item"><div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
        ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => `
          <div class="item"><div class="top">
            <div><div class="role">${esc(e.area)}</div><div class="org">${esc(e.institution)}</div></div>
            <div class="when">${dateRange(e.startDate, e.endDate)}</div>
          </div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      </main>
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">`);
}

function modernVertex(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Poppins', system-ui, sans-serif; color: oklch(30% 0.01 250); }
    .band { background: oklch(58% 0.15 250); color: #fff; padding: 14mm 16mm; display:flex; gap: 10mm; align-items:center; }
    .band .photo { width: 30mm; height: 30mm; border-radius: 6mm; object-fit: cover; border: 2px solid rgba(255,255,255,.5); }
    .band h1 { font-size: 24pt; font-weight: 700; }
    .band .label { font-size: 11pt; font-weight: 500; opacity: .92; margin-top: 1mm; }
    .band .meta { margin-top: 3mm; font-size: 8.5pt; opacity: .9; display:flex; flex-wrap:wrap; gap: 2mm 6mm; }
    .wrap { padding: 12mm 16mm; }
    section { margin-bottom: 7mm; }
    h2 { font-size: 11pt; font-weight: 700; color: oklch(50% 0.15 250); letter-spacing: .04em;
      text-transform: uppercase; margin-bottom: 3mm; display:flex; align-items:center; gap: 3mm; }
    h2::after { content:""; flex:1; height:1px; background: oklch(90% 0.02 250); }
    .item { margin-bottom: 4.5mm; }
    .item .top { display:flex; justify-content:space-between; gap:4mm; }
    .role { font-weight: 600; font-size: 10.5pt; }
    .org { color: oklch(52% 0.05 250); font-size: 9.5pt; }
    .when { color: oklch(62% 0.03 250); font-size: 8.5pt; white-space: nowrap; }
    ul.hl { margin: 1.5mm 0 0 4mm; } ul.hl li { list-style: disc; font-size: 9pt; line-height: 1.5; margin-bottom: 1mm; }
    p { font-size: 9pt; line-height: 1.55; }
    .chips { display:flex; flex-wrap:wrap; gap: 2mm; }
    .chip { background: oklch(95% 0.03 250); color: oklch(45% 0.12 250); font-size: 8.5pt;
      padding: 1.5mm 3mm; border-radius: 2mm; font-weight: 500; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
    const body = `
    <div class="band">
      ${b.image ? `<img class="photo" src="${b.image}" />` : ""}
      <div><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div></div>
    </div>
    <div class="wrap">
      ${b.summary ? `<section><h2>Summary</h2><p>${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `
        <div class="item"><div class="top"><div><div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)}</div></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul class="hl">${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${skillList(r).length ? `<section><h2>Skills</h2><div class="chips">${skillList(r).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></section>` : ""}
      ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => `<div class="item"><div class="top"><div><div class="role">${esc(e.area)}</div><div class="org">${esc(e.institution)}</div></div><div class="when">${dateRange(e.startDate, e.endDate)}</div></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.certificates || []).length ? `<section><h2>Certifications</h2><div class="chips">${r.certificates.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("")}</div></section>` : ""}
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">`);
}

function modernSidebar(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Manrope', system-ui, sans-serif; color: oklch(28% 0.015 200); }
    .grid { display:grid; grid-template-columns: 1fr 60mm; min-height: 297mm; }
    .main { padding: 16mm 12mm 16mm 16mm; }
    .side { background: oklch(96% 0.02 195); padding: 16mm 12mm; }
    h1 { font-size: 23pt; font-weight: 800; letter-spacing: -0.02em; color: oklch(35% 0.09 195); }
    .label { font-size: 11pt; font-weight: 600; color: oklch(55% 0.08 195); margin: 1mm 0 6mm; }
    .main section { margin-bottom: 7mm; }
    .main h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: .1em; color: oklch(50% 0.1 195); font-weight: 700; margin-bottom: 3mm; }
    .item { margin-bottom: 4.5mm; }
    .top { display:flex; justify-content:space-between; gap:4mm; }
    .role { font-weight: 700; font-size: 10.5pt; }
    .org { color: oklch(52% 0.04 195); font-size: 9.5pt; }
    .when { color: oklch(64% 0.03 195); font-size: 8.5pt; white-space:nowrap; }
    ul.hl { margin: 1.5mm 0 0 4mm; } ul.hl li { list-style: disc; font-size: 9pt; line-height: 1.5; margin-bottom: 1mm; }
    p { font-size: 9pt; line-height: 1.55; }
    .side h3 { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .1em; color: oklch(48% 0.1 195); margin: 0 0 2.5mm; }
    .side section { margin-bottom: 6mm; }
    .side li { font-size: 9pt; line-height: 1.55; margin-bottom: 1.5mm; word-break: break-word; }
    .photo { width: 32mm; height: 32mm; border-radius: 50%; object-fit: cover; margin-bottom: 5mm; display:block; }
  `;
    const body = `
    <div class="grid">
      <main class="main">
        <h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div>
        ${b.summary ? `<section><h2>Profile</h2><p>${esc(b.summary)}</p></section>` : ""}
        ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `<div class="item"><div class="top"><div><div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)}</div></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul class="hl">${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
        ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      </main>
      <aside class="side">
        ${b.image ? `<img class="photo" src="${b.image}" />` : ""}
        <section><h3>Contact</h3><ul>
          ${b.email ? `<li>${esc(b.email)}</li>` : ""}${b.phone ? `<li>${esc(b.phone)}</li>` : ""}
          ${b.location?.address ? `<li>${esc(b.location.address)}</li>` : ""}${b.url ? `<li>${esc(b.url)}</li>` : ""}
        </ul></section>
        ${(r.education || []).length ? `<section><h3>Education</h3><ul>${r.education.map((e) => `<li><strong>${esc(e.area)}</strong><br>${esc(e.institution)}<br>${dateRange(e.startDate, e.endDate)}${e.score ? `<br>${esc(e.score)}` : ""}</li>`).join("")}</ul></section>` : ""}
        ${skillList(r).length ? `<section><h3>Skills</h3><ul>${skillList(r).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></section>` : ""}
        ${(r.certificates || []).length ? `<section><h3>Certifications</h3><ul>${r.certificates.map((c) => `<li>${esc(c.name)}</li>`).join("")}</ul></section>` : ""}
      </aside>
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">`);
}

// ---------------------------------------------------------------------------
// PROFESSIONAL
// ---------------------------------------------------------------------------

function proCorporate(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Georgia', 'Times New Roman', serif; color: #1f2430; }
    .head { text-align:center; padding: 16mm 18mm 6mm; border-bottom: 2px solid #1f2430; }
    .head h1 { font-size: 24pt; letter-spacing: .06em; font-weight: 700; }
    .head .label { font-size: 11pt; color: #55607a; margin-top: 1.5mm; letter-spacing: .1em; text-transform: uppercase; }
    .head .meta { margin-top: 3mm; font-size: 8.5pt; color: #55607a; display:flex; justify-content:center; flex-wrap:wrap; gap: 2mm 5mm; }
    .wrap { padding: 8mm 18mm; }
    section { margin-bottom: 6mm; }
    h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: .12em; border-bottom: 1px solid #ccc;
      padding-bottom: 1mm; margin-bottom: 3mm; }
    .item { margin-bottom: 4mm; }
    .item .top { display:flex; justify-content:space-between; }
    .role { font-weight: 700; font-size: 10.5pt; }
    .org { font-style: italic; color:#404a63; font-size: 10pt; }
    .when { font-size: 9pt; color:#55607a; }
    ul { margin: 1.5mm 0 0 5mm; } li { list-style: disc; font-size: 9.5pt; line-height: 1.5; margin-bottom: 1mm; }
    p { font-size: 9.5pt; line-height: 1.55; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => esc(m)).join(" &nbsp;&bull;&nbsp; ");
    const body = `
    <div class="head"><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div></div>
    <div class="wrap">
      ${b.summary ? `<section><h2>Professional Summary</h2><p>${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `<div class="item"><div class="top"><div><span class="role">${esc(w.position)}</span>, <span class="org">${esc(w.name)}</span></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => `<div class="item"><div class="top"><div><span class="role">${esc(e.area)}</span>, <span class="org">${esc(e.institution)}</span></div><div class="when">${dateRange(e.startDate, e.endDate)}</div></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${skillList(r).length ? `<section><h2>Skills</h2><p>${skillList(r).map(esc).join(" &nbsp;&bull;&nbsp; ")}</p></section>` : ""}
      ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><span class="role">${esc(p.name)}</span>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.certificates || []).length ? `<section><h2>Certifications</h2><p>${r.certificates.map((c) => esc(c.name)).join(" &nbsp;&bull;&nbsp; ")}</p></section>` : ""}
    </div>`;
    return page(css, body);
}

function proLedger(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Source Sans 3', system-ui, sans-serif; color:#242b38; }
    .head { padding: 14mm 16mm 5mm; border-bottom: 3px solid oklch(45% 0.06 240); }
    .head h1 { font-size: 22pt; font-weight: 700; color: oklch(35% 0.06 240); }
    .head .label { font-size: 11pt; color:#5b6472; font-weight:600; margin-top: 1mm; }
    .head .meta { margin-top: 2.5mm; font-size: 8.5pt; color:#5b6472; display:flex; flex-wrap:wrap; gap: 2mm 5mm; }
    .cols { display:grid; grid-template-columns: 1fr 62mm; }
    .left { padding: 8mm 6mm 8mm 16mm; }
    .right { padding: 8mm 16mm 8mm 8mm; background: oklch(97% 0.008 240); }
    section { margin-bottom: 6mm; }
    h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: .1em; color: oklch(45% 0.08 240);
      font-weight: 700; margin-bottom: 3mm; }
    .item { margin-bottom: 4mm; }
    .role { font-weight: 700; font-size: 10.5pt; }
    .org { color:#5b6472; font-size: 9.5pt; }
    .when { color:#8a93a3; font-size: 8.5pt; }
    ul.hl { margin: 1.5mm 0 0 4mm; } ul.hl li { list-style: disc; font-size: 9pt; line-height:1.5; margin-bottom:1mm; }
    .right li { font-size: 9pt; line-height: 1.6; margin-bottom: 1mm; }
    p { font-size: 9pt; line-height: 1.55; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
    const body = `
    <div class="head"><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div></div>
    <div class="cols">
      <div class="left">
        ${b.summary ? `<section><h2>Summary</h2><p>${esc(b.summary)}</p></section>` : ""}
        ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `<div class="item"><div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)} &middot; <span class="when">${dateRange(w.startDate, w.endDate)}</span></div>${w.highlights?.length ? `<ul class="hl">${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
        ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      </div>
      <div class="right">
        ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => `<div class="item"><div class="role" style="font-size:10pt">${esc(e.area)}</div><div class="org">${esc(e.institution)}</div><div class="when">${dateRange(e.startDate, e.endDate)}</div>${e.score ? `<div class="org">${esc(e.score)}</div>` : ""}</div>`).join("")}</section>` : ""}
        ${skillList(r).length ? `<section><h2>Skills</h2><ul>${skillList(r).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></section>` : ""}
        ${(r.certificates || []).length ? `<section><h2>Certifications</h2><ul>${r.certificates.map((c) => `<li>${esc(c.name)}</li>`).join("")}</ul></section>` : ""}
      </div>
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">`);
}

function proExecutive(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Libre Baskerville', Georgia, serif; color: #22262e; }
    .head { padding: 16mm 18mm 6mm; display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 1px solid #22262e; }
    .head h1 { font-size: 26pt; font-weight: 700; letter-spacing: -0.01em; }
    .head .label { font-size: 10.5pt; color:#5a6270; margin-top: 2mm; font-style: italic; }
    .head .meta { text-align:right; font-size: 8.5pt; color:#5a6270; line-height: 1.7; }
    .wrap { padding: 8mm 18mm; }
    section { margin-bottom: 6mm; }
    h2 { font-size: 10.5pt; letter-spacing: .18em; text-transform: uppercase; color:#8a5a2b; margin-bottom: 3mm; font-family: 'Inter', sans-serif; font-weight: 600; }
    .item { margin-bottom: 4.5mm; }
    .top { display:flex; justify-content:space-between; }
    .role { font-weight: 700; font-size: 11pt; }
    .org { color:#5a6270; font-size: 10pt; font-style: italic; }
    .when { font-size: 9pt; color:#8a929e; font-family:'Inter',sans-serif; }
    ul { margin: 1.5mm 0 0 5mm; } li { list-style: disc; font-size: 9.5pt; line-height: 1.55; margin-bottom: 1mm; }
    p { font-size: 9.5pt; line-height: 1.6; }
    .chips { font-family: 'Inter', sans-serif; font-size: 9pt; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<div>${esc(m)}</div>`).join("");
    const body = `
    <div class="head"><div><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div></div><div class="meta">${meta}</div></div>
    <div class="wrap">
      ${b.summary ? `<section><h2>Profile</h2><p>${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `<div class="item"><div class="top"><div><span class="role">${esc(w.position)}</span> <span class="org">${esc(w.name)}</span></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => `<div class="item"><div class="top"><div><span class="role">${esc(e.area)}</span> <span class="org">${esc(e.institution)}</span></div><div class="when">${dateRange(e.startDate, e.endDate)}</div></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${skillList(r).length ? `<section><h2>Skills</h2><p class="chips">${skillList(r).map(esc).join(" &nbsp;&bull;&nbsp; ")}</p></section>` : ""}
      ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><span class="role">${esc(p.name)}</span>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.certificates || []).length ? `<section><h2>Certifications</h2><p class="chips">${r.certificates.map((c) => esc(c.name)).join(" &nbsp;&bull;&nbsp; ")}</p></section>` : ""}
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">`);
}

// ---------------------------------------------------------------------------
// MINIMAL
// ---------------------------------------------------------------------------

function minimalSlate(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Inter', system-ui, sans-serif; color:#33373f; }
    .wrap { padding: 20mm 20mm; }
    .head { margin-bottom: 8mm; }
    h1 { font-size: 22pt; font-weight: 600; letter-spacing: -0.01em; }
    .label { color:#7a8290; font-size: 11pt; margin-top: 1mm; }
    .meta { margin-top: 3mm; font-size: 8.5pt; color:#7a8290; display:flex; flex-wrap:wrap; gap: 2mm 5mm; }
    section { margin-bottom: 7mm; }
    h2 { font-size: 9pt; text-transform: uppercase; letter-spacing: .18em; color:#a0a7b3; margin-bottom: 3.5mm; }
    .item { margin-bottom: 4.5mm; display:grid; grid-template-columns: 26mm 1fr; gap: 5mm; }
    .when { font-size: 8.5pt; color:#a0a7b3; padding-top: .5mm; }
    .role { font-weight: 600; font-size: 10.5pt; }
    .org { color:#7a8290; font-size: 9.5pt; }
    ul { margin: 1.5mm 0 0 0; } li { font-size: 9pt; line-height:1.55; margin-bottom:1mm; position:relative; padding-left: 3.5mm; }
    li::before { content:"-"; position:absolute; left:0; color:#c2c8d0; }
    p { font-size: 9pt; line-height:1.6; }
    .chips { display:flex; flex-wrap:wrap; gap: 2mm 4mm; } .chip { font-size: 9pt; color:#4b515c; }
    .chip:not(:last-child)::after { content:"&middot;"; margin-left: 4mm; color:#c2c8d0; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
    const row = (when, main) => `<div class="item"><div class="when">${when}</div><div>${main}</div></div>`;
    const body = `
    <div class="wrap">
      <div class="head"><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div></div>
      ${b.summary ? `<section><h2>About</h2><p>${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => row(dateRange(w.startDate, w.endDate), `<div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)}</div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}`)).join("")}</section>` : ""}
      ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => row(dateRange(e.startDate, e.endDate), `<div class="role">${esc(e.area)}</div><div class="org">${esc(e.institution)}</div>${e.score ? `<p>${esc(e.score)}</p>` : ""}`)).join("")}</section>` : ""}
      ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => row("", `<div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}`)).join("")}</section>` : ""}
      ${skillList(r).length ? `<section><h2>Skills</h2><div class="chips">${skillList(r).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></section>` : ""}
      ${(r.certificates || []).length ? `<section><h2>Certifications</h2><div class="chips">${r.certificates.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("")}</div></section>` : ""}
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`);
}

function minimalMono(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'JetBrains Mono', ui-monospace, monospace; color:#2b2b2b; font-size: 9pt; }
    .wrap { padding: 18mm 18mm; }
    h1 { font-size: 18pt; font-weight: 700; letter-spacing: -0.02em; }
    .label { color:#666; margin-top: 1mm; }
    .rule { border-top: 1px solid #2b2b2b; margin: 5mm 0; }
    .meta { color:#666; font-size: 8pt; display:flex; flex-wrap:wrap; gap: 1mm 5mm; margin-top: 2mm; }
    section { margin-bottom: 6mm; }
    h2 { font-size: 9pt; font-weight: 700; margin-bottom: 3mm; }
    h2::before { content:"# "; color:#999; }
    .item { margin-bottom: 3.5mm; }
    .top { display:flex; justify-content:space-between; gap:4mm; }
    .role { font-weight: 700; }
    .org { color:#555; }
    .when { color:#999; font-size: 8pt; white-space:nowrap; }
    ul { margin: 1.5mm 0 0 0; } li { line-height: 1.55; margin-bottom: 1mm; padding-left: 4mm; position:relative; }
    li::before { content:">"; position:absolute; left:0; color:#aaa; }
    p { line-height: 1.6; }
    .chips { line-height: 1.9; } .chip:not(:last-child)::after { content:" / "; color:#bbb; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
    const body = `
    <div class="wrap">
      <h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div>
      <div class="rule"></div>
      ${b.summary ? `<section><h2>about</h2><p>${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section><h2>experience</h2>${r.work.map((w) => `<div class="item"><div class="top"><span class="role">${esc(w.position)} @ ${esc(w.name)}</span><span class="when">${dateRange(w.startDate, w.endDate)}</span></div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.projects || []).length ? `<section><h2>projects</h2>${r.projects.map((p) => `<div class="item"><span class="role">${esc(p.name)}</span>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.education || []).length ? `<section><h2>education</h2>${r.education.map((e) => `<div class="item"><div class="top"><span class="role">${esc(e.area)} - ${esc(e.institution)}</span><span class="when">${dateRange(e.startDate, e.endDate)}</span></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${skillList(r).length ? `<section><h2>skills</h2><div class="chips">${skillList(r).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></section>` : ""}
      ${(r.certificates || []).length ? `<section><h2>certifications</h2><div class="chips">${r.certificates.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("")}</div></section>` : ""}
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">`);
}

function minimalSerif(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Cormorant Garamond', Georgia, serif; color:#2a2823; }
    .wrap { padding: 22mm 22mm; }
    .head { text-align:center; margin-bottom: 9mm; }
    h1 { font-size: 30pt; font-weight: 600; letter-spacing: .02em; }
    .label { font-size: 12pt; color:#77726a; margin-top: 1mm; letter-spacing: .16em; text-transform: uppercase; font-family:'Inter',sans-serif; }
    .meta { margin-top: 3mm; font-size: 8.5pt; color:#77726a; font-family:'Inter',sans-serif; }
    .meta span:not(:last-child)::after { content:"  |  "; color:#c4bfb4; }
    section { margin-bottom: 7mm; }
    h2 { font-size: 13pt; font-weight: 600; text-align:center; margin-bottom: 4mm; letter-spacing: .06em; }
    h2::before, h2::after { content:""; display:inline-block; width: 14mm; height:1px; background:#c4bfb4; vertical-align: middle; margin: 0 4mm; }
    .item { margin-bottom: 4.5mm; }
    .top { display:flex; justify-content:space-between; align-items:baseline; }
    .role { font-weight: 700; font-size: 12pt; }
    .org { color:#6c675e; font-size: 11pt; font-style: italic; }
    .when { font-size: 9pt; color:#98928738; color:#989287; font-family:'Inter',sans-serif; }
    ul { margin: 1mm 0 0 5mm; } li { list-style: disc; font-size: 11pt; line-height: 1.5; margin-bottom: .5mm; }
    p { font-size: 11pt; line-height: 1.55; }
    .chips { text-align:center; font-size: 11pt; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
    const body = `
    <div class="wrap">
      <div class="head"><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div></div>
      ${b.summary ? `<section><h2>Profile</h2><p style="text-align:center">${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `<div class="item"><div class="top"><div><span class="role">${esc(w.position)}</span>, <span class="org">${esc(w.name)}</span></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => `<div class="item"><div class="top"><div><span class="role">${esc(e.area)}</span>, <span class="org">${esc(e.institution)}</span></div><div class="when">${dateRange(e.startDate, e.endDate)}</div></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${skillList(r).length ? `<section><h2>Skills</h2><p class="chips">${skillList(r).map(esc).join(" &nbsp;&bull;&nbsp; ")}</p></section>` : ""}
      ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><span class="role">${esc(p.name)}</span>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.certificates || []).length ? `<section><h2>Certifications</h2><p class="chips">${r.certificates.map((c) => esc(c.name)).join(" &nbsp;&bull;&nbsp; ")}</p></section>` : ""}
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">`);
}

// ---------------------------------------------------------------------------
// CREATIVE
// ---------------------------------------------------------------------------

function creativePrism(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Space Grotesk', system-ui, sans-serif; color:#241f2e; }
    .head { background: oklch(62% 0.19 20); color:#fff; padding: 16mm 16mm 10mm; position:relative; }
    .head::after { content:""; position:absolute; bottom:-6mm; left:0; right:0; height:12mm;
      background: oklch(72% 0.17 60); transform: skewY(-2deg); z-index:0; }
    .head h1 { font-size: 26pt; font-weight: 700; position:relative; z-index:1; }
    .head .label { font-size: 12pt; font-weight: 500; margin-top: 1mm; position:relative; z-index:1; }
    .head .meta { margin-top: 4mm; font-size: 8.5pt; display:flex; flex-wrap:wrap; gap: 2mm 5mm; position:relative; z-index:1; }
    .wrap { padding: 12mm 16mm; }
    section { margin-bottom: 7mm; }
    h2 { font-size: 12pt; font-weight: 700; margin-bottom: 3mm; display:inline-block;
      padding: 1mm 3mm; border-radius: 2mm; color:#fff; }
    .c1 h2 { background: oklch(62% 0.19 20); } .c2 h2 { background: oklch(58% 0.16 250); }
    .c3 h2 { background: oklch(60% 0.15 150); } .c4 h2 { background: oklch(64% 0.17 300); }
    .item { margin-bottom: 4mm; }
    .top { display:flex; justify-content:space-between; gap:4mm; }
    .role { font-weight: 700; font-size: 10.5pt; }
    .org { color:#655c72; font-size: 9.5pt; }
    .when { color:#8b8398; font-size: 8.5pt; white-space:nowrap; }
    ul { margin: 1.5mm 0 0 4mm; } li { list-style: disc; font-size: 9pt; line-height:1.5; margin-bottom:1mm; }
    p { font-size: 9pt; line-height:1.55; }
    .chips { display:flex; flex-wrap:wrap; gap: 2mm; }
    .chip { background: oklch(94% 0.04 300); color: oklch(45% 0.16 300); font-size: 8.5pt; padding: 1.5mm 3mm; border-radius: 3mm; font-weight:500; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
    const body = `
    <div class="head"><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div></div>
    <div class="wrap">
      ${b.summary ? `<section class="c1"><h2>Profile</h2><p>${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section class="c2"><h2>Experience</h2>${r.work.map((w) => `<div class="item"><div class="top"><div><div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)}</div></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.projects || []).length ? `<section class="c3"><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${(r.education || []).length ? `<section class="c1"><h2>Education</h2>${r.education.map((e) => `<div class="item"><div class="top"><div><div class="role">${esc(e.area)}</div><div class="org">${esc(e.institution)}</div></div><div class="when">${dateRange(e.startDate, e.endDate)}</div></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${skillList(r).length ? `<section class="c4"><h2>Skills</h2><div class="chips">${skillList(r).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></section>` : ""}
      ${(r.certificates || []).length ? `<section class="c2"><h2>Certifications</h2><div class="chips">${r.certificates.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("")}</div></section>` : ""}
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">`);
}

function creativeCanvas(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'DM Sans', system-ui, sans-serif; color:#2d2a26; }
    .grid { display:grid; grid-template-columns: 60mm 1fr; min-height: 297mm; }
    .side { background: oklch(94% 0.03 70); padding: 14mm 10mm; text-align:center; }
    .side .photo { width: 38mm; height: 38mm; border-radius: 50%; object-fit: cover; margin: 0 auto 5mm; display:block;
      border: 4px solid #fff; box-shadow: 0 2mm 6mm rgba(0,0,0,.12); }
    .side h1 { font-size: 18pt; font-weight: 700; line-height: 1.1; }
    .side .label { color: oklch(50% 0.12 45); font-weight: 600; font-size: 10pt; margin-top: 1.5mm; }
    .side h3 { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .1em; color: oklch(50% 0.12 45);
      margin: 6mm 0 2mm; text-align:left; }
    .side .block { text-align:left; }
    .side li, .side p { font-size: 8.5pt; line-height: 1.6; word-break: break-word; margin-bottom: 1mm; }
    .main { padding: 14mm 14mm; }
    section { margin-bottom: 7mm; }
    h2 { font-size: 12pt; font-weight: 700; color: oklch(45% 0.13 45); margin-bottom: 3mm; }
    .item { margin-bottom: 4.5mm; }
    .top { display:flex; justify-content:space-between; gap:4mm; }
    .role { font-weight: 700; font-size: 10.5pt; }
    .org { color:#726c63; font-size: 9.5pt; }
    .when { color:#9a9388; font-size: 8.5pt; white-space:nowrap; }
    ul { margin: 1.5mm 0 0 4mm; } li { list-style: disc; font-size: 9pt; line-height:1.5; margin-bottom:1mm; }
    p { font-size: 9pt; line-height:1.55; }
  `;
    const body = `
    <div class="grid">
      <aside class="side">
        ${b.image ? `<img class="photo" src="${b.image}" />` : ""}
        <h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div>
        <h3>Contact</h3><div class="block"><ul>
          ${b.email ? `<li>${esc(b.email)}</li>` : ""}${b.phone ? `<li>${esc(b.phone)}</li>` : ""}
          ${b.location?.address ? `<li>${esc(b.location.address)}</li>` : ""}${b.url ? `<li>${esc(b.url)}</li>` : ""}
        </ul></div>
        ${skillList(r).length ? `<h3>Skills</h3><div class="block"><ul>${skillList(r).map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
        ${(r.certificates || []).length ? `<h3>Certifications</h3><div class="block"><ul>${r.certificates.map((c) => `<li>${esc(c.name)}</li>`).join("")}</ul></div>` : ""}
      </aside>
      <main class="main">
        ${b.summary ? `<section><h2>About Me</h2><p>${esc(b.summary)}</p></section>` : ""}
        ${(r.work || []).length ? `<section><h2>Experience</h2>${r.work.map((w) => `<div class="item"><div class="top"><div><div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)}</div></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</section>` : ""}
        ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item"><div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
        ${(r.education || []).length ? `<section><h2>Education</h2>${r.education.map((e) => `<div class="item"><div class="top"><div><div class="role">${esc(e.area)}</div><div class="org">${esc(e.institution)}</div></div><div class="when">${dateRange(e.startDate, e.endDate)}</div></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</section>` : ""}
      </main>
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">`);
}

function creativeTimeline(r) {
    const b = r.basics || {};
    const css = `
    body { font-family: 'Outfit', system-ui, sans-serif; color:#26232b; }
    .head { padding: 15mm 16mm 8mm; background: oklch(96% 0.03 160); }
    h1 { font-size: 25pt; font-weight: 700; color: oklch(38% 0.11 160); }
    .label { font-size: 11pt; font-weight: 500; color: oklch(52% 0.1 160); margin-top: 1mm; }
    .meta { margin-top: 3mm; font-size: 8.5pt; color:#5c5866; display:flex; flex-wrap:wrap; gap: 2mm 5mm; }
    .wrap { padding: 10mm 16mm; }
    section { margin-bottom: 7mm; }
    h2 { font-size: 11pt; font-weight: 700; color: oklch(45% 0.11 160); margin-bottom: 4mm; }
    .tl { position: relative; padding-left: 9mm; }
    .tl::before { content:""; position:absolute; left: 2.5mm; top: 1mm; bottom: 1mm; width: 1px; background: oklch(85% 0.05 160); }
    .item { position: relative; margin-bottom: 5mm; }
    .item::before { content:""; position:absolute; left: -8.2mm; top: 1.5mm; width: 3mm; height: 3mm; border-radius: 50%;
      background: oklch(58% 0.13 160); border: 1.5px solid #fff; box-shadow: 0 0 0 1px oklch(80% 0.06 160); }
    .top { display:flex; justify-content:space-between; gap: 4mm; }
    .role { font-weight: 700; font-size: 10.5pt; }
    .org { color:#635e6c; font-size: 9.5pt; }
    .when { color:#8b8794; font-size: 8.5pt; white-space:nowrap; }
    ul { margin: 1.5mm 0 0 4mm; } li { list-style: disc; font-size: 9pt; line-height:1.5; margin-bottom:1mm; }
    p { font-size: 9pt; line-height:1.55; }
    .chips { display:flex; flex-wrap:wrap; gap: 2mm; }
    .chip { background: oklch(94% 0.04 160); color: oklch(42% 0.12 160); font-size: 8.5pt; padding: 1.5mm 3mm; border-radius: 2mm; font-weight: 500; }
  `;
    const meta = [b.email, b.phone, b.location?.address, b.url].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
    const body = `
    <div class="head"><h1>${esc(b.name)}</h1><div class="label">${esc(b.label)}</div><div class="meta">${meta}</div></div>
    <div class="wrap">
      ${b.summary ? `<section><h2>Profile</h2><p>${esc(b.summary)}</p></section>` : ""}
      ${(r.work || []).length ? `<section><h2>Experience</h2><div class="tl">${r.work.map((w) => `<div class="item"><div class="top"><div><div class="role">${esc(w.position)}</div><div class="org">${esc(w.name)}</div></div><div class="when">${dateRange(w.startDate, w.endDate)}</div></div>${w.highlights?.length ? `<ul>${bullets(w.highlights)}</ul>` : w.summary ? `<p>${esc(w.summary)}</p>` : ""}</div>`).join("")}</div></section>` : ""}
      ${(r.education || []).length ? `<section><h2>Education</h2><div class="tl">${r.education.map((e) => `<div class="item"><div class="top"><div><div class="role">${esc(e.area)}</div><div class="org">${esc(e.institution)}</div></div><div class="when">${dateRange(e.startDate, e.endDate)}</div></div>${e.score ? `<p>${esc(e.score)}</p>` : ""}</div>`).join("")}</div></section>` : ""}
      ${(r.projects || []).length ? `<section><h2>Projects</h2>${r.projects.map((p) => `<div class="item" style="margin-bottom:3mm"><div class="role">${esc(p.name)}</div>${p.description ? `<p>${esc(p.description)}</p>` : ""}</div>`).join("")}</section>` : ""}
      ${skillList(r).length ? `<section><h2>Skills</h2><div class="chips">${skillList(r).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></section>` : ""}
      ${(r.certificates || []).length ? `<section><h2>Certifications</h2><div class="chips">${r.certificates.map((c) => `<span class="chip">${esc(c.name)}</span>`).join("")}</div></section>` : ""}
    </div>`;
    return page(css, body, `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap" rel="stylesheet">`);
}

// ---------------------------------------------------------------------------
// Registry: this is what the gallery iterates over.
// ---------------------------------------------------------------------------

export const RESUME_TEMPLATES = [
    { id: "modern-aurora", name: "Aurora", category: "Modern", render: modernAurora },
    { id: "modern-vertex", name: "Vertex", category: "Modern", render: modernVertex },
    { id: "modern-sidebar", name: "Sidebar", category: "Modern", render: modernSidebar },
    { id: "pro-corporate", name: "Corporate", category: "Professional", render: proCorporate },
    { id: "pro-ledger", name: "Ledger", category: "Professional", render: proLedger },
    { id: "pro-executive", name: "Executive", category: "Professional", render: proExecutive },
    { id: "minimal-slate", name: "Slate", category: "Minimal", render: minimalSlate },
    { id: "minimal-mono", name: "Mono", category: "Minimal", render: minimalMono },
    { id: "minimal-serif", name: "Serif", category: "Minimal", render: minimalSerif },
    { id: "creative-prism", name: "Prism", category: "Creative", render: creativePrism },
    { id: "creative-canvas", name: "Canvas", category: "Creative", render: creativeCanvas },
    { id: "creative-timeline", name: "Timeline", category: "Creative", render: creativeTimeline },
];

export const TEMPLATE_CATEGORIES = ["Modern", "Professional", "Minimal", "Creative"];