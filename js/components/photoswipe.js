// PhotoSwipe integration for Nova Consonanza gallery
// Complete rewrite with defensive programming to fix undefined errors

// Global variable to track current PhotoSwipe instance
let currentPhotoSwipeInstance = null;

// Basic options - simplified to avoid conflicts
const options = {
  focus: false,
  captionEl: false,
  shareEl: false,
  fullscreenEl: true,
  zoomEl: true,
  counterEl: true,
  closeEl: true,
  arrowEl: true,
  showHideOpacity: true,
  bgOpacity: 0.8,
  closeOnScroll: false,
  closeOnVerticalDrag: true,
  escKey: true,
  arrowKeys: true,
  history: false,
  tapToClose: true,
  tapToToggleControls: true,
  clickToCloseNonZoomable: false
};

// Safe cleanup function
function cleanupPhotoSwipe() {
  if (currentPhotoSwipeInstance) {
    try {
      if (typeof currentPhotoSwipeInstance.close === 'function') {
        currentPhotoSwipeInstance.close();
      }
      if (typeof currentPhotoSwipeInstance.destroy === 'function') {
        currentPhotoSwipeInstance.destroy();
      }
    } catch (error) {
      // Silent cleanup
    }
    currentPhotoSwipeInstance = null;
  }
}

// Safe image array generation with extensive error checking
function getImageArray() {
  // Check if gallery parent exists
  const galleryParent = document.querySelector('#gallery_parent');
  if (!galleryParent) {
    return [];
  }
  
  // Get all image containers
  const imageContainers = galleryParent.querySelectorAll('.anm-image');
  if (!imageContainers || imageContainers.length === 0) {
    return [];
  }
  
  const imageArray = [];
  
  // Process each container safely
  imageContainers.forEach((container, index) => {
    if (!container) {
      return;
    }
    
    // Try multiple selectors to find the source image
    let sourceImage = null;
    const selectors = [
      `#source-${index}`,
      `img[id="source-${index}"]`,
      '.anm-source',
      'img'
    ];
    
    for (const selector of selectors) {
      sourceImage = container.querySelector(selector);
      if (sourceImage && sourceImage.src) {
        break;
      }
    }
    
    if (!sourceImage || !sourceImage.src) {
      return;
    }
    
    // Get dimensions safely
    let width = 1200; // default
    let height = 800; // default
    
    if (sourceImage.naturalWidth && sourceImage.naturalHeight) {
      width = sourceImage.naturalWidth;
      height = sourceImage.naturalHeight;
    } else if (sourceImage.width && sourceImage.height) {
      width = sourceImage.width;
      height = sourceImage.height;
    }
    
    // Ensure minimum dimensions
    width = Math.max(width, 400);
    height = Math.max(height, 300);
    
    const imageData = {
      src: sourceImage.src,
      w: width,
      h: height
    };
    
    imageArray.push(imageData);
  });
  
  return imageArray;
}

// Safe PhotoSwipe initialization
function initializePhotoSwipe() {
  // Check if PhotoSwipe libraries are loaded
  if (typeof PhotoSwipe === 'undefined') {
    return;
  }
  
  if (typeof PhotoSwipeUI_Default === 'undefined') {
    return;
  }
  
  // Check gallery container
  const galleryContainer = document.querySelector('#gallery_parent');
  if (!galleryContainer) {
    return;
  }
  
  // Get image containers
  const imageContainers = galleryContainer.querySelectorAll('.anm-image');
  if (!imageContainers || imageContainers.length === 0) {
    return;
  }
  
  // Add click handlers safely
  imageContainers.forEach((container, index) => {
    if (!container) {
      return;
    }
    
    // Find thumbnail safely
    let thumbnail = null;
    const thumbnailSelectors = [
      `#thumbnail-${index}`,
      `img[id="thumbnail-${index}"]`,
      'img:first-child',
      'img'
    ];
    
    for (const selector of thumbnailSelectors) {
      thumbnail = container.querySelector(selector);
      if (thumbnail) {
        break;
      }
    }
    
    if (!thumbnail) {
      return;
    }
    
    // Add click handler
    thumbnail.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Clean up any existing instance
      cleanupPhotoSwipe();
      
      // Small delay to ensure cleanup
      setTimeout(() => {
        openPhotoSwipe(index);
      }, 50);
    });
    
    // Style thumbnail
    thumbnail.style.cursor = 'pointer';
    thumbnail.title = `View image ${index + 1}`;
  });
}

// Safe PhotoSwipe opening
function openPhotoSwipe(index) {
  // Clean up any existing instance first
  cleanupPhotoSwipe();
  
  // Ensure PhotoSwipe container exists
  const pswpElement = ensurePhotoSwipeContainer();
  if (!pswpElement) {
    return;
  }
  
  // Get image array
  const imageArray = getImageArray();
  if (!imageArray || imageArray.length === 0) {
    return;
  }
  
  // Validate index
  if (index < 0 || index >= imageArray.length) {
    return;
  }
  
  // Create options with safe thumbnail bounds
  const currentOptions = {
    ...options,
    index: index,
    // Force enable all UI elements
    shareEl: false,
    fullscreenEl: true,
    zoomEl: true,
    counterEl: true,
    closeEl: true,
    arrowEl: true,
    showHideOpacity: true,
    bgOpacity: 0.8,
    getThumbBoundsFn: (index) => {
      try {
        const thumbnailEl = document.querySelector(`#thumbnail-${index}`) || 
                           document.querySelector(`img[id="thumbnail-${index}"]`);
        
        if (!thumbnailEl) {
          return { x: 0, y: 0, w: 0 };
        }
        
        const rect = thumbnailEl.getBoundingClientRect();
        const pageYScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
        
        return {
          x: rect.left || 0,
          y: (rect.top || 0) + pageYScroll,
          w: rect.width || 0
        };
      } catch (error) {
        return { x: 0, y: 0, w: 0 };
      }
    }
  };
  
  try {
    // Create PhotoSwipe instance
    currentPhotoSwipeInstance = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      imageArray,
      currentOptions
    );
    
    // Add event listeners
    currentPhotoSwipeInstance.listen('close', function() {
      setTimeout(() => {
        currentPhotoSwipeInstance = null;
      }, 100);
    });
    
    currentPhotoSwipeInstance.listen('destroy', function() {
      currentPhotoSwipeInstance = null;
    });
    
    // Initialize PhotoSwipe
    currentPhotoSwipeInstance.init();
    
  } catch (error) {
    currentPhotoSwipeInstance = null;
  }
}

// Ensure PhotoSwipe container exists
function ensurePhotoSwipeContainer() {
  // AGGRESSIVE CLEANUP: Remove ALL existing PhotoSwipe containers
  const allExistingContainers = document.querySelectorAll('.pswp, #pswp, [class*="pswp"]');
  allExistingContainers.forEach((container, index) => {
    container.remove();
  });
  
  let pswpElement = document.querySelector('#pswp');
  
  if (pswpElement) {
    return pswpElement;
  }
  
  try {
    pswpElement = document.createElement('div');
    pswpElement.id = 'pswp';
    pswpElement.className = 'pswp';
    pswpElement.tabIndex = -1;
    pswpElement.role = 'dialog';
    pswpElement.setAttribute('aria-hidden', 'true');
    
    pswpElement.innerHTML = `
      <div class="pswp__bg"></div>
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
          <div class="pswp__top-bar">
            <div class="pswp__counter"></div>
            <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
            <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
            <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
            <div class="pswp__preloader">
              <div class="pswp__preloader__icn">
                <div class="pswp__preloader__cut">
                  <div class="pswp__preloader__donut"></div>
                </div>
              </div>
            </div>
          </div>
          <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
          <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
          <div class="pswp__caption">
            <div class="pswp__caption__center"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(pswpElement);
    return pswpElement;
    
  } catch (error) {
    return null;
  }
}

// Safe initialization when DOM is ready
function safeInitialize() {
  try {
    // Wait a bit for everything to load
    setTimeout(() => {
      ensurePhotoSwipeContainer();
      initializePhotoSwipe();
    }, 100);
  } catch (error) {
    // Silent error handling
  }
}

// Initialize based on document state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInitialize);
} else {
  safeInitialize();
}

// Export for debugging
window.PhotoSwipeDebug = {
  currentInstance: () => currentPhotoSwipeInstance,
  getImageArray,
  openPhotoSwipe,
  cleanupPhotoSwipe
};