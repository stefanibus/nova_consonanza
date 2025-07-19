// Carousel component for image galleries and content sliders
// Provides smooth, accessible carousel functionality
 
class Carousel {
    constructor(element, options = {}) {
        this.carousel = element;
        this.options = {
            autoPlay: options.autoPlay || false,
            autoPlayInterval: options.autoPlayInterval || 5000,
            showDots: options.showDots !== false,
            showArrows: options.showArrows !== false,
            infinite: options.infinite !== false,
            slidesToShow: options.slidesToShow || 1,
            slidesToScroll: options.slidesToScroll || 1,
            responsive: options.responsive || [],
            ...options
        };

        this.currentSlide = 0;
        this.totalSlides = 0;
        this.isPlaying = false;
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        if (!this.carousel) return;

        this.setupCarousel();
        this.createControls();
        this.setupEventListeners();
        this.updateCarousel();

        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }

    setupCarousel() {
        // Get slides
        this.slides = Array.from(this.carousel.children);
        this.totalSlides = this.slides.length;

        if (this.totalSlides === 0) return;

        // Create carousel structure
        this.carousel.classList.add('carousel');
        this.carousel.innerHTML = `
            <div class="carousel__track">
                ${this.slides.map(slide => slide.outerHTML).join('')}
            </div>
        `;

        this.track = this.carousel.querySelector('.carousel__track');
        this.slides = Array.from(this.track.children);

        // Add slide classes
        this.slides.forEach((slide, index) => {
            slide.classList.add('carousel__slide');
            slide.setAttribute('data-slide', index);
        });
    }

    createControls() {
        // Create arrows
        if (this.options.showArrows && this.totalSlides > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'carousel__arrow carousel__arrow--prev';
            prevButton.innerHTML = '‹';
            prevButton.setAttribute('aria-label', 'Previous slide');

            const nextButton = document.createElement('button');
            nextButton.className = 'carousel__arrow carousel__arrow--next';
            nextButton.innerHTML = '›';
            nextButton.setAttribute('aria-label', 'Next slide');

            this.carousel.appendChild(prevButton);
            this.carousel.appendChild(nextButton);

            this.prevButton = prevButton;
            this.nextButton = nextButton;
        }

        // Create dots
        if (this.options.showDots && this.totalSlides > 1) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'carousel__dots';

            for (let i = 0; i < this.totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel__dot';
                dot.setAttribute('data-slide', i);
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dotsContainer.appendChild(dot);
            }

            this.carousel.appendChild(dotsContainer);
            this.dots = Array.from(dotsContainer.children);
        }
    }

    setupEventListeners() {
        // Arrow clicks
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextSlide());
        }

        // Dot clicks
        if (this.dots) {
            this.dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                    this.goToSlide(slideIndex);
                });
            });
        }

        // Keyboard navigation
        this.carousel.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
            }
        });

        // Touch events for mobile
        this.carousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        });

        this.carousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });

        // Pause autoplay on hover
        this.carousel.addEventListener('mouseenter', () => {
            if (this.isPlaying) {
                this.pauseAutoPlay();
            }
        });

        this.carousel.addEventListener('mouseleave', () => {
            if (this.options.autoPlay && !this.isPlaying) {
                this.startAutoPlay();
            }
        });

        // Pause autoplay when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.options.autoPlay) {
                this.startAutoPlay();
            }
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    nextSlide() {
        if (this.options.infinite) {
            this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        } else {
            this.currentSlide = Math.min(this.currentSlide + 1, this.totalSlides - 1);
        }
        this.updateCarousel();
    }

    prevSlide() {
        if (this.options.infinite) {
            this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        } else {
            this.currentSlide = Math.max(this.currentSlide - 1, 0);
        }
        this.updateCarousel();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlide = index;
            this.updateCarousel();
        }
    }

    updateCarousel() {
        if (!this.track) return;

        // Update slide positions
        const translateX = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${translateX}%)`;

        // Update slide states
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('carousel__slide--active', index === this.currentSlide);
            slide.setAttribute('aria-hidden', index !== this.currentSlide);
        });

        // Update dots
        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('carousel__dot--active', index === this.currentSlide);
            });
        }

        // Update arrows
        if (!this.options.infinite) {
            if (this.prevButton) {
                this.prevButton.disabled = this.currentSlide === 0;
            }
            if (this.nextButton) {
                this.nextButton.disabled = this.currentSlide === this.totalSlides - 1;
            }
        }

        // Trigger custom event
        this.carousel.dispatchEvent(new CustomEvent('slideChange', {
            detail: {
                currentSlide: this.currentSlide,
                totalSlides: this.totalSlides
            }
        }));
    }

    startAutoPlay() {
        if (this.totalSlides <= 1) return;

        this.isPlaying = true;
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.options.autoPlayInterval);
    }

    pauseAutoPlay() {
        this.isPlaying = false;
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    toggleAutoPlay() {
        if (this.isPlaying) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    destroy() {
        this.pauseAutoPlay();
        
        // Remove event listeners
        if (this.prevButton) {
            this.prevButton.removeEventListener('click', this.prevSlide);
        }
        if (this.nextButton) {
            this.nextButton.removeEventListener('click', this.nextSlide);
        }

        // Reset carousel
        this.carousel.innerHTML = this.slides.map(slide => slide.outerHTML).join('');
        this.carousel.classList.remove('carousel');
    }

    // Public API methods
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    isAutoPlaying() {
        return this.isPlaying;
    }
}

// CSS for carousel (to be added to components.css)
const carouselCSS = `
.carousel {
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius-lg);
}

.carousel__track {
    display: flex;
    transition: transform 0.3s ease-in-out;
}

.carousel__slide {
    min-width: 100%;
    flex-shrink: 0;
}

.carousel__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10;
    transition: all var(--transition-fast);
}

.carousel__arrow:hover {
    background-color: white;
    box-shadow: var(--shadow-md);
}

.carousel__arrow--prev {
    left: 10px;
}

.carousel__arrow--next {
    right: 10px;
}

.carousel__dots {
    display: flex;
    justify-content: center;
    gap: var(--spacing-2);
    margin-top: var(--spacing-4);
}

.carousel__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background-color: var(--gray-300);
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.carousel__dot--active,
.carousel__dot:hover {
    background-color: var(--primary-color);
}
`;

// Auto-initialize carousels
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('[data-carousel]');
    carousels.forEach(carousel => {
        const options = JSON.parse(carousel.getAttribute('data-carousel') || '{}');
        new Carousel(carousel, options);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Carousel;
}