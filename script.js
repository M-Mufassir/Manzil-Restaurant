document.documentElement.classList.add("js");

const ready = (fn) => {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

ready(() => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const desktopNav = window.matchMedia("(min-width: 921px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopCarousel = window.matchMedia("(min-width: 761px)");
  const watchMedia = (query, handler) => {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handler);
    } else if (typeof query.addListener === "function") {
      query.addListener(handler);
    }
  };

  const closeNav = () => {
    if (!navToggle) {
      return;
    }

    body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const shouldOpen = navToggle.getAttribute("aria-expanded") !== "true";
      body.classList.toggle("nav-open", shouldOpen);
      navToggle.setAttribute("aria-expanded", String(shouldOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.closest("a")) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (
        !body.classList.contains("nav-open") ||
        !(target instanceof HTMLElement) ||
        target.closest(".site-nav") ||
        target.closest(".nav-toggle")
      ) {
        return;
      }

      closeNav();
    });

    watchMedia(desktopNav, (event) => {
      if (event.matches) {
        closeNav();
      }
    });
  }

  const syncHeader = () => {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 10);
    }
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId.length < 2) {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  const animated = document.querySelectorAll("[data-animate]");
  if (animated.length) {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      animated.forEach((element) => element.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
      );

      animated.forEach((element) => observer.observe(element));
    }
  }

  const carousel = document.querySelector(".carousel");
  if (carousel) {
    const track = carousel.querySelector(".carousel-track");
    const items = Array.from(carousel.querySelectorAll(".carousel-item"));
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");
    let index = 0;

    const applyCarouselPosition = () => {
      if (!track) {
        return;
      }

      if (desktopCarousel.matches) {
        track.style.transform = `translateX(-${index * 100}%)`;
      } else {
        track.style.transform = "";
      }
    };

    const showSlide = (nextIndex) => {
      if (!items.length) {
        return;
      }

      index = (nextIndex + items.length) % items.length;
      applyCarouselPosition();

      if (!desktopCarousel.matches) {
        items[index].scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
          inline: "start",
          block: "nearest",
        });
      }
    };

    prevBtn?.addEventListener("click", () => showSlide(index - 1));
    nextBtn?.addEventListener("click", () => showSlide(index + 1));
    watchMedia(desktopCarousel, applyCarouselPosition);
  }

  const filterButtons = document.querySelectorAll(".filter-btn");
  const menuCards = document.querySelectorAll(".menu-card");
  if (filterButtons.length && menuCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        menuCards.forEach((card) => {
          const categories = card.dataset.category ? card.dataset.category.split(" ") : [];
          card.hidden = !(filter === "all" || categories.includes(filter));
        });
      });
    });
  }
});
