/* ========================================
   FLEURA NAILS - JavaScript
   Animations, Interactions & UX
   Enhanced for SEO & Accessibility
   ======================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbar();
    initMobileMenu();
    initAOS();
    initSmoothScroll();
    initContactForm();
    initFAQ();
    initLazyLoad();
    initServiceCards();
    initGallery();
    initCountUp();
    initScrollToTop();
    initHeroHoverVideo();
    initValentinesVideo();
    initAppointmentBooking();
});

/* ========================================
   Preloader
   ======================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const isMobile = window.innerWidth <= 768;
    
    // Trigger hero animations immediately on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                animateHero();
            }, 100);
        });
    } else {
        // DOM already loaded
        setTimeout(() => {
            animateHero();
        }, 100);
    }
    
    // Hide preloader immediately - no artificial delay
    window.addEventListener('load', () => {
        // Use requestAnimationFrame for smoother hide
        requestAnimationFrame(() => {
            preloader.classList.add('hidden');
            document.body.classList.remove('no-scroll');
            // Trigger hero animations immediately
            animateHero();
        });
    });
    
    // Prevent scroll during preloader
    document.body.classList.add('no-scroll');
}

/* ========================================
   Hero Animations - Immediate on Load
   ======================================== */
function animateHero() {
    // Get all hero elements with hero-animate class
    const heroElements = document.querySelectorAll('.hero-animate');
    
    if (heroElements.length === 0) return;
    
    // Set initial state - hidden with direction-based transforms
    heroElements.forEach(el => {
        const direction = el.getAttribute('data-animate-direction') || 'up';
        el.style.opacity = '0';
        
        // Set initial transform based on direction
        switch(direction) {
            case 'left':
                el.style.transform = 'translateX(-80px) translateY(20px)';
                break;
            case 'right':
                el.style.transform = 'translateX(80px) translateY(20px)';
                break;
            case 'zoom':
                el.style.transform = 'scale(0.5)';
                break;
            case 'up':
            default:
                el.style.transform = 'translateY(40px)';
                break;
        }
        
        // Smooth transition with bounce effect for titles
        const isTitle = el.classList.contains('title-line');
        const isButton = el.classList.contains('btn');
        const duration = isTitle ? '1s' : (isButton ? '0.6s' : '0.9s');
        const easing = isTitle ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : (isButton ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)');
        el.style.transition = `opacity ${duration} ${easing}, transform ${duration} ${easing}`;
    });
    
    // Animate each element with its delay
    heroElements.forEach(el => {
        const delay = parseFloat(el.getAttribute('data-animate-delay') || '0') * 1000;
        const isButton = el.classList.contains('btn');
        
        // Buttons should animate faster - cap delay at 800ms
        const finalDelay = isButton && delay > 800 ? 800 : delay;
        
        setTimeout(() => {
            // Force reflow
            el.offsetHeight;
            
            // Apply animation - return to original position
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                const direction = el.getAttribute('data-animate-direction') || 'up';
                if (direction === 'zoom') {
                    el.style.transform = 'scale(1)';
                } else {
                    el.style.transform = 'translateX(0) translateY(0)';
                }
            });
        }, finalDelay);
    });
}

/* ========================================
   Navbar
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let ticking = false;
    
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });
}

/* ========================================
   Mobile Menu
   ======================================== */
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('mobileMenu');
    const links = menu.querySelectorAll('a');
    
    function toggleMenu() {
        const isActive = toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        // Update ARIA attributes
        toggle.setAttribute('aria-expanded', isActive);
    }
    
    toggle.addEventListener('click', toggleMenu);
    
    // Close menu on link click
    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            toggleMenu();
        }
    });
}

/* ========================================
   Scroll Animations (Intersection Observer)
   ======================================== */
/* ========================================
   AOS - Animate On Scroll (Mobile Optimized)
   ======================================== */
function initAOS() {
    // AOS is initialized in HTML for better control
    // This function is kept for compatibility but AOS.init is called in HTML
    if (typeof AOS !== 'undefined') {
        // AOS is already initialized in HTML
        // Just refresh if needed
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // Additional mobile optimizations
            setTimeout(() => {
                AOS.refresh();
            }, 200);
        }
    } else {
        console.warn('AOS library not loaded');
    }
}

/* ========================================
   Smooth Scroll
   ======================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href === '#' || href === '#main') {
                if (href === '#main') {
                    e.preventDefault();
                    document.getElementById('main').scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar.offsetHeight;
                
                // Special handling for appointment booking section
                if (href === '#randevu-al') {
                    const appointmentBooking = document.getElementById('appointmentBooking');
                    if (appointmentBooking) {
                        // Scroll to appointment booking (inside the section)
                        const bookingPosition = appointmentBooking.getBoundingClientRect().top + window.scrollY - navbarHeight - 40;
                        window.scrollTo({
                            top: bookingPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        // Fallback to section
                        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    // Normal scroll for other sections
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // Update URL without jumping
                history.pushState(null, '', href);
            }
        });
    });
}

/* ========================================
   FAQ Accordion
   ======================================== */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        
        summary.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close other open items (accordion behavior)
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.hasAttribute('open')) {
                    otherItem.removeAttribute('open');
                }
            });
            
            // Toggle current item
            if (item.hasAttribute('open')) {
                item.removeAttribute('open');
            } else {
                item.setAttribute('open', '');
            }
        });
        
        // Keyboard accessibility
        summary.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                summary.click();
            }
        });
    });
}

/* ========================================
   Contact Form
   ======================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate form
        if (!validateForm(data)) return;
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const originalText = btnText ? btnText.textContent : 'Gönder';
        
        if (btnText) btnText.textContent = 'Gönderiliyor...';
        if (btnLoader) btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        // Prepare email content
        const serviceNames = {
            'kalici-oje': 'Kalıcı Oje',
            'manikur-pedikur': 'Manikür & Pedikür',
            'protez-tirnak': 'Protez Tırnak',
            'tirnak-bakimi': 'Tırnak Bakımı & Onarım',
            'nail-art': 'Nail Art & Özel Tasarım',
            'diger': 'Diğer / Bilgi Almak İstiyorum'
        };
        
        const serviceName = serviceNames[data.service] || data.service;
        
        const subject = encodeURIComponent(`Yeni Randevu Talebi - ${data.name}`);
        const body = encodeURIComponent(
            `Yeni Randevu Talebi\n\n` +
            `Ad Soyad: ${data.name}\n` +
            `Telefon: ${data.phone}\n` +
            `Hizmet: ${serviceName}\n` +
            (data.message ? `Mesaj: ${data.message}\n` : '') +
            `\n---\nBu mesaj Fleura Nails web sitesinden gönderilmiştir.`
        );
        
        // Create mailto link
        const mailtoLink = `mailto:zeynepeke16@gmail.com?subject=${subject}&body=${body}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message after a short delay
        setTimeout(() => {
            showFormSuccess();
            
            // Reset form
            form.reset();
            if (btnText) btnText.textContent = originalText;
            if (btnLoader) btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }, 500);
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            // Format: 0555 123 45 67
            if (value.length > 0) {
                if (value.length <= 4) {
                    e.target.value = value;
                } else if (value.length <= 7) {
                    e.target.value = `${value.slice(0, 4)} ${value.slice(4)}`;
                } else if (value.length <= 9) {
                    e.target.value = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`;
                } else {
                    e.target.value = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7, 9)} ${value.slice(9)}`;
                }
            }
        });
    }
}

function validateForm(data) {
    let isValid = true;
    
    if (!data.name || data.name.trim().length < 2) {
        showFieldError('name', 'Lütfen geçerli bir isim girin');
        isValid = false;
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        showFieldError('phone', 'Lütfen geçerli bir telefon numarası girin');
        isValid = false;
    }
    
    if (!data.service) {
        showFieldError('service', 'Lütfen bir hizmet seçin');
        isValid = false;
    }
    
    return isValid;
}

function validateField(input) {
    const { name, value } = input;
    
    switch (name) {
        case 'name':
            if (value.trim().length < 2) {
                showFieldError(name, 'Lütfen geçerli bir isim girin');
                return false;
            }
            break;
        case 'phone':
            if (!isValidPhone(value)) {
                showFieldError(name, 'Lütfen geçerli bir telefon numarası girin');
                return false;
            }
            break;
        case 'service':
            if (!value) {
                showFieldError(name, 'Lütfen bir hizmet seçin');
                return false;
            }
            break;
    }
    
    clearFieldError(input);
    return true;
}

function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    clearFieldError(field);
    
    field.style.borderColor = '#e74c3c';
    field.setAttribute('aria-invalid', 'true');
    
    const error = document.createElement('span');
    error.className = 'field-error';
    error.id = `${fieldName}-error`;
    error.setAttribute('role', 'alert');
    error.textContent = message;
    error.style.cssText = `
        display: block;
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 4px;
    `;
    
    field.setAttribute('aria-describedby', error.id);
    field.parentNode.appendChild(error);
}

function clearFieldError(input) {
    input.style.borderColor = '';
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    
    const parent = input.parentNode;
    const error = parent.querySelector('.field-error');
    if (error) {
        error.remove();
    }
}

function showFormSuccess() {
    const form = document.getElementById('contactForm');
    const wrapper = form.parentElement;
    
    // Create success message
    const success = document.createElement('div');
    success.className = 'form-success';
    success.setAttribute('role', 'alert');
    success.setAttribute('aria-live', 'polite');
    success.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem; color: #25D366;">✓</div>
            <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; margin-bottom: 0.5rem; color: #1a1614;">Teşekkürler!</h3>
            <p style="color: #6b6360; margin-bottom: 1rem;">Talebiniz başarıyla alındı.</p>
            <p style="color: #6b6360; font-size: 0.9rem;">En kısa sürede sizinle iletişime geçeceğiz.</p>
        </div>
    `;
    success.style.cssText = `
        position: absolute;
        inset: 0;
        background: white;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.5s ease;
        z-index: 10;
    `;
    
    // Add CSS animation if not exists
    if (!document.getElementById('form-success-animation')) {
        const style = document.createElement('style');
        style.id = 'form-success-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    wrapper.style.position = 'relative';
    wrapper.appendChild(success);
    
    // Remove after delay
    setTimeout(() => {
        success.style.opacity = '0';
        success.style.transition = 'opacity 0.5s ease';
        setTimeout(() => success.remove(), 500);
    }, 5000);
}


/* ========================================
   Lazy Load Images
   ======================================== */
function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/* ========================================
   Service Cards Hover Effects
   ======================================== */
function initServiceCards() {
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.style.transform = 'translateY(-8px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

/* ========================================
   Gallery Hover Effects
   ======================================== */
function initGallery() {
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const placeholder = this.querySelector('.gallery-placeholder');
            if (placeholder && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                placeholder.style.transform = 'scale(1.05)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const placeholder = this.querySelector('.gallery-placeholder');
            if (placeholder) {
                placeholder.style.transform = '';
            }
        });
    });
}

/* ========================================
   Count Up Animation for Stats
   ======================================== */
function initCountUp() {
    const stats = document.querySelectorAll('.stat-number');
    
    if (stats.length === 0) return;
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const countUp = (element, target, suffix = '') => {
        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;
        const increment = target / steps;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + suffix;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, stepDuration);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                
                // Parse the number and suffix
                const match = text.match(/^([\d.]+)(.*)$/);
                if (match) {
                    const number = parseFloat(match[1]);
                    const suffix = match[2];
                    
                    if (!isNaN(number)) {
                        element.textContent = '0' + suffix;
                        
                        // Check for reduced motion
                        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            element.textContent = number + suffix;
                        } else {
                            countUp(element, number, suffix);
                        }
                    }
                }
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => observer.observe(stat));
}

/* ========================================
   WhatsApp Button Animation
   ======================================== */
window.addEventListener('load', () => {
    setTimeout(() => {
        const whatsappBtn = document.querySelector('.whatsapp-float');
        if (whatsappBtn) {
            whatsappBtn.style.opacity = '0';
            whatsappBtn.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                whatsappBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                whatsappBtn.style.opacity = '1';
                whatsappBtn.style.transform = 'scale(1)';
            }, 1500);
        }
    }, 0);
});

/* ========================================
   Active Nav Link on Scroll
   ======================================== */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveNavLink);
});

/* ========================================
   Keyboard Navigation (Accessibility)
   ======================================== */
document.addEventListener('keydown', (e) => {
    // Focus management for modal/menu
    if (e.key === 'Tab') {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            const focusableElements = mobileMenu.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

/* ========================================
   Performance: Throttle
   ======================================== */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ========================================
   Scroll to Top Button
   ======================================== */
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;
    
    let lastScrollY = 0;
    const showThreshold = 400; // Show after scrolling 400px
    
    // Check scroll position
    function checkScroll() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > showThreshold) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
        
        lastScrollY = currentScrollY;
    }
    
    // Throttled scroll handler
    const throttledCheck = throttle(checkScroll, 100);
    window.addEventListener('scroll', throttledCheck, { passive: true });
    
    // Click handler - smooth scroll to top
    scrollTopBtn.addEventListener('click', () => {
        // Add click animation
        scrollTopBtn.style.transform = 'translateY(0) scale(0.9)';
        
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Reset button style after animation
        setTimeout(() => {
            scrollTopBtn.style.transform = '';
        }, 200);
    });
    
    // Initial check
    checkScroll();
}

/* ========================================
   Hero Auto Video (Image to Video after 2s)
   ======================================== */
function initHeroHoverVideo() {
    const heroContainer = document.querySelector('.hero-image-container');
    const heroVideo = document.querySelector('.hero-auto-video');
    const heroImage = document.querySelector('.hero-image');
    
    if (!heroContainer || !heroVideo || !heroImage) return;
    
    // Wait for page to fully load
    window.addEventListener('load', () => {
        // After 2 seconds, start video transition
        setTimeout(() => {
            // Load and play video
            heroVideo.load();
            heroVideo.play().then(() => {
                // Video started playing, fade transition
                heroContainer.classList.add('video-active');
            }).catch(() => {
                // Video play failed, keep image visible
                console.warn('Video autoplay failed');
            });
        }, 2000);
    });
}

/* ========================================
   Valentine's Day Video - Lazy Load & Autoplay
   ======================================== */
function initValentinesVideo() {
    const valentinesVideo = document.querySelector('.valentines-video');
    
    if (!valentinesVideo) return;
    
    // Use Intersection Observer for lazy loading
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Load and play video when it comes into view
                valentinesVideo.load();
                valentinesVideo.play().catch(() => {
                    console.warn('Valentine\'s video autoplay failed');
                });
                
                // Stop observing once loaded
                videoObserver.unobserve(valentinesVideo);
            }
        });
    }, {
        rootMargin: '100px 0px' // Start loading 100px before it comes into view
    });
    
    // Start observing the video
    videoObserver.observe(valentinesVideo);
    
    // Ensure video loops infinitely
    valentinesVideo.addEventListener('ended', () => {
        valentinesVideo.currentTime = 0;
        valentinesVideo.play();
    });
}


/* ========================================
   Appointment Booking System
   ======================================== */
function initAppointmentBooking() {
    const bookingContainer = document.getElementById('appointmentBooking');
    if (!bookingContainer) return;
    
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const dateNextBtn = document.getElementById('dateNextBtn');
    const timeSlots = document.getElementById('timeSlots');
    const timeNextBtn = document.getElementById('timeNextBtn');
    const timeBackBtn = document.getElementById('timeBackBtn');
    const summaryBackBtn = document.getElementById('summaryBackBtn');
    const confirmBtn = document.getElementById('confirmAppointmentBtn');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    
    let selectedDate = '';
    let selectedTime = '';
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // Render calendar
    function renderCalendar() {
        calendarDays.innerHTML = '';
        calendarMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
        
        const today = new Date();
        const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
        
        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarDays.appendChild(emptyCell);
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('button');
            dayCell.type = 'button';
            dayCell.className = 'calendar-day';
            dayCell.textContent = day;
            
            const cellDate = new Date(currentYear, currentMonth, day);
            const isPast = cellDate < today && !(cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth() && cellDate.getFullYear() === today.getFullYear());
            const isToday = isCurrentMonth && day === today.getDate();
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            if (isPast) {
                dayCell.classList.add('past');
                dayCell.disabled = true;
            } else if (isToday) {
                dayCell.classList.add('today');
            }
            
            dayCell.addEventListener('click', () => {
                if (!isPast) {
                    // Remove active from all days (including today)
                    document.querySelectorAll('.calendar-day').forEach(cell => {
                        cell.classList.remove('active');
                    });
                    // Add active to clicked day
                    dayCell.classList.add('active');
                    selectedDate = dateStr;
                    dateNextBtn.disabled = false;
                }
            });
            
            // Check if this day matches selectedDate and mark as active
            if (selectedDate === dateStr) {
                dayCell.classList.add('active');
            }
            
            calendarDays.appendChild(dayCell);
        }
    }
    
    // Initialize calendar
    renderCalendar();
    
    // Month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Generate time slots (9:00 - 21:00)
    function generateTimeSlots() {
        timeSlots.innerHTML = '';
        for (let hour = 9; hour <= 21; hour++) {
            const timeSlot = document.createElement('button');
            timeSlot.type = 'button';
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${String(hour).padStart(2, '0')}:00`;
            timeSlot.dataset.time = `${String(hour).padStart(2, '0')}:00`;
            
            timeSlot.addEventListener('click', () => {
                // Remove active from all slots
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('active');
                });
                // Add active to clicked slot
                timeSlot.classList.add('active');
                selectedTime = timeSlot.dataset.time;
                timeNextBtn.disabled = false;
            });
            
            timeSlots.appendChild(timeSlot);
        }
    }
    
    generateTimeSlots();
    
    // Step navigation
    function showStep(step) {
        const allSteps = document.querySelectorAll('.booking-step');
        allSteps.forEach(s => {
            s.classList.remove('active');
        });
        const targetStep = document.querySelector(`.booking-step[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }
    
    // Date Next
    dateNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (selectedDate) {
            console.log('Moving to step 2, selectedDate:', selectedDate);
            showStep(2);
            // Scroll to time selection smoothly
            setTimeout(() => {
                const timeStep = document.querySelector('.booking-step[data-step="2"]');
                if (timeStep) {
                    timeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        } else {
            alert('Lütfen bir tarih seçin');
        }
    });
    
    // Time Back
    timeBackBtn.addEventListener('click', () => {
        showStep(1);
    });
    
    // Time Next
    timeNextBtn.addEventListener('click', () => {
        if (selectedTime) {
            // Format date for display
            const dateObj = new Date(selectedDate);
            const formattedDate = dateObj.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            summaryDate.textContent = formattedDate;
            summaryTime.textContent = selectedTime;
            showStep(3);
        }
    });
    
    // Summary Back
    summaryBackBtn.addEventListener('click', () => {
        showStep(2);
    });
    
    // Confirm Appointment - WhatsApp redirect
    confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const dateObj = new Date(selectedDate);
        const formattedDate = dateObj.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const message = `Merhaba, randevu almak istiyorum.\n\nTarih: ${formattedDate}\nSaat: ${selectedTime}\n\nMüsait saatlerinizi öğrenebilir miyim?`;
        const phoneNumber = '905558903511';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
    });
}

/* ========================================
   Console Branding
   ======================================== */
console.log('%c✿ Fleura Nails', 'font-size: 24px; font-weight: bold; color: #c4a484;');
console.log('%cElleriniz için sanat eseri', 'font-size: 14px; color: #6b6360;');
console.log('%cTüm İzmir Bölgesine VIP Ev Hizmeti', 'font-size: 12px; color: #999;');
