(function () {
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

  function updateYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function getCurrentPage() {
    const path = String(window.location.pathname || "");
    const last = path.split("/").filter(Boolean).pop() || "";
    if (!last) return "index.html";
    if (!last.includes(".html")) return "index.html";
    return last;
  }

  function isCurrentLink(link, href, currentPage) {
    if (Array.isArray(link?.currentFor) && link.currentFor.includes(currentPage)) {
      return true;
    }
    const hrefRaw = String(href || "").trim();
    if (!hrefRaw) return false;

    // Avoid marking in-page anchors (e.g. #contact) as the active page.
    if (hrefRaw.includes("#")) {
      const base = hrefRaw.split("#")[0];
      if (!base || base === currentPage) return false;
    }

    const hrefBase = hrefRaw.split("#")[0];
    return hrefBase === currentPage;
  }

  function resolveHref(link, isHomePage) {
    const raw = isHomePage && link?.hrefHome ? link.hrefHome : link?.href;
    return String(raw || "").trim();
  }

  function createNavLink(link, currentPage, isHomePage, { variant }) {
    const href = resolveHref(link, isHomePage);
    const a = document.createElement("a");
    a.href = href || "#";
    a.textContent = String(link?.label || "").trim() || href;

    if (variant === "desktop" && link?.desktopClass) {
      a.className = String(link.desktopClass || "").trim();
    }

    if (variant !== "mobile" && a.className && a.className.includes("btn")) {
      // Keep CTA links out of aria-current highlighting.
    } else if (isCurrentLink(link, href, currentPage)) {
      a.setAttribute("aria-current", "page");
    }

    return a;
  }

  function renderSiteHeader(host, config) {
    if (!host) return;
    host.textContent = "";

    const currentPage = getCurrentPage();
    const isHomePage = currentPage === "index.html";

    const container = document.createElement("div");
    container.className = "container header-inner";
    host.appendChild(container);

    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = String(config?.brand?.href || "index.html");
    brand.setAttribute(
      "aria-label",
      String(config?.brand?.ariaLabel || "Magma Labs home")
    );

    const brandImg = document.createElement("img");
    brandImg.src = String(config?.brand?.logo?.src || "logo.svg");
    brandImg.alt = String(config?.brand?.logo?.alt ?? "Magma Labs logo");
    brandImg.width = Number(config?.brand?.logo?.width || 34);
    brandImg.height = Number(config?.brand?.logo?.height || 34);
    brand.appendChild(brandImg);

    const brandText = document.createElement("span");
    brandText.textContent = String(config?.brand?.text || "Magma Labs");
    brand.appendChild(brandText);
    container.appendChild(brand);

    const nav = document.createElement("nav");
    nav.className = "nav";
    nav.setAttribute("aria-label", "Primary");
    container.appendChild(nav);

    const links = Array.isArray(config?.links) ? config.links : [];
    links.forEach((link) => {
      nav.appendChild(createNavLink(link, currentPage, isHomePage, { variant: "desktop" }));
    });

    const toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("data-nav-toggle", "");
    toggle.setAttribute("aria-label", "Open menu");
    toggle.setAttribute("aria-controls", "mobile-nav");
    toggle.setAttribute("aria-expanded", "false");

    const toggleLines = document.createElement("span");
    toggleLines.className = "nav-toggle-lines";
    toggleLines.setAttribute("aria-hidden", "true");
    toggle.appendChild(toggleLines);
    container.appendChild(toggle);

    const mobileNav = document.createElement("div");
    mobileNav.id = "mobile-nav";
    mobileNav.className = "mobile-nav";
    mobileNav.setAttribute("data-mobile-nav", "");
    mobileNav.hidden = true;

    const mobileInner = document.createElement("div");
    mobileInner.className = "container mobile-nav-inner";
    mobileNav.appendChild(mobileInner);

    links.forEach((link) => {
      mobileInner.appendChild(
        createNavLink(link, currentPage, isHomePage, { variant: "mobile" })
      );
    });

    host.appendChild(mobileNav);
  }

  function renderFineprint(container, template) {
    const raw = String(template || "").trim();
    const fallback = "© {year} Magma Labs. All rights reserved.";
    const text = raw || fallback;
    const parts = text.split("{year}");

    container.textContent = "";
    if (parts.length === 1) {
      container.textContent = text;
      return;
    }

    container.append(parts[0]);
    const year = document.createElement("span");
    year.id = "year";
    year.textContent = String(new Date().getFullYear());
    container.appendChild(year);
    container.append(parts.slice(1).join("{year}"));
  }

  function renderSiteFooter(host, config) {
    if (!host) return;
    host.textContent = "";

    const currentPage = getCurrentPage();
    const isHomePage = currentPage === "index.html";

    const container = document.createElement("div");
    container.className = "container footer-inner";
    host.appendChild(container);

    const top = document.createElement("div");
    top.className = "footer-top";
    container.appendChild(top);

    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = String(config?.brand?.href || "index.html");
    brand.setAttribute(
      "aria-label",
      String(config?.brand?.ariaLabel || "Magma Labs home")
    );

    const brandImg = document.createElement("img");
    brandImg.src = String(config?.brand?.logo?.src || "logo.svg");
    brandImg.alt = String(config?.brand?.logo?.alt ?? "");
    brandImg.width = Number(config?.brand?.logo?.width || 34);
    brandImg.height = Number(config?.brand?.logo?.height || 34);
    brand.appendChild(brandImg);

    const brandText = document.createElement("span");
    brandText.textContent = String(config?.brand?.text || "Magma Labs");
    brand.appendChild(brandText);
    top.appendChild(brand);

    const columns = document.createElement("div");
    columns.className = "footer-columns";
    columns.setAttribute("aria-label", "Footer navigation");
    top.appendChild(columns);

    const cols = Array.isArray(config?.columns) ? config.columns : [];
    cols.forEach((col) => {
      const colEl = document.createElement("div");
      colEl.className = "footer-col";

      const title = document.createElement("div");
      title.className = "footer-col-title";
      title.textContent = String(col?.title || "").trim();
      colEl.appendChild(title);

      const list = document.createElement("div");
      list.className = "footer-col-links";

      const links = Array.isArray(col?.links) ? col.links : [];
      links.forEach((link) => {
        list.appendChild(createNavLink(link, currentPage, isHomePage, { variant: "footer" }));
      });

      colEl.appendChild(list);
      columns.appendChild(colEl);
    });

    const fineprint = document.createElement("div");
    fineprint.className = "fineprint";
    renderFineprint(fineprint, config?.fineprint);
    container.appendChild(fineprint);
  }

  function initHeaderInteractions() {
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
  }

  const chromeHeaderHost = document.querySelector("[data-site-header]");
  const chromeFooterHost = document.querySelector("[data-site-footer]");

  const DEFAULT_CHROME = {
    header: {
      brand: {
        href: "index.html",
        ariaLabel: "Magma Labs home",
        logo: { src: "logo.svg", alt: "Magma Labs logo", width: 34, height: 34 },
        text: "Magma Labs"
      },
      links: [
        { label: "Home", href: "index.html" },
        { label: "Projects", href: "products.html" },
        { label: "Docs", href: "docs.html" },
        { label: "Partnerships", href: "partnerships.html" },
        { label: "Events", href: "events.html" },
        { label: "Awards", href: "awards.html" },
        { label: "Blog", href: "blog.html", currentFor: ["blog.html", "post.html"] },
        { label: "Team", href: "team.html" },
        {
          label: "Contact",
          href: "index.html#contact",
          hrefHome: "#contact",
          desktopClass: "btn small secondary"
        }
      ]
    },
    footer: {
      brand: {
        href: "index.html",
        ariaLabel: "Magma Labs home",
        logo: { src: "logo.svg", alt: "", width: 34, height: 34 },
        text: "Magma Labs"
      },
      columns: [
        {
          title: "Menu",
          links: [
            { label: "Home", href: "index.html" },
            { label: "Team", href: "team.html" },
            { label: "Contact", href: "index.html#contact", hrefHome: "#contact" }
          ]
        },
        {
          title: "Projects",
          links: [
            { label: "Projects", href: "products.html" },
            { label: "Docs", href: "docs.html" },
            { label: "Partnerships", href: "partnerships.html" }
          ]
        },
        {
          title: "Media",
          links: [
            { label: "Events", href: "events.html" },
            { label: "Awards", href: "awards.html" },
            { label: "Blog", href: "blog.html", currentFor: ["blog.html", "post.html"] }
          ]
        }
      ],
      fineprint: "© {year} Magma Labs. All rights reserved."
    }
  };

  async function loadSiteChrome() {
    const response = await fetch("site.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load site.json (${response.status})`);
    }
    return response.json();
  }

  if (chromeHeaderHost || chromeFooterHost) {
    loadSiteChrome()
      .catch(() => DEFAULT_CHROME)
      .then((chrome) => {
        if (chromeHeaderHost) renderSiteHeader(chromeHeaderHost, chrome?.header || DEFAULT_CHROME.header);
        if (chromeFooterHost) renderSiteFooter(chromeFooterHost, chrome?.footer || DEFAULT_CHROME.footer);
        updateYear();
        initHeaderInteractions();
      });
  } else {
    updateYear();
    initHeaderInteractions();
  }

  // Copy-to-clipboard triggers (supports dynamically-added buttons)
  async function copyToClipboard(value) {
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
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const copyEl = target.closest("[data-copy]");
    if (!copyEl) return;
    const value = copyEl.getAttribute("data-copy") || "";
    if (!value) return;
    event.preventDefault();
    copyToClipboard(value);
  });

  // Products: JSON-driven listings (products.json)
  const homeProductsFeatured = document.querySelector("[data-products-home-featured]");
  const homeProductsSecondary = document.querySelector("[data-products-home-secondary]");
  const homeProductsStatus = document.querySelector("[data-products-home-status]");
  const productsListGrid = document.querySelector("[data-products-list]");
  const docsListGrid = document.querySelector("[data-docs-list]");
  const partnershipsListGrid = document.querySelector("[data-partnerships-list]");
  const eventsHomeSection = document.querySelector("[data-events-home-section]");
  const eventsHomeBanner = document.querySelector("[data-events-home-banner]");
  const eventsFeaturedSection = document.querySelector("[data-events-featured]");
  const eventsPageBanner = document.querySelector("[data-events-banner]");
  const eventsUpcomingGrid = document.querySelector("[data-events-upcoming]");
  const eventsPastGrid = document.querySelector("[data-events-past]");
  const awardsListGrid = document.querySelector("[data-awards-list]");
  const awardsHomeCarousel = document.querySelector("[data-awards-home-carousel]");
  const awardsHomeStatus = document.querySelector("[data-awards-home-status]");
  const homeBlogGrid = document.querySelector("[data-blog-home]");
  const homeBlogStatus = document.querySelector("[data-blog-home-status]");
  const blogListGrid = document.querySelector("[data-blog-list]");
  const blogPostRoot = document.querySelector("[data-blog-post]");
  const blogBuilderRoot = document.querySelector("[data-blog-builder]");
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

  function isVisibleEntry(raw) {
    const value = raw?.visibility;
    if (value == null) return true;
    if (typeof value === "boolean") return value;

    const normalized = String(value).trim().toLowerCase();
    if (!normalized) return true;

    if (
      normalized === "false" ||
      normalized === "0" ||
      normalized === "hidden" ||
      normalized === "hide" ||
      normalized === "off" ||
      normalized === "private" ||
      normalized === "draft" ||
      normalized === "no"
    ) {
      return false;
    }

    return true;
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

  function normalizeUrl(value) {
    const url = String(value || "").trim();
    return url ? url : null;
  }

  function parseTime(value) {
    const raw = String(value || "").trim();
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] || "0");

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    return { hours, minutes, seconds };
  }

  function combineDateAndTime(dateValue, timeValue) {
    const date = parseISODate(dateValue);
    const time = parseTime(timeValue);
    if (!date || !time) return null;

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.hours,
      time.minutes,
      time.seconds
    );
  }

  function formatCalendarDate(date) {
    const year = String(date.getUTCFullYear()).padStart(4, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  function formatAllDayCalendarDate(date) {
    const year = String(date.getUTCFullYear()).padStart(4, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  function isDateOnlyIso(value) {
    return /^\d{4}-\d{1,2}-\d{1,2}$/.test(String(value || "").trim());
  }

  function buildGoogleCalendarUrl(event) {
    if (!event || !event.startDate || !event.endDate) return null;

    const title = event.name || "";
    const details = event.description || "";
    const location = event.location || "";

    const allDay = event._calendarAllDay === true;
    let start = "";
    let end = "";

    if (allDay) {
      const endExclusive = new Date(event.endDate.getTime());
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      start = formatAllDayCalendarDate(event.startDate);
      end = formatAllDayCalendarDate(endExclusive);
    } else {
      start = formatCalendarDate(event.startDate);
      end = formatCalendarDate(event.endDate);
    }

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      details,
      location,
      dates: `${start}/${end}`
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
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
    const repoUrl = normalizeUrl(raw?.repoUrl || raw?.repo || raw?.repository || raw?.sourceUrl);
    const demoUrl = normalizeUrl(raw?.demoUrl || raw?.demo || raw?.liveUrl);
    const docsUrl = normalizeUrl(raw?.docsUrl || raw?.documentation || raw?.docs || raw?.documentationUrl);

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
      images,
      repoUrl,
      demoUrl,
      docsUrl
    };
  }

  async function loadProducts() {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load products.json (${response.status})`);
    }

    const data = await response.json();
    const products = Array.isArray(data?.products) ? data.products : [];

    const normalized = products.filter(isVisibleEntry).map(normalizeProduct).filter(Boolean);

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

  function normalizeDocProject(raw) {
    const id = String(raw?.id || "").trim();
    const name = String(raw?.name || raw?.title || "").trim();
    const summary = String(raw?.summary || raw?.description || "").trim();
    const href = normalizeUrl(raw?.url || raw?.href || raw?.link || raw?.docsUrl);

    if (!id || !name || !href) return null;

    return { id, name, summary, href };
  }

  function normalizeDocsCategory(raw) {
    const id = String(raw?.id || "").trim();
    const name = String(raw?.name || raw?.title || "").trim();
    if (!id || !name) return null;

    const summary = String(raw?.summary || raw?.description || "").trim();
    const updatedDate = parseISODate(raw?.updatedAt);
    const projectsRaw = Array.isArray(raw?.projects) ? raw.projects : [];
    const projects = projectsRaw.filter(isVisibleEntry).map(normalizeDocProject).filter(Boolean);

    if (!projects.length) return null;

    return { id, name, summary, updatedDate, projects };
  }

  async function loadDocs() {
    const response = await fetch("docs.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load docs.json (${response.status})`);
    }

    const data = await response.json();
    const docs = Array.isArray(data?.docs) ? data.docs : [];
    return docs.filter(isVisibleEntry).map(normalizeDocsCategory).filter(Boolean);
  }

  let docsPromise = null;
  function getDocs() {
    if (!docsPromise) docsPromise = loadDocs();
    return docsPromise;
  }

  function isExternalHref(href) {
    return /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(String(href || "").trim());
  }

  function createDocsCategoryMeta(category) {
    const parts = [
      `${category.projects.length} project${category.projects.length === 1 ? "" : "s"}`
    ];

    if (category.updatedDate) {
      parts.push(`Updated ${formatDate(category.updatedDate)}`);
    }

    return parts.join(" / ");
  }

  function createDocsProjectItem(project) {
    const item = document.createElement("li");

    const link = document.createElement("a");
    link.className = "docs-project-link";
    link.id = project.id;
    link.href = project.href;

    if (isExternalHref(project.href)) {
      link.target = "_blank";
      link.rel = "noopener";
    }

    const name = document.createElement("span");
    name.className = "docs-project-name";
    name.textContent = project.name;
    link.appendChild(name);

    if (project.summary) {
      const summary = document.createElement("span");
      summary.className = "docs-project-summary";
      summary.textContent = project.summary;
      link.appendChild(summary);
    }

    item.appendChild(link);
    return item;
  }

  function createDocsCategoryCard(category) {
    const details = document.createElement("details");
    details.className = "card docs-category";
    details.id = category.id;

    const summary = document.createElement("summary");
    const heading = document.createElement("span");
    heading.className = "docs-category-heading";

    const title = document.createElement("span");
    title.className = "docs-category-title";
    title.textContent = category.name;
    heading.appendChild(title);

    const meta = document.createElement("span");
    meta.className = "docs-category-meta";
    meta.textContent = createDocsCategoryMeta(category);
    heading.appendChild(meta);

    summary.appendChild(heading);
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "docs-category-body";

    if (category.summary) {
      const description = document.createElement("p");
      description.textContent = category.summary;
      body.appendChild(description);
    }

    const list = document.createElement("ul");
    list.className = "docs-project-list";
    list.setAttribute("aria-label", `${category.name} projects`);

    category.projects.forEach((project) => {
      list.appendChild(createDocsProjectItem(project));
    });

    body.appendChild(list);
    details.appendChild(body);
    return details;
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

  function getProductHref(product) {
    return `products.html#${encodeURIComponent(product.id)}`;
  }

  function createProductLinks(product, includeDetails = true) {
    const links = document.createElement("div");
    links.className = "inline-links";
    let hasLink = false;

    if (includeDetails) {
      const details = document.createElement("a");
      details.className = "text-link";
      details.href = getProductHref(product);
      details.textContent = "Details";
      links.appendChild(details);
      hasLink = true;
    }

    const resources = [
      { url: product.repoUrl, text: "Repository" },
      { url: product.demoUrl, text: "Demo" },
      { url: product.docsUrl, text: "Documentation" }
    ];

    resources.forEach((resource) => {
      if (!resource.url) return;
      const button = document.createElement("a");
      button.className = "btn small secondary";
      button.href = resource.url;
      button.target = "_blank";
      button.rel = "noopener";
      button.textContent = resource.text;
      links.appendChild(button);
      hasLink = true;
    });

    return hasLink ? links : null;
  }

  function createProductBannerMedia(product, href) {
    const media = document.createElement("a");
    media.className = "project-banner-media";
    media.href = href;
    media.setAttribute("aria-label", `View ${product.name}`);

    if (!product.images?.thumbnail) {
      const fallback = document.createElement("div");
      fallback.className = "project-banner-fallback";
      fallback.textContent = product.name;
      media.appendChild(fallback);
      return media;
    }

    const img = document.createElement("img");
    img.className = "project-banner-img";
    img.src = product.images.thumbnail;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 1200;
    img.height = 675;
    img.addEventListener("error", () => {
      media.textContent = "";
      const fallback = document.createElement("div");
      fallback.className = "project-banner-fallback";
      fallback.textContent = product.name;
      media.appendChild(fallback);
    });

    media.appendChild(img);
    return media;
  }

  function createHomeProjectBanner(product, now, { featured = false } = {}) {
    const href = getProductHref(product);
    const article = document.createElement("article");
    article.className = featured
      ? "project-banner project-banner--featured"
      : "project-banner project-banner--half";

    article.appendChild(createProductBannerMedia(product, href));

    const body = document.createElement("div");
    body.className = "project-banner-body";

    const meta = createMetaRow(product, now);
    if (meta) body.appendChild(meta);

    const title = document.createElement("h3");
    title.className = "project-banner-title";
    const titleLink = document.createElement("a");
    titleLink.className = "project-banner-title-link";
    titleLink.href = href;
    titleLink.textContent = product.name;
    title.appendChild(titleLink);
    body.appendChild(title);

    const summary = document.createElement("p");
    summary.className = "project-banner-summary";
    summary.textContent = product.summary;
    body.appendChild(summary);

    if (featured && product.features.length) {
      const list = document.createElement("ul");
      list.className = "project-banner-features";
      list.setAttribute("aria-label", `${product.name} features`);

      product.features.slice(0, 3).forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        list.appendChild(item);
      });

      body.appendChild(list);
    } else if (product.tags.length) {
      body.appendChild(createTagsRow(product.tags.slice(0, 4)));
    }

    const links = createProductLinks(product, true);
    if (links) body.appendChild(links);

    article.appendChild(body);
    return article;
  }

  function createEventLinks(event) {
    const links = document.createElement("div");
    links.className = "inline-links";
    let hasLink = false;

    if (event.calendarUrl) {
      const calendar = document.createElement("a");
      calendar.className = "btn small secondary";
      calendar.href = event.calendarUrl;
      calendar.target = "_blank";
      calendar.rel = "noopener";
      calendar.textContent = "Add to calendar";
      links.appendChild(calendar);
      hasLink = true;
    }

    if (event.rsvpUrl) {
      const rsvp = document.createElement("a");
      rsvp.className = "btn small secondary";
      rsvp.href = event.rsvpUrl;
      rsvp.target = "_blank";
      rsvp.rel = "noopener";
      rsvp.textContent = "RSVP";
      links.appendChild(rsvp);
      hasLink = true;
    }

    return hasLink ? links : null;
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

    const links = createProductLinks(product, true);
    if (links) card.appendChild(links);
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

    const links = createProductLinks(product, false);
    if (links) article.appendChild(links);
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
    if (!homeProductsFeatured && !homeProductsSecondary) return;
    if (homeProductsFeatured) homeProductsFeatured.textContent = "";
    if (homeProductsSecondary) homeProductsSecondary.textContent = "";

    const now = new Date();
    const visible = Array.isArray(products)
      ? products
          .slice()
          .sort((a, b) => {
            const aTime = getActivityDate(a)?.getTime() || 0;
            const bTime = getActivityDate(b)?.getTime() || 0;
            if (aTime !== bTime) return bTime - aTime;
            return a.name.localeCompare(b.name);
          })
      : [];

    if (!visible.length) {
      if (homeProductsStatus) homeProductsStatus.textContent = "No products to show yet.";
      renderMessageCard(
        homeProductsFeatured || homeProductsSecondary,
        "No projects yet",
        "Check back soon."
      );
      return;
    }

    const featuredProducts = visible.slice(0, 2);
    const secondaryProducts = visible.slice(2, 6);

    featuredProducts.forEach((product) => {
      homeProductsFeatured?.appendChild(
        createHomeProjectBanner(product, now, { featured: true })
      );
    });

    secondaryProducts.forEach((product) => {
      homeProductsSecondary?.appendChild(
        createHomeProjectBanner(product, now, { featured: false })
      );
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

  if (homeProductsFeatured || homeProductsSecondary || productsListGrid) {
    if (homeProductsStatus) {
      homeProductsStatus.textContent = "Loading products…";
    }
    if (homeProductsFeatured) {
      renderMessageCard(homeProductsFeatured, "Loading products…", "Reading products.json.");
    }
    if (homeProductsSecondary) {
      homeProductsSecondary.textContent = "";
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
        if (homeProductsFeatured) {
          renderMessageCard(homeProductsFeatured, "Products unavailable", message);
        }
        if (homeProductsSecondary) {
          homeProductsSecondary.textContent = "";
        }
        if (productsListGrid) renderMessageCard(productsListGrid, "Products unavailable", message);

        const countEl = document.getElementById("product-count");
        if (countEl) countEl.textContent = message;
      });
  }

  function initDocsPage(categories) {
    if (!docsListGrid) return;

    docsListGrid.textContent = "";

    const countEl = document.getElementById("docs-count");
    if (!categories.length) {
      renderMessageCard(
        docsListGrid,
        "No documentation yet",
        "Add categories and project links in docs.json."
      );
      if (countEl) countEl.textContent = "No documentation links yet.";
      return;
    }

    categories.forEach((category) => {
      docsListGrid.appendChild(createDocsCategoryCard(category));
    });

    const projectCount = categories.reduce(
      (total, category) => total + category.projects.length,
      0
    );

    if (countEl) {
      countEl.textContent = `Showing ${categories.length} categor${
        categories.length === 1 ? "y" : "ies"
      } and ${projectCount} project link${projectCount === 1 ? "" : "s"}.`;
    }

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        const category = target.closest(".docs-category");
        if (category instanceof HTMLDetailsElement) {
          category.open = true;
        }
        target.scrollIntoView({ block: "start" });
      }
    }
  }

  if (docsListGrid) {
    renderMessageCard(docsListGrid, "Loading documentation...", "Reading docs.json.");

    const countEl = document.getElementById("docs-count");
    if (countEl) countEl.textContent = "Loading documentation...";

    getDocs()
      .then((categories) => {
        initDocsPage(categories);
      })
      .catch(() => {
        const message =
          "Could not load docs.json. Run a local server (for example, python3 -m http.server 8080).";

        renderMessageCard(docsListGrid, "Documentation unavailable", message);
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
    const normalized = partnerships.filter(isVisibleEntry).map(normalizePartnership).filter(Boolean);

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

  // Events: JSON-driven listings + featured banner (events.json)
  function normalizeEvent(raw) {
    const id = String(raw?.id || "").trim();
    const name = String(raw?.name || raw?.eventName || raw?.title || "").trim();
    const description = String(raw?.description || raw?.summary || "").trim();
    const location = String(raw?.location || raw?.venue || "").trim();
    const startRaw = raw?.startAt ?? raw?.startDate ?? raw?.startsAt;
    const endRaw = raw?.endAt ?? raw?.endDate ?? raw?.endsAt;
    const startTimeRaw = raw?.startTime ?? raw?.startsAtTime;
    const endTimeRaw = raw?.endTime ?? raw?.endsAtTime;
    const startDate = parseISODate(startRaw);
    const endDate = parseISODate(endRaw) || startDate;
    const hypeDate = parseISODate(raw?.hypeAt ?? raw?.hypeDate ?? raw?.hypeStartsAt);
    const rsvpUrl = normalizeUrl(raw?.rsvpUrl || raw?.rsvp || raw?.url || raw?.href);
    const suppliedCalendarUrl = normalizeUrl(raw?.calendarUrl || raw?.calendar || raw?.calendarLink);

    const tags = Array.isArray(raw?.tags)
      ? raw.tags.map((t) => String(t || "").trim()).filter(Boolean)
      : [];
    const tagsNormalized = tags.map(normalizeTag).filter(Boolean);

    const images = normalizeProductImages(raw);
    const bannerImage = normalizeImagePath(
      raw?.bannerImage ?? raw?.banner ?? raw?.image ?? images.thumbnail ?? images.gallery?.[0]
    );

    if (!id || !name || !description || !location || !startDate || !endDate || !bannerImage) {
      return null;
    }

    const startHasTime = Boolean(String(startTimeRaw || "").trim());
    const endHasTime = Boolean(String(endTimeRaw || "").trim());
    const useTimedEvent = startHasTime && endHasTime;
    const eventStart = useTimedEvent
      ? combineDateAndTime(startRaw, startTimeRaw) || startDate
      : startDate;
    const eventEnd = useTimedEvent
      ? combineDateAndTime(endRaw, endTimeRaw) || endDate
      : endDate;
    const allDayEvent = !useTimedEvent && isDateOnlyIso(startRaw) && isDateOnlyIso(endRaw);
    const calendarUrl =
      suppliedCalendarUrl ||
      buildGoogleCalendarUrl({
        name,
        description,
        location,
        startDate: eventStart,
        endDate: eventEnd,
        _calendarAllDay: allDayEvent
      });

    return {
      id,
      name,
      description,
      location,
      startDate,
      endDate,
      hypeDate,
      rsvpUrl,
      calendarUrl,
      bannerImage,
      tags,
      tagsNormalized
    };
  }

  function formatDateRange(start, end) {
    if (!start && !end) return "";
    if (start && end && start.toDateString() === end.toDateString()) return formatDate(start);
    if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
    return formatDate(start || end);
  }

  function isEventPast(event, now) {
    return event.endDate.getTime() < now.getTime();
  }

  function isEventOngoing(event, now) {
    return event.startDate.getTime() <= now.getTime() && event.endDate.getTime() >= now.getTime();
  }

  function isEventUpcoming(event, now) {
    return !isEventPast(event, now);
  }

  function isEventHypeActive(event, now) {
    if (!event.hypeDate) return false;
    return event.startDate.getTime() > now.getTime() && event.hypeDate.getTime() <= now.getTime();
  }

  async function loadEvents() {
    const response = await fetch("events.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load events.json (${response.status})`);
    }

    const data = await response.json();
    const events = Array.isArray(data?.events) ? data.events : [];
    const normalized = events.filter(isVisibleEntry).map(normalizeEvent).filter(Boolean);

    normalized.sort((a, b) => {
      const aTime = a.startDate?.getTime() || 0;
      const bTime = b.startDate?.getTime() || 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.name.localeCompare(b.name);
    });

    return normalized;
  }

  let eventsPromise = null;
  function getEvents() {
    if (!eventsPromise) eventsPromise = loadEvents();
    return eventsPromise;
  }

  function createEventMetaRow(event, now) {
    const meta = document.createElement("div");
    meta.className = "meta-row";

    const status = document.createElement("span");
    status.className = "tag";
    if (isEventOngoing(event, now)) status.textContent = "In progress";
    else if (isEventPast(event, now)) status.textContent = "Past";
    else status.textContent = "Upcoming";
    meta.appendChild(status);

    const dateLabel = formatDateRange(event.startDate, event.endDate);
    if (dateLabel) {
      const date = document.createElement("span");
      date.textContent = dateLabel;
      meta.appendChild(date);
    }

    if (event.location) {
      const loc = document.createElement("span");
      loc.textContent = event.location;
      meta.appendChild(loc);
    }

    return meta;
  }

  function createEventCard(event, now) {
    const article = document.createElement("article");
    article.className = "card event-card";
    article.id = event.id;

    const thumb = document.createElement("div");
    thumb.className = "event-thumb";
    thumb.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.className = "event-thumb-img";
    img.src = event.bannerImage;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 1200;
    img.height = 675;
    img.addEventListener("error", () => {
      thumb.remove();
    });

    thumb.appendChild(img);
    article.appendChild(thumb);

    article.appendChild(createEventMetaRow(event, now));

    const title = document.createElement("h3");
    title.textContent = event.name;
    article.appendChild(title);

    const body = document.createElement("p");
    body.textContent = event.description;
    article.appendChild(body);

    if (event.tags.length) {
      article.appendChild(createTagsRow(event.tags));
    }

    const links = createEventLinks(event);
    if (links) article.appendChild(links);
    return article;
  }

  function createEventBanner(event) {
    const link = document.createElement("a");
    link.className = "event-banner";
    link.href = event.rsvpUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute(
      "aria-label",
      `${event.name} — ${formatDateRange(event.startDate, event.endDate)} — RSVP`
    );

    const media = document.createElement("div");
    media.className = "event-banner-media";
    media.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.className = "event-banner-img";
    img.src = event.bannerImage;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 1600;
    img.height = 800;
    img.addEventListener("error", () => {
      link.remove();
    });

    media.appendChild(img);
    link.appendChild(media);

    const body = document.createElement("div");
    body.className = "event-banner-body";

    const title = document.createElement("h3");
    title.className = "event-banner-title";
    title.textContent = event.name;
    body.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "event-banner-meta";

    const date = document.createElement("span");
    date.textContent = formatDateRange(event.startDate, event.endDate);
    meta.appendChild(date);

    const loc = document.createElement("span");
    loc.textContent = event.location;
    meta.appendChild(loc);

    body.appendChild(meta);

    const desc = document.createElement("p");
    desc.className = "event-banner-description";
    desc.textContent = event.description;
    body.appendChild(desc);

    if (event.tags.length) {
      const tags = createTagsRow(event.tags);
      tags.classList.add("event-banner-tags");
      body.appendChild(tags);
    }

    const actions = document.createElement("div");
    actions.className = "event-banner-actions";

    const cta = document.createElement("span");
    cta.className = "btn small primary";
    cta.textContent = "RSVP";
    actions.appendChild(cta);

    body.appendChild(actions);

    link.appendChild(body);
    return link;
  }

  function renderFeaturedEvent(event) {
    if (eventsHomeSection && eventsHomeBanner) {
      eventsHomeBanner.textContent = "";
      if (event) {
        eventsHomeSection.hidden = false;
        eventsHomeBanner.appendChild(createEventBanner(event));
      } else {
        eventsHomeSection.hidden = true;
      }
    }

    if (eventsFeaturedSection && eventsPageBanner) {
      eventsPageBanner.textContent = "";
      if (event) {
        eventsFeaturedSection.hidden = false;
        eventsPageBanner.appendChild(createEventBanner(event));
      } else {
        eventsFeaturedSection.hidden = true;
      }
    }
  }

  function initEventsPage(events) {
    const now = new Date();

    const featuredCandidates = events
      .filter((event) => isEventUpcoming(event, now))
      .filter((event) => isEventHypeActive(event, now))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const featured = featuredCandidates.length ? featuredCandidates[0] : null;
    renderFeaturedEvent(featured);

    const withoutFeatured = featured ? events.filter((event) => event.id !== featured.id) : events;

    if (eventsUpcomingGrid) {
      const upcoming = withoutFeatured
        .filter((event) => isEventUpcoming(event, now))
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      eventsUpcomingGrid.textContent = "";
      if (!upcoming.length) {
        renderMessageCard(eventsUpcomingGrid, "No upcoming events", "Check back soon for updates.");
      } else {
        upcoming.forEach((event) => {
          eventsUpcomingGrid.appendChild(createEventCard(event, now));
        });
      }
    }

    if (eventsPastGrid) {
      const past = events
        .filter((event) => isEventPast(event, now))
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

      eventsPastGrid.textContent = "";
      if (!past.length) {
        renderMessageCard(eventsPastGrid, "No past events yet", "Once we host events, they’ll show up here.");
      } else {
        past.forEach((event) => {
          eventsPastGrid.appendChild(createEventCard(event, now));
        });
      }
    }
  }

  if (
    eventsHomeSection ||
    eventsHomeBanner ||
    eventsFeaturedSection ||
    eventsPageBanner ||
    eventsUpcomingGrid ||
    eventsPastGrid
  ) {
    if (eventsUpcomingGrid) {
      renderMessageCard(eventsUpcomingGrid, "Loading events…", "Reading events.json.");
    }
    if (eventsPastGrid) {
      renderMessageCard(eventsPastGrid, "Loading events…", "Reading events.json.");
    }

    getEvents()
      .then((events) => {
        initEventsPage(events);
      })
      .catch(() => {
        const message =
          "Couldn’t load events.json. Run a local server (e.g., python3 -m http.server 8080).";

        if (eventsHomeSection) eventsHomeSection.hidden = true;
        if (eventsFeaturedSection) eventsFeaturedSection.hidden = true;
        if (eventsUpcomingGrid) renderMessageCard(eventsUpcomingGrid, "Events unavailable", message);
        if (eventsPastGrid) renderMessageCard(eventsPastGrid, "Events unavailable", message);
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

  function createAwardCard(award, options = {}) {
    const includeId = options.includeId !== false;
    const link = document.createElement("a");
    link.className = "award-card";
    link.href = award.url;
    link.setAttribute(
      "aria-label",
      `${award.name} — ${award.competition} — ${formatDate(award.issuedDate)}`
    );
    if (includeId && award.id) link.id = award.id;

    const img = document.createElement("img");
    img.className = "award-img";
    img.src = award.image;
    img.alt = award.name;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      link.remove();
    });

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "award-image";
    imageWrapper.appendChild(img);
    link.appendChild(imageWrapper);

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
    attachAwardTilt(imageWrapper);
    return link;
  }

  function attachAwardTilt(card) {
    const maxRotate = 10;
    const scale = 1.01;

    function updateTilt(event) {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = (x / rect.width) * 2 - 1;
      const py = (y / rect.height) * 2 - 1;
      const rotateY = px * maxRotate;
      const rotateX = -py * maxRotate;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    }

    card.addEventListener("mousemove", updateTilt);
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
    card.addEventListener("blur", () => {
      card.style.transform = "";
    });
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

  function initAutoScrollingAwardsCarousel(viewport, track, firstSet) {
    if (!viewport || !track || !firstSet) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let hoverPaused = false;
    let focusPaused = false;
    let touchPaused = false;
    let lastTime = 0;

    function getGap() {
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
      return Number.isFinite(gap) ? gap : 0;
    }

    function getLoopWidth() {
      return firstSet.getBoundingClientRect().width + getGap();
    }

    function isPaused() {
      return hoverPaused || focusPaused || touchPaused || document.hidden;
    }

    function tick(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      const loopWidth = getLoopWidth();
      if (!isPaused() && loopWidth > viewport.clientWidth) {
        const nextScroll = viewport.scrollLeft + delta * 0.04;
        viewport.scrollLeft = nextScroll >= loopWidth ? nextScroll - loopWidth : nextScroll;
      }

      window.requestAnimationFrame(tick);
    }

    viewport.addEventListener("mouseenter", () => {
      hoverPaused = true;
    });
    viewport.addEventListener("mouseleave", () => {
      hoverPaused = false;
      lastTime = 0;
    });
    viewport.addEventListener("focusin", () => {
      focusPaused = true;
    });
    viewport.addEventListener("focusout", (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && viewport.contains(next)) return;
      focusPaused = false;
      lastTime = 0;
    });
    viewport.addEventListener(
      "touchstart",
      () => {
        touchPaused = true;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchend",
      () => {
        touchPaused = false;
        lastTime = 0;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchcancel",
      () => {
        touchPaused = false;
        lastTime = 0;
      },
      { passive: true }
    );

    window.requestAnimationFrame(tick);
  }

  function createHomeAwardsCarousel(awards) {
    const viewport = document.createElement("div");
    viewport.className = "awards-carousel";

    const track = document.createElement("div");
    track.className = "awards-carousel-track";

    const firstSet = document.createElement("div");
    firstSet.className = "awards-carousel-set";
    awards.forEach((award) => {
      firstSet.appendChild(createAwardCard(award, { includeId: false }));
    });
    track.appendChild(firstSet);

    if (awards.length > 1) {
      const duplicateSet = document.createElement("div");
      duplicateSet.className = "awards-carousel-set";
      awards.forEach((award) => {
        duplicateSet.appendChild(createAwardCard(award, { includeId: false }));
      });
      track.appendChild(duplicateSet);
    }

    viewport.appendChild(track);
    if (awards.length > 1) {
      initAutoScrollingAwardsCarousel(viewport, track, firstSet);
    }
    return viewport;
  }

  function initHomeAwardsCarousel(awards) {
    if (!awardsHomeCarousel) return;

    awardsHomeCarousel.textContent = "";

    if (!awards.length) {
      renderMessageCard(awardsHomeCarousel, "No awards yet", "Check back soon for updates.");
      return;
    }

    awardsHomeCarousel.appendChild(createHomeAwardsCarousel(awards));
  }

  if (awardsListGrid || awardsHomeCarousel) {
    if (awardsListGrid) {
      renderMessageCard(awardsListGrid, "Loading awards…", "Reading awards.json.");
    }
    if (awardsHomeCarousel) {
      renderMessageCard(awardsHomeCarousel, "Loading awards…", "Reading awards.json.");
      if (awardsHomeStatus) awardsHomeStatus.textContent = "Loading awards…";
    }

    getAwards()
      .then((awards) => {
        initAwardsPage(awards);
        initHomeAwardsCarousel(awards);
        if (awardsHomeStatus) awardsHomeStatus.textContent = "";
      })
      .catch(() => {
        const message =
          "Couldn’t load awards.json. Run a local server (e.g., python3 -m http.server 8080).";
        if (awardsListGrid) renderMessageCard(awardsListGrid, "Awards unavailable", message);
        if (awardsHomeCarousel) {
          renderMessageCard(awardsHomeCarousel, "Awards unavailable", message);
        }
        if (awardsHomeStatus) awardsHomeStatus.textContent = message;
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
    const photo = normalizeImagePath(
      raw?.photo ??
        raw?.avatar ??
        raw?.image ??
        raw?.images?.avatar ??
        raw?.images?.photo ??
        images.thumbnail
    );

    return {
      id,
      name,
      role,
      summary,
      email,
      focusAreas,
      tags,
      tagsNormalized,
      images,
      photo
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

    const initials = member.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join("");

    const avatar = document.createElement("div");
    avatar.className = "team-avatar";
    avatar.setAttribute("aria-label", `Photo of ${member.name}`);

    if (member.photo) {
      const img = document.createElement("img");
      img.className = "team-avatar-img";
      img.src = member.photo;
      img.alt = `Photo of ${member.name}`;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener(
        "error",
        () => {
          img.remove();
          avatar.textContent = initials || member.name;
          avatar.classList.add("is-fallback");
          avatar.setAttribute("aria-label", `${member.name}`);
        },
        { once: true }
      );

      avatar.appendChild(img);
    } else {
      avatar.textContent = initials || member.name;
      avatar.classList.add("is-fallback");
      avatar.setAttribute("aria-label", `${member.name}`);
    }

    article.appendChild(avatar);

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
  const BLOG_CHART_COLORS = [
    "#2f1254",
    "#4d2386",
    "#6a3db0",
    "#8a65d6",
    "#d97706",
    "#0f766e",
    "#2563eb",
    "#7c3aed"
  ];

  const blogNumberFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1
  });

  function cleanText(value) {
    if (value == null) return "";
    return String(value).trim();
  }

  function normalizeTextList(values) {
    if (!Array.isArray(values)) return [];
    return values.map((value) => cleanText(value)).filter(Boolean);
  }

  function pushBlogTextPart(parts, value) {
    const text = cleanText(value);
    if (text) parts.push(text);
  }

  function normalizeBlogCardType(rawType) {
    const type = cleanText(rawType).toLowerCase();

    switch (type) {
      case "text":
      case "section":
      case "p":
      case "paragraph":
      case "prose":
      case "ul":
      case "list":
        return "text";
      case "image":
      case "images":
      case "gallery":
        return "image";
      case "chart":
      case "charts":
        return "chart";
      case "big-number":
      case "big number":
      case "big_number":
      case "stat":
      case "stats":
        return "big-number";
      case "quote":
      case "quotes":
        return "quote";
      case "comparison":
      case "compare":
      case "side-by-side":
      case "side by side":
      case "side-by-side-comparison":
        return "comparison";
      case "link-embed":
      case "link embed":
      case "embed":
      case "link":
      case "links":
        return "link-embed";
      case "timeline":
        return "timeline";
      case "qa":
      case "q-and-a":
      case "q and a":
      case "q&a":
      case "faq":
        return "qa";
      default:
        return "";
    }
  }

  function normalizeBlogChartType(rawType) {
    const type = cleanText(rawType).toLowerCase();

    switch (type) {
      case "bar":
      case "line":
      case "pie":
      case "scatter":
      case "table":
      case "radar":
        return type;
      default:
        return "";
    }
  }

  function normalizeBlogTextFigure(raw) {
    if (typeof raw === "string") {
      const text = raw.trim();
      return text ? { type: "paragraph", text } : null;
    }

    if (!raw || typeof raw !== "object") return null;

    const figureType = cleanText(raw.type || raw.kind).toLowerCase();
    const text = cleanText(raw.text || raw.paragraph || raw.value);
    const items = normalizeTextList(raw.items || raw.list || raw.points);

    if (figureType === "list" || figureType === "ul" || figureType === "bullets") {
      return items.length ? { type: "list", items } : null;
    }

    if (items.length) return { type: "list", items };
    if (text) return { type: "paragraph", text };
    return null;
  }

  function normalizeBlogImageFigure(raw) {
    if (typeof raw === "string") {
      const src = normalizeImagePath(raw);
      return src ? { src, alt: "", caption: "", title: "" } : null;
    }

    if (!raw || typeof raw !== "object") return null;

    const src = normalizeImagePath(raw.src || raw.image || raw.url || raw.path);
    if (!src) return null;

    return {
      src,
      alt: cleanText(raw.alt),
      caption: cleanText(raw.caption || raw.description),
      title: cleanText(raw.title || raw.label)
    };
  }

  function normalizeBlogChartDatum(raw) {
    if (Array.isArray(raw)) {
      const label = cleanText(raw[0]);
      const value = Number(raw[1]);
      if (!label || !Number.isFinite(value)) return null;
      return { label, value };
    }

    if (!raw || typeof raw !== "object") return null;

    const label = cleanText(raw.label || raw.name || raw.axis || raw.title);
    const value = Number(raw.value);

    if (!label || !Number.isFinite(value)) return null;
    return { label, value };
  }

  function normalizeBlogScatterPoint(raw) {
    if (Array.isArray(raw)) {
      const x = Number(raw[0]);
      const y = Number(raw[1]);
      const label = cleanText(raw[2]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y, label };
    }

    if (!raw || typeof raw !== "object") return null;

    const x = Number(raw.x);
    const y = Number(raw.y);
    const label = cleanText(raw.label || raw.name || raw.title);

    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y, label };
  }

  function normalizeBlogChartRows(rows, columns) {
    if (!Array.isArray(rows)) return [];

    return rows
      .map((row) => {
        if (Array.isArray(row)) return row.map((cell) => cleanText(cell));
        if (!row || typeof row !== "object" || !columns.length) return [];
        return columns.map((column) => cleanText(row[column]));
      })
      .filter((row) => row.length);
  }

  function normalizeBlogChartFigure(raw) {
    if (!raw || typeof raw !== "object") return null;

    const chartType = normalizeBlogChartType(raw.chartType || raw.kind || raw.type);
    if (!chartType) return null;

    const title = cleanText(raw.title || raw.label);
    const description = cleanText(raw.description || raw.caption || raw.summary);
    const unit = cleanText(raw.unit);
    const max = Number(raw.max);

    if (chartType === "table") {
      const columns = normalizeTextList(raw.columns || raw.headers);
      const rows = normalizeBlogChartRows(raw.rows, columns);
      if (!columns.length || !rows.length) return null;
      return { chartType, title, description, columns, rows };
    }

    if (chartType === "scatter") {
      const points = (Array.isArray(raw.points) ? raw.points : Array.isArray(raw.data) ? raw.data : [])
        .map(normalizeBlogScatterPoint)
        .filter(Boolean);
      if (!points.length) return null;
      return {
        chartType,
        title,
        description,
        points,
        xLabel: cleanText(raw.xLabel || raw.xAxis),
        yLabel: cleanText(raw.yLabel || raw.yAxis)
      };
    }

    const data = (Array.isArray(raw.data) ? raw.data : Array.isArray(raw.values) ? raw.values : [])
      .map(normalizeBlogChartDatum)
      .filter(Boolean);

    if (!data.length) return null;

    return {
      chartType,
      title,
      description,
      data,
      unit,
      max: Number.isFinite(max) ? max : null
    };
  }

  function normalizeBlogBigNumberFigure(raw) {
    if (typeof raw === "string") {
      const stat = raw.trim();
      return stat ? { title: "", stat, description: "" } : null;
    }

    if (!raw || typeof raw !== "object") return null;

    const title = cleanText(raw.title || raw.label);
    const stat = cleanText(raw.stat || raw.value);
    const description = cleanText(raw.description || raw.caption);

    if (!title && !stat && !description) return null;
    return { title, stat, description };
  }

  function normalizeBlogQuoteFigure(raw) {
    if (typeof raw === "string") {
      const quote = raw.trim();
      return quote ? { quote, attribution: "", role: "" } : null;
    }

    if (!raw || typeof raw !== "object") return null;

    const quote = cleanText(raw.quote || raw.text || raw.value);
    const attribution = cleanText(raw.attribution || raw.author || raw.source);
    const role = cleanText(raw.role || raw.title);

    if (!quote) return null;
    return { quote, attribution, role };
  }

  function normalizeBlogComparisonFigure(raw) {
    if (!raw || typeof raw !== "object") return null;

    const title = cleanText(raw.title || raw.label || raw.heading);
    const description = cleanText(raw.description || raw.text || raw.summary);
    const items = normalizeTextList(raw.items || raw.list || raw.points);
    const tone = cleanText(raw.tone || raw.accent).toLowerCase();

    if (!title && !description && !items.length) return null;
    return { title, description, items, tone };
  }

  function normalizeBlogLinkFigure(raw) {
    if (typeof raw === "string") {
      const url = normalizeUrl(raw);
      return url ? { url, label: url, description: "", site: "" } : null;
    }

    if (!raw || typeof raw !== "object") return null;

    const url = normalizeUrl(raw.url || raw.href);
    if (!url) return null;

    return {
      url,
      label: cleanText(raw.label || raw.title || url) || url,
      description: cleanText(raw.description || raw.summary),
      site: cleanText(raw.site || raw.domain)
    };
  }

  function normalizeBlogTimelineFigure(raw) {
    if (!raw || typeof raw !== "object") return null;

    const time = cleanText(raw.time || raw.date || raw.when);
    const title = cleanText(raw.title || raw.label);
    const description = cleanText(raw.description || raw.text || raw.summary);

    let image = normalizeBlogImageFigure(raw.image || raw.figure);
    if (!image && (raw.src || raw.imageSrc || raw.path || raw.url)) {
      image = normalizeBlogImageFigure({
        src: raw.src || raw.imageSrc || raw.path || raw.url,
        alt: raw.alt,
        caption: raw.caption,
        title: raw.imageTitle
      });
    }

    if (!time && !title && !description && !image) return null;
    return { time, title, description, image };
  }

  function normalizeBlogQaFigure(raw) {
    if (!raw || typeof raw !== "object") return null;

    const question = cleanText(raw.question || raw.q || raw.title);
    const answer = cleanText(raw.answer || raw.a || raw.text);

    if (!question || !answer) return null;
    return { question, answer };
  }

  function normalizeBlogTextCard(raw) {
    const title = cleanText(raw?.title || raw?.heading);
    const figures = [];

    if (Array.isArray(raw?.figures)) {
      raw.figures.forEach((figure) => {
        const normalized = normalizeBlogTextFigure(figure);
        if (normalized) figures.push(normalized);
      });
    }

    normalizeTextList(raw?.paragraphs).forEach((paragraph) => {
      figures.push({ type: "paragraph", text: paragraph });
    });

    const text = cleanText(raw?.text);
    if (text) figures.push({ type: "paragraph", text });

    const listItems = normalizeTextList(raw?.items || raw?.list);
    if (listItems.length) figures.push({ type: "list", items: listItems });

    if (!figures.length) return null;
    return { type: "text", title, figures };
  }

  function normalizeBlogCard(raw) {
    if (!raw || typeof raw !== "object") return null;

    const type = normalizeBlogCardType(raw.type);
    const title = cleanText(raw.title || raw.heading);
    if (!type) return null;

    if (type === "text") return normalizeBlogTextCard(raw);

    if (type === "image") {
      const sources = Array.isArray(raw.figures)
        ? raw.figures.slice()
        : Array.isArray(raw.images)
        ? raw.images.slice()
        : Array.isArray(raw.gallery)
        ? raw.gallery.slice()
        : [];

      if (!sources.length && (raw.image || raw.src || raw.thumbnail)) {
        sources.push(
          raw.image || {
            src: raw.src || raw.thumbnail,
            alt: raw.alt,
            caption: raw.caption,
            title: raw.label
          }
        );
      }

      const figures = sources.map(normalizeBlogImageFigure).filter(Boolean);
      if (!figures.length) return null;

      const layoutRaw = cleanText(raw.layout || raw.variant).toLowerCase();
      let layout = "single";

      if (
        layoutRaw === "grid" ||
        layoutRaw === "gallery" ||
        layoutRaw === "side-by-side" ||
        layoutRaw === "side by side" ||
        layoutRaw === "multiple"
      ) {
        layout = "grid";
      } else if (layoutRaw === "carousel") {
        layout = "carousel";
      } else if (figures.length > 1) {
        layout = "grid";
      }

      if (figures.length <= 1) layout = "single";
      return { type, title, layout, figures };
    }

    if (type === "chart") {
      const figuresSource = Array.isArray(raw.figures)
        ? raw.figures
        : Array.isArray(raw.charts)
        ? raw.charts
        : [];
      const figures = figuresSource.map(normalizeBlogChartFigure).filter(Boolean);
      if (!figures.length) return null;
      return { type, title, figures };
    }

    if (type === "big-number") {
      const figuresSource = Array.isArray(raw.figures)
        ? raw.figures
        : Array.isArray(raw.stats)
        ? raw.stats
        : Array.isArray(raw.items)
        ? raw.items
        : [];
      const figures = figuresSource.map(normalizeBlogBigNumberFigure).filter(Boolean);
      if (!figures.length) return null;
      return { type, title, figures };
    }

    if (type === "quote") {
      const figuresSource = Array.isArray(raw.figures)
        ? raw.figures
        : Array.isArray(raw.quotes)
        ? raw.quotes
        : raw.quote
        ? [raw]
        : [];
      const figures = figuresSource.map(normalizeBlogQuoteFigure).filter(Boolean);
      if (!figures.length) return null;
      return { type, title, figures };
    }

    if (type === "comparison") {
      const figuresSource = Array.isArray(raw.figures)
        ? raw.figures
        : Array.isArray(raw.columns)
        ? raw.columns
        : [];
      const figures = figuresSource.map(normalizeBlogComparisonFigure).filter(Boolean);
      if (!figures.length) return null;
      return { type, title, figures };
    }

    if (type === "link-embed") {
      const figuresSource = Array.isArray(raw.figures)
        ? raw.figures
        : Array.isArray(raw.links)
        ? raw.links
        : Array.isArray(raw.embeds)
        ? raw.embeds
        : [];
      const figures = figuresSource.map(normalizeBlogLinkFigure).filter(Boolean);
      if (!figures.length) return null;
      return { type, title, figures };
    }

    if (type === "timeline") {
      const figuresSource = Array.isArray(raw.figures)
        ? raw.figures
        : Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.events)
        ? raw.events
        : [];
      const figures = figuresSource.map(normalizeBlogTimelineFigure).filter(Boolean);
      if (!figures.length) return null;
      return { type, title, figures };
    }

    if (type === "qa") {
      const figuresSource = Array.isArray(raw.figures)
        ? raw.figures
        : Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.questions)
        ? raw.questions
        : [];
      const figures = figuresSource.map(normalizeBlogQaFigure).filter(Boolean);
      if (!figures.length) return null;
      return { type, title, figures };
    }

    return null;
  }

  function collectBlogCardText(card) {
    const parts = [];
    pushBlogTextPart(parts, card?.title);

    switch (card?.type) {
      case "text":
        (card.figures || []).forEach((figure) => {
          if (figure.type === "paragraph") pushBlogTextPart(parts, figure.text);
          if (figure.type === "list") {
            (figure.items || []).forEach((item) => pushBlogTextPart(parts, item));
          }
        });
        break;
      case "image":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.title);
          pushBlogTextPart(parts, figure.caption);
          pushBlogTextPart(parts, figure.alt);
        });
        break;
      case "chart":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.title);
          pushBlogTextPart(parts, figure.description);
          (figure.data || []).forEach((datum) => {
            pushBlogTextPart(parts, datum.label);
            pushBlogTextPart(parts, datum.value);
          });
          (figure.points || []).forEach((point) => {
            pushBlogTextPart(parts, point.label);
            pushBlogTextPart(parts, point.x);
            pushBlogTextPart(parts, point.y);
          });
          (figure.columns || []).forEach((column) => pushBlogTextPart(parts, column));
          (figure.rows || []).forEach((row) => {
            row.forEach((cell) => pushBlogTextPart(parts, cell));
          });
        });
        break;
      case "big-number":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.title);
          pushBlogTextPart(parts, figure.stat);
          pushBlogTextPart(parts, figure.description);
        });
        break;
      case "quote":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.quote);
          pushBlogTextPart(parts, figure.attribution);
          pushBlogTextPart(parts, figure.role);
        });
        break;
      case "comparison":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.title);
          pushBlogTextPart(parts, figure.description);
          (figure.items || []).forEach((item) => pushBlogTextPart(parts, item));
        });
        break;
      case "link-embed":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.label);
          pushBlogTextPart(parts, figure.description);
          pushBlogTextPart(parts, figure.site);
        });
        break;
      case "timeline":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.time);
          pushBlogTextPart(parts, figure.title);
          pushBlogTextPart(parts, figure.description);
          pushBlogTextPart(parts, figure.image?.caption);
        });
        break;
      case "qa":
        (card.figures || []).forEach((figure) => {
          pushBlogTextPart(parts, figure.question);
          pushBlogTextPart(parts, figure.answer);
        });
        break;
      default:
        break;
    }

    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function normalizeBlogContent(value) {
    const cards = [];
    const textParts = [];

    function addCard(card) {
      if (!card) return;
      cards.push(card);
      const contentText = collectBlogCardText(card);
      if (contentText) textParts.push(contentText);
    }

    if (typeof value === "string") {
      const text = value.trim();
      if (text) addCard(normalizeBlogTextCard({ text }));
      return { cards, text: textParts.join(" ").trim() };
    }

    if (Array.isArray(value)) {
      value.forEach((block) => {
        if (typeof block === "string") {
          const text = block.trim();
          if (text) addCard(normalizeBlogTextCard({ text }));
          return;
        }

        if (!block || typeof block !== "object") return;

        const cardType = normalizeBlogCardType(block.type);
        if (cardType) {
          addCard(normalizeBlogCard(block));
          return;
        }

        if (
          block.heading ||
          block.title ||
          block.text ||
          (Array.isArray(block.paragraphs) && block.paragraphs.length) ||
          (Array.isArray(block.items) && block.items.length) ||
          (Array.isArray(block.list) && block.list.length)
        ) {
          addCard(normalizeBlogTextCard(block));
        }
      });

      return { cards, text: textParts.join(" ").trim() };
    }

    return { cards, text: "" };
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
    const normalized = posts.filter(isVisibleEntry).map(normalizeBlogPost).filter(Boolean);

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

  function createSvgNode(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  function formatBlogMetric(value, unit) {
    const formatted = blogNumberFormatter.format(value);
    if (!unit) return formatted;
    if (unit === "%") return `${formatted}%`;
    if (/^[\$€£]/.test(unit)) return `${unit}${formatted}`;
    return `${formatted} ${unit}`;
  }

  function createBlogChartTicks(minValue, maxValue, targetSteps = 4) {
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return [];
    if (minValue === maxValue) return [minValue];

    const rawStep = Math.abs(maxValue - minValue) / Math.max(targetSteps, 1);
    const magnitude = 10 ** Math.floor(Math.log10(rawStep || 1));
    const normalized = rawStep / magnitude;
    let step = magnitude;

    if (normalized > 5) {
      step = 10 * magnitude;
    } else if (normalized > 2) {
      step = 5 * magnitude;
    } else if (normalized > 1) {
      step = 2 * magnitude;
    }

    const start = Math.floor(minValue / step) * step;
    const end = Math.ceil(maxValue / step) * step;
    const ticks = [];

    for (let value = start; value <= end + step / 2; value += step) {
      ticks.push(Number(value.toFixed(6)));
    }

    return ticks;
  }

  function getBlogUrlHost(url) {
    try {
      const host = new URL(url, window.location.href).hostname.replace(/^www\./, "");
      return host || cleanText(url);
    } catch {
      return cleanText(url);
    }
  }

  function createBlogCardHeading(title, tagName = "h2", className = "post-content-card-title") {
    const text = cleanText(title);
    if (!text) return null;

    const heading = document.createElement(tagName);
    heading.className = className;
    heading.textContent = text;
    return heading;
  }

  function createBlogFigureIntro(figure) {
    const parts = document.createDocumentFragment();

    if (figure.title) {
      const heading = createBlogCardHeading(figure.title, "h3", "post-content-figure-title");
      if (heading) parts.appendChild(heading);
    }

    if (figure.description) {
      const description = document.createElement("p");
      description.className = "post-content-figure-description";
      description.textContent = figure.description;
      parts.appendChild(description);
    }

    return parts;
  }

  function createBlogImageFigureElement(figure, compact = false) {
    const wrap = document.createElement("figure");
    wrap.className = compact ? "post-media-figure is-compact" : "post-media-figure";

    const img = document.createElement("img");
    img.className = "post-media-image";
    img.src = figure.src;
    img.alt = figure.alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    wrap.appendChild(img);

    if (figure.title || figure.caption) {
      const caption = document.createElement("figcaption");
      caption.className = "post-media-caption";

      if (figure.title) {
        const strong = document.createElement("strong");
        strong.textContent = figure.title;
        caption.appendChild(strong);
      }

      if (figure.caption) {
        const text = document.createElement("span");
        text.textContent = figure.caption;
        caption.appendChild(text);
      }

      wrap.appendChild(caption);
    }

    return wrap;
  }

  function createBlogTextCard(card) {
    const prose = document.createElement("div");
    prose.className = "prose post-card-prose";

    (card.figures || []).forEach((figure) => {
      if (figure.type === "paragraph") {
        const p = document.createElement("p");
        p.textContent = figure.text;
        prose.appendChild(p);
      }

      if (figure.type === "list" && Array.isArray(figure.items) && figure.items.length) {
        const list = document.createElement("ul");
        figure.items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });
        prose.appendChild(list);
      }
    });

    return prose.childNodes.length ? prose : null;
  }

  function createBlogImageCarousel(figures) {
    const carousel = document.createElement("div");
    carousel.className = "post-carousel";

    const viewport = document.createElement("div");
    viewport.className = "post-carousel-viewport";
    carousel.appendChild(viewport);

    const slides = figures.map((figure, index) => {
      const slide = document.createElement("div");
      slide.className = "post-carousel-slide";
      slide.hidden = index !== 0;
      slide.appendChild(createBlogImageFigureElement(figure));
      viewport.appendChild(slide);
      return slide;
    });

    if (figures.length > 1) {
      const controls = document.createElement("div");
      controls.className = "post-carousel-controls";

      const previous = document.createElement("button");
      previous.className = "btn small ghost";
      previous.type = "button";
      previous.setAttribute("aria-label", "Previous image");
      previous.textContent = "Previous";

      const status = document.createElement("div");
      status.className = "fineprint post-carousel-status";
      status.setAttribute("aria-live", "polite");

      const next = document.createElement("button");
      next.className = "btn small ghost";
      next.type = "button";
      next.setAttribute("aria-label", "Next image");
      next.textContent = "Next";

      controls.append(previous, status, next);
      carousel.appendChild(controls);

      let activeIndex = 0;
      function updateCarousel() {
        slides.forEach((slide, index) => {
          slide.hidden = index !== activeIndex;
        });
        status.textContent = `${activeIndex + 1} / ${slides.length}`;
      }

      previous.addEventListener("click", () => {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        updateCarousel();
      });

      next.addEventListener("click", () => {
        activeIndex = (activeIndex + 1) % slides.length;
        updateCarousel();
      });

      updateCarousel();
    }

    return carousel;
  }

  function createBlogImageCard(card) {
    if (!Array.isArray(card.figures) || !card.figures.length) return null;

    if (card.layout === "carousel" && card.figures.length > 1) {
      return createBlogImageCarousel(card.figures);
    }

    const wrap = document.createElement("div");
    wrap.className =
      card.layout === "grid" && card.figures.length > 1
        ? "post-media-grid"
        : "post-media-single";

    card.figures.forEach((figure) => {
      wrap.appendChild(createBlogImageFigureElement(figure));
    });

    return wrap;
  }

  function createBlogBarChart(data, unit) {
    const chart = document.createElement("div");
    chart.className = "blog-bar-chart";
    const maxValue = Math.max(...data.map((item) => item.value), 1);

    data.forEach((item, index) => {
      const column = document.createElement("div");
      column.className = "blog-bar-column";

      const value = document.createElement("div");
      value.className = "blog-chart-value";
      value.textContent = formatBlogMetric(item.value, unit);

      const track = document.createElement("div");
      track.className = "blog-bar-track";

      const fill = document.createElement("div");
      fill.className = "blog-bar-fill";
      fill.style.height = `${Math.max((item.value / maxValue) * 100, 6)}%`;
      fill.style.background = BLOG_CHART_COLORS[index % BLOG_CHART_COLORS.length];
      track.appendChild(fill);

      const label = document.createElement("div");
      label.className = "blog-chart-label";
      label.textContent = item.label;

      column.append(value, track, label);
      chart.appendChild(column);
    });

    return chart;
  }

  function createBlogLineChart(data, unit) {
    const values = data.map((item) => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const ticks = createBlogChartTicks(minValue, maxValue);
    const chartMin = ticks[0] ?? minValue;
    const chartMax = ticks[ticks.length - 1] ?? maxValue;
    const valueRange = chartMax - chartMin || 1;
    const width = 360;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 40, left: 48 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const wrap = document.createElement("div");
    wrap.className = "blog-svg-chart";

    const meta = document.createElement("div");
    meta.className = "blog-chart-axis-meta";
    meta.textContent = `${formatBlogMetric(minValue, unit)} to ${formatBlogMetric(
      maxValue,
      unit
    )}`;
    wrap.appendChild(meta);

    const svg = createSvgNode("svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("aria-hidden", "true");

    ticks.forEach((tick) => {
      const y = padding.top + (1 - (tick - chartMin) / valueRange) * plotHeight;

      const gridLine = createSvgNode("line");
      gridLine.setAttribute("x1", String(padding.left));
      gridLine.setAttribute("y1", String(y));
      gridLine.setAttribute("x2", String(width - padding.right));
      gridLine.setAttribute("y2", String(y));
      gridLine.setAttribute("class", "blog-chart-grid-line");
      svg.appendChild(gridLine);

      const label = createSvgNode("text");
      label.setAttribute("x", String(padding.left - 8));
      label.setAttribute("y", String(y + 4));
      label.setAttribute("text-anchor", "end");
      label.setAttribute("class", "blog-chart-tick-label");
      label.textContent = formatBlogMetric(tick, unit);
      svg.appendChild(label);
    });

    const axisY = createSvgNode("line");
    axisY.setAttribute("x1", String(padding.left));
    axisY.setAttribute("y1", String(padding.top));
    axisY.setAttribute("x2", String(padding.left));
    axisY.setAttribute("y2", String(height - padding.bottom));
    axisY.setAttribute("class", "blog-chart-axis-line");
    svg.appendChild(axisY);

    const baseline = createSvgNode("line");
    baseline.setAttribute("x1", String(padding.left));
    baseline.setAttribute("y1", String(height - padding.bottom));
    baseline.setAttribute("x2", String(width - padding.right));
    baseline.setAttribute("y2", String(height - padding.bottom));
    baseline.setAttribute("class", "blog-chart-axis-line");
    svg.appendChild(baseline);

    const polyline = createSvgNode("polyline");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", BLOG_CHART_COLORS[0]);
    polyline.setAttribute("stroke-width", "3");
    polyline.setAttribute(
      "points",
      data
        .map((item, index) => {
          const x =
            data.length === 1
              ? padding.left + plotWidth / 2
              : padding.left + (index / (data.length - 1)) * plotWidth;
          const y =
            padding.top + (1 - (item.value - chartMin) / valueRange) * plotHeight;
          return `${x},${y}`;
        })
        .join(" ")
    );
    svg.appendChild(polyline);

    data.forEach((item, index) => {
      const x =
        data.length === 1
          ? padding.left + plotWidth / 2
          : padding.left + (index / (data.length - 1)) * plotWidth;
      const y = padding.top + (1 - (item.value - chartMin) / valueRange) * plotHeight;

      const point = createSvgNode("circle");
      point.setAttribute("cx", String(x));
      point.setAttribute("cy", String(y));
      point.setAttribute("r", "4");
      point.setAttribute("fill", BLOG_CHART_COLORS[0]);
      svg.appendChild(point);

      const label = createSvgNode("text");
      label.setAttribute("x", String(x));
      label.setAttribute("y", String(height - 12));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "blog-chart-axis-label");
      label.textContent = item.label;
      svg.appendChild(label);
    });

    wrap.appendChild(svg);
    return wrap;
  }

  function createBlogPieChart(data, unit) {
    const total = data.reduce((sum, item) => sum + Math.max(item.value, 0), 0);
    if (total <= 0) return null;

    let offset = 0;
    const gradient = data
      .map((item, index) => {
        const start = offset;
        offset += (Math.max(item.value, 0) / total) * 100;
        const color = BLOG_CHART_COLORS[index % BLOG_CHART_COLORS.length];
        return `${color} ${start}% ${offset}%`;
      })
      .join(", ");

    const wrap = document.createElement("div");
    wrap.className = "blog-pie-layout";

    const pie = document.createElement("div");
    pie.className = "blog-pie-chart";
    pie.style.background = `conic-gradient(${gradient})`;

    const center = document.createElement("div");
    center.className = "blog-pie-center";
    center.textContent = formatBlogMetric(total, unit);
    pie.appendChild(center);

    const legend = document.createElement("div");
    legend.className = "blog-chart-legend";
    data.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "blog-chart-legend-row";

      const swatch = document.createElement("span");
      swatch.className = "blog-chart-swatch";
      swatch.style.background = BLOG_CHART_COLORS[index % BLOG_CHART_COLORS.length];

      const label = document.createElement("span");
      label.textContent = `${item.label}: ${formatBlogMetric(item.value, unit)}`;

      row.append(swatch, label);
      legend.appendChild(row);
    });

    wrap.append(pie, legend);
    return wrap;
  }

  function createBlogScatterChart(points, xLabel, yLabel) {
    const width = 360;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 48, left: 48 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const xTicks = createBlogChartTicks(minX, maxX);
    const yTicks = createBlogChartTicks(minY, maxY);
    const chartMinX = xTicks[0] ?? minX;
    const chartMaxX = xTicks[xTicks.length - 1] ?? maxX;
    const chartMinY = yTicks[0] ?? minY;
    const chartMaxY = yTicks[yTicks.length - 1] ?? maxY;
    const rangeX = chartMaxX - chartMinX || 1;
    const rangeY = chartMaxY - chartMinY || 1;

    const wrap = document.createElement("div");
    wrap.className = "blog-svg-chart";

    const meta = document.createElement("div");
    meta.className = "blog-chart-axis-meta";
    meta.textContent = `${xLabel || "X"} vs ${yLabel || "Y"}`;
    wrap.appendChild(meta);

    const svg = createSvgNode("svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("aria-hidden", "true");

    yTicks.forEach((tick) => {
      const y = padding.top + (1 - (tick - chartMinY) / rangeY) * plotHeight;

      const gridLine = createSvgNode("line");
      gridLine.setAttribute("x1", String(padding.left));
      gridLine.setAttribute("y1", String(y));
      gridLine.setAttribute("x2", String(width - padding.right));
      gridLine.setAttribute("y2", String(y));
      gridLine.setAttribute("class", "blog-chart-grid-line");
      svg.appendChild(gridLine);

      const label = createSvgNode("text");
      label.setAttribute("x", String(padding.left - 8));
      label.setAttribute("y", String(y + 4));
      label.setAttribute("text-anchor", "end");
      label.setAttribute("class", "blog-chart-tick-label");
      label.textContent = blogNumberFormatter.format(tick);
      svg.appendChild(label);
    });

    xTicks.forEach((tick) => {
      const x = padding.left + ((tick - chartMinX) / rangeX) * plotWidth;

      const gridLine = createSvgNode("line");
      gridLine.setAttribute("x1", String(x));
      gridLine.setAttribute("y1", String(padding.top));
      gridLine.setAttribute("x2", String(x));
      gridLine.setAttribute("y2", String(height - padding.bottom));
      gridLine.setAttribute("class", "blog-chart-grid-line");
      svg.appendChild(gridLine);

      const label = createSvgNode("text");
      label.setAttribute("x", String(x));
      label.setAttribute("y", String(height - padding.bottom + 18));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "blog-chart-tick-label");
      label.textContent = blogNumberFormatter.format(tick);
      svg.appendChild(label);
    });

    const axisX = createSvgNode("line");
    axisX.setAttribute("x1", String(padding.left));
    axisX.setAttribute("y1", String(height - padding.bottom));
    axisX.setAttribute("x2", String(width - padding.right));
    axisX.setAttribute("y2", String(height - padding.bottom));
    axisX.setAttribute("class", "blog-chart-axis-line");
    svg.appendChild(axisX);

    const axisY = createSvgNode("line");
    axisY.setAttribute("x1", String(padding.left));
    axisY.setAttribute("y1", String(padding.top));
    axisY.setAttribute("x2", String(padding.left));
    axisY.setAttribute("y2", String(height - padding.bottom));
    axisY.setAttribute("class", "blog-chart-axis-line");
    svg.appendChild(axisY);

    if (xLabel) {
      const xAxisLabel = createSvgNode("text");
      xAxisLabel.setAttribute("x", String(padding.left + plotWidth / 2));
      xAxisLabel.setAttribute("y", String(height - 6));
      xAxisLabel.setAttribute("text-anchor", "middle");
      xAxisLabel.setAttribute("class", "blog-chart-axis-title");
      xAxisLabel.textContent = xLabel;
      svg.appendChild(xAxisLabel);
    }

    if (yLabel) {
      const yAxisLabel = createSvgNode("text");
      yAxisLabel.setAttribute("x", "14");
      yAxisLabel.setAttribute("y", String(padding.top + plotHeight / 2));
      yAxisLabel.setAttribute("text-anchor", "middle");
      yAxisLabel.setAttribute("transform", `rotate(-90 14 ${padding.top + plotHeight / 2})`);
      yAxisLabel.setAttribute("class", "blog-chart-axis-title");
      yAxisLabel.textContent = yLabel;
      svg.appendChild(yAxisLabel);
    }

    points.forEach((point, index) => {
      const x = padding.left + ((point.x - chartMinX) / rangeX) * plotWidth;
      const y = padding.top + (1 - (point.y - chartMinY) / rangeY) * plotHeight;
      const circle = createSvgNode("circle");
      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y));
      circle.setAttribute("r", "5");
      circle.setAttribute("fill", BLOG_CHART_COLORS[index % BLOG_CHART_COLORS.length]);
      svg.appendChild(circle);

      if (point.label) {
        const label = createSvgNode("text");
        label.setAttribute("x", String(x + 8));
        label.setAttribute("y", String(y - 8));
        label.setAttribute("class", "blog-chart-point-label");
        label.textContent = point.label;
        svg.appendChild(label);
      }
    });

    wrap.appendChild(svg);
    return wrap;
  }

  function createBlogTableChart(columns, rows) {
    const wrap = document.createElement("div");
    wrap.className = "blog-table-wrap";

    const table = document.createElement("table");
    table.className = "blog-chart-table";

    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    columns.forEach((column) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = column;
      headRow.appendChild(th);
    });
    head.appendChild(headRow);
    table.appendChild(head);

    const body = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    table.appendChild(body);

    wrap.appendChild(table);
    return wrap;
  }

  function createBlogRadarChart(data, unit, maxOverride) {
    const width = 240;
    const height = 240;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 76;
    const maxValue = maxOverride || Math.max(...data.map((item) => item.value), 1);
    const count = data.length;

    const wrap = document.createElement("div");
    wrap.className = "blog-svg-chart";

    const meta = document.createElement("div");
    meta.className = "blog-chart-axis-meta";
    meta.textContent = `Max ${formatBlogMetric(maxValue, unit)}`;
    wrap.appendChild(meta);

    const svg = createSvgNode("svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("aria-hidden", "true");

    for (let ring = 1; ring <= 4; ring += 1) {
      const scale = ring / 4;
      const polygon = createSvgNode("polygon");
      polygon.setAttribute(
        "points",
        data
          .map((_, index) => {
            const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius * scale;
            const y = centerY + Math.sin(angle) * radius * scale;
            return `${x},${y}`;
          })
          .join(" ")
      );
      polygon.setAttribute("class", "blog-radar-ring");
      svg.appendChild(polygon);
    }

    data.forEach((item, index) => {
      const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
      const axisX = centerX + Math.cos(angle) * radius;
      const axisY = centerY + Math.sin(angle) * radius;

      const axis = createSvgNode("line");
      axis.setAttribute("x1", String(centerX));
      axis.setAttribute("y1", String(centerY));
      axis.setAttribute("x2", String(axisX));
      axis.setAttribute("y2", String(axisY));
      axis.setAttribute("class", "blog-chart-axis-line");
      svg.appendChild(axis);

      const label = createSvgNode("text");
      label.setAttribute("x", String(centerX + Math.cos(angle) * (radius + 18)));
      label.setAttribute("y", String(centerY + Math.sin(angle) * (radius + 18)));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "blog-chart-axis-label");
      label.textContent = item.label;
      svg.appendChild(label);
    });

    const area = createSvgNode("polygon");
    area.setAttribute(
      "points",
      data
        .map((item, index) => {
          const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
          const scaledRadius = radius * Math.max(Math.min(item.value / maxValue, 1), 0);
          const x = centerX + Math.cos(angle) * scaledRadius;
          const y = centerY + Math.sin(angle) * scaledRadius;
          return `${x},${y}`;
        })
        .join(" ")
    );
    area.setAttribute("class", "blog-radar-area");
    svg.appendChild(area);

    wrap.appendChild(svg);
    return wrap;
  }

  function createBlogChartFigure(figure) {
    const article = document.createElement("article");
    article.className = "blog-chart-figure";
    article.appendChild(createBlogFigureIntro(figure));

    let chart = null;

    switch (figure.chartType) {
      case "bar":
        chart = createBlogBarChart(figure.data, figure.unit);
        break;
      case "line":
        chart = createBlogLineChart(figure.data, figure.unit);
        break;
      case "pie":
        chart = createBlogPieChart(figure.data, figure.unit);
        break;
      case "scatter":
        chart = createBlogScatterChart(figure.points, figure.xLabel, figure.yLabel);
        break;
      case "table":
        chart = createBlogTableChart(figure.columns, figure.rows);
        break;
      case "radar":
        chart = createBlogRadarChart(figure.data, figure.unit, figure.max);
        break;
      default:
        break;
    }

    if (chart) article.appendChild(chart);
    return article;
  }

  function createBlogChartCard(card) {
    const wrap = document.createElement("div");
    wrap.className = "blog-chart-grid";

    (card.figures || []).forEach((figure) => {
      wrap.appendChild(createBlogChartFigure(figure));
    });

    return wrap;
  }

  function createBlogBigNumberCard(card) {
    const wrap = document.createElement("div");
    wrap.className = "blog-stat-grid";

    (card.figures || []).forEach((figure) => {
      const stat = document.createElement("article");
      stat.className = "blog-stat-card";

      if (figure.title) {
        const title = document.createElement("div");
        title.className = "blog-stat-title";
        title.textContent = figure.title;
        stat.appendChild(title);
      }

      if (figure.stat) {
        const value = document.createElement("div");
        value.className = "blog-stat-value";
        value.textContent = figure.stat;
        stat.appendChild(value);
      }

      if (figure.description) {
        const description = document.createElement("p");
        description.className = "blog-stat-description";
        description.textContent = figure.description;
        stat.appendChild(description);
      }

      wrap.appendChild(stat);
    });

    return wrap;
  }

  function createBlogQuoteCard(card) {
    const wrap = document.createElement("div");
    wrap.className = "blog-quote-stack";

    (card.figures || []).forEach((figure) => {
      const quote = document.createElement("blockquote");
      quote.className = "blog-quote-card";

      const text = document.createElement("p");
      text.textContent = figure.quote;
      quote.appendChild(text);

      if (figure.attribution || figure.role) {
        const footer = document.createElement("footer");
        footer.textContent = [figure.attribution, figure.role].filter(Boolean).join(", ");
        quote.appendChild(footer);
      }

      wrap.appendChild(quote);
    });

    return wrap;
  }

  function createBlogComparisonCard(card) {
    const figures = Array.isArray(card.figures) ? card.figures : [];
    if (!figures.length) return null;

    const wrap = document.createElement("div");
    wrap.className = "blog-table-wrap blog-comparison-table-wrap";

    const table = document.createElement("table");
    table.className = "blog-chart-table blog-comparison-table";

    const head = document.createElement("thead");
    const headRow = document.createElement("tr");

    const lineHead = document.createElement("th");
    lineHead.scope = "col";
    lineHead.className = "blog-comparison-line-head";
    lineHead.textContent = "Line";
    headRow.appendChild(lineHead);

    figures.forEach((figure, index) => {
      const th = document.createElement("th");
      th.scope = "col";
      if (figure.tone) th.setAttribute("data-tone", figure.tone);

      const title = document.createElement("div");
      title.className = "blog-comparison-heading";
      title.textContent = figure.title || `Option ${index + 1}`;
      th.appendChild(title);

      if (figure.description) {
        const note = document.createElement("div");
        note.className = "blog-comparison-heading-note";
        note.textContent = figure.description;
        th.appendChild(note);
      }

      headRow.appendChild(th);
    });

    head.appendChild(headRow);
    table.appendChild(head);

    const body = document.createElement("tbody");
    const rowCount = figures.reduce(
      (max, figure) => Math.max(max, Array.isArray(figure.items) ? figure.items.length : 0),
      0
    );

    for (let index = 0; index < rowCount; index += 1) {
      const row = document.createElement("tr");

      const line = document.createElement("th");
      line.scope = "row";
      line.className = "blog-comparison-line-index";
      line.textContent = String(index + 1);
      row.appendChild(line);

      figures.forEach((figure) => {
        const cell = document.createElement("td");
        if (figure.tone) cell.setAttribute("data-tone", figure.tone);
        cell.textContent = figure.items[index] || "—";
        row.appendChild(cell);
      });

      body.appendChild(row);
    }

    table.appendChild(body);
    wrap.appendChild(table);
    return wrap;
  }

  function createBlogLinkEmbedCard(card) {
    const wrap = document.createElement("div");
    wrap.className = "blog-link-grid";

    (card.figures || []).forEach((figure) => {
      const link = document.createElement("a");
      link.className = "blog-link-card";
      link.href = figure.url;
      link.target = "_blank";
      link.rel = "noopener";

      const site = document.createElement("div");
      site.className = "blog-link-site";
      site.textContent = figure.site || getBlogUrlHost(figure.url);
      link.appendChild(site);

      const title = document.createElement("h3");
      title.className = "post-content-figure-title";
      title.textContent = figure.label;
      link.appendChild(title);

      if (figure.description) {
        const description = document.createElement("p");
        description.className = "post-content-figure-description";
        description.textContent = figure.description;
        link.appendChild(description);
      }

      const url = document.createElement("div");
      url.className = "blog-link-url";
      url.textContent = figure.url;
      link.appendChild(url);

      wrap.appendChild(link);
    });

    return wrap;
  }

  function createBlogTimelineCard(card) {
    const wrap = document.createElement("div");
    wrap.className = "blog-timeline";

    (card.figures || []).forEach((figure) => {
      const item = document.createElement("article");
      item.className = "blog-timeline-item";

      const time = document.createElement("div");
      time.className = "blog-timeline-time";
      time.textContent = figure.time || "Moment";
      item.appendChild(time);

      const body = document.createElement("div");
      body.className = "blog-timeline-body";

      if (figure.title) {
        const title = document.createElement("h3");
        title.className = "post-content-figure-title";
        title.textContent = figure.title;
        body.appendChild(title);
      }

      if (figure.description) {
        const description = document.createElement("p");
        description.className = "post-content-figure-description";
        description.textContent = figure.description;
        body.appendChild(description);
      }

      if (figure.image) {
        body.appendChild(createBlogImageFigureElement(figure.image, true));
      }

      item.appendChild(body);
      wrap.appendChild(item);
    });

    return wrap;
  }

  function createBlogQaCard(card) {
    const wrap = document.createElement("div");
    wrap.className = "blog-qa-list";

    (card.figures || []).forEach((figure) => {
      const item = document.createElement("details");
      item.className = "blog-qa-item";
      item.open = true;

      const question = document.createElement("summary");
      question.textContent = figure.question;
      item.appendChild(question);

      const answer = document.createElement("p");
      answer.textContent = figure.answer;
      item.appendChild(answer);

      wrap.appendChild(item);
    });

    return wrap;
  }

  function createBlogCard(card) {
    const section = document.createElement("section");
    section.className = `post-content-card post-content-card--${card.type}`;

    const heading = createBlogCardHeading(card.title);
    if (heading) section.appendChild(heading);

    let body = null;

    switch (card.type) {
      case "text":
        body = createBlogTextCard(card);
        break;
      case "image":
        body = createBlogImageCard(card);
        break;
      case "chart":
        body = createBlogChartCard(card);
        break;
      case "big-number":
        body = createBlogBigNumberCard(card);
        break;
      case "quote":
        body = createBlogQuoteCard(card);
        break;
      case "comparison":
        body = createBlogComparisonCard(card);
        break;
      case "link-embed":
        body = createBlogLinkEmbedCard(card);
        break;
      case "timeline":
        body = createBlogTimelineCard(card);
        break;
      case "qa":
        body = createBlogQaCard(card);
        break;
      default:
        break;
    }

    if (body) section.appendChild(body);
    return section;
  }

  function createBlogContent(post) {
    const cards = Array.isArray(post.content?.cards) ? post.content.cards : [];
    if (!cards.length) return null;

    const wrap = document.createElement("div");
    wrap.className = "post-content-grid";

    cards.forEach((card) => {
      wrap.appendChild(createBlogCard(card));
    });

    return wrap;
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
    article.className = "card post-card home-blog-card";
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

    const visible = Array.isArray(posts) ? posts.slice(0, 1) : [];

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

  let blogBuilderIdCounter = 0;
  function createBlogBuilderId(prefix = "builder") {
    blogBuilderIdCounter += 1;
    return `${prefix}-${blogBuilderIdCounter}`;
  }

  function createBlogBuilderCitation(raw = null) {
    if (typeof raw === "string") {
      return {
        key: createBlogBuilderId("citation"),
        label: "",
        url: cleanText(raw)
      };
    }

    return {
      key: createBlogBuilderId("citation"),
      label: cleanText(raw?.label || raw?.title),
      url: cleanText(raw?.url || raw?.href)
    };
  }

  function createBlogBuilderTextFigure(type = "paragraph") {
    return {
      key: createBlogBuilderId("figure"),
      type,
      text: "",
      itemsText: ""
    };
  }

  function createBlogBuilderImageFigure(raw = null) {
    return {
      key: createBlogBuilderId("figure"),
      src: cleanText(raw?.src),
      alt: cleanText(raw?.alt),
      caption: cleanText(raw?.caption),
      title: cleanText(raw?.title)
    };
  }

  function createBlogBuilderChartFigure(chartType = "bar") {
    return {
      key: createBlogBuilderId("figure"),
      chartType,
      title: "",
      description: "",
      unit: "",
      max: "",
      xLabel: "",
      yLabel: "",
      dataText: "",
      columnsText: "",
      rowsText: ""
    };
  }

  function createBlogBuilderBigNumberFigure(raw = null) {
    return {
      key: createBlogBuilderId("figure"),
      title: cleanText(raw?.title),
      stat: cleanText(raw?.stat),
      description: cleanText(raw?.description)
    };
  }

  function createBlogBuilderQuoteFigure(raw = null) {
    return {
      key: createBlogBuilderId("figure"),
      quote: cleanText(raw?.quote),
      attribution: cleanText(raw?.attribution),
      role: cleanText(raw?.role)
    };
  }

  function createBlogBuilderComparisonFigure(raw = null) {
    return {
      key: createBlogBuilderId("figure"),
      title: cleanText(raw?.title),
      description: cleanText(raw?.description),
      tone: cleanText(raw?.tone),
      itemsText: Array.isArray(raw?.items) ? raw.items.join("\n") : ""
    };
  }

  function createBlogBuilderLinkFigure(raw = null) {
    return {
      key: createBlogBuilderId("figure"),
      url: cleanText(raw?.url),
      label: cleanText(raw?.label),
      description: cleanText(raw?.description),
      site: cleanText(raw?.site)
    };
  }

  function createBlogBuilderTimelineFigure(raw = null) {
    return {
      key: createBlogBuilderId("figure"),
      time: cleanText(raw?.time),
      title: cleanText(raw?.title),
      description: cleanText(raw?.description),
      imageSrc: cleanText(raw?.image?.src),
      imageAlt: cleanText(raw?.image?.alt),
      imageCaption: cleanText(raw?.image?.caption),
      imageTitle: cleanText(raw?.image?.title)
    };
  }

  function createBlogBuilderQaFigure(raw = null) {
    return {
      key: createBlogBuilderId("figure"),
      question: cleanText(raw?.question),
      answer: cleanText(raw?.answer)
    };
  }

  function createBlogBuilderCard(type = "text") {
    const card = {
      key: createBlogBuilderId("card"),
      type,
      title: "",
      layout: "single",
      figures: []
    };

    switch (type) {
      case "text":
        card.figures = [createBlogBuilderTextFigure("paragraph")];
        break;
      case "image":
        card.layout = "single";
        card.figures = [createBlogBuilderImageFigure()];
        break;
      case "chart":
        card.figures = [createBlogBuilderChartFigure("bar")];
        break;
      case "big-number":
        card.figures = [createBlogBuilderBigNumberFigure()];
        break;
      case "quote":
        card.figures = [createBlogBuilderQuoteFigure()];
        break;
      case "comparison":
        card.figures = [
          createBlogBuilderComparisonFigure(),
          createBlogBuilderComparisonFigure()
        ];
        break;
      case "link-embed":
        card.figures = [createBlogBuilderLinkFigure()];
        break;
      case "timeline":
        card.figures = [createBlogBuilderTimelineFigure()];
        break;
      case "qa":
        card.figures = [createBlogBuilderQaFigure()];
        break;
      default:
        card.figures = [];
        break;
    }

    return card;
  }

  function cloneBlogBuilderCard(card) {
    const cloned = JSON.parse(JSON.stringify(card));
    cloned.key = createBlogBuilderId("card");
    cloned.figures = Array.isArray(cloned.figures)
      ? cloned.figures.map((figure) => ({
          ...figure,
          key: createBlogBuilderId("figure")
        }))
      : [];
    return cloned;
  }

  function createEmptyBlogBuilderPost() {
    return {
      visibility: true,
      id: "",
      title: "",
      summary: "",
      thumbnail: "",
      tags: "",
      writtenAt: formatDateAttr(new Date()),
      updatedAt: "",
      readMinutes: "",
      autoReadMinutes: true,
      citations: [],
      content: []
    };
  }

  function createBlogBuilderChartDataText(figure) {
    if (!figure) return "";

    if (figure.chartType === "scatter") {
      return (figure.points || [])
        .map((point) => {
          if (point.label) {
            return `${point.label} | ${point.x} | ${point.y}`;
          }
          return `${point.x} | ${point.y}`;
        })
        .join("\n");
    }

    if (figure.chartType === "table") {
      return "";
    }

    return (figure.data || [])
      .map((item) => `${item.label} | ${item.value}`)
      .join("\n");
  }

  function createBlogBuilderCardFromNormalized(card) {
    if (!card || typeof card !== "object" || !card.type) return null;

    const builderCard = createBlogBuilderCard(card.type);
    builderCard.title = cleanText(card.title);

    if (card.type === "text") {
      builderCard.figures = (card.figures || []).map((figure) => ({
        key: createBlogBuilderId("figure"),
        type: figure.type === "list" ? "list" : "paragraph",
        text: figure.type === "paragraph" ? cleanText(figure.text) : "",
        itemsText: figure.type === "list" ? (figure.items || []).join("\n") : ""
      }));
      return builderCard;
    }

    if (card.type === "image") {
      builderCard.layout = cleanText(card.layout || "single") || "single";
      builderCard.figures = (card.figures || []).map((figure) =>
        createBlogBuilderImageFigure(figure)
      );
      return builderCard;
    }

    if (card.type === "chart") {
      builderCard.figures = (card.figures || []).map((figure) => ({
        key: createBlogBuilderId("figure"),
        chartType: cleanText(figure.chartType || "bar") || "bar",
        title: cleanText(figure.title),
        description: cleanText(figure.description),
        unit: cleanText(figure.unit),
        max: figure.max == null ? "" : String(figure.max),
        xLabel: cleanText(figure.xLabel),
        yLabel: cleanText(figure.yLabel),
        dataText: createBlogBuilderChartDataText(figure),
        columnsText: Array.isArray(figure.columns) ? figure.columns.join(" | ") : "",
        rowsText: Array.isArray(figure.rows)
          ? figure.rows.map((row) => row.join(" | ")).join("\n")
          : ""
      }));
      return builderCard;
    }

    if (card.type === "big-number") {
      builderCard.figures = (card.figures || []).map((figure) =>
        createBlogBuilderBigNumberFigure(figure)
      );
      return builderCard;
    }

    if (card.type === "quote") {
      builderCard.figures = (card.figures || []).map((figure) =>
        createBlogBuilderQuoteFigure(figure)
      );
      return builderCard;
    }

    if (card.type === "comparison") {
      builderCard.figures = (card.figures || []).map((figure) =>
        createBlogBuilderComparisonFigure(figure)
      );
      return builderCard;
    }

    if (card.type === "link-embed") {
      builderCard.figures = (card.figures || []).map((figure) =>
        createBlogBuilderLinkFigure(figure)
      );
      return builderCard;
    }

    if (card.type === "timeline") {
      builderCard.figures = (card.figures || []).map((figure) =>
        createBlogBuilderTimelineFigure(figure)
      );
      return builderCard;
    }

    if (card.type === "qa") {
      builderCard.figures = (card.figures || []).map((figure) =>
        createBlogBuilderQaFigure(figure)
      );
      return builderCard;
    }

    return null;
  }

  function createBlogBuilderPostFromRaw(raw) {
    const normalized = normalizeBlogPost(raw);
    if (!normalized) return createEmptyBlogBuilderPost();

    return {
      visibility: isVisibleEntry(raw),
      id: normalized.id,
      title: normalized.title,
      summary: normalized.summary,
      thumbnail: cleanText(normalized.images?.thumbnail),
      tags: normalized.tags.join(", "),
      writtenAt: formatDateAttr(normalized.writtenDate),
      updatedAt: formatDateAttr(normalized.updatedDate),
      readMinutes: normalized.readMinutes ? String(normalized.readMinutes) : "",
      autoReadMinutes: !normalized.readMinutes,
      citations: Array.isArray(raw?.citations)
        ? raw.citations.map((citation) => createBlogBuilderCitation(citation))
        : [],
      content: (normalized.content?.cards || [])
        .map((card) => createBlogBuilderCardFromNormalized(card))
        .filter(Boolean)
    };
  }

  function getBlogBuilderCardTypeLabel(type) {
    switch (type) {
      case "text":
        return "Text";
      case "image":
        return "Image";
      case "chart":
        return "Chart";
      case "big-number":
        return "Big Number";
      case "quote":
        return "Quote";
      case "comparison":
        return "Comparison";
      case "link-embed":
        return "Link Embed";
      case "timeline":
        return "Timeline";
      case "qa":
        return "Q&A";
      default:
        return "Card";
    }
  }

  function getBlogBuilderChartTypeLabel(type) {
    switch (type) {
      case "bar":
        return "Bar";
      case "line":
        return "Line";
      case "pie":
        return "Pie";
      case "scatter":
        return "Scatter";
      case "table":
        return "Table";
      case "radar":
        return "Radar";
      default:
        return "Chart";
    }
  }

  function getBlogBuilderCardSummary(card, index) {
    const title = cleanText(card?.title);
    const count = Array.isArray(card?.figures) ? card.figures.length : 0;
    const label = getBlogBuilderCardTypeLabel(card?.type);
    if (title) return `${index + 1}. ${label} — ${title}`;
    return `${index + 1}. ${label} — ${count} item${count === 1 ? "" : "s"}`;
  }

  function getBlogBuilderFigureSummary(card, figure, index) {
    if (!card || !figure) return `Item ${index + 1}`;

    switch (card.type) {
      case "text":
        return figure.type === "list" ? `List ${index + 1}` : `Paragraph ${index + 1}`;
      case "image":
        return cleanText(figure.title) || cleanText(figure.src) || `Image ${index + 1}`;
      case "chart":
        return `${getBlogBuilderChartTypeLabel(figure.chartType)} ${index + 1}`;
      case "big-number":
        return cleanText(figure.title) || cleanText(figure.stat) || `Stat ${index + 1}`;
      case "quote":
        return cleanText(figure.attribution) || `Quote ${index + 1}`;
      case "comparison":
        return cleanText(figure.title) || `Column ${index + 1}`;
      case "link-embed":
        return cleanText(figure.label) || cleanText(figure.url) || `Link ${index + 1}`;
      case "timeline":
        return cleanText(figure.title) || cleanText(figure.time) || `Moment ${index + 1}`;
      case "qa":
        return cleanText(figure.question) || `Question ${index + 1}`;
      default:
        return `Item ${index + 1}`;
    }
  }

  function createBlogBuilderInputField({
    label,
    value,
    onInput,
    type = "text",
    placeholder = "",
    hint = "",
    min = "",
    max = "",
    step = "",
    disabled = false
  }) {
    const wrap = document.createElement("label");
    wrap.className = "blog-builder-field";

    const heading = document.createElement("span");
    heading.className = "blog-builder-field-label";
    heading.textContent = label;
    wrap.appendChild(heading);

    const input = document.createElement("input");
    input.className = "input";
    input.type = type;
    input.value = value;
    if (placeholder) input.placeholder = placeholder;
    if (min !== "") input.min = String(min);
    if (max !== "") input.max = String(max);
    if (step !== "") input.step = String(step);
    input.disabled = disabled;
    input.addEventListener("input", () => {
      onInput(input.value);
    });
    wrap.appendChild(input);

    if (hint) {
      const note = document.createElement("span");
      note.className = "fineprint";
      note.textContent = hint;
      wrap.appendChild(note);
    }

    return wrap;
  }

  function createBlogBuilderTextareaField({
    label,
    value,
    onInput,
    placeholder = "",
    hint = "",
    rows = 4
  }) {
    const wrap = document.createElement("label");
    wrap.className = "blog-builder-field";

    const heading = document.createElement("span");
    heading.className = "blog-builder-field-label";
    heading.textContent = label;
    wrap.appendChild(heading);

    const textarea = document.createElement("textarea");
    textarea.className = "input";
    textarea.rows = rows;
    textarea.value = value;
    if (placeholder) textarea.placeholder = placeholder;
    textarea.addEventListener("input", () => {
      onInput(textarea.value);
    });
    wrap.appendChild(textarea);

    if (hint) {
      const note = document.createElement("span");
      note.className = "fineprint";
      note.textContent = hint;
      wrap.appendChild(note);
    }

    return wrap;
  }

  function createBlogBuilderSelectField({
    label,
    value,
    options,
    onInput,
    hint = ""
  }) {
    const wrap = document.createElement("label");
    wrap.className = "blog-builder-field";

    const heading = document.createElement("span");
    heading.className = "blog-builder-field-label";
    heading.textContent = label;
    wrap.appendChild(heading);

    const select = document.createElement("select");
    select.className = "input";
    options.forEach((option) => {
      const el = document.createElement("option");
      el.value = option.value;
      el.textContent = option.label;
      if (option.value === value) el.selected = true;
      select.appendChild(el);
    });
    select.addEventListener("change", () => {
      onInput(select.value);
    });
    wrap.appendChild(select);

    if (hint) {
      const note = document.createElement("span");
      note.className = "fineprint";
      note.textContent = hint;
      wrap.appendChild(note);
    }

    return wrap;
  }

  function createBlogBuilderActionButton(text, className, onClick, disabled = false) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = text;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    return button;
  }

  function createBlogBuilderSectionNote(text) {
    const note = document.createElement("div");
    note.className = "fineprint";
    note.textContent = text;
    return note;
  }

  const BLOG_BUILDER_BUTTON_CLASSES = {
    add: "btn small warning",
    copy: "btn small primary",
    danger: "btn small danger",
    move: "btn small info",
    success: "btn small success"
  };

  function splitBlogBuilderLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => cleanText(line))
      .filter(Boolean);
  }

  function splitBlogBuilderCells(line) {
    const text = cleanText(line);
    if (!text) return [];
    const delimiter = text.includes("|") ? "|" : text.includes(",") ? "," : "";
    if (!delimiter) return [text];
    return text.split(delimiter).map((cell) => cleanText(cell));
  }

  function moveItemInList(list, fromIndex, delta) {
    const toIndex = fromIndex + delta;
    if (!Array.isArray(list)) return;
    if (toIndex < 0 || toIndex >= list.length) return;
    const [item] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, item);
  }

  function estimateBlogBuilderReadMinutes(rawPost) {
    const normalized = normalizeBlogPost({
      ...rawPost,
      id: cleanText(rawPost?.id) || "preview-post",
      title: cleanText(rawPost?.title) || "Untitled draft"
    });

    const text = [normalized?.summary || "", normalized?.content?.text || ""]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return null;

    const words = text.split(" ").filter(Boolean).length;
    if (!words) return null;
    return Math.max(1, Math.ceil(words / 220));
  }

  function serializeBlogBuilderTextFigure(figure, warnings, label) {
    if (!figure || typeof figure !== "object") return null;

    if (figure.type === "list") {
      const items = splitBlogBuilderLines(figure.itemsText);
      if (!items.length) {
        warnings.push(`${label}: empty list removed.`);
        return null;
      }
      return { type: "list", items };
    }

    const text = cleanText(figure.text);
    if (!text) {
      warnings.push(`${label}: empty paragraph removed.`);
      return null;
    }

    return { type: "paragraph", text };
  }

  function serializeBlogBuilderImageFigure(figure, warnings, label) {
    const src = normalizeImagePath(figure?.src);
    if (!src) {
      warnings.push(`${label}: image without a source was removed.`);
      return null;
    }

    const serialized = { src };
    const alt = cleanText(figure.alt);
    const caption = cleanText(figure.caption);
    const title = cleanText(figure.title);

    if (alt) serialized.alt = alt;
    if (caption) serialized.caption = caption;
    if (title) serialized.title = title;
    return serialized;
  }

  function serializeBlogBuilderSeriesData(text, warnings, label) {
    const data = [];
    splitBlogBuilderLines(text).forEach((line, lineIndex) => {
      const cells = splitBlogBuilderCells(line);
      if (cells.length < 2) {
        warnings.push(`${label}: line ${lineIndex + 1} needs "Label | Value".`);
        return;
      }

      const name = cleanText(cells[0]);
      const value = Number(cells[1]);
      if (!name || !Number.isFinite(value)) {
        warnings.push(`${label}: line ${lineIndex + 1} has invalid chart data.`);
        return;
      }

      data.push({ label: name, value });
    });
    return data;
  }

  function serializeBlogBuilderScatterPoints(text, warnings, label) {
    const points = [];
    splitBlogBuilderLines(text).forEach((line, lineIndex) => {
      const cells = splitBlogBuilderCells(line);
      if (cells.length < 2) {
        warnings.push(`${label}: line ${lineIndex + 1} needs at least X and Y.`);
        return;
      }

      let pointLabel = "";
      let x = Number.NaN;
      let y = Number.NaN;

      if (Number.isFinite(Number(cells[0])) && Number.isFinite(Number(cells[1]))) {
        x = Number(cells[0]);
        y = Number(cells[1]);
        pointLabel = cleanText(cells.slice(2).join(" | "));
      } else if (cells.length >= 3) {
        pointLabel = cleanText(cells[0]);
        x = Number(cells[1]);
        y = Number(cells[2]);
      }

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        warnings.push(`${label}: line ${lineIndex + 1} has invalid scatter data.`);
        return;
      }

      const point = { x, y };
      if (pointLabel) point.label = pointLabel;
      points.push(point);
    });
    return points;
  }

  function serializeBlogBuilderTableRows(text) {
    return splitBlogBuilderLines(text)
      .map((line) => splitBlogBuilderCells(line))
      .filter((row) => row.length);
  }

  function serializeBlogBuilderChartFigure(figure, warnings, label) {
    const chartType = normalizeBlogChartType(figure?.chartType);
    if (!chartType) {
      warnings.push(`${label}: unsupported chart type removed.`);
      return null;
    }

    const serialized = { chartType };
    const title = cleanText(figure.title);
    const description = cleanText(figure.description);
    const unit = cleanText(figure.unit);

    if (title) serialized.title = title;
    if (description) serialized.description = description;

    if (chartType === "table") {
      const columnLine = splitBlogBuilderLines(figure.columnsText)[0] || "";
      const columns = splitBlogBuilderCells(columnLine).filter(Boolean);
      const rows = serializeBlogBuilderTableRows(figure.rowsText);

      if (!columns.length || !rows.length) {
        warnings.push(`${label}: table needs columns and at least one row.`);
        return null;
      }

      serialized.columns = columns;
      serialized.rows = rows;
      return serialized;
    }

    if (chartType === "scatter") {
      const points = serializeBlogBuilderScatterPoints(figure.dataText, warnings, label);
      if (!points.length) {
        warnings.push(`${label}: scatter chart has no valid points.`);
        return null;
      }

      const xLabel = cleanText(figure.xLabel);
      const yLabel = cleanText(figure.yLabel);
      if (xLabel) serialized.xLabel = xLabel;
      if (yLabel) serialized.yLabel = yLabel;
      serialized.points = points;
      return serialized;
    }

    const data = serializeBlogBuilderSeriesData(figure.dataText, warnings, label);
    if (!data.length) {
      warnings.push(`${label}: chart has no valid rows.`);
      return null;
    }

    if (unit) serialized.unit = unit;
    if (chartType === "radar") {
      const max = Number(figure.max);
      if (Number.isFinite(max)) serialized.max = max;
    }

    serialized.data = data;
    return serialized;
  }

  function serializeBlogBuilderBigNumberFigure(figure, warnings, label) {
    const title = cleanText(figure?.title);
    const stat = cleanText(figure?.stat);
    const description = cleanText(figure?.description);

    if (!title && !stat && !description) {
      warnings.push(`${label}: empty stat removed.`);
      return null;
    }

    const serialized = {};
    if (title) serialized.title = title;
    if (stat) serialized.stat = stat;
    if (description) serialized.description = description;
    return serialized;
  }

  function serializeBlogBuilderQuoteFigure(figure, warnings, label) {
    const quote = cleanText(figure?.quote);
    if (!quote) {
      warnings.push(`${label}: empty quote removed.`);
      return null;
    }

    const serialized = { quote };
    const attribution = cleanText(figure.attribution);
    const role = cleanText(figure.role);
    if (attribution) serialized.attribution = attribution;
    if (role) serialized.role = role;
    return serialized;
  }

  function serializeBlogBuilderComparisonFigure(figure, warnings, label) {
    const title = cleanText(figure?.title);
    const description = cleanText(figure?.description);
    const tone = cleanText(figure?.tone).toLowerCase();
    const items = splitBlogBuilderLines(figure?.itemsText);

    if (!title && !description && !items.length) {
      warnings.push(`${label}: empty comparison column removed.`);
      return null;
    }

    const serialized = {};
    if (title) serialized.title = title;
    if (description) serialized.description = description;
    if (tone) serialized.tone = tone;
    if (items.length) serialized.items = items;
    return serialized;
  }

  function serializeBlogBuilderLinkFigure(figure, warnings, label) {
    const url = normalizeUrl(figure?.url);
    if (!url) {
      warnings.push(`${label}: link without a URL was removed.`);
      return null;
    }

    const serialized = { url };
    const title = cleanText(figure.label);
    const description = cleanText(figure.description);
    const site = cleanText(figure.site);
    if (title) serialized.label = title;
    if (description) serialized.description = description;
    if (site) serialized.site = site;
    return serialized;
  }

  function serializeBlogBuilderTimelineFigure(figure, warnings, label) {
    const time = cleanText(figure?.time);
    const title = cleanText(figure?.title);
    const description = cleanText(figure?.description);
    const image = serializeBlogBuilderImageFigure(
      {
        src: figure?.imageSrc,
        alt: figure?.imageAlt,
        caption: figure?.imageCaption,
        title: figure?.imageTitle
      },
      [],
      label
    );

    if (!time && !title && !description && !image) {
      warnings.push(`${label}: empty timeline item removed.`);
      return null;
    }

    const serialized = {};
    if (time) serialized.time = time;
    if (title) serialized.title = title;
    if (description) serialized.description = description;
    if (image) serialized.image = image;
    return serialized;
  }

  function serializeBlogBuilderQaFigure(figure, warnings, label) {
    const question = cleanText(figure?.question);
    const answer = cleanText(figure?.answer);

    if (!question || !answer) {
      warnings.push(`${label}: Q&A items need both a question and answer.`);
      return null;
    }

    return { question, answer };
  }

  function serializeBlogBuilderCard(card, index, warnings) {
    const cardLabel = `Card ${index + 1} (${getBlogBuilderCardTypeLabel(card?.type)})`;
    const title = cleanText(card?.title);
    const base = {
      type: card.type
    };
    if (title) base.title = title;

    if (card.type === "text") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderTextFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no content.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    if (card.type === "image") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderImageFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no images.`);
        return null;
      }

      base.layout = cleanText(card.layout || "single") || "single";
      base.figures = figures;
      return base;
    }

    if (card.type === "chart") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderChartFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no valid charts.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    if (card.type === "big-number") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderBigNumberFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no stats.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    if (card.type === "quote") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderQuoteFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no quotes.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    if (card.type === "comparison") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderComparisonFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no columns.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    if (card.type === "link-embed") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderLinkFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no links.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    if (card.type === "timeline") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderTimelineFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no timeline items.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    if (card.type === "qa") {
      const figures = (card.figures || [])
        .map((figure, figureIndex) =>
          serializeBlogBuilderQaFigure(
            figure,
            warnings,
            `${cardLabel} / ${getBlogBuilderFigureSummary(card, figure, figureIndex)}`
          )
        )
        .filter(Boolean);

      if (!figures.length) {
        warnings.push(`${cardLabel}: removed because it has no Q&A entries.`);
        return null;
      }

      base.figures = figures;
      return base;
    }

    warnings.push(`${cardLabel}: unsupported card type removed.`);
    return null;
  }

  function buildBlogBuilderPostObject(postState, { preview = false } = {}) {
    const warnings = [];
    const post = {
      id: cleanText(postState.id),
      visibility: Boolean(postState.visibility),
      title: cleanText(postState.title)
    };

    if (!post.id) warnings.push("Post ID is empty.");
    if (!post.title) warnings.push("Post title is empty.");

    const summary = cleanText(postState.summary);
    if (summary) {
      post.summary = summary;
    } else {
      warnings.push("Post summary is empty.");
    }

    const thumbnail = normalizeImagePath(postState.thumbnail);
    if (thumbnail) {
      post.images = { thumbnail };
    }

    const content = (postState.content || [])
      .map((card, index) => serializeBlogBuilderCard(card, index, warnings))
      .filter(Boolean);
    post.content = content;

    if (!content.length) warnings.push("Post content is empty.");

    const tags = String(postState.tags || "")
      .split(/[,\n]/)
      .map((tag) => cleanText(tag))
      .filter(Boolean);
    if (tags.length) post.tags = tags;

    const writtenAt = cleanText(postState.writtenAt);
    if (writtenAt) post.writtenAt = writtenAt;

    const updatedAt = cleanText(postState.updatedAt);
    if (updatedAt) post.updatedAt = updatedAt;

    const citations = (postState.citations || [])
      .map((citation, index) => {
        const url = normalizeUrl(citation?.url);
        const label = cleanText(citation?.label);

        if (!url) {
          if (label) warnings.push(`Citation ${index + 1}: missing URL.`);
          return null;
        }

        if (!label) return url;
        return { label, url };
      })
      .filter(Boolean);
    if (citations.length) post.citations = citations;

    const previewSeed = {
      ...post,
      id: post.id || "preview-post",
      title: post.title || "Untitled draft"
    };
    const estimatedReadMinutes = estimateBlogBuilderReadMinutes(previewSeed);

    if (postState.autoReadMinutes) {
      if (estimatedReadMinutes) post.readMinutes = estimatedReadMinutes;
    } else {
      const minutes = Number(postState.readMinutes);
      if (Number.isFinite(minutes) && minutes > 0) {
        post.readMinutes = Math.max(1, Math.round(minutes));
      } else if (cleanText(postState.readMinutes)) {
        warnings.push("Read time must be a positive number.");
      }
    }

    if (preview) {
      post.id = post.id || "preview-post";
      post.title = post.title || "Untitled draft";
    }

    return {
      post,
      warnings,
      estimatedReadMinutes
    };
  }

  function renderBlogBuilderWarnings(container, warnings) {
    if (!container) return;
    container.textContent = "";

    if (!warnings.length) {
      const ok = document.createElement("div");
      ok.className = "blog-builder-warning blog-builder-warning--ok";
      ok.textContent = "Export is clean.";
      container.appendChild(ok);
      return;
    }

    const title = document.createElement("div");
    title.className = "blog-builder-warning-heading";
    title.textContent = `${warnings.length} warning${warnings.length === 1 ? "" : "s"}`;
    container.appendChild(title);

    const list = document.createElement("ul");
    list.className = "blog-builder-warning-list";
    warnings.forEach((warning) => {
      const item = document.createElement("li");
      item.textContent = warning;
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  function renderBlogBuilderPreview(container, post) {
    if (!container) return;
    container.textContent = "";

    if (!post || !Array.isArray(post.content?.cards) || !post.content.cards.length) {
      renderMessageCard(
        container,
        "Preview unavailable",
        "Add at least one content card to render a post preview."
      );
      return;
    }

    const article = document.createElement("article");
    article.className = "card post-card post-page blog-builder-preview-article";
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

  async function loadRawBlogPostsForBuilder() {
    const response = await fetch("blog.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load blog.json (${response.status})`);
    }

    const data = await response.json();
    return Array.isArray(data?.posts) ? data.posts : [];
  }

  function initBlogBuilder(root) {
    if (!root) return;

    root.innerHTML = `
      <div class="blog-builder-shell">
        <section class="card blog-builder-output-card">
          <div class="section-header blog-builder-section-header">
            <div class="kicker">Export</div>
            <h2>Copyable post object</h2>
            <p>Paste this object directly into the <code>posts</code> array in <code>blog.json</code>.</p>
          </div>
          <label class="blog-builder-toggle">
            <input type="checkbox" data-builder-trailing-comma />
            <span>Append trailing comma</span>
          </label>
          <div class="blog-builder-warnings" data-builder-warnings></div>
          <textarea class="input blog-builder-output" rows="18" readonly data-builder-output></textarea>
          <div class="inline-links">
            <button class="${BLOG_BUILDER_BUTTON_CLASSES.copy}" type="button" data-builder-copy-output>
              Copy post object
            </button>
          </div>
        </section>

        <section class="card blog-builder-preview-card">
          <div class="section-header blog-builder-section-header">
            <div class="kicker">Preview</div>
            <h2>Live post preview</h2>
            <p>Rendered using the same blog card functions as the public post page.</p>
          </div>
          <div data-builder-preview></div>
        </section>

        <div class="blog-builder-main">
          <section class="card blog-builder-toolbar-card">
            <div class="section-header blog-builder-section-header">
              <div class="kicker">Workspace</div>
              <h2>Draft controls</h2>
              <p>Start a new draft or load an existing post from <code>blog.json</code>.</p>
            </div>
            <div class="blog-builder-toolbar-grid">
              <label class="blog-builder-field">
                <span class="blog-builder-field-label">Load existing post</span>
                <select class="input" data-builder-source-select>
                  <option value="">New draft</option>
                </select>
              </label>
              <div class="blog-builder-toolbar-actions">
                <button class="btn small secondary" type="button" data-builder-new>
                  New draft
                </button>
              </div>
            </div>
            <div class="fineprint" data-builder-source-status>Loading blog.json…</div>
            <div class="blog-builder-stats" data-builder-stats></div>
          </section>

          <section class="card">
            <div class="section-header blog-builder-section-header">
              <div class="kicker">Metadata</div>
              <h2>Post settings</h2>
              <p>These fields become the top-level post object in <code>blog.json</code>.</p>
            </div>

            <div class="blog-builder-form">
              <label class="blog-builder-toggle">
                <input type="checkbox" data-builder-visibility />
                <span>Visible on the site</span>
              </label>

              <div class="form-row">
                <label class="blog-builder-field">
                  <span class="blog-builder-field-label">Post ID</span>
                  <input class="input" type="text" data-builder-id placeholder="my-post-id" />
                  <span class="fineprint">Used in <code>post.html?id=...</code>.</span>
                </label>
                <label class="blog-builder-field">
                  <span class="blog-builder-field-label">Written date</span>
                  <input class="input" type="date" data-builder-written-at />
                </label>
              </div>

              <label class="blog-builder-field">
                <span class="blog-builder-field-label">Title</span>
                <input class="input" type="text" data-builder-title placeholder="Post title" />
              </label>

              <label class="blog-builder-field">
                <span class="blog-builder-field-label">Summary</span>
                <textarea class="input" rows="4" data-builder-summary placeholder="Short summary for the blog listing."></textarea>
              </label>

              <div class="form-row">
                <label class="blog-builder-field">
                  <span class="blog-builder-field-label">Thumbnail path</span>
                  <input class="input" type="text" data-builder-thumbnail placeholder="images/blog/my-post/thumbnail.png" />
                </label>
                <label class="blog-builder-field">
                  <span class="blog-builder-field-label">Tags</span>
                  <input class="input" type="text" data-builder-tags placeholder="robots, hackathons, websites" />
                  <span class="fineprint">Separate with commas.</span>
                </label>
              </div>

              <div class="form-row">
                <label class="blog-builder-field">
                  <span class="blog-builder-field-label">Updated date</span>
                  <input class="input" type="date" data-builder-updated-at />
                </label>
                <label class="blog-builder-field">
                  <span class="blog-builder-field-label">Read minutes</span>
                  <input class="input" type="number" min="1" step="1" data-builder-read-minutes placeholder="Auto" />
                  <span class="fineprint" data-builder-read-minutes-note></span>
                </label>
              </div>

              <label class="blog-builder-toggle">
                <input type="checkbox" data-builder-auto-minutes />
                <span>Auto-calculate read time from the draft text</span>
              </label>

              <div class="blog-builder-subsection">
                <div class="blog-builder-subsection-header">
                  <h3>Citations</h3>
                  <button class="${BLOG_BUILDER_BUTTON_CLASSES.add}" type="button" data-builder-add-citation>
                    Add citation
                  </button>
                </div>
                <div class="blog-builder-citations" data-builder-citations></div>
              </div>
            </div>
          </section>

          <section class="blog-builder-cards-panel">
            <div class="section-header blog-builder-section-header">
              <div class="kicker">Content</div>
              <h2>Post cards</h2>
              <p>Add the same card types that the live blog renderer already supports.</p>
            </div>
            <div class="blog-builder-add-tray" data-builder-add-tray></div>
            <div class="blog-builder-card-stack" data-builder-cards></div>
          </section>
        </div>
      </div>
    `;

    const refs = {
      sourceSelect: root.querySelector("[data-builder-source-select]"),
      sourceStatus: root.querySelector("[data-builder-source-status]"),
      stats: root.querySelector("[data-builder-stats]"),
      newButton: root.querySelector("[data-builder-new]"),
      visibility: root.querySelector("[data-builder-visibility]"),
      id: root.querySelector("[data-builder-id]"),
      title: root.querySelector("[data-builder-title]"),
      summary: root.querySelector("[data-builder-summary]"),
      thumbnail: root.querySelector("[data-builder-thumbnail]"),
      tags: root.querySelector("[data-builder-tags]"),
      writtenAt: root.querySelector("[data-builder-written-at]"),
      updatedAt: root.querySelector("[data-builder-updated-at]"),
      readMinutes: root.querySelector("[data-builder-read-minutes]"),
      readMinutesNote: root.querySelector("[data-builder-read-minutes-note]"),
      autoMinutes: root.querySelector("[data-builder-auto-minutes]"),
      citations: root.querySelector("[data-builder-citations]"),
      addCitation: root.querySelector("[data-builder-add-citation]"),
      addTray: root.querySelector("[data-builder-add-tray]"),
      cards: root.querySelector("[data-builder-cards]"),
      trailingComma: root.querySelector("[data-builder-trailing-comma]"),
      warnings: root.querySelector("[data-builder-warnings]"),
      output: root.querySelector("[data-builder-output]"),
      copyOutput: root.querySelector("[data-builder-copy-output]"),
      preview: root.querySelector("[data-builder-preview]")
    };

    const state = {
      post: createEmptyBlogBuilderPost(),
      appendTrailingComma: false,
      selectedSourceId: "",
      availablePosts: []
    };

    function syncFormValues() {
      refs.visibility.checked = state.post.visibility;
      refs.id.value = state.post.id;
      refs.title.value = state.post.title;
      refs.summary.value = state.post.summary;
      refs.thumbnail.value = state.post.thumbnail;
      refs.tags.value = state.post.tags;
      refs.writtenAt.value = state.post.writtenAt;
      refs.updatedAt.value = state.post.updatedAt;
      refs.readMinutes.value = state.post.readMinutes;
      refs.autoMinutes.checked = state.post.autoReadMinutes;
      refs.readMinutes.disabled = state.post.autoReadMinutes;
      refs.sourceSelect.value = state.selectedSourceId;

      refs.citations.textContent = "";
      if (!state.post.citations.length) {
        refs.citations.appendChild(
          createBlogBuilderSectionNote("No citations yet. Add URLs or labeled references here.")
        );
      } else {
        state.post.citations.forEach((citation, index) => {
          const row = document.createElement("div");
          row.className = "blog-builder-citation-row";

          const fields = document.createElement("div");
          fields.className = "form-row";

          fields.appendChild(
            createBlogBuilderInputField({
              label: `Citation ${index + 1} label`,
              value: citation.label,
              placeholder: "Optional label",
              onInput: (value) => {
                citation.label = value;
                updateDerived();
              }
            })
          );

          fields.appendChild(
            createBlogBuilderInputField({
              label: `Citation ${index + 1} URL`,
              value: citation.url,
              placeholder: "https://example.com",
              onInput: (value) => {
                citation.url = value;
                updateDerived();
              }
            })
          );

          row.appendChild(fields);

          const actions = document.createElement("div");
          actions.className = "blog-builder-mini-actions";
          actions.appendChild(
            createBlogBuilderActionButton("Remove", BLOG_BUILDER_BUTTON_CLASSES.danger, () => {
              state.post.citations.splice(index, 1);
              syncFormValues();
              updateDerived();
            })
          );
          row.appendChild(actions);

          refs.citations.appendChild(row);
        });
      }
    }

    function renderAddTray() {
      refs.addTray.textContent = "";

      [
        "text",
        "image",
        "chart",
        "big-number",
        "quote",
        "comparison",
        "link-embed",
        "timeline",
        "qa"
      ].forEach((type) => {
        refs.addTray.appendChild(
          createBlogBuilderActionButton(
            `Add ${getBlogBuilderCardTypeLabel(type)}`,
            BLOG_BUILDER_BUTTON_CLASSES.add,
            () => {
              state.post.content.push(createBlogBuilderCard(type));
              renderCards();
              updateDerived();
            }
          )
        );
      });
    }

    function renderFigureEditor(card, figure, figureIndex) {
      const wrap = document.createElement("article");
      wrap.className = "blog-builder-figure";

      const header = document.createElement("div");
      header.className = "blog-builder-figure-header";

      const title = document.createElement("div");
      title.className = "blog-builder-figure-title";
      title.textContent = getBlogBuilderFigureSummary(card, figure, figureIndex);
      header.appendChild(title);

      const actions = document.createElement("div");
      actions.className = "blog-builder-mini-actions";
      actions.appendChild(
        createBlogBuilderActionButton("Up", BLOG_BUILDER_BUTTON_CLASSES.move, () => {
          moveItemInList(card.figures, figureIndex, -1);
          renderCards();
          updateDerived();
        }, figureIndex === 0)
      );
      actions.appendChild(
        createBlogBuilderActionButton(
          "Down",
          BLOG_BUILDER_BUTTON_CLASSES.move,
          () => {
            moveItemInList(card.figures, figureIndex, 1);
            renderCards();
            updateDerived();
          },
          figureIndex === card.figures.length - 1
        )
      );
      actions.appendChild(
        createBlogBuilderActionButton("Remove", BLOG_BUILDER_BUTTON_CLASSES.danger, () => {
          card.figures.splice(figureIndex, 1);
          renderCards();
          updateDerived();
        })
      );
      header.appendChild(actions);
      wrap.appendChild(header);

      if (card.type === "text") {
        wrap.appendChild(
          createBlogBuilderSelectField({
            label: "Figure type",
            value: figure.type,
            options: [
              { value: "paragraph", label: "Paragraph" },
              { value: "list", label: "List" }
            ],
            onInput: (value) => {
              figure.type = value;
              renderCards();
              updateDerived();
            }
          })
        );

        if (figure.type === "list") {
          wrap.appendChild(
            createBlogBuilderTextareaField({
              label: "List items",
              value: figure.itemsText,
              rows: 4,
              placeholder: "One bullet per line",
              onInput: (value) => {
                figure.itemsText = value;
                updateDerived();
              }
            })
          );
        } else {
          wrap.appendChild(
            createBlogBuilderTextareaField({
              label: "Paragraph text",
              value: figure.text,
              rows: 5,
              placeholder: "Write the paragraph here",
              onInput: (value) => {
                figure.text = value;
                updateDerived();
              }
            })
          );
        }

        return wrap;
      }

      if (card.type === "image") {
        const rowOne = document.createElement("div");
        rowOne.className = "form-row";
        rowOne.appendChild(
          createBlogBuilderInputField({
            label: "Image path",
            value: figure.src,
            placeholder: "images/blog/my-post/image.png",
            onInput: (value) => {
              figure.src = value;
              updateDerived();
            }
          })
        );
        rowOne.appendChild(
          createBlogBuilderInputField({
            label: "Alt text",
            value: figure.alt,
            placeholder: "Describe the image",
            onInput: (value) => {
              figure.alt = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(rowOne);

        const rowTwo = document.createElement("div");
        rowTwo.className = "form-row";
        rowTwo.appendChild(
          createBlogBuilderInputField({
            label: "Caption title",
            value: figure.title,
            placeholder: "Optional short title",
            onInput: (value) => {
              figure.title = value;
              updateDerived();
            }
          })
        );
        rowTwo.appendChild(
          createBlogBuilderTextareaField({
            label: "Caption",
            value: figure.caption,
            rows: 3,
            placeholder: "Optional caption",
            onInput: (value) => {
              figure.caption = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(rowTwo);
        return wrap;
      }

      if (card.type === "chart") {
        wrap.appendChild(
          createBlogBuilderSelectField({
            label: "Chart type",
            value: figure.chartType,
            options: [
              { value: "bar", label: "Bar" },
              { value: "line", label: "Line" },
              { value: "pie", label: "Pie" },
              { value: "scatter", label: "Scatter" },
              { value: "table", label: "Table" },
              { value: "radar", label: "Radar" }
            ],
            onInput: (value) => {
              figure.chartType = value;
              renderCards();
              updateDerived();
            }
          })
        );

        const rowOne = document.createElement("div");
        rowOne.className = "form-row";
        rowOne.appendChild(
          createBlogBuilderInputField({
            label: "Figure title",
            value: figure.title,
            placeholder: "Optional chart title",
            onInput: (value) => {
              figure.title = value;
              updateDerived();
            }
          })
        );
        rowOne.appendChild(
          createBlogBuilderTextareaField({
            label: "Description",
            value: figure.description,
            rows: 3,
            placeholder: "Optional chart description",
            onInput: (value) => {
              figure.description = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(rowOne);

        if (figure.chartType === "table") {
          wrap.appendChild(
            createBlogBuilderInputField({
              label: "Columns",
              value: figure.columnsText,
              placeholder: "Column A | Column B | Column C",
              hint: "Use pipes or commas between column names.",
              onInput: (value) => {
                figure.columnsText = value;
                updateDerived();
              }
            })
          );
          wrap.appendChild(
            createBlogBuilderTextareaField({
              label: "Rows",
              value: figure.rowsText,
              rows: 5,
              placeholder: "Value A1 | Value B1 | Value C1",
              hint: "One table row per line.",
              onInput: (value) => {
                figure.rowsText = value;
                updateDerived();
              }
            })
          );
          return wrap;
        }

        if (figure.chartType === "scatter") {
          const axisRow = document.createElement("div");
          axisRow.className = "form-row";
          axisRow.appendChild(
            createBlogBuilderInputField({
              label: "X axis label",
              value: figure.xLabel,
              placeholder: "Latency (ms)",
              onInput: (value) => {
                figure.xLabel = value;
                updateDerived();
              }
            })
          );
          axisRow.appendChild(
            createBlogBuilderInputField({
              label: "Y axis label",
              value: figure.yLabel,
              placeholder: "Signup rate (%)",
              onInput: (value) => {
                figure.yLabel = value;
                updateDerived();
              }
            })
          );
          wrap.appendChild(axisRow);
          wrap.appendChild(
            createBlogBuilderTextareaField({
              label: "Points",
              value: figure.dataText,
              rows: 5,
              placeholder: "A | 120 | 4.8",
              hint:
                "Use either “Label | X | Y” or “X | Y | Label” on each line.",
              onInput: (value) => {
                figure.dataText = value;
                updateDerived();
              }
            })
          );
          return wrap;
        }

        const dataRow = document.createElement("div");
        dataRow.className = "form-row";
        dataRow.appendChild(
          createBlogBuilderInputField({
            label: "Unit",
            value: figure.unit,
            placeholder: "% or ms",
            onInput: (value) => {
              figure.unit = value;
              updateDerived();
            }
          })
        );

        if (figure.chartType === "radar") {
          dataRow.appendChild(
            createBlogBuilderInputField({
              label: "Max value",
              value: figure.max,
              type: "number",
              min: "0",
              step: "any",
              placeholder: "10",
              onInput: (value) => {
                figure.max = value;
                updateDerived();
              }
            })
          );
        }

        wrap.appendChild(dataRow);
        wrap.appendChild(
          createBlogBuilderTextareaField({
            label: "Data",
            value: figure.dataText,
            rows: 5,
            placeholder: "Label | 42",
            hint: "One data point per line.",
            onInput: (value) => {
              figure.dataText = value;
              updateDerived();
            }
          })
        );
        return wrap;
      }

      if (card.type === "big-number") {
        const row = document.createElement("div");
        row.className = "form-row";
        row.appendChild(
          createBlogBuilderInputField({
            label: "Title",
            value: figure.title,
            placeholder: "Builds shipped",
            onInput: (value) => {
              figure.title = value;
              updateDerived();
            }
          })
        );
        row.appendChild(
          createBlogBuilderInputField({
            label: "Stat",
            value: figure.stat,
            placeholder: "128",
            onInput: (value) => {
              figure.stat = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(row);
        wrap.appendChild(
          createBlogBuilderTextareaField({
            label: "Description",
            value: figure.description,
            rows: 3,
            placeholder: "Explain what the number means",
            onInput: (value) => {
              figure.description = value;
              updateDerived();
            }
          })
        );
        return wrap;
      }

      if (card.type === "quote") {
        wrap.appendChild(
          createBlogBuilderTextareaField({
            label: "Quote",
            value: figure.quote,
            rows: 4,
            placeholder: "Quote text",
            onInput: (value) => {
              figure.quote = value;
              updateDerived();
            }
          })
        );
        const row = document.createElement("div");
        row.className = "form-row";
        row.appendChild(
          createBlogBuilderInputField({
            label: "Attribution",
            value: figure.attribution,
            placeholder: "Name",
            onInput: (value) => {
              figure.attribution = value;
              updateDerived();
            }
          })
        );
        row.appendChild(
          createBlogBuilderInputField({
            label: "Role",
            value: figure.role,
            placeholder: "Role or source",
            onInput: (value) => {
              figure.role = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(row);
        return wrap;
      }

      if (card.type === "comparison") {
        const row = document.createElement("div");
        row.className = "form-row";
        row.appendChild(
          createBlogBuilderInputField({
            label: "Column title",
            value: figure.title,
            placeholder: "Option A",
            onInput: (value) => {
              figure.title = value;
              updateDerived();
            }
          })
        );
        row.appendChild(
          createBlogBuilderSelectField({
            label: "Tone",
            value: figure.tone,
            options: [
              { value: "", label: "Neutral" },
              { value: "positive", label: "Positive" },
              { value: "warn", label: "Warn" }
            ],
            onInput: (value) => {
              figure.tone = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(row);
        wrap.appendChild(
          createBlogBuilderTextareaField({
            label: "Heading note",
            value: figure.description,
            rows: 3,
            placeholder: "Optional note under the column heading",
            onInput: (value) => {
              figure.description = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(
          createBlogBuilderTextareaField({
            label: "Lines",
            value: figure.itemsText,
            rows: 5,
            placeholder: "One comparison point per line",
            onInput: (value) => {
              figure.itemsText = value;
              updateDerived();
            }
          })
        );
        return wrap;
      }

      if (card.type === "link-embed") {
        const row = document.createElement("div");
        row.className = "form-row";
        row.appendChild(
          createBlogBuilderInputField({
            label: "URL",
            value: figure.url,
            placeholder: "https://example.com",
            onInput: (value) => {
              figure.url = value;
              updateDerived();
            }
          })
        );
        row.appendChild(
          createBlogBuilderInputField({
            label: "Label",
            value: figure.label,
            placeholder: "Site name",
            onInput: (value) => {
              figure.label = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(row);
        const rowTwo = document.createElement("div");
        rowTwo.className = "form-row";
        rowTwo.appendChild(
          createBlogBuilderInputField({
            label: "Site label",
            value: figure.site,
            placeholder: "Community",
            onInput: (value) => {
              figure.site = value;
              updateDerived();
            }
          })
        );
        rowTwo.appendChild(
          createBlogBuilderTextareaField({
            label: "Description",
            value: figure.description,
            rows: 3,
            placeholder: "Short explanation",
            onInput: (value) => {
              figure.description = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(rowTwo);
        return wrap;
      }

      if (card.type === "timeline") {
        const row = document.createElement("div");
        row.className = "form-row";
        row.appendChild(
          createBlogBuilderInputField({
            label: "Time",
            value: figure.time,
            placeholder: "09:00",
            onInput: (value) => {
              figure.time = value;
              updateDerived();
            }
          })
        );
        row.appendChild(
          createBlogBuilderInputField({
            label: "Title",
            value: figure.title,
            placeholder: "Kickoff",
            onInput: (value) => {
              figure.title = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(row);
        wrap.appendChild(
          createBlogBuilderTextareaField({
            label: "Description",
            value: figure.description,
            rows: 4,
            placeholder: "Timeline description",
            onInput: (value) => {
              figure.description = value;
              updateDerived();
            }
          })
        );

        const imageRow = document.createElement("div");
        imageRow.className = "form-row";
        imageRow.appendChild(
          createBlogBuilderInputField({
            label: "Image path",
            value: figure.imageSrc,
            placeholder: "images/blog/my-post/image.png",
            onInput: (value) => {
              figure.imageSrc = value;
              updateDerived();
            }
          })
        );
        imageRow.appendChild(
          createBlogBuilderInputField({
            label: "Image alt",
            value: figure.imageAlt,
            placeholder: "Describe the image",
            onInput: (value) => {
              figure.imageAlt = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(imageRow);

        const imageMetaRow = document.createElement("div");
        imageMetaRow.className = "form-row";
        imageMetaRow.appendChild(
          createBlogBuilderInputField({
            label: "Image title",
            value: figure.imageTitle,
            placeholder: "Optional image title",
            onInput: (value) => {
              figure.imageTitle = value;
              updateDerived();
            }
          })
        );
        imageMetaRow.appendChild(
          createBlogBuilderTextareaField({
            label: "Image caption",
            value: figure.imageCaption,
            rows: 3,
            placeholder: "Optional image caption",
            onInput: (value) => {
              figure.imageCaption = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(imageMetaRow);
        return wrap;
      }

      if (card.type === "qa") {
        wrap.appendChild(
          createBlogBuilderInputField({
            label: "Question",
            value: figure.question,
            placeholder: "What happened next?",
            onInput: (value) => {
              figure.question = value;
              updateDerived();
            }
          })
        );
        wrap.appendChild(
          createBlogBuilderTextareaField({
            label: "Answer",
            value: figure.answer,
            rows: 4,
            placeholder: "Answer text",
            onInput: (value) => {
              figure.answer = value;
              updateDerived();
            }
          })
        );
      }

      return wrap;
    }

    function renderCards() {
      refs.cards.textContent = "";

      if (!state.post.content.length) {
        const empty = document.createElement("div");
        empty.className = "card blog-builder-empty";
        const title = document.createElement("h3");
        title.textContent = "No cards yet";
        const body = document.createElement("p");
        body.textContent = "Use the buttons above to add the first section of the post.";
        empty.append(title, body);
        refs.cards.appendChild(empty);
        return;
      }

      state.post.content.forEach((card, cardIndex) => {
        const details = document.createElement("details");
        details.className = "blog-builder-card";
        details.open = true;

        const summary = document.createElement("summary");
        summary.textContent = getBlogBuilderCardSummary(card, cardIndex);
        details.appendChild(summary);

        const body = document.createElement("div");
        body.className = "blog-builder-card-body";

        const tools = document.createElement("div");
        tools.className = "blog-builder-card-tools";
        tools.appendChild(
          createBlogBuilderActionButton("Up", BLOG_BUILDER_BUTTON_CLASSES.move, () => {
            moveItemInList(state.post.content, cardIndex, -1);
            renderCards();
            updateDerived();
          }, cardIndex === 0)
        );
        tools.appendChild(
          createBlogBuilderActionButton("Down", BLOG_BUILDER_BUTTON_CLASSES.move, () => {
            moveItemInList(state.post.content, cardIndex, 1);
            renderCards();
            updateDerived();
          }, cardIndex === state.post.content.length - 1)
        );
        tools.appendChild(
          createBlogBuilderActionButton("Duplicate", BLOG_BUILDER_BUTTON_CLASSES.success, () => {
            state.post.content.splice(cardIndex + 1, 0, cloneBlogBuilderCard(card));
            renderCards();
            updateDerived();
          })
        );
        tools.appendChild(
          createBlogBuilderActionButton("Delete", BLOG_BUILDER_BUTTON_CLASSES.danger, () => {
            state.post.content.splice(cardIndex, 1);
            renderCards();
            updateDerived();
          })
        );
        body.appendChild(tools);

        const titleField = createBlogBuilderInputField({
          label: "Card title",
          value: card.title,
          placeholder: `Optional ${getBlogBuilderCardTypeLabel(card.type)} heading`,
          onInput: (value) => {
            card.title = value;
            updateDerived();
          }
        });
        body.appendChild(titleField);

        if (card.type === "image") {
          body.appendChild(
            createBlogBuilderSelectField({
              label: "Layout",
              value: card.layout,
              options: [
                { value: "single", label: "Single" },
                { value: "grid", label: "Grid" },
                { value: "carousel", label: "Carousel" }
              ],
              onInput: (value) => {
                card.layout = value;
                updateDerived();
              }
            })
          );
        }

        const figures = document.createElement("div");
        figures.className = "blog-builder-figure-stack";
        card.figures.forEach((figure, figureIndex) => {
          figures.appendChild(renderFigureEditor(card, figure, figureIndex));
        });
        body.appendChild(figures);

        const addActions = document.createElement("div");
        addActions.className = "blog-builder-card-tools";

        if (card.type === "text") {
          addActions.appendChild(
            createBlogBuilderActionButton(
              "Add paragraph",
              BLOG_BUILDER_BUTTON_CLASSES.add,
              () => {
                card.figures.push(createBlogBuilderTextFigure("paragraph"));
                renderCards();
                updateDerived();
              }
            )
          );
          addActions.appendChild(
            createBlogBuilderActionButton("Add list", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderTextFigure("list"));
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "image") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add image", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderImageFigure());
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "chart") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add chart", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderChartFigure("bar"));
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "big-number") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add stat", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderBigNumberFigure());
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "quote") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add quote", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderQuoteFigure());
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "comparison") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add column", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderComparisonFigure());
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "link-embed") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add link", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderLinkFigure());
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "timeline") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add moment", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderTimelineFigure());
              renderCards();
              updateDerived();
            })
          );
        } else if (card.type === "qa") {
          addActions.appendChild(
            createBlogBuilderActionButton("Add Q&A", BLOG_BUILDER_BUTTON_CLASSES.add, () => {
              card.figures.push(createBlogBuilderQaFigure());
              renderCards();
              updateDerived();
            })
          );
        }

        body.appendChild(addActions);
        details.appendChild(body);
        refs.cards.appendChild(details);
      });
    }

    function updateDerived() {
      const exportState = buildBlogBuilderPostObject(state.post);
      const formatted = JSON.stringify(exportState.post, null, 2);
      refs.output.value = state.appendTrailingComma ? `${formatted},` : formatted;
      renderBlogBuilderWarnings(refs.warnings, exportState.warnings);

      const previewPost = normalizeBlogPost({
        ...exportState.post,
        id: exportState.post.id || "preview-post",
        title: exportState.post.title || "Untitled draft"
      });
      renderBlogBuilderPreview(refs.preview, previewPost);

      const cardCount = state.post.content.length;
      const figureCount = state.post.content.reduce(
        (total, card) => total + (Array.isArray(card.figures) ? card.figures.length : 0),
        0
      );
      const minuteText = exportState.estimatedReadMinutes
        ? `${exportState.estimatedReadMinutes} min estimated`
        : "Read time unavailable";
      refs.stats.textContent = `${cardCount} card${cardCount === 1 ? "" : "s"}, ${figureCount} figure${
        figureCount === 1 ? "" : "s"
      }, ${minuteText}.`;
      refs.readMinutesNote.textContent = state.post.autoReadMinutes
        ? exportState.estimatedReadMinutes
          ? `Auto: ${exportState.estimatedReadMinutes} minute${
              exportState.estimatedReadMinutes === 1 ? "" : "s"
            }.`
          : "Auto-calc needs more text."
        : "Manual override is enabled.";
    }

    refs.visibility.addEventListener("change", () => {
      state.post.visibility = refs.visibility.checked;
      updateDerived();
    });
    refs.id.addEventListener("input", () => {
      state.post.id = refs.id.value;
      updateDerived();
    });
    refs.title.addEventListener("input", () => {
      state.post.title = refs.title.value;
      updateDerived();
    });
    refs.summary.addEventListener("input", () => {
      state.post.summary = refs.summary.value;
      updateDerived();
    });
    refs.thumbnail.addEventListener("input", () => {
      state.post.thumbnail = refs.thumbnail.value;
      updateDerived();
    });
    refs.tags.addEventListener("input", () => {
      state.post.tags = refs.tags.value;
      updateDerived();
    });
    refs.writtenAt.addEventListener("input", () => {
      state.post.writtenAt = refs.writtenAt.value;
      updateDerived();
    });
    refs.updatedAt.addEventListener("input", () => {
      state.post.updatedAt = refs.updatedAt.value;
      updateDerived();
    });
    refs.readMinutes.addEventListener("input", () => {
      state.post.readMinutes = refs.readMinutes.value;
      updateDerived();
    });
    refs.autoMinutes.addEventListener("change", () => {
      state.post.autoReadMinutes = refs.autoMinutes.checked;
      refs.readMinutes.disabled = state.post.autoReadMinutes;
      updateDerived();
    });
    refs.addCitation.addEventListener("click", () => {
      state.post.citations.push(createBlogBuilderCitation());
      syncFormValues();
      updateDerived();
    });
    refs.trailingComma.addEventListener("change", () => {
      state.appendTrailingComma = refs.trailingComma.checked;
      updateDerived();
    });
    refs.copyOutput.addEventListener("click", () => {
      copyToClipboard(refs.output.value);
    });
    refs.newButton.addEventListener("click", () => {
      state.post = createEmptyBlogBuilderPost();
      state.selectedSourceId = "";
      syncFormValues();
      renderCards();
      updateDerived();
    });
    refs.sourceSelect.addEventListener("change", () => {
      const selectedId = refs.sourceSelect.value;
      state.selectedSourceId = selectedId;
      if (!selectedId) {
        state.post = createEmptyBlogBuilderPost();
      } else {
        const raw = state.availablePosts.find((post) => String(post?.id || "") === selectedId);
        state.post = raw ? createBlogBuilderPostFromRaw(raw) : createEmptyBlogBuilderPost();
      }
      syncFormValues();
      renderCards();
      updateDerived();
    });

    renderAddTray();
    syncFormValues();
    renderCards();
    updateDerived();

    loadRawBlogPostsForBuilder()
      .then((posts) => {
        state.availablePosts = posts.filter((post) => cleanText(post?.id) && cleanText(post?.title));
        refs.sourceSelect.textContent = "";

        const blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "New draft";
        refs.sourceSelect.appendChild(blank);

        state.availablePosts.forEach((post) => {
          const option = document.createElement("option");
          option.value = cleanText(post.id);
          option.textContent = `${cleanText(post.title)} (${cleanText(post.id)})`;
          refs.sourceSelect.appendChild(option);
        });

        refs.sourceStatus.textContent = `Loaded ${state.availablePosts.length} post${
          state.availablePosts.length === 1 ? "" : "s"
        } from blog.json.`;
      })
      .catch(() => {
        refs.sourceStatus.textContent =
          "Couldn’t load blog.json. The builder still works for new drafts if you run a local server.";
      });
  }

  if (blogBuilderRoot) {
    initBlogBuilder(blogBuilderRoot);
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

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (typeof contactForm.reportValidity === "function" && !contactForm.reportValidity()) {
        return;
      }

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

      const endpoint = String(contactForm.getAttribute("action") || "").trim();
      if (!endpoint) {
        toast("Contact form is misconfigured. Please email info@magmalabs.dev.");
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.textContent : "";
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
      }
      contactForm.setAttribute("aria-busy", "true");

      const payload = new URLSearchParams();
      payload.set("name", name);
      payload.set("email", email);
      payload.set("message", message);
      payload.set("page", window.location.href);

      try {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          body: payload
        });

        contactForm.reset();
        if (emailInput instanceof HTMLInputElement) emailInput.value = email;
        toast("Message sent! We’ll get back within 1 business day.");
      } catch {
        toast("Couldn’t send right now. Please email info@magmalabs.dev.");
      } finally {
        contactForm.removeAttribute("aria-busy");
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel || "Send message";
        }
      }
    });
  }
})();
