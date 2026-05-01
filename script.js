(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const toastEl = document.querySelector("[data-toast]");
  let toastTimer = null;

  function toast(message) {
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 3200);
  }

  // Sticky header shadow
  const header = document.querySelector("[data-header]");
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // Mobile nav toggle
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  function closeMobileNav() {
    if (!navToggle || !mobileNav) return;
    mobileNav.hidden = true;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-open");
  }

  function openMobileNav() {
    if (!navToggle || !mobileNav) return;
    mobileNav.hidden = false;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("nav-open");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMobileNav();
      else openMobileNav();
    });

    mobileNav.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("a")) closeMobileNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMobileNav();
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (mobileNav.hidden) return;
      if (target.closest("[data-mobile-nav]")) return;
      if (target.closest("[data-nav-toggle]")) return;
      closeMobileNav();
    });
  }

  // Copy-to-clipboard buttons
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy") || "";
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
        toast("Copied to clipboard.");
      } catch {
        const temp = document.createElement("textarea");
        temp.value = value;
        temp.setAttribute("readonly", "true");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
        toast("Copied to clipboard.");
      }
    });
  });

  // Products: JSON-driven listings (products.json)
  const homeProductsGrid = document.querySelector("[data-products-home]");
  const homeProductsStatus = document.querySelector("[data-products-home-status]");
  const productsListGrid = document.querySelector("[data-products-list]");
  const partnershipsListGrid = document.querySelector("[data-partnerships-list]");
  const awardsListGrid = document.querySelector("[data-awards-list]");
  const homeBlogGrid = document.querySelector("[data-blog-home]");
  const homeBlogStatus = document.querySelector("[data-blog-home-status]");
  const blogListGrid = document.querySelector("[data-blog-list]");
  const blogPostRoot = document.querySelector("[data-blog-post]");
  const teamListGrid = document.querySelector("[data-team-list]");

  const PRODUCT_ICONS = {
    forge:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v4H4V4Zm0 6h10v4H4v-4Zm0 6h16v4H4v-4Z"/></svg>',
    pulse:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2-6 4 12 2-6h6v2h-4l-4 10-4-12-2 6H3v-2Z"/></svg>',
    vault:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 0 1 6 6v2h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V8a6 6 0 0 1 6-6Zm4 8V8a4 4 0 0 0-8 0v2h8Z"/></svg>',
    default:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Zm10 7-10 5v8l10-5V9Zm-12 5L2 9v8l8 5v-8Z"/></svg>'
  };

  function normalizeTag(tag) {
    return String(tag || "").trim().toLowerCase();
  }

  function parseISODate(value) {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const raw = String(value).trim();
    if (!raw) return null;

    const dateOnlyMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]) - 1;
      const day = Number(dateOnlyMatch[3]);
      const dateOnly = new Date(year, month, day);
      return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
    }

    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const displayDate = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  function formatDate(date) {
    return date ? displayDate.format(date) : "";
  }

  function formatDateAttr(date) {
    if (!date) return "";
    const year = String(date.getFullYear()).padStart(4, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function daysSince(date, now) {
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
  }

  function isReleased(product, now) {
    if (!product.releasedDate) return true;
    return product.releasedDate.getTime() <= now.getTime();
  }

  function getActivityDate(product) {
    return product.updatedDate || product.releasedDate;
  }

  function getDateLabel(product) {
    if (product.updatedDate && product.releasedDate) {
      if (product.updatedDate.getTime() > product.releasedDate.getTime()) {
        return `Updated ${formatDate(product.updatedDate)}`;
      }
    }

    if (product.updatedDate) return `Updated ${formatDate(product.updatedDate)}`;
    if (product.releasedDate) return `Released ${formatDate(product.releasedDate)}`;
    return "";
  }

  function getStatusLabel(product, now) {
    if (!isReleased(product, now)) return "Coming soon";

    if (product.releasedDate && daysSince(product.releasedDate, now) <= 30) {
      return "New";
    }

    if (
      product.updatedDate &&
      daysSince(product.updatedDate, now) <= 30 &&
      (!product.releasedDate ||
        product.updatedDate.getTime() > product.releasedDate.getTime())
    ) {
      return "Updated";
    }

    return "";
  }

  function normalizeImagePath(value) {
    const path = String(value || "").trim();
    return path ? path : null;
  }

  function normalizeProductImages(raw) {
    const imagesRaw =
      raw?.images && typeof raw.images === "object" ? raw.images : null;

    const icon = normalizeImagePath(imagesRaw?.icon ?? raw?.icon);
    const thumbnail = normalizeImagePath(imagesRaw?.thumbnail ?? raw?.thumbnail);

    const galleryRaw = imagesRaw?.gallery ?? raw?.gallery;
    const gallery = Array.isArray(galleryRaw)
      ? galleryRaw.map(normalizeImagePath).filter(Boolean)
      : [];

    return { icon, thumbnail, gallery };
  }

  function normalizeProduct(raw) {
    const id = String(raw?.id || "").trim();
    const name = String(raw?.name || "").trim();
    const summary = String(raw?.summary || "").trim();

    if (!id || !name || !summary) return null;

    const description = String(raw?.description || summary).trim();
    const features = Array.isArray(raw?.features)
      ? raw.features.map((f) => String(f || "").trim()).filter(Boolean)
      : [];

    const tags = Array.isArray(raw?.tags)
      ? raw.tags.map((t) => String(t || "").trim()).filter(Boolean)
      : [];
    const tagsNormalized = tags.map(normalizeTag).filter(Boolean);

    const releasedDate = parseISODate(raw?.releasedAt);
    const updatedDate = parseISODate(raw?.updatedAt);
    const images = normalizeProductImages(raw);

    return {
      id,
      name,
      summary,
      description,
      features,
      tags,
      tagsNormalized,
      releasedDate,
      updatedDate,
      images
    };
  }

  async function loadProducts() {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load products.json (${response.status})`);
    }

    const data = await response.json();
    const products = Array.isArray(data?.products) ? data.products : [];

    const normalized = products.map(normalizeProduct).filter(Boolean);

    const now = new Date();
    normalized.sort((a, b) => {
      const aReleased = isReleased(a, now);
      const bReleased = isReleased(b, now);
      if (aReleased !== bReleased) return aReleased ? -1 : 1;

      const aTime = getActivityDate(a)?.getTime() || 0;
      const bTime = getActivityDate(b)?.getTime() || 0;
      if (aTime !== bTime) return bTime - aTime;

      return a.name.localeCompare(b.name);
    });

    return normalized;
  }

  let productsPromise = null;
  function getProducts() {
    if (!productsPromise) productsPromise = loadProducts();
    return productsPromise;
  }

  function createProductIcon(product) {
    const icon = document.createElement("div");
    icon.className = "icon";
    icon.setAttribute("aria-hidden", "true");

    if (product.images?.icon) {
      const img = document.createElement("img");
      img.className = "product-icon-img";
      img.src = product.images.icon;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        icon.innerHTML = PRODUCT_ICONS[product.id] || PRODUCT_ICONS.default;
      });
      icon.appendChild(img);
      return icon;
    }

    icon.innerHTML = PRODUCT_ICONS[product.id] || PRODUCT_ICONS.default;
    return icon;
  }

  function createProductThumbnail(product) {
    if (!product.images?.thumbnail) return null;

    const wrap = document.createElement("div");
    wrap.className = "product-thumb";
    wrap.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.className = "product-thumb-img";
    img.src = product.images.thumbnail;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 1200;
    img.height = 675;
    img.addEventListener("error", () => {
      wrap.remove();
    });

    wrap.appendChild(img);
    return wrap;
  }

  function createProductGallery(product) {
    const gallery = product.images?.gallery || [];
    if (!gallery.length) return null;

    const wrap = document.createElement("div");
    wrap.className = "product-gallery";
    wrap.setAttribute("aria-label", `${product.name} gallery`);

    gallery.forEach((src, index) => {
      const link = document.createElement("a");
      link.className = "product-gallery-item";
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener";

      const img = document.createElement("img");
      img.src = src;
      img.alt = `${product.name} gallery image ${index + 1}`;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        link.remove();
        if (!wrap.childNodes.length) wrap.remove();
      });

      link.appendChild(img);
      wrap.appendChild(link);
    });

    return wrap;
  }

  function createMetaRow(product, now) {
    const meta = document.createElement("div");
    meta.className = "meta-row";

    const statusLabel = getStatusLabel(product, now);
    if (statusLabel) {
      const status = document.createElement("span");
      status.className = "tag";
      status.textContent = statusLabel;
      meta.appendChild(status);
    }

    const dateLabel = getDateLabel(product);
    if (dateLabel) {
      const date = document.createElement("span");
      date.textContent = dateLabel;
      meta.appendChild(date);
    }

    return meta.childNodes.length ? meta : null;
  }

  function createTagsRow(tags) {
    const row = document.createElement("div");
    row.className = "tags-row";

    tags.forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "tag";
      pill.textContent = tag;
      row.appendChild(pill);
    });

    return row;
  }

  function createHomeProductCard(product, now) {
    const card = document.createElement("div");
    card.className = "card product-card";

    const thumbnail = createProductThumbnail(product);
    if (thumbnail) card.appendChild(thumbnail);

    card.appendChild(createProductIcon(product));

    const meta = createMetaRow(product, now);
    if (meta) card.appendChild(meta);

    const title = document.createElement("h3");
    title.textContent = product.name;
    card.appendChild(title);

    const body = document.createElement("p");
    body.textContent = product.summary;
    card.appendChild(body);

    const links = document.createElement("div");
    links.className = "inline-links";

    const details = document.createElement("a");
    details.className = "text-link";
    details.href = `products.html#${encodeURIComponent(product.id)}`;
    details.textContent = "Details";
    links.appendChild(details);

    card.appendChild(links);
    return card;
  }

  function createProductsPageCard(product, now) {
    const article = document.createElement("article");
    article.className = "card product-card";
    article.id = product.id;

    const thumbnail = createProductThumbnail(product);
    if (thumbnail) article.appendChild(thumbnail);

    article.appendChild(createProductIcon(product));

    const meta = createMetaRow(product, now);
    if (meta) article.appendChild(meta);

    const title = document.createElement("h3");
    title.textContent = product.name;
    article.appendChild(title);

    const body = document.createElement("p");
    body.textContent = product.description || product.summary;
    article.appendChild(body);

    const gallery = createProductGallery(product);
    if (gallery) article.appendChild(gallery);

    if (product.tags.length) {
      article.appendChild(createTagsRow(product.tags));
    }

    if (product.features.length) {
      const list = document.createElement("ul");
      list.className = "list";
      list.setAttribute("aria-label", `${product.name} features`);

      product.features.forEach((feature) => {
        const li = document.createElement("li");
        li.textContent = feature;
        list.appendChild(li);
      });

      article.appendChild(list);
    }

    const links = document.createElement("div");
    links.className = "inline-links";

    const demo = document.createElement("a");
    demo.className = "btn small secondary";
    demo.href = "index.html#contact";
    demo.textContent = "Demo";
    links.appendChild(demo);

    article.appendChild(links);
    return article;
  }

  function renderMessageCard(container, titleText, bodyText) {
    if (!container) return;
    container.textContent = "";

    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = titleText;
    card.appendChild(title);

    const body = document.createElement("p");
    body.textContent = bodyText;
    card.appendChild(body);

    container.appendChild(card);
  }

  function renderHomeProducts(products) {
    if (!homeProductsGrid) return;
    homeProductsGrid.textContent = "";

    const now = new Date();
    const visible = products.filter((p) => isReleased(p, now)).slice(0, 3);

    if (!visible.length) {
      if (homeProductsStatus) homeProductsStatus.textContent = "No products to show yet.";
      return;
    }

    visible.forEach((product) => {
      homeProductsGrid.appendChild(createHomeProductCard(product, now));
    });

    if (homeProductsStatus) homeProductsStatus.textContent = "";
  }

  function initProductsPage(products) {
    if (!productsListGrid) return;

    const searchInput = document.getElementById("product-search");
    const countEl = document.getElementById("product-count");
    const tagsWrap = document.querySelector("[data-product-tags]");

    let activeTag = "all";
    const now = new Date();
    let didScrollToHash = false;

    const tagLabelByNorm = new Map();
    products.forEach((product) => {
      product.tags.forEach((label) => {
        const norm = normalizeTag(label);
        if (!norm) return;
        if (!tagLabelByNorm.has(norm)) tagLabelByNorm.set(norm, label);
      });
    });

    const uniqueTags = Array.from(tagLabelByNorm.keys()).sort((a, b) =>
      a.localeCompare(b)
    );

    function setActiveTag(tag) {
      activeTag = tag;
      if (!tagsWrap) return;
      tagsWrap.querySelectorAll("[data-product-tag]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-product-tag") === tag);
      });
    }

    function renderTagChips() {
      if (!tagsWrap) return;
      tagsWrap.textContent = "";

      const allBtn = document.createElement("button");
      allBtn.className = "chip is-active";
      allBtn.type = "button";
      allBtn.setAttribute("data-product-tag", "all");
      allBtn.textContent = "All";
      tagsWrap.appendChild(allBtn);

      uniqueTags.forEach((tag) => {
        const btn = document.createElement("button");
        btn.className = "chip";
        btn.type = "button";
        btn.setAttribute("data-product-tag", tag);
        btn.textContent = tagLabelByNorm.get(tag) || tag;
        tagsWrap.appendChild(btn);
      });
    }

    function productHaystack(product) {
      return [product.name, product.summary, product.description, product.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    }

    const productIndex = products.map((p) => ({
      product: p,
      haystack: productHaystack(p),
      tags: p.tagsNormalized
    }));

    function applyFilter() {
      const query = String(searchInput?.value || "")
        .trim()
        .toLowerCase();

      const filtered = productIndex
        .filter(({ haystack, tags, product }) => {
          const matchesQuery = query ? haystack.includes(query) : true;
          const matchesTag = activeTag === "all" ? true : tags.includes(activeTag);
          return matchesQuery && matchesTag;
        })
        .map(({ product }) => product);

      productsListGrid.textContent = "";
      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "card";
        const title = document.createElement("h3");
        title.textContent = "No matching products";
        const body = document.createElement("p");
        body.textContent = "Try a different search or select another tag.";
        empty.appendChild(title);
        empty.appendChild(body);
        productsListGrid.appendChild(empty);
      } else {
        filtered.forEach((product) => {
          productsListGrid.appendChild(createProductsPageCard(product, now));
        });
      }

      if (countEl) {
        countEl.textContent = `Showing ${filtered.length} product${
          filtered.length === 1 ? "" : "s"
        }.`;
      }

      if (!didScrollToHash && location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        const el = document.getElementById(id);
        if (el) {
          didScrollToHash = true;
          el.scrollIntoView({ block: "start" });
        }
      }
    }

    renderTagChips();
    setActiveTag("all");
    applyFilter();

    searchInput?.addEventListener("input", applyFilter);

    tagsWrap?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const btn = target.closest("[data-product-tag]");
      if (!btn) return;
      setActiveTag(btn.getAttribute("data-product-tag") || "all");
      applyFilter();
    });
  }

  if (homeProductsGrid || productsListGrid) {
    if (homeProductsStatus) {
      homeProductsStatus.textContent = "Loading products…";
    }
    if (homeProductsGrid) {
      renderMessageCard(homeProductsGrid, "Loading products…", "Reading products.json.");
    }
    if (productsListGrid) {
      renderMessageCard(productsListGrid, "Loading products…", "Reading products.json.");
      const countEl = document.getElementById("product-count");
      if (countEl) countEl.textContent = "Loading products…";
    }

    getProducts()
      .then((products) => {
        renderHomeProducts(products);
        initProductsPage(products);
      })
      .catch(() => {
        const message =
          "Couldn’t load products.json. Run a local server (e.g., python3 -m http.server 8080).";

        if (homeProductsStatus) homeProductsStatus.textContent = message;
        if (homeProductsGrid) renderMessageCard(homeProductsGrid, "Products unavailable", message);
        if (productsListGrid) renderMessageCard(productsListGrid, "Products unavailable", message);

        const countEl = document.getElementById("product-count");
        if (countEl) countEl.textContent = message;
      });
  }

  // Partnerships: JSON-driven listings (partnerships.json)
  function getPartnershipActivityDate(partnership) {
    return partnership.updatedDate || partnership.partneredDate;
  }

  function getPartnershipDateLabel(partnership) {
    if (partnership.updatedDate && partnership.partneredDate) {
      if (partnership.updatedDate.getTime() > partnership.partneredDate.getTime()) {
        return `Updated ${formatDate(partnership.updatedDate)}`;
      }
    }

    if (partnership.partneredDate) return `Partnered ${formatDate(partnership.partneredDate)}`;
    if (partnership.updatedDate) return `Updated ${formatDate(partnership.updatedDate)}`;
    return "";
  }

  function getPartnershipStatusLabel(partnership, now) {
    if (partnership.partneredDate && partnership.partneredDate.getTime() > now.getTime()) {
      return "Coming soon";
    }

    if (partnership.partneredDate && daysSince(partnership.partneredDate, now) <= 30) {
      return "New";
    }

    if (
      partnership.updatedDate &&
      daysSince(partnership.updatedDate, now) <= 30 &&
      (!partnership.partneredDate ||
        partnership.updatedDate.getTime() > partnership.partneredDate.getTime())
    ) {
      return "Updated";
    }

    return "";
  }

  function normalizePartnership(raw) {
    const id = String(raw?.id || "").trim();
    const name = String(raw?.name || "").trim();
    const summary = String(raw?.summary || "").trim();

    if (!id || !name || !summary) return null;

    const description = String(raw?.description || summary).trim();
    const highlights = Array.isArray(raw?.highlights)
      ? raw.highlights.map((h) => String(h || "").trim()).filter(Boolean)
      : Array.isArray(raw?.features)
        ? raw.features.map((h) => String(h || "").trim()).filter(Boolean)
        : [];

    const tags = Array.isArray(raw?.tags)
      ? raw.tags.map((t) => String(t || "").trim()).filter(Boolean)
      : [];
    const tagsNormalized = tags.map(normalizeTag).filter(Boolean);

    const partneredDate = parseISODate(raw?.partneredAt ?? raw?.startedAt);
    const updatedDate = parseISODate(raw?.updatedAt);
    const images = normalizeProductImages(raw);

    return {
      id,
      name,
      summary,
      description,
      highlights,
      tags,
      tagsNormalized,
      partneredDate,
      updatedDate,
      images
    };
  }

  async function loadPartnerships() {
    const response = await fetch("partnerships.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load partnerships.json (${response.status})`);
    }

    const data = await response.json();
    const partnerships = Array.isArray(data?.partnerships) ? data.partnerships : [];
    const normalized = partnerships.map(normalizePartnership).filter(Boolean);

    normalized.sort((a, b) => {
      const aTime = getPartnershipActivityDate(a)?.getTime() || 0;
      const bTime = getPartnershipActivityDate(b)?.getTime() || 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.name.localeCompare(b.name);
    });

    return normalized;
  }

  let partnershipsPromise = null;
  function getPartnerships() {
    if (!partnershipsPromise) partnershipsPromise = loadPartnerships();
    return partnershipsPromise;
  }

  function createPartnershipMetaRow(partnership, now) {
    const meta = document.createElement("div");
    meta.className = "meta-row";

    const statusLabel = getPartnershipStatusLabel(partnership, now);
    if (statusLabel) {
      const status = document.createElement("span");
      status.className = "tag";
      status.textContent = statusLabel;
      meta.appendChild(status);
    }

    const dateLabel = getPartnershipDateLabel(partnership);
    if (dateLabel) {
      const date = document.createElement("span");
      date.textContent = dateLabel;
      meta.appendChild(date);
    }

    return meta.childNodes.length ? meta : null;
  }

  function createPartnershipPageCard(partnership, now) {
    const article = document.createElement("article");
    article.className = "card product-card partnership-card";
    article.id = partnership.id;

    const thumbnail = createProductThumbnail(partnership);
    if (thumbnail) article.appendChild(thumbnail);

    article.appendChild(createProductIcon(partnership));

    const meta = createPartnershipMetaRow(partnership, now);
    if (meta) article.appendChild(meta);

    const title = document.createElement("h3");
    title.textContent = partnership.name;
    article.appendChild(title);

    const body = document.createElement("p");
    body.textContent = partnership.description || partnership.summary;
    article.appendChild(body);

    const gallery = createProductGallery(partnership);
    if (gallery) article.appendChild(gallery);

    if (partnership.tags.length) {
      article.appendChild(createTagsRow(partnership.tags));
    }

    if (partnership.highlights.length) {
      const list = document.createElement("ul");
      list.className = "list";
      list.setAttribute("aria-label", `${partnership.name} highlights`);

      partnership.highlights.forEach((highlight) => {
        const li = document.createElement("li");
        li.textContent = highlight;
        list.appendChild(li);
      });

      article.appendChild(list);
    }

    const links = document.createElement("div");
    links.className = "inline-links";

    const contact = document.createElement("a");
    contact.className = "btn small secondary";
    contact.href = "index.html#contact";
    contact.textContent = "Contact";
    links.appendChild(contact);

    article.appendChild(links);
    return article;
  }

  function initPartnershipsPage(partnerships) {
    if (!partnershipsListGrid) return;

    const searchInput = document.getElementById("partnership-search");
    const countEl = document.getElementById("partnership-count");
    const tagsWrap = document.querySelector("[data-partnership-tags]");

    let activeTag = "all";
    const now = new Date();
    let didScrollToHash = false;

    const tagLabelByNorm = new Map();
    partnerships.forEach((partnership) => {
      partnership.tags.forEach((label) => {
        const norm = normalizeTag(label);
        if (!norm) return;
        if (!tagLabelByNorm.has(norm)) tagLabelByNorm.set(norm, label);
      });
    });

    const uniqueTags = Array.from(tagLabelByNorm.keys()).sort((a, b) =>
      a.localeCompare(b)
    );

    function setActiveTag(tag) {
      activeTag = tag;
      if (!tagsWrap) return;
      tagsWrap.querySelectorAll("[data-partnership-tag]").forEach((btn) => {
        btn.classList.toggle(
          "is-active",
          btn.getAttribute("data-partnership-tag") === tag
        );
      });
    }

    function renderTagChips() {
      if (!tagsWrap) return;
      tagsWrap.textContent = "";

      const allBtn = document.createElement("button");
      allBtn.className = "chip is-active";
      allBtn.type = "button";
      allBtn.setAttribute("data-partnership-tag", "all");
      allBtn.textContent = "All";
      tagsWrap.appendChild(allBtn);

      uniqueTags.forEach((tag) => {
        const btn = document.createElement("button");
        btn.className = "chip";
        btn.type = "button";
        btn.setAttribute("data-partnership-tag", tag);
        btn.textContent = tagLabelByNorm.get(tag) || tag;
        tagsWrap.appendChild(btn);
      });
    }

    function partnershipHaystack(partnership) {
      return [
        partnership.name,
        partnership.summary,
        partnership.description,
        partnership.highlights.join(" "),
        partnership.tags.join(" ")
      ]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    }

    const partnershipIndex = partnerships.map((p) => ({
      partnership: p,
      haystack: partnershipHaystack(p),
      tags: p.tagsNormalized
    }));

    function applyFilter() {
      const query = String(searchInput?.value || "")
        .trim()
        .toLowerCase();

      const filtered = partnershipIndex
        .filter(({ haystack, tags }) => {
          const matchesQuery = query ? haystack.includes(query) : true;
          const matchesTag = activeTag === "all" ? true : tags.includes(activeTag);
          return matchesQuery && matchesTag;
        })
        .map(({ partnership }) => partnership);

      partnershipsListGrid.textContent = "";
      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "card";
        const title = document.createElement("h3");
        title.textContent = "No matching partnerships";
        const body = document.createElement("p");
        body.textContent = "Try a different search or select another tag.";
        empty.appendChild(title);
        empty.appendChild(body);
        partnershipsListGrid.appendChild(empty);
      } else {
        filtered.forEach((partnership) => {
          partnershipsListGrid.appendChild(createPartnershipPageCard(partnership, now));
        });
      }

      if (countEl) {
        countEl.textContent = `Showing ${filtered.length} partnership${
          filtered.length === 1 ? "" : "s"
        }.`;
      }

      if (!didScrollToHash && location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        const el = document.getElementById(id);
        if (el) {
          didScrollToHash = true;
          el.scrollIntoView({ block: "start" });
        }
      }
    }

    renderTagChips();
    setActiveTag("all");
    applyFilter();

    searchInput?.addEventListener("input", applyFilter);

    tagsWrap?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const btn = target.closest("[data-partnership-tag]");
      if (!btn) return;
      setActiveTag(btn.getAttribute("data-partnership-tag") || "all");
      applyFilter();
    });
  }

  if (partnershipsListGrid) {
    renderMessageCard(partnershipsListGrid, "Loading partnerships…", "Reading partnerships.json.");
    const countEl = document.getElementById("partnership-count");
    if (countEl) countEl.textContent = "Loading partnerships…";

    getPartnerships()
      .then((partnerships) => {
        initPartnershipsPage(partnerships);
      })
      .catch(() => {
        const message =
          "Couldn’t load partnerships.json. Run a local server (e.g., python3 -m http.server 8080).";
        renderMessageCard(partnershipsListGrid, "Partnerships unavailable", message);
        const countEl = document.getElementById("partnership-count");
        if (countEl) countEl.textContent = message;
      });
  }

  // Awards: JSON-driven gallery (awards.json)
  function normalizeAward(raw) {
    const name = String(raw?.name || raw?.award || raw?.title || "").trim();
    const competition = String(raw?.competition || raw?.competitionName || raw?.event || "").trim();
    const issuedDate = parseISODate(raw?.issuedAt ?? raw?.issueDate ?? raw?.date ?? raw?.awardedAt);
    const url = String(raw?.url || raw?.href || raw?.link || "").trim();

    const images = normalizeProductImages(raw);
    const image = normalizeImagePath(
      raw?.image ?? raw?.thumbnail ?? images.thumbnail ?? images.icon ?? images.gallery?.[0]
    );

    if (!name || !competition || !issuedDate || !url || !image) return null;

    const idRaw = String(raw?.id || "").trim();
    const id = idRaw
      ? idRaw
      : [name, competition, formatDateAttr(issuedDate)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 64);

    return {
      id,
      name,
      competition,
      issuedDate,
      url,
      image
    };
  }

  async function loadAwards() {
    const response = await fetch("awards.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load awards.json (${response.status})`);
    }

    const data = await response.json();
    const awards = Array.isArray(data?.awards) ? data.awards : [];
    const normalized = awards.map(normalizeAward).filter(Boolean);

    normalized.sort((a, b) => {
      const aTime = a.issuedDate?.getTime() || 0;
      const bTime = b.issuedDate?.getTime() || 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.name.localeCompare(b.name);
    });

    return normalized;
  }

  let awardsPromise = null;
  function getAwards() {
    if (!awardsPromise) awardsPromise = loadAwards();
    return awardsPromise;
  }

  function createAwardCard(award) {
    const link = document.createElement("a");
    link.className = "award-card";
    link.href = award.url;
    link.setAttribute(
      "aria-label",
      `${award.name} — ${award.competition} — ${formatDate(award.issuedDate)}`
    );
    if (award.id) link.id = award.id;

    const img = document.createElement("img");
    img.className = "award-img";
    img.src = award.image;
    img.alt = award.name;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      link.remove();
    });

    link.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "award-meta";

    const awardName = document.createElement("div");
    awardName.className = "award-name";
    awardName.textContent = award.name;
    meta.appendChild(awardName);

    const competition = document.createElement("div");
    competition.className = "award-competition";
    competition.textContent = award.competition;
    meta.appendChild(competition);

    const date = document.createElement("time");
    date.className = "award-date";
    date.dateTime = formatDateAttr(award.issuedDate);
    date.textContent = formatDate(award.issuedDate);
    meta.appendChild(date);

    link.appendChild(meta);
    return link;
  }

  function initAwardsPage(awards) {
    if (!awardsListGrid) return;

    awardsListGrid.textContent = "";

    if (!awards.length) {
      renderMessageCard(awardsListGrid, "No awards yet", "Check back soon for updates.");
      return;
    }

    awards.forEach((award) => {
      awardsListGrid.appendChild(createAwardCard(award));
    });
  }

  if (awardsListGrid) {
    renderMessageCard(awardsListGrid, "Loading awards…", "Reading awards.json.");

    getAwards()
      .then((awards) => {
        initAwardsPage(awards);
      })
      .catch(() => {
        const message =
          "Couldn’t load awards.json. Run a local server (e.g., python3 -m http.server 8080).";
        renderMessageCard(awardsListGrid, "Awards unavailable", message);
      });
  }

  // Team: JSON-driven members (team.json)
  function normalizeTeam(raw) {
    const id = String(raw?.id || "").trim();
    const name = String(raw?.name || "").trim();
    const role = String(raw?.role || "").trim();
    const summary = String(raw?.summary || "").trim();
    const email = String(raw?.email || "").trim();
    const focusAreas = Array.isArray(raw?.focusAreas)
      ? raw.focusAreas.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    if (!id || !name || !role) return null;

    const tags = Array.isArray(raw?.tags)
      ? raw.tags.map((t) => String(t || "").trim()).filter(Boolean)
      : [];
    const tagsNormalized = tags.map(normalizeTag).filter(Boolean);
    const images = normalizeProductImages(raw);

    return {
      id,
      name,
      role,
      summary,
      email,
      focusAreas,
      tags,
      tagsNormalized,
      images
    };
  }

  async function loadTeam() {
    const response = await fetch("team.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load team.json (${response.status})`);
    }

    const data = await response.json();
    const members = Array.isArray(data?.team) ? data.team : [];
    const normalized = members.map(normalizeTeam).filter(Boolean);

    normalized.sort((a, b) => a.name.localeCompare(b.name));
    return normalized;
  }

  let teamPromise = null;
  function getTeam() {
    if (!teamPromise) teamPromise = loadTeam();
    return teamPromise;
  }

  function createTeamCard(member) {
    const article = document.createElement("article");
    article.className = "card team-card";
    article.id = member.id;

    const pill = document.createElement("div");
    pill.className = "pill";
    pill.setAttribute("aria-label", `Team member ${member.name}`);

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.setAttribute("aria-hidden", "true");
    pill.appendChild(dot);

    const initials = member.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join("");

    const label = document.createElement("span");
    label.textContent = initials || member.name;
    pill.appendChild(label);

    article.appendChild(pill);

    const title = document.createElement("h3");
    title.textContent = member.name;
    article.appendChild(title);

    const role = document.createElement("p");
    role.className = "muted";
    role.textContent = member.role;
    article.appendChild(role);

    if (member.summary) {
      const summary = document.createElement("p");
      summary.textContent = member.summary;
      article.appendChild(summary);
    }

    if (member.focusAreas.length) {
      const list = document.createElement("ul");
      list.className = "list";
      list.setAttribute("aria-label", `${member.name} focus areas`);

      member.focusAreas.forEach((focus) => {
        const li = document.createElement("li");
        li.textContent = focus;
        list.appendChild(li);
      });

      article.appendChild(list);
    }

    if (member.tags.length) {
      article.appendChild(createTagsRow(member.tags));
    }

    if (member.email) {
      const button = document.createElement("button");
      button.className = "btn small secondary";
      button.type = "button";
      button.setAttribute("data-copy", member.email);
      button.textContent = "Copy email";
      article.appendChild(button);
    }

    return article;
  }

  function initTeamPage(members) {
    if (!teamListGrid) return;

    teamListGrid.textContent = "";

    if (!members.length) {
      renderMessageCard(teamListGrid, "No team members", "No team profiles are available right now.");
      return;
    }

    members.forEach((member) => {
      teamListGrid.appendChild(createTeamCard(member));
    });
  }

  if (teamListGrid) {
    renderMessageCard(teamListGrid, "Loading team…", "Reading team.json.");

    getTeam()
      .then((members) => {
        initTeamPage(members);
      })
      .catch(() => {
        const message =
          "Couldn’t load team.json. Run a local server (e.g., python3 -m http.server 8080).";
        renderMessageCard(teamListGrid, "Team unavailable", message);
      });
  }

  // Blog: JSON-driven posts (blog.json)
  function normalizeBlogContent(value) {
    const sections = [];
    const textParts = [];

    function addSection(heading, paragraphs, items) {
      const section = {
        heading: String(heading || "").trim(),
        paragraphs: [],
        list: []
      };

      if (Array.isArray(paragraphs)) {
        paragraphs.forEach((paragraph) => {
          const text = String(paragraph || "").trim();
          if (text) section.paragraphs.push(text);
        });
      }

      if (Array.isArray(items)) {
        items.forEach((item) => {
          const text = String(item || "").trim();
          if (text) section.list.push(text);
        });
      }

      if (section.heading || section.paragraphs.length || section.list.length) {
        sections.push(section);
      }
    }

    if (typeof value === "string") {
      const text = value.trim();
      if (text) {
        addSection("", [text]);
        textParts.push(text);
      }
      return { sections, text: text };
    }

    if (Array.isArray(value)) {
      value.forEach((block) => {
        if (typeof block === "string") {
          const text = block.trim();
          if (text) {
            addSection("", [text]);
            textParts.push(text);
          }
          return;
        }

        if (!block || typeof block !== "object") return;

        const type = String(block.type || "").trim().toLowerCase();
        const heading = String(block.heading || block.title || "").trim();
        const paragraphs = Array.isArray(block.paragraphs)
          ? block.paragraphs
          : block.text
          ? [block.text]
          : [];
        const items = Array.isArray(block.items)
          ? block.items
          : Array.isArray(block.list)
          ? block.list
          : [];

        if (type === "section" || heading) {
          addSection(heading, paragraphs, items);
          if (heading) textParts.push(heading);
          paragraphs.forEach((paragraph) => {
            const text = String(paragraph || "").trim();
            if (text) textParts.push(text);
          });
          items.forEach((item) => {
            const text = String(item || "").trim();
            if (text) textParts.push(text);
          });
          return;
        }

        if (type === "p") {
          const text = String(block.text || "").trim();
          if (text) {
            addSection("", [text]);
            textParts.push(text);
          }
          return;
        }

        if (type === "ul") {
          addSection("", [], items);
          items.forEach((item) => {
            const text = String(item || "").trim();
            if (text) textParts.push(text);
          });
          return;
        }
      });

      return { sections, text: textParts.join(" ").trim() };
    }

    return { sections, text: "" };
  }

  function normalizeBlogPost(raw) {
    const id = String(raw?.id || "").trim();
    const title = String(raw?.title || "").trim();
    const summary = String(raw?.summary || "").trim();

    if (!id || !title) return null;

    const content = normalizeBlogContent(raw?.content);

    const tags = Array.isArray(raw?.tags)
      ? raw.tags.map((t) => String(t || "").trim()).filter(Boolean)
      : [];
    const tagsNormalized = tags.map(normalizeTag).filter(Boolean);

    const writtenDate = parseISODate(raw?.writtenAt ?? raw?.publishedAt);
    const updatedDate = parseISODate(raw?.updatedAt);
    const images = normalizeProductImages(raw);
    const citations = Array.isArray(raw?.citations)
      ? raw.citations.map((item) => item)
      : [];

    const minutesRaw = raw?.readMinutes;
    const readMinutes = Number.isFinite(Number(minutesRaw))
      ? Math.max(1, Math.round(Number(minutesRaw)))
      : null;

    return {
      id,
      title,
      summary,
      content,
      tags,
      tagsNormalized,
      writtenDate,
      updatedDate,
      images,
      citations,
      readMinutes
    };
  }

  function getBlogActivityDate(post) {
    return post.updatedDate || post.writtenDate;
  }

  async function loadBlogPosts() {
    const response = await fetch("blog.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load blog.json (${response.status})`);
    }

    const data = await response.json();
    const posts = Array.isArray(data?.posts) ? data.posts : [];
    const normalized = posts.map(normalizeBlogPost).filter(Boolean);

    normalized.sort((a, b) => {
      const aTime = getBlogActivityDate(a)?.getTime() || 0;
      const bTime = getBlogActivityDate(b)?.getTime() || 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.title.localeCompare(b.title);
    });

    return normalized;
  }

  let blogPostsPromise = null;
  function getBlogPosts() {
    if (!blogPostsPromise) blogPostsPromise = loadBlogPosts();
    return blogPostsPromise;
  }

  function getBlogPostHref(post) {
    return `post.html?id=${encodeURIComponent(post.id)}`;
  }

  function createBlogThumbnail(post, href) {
    if (!post.images?.thumbnail) return null;

    const wrap = document.createElement(href ? "a" : "div");
    wrap.className = "post-thumb";
    if (href) {
      wrap.classList.add("post-thumb-link");
      wrap.href = href;
      wrap.setAttribute("aria-label", `Read ${post.title}`);
    }

    const img = document.createElement("img");
    img.className = "post-thumb-img";
    img.src = post.images.thumbnail;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 1200;
    img.height = 675;
    img.addEventListener("error", () => {
      wrap.remove();
    });

    wrap.appendChild(img);
    return wrap;
  }

  function createBlogContent(post) {
    const sections = Array.isArray(post.content?.sections) ? post.content.sections : [];
    if (!sections.length) return null;

    const prose = document.createElement("div");
    prose.className = "prose post-prose";

    sections.forEach((section) => {
      if (section.heading) {
        const heading = document.createElement("h2");
        heading.textContent = section.heading;
        prose.appendChild(heading);
      }

      (section.paragraphs || []).forEach((paragraph) => {
        if (!paragraph) return;
        const p = document.createElement("p");
        p.textContent = paragraph;
        prose.appendChild(p);
      });

      if (Array.isArray(section.list) && section.list.length) {
        const list = document.createElement("ul");
        section.list.forEach((item) => {
          if (!item) return;
          const li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });
        prose.appendChild(list);
      }
    });

    return prose;
  }

  function createBlogHeaderMeta(post) {
    const meta = document.createElement("div");
    meta.className = "post-meta post-meta-top";

    if (post.writtenDate) {
      const written = document.createElement("span");
      written.textContent = `Written ${formatDate(post.writtenDate)}`;
      meta.appendChild(written);
    }

    if (post.readMinutes) {
      const minutes = document.createElement("span");
      minutes.textContent = `${post.readMinutes} min read`;
      meta.appendChild(minutes);
    }

    return meta.childNodes.length ? meta : null;
  }

  function createBlogCitations(post) {
    const citations = Array.isArray(post.citations) ? post.citations : [];
    if (!citations.length) return null;

    const section = document.createElement("section");
    section.className = "post-citations prose";

    const heading = document.createElement("h2");
    heading.textContent = "Citations";
    section.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "list";

    citations.forEach((citation) => {
      let url = "";
      let label = "";

      if (typeof citation === "string") {
        url = citation.trim();
        label = url;
      } else if (citation && typeof citation === "object") {
        url = String(citation.url || citation.href || "").trim();
        label = String(citation.label || citation.title || url).trim();
      }

      if (!url) return;

      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = label || url;
      item.appendChild(link);
      list.appendChild(item);
    });

    if (!list.childNodes.length) return null;
    section.appendChild(list);
    return section;
  }

  function createBlogFooter(post) {
    const footer = document.createElement("div");
    footer.className = "post-footer";

    const meta = document.createElement("div");
    meta.className = "post-meta post-meta-bottom";

    if (
      post.updatedDate &&
      (!post.writtenDate || post.updatedDate.getTime() > post.writtenDate.getTime())
    ) {
      const updated = document.createElement("span");
      updated.textContent = `Updated ${formatDate(post.updatedDate)}`;
      meta.appendChild(updated);
    }

    if (!meta.childNodes.length) return null;

    footer.appendChild(meta);
    return footer;
  }

  function createHomeBlogPostCard(post) {
    const href = getBlogPostHref(post);

    const article = document.createElement("article");
    article.className = "card post-card";
    article.id = post.id;

    const meta = document.createElement("div");
    meta.className = "post-meta";

    const primaryTag = post.tags[0];
    if (primaryTag) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = primaryTag;
      meta.appendChild(tag);
    }

    const date = post.writtenDate || post.updatedDate;
    if (date) {
      const time = document.createElement("time");
      time.dateTime = formatDateAttr(date);
      time.textContent = formatDate(date);
      meta.appendChild(time);
    }

    if (post.readMinutes) {
      const minutes = document.createElement("span");
      minutes.textContent = `${post.readMinutes} min`;
      meta.appendChild(minutes);
    }

    if (meta.childNodes.length) {
      article.appendChild(meta);
    }

    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.className = "post-title-link";
    titleLink.href = href;
    titleLink.textContent = post.title;
    title.appendChild(titleLink);
    article.appendChild(title);

    const summaryText = String(post.summary || "").trim();
    if (summaryText) {
      const summary = document.createElement("p");
      summary.className = "post-summary";
      summary.textContent = summaryText;
      article.appendChild(summary);
    }

    const links = document.createElement("div");
    links.className = "inline-links";

    const read = document.createElement("a");
    read.className = "text-link";
    read.href = href;
    read.textContent = "Read";
    links.appendChild(read);

    article.appendChild(links);
    return article;
  }

  function createBlogPostCard(post) {
    const href = getBlogPostHref(post);

    const article = document.createElement("article");
    article.className = "card post-card post-entry";
    article.id = post.id;

    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.className = "post-title-link";
    titleLink.href = href;
    titleLink.textContent = post.title;
    title.appendChild(titleLink);
    article.appendChild(title);

    const thumbnail = createBlogThumbnail(post, href);
    if (thumbnail) article.appendChild(thumbnail);

    if (post.summary) {
      const summary = document.createElement("p");
      summary.className = "post-summary";
      summary.textContent = post.summary;
      article.appendChild(summary);
    }

    if (post.tags.length) {
      article.appendChild(createTagsRow(post.tags));
    }

    const links = document.createElement("div");
    links.className = "inline-links";

    const read = document.createElement("a");
    read.className = "text-link";
    read.href = href;
    read.textContent = "Read full post";
    links.appendChild(read);

    article.appendChild(links);

    const footer = createBlogFooter(post);
    if (footer) article.appendChild(footer);
    return article;
  }

  function renderHomeBlogPosts(posts) {
    if (!homeBlogGrid) return;
    homeBlogGrid.textContent = "";

    const visible = Array.isArray(posts) ? posts.slice(0, 3) : [];

    if (!visible.length) {
      const message = "No posts to show yet.";
      if (homeBlogStatus) homeBlogStatus.textContent = message;
      renderMessageCard(homeBlogGrid, "No posts yet", "Check back soon.");
      return;
    }

    visible.forEach((post) => {
      homeBlogGrid.appendChild(createHomeBlogPostCard(post));
    });

    if (homeBlogStatus) homeBlogStatus.textContent = "";
  }

  function initBlogPage(posts) {
    if (!blogListGrid) return;

    const searchInput = document.getElementById("blog-search");
    const countEl = document.getElementById("blog-count");
    const tagsWrap = document.querySelector("[data-blog-tags]");

    let activeTag = "all";
    let didScrollToHash = false;

    const tagLabelByNorm = new Map();
    posts.forEach((post) => {
      post.tags.forEach((label) => {
        const norm = normalizeTag(label);
        if (!norm) return;
        if (!tagLabelByNorm.has(norm)) tagLabelByNorm.set(norm, label);
      });
    });

    const uniqueTags = Array.from(tagLabelByNorm.keys()).sort((a, b) =>
      a.localeCompare(b)
    );

    function setActiveTag(tag) {
      activeTag = tag;
      if (!tagsWrap) return;
      tagsWrap.querySelectorAll("[data-blog-tag]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-blog-tag") === tag);
      });
    }

    function renderTagChips() {
      if (!tagsWrap) return;
      tagsWrap.textContent = "";

      const allBtn = document.createElement("button");
      allBtn.className = "chip is-active";
      allBtn.type = "button";
      allBtn.setAttribute("data-blog-tag", "all");
      allBtn.textContent = "All";
      tagsWrap.appendChild(allBtn);

      uniqueTags.forEach((tag) => {
        const btn = document.createElement("button");
        btn.className = "chip";
        btn.type = "button";
        btn.setAttribute("data-blog-tag", tag);
        btn.textContent = tagLabelByNorm.get(tag) || tag;
        tagsWrap.appendChild(btn);
      });
    }

    function blogHaystack(post) {
      return [post.title, post.summary, post.content?.text || "", post.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    }

    const postIndex = posts.map((post) => ({
      post,
      haystack: blogHaystack(post),
      tags: post.tagsNormalized
    }));

    function applyFilter() {
      const query = String(searchInput?.value || "")
        .trim()
        .toLowerCase();

      const filtered = postIndex
        .filter(({ haystack, tags }) => {
          const matchesQuery = query ? haystack.includes(query) : true;
          const matchesTag = activeTag === "all" ? true : tags.includes(activeTag);
          return matchesQuery && matchesTag;
        })
        .map(({ post }) => post);

      blogListGrid.textContent = "";
      if (!filtered.length) {
        renderMessageCard(blogListGrid, "No matching posts", "Try a different search or tag.");
      } else {
        filtered.forEach((post) => {
          blogListGrid.appendChild(createBlogPostCard(post));
        });
      }

      if (countEl) {
        countEl.textContent = `Showing ${filtered.length} post${
          filtered.length === 1 ? "" : "s"
        }.`;
      }

      if (!didScrollToHash && location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        const el = document.getElementById(id);
        if (el) {
          didScrollToHash = true;
          el.scrollIntoView({ block: "start" });
        }
      }
    }

    renderTagChips();
    setActiveTag("all");
    applyFilter();

    searchInput?.addEventListener("input", applyFilter);
    tagsWrap?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const btn = target.closest("[data-blog-tag]");
      if (!btn) return;
      setActiveTag(btn.getAttribute("data-blog-tag") || "all");
      applyFilter();
    });
  }

  function getBlogPostIdFromLocation() {
    const params = new URLSearchParams(location.search);
    const queryId = String(params.get("id") || "").trim();
    if (queryId) return queryId;

    if (location.hash) return decodeURIComponent(location.hash.slice(1)).trim();
    return "";
  }

  function renderBlogPostPage(container, post) {
    if (!container) return;
    container.textContent = "";

    document.title = `${post.title} — MagmaLabs Blog`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && post.summary) descMeta.setAttribute("content", post.summary);

    const article = document.createElement("article");
    article.className = "card post-card post-page";
    article.id = post.id;

    const title = document.createElement("h1");
    title.className = "post-title";
    title.textContent = post.title;
    article.appendChild(title);

    const headerMeta = createBlogHeaderMeta(post);
    if (headerMeta) article.appendChild(headerMeta);

    const thumbnail = createBlogThumbnail(post);
    if (thumbnail) article.appendChild(thumbnail);

    const content = createBlogContent(post);
    if (content) article.appendChild(content);

    const citations = createBlogCitations(post);
    if (citations) article.appendChild(citations);

    const footer = createBlogFooter(post);
    if (footer) article.appendChild(footer);

    container.appendChild(article);
  }

  if (homeBlogGrid) {
    if (homeBlogStatus) homeBlogStatus.textContent = "Loading posts…";
    renderMessageCard(homeBlogGrid, "Loading posts…", "Reading blog.json.");

    getBlogPosts()
      .then((posts) => {
        renderHomeBlogPosts(posts);
      })
      .catch(() => {
        const message =
          "Couldn’t load blog.json. Run a local server (e.g., python3 -m http.server 8080).";

        if (homeBlogStatus) homeBlogStatus.textContent = message;
        renderMessageCard(homeBlogGrid, "Blog unavailable", message);
      });
  }

  if (blogListGrid) {
    renderMessageCard(blogListGrid, "Loading posts…", "Reading blog.json.");
    const countEl = document.getElementById("blog-count");
    if (countEl) countEl.textContent = "Loading posts…";

    getBlogPosts()
      .then((posts) => {
        initBlogPage(posts);
      })
      .catch(() => {
        const message =
          "Couldn’t load blog.json. Run a local server (e.g., python3 -m http.server 8080).";
        renderMessageCard(blogListGrid, "Blog unavailable", message);
        const countEl = document.getElementById("blog-count");
        if (countEl) countEl.textContent = message;
      });
  }

  if (blogPostRoot) {
    renderMessageCard(blogPostRoot, "Loading post…", "Reading blog.json.");

    getBlogPosts()
      .then((posts) => {
        const id = getBlogPostIdFromLocation();
        const post = posts.find((p) => p.id === id);

        if (!post) {
          const bodyText = id
            ? "We couldn’t find that post. Head back to the blog to pick another."
            : "Open a post from the blog to read it here.";
          renderMessageCard(blogPostRoot, "Post not found", bodyText);
          return;
        }

        renderBlogPostPage(blogPostRoot, post);
      })
      .catch(() => {
        const message =
          "Couldn’t load blog.json. Run a local server (e.g., python3 -m http.server 8080).";
        renderMessageCard(blogPostRoot, "Post unavailable", message);
      });
  }

  // Products: FAQ accordion
  document.querySelectorAll("[data-accordion-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const controls = button.getAttribute("aria-controls");
      if (!controls) return;
      const panel = document.getElementById(controls);
      if (!panel) return;

      const accordion = button.closest("[data-accordion]");
      if (accordion) {
        accordion
          .querySelectorAll("[data-accordion-button][aria-expanded=\"true\"]")
          .forEach((openBtn) => {
            if (openBtn === button) return;
            const openControls = openBtn.getAttribute("aria-controls");
            const openPanel = openControls
              ? document.getElementById(openControls)
              : null;
            openBtn.setAttribute("aria-expanded", "false");
            if (openPanel) openPanel.hidden = true;
          });
      }

      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });

  // Contact form (index)
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const emailInput = document.getElementById("contact-email");
    try {
      const saved = localStorage.getItem("ml_contact_email");
      if (saved && emailInput && !emailInput.value) emailInput.value = saved;
    } catch {
      // ignore storage errors
    }

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !message) {
        toast("Please fill out name, email, and message.");
        return;
      }

      try {
        localStorage.setItem("ml_contact_email", email);
      } catch {
        // ignore storage errors
      }

      contactForm.reset();
      toast("Thanks! We’ll get back within 1 business day.");
    });
  }
})();
