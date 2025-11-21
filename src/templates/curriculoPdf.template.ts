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

export function buildCurriculoHTML(data: CurriculoData) {
  const name = esc(data.name) || "Usuário R.I.S.E.";
  const role = esc(data.role);
  const email = esc(data.email);
  const phone = esc(data.phone);
  const location = esc(data.location);
  const summary = esc(data.summary);
  const completeness = Number.isFinite(data.completeness)
    ? Math.max(0, Math.min(100, Math.round(data.completeness)))
    : 0;

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
        ${
          e.desc
            ? `<p class="block-text">${esc(e.desc)}</p>`
            : ""
        }
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
    .map(
      (p) => `
      <div class="block">
        <div class="block-title">${esc(p.name) || ""}</div>
        ${
          p.link
            ? `<div class="block-link"><a href="${esc(
                p.link
              )}" target="_blank">${esc(p.link)}</a></div>`
            : ""
        }
        ${
          p.desc
            ? `<p class="block-text">${esc(p.desc)}</p>`
            : ""
        }
      </div>
    `
    )
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
    .map(
      (l) => `
      <div class="inline-link">
        <span class="inline-label">${esc(l.label)}:</span>
        <a href="${esc(l.url)}" target="_blank">${esc(l.url)}</a>
      </div>
    `
    )
    .join("");

  const contactLines = [
    phone ? `Tel: ${phone}` : "",
    email || "",
    location || "",
  ].filter(Boolean);

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          background: #e5e7eb;
          color: #0b0d13;
        }
        .page {
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
          background: #f9fafb;
          display: flex;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
          overflow: hidden;
        }
        .sidebar {
          width: 32%;
          background: linear-gradient(180deg, #0b1120 0%, #020617 100%);
          color: #f9fafb;
          padding: 24px 20px 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sidebar-top {
          gap: 16px;
          display: flex;
          flex-direction: column;
        }
        .avatar {
          width: 84px;
          height: 84px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 20%, #38bdf8 0, #0ea5e9 35%, #22c55e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .sidebar-name {
          font-size: 20px;
          font-weight: 800;
          margin-top: 12px;
          line-height: 1.2;
        }
        .sidebar-role {
          font-size: 11px;
          font-weight: 500;
          opacity: 0.9;
          margin-top: 4px;
        }
        .tagline {
          font-size: 10px;
          opacity: 0.9;
          margin-top: 8px;
          line-height: 1.4;
        }
        .sidebar-section {
          margin-top: 16px;
        }
        .sidebar-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #a5b4fc;
          margin-bottom: 4px;
        }
        .sidebar-line {
          width: 34px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, #4ef2c3, #38bdf8);
          margin-bottom: 6px;
        }
        .sidebar-text {
          font-size: 10px;
          line-height: 1.5;
          color: #e5e7eb;
        }
        .sidebar-footer {
          margin-top: 18px;
          font-size: 9px;
          color: #9ca3af;
          line-height: 1.4;
        }
        .main {
          width: 68%;
          background: #ffffff;
          padding: 24px 26px 26px;
          display: flex;
          flex-direction: column;
        }
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 14px;
        }
        .main-title {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #0f172a;
        }
        .main-subtitle {
          font-size: 10px;
          color: #6b7280;
        }
        .score-pill {
          min-width: 90px;
          text-align: right;
        }
        .score-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #9ca3af;
        }
        .score-value {
          font-size: 17px;
          font-weight: 800;
          color: #22c55e;
        }
        .score-bar {
          margin-top: 3px;
          width: 100%;
          height: 4px;
          border-radius: 999px;
          background: #e5e7eb;
          overflow: hidden;
        }
        .score-bar-fill {
          height: 100%;
          width: ${completeness}%;
          background: linear-gradient(90deg, #4ef2c3, #38bdf8);
        }
        .section {
          margin-top: 12px;
        }
        .section-header {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          column-gap: 8px;
          margin-bottom: 4px;
        }
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #1d4ed8;
          font-weight: 700;
        }
        .section-line {
          height: 1px;
          background: linear-gradient(90deg, #bfdbfe, rgba(191, 219, 254, 0));
        }
        .section-body {
          font-size: 11px;
          color: #111827;
          line-height: 1.55;
        }
        .summary-text {
          margin: 0;
        }
        .tag-group {
          margin-top: 2px;
        }
        .tag {
          display: inline-block;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 999px;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          font-weight: 600;
          margin: 3px 5px 0 0;
        }
        .block {
          padding: 6px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .block:last-child {
          border-bottom: none;
        }
        .block-header {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: baseline;
        }
        .block-title {
          font-size: 11px;
          font-weight: 700;
          color: #111827;
        }
        .block-meta {
          font-size: 9px;
          color: #6b7280;
          white-space: nowrap;
        }
        .block-sub {
          font-size: 10px;
          color: #4b5563;
          margin-top: 1px;
        }
        .block-text {
          font-size: 10px;
          color: #111827;
          margin: 3px 0 0;
        }
        .block-link {
          font-size: 10px;
          margin-top: 2px;
        }
        .block-link a {
          color: #2563eb;
          text-decoration: none;
        }
        .block-link a:hover {
          text-decoration: underline;
        }
        .inline-link {
          font-size: 10px;
          margin: 2px 0;
        }
        .inline-label {
          font-weight: 600;
          color: #374151;
          margin-right: 4px;
        }
        .inline-link a {
          color: #2563eb;
          text-decoration: none;
          word-break: break-all;
        }
        .inline-link a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="sidebar">
          <div class="sidebar-top">
            <div>
              <div class="avatar">
                ${name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div class="sidebar-name">${name}</div>
              ${
                role
                  ? `<div class="sidebar-role">${role}</div>`
                  : ""
              }
              <p class="tagline">
                Requalificação, Inclusão, Sustentabilidade e Empregabilidade. Perfil gerado com apoio da plataforma R.I.S.E.
              </p>
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
              </div>
            `
                : ""
            }

            ${
              skillsHtml
                ? `
              <div class="sidebar-section">
                <div class="sidebar-title">Habilidades-chave</div>
                <div class="sidebar-line"></div>
                <div class="sidebar-text">
                  <div class="tag-group">
                    ${skillsHtml}
                  </div>
                </div>
              </div>
            `
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
              </div>
            `
                : ""
            }
          </div>

          <div class="sidebar-footer">
            R.I.S.E. • Plataforma de apoio à jornada profissional.<br/>
            Este currículo foi estruturado automaticamente com base nas informações fornecidas pelo usuário.
          </div>
        </div>

        <div class="main">
          <div class="main-header">
            <div>
              <div class="main-title">Currículo Profissional</div>
              <div class="main-subtitle">
                Versão gerada pela R.I.S.E. com foco em empregabilidade e clareza das informações.
              </div>
            </div>
            <div class="score-pill">
              <div class="score-label">Completude</div>
              <div class="score-value">${completeness}%</div>
              <div class="score-bar">
                <div class="score-bar-fill"></div>
              </div>
            </div>
          </div>

          ${
            summary
              ? `
            <div class="section">
              <div class="section-header">
                <div class="section-title">Resumo</div>
                <div class="section-line"></div>
              </div>
              <div class="section-body">
                <p class="summary-text">${summary}</p>
              </div>
            </div>
          `
              : ""
          }

          ${
            experiencesHtml
              ? `
            <div class="section">
              <div class="section-header">
                <div class="section-title">Experiência profissional</div>
                <div class="section-line"></div>
              </div>
              <div class="section-body">
                ${experiencesHtml}
              </div>
            </div>
          `
              : ""
          }

          ${
            educationHtml
              ? `
            <div class="section">
              <div class="section-header">
                <div class="section-title">Formação acadêmica</div>
                <div class="section-line"></div>
              </div>
              <div class="section-body">
                ${educationHtml}
              </div>
            </div>
          `
              : ""
          }

          ${
            projectsHtml
              ? `
            <div class="section">
              <div class="section-header">
                <div class="section-title">Projetos de destaque</div>
                <div class="section-line"></div>
              </div>
              <div class="section-body">
                ${projectsHtml}
              </div>
            </div>
          `
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
              <div class="section-body">
                ${certsHtml}
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    </body>
  </html>
  `;
}
