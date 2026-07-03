/* =========================================================
   HangI0 店主后台
   - 产品：增 / 删 / 改 / 发布切换
   - 店铺设置：电话 / 微信 / 二维码 / 地址 / 营业时间
   - 穿搭（Lookbook）：增 / 删 / 改 / 显示切换
   Supabase 已配置时写线上库，否则写本机 localStorage（演示）
   ========================================================= */

const note = document.querySelector("[data-form-note]");
const authNote = document.querySelector("[data-auth-note]");
const settingsNote = document.querySelector("[data-settings-note]");
const outfitNote = document.querySelector("[data-outfit-note]");

let client = null;
let cachedProducts = [];
let cachedOutfits = [];
let cachedSettings = {};

const THEMES = [
  { key: "spring-sakura", season: "春", name: "樱花", c: ["#f7efec", "#2a1d21", "#c9748a"] },
  { key: "spring-green", season: "春", name: "新绿", c: ["#f2f3ea", "#20261c", "#6a8f52"] },
  { key: "summer-salt", season: "夏", name: "海盐", c: ["#eef3f4", "#16232a", "#2f8f9d"] },
  { key: "summer-soda", season: "夏", name: "柠檬苏打", c: ["#f6f5ec", "#232418", "#e88a4d"] },
  { key: "autumn-clay", season: "秋", name: "暖陶", c: ["#f4f0e7", "#17140d", "#b0553a"] },
  { key: "autumn-maple", season: "秋", name: "枫叶", c: ["#f1e9dd", "#241a12", "#a5432a"] },
  { key: "winter-cedar", season: "冬", name: "雪松", c: ["#eef0ee", "#1a201e", "#4a7c6f"] },
  { key: "winter-indigo", season: "冬", name: "墨蓝", c: ["#eef0f4", "#181b24", "#3f5a8f"] }
];

function hasSupabaseConfig() {
  const c = window.BOUTIQUE_CONFIG || {};
  return Boolean(c.SUPABASE_URL && c.SUPABASE_ANON_KEY);
}
function initSupabase() {
  if (!hasSupabaseConfig() || !window.supabase) return null;
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.BOUTIQUE_CONFIG;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
function setNote(msg, target = note) { if (target) target.textContent = msg; }
function readLocal(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function writeLocal(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ---------- 图片 ---------- */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
/* 上传前压缩：等比缩到最长边 1600px、转 JPEG 质量 0.85，明显减小体积。
   跳过 gif / svg 与非图片文件。 */
async function compressImage(file, maxDim = 1600, quality = 0.85) {
  if (!file || !file.type?.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (Math.max(width, height) > maxDim) {
      const r = maxDim / Math.max(width, height);
      width = Math.round(width * r); height = Math.round(height * r);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    bitmap.close?.();
    if (!blob || blob.size >= file.size) return file; // 压不动就用原图
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch { return file; }
}

async function uploadImage(file, prefix = "product") {
  if (!file) return "";
  file = await compressImage(file);
  if (!client) return fileToDataUrl(file);
  const bucket = window.BOUTIQUE_CONFIG?.STORAGE_BUCKET || "product-images";
  const safe = file.name.replace(/[^\w.-]+/g, "-");
  const path = `${prefix}/${Date.now()}-${safe}`;
  const { error } = await client.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
async function uploadImages(files, prefix = "product") {
  const valid = Array.from(files || []).filter((f) => f?.size);
  const urls = [];
  for (const f of valid) urls.push(await uploadImage(f, prefix));
  return urls;
}

/* ---------- 解析辅助 ---------- */
function productModelImages(p) {
  if (Array.isArray(p.model_image_urls)) return p.model_image_urls.filter(Boolean);
  if (!p.model_image_urls) return p.model_image_url ? [p.model_image_url] : [];
  if (typeof p.model_image_urls === "string") {
    try { const x = JSON.parse(p.model_image_urls); if (Array.isArray(x)) return x.filter(Boolean); }
    catch { return p.model_image_urls.split(/\r?\n|,/).map((i) => i.trim()).filter(Boolean); }
  }
  return [];
}
function productModelImage(p) { return productModelImages(p)[0] || p.model_image_url || p.image_url || ""; }
function productClothingImage(p) { return p.clothing_image_url || p.image_url || p.model_image_url || ""; }
function productInventory(p) {
  if (Array.isArray(p.inventory)) return p.inventory;
  if (typeof p.inventory === "string") { try { const x = JSON.parse(p.inventory); return Array.isArray(x) ? x : []; } catch { return []; } }
  return [];
}
function outfitItems(o) {
  if (Array.isArray(o.items)) return o.items;
  if (typeof o.items === "string") { try { const x = JSON.parse(o.items); return Array.isArray(x) ? x : []; } catch { return []; } }
  return [];
}

/* =========================================================
   产品
   ========================================================= */
async function getProducts() {
  if (client) {
    const { data, error } = await client.from("products").select("*").order("created_at", { ascending: false });
    if (!error) { cachedProducts = data || []; return cachedProducts; }
    setNote(`读取失败：${error.message}`);
  }
  cachedProducts = readLocal("boutiqueProducts");
  return cachedProducts;
}

function buildInventory(fd) {
  // 留空的尺码跳过；明确填了数字（含 0）的保留 —— 全部填 0 即表示售罄
  return [["XS", "stock_xs"], ["S", "stock_s"], ["M", "stock_m"], ["L", "stock_l"], ["XL", "stock_xl"], ["均码", "stock_free"]]
    .map(([size, field]) => {
      const raw = fd.get(field);
      if (raw === null || String(raw).trim() === "") return null;
      return { size, stock: Number.parseInt(raw, 10) || 0 };
    })
    .filter(Boolean);
}

async function resolveCover(form, fd, existing, urlName, fileName, prefix) {
  const file = fd.get(fileName);
  const uploaded = file?.size ? await uploadImage(file, prefix) : "";
  const url = String(fd.get(urlName) || "").trim();
  return uploaded || url || (existing ? productClothingImage(existing) : "");
}

async function resolveModelImages(form, fd, existing) {
  const uploaded = await uploadImages(form.querySelector("[name='modelImageFiles']")?.files, "models");
  const urls = String(fd.get("model_image_urls") || "").split(/\r?\n|,/).map((i) => i.trim()).filter(Boolean);
  const provided = [...uploaded, ...urls];
  if (provided.length) return provided;
  return existing ? productModelImages(existing) : [];
}

async function buildProduct(form, existing) {
  const fd = new FormData(form);
  const cover = await resolveCover(form, fd, existing, "cover_image_url", "coverImageFile", "covers");
  if (!cover) throw new Error("请上传产品封面图，或填写图片链接。");
  const models = await resolveModelImages(form, fd, existing);
  const inventory = buildInventory(fd);
  return {
    name: String(fd.get("name") || "").trim(),
    category: fd.get("category"),
    price: String(fd.get("price") || "").trim(),
    tag: String(fd.get("tag") || "").trim(),
    description: String(fd.get("description") || "").trim(),
    image_url: cover,
    model_image_url: models[0] || cover,
    model_image_urls: models,
    clothing_image_url: cover,
    inventory,
    total_stock: inventory.reduce((s, i) => s + i.stock, 0),
    published: fd.get("published") === "on"
  };
}

async function saveProductRecord(base, editId) {
  if (client) {
    if (editId) { const { error } = await client.from("products").update(base).eq("id", editId); if (error) throw error; }
    else { const { error } = await client.from("products").insert({ ...base, id: crypto.randomUUID() }); if (error) throw error; }
    return;
  }
  const list = readLocal("boutiqueProducts");
  if (editId) {
    const i = list.findIndex((p) => p.id === editId);
    if (i >= 0) list[i] = { ...list[i], ...base, id: editId };
    else list.unshift({ ...base, id: editId });
  } else {
    list.unshift({ ...base, id: crypto.randomUUID() });
  }
  writeLocal("boutiqueProducts", list);
}

async function deleteProduct(id) {
  if (!confirm("确定删除这个款式？")) return;
  if (client) {
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) { setNote(`删除失败：${error.message}`); return; }
  } else {
    writeLocal("boutiqueProducts", readLocal("boutiqueProducts").filter((p) => p.id !== id));
  }
  if (editingProductId === id) resetProductForm();
  await renderProductList();
}

async function toggleProductPublish(id) {
  const p = cachedProducts.find((x) => x.id === id);
  if (!p) return;
  const next = !p.published;
  if (client) {
    const { error } = await client.from("products").update({ published: next }).eq("id", id);
    if (error) { setNote(`操作失败：${error.message}`); return; }
  } else {
    const list = readLocal("boutiqueProducts");
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) { list[i].published = next; writeLocal("boutiqueProducts", list); }
  }
  await renderProductList();
}

let editingProductId = null;
function fillProductForm(p) {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;
  form.elements.name.value = p.name || "";
  form.elements.category.value = p.category || "dress";
  form.elements.price.value = p.price || "";
  form.elements.tag.value = p.tag || "";
  form.elements.description.value = p.description || "";
  form.elements.cover_image_url.value = productClothingImage(p) || "";
  form.elements.model_image_urls.value = productModelImages(p).join("\n");
  const inv = {};
  productInventory(p).forEach((i) => { inv[i.size] = i.stock; });
  const map = { XS: "stock_xs", S: "stock_s", M: "stock_m", L: "stock_l", XL: "stock_xl", "均码": "stock_free" };
  Object.entries(map).forEach(([size, field]) => { form.elements[field].value = inv[size] || ""; });
  form.elements.published.checked = p.published !== false;
}

function editProduct(id) {
  const p = cachedProducts.find((x) => x.id === id);
  if (!p) return;
  editingProductId = id;
  fillProductForm(p);
  document.querySelector("[data-product-edit-id]").value = id;
  document.querySelector("[data-product-form-title]").textContent = "编辑款式";
  document.querySelector("[data-product-mode-label]").textContent = "编辑";
  document.querySelector("[data-product-submit]").innerHTML = '<i data-lucide="save"></i> 更新款式';
  document.querySelector("[data-product-cancel]").hidden = false;
  window.lucide?.createIcons();
  document.querySelector("[data-product-form]").scrollIntoView({ behavior: "smooth", block: "start" });
  setNote("正在编辑：留空图片则沿用原图。");
}

function resetProductForm() {
  const form = document.querySelector("[data-product-form]");
  editingProductId = null;
  form?.reset();
  if (form) form.elements.published.checked = true;
  document.querySelector("[data-product-edit-id]").value = "";
  document.querySelector("[data-product-form-title]").textContent = "添加新款";
  document.querySelector("[data-product-mode-label]").textContent = "发布";
  document.querySelector("[data-product-submit]").innerHTML = '<i data-lucide="upload-cloud"></i> 保存款式';
  document.querySelector("[data-product-cancel]").hidden = true;
  window.lucide?.createIcons();
}

async function renderProductList() {
  const list = document.querySelector("[data-admin-list]");
  const products = await getProducts();
  if (!products.length) { list.innerHTML = `<p class="form-note">还没有添加款式。</p>`; return; }
  list.innerHTML = products.map((p) => {
    const inv = productInventory(p);
    const stock = typeof p.total_stock === "number" ? p.total_stock : inv.reduce((s, i) => s + (Number(i.stock) || 0), 0);
    const sizes = inv.length ? inv.map((i) => `${i.size}:${i.stock}`).join(" / ") : "未填写尺码库存";
    const isFeature = cachedSettings.feature_product_id === p.id;
    return `
      <article class="admin-item${isFeature ? " is-feature-row" : ""}">
        <div class="admin-thumbs">
          <img src="${productClothingImage(p)}" alt="${p.name} 封面">
          <img src="${productModelImage(p)}" alt="${p.name} 上身图">
        </div>
        <div class="admin-item-body">
          <h3>${p.name} ${p.tag ? `<span class="admin-badge">${p.tag}</span>` : ""}${isFeature ? `<span class="admin-badge feature">★ 本周精选</span>` : ""}</h3>
          <p>${p.price || ""} · 库存 ${stock} 件 · ${p.published ? "已发布" : "未发布"}</p>
          <p class="admin-stock-line">${sizes}</p>
        </div>
        <div class="admin-item-actions">
          <button class="mini-action${isFeature ? " is-feature" : ""}" type="button" data-feature-set="${p.id}">${isFeature ? "★ 精选中" : "设为精选"}</button>
          <button class="mini-action" type="button" data-edit="${p.id}">编辑</button>
          <button class="mini-action" type="button" data-toggle="${p.id}">${p.published ? "下架" : "发布"}</button>
          <button class="danger-button" type="button" data-delete="${p.id}">删除</button>
        </div>
      </article>`;
  }).join("");
  list.querySelectorAll("[data-feature-set]").forEach((b) => b.addEventListener("click", () => setFeature(b.dataset.featureSet)));
  list.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editProduct(b.dataset.edit)));
  list.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", () => toggleProductPublish(b.dataset.toggle)));
  list.querySelectorAll("[data-delete]").forEach((b) => b.addEventListener("click", () => deleteProduct(b.dataset.delete)));
}

/* =========================================================
   店铺设置
   ========================================================= */
const SETTING_KEYS = ["phone", "wechat", "wechat_qr", "address", "hours", "theme", "hero_image_url", "hero_line1", "hero_line2", "hero_sub", "announce"];
const SETTING_TEXT_KEYS = ["phone", "wechat", "wechat_qr", "address", "hours", "hero_image_url", "hero_line1", "hero_line2", "hero_sub", "announce"];

async function loadSettings() {
  if (client) {
    const { data, error } = await client.from("site_settings").select("key, value");
    if (!error && data) {
      const obj = {};
      data.forEach((r) => { obj[r.key] = r.value; });
      return obj;
    }
  }
  return JSON.parse(localStorage.getItem("boutiqueSettings") || "{}");
}

function renderThemePicker() {
  const host = document.querySelector("[data-theme-picker]");
  const input = document.querySelector("[data-theme-input]");
  if (!host) return;
  const current = input?.value || "autumn-clay";
  host.innerHTML = THEMES.map((t) => `
    <button type="button" class="theme-swatch${t.key === current ? " active" : ""}" data-theme-key="${t.key}" title="${t.season} · ${t.name}">
      <span class="theme-strip">
        <i style="background:${t.c[0]}"></i><i style="background:${t.c[2]}"></i><i style="background:${t.c[1]}"></i>
      </span>
      <span class="theme-name">${t.season} · ${t.name}</span>
    </button>`).join("");
  host.querySelectorAll("[data-theme-key]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (input) input.value = btn.dataset.themeKey;
      host.querySelectorAll(".theme-swatch").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

async function fillSettingsForm() {
  const form = document.querySelector("[data-settings-form]");
  if (!form) return;
  cachedSettings = await loadSettings();
  SETTING_TEXT_KEYS.forEach((k) => { if (form.elements[k]) form.elements[k].value = cachedSettings[k] || ""; });
  const themeInput = document.querySelector("[data-theme-input]");
  if (themeInput) themeInput.value = cachedSettings.theme || "autumn-clay";
  renderThemePicker();
}

async function saveSettings(form) {
  const fd = new FormData(form);
  const values = {
    phone: String(fd.get("phone") || "").trim(),
    wechat: String(fd.get("wechat") || "").trim(),
    address: String(fd.get("address") || "").trim(),
    hours: String(fd.get("hours") || "").trim(),
    wechat_qr: String(fd.get("wechat_qr") || "").trim(),
    theme: String(fd.get("theme") || "autumn-clay").trim(),
    hero_image_url: String(fd.get("hero_image_url") || "").trim(),
    hero_line1: String(fd.get("hero_line1") || "").trim(),
    hero_line2: String(fd.get("hero_line2") || "").trim(),
    hero_sub: String(fd.get("hero_sub") || "").trim(),
    announce: String(fd.get("announce") || "").trim()
  };
  const qrFile = fd.get("wechatQrFile");
  if (qrFile?.size) values.wechat_qr = await uploadImage(qrFile, "wechat");
  const heroFile = fd.get("heroImageFile");
  if (heroFile?.size) values.hero_image_url = await uploadImage(heroFile, "hero");

  if (client) {
    const rows = SETTING_KEYS.map((k) => ({ key: k, value: values[k] || "" }));
    const { error } = await client.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
  } else {
    localStorage.setItem("boutiqueSettings", JSON.stringify({ ...cachedSettings, ...values }));
  }
  cachedSettings = { ...cachedSettings, ...values };
}

/* 设为本周精选（单独写入，不随设置表单一起提交，避免被覆盖） */
async function setFeature(id) {
  const next = cachedSettings.feature_product_id === id ? "" : id;
  if (client) {
    const { error } = await client.from("site_settings").upsert([{ key: "feature_product_id", value: next }], { onConflict: "key" });
    if (error) { setNote(`设置精选失败：${error.message}`); return; }
  } else {
    const s = JSON.parse(localStorage.getItem("boutiqueSettings") || "{}");
    s.feature_product_id = next;
    localStorage.setItem("boutiqueSettings", JSON.stringify(s));
  }
  cachedSettings.feature_product_id = next;
  setNote(next ? "已设为本周精选。" : "已取消本周精选。");
  await renderProductList();
}

/* =========================================================
   穿搭 Lookbook
   ========================================================= */
async function getOutfits() {
  if (client) {
    const { data, error } = await client.from("outfits").select("*").order("sort", { ascending: true }).order("created_at", { ascending: false });
    if (!error) { cachedOutfits = data || []; return cachedOutfits; }
    setNote(`读取失败：${error.message}`, outfitNote);
  }
  cachedOutfits = readLocal("boutiqueOutfits");
  return cachedOutfits;
}

function parseOutfitItems(text) {
  return String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [name, ...rest] = line.split("|");
    return { name: name.trim(), note: rest.join("|").trim() };
  });
}

async function buildOutfit(form, existing) {
  const fd = new FormData(form);
  const cover = await resolveCover(form, fd, existing, "cover_image_url", "coverImageFile", "outfits");
  if (!cover) throw new Error("请上传封面图，或填写图片链接。");
  const imageUrls = String(fd.get("image_urls") || "").split(/\r?\n|,/).map((i) => i.trim()).filter(Boolean);
  return {
    title: String(fd.get("title") || "").trim(),
    description: String(fd.get("description") || "").trim(),
    cover_image_url: cover,
    image_urls: imageUrls,
    items: parseOutfitItems(fd.get("items")),
    sort: Number.parseInt(fd.get("sort"), 10) || 0,
    published: fd.get("published") === "on"
  };
}

async function saveOutfitRecord(base, editId) {
  if (client) {
    if (editId) { const { error } = await client.from("outfits").update(base).eq("id", editId); if (error) throw error; }
    else { const { error } = await client.from("outfits").insert({ ...base, id: crypto.randomUUID() }); if (error) throw error; }
    return;
  }
  const list = readLocal("boutiqueOutfits");
  if (editId) {
    const i = list.findIndex((o) => o.id === editId);
    if (i >= 0) list[i] = { ...list[i], ...base, id: editId };
    else list.unshift({ ...base, id: editId });
  } else {
    list.unshift({ ...base, id: crypto.randomUUID() });
  }
  writeLocal("boutiqueOutfits", list);
}

async function deleteOutfit(id) {
  if (!confirm("确定删除这套穿搭？")) return;
  if (client) {
    const { error } = await client.from("outfits").delete().eq("id", id);
    if (error) { setNote(`删除失败：${error.message}`, outfitNote); return; }
  } else {
    writeLocal("boutiqueOutfits", readLocal("boutiqueOutfits").filter((o) => o.id !== id));
  }
  if (editingOutfitId === id) resetOutfitForm();
  await renderOutfitList();
}

async function toggleOutfitPublish(id) {
  const o = cachedOutfits.find((x) => x.id === id);
  if (!o) return;
  const next = !o.published;
  if (client) {
    const { error } = await client.from("outfits").update({ published: next }).eq("id", id);
    if (error) { setNote(`操作失败：${error.message}`, outfitNote); return; }
  } else {
    const list = readLocal("boutiqueOutfits");
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) { list[i].published = next; writeLocal("boutiqueOutfits", list); }
  }
  await renderOutfitList();
}

let editingOutfitId = null;
function editOutfit(id) {
  const o = cachedOutfits.find((x) => x.id === id);
  if (!o) return;
  editingOutfitId = id;
  const form = document.querySelector("[data-outfit-form]");
  form.elements.title.value = o.title || "";
  form.elements.sort.value = o.sort ?? "";
  form.elements.cover_image_url.value = o.cover_image_url || "";
  form.elements.image_urls.value = (Array.isArray(o.image_urls) ? o.image_urls : []).join("\n");
  form.elements.items.value = outfitItems(o).map((it) => (it.note ? `${it.name} | ${it.note}` : it.name)).join("\n");
  form.elements.description.value = o.description || "";
  form.elements.published.checked = o.published !== false;
  document.querySelector("[data-outfit-edit-id]").value = id;
  document.querySelector("[data-outfit-form-title]").textContent = "编辑穿搭";
  document.querySelector("[data-outfit-mode-label]").textContent = "编辑";
  document.querySelector("[data-outfit-submit]").innerHTML = '<i data-lucide="save"></i> 更新穿搭';
  document.querySelector("[data-outfit-cancel]").hidden = false;
  window.lucide?.createIcons();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetOutfitForm() {
  const form = document.querySelector("[data-outfit-form]");
  editingOutfitId = null;
  form?.reset();
  if (form) form.elements.published.checked = true;
  document.querySelector("[data-outfit-edit-id]").value = "";
  document.querySelector("[data-outfit-form-title]").textContent = "添加穿搭（Lookbook）";
  document.querySelector("[data-outfit-mode-label]").textContent = "搭配";
  document.querySelector("[data-outfit-submit]").innerHTML = '<i data-lucide="upload-cloud"></i> 保存穿搭';
  document.querySelector("[data-outfit-cancel]").hidden = true;
  window.lucide?.createIcons();
}

async function renderOutfitList() {
  const list = document.querySelector("[data-outfit-list]");
  const outfits = await getOutfits();
  if (!outfits.length) { list.innerHTML = `<p class="form-note">还没有添加穿搭。展示页会先显示内置示例。</p>`; return; }
  list.innerHTML = outfits.map((o) => {
    const items = outfitItems(o);
    return `
      <article class="admin-item">
        <div class="admin-thumbs single"><img src="${o.cover_image_url}" alt="${o.title}"></div>
        <div class="admin-item-body">
          <h3>${o.title || "未命名穿搭"}</h3>
          <p>排序 ${o.sort ?? 0} · ${items.length} 件单品 · ${o.published ? "显示中" : "已隐藏"}</p>
          <p class="admin-stock-line">${items.map((i) => i.name).join(" · ") || "未填写单品"}</p>
        </div>
        <div class="admin-item-actions">
          <button class="mini-action" type="button" data-outfit-edit="${o.id}">编辑</button>
          <button class="mini-action" type="button" data-outfit-toggle="${o.id}">${o.published ? "隐藏" : "显示"}</button>
          <button class="danger-button" type="button" data-outfit-delete="${o.id}">删除</button>
        </div>
      </article>`;
  }).join("");
  list.querySelectorAll("[data-outfit-edit]").forEach((b) => b.addEventListener("click", () => editOutfit(b.dataset.outfitEdit)));
  list.querySelectorAll("[data-outfit-toggle]").forEach((b) => b.addEventListener("click", () => toggleOutfitPublish(b.dataset.outfitToggle)));
  list.querySelectorAll("[data-outfit-delete]").forEach((b) => b.addEventListener("click", () => deleteOutfit(b.dataset.outfitDelete)));
}

/* =========================================================
   表单绑定
   ========================================================= */
function bindForms() {
  document.querySelector("[data-login-form]")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!client) { setNote("演示模式无需登录。", authNote); return; }
    const fd = new FormData(e.currentTarget);
    setNote("正在登录...", authNote);
    const { error } = await client.auth.signInWithPassword({ email: fd.get("email"), password: fd.get("password") });
    if (error) { setNote(`登录失败：${error.message}`, authNote); return; }
    setNote("已登录。", authNote);
    setAuthUI(true);
    await loadAllAdminData();
  });

  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    if (client) await client.auth.signOut();
    adminDataLoaded = false;
    setAuthUI(false);
    setNote("已退出登录。", authNote);
  });

  document.querySelector("[data-product-form]")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setNote("正在保存...");
    try {
      const existing = editingProductId ? cachedProducts.find((p) => p.id === editingProductId) : null;
      const base = await buildProduct(form, existing);
      await saveProductRecord(base, editingProductId);
      setNote(client ? (editingProductId ? "已更新到线上库。" : "已发布到线上库。") : "已保存到本机演示数据。");
      resetProductForm();
      await renderProductList();
    } catch (err) { setNote(`保存失败：${err.message}`); }
  });
  document.querySelector("[data-product-cancel]")?.addEventListener("click", resetProductForm);

  document.querySelector("[data-settings-form]")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setNote("正在保存...", settingsNote);
    try { await saveSettings(e.currentTarget); setNote("已保存，展示页刷新后生效。", settingsNote); }
    catch (err) { setNote(`保存失败：${err.message}`, settingsNote); }
  });

  document.querySelector("[data-outfit-form]")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setNote("正在保存...", outfitNote);
    try {
      const existing = editingOutfitId ? cachedOutfits.find((o) => o.id === editingOutfitId) : null;
      const base = await buildOutfit(form, existing);
      await saveOutfitRecord(base, editingOutfitId);
      setNote(client ? (editingOutfitId ? "已更新穿搭。" : "已添加穿搭。") : "已保存到本机演示数据。", outfitNote);
      resetOutfitForm();
      await renderOutfitList();
    } catch (err) { setNote(`保存失败：${err.message}`, outfitNote); }
  });
  document.querySelector("[data-outfit-cancel]")?.addEventListener("click", resetOutfitForm);
}

/* ---------- 启动 ---------- */
/* 登录门：未登录只显示登录框，隐藏所有管理面板 */
function setAuthUI(loggedIn) {
  document.querySelectorAll("[data-admin-gate]").forEach((el) => { el.hidden = !loggedIn; });
  const loginForm = document.querySelector("[data-login-form]");
  const loggedInBox = document.querySelector("[data-logged-in]");
  if (loginForm) loginForm.hidden = loggedIn;
  if (loggedInBox) loggedInBox.hidden = !loggedIn;
  window.lucide?.createIcons();
}

let adminDataLoaded = false;
async function loadAllAdminData() {
  if (adminDataLoaded) return;
  adminDataLoaded = true;
  await fillSettingsForm();
  await renderProductList();
  await renderOutfitList();
  window.lucide?.createIcons();
}

async function init() {
  client = initSupabase();
  bindForms();

  if (!client) {
    // 未配置 Supabase 的演示模式：无真实登录后端，直接显示（仅本机）
    setNote("演示模式（未配置 Supabase）：无需登录，改动仅存本机。", authNote);
    setAuthUI(true);
    await loadAllAdminData();
    window.lucide?.createIcons();
    return;
  }

  const { data } = await client.auth.getSession();
  if (data.session) {
    setNote("已登录。", authNote);
    setAuthUI(true);
    await loadAllAdminData();
  } else {
    setNote("请先登录后查看和管理店铺内容。", authNote);
    setAuthUI(false);
  }

  client.auth.onAuthStateChange((_event, session) => {
    if (session) { setAuthUI(true); loadAllAdminData(); }
    else { adminDataLoaded = false; setAuthUI(false); }
  });

  window.lucide?.createIcons();
}
init();
