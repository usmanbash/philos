
import './contact-form.scss'

/**
 * @todo: use Ionide.js for form validation in some other iteration or project
 * @see: https://medium.com/@just_turquoise_armadillo_355/javascript-form-validation-with-alpine-js-and-ionide-js-a17b6d23fbf8
 * @see: https://ionide.io/
 * @see: https://github.com/caneara/iodine
 *
 *
 * RECAPTHA ISSUE:
 * @see https://help.shopify.com/en/manual/online-store/setting-up/preferences#protect-your-store-with-google-recaptcha
 * @see https://shopify.dev/docs/themes/trust-security/captcha
 */

/**
 * Validation rules for each form field
 * Each rule has a validate function that checks if the field is empty
 * and a message to display if the field is empty
 *
 * @todo move this to a separate file and import it, or pass it as a prop
 */

const nameRegExp = /^[\p{L}\p{M}'\-\s]+$/u
const emailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;

const validationRules = {
  firstName: {
    validate: (value) => !!value.trim(),
    message: 'First Name is required.',
    additionalCheck: (value) => ({
      isValid: nameRegExp.test(value),
      message: 'First Name is not valid.',
    }),
  },
  lastName: {
    validate: (value) => !!value.trim(),
    message: 'Last Name is required.',
    additionalCheck: (value) => ({
      isValid: nameRegExp.test(value),
      message: 'Last Name is not valid.',
    }),
  },
  email: {
    validate: (value) => !!value.trim(),
    message: 'Email is required.',
    additionalCheck: (value) => ({
      isValid: emailRegExp.test(value),
      message: 'Please enter a valid email address.',
    }),
  },
  message: {
    validate: (value) => !!value.trim(),
    message: 'Message is required.',
  },
};


export default (props = {}) => ({
  ...props,
  formFields: {},
  validationRules: validationRules,
  errors: {},

  init() {
    // Initialize errors object with all fields set to false and empty messages
    this.formFields = props.formFields;
    this.errors = props.errors;

    // Watch for changes in each form field
    // deep: true - watches nested properties
    this.$watch('formFields', (value, oldValue) => {
      Object.keys(value).forEach(fieldName => {
        // Only clear the error if the new value is different and passes validation
        if (value[fieldName] !== oldValue[fieldName]) {
          this.validateField(fieldName);
        }
      });
    }, { deep: true });


    this.isFormValid();
    this.setupFormListener();
  },

  /**
   * Setup a listener for the form submission
   * Prevent the default form submission and validate the form
   * If the form is valid, process the submission
   * If the form is invalid, log an error
   *
   * @returns {void}
  */
  setupFormListener() {
    const form = document.getElementById('ContactForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.validateForm();
      if (this.isFormValid()) {
        // console.log('Form is valid. Processing submission...');
        form.submit()
      }
    });
  },

  /**
   * Format a field name for display
   *
   * @param {string} fieldName - The field name to format
   *
   * @returns {string} - The formatted field name
  */
  formatFieldNameForDisplay(fieldName) {
    // Converts camelCase field names to a more readable format
    // Example: "firstName" becomes "First Name"
    return fieldName
      // Insert a space before all caps
      .replace(/([A-Z])/g, ' $1')
      // Uppercase the first character
      .replace(/^./, function(str){ return str.toUpperCase(); })
  },

  /**
   * Validate a field and update the error object
   *
   * @param {HTMLElement} field - The field to validate
   *
   * @returns {void}
  */
  validateField(field) {
    const fieldName = field.id;
    const value = field.value;
    this.formFields[fieldName] = value;

    let errorMessage = '';

    // Use the validation rule for the field to validate the value, if it exists
    if (this.validationRules[fieldName]) {
      const rule = this.validationRules[fieldName];
      // Check if the rule exists
      if (!rule || !rule.validate) {
        return;
      }
      // Check if the field is empty
      if (!rule?.validate(value)) {
        errorMessage = rule.message;
      } else if (rule.additionalCheck) {
        // Check if the field passes an additional check
        const additionalResult = rule.additionalCheck(value);
        if (!additionalResult.isValid) {
          errorMessage = additionalResult.message;
        }
      }
    }

    this.errors[fieldName].isError = !!errorMessage;
    this.errors[fieldName].message = errorMessage;
  },

  /**
   * Validate the entire form
   *
   * @returns {boolean} - True if the form is valid, false otherwise
   *
  */
    validateForm() {
      // Validate each field
      Object.keys(this.errors).forEach(key => {
        const field = this.$refs[key];
        if (field) {
          this.validateField(field);
        }
      });

      // Check if any errors are present
      return !Object.values(this.errors).some(error => error.isError);
    },

  /**
   * Clear an error message for a field
   *
   * @param {string} fieldName - The field name to clear the error for
   *
   * @returns {void}
  */
  clearError(fieldName) {
    if (this.errors[fieldName]) {
      this.errors[fieldName].isError = false;
    }
  },

  /**
   * Check if the form is valid
   * Iterate over the errors object and check if any errors are present
   * If no errors are present, the form is valid
   *
   * @returns {boolean} - True if the form is valid, false otherwise
  */
  isFormValid() {
    return Object.values(this.errors).every(error => !error.isError);
  },

});

