// Tapis Rouge Pro - Blog Page JavaScript

let allArticles = [];

document.addEventListener('DOMContentLoaded', async function() {
    await loadBlogArticles();
    initializeBlogFilters();
    initializeBlogAnimations();
});

// Load Blog Articles from Firestore
async function loadBlogArticles() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    try {
        if (typeof firebase === 'undefined' || !window.db) {
            console.warn('Firebase not available');
            blogGrid.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;grid-column:1/-1;">Impossible de charger les articles.</p>';
            return;
        }

        const snapshot = await window.db.collection('articles').get();
        allArticles = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allArticles.push({
                id: doc.id,
                title: data.title || 'Article',
                author: data.author || '',
                category: data.category || 'Conseils',
                date: data.date || '',
                image: data.image || '',
                content: data.content || '',
                excerpt: data.excerpt || ''
            });
        });

        // Sort by date descending
        allArticles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        renderBlogArticles(allArticles);
    } catch (error) {
        console.error('Error loading articles from Firestore:', error);
        blogGrid.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;grid-column:1/-1;">Erreur lors du chargement des articles.</p>';
    }
}

// Blog Filter Functionality
function initializeBlogFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const blogCards = document.querySelectorAll('.blog-card');
            blogCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (category === 'all' || cardCategory === category.toLowerCase()) {
                    card.style.display = '';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Render Blog Articles
function renderBlogArticles(articles) {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    if (articles.length === 0) {
        blogGrid.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;grid-column:1/-1;">Aucun article disponible pour le moment.</p>';
        return;
    }

    const fallbackImage = 'https://via.placeholder.com/600x400/c41e3a/ffffff?text=Article';

    blogGrid.innerHTML = articles.map(article => {
        const categorySlug = (article.category || '').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');
        const dateFormatted = formatDate(article.date);
        const excerpt = article.excerpt || stripHtml(article.content).substring(0, 150) + '...';

        return `
            <div class="blog-card" data-category="${categorySlug}">
                <div class="blog-image">
                    <img src="${article.image || fallbackImage}" alt="${article.title}" loading="lazy">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="fas fa-calendar"></i> ${dateFormatted}</span>
                        <span><i class="fas fa-user"></i> ${article.author}</span>
                        <span class="category-badge">${article.category}</span>
                    </div>
                    <h3>${article.title}</h3>
                    <p>${excerpt}</p>
                    <a href="blog-detail.html?id=${article.id}" class="read-more">Lire la suite <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    }).join('');
}

// Format date from YYYY-MM-DD to readable French
function formatDate(dateStr) {
    if (!dateStr) return '';
    const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1] || '';
        return `${day} ${month} ${parts[0]}`;
    }
    return dateStr;
}

// Strip HTML tags
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
}

// Blog Animations
function initializeBlogAnimations() {
    const blogCards = document.querySelectorAll('.blog-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('fade-in-up');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    blogCards.forEach(card => {
        observer.observe(card);
    });
}

// Add Blog Page Styles
function addBlogPageStyles() {
    if (!document.getElementById('blog-page-styles')) {
        const style = document.createElement('style');
        style.id = 'blog-page-styles';
        style.textContent = `
            .category-filters {
                display: flex;
                justify-content: center;
                gap: 1rem;
                flex-wrap: wrap;
                margin-bottom: 3rem;
            }
            
            .filter-btn {
                padding: 10px 24px;
                border: 2px solid var(--color-primary);
                background: transparent;
                color: var(--color-primary);
                border-radius: 25px;
                cursor: pointer;
                font-family: var(--font-sans);
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .filter-btn:hover,
            .filter-btn.active {
                background: var(--color-primary);
                color: white;
            }
            
            .blog-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2.5rem;
                margin-top: 3rem;
            }
            
            .blog-card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(30px);
            }
            
            .blog-card.fade-in-up {
                opacity: 1;
                transform: translateY(0);
                animation: fadeInUp 0.6s ease forwards;
            }
            
            .blog-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .blog-image {
                width: 100%;
                height: 250px;
                overflow: hidden;
            }
            
            .blog-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .blog-card:hover .blog-image img {
                transform: scale(1.1);
            }
            
            .blog-content {
                padding: 1.5rem 2rem 2rem;
            }
            
            .blog-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin-bottom: 1rem;
                font-size: 0.85rem;
                color: var(--color-dark-gray);
            }
            
            .blog-meta i {
                color: var(--color-secondary);
            }
            
            .category-badge {
                background: var(--color-accent-1);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .blog-content h3 {
                color: var(--color-primary);
                margin-bottom: 1rem;
                font-size: 1.4rem;
            }
            
            .blog-content p {
                color: var(--color-dark-gray);
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            
            .read-more {
                color: var(--color-secondary);
                text-decoration: none;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }
            
            .read-more:hover {
                color: var(--color-accent-2);
                gap: 1rem;
            }
            
            .read-more i {
                transition: transform 0.3s ease;
            }
            
            .read-more:hover i {
                transform: translateX(5px);
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .blog-grid {
                    grid-template-columns: 1fr;
                }
                
                .category-filters {
                    gap: 0.5rem;
                }
                
                .filter-btn {
                    padding: 8px 16px;
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

addBlogPageStyles();
