const url = `https://www.cabanaequestrian.com.br/?_check=${Date.now()}`;
const html = await fetch(url).then((response) => response.text());
const marker = "menu: [";
const index = html.indexOf(marker);

if (index < 0) {
  console.log("menu not found");
  process.exit(1);
}

const start = html.indexOf("[", index);
let depth = 0;
let end = -1;
let inString = false;
let escaped = false;

for (let i = start; i < html.length; i += 1) {
  const char = html[i];
  if (inString) {
    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === '"') {
      inString = false;
    }
  } else if (char === '"') {
    inString = true;
  } else if (char === "[") {
    depth += 1;
  } else if (char === "]") {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}

const menu = JSON.parse(html.slice(start, end));

function show(items, level = 0) {
  for (const item of items) {
    console.log(
      `${"  ".repeat(level)}- ${item.nome || "(sem nome)"} | link=${item.link || ""} | id=${item.id} | pai=${item.id_pai || ""} | ordem=${item.ordem}`,
    );
    if (item.childs?.length) show(item.childs, level + 1);
  }
}

show(menu);
