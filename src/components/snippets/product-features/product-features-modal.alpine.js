import Swiper from 'swiper/bundle'

// @TODO remove this, put it in the global styles
// import styles bundle
import 'swiper/css/bundle'

export default (props = {}) => ({
  ...props,

  modalOpen: false,

  currentFeature: null,
  currentFeatureIndex: null,

  // Add component state initialization
  swiperInitialized: false,

  init() {
    // Check for required props
    if (!Array.isArray(this.productFeaturesHandles) || this.productFeaturesHandles.length === 0) {
      console.warn('ProductFeaturesModal: Missing or empty productFeaturesHandles array');
      this.productFeaturesHandles = [];
    }

    // Initialize after DOM is ready
    this.$nextTick(() => {
      this.initSwiper();

      // Set up slide change listener
      if (this.swiper) {
        this.swiper.on('slideChange', () => {
          const index = this.swiper.activeIndex;
          this.currentFeatureIndex = index;
          this.currentFeature = this.productFeaturesHandles[index];
        });
      }
    });

    // Watch for feature changes in store
    this.$watch('$store.app.productFeaturesModalFeature', (feature) => {
      if (feature) {
        this.setActiveFeatureByHandle(feature);
        this.modalOpen = true;
      } else {
        this.modalOpen = false;
      }
    });

    // handle lenis scroll
    this.$watch('modalOpen', (isOpen) => {
      window.LocoScroll && window.LocoScroll.lenisInstance[isOpen ? 'stop' : 'start']()
    });

  },

  // Close the modal and update store values
  closeModal() {
    this.modalOpen = false;
    this.$store.app.productFeaturesModalFeature = null;
  },

  /**
   * Initialize the Swiper instance
   */
  initSwiper() {
    try {
      if (this.$refs.sliderEl) {
        this.swiper = new Swiper(this.$refs.sliderEl, {
          autoHeight: true,
          effect: 'fade',
          fadeEffect: {
            crossFade: true
          },
          grabCursor: false,
          normalizeSlideIndex: true,
        });
        this.swiperInitialized = true;
      } else {
        console.warn('ProductFeaturesModal: Swiper container element not found');
      }
    } catch (error) {
      console.error('ProductFeaturesModal: Failed to initialize Swiper', error);
    }
  },

  /**
   * Set active feature by index
   * @param {number} index - Index of the feature to activate
   */
  setActiveFeature(index) {
    if (!this.swiperInitialized) {
      console.warn('ProductFeaturesModal: Cannot set active feature, Swiper not initialized');
      return;
    }

    if (index !== -1 && index < this.productFeaturesHandles.length) {
      this.swiper.slideTo(index);
      this.currentFeatureIndex = index;
      this.currentFeature = this.productFeaturesHandles[index];
    } else {
      console.warn(`ProductFeaturesModal: Invalid feature index: ${index}`);
    }
  },

  /**
   * Set active feature by handle
   * @param {string} handle - Handle of the feature to activate
   */
  setActiveFeatureByHandle(handle) {
    if (handle) {
      const index = this.getIndexByHandle(handle);
      if (index !== -1) {
        this.setActiveFeature(index);
      } else {
        console.warn(`ProductFeaturesModal: Feature handle not found: ${handle}`);
      }
    }
  },

  /**
   * Get feature index by handle
   * @param {string} handle - Handle to look up
   * @returns {number} Index of the feature or -1 if not found
   */
  getIndexByHandle(handle) {
    return this.productFeaturesHandles.indexOf(handle);
  },

  destroy() {
    if (this.swiper) {
      try {
        this.swiper.destroy(true, true);
        this.swiperInitialized = false;
      } catch (error) {
        console.error('ProductFeaturesModal: Error destroying Swiper', error);
      }
    }

    this.$store.app.productFeaturesModalFeature = null;
  },

})
