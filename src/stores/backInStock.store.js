import Alpine from 'alpinejs';

const store = Alpine.store('backInStock', {
  // UI state
  isModalOpen: false,
  autoCloseModalTimeout: null,
  autoCloseModalDelay: 5000,

  // Data
  selectedVariantId: null,
  selectedVariant: null,

  // request state
  requestStatus: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  requestMessage: null,
  requestError: null,

  lastSubmission: null,

  init() {
    // Initialize selected variant from URL on first load
    const urlParams = new URLSearchParams(window.location.search);
    const variantId = urlParams.get('variant');
    if (variantId) this.selectedVariantId = variantId;

    // get variant

    this.onSelectedVariantChanged = (event) => {
      const { id, variant } = event?.detail;
      if (!id) return;

      console.log('[backInStock.store] selected-variant-changed', id, variant);
      this.setVariantId(id);
      this.setVariant(variant);
    };

    document.addEventListener('selected-variant-changed', this.onSelectedVariantChanged);
  },

  destroy() {
    this.autoCloseModalTimeout && clearTimeout(this.autoCloseModalTimeout);
    document.removeEventListener('selected-variant-changed', this.onSelectedVariantChanged);
  },

  setVariantId(variantId) {
    this.selectedVariantId = variantId || null;
  },

  setVariant(variant) {
    this.selectedVariant = variant || null;
  },

  openModal() {
    this.clearRequestState();
    this.isModalOpen = true;
  },

  closeModal() {
    this.isModalOpen = false;
  },

  // Request state helpers managed by form component
  setRequestPending() {
    this.requestStatus = 'loading';
    this.requestMessage = null;
    this.requestError = null;
  },

  setRequestSuccess(message, payload = {}) {
    this.requestStatus = 'success';
    this.requestMessage = message || null;
    this.requestError = null;
    this.lastSubmission = {
      email: payload.email || null,
      variantId: payload.variantId || this.selectedVariantId || null,
      timestamp: Date.now(),
    };

    this.autoCloseModalTimeout = setTimeout(() => {
      this.closeModal();
    }, this.autoCloseModalDelay);
  },

  setRequestError(message) {
    this.requestStatus = 'error';
    this.requestMessage = null;
    this.requestError = message || 'Something went wrong';
  },

  clearRequestState() {
    this.requestStatus = 'idle';
    this.requestMessage = null;
    this.requestError = null;
  },
});

export default store;
