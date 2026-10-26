/* =========================================
   LinguaWave Header Functionality
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;

    const menuToggle = document.querySelector(".lw-menu-toggle");
    const mobileMenu = document.querySelector(".lw-mobile-menu");

    const themeButtons = document.querySelectorAll(".lw-theme-toggle");
    const rtlButtons = document.querySelectorAll(".lw-rtl-toggle");

    const allNavLinks = document.querySelectorAll(
        ".lw-desktop-nav .lw-nav-link, .lw-mobile-nav .lw-nav-link"
    );

    /* =====================================
       Theme: Light / Dark
    ===================================== */

    function applyTheme(theme) {
        const isDark = theme === "dark";

        html.classList.toggle("dark-mode", isDark);

        try {
            localStorage.setItem("linguawave-theme", theme);
        } catch (error) {
            // Continue even if storage is unavailable.
        }

        themeButtons.forEach((button) => {
            const icon = button.querySelector("i");
            const label = button.querySelector("span");

            button.classList.toggle("is-enabled", isDark);
            button.setAttribute("aria-pressed", String(isDark));

            if (icon) {
                icon.classList.toggle("fa-moon", !isDark);
                icon.classList.toggle("fa-sun", isDark);
            }

            if (label) {
                label.textContent = isDark ? "Light Mode" : "Dark Mode";
            }

            button.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
        });
    }

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("linguawave-theme") || "light";
    } catch (error) {
        savedTheme = "light";
    }

    applyTheme(savedTheme);

    themeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const isDark = html.classList.contains("dark-mode");

            applyTheme(isDark ? "light" : "dark");
        });
    });

    /* =====================================
       RTL: Left-to-Right / Right-to-Left
    ===================================== */

    function applyDirection(direction) {
        const isRTL = direction === "rtl";

        html.setAttribute("dir", isRTL ? "rtl" : "ltr");

        try {
            localStorage.setItem(
                "linguawave-direction",
                isRTL ? "rtl" : "ltr"
            );
        } catch (error) {
            // Continue even if storage is unavailable.
        }

        rtlButtons.forEach((button) => {
            const label = button.querySelector("span");

            button.classList.toggle("is-enabled", isRTL);
            button.setAttribute("aria-pressed", String(isRTL));

            if (label) {
                label.textContent = isRTL ? "LTR Layout" : "RTL Layout";
            }

            button.setAttribute(
                "aria-label",
                isRTL ? "Switch to left-to-right layout" :
                    "Switch to right-to-left layout"
            );
        });
    }

    let savedDirection = "ltr";

    try {
        savedDirection =
            localStorage.getItem("linguawave-direction") || "ltr";
    } catch (error) {
        savedDirection = "ltr";
    }

    applyDirection(savedDirection);

    rtlButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const isRTL = html.getAttribute("dir") === "rtl";

            applyDirection(isRTL ? "ltr" : "rtl");
        });
    });

    /* =====================================
       Responsive Menu
    ===================================== */

    function openMenu() {
        if (!menuToggle || !mobileMenu) return;

        mobileMenu.classList.add("is-open");
        menuToggle.classList.add("is-open");

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation menu");
    }

    function closeMenu() {
        if (!menuToggle || !mobileMenu) return;

        mobileMenu.classList.remove("is-open");
        menuToggle.classList.remove("is-open");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen =
                menuToggle.getAttribute("aria-expanded") === "true";

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close after selecting a page.
        mobileMenu.querySelectorAll(".lw-nav-link").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        // Close when clicking outside the header.
        document.addEventListener("click", (event) => {
            const header = document.querySelector(".lw-header");

            if (header && !header.contains(event.target)) {
                closeMenu();
            }
        });

        // Close using the Escape key.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
                menuToggle.focus();
            }
        });

        // Reset mobile navigation when switching to desktop.
        window.addEventListener("resize", () => {
            if (window.innerWidth > 1024) {
                closeMenu();
            }
        });
    }

    /* =====================================
       Active Navigation
    ===================================== */

    function normalisePath(path) {
        const cleaned = path.replace(/\/+$/, "");
        return cleaned || "/";
    }

    function updateActiveLinks() {
        const currentPath = normalisePath(window.location.pathname);

        allNavLinks.forEach((link) => {
            const linkPath = normalisePath(
                new URL(link.href, window.location.href).pathname
            );

            const isActive = linkPath === currentPath;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    updateActiveLinks();
});

const copyrightYear = document.getElementById("lwCopyrightYear");

if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}


/* HOME 2 - TESTIMONIAL CAROUSEL */
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector("#lw2TestimonialCarousel");

    if (!carousel) return;

    const cards = Array.from(
        carousel.querySelectorAll(".lw2-testimonial-card")
    );

    const dots = Array.from(
        carousel.querySelectorAll(".lw2-testimonial-dots button")
    );

    const prevButton = carousel.querySelector(".lw2-testimonial-prev");
    const nextButton = carousel.querySelector(".lw2-testimonial-next");

    let activeIndex = 0;

    function renderCarousel() {
        const total = cards.length;

        cards.forEach(function (card, index) {
            card.classList.remove("is-active", "is-previous", "is-next");

            if (index === activeIndex) {
                card.classList.add("is-active");
            } else if (index === (activeIndex - 1 + total) % total) {
                card.classList.add("is-previous");
            } else if (index === (activeIndex + 1) % total) {
                card.classList.add("is-next");
            }

            card.setAttribute(
                "aria-hidden",
                index === activeIndex ? "false" : "true"
            );
        });

        dots.forEach(function (dot, index) {
            dot.classList.toggle("active", index === activeIndex);
            dot.setAttribute(
                "aria-current",
                index === activeIndex ? "true" : "false"
            );
        });
    }

    function showNext() {
        activeIndex = (activeIndex + 1) % cards.length;
        renderCarousel();
    }

    function showPrevious() {
        activeIndex = (activeIndex - 1 + cards.length) % cards.length;
        renderCarousel();
    }

    nextButton.addEventListener("click", showNext);
    prevButton.addEventListener("click", showPrevious);

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            activeIndex = index;
            renderCarousel();
        });
    });

    renderCarousel();
});


/* HOME 2 - FAQ ACCORDION */
document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(
        ".lw2-faq-section .lw2-faq-item"
    );

    faqItems.forEach(function (item) {
        const button = item.querySelector(".lw2-faq-question");

        if (!button) return;

        button.addEventListener("click", function () {
            const shouldOpen = !item.classList.contains("is-open");

            faqItems.forEach(function (otherItem) {
                otherItem.classList.remove("is-open");

                const otherButton = otherItem.querySelector(
                    ".lw2-faq-question"
                );

                if (otherButton) {
                    otherButton.setAttribute("aria-expanded", "false");
                }
            });

            if (shouldOpen) {
                item.classList.add("is-open");
                button.setAttribute("aria-expanded", "true");
            }
        });
    });
});

/* HOME 2 - SCROLL TO TOP */
document.addEventListener("DOMContentLoaded", function () {
    const scrollTopButton = document.getElementById("lw2ScrollTop");

    if (!scrollTopButton) return;

    function updateScrollButton() {
        scrollTopButton.classList.toggle(
            "is-visible",
            window.scrollY > 300
        );
    }

    window.addEventListener("scroll", updateScrollButton, {
        passive: true
    });

    scrollTopButton.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    updateScrollButton();
});