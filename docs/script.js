// Format: "Group_Index" -> Maps to articles/Group_Index.md
const ARTICLE_FILES = [
    "welcome",
    "Debi-Art_0",
    "Debi-Art_1"
];

let currentCatalog = {};

document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    initMobileMenu();

    const navContainer = document.getElementById("nav-container");
    currentCatalog = await buildCatalog(ARTICLE_FILES);
    renderSidebar(currentCatalog, navContainer);
    const initialHash = window.location.hash.replace("#", "");
    const startArticle = ARTICLE_FILES.includes(initialHash) ? initialHash : "welcome";
    
    loadArticle(startArticle);

    window.addEventListener("hashchange", () => {
        const hash = window.location.hash.replace("#", "");
        if (hash && ARTICLE_FILES.includes(hash)) {
            loadArticle(hash);
        }
    });
});

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("is-open");
        });
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebar.classList.contains("is-open")) {
        sidebar.classList.remove("is-open");
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            const nextTheme = currentTheme === "light" ? "dark" : "light";
            applyTheme(nextTheme);
            localStorage.setItem("theme", nextTheme);
        });
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
        toggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
}

async function buildCatalog(files) {
    const catalog = {};

    for (const fileName of files) {
        if (fileName === "welcome") continue; // Special case handled separately

        const parts = fileName.split("_");
        const group = parts[0];
        const order = parseInt(parts[1] || "0", 10);

        if (!catalog[group]) {
            catalog[group] = [];
        }

        const title = await extractTitleFromMd(fileName);

        catalog[group].push({
            id: fileName,
            order: order,
            title: title || fileName
        });
    }

    for (const group in catalog) {
        catalog[group].sort((a, b) => a.order - b.order);
    }

    return catalog;
}

async function extractTitleFromMd(fileName) {
    try {
        const response = await fetch(`articles/${fileName}.md`);
        if (!response.ok) return fileName;
        const text = await response.text();
        const firstLine = text.split("\n").find(line => line.trim().startsWith("#"));
        return firstLine ? firstLine.replace(/^#\s*/, "").trim() : fileName;
    } catch {
        return fileName;
    }
}

function renderSidebar(catalog, container) {
    let html = `
        <div class="nav-group">
            <a class="nav-item" data-id="welcome" href="#welcome">Welcome</a>
        </div>
    `;

    for (const [groupName, items] of Object.entries(catalog)) {
        html += `<div class="nav-group">`;
        html += `<div class="group-title">${groupName}</div>`;
        
        for (const item of items) {
            html += `
                <a class="nav-item" data-id="${item.id}" href="#${item.id}">
                    ${item.title}
                </a>
            `;
        }
        html += `</div>`;
    }

    container.innerHTML = html;
}

async function loadArticle(articleId) {
    const viewer = document.getElementById("article-viewer");
    viewer.innerHTML = `<p class="loading">Loading ${articleId}.md...</p>`;

    document.querySelectorAll(".nav-item").forEach(el => {
        el.classList.toggle("active", el.dataset.id === articleId);
    });

    closeMobileMenu();

    try {
        const response = await fetch(`articles/${articleId}.md`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const markdownText = await response.text();

        viewer.innerHTML = marked.parse(markdownText);
        window.location.hash = articleId;

        // Dynamically update document title for current session
        const h1 = viewer.querySelector("h1");
        if (h1 && h1.innerText) {
            document.title = `${h1.innerText} | Journalctl Iliyas`;
        } else {
            document.title = "Journalctl Iliyas";
        }

        if (articleId === "welcome") {
            renderWelcomeGroups(viewer, currentCatalog);
        } else {
            renderArticleNav(articleId, viewer);
        }

        const contentZone = document.querySelector(".content-zone");
        if (contentZone) {
            contentZone.scrollTop = 0;
        }
    } catch (err) {
        viewer.innerHTML = `
            <h1>404 — Article Not Found</h1>
            <p>Could not load file <code>articles/${articleId}.md</code>.</p>
        `;
    }
}

function renderWelcomeGroups(viewer, catalog) {
    if (!catalog || Object.keys(catalog).length === 0) return;

    const section = document.createElement("section");
    section.className = "welcome-groups-section";
    section.setAttribute("aria-label", "Browse article groups");

    let html = `<h2 class="welcome-groups-title">Explore Topics</h2>`;

    for (const [groupName, items] of Object.entries(catalog)) {
        if (!items || items.length === 0) continue;

        html += `
            <div class="welcome-group-block">
                <div class="group-block-header">
                    <h3 class="welcome-group-header">${escapeHtml(groupName)}</h3>
                    <div class="slider-controls">
                        <button class="slider-arrow prev-arrow" type="button" aria-label="Previous articles" title="Previous articles">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button class="slider-arrow next-arrow" type="button" aria-label="Next articles" title="Next articles">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="cards-slider">
        `;

        items.forEach((item, idx) => {
            html += `
                <a href="#${item.id}" class="article-card" data-id="${item.id}">
                    <span class="card-number">#${idx + 1}</span>
                    <h4 class="card-title">${escapeHtml(item.title)}</h4>
                    <span class="card-action">Read article &rarr;</span>
                </a>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    section.innerHTML = html;
    viewer.appendChild(section);

    section.querySelectorAll(".welcome-group-block").forEach(block => {
        const slider = block.querySelector(".cards-slider");
        const prevBtn = block.querySelector(".prev-arrow");
        const nextBtn = block.querySelector(".next-arrow");

        if (!slider || !prevBtn || !nextBtn) return;

        function updateArrows() {
            const isScrollable = slider.scrollWidth > slider.clientWidth + 2;
            const canScrollLeft = slider.scrollLeft > 2;
            const canScrollRight = slider.scrollLeft < (slider.scrollWidth - slider.clientWidth - 2);

            if (!isScrollable) {
                prevBtn.style.display = "none";
                nextBtn.style.display = "none";
            } else {
                prevBtn.style.display = "inline-flex";
                nextBtn.style.display = "inline-flex";
                prevBtn.style.opacity = canScrollLeft ? "1" : "0.3";
                prevBtn.style.pointerEvents = canScrollLeft ? "auto" : "none";
                nextBtn.style.opacity = canScrollRight ? "1" : "0.3";
                nextBtn.style.pointerEvents = canScrollRight ? "auto" : "none";
            }
        }

        prevBtn.addEventListener("click", () => {
            slider.scrollBy({ left: -260, behavior: "smooth" });
        });

        nextBtn.addEventListener("click", () => {
            slider.scrollBy({ left: 260, behavior: "smooth" });
        });

        slider.addEventListener("scroll", updateArrows);
        window.addEventListener("resize", updateArrows);

        setTimeout(updateArrows, 50);
    });
}

function renderArticleNav(articleId, viewer) {
    if (articleId === "welcome") return;

    const parts = articleId.split("_");
    const groupName = parts[0];
    const groupItems = currentCatalog[groupName];

    if (!groupItems || groupItems.length <= 1) return;

    const currentIndex = groupItems.findIndex(item => item.id === articleId);
    if (currentIndex === -1) return;

    const prevArticle = currentIndex > 0 ? groupItems[currentIndex - 1] : null;
    const nextArticle = currentIndex < groupItems.length - 1 ? groupItems[currentIndex + 1] : null;

    if (!prevArticle && !nextArticle) return;

    const nav = document.createElement("nav");
    nav.className = "article-nav";
    nav.setAttribute("aria-label", "Article navigation");

    let navContent = "";

    if (prevArticle) {
        navContent += `
            <a href="#${prevArticle.id}" class="article-nav-btn prev-btn" data-id="${prevArticle.id}">
                <span class="nav-btn-label">&larr; Previous</span>
                <span class="nav-btn-title">${escapeHtml(prevArticle.title)}</span>
            </a>
        `;
    }

    if (nextArticle) {
        navContent += `
            <a href="#${nextArticle.id}" class="article-nav-btn next-btn" data-id="${nextArticle.id}">
                <span class="nav-btn-label">Next &rarr;</span>
                <span class="nav-btn-title">${escapeHtml(nextArticle.title)}</span>
            </a>
        `;
    }

    nav.innerHTML = navContent;
    viewer.appendChild(nav);
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
