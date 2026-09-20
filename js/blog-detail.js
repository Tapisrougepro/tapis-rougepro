// Tapis Rouge Pro - Blog Detail Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    await loadArticleDetail();
});

// Get article ID from URL
function getArticleId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load Article Detail from Firestore
async function loadArticleDetail() {
    const articleId = getArticleId();
    const contentEl = document.getElementById('articleContent');

    if (!articleId) {
        contentEl.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;">Article introuvable. <a href="blog.html">Retour au blog</a></p>';
        return;
    }

    try {
        if (typeof firebase === 'undefined' || !window.db) {
            contentEl.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;">Impossible de charger l\'article.</p>';
            return;
        }

        const doc = await window.db.collection('articles').doc(articleId).get();

        if (!doc.exists) {
            contentEl.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;">Article introuvable. <a href="blog.html">Retour au blog</a></p>';
            document.getElementById('articleTitle').textContent = 'Article introuvable';
            return;
        }

        const article = doc.data();

        // Title
        const titleEl = document.getElementById('articleTitle');
        if (titleEl) titleEl.textContent = article.title || 'Article';
        document.title = (article.title || 'Article') + ' | Blog Tapis Rouge Pro';

        // Meta
        const categoryEl = document.getElementById('articleCategory');
        if (categoryEl) categoryEl.textContent = article.category || '';

        const dateEl = document.getElementById('articleDate');
        if (dateEl) dateEl.textContent = formatDate(article.date);

        const authorEl = document.getElementById('articleAuthor');
        if (authorEl) authorEl.textContent = article.author || '';

        // Main image
        const imgEl = document.getElementById('articleMainImage');
        if (imgEl && article.image) {
            imgEl.src = article.image;
            imgEl.alt = article.title || 'Article';
            imgEl.style.display = 'block';
        }

        // Content
        if (article.content) {
            contentEl.innerHTML = article.content;
        } else if (article.excerpt) {
            contentEl.innerHTML = '<p>' + article.excerpt + '</p>';
        } else {
            contentEl.innerHTML = '<p>Contenu non disponible.</p>';
        }

        // CTA
        contentEl.innerHTML += `
            <div class="article-cta">
                <h3>Vous souhaitez en savoir plus ?</h3>
                <a href="quote.html" class="btn-primary">Demandez un devis gratuit</a>
            </div>
        `;

        // Tags
        const tagsEl = document.getElementById('articleTags');
        if (tagsEl && article.category) {
            tagsEl.innerHTML = `<span class="tag">${article.category}</span>`;
        }

        // Share buttons
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(article.title || '');
        const fb = document.getElementById('shareFacebook');
        const tw = document.getElementById('shareTwitter');
        const li = document.getElementById('shareLinkedin');
        const em = document.getElementById('shareEmail');
        if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
        if (tw) tw.href = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title;
        if (li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
        if (em) em.href = 'mailto:?subject=' + title + '&body=' + url;

        // Load related articles
        await loadRelatedArticles(articleId, article.category);

    } catch (error) {
        console.error('Error loading article:', error);
        contentEl.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;">Erreur lors du chargement de l\'article. <a href="blog.html">Retour au blog</a></p>';
    }
}

// Load Related Articles
async function loadRelatedArticles(currentId, category) {
    const container = document.getElementById('relatedArticles');
    if (!container) return;

    try {
        const snapshot = await window.db.collection('articles').get();
        const articles = [];
        snapshot.forEach(doc => {
            if (doc.id !== currentId) {
                articles.push({ id: doc.id, ...doc.data() });
            }
        });

        // Prioritize same category, then take first 3
        const sameCategory = articles.filter(a => a.category === category);
        const others = articles.filter(a => a.category !== category);
        const related = [...sameCategory, ...others].slice(0, 3);

        if (related.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">Aucun article similaire.</p>';
            return;
        }

        const fallback = 'https://via.placeholder.com/600x400/c41e3a/ffffff?text=Article';

        container.innerHTML = related.map(a => `
            <div class="blog-card" data-category="${(a.category || '').toLowerCase()}">
                <div class="blog-image">
                    <img src="${a.image || fallback}" alt="${a.title}" loading="lazy">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(a.date)}</span>
                        <span><i class="fas fa-user"></i> ${a.author || ''}</span>
                        <span class="category-badge">${a.category || ''}</span>
                    </div>
                    <h3>${a.title || 'Article'}</h3>
                    <a href="blog-detail.html?id=${a.id}" class="read-more">Lire la suite <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error('Related articles error:', e);
        container.innerHTML = '';
    }
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1] || '';
        return day + ' ' + month + ' ' + parts[0];
    }
    return dateStr;
}
