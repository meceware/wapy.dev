// This script fetches dashboard icons from a GitHub repository, checks for updates, and saves the icons and metadata locally.
// https://github.com/homarr-labs/dashboard-icons

const fs = require("fs");
const path = require("path");
const https = require("https");

const RAW_BASE = "https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main";
const API_BASE = "https://api.github.com/repos/homarr-labs/dashboard-icons/commits/main";

const TARGET_ICONS_DIR = path.join(__dirname, "..", "public", "icons", "dashboard");
const TARGET_LICENSE = path.join(__dirname, "..", "public", "icons", "dashboard", "LICENSE");
const TARGET_METADATA = path.join(__dirname, "..", "public", "icons", "dashboard", "metadata.json");
const CACHE_FILE = path.join(__dirname, "..", "public", "icons", "dashboard", ".cache.json");

function fetchFile(url, isJson = false) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "dashboard-icons-fetch-script" } }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        return;
      }
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(isJson ? JSON.parse(data) : data));
    }).on("error", reject);
  });
}

async function runWithLimit(items, limit, worker) {
  const executing = [];
  const results = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => worker(item));
    results.push(p);

    if (limit <= items.length) {
      const e = p.finally(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.allSettled(results);
}

const main = async () => {
  const checkCache = async () => {
    let lastSha = null;
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
        lastSha = cacheData.sha;
      } catch {}
    }

    const commitData = await fetchFile(API_BASE, true);
    const latestSha = commitData.sha;

    return [lastSha === latestSha, latestSha];
  };

  const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  console.log("📥 Fetching Dashboard Icons...");

  ensureDir(TARGET_ICONS_DIR);
  ensureDir(path.dirname(TARGET_LICENSE));
  ensureDir(path.dirname(TARGET_METADATA));

  // Check cache
  const [isCached, latestSha] = await checkCache();
  if (isCached) {
    console.log("✅ No changes in dashboard-icons repo. Skipping download.");
    return;
  }

  // Download LICENSE
  const licenseText = await fetchFile(`${RAW_BASE}/LICENSE`);
  fs.writeFileSync(TARGET_LICENSE, licenseText, "utf8");
  console.log("✅ LICENSE saved.");

  // Download tree.json
  const tree = await fetchFile(`${RAW_BASE}/tree.json`, true);
  console.log(`📂 Found ${tree.svg.length} SVG files in tree.json`);

  // Download and simplify metadata.json
  const metadata = await fetchFile(`${RAW_BASE}/metadata.json`, true);
  const simplifiedMetadata = {};
  const isMetadataValid = (tree, name, info) => {
    return (info?.colors) ? (
      (info.colors?.dark ? tree.svg.includes(`${info.colors.dark}.svg`) : true)
      &&
      (info.colors?.light ? tree.svg.includes(`${info.colors.light}.svg`) : true)
    ) : tree.svg.includes(`${name}.svg`);
  };
  const findRealColors = (name, colors) => {
    if (!colors) return {};

    if (colors?.dark && colors.dark.includes(`${name}-dark`)) {
      colors.light = colors.dark;
      colors.dark = colors.dark.replace(`-dark`, '');
    } else if (colors.light && colors.light.includes(`${name}-light`)) {
      colors.dark = colors.light;
      colors.light = colors.light.replace(`-light`, '');
    }

    return colors;
  };

  for (const [name, info] of Object.entries(metadata)) {
    if (isMetadataValid(tree, name, info)) {
      simplifiedMetadata[name] = {
        aliases: info.aliases || [],
        colors: findRealColors(name, info.colors),
      };
    } else {
      // console.log(`⚠️ Missing in tree.json: ${name}.svg`);
    }
  }
  fs.writeFileSync(TARGET_METADATA, JSON.stringify(simplifiedMetadata), "utf8");
  console.log(`✅ Metadata saved with ${Object.keys(simplifiedMetadata).length} entries`);


  // Download SVG files
  console.log(`⬇️ Downloading SVG icons with concurrency limit (10 at a time)...`);
  const results = await runWithLimit(tree.svg, 10, async svgPath => {
    const fileName = path.basename(svgPath);
    const localPath = path.join(TARGET_ICONS_DIR, fileName);
    try {
      const svgContent = await fetchFile(`${RAW_BASE}/svg/${svgPath}`);
      fs.writeFileSync(localPath, svgContent, "utf8");
      return { file: fileName, success: true };
    } catch (err) {
      return { file: fileName, success: false, error: err.message };
    }
  });

  const failed = results
    .filter(r => r.status === "fulfilled" && r.value.success === false)
    .map(r => r.value);
  console.log(`✅ Downloaded ${results.length - failed.length} icons`);
  if (failed.length > 0) {
    console.warn(`⚠️ Failed to download ${failed.length} icons:`);
    failed.forEach(f => console.warn(` - ${f.file}: ${f.error}`));
  } else {
    // Save cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ sha: latestSha }, null, 2), "utf8");
    console.log("💾 Cache updated");
  }

}

main().catch(err => {
  console.error("❌ Error fetching dashboard icons:", err);
  process.exit(1);
});
