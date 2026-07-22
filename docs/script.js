// Format: "Group_Index" -> Maps to articles/Group_Index.md
const ARTICLE_FILES = [
    "welcome"
];

document.addEventListener("DOMContentLoaded", async () => {
    initTheme();

    const navContainer = document.getElementById("nav-container");
    const viewer = document.getElementById("article-viewer");
    const catalog = await buildCatalog(ARTICLE_FILES);
    renderSidebar(catalog, navContainer);
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

    try {
        const response = await fetch(`articles/${articleId}.md`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const markdownText = await response.text();

        viewer.innerHTML = marked.parse(markdownText);
        window.location.hash = articleId;
    } catch (err) {
        viewer.innerHTML = `
            <h1>404 — Article Not Found</h1>
            <p>Could not load file <code>articles/${articleId}.md</code>.</p>
        `;
    }
}
