// Tapis Rouge Pro - Contact Page JavaScript

// Contact page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeContactAnimations();
    initializeMapInteraction();
    initializeContactFAQ();
});

// Enhanced Contact Form Handler
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Add form validation and submission handling
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateContactForm()) {
                submitContactForm();
            }
        });

        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                formatPhoneNumber(e.target);
            });
        }
    }
}

// Validate Contact Form
function validateContactForm() {
    const form = document.getElementById('contactForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });

    if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

// Validate Individual Field
function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !fieldValue) {
        isValid = false;
        errorMessage = 'Ce champ est obligatoire';
    }

    // Email validation
    if (fieldName === 'email' && fieldValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fieldValue)) {
            isValid = false;
            errorMessage = 'Veuillez entrer une adresse email valide';
        }
    }

    // Phone validation
    if (fieldName === 'phone' && fieldValue) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(fieldValue) || fieldValue.replace(/\D/g, '').length < 10) {
            isValid = false;
            errorMessage = 'Veuillez entrer un numéro de téléphone valide';
        }
    }

    // Name validation
    if (fieldName === 'name' && fieldValue) {
        if (fieldValue.length < 2) {
            isValid = false;
            errorMessage = 'Le nom doit contenir au moins 2 caractères';
        }
    }

    // Message validation
    if (fieldName === 'message' && fieldValue) {
        if (fieldValue.length < 10) {
            isValid = false;
            errorMessage = 'Le message doit contenir au moins 10 caractères';
        }
    }

    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show Field Error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    clearFieldError(field);

    // Add error class
    formGroup.classList.add('error');

    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    // Insert error after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

// Clear Field Error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
    }

    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Format Phone Number
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        // Format as (XXX) XXX-XXXX
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    
    input.value = value;
}

// Submit Contact Form
function submitContactForm() {
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    
    // Show loading state
    showFormLoading(form);

    // Prepare contact data
    const contactData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        source: 'contact-form'
    };

    // Save to storage (in production, this would be Firebase)
    saveContactRequest(contactData)
        .then(() => {
            showFormMessage(form, 'success', 'Votre message a été envoyé avec succès! Nous vous répondrons dans les 24 heures.');
            form.reset();
            
            // Track conversion (in production, this would be Google Analytics)
            trackContactFormSubmission();
        })
        .catch(error => {
            console.error('Error submitting contact form:', error);
            showFormMessage(form, 'error', 'Une erreur est survenue. Veuillez réessayer ou nous appeler directement.');
        })
        .finally(() => {
            hideFormLoading(form);
        });
}

// Save Contact Request
async function saveContactRequest(data) {
    try {
        if (typeof firebase !== 'undefined' && window.db) {
            data.processed = false;
            data.notified = false;
            await window.db.collection('contacts').add(data);
        } else {
            const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
            requests.push(data);
            localStorage.setItem('contactRequests', JSON.stringify(requests));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

// Track Contact Form Submission
function trackContactFormSubmission() {
    // In production, this would send data to Google Analytics or other tracking
    console.log('Contact form submitted - tracking conversion');
    
    // You could also send a custom event to your analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submission', {
            'event_category': 'contact',
            'event_label': 'contact_form'
        });
    }
}

// Show Form Loading
function showFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    }
}

// Hide Form Loading
function hideFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer le message';
    }
}

// Show Form Message
function showFormMessage(form, type, message) {
    // Remove existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="message-text">${message}</div>
    `;

    // Insert at the beginning of the form
    form.insertBefore(messageDiv, form.firstChild);

    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 8000);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Contact Animations
function initializeContactAnimations() {
    const contactItems = document.querySelectorAll('.contact-item');
    const formContainer = document.querySelector('.form-container');

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

    contactItems.forEach(item => {
        observer.observe(item);
    });

    if (formContainer) {
        observer.observe(formContainer);
    }
}

// Map Interaction
function initializeMapInteraction() {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    const mapLink = mapPlaceholder?.querySelector('a');
    
    if (mapLink) {
        mapLink.addEventListener('click', function(e) {
            // Track map click (in production, this would be analytics)
            console.log('Map link clicked');
            
            // Allow the link to open normally
            // You could add additional tracking here
        });
    }
}

// Contact FAQ
function initializeContactFAQ() {
    const faqItems = document.querySelectorAll('#faq-contact .faq-item');
    
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

// Add Contact Page Styles
function addContactPageStyles() {
    if (!document.getElementById('contact-page-styles')) {
        const style = document.createElement('style');
        style.id = 'contact-page-styles';
        style.textContent = `
            .contact-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .contact-item {
                text-align: center;
                padding: 2.5rem 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .contact-item:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .contact-icon {
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, var(--color-primary), #0d3538);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 1.8rem;
                color: white;
            }
            
            .contact-item h3 {
                color: var(--color-primary);
                margin-bottom: 1rem;
                font-size: 1.3rem;
            }
            
            .contact-item p {
                color: var(--color-dark-gray);
                line-height: 1.6;
            }
            
            .contact-item a {
                color: var(--color-secondary);
                text-decoration: none;
                transition: color 0.3s ease;
            }
            
            .contact-item a:hover {
                color: var(--color-accent-2);
            }
            
            .contact-form {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
                position: relative;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: var(--color-primary);
            }
            
            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid var(--color-light-gray);
                border-radius: 8px;
                font-family: var(--font-sans);
                font-size: 1rem;
                transition: all 0.3s ease;
                background: white;
            }
            
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: var(--color-secondary);
                box-shadow: 0 0 0 3px rgba(4, 107, 210, 0.1);
            }
            
            .form-group.error input,
            .form-group.error textarea,
            .form-group.error select {
                border-color: #ff6b6b;
            }
            
            .field-error {
                color: #ff6b6b;
                font-size: 0.85rem;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .field-error::before {
                content: '⚠';
                font-size: 0.9rem;
            }
            
            .form-group textarea {
                resize: vertical;
                min-height: 120px;
            }
            
            .checkbox-group {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
            }
            
            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                font-weight: normal !important;
                margin-bottom: 0 !important;
            }
            
            .checkbox-label input[type="checkbox"] {
                width: auto;
                margin: 0;
            }
            
            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }
            
            .form-actions button {
                padding: 12px 30px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .form-actions button[type="submit"] {
                background: var(--color-accent-1);
                color: white;
            }
            
            .form-actions button[type="submit"]:hover {
                background: var(--color-accent-2);
                transform: translateY(-2px);
            }
            
            .form-actions button[type="reset"] {
                background: transparent;
                color: var(--color-secondary);
                border: 2px solid var(--color-secondary);
            }
            
            .form-actions button[type="reset"]:hover {
                background: var(--color-secondary);
                color: white;
            }
            
            .form-message {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
                animation: slideDown 0.3s ease-out;
            }
            
            .form-message.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .form-message.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .message-icon {
                font-size: 1.2rem;
            }
            
            .map-container {
                margin-top: 3rem;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            
            .map-placeholder {
                background: linear-gradient(135deg, var(--color-primary), #0d3538);
                color: white;
                text-align: center;
                padding: 4rem 2rem;
                min-height: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .map-content {
                max-width: 400px;
            }
            
            .map-icon {
                font-size: 4rem;
                margin-bottom: 1.5rem;
                opacity: 0.8;
            }
            
            .map-content h3 {
                color: white;
                margin-bottom: 1rem;
            }
            
            .map-content p {
                margin-bottom: 2rem;
                opacity: 0.9;
            }
            
            .map-content a {
                background: var(--color-accent-1);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                text-decoration: none;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .map-content a:hover {
                background: var(--color-accent-2);
                transform: translateY(-2px);
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .form-actions {
                    flex-direction: column;
                }
                
                .form-actions button {
                    width: 100%;
                    justify-content: center;
                }
                
                .contact-info {
                    grid-template-columns: 1fr;
                }
                
                .map-placeholder {
                    padding: 2rem 1rem;
                    min-height: 300px;
                }
                
                .map-icon {
                    font-size: 3rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
addContactPageStyles();
