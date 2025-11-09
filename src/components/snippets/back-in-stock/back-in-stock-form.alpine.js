export default (props = {}) => ({
  ...props,

  email: '',
  isSubmitting: false,
  error: '',
  message: '',

  init() {
    this.$store.backInStock.clearRequestState();
  },

  destroy() {},

  get variantId() {
    return this.$store.backInStock.selectedVariantId;
  },

  /**
   * Klaviyo catalog variant (composite ID)
   *
   * The variant id for which the profile is subscribing to back in stock notifications.
   * @see https://developers.klaviyo.com/en/docs/how_to_set_up_custom_back_in_stock#inputs
   *
   * Example: `$shopify:::$default:::SHOPIFY_VARIANT_ID`
   *
   * @returns {string}
   */
  get variantCompositeId() {
    return `$shopify:::$default:::${this.variantId}`;
  },

  // @todo i should use zod validation
  validate() {
    if (!this.email || !/.+@.+\..+/.test(this.email)) {
      this.error = 'Please enter a valid email.';
      return false;
    }
    if (!this.variantCompositeId) {
      this.error = 'No variant selected.';
      return false;
    }
    return true;
  },

  async onSubmit() {
    this.error = '';
    this.message = '';
    if (!this.validate()) return;

    // build the payload
    // @see https://developers.klaviyo.com/en/docs/how_to_set_up_custom_back_in_stock#client-side-request
    const payload = {
      data: {
        type: 'back-in-stock-subscription',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email: this.email,
              },
            },
          },
          channels: ['EMAIL'],
        },
        relationships: {
          variant: {
            data: {
              type: 'catalog-variant',
              id: this.variantCompositeId,
            },
          },
        },
      },
    };

    //
    const headers = {
      'Content-Type': 'application/json',
      revision: '2024-06-15',
    };

    // @todo get from settings / config / env ...
    const apiKey = 'SaCuyC';

    // API endpoint
    const url = `https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${apiKey}`;

    try {
      this.isSubmitting = true;
      this.$store.backInStock.setRequestPending();

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.status === 202) {
        // SUCCESS (202)
        this.message = 'You will be notified when this item is back in stock.';
        this.$store.backInStock.setRequestSuccess(this.message, {
          email: this.email,
          variant: this.variantCompositeId,
        });
        // reset the form
        this.email = '';
      } else {
        this.error = 'Could not submit your request. Please try again.';
        this.$store.backInStock.setRequestError(this.error);
      }
    } catch (e) {
      this.error = 'Network error. Please try again.';
      this.$store.backInStock.setRequestError(this.error);
    } finally {
      this.isSubmitting = false;
    }
  },
});
