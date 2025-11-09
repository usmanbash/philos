import Alpine from 'alpinejs';

const store = Alpine.store('app', {
  miniCartOpen: false,
  menuOpen: false,

  logoFull: false,
  isLogoAnimated: false,

  // Product Features Modal
  productFeaturesModalFeature: null,

  init() {},

  toggleMiniCart() {
    this.miniCartOpen = !this.miniCartOpen;
  },

  toggleSizeGuide() {
    this.sizeGuideOpen = !this.sizeGuideOpen;
    this.$dispatch('toggle-size-guide', this.isSizeGuideOpen);
  },

  openProductFeaturesModal(feature) {
    this.productFeaturesModalFeature = feature;
  },

  closeProductFeaturesModal() {
    this.productFeaturesModalFeature = null;
  },
});

export default store;
