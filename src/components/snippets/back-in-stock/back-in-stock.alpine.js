export default (props = {}) => ({
  ...props,

  init() {},
  destroy() {},

  // Proxy helpers for template usage if needed
  get isModalOpen() {
    return this.$store.backInStock.isModalOpen;
  },

  get variantId() {
    return this.$store.backInStock.selectedVariantId;
  },

  get variantName() {
    let variant = this.$store.backInStock.selectedVariant;
    return variant?.name || '';
  },

  get variantImageSrc() {
    let variant = this.$store.backInStock.selectedVariant;
    let featuredImage = variant?.featured_image;
    return featuredImage?.src;
  },

  get isSuccess() {
    return this.$store.backInStock.requestStatus === 'success';
  },

  openModal() {
    this.$store.backInStock.openModal();
  },

  closeModal() {
    this.$store.backInStock.closeModal();
  },
});
