// Tapis Rouge Pro - About Page JavaScript

// About page specific functionality
document.addEventListener('DOMContentLoaded', async function() {
    await loadAboutContent();
    initializeStoryAnimations();
    initializeValuesAnimation();
    initializeTeamHover();
    initializeCertifications();
    initializeStatsCounter();
});

// Load About Content from Firestore
async function loadAboutContent() {
    try {
        if (typeof firebase === 'undefined' || !window.db) {
            console.warn('Firebase not available, using static content');
            return;
        }

        const doc = await window.db.collection('content').doc('about').get();
        if (!doc.exists) return;

        const data = doc.data();
        if (!data) return;

        // Story section
        if (data.story) {
            setText('aboutStoryTitle', data.story.title);
            setText('aboutStorySubtitle', data.story.subtitle);
            setText('aboutStoryP1', data.story.p1);
            setText('aboutStoryP2', data.story.p2);
            setText('aboutStoryP3', data.story.p3);

            if (data.story.stats && Array.isArray(data.story.stats)) {
                const statItems = document.querySelectorAll('#aboutStoryStats .stat-item');
                data.story.stats.forEach((stat, i) => {
                    const item = statItems[i];
                    if (item) {
                        const num = item.querySelector('.stat-number');
                        const lbl = item.querySelector('.stat-label');
                        if (num) num.textContent = stat.value || '';
                        if (lbl) lbl.textContent = stat.label || '';
                    }
                });
            }
        }

        // Mission section
        if (data.mission) {
            setText('aboutMissionTitle', data.mission.title);
            setText('aboutMissionSubtitle', data.mission.subtitle);
            if (data.mission.items && Array.isArray(data.mission.items)) {
                const grid = document.getElementById('aboutMissionGrid');
                if (grid) {
                    grid.innerHTML = data.mission.items.map(item => `
                        <div class="feature-item">
                            <div class="feature-icon"><i class="fas ${item.icon || 'fa-star'}"></i></div>
                            <div class="feature-content">
                                <h4>${item.title || ''}</h4>
                                <p>${item.text || ''}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }

        // Values section
        if (data.values) {
            setText('aboutValuesTitle', data.values.title);
            setText('aboutValuesSubtitle', data.values.subtitle);
            if (data.values.items && Array.isArray(data.values.items)) {
                const grid = document.getElementById('aboutValuesGrid');
                if (grid) {
                    grid.innerHTML = data.values.items.map(item => `
                        <div class="value-item">
                            <div class="value-icon"><i class="fas ${item.icon || 'fa-star'}"></i></div>
                            <h3>${item.title || ''}</h3>
                            <p>${item.text || ''}</p>
                        </div>
                    `).join('');
                }
            }
        }

        // Team section
        if (data.team) {
            setText('aboutTeamTitle', data.team.title);
            setText('aboutTeamSubtitle', data.team.subtitle);
            if (data.team.items && Array.isArray(data.team.items)) {
                const grid = document.getElementById('aboutTeamGrid');
                if (grid) {
                    grid.innerHTML = data.team.items.map(member => `
                        <div class="team-member">
                            <div class="member-photo">
                                <img src="${member.photo || 'https://via.placeholder.com/300x300/1b5154/ffffff?text=Membre'}" alt="${member.name || ''}" loading="lazy">
                            </div>
                            <div class="member-info">
                                <h4>${member.name || ''}</h4>
                                <p class="member-title">${member.title || ''}</p>
                                <p>${member.bio || ''}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }

        // Certifications section
        if (data.certifications) {
            setText('aboutCertTitle', data.certifications.title);
            setText('aboutCertSubtitle', data.certifications.subtitle);
            if (data.certifications.items && Array.isArray(data.certifications.items)) {
                const grid = document.getElementById('aboutCertGrid');
                if (grid) {
                    grid.innerHTML = data.certifications.items.map(item => `
                        <div class="cert-item">
                            <div class="cert-icon"><i class="fas ${item.icon || 'fa-certificate'}"></i></div>
                            <h4>${item.title || ''}</h4>
                            <p>${item.text || ''}</p>
                        </div>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// Helper to safely set text content
function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined && text !== null) el.textContent = text;
}

// Story Section Animations
function initializeStoryAnimations() {
    const storyText = document.querySelector('.story-text');
    const storyStats = document.querySelector('.story-stats');
    
    if (storyText && storyStats) {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('story-text')) {
                        entry.target.classList.add('fade-in-left');
                    } else if (entry.target.classList.contains('story-stats')) {
                        entry.target.classList.add('fade-in-right');
                        // Start stats counter when visible
                        startStatsCounter();
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        observer.observe(storyText);
        observer.observe(storyStats);
    }
}

// Values Animation
function initializeValuesAnimation() {
    const valueItems = document.querySelectorAll('.value-item');
    
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
    
    valueItems.forEach(item => {
        observer.observe(item);
    });
}

// Team Section Hover Effects
function initializeTeamHover() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.classList.add('hovered');
        });
        
        member.addEventListener('mouseleave', function() {
            this.classList.remove('hovered');
        });
    });
}

// Certifications Animation
function initializeCertifications() {
    const certItems = document.querySelectorAll('.cert-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('fade-in-up');
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    certItems.forEach(item => {
        observer.observe(item);
    });
}

// Stats Counter Animation
function startStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/\D/g, ''));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                if (stat.textContent.includes('2014')) {
                    stat.textContent = Math.floor(current);
                } else if (stat.textContent.includes('+')) {
                    stat.textContent = Math.floor(current) + '+';
                } else {
                    stat.textContent = Math.floor(current);
                }
                requestAnimationFrame(updateCounter);
            } else {
                // Set final value
                if (stat.textContent.includes('2014')) {
                    stat.textContent = '2014';
                } else if (stat.textContent.includes('+')) {
                    stat.textContent = target + '+';
                } else {
                    stat.textContent = target;
                }
            }
        };
        
        updateCounter();
    });
}

// Add CSS animations dynamically
function addAboutPageStyles() {
    if (!document.getElementById('about-page-styles')) {
        const style = document.createElement('style');
        style.id = 'about-page-styles';
        style.textContent = `
            .story-content {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 4rem;
                align-items: center;
                margin-top: 3rem;
            }
            
            .story-text p {
                font-size: 1.1rem;
                line-height: 1.8;
                color: var(--color-dark-gray);
                margin-bottom: 1.5rem;
            }
            
            .story-stats {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            
            .stat-item {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, var(--color-primary) 0%, #0d3538 100%);
                border-radius: 15px;
                color: white;
                transition: transform 0.3s ease;
            }
            
            .stat-item:hover {
                transform: translateY(-5px);
            }
            
            .stat-number {
                font-size: 3rem;
                font-weight: 800;
                font-family: var(--font-serif);
                color: var(--color-accent-1);
                margin-bottom: 0.5rem;
            }
            
            .stat-label {
                font-size: 1rem;
                opacity: 0.9;
            }
            
            .values-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .value-item {
                text-align: center;
                padding: 2.5rem 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .value-item:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .value-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, var(--color-accent-3), var(--color-secondary));
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 2rem;
                color: white;
            }
            
            .value-item h3 {
                color: var(--color-primary);
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            
            .value-item p {
                color: var(--color-dark-gray);
                line-height: 1.6;
            }
            
            .team-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 3rem;
                margin-top: 3rem;
            }
            
            .team-member {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .team-member:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .member-photo {
                height: 250px;
                overflow: hidden;
            }
            
            .member-photo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .team-member:hover .member-photo img {
                transform: scale(1.1);
            }
            
            .member-info {
                padding: 2rem;
            }
            
            .member-info h4 {
                color: var(--color-primary);
                margin-bottom: 0.5rem;
                font-size: 1.3rem;
            }
            
            .member-title {
                color: var(--color-accent-1);
                font-weight: 600;
                margin-bottom: 1rem;
            }
            
            .member-info p {
                color: var(--color-dark-gray);
                line-height: 1.6;
            }
            
            .certifications-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .cert-item {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .cert-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .cert-icon {
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
            
            .cert-item h4 {
                color: var(--color-primary);
                margin-bottom: 1rem;
                font-size: 1.2rem;
            }
            
            .cert-item p {
                color: var(--color-dark-gray);
                line-height: 1.6;
            }
            
            /* Animation classes */
            .fade-in-left {
                animation: fadeInLeft 0.8s ease-out;
            }
            
            .fade-in-right {
                animation: fadeInRight 0.8s ease-out;
            }
            
            @keyframes fadeInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes fadeInRight {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .story-content {
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                
                .story-stats {
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: space-around;
                }
                
                .stat-item {
                    flex: 1;
                    min-width: 120px;
                    padding: 1.5rem 1rem;
                }
                
                .stat-number {
                    font-size: 2rem;
                }
                
                .values-grid {
                    grid-template-columns: 1fr;
                }
                
                .team-grid {
                    grid-template-columns: 1fr;
                }
                
                .certifications-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 480px) {
                .story-stats {
                    flex-direction: column;
                }
                
                .stat-item {
                    min-width: auto;
                }
                
                .value-item,
                .cert-item {
                    padding: 1.5rem;
                }
                
                .member-info {
                    padding: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
addAboutPageStyles();
