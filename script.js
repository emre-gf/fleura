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
});

/* ========================================
   Preloader
   ======================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const isMobile = window.innerWidth <= 768;
    
    // Hide preloader after page loads - faster on mobile
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.remove('no-scroll');
            
            // Trigger hero animations after preloader
            animateHero();
        }, isMobile ? 300 : 600);
    });
    
    // Prevent scroll during preloader
    document.body.classList.add('no-scroll');
}

/* ========================================
   Hero Animations
   ======================================== */
function animateHero() {
    const badge = document.querySelector('.hero-badge');
    const titleLines = document.querySelectorAll('.title-line');
    const subtitle = document.querySelector('.hero-subtitle');
    const ctas = document.querySelector('.hero-ctas');
    const trustBadges = document.querySelector('.hero-trust-badges');
    const heroStats = document.querySelector('.hero-stats');
    
    const isMobile = window.innerWidth <= 768;
    
    // Mobile: faster staggered animations
    const multiplier = isMobile ? 0.5 : 1;
    
    const timeline = [
        { el: badge, delay: 50 * multiplier },
        { el: titleLines[0], delay: 100 * multiplier },
        { el: titleLines[1], delay: 180 * multiplier },
        { el: subtitle, delay: 260 * multiplier },
        { el: ctas, delay: 340 * multiplier },
        { el: trustBadges, delay: 420 * multiplier },
        { el: heroStats, delay: 500 * multiplier }
    ];
    
    timeline.forEach(({ el, delay }) => {
        if (el) {
            setTimeout(() => {
                el.classList.add('visible');
            }, delay);
        }
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
   AOS - Animate On Scroll
   ======================================== */
function initAOS() {
    // Initialize AOS with mobile-optimized settings
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        delay: 0,
        anchorPlacement: 'top-bottom',
        disable: false,
        startEvent: 'DOMContentLoaded',
        animatedClassName: 'aos-animate',
        useClassNames: false,
        disableMutationObserver: false,
        debounceDelay: 50,
        throttleDelay: 99,
        // Mobile optimizations
        mobile: true,
        tablet: true,
        // Respect reduced motion
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'mobile' : false
    });
    
    // Refresh AOS on window resize for better mobile support
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            AOS.refresh();
        }, 250);
    });
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
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
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
        
        // Simulate API call (replace with actual API in production)
        setTimeout(() => {
            // Show success message
            showFormSuccess();
            
            // Reset form
            form.reset();
            if (btnText) btnText.textContent = originalText;
            if (btnLoader) btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }, 1500);
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
   Console Branding
   ======================================== */
console.log('%c✿ Fleura Nails', 'font-size: 24px; font-weight: bold; color: #c4a484;');
console.log('%cElleriniz için sanat eseri', 'font-size: 14px; color: #6b6360;');
console.log('%cTüm İzmir Bölgesine VIP Ev Hizmeti', 'font-size: 12px; color: #999;');
