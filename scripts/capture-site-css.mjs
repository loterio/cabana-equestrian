import fs from "node:fs";
import path from "node:path";

const siteUrl = process.argv[2] || "https://www.cabanaequestrian.com.br";
const outDir = "data/site-css";
const cssDir = "css";

function absoluteUrl(value, base) {
  return new URL(value.replace(/^\/\//, "https://"), base).toString();
}

function slug(value) {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .slice(0, 150);
}

function extractCssLinks(html) {
  const links = [];
  const regex = /<link\b[^>]*>/gi;
  for (const match of html.matchAll(regex)) {
    const tag = match[0];
    const rel = tag.match(/\brel=(["'])(.*?)\1/i)?.[2] || "";
    const as = tag.match(/\bas=(["'])(.*?)\1/i)?.[2] || "";
    const href = tag.match(/\bhref=(["'])(.*?)\1/i)?.[2];
    if (!href) continue;
    if (!/stylesheet/i.test(rel) && !(/preload/i.test(rel) && /style/i.test(as))) continue;
    links.push({
      href: absoluteUrl(href, siteUrl),
      rel,
      as,
      tag,
      kind: /cabanaequestrian|resources\/cabanaequestrian\.css/i.test(href)
        ? "custom-resource"
        : "platform",
    });
  }
  return links;
}

function extractInlineStyles(html) {
  const styles = [];
  const regex = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
  let index = 1;
  for (const match of html.matchAll(regex)) {
    const css = match[2].trim();
    if (!css) continue;
    styles.push({
      index,
      attrs: match[1].trim(),
      css,
      kind: "inline-style",
    });
    index += 1;
  }
  return styles;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "CabanaEquestianCssAudit/1.0",
    },
  });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get("content-type"),
    text,
  };
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, "raw"), { recursive: true });
fs.mkdirSync(cssDir, { recursive: true });

const htmlResponse = await fetchText(`${siteUrl}${siteUrl.includes("?") ? "&" : "?"}codex_css=${Date.now()}`);
fs.writeFileSync(path.join(outDir, "raw", "home.html"), htmlResponse.text);

const cssLinks = extractCssLinks(htmlResponse.text);
const inlineStyles = extractInlineStyles(htmlResponse.text);
const downloadedLinks = [];

for (const link of cssLinks) {
  const result = await fetchText(link.href);
  const filename = `${link.kind}-${slug(link.href)}.css`;
  fs.writeFileSync(path.join(outDir, "raw", filename), result.text);
  downloadedLinks.push({
    ...link,
    status: result.status,
    contentType: result.contentType,
    bytes: Buffer.byteLength(result.text),
    file: `data/site-css/raw/${filename}`,
  });
}

const inlineFiles = inlineStyles.map((style) => {
  const file = `data/site-css/raw/inline-style-${String(style.index).padStart(2, "0")}.css`;
  fs.writeFileSync(file, style.css);
  return {
    index: style.index,
    attrs: style.attrs,
    bytes: Buffer.byteLength(style.css),
    file,
  };
});

const customResource = downloadedLinks.filter((link) => link.kind === "custom-resource");
const consolidated = [
  "/*",
  "  Cabana Equestrian - CSS consolidado",
  "  Fonte: captura do site publico.",
  "  Uso recomendado: manter este arquivo como fonte versionada e colar apenas",
  "  os blocos customizados no Site Builder/Conteudos Adicionais da Magazord.",
  "*/",
  "",
  "/* ========== Tokens atuais da Cabana ========== */",
  ":root {",
  "  --ce-brand-gold: #cc9933;",
  "  --ce-brand-gold-light: #d0ab62;",
  "  --ce-brand-yellow: #dccf70;",
  "  --ce-text: #252525;",
  "  --ce-muted: #666666;",
  "  --ce-border: #e7e1d5;",
  "  --ce-surface: #ffffff;",
  "}",
  "",
  ...customResource.flatMap((link) => [
    `/* ========== CSS customizado publicado: ${link.href} ========== */`,
    fs.readFileSync(link.file, "utf8").trim(),
    "",
  ]),
  "/* ========== Inline styles encontrados na home ========== */",
  "/*",
  "  Estes blocos vieram de <style> inline na pagina inicial. Revise antes de colar,",
  "  pois alguns podem ser gerados pela propria vitrine/landing page da Magazord.",
  "*/",
  "",
  ...inlineFiles.flatMap((style) => [
    `/* ----- inline-style-${String(style.index).padStart(2, "0")} | ${style.bytes} bytes ----- */`,
    fs.readFileSync(style.file, "utf8").trim(),
    "",
  ]),
].join("\n");

fs.writeFileSync(path.join(cssDir, "cabana-site-consolidado.css"), consolidated);

const inventory = {
  capturedAt: new Date().toISOString(),
  siteUrl,
  htmlBytes: Buffer.byteLength(htmlResponse.text),
  cssLinks: downloadedLinks,
  inlineStyles: inlineFiles,
  consolidatedFile: "css/cabana-site-consolidado.css",
};

fs.writeFileSync(path.join(outDir, "inventory.json"), JSON.stringify(inventory, null, 2));

const markdown = [
  "# Inventario de CSS aplicado",
  "",
  `Captura: ${inventory.capturedAt}`,
  `Site: ${siteUrl}`,
  "",
  "## CSS externos",
  "",
  "| Tipo | Bytes | URL | Arquivo local |",
  "| --- | ---: | --- | --- |",
  ...downloadedLinks.map((link) => `| ${link.kind} | ${link.bytes} | ${link.href} | ${link.file} |`),
  "",
  "## Styles inline",
  "",
  "| Bloco | Bytes | Arquivo local |",
  "| ---: | ---: | --- |",
  ...inlineFiles.map((style) => `| ${style.index} | ${style.bytes} | ${style.file} |`),
  "",
  "## Arquivo consolidado",
  "",
  "- `css/cabana-site-consolidado.css`",
  "",
].join("\n");

fs.writeFileSync("analises/2026-05-11-inventario-css-site.md", markdown);

console.log(JSON.stringify(inventory, null, 2));
