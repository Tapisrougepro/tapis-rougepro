// Tapis Rouge Pro - Administration Panel JavaScript
// Implements: Auth, Dashboard, Services CRUD, Blog CRUD, Requests, Content, Gallery, Users

// ==================== AUTH & SESSION ====================
const AUTH_KEY = 'trp_admin_auth';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

async function initAdmin() {
    checkAuth();
    setupEventListeners();
    setupCloudinaryUpload();
    if (isAuthenticated()) {
        await migrateToFirestore();
        loadDashboard();
        setupNavigation();
        initNotifications();
    }
}

function checkAuth() {
    const auth = getAuthData();
    if (auth && auth.expires > Date.now()) {
        showAdminPanel();
        document.getElementById('adminName').textContent = auth.name || 'Administrateur';
    } else {
        clearAuth();
        showLoginScreen();
    }
}

function isAuthenticated() {
    const auth = getAuthData();
    return auth && auth.expires > Date.now();
}

function getAuthData() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch(e) { return null; }
}

function setAuth(data) {
    data.expires = Date.now() + SESSION_DURATION;
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
}

// ==================== LOGIN / LOGOUT ====================
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    // Logout
    document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
    // Navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            await navigateToSection(section);
        });
    });
    // Quick cards
    document.querySelectorAll('.quick-card').forEach(card => {
        card.addEventListener('click', async () => {
            await navigateToSection(card.getAttribute('data-nav'));
        });
    });
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.admin-section') || btn.closest('.tabs').parentElement;
            const tabName = btn.getAttribute('data-tab');
            switchTab(parent, tabName);
        });
    });
    // Service modal
    document.getElementById('btnAddService')?.addEventListener('click', () => { resetForm('serviceForm'); openModal('serviceModal', 'Ajouter un service'); });
    document.getElementById('closeServiceModal')?.addEventListener('click', () => closeModal('serviceModal'));
    document.getElementById('cancelServiceModal')?.addEventListener('click', () => closeModal('serviceModal'));
    document.getElementById('serviceForm')?.addEventListener('submit', saveService);
    // Article modal
    document.getElementById('btnAddArticle')?.addEventListener('click', () => { resetForm('articleForm'); openModal('articleModal', 'Nouvel article'); });
    document.getElementById('closeArticleModal')?.addEventListener('click', () => closeModal('articleModal'));
    document.getElementById('cancelArticleModal')?.addEventListener('click', () => closeModal('articleModal'));
    document.getElementById('articleForm')?.addEventListener('submit', saveArticle);
    // User modal
    document.getElementById('btnAddUser')?.addEventListener('click', () => { resetForm('userForm'); openModal('userModal', 'Ajouter un utilisateur'); });
    document.getElementById('closeUserModal')?.addEventListener('click', () => closeModal('userModal'));
    document.getElementById('cancelUserModal')?.addEventListener('click', () => closeModal('userModal'));
    document.getElementById('userForm')?.addEventListener('submit', saveUser);
    // Image modal
    document.getElementById('btnAddImage')?.addEventListener('click', () => { resetForm('imageForm'); openModal('imageModal', 'Ajouter une image'); });
    document.getElementById('closeImageModal')?.addEventListener('click', () => closeModal('imageModal'));
    document.getElementById('cancelImageModal')?.addEventListener('click', () => closeModal('imageModal'));
    document.getElementById('imageForm')?.addEventListener('submit', saveImage);
    // Content saves
    document.getElementById('saveHero')?.addEventListener('click', saveHeroContent);
    document.getElementById('saveAbout')?.addEventListener('click', saveAboutContent);
    document.getElementById('addFaqItem')?.addEventListener('click', addFaqItem);
    document.getElementById('addValueItem')?.addEventListener('click', addValueItem);
    document.getElementById('addTeamMember')?.addEventListener('click', addTeamMember);
    document.getElementById('addCertItem')?.addEventListener('click', addCertItem);
    document.getElementById('saveCompany')?.addEventListener('click', saveCompanyInfo);
    // Image previews
    setupImagePreview('serviceImage', 'serviceImagePreview');
    setupImagePreview('articleImageInput', 'articleImagePreview');
    setupImagePreview('imageUrl', 'imagePreview');
    // Gallery filter
    document.getElementById('galleryFilter')?.addEventListener('change', loadGallery);
    // Gallery picker modal
    document.getElementById('closeGalleryPickerModal')?.addEventListener('click', () => closeModal('galleryPickerModal'));
    document.getElementById('cancelGalleryPickerModal')?.addEventListener('click', () => closeModal('galleryPickerModal'));
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const users = await dbGetAll('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        setAuth({ email: user.email, name: user.name, role: user.role });
        document.getElementById('loginError').style.display = 'none';
        showAdminPanel();
        document.getElementById('adminName').textContent = user.name;
        await migrateToFirestore();
        await loadDashboard();
        setupNavigation();
        initNotifications();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function handleLogout() {
    clearAuth();
    showLoginScreen();
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
}

// ==================== NAVIGATION ====================
async function navigateToSection(sectionName) {
    // Update sidebar active
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-menu a[data-section="${sectionName}"]`)?.classList.add('active');
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    // Show target section
    const target = document.getElementById(`section-${sectionName}`);
    if (target) {
        target.classList.add('active');
        document.getElementById('pageTitle').textContent = getSectionTitle(sectionName);
        // Load data for section
        if (sectionName === 'services') await loadServicesTable();
        if (sectionName === 'blog') await loadBlogTable();
        if (sectionName === 'requests') await loadRequests();
        if (sectionName === 'content') await loadContentData();
        if (sectionName === 'gallery') await loadGallery();
        if (sectionName === 'settings') await loadSettings();
    }
}

function getSectionTitle(name) {
    const titles = {
        dashboard: 'Tableau de bord', services: 'Gestion des Services',
        blog: 'Gestion des Articles', requests: 'Gestion des Demandes',
        content: 'Contenus Statiques', gallery: 'Galerie d\'images',
        settings: 'Paramètres'
    };
    return titles[name] || 'Administration';
}

function switchTab(container, tabName) {
    container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    container.querySelector(`.tab-btn[data-tab="${tabName}"]`)?.classList.add('active');
    container.querySelector(`#tab-${tabName}`)?.classList.add('active');
}

function setupNavigation() {
    navigateToSection('dashboard');
}

// ==================== MODALS ====================
function openModal(modalId, title) {
    document.getElementById(modalId).classList.add('active');
    const titleEl = document.querySelector(`#${modalId} .admin-modal-header h3`);
    if (titleEl && title) titleEl.textContent = title;
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
    // Clear hidden IDs
    const ids = ['serviceId','articleId','imageId','userId'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    // Hide all image previews
    document.querySelectorAll('.image-preview').forEach(p => p.classList.remove('active'));
}

function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('input', () => {
        if (input.value) {
            preview.src = input.value;
            preview.classList.add('active');
        } else {
            preview.classList.remove('active');
        }
    });
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    const services = await dbGetAll('services');
    const articles = await dbGetAll('articles');
    const contacts = await dbGetAll('contacts');
    const quotes = await dbGetAll('quotes');
    const images = await dbGetAll('gallery');
    document.getElementById('statServices').textContent = services.length;
    document.getElementById('statArticles').textContent = articles.length;
    document.getElementById('statContacts').textContent = contacts.filter(c => !c.processed).length;
    document.getElementById('statQuotes').textContent = quotes.filter(q => !q.processed).length;
    const statImages = document.getElementById('statImages');
    if (statImages) statImages.textContent = images.length;
    // Recent requests
    const recentList = document.getElementById('recentRequests');
    const allReq = [...contacts, ...quotes].sort((a,b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)).slice(0, 5);
    if (allReq.length > 0) {
        recentList.innerHTML = allReq.map(r => `
            <li>
                <div class="item-info">
                    <h4>${r.name || r.firstName + ' ' + r.lastName}</h4>
                    <p>${r.subject || 'Demande de soumission'} - ${new Date(r.timestamp || r.date).toLocaleDateString('fr-CA')}</p>
                </div>
                <span class="status-badge ${r.processed ? 'status-processed' : 'status-pending'}">${r.processed ? 'Traité' : 'En attente'}</span>
            </li>
        `).join('');
    }
}

// ==================== SERVICES CRUD ====================
function getDefaultServices() {
    return [
        { title: 'Entretien général', category: 'residential', icon: 'fa-broom', description: 'Nettoyage complet pour résidences.', longDesc: 'Description longue.', image: '', frequency: 'Mensuel' },
        { title: 'Entretien des planchers', category: 'residential', icon: 'fa-spray-can', description: 'Lavage et cirage de planchers.', longDesc: '', image: '', frequency: 'Trimestriel' },
        { title: 'Désinfection', category: 'specialized', icon: 'fa-shield-virus', description: 'Désinfection professionnelle.', longDesc: '', image: '', frequency: 'Selon besoin' },
        { title: 'Nettoyage de bureaux', category: 'commercial', icon: 'fa-building', description: 'Entretien commercial complet.', longDesc: '', image: '', frequency: 'Hebdomadaire' },
        { title: 'Nettoyage salles de bain', category: 'residential', icon: 'fa-bath', description: 'Désinfection complète.', longDesc: '', image: '', frequency: 'Hebdomadaire' },
        { title: 'Nettoyage vitres', category: 'commercial', icon: 'fa-window-maximize', description: 'Intérieur et extérieur.', longDesc: '', image: '', frequency: 'Mensuel' },
        { title: 'Nettoyage cuisine', category: 'commercial', icon: 'fa-utensils', description: 'Normes d\'hygiène alimentaire.', longDesc: '', image: '', frequency: 'Quotidien' },
        { title: 'Nettoyage post-travaux', category: 'specialized', icon: 'fa-hammer', description: 'Remise en état après travaux.', longDesc: '', image: '', frequency: 'Ponctuel' },
        { title: 'Désinfection COVID-19', category: 'specialized', icon: 'fa-virus-slash', description: 'Protocoles sanitaires.', longDesc: '', image: '', frequency: 'Selon besoin' }
    ];
}

async function loadServicesTable() {
    const tbody = document.getElementById('servicesTable');
    const services = await dbGetAll('services');
    tbody.innerHTML = services.map(s => `
        <tr>
            <td>${s.title}</td>
            <td><span class="category-badge">${s.category}</span></td>
            <td><i class="fas ${s.icon || 'fa-broom'}"></i></td>
            <td>
                <button class="btn-edit" onclick="editService('${s.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-danger" onclick="deleteService('${s.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function saveService(e) {
    e.preventDefault();
    const id = document.getElementById('serviceId').value;
    const serviceData = {
        title: document.getElementById('serviceTitle').value,
        category: document.getElementById('serviceCategory').value,
        icon: document.getElementById('serviceIcon').value,
        description: document.getElementById('serviceDesc').value,
        longDesc: document.getElementById('serviceLongDesc').value,
        image: document.getElementById('serviceImage').value,
        frequency: document.getElementById('serviceFrequency').value
    };
    if (id) {
        await dbUpdate('services', id, serviceData);
    } else {
        await dbAdd('services', serviceData);
    }
    closeModal('serviceModal');
    await loadServicesTable();
    await loadDashboard();
}

async function editService(id) {
    try {
        const service = await dbGetDoc('services', id);
        if (!service) { console.warn('Service non trouvé:', id); return; }
        resetForm('serviceForm');
        document.getElementById('serviceId').value = service.id || '';
        const titleEl = document.getElementById('serviceTitle');
        if (titleEl) titleEl.value = service.title || '';
        const catEl = document.getElementById('serviceCategory');
        if (catEl) catEl.value = service.category || 'residential';
        const iconEl = document.getElementById('serviceIcon');
        if (iconEl) iconEl.value = service.icon || '';
        const descEl = document.getElementById('serviceDesc');
        if (descEl) descEl.value = service.description || '';
        const longDescEl = document.getElementById('serviceLongDesc');
        if (longDescEl) longDescEl.value = service.longDesc || '';
        const imgEl = document.getElementById('serviceImage');
        if (imgEl) imgEl.value = service.image || '';
        const freqEl = document.getElementById('serviceFrequency');
        if (freqEl) freqEl.value = service.frequency || '';
        const preview = document.getElementById('serviceImagePreview');
        if (preview && service.image) {
            preview.src = service.image;
            preview.classList.add('active');
        }
        openModal('serviceModal', 'Modifier le service');
    } catch (e) {
        console.error('Erreur editService:', e);
        showToast('Erreur lors du chargement du service');
    }
}

async function deleteService(id) {
    if (!confirm('Supprimer ce service ?')) return;
    await dbDelete('services', id);
    await loadServicesTable();
    await loadDashboard();
}

// ==================== BLOG CRUD ====================
function getDefaultArticles() {
    return [
        { title: 'Top 10 des produits de nettoyage écologiques', author: 'Sophie Gagnon', category: 'Écologie', date: '2024-04-15', image: 'https://via.placeholder.com/600x400/c41e3a/ffffff?text=Produits+Ecologiques', content: '<p>Contenu complet...</p>', excerpt: 'Découvrez notre sélection...' },
        { title: 'Comment maintenir vos bureaux propres', author: 'Jean-Pierre Martin', category: 'Conseils', date: '2024-04-10', image: 'https://via.placeholder.com/600x400/8b0000/ffffff?text=Nettoyage+Bureaux', content: '<p>Contenu...</p>', excerpt: 'Astuces pratiques...' },
        { title: 'Les tendances du nettoyage commercial en 2024', author: 'Marc Tremblay', category: 'Tendances', date: '2024-04-05', image: 'https://via.placeholder.com/600x400/d42029/ffffff?text=Tendances', content: '<p>Contenu...</p>', excerpt: 'Innovations...' },
        { title: 'Nouveaux protocoles de désinfection', author: 'Sophie Gagnon', category: 'Actualités', date: '2024-03-28', image: 'https://via.placeholder.com/600x400/8b0000/ffffff?text=Desinfection', content: '<p>Contenu...</p>', excerpt: 'Mise à jour...' },
        { title: 'Guide complet : entretenir vos planchers', author: 'Jean-Pierre Martin', category: 'Conseils', date: '2024-03-20', image: 'https://via.placeholder.com/600x400/ff6b6b/ffffff?text=Planchers', content: '<p>Contenu...</p>', excerpt: 'Bois, céramique...' },
        { title: 'Vers un nettoyage zéro déchet', author: 'Marc Tremblay', category: 'Écologie', date: '2024-03-15', image: 'https://via.placeholder.com/600x400/c41e3a/ffffff?text=Zero+Dechet', content: '<p>Contenu...</p>', excerpt: 'Démarche écologique...' }
    ];
}

async function loadBlogTable() {
    const tbody = document.getElementById('blogTable');
    const articles = await dbGetAll('articles');
    tbody.innerHTML = articles.map(a => `
        <tr>
            <td>${a.title}</td>
            <td>${a.author}</td>
            <td><span class="category-badge">${a.category}</span></td>
            <td>${new Date(a.date).toLocaleDateString('fr-CA')}</td>
            <td>
                <button class="btn-edit" onclick="editArticle('${a.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-danger" onclick="deleteArticle('${a.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function saveArticle(e) {
    e.preventDefault();
    const id = document.getElementById('articleId').value;
    const articleData = {
        title: document.getElementById('articleFormTitle').value,
        author: document.getElementById('articleAuthorInput').value,
        category: document.getElementById('articleCategoryInput').value,
        date: document.getElementById('articleDateInput').value,
        image: document.getElementById('articleImageInput').value,
        content: document.getElementById('articleContentInput').value,
        excerpt: document.getElementById('articleExcerptInput').value
    };
    if (id) {
        await dbUpdate('articles', id, articleData);
    } else {
        await dbAdd('articles', articleData);
    }
    closeModal('articleModal');
    await loadBlogTable();
    await loadDashboard();
}

async function editArticle(id) {
    try {
        const article = await dbGetDoc('articles', id);
        if (!article) { console.warn('Article non trouvé:', id); return; }
        document.getElementById('articleId').value = article.id || '';
        const t = document.getElementById('articleFormTitle');
        if (t) t.value = article.title || '';
        const a = document.getElementById('articleAuthorInput');
        if (a) a.value = article.author || '';
        const c = document.getElementById('articleCategoryInput');
        if (c) c.value = article.category || 'Conseils';
        const d = document.getElementById('articleDateInput');
        if (d) d.value = article.date || '';
        const img = document.getElementById('articleImageInput');
        if (img) img.value = article.image || '';
        const cont = document.getElementById('articleContentInput');
        if (cont) cont.value = article.content || '';
        const ex = document.getElementById('articleExcerptInput');
        if (ex) ex.value = article.excerpt || '';
        const preview = document.getElementById('articleImagePreview');
        if (preview && article.image) {
            preview.src = article.image;
            preview.classList.add('active');
        }
        openModal('articleModal', 'Modifier l\'article');
    } catch (e) {
        console.error('Erreur editArticle:', e);
        showToast('Erreur lors du chargement de l\'article');
    }
}

async function deleteArticle(id) {
    if (!confirm('Supprimer cet article ?')) return;
    await dbDelete('articles', id);
    await loadBlogTable();
    await loadDashboard();
}

// ==================== REQUESTS ====================
async function loadRequests() {
    await loadContactsTable();
    await loadQuotesTable();
}

async function loadContactsTable() {
    const tbody = document.getElementById('contactsTable');
    const contacts = await dbGetAll('contacts');
    contacts.sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));
    tbody.innerHTML = contacts.map((c) => `
        <tr class="${!c.processed ? 'row-unread' : ''}">
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.subject || '-'}</td>
            <td>${new Date(c.timestamp || c.date).toLocaleDateString('fr-CA')}</td>
            <td><span class="status-badge ${c.processed ? 'status-processed' : 'status-pending'}">${c.processed ? 'Traité' : 'En attente'}</span></td>
            <td>
                <button class="btn-edit" onclick="viewContactDetail('${c.id}')" title="Voir"><i class="fas fa-eye"></i></button>
                <button class="btn-edit" onclick="toggleRequestStatus('contact', '${c.id}')" title="${c.processed ? 'Remettre en attente' : 'Marquer traité'}"><i class="fas ${c.processed ? 'fa-undo' : 'fa-check'}"></i></button>
                <button class="btn-danger" onclick="deleteRequest('contact', '${c.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;padding:2rem;">Aucune demande de contact</td></tr>';
}

async function loadQuotesTable() {
    const tbody = document.getElementById('quotesTable');
    const quotes = await dbGetAll('quotes');
    quotes.sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));
    tbody.innerHTML = quotes.map((q) => `
        <tr class="${!q.processed ? 'row-unread' : ''}">
            <td>${q.firstName} ${q.lastName}</td>
            <td>${q.company || '-'}</td>
            <td>${q.email}</td>
            <td>${(q.services || []).join(', ')}</td>
            <td>${new Date(q.timestamp || q.date).toLocaleDateString('fr-CA')}</td>
            <td><span class="status-badge ${q.processed ? 'status-processed' : 'status-pending'}">${q.processed ? 'Traité' : 'En attente'}</span></td>
            <td>
                <button class="btn-edit" onclick="viewQuoteDetail('${q.id}')" title="Voir"><i class="fas fa-eye"></i></button>
                <button class="btn-edit" onclick="toggleRequestStatus('quote', '${q.id}')" title="${q.processed ? 'Remettre en attente' : 'Marquer traité'}"><i class="fas ${q.processed ? 'fa-undo' : 'fa-check'}"></i></button>
                <button class="btn-danger" onclick="deleteRequest('quote', '${q.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7" style="text-align:center;padding:2rem;">Aucune demande de soumission</td></tr>';
}

async function toggleRequestStatus(type, id) {
    if (type === 'contact') {
        const doc = await dbGetDoc('contacts', id);
        if (doc) await dbUpdate('contacts', id, { processed: !doc.processed });
        await loadContactsTable();
    } else {
        const doc = await dbGetDoc('quotes', id);
        if (doc) await dbUpdate('quotes', id, { processed: !doc.processed });
        await loadQuotesTable();
    }
    await loadDashboard();
    if (typeof refreshNotifications === 'function') refreshNotifications();
}

async function deleteRequest(type, id) {
    if (!confirm('Supprimer cette demande ?')) return;
    await dbDelete(type === 'contact' ? 'contacts' : 'quotes', id);
    if (type === 'contact') await loadContactsTable();
    else await loadQuotesTable();
    await loadDashboard();
    if (typeof refreshNotifications === 'function') refreshNotifications();
}

// ==================== STATIC CONTENT ====================
async function loadContentData() {
    const hero = await dbGetDoc('content', 'hero') || {};
    document.getElementById('heroTitle').value = hero.title || 'Tapis Rouge Pro';
    document.getElementById('heroSubtitle').value = hero.subtitle || 'Services de nettoyage professionnel et écologique';
    document.getElementById('heroDesc').value = hero.desc || 'Tapis Rouge Pro offre des services...';

    // About content
    const about = await dbGetDoc('content', 'about') || {};
    // Story
    const story = about.story || {};
    document.getElementById('aboutStoryTitle').value = story.title || 'Notre Histoire';
    document.getElementById('aboutStorySubtitle').value = story.subtitle || 'Une aventure entrepreneuriale née de la passion pour l\'excellence';
    document.getElementById('aboutStoryP1').value = story.p1 || '';
    document.getElementById('aboutStoryP2').value = story.p2 || '';
    document.getElementById('aboutStoryP3').value = story.p3 || '';
    const stats = story.stats || [{value:'2014',label:"Année de fondation"},{value:'500+',label:"Clients satisfaits"},{value:'10+',label:"Années d'expérience"},{value:'5',label:"Secteurs desservis"}];
    stats.forEach((s, i) => {
        const valEl = document.getElementById(`aboutStat${i+1}Value`);
        const labEl = document.getElementById(`aboutStat${i+1}Label`);
        if (valEl) valEl.value = s.value || '';
        if (labEl) labEl.value = s.label || '';
    });
    // Mission
    const mission = about.mission || {};
    document.getElementById('aboutMissionTitle').value = mission.title || 'Notre Mission & Vision';
    document.getElementById('aboutMissionSubtitle').value = mission.subtitle || 'Les piliers qui guident notre action quotidienne';
    const mItems = mission.items || [
        {title:'Notre Mission',icon:'fa-bullseye',text:'Offrir des services de nettoyage professionnel de qualité supérieure...'},
        {title:'Notre Vision',icon:'fa-eye',text:'Devenir le leader référent en nettoyage écologique au Québec...'},
        {title:'Notre Passion',icon:'fa-heart',text:'Transformer les espaces de vie et de travail...'}
    ];
    mItems.forEach((item, i) => {
        const t = document.getElementById(`aboutMission${i+1}Title`);
        const ic = document.getElementById(`aboutMission${i+1}Icon`);
        const tx = document.getElementById(`aboutMission${i+1}Text`);
        if (t) t.value = item.title || '';
        if (ic) ic.value = item.icon || '';
        if (tx) tx.value = item.text || '';
    });
    // Values
    const values = about.values || {};
    document.getElementById('aboutValuesTitle').value = values.title || 'Nos Valeurs';
    document.getElementById('aboutValuesSubtitle').value = values.subtitle || 'Les principes fondamentaux qui définissent notre entreprise';
    renderValuesList(values.items || getDefaultValues());
    // Team
    const team = about.team || {};
    document.getElementById('aboutTeamTitle').value = team.title || 'Notre Équipe';
    document.getElementById('aboutTeamSubtitle').value = team.subtitle || 'Des professionnels passionnés à votre service';
    renderTeamList(team.items || getDefaultTeam());
    // Certifications
    const certs = about.certifications || {};
    document.getElementById('aboutCertTitle').value = certs.title || 'Nos Certifications';
    document.getElementById('aboutCertSubtitle').value = certs.subtitle || 'La garantie de notre professionnalisme et de notre engagement';
    renderCertList(certs.items || getDefaultCerts());

    // FAQ
    const faqDoc = await dbGetDoc('content', 'faq');
    const faq = faqDoc?.items || getDefaultFaq();
    renderFaqList(faq);
}

function getDefaultFaq() {
    return [
        { question: 'Quels sont vos délais de réponse ?', answer: 'Nous répondons dans les 24 heures ouvrables.' },
        { question: 'Offrez-vous des services d\'urgence ?', answer: 'Oui, contactez-nous par téléphone.' },
        { question: 'Puis-je visiter vos bureaux ?', answer: 'Oui, sur rendez-vous du lundi au vendredi.' }
    ];
}

function renderFaqList(faq) {
    const container = document.getElementById('faqList');
    container.innerHTML = faq.map((item, i) => `
        <div style="border:1px solid #eaeaea;border-radius:8px;padding:1rem;margin-bottom:1rem;">
            <div class="form-group-admin"><label>Question ${i+1}</label><input type="text" class="faq-q" value="${item.question}" data-index="${i}"></div>
            <div class="form-group-admin"><label>Réponse</label><textarea class="faq-a" rows="3" data-index="${i}">${item.answer}</textarea></div>
            <button class="btn-danger" onclick="deleteFaqItem(${i})" style="font-size:0.8rem;"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
    `).join('');
}

async function saveHeroContent() {
    const data = {
        title: document.getElementById('heroTitle').value,
        subtitle: document.getElementById('heroSubtitle').value,
        desc: document.getElementById('heroDesc').value
    };
    await dbSetDoc('content', 'hero', data);
    showToast('Contenu Hero sauvegardé !');
}

async function saveAboutContent() {
    const data = {
        story: {
            title: document.getElementById('aboutStoryTitle').value,
            subtitle: document.getElementById('aboutStorySubtitle').value,
            p1: document.getElementById('aboutStoryP1').value,
            p2: document.getElementById('aboutStoryP2').value,
            p3: document.getElementById('aboutStoryP3').value,
            stats: [
                { value: document.getElementById('aboutStat1Value').value, label: document.getElementById('aboutStat1Label').value },
                { value: document.getElementById('aboutStat2Value').value, label: document.getElementById('aboutStat2Label').value },
                { value: document.getElementById('aboutStat3Value').value, label: document.getElementById('aboutStat3Label').value },
                { value: document.getElementById('aboutStat4Value').value, label: document.getElementById('aboutStat4Label').value }
            ]
        },
        mission: {
            title: document.getElementById('aboutMissionTitle').value,
            subtitle: document.getElementById('aboutMissionSubtitle').value,
            items: [
                { title: document.getElementById('aboutMission1Title').value, icon: document.getElementById('aboutMission1Icon').value, text: document.getElementById('aboutMission1Text').value },
                { title: document.getElementById('aboutMission2Title').value, icon: document.getElementById('aboutMission2Icon').value, text: document.getElementById('aboutMission2Text').value },
                { title: document.getElementById('aboutMission3Title').value, icon: document.getElementById('aboutMission3Icon').value, text: document.getElementById('aboutMission3Text').value }
            ]
        },
        values: {
            title: document.getElementById('aboutValuesTitle').value,
            subtitle: document.getElementById('aboutValuesSubtitle').value,
            items: collectValues()
        },
        team: {
            title: document.getElementById('aboutTeamTitle').value,
            subtitle: document.getElementById('aboutTeamSubtitle').value,
            items: collectTeam()
        },
        certifications: {
            title: document.getElementById('aboutCertTitle').value,
            subtitle: document.getElementById('aboutCertSubtitle').value,
            items: collectCerts()
        }
    };
    await dbSetDoc('content', 'about', data);
    showToast('Contenu À propos sauvegardé !');
}

// ==================== VALUES ====================
function getDefaultValues() {
    return [
        { title: 'Écologie', icon: 'fa-leaf', text: 'Nous plaçons l\'environnement au cœur de nos décisions...' },
        { title: 'Excellence', icon: 'fa-award', text: 'Nous ne faisons aucun compromis sur la qualité...' },
        { title: 'Intégrité', icon: 'fa-handshake', text: 'Nous agissons avec honnêteté, transparence et respect...' },
        { title: 'Collaboration', icon: 'fa-users', text: 'Nous croyons au pouvoir du travail d\'équipe...' },
        { title: 'Innovation', icon: 'fa-lightbulb', text: 'Nous restons à l\'affût des nouvelles technologies...' },
        { title: 'Sécurité', icon: 'fa-shield-alt', text: 'La sécurité de nos clients et de notre équipe est notre priorité...' }
    ];
}

function collectValues() {
    const items = [];
    document.querySelectorAll('.value-item-row').forEach(row => {
        items.push({
            title: row.querySelector('.value-title')?.value || '',
            icon: row.querySelector('.value-icon')?.value || '',
            text: row.querySelector('.value-text')?.value || ''
        });
    });
    return items;
}

function renderValuesList(values) {
    const container = document.getElementById('valuesList');
    container.innerHTML = values.map((item, i) => `
        <div class="value-item-row" style="border:1px solid #eaeaea;border-radius:8px;padding:1rem;margin-bottom:1rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div class="form-group-admin" style="margin-bottom:0.5rem;"><label>Titre ${i+1}</label><input type="text" class="value-title" value="${item.title || ''}"></div>
                <div class="form-group-admin" style="margin-bottom:0.5rem;"><label>Icône</label><input type="text" class="value-icon" value="${item.icon || ''}"></div>
            </div>
            <div class="form-group-admin"><label>Description</label><textarea class="value-text" rows="2">${item.text || ''}</textarea></div>
            <button class="btn-danger" onclick="deleteValueItem(${i})" style="font-size:0.8rem;margin-top:0.5rem;"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
    `).join('');
}

async function addValueItem() {
    const about = await dbGetDoc('content', 'about') || {};
    const values = about.values?.items || getDefaultValues();
    values.push({ title: 'Nouvelle valeur', icon: 'fa-star', text: '' });
    renderValuesList(values);
}

async function deleteValueItem(index) {
    const about = await dbGetDoc('content', 'about') || {};
    const values = about.values?.items || getDefaultValues();
    values.splice(index, 1);
    renderValuesList(values);
}

// ==================== TEAM ====================
function getDefaultTeam() {
    return [
        { name: 'Marc Tremblay', title: 'Directeur général & Fondateur', description: 'Avec plus de 15 ans d\'expérience...', image: '' },
        { name: 'Sophie Gagnon', title: 'Directrice des opérations', description: 'Sophie supervise toutes les opérations...', image: '' },
        { name: 'Jean-Pierre Martin', title: 'Superviseur qualité & formation', description: 'Jean-Pierre assure que nos équipes...', image: '' }
    ];
}

function collectTeam() {
    const items = [];
    document.querySelectorAll('.team-item-row').forEach(row => {
        items.push({
            name: row.querySelector('.team-name')?.value || '',
            title: row.querySelector('.team-title')?.value || '',
            description: row.querySelector('.team-desc')?.value || '',
            image: row.querySelector('.team-image')?.value || ''
        });
    });
    return items;
}

function renderTeamList(team) {
    const container = document.getElementById('teamList');
    container.innerHTML = team.map((item, i) => `
        <div class="team-item-row" style="border:1px solid #eaeaea;border-radius:8px;padding:1rem;margin-bottom:1rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div class="form-group-admin" style="margin-bottom:0.5rem;"><label>Nom ${i+1}</label><input type="text" class="team-name" value="${item.name || ''}"></div>
                <div class="form-group-admin" style="margin-bottom:0.5rem;"><label>Fonction</label><input type="text" class="team-title" value="${item.title || ''}"></div>
            </div>
            <div class="form-group-admin"><label>Description</label><textarea class="team-desc" rows="2">${item.description || ''}</textarea></div>
            <div style="display:flex;gap:0.5rem;align-items:center;margin-top:0.5rem;">
                <input type="hidden" class="team-image" value="${item.image || ''}">
                <button type="button" class="btn-secondary-admin" onclick="openGalleryPickerForTeam(${i})" style="font-size:0.85rem;"><i class="fas fa-images"></i> Choisir photo</button>
            </div>
            <button class="btn-danger" onclick="deleteTeamMember(${i})" style="font-size:0.8rem;margin-top:0.5rem;"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
    `).join('');
}

function openGalleryPickerForTeam(index) {
    window._teamPickerIndex = index;
    galleryPickerTargetInput = null;
    galleryPickerTargetPreview = null;
    loadGalleryPicker();
    // Override selectGalleryImage for team
    window._originalSelectGalleryImage = window.selectGalleryImage;
    window.selectGalleryImage = function(url) {
        const rows = document.querySelectorAll('.team-item-row');
        if (rows[window._teamPickerIndex]) {
            rows[window._teamPickerIndex].querySelector('.team-image').value = url;
        }
        closeModal('galleryPickerModal');
        window.selectGalleryImage = window._originalSelectGalleryImage;
    };
    openModal('galleryPickerModal');
}

async function addTeamMember() {
    const about = await dbGetDoc('content', 'about') || {};
    const team = about.team?.items || getDefaultTeam();
    team.push({ name: '', title: '', description: '', image: '' });
    renderTeamList(team);
}

async function deleteTeamMember(index) {
    const about = await dbGetDoc('content', 'about') || {};
    const team = about.team?.items || getDefaultTeam();
    team.splice(index, 1);
    renderTeamList(team);
}

// ==================== CERTIFICATIONS ====================
function getDefaultCerts() {
    return [
        { title: 'Certification Éco-Logo', icon: 'fa-certificate', text: 'Nos produits et procédés sont certifiés écologiques...' },
        { title: 'Normes de Désinfection', icon: 'fa-shield-virus', text: 'Nous suivons les protocoles de désinfection approuvés...' },
        { title: 'Santé et Sécurité', icon: 'fa-hard-hat', text: 'Certification CNESST et conformité complète...' },
        { title: 'Formation Continue', icon: 'fa-graduation-cap', text: 'Notre équipe bénéficie de formations régulières...' }
    ];
}

function collectCerts() {
    const items = [];
    document.querySelectorAll('.cert-item-row').forEach(row => {
        items.push({
            title: row.querySelector('.cert-title')?.value || '',
            icon: row.querySelector('.cert-icon')?.value || '',
            text: row.querySelector('.cert-text')?.value || ''
        });
    });
    return items;
}

function renderCertList(certs) {
    const container = document.getElementById('certList');
    container.innerHTML = certs.map((item, i) => `
        <div class="cert-item-row" style="border:1px solid #eaeaea;border-radius:8px;padding:1rem;margin-bottom:1rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div class="form-group-admin" style="margin-bottom:0.5rem;"><label>Titre ${i+1}</label><input type="text" class="cert-title" value="${item.title || ''}"></div>
                <div class="form-group-admin" style="margin-bottom:0.5rem;"><label>Icône</label><input type="text" class="cert-icon" value="${item.icon || ''}"></div>
            </div>
            <div class="form-group-admin"><label>Description</label><textarea class="cert-text" rows="2">${item.text || ''}</textarea></div>
            <button class="btn-danger" onclick="deleteCertItem(${i})" style="font-size:0.8rem;margin-top:0.5rem;"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
    `).join('');
}

async function addCertItem() {
    const about = await dbGetDoc('content', 'about') || {};
    const certs = about.certifications?.items || getDefaultCerts();
    certs.push({ title: '', icon: 'fa-certificate', text: '' });
    renderCertList(certs);
}

async function deleteCertItem(index) {
    const about = await dbGetDoc('content', 'about') || {};
    const certs = about.certifications?.items || getDefaultCerts();
    certs.splice(index, 1);
    renderCertList(certs);
}

function getDefaultAbout() {
    return {
        story: {
            title: 'Notre Histoire',
            subtitle: 'Une aventure entrepreneuriale née de la passion pour l\'excellence',
            p1: 'Fondée en 2014 à Montréal par une équipe passionnée par le nettoyage professionnel et l\'environnement, Tapis Rouge Pro a débuté comme une petite entreprise familiale avec une grande mission : révolutionner l\'industrie du nettoyage commercial en alliant performance et écologie.',
            p2: 'Au fil des années, nous avons grandi tout en restant fidèles à nos valeurs fondamentales. Aujourd\'hui, nous sommes fiers de servir plus de 500 clients à travers le Grand Montréal, des petites entreprises aux grandes corporations, en passant par les institutions publiques et les résidences privées.',
            p3: 'Notre nom "Tapis Rouge Pro" reflète notre engagement à offrir un traitement digne des tapis rouges à chaque espace que nous touchons - une attention aux détails, une qualité irréprochable et un service d\'exception.',
            stats: [
                { value: '2014', label: 'Année de fondation' },
                { value: '500+', label: 'Clients satisfaits' },
                { value: '10+', label: 'Années d\'expérience' },
                { value: '5', label: 'Secteurs desservis' }
            ]
        },
        mission: {
            title: 'Notre Mission & Vision',
            subtitle: 'Les piliers qui guident notre action quotidienne',
            items: [
                { title: 'Notre Mission', icon: 'fa-bullseye', text: 'Offrir des services de nettoyage professionnel de qualité supérieure qui créent des environnements sains, sécuritaires et agréables, tout en protégeant notre planète grâce à des pratiques écologiques responsables.' },
                { title: 'Notre Vision', icon: 'fa-eye', text: 'Devenir le leader référent en nettoyage écologique au Québec, en inspirant l\'industrie à adopter des pratiques durables et en démontrant que propreté et écologie vont de pair.' },
                { title: 'Notre Passion', icon: 'fa-heart', text: 'Transformer les espaces de vie et de travail en lieux où il fait bon se retrouver, en apportant soin, attention et expertise à chaque intervention.' }
            ]
        },
        values: {
            title: 'Nos Valeurs',
            subtitle: 'Les principes fondamentaux qui définissent notre entreprise',
            items: getDefaultValues()
        },
        team: {
            title: 'Notre Équipe',
            subtitle: 'Des professionnels passionnés à votre service',
            items: getDefaultTeam()
        },
        certifications: {
            title: 'Nos Certifications',
            subtitle: 'La garantie de notre professionnalisme et de notre engagement',
            items: getDefaultCerts()
        }
    };
}

async function addFaqItem() {
    const faqDoc = await dbGetDoc('content', 'faq');
    const faq = faqDoc?.items || getDefaultFaq();
    faq.push({ question: 'Nouvelle question', answer: 'Nouvelle réponse' });
    await dbSetDoc('content', 'faq', { items: faq });
    renderFaqList(faq);
}

async function deleteFaqItem(index) {
    const faqDoc = await dbGetDoc('content', 'faq');
    const faq = faqDoc?.items || getDefaultFaq();
    faq.splice(index, 1);
    await dbSetDoc('content', 'faq', { items: faq });
    renderFaqList(faq);
}

// Auto-save FAQ on input
async function saveFaq() {
    const questions = document.querySelectorAll('.faq-q');
    const answers = document.querySelectorAll('.faq-a');
    const faq = [];
    questions.forEach((q, i) => {
        faq.push({ question: q.value, answer: answers[i]?.value || '' });
    });
    await dbSetDoc('content', 'faq', { items: faq });
}

// ==================== CLOUDINARY CONFIG ====================
const CLOUDINARY_CLOUD_NAME = 'devyaslej';
const CLOUDINARY_UPLOAD_PRESET = 'tapis_r';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// ==================== FIRESTORE HELPERS ====================
const DB = {};

async function dbGetAll(collection) {
    try {
        const snapshot = await db.collection(collection).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch(e) { console.error('dbGetAll error:', e); return []; }
}

async function dbAdd(collection, data) {
    const ref = await db.collection(collection).add(data);
    return { id: ref.id, ...data };
}

async function dbUpdate(collection, id, data) {
    const { id: _, ...rest } = data;
    await db.collection(collection).doc(id).update(rest);
}

async function dbDelete(collection, id) {
    await db.collection(collection).doc(id).delete();
}

async function dbSetDoc(collection, id, data) {
    await db.collection(collection).doc(id).set(data);
}

async function dbGetDoc(collection, id) {
    const snap = await db.collection(collection).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function dbCount(collection) {
    try {
        const snap = await db.collection(collection).get();
        return snap.size;
    } catch(e) { return 0; }
}

// ==================== DATA MIGRATION ====================
async function migrateToFirestore() {
    const MIGRATION_KEY = 'trp_firebase_migrated';
    if (localStorage.getItem(MIGRATION_KEY) === 'true') return;

    const collections = [
        { name: 'services', localKey: 'trp_services', defaults: getDefaultServices },
        { name: 'articles', localKey: 'trp_articles', defaults: getDefaultArticles },
        { name: 'gallery', localKey: 'trp_gallery', defaults: () => getDefaultImages() },
        { name: 'users', localKey: 'trp_users', defaults: () => [{ id: '1', name: 'Administrateur', email: 'admin@tapisrougepro.ca', password: 'admin123', role: 'admin' }] },
        { name: 'contacts', localKey: 'contactRequests', defaults: () => [] },
        { name: 'quotes', localKey: 'quoteRequests', defaults: () => [] }
    ];

    for (const col of collections) {
        const count = await dbCount(col.name);
        if (count === 0) {
            let data = [];
            try { data = JSON.parse(localStorage.getItem(col.localKey)) || col.defaults(); } catch(e) { data = col.defaults(); }
            for (const item of data) {
                const { id, ...rest } = item;
                const docId = id || Date.now().toString() + Math.random().toString(36).substr(2, 5);
                await dbSetDoc(col.name, docId, rest);
            }
        }
    }

    // Migrate static content
    const contentItems = [
        { docId: 'hero', localKey: 'trp_hero', defaults: { title: 'Tapis Rouge Pro', subtitle: 'Services de nettoyage professionnel et écologique', desc: 'Tapis Rouge Pro offre des services...' } },
        { docId: 'about', localKey: 'trp_about', defaults: getDefaultAbout },
        { docId: 'faq', localKey: 'trp_faq', defaults: getDefaultFaq },
        { docId: 'company', localKey: 'trp_company', defaults: { name: 'Tapis Rouge Pro', address: '1234 rue Sainte-Catherine, Montréal, QC', phone: '(514) 123-4567', email: 'info@tapisrougepro.ca', hours: 'Lun-Ven: 8h00 - 18h00', desc: 'Services de nettoyage professionnel et écologique.' } }
    ];

    for (const item of contentItems) {
        const existing = await dbGetDoc('content', item.docId);
        if (!existing) {
            let data = item.defaults;
            if (typeof data === 'function') data = data();
            try { data = JSON.parse(localStorage.getItem(item.localKey)) || data; } catch(e) {}
            await dbSetDoc('content', item.docId, data);
        }
    }

    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('Migration vers Firestore terminée.');
}

// ==================== GALLERY PICKER ====================
let galleryPickerTargetInput = null;
let galleryPickerTargetPreview = null;

function openGalleryPicker(inputId, previewId) {
    galleryPickerTargetInput = inputId;
    galleryPickerTargetPreview = previewId;
    loadGalleryPicker();
    openModal('galleryPickerModal');
}

async function loadGalleryPicker() {
    const grid = document.getElementById('galleryPickerGrid');
    const images = await dbGetAll('gallery');
    if (images.length === 0) {
        document.getElementById('galleryPickerEmpty').style.display = 'block';
        grid.innerHTML = '';
        return;
    }
    document.getElementById('galleryPickerEmpty').style.display = 'none';
    grid.innerHTML = images.map(img => `
        <div class="gallery-item" style="cursor:pointer;" onclick="selectGalleryImage('${img.url}')">
            <img src="${img.url}" alt="${img.title}" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;">
            <div style="padding:0.5rem;background:white;border-radius:0 0 8px 8px;">
                <p style="margin:0;font-size:0.75rem;color:var(--admin-sidebar);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${img.title || 'Sans titre'}</p>
            </div>
        </div>
    `).join('');
}

function selectGalleryImage(url) {
    if (galleryPickerTargetInput) {
        document.getElementById(galleryPickerTargetInput).value = url;
    }
    if (galleryPickerTargetPreview) {
        const preview = document.getElementById(galleryPickerTargetPreview);
        preview.src = url;
        preview.classList.add('active');
    }
    closeModal('galleryPickerModal');
}

// ==================== GALLERY ====================
function getDefaultImages() {
    return [
        { url: 'https://via.placeholder.com/400x300/c41e3a/ffffff?text=Galerie+1', title: 'Image exemple 1', category: 'gallery', date: new Date().toISOString() },
        { url: 'https://via.placeholder.com/400x300/8b0000/ffffff?text=Services+1', title: 'Nettoyage bureau', category: 'services', date: new Date().toISOString() },
        { url: 'https://via.placeholder.com/400x300/d42029/ffffff?text=Blog+1', title: 'Article blog', category: 'blog', date: new Date().toISOString() }
    ];
}

let currentGalleryFilter = 'all';

async function loadGallery() {
    const grid = document.getElementById('galleryGrid');
    const countEl = document.getElementById('galleryCount');
    const filter = document.getElementById('galleryFilter')?.value || 'all';
    currentGalleryFilter = filter;

    let images = await dbGetAll('gallery');
    const total = images.length;

    if (filter !== 'all') {
        images = images.filter(img => img.category === filter);
    }

    if (countEl) {
        countEl.textContent = filter === 'all' ? `${total} image(s)` : `${images.length} / ${total} image(s)`;
    }

    grid.innerHTML = images.map((img) => `
        <div class="gallery-item" data-id="${img.id}">
            <img src="${img.url}" alt="${img.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/cccccc/666666?text=Image+indisponible'">
            <div class="gallery-item-actions">
                <button class="gallery-delete" onclick="copyImageUrl('${img.url}')" title="Copier l'URL" style="background: var(--admin-sidebar);"><i class="fas fa-link"></i></button>
                <button class="gallery-delete" onclick="editImage('${img.id}')" title="Modifier" style="background: #046BD2;"><i class="fas fa-edit"></i></button>
                <button class="gallery-delete" onclick="deleteImage('${img.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>
            </div>
            <div style="padding:0.75rem;background:white;">
                <p style="margin:0;font-size:0.85rem;color:var(--admin-sidebar);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${img.title || 'Sans titre'}</p>
                <p style="margin:0.25rem 0 0;font-size:0.75rem;color:#888;text-transform:capitalize;">${img.category}</p>
                <p style="margin:0.25rem 0 0;font-size:0.7rem;color:#aaa;">${new Date(img.date).toLocaleDateString('fr-CA')}</p>
            </div>
        </div>
    `).join('') || '<p style="grid-column:1/-1;text-align:center;color:#888;padding:3rem;"><i class="fas fa-images" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>Aucune image. Cliquez sur "Téléverser une image" pour commencer.</p>';
}

function copyImageUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copiée dans le presse-papiers !');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('URL copiée dans le presse-papiers !');
    });
}

function showToast(message) {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--admin-sidebar);color:white;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;display:flex;align-items:center;gap:0.75rem;font-weight:500;animation:slideIn 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Cloudinary Upload
function setupCloudinaryUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('imageFile');
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageUpload(file);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--admin-sidebar)';
        dropZone.style.background = 'rgba(196, 30, 58, 0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#ccc';
        dropZone.style.background = '#fafafa';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        dropZone.style.background = '#fafafa';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        } else {
            alert('Veuillez déposer un fichier image valide (JPG, PNG, GIF, WebP).');
        }
    });
}

function handleImageUpload(file) {
    if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 10 Mo.');
        return;
    }

    const progressWrap = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');
    const saveBtn = document.getElementById('btnSaveImage');

    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = 'Téléversement en cours...';
    if (saveBtn) saveBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
            progressText.textContent = `Téléversement : ${percent}%`;
        }
    });

    xhr.addEventListener('load', () => {
        progressWrap.style.display = 'none';
        if (saveBtn) saveBtn.disabled = false;

        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            document.getElementById('imageUrl').value = response.secure_url;
            const preview = document.getElementById('imagePreview');
            const input = document.getElementById('imageUrl');
            if (preview && input) {
                preview.src = response.secure_url;
                preview.classList.add('active');
            }
            const titleInput = document.getElementById('imageTitle');
            if (titleInput && !titleInput.value) {
                titleInput.value = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            }
            showToast('Image téléversée avec succès sur Cloudinary !');
        } else {
            progressText.textContent = 'Erreur lors du téléversement.';
            alert('Erreur lors du téléversement sur Cloudinary. Vérifiez votre connexion et réessayez.');
        }
    });

    xhr.addEventListener('error', () => {
        progressWrap.style.display = 'none';
        if (saveBtn) saveBtn.disabled = false;
        alert('Erreur réseau. Impossible de contacter Cloudinary.');
    });

    xhr.send(formData);
}

async function saveImage(e) {
    e.preventDefault();
    const id = document.getElementById('imageId').value;
    const url = document.getElementById('imageUrl').value.trim();
    const title = document.getElementById('imageTitle').value.trim();

    if (!url) {
        alert('Veuillez téléverser une image ou saisir une URL.');
        return;
    }
    if (!title) {
        alert('Veuillez saisir un titre pour l\'image.');
        return;
    }

    const imageData = {
        url: url,
        title: title,
        category: document.getElementById('imageCategory').value,
        date: new Date().toISOString()
    };

    if (id) {
        await dbUpdate('gallery', id, imageData);
    } else {
        await dbAdd('gallery', imageData);
    }

    closeModal('imageModal');
    await loadGallery();
    await loadDashboard();
    showToast(id ? 'Image modifiée avec succès !' : 'Image ajoutée avec succès !');
}

async function editImage(id) {
    try {
        const image = await dbGetDoc('gallery', id);
        if (!image) { console.warn('Image non trouvée:', id); return; }
        document.getElementById('imageId').value = image.id || '';
        const u = document.getElementById('imageUrl');
        if (u) u.value = image.url || '';
        const t = document.getElementById('imageTitle');
        if (t) t.value = image.title || '';
        const c = document.getElementById('imageCategory');
        if (c) c.value = image.category || 'general';
        const preview = document.getElementById('imagePreview');
        if (preview && image.url) {
            preview.src = image.url;
            preview.classList.add('active');
        }
        openModal('imageModal', 'Modifier l\'image');
    } catch (e) {
        console.error('Erreur editImage:', e);
        showToast('Erreur lors du chargement de l\'image');
    }
}

async function deleteImage(id) {
    if (!confirm('Supprimer cette image de la galerie ?')) return;
    await dbDelete('gallery', id);
    await loadGallery();
    await loadDashboard();
    showToast('Image supprimée.');
}

// ==================== USERS / SETTINGS ====================
async function loadSettings() {
    await loadUsersTable();
    const company = await dbGetDoc('content', 'company') || {};
    document.getElementById('companyName').value = company.name || 'Tapis Rouge Pro';
    document.getElementById('companyAddress').value = company.address || '1234 rue Sainte-Catherine, Montréal, QC';
    document.getElementById('companyPhone').value = company.phone || '(514) 123-4567';
    document.getElementById('companyEmail').value = company.email || 'info@tapisrougepro.ca';
    document.getElementById('companyHours').value = company.hours || 'Lun-Ven: 8h00 - 18h00';
    document.getElementById('companyDesc').value = company.desc || 'Services de nettoyage professionnel et écologique.';
}

async function loadUsersTable() {
    const tbody = document.getElementById('usersTable');
    const users = await dbGetAll('users');
    tbody.innerHTML = users.map((u) => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="category-badge">${u.role}</span></td>
            <td>
                <button class="btn-danger" onclick="deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function saveUser(e) {
    e.preventDefault();
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };
    await dbAdd('users', userData);
    closeModal('userModal');
    await loadUsersTable();
}

async function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    const current = getAuthData();
    const user = await dbGetDoc('users', id);
    if (user && user.email === current?.email) {
        alert('Vous ne pouvez pas supprimer votre propre compte.');
        return;
    }
    await dbDelete('users', id);
    await loadUsersTable();
}

async function saveCompanyInfo() {
    const data = {
        name: document.getElementById('companyName').value,
        address: document.getElementById('companyAddress').value,
        phone: document.getElementById('companyPhone').value,
        email: document.getElementById('companyEmail').value,
        hours: document.getElementById('companyHours').value,
        desc: document.getElementById('companyDesc').value
    };
    await dbSetDoc('content', 'company', data);
    showToast('Informations de l\'entreprise sauvegardées !');
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', initAdmin);

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

// Auto-save FAQ on input changes
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('faq-q') || e.target.classList.contains('faq-a')) {
        saveFaq();
    }
});

// Export for inline onclick handlers
window.editService = editService;
window.deleteService = deleteService;
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.toggleRequestStatus = toggleRequestStatus;
window.deleteRequest = deleteRequest;
window.deleteImage = deleteImage;
window.editImage = editImage;
window.copyImageUrl = copyImageUrl;
window.deleteUser = deleteUser;
window.deleteFaqItem = deleteFaqItem;
window.openGalleryPicker = openGalleryPicker;
window.selectGalleryImage = selectGalleryImage;
window.addValueItem = addValueItem;
window.deleteValueItem = deleteValueItem;
window.addTeamMember = addTeamMember;
window.deleteTeamMember = deleteTeamMember;
window.openGalleryPickerForTeam = openGalleryPickerForTeam;
window.addCertItem = addCertItem;
window.deleteCertItem = deleteCertItem;

// ==================== NOTIFICATION SYSTEM ====================
let notifUnsubContacts = null;
let notifUnsubQuotes = null;
let notifInitialLoad = { contacts: true, quotes: true };

function initNotifications() {
    if (typeof firebase === 'undefined' || !window.db) return;

    const bell = document.getElementById('notifBell');
    const dropdown = document.getElementById('notifDropdown');
    const markAllBtn = document.getElementById('notifMarkAll');

    if (bell) {
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
    }

    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target) && e.target !== bell) {
            dropdown.classList.remove('open');
        }
    });

    if (markAllBtn) {
        markAllBtn.addEventListener('click', markAllNotificationsRead);
    }

    // Real-time listeners
    notifUnsubContacts = window.db.collection('contacts')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            if (notifInitialLoad.contacts) {
                notifInitialLoad.contacts = false;
                refreshNotifications();
                return;
            }
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    showRequestToast('contact', data.name || 'Nouveau contact', data.subject || 'Message de contact');
                    ringBell();
                    refreshNotifications();
                    loadDashboard();
                }
            });
        });

    notifUnsubQuotes = window.db.collection('quotes')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            if (notifInitialLoad.quotes) {
                notifInitialLoad.quotes = false;
                refreshNotifications();
                return;
            }
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const name = (data.firstName || '') + ' ' + (data.lastName || '');
                    showRequestToast('quote', name.trim() || 'Nouveau devis', 'Demande de soumission');
                    ringBell();
                    refreshNotifications();
                    loadDashboard();
                }
            });
        });

    refreshNotifications();
}

async function refreshNotifications() {
    try {
        const contacts = await dbGetAll('contacts');
        const quotes = await dbGetAll('quotes');

        const unreadContacts = contacts.filter(c => !c.notified);
        const unreadQuotes = quotes.filter(q => !q.notified);
        const totalUnread = unreadContacts.length + unreadQuotes.length;

        // Badge
        const badge = document.getElementById('notifBadge');
        if (badge) {
            if (totalUnread > 0) {
                badge.style.display = 'flex';
                badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
            } else {
                badge.style.display = 'none';
            }
        }

        // Sidebar badge
        const sidebarBadge = document.getElementById('sidebarBadge');
        if (sidebarBadge) {
            const totalPending = contacts.filter(c => !c.processed).length + quotes.filter(q => !q.processed).length;
            if (totalPending > 0) {
                sidebarBadge.style.display = 'inline-block';
                sidebarBadge.textContent = totalPending;
            } else {
                sidebarBadge.style.display = 'none';
            }
        }

        // Build notification list
        const list = document.getElementById('notifList');
        if (!list) return;

        const allItems = [
            ...unreadContacts.map(c => ({
                type: 'contact',
                id: c.id,
                name: c.name || 'Contact',
                detail: c.subject || 'Message de contact',
                time: c.timestamp,
                unread: true
            })),
            ...unreadQuotes.map(q => ({
                type: 'quote',
                id: q.id,
                name: (q.firstName || '') + ' ' + (q.lastName || ''),
                detail: 'Demande de soumission',
                time: q.timestamp,
                unread: true
            }))
        ];

        // Also show recent read ones
        const readContacts = contacts.filter(c => c.notified).slice(0, 3);
        const readQuotes = quotes.filter(q => q.notified).slice(0, 3);
        allItems.push(
            ...readContacts.map(c => ({
                type: 'contact', id: c.id, name: c.name || 'Contact',
                detail: c.subject || 'Message de contact', time: c.timestamp, unread: false
            })),
            ...readQuotes.map(q => ({
                type: 'quote', id: q.id, name: (q.firstName || '') + ' ' + (q.lastName || ''),
                detail: 'Demande de soumission', time: q.timestamp, unread: false
            }))
        );

        // Sort by time desc
        allItems.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

        if (allItems.length === 0) {
            list.innerHTML = '<li class="notif-empty">Aucune notification</li>';
            return;
        }

        list.innerHTML = allItems.slice(0, 15).map(item => `
            <li class="${item.unread ? 'unread' : ''}" data-type="${item.type}" data-id="${item.id}" onclick="handleNotifClick('${item.type}', '${item.id}')">
                <div class="notif-icon-wrap ${item.type}">
                    <i class="fas ${item.type === 'contact' ? 'fa-envelope' : 'fa-file-invoice'}"></i>
                </div>
                <div class="notif-text">
                    <strong>${item.name.trim()}</strong>
                    ${item.detail}
                    <br><small>${formatNotifTime(item.time)}</small>
                </div>
            </li>
        `).join('');
    } catch (e) {
        console.error('Notification refresh error:', e);
    }
}

function formatNotifTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Il y a ${diffD}j`;
    return date.toLocaleDateString('fr-CA');
}

async function handleNotifClick(type, id) {
    // Mark as notified
    const collection = type === 'contact' ? 'contacts' : 'quotes';
    await dbUpdate(collection, id, { notified: true });
    refreshNotifications();

    // Navigate to requests section
    const link = document.querySelector('[data-section="requests"]');
    if (link) link.click();
}

async function markAllNotificationsRead() {
    try {
        const contacts = await dbGetAll('contacts');
        const quotes = await dbGetAll('quotes');

        const updates = [];
        contacts.filter(c => !c.notified).forEach(c => {
            updates.push(dbUpdate('contacts', c.id, { notified: true }));
        });
        quotes.filter(q => !q.notified).forEach(q => {
            updates.push(dbUpdate('quotes', q.id, { notified: true }));
        });

        await Promise.all(updates);
        refreshNotifications();
        showToast('Toutes les notifications marquées comme lues');
    } catch (e) {
        console.error('Mark all read error:', e);
    }
}

function showRequestToast(type, name, detail) {
    const existing = document.querySelector('.admin-toast.new-request');
    if (existing) existing.remove();

    const icon = type === 'contact' ? 'fa-envelope' : 'fa-file-invoice';
    const label = type === 'contact' ? 'Nouveau message' : 'Nouvelle demande de devis';

    const toast = document.createElement('div');
    toast.className = 'admin-toast new-request';
    toast.innerHTML = `<i class="fas ${icon}"></i> <div><strong>${label}</strong><br><span style="font-weight:400;font-size:0.9rem;">${name} — ${detail}</span></div>`;
    toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#ff6900;color:white;padding:1rem 1.5rem;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.25);z-index:9999;display:flex;align-items:center;gap:0.75rem;font-weight:500;animation:slideIn 0.3s ease;cursor:pointer;max-width:400px;';
    toast.addEventListener('click', () => {
        toast.remove();
        const link = document.querySelector('[data-section="requests"]');
        if (link) link.click();
    });

    document.body.appendChild(toast);

    // Play sound if available
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+Jj4eLh4F3b2hkX15jaG90eYCEiImHhH55c25pZ2VkaGxweH6DhomKiIWBe3VwamhnaGxweX6Eg4eHh4WCfnhzbmloZ2lscHZ8gIOHiIiFgn14c25paGdpbHF3fIKFh4iIhYJ9eHNubWlnaWxwdnyChYeIiIaCfnhzbm1paWhscHZ7goWHh4iFgn54c25taWloa3B2e4KFh4eIhYJ+eHRubWlpaGtwdXuBhIeHh4WDfnl0b21qaWhrcHV7gYSGh4eFg354dG9tamloam90eoGEhoeHhYN+eXRvbWppampvdHqBhIaHh4WDfnl0b21qamprb3R6gYSGh4eFg355dG9tamppam90eoGEhoaHhYN+');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } catch (e) {}

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}

function ringBell() {
    const bell = document.getElementById('notifBell');
    if (bell) {
        bell.classList.add('ringing');
        setTimeout(() => bell.classList.remove('ringing'), 600);
    }
}

window.handleNotifClick = handleNotifClick;

// ==================== VIEW REQUEST DETAIL ====================
async function viewContactDetail(id) {
    const c = await dbGetDoc('contacts', id);
    if (!c) return;

    // Mark as notified
    if (!c.notified) {
        await dbUpdate('contacts', id, { notified: true });
        refreshNotifications();
    }

    document.getElementById('requestDetailTitle').textContent = 'Message de contact';
    document.getElementById('requestDetailBody').innerHTML = `
        <div style="display:grid;grid-template-columns:140px 1fr;gap:0.5rem 1rem;">
            <strong>Nom :</strong><span>${c.name || '-'}</span>
            <strong>Email :</strong><span><a href="mailto:${c.email}">${c.email || '-'}</a></span>
            <strong>Téléphone :</strong><span>${c.phone ? '<a href="tel:' + c.phone + '">' + c.phone + '</a>' : '-'}</span>
            <strong>Objet :</strong><span>${c.subject || '-'}</span>
            <strong>Date :</strong><span>${c.timestamp ? new Date(c.timestamp).toLocaleString('fr-CA') : '-'}</span>
            <strong>Newsletter :</strong><span>${c.newsletter ? 'Oui' : 'Non'}</span>
            <strong>Statut :</strong><span class="status-badge ${c.processed ? 'status-processed' : 'status-pending'}">${c.processed ? 'Traité' : 'En attente'}</span>
        </div>
        <div style="margin-top:1.5rem;padding:1rem;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--admin-sidebar);">
            <strong style="display:block;margin-bottom:0.5rem;color:var(--admin-sidebar);">Message :</strong>
            <p style="white-space:pre-wrap;margin:0;color:#333;">${c.message || 'Aucun message'}</p>
        </div>
    `;

    const toggleBtn = document.getElementById('requestDetailToggle');
    toggleBtn.innerHTML = c.processed ? '<i class="fas fa-undo"></i> Remettre en attente' : '<i class="fas fa-check"></i> Marquer traité';
    toggleBtn.onclick = async () => {
        await toggleRequestStatus('contact', id);
        closeModal('requestDetailModal');
    };

    openModal('requestDetailModal');
}

async function viewQuoteDetail(id) {
    const q = await dbGetDoc('quotes', id);
    if (!q) return;

    // Mark as notified
    if (!q.notified) {
        await dbUpdate('quotes', id, { notified: true });
        refreshNotifications();
    }

    document.getElementById('requestDetailTitle').textContent = 'Demande de soumission';

    const services = (q.services || []).join(', ') || '-';
    const sectors = (q.sectors || []).join(', ') || '-';
    const languages = (q.languages || []).join(', ') || '-';
    const roomTypes = (q.roomTypes || []).join(', ') || '-';

    document.getElementById('requestDetailBody').innerHTML = `
        <div style="display:grid;grid-template-columns:160px 1fr;gap:0.5rem 1rem;">
            <strong>Nom :</strong><span>${q.firstName || ''} ${q.lastName || ''}</span>
            <strong>Entreprise :</strong><span>${q.company || '-'}</span>
            <strong>Email :</strong><span><a href="mailto:${q.email}">${q.email || '-'}</a></span>
            <strong>Téléphone :</strong><span>${q.phone ? '<a href="tel:' + q.phone + '">' + q.phone + '</a>' : '-'}</span>
            <strong>Type établissement :</strong><span>${q.businessType || '-'}${q.otherBusinessType ? ' (' + q.otherBusinessType + ')' : ''}</span>
            <strong>Langues :</strong><span>${languages}</span>
            <strong>Date :</strong><span>${q.timestamp ? new Date(q.timestamp).toLocaleString('fr-CA') : '-'}</span>
            <strong>Statut :</strong><span class="status-badge ${q.processed ? 'status-processed' : 'status-pending'}">${q.processed ? 'Traité' : 'En attente'}</span>
        </div>
        <hr style="margin:1rem 0;border:none;border-top:1px solid #eaeaea;">
        <div style="display:grid;grid-template-columns:160px 1fr;gap:0.5rem 1rem;">
            <strong>Services :</strong><span>${services}</span>
            ${q.otherServices ? '<strong>Autres services :</strong><span>' + q.otherServices + '</span>' : ''}
            <strong>Surface :</strong><span>${q.surfaceArea ? q.surfaceArea + ' pi²' : '-'}</span>
            <strong>Nb de pièces :</strong><span>${q.roomCount || '-'}</span>
            <strong>Types de pièces :</strong><span>${roomTypes}</span>
            <strong>Fréquence :</strong><span>${q.frequency || '-'}</span>
            <strong>Secteurs :</strong><span>${sectors}${q.otherSector ? ' (' + q.otherSector + ')' : ''}</span>
            <strong>Équipements :</strong><span>${q.equipmentProvider || '-'}</span>
        </div>
        ${q.additionalMessage ? '<div style="margin-top:1.5rem;padding:1rem;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--admin-sidebar);"><strong style="display:block;margin-bottom:0.5rem;color:var(--admin-sidebar);">Message additionnel :</strong><p style="white-space:pre-wrap;margin:0;color:#333;">' + q.additionalMessage + '</p></div>' : ''}
    `;

    const toggleBtn = document.getElementById('requestDetailToggle');
    toggleBtn.innerHTML = q.processed ? '<i class="fas fa-undo"></i> Remettre en attente' : '<i class="fas fa-check"></i> Marquer traité';
    toggleBtn.onclick = async () => {
        await toggleRequestStatus('quote', id);
        closeModal('requestDetailModal');
    };

    openModal('requestDetailModal');
}

window.viewContactDetail = viewContactDetail;
window.viewQuoteDetail = viewQuoteDetail;
