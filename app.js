/* =========================================================
   HangI0 — 女装展示逻辑
   数据契约：Supabase products / outfits / site_settings
   products 字段：name, category, price, tag, description,
   clothing_image_url, model_image_urls(jsonb), image_url,
   inventory(jsonb [{size,stock}]), published, created_at
   ========================================================= */

/* ---------- 演示回退数据 ---------- */
const defaultProducts = [
  {
    id: "dress-01", name: "云感西装连衣裙", category: "dress", price: "¥699", tag: "新品",
    description: "挺括肩线配合收腰剪裁，适合通勤、晚餐和轻正式场合。",
    clothing_image_url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=82",
    image_url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=82",
    model_image_urls: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=82"
    ],
    inventory: [{ size: "S", stock: 3 }, { size: "M", stock: 5 }, { size: "L", stock: 2 }], published: true
  },
  {
    id: "dress-02", name: "黑色吊带长裙", category: "dress", price: "¥599", tag: "显瘦",
    description: "垂坠长线条和可调节肩带，适合叠穿西装或单独出席聚会。",
    clothing_image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=82",
    image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=82",
    model_image_urls: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=82"],
    inventory: [{ size: "M", stock: 4 }, { size: "L", stock: 2 }], published: true
  },
  {
    id: "daily-01", name: "净色肌理衬衫", category: "daily", price: "¥329", tag: "日常",
    description: "微皱肌理减少打理成本，单穿或内搭都干净利落。",
    clothing_image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=82",
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=82",
    model_image_urls: ["https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=900&q=82"],
    inventory: [{ size: "均码", stock: 8 }], published: true
  },
  {
    id: "bottom-01", name: "亚麻直筒长裤", category: "bottom", price: "¥469", tag: "",
    description: "轻薄亚麻混纺，腰部留有余量，适合搭配衬衫和背心。",
    clothing_image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=82",
    image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=82",
    model_image_urls: ["https://images.unsplash.com/photo-1548624313-0396c75f8f1d?auto=format&fit=crop&w=900&q=82"],
    inventory: [{ size: "S", stock: 2 }, { size: "M", stock: 5 }, { size: "L", stock: 3 }], published: true
  },
  {
    id: "outer-01", name: "短款廓形风衣", category: "outerwear", price: "¥899", tag: "热卖",
    description: "轻量防风面料，短款比例更适合小个子和高腰下装。",
    clothing_image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=82",
    image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=82",
    model_image_urls: ["https://images.unsplash.com/photo-1548624313-0396c75f8f1d?auto=format&fit=crop&w=900&q=82"],
    inventory: [{ size: "S", stock: 2 }, { size: "M", stock: 4 }], published: true
  },
  {
    id: "set-01", name: "周末针织套装", category: "set", price: "¥759", tag: "套装",
    description: "柔软针织和宽松轮廓，适合旅行、咖啡约会和居家外穿。",
    clothing_image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=82",
    image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=82",
    model_image_urls: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=82"],
    inventory: [{ size: "S", stock: 1 }, { size: "M", stock: 3 }, { size: "L", stock: 3 }], published: true
  },
  {
    id: "outer-02", name: "轻量皮感夹克", category: "outerwear", price: "¥1,090", tag: "限量",
    description: "利落短夹克版型，适合搭配连衣裙、牛仔裤和宽腿裤。",
    clothing_image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=82",
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=82",
    model_image_urls: ["https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=900&q=82"],
    inventory: [{ size: "S", stock: 2 }, { size: "M", stock: 2 }], published: true
  }
];

const defaultOutfits = [
  {
    id: "look-1", title: "街头 · 松弛廓形",
    description: "燕麦色西装外套配高腰直筒裤，松弛但有型，适合周末逛街和咖啡约会。",
    cover_image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
    image_urls: [],
    items: [
      { name: "燕麦色 oversize 西装外套", note: "S / M 现货" },
      { name: "高腰直筒牛仔裤", note: "浅蓝洗水" },
      { name: "圆头乐福鞋", note: "可到店试穿" }
    ], published: true
  },
  {
    id: "look-2", title: "夜晚 · 垂坠长裙",
    description: "黑色垂坠吊带长裙，配一双细高跟，适合聚会与晚餐场合。",
    cover_image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
    image_urls: [],
    items: [
      { name: "黑色垂坠吊带长裙", note: "M / L 现货" },
      { name: "短款西装外套", note: "叠穿更利落" },
      { name: "细带高跟凉鞋", note: "" }
    ], published: true
  },
  {
    id: "look-3", title: "通勤 · 短外套",
    description: "短外套配直筒裤的经典通勤组合，颜色克制、显气质。",
    cover_image_url: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=900&q=85",
    image_urls: [],
    items: [
      { name: "轻量短外套", note: "限量" },
      { name: "净色针织内搭", note: "" },
      { name: "直筒西装裤", note: "" }
    ], published: true
  },
  {
    id: "look-4", title: "周末 · 针织套装",
    description: "柔软针织上衣配同色系半裙，一整套搞定周末穿搭。",
    cover_image_url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=1200&q=85",
    image_urls: [],
    items: [
      { name: "针织短上衣", note: "S / M / L" },
      { name: "同色系针织半裙", note: "" },
      { name: "帆布托特包", note: "" }
    ], published: true
  }
];

const defaultSettings = {
  phone: "13800000000",
  wechat: "HangI0-shop",
  wechat_qr: "",
  address: "示例市 · 示例区 · 示例路 88 号",
  hours: "周二至周日 · 11:00 – 20:00",
  theme: "autumn-clay",
  feature_product_id: "",
  hero_image_url: "",
  hero_line1: "夏日",
  hero_line2: "新装",
  hero_sub: "为长日照、微风与周末出行准备的轻盈女装。\n线上看款，到店试穿。",
  announce: "满 ¥499 免配送\n365 天内可调换\n每周三 / 周六上新\n线上看款 · 到店试穿"
};

const WISH_KEY = "hangi0_wishlist";

const state = {
  products: [],
  outfits: [],
  settings: { ...defaultSettings },
  filter: "all",
  query: ""
};

/* ---------- Supabase ---------- */
function hasSupabaseConfig() {
  const config = window.BOUTIQUE_CONFIG || {};
  return Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
}
function getSupabaseClient() {
  if (!hasSupabaseConfig() || !window.supabase) return null;
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.BOUTIQUE_CONFIG;
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supa = getSupabaseClient();

async function loadProducts() {
  if (supa) {
    const { data, error } = await supa
      .from("products").select("*").eq("published", true)
      .order("created_at", { ascending: false });
    if (!error && data?.length) return data;
  }
  const local = JSON.parse(localStorage.getItem("boutiqueProducts") || "[]");
  return dedupeById([...local, ...defaultProducts]).filter((p) => p.published !== false);
}

function dedupeById(arr) {
  const seen = new Set();
  return arr.filter((x) => { if (!x || seen.has(x.id)) return false; seen.add(x.id); return true; });
}

async function loadOutfits() {
  if (supa) {
    const { data, error } = await supa
      .from("outfits").select("*").eq("published", true)
      .order("sort", { ascending: true }).order("created_at", { ascending: false });
    if (!error && data?.length) return data;
  }
  const local = JSON.parse(localStorage.getItem("boutiqueOutfits") || "[]");
  const merged = dedupeById([...local, ...defaultOutfits]).filter((o) => o.published !== false);
  return merged.slice(0, 6);
}

async function loadSettings() {
  if (supa) {
    const { data, error } = await supa.from("site_settings").select("key, value");
    if (!error && data?.length) {
      const obj = {};
      data.forEach((row) => { if (row.value != null && row.value !== "") obj[row.key] = row.value; });
      return { ...defaultSettings, ...obj };
    }
  }
  const local = JSON.parse(localStorage.getItem("boutiqueSettings") || "null");
  return { ...defaultSettings, ...(local || {}) };
}

/* ---------- 数据辅助 ---------- */
function parseImageList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === "string") {
    try { const p = JSON.parse(value); if (Array.isArray(p)) return p.filter(Boolean); }
    catch { return value.split(/\r?\n|,/).map((i) => i.trim()).filter(Boolean); }
  }
  return [];
}
function getModelImages(p) {
  const imgs = parseImageList(p.model_image_urls);
  if (p.model_image_url) imgs.unshift(p.model_image_url);
  if (!imgs.length && p.image_url) imgs.push(p.image_url);
  return [...new Set(imgs)].filter(Boolean);
}
function getModelImage(p) { return getModelImages(p)[0] || p.model_image_url || p.image_url || ""; }
function getClothingImage(p) { return p.clothing_image_url || p.image_url || p.model_image_url || ""; }
function getCoverImage(p) { return p.clothing_image_url || p.image_url || getModelImage(p); }
function getHoverImage(p) {
  const cover = getCoverImage(p);
  const models = getModelImages(p);
  return models.find((i) => i && i !== cover) || models[0] || cover;
}
function getInventory(p) {
  if (Array.isArray(p.inventory)) return p.inventory;
  if (typeof p.inventory === "string") { try { const x = JSON.parse(p.inventory); return Array.isArray(x) ? x : []; } catch { return []; } }
  return [];
}
function totalStock(p) { return getInventory(p).reduce((s, i) => s + (Number(i.stock) || 0), 0); }
function categoryLabel(c) {
  return ({ dress: "连衣裙", outerwear: "外套", daily: "上衣", bottom: "下装", set: "套装" }[c] || "精选");
}
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function getVisibleProducts() {
  return state.products.filter((p) => {
    const okFilter = state.filter === "all" || p.category === state.filter;
    const q = state.query.trim().toLowerCase();
    const hay = `${p.name} ${p.category} ${p.tag} ${p.description}`.toLowerCase();
    return okFilter && (!q || hay.includes(q));
  });
}

/* ---------- 心愿单（本机） ---------- */
function getWishlist() { try { return new Set(JSON.parse(localStorage.getItem(WISH_KEY) || "[]")); } catch { return new Set(); } }
function toggleWish(id) {
  const s = getWishlist();
  s.has(id) ? s.delete(id) : s.add(id);
  localStorage.setItem(WISH_KEY, JSON.stringify([...s]));
  return s.has(id);
}

/* ---------- 精选 ---------- */
function renderFeature() {
  const host = document.querySelector("[data-feature]");
  if (!host) return;
  const fid = state.settings.feature_product_id;
  let featured = fid ? state.products.find((p) => p.id === fid) : null;
  if (!featured) featured = state.products.find((p) => p.tag && ["限量", "热卖", "新品"].includes(p.tag)) || state.products[0];
  if (!featured) { host.innerHTML = ""; return; }
  const cover = getCoverImage(featured);
  host.innerHTML = `
    <div class="feature-inner">
      <div class="feature-media" data-product-id="${esc(featured.id)}" data-cursor-hover>
        <span class="feature-no">N°01</span>
        <img src="${esc(cover)}" alt="${esc(featured.name)}" loading="lazy">
      </div>
      <div class="feature-copy">
        <p class="eyebrow">本周精选 · ${categoryLabel(featured.category)}</p>
        <h3>${esc(featured.name)}</h3>
        <p>${esc(featured.description || "本周店里最想推荐的一件，欢迎线上看款、到店试穿。")}</p>
        <span class="feature-price">${esc(featured.price || "")}</span>
        <button class="btn solid" type="button" data-open="${esc(featured.id)}">查看细节</button>
      </div>
    </div>`;
  host.querySelector(".feature-media")?.addEventListener("click", () => openProduct(featured.id));
  host.querySelector("[data-open]")?.addEventListener("click", () => openProduct(featured.id));
}

/* ---------- 商品网格（潮流卡片） ---------- */
function renderProducts() {
  const grid = document.querySelector("[data-product-grid]");
  const countLabel = document.querySelector("[data-count-label]");
  if (!grid) return;
  const products = getVisibleProducts();
  const wish = getWishlist();

  if (countLabel) countLabel.textContent = `共 ${products.length} 款 · 全部为女装`;

  if (!products.length) {
    grid.innerHTML = `<p class="form-note">没有找到符合条件的款式，换个分类或关键词试试。</p>`;
    return;
  }

  grid.innerHTML = products.map((p) => {
    const cover = getCoverImage(p);
    const hover = getHoverImage(p);
    const showHover = hover && hover !== cover;
    const stock = totalStock(p);
    const soldOut = getInventory(p).length > 0 && stock === 0;
    const liked = wish.has(p.id) ? " is-liked" : "";
    const meta = soldOut ? "补货中" : (stock > 0 ? `现货 ${stock} 件` : "可咨询库存");
    return `
      <article class="pcard${soldOut ? " is-soldout" : ""}" tabindex="0" role="button" data-product-id="${esc(p.id)}" data-cursor-hover
        aria-label="${esc(p.name)}，${esc(p.price || "")}${soldOut ? "，补货中" : ""}">
        <div class="pcard-media">
          ${soldOut ? `<span class="pcard-soldout">售罄</span>` : ""}
          ${p.tag ? `<span class="pcard-tag">${esc(p.tag)}</span>` : ""}
          <button class="pcard-like${liked}" type="button" data-like="${esc(p.id)}" aria-label="收藏">
            <svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 21C12 21 2 14.5 2 7.8 2 4.6 4.5 2.5 7.3 2.5c1.9 0 3.6 1 4.7 2.8C13.1 3.5 14.8 2.5 16.7 2.5 19.5 2.5 22 4.6 22 7.8 22 14.5 12 21 12 21z"/></svg>
          </button>
          <img class="pc-cover" src="${esc(cover)}" alt="${esc(p.name)}" loading="lazy">
          ${showHover ? `<img class="pc-hover" src="${esc(hover)}" alt="${esc(p.name)} 上身图" loading="lazy">` : ""}
          <span class="pcard-view">查看细节 →</span>
        </div>
        <div class="pcard-info">
          <div class="pcard-name">
            <strong>${esc(p.name)}</strong>
            <small>${categoryLabel(p.category)} · ${meta}</small>
          </div>
          <span class="pcard-price">${esc(p.price || "")}</span>
        </div>
      </article>`;
  }).join("");

  grid.querySelectorAll("[data-product-id]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-like]")) return;
      openProduct(card.dataset.productId);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProduct(card.dataset.productId); }
    });
  });
  grid.querySelectorAll("[data-like]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const liked = toggleWish(btn.dataset.like);
      btn.classList.toggle("is-liked", liked);
      updateWishCount();
      showToast(liked ? "已加入心愿单 ♥" : "已移出心愿单");
    });
  });
  revealObserve(grid.querySelectorAll(".pcard"));
  updateWishCount();
}

/* ---------- 心愿单查看 ---------- */
function updateWishCount() {
  const n = getWishlist().size;
  document.querySelectorAll("[data-wish-count]").forEach((el) => { el.textContent = n ? n : ""; });
  document.querySelectorAll("[data-wishlist-open]").forEach((el) => el.classList.toggle("has-items", n > 0));
}

function openWishlist() {
  const dialog = document.querySelector("[data-wishlist-dialog]");
  const content = document.querySelector("[data-wishlist-content]");
  if (!dialog || !content) return;
  const wish = getWishlist();
  const items = state.products.filter((p) => wish.has(p.id));
  if (!items.length) {
    content.innerHTML = `<p class="wishlist-empty">还没有收藏。点商品右上角的 ♡ 收藏喜欢的款式，方便到店时一起看。</p>`;
  } else {
    content.innerHTML = `
      <div class="wishlist-grid">
        ${items.map((p) => `
          <article class="wish-card" data-wish-product="${esc(p.id)}" role="button" tabindex="0">
            <div class="wish-media">
              <img src="${esc(getCoverImage(p))}" alt="${esc(p.name)}" loading="lazy">
              <button class="wish-remove" type="button" data-wish-remove="${esc(p.id)}" aria-label="移出心愿单">✕</button>
            </div>
            <div class="wish-info"><strong>${esc(p.name)}</strong><span>${esc(p.price || "")}</span></div>
          </article>`).join("")}
      </div>`;
    content.querySelectorAll("[data-wish-product]").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-wish-remove]")) return;
        dialog.close();
        openProduct(card.dataset.wishProduct);
      });
    });
    content.querySelectorAll("[data-wish-remove]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleWish(btn.dataset.wishRemove);
        updateWishCount();
        renderProducts();
        openWishlist();
      });
    });
  }
  if (!dialog.open) dialog.showModal();
}

/* ---------- Lookbook（可点击穿搭） ---------- */
function renderLookbook() {
  const grid = document.querySelector("[data-lookbook-grid]");
  if (!grid) return;
  const outfits = state.outfits.slice(0, 4);
  if (!outfits.length) { grid.innerHTML = ""; return; }
  grid.innerHTML = outfits.map((o, i) => {
    const cls = i === 0 ? "lb lb-tall" : i === 3 ? "lb lb-wide" : "lb";
    return `
      <figure class="${cls}" data-outfit-id="${esc(o.id)}" tabindex="0" role="button"
        data-cursor-hover aria-label="查看整套穿搭：${esc(o.title)}">
        <img src="${esc(o.cover_image_url)}" alt="${esc(o.title)}" loading="lazy">
        <span class="lb-badge">整套 · LOOK</span>
        <figcaption>${esc(o.title)}<span>查看整套 →</span></figcaption>
      </figure>`;
  }).join("");
  grid.querySelectorAll("[data-outfit-id]").forEach((fig) => {
    fig.addEventListener("click", () => openOutfit(fig.dataset.outfitId));
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openOutfit(fig.dataset.outfitId); }
    });
  });
  revealObserve(grid.querySelectorAll(".lb"));
}

function openOutfit(id) {
  const o = state.outfits.find((x) => x.id === id);
  const dialog = document.querySelector("[data-outfit-dialog]");
  const content = document.querySelector("[data-outfit-content]");
  if (!o || !dialog || !content) return;
  const images = [...new Set([o.cover_image_url, ...parseImageList(o.image_urls)])].filter(Boolean);
  const main = images[0] || o.cover_image_url;
  let items = o.items;
  if (typeof items === "string") { try { items = JSON.parse(items); } catch { items = []; } }
  items = Array.isArray(items) ? items : [];
  const gallery = images.length > 1
    ? `<div class="tryon-gallery">${images.map((img, i) =>
        `<button class="tryon-thumb${i === 0 ? " active" : ""}" type="button" data-view-image="${esc(img)}">
          <img src="${esc(img)}" alt="${esc(o.title)} ${i + 1}" loading="lazy"></button>`).join("")}</div>`
    : "";
  const itemsMarkup = items.length
    ? `<ul class="outfit-items">${items.map((it) =>
        `<li><span class="oi-name">${esc(it.name || it)}</span>${it.note ? `<span class="oi-note">${esc(it.note)}</span>` : ""}</li>`).join("")}</ul>`
    : `<p class="stock-note">这套搭配的单品清单稍后补充，欢迎咨询店主。</p>`;

  content.innerHTML = `
    <div class="dialog-layout">
      <div class="outfit-photo">
        <img data-outfit-main src="${esc(main)}" alt="${esc(o.title)}">
      </div>
      <div class="dialog-copy">
        <p class="eyebrow">整套穿搭 · LOOK</p>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.description || "一整套搭配好的女装组合，点开看每件单品。")}</p>
        ${gallery}
        <p class="outfit-items-title">这一套包含</p>
        ${itemsMarkup}
        <div class="dialog-actions">
          <button class="btn solid" type="button" data-outfit-consult>咨询 / 预约试穿这套 →</button>
          <button class="btn line" type="button" data-outfit-share>分享</button>
        </div>
      </div>
    </div>`;
  dialog.showModal();
  content.querySelectorAll("[data-view-image]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = content.querySelector("[data-outfit-main]");
      if (img) img.src = btn.dataset.viewImage;
      content.querySelectorAll("[data-view-image]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  content.querySelector("[data-outfit-consult]")?.addEventListener("click", () => consult("outfit", o));
  content.querySelector("[data-outfit-share]")?.addEventListener("click", () => openShare({ title: `${o.title}｜HangI0 穿搭`, url: buildShareLink("outfit", o.id) }));
}

/* ---------- 3D 图片查看器 ---------- */
function bindPhotoViewer(viewer) {
  const object = viewer?.querySelector("[data-viewer-object]");
  if (!viewer || !object) return;
  let dragging = false, startX = 0, startY = 0, baseX = 0, baseY = 0;
  let translateX = 0, translateY = 0, rotateX = 0, rotateY = 0, scale = 1;
  const render = () => {
    const lim = 70 * scale;
    translateX = clamp(translateX, -lim, lim); translateY = clamp(translateY, -lim, lim);
    object.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    viewer.style.setProperty("--shine-x", `${clamp(50 + rotateY * 1.5, 20, 80)}%`);
    viewer.style.setProperty("--shine-y", `${clamp(50 - rotateX * 2, 18, 82)}%`);
  };
  const zoomTo = (n) => { scale = clamp(n, 1, 2.25); if (scale === 1) { translateX = translateY = rotateX = rotateY = 0; } render(); };
  const stop = () => { dragging = false; baseX = translateX; baseY = translateY; viewer.classList.remove("is-dragging"); };
  viewer.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".viewer-controls")) return;
    dragging = true; startX = e.clientX; startY = e.clientY; viewer.classList.add("is-dragging"); viewer.setPointerCapture?.(e.pointerId);
  });
  viewer.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    translateX = baseX + dx; translateY = baseY + dy;
    rotateY = clamp(dx * 0.025, -7, 7); rotateX = clamp(-dy * 0.018, -5, 5); render();
  });
  viewer.addEventListener("pointerup", stop);
  viewer.addEventListener("pointercancel", stop);
  viewer.addEventListener("wheel", (e) => { e.preventDefault(); zoomTo(scale + (e.deltaY > 0 ? -0.16 : 0.16)); }, { passive: false });
  viewer.addEventListener("dblclick", () => zoomTo(scale > 1.02 ? 1 : 1.75));
  viewer.querySelector("[data-zoom-in]")?.addEventListener("click", () => zoomTo(scale + 0.25));
  viewer.querySelector("[data-zoom-out]")?.addEventListener("click", () => zoomTo(scale - 0.25));
  viewer.querySelector("[data-zoom-reset]")?.addEventListener("click", () => zoomTo(1));
  viewer.querySelector(".viewer-controls")?.addEventListener("pointerdown", (e) => e.stopPropagation());
  render();
}

/* ---------- 商品详情弹窗 ---------- */
function openProduct(productId) {
  const product = state.products.find((i) => i.id === productId);
  const dialog = document.querySelector("[data-product-dialog]");
  const content = document.querySelector("[data-dialog-content]");
  if (!product || !dialog || !content) return;
  const modelImages = getModelImages(product);
  const modelImage = modelImages[0] || getCoverImage(product);
  const clothingImage = getClothingImage(product);
  const allInventory = getInventory(product);
  const inventory = allInventory.filter((i) => Number(i.stock) > 0);
  const soldOut = allInventory.length > 0 && inventory.length === 0;
  const gallery = modelImages.length
    ? modelImages.map((image, i) =>
        `<button class="tryon-thumb${i === 0 ? " active" : ""}" type="button" data-view-image="${esc(image)}" aria-label="查看第 ${i + 1} 张上身图">
          <img src="${esc(image)}" alt="${esc(product.name)} 上身图 ${i + 1}" loading="lazy"></button>`).join("")
    : "";
  const stockMarkup = inventory.length
    ? `<div class="size-stock" aria-label="可选尺码">${inventory.map((i) => `<span>${esc(i.size)} <strong>${esc(i.stock)}</strong></span>`).join("")}</div>`
    : soldOut
      ? `<p class="stock-note soldout">该款暂时售罄，补货请咨询店主。</p>`
      : `<p class="stock-note">库存请咨询店主确认。</p>`;

  content.innerHTML = `
    <div class="dialog-layout">
      <div class="photo-viewer" data-photo-viewer>
        <div class="viewer-bg" style="background-image: url('${esc(modelImage)}')"></div>
        <div class="photo-object" data-viewer-object><img src="${esc(modelImage)}" alt="${esc(product.name)}" draggable="false"></div>
        <div class="viewer-controls" aria-label="图片查看控制">
          <button type="button" data-zoom-out aria-label="缩小">−</button>
          <button type="button" data-zoom-reset aria-label="复位">↺</button>
          <button type="button" data-zoom-in aria-label="放大">＋</button>
        </div>
      </div>
      <div class="dialog-copy">
        <p class="eyebrow">${categoryLabel(product.category)}</p>
        <h3>${esc(product.name)}</h3>
        <strong class="price">${esc(product.price || "")}</strong>
        <p>${esc(product.description || "欢迎联系店主咨询尺码、库存和试穿安排。")}</p>
        ${gallery ? `<div class="tryon-gallery">${gallery}</div>` : ""}
        <div class="clothing-preview"><img src="${esc(clothingImage)}" alt="${esc(product.name)} 单品图"></div>
        ${stockMarkup}
        <div class="dialog-actions">
          <button class="btn solid" type="button" data-product-consult>咨询这款 →</button>
          <button class="btn line" type="button" data-product-share>分享</button>
        </div>
      </div>
    </div>`;
  dialog.showModal();
  const viewer = content.querySelector("[data-photo-viewer]");
  bindPhotoViewer(viewer);
  content.querySelectorAll("[data-view-image]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.viewImage;
      const img = viewer?.querySelector("[data-viewer-object] img");
      const bg = viewer?.querySelector(".viewer-bg");
      if (img && next) img.src = next;
      if (bg && next) bg.style.backgroundImage = `url('${next}')`;
      content.querySelectorAll("[data-view-image]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  content.querySelector("[data-product-consult]")?.addEventListener("click", () => consult("product", product));
  content.querySelector("[data-product-share]")?.addEventListener("click", () => openShare({ title: `${product.name}｜HangI0`, url: buildShareLink("product", product.id) }));
}

/* ---------- 店铺设置注入 ---------- */
function setText(sel, val) { document.querySelectorAll(sel).forEach((el) => { if (val != null) el.textContent = val; }); }

function renderAnnounce(text) {
  const track = document.querySelector("[data-announce-track]");
  const items = String(text || "").split(/\r?\n|\|/).map((s) => s.trim()).filter(Boolean);
  if (!track || !items.length) return;
  const one = items.map((i) => `<span>${esc(i)}</span><span>·</span>`).join("");
  track.innerHTML = one + one; // 复制一份用于无缝滚动
}

function applySettings() {
  const s = state.settings;
  document.documentElement.dataset.theme = s.theme || "autumn-clay";

  // 首屏与公告
  if (s.hero_image_url) { const img = document.querySelector("[data-hero-image]"); if (img) img.src = s.hero_image_url; }
  setText("[data-hero-line1]", s.hero_line1);
  setText("[data-hero-line2]", s.hero_line2);
  const heroSub = document.querySelector("[data-hero-sub]");
  if (heroSub && s.hero_sub) heroSub.innerHTML = esc(s.hero_sub).replace(/\r?\n/g, "<br>");
  renderAnnounce(s.announce);

  const telHref = `tel:${(s.phone || "").replace(/\s/g, "")}`;
  document.querySelectorAll("[data-visit-phone], [data-fab-phone]").forEach((a) => a.setAttribute("href", telHref));
  const set = (sel, val) => document.querySelectorAll(sel).forEach((el) => { el.textContent = val; });
  set("[data-meta-phone]", s.phone || "—");
  set("[data-meta-wechat]", s.wechat || "—");
  set("[data-meta-address]", s.address || "—");
  set("[data-meta-hours]", s.hours || "—");
  set("[data-wechat-id], [data-fab-wechat-id]", s.wechat || "—");
  document.querySelectorAll("[data-wechat-qr], [data-fab-wechat-qr]").forEach((img) => {
    if (s.wechat_qr) { img.src = s.wechat_qr; img.hidden = false; } else { img.hidden = true; }
  });
}

function copyText(text, okMsg) {
  const done = () => showToast(okMsg);
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, done) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand("copy");
    ta.remove();
  } catch {}
  done();
}

function copyWechat() {
  const w = state.settings.wechat || "";
  if (!w) return;
  copyText(w, "已复制微信号：" + w);
}

function revealWechatCard() {
  const card = document.querySelector("[data-wechat-card]");
  if (card) {
    card.hidden = false;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function openWechat() {
  revealWechatCard();
  copyWechat();
}

/* 咨询：复制这款/这套的专属链接 → 关闭弹窗 → 跳到微信区 → 提示粘贴发送 */
function buildShareLink(param, id) {
  return `${location.origin}${location.pathname}?${param}=${encodeURIComponent(id)}`;
}
function consult(kind, item) {
  const label = kind === "product" ? "这款" : "这套";
  const name = item.name || item.title || "";
  const link = buildShareLink(kind, item.id);
  copyText(`我想咨询${label}：${name}\n${link}`, `已复制${label}的链接 ✓ 加下方店主微信，粘贴发送即可咨询`);
  document.querySelector(kind === "product" ? "[data-product-dialog]" : "[data-outfit-dialog]")?.close();
  revealWechatCard();
}

/* ---------- 分享 ---------- */
let sharePayload = null;
let qrLibPromise = null;
function loadQRLib() {
  if (window.QRCode) return Promise.resolve();
  if (!qrLibPromise) {
    qrLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return qrLibPromise;
}
async function renderQR(el, url) {
  el.innerHTML = "<span class='qr-loading'>二维码生成中…</span>";
  try {
    await loadQRLib();
    el.innerHTML = "";
    new window.QRCode(el, {
      text: url, width: 168, height: 168,
      colorDark: "#17140d", colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M
    });
  } catch { el.innerHTML = "<span class='qr-loading'>二维码加载失败，可直接复制链接。</span>"; }
}
function openShare(payload) {
  const dialog = document.querySelector("[data-share-dialog]");
  if (!dialog) return;
  sharePayload = { title: payload.title, url: payload.url, text: payload.text || payload.title };
  setText("[data-share-title]", sharePayload.title);
  const nativeBtn = document.querySelector("[data-share-native]");
  if (nativeBtn) nativeBtn.hidden = !navigator.share;
  const qr = document.querySelector("[data-share-qr]");
  if (qr) renderQR(qr, sharePayload.url);
  if (!dialog.open) dialog.showModal();
}

/* ---------- toast ---------- */
let toastTimer = null;
function showToast(msg) {
  const t = document.querySelector("[data-toast]");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove("show"); setTimeout(() => { t.hidden = true; }, 300); }, 2200);
}

/* ---------- 渐显 ---------- */
let revealObserver = null;
function setupReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
}
function revealObserve(nodes) {
  if (!revealObserver) { nodes.forEach((n) => n.classList.add("is-in")); return; }
  nodes.forEach((node, i) => { node.style.transitionDelay = `${Math.min(i, 8) * 55}ms`; revealObserver.observe(node); });
}

/* ---------- 定制光标（放大态爱心） ---------- */
function setupCursor() {
  const cursor = document.querySelector("[data-cursor]");
  const label = document.querySelector("[data-cursor-label]");
  if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  cursor.style.display = "grid";
  let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
  window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; });
  const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  document.addEventListener("pointerover", (e) => {
    const hot = e.target.closest("[data-cursor-hover]");
    if (hot) { cursor.classList.add("is-hover"); if (label) label.textContent = "查看"; }
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest("[data-cursor-hover]") && !e.relatedTarget?.closest?.("[data-cursor-hover]")) cursor.classList.remove("is-hover");
  });
}

/* ---------- Hero 视差 ---------- */
function setupParallax() {
  const media = document.querySelector("[data-parallax] img");
  if (!media || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { media.style.transform = `scale(1.06) translateY(${Math.min(window.scrollY * 0.08, 60)}px)`; ticking = false; });
  }, { passive: true });
}

/* ---------- 分类 ---------- */
function applyFilter(filter) {
  state.filter = filter;
  document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("active", b.dataset.filter === filter));
  renderProducts();
}

/* ---------- 事件 ---------- */
function bindEvents() {
  const header = document.querySelector("[data-header]");
  const onScroll = () => { if (header) header.classList.toggle("is-scrolled", window.scrollY > 40); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const mobileMenu = document.querySelector("[data-mobile-menu]");
  document.querySelector("[data-menu-toggle]")?.addEventListener("click", () => mobileMenu?.classList.toggle("open"));

  const searchPanel = document.querySelector("[data-search-panel]");
  document.querySelectorAll("[data-search-toggle]").forEach((btn) => btn.addEventListener("click", () => {
    const willOpen = !searchPanel?.classList.contains("open");
    searchPanel?.classList.toggle("open", willOpen);
    if (willOpen) searchPanel?.querySelector("input")?.focus();
  }));
  document.querySelector("[data-search-input]")?.addEventListener("input", (e) => { state.query = e.target.value; renderProducts(); });

  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter)));
  document.querySelectorAll("[data-nav-filter]").forEach((link) => link.addEventListener("click", () => {
    applyFilter(link.dataset.navFilter); mobileMenu?.classList.remove("open"); searchPanel?.classList.remove("open");
  }));

  document.querySelector("[data-dialog-close]")?.addEventListener("click", () => document.querySelector("[data-product-dialog]")?.close());
  document.querySelector("[data-product-dialog]")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
  document.querySelector("[data-outfit-close]")?.addEventListener("click", () => document.querySelector("[data-outfit-dialog]")?.close());
  document.querySelector("[data-outfit-dialog]")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  // 心愿单
  document.querySelectorAll("[data-wishlist-open]").forEach((b) => b.addEventListener("click", openWishlist));
  document.querySelector("[data-wishlist-close]")?.addEventListener("click", () => document.querySelector("[data-wishlist-dialog]")?.close());
  document.querySelector("[data-wishlist-dialog]")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  // 分享
  document.querySelector("[data-store-share]")?.addEventListener("click", () => openShare({ title: document.title, url: location.origin + location.pathname }));
  document.querySelector("[data-share-native]")?.addEventListener("click", async () => {
    if (!sharePayload || !navigator.share) return;
    try { await navigator.share(sharePayload); } catch { /* 用户取消，忽略 */ }
  });
  document.querySelector("[data-share-copy]")?.addEventListener("click", () => { if (sharePayload) copyText(sharePayload.url, "已复制链接 ✓ 到微信粘贴发送即可"); });
  document.querySelector("[data-share-close]")?.addEventListener("click", () => document.querySelector("[data-share-dialog]")?.close());
  document.querySelector("[data-share-dialog]")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  // 联系方式
  document.querySelector("[data-visit-wechat]")?.addEventListener("click", openWechat);
  document.querySelectorAll("[data-copy-wechat]").forEach((b) => b.addEventListener("click", copyWechat));
  const fabPop = document.querySelector("[data-fab-pop]");
  document.querySelector("[data-fab-wechat]")?.addEventListener("click", () => { if (fabPop) fabPop.hidden = !fabPop.hidden; });
  document.addEventListener("click", (e) => {
    if (fabPop && !fabPop.hidden && !e.target.closest("[data-fab]")) fabPop.hidden = true;
  });

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- 启动 ---------- */
async function init() {
  setupReveal();
  const [products, outfits, settings] = await Promise.all([loadProducts(), loadOutfits(), loadSettings()]);
  state.products = products;
  state.outfits = outfits;
  state.settings = settings;
  applySettings();
  renderFeature();
  renderProducts();
  renderLookbook();
  bindEvents();
  setupCursor();
  setupParallax();
  handleDeepLink();
}

/* 打开分享链接 ?product=<id> / ?outfit=<id> 时自动弹出对应详情 */
function handleDeepLink() {
  const params = new URLSearchParams(location.search);
  const pid = params.get("product");
  const oid = params.get("outfit");
  if (pid && state.products.some((p) => p.id === pid)) openProduct(pid);
  else if (oid && state.outfits.some((o) => o.id === oid)) openOutfit(oid);
}

init();
