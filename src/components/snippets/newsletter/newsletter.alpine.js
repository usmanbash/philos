import './newsletter.scss';
import axios from 'axios';
import FormValidator from '../../common/formValidator';
import { validationRules } from './newsletter.validation';

// Constants
const KLAVIYO_API_BASE_URL = process.env.KLAVIYO_API_BASE_URL;
// console.log('[Newsletter] KLAVIYO_API_BASE_URL: ', KLAVIYO_API_BASE_URL);

// API endpoint
const endpoint = '/subscribe/newsletter';

const _url = `${KLAVIYO_API_BASE_URL}${endpoint}`;

export default (props = {}) => ({
  ...props,

  formFields: {},
  validator: new FormValidator(validationRules),
  success: false,
  message: '',
  isSubmitting: false,

  init() {
    this.formFields = props.formFields;

    this.$watch('formFields', (value, oldValue) => {
      Object.keys(value).forEach(fieldName => {
        if (value[fieldName] !== oldValue[fieldName]) {
          this.validator.validateField({ id: fieldName, value: value[fieldName] });
        }
      });
    }, { deep: true });

    this.validator.isFormValid();
  },

  destroy() { },

  // Validate a field
  validateField(field) {
    this.validator.validateField(field);
    this.validator.setFieldTouched(field.id);
  },

  // Clear the message after a set time
  clearMessage() {
    setTimeout(() => {
      this.message = '';
    }, 4000);
  },

  // Clear the form fields
  clearFields() {
    this.formFields = {
      email: '',
    };
  },

  // Reset the form and validation state
  resetForm() {
    this.clearFields();
    this.validator.resetValidationState();
  },

  // Check if the form is valid and ready to submit
  isFormValid() {
    return this.validator.isFormValid() || this.success;
  },

  async subscribe() {
    if (!this.validator.validateForm(this.$refs)) {
      this.success = false;
      this.message = 'Please correct the errors and try again.';
      this.clearMessage();
      return;
    }

    this.isSubmitting = true;

    try {
      this.validator.setFormSubmitted();

      await axios.post(_url, {
        email: this.formFields.email
      });

      this.success = true;
      this.message = 'Thank you for subscribing to our newsletter! Please check your email and confirm your subscription.';
      this.resetForm();
      this.isSubmitting = false;

    } catch (error) {
      this.success = false;
      this.message = 'There was an error subscribing to our newsletter. Please try again later.';
      console.error('[Newsletter] There was an error subscribing: ', error);
      this.isSubmitting = false;
    } finally {
      this.clearMessage();
    }
  }
});
