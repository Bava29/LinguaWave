(() => {
    'use strict';

    const root = document.documentElement;
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const content = document.getElementById('contentScroll');
    const pageTitle = document.getElementById('pageTitle');
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationPanel = document.getElementById('notificationPanel');
    const profileToggle = document.getElementById('profileToggle');
    const profilePanel = document.getElementById('profilePanel');
    const logoutModal = document.getElementById('logoutModal');
    const dialog = logoutModal?.querySelector('.confirm-dialog');
    const stayButton = document.getElementById('stayButton');
    let lastFocused = null;

    const setTheme = (theme) => {
        const dark = theme === 'dark';
        root.dataset.theme = dark ? 'dark' : 'light';
        try { localStorage.setItem('linguawave-theme', dark ? 'dark' : 'light'); } catch (_) { /* Storage may be unavailable. */ }
        const button = document.getElementById('themeToggle');
        if (button) {
            button.innerHTML = `<i class="fa-solid fa-${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
            button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
            button.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
        }
    };
    const setDirection = (direction) => {
        const rtl = direction === 'rtl';
        root.setAttribute('dir', rtl ? 'rtl' : 'ltr');
        try { localStorage.setItem('linguawave-direction', rtl ? 'rtl' : 'ltr'); } catch (_) { /* Storage may be unavailable. */ }
        const button = document.getElementById('directionToggle');
        if (button) {
            button.setAttribute('aria-label', `Switch to ${rtl ? 'left-to-right' : 'right-to-left'} layout`);
            button.title = `Switch to ${rtl ? 'left-to-right' : 'right-to-left'} layout`;
        }
    };
    try { setTheme(localStorage.getItem('linguawave-theme') || 'light'); } catch (_) { setTheme('light'); }
    try { setDirection(localStorage.getItem('linguawave-direction') || 'ltr'); } catch (_) { setDirection('ltr'); }

    const setMobileMenu = (open) => {
        if (!sidebar || !menuToggle || !backdrop) return;
        sidebar.classList.toggle('is-open', open);
        backdrop.classList.toggle('is-visible', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        document.body.classList.toggle('menu-open', open);
        if (open) closePopovers();
    };
    const closePopovers = (except) => {
        [[notificationToggle, notificationPanel], [profileToggle, profilePanel]].forEach(([button, panel]) => {
            if (!button || !panel || panel === except) return;
            panel.hidden = true;
            button.setAttribute('aria-expanded', 'false');
        });
    };
    const togglePopover = (button, panel) => {
        if (!button || !panel) return;
        const willOpen = panel.hidden;
        closePopovers(panel);
        panel.hidden = !willOpen;
        button.setAttribute('aria-expanded', String(willOpen));
    };

    menuToggle?.addEventListener('click', () => setMobileMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    sidebarClose?.addEventListener('click', () => setMobileMenu(false));
    backdrop?.addEventListener('click', () => setMobileMenu(false));
    sidebar?.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            sidebar.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
            if (pageTitle) pageTitle.textContent = link.dataset.page || link.textContent.trim();
            setMobileMenu(false);
        });
    });
    document.querySelectorAll('[data-page]').forEach((link) => {
        if (link.closest('#sidebar')) return;
        link.addEventListener('click', () => {
            const target = link.dataset.page;
            if (!target) return;
            if (pageTitle) pageTitle.textContent = target;
            const matching = sidebar?.querySelectorAll('.nav-link');
            matching?.forEach((item) => item.classList.toggle('active', item.dataset.page === target));
            closePopovers();
            setMobileMenu(false);
            if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    notificationToggle?.addEventListener('click', () => togglePopover(notificationToggle, notificationPanel));
    profileToggle?.addEventListener('click', () => togglePopover(profileToggle, profilePanel));
    document.getElementById('themeToggle')?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    document.getElementById('directionToggle')?.addEventListener('click', () => setDirection(root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl'));

    const openLogout = (trigger) => {
        if (!logoutModal || !dialog) return;
        lastFocused = trigger || document.activeElement;
        closePopovers();
        setMobileMenu(false);
        logoutModal.hidden = false;
        document.body.classList.add('modal-open');
        dialog.focus();
        stayButton?.focus({ preventScroll: true });
    };
    const closeLogout = () => {
        if (!logoutModal) return;
        logoutModal.hidden = true;
        document.body.classList.remove('modal-open');
        lastFocused?.focus?.({ preventScroll: true });
    };
    document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', () => openLogout(button)));
    stayButton?.addEventListener('click', closeLogout);
    logoutModal?.addEventListener('click', (event) => { if (event.target === logoutModal) closeLogout(); });
    document.getElementById('confirmLogoutButton')?.addEventListener('click', () => { window.location.href = 'login.html'; });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('#notificationsWrap')) {
            if (notificationPanel) notificationPanel.hidden = true;
            notificationToggle?.setAttribute('aria-expanded', 'false');
        }
        if (!event.target.closest('#profileWrap')) {
            if (profilePanel) profilePanel.hidden = true;
            profileToggle?.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (logoutModal && !logoutModal.hidden) { closeLogout(); return; }
            closePopovers();
            setMobileMenu(false);
        }
        if (event.key === 'Tab' && logoutModal && !logoutModal.hidden && dialog) {
            const focusable = [...dialog.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')];
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    const desktopQuery = window.matchMedia('(min-width: 1025px)');
    desktopQuery.addEventListener?.('change', (event) => { if (event.matches) setMobileMenu(false); });
    window.addEventListener('hashchange', () => {
        const page = location.hash.slice(1);
        const link = [...(sidebar?.querySelectorAll('.nav-link') || [])].find((item) => item.getAttribute('href') === `#${page}`);
        if (link) {
            sidebar.querySelectorAll('.nav-link').forEach((item) => item.classList.toggle('active', item === link));
            if (pageTitle) pageTitle.textContent = link.dataset.page || link.textContent.trim();
        }
    });
})();


/* =========================================
   Event Bookings Page Interactions
========================================= */

const bookingSearch = document.getElementById("bookingSearch");
const bookingStatusFilter = document.getElementById("bookingStatusFilter");
const bookingList = document.getElementById("bookingList");
const bookingEmpty = document.getElementById("bookingEmpty");

function filterBookings() {
    if (!bookingList) return;

    const searchTerm = (bookingSearch?.value || "")
        .trim()
        .toLowerCase();

    const selectedStatus = bookingStatusFilter?.value || "all";
    const items = bookingList.querySelectorAll(".booking-item");

    let visibleCount = 0;

    items.forEach((item) => {
        const searchData = (
            item.dataset.search + " " + item.textContent
        ).toLowerCase();

        const matchesSearch = searchData.includes(searchTerm);
        const matchesStatus =
            selectedStatus === "all" ||
            item.dataset.status === selectedStatus;

        const visible = matchesSearch && matchesStatus;

        item.hidden = !visible;

        if (visible) visibleCount++;
    });

    if (bookingEmpty) {
        bookingEmpty.hidden = visibleCount !== 0;
    }
}

bookingSearch?.addEventListener("input", filterBookings);
bookingStatusFilter?.addEventListener("change", filterBookings);

/* Booking details */

const bookingRecords = {
    geneva: {
        name: "Geneva Global Summit",
        date: "8 November 2026",
        venue: "Geneva, Switzerland",
        languages: "3 language channels",
        equipment: "120 receivers",
        status: "Confirmed"
    },
    paris: {
        name: "European Partner Forum",
        date: "18 November 2026",
        venue: "Paris, France",
        languages: "2 language channels",
        equipment: "60 receivers",
        status: "Confirmed"
    },
    london: {
        name: "Global Technology Symposium",
        date: "5 December 2026",
        venue: "London, United Kingdom",
        languages: "4 requested channels",
        equipment: "200 requested receivers",
        status: "Pending"
    },
    singapore: {
        name: "International Leadership Congress",
        date: "16 January 2027",
        venue: "Singapore",
        languages: "3 requested channels",
        equipment: "100 requested receivers",
        status: "Under Review"
    }
};

const bookingModal = document.getElementById("bookingDetailsModal");
const bookingModalCard = bookingModal?.querySelector(".booking-modal-card");
const bookingModalDetails = document.getElementById("bookingModalDetails");
const bookingModalTitle = document.getElementById("bookingModalTitle");
const bookingModalDescription = document.getElementById("bookingModalDescription");
const bookingModalClose = document.getElementById("bookingModalClose");

let bookingPreviousFocus = null;

document.querySelectorAll("[data-booking-details]").forEach((button) => {
    button.addEventListener("click", () => {
        const record = bookingRecords[button.dataset.bookingDetails];

        if (!record || !bookingModal || !bookingModalDetails) return;

        bookingPreviousFocus = button;

        bookingModalTitle.textContent = record.name;
        bookingModalDescription.textContent =
            "Review the current arrangements for this event.";

        const fields = [
            ["Event date", record.date],
            ["Venue", record.venue],
            ["Language channels", record.languages],
            ["Equipment", record.equipment],
            ["Booking status", record.status]
        ];

        bookingModalDetails.replaceChildren();

        fields.forEach(([label, value]) => {
            const row = document.createElement("div");
            row.className = "booking-modal-detail-row";

            const labelElement = document.createElement("span");
            labelElement.textContent = label;

            const valueElement = document.createElement("strong");
            valueElement.textContent = value;

            row.append(labelElement, valueElement);
            bookingModalDetails.appendChild(row);
        });

        bookingModal.hidden = false;
        document.body.classList.add("modal-open");
        bookingModalClose?.focus();
    });
});

function closeBookingDetails() {
    if (!bookingModal || bookingModal.hidden) return;

    bookingModal.hidden = true;
    document.body.classList.remove("modal-open");
    bookingPreviousFocus?.focus();
}

bookingModalClose?.addEventListener("click", closeBookingDetails);

bookingModal?.addEventListener("click", (event) => {
    if (event.target === bookingModal) {
        closeBookingDetails();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && bookingModal && !bookingModal.hidden) {
        closeBookingDetails();
    }
});


/* ==========================================
   LINGUAWAVE — EQUIPMENT PAGE INTERACTIONS
   Add inside the existing dashboard IIFE
   before its final })();
========================================== */

const equipmentChannelSearch = document.getElementById("channelSearch");
const equipmentStatusFilter = document.getElementById("channelStatusFilter");
const equipmentChannelList = document.getElementById("channelList");
const equipmentChannelEmpty = document.getElementById("channelEmpty");

function filterEquipmentChannels() {
    if (!equipmentChannelList) return;

    const searchText = (equipmentChannelSearch?.value || "")
        .trim()
        .toLowerCase();

    const selectedStatus = equipmentStatusFilter?.value || "all";
    const equipmentCards = equipmentChannelList.querySelectorAll(".channel-card");
    let visibleEquipmentCards = 0;

    equipmentCards.forEach((card) => {
        const searchableText = card.dataset.search || "";
        const cardStatus = card.dataset.status || "";

        const matchesSearch = searchableText.includes(searchText);
        const matchesStatus =
            selectedStatus === "all" || cardStatus === selectedStatus;

        const shouldShow = matchesSearch && matchesStatus;

        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleEquipmentCards++;
        }
    });

    if (equipmentChannelEmpty) {
        equipmentChannelEmpty.hidden = visibleEquipmentCards !== 0;
    }
}

equipmentChannelSearch?.addEventListener("input", filterEquipmentChannels);
equipmentStatusFilter?.addEventListener("change", filterEquipmentChannels);


/* Equipment / channel details modal */

const equipmentDetailsModal =
    document.getElementById("equipmentDetailsModal");

const equipmentModalEvent =
    document.getElementById("equipmentModalEvent");

const equipmentModalLanguages =
    document.getElementById("equipmentModalLanguages");

const equipmentModalType =
    document.getElementById("equipmentModalType");

const equipmentModalQuantity =
    document.getElementById("equipmentModalQuantity");

const equipmentModalStatus =
    document.getElementById("equipmentModalStatus");

let equipmentPreviousFocus = null;

function openEquipmentDetails(button) {
    if (!equipmentDetailsModal) return;

    equipmentPreviousFocus = button;

    const eventName = button.dataset.event || "Event details";
    const languageNames = button.dataset.languages || "Not specified";
    const equipmentType = button.dataset.equipment || "Interpretation receivers";
    const equipmentQuantity = button.dataset.quantity || button.dataset.receivers || "Not specified";
    const equipmentStatus = button.dataset.status || "Not specified";

    if (equipmentModalEvent) {
        equipmentModalEvent.textContent = eventName;
    }

    if (equipmentModalLanguages) {
        equipmentModalLanguages.textContent = languageNames;
    }

    if (equipmentModalType) {
        equipmentModalType.textContent = equipmentType;
    }

    if (equipmentModalQuantity) {
        equipmentModalQuantity.textContent =
            /^\d+$/.test(equipmentQuantity)
                ? `${equipmentQuantity} units`
                : equipmentQuantity;
    }

    if (equipmentModalStatus) {
        equipmentModalStatus.textContent = equipmentStatus;
    }

    const modalTitle = document.getElementById("equipmentModalTitle");

    if (modalTitle) {
        modalTitle.textContent = eventName;
    }

    equipmentDetailsModal.classList.add("is-open");
    equipmentDetailsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    equipmentDetailsModal
        .querySelector(".equipment-modal-close")
        ?.focus();
}

function closeEquipmentDetails() {
    if (!equipmentDetailsModal) return;

    equipmentDetailsModal.classList.remove("is-open");
    equipmentDetailsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    equipmentPreviousFocus?.focus();
}

document.addEventListener("click", (event) => {
    const detailsButton = event.target.closest(
        ".channel-edit-btn, .allocation-action"
    );

    if (detailsButton) {
        openEquipmentDetails(detailsButton);
        return;
    }

    if (event.target.closest("[data-equipment-close]")) {
        closeEquipmentDetails();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        equipmentDetailsModal?.classList.contains("is-open")
    ) {
        closeEquipmentDetails();
    }
});



/* ==========================================
   LINGUAWAVE — DELIVERY PAGE INTERACTIONS
   Add inside the existing dashboard IIFE
========================================== */

// Delivery schedule search and status filter
const deliverySearchInput = document.getElementById("deliverySearch");
const deliveryStatusSelect = document.getElementById("deliveryStatusFilter");
const deliveryScheduleList = document.getElementById("deliveryScheduleList");
const deliveryEmptyState = document.getElementById("deliveryEmpty");

function filterDeliverySchedule() {
    if (!deliveryScheduleList) return;

    const searchValue = (deliverySearchInput?.value || "")
        .trim()
        .toLowerCase();

    const statusValue = deliveryStatusSelect?.value || "all";
    const scheduleCards =
        deliveryScheduleList.querySelectorAll(".delivery-schedule-card");

    let visibleCount = 0;

    scheduleCards.forEach((card) => {
        const searchableText = card.dataset.search || "";
        const deliveryStatus = card.dataset.status || "";

        const matchesSearch = searchableText.includes(searchValue);
        const matchesStatus =
            statusValue === "all" || deliveryStatus === statusValue;

        const isVisible = matchesSearch && matchesStatus;

        card.hidden = !isVisible;

        if (isVisible) visibleCount++;
    });

    if (deliveryEmptyState) {
        deliveryEmptyState.hidden = visibleCount > 0;
    }
}

deliverySearchInput?.addEventListener("input", filterDeliverySchedule);
deliveryStatusSelect?.addEventListener("change", filterDeliverySchedule);


// Delivery details modal
const deliveryDetailsModal =
    document.getElementById("deliveryDetailsModal");

let deliveryPreviousFocus = null;

function openDeliveryDetails(button) {
    if (!deliveryDetailsModal) return;

    deliveryPreviousFocus = button;

    const deliveryFields = {
        deliveryModalEvent: button.dataset.event,
        deliveryModalDate: button.dataset.date,
        deliveryModalTime: button.dataset.time,
        deliveryModalVenue: button.dataset.venue,
        deliveryModalEquipment: button.dataset.equipment,
        deliveryModalStatus: button.dataset.status,
        deliveryModalInstructions: button.dataset.instructions
    };

    Object.entries(deliveryFields).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value || "Not specified";
        }
    });

    const modalTitle = document.getElementById("deliveryModalTitle");

    if (modalTitle) {
        modalTitle.textContent = button.dataset.event || "Delivery details";
    }

    deliveryDetailsModal.classList.add("is-open");
    deliveryDetailsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    deliveryDetailsModal
        .querySelector(".delivery-modal-close")
        ?.focus();
}

function closeDeliveryDetails() {
    if (!deliveryDetailsModal) return;

    deliveryDetailsModal.classList.remove("is-open");
    deliveryDetailsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    deliveryPreviousFocus?.focus();
}

document.addEventListener("click", (event) => {
    const detailsButton = event.target.closest(".delivery-details-btn");

    if (detailsButton) {
        openDeliveryDetails(detailsButton);
        return;
    }

    if (event.target.closest("[data-delivery-close]")) {
        closeDeliveryDetails();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        deliveryDetailsModal?.classList.contains("is-open")
    ) {
        closeDeliveryDetails();
    }
});


/* ==========================================
   LINGUAWAVE — PAYMENTS & INVOICES
   Add inside the existing dashboard IIFE
========================================== */

// Invoice search and status filter
const invoiceSearchInput = document.getElementById("invoiceSearch");
const invoiceStatusSelect = document.getElementById("invoiceStatusFilter");
const invoiceListContainer = document.getElementById("invoiceList");
const invoiceEmptyState = document.getElementById("invoiceEmpty");

function filterInvoices() {
    if (!invoiceListContainer) return;

    const searchText = (invoiceSearchInput?.value || "")
        .trim()
        .toLowerCase();

    const selectedStatus = invoiceStatusSelect?.value || "all";
    const invoiceCards = invoiceListContainer.querySelectorAll(".invoice-card");

    let visibleCount = 0;

    invoiceCards.forEach((card) => {
        const searchableText = card.dataset.search || "";
        const invoiceStatus = card.dataset.status || "";

        const matchesSearch = searchableText.includes(searchText);
        const matchesStatus =
            selectedStatus === "all" || invoiceStatus === selectedStatus;

        const shouldShow = matchesSearch && matchesStatus;

        card.hidden = !shouldShow;

        if (shouldShow) visibleCount++;
    });

    if (invoiceEmptyState) {
        invoiceEmptyState.hidden = visibleCount > 0;
    }
}

invoiceSearchInput?.addEventListener("input", filterInvoices);
invoiceStatusSelect?.addEventListener("change", filterInvoices);


// Invoice details modal
const invoiceDetailsModal = document.getElementById("invoiceDetailsModal");
let invoicePreviousFocus = null;

function openInvoiceDetails(button) {
    if (!invoiceDetailsModal) return;

    invoicePreviousFocus = button;

    const invoiceFields = {
        invoiceModalNumber: button.dataset.invoice,
        invoiceModalEvent: button.dataset.event,
        invoiceModalIssue: button.dataset.issue,
        invoiceModalDue: button.dataset.due,
        invoiceModalAmount: button.dataset.amount,
        invoiceModalStatus: button.dataset.statusLabel,
        invoiceModalMethod: button.dataset.method,
        invoiceModalReference: button.dataset.reference
    };

    Object.entries(invoiceFields).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value || "Not available";
        }
    });

    const modalTitle = document.getElementById("invoiceModalTitle");

    if (modalTitle) {
        modalTitle.textContent =
            button.dataset.invoice || "Invoice information";
    }

    invoiceDetailsModal.classList.add("is-open");
    invoiceDetailsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    invoiceDetailsModal.querySelector(".invoice-modal-close")?.focus();
}

function closeInvoiceDetails() {
    if (!invoiceDetailsModal) return;

    invoiceDetailsModal.classList.remove("is-open");
    invoiceDetailsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    invoicePreviousFocus?.focus();
}

document.addEventListener("click", (event) => {
    const invoiceButton = event.target.closest("[data-invoice-view]");

    if (invoiceButton) {
        openInvoiceDetails(invoiceButton);
        return;
    }

    if (event.target.closest("[data-invoice-close]")) {
        closeInvoiceDetails();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        invoiceDetailsModal?.classList.contains("is-open")
    ) {
        closeInvoiceDetails();
    }
});


// Print the selected invoice details from the modal
const printInvoiceButton = document.getElementById("printInvoiceButton");

printInvoiceButton?.addEventListener("click", () => {
    if (!invoiceDetailsModal?.classList.contains("is-open")) return;

    window.print();
});


/* ==========================================
   LINGUAWAVE — SUPPORT PAGE INTERACTIONS
   Add inside the existing dashboard IIFE
========================================== */

// Search and status filter
const supportSearchInput = document.getElementById("supportSearch");
const supportStatusSelect = document.getElementById("supportStatusFilter");
const supportRequestList = document.getElementById("supportRequestList");
const supportEmptyState = document.getElementById("supportEmpty");

function filterSupportRequests() {
    if (!supportRequestList) return;

    const searchText = (supportSearchInput?.value || "")
        .trim()
        .toLowerCase();

    const selectedStatus = supportStatusSelect?.value || "all";
    const requestCards =
        supportRequestList.querySelectorAll(".support-request-card");

    let visibleCount = 0;

    requestCards.forEach((card) => {
        const searchableText = card.dataset.search || "";
        const requestStatus = card.dataset.status || "";

        const matchesSearch = searchableText.includes(searchText);
        const matchesStatus =
            selectedStatus === "all" || requestStatus === selectedStatus;

        const shouldShow = matchesSearch && matchesStatus;

        card.hidden = !shouldShow;

        if (shouldShow) visibleCount++;
    });

    if (supportEmptyState) {
        supportEmptyState.hidden = visibleCount > 0;
    }
}

supportSearchInput?.addEventListener("input", filterSupportRequests);
supportStatusSelect?.addEventListener("change", filterSupportRequests);


// Update summary counts from the displayed demo requests
function updateSupportCounts() {
    if (!supportRequestList) return;

    const cards =
        [...supportRequestList.querySelectorAll(".support-request-card")];

    const openCount = cards.filter(
        (card) => card.dataset.status === "open"
    ).length;

    const progressCount = cards.filter(
        (card) => card.dataset.status === "progress"
    ).length;

    const resolvedCount = cards.filter(
        (card) => card.dataset.status === "resolved"
    ).length;

    const openElement = document.getElementById("supportOpenCount");
    const progressElement = document.getElementById("supportProgressCount");
    const resolvedElement = document.getElementById("supportResolvedCount");

    if (openElement) openElement.textContent = String(openCount).padStart(2, "0");
    if (progressElement) {
        progressElement.textContent = String(progressCount).padStart(2, "0");
    }
    if (resolvedElement) {
        resolvedElement.textContent = String(resolvedCount).padStart(2, "0");
    }
}


// Request details modal
const supportDetailsModal = document.getElementById("supportDetailsModal");
let supportPreviousFocus = null;

function openSupportDetails(button) {
    if (!supportDetailsModal) return;

    supportPreviousFocus = button;

    const fields = {
        supportModalId: button.dataset.id,
        supportModalSubject: button.dataset.title,
        supportModalEvent: button.dataset.event,
        supportModalCategory: button.dataset.category,
        supportModalPriority: button.dataset.priority,
        supportModalStatus: button.dataset.status,
        supportModalDate: button.dataset.date,
        supportModalDescription: button.dataset.description,
        supportModalResponse: button.dataset.response
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "Not specified";
    });

    const modalTitle = document.getElementById("supportModalTitle");
    if (modalTitle) {
        modalTitle.textContent = button.dataset.id || "Request details";
    }

    supportDetailsModal.classList.add("is-open");
    supportDetailsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    supportDetailsModal.querySelector(".support-modal-close")?.focus();
}

function closeSupportDetails() {
    if (!supportDetailsModal) return;

    supportDetailsModal.classList.remove("is-open");
    supportDetailsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    supportPreviousFocus?.focus();
}

document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-support-view]");

    if (viewButton) {
        openSupportDetails(viewButton);
        return;
    }

    if (event.target.closest("[data-support-close]")) {
        closeSupportDetails();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        supportDetailsModal?.classList.contains("is-open")
    ) {
        closeSupportDetails();
    }
});


// New Request button scrolls to the request form
const newSupportRequestButton =
    document.getElementById("newSupportRequestBtn");

const createSupportSection =
    document.getElementById("createSupportSection");

newSupportRequestButton?.addEventListener("click", () => {
    createSupportSection?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    document.getElementById("supportRequestSubject")?.focus({
        preventScroll: true
    });
});


// Submit a frontend demo request
const supportRequestForm =
    document.getElementById("supportRequestForm");

const supportFormFeedback =
    document.getElementById("supportFormFeedback");

supportRequestForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!supportRequestForm.reportValidity()) return;

    const subject = document
        .getElementById("supportRequestSubject").value.trim();

    const category = document
        .getElementById("supportRequestCategory").value;

    const eventName = document
        .getElementById("supportRequestEvent").value || "General enquiry";

    const priority = document
        .getElementById("supportRequestPriority").value;

    const description = document
        .getElementById("supportRequestDescription").value.trim();

    if (subject.length === 0 || description.length < 10) return;

    const requestId =
        "LW-DEMO-" + Date.now().toString().slice(-8);

    const today = new Date();

    const dateLabel = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const dateTimeLabel = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Build elements safely without inserting user input as HTML
    const card = document.createElement("article");
    card.className = "support-request-card";
    card.dataset.status = "open";
    card.dataset.search =
        `${requestId} ${subject} ${eventName} ${category}`.toLowerCase();

    const iconBox = document.createElement("div");
    iconBox.className = "support-request-icon";

    const icon = document.createElement("i");
    const iconMap = {
        "Equipment": "fa-headphones",
        "Language Channels": "fa-language",
        "Delivery & Schedule": "fa-truck-fast",
        "Payments & Invoices": "fa-file-invoice-dollar",
        "Booking": "fa-calendar-check",
        "Other": "fa-circle-question"
    };

    icon.className = "fa-solid " + (iconMap[category] || "fa-ticket");
    iconBox.appendChild(icon);

    const info = document.createElement("div");
    info.className = "support-request-info";

    const titleRow = document.createElement("div");
    titleRow.className = "support-request-title-row";

    const title = document.createElement("h3");
    title.textContent = subject;

    const status = document.createElement("span");
    status.className = "support-status support-status-open";
    status.textContent = "Open";

    titleRow.append(title, status);

    const meta = document.createElement("p");
    meta.className = "support-request-meta";

    const idStrong = document.createElement("strong");
    idStrong.textContent = requestId;

    const separator = document.createElement("span");
    separator.textContent = "•";

    const eventSpan = document.createElement("span");
    eventSpan.textContent = eventName;

    meta.append(idStrong, separator, eventSpan);

    const bottom = document.createElement("div");
    bottom.className = "support-request-bottom";

    const dateSpan = document.createElement("span");
    const dateIcon = document.createElement("i");
    dateIcon.className = "fa-regular fa-calendar";
    dateSpan.append(dateIcon, document.createTextNode(" " + dateLabel));

    const prioritySpan = document.createElement("span");
    prioritySpan.className = "support-priority " +
        (priority === "Normal" ? "priority-normal" : "priority-high");
    prioritySpan.textContent = priority + " priority";

    bottom.append(dateSpan, prioritySpan);
    info.append(titleRow, meta, bottom);

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "support-view-btn";
    viewButton.setAttribute("data-support-view", "");
    viewButton.setAttribute("aria-label", "View request " + requestId);

    const buttonText = document.createTextNode("View ");

    const buttonIcon = document.createElement("i");
    buttonIcon.className = "fa-solid fa-arrow-right";

    viewButton.append(buttonText, buttonIcon);

    Object.assign(viewButton.dataset, {
        id: requestId,
        title: subject,
        event: eventName,
        category,
        priority,
        status: "Open",
        date: dateTimeLabel,
        description,
        response: "Demo request created locally. No support team has been notified."
    });

    card.append(iconBox, info, viewButton);

    // Add to the visible list for this page session
    supportRequestList.prepend(card);

    supportRequestForm.reset();

    if (supportFormFeedback) {
        supportFormFeedback.hidden = false;
        supportFormFeedback.textContent =
            `Demo request ${requestId} has been added to this page. ` +
            "It has not been sent to a support team because backend integration is not connected.";
    }

    updateSupportCounts();
    filterSupportRequests();

    card.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});
