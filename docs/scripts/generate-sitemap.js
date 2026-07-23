const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://iliyasdev.xyz';
const ARTICLES_DIR = path.join(__dirname, '../articles');
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');
const SCRIPT_PATH = path.join(__dirname, '../script.js');

function run() {
    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error('Articles directory not found.');
        return;
    }

    const mdFiles = fs.readdirSync(ARTICLES_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace(/\.md$/, ''));

    // Ensure 'welcome' comes first if present
    const sortedFiles = mdFiles.sort((a, b) => {
        if (a === 'welcome') return -1;
        if (b === 'welcome') return 1;
        return a.localeCompare(b);
    });

    // 1. Generate sitemap.xml
    const urls = [
        `  <url>\n    <loc>${DOMAIN}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`
    ];

    sortedFiles.forEach(slug => {
        urls.push(`  <url>\n    <loc>${DOMAIN}/#${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
    });

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

    fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf8');
    console.log(`Updated sitemap.xml with ${sortedFiles.length} article URLs.`);

    // 2. Automatically sync ARTICLE_FILES in script.js
    if (fs.existsSync(SCRIPT_PATH)) {
        let scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
        const formattedArray = JSON.stringify(sortedFiles, null, 4);
        const updatedContent = scriptContent.replace(
            /const ARTICLE_FILES = \[[^\]]*\];/s,
            `const ARTICLE_FILES = ${formattedArray};`
        );
        if (updatedContent !== scriptContent) {
            fs.writeFileSync(SCRIPT_PATH, updatedContent, 'utf8');
            console.log('Updated ARTICLE_FILES in script.js automatically.');
        }
    }
}

run();
