import './product-variant-card.scss';
import formatDate from '../../common/formatDate';
import getOptionValue from '../../common/getOptionValue';
import SizeGuide from '../../common/sizeGuide';
import _addToCart from '../../common/addToCart.js';
import _get from 'lodash/get';
import _toNumber from 'lodash/toNumber';
import _isObject from 'lodash/isObject';

import moneyAmountToCents from '../../common/moneyAmountToCents';
import formatMoney from '../../common/formatMoney';

// export component (Alpine.data)
// @see https://alpinejs.dev/directives/data

// check if product is available
// in same cases, product is not available but we still have variants
// so there can be some products with availableSizes but no available product
// in that case, we have to display available sizes
// in case of the product is not available and do not have sizes, we will disable quickAtc button

// for server side card, we have props.availableSizes, props.productAvailable and props.firstColorVariantAvailable
// we should check firstColorVariantAvailable, fallback to productAvailable for server side card
// for client side card, we have this.variants
// create separate methods for checks and implement them here in this getter
export default (props = {}) => ({
  ...props,
  isSizeSelectorOpened: false,

  serverProductCardImages: [],
  currentImageIndex: -1,
  imageChangeInterval: null,
  imagesLoaded: false,
  imagesInited: false,

  // Reactive state for server-side props
  serverSideAvailableSizes: null,
  serverSideFirstColorVariantAvailable: false,
  serverSideProductAvailable: false,

  init() {
    this.serverProductCardImages = props.productCardImages || [];

    this.$watch('imagesLoaded', (value) => {
      if (value) {
        this.startImageAnimation();
      }
    });

    this.serverSideAvailableSizes = props.availableSizes || 0;
    this.serverSideFirstColorVariantAvailable = props.firstAvailableVariant || false;
    this.serverSideProductAvailable = props.productAvailable || false;
  },

  // Getter for product card images
  get productCardImages() {
    if (this.serverProductCardImages && this.serverProductCardImages.length > 0) {
      return this.serverProductCardImages;
    }

    if (this.variants && this.variants.length > 0) {
      return this.variants[0].productCardImages;
    }

    return [];
  },

  get productCardImageUrls() {
    return this.productCardImages
      .map((image) => {
        return _isObject(image) ? image.url : image;
      })
      .filter(Boolean);
  },

  get hasCardImages() {
    return this.productCardImages.length > 0;
  },

  // Load all images when the mouse hovers over the product card
  async loadImages() {
    const imageUrls = this.productCardImageUrls;

    if (imageUrls.length === 0) {
      console.warn('No images available for the product variant.');
      return;
    }

    // Load all images and wait until they are fully loaded
    await Promise.all(imageUrls.map((url) => this.preloadImage(url)));
    this.imagesLoaded = true;
  },

  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => reject(`Failed to load image: ${url}`);
    });
  },

  startImageAnimation() {
    if (!this.hasCardImages) return;
    if (this.imageChangeInterval) {
      clearInterval(this.imageChangeInterval);
    }

    this.currentImageIndex = 0;
    this.imageChangeInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.productCardImageUrls.length;
    }, 400);
  },

  stopImageAnimation() {
    if (this.imageChangeInterval) {
      clearInterval(this.imageChangeInterval);
      this.imageChangeInterval = null;
    }
    this.currentImageIndex = -1;
  },

  initProductCardImages() {
    if (this.imagesInited) return;
    let imgElements = this.$refs.productCardImages.querySelectorAll('img');
    imgElements.forEach((imgEl) => {
      imgEl.src = imgEl.dataset.src;
    });
    this.imagesInited = true;
  },

  async showProductCardImages() {
    if (this.isSizeSelectorOpened) return;

    if (!this.hasCardImages) return;
    // Start loading images when the mouse hovers over the product card
    if (!this.imagesLoaded) {
      await this.loadImages();
      this.initProductCardImages();
    }

    // Start the animation when the mouse enters the product card
    this.startImageAnimation();
  },

  resetProductImage() {
    // Stop the animation when the mouse leaves the product card
    this.stopImageAnimation();
  },

  // Getter for product availability (server-side and client-side)
  get productAvailable() {
    // Server-side check
    if (this.serverSideFirstColorVariantAvailable) {
      return this.serverSideFirstColorVariantAvailable;
    }

    if (this.serverSideProductAvailable) {
      return this.serverSideProductAvailable;
    }

    // Client-side check
    return this.variants?.some((variant) => variant.availableForSale) || false;
  },

  // Getter for checking if there are available sizes (boolean)
  get availableSizes() {
    // Server-side logic
    if (this.serverSideAvailableSizes) {
      return this.serverSideAvailableSizes > 0;
    }

    // Client-side logic
    return (
      this.variants?.filter((variant) => !!getOptionValue(variant, 'Size'))?.length > 0 || false
    );
  },

  // Click handler for Quick Add to Cart or opening the size selector
  async handleQuickAtcOrSizeSelector(e) {
    // Open size selector if there are sizes (even if the product is not available)
    if (this.availableSizes) {
      this.openSizeSelector(e);
      return;
    }

    // If no sizes are available, directly add to cart
    await this.quickAddToCart(e);
  },

  get firstAvailableVariant() {
    return this.variants?.find((variant) => variant.availableForSale) || this.variants[0];
  },

  get variantId() {
    return this.firstAvailableVariant?.id;
  },

  get firstAvailableVariantUrl() {
    return this.firstAvailableVariant?.url;
  },

  get variantInventoryQuantity() {
    return this.firstAvailableVariant?.quantityAvailable || 1;
  },

  async quickAddToCart(e) {
    // let atcEl = this.$refs.quickAtcBtn
    let el = e.target;
    let variantId = el.dataset.variantId;
    let variantInventoryQuantity = el?.dataset?.variantInventoryQuantity || 1;

    if (!variantId) {
      console.warn('No variant ID found');
      return;
    }

    let _variantId = _toNumber(variantId);
    let _variantInventoryQuantity = _toNumber(variantInventoryQuantity);

    return _addToCart(
      {
        items: [
          {
            id: _variantId,
            quantity: 1,
            properties: {
              _max_quantity: _variantInventoryQuantity,
            },
          },
        ],
      },
      () => {
        this.$dispatch('update-cart');
        this.$dispatch('open-cart');
      },
    );
  },

  getVariantId(variant) {
    return variant.id;
  },

  getVariantAvailability(variants) {
    let new_arrival = variants.find((v) => !!v.variantAvailableFrom);

    if (new_arrival?.variantAvailableFrom) {
      return `Available ${formatDate(new_arrival.variantAvailableFrom.value)}`;
    }

    return variants.some((v) => v.availableForSale) ? 'Available Now' : 'Sold Out';
  },

  getProductAvailability(variants) {
    // const availableText = 'Available Now'
    const availableText = '';
    const availableFromText = 'Coming';
    const soldOutText = 'Sold Out';

    // Check if any variant is available for sale
    let isAnyVariantAvailable = variants.some((variant) => variant.availableForSale);

    // If any variant is available, return the 'available' translation
    if (isAnyVariantAvailable) {
      return availableText;
    }

    // Extract the availableFrom metafield from the first variant and product level
    let productAvailableFrom = variants[0]?.product?.availableFrom?.value;
    let availableFromDate = productAvailableFrom;

    // If no variant is available, check if there's a variant or product-level availability date
    // let variantAvailableFrom = variants.find(variant => variant.variantAvailableFrom?.value)?.variantAvailableFrom?.value
    // let availableFromDate = variantAvailableFrom || productAvailableFrom

    // If there's a future availableFrom date, format and return it
    if (availableFromDate) {
      return `${availableFromText} ${formatDate(availableFromDate)}`;
    }

    // Default to 'sold out' if no variant is available and no future availability date is present
    return soldOutText; // "Sold Out" (translation)
  },

  // @note this is not used...
  getMinPrice(variants) {
    let initialMinPrice = _toNumber(this.firstAvailableVariant?.price?.amount);
    return variants.reduce((min, variant) => {
      let price = _toNumber(variant?.price?.amount);
      return price < min ? price : min;
    }, initialMinPrice);
  },

  getPriceVaries(product) {
    if (!product.priceRange) {
      return false;
    }

    const { minVariantPrice, maxVariantPrice } = product.priceRange;

    return minVariantPrice.amount !== maxVariantPrice.amount;
  },

  formatMoneyWithoutTrailingZeros(amount) {
    // Format the amount without trailing zeros
    return parseFloat(amount).toFixed(0);
  },

  get formattedPrice() {
    return this.getFormattedPrice(this.firstAvailableVariant);
  },

  getFormattedPrice(variant) {
    // Fallback to the variant display price if product priceRange is not available
    if (!variant || !variant.product || !variant.product.priceRange) {
      return variant.displayPrice || '';
    }

    const { minVariantPrice } = variant.product.priceRange;

    let amountInCents = moneyAmountToCents(minVariantPrice.amount);
    let formattedPrice = formatMoney(amountInCents, minVariantPrice.currencyCode);

    // If prices vary, show "From" with the minimum price
    if (this.getPriceVaries(variant.product)) {
      return `From ${formattedPrice}`;
    }

    // If prices don't vary, fallback to the variant display price
    return variant.displayPrice || `${formattedPrice}`;
  },

  getVariantSize(variant) {
    return getOptionValue(variant, 'Size');
  },

  setSizeGuide(variant = null) {
    let metafields = [];

    if (variant) {
      // Collecting metafields from variant
      const sizeGuide = _get(variant, 'product.sizeGuide.reference')
        ? [_get(variant, 'product.sizeGuide.reference')]
        : [];
      const galleryModels = _get(variant, 'product.galleryModels.references.edges')
        ? variant.product.galleryModels.references.edges.map((edge) => edge.node)
        : [];
      const measurementDisclaimer = _get(variant, 'product.measurementDisclaimer.reference')
        ? [_get(variant, 'product.measurementDisclaimer.reference')]
        : [];

      metafields = [...sizeGuide, ...galleryModels, ...measurementDisclaimer];

      if (metafields.length > 0) {
        const sizeGuideInstance = new SizeGuide(metafields);

        return this.$store.sizeGuide.setSizeGuide({
          type: sizeGuideInstance.type,
          galleryModels: sizeGuideInstance.galleryModels,
          measurementDisclaimer: sizeGuideInstance.measurementDisclaimer,
        });
      }
    }

    // Fallback: No variant passed or metafields not found
    this.$store.sizeGuide.setSizeGuide({
      type: this.type,
      galleryModels: this.galleryModels,
      measurementDisclaimer: this.measurementDisclaimer,
    });
  },

  openSizeSelector(e) {
    e.stopPropagation();
    this.isSizeSelectorOpened = true;
  },

  closeSizeSelector() {
    this.isSizeSelectorOpened = false;
  },

  toggleSizeSelector(e) {
    e.stopPropagation();
    this.isSizeSelectorOpened = !this.isSizeSelectorOpened;
  },

  destroy() {
    // Clean up the interval when the component is unmounted
    this.stopImageAnimation();
    this.currentImageIndex = -1;
  },
});
