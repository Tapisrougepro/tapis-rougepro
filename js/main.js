// Tapis Rouge Pro - Main JavaScript File

// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const faqItems = document.querySelectorAll('.faq-item');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeMenu();
    initializeFAQ();
    initializeScrollEffects();
    initializeContactForms();
    initializeQuoteForms();
    initializeAnimations();
});

// Mobile Menu Toggle
function initializeMenu() {
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}

// FAQ Accordion
function initializeFAQ() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(faqItem => {
                    faqItem.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Scroll Effects
function initializeScrollEffects() {
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Header shadow on scroll
        if (currentScroll > 10) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

// Contact Form Handler
function initializeContactForms() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const contactData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                type: 'contact'
            };
            
            // Validate form
            if (validateContactForm(contactData)) {
                // Show loading state
                showFormLoading(contactForm);
                
                // Save to Firebase (or localStorage for demo)
                saveContactRequest(contactData)
                    .then(() => {
                        showFormMessage(contactForm, 'success', 'Votre message a été envoyé avec succès! Nous vous contacterons bientôt.');
                        contactForm.reset();
                    })
                    .catch(error => {
                        showFormMessage(contactForm, 'error', 'Une erreur est survenue. Veuillez réessayer.');
                        console.error('Error saving contact request:', error);
                    })
                    .finally(() => {
                        hideFormLoading(contactForm);
                    });
            }
        });
    }
}

// Quote Form Handler
function initializeQuoteForms() {
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(quoteForm);
            const quoteData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                company: formData.get('company'),
                businessType: formData.get('businessType'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                languages: formData.getAll('languages'),
                services: formData.getAll('services'),
                otherServices: formData.get('otherServices'),
                surfaceArea: formData.get('surfaceArea'),
                sectors: formData.getAll('sectors'),
                frequency: formData.get('frequency'),
                equipmentProvider: formData.get('equipmentProvider'),
                additionalMessage: formData.get('additionalMessage'),
                timestamp: new Date().toISOString(),
                type: 'quote'
            };
            
            // Validate form
            if (validateQuoteForm(quoteData)) {
                // Show loading state
                showFormLoading(quoteForm);
                
                // Save to Firebase (or localStorage for demo)
                saveQuoteRequest(quoteData)
                    .then(() => {
                        showFormMessage(quoteForm, 'success', 'Votre demande de soumission a été envoyée! Nous vous contacterons dans les 24 heures.');
                        quoteForm.reset();
                    })
                    .catch(error => {
                        showFormMessage(quoteForm, 'error', 'Une erreur est survenue. Veuillez réessayer.');
                        console.error('Error saving quote request:', error);
                    })
                    .finally(() => {
                        hideFormLoading(quoteForm);
                    });
            }
        });
    }
}

// Form Validation
function validateContactForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Veuillez fournir une adresse email valide');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Le message doit contenir au moins 10 caractères');
    }
    
    if (errors.length > 0) {
        showFormMessage(document.getElementById('contactForm'), 'error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

function validateQuoteForm(data) {
    const errors = [];
    
    if (!data.firstName || data.firstName.trim().length < 2) {
        errors.push('Le prénom doit contenir au moins 2 caractères');
    }
    
    if (!data.lastName || data.lastName.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Veuillez fournir une adresse email valide');
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Veuillez fournir un numéro de téléphone valide');
    }
    
    if (!data.services || data.services.length === 0) {
        errors.push('Veuillez sélectionner au moins un service');
    }
    
    if (!data.surfaceArea || isNaN(data.surfaceArea) || data.surfaceArea <= 0) {
        errors.push('Veuillez fournir une surface valide');
    }
    
    if (errors.length > 0) {
        showFormMessage(document.getElementById('quoteForm'), 'error', errors.join('<br>'));
        return false;
    }
    
    return true;
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone Validation
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Save Contact Request (Firebase or localStorage)
async function saveContactRequest(data) {
    try {
        // For demo purposes, use localStorage
        const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
        requests.push(data);
        localStorage.setItem('contactRequests', JSON.stringify(requests));
        
        // In production, this would save to Firebase:
        // await firebase.firestore().collection('contactRequests').add(data);
        
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

// Save Quote Request (Firebase or localStorage)
async function saveQuoteRequest(data) {
    try {
        // For demo purposes, use localStorage
        const requests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
        requests.push(data);
        localStorage.setItem('quoteRequests', JSON.stringify(requests));
        
        // In production, this would save to Firebase:
        // await firebase.firestore().collection('quoteRequests').add(data);
        
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

// Form UI Helpers
function showFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Envoi en cours...';
    }
}

function hideFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.getAttribute('data-original-text') || 'Envoyer';
    }
}

function showFormMessage(form, type, message) {
    // Remove existing messages
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = message;
    
    // Insert at the beginning of the form
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Initialize Animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .feature-item, .gallery-item, .blog-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Smooth Scroll for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Loading spinner for dynamic content
function showLoadingSpinner(container) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    container.appendChild(spinner);
    return spinner;
}

function hideLoadingSpinner(spinner) {
    if (spinner && spinner.parentNode) {
        spinner.remove();
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-CA', options);
}

// Truncate text for previews
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Export functions for other scripts
window.TapisRougePro = {
    saveContactRequest,
    saveQuoteRequest,
    showLoadingSpinner,
    hideLoadingSpinner,
    formatDate,
    truncateText,
    debounce,
    throttle
};
