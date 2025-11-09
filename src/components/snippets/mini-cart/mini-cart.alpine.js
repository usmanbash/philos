import axios from 'axios';
import './mini-cart.scss';
import formatMoney from '../../common/formatMoney.js';
import _toNumber from 'lodash/toNumber';

// clamp number between 0 and 1
const clamp = (number, min, max) => Math.min(Math.max(number, min), max);
const targetPercentage = (value, target) => clamp((value / target) * 100, 0, 100).toFixed(2);

/**
 * Represents a mini cart component.
 * @param {Object} props - The props for the mini cart component.
 * @returns {Object} - The mini cart component object.
 */
export default (props) => ({
  cart: false,

  ...props,

  /**
   * Initializes the mini cart component.
   */
  init() {
    // console.log('mini cart is initialized')

    this.getCart();

    this.$watch('itemsCount', (count) => this.$dispatch('get-items-count', count));
  },

  /**
   * Formats the price using the specified currency.
   * @param {number} price - The price to format.
   * @returns {string} - The formatted price.
   */
  formatPrice(price) {
    return formatMoney(price, this.cart.currency);
  },

  /**
   * Destroys the mini cart component.
   */
  destroy() {
    // console.log('mini cart is destroyed')
  },

  /**
   * Gets the line items in the cart.
   * @returns {Array} - The line items in the cart.
   */
  get lineItems() {
    return this.cart?.items || [];
  },

  /**
   * Gets the number of items in the cart.
   * @returns {number} - The number of items in the cart.
   */
  get itemsCount() {
    return this.cart?.item_count;
  },

  /**
   * Gets the total price of the cart.
   * @returns {string|boolean} - The total price of the cart, or false if the cart is not available.
   */
  get totalPrice() {
    return this.cart ? formatMoney(this.cart.total_price, this.cart.currency) : false;
  },

  /**
   * Retrieves the cart data from the server.
   * @returns {Promise} - A promise that resolves with the cart data.
   */
  async getCart() {
    const config = {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    };

    this.cart = await axios
      .get('/cart.js', config)
      .then((response) => {
        // @todo remove console log
        console.log('[mini cart]response cart:', response.data);
        return response.data;
      })
      .catch((err) => {
        console.warn('Error fetching cart:', err);
      });
  },
  /**
   * Method to get properties._max_quantity from the cart.items (item by id)
   * @param {string} id - The ID of the item to get the inventory quantity.
   *
   * @returns {number|null} - The inventory quantity of the item, or null if the item is not in the cart.
   */
  getInventoryQuantity(id) {
    const item = this.cart?.items?.find((i) => i.id == id);
    // return item ? _toNumber(item.properties._max_quantity) : null
    if (!item || !item.properties) return null;

    /**
     * @note: _max_quantity is used for the max quantity of the item on PDP
     * @note: _wmax_quantity is used for the max quantity of the item
     * in mini cart recommendations
     *
     * @todo: check why we have both _max_quantity and _wmax_quantity
     * and if we can remove one of them...this is a temporary solution
     * to handle both cases.
     */
    if (item.properties._max_quantity) return _toNumber(item.properties._max_quantity);

    if (item.properties._wmax_quantity) return _toNumber(item.properties._wmax_quantity);

    return null;
  },

  shouldShowLowInventory(variantId) {
    const qty = this.getInventoryQuantity(variantId);
    return qty > 0 && qty <= 3;
  },

  getLowInventoryMessage(variantId) {
    const qty = this.getInventoryQuantity(variantId);
    return this.shouldShowLowInventory(variantId) ? `only ${qty} left` : null;
  },

  /**
   * Removes an item from the cart.
   * @param {string} id - The ID of the item to remove.
   */
  removeFromCart(id) {
    this.updateCart({ [id]: 0 });
  },

  /**
   * Increases the quantity of an item in the cart.
   * @param {string} id - The ID of the item to increase the quantity of.
   * @param {number} quantity - The current quantity of the item.
   */
  increaseQuantity(id, quantity) {
    // set the limit to the increment quantity by checking the _max_quantity
    let maxQuantity = this.getInventoryQuantity(id);

    if (quantity < maxQuantity) {
      // Only allow increasing the quantity if it does not exceed the available stock.
      this.updateCart({ [id]: quantity + 1 });
    }
  },

  /**
   * Decreases the quantity of an item in the cart.
   * @param {string} id - The ID of the item to decrease the quantity of.
   * @param {number} quantity - The current quantity of the item.
   */
  decreaseQuantity(id, quantity) {
    if (quantity > 1) {
      // Only allow decreasing the quantity if it is greater than 1.
      this.updateCart({ [id]: quantity - 1 });
    }
  },

  /**
   * Updates the cart with the specified changes.
   * @param {Object} updates - The updates to apply to the cart.
   * @returns {Promise} - A promise that resolves when the cart is updated.
   */
  async updateCart(updates) {
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    })
      .then((response) => {
        // console.log('cart updated:', response, updates)
        this.$dispatch('update-cart-items');
        this.getCart();
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  },

  /**
   * Gets the target price for free shipping.
   * @returns {number} - The target price for free shipping in cents.
   */
  get freeShippingTargetPrice() {
    // @todo get the target price from the settings
    // @todo see if we need a different target price for different currencies
    const targetPrice = 250;

    // amount in cents and return
    const targetPriceCents = targetPrice * 100;
    return targetPriceCents;
  },

  /**
   * Gets the percentage of the cart total price towards the free shipping target price.
   * @returns {number} - The percentage of the cart total price towards the free shipping target price.
   */
  get freeShippingPercentage() {
    return targetPercentage(this.cart.total_price, this.freeShippingTargetPrice);
  },

  /**
   * Gets the amount of the cart total price towards the free shipping target price.
   * @returns {number} - The amount of the cart total price towards the free shipping target price.
   */
  get awayFromFreeShipping() {
    return Math.max(this.freeShippingTargetPrice - this.cart.total_price, 0);
  },

  /**
   * Gets the message for the free shipping percentage.
   * @returns {string} - The message for the free shipping percentage.
   */
  get freeShippingPercentageMessage() {
    const tillTarget = this.awayFromFreeShipping;

    // ie '$128 Away' / 'Free shipping'
    return tillTarget > 0 ? `${formatMoney(tillTarget)} Away` : 'Free shipping';
  },

  get freeShippingUnlocked() {
    return this.awayFromFreeShipping <= 0;
  },

  /**
   * Gets the message for the free shipping percentage.
   * @returns {string} - The message for the free shipping percentage.
   */
  get freeShippingTitle() {
    return this.freeShippingUnlocked
      ? 'Free UPS® Express Shipping unlocked'
      : 'Complete for free delivery';
  },
});
