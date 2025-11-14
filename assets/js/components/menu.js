// Get references to DOM elements (no more mod.selector dependencies)
const navbar = document.querySelector('.navbar');
const bodyEl = document.getElementById('entireBody');

// Viewport height calculations (keeping your existing logic)
let vh01 = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh01', `${vh01}px`);
let vh50 = window.innerHeight * 0.20; // was 0.50

// State variables
let scrolled = false;
let toggled = false;

// Scroll event listeners (keeping your existing logic)
if (bodyEl.addEventListener) {
    bodyEl.addEventListener('mousewheel', checkIfScrolled, false);
    bodyEl.addEventListener('DOMMouseScroll', checkIfScrolled, false);
} else {
    bodyEl.attachEvent('onmousewheel', checkIfScrolled);
}

// Bootstrap collapse event handlers (keeping your existing logic)
$('.collapse').on('show.bs.collapse', () => {
    if (navbar) {
        navbar.classList.add('expanded');
    }
    toggled = true;
});

$('.collapse').on('hide.bs.collapse', () => {
    if (navbar) {
        navbar.classList.remove('expanded');
    }
    toggled = false;
});

// Scroll functions (keeping your existing logic)
function addScrolled() {
    if (navbar) {
        navbar.classList.add('scrolled');
        navbar.classList.remove('atTheTop');
    }
    scrolled = true;
}

function removeScrolled() {
    if (navbar) {
     //   navbar.classList.remove('scrolled');
     //   navbar.classList.add('atTheTop');
    }
    scrolled = false;
    
    // Update #top and #bottom elements (keeping your existing logic)
    const topElement = document.getElementById('top');
    const bottomElement = document.getElementById('bottom');
    
    if (topElement) {
     //   topElement.className = "top ViewHeaderAfterPageLoad";
    }
    if (bottomElement) {
       // bottomElement.className = "bottom ViewHeaderAfterPageLoad";
    }
}

function checkIfScrolled(e) {
    if (scrolled && pageYOffset <= 25) return removeScrolled();
    if (!scrolled && pageYOffset > vh50) return addScrolled();
}

// Enhanced scroll handler with jQuery
$(function () {
    $(document).scroll(function () { 
        checkIfScrolled();
    });
});

// Smooth scrolling functionality for .js-scroll-trigger links - with debug mode
function initSmoothScrolling() {
    const scrollTriggers = document.querySelectorAll('.js-scroll-trigger');
    const EXTRA_OFFSET = 20; // restores original ~20px spacing
    const DEBUG = false; // set to true to enable logging

    scrollTriggers.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#') || href === '#') return;

            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;

            // Auto-detect fixed navbar top
            let navbarTop = document.querySelector('.navbar-top');
            if (!navbarTop) {
                navbarTop = document.querySelector('.navbar'); // fallback
            }

            const dynamicNavbarHeight = window.innerWidth < 1000
                ? 63.9   // fixed collapsed navbar height for mobile
                : (navbarTop ? navbarTop.offsetHeight : 0); // desktop dynamic

            const scrollToTarget = () => {
                const elementRect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = scrollTop + elementRect.top - dynamicNavbarHeight - EXTRA_OFFSET;

                if (DEBUG) {
                    console.log('SmoothScroll Debug:');
                    console.log('  window.innerWidth:', window.innerWidth);
                    console.log('  dynamicNavbarHeight:', dynamicNavbarHeight);
                    console.log('  targetRect.top:', elementRect.top);
                    console.log('  pageYOffset:', scrollTop);
                    console.log('  EXTRA_OFFSET:', EXTRA_OFFSET);
                    console.log('  targetPosition (final scrollTop):', targetPosition);
                }

                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });

                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            };

            if (typeof closeMobileMenu === 'function') {
                closeMobileMenu();
                requestAnimationFrame(scrollToTarget);
            } else {
                scrollToTarget();
            }
        });
    });
}

// NEW: Mobile menu closing functionality
function closeMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        // Remove Bootstrap's 'show' class to close the menu
        navbarCollapse.classList.remove('show');
        
        // Update toggler aria-expanded attribute
        navbarToggler.setAttribute('aria-expanded', 'false');
        
        // Update our state
        toggled = false;
        
        // Remove expanded class from navbar
        if (navbar) {
            navbar.classList.remove('expanded');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// NEW: Enhanced mobile menu toggle with proper state management
function setupMobileMenuToggle() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function(e) {
            // Let Bootstrap handle the toggle, but update our state
            setTimeout(() => {
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse) {
                    toggled = navbarCollapse.classList.contains('show');
                    
                    if (toggled) {
                        // Menu is opening
                        if (navbar) {
                            navbar.classList.add('expanded');
                        }
                        // Prevent body scroll when menu is open
                        document.body.style.overflow = 'hidden';
                    } else {
                        // Menu is closing
                        if (navbar) {
                            navbar.classList.remove('expanded');
                        }
                        // Restore body scroll
                        document.body.style.overflow = '';
                    }
                }
            }, 10);
        });
    }
}

// NEW: Close menu when clicking outside
function setupOutsideClickClose() {
    document.addEventListener('click', function(e) {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
        if (toggled && navbarCollapse && navbarToggler) {
            // Check if click is outside the navbar
            if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
}

// NEW: Close menu on escape key
function setupEscapeKeyClose() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && toggled) {
            closeMobileMenu();
        }
    });
}

// NEW: Handle window resize
function setupResizeHandler() {
    window.addEventListener('resize', function() {
        // Update viewport height calculations
        vh01 = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh01', `${vh01}px`);
        vh50 = window.innerHeight * 0.20;
        
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 992 && toggled) { // Bootstrap lg breakpoint
            closeMobileMenu();
        }
    });
}

// NEW: Active link highlighting based on scroll position
function setupActiveNavigation() {
    const navLinks = document.querySelectorAll('.js-scroll-trigger');
    const sections = document.querySelectorAll('section[id], div.relevantInTopNavToStyleTheActiveNavElement[id]');
    
    function updateActiveLink() {
        const scrollY = window.pageYOffset;
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        let activeSection = null;
        
        // Find current section
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                activeSection = sectionId;
            }
        });
        
        // Update active states
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            
            if (href === `#${activeSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Throttled scroll handler for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial call
    updateActiveLink();
}

// Initialize all functionality when DOM is ready
function initializeNavigation() {
    // Wait for DOM and libraries to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(setupAllFeatures, 100);
        });
    } else {
        setTimeout(setupAllFeatures, 100);
    }
}

function setupAllFeatures() {
    try {
        initSmoothScrolling();
        setupMobileMenuToggle();
        setupOutsideClickClose();
        setupEscapeKeyClose();
        setupResizeHandler();
        setupActiveNavigation();
        
        // console.log('✅ Fixed navigation system initialized successfully');
    } catch (error) {
        // console.error('❌ Error initializing navigation:', error);
    }
}

// Start initialization
initializeNavigation();

// Export for debugging (optional)
window.NovaConsonanzaNavigation = {
    closeMobileMenu,
    scrolled,
    toggled,
    checkIfScrolled
};





// =============================================================================

// YOUTUBE VIDEO MODAL FUNCTIONALITY (Fixed - No AnyMod Dependencies)

// =============================================================================



// YouTube video configuration - hardcoded video IDs

const youtubeVideos = {

    'uGmc8aE4_Ns': 'uGmc8aE4_Ns',      // Beethoven: Sinfonie Nr. 3 "Eroica"

    'GW4QvK7j6MY': 'GW4QvK7j6MY',      // J. M. Kraus: Sinfonie c-Moll

    'QgVv8NrJIe8': 'QgVv8NrJIe8',      // C. M. v. Weber: OuvertÃ¼re zur Oper Der FreischÃ¼tz

    'video-6XbqUUd1B1Y': '6XbqUUd1B1Y',      // Beethoven: Sinfonie Nr. 6 "Pastorale" (prefixed for valid selector)

    'Piwxe9ze23w': 'Piwxe9ze23w',      // Mendelssohn: Schottische Sinfonie 1. Satz

    'L8rITVKba34': 'L8rITVKba34'       // Mendelssohn: Schottische Sinfonie 2. Satz

};



// Initialize YouTube modal functionality

function initializeYouTubeModals() {

    // console.log('ðŸ” Initializing YouTube modals...');

    // console.log('Available videos:', youtubeVideos);

    

    // Setup click handlers for each video

    Object.keys(youtubeVideos).forEach(elementId => {

        const youtubeId = youtubeVideos[elementId];

        const videoElement = document.getElementById(elementId === 'video-6XbqUUd1B1Y' ? '6XbqUUd1B1Y' : elementId);

        // console.log(`ðŸŽ¬ Checking element: ${elementId}`, videoElement);

        

        if (videoElement) {

            // console.log(`âœ… Found element ${elementId}, adding click handler`);

            

            videoElement.addEventListener('click', function(e) {

                // console.log(`ðŸŽ¯ Video clicked: ${elementId}`);

                e.preventDefault();

                e.stopPropagation();

                openVideoModal(youtubeId);

            });

        } else {

            // console.warn(`âŒ Element not found: ${elementId}`);

        }

    });

    

    // Setup close handlers

    setupVideoModalCloseHandlers();

}



// Open video modal

function openVideoModal(youtubeId) {

    // console.log(`ðŸš€ Opening modal for YouTube ID: ${youtubeId}`);

    

    try {

        const autoplay = '?autoplay=1';

        const related_no = '&rel=0';

        const src = `//www.youtube.com/embed/${youtubeId}${autoplay}${related_no}`;

        

        // console.log(`ðŸ“º Video src: ${src}`);

        

        // Find the iframe for this video (using YouTube ID directly)

        const iframe = document.querySelector(`iframe[id="am-youtube-${youtubeId}"]`);

        // console.log(`ðŸ–¼ï¸ Iframe element:`, iframe);

        

        if (iframe) {

            iframe.setAttribute('src', src);

            // console.log(`âœ… Iframe src set`);

        } else {

            // console.warn(`âŒ Iframe not found: am-youtube-${youtubeId}`);

        }

        

        // Show the modal (using YouTube ID as class name)

        const modal = document.querySelector(`section.am-modal[class*="${youtubeId}"]`);

        // console.log(`ðŸŽ­ Modal element:`, modal);

        

        if (modal) {

            modal.classList.add('show-am-modal');

            // console.log(`âœ… Modal shown`);

        } else {

            // console.warn(`âŒ Modal not found: .${youtubeId}`);

        }

        

        // Prevent body scroll when modal is open

        document.body.style.overflow = 'hidden';

        // console.log(`ðŸ”’ Body scroll disabled`);

        

    } catch (error) {

        // console.error('âŒ Error opening video modal:', error);

    }

}



// Close video modal

function closeVideoModal(event) {

    // console.log('ðŸ”’ Closing video modal', event);

    

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }

    

    // Remove show class from all modals

    document.querySelectorAll('section.am-modal').forEach(modal => {

        modal.classList.remove('show-am-modal');

    });

    

    // Stop all videos by clearing iframe src

    Object.values(youtubeVideos).forEach(youtubeId => {

        const iframe = document.querySelector(`iframe[id="am-youtube-${youtubeId}"]`);

        if (iframe) {

            iframe.setAttribute('src', '');

        }

    });

    

    // Restore body scroll

    document.body.style.overflow = '';

}



// Setup close handlers

function setupVideoModalCloseHandlers() {

    // console.log('ðŸŽ¯ Setting up close handlers');

    

    // Close button and overlay clicks

    document.addEventListener('click', function(e) {

        // Check if clicked element or its parent has close class

        const closeButton = e.target.closest('.close-am-modal');

        const overlay = e.target.classList.contains('am-overlay');

        

        if (closeButton || overlay) {

            // console.log('ðŸŽ¯ Close clicked');

            e.preventDefault();

            e.stopPropagation();

            closeVideoModal(e);

        }

    });

    

    // Escape key

    document.addEventListener('keyup', function(e) {

        if (e.keyCode === 27) { // Escape key

            // console.log('âŒ¨ï¸ Escape pressed');

            closeVideoModal();

        }

    });

}



// Add YouTube modal initialization to the main setup

function setupAllFeatures() {

    try {

        initSmoothScrolling();

        setupMobileMenuToggle();

        setupOutsideClickClose();

        setupEscapeKeyClose();

        setupResizeHandler();

        setupActiveNavigation();

        

        // Add YouTube modal initialization

        initializeYouTubeModals();

        

        // console.log('âœ… Fixed navigation system initialized successfully');

        // console.log('ðŸŽ¬ YouTube video modals initialized successfully');

    } catch (error) {

        // console.error('âŒ Error initializing navigation:', error);

    }

}



// Export YouTube functions for debugging

window.NovaConsonanzaNavigation.youtube = {

    openVideoModal,

    closeVideoModal,

    youtubeVideos

};