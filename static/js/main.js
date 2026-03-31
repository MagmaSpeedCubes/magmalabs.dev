const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const formatValue = (value) => {
  const rounded = value.toFixed(2);
  return rounded.replace(/\.?0+$/, "");
};

const animateCount = (element) => {
  const target = parseFloat(element.dataset.count || "0");
  const suffix = element.dataset.suffix || "";
  const duration = prefersReducedMotion ? 0 : 1200;
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
    const current = target * progress;
    element.textContent = `${formatValue(current)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = `${formatValue(target)}${suffix}`;
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const valueEl = entry.target.querySelector(".metric-value, .stat-value") || entry.target;
        animateCount(valueEl);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

const counters = document.querySelectorAll("[data-count]");
counters.forEach((counter) => counterObserver.observe(counter));

const menuToggle = document.getElementById("menuToggle");
const mobilePanel = document.getElementById("mobilePanel");

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

mobilePanel?.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) {
    closeMenu();
  }
});
