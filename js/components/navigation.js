// Navigation component functionality
// Handles all navigation-related interactions

class Navigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.sections = document.querySelectorAll('section[id]');
        
        this.isMenuOpen = false;
        this.lastScrollY = window.scrollY;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateActiveLink();
        this.handleHeaderScroll();
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // Navigation link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavLinkClick(e, link);
            });
        });

        // Scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.updateActiveLink();
            this.handleHeaderScroll();
            this.handleScrollDirection();
        }, 16)); // ~60fps

        // Click outside to close menu
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navMenu.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    handleNavLinkClick(e, link) {
        const href = link.getAttribute('href');
        
        // Handle internal links
        if (href.startsWith('#')) {
            e.preventDefault();
            this.scrollToSection(href);
            this.closeMobileMenu();
        }
    }

    scrollToSection(targetId) {
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerHeight = this.header.offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateActiveLink() {
        const scrollY = window.pageYOffset;
        const headerHeight = this.header.offsetHeight;
        
        let activeSection = null;
        
        // Find the current section
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                activeSection = section.getAttribute('id');
            }
        });

        // Update active link
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('nav__link--active');
            
            if (href === `#${activeSection}`) {
                link.classList.add('nav__link--active');
            }
        });
    }

    handleHeaderScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            this.header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            this.header.classList.add('header--scrolled');
        } else {
            this.header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            this.header.style.boxShadow = 'none';
            this.header.classList.remove('header--scrolled');
        }
    }

    handleScrollDirection() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            // Scrolling down
            this.header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            this.header.style.transform = 'translateY(0)';
        }
        
        this.lastScrollY = currentScrollY;
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.navToggle.classList.add('nav__toggle--open');
        this.navMenu.classList.add('nav__menu--open');
        document.body.style.overflow = 'hidden';
        
        // Add ARIA attributes for accessibility
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Focus first menu item
        const firstLink = this.navMenu.querySelector('.nav__link');
        if (firstLink) {
            firstLink.focus();
        }
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navToggle.classList.remove('nav__toggle--open');
        this.navMenu.classList.remove('nav__menu--open');
        document.body.style.overflow = '';
        
        // Update ARIA attributes
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');
    }

    // Utility method for throttling
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Public methods for external control
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    highlightSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            setTimeout(() => {
                targetSection.style.backgroundColor = '';
            }, 2000);
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}