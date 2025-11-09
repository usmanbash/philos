import './product-filters.scss';

import _each from 'lodash/each';
import _omit from 'lodash/omit';
import _filter from 'lodash/filter';
import _capitalize from 'lodash/capitalize';
import _camelCase from 'lodash/camelCase';

import getOptionValue from '../../common/getOptionValue';

import queryString from 'query-string';
import { getCurrentUrl } from 'swup';
import FilterFacets from './facets';
import ProductsFilter from './filter';

import moneyAmountToCents from '../../common/moneyAmountToCents';
import formatMoney from '../../common/formatMoney';

/**
 * Represents a product filters component.
 * @param {Object} props - The component props.
 * @param {string} props.collectionHandle - The handle of the collection.
 * @returns {Object} - The product filters component.
 */
export default (props = {}) => ({
  ...props,
  initialised: false,
  facets: [],
  selectedFacets: {},
  filteredProducts: [],

  /**
   * Initializes the product filter component.
   * @returns {Promise<void>} - A promise that resolves when the component is initialized.
   */
  async init() {
    this.filterFacets = new FilterFacets({ collectionHandle: this.collectionHandle });
    this.productsFilter = new ProductsFilter({ collectionHandle: this.collectionHandle });
    await this.initialize();
  },

  /**
   * Handles the change event when facets are selected.
   * @param {Object} facets - The selected facets.
   * @returns {Promise<void>} - A promise that resolves when the products are filtered.
   */
  async onChange(facets) {
    this.filteredProducts = await this.productsFilter.filterProducts(facets, this.sortBy);

    this.initialised = true;

    const query = {};

    _each(facets, (values, facet) => {
      if (values.length) query[facet] = values;
    });

    let stringified = queryString.stringify(query);
    const newUrl = `${window.location.pathname}?${stringified}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // console.log('this.productsFilter', this.productsFilter)
    // console.log('this.productsFilter.variantImages', this.productsFilter.variantImages)
    // console.log('[products-filter.alpine.js] filtered products:', this.filteredProducts)
    // console.log('[products-filter.alpine.js] filtered variants:', this.filteredVariants)
    // console.log('[products-filter.alpine.js] grouped variants:', this.groupedVariants)
  },

  sanitizeSortKey(sortKey) {
    // turn e.g 'best-selling' into 'BEST_SELLING'
    return sortKey.toUpperCase().replace('-', '_');
  },

  /**
   * Sets the initially selected facets based on the current URL.
   */
  setInitiallySelectedFacets() {
    let currentUrl = getCurrentUrl();
    let { query } = queryString.parseUrl(currentUrl);

    _each(this.facets, (facet) => {
      let val = query[facet.id];
      this.selectedFacets[facet.id] = !val ? [] : typeof val == 'object' ? val : [val];
    });

    // console.log('Set initial facet values:', this.selectedFacets)
  },

  /**
   * Initializes the product filter component.
   * @returns {Promise<void>} - A promise that resolves when the component is initialized.
   */
  async initialize() {
    this.facets = await this.filterFacets.loadFacets();
    if (!this.facets) return;

    this.$watch('selectedFacets', this.onChange.bind(this), {
      immediate: true,
    });

    this.setInitiallySelectedFacets();
  },

  /**
   * Returns an array of images for a given variant ID.
   * @param {string} variantId - The ID of the variant.
   * @returns {Array} - An array of images for the variant.
   */
  getImagesForVariant(variantId) {
    // Access the variantImages map from the productsFilter
    return this.productsFilter.variantImages.get(variantId) || [];
  },

  /**
   * Returns an array of filtered product variants based on selected facets.
   * @returns {Array} An array of filtered product variants.
   */
  get filteredVariants() {
    // Reduce the filtered products to a flat array of variants
    let variants = this.filteredProducts.reduce((acc, product, index) => {
      // Map each variant of the product to a new object
      let variants = product.variants.nodes.map((variant, variantIndex) => {
        // Create a new variant object with spread operator
        let v = { ...variant };
        // Omitting the 'variants' key from product object
        v.product = _omit(product, ['variants']);

        // save product order for further filtering
        v.productOrder = index;

        v.variantOrder = variantIndex;

        let amountInCents = moneyAmountToCents(variant.price.amount);
        let formattedPrice = formatMoney(amountInCents, variant.price.currencyCode);

        // Displaying price with rounded amount and currency code
        v.displayPrice = formattedPrice;

        // Set original id
        v._id = variant.id;

        // Extract the id from the GID
        v.id = variant.id.split('/').pop();

        // Constructing the URL for the variant
        v.url = `/products/${product.handle}?variant=${v.id}`;

        // Extracting color from variant selected options
        const color = getOptionValue(variant, 'Color');

        // Combining product title and color for display title
        v.displayTitle = `${v.product.title} | ${color}`;
        // set variant images from a metafield
        v.productCardImages = this.getImagesForVariant(v._id) || [];

        return v;
      });

      // Concatenating the current product's variants with accumulator
      return [...acc, ...variants];
    }, []);

    return variants;
  },

  /**
   * Filters the available variants based on selected facets.
   *
   * @param {Array} variants - The array of variants to filter.
   * @param {boolean} availableForSale - Flag indicating whether to filter by availability for sale.
   * @returns {Array} - The filtered array of variants.
   */
  filterVariants(variants, availableForSale) {
    // Filter available variants based on selected facets
    return _filter(variants, (variant) => {
      let res = availableForSale ? variant.availableForSale : true;

      // Iterate over selected facets
      _each(this.selectedFacets, (facet, key) => {
        // Extract the last key segment
        key = key.split('.').pop();

        // Check if facet has values
        if (Object.values(facet).length) {
          // Retrieve the value of the facet from variant product
          let facetValue = variant.product[_camelCase(key)];

          // If facet value is not found, retrieve from selected options
          if (!facetValue) {
            facetValue = getOptionValue(variant, _capitalize(key));
          }

          // If facet value is not included in selected values, set result to false
          if (!facet.includes(facetValue)) {
            res = false;
          }
        }
      });

      // Return the result of filtering
      return res;
    });
  },

  /**
   * Represents the grouped variants based on product ID and color.
   * @type {Object.<string, Object.<string, Array>>}
   */
  get groupedVariants() {
    var groupedVariants = {};
    let colorOrders = {};

    this.filteredVariants.forEach((variant, i) => {
      const color = getOptionValue(variant, 'Color');
      const handle = `${variant.product.handle}-${color}`;
      const variantOrder = colorOrders[handle] || i + 1;

      const id = `${variant.productOrder}-${variantOrder}-${handle}-${color}`;

      if (!colorOrders[handle]) {
        groupedVariants[id] = [variant];
        colorOrders[handle] = i + 1;
      } else {
        groupedVariants[id].push(variant);
      }
    });

    let _entries = Object.entries(groupedVariants);
    let _sorted = _entries.sort((a, b) => a[1][0].productOrder - b[1][0].productOrder);
    let _res = Object.fromEntries(_sorted);
    return _res;
  },

  isCardVisible(variants) {
    return this.filterVariants(variants, false).length > 0;
  },

  totalSelectedOptions(facetId) {
    return this.selectedFacets[facetId].length || '';
  },

  clearAllFacets() {
    // Loop through each facet and reset its values
    _each(this.selectedFacets, (values, facet) => {
      this.selectedFacets[facet] = [];
    });

    // Trigger the onChange method to reflect the cleared state
    this.onChange(this.selectedFacets);
  },
});
