// Fixed Navigation component functionality
// Handles all navigation-related interactions with proper Bootstrap integration

class NavigationFixed {
    constructor() {
        this.header = document.querySelector('.navbar, .header');
        this.navToggle = document.querySelector('.navbar-toggler, #nav-toggle');
        this.navMenu = document.querySelector('.navbar-collapse, #nav-menu');
        this.navLinks = document.querySelectorAll('.js-scroll-trigger');
        this.sections = document.querySelectorAll('section[id], div[id]');
        
        this.isMenuOpen = false;
        this.lastScrollY = window.scrollY;
        this.scrollTimeout = null;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        // Navigation link clicks with enhanced smooth scrolling
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavLinkClick(e, link);
            });
        });

        // Enhanced scroll events with performance optimization
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateActiveLink();
                    this.handleHeaderScroll();
                    this.handleScrollDirection();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Click outside to close menu
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.navMenu.contains(e.target) && 
                !this.navToggle.contains(e.target)) {
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
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 992 && this.isMenuOpen) { // Bootstrap lg breakpoint
                this.closeMobileMenu();
            }
        }, 250));

        // Initial setup
        this.updateActiveLink();
        this.handleHeaderScroll();
    }

    handleNavLinkClick(e, link) {
        const href = link.getAttribute('href');
        
        // Handle internal anchor links
        if (href && href.startsWith('#') && href !== '#') {
            e.preventDefault();
            this.scrollToSection(href);
            this.closeMobileMenu();
            
            // Update URL without triggering scroll
            if (history.pushState) {
                history.pushState(null, null, href);
            }
        }
        // External links and other hrefs are handled normally
    }

    scrollToSection(targetId) {
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerHeight = this.header ? this.header.offsetHeight : 80;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            // Enhanced smooth scroll with easing
            this.smoothScrollTo(Math.max(0, targetPosition), 800);
        }
    }

    smoothScrollTo(targetPosition, duration = 800) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    updateActiveLink() {
        const scrollY = window.pageYOffset;
        const headerHeight = this.header ? this.header.offsetHeight : 80;
        let activeSection = null;
        
        // Find the current section with improved detection
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                activeSection = sectionId;
            }
        });

        // Special handling for top of page
        if (scrollY < 100) {
            activeSection = 'top';
        }

        // Update active link states
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            
            if (href === `#${activeSection}` || 
                (activeSection === 'top' && (href === '#top' || href === '#'))) {
                link.classList.add('active');
            }
        });
    }

    handleHeaderScroll() {
        const scrollY = window.scrollY;
        
        if (!this.header) return;
        
        // Add/remove scrolled class and styles
        if (scrollY > 50) {
            this.header.classList.add('scrolled');
            this.header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            this.header.style.backdropFilter = 'blur(10px)';
        } else {
            this.header.classList.remove('scrolled');
            this.header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            this.header.style.boxShadow = 'none';
            this.header.style.backdropFilter = 'blur(5px)';
        }
    }

    handleScrollDirection() {
        const currentScrollY = window.scrollY;
        
        // Only hide/show header if scrolled significantly
        if (Math.abs(currentScrollY - this.lastScrollY) > 10) {
            if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
                // Scrolling down - hide header
                if (this.header) {
                    this.header.style.transform = 'translateY(-100%)';
                    this.header.style.transition = 'transform 0.3s ease-in-out';
                }
            } else {
                // Scrolling up - show header
                if (this.header) {
                    this.header.style.transform = 'translateY(0)';
                    this.header.style.transition = 'transform 0.3s ease-in-out';
                }
            }
            this.lastScrollY = currentScrollY;
        }
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
        
        if (this.navToggle) {
            this.navToggle.classList.add('nav__toggle--open');
            this.navToggle.setAttribute('aria-expanded', 'true');
        }
        
        if (this.navMenu) {
            this.navMenu.classList.add('show', 'nav__menu--open');
            this.navMenu.setAttribute('aria-hidden', 'false');
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstLink = this.navMenu ? this.navMenu.querySelector('.nav-link') : null;
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        
        if (this.navToggle) {
            this.navToggle.classList.remove('nav__toggle--open');
            this.navToggle.setAttribute('aria-expanded', 'false');
        }
        
        if (this.navMenu) {
            this.navMenu.classList.remove('show', 'nav__menu--open');
            this.navMenu.setAttribute('aria-hidden', 'true');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Utility method for debouncing
    debounce(func, wait) {
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
        this.smoothScrollTo(0, 600);
    }

    highlightSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            targetSection.style.transition = 'background-color 0.3s ease';
            setTimeout(() => {
                targetSection.style.backgroundColor = '';
            }, 2000);
        }
    }

    // Get current active section
    getCurrentSection() {
        const scrollY = window.pageYOffset;
        const headerHeight = this.header ? this.header.offsetHeight : 80;
        
        for (let section of this.sections) {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                return section.getAttribute('id');
            }
        }
        
        return null;
    }
}

// Global instance for external access
window.NavigationFixed = NavigationFixed;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationFixed;
}