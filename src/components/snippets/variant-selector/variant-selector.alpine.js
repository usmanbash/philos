/**
 * Represents a variant selector component.
 * @param {Object} props - The component props.
 * @returns {Object} - The variant selector object.
 */

import _addToCart from '../../common/addToCart.js';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _findIndex from 'lodash/findIndex';
import formatMoney from '../../common/formatMoney.js';
import formatDate from '../../common/formatDate';
import './variant-selector.scss';

// import { isMobile } from '../../common/isMobile'

// ------------------------------------------------------------
// Constant:

// Name of the component
const COMPONENT_NAME = 'variantSelector';
// id of the script element that contains the JSON data
const JSON_SCRIPT_ID = 'pdpData__variantSelector';
// ------------------------------------------------------------

export default (props = {}) => ({
  ...props,

  quantity: 1,

  product: false,
  selectedVariant: false,
  currentImageIndex: 1,

  variants: false,
  inventoryQuantity: null,

  productAvailableFrom: null,
  variantAvailableFrom: null,

  // Scroll-related state and method
  isStickyVisible: true, // State for controlling sticky button visibility
  checkoutButtonElement: null, // Reference for the checkout buttons
  observer: null, // Store the observer to clean up later

  /**
   * Initializes the variant selector.
   */
  async init() {
    // load data from json script
    const _data = this.loadJsonData();

    this.product = _data.product;

    // @TODO try to remove once we move/merge with data with product.variants
    this.variants = _data.variants;

    this.selectedVariant = _data.selectedVariant;

    this.productAvailableFrom = this.product?.productAvailableFrom;
    this.variantAvailableFrom = _data.selectedVariantAvailableFrom;

    this.currency = _data.currency;

    this.initOptions();

    this.$nextTick(this.onVariantChange.bind(this));

    this.$watch('selectedVariant', this.onVariantChange.bind(this));

    this.$watch('selectedVariantId', () => {
      this.getInventoryQuantity.bind(this);
    });

    // observe elements for sticky button when DOM is ready
    this.$nextTick(() => {
      this.observeElements();
    });
  },

  loadJsonData() {
    // Get JSON data from script element
    const dataScript = document.getElementById(JSON_SCRIPT_ID);
    if (dataScript) {
      try {
        const data = JSON.parse(dataScript.textContent || dataScript.innerHTML);
        // Initialize component with the parsed data
        // console.log(`[${COMPONENT_NAME}] data:`, data)
        return data;
      } catch (error) {
        console.error(
          `[${COMPONENT_NAME}] Error parsing json '#${JSON_SCRIPT_ID}'`,
          error.message || error,
        );
        return {};
      }
    }
  },

  scrollToAddToCart() {
    this.$nextTick(() => {
      // Find the checkout button element
      const checkoutButton = this.$refs.checkoutButtons;

      if (checkoutButton) {
        // Get the position of the checkout button from the top of the document
        const checkoutButtonPosition = checkoutButton.getBoundingClientRect().top + window.scrollY;

        // Calculate the height of the window (the visible viewport)
        const windowHeight = window.innerHeight;

        // Calculate the position to scroll to, ensuring the button ends up at the bottom of the viewport
        const scrollToPosition =
          checkoutButtonPosition - (windowHeight - checkoutButton.offsetHeight);

        // Scroll the window so the checkout button aligns with the bottom of the viewport
        window.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth',
        });
      }
    });
  },

  observeElements() {
    this.checkoutButtonElement = this.$refs.checkoutButtons ? this.$refs.checkoutButtons : null;
    // console.log('checkoutButtonElement:', this.checkoutButtonElement)
    /**
     * Set up Intersection Observer to observe when the checkoutButtons element
     * enters/exits the viewport
     */
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.isIntersecting ? (this.isStickyVisible = false) : (this.isStickyVisible = true);
      });
    });

    // Start observing element if it exists
    if (this.checkoutButtonElement) {
      this.observer.observe(this.checkoutButtonElement);
    }
  },

  removeObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  get compare_at_price() {
    return formatMoney(this.selectedVariant.compare_at_price, this.currency);
  },

  get price() {
    return formatMoney(this.selectedVariant.price, this.currency);
  },

  get is_comparable() {
    return this.selectedVariant.compare_at_price > 0;
  },

  get is_on_sale() {
    return this.selectedVariant.compare_at_price > this.selectedVariant.price;
  },

  get available() {
    return this.selectedVariant.available;
  },

  /**
   * @TODO Get Availability Label ...
   */
  get availabilityLabel() {
    const availableText = 'Available Now';
    const availableFromText = 'Coming';
    const soldOutText = 'Sold Out';

    // Check if any variant is available for sale
    let variantAvailableForSale = this.selectedVariant.available;

    // If any variant is available, return the 'available' translation
    if (variantAvailableForSale) {
      return availableText;
    }

    // let availableFromDate = this.variantAvailableFrom || this.productAvailableFrom
    let availableFromDate = this.variantAvailableFrom;

    if (!this.product?.available && this.productAvailableFrom) {
      availableFromDate = this.productAvailableFrom;
    }

    // If there's a future availableFrom date, format and return it
    if (availableFromDate) {
      return `${availableFromText} ${formatDate(availableFromDate)}`;
    }

    // Default to 'sold out' if no variant is available and no future availability date is present
    return soldOutText; // "Sold Out" (translation)
    // return this.selectedVariant.available ? 'Available Now' : 'Sold Out'
  },

  get selectedVariantId() {
    return this.selectedVariant.id;
  },

  getInventoryQuantity(id) {
    const variant = this.variants.find((v) => v.id == id);
    return variant ? variant.inventory_quantity : null;
  },

  /**
   * Handles the variant change event.
   * @param {Object} variant - The selected variant.
   */
  onVariantChange() {
    // change url
    const newUrl = `${window.location.pathname}?variant=${this.selectedVariant.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // update selected image
    this.currentImageIndex =
      typeof this.selectedVariant.featured_image !== 'undefined'
        ? this.selectedVariant.featured_image.position - 1
        : 0;

    this.$dispatch('set-active-slide', this.currentImageIndex);

    // Dispatch the event for product-variant-gallery
    this.$dispatch('color-changed', { colorName: this.Color });

    // Update availability for variant and product on variant change
    // this.productAvailableFrom = this.product?.productAvailableFrom
    // this.variantAvailableFrom = props.selectedVariantAvailableFrom

    // Dispatch the event for rest of the app
    this.$dispatch('selected-variant-changed', {
      id: this.selectedVariant.id,
      variant: this.selectedVariant,
    });
  },

  /**
   * Adds the selected variant to the cart.
   * @param {Event} e - The click event.
   * @returns {Promise} - A promise that resolves with the response JSON.
   */
  async addToCart(e) {
    e.preventDefault();
    let inventoryQuantity = this.getInventoryQuantity(this.selectedVariant.id);
    return _addToCart(
      {
        items: [
          {
            id: this.selectedVariant.id,
            quantity: this.quantity,
            properties: {
              _max_quantity: inventoryQuantity,
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

  /**
   * Initializes the options of the variant selector.
   */
  initOptions() {
    if (!this.product?.options || !this.product?.options.length) {
      return;
    }

    // preset values && watchers
    this.product.options.forEach((e, i) => {
      this[e] = this.selectedVariant[`option${i + 1}`];

      this.$watch(e, (opt) => this.onOptionsChange(opt));
    });
  },

  /**
   * Handles the options change event.
   */
  onOptionsChange() {
    this.selectedVariant = this.filterVariants(false)[0];
  },

  /**
   * Filters the variants based on the selected options.
   * @param {String} optionToIgnore - The option to ignore.
   * @returns {Array} - The filtered variants.
   */
  filterVariants(optionToIgnore) {
    return this.product.variants.filter((variant) => {
      let res = true;

      this.product.options.forEach((option, index) => {
        if (option !== optionToIgnore) {
          const variantOptionValue = variant[`option${index + 1}`];
          const selectedOptionValue = this[option];

          if (variantOptionValue !== selectedOptionValue) {
            res = false;
          }
        }
      });

      return res;
    });
  },

  /**
   * Checks if an option is available.
   * @param {String} option - The option to check
   * @param {String} value - The value to check
   * @param {Number} index - The shopify index of the option
   * @returns {Boolean} - The result of the check.
   */
  isOptionAvailable(option, value, index) {
    let variants = this.filterVariants(option);

    return variants.some((variant) => {
      if (variant.available) {
        return variant[`option${index}`] === value;
      }
    });
  },

  /**
   * Checks if an option is available.
   * @param {String} option - The option to check
   * @param {String} value - The value to check
   * @param {Number} index - The shopify index of the option
   * @returns {Boolean} - The result of the check.
   */
  getOptionStockQuantity(option, value, index) {
    let variants = this.filterVariants(option);
    // get the variant id using the value and index
    const theVariant = variants.find((variant) => variant[`option${index}`] === value);
    const theVariantId = theVariant.id;

    return this.getInventoryQuantity(theVariantId);
  },

  displayLowInventoryMessage(option, value, index) {
    const qty = this.getOptionStockQuantity(option, value, index);
    return qty > 0 && qty <= 3 ? `only ${qty} left` : null;
  },

  shouldDisplayLowInventory(option, value, index) {
    const qty = this.getOptionStockQuantity(option, value, index);
    return qty > 0 && qty <= 3;
  },

  printVariants(e) {
    e.preventDefault();
    console.log(this.variants);
  },

  printProductVariants(e) {
    e.preventDefault();
    console.log(this.product.variants);
  },

  /**
   * Sets the active color variation based on the provided index.
   *
   * @param {number} index - The index of the color variation.
   * @returns {void}
   */
  setActiveColorVariation(index) {
    const colorVariants = _filter(this.product.variants, (variant) => {
      return variant.featured_media?.position === index + 1;
    });

    const sizeIndex = _findIndex(this.product.options, (option) => option === 'Size');
    const sizeAndColorVariant = _find(colorVariants, (variant) => {
      return this.Size == variant[`option${sizeIndex + 1}`];
    });

    const selectedVariant = sizeAndColorVariant || colorVariants[0];

    this.product.options.forEach((e, i) => {
      this[e] = selectedVariant[`option${i + 1}`];
    });
  },

  /**
   * Checks if the given value matches the value of the specified attribute.
   *
   * @param {any} value - The value to compare.
   * @param {string} attr - The attribute name to compare against.
   * @returns {boolean} - Returns true if the value matches the attribute value, otherwise false.
   */
  isSelected(value, attr) {
    return this[attr] === value;
  },

  destroy() {
    // Clean up the Intersection Observer
    this.removeObserver();
  },
});
