// Tapis Rouge Pro - Quote Page JavaScript

// Quote page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeQuoteForm();
    initializeQuoteAnimations();
    initializeBusinessTypeHandler();
    initializeSectorHandler();
    initializeSpaceTypeHandler();
    initializeRoomTypeHandler();
    initializeFormProgress();
});

// Quote Form Handler
function initializeQuoteForm() {
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateQuoteForm()) {
                submitQuoteForm();
            }
        });

        // Add real-time validation
        const inputs = quoteForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
                updateFormProgress();
            });
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                formatPhoneNumber(e.target);
            });
        }

        // Surface area formatting
        const surfaceAreaInput = document.getElementById('surfaceArea');
        if (surfaceAreaInput) {
            surfaceAreaInput.addEventListener('input', function(e) {
                formatSurfaceArea(e.target);
            });
        }
    }
}

// Business Type Handler
function initializeBusinessTypeHandler() {
    const businessTypeSelect = document.getElementById('businessType');
    const otherBusinessTypeGroup = document.getElementById('otherBusinessTypeGroup');
    const otherBusinessTypeInput = document.getElementById('otherBusinessType');

    if (businessTypeSelect && otherBusinessTypeGroup) {
        businessTypeSelect.addEventListener('change', function() {
            if (this.value === 'Autre') {
                otherBusinessTypeGroup.style.display = 'block';
                otherBusinessTypeInput.setAttribute('required', 'required');
            } else {
                otherBusinessTypeGroup.style.display = 'none';
                otherBusinessTypeInput.removeAttribute('required');
                otherBusinessTypeInput.value = '';
            }
        });
    }
}

// Sector Handler
function initializeSectorHandler() {
    const sectorCheckboxes = document.querySelectorAll('input[name="sectors"]');
    const otherSectorGroup = document.getElementById('otherSectorGroup');
    const otherSectorInput = document.getElementById('otherSector');

    sectorCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const otherCheckbox = document.querySelector('input[name="sectors"][value="Autres"]');
            
            if (otherCheckbox && otherCheckbox.checked) {
                otherSectorGroup.style.display = 'block';
                otherSectorInput.setAttribute('required', 'required');
            } else if (!otherCheckbox || !otherCheckbox.checked) {
                otherSectorGroup.style.display = 'none';
                otherSectorInput.removeAttribute('required');
                otherSectorInput.value = '';
            }
        });
    });
}

// Space Type Handler
function initializeSpaceTypeHandler() {
    const spaceCheckboxes = document.querySelectorAll('input[name="spaceType"]');
    const surfaceInput = document.getElementById('surfaceArea');
    const roomInput = document.getElementById('roomCount');

    // Initially disable both inputs
    if (surfaceInput) surfaceInput.disabled = true;
    if (roomInput) roomInput.disabled = true;

    spaceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Mutual exclusive: uncheck others
            spaceCheckboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });

            if (this.value === 'surface' && this.checked) {
                if (surfaceInput) {
                    surfaceInput.disabled = false;
                    surfaceInput.setAttribute('required', 'required');
                    surfaceInput.focus();
                }
                if (roomInput) {
                    roomInput.disabled = true;
                    roomInput.removeAttribute('required');
                    roomInput.value = '';
                }
            } else if (this.value === 'roomCount' && this.checked) {
                if (roomInput) {
                    roomInput.disabled = false;
                    roomInput.setAttribute('required', 'required');
                    roomInput.focus();
                }
                if (surfaceInput) {
                    surfaceInput.disabled = true;
                    surfaceInput.removeAttribute('required');
                    surfaceInput.value = '';
                }
            } else {
                // Unchecked: disable both
                if (surfaceInput) {
                    surfaceInput.disabled = true;
                    surfaceInput.removeAttribute('required');
                }
                if (roomInput) {
                    roomInput.disabled = true;
                    roomInput.removeAttribute('required');
                }
            }
        });
    });
}

// Room Types Handler
function initializeRoomTypeHandler() {
    const roomTypeCheckboxes = document.querySelectorAll('input[name="roomTypes"]');
    const otherRoomTypeGroup = document.getElementById('otherRoomTypeGroup');
    const otherRoomTypeInput = document.getElementById('otherRoomType');

    roomTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const otherCheckbox = document.querySelector('input[name="roomTypes"][value="Autres"]');

            if (otherCheckbox && otherCheckbox.checked) {
                otherRoomTypeGroup.style.display = 'block';
                otherRoomTypeInput.setAttribute('required', 'required');
            } else if (!otherCheckbox || !otherCheckbox.checked) {
                otherRoomTypeGroup.style.display = 'none';
                otherRoomTypeInput.removeAttribute('required');
                otherRoomTypeInput.value = '';
            }
        });
    });
}

// Form Progress
function initializeFormProgress() {
    // Create progress bar if it doesn't exist
    if (!document.getElementById('formProgress')) {
        const progressBar = document.createElement('div');
        progressBar.id = 'formProgress';
        progressBar.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0% complété</div>
            </div>
        `;
        
        const formSection = document.querySelector('#quoteForm .form-section');
        if (formSection) {
            formSection.parentNode.insertBefore(progressBar, formSection);
        }
    }
    
    updateFormProgress();
}

// Update Form Progress
function updateFormProgress() {
    const form = document.getElementById('quoteForm');
    if (!form) return;

    const allFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    const filledFields = Array.from(allFields).filter(field => {
        if (field.type === 'checkbox' || field.type === 'radio') {
            return form.querySelector(`input[name="${field.name}"]:checked`);
        }
        return field.value.trim() !== '';
    });

    const progress = Math.round((filledFields.length / allFields.length) * 100);
    
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = progress + '% complété';
    }
}

// Validate Quote Form
function validateQuoteForm() {
    const form = document.getElementById('quoteForm');
    let isValid = true;
    let firstInvalidField = null;

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });

    // Validate at least one service is selected
    const servicesCheckboxes = form.querySelectorAll('input[name="services"]:checked');
    if (servicesCheckboxes.length === 0) {
        isValid = false;
        showFormMessage(form, 'error', 'Veuillez sélectionner au moins un service requis.');
        return false;
    }

    // Validate at least one sector is selected
    const sectorsCheckboxes = form.querySelectorAll('input[name="sectors"]:checked');
    if (sectorsCheckboxes.length === 0) {
        isValid = false;
        showFormMessage(form, 'error', 'Veuillez sélectionner au moins un secteur désiré.');
        return false;
    }

    // Validate space type: at least one option must be selected
    const spaceTypeChecked = document.querySelector('input[name="spaceType"]:checked');
    if (!spaceTypeChecked) {
        isValid = false;
        showFormMessage(form, 'error', 'Veuillez sélectionner "Surface totale" ou "Nombre de pièces" et remplir la valeur correspondante.');
        return false;
    }

    const surfaceArea = document.getElementById('surfaceArea');
    const roomCount = document.getElementById('roomCount');

    if (spaceTypeChecked.value === 'surface' && surfaceArea && surfaceArea.value) {
        const area = parseInt(surfaceArea.value);
        if (isNaN(area) || area <= 0) {
            isValid = false;
            showFieldError(surfaceArea, 'Veuillez entrer une surface valide');
            if (!firstInvalidField) firstInvalidField = surfaceArea;
        }
    } else if (spaceTypeChecked.value === 'roomCount' && roomCount && roomCount.value) {
        const count = parseInt(roomCount.value);
        if (isNaN(count) || count <= 0) {
            isValid = false;
            showFieldError(roomCount, 'Veuillez entrer un nombre de pièces valide');
            if (!firstInvalidField) firstInvalidField = roomCount;
        }
    }

    // Validate phone number
    const phone = document.getElementById('phone');
    if (phone && phone.value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone.value) || phone.value.replace(/\D/g, '').length < 10) {
            isValid = false;
            showFieldError(phone, 'Veuillez entrer un numéro de téléphone valide');
            if (!firstInvalidField) firstInvalidField = phone;
        }
    }

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

    // Name validation
    if ((fieldName === 'firstName' || fieldName === 'lastName') && fieldValue) {
        if (fieldValue.length < 2) {
            isValid = false;
            errorMessage = 'Le nom doit contenir au moins 2 caractères';
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

// Format Surface Area
function formatSurfaceArea(input) {
    let value = input.value.replace(/\D/g, '');
    if (value) {
        input.value = parseInt(value).toLocaleString('fr-CA');
    } else {
        input.value = '';
    }
}

// Submit Quote Form
function submitQuoteForm() {
    const form = document.getElementById('quoteForm');
    const formData = new FormData(form);
    
    // Show loading state
    showFormLoading(form);

    // Prepare quote data
    const quoteData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        company: formData.get('company'),
        businessType: formData.get('businessType'),
        otherBusinessType: formData.get('otherBusinessType'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        languages: formData.getAll('languages'),
        services: formData.getAll('services'),
        otherServices: formData.get('otherServices'),
        surfaceArea: formData.get('surfaceArea'),
        frequency: formData.get('frequency'),
        roomCount: formData.get('roomCount'),
        roomTypes: formData.getAll('roomTypes'),
        otherRoomType: formData.get('otherRoomType'),
        sectors: formData.getAll('sectors'),
        otherSector: formData.get('otherSector'),
        equipmentProvider: formData.get('equipmentProvider'),
        additionalMessage: formData.get('additionalMessage'),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        source: 'quote-form'
    };

    // Save to storage (in production, this would be Firebase)
    saveQuoteRequest(quoteData)
        .then(() => {
            showFormMessage(form, 'success', 'Votre demande de soumission a été envoyée avec succès! Nous vous contacterons dans les 24 heures avec une proposition détaillée.');
            form.reset();
            updateFormProgress();
            
            // Track conversion
            trackQuoteFormSubmission();
        })
        .catch(error => {
            console.error('Error submitting quote form:', error);
            showFormMessage(form, 'error', 'Une erreur est survenue. Veuillez réessayer ou nous appeler directement.');
        })
        .finally(() => {
            hideFormLoading(form);
        });
}

// Save Quote Request
async function saveQuoteRequest(data) {
    try {
        if (typeof firebase !== 'undefined' && window.db) {
            data.processed = false;
            data.notified = false;
            await window.db.collection('quotes').add(data);
        } else {
            const requests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
            requests.push(data);
            localStorage.setItem('quoteRequests', JSON.stringify(requests));
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

// Track Quote Form Submission
function trackQuoteFormSubmission() {
    // In production, this would send data to Google Analytics or other tracking
    console.log('Quote form submitted - tracking conversion');
    
    // You could also send a custom event to your analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submission', {
            'event_category': 'quote',
            'event_label': 'quote_form'
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
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Soumettre la demande';
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

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 10000);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Quote Animations
function initializeQuoteAnimations() {
    const processSteps = document.querySelectorAll('.step-item');
    const infoItems = document.querySelectorAll('.info-item');
    const formSections = document.querySelectorAll('.form-section');

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

    processSteps.forEach(step => {
        observer.observe(step);
    });

    infoItems.forEach(item => {
        observer.observe(item);
    });

    formSections.forEach(section => {
        observer.observe(section);
    });
}

// Add Quote Page Styles
function addQuotePageStyles() {
    if (!document.getElementById('quote-page-styles')) {
        const style = document.createElement('style');
        style.id = 'quote-page-styles';
        style.textContent = `
            .process-steps {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .step-item {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .step-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .step-number {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0 auto 1.5rem;
            }
            
            .step-item h3 {
                color: var(--color-primary);
                margin-bottom: 1rem;
            }
            
            .step-item p {
                color: var(--color-dark-gray);
                line-height: 1.6;
            }
            
            .quote-form {
                max-width: 900px;
                margin: 0 auto;
            }
            
            .form-section {
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                margin-bottom: 2rem;
            }
            
            .form-section h3 {
                color: var(--color-primary);
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-size: 1.3rem;
            }
            
            .form-section h3 i {
                color: var(--color-accent-1);
                font-size: 1.2rem;
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
                min-height: 100px;
            }
            
            .checkbox-group,
            .radio-group {
                display: flex;
                flex-wrap: wrap;
                gap: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .checkbox-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .checkbox-label,
            .radio-label {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                font-weight: normal;
                margin-bottom: 0;
            }
            
            .checkbox-label input,
            .radio-label input {
                width: auto;
                margin: 0;
            }
            
            .checkmark,
            .radio-mark {
                position: relative;
            }
            
            .checkbox-label input[type="checkbox"] {
                appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid var(--color-light-gray);
                border-radius: 4px;
                background: white;
                cursor: pointer;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .checkbox-label input[type="checkbox"]:checked {
                background: var(--color-accent-1);
                border-color: var(--color-accent-1);
            }
            
            .checkbox-label input[type="checkbox"]:checked::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            
            .radio-label input[type="radio"] {
                appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid var(--color-light-gray);
                border-radius: 50%;
                background: white;
                cursor: pointer;
                position: relative;
                transition: all 0.3s ease;
            }
            
            .radio-label input[type="radio"]:checked {
                background: var(--color-accent-1);
                border-color: var(--color-accent-1);
            }
            
            .radio-label input[type="radio"]:checked::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
            }
            
            .form-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }
            
            .form-actions button {
                padding: 15px 30px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.1rem;
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
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-top: 3rem;
            }
            
            .info-item {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .info-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .info-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 1.5rem;
                color: white;
            }
            
            .info-item h4 {
                color: var(--color-primary);
                margin-bottom: 1rem;
            }
            
            .info-item p {
                color: var(--color-dark-gray);
                line-height: 1.6;
            }
            
            .progress-container {
                margin-bottom: 2rem;
                text-align: center;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: var(--color-light-gray);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(to right, var(--color-accent-1), var(--color-accent-2));
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .progress-text {
                color: var(--color-dark-gray);
                font-size: 0.9rem;
                font-weight: 500;
            }

            .space-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-top: 0.5rem;
            }

            .space-option {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                padding: 0.75rem 1rem;
                border: 2px solid var(--color-light-gray);
                border-radius: 8px;
                transition: all 0.3s ease;
                background: white;
            }

            .space-option:hover {
                border-color: var(--color-secondary);
            }

            .space-option input[type="checkbox"] {
                appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid var(--color-light-gray);
                border-radius: 4px;
                background: white;
                cursor: pointer;
                position: relative;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            .space-option input[type="checkbox"]:checked {
                background: var(--color-accent-1);
                border-color: var(--color-accent-1);
            }

            .space-option input[type="checkbox"]:checked::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-weight: bold;
                font-size: 14px;
            }

            .space-label-text {
                font-weight: 500;
                color: var(--color-primary);
            }

            .space-input {
                width: 120px !important;
                margin-left: auto;
                padding: 8px 12px !important;
                border: 2px solid var(--color-light-gray);
                border-radius: 6px;
                font-size: 0.95rem;
                transition: all 0.3s ease;
            }

            .space-input:disabled {
                background: var(--color-light-gray);
                opacity: 0.6;
                cursor: not-allowed;
            }

            .space-input:focus:not(:disabled) {
                outline: none;
                border-color: var(--color-secondary);
                box-shadow: 0 0 0 3px rgba(4, 107, 210, 0.1);
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
                
                .checkbox-grid {
                    grid-template-columns: 1fr;
                }
                
                .form-actions {
                    flex-direction: column;
                }
                
                .form-actions button {
                    width: 100%;
                    justify-content: center;
                }

                .space-option {
                    flex-wrap: wrap;
                }

                .space-input {
                    margin-left: 0;
                    width: 100% !important;
                    margin-top: 0.5rem;
                }

                .process-steps {
                    grid-template-columns: 1fr;
                }
                
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .form-section {
                    padding: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
addQuotePageStyles();
