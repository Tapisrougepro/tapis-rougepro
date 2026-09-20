// Tapis Rouge Pro - Services Page JavaScript

// Services page specific functionality
document.addEventListener('DOMContentLoaded', async function() {
    await initializeServicesData();
    initializeCategoryFilters();
    initializeServiceAnimations();
    initializeProcessTimeline();
});

// Services Data - loaded dynamically from Firestore
async function initializeServicesData() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    try {
        // Show loading state
        servicesGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

        // Check if Firebase is available
        if (typeof firebase === 'undefined' || !window.db) {
            console.warn('Firebase not available, using fallback services');
            displayServices([]);
            return;
        }

        const snapshot = await window.db.collection('services').get();
        const services = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            services.push({
                id: doc.id,
                title: data.title || 'Service',
                category: data.category || 'commercial',
                icon: data.icon || 'fa-broom',
                description: data.description || '',
                longDesc: data.longDesc || '',
                frequency: data.frequency || '',
                image: data.image || ''
            });
        });

        displayServices(services);
        setupServiceInteractions(services);
    } catch (error) {
        console.error('Error loading services from Firestore:', error);
        servicesGrid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">Impossible de charger les services. Veuillez réessayer plus tard.</p>';
    }
}

// Display Services
function displayServices(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    if (services.length === 0) {
        servicesGrid.innerHTML = '<p style="text-align:center; padding:3rem; color:#666; grid-column:1/-1;">Aucun service disponible pour le moment.</p>';
        return;
    }

    const fallbackImage = 'https://via.placeholder.com/400x300/c41e3a/ffffff?text=Service';

    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" data-category="${service.category}" data-id="${service.id}">
            <div class="service-image">
                <img src="${service.image || fallbackImage}" alt="${service.title}" loading="lazy">
                <div class="service-overlay">
                    <button class="view-details-btn" data-id="${service.id}">
                        <i class="fas fa-eye"></i> Voir détails
                    </button>
                </div>
            </div>
            <div class="service-content">
                <div class="service-icon">
                    <i class="fas ${service.icon}"></i>
                </div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <div class="service-category">
                    <span class="category-badge ${service.category}">${getCategoryName(service.category)}</span>
                </div>
                <a href="#service-details" class="learn-more-btn" data-id="${service.id}">
                    En savoir plus <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
}

// Get Category Name
function getCategoryName(category) {
    const names = {
        'commercial': 'Commercial',
        'residential': 'Résidentiel',
        'specialized': 'Spécialisé'
    };
    return names[category] || category;
}

// Category Filters
function initializeCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;

            // Filter services
            serviceCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.classList.add('fade-in-up');
                    }, 100);
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in-up');
                }
            });
        });
    });
}

// Service Interactions
function setupServiceInteractions(services) {
    // View details buttons
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceId = parseInt(this.dataset.id);
            const service = services.find(s => s.id === serviceId);
            if (service) {
                showServiceModal(service);
            }
        });
    });

    // Learn more buttons
    const learnMoreBtns = document.querySelectorAll('.learn-more-btn');
    learnMoreBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceId = parseInt(this.dataset.id);
            const service = services.find(s => s.id === serviceId);
            if (service) {
                scrollToServiceDetails(service);
            }
        });
    });
}

// Show Service Modal
function showServiceModal(service) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('serviceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'serviceModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    // Build modal content based on available data (Firestore vs legacy format)
    const hasFeatures = service.features && service.features.length > 0;
    const hasSpaces = service.spaces;
    const hasLongDesc = service.longDesc;

    let detailsHtml = '';
    if (hasFeatures) {
        detailsHtml += `
            <div class="service-features">
                <h4>Services inclus</h4>
                <ul>
                    ${service.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
            </div>`;
    }
    if (hasSpaces) {
        detailsHtml += `
            <div class="service-spaces">
                <h4>Espaces desservis</h4>
                <p>${service.spaces}</p>
            </div>`;
    }
    if (hasLongDesc && !hasFeatures && !hasSpaces) {
        detailsHtml += `
            <div class="service-longdesc">
                <h4>Description détaillée</h4>
                <p>${service.longDesc}</p>
            </div>`;
    }

    modal.innerHTML = `
        <div class="modal-content service-modal">
            <button class="modal-close">&times;</button>
            <div class="service-modal-header">
                <div class="service-icon">
                    <i class="fas ${service.icon}"></i>
                </div>
                <h2>${service.title}</h2>
                <span class="category-badge ${service.category}">${getCategoryName(service.category)}</span>
            </div>
            <div class="service-modal-body">
                <div class="service-modal-image">
                    <img src="${service.image || 'https://via.placeholder.com/400x300/c41e3a/ffffff?text=Service'}" alt="${service.title}">
                </div>
                <div class="service-modal-info">
                    <p>${service.description}</p>
                    ${detailsHtml}
                    <div class="service-frequency">
                        <h4>Fréquences disponibles</h4>
                        <p>${service.frequency || 'Sur demande'}</p>
                    </div>
                    <div class="service-modal-actions">
                        <a href="quote.html" class="btn-primary">Demander un devis</a>
                        <a href="contact.html" class="btn-secondary">Poser une question</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Show modal
    modal.classList.add('active');

    // Close modal handlers
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Scroll to Service Details
function scrollToServiceDetails(service) {
    const detailsSection = document.getElementById('service-details');
    if (detailsSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = detailsSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Highlight the relevant detail card
        setTimeout(() => {
            const detailCards = document.querySelectorAll('.detail-card');
            detailCards.forEach(card => {
                const title = card.querySelector('h3').textContent;
                if (title === service.title) {
                    card.classList.add('highlighted');
                    setTimeout(() => {
                        card.classList.remove('highlighted');
                    }, 3000);
                }
            });
        }, 500);
    }
}

// Service Animations
function initializeServiceAnimations() {
    const serviceCards = document.querySelectorAll('.service-card');
    const detailCards = document.querySelectorAll('.detail-card');

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

    serviceCards.forEach(card => {
        observer.observe(card);
    });

    detailCards.forEach(card => {
        observer.observe(card);
    });
}

// Process Timeline Animation
function initializeProcessTimeline() {
    const processSteps = document.querySelectorAll('.process-step');

    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    processSteps.forEach(step => {
        observer.observe(step);
    });
}

// Add Service Page Styles
function addServicePageStyles() {
    if (!document.getElementById('service-page-styles')) {
        const style = document.createElement('style');
        style.id = 'service-page-styles';
        style.textContent = `
            .category-filters {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin: 2rem 0;
                flex-wrap: wrap;
            }
            
            .filter-btn {
                background: white;
                border: 2px solid var(--color-light-gray);
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                color: var(--color-dark-gray);
            }
            
            .filter-btn:hover {
                border-color: var(--color-secondary);
                color: var(--color-secondary);
            }
            
            .filter-btn.active {
                background: var(--color-secondary);
                border-color: var(--color-secondary);
                color: white;
            }
            
            .service-card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                position: relative;
            }
            
            .service-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .service-image {
                position: relative;
                height: 200px;
                overflow: hidden;
            }
            
            .service-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .service-card:hover .service-image img {
                transform: scale(1.1);
            }
            
            .service-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .service-card:hover .service-overlay {
                opacity: 1;
            }
            
            .view-details-btn {
                background: var(--color-accent-1);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }
            
            .view-details-btn:hover {
                background: var(--color-accent-2);
                transform: translateY(-2px);
            }
            
            .service-content {
                padding: 1.5rem;
            }
            
            .service-category {
                margin: 1rem 0;
            }
            
            .category-badge {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
                text-transform: uppercase;
            }
            
            .category-badge.commercial {
                background: var(--color-accent-3);
                color: var(--color-secondary);
            }
            
            .category-badge.residential {
                background: var(--color-accent-1);
                color: white;
            }
            
            .category-badge.specialized {
                background: var(--color-accent-2);
                color: white;
            }
            
            .learn-more-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--color-secondary);
                font-weight: 600;
                text-decoration: none;
                transition: gap 0.3s ease;
            }
            
            .learn-more-btn:hover {
                gap: 1rem;
            }
            
            .process-timeline {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .process-step {
                text-align: center;
                position: relative;
            }
            
            .step-number {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, var(--color-primary), #0d3538);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0 auto 1.5rem;
                position: relative;
                z-index: 1;
            }
            
            .process-step:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 30px;
                right: -50%;
                width: 100%;
                height: 2px;
                background: linear-gradient(to right, var(--color-primary), transparent);
                z-index: 0;
            }
            
            .step-content h4 {
                color: var(--color-primary);
                margin-bottom: 1rem;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .detail-card {
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .detail-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .detail-card.highlighted {
                border: 3px solid var(--color-accent-1);
                transform: translateY(-5px);
            }
            
            .detail-features ul {
                list-style: none;
                padding: 0;
                margin: 1rem 0;
            }
            
            .detail-features li {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                color: var(--color-dark-gray);
            }
            
            .detail-features .fa-check {
                color: var(--color-accent-1);
            }
            
            .detail-spaces,
            .detail-frequency {
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--color-light-gray);
            }
            
            .detail-spaces h4,
            .detail-frequency h4 {
                color: var(--color-primary);
                margin-bottom: 0.5rem;
                font-size: 1rem;
            }
            
            .detail-spaces p,
            .detail-frequency p {
                color: var(--color-dark-gray);
                font-size: 0.95rem;
            }
            
            .pricing-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .pricing-card {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .pricing-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .pricing-icon {
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 1.8rem;
                color: white;
            }
            
            .pricing-card h3 {
                color: var(--color-primary);
                margin-bottom: 1rem;
            }
            
            .pricing-card p {
                color: var(--color-dark-gray);
                line-height: 1.6;
            }
            
            .service-modal {
                max-width: 800px;
                width: 90%;
            }
            
            .service-modal-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .service-modal-header .service-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, var(--color-primary), #0d3538);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
                font-size: 2rem;
                color: white;
            }
            
            .service-modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                align-items: start;
            }
            
            .service-modal-image img {
                width: 100%;
                border-radius: 10px;
            }
            
            .service-features,
            .service-spaces,
            .service-frequency {
                margin-bottom: 1.5rem;
            }
            
            .service-features h4,
            .service-spaces h4,
            .service-frequency h4 {
                color: var(--color-primary);
                margin-bottom: 0.5rem;
            }
            
            .service-modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            .service-modal-actions .btn-primary,
            .service-modal-actions .btn-secondary {
                flex: 1;
                text-align: center;
                padding: 12px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .service-modal-actions .btn-primary {
                background: var(--color-accent-1);
                color: white;
            }
            
            .service-modal-actions .btn-secondary {
                background: transparent;
                color: var(--color-secondary);
                border: 2px solid var(--color-secondary);
            }
            
            .service-modal-actions .btn-primary:hover {
                background: var(--color-accent-2);
            }
            
            .service-modal-actions .btn-secondary:hover {
                background: var(--color-secondary);
                color: white;
            }
            
            /* Animations */
            .process-step.animate-in {
                animation: slideInUp 0.6s ease-out;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .category-filters {
                    justify-content: flex-start;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                }
                
                .process-timeline {
                    grid-template-columns: 1fr;
                }
                
                .process-step:not(:last-child)::after {
                    display: none;
                }
                
                .details-grid {
                    grid-template-columns: 1fr;
                }
                
                .pricing-info {
                    grid-template-columns: 1fr;
                }
                
                .service-modal-body {
                    grid-template-columns: 1fr;
                }
                
                .service-modal-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
addServicePageStyles();
