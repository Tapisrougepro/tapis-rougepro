// Tapis Rouge Pro - Index Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    addIndexPageStyles();
    await Promise.all([
        loadHomeServices(),
        loadGalleryImages(),
        loadFaq(),
        loadHeroContent()
    ]);
    initializeGalleryCarousel();
    initializeScrollReveal();
    initializeFaqToggle();
});

// ==================== HERO ====================
async function loadHeroContent() {
    try {
        if (typeof firebase === 'undefined' || !window.db) return;
        const doc = await window.db.collection('content').doc('hero').get();
        if (!doc.exists) return;
        const data = doc.data();
        const title = document.getElementById('heroTitle');
        const subtitle = document.getElementById('heroSubtitle');
        if (title && data.title) title.textContent = data.title;
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;
    } catch (e) { console.error('Hero load error:', e); }
}

// ==================== SERVICES ====================
async function loadHomeServices() {
    const grid = document.getElementById('homeServicesGrid');
    if (!grid) return;

    try {
        if (typeof firebase === 'undefined' || !window.db) return;

        const snapshot = await window.db.collection('services').get();
        const services = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            services.push({
                id: doc.id,
                icon: d.icon || 'fa-broom',
                title: d.title || '',
                description: d.description || ''
            });
        });

        if (services.length === 0) {
            grid.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">Aucun service disponible.</p>';
            return;
        }

        // Show max 6 services on home
        const display = services.slice(0, 6);
        grid.innerHTML = display.map(s => `
            <div class="service-card fade-in-up">
                <div class="service-icon"><i class="fas ${s.icon}"></i></div>
                <h3>${s.title}</h3>
                <p>${s.description}</p>
                <a href="services.html" class="read-more">En savoir plus →</a>
            </div>
        `).join('');
    } catch (e) {
        console.error('Services load error:', e);
        grid.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">Erreur de chargement.</p>';
    }
}

// ==================== GALLERY CAROUSEL ====================
let galleryImages = [];
let galleryIndex = 0;
let galleryAutoPlay = null;

async function loadGalleryImages() {
    const track = document.getElementById('galleryTrack');
    if (!track) return;

    try {
        if (typeof firebase === 'undefined' || !window.db) return;

        const snapshot = await window.db.collection('gallery').get();
        galleryImages = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            galleryImages.push({
                url: d.url || '',
                title: d.title || '',
                category: d.category || ''
            });
        });

        if (galleryImages.length === 0) {
            track.innerHTML = '<p style="text-align:center;padding:3rem;color:#666;">Aucune image disponible.</p>';
            return;
        }

        const fallback = 'https://via.placeholder.com/400x300/1b5154/ffffff?text=Galerie';
        track.innerHTML = galleryImages.map((img, i) => `
            <div class="gallery-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                <div class="gallery-item">
                    <img src="${img.url || fallback}" alt="${img.title}" loading="lazy">
                    <div class="gallery-overlay">
                        <p>${img.title}</p>
                    </div>
                </div>
            </div>
        `).join('');

        // Build dots
        const dotsContainer = document.getElementById('galleryDots');
        if (dotsContainer) {
            const totalPages = Math.ceil(galleryImages.length / getVisibleSlides());
            dotsContainer.innerHTML = Array.from({length: totalPages}, (_, i) =>
                `<span class="gallery-dot${i === 0 ? ' active' : ''}" data-page="${i}"></span>`
            ).join('');

            dotsContainer.querySelectorAll('.gallery-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    galleryIndex = parseInt(dot.dataset.page) * getVisibleSlides();
                    updateCarousel();
                });
            });
        }

    } catch (e) {
        console.error('Gallery load error:', e);
    }
}

function getVisibleSlides() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
}

function initializeGalleryCarousel() {
    const prev = document.getElementById('galleryPrev');
    const next = document.getElementById('galleryNext');

    if (prev) prev.addEventListener('click', () => { galleryIndex = Math.max(0, galleryIndex - 1); updateCarousel(); });
    if (next) next.addEventListener('click', () => {
        const max = galleryImages.length - getVisibleSlides();
        galleryIndex = Math.min(max, galleryIndex + 1);
        updateCarousel();
    });

    // Auto-play
    startAutoPlay();

    // Pause on hover
    const wrapper = document.querySelector('.gallery-carousel-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAutoPlay);
        wrapper.addEventListener('mouseleave', startAutoPlay);
    }

    // Responsive recalc
    window.addEventListener('resize', updateCarousel);

    // Click to open modal
    document.addEventListener('click', function(e) {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const img = item.querySelector('img');
            if (img) openImageModal(img.src, img.alt);
        }
    });
}

function updateCarousel() {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    const visible = getVisibleSlides();
    const slideWidth = 100 / visible;
    track.style.transform = `translateX(-${galleryIndex * slideWidth}%)`;

    // Update dots
    const dots = document.querySelectorAll('.gallery-dot');
    const currentPage = Math.floor(galleryIndex / visible);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentPage));
}

function startAutoPlay() {
    stopAutoPlay();
    galleryAutoPlay = setInterval(() => {
        const max = galleryImages.length - getVisibleSlides();
        galleryIndex = galleryIndex >= max ? 0 : galleryIndex + 1;
        updateCarousel();
    }, 4000);
}

function stopAutoPlay() {
    if (galleryAutoPlay) { clearInterval(galleryAutoPlay); galleryAutoPlay = null; }
}

function openImageModal(src, alt) {
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <img id="modalImage" src="" alt="">
                <p id="modalCaption"></p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.classList.remove('active');
            }
        });
    }
    document.getElementById('modalImage').src = src;
    document.getElementById('modalCaption').textContent = alt;
    modal.classList.add('active');
}

// ==================== FAQ ====================
async function loadFaq() {
    const container = document.getElementById('faqContainer');
    if (!container) return;

    try {
        if (typeof firebase === 'undefined' || !window.db) return;

        const doc = await window.db.collection('content').doc('faq').get();
        if (!doc.exists) { container.innerHTML = ''; return; }
        const data = doc.data();
        const items = data.items || [];

        if (items.length === 0) { container.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">Aucune question fréquente.</p>'; return; }

        container.innerHTML = items.map(item => `
            <div class="faq-item">
                <div class="faq-question">
                    <h3>${item.question || ''}</h3>
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <p>${item.answer || ''}</p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('FAQ load error:', e);
        container.innerHTML = '';
    }
}

function initializeFaqToggle() {
    document.addEventListener('click', function(e) {
        const question = e.target.closest('.faq-question');
        if (!question) return;
        const faqItem = question.parentElement;
        const toggle = question.querySelector('.faq-toggle');
        faqItem.classList.toggle('active');
        if (toggle) toggle.textContent = faqItem.classList.contains('active') ? '−' : '+';
    });
}

// ==================== SCROLL REVEAL ====================
function initializeScrollReveal() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('fade-in-up'), index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.service-card, .feature-item, .gallery-slide').forEach(el => observer.observe(el));
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(link.getAttribute('href'));
        if (targetElement) {
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            window.scrollTo({ top: targetElement.offsetTop - headerHeight, behavior: 'smooth' });
        }
    }
});

// ==================== STYLES ====================
function addIndexPageStyles() {
    if (document.getElementById('index-page-styles')) return;
    const style = document.createElement('style');
    style.id = 'index-page-styles';
    style.textContent = `
        /* Hero with logo */
        .hero-inner {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1200px;
            margin: 0 auto;
            gap: 3rem;
        }

        .hero-content {
            max-width: 600px;
            text-align: left;
            margin: 0;
        }

        .hero-buttons {
            justify-content: flex-start;
        }

        .hero-logo-wrapper {
            position: relative;
            flex-shrink: 0;
        }

        .hero-logo-img {
            width: 280px;
            height: 280px;
            object-fit: contain;
            animation: heroLogoFloat 4s ease-in-out infinite, heroLogoFadeIn 1.2s ease-out;
            filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            padding: 20px;
        }

        .hero-logo-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 320px;
            height: 320px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            animation: heroGlowPulse 3s ease-in-out infinite;
            pointer-events: none;
        }

        @keyframes heroLogoFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }

        @keyframes heroLogoFadeIn {
            from { opacity: 0; transform: scale(0.7) rotate(-10deg); }
            to { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        @keyframes heroGlowPulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }

        /* Gallery Carousel */
        .gallery-carousel-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 1200px;
            margin: 2rem auto 0;
            padding: 0 1rem;
        }

        .gallery-carousel {
            overflow: hidden;
            flex: 1;
            border-radius: 15px;
        }

        .gallery-track {
            display: flex;
            transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .gallery-slide {
            min-width: calc(100% / 3);
            padding: 0 0.5rem;
            box-sizing: border-box;
            transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .gallery-slide .gallery-item {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.12);
            cursor: pointer;
            height: 280px;
        }

        .gallery-slide .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .gallery-slide .gallery-item:hover img {
            transform: scale(1.1);
        }

        .gallery-slide .gallery-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1.5rem;
            background: linear-gradient(transparent, rgba(0,0,0,0.7));
            color: white;
            transform: translateY(100%);
            transition: transform 0.4s ease;
        }

        .gallery-slide .gallery-item:hover .gallery-overlay {
            transform: translateY(0);
        }

        .gallery-nav {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2px solid var(--color-primary);
            background: white;
            color: var(--color-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            flex-shrink: 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .gallery-nav:hover {
            background: var(--color-primary);
            color: white;
            transform: scale(1.1);
        }

        .gallery-dots {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }

        .gallery-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--color-light-gray);
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .gallery-dot.active {
            background: var(--color-accent-1);
            transform: scale(1.3);
        }

        /* FAQ */
        .faq-item {
            border: 1px solid var(--color-light-gray);
            border-radius: 10px;
            margin-bottom: 1rem;
            overflow: hidden;
            transition: box-shadow 0.3s ease;
        }

        .faq-item:hover {
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }

        .faq-question {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.2rem 1.5rem;
            cursor: pointer;
            background: white;
            transition: background 0.3s ease;
        }

        .faq-question:hover {
            background: #f9f9f9;
        }

        .faq-question h3 {
            font-size: 1.1rem;
            color: var(--color-primary);
            margin: 0;
        }

        .faq-toggle {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-accent-1);
            transition: transform 0.3s ease;
        }

        .faq-item.active .faq-toggle {
            transform: rotate(180deg);
        }

        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease, padding 0.3s ease;
            padding: 0 1.5rem;
            background: #fafafa;
        }

        .faq-item.active .faq-answer {
            max-height: 300px;
            padding: 1rem 1.5rem 1.5rem;
        }

        .faq-answer p {
            color: var(--color-dark-gray);
            line-height: 1.7;
        }

        /* Animations */
        .fade-in-up {
            animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero-inner {
                flex-direction: column;
                text-align: center;
                gap: 2rem;
            }

            .hero-content {
                text-align: center;
                max-width: 100%;
            }

            .hero-buttons {
                justify-content: center;
            }

            .hero-logo-img {
                width: 180px;
                height: 180px;
            }

            .hero-logo-glow {
                width: 220px;
                height: 220px;
            }

            .gallery-slide {
                min-width: 50%;
            }

            .gallery-nav {
                width: 36px;
                height: 36px;
                font-size: 0.9rem;
            }
        }

        @media (max-width: 480px) {
            .hero-logo-img {
                width: 140px;
                height: 140px;
            }

            .gallery-slide {
                min-width: 100%;
            }

            .gallery-slide .gallery-item {
                height: 220px;
            }
        }
    `;
    document.head.appendChild(style);
}
