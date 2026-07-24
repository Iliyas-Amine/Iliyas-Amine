const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const DOMAIN = 'https://iliyasdev.xyz';
const ROOT_DIR = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT_DIR, 'articles');
const METADATA_PATH = path.join(ARTICLES_DIR, 'metadata.json');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'index.html');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');

// Output directory (e.g. node scripts/build-static.js --out dist)
const outArgIdx = process.argv.indexOf('--out');
const OUT_DIR_NAME = outArgIdx !== -1 && process.argv[outArgIdx + 1] ? process.argv[outArgIdx + 1] : 'dist';
const OUT_DIR = path.join(ROOT_DIR, OUT_DIR_NAME);

function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function build() {
    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error('Articles directory not found.');
        return;
    }

    let metadata = { groups: {}, articles: {} };
    if (fs.existsSync(METADATA_PATH)) {
        try {
            metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
        } catch (e) {
            console.warn('Could not parse articles/metadata.json:', e.message);
        }
    }

    const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    const mdFiles = fs.readdirSync(ARTICLES_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace(/\.md$/, ''));

    const sortedFiles = mdFiles.sort((a, b) => {
        if (a === 'welcome') return -1;
        if (b === 'welcome') return 1;
        return a.localeCompare(b);
    });

    console.log(`Building static site into /${OUT_DIR_NAME} for ${sortedFiles.length} articles.`);

    // Build Catalog Structure
    const catalog = {};
    sortedFiles.forEach(slug => {
        if (slug === 'welcome') return;
        const parts = slug.split('_');
        const group = parts[0];
        const order = parseInt(parts[1] || '0', 10);

        if (!catalog[group]) catalog[group] = [];

        const articleMeta = metadata.articles?.[slug] || {};
        let title = articleMeta.title;
        if (!title) {
            const mdContent = fs.readFileSync(path.join(ARTICLES_DIR, `${slug}.md`), 'utf8');
            const firstHeading = mdContent.split('\n').find(l => l.trim().startsWith('#'));
            title = firstHeading ? firstHeading.replace(/^#\s*/, '').trim() : slug;
        }

        catalog[group].push({
            id: slug,
            order: order,
            title: title || slug
        });
    });

    for (const group in catalog) {
        catalog[group].sort((a, b) => a.order - b.order);
    }

    // Prepare dist directory
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    // Copy static assets to dist
    const rootFilesToCopy = ['style.css', 'robots.txt', 'CNAME'];
    rootFilesToCopy.forEach(file => {
        const src = path.join(ROOT_DIR, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(OUT_DIR, file));
        }
    });

    copyDirSync(path.join(ROOT_DIR, 'scripts'), path.join(OUT_DIR, 'scripts'));
    copyDirSync(ARTICLES_DIR, path.join(OUT_DIR, 'articles'));

    // Inject Catalog Script tag into head
    const catalogDataScript = `<script>window.__ARTICLE_FILES__ = ${JSON.stringify(sortedFiles)}; window.__CATALOG__ = ${JSON.stringify(catalog)};</script>`;

    sortedFiles.forEach(slug => {
        const mdPath = path.join(ARTICLES_DIR, `${slug}.md`);
        const mdContent = fs.readFileSync(mdPath, 'utf8');
        const renderedHtml = marked.parse(mdContent);

        const groupName = slug.includes('_') ? slug.split('_')[0] : null;
        const articleMeta = metadata.articles?.[slug] || {};
        const groupMeta = (groupName && metadata.groups?.[groupName]) || {};

        let title = articleMeta.title;
        if (!title) {
            const firstHeading = mdContent.split('\n').find(l => l.trim().startsWith('#'));
            title = firstHeading ? firstHeading.replace(/^#\s*/, '').trim() : slug;
        }

        let description = articleMeta.description;
        if (!description) {
            const lines = mdContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
            description = lines.length > 0 ? lines[0].substring(0, 160) : 'Personal notebook and tech articles by Iliyas Amine.';
        }

        const groupKeywords = groupMeta.keywords || [];
        const articleKeywords = articleMeta.keywords || [];
        const combinedKeywords = Array.from(new Set([...groupKeywords, ...articleKeywords]));

        const canonicalUrl = slug === 'welcome' ? `${DOMAIN}/` : `${DOMAIN}/${slug}`;

        let pageHtml = template;
        pageHtml = pageHtml.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`);
        pageHtml = pageHtml.replace(/<meta name="description" content=".*?">/s, `<meta name="description" content="${escapeHtml(description)}">`);
        pageHtml = pageHtml.replace(/<link rel="canonical" href=".*?">/s, `<link rel="canonical" href="${canonicalUrl}">`);

        if (combinedKeywords.length > 0) {
            const keywordsTag = `<meta name="keywords" content="${escapeHtml(combinedKeywords.join(', '))}">`;
            if (pageHtml.includes('<meta name="keywords"')) {
                pageHtml = pageHtml.replace(/<meta name="keywords" content=".*?">/s, keywordsTag);
            } else {
                pageHtml = pageHtml.replace('</head>', `    ${keywordsTag}\n</head>`);
            }
        }

        pageHtml = pageHtml.replace(/<meta property="og:title" content=".*?">/s, `<meta property="og:title" content="${escapeHtml(title)}">`);
        pageHtml = pageHtml.replace(/<meta property="og:description" content=".*?">/s, `<meta property="og:description" content="${escapeHtml(description)}">`);
        pageHtml = pageHtml.replace(/<meta property="og:url" content=".*?">/s, `<meta property="og:url" content="${canonicalUrl}">`);
        pageHtml = pageHtml.replace(/<meta property="twitter:title" content=".*?">/s, `<meta property="twitter:title" content="${escapeHtml(title)}">`);
        pageHtml = pageHtml.replace(/<meta property="twitter:description" content=".*?">/s, `<meta property="twitter:description" content="${escapeHtml(description)}">`);

        // Inject dynamic catalog script tag
        pageHtml = pageHtml.replace('</head>', `    ${catalogDataScript}\n</head>`);

        // Inject pre-rendered article body
        pageHtml = pageHtml.replace(
            /<article id="article-viewer" class="markdown-body">[\s\S]*?<\/article>/s,
            `<article id="article-viewer" class="markdown-body">\n${renderedHtml}\n            </article>`
        );

        if (slug === 'welcome') {
            fs.writeFileSync(path.join(OUT_DIR, 'index.html'), pageHtml, 'utf8');
        }

        const outDir = path.join(OUT_DIR, slug);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outDir, 'index.html'), pageHtml, 'utf8');
    });

    // Generate sitemap.xml in dist AND root
    const sitemapUrls = [
        `  <url>\n    <loc>${DOMAIN}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`
    ];

    sortedFiles.forEach(slug => {
        sitemapUrls.push(`  <url>\n    <loc>${DOMAIN}/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
    });

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join('\n')}
</urlset>
`;
    fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemapContent, 'utf8');
    fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf8');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

build();
