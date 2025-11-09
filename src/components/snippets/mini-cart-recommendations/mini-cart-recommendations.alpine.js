import apolloClient from '../../common/apolloClient';
import { GET_ALL_PRODUCTS_WITH_SIZE_GUIDE } from './size-guide.query';
import { isMobile, isLandscapeOrientation } from '../../common/isMobile';
import SizeGuide from '../../common/sizeGuide';
import _addToCart from '../../common/addToCart.js';
import _toNumber from 'lodash/toNumber';
import './mini-cart-recommendations.scss';

import moneyAmountToCents from '../../common/moneyAmountToCents';
import formatMoney from '../../common/formatMoney';

// import { getCart } from '../../common/getCart'
// import { updateCart } from '../../common/updateCart'

export default (props = {}) => ({
  ...props,

  isSizeSelectorOpened: false,
  // The product group
  products: [],
  product: null,
  productMetaobjects: [],
  // Size guide properties
  sizeGuideType: false,
  galleryModels: false,
  measurementDisclaimer: false,

  async init() {
    await this.setRecommendedProduct();

    this.onCartOpen();
  },

  get recommendedProductAvailable() {
    return this.product?.variants?.some((variant) => variant.availableForSale) || false;
  },

  get recommendedProductAvailableSizes() {
    // return this.product?.variants?.some(variant => {
    //   const sizeOption = variant.selectedOptions?.find(option => option.name === 'Size')
    //   return sizeOption && sizeOption.value
    // }) || false
    return (
      this.product?.variants?.filter((variant) => !!this.getVariantSize(variant))?.length > 0 ||
      false
    );
  },

  get recommendedProductVariantId() {
    const variant =
      this.product?.firstAvailable ||
      this.product?.variants?.find((variant) => variant.availableForSale);
    const variantId = this.extractIdFromGid(variant?.id);
    return variantId || null;
  },

  get recommendedProductVariantInventoryQuantity() {
    const quantityAvailable = this.product?.firstAvailable?.quantityAvailable || 1;
    return quantityAvailable;
  },

  setVariantId(variantId) {
    if (!variantId) return null;
    return this.extractIdFromGid(variantId);
  },

  async handleQuickAtcOrSetSizeGuide(e, variantId, variantInventoryQuantity) {
    if (this.recommendedProductAvailableSizes) {
      this.openSizeSelector(e);
      return;
    }
    await this.quickAddToCart(variantId, variantInventoryQuantity);
  },

  async quickAddToCart(variantId, variantInventoryQuantity) {
    if (!variantId) {
      console.warn('No variant ID provided.');
      return;
    }

    let _variantId = _toNumber(variantId);
    let _variantInventoryQuantity = _toNumber(variantInventoryQuantity) || 1;

    return _addToCart(
      {
        items: [
          {
            id: _variantId,
            quantity: 1,
            properties: {
              _wmax_quantity: _variantInventoryQuantity,
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

  onCartOpen() {
    // close mini cart recommendation accordion when is it is mobile and landscape
    if (isMobile && isLandscapeOrientation()) {
      this.$dispatch('accordion-set-active', {
        isOpen: false,
        id: false,
        group: 'mini-cart-recommendations',
      });
    }
  },
  // =============================================================================
  // Data fetching
  /**
   * Fetches the recommended product and sets it as the displayed product.
   * @returns {void} - The recommended product.
   * @throws {Error} - The error object.
   * @async
   */

  async setRecommendedProduct() {
    try {
      this.products = await this.fetchProductsAndMetafields();

      if (!this.products || this.products.length === 0) {
        console.error('No products found.');
        return;
      }
      // Get the cart product IDs
      const cartProductIds = this.cart?.items?.map((item) => item.product_id);
      // Filter out products that are in the cart already
      const filteredProducts = this.products.filter((product) => {
        // Convert both IDs to numbers to ensure type alignment
        const productId = this.extractIdFromGid(product.id);
        if (!productId) return false;
        return !cartProductIds.includes(productId);
      });
      // Select a random product if none are filtered out
      const randomIndex = Math.floor(Math.random() * filteredProducts.length);
      const productToDisplay =
        filteredProducts.length > 0 ? filteredProducts[randomIndex] : filteredProducts[0];
      // Set the displayed product for detail processing
      this.processProductDetails(productToDisplay);
    } catch (error) {
      console.error('Error setting recommended product: ', error);
    }
  },

  /**
   * Fetches the products and their metafields.
   * @returns {Object[]} - The fetched products and their metafields.
   * @throws {Error} - The error object.
   * @async
   */
  async fetchProductsAndMetafields() {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_PRODUCTS_WITH_SIZE_GUIDE,
      });

      // debug
      // console.log('recommended product - data', data);

      return data?.products?.edges?.map((edge) => {
        const product = edge.node;

        // Extract metafields for size guide, gallery models, and measurement disclaimer
        const sizeGuide = product.sizeGuide?.reference ? [product.sizeGuide.reference] : [];
        const galleryModels =
          product.galleryModels?.references?.edges.map((edge) => edge.node) || [];
        const measurementDisclaimer = product.measurementDisclaimer?.reference
          ? [product.measurementDisclaimer.reference]
          : [];

        const options = product.options;
        const variants = product.variants.edges.map((edge) => edge.node);

        // Combine the metafields into a single array
        const metafields = [...sizeGuide, ...galleryModels, ...measurementDisclaimer];

        return {
          ...product,
          options,
          variants,
          metafields, // Or pass sizeGuide, galleryModels, measurementDisclaimer separately if needed
        };
      });
    } catch (error) {
      console.error('Error fetching products and metafields: ', error);
      return [];
    }
  },

  /**
   * Sets the product metaobjects for the current product.
   * @returns {void}
   */
  setProductMetaobjects() {
    if (this.product && this.product.metafields) {
      // Map the metafields to a more structured format
      this.productMetaobjects = this.product.metafields.map((metafield) => ({
        id: metafield.id,
        handle: metafield.handle,
        type: metafield.type,
        fields: metafield?.fields
          ? metafield?.fields?.reduce((acc, field) => {
              acc[field.key] = field.value;
              return acc;
            }, {})
          : {}, // Initialize with an empty object if there are no fields
      }));
    }
  },

  // =============================================================================
  // Product details

  /**
   * Processes the product details to group them by color and size.
   * @param {Object} product - The product object.
   * @returns {void}
   */
  processProductDetails(product) {
    if (!product || !product.variants || product.variants.length === 0) {
      console.warn('No product or variants available.');
      return;
    }

    // Create a map of color to variants and a set of all sizes available for the product
    const colorVariantGroup = new Map();
    let allSizes = new Set();
    let firstAvailableVariant = null;

    // Iterate over all variants to group them by color
    product.variants.forEach((variant) => {
      const colorOption = variant.selectedOptions.find((option) => option.name === 'Color');
      const sizeOption = variant.selectedOptions.find((option) => option.name === 'Size');
      const color = colorOption ? colorOption.value : null;
      const size = sizeOption ? sizeOption.value : null;
      // Add the size to the set of all sizes
      if (size) {
        allSizes.add(size);
      }
      // Add the variant to the color group
      if (color) {
        if (!colorVariantGroup.has(color)) {
          colorVariantGroup.set(color, {
            variants: [],
            firstAvailable: null,
          });
        }
        // Get the color info and add the variant to its list
        const variantGroup = colorVariantGroup.get(color);
        variantGroup.variants.push(variant);
        // Check if the variant is available and set it as the first available if it's the first one found
        if (variant.availableForSale && !variantGroup.firstAvailable) {
          variantGroup.firstAvailable = variant;
        }
      }
    });

    // Get the first color and its group
    let randomColor = null;
    let randomColorGroup = null;
    if (colorVariantGroup.size > 0) {
      const colors = Array.from(colorVariantGroup.keys());
      randomColor = colors[Math.floor(Math.random() * colors.length)];
      randomColorGroup = colorVariantGroup.get(randomColor);
    }

    // Fallback to the first available variant if no color options exist
    const firstAvailable =
      randomColorGroup?.firstAvailable || firstAvailableVariant || product.variants[0];

    // Set the product object with the processed details
    this.product = {
      ...product, // The original product object
      color: randomColor, // The randomly selected color for the product
      firstAvailable,
      allSizes: allSizes.size > 0 ? Array.from(allSizes) : null, // All sizes available for the product across all colors
    };
  },

  // =============================================================================
  // Helper functions

  /**
   * Check if the identifier includes "gid://", extract the numeric part,
   * and ensure it's returned as a number.
   *
   * @param {string} gid - The GID string.
   * @returns {number} - The extracted ID.
   */
  extractIdFromGid(gid) {
    if (!gid) return null;
    return parseInt(gid.includes('gid://') ? gid.split('/').pop() : gid, 10);
  },

  /**
   * Formats the price using the specified currency
   * @param {object} price - The price object ()
   * @returns {string} - The formatted price.
   */
  formatVariantPrice(price) {
    if (!price || !price.amount) return '';

    // @note graphql returns moneyV2 object which has
    // - amount: decimal format (ie. 12.99)
    // - currencyCode: ie. USD, EUR, etc.
    // @see https://shopify.dev/docs/api/admin-graphql/latest/objects/moneyv2

    // check if amount is decimal number (with two decimal places)
    const amountInCents = moneyAmountToCents(price.amount);

    // call formatMoney with amount in cents
    const formattedPrice = formatMoney(amountInCents, price.currencyCode);

    // @todo update price currency display
    // return `${formattedPrice} ${currencyCode}`;
    return `${formattedPrice}`;
  },

  /**
   * Helper function to get the product variant URL
   *
   * @param {string} productHandle - The product handle
   * @param {string} variantId - The variant ID
   * @returns {string} - The product variant URL
   */
  getProductVariantUrl(productHandle, variantIdentifier) {
    if (!productHandle || !variantIdentifier) return '';
    // Check if the identifier includes "gid://" to determine if splitting is necessary
    const variantId = this.extractIdFromGid(variantIdentifier);
    if (!variantId) return '';
    return `/products/${productHandle}?variant=${variantId}`;
  },

  /**
   * Gets the ID of the product variant that matches the specified size and selected color.
   *
   * @param {string} size - The size of the product variant.
   * @returns {string} - The ID of the matching variant.
   */
  getVariantIdBySize(size) {
    if (!size || !this.product || !this.product.variants) return '';

    // Find the first variant that matches the given size and the currently selected color
    const matchingVariant = this.product.variants.find((variant) => {
      const variantSize = this.getVariantSize(variant);
      const variantColor = this.getVariantColor(variant);
      return variantSize === size && variantColor === this.product.color;
    });

    // Return the ID of the matching variant, or an empty string if no match is found
    return matchingVariant ? this.extractIdFromGid(matchingVariant.id) : '';
  },

  getVariantInventoryQuantity(size) {
    let variantId = this.getVariantIdBySize(size);
    let variant = this.product.variants.find((v) => this.extractIdFromGid(v.id) === variantId);

    return variant?.quantityAvailable || 1;
  },

  /**
   * Gets the URL for the product variant with the specified size
   *
   * @param {string} size - The size of the product variant
   * @returns {string} - The URL for the product variant with the specified size
   */
  getVariantUrlBySize(size) {
    if (typeof size !== 'string' || size.trim() === '') return '';
    // Find the first variant that matches the size, is in the selected color, and is available for sale
    const variant = this.product?.variants?.find(
      (variant) =>
        this.getVariantSize(variant) === size &&
        this.getVariantColor(variant) === this.product.color &&
        variant.availableForSale,
    );
    return variant ? this.getProductVariantUrl(this.product.handle, variant.id) : '';
  },

  /**
   * Checks the availability of the specified size in the selected color
   * @param {string} size - The size to check for availability
   * @returns {boolean} - The availability of the specified size
   */
  getVariantAvailabilityBySize(size) {
    if (typeof size !== 'string' || size.trim() === '') return false;
    // Check across all variants for the availability of this specific size in the specified color
    const isAvailable = this.product?.variants?.some((variant) => {
      const variantSize = this.getVariantSize(variant);
      const variantColor = this.getVariantColor(variant);
      const isAvailableForSale = variant.availableForSale;
      return variantSize === size && variantColor === this.product.color && isAvailableForSale;
    });
    // console.log(`Availability for size ${size}: ${isAvailable}`)
    return isAvailable;
  },

  /**
   * Gets the size of the product variant
   *
   * @param {string} variant - The product variant
   * @returns {string} - The size of the product variant
   */
  getVariantSize(variant) {
    if (!variant || !variant.selectedOptions) return '';
    return variant.selectedOptions.find((option) => option.name === 'Size')?.value;
  },

  /**
   * Gets the color of the product variant
   *
   * @param {string} variant - The product variant
   * @returns {string} - The color of the product variant
   */
  getVariantColor(variant) {
    if (!variant || !variant.selectedOptions) return '';
    return variant.selectedOptions.find((option) => option.name === 'Color')?.value;
  },

  setSizeGuide() {
    let metafields = this.product.metafields;

    if (metafields && metafields.length > 0) {
      const sizeGuide = new SizeGuide(metafields);

      return this.$store.sizeGuide.setSizeGuide({
        type: sizeGuide.type,
        galleryModels: sizeGuide.galleryModels,
        measurementDisclaimer: sizeGuide.measurementDisclaimer,
      });
    }

    // Fallback: No metafields found
    this.$store.sizeGuide.setSizeGuide({
      type: this.sizeGuideType,
      galleryModels: this.galleryModels,
      measurementDisclaimer: this.measurementDisclaimer,
    });
  },

  // =============================================================================
  // Size selector
  openSizeSelector(e) {
    e.stopPropagation();
    this.isSizeSelectorOpened = true;
  },

  closeSizeSelector(e) {
    e.stopPropagation();
    this.isSizeSelectorOpened = false;
  },

  toggleSizeSelector(e) {
    e.stopPropagation();
    this.isSizeSelectorOpened = !this.isSizeSelectorOpened;
  },

  /** Destroys the component.*/
  destroy() {},
});
