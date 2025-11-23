import { CurriculoData } from "../types/curriculo.types";

function esc(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function joinNotEmpty(values: (string | undefined | null)[], separator: string) {
  return values.filter(Boolean).join(separator);
}

function normalizeUrl(raw?: string | null) {
  if (!raw) return "";
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export function buildCurriculoHTML(data: CurriculoData) {
  const name = esc(data.name) || "Usuário R.I.S.E.";
  const role = esc(data.role);
  const email = esc(data.email);
  const phone = esc(data.phone);
  const location = esc(data.location);
  const summary = esc(data.summary);

  const skillsHtml = (data.skills || [])
    .map((s) => `<span class="tag">${esc(s)}</span>`)
    .join("");

  const experiencesHtml = (data.experiences || [])
    .map(
      (e) => `
      <div class="block">
        <div class="block-header">
          <div class="block-title">${esc(e.role) || ""}</div>
          <div class="block-meta">${joinNotEmpty(
            [esc(e.start), esc(e.end)],
            " — "
          )}</div>
        </div>
        <div class="block-sub">${esc(e.company) || ""}</div>
        ${e.desc ? `<p class="block-text">${esc(e.desc)}</p>` : ""}
      </div>
    `
    )
    .join("");

  const educationHtml = (data.education || [])
    .map(
      (ed) => `
      <div class="block">
        <div class="block-header">
          <div class="block-title">${esc(ed.course) || ""}</div>
          <div class="block-meta">${joinNotEmpty(
            [esc(ed.start), esc(ed.end)],
            " — "
          )}</div>
        </div>
        <div class="block-sub">${esc(ed.school) || ""}</div>
      </div>
    `
    )
    .join("");

  const projectsHtml = (data.projects || [])
    .map((p) => {
      const safeLink = normalizeUrl(p.link);
      return `
      <div class="block">
        <div class="block-title">${esc(p.name) || ""}</div>
        ${
          safeLink
            ? `<div class="block-link"><a href="${esc(
                safeLink
              )}" target="_blank" rel="noreferrer">${esc(safeLink)}</a></div>`
            : ""
        }
        ${p.desc ? `<p class="block-text">${esc(p.desc)}</p>` : ""}
      </div>
    `;
    })
    .join("");

  const certsHtml = (data.certs || [])
    .map(
      (c) => `
      <div class="block">
        <div class="block-title">${esc(c.name) || ""}</div>
        <div class="block-sub">${joinNotEmpty(
          [esc(c.org), esc(c.year)],
          " • "
        )}</div>
      </div>
    `
    )
    .join("");

  const linksHtml = (data.links || [])
    .map((l) => {
      const safeUrl = normalizeUrl(l.url);
      return `
      <div class="inline-link">
        <span class="inline-label">${esc(l.label)}:</span>
        <a href="${esc(safeUrl)}" target="_blank" rel="noreferrer">${esc(
        safeUrl
      )}</a>
      </div>
    `;
    })
    .join("");

  const contactLines = [
    phone ? `Tel: ${phone}` : "",
    email || "",
    location || "",
  ].filter(Boolean);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page {
          size: A4;
          margin: 0;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 210mm;
          height: 297mm;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          background: #0b1120;
          color: #0b0d13;
          overflow: hidden;
        }

        body {
          position: relative;
        }

        body::before {
          content: "";
          position: fixed;
          top: -10mm;
          left: -10mm;
          right: -10mm;
          bottom: -10mm;
          background: #0b1120;
          z-index: 0;
        }

        .page {
          position: relative;
          z-index: 1;
          width: 210mm;
          height: 297mm;
          display: flex;
          align-items: stretch;
          background: #0b1120;
          overflow: hidden;
        }

        .sidebar {
          flex: 0 0 26%;
          height: 100%;
          background: #0b1120;
          color: #f9fafb;
          display: flex;
          flex-direction: column;
        }

        .sidebar-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6mm;
          padding: 0;
        }

        .avatar {
          width: 25mm;
          height: 25mm;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #38bdf8 0, #0ea5e9 35%, #22c55e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          margin: 6mm 0 0 6mm;
        }

        .sidebar-name {
          font-size: 19px;
          font-weight: 800;
          margin: 3mm 5mm 0 6mm;
          line-height: 1.15;
        }

        .sidebar-role {
          font-size: 12px;
          margin: 1mm 5mm 0 6mm;
          opacity: .95;
          font-weight: 600;
        }

        .sidebar-section {
          margin: 2mm 5mm 0 6mm;
        }

        .sidebar-title {
          font-size: 10.5px;
          text-transform: uppercase;
          color: #a5b4fc;
          font-weight: 900;
          letter-spacing: .12em;
          margin-bottom: 1.5mm;
        }

        .sidebar-line {
          width: 34px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg,#4ef2c3,#38bdf8);
          margin-bottom: 2mm;
        }

        .sidebar-text {
          font-size: 11px;
          line-height: 1.55;
        }

        .tag-group { margin-top: 1mm; }
        .tag {
          display: inline-block;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(239,246,255,0.12);
          color: #dbeafe;
          border: 1px solid rgba(191,219,254,0.4);
          margin: 2px 4px 0 0;
          font-weight: 700;
          white-space: nowrap;
        }

        .main {
          flex: 0 0 74%;
          height: 100%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .main-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .main-header {
          margin: 8mm 7mm 5mm 7mm;
        }

        .main-title {
          font-size: 19px;
          font-weight: 900;
          text-transform: uppercase;
          color: #0f172a;
          letter-spacing: 0.06em;
        }

        .section {
          margin: 7mm 7mm 0 7mm;
        }

        .section-header {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          column-gap: 6px;
          margin-bottom: 2mm;
        }

        .section-title {
          font-size: 12.5px;
          text-transform: uppercase;
          font-weight: 900;
          letter-spacing: .14em;
          color: #1d4ed8;
        }

        .section-line {
          height: 1px;
          background: linear-gradient(90deg,#bfdbfe,rgba(191,219,254,0));
        }

        .section-body {
          font-size: 12.2px;
          line-height: 1.55;
          color: #111827;
        }

        .block {
          padding: 2.2mm 0;
          border-bottom: 1px solid #e5e7eb;
          page-break-inside: avoid;
        }

        .block:last-child { border-bottom: none; }

        .block-header {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: baseline;
        }

        .block-title {
          font-size: 13px;
          font-weight: 900;
          color: #111827;
        }

        .block-meta {
          font-size: 11.5px;
          color: #6b7280;
          white-space: nowrap;
        }

        .block-sub {
          font-size: 11.8px;
          color: #4b5563;
          margin-top: 1mm;
        }

        .block-text {
          font-size: 11.8px;
          color: #111827;
          margin-top: 1.2mm;
        }

        .block-link {
          font-size: 11.8px;
          margin-top: 1mm;
          word-break: break-all;
        }

        .inline-link {
          font-size: 11.5px;
          margin-top: 1mm;
          word-break: break-all;
        }

        a {
          color: #2563eb;
          text-decoration: none;
        }
      </style>
    </head>

    <body>
      <div class="page">
        <div class="sidebar">
          <div class="sidebar-inner">
            <div>
              <div class="avatar">${initials}</div>
              <div class="sidebar-name">${name}</div>
              ${role ? `<div class="sidebar-role">${role}</div>` : ""}
            </div>

            ${
              contactLines.length
                ? `
                <div class="sidebar-section">
                  <div class="sidebar-title">Contato</div>
                  <div class="sidebar-line"></div>
                  <div class="sidebar-text">
                    ${contactLines.join("<br/>")}
                  </div>
                </div>`
                : ""
            }

            ${
              skillsHtml
                ? `
                <div class="sidebar-section">
                  <div class="sidebar-title">Habilidades</div>
                  <div class="sidebar-line"></div>
                  <div class="sidebar-text">
                    <div class="tag-group">${skillsHtml}</div>
                  </div>
                </div>`
                : ""
            }

            ${
              linksHtml
                ? `
                <div class="sidebar-section">
                  <div class="sidebar-title">Links</div>
                  <div class="sidebar-line"></div>
                  <div class="sidebar-text">
                    ${linksHtml}
                  </div>
                </div>`
                : ""
            }
          </div>
        </div>

        <div class="main">
          <div class="main-inner">
            <div class="main-header">
              <div class="main-title">Currículo Profissional</div>
            </div>

            ${
              summary
                ? `
              <div class="section">
                <div class="section-header">
                  <div class="section-title">Resumo</div>
                  <div class="section-line"></div>
                </div>
                <div class="section-body">${summary}</div>
              </div>`
                : ""
            }

            ${
              experiencesHtml
                ? `
              <div class="section">
                <div class="section-header">
                  <div class="section-title">Experiência</div>
                  <div class="section-line"></div>
                </div>
                <div class="section-body">${experiencesHtml}</div>
              </div>`
                : ""
            }

            ${
              educationHtml
                ? `
              <div class="section">
                <div class="section-header">
                  <div class="section-title">Formação</div>
                  <div class="section-line"></div>
                </div>
                <div class="section-body">${educationHtml}</div>
              </div>`
                : ""
            }

            ${
              projectsHtml
                ? `
              <div class="section">
                <div class="section-header">
                  <div class="section-title">Projetos</div>
                  <div class="section-line"></div>
                </div>
                <div class="section-body">${projectsHtml}</div>
              </div>`
                : ""
            }

            ${
              certsHtml
                ? `
              <div class="section">
                <div class="section-header">
                  <div class="section-title">Certificações</div>
                  <div class="section-line"></div>
                </div>
                <div class="section-body">${certsHtml}</div>
              </div>`
                : ""
            }
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}
