import './running-group-form.scss';
import axios from 'axios';
import FormValidator from '../../common/formValidator';
import { validationRules } from './running-group-form.validation';

// Constants
const KLAVIYO_API_BASE_URL = process.env.KLAVIYO_API_BASE_URL;
// console.log('[Running Group] KLAVIYO_API_BASE_URL: ', KLAVIYO_API_BASE_URL);

const endpoint = '/subscribe/running-group';

const _url = `${KLAVIYO_API_BASE_URL}${endpoint}`;
// console.log('[Running Group] URL: ', _url)

export default (props = {}) => ({
  ...props,

  formFields: {},
  validator: new FormValidator(validationRules),
  success: false,
  message: '',
  isSubmitting: false,

  init() {
    this.formFields = props.formFields;
    // Watch for changes in each form field
    this.$watch('formFields', (value, oldValue) => {
      Object.keys(value).forEach(fieldName => {
        if (value[fieldName] !== oldValue[fieldName]) {
          this.validator.validateField({ id: fieldName, value: value[fieldName] });
        }
      });
    }, { deep: true });
    // Check if the form is valid
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
      name: '',
      email: '',
      runningLevel: '',
      location: ''
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

  // Subscribe to the running group
  async subscribe() {
    this.validator.setFormSubmitted();

    if (!this.validator.validateForm(this.$refs)) {
      this.success = false;
      this.message = 'Please correct the errors and try again.';
      this.clearMessage();
      return;
    }

    this.isSubmitting = true;
    // console.log('Submitting form, isSubmitting:', this.isSubmitting);

    try {
      await axios.post(_url, {
        name: this.formFields.name,
        email: this.formFields.email,
        running_level: this.formFields.runningLevel,
        location: this.formFields.location,
      });

      this.success = true;
      this.message = 'Thank you for joining Philos Running Group! Please check your email and confirm your subscription.';
      // console.log('[Philos Running Group] Successfully subscribed: ', response);

      // Reset form and validation state on successful subscription
      this.resetForm();
      // Ensure the submit button is re-enabled after successful submission
      this.isSubmitting = false;
      // console.log('Form reset, isSubmitting:', this.isSubmitting);
    } catch (error) {
      this.success = false;
      this.message = 'There was an error subscribing to Philos Running Group. Please try again later.';
      console.error('[Philos Running Group] There was an error subscribing: ', error);
      this.isSubmitting = false;
    } finally {
      this.clearMessage();
    }
  }
});
