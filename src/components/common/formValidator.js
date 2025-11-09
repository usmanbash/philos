class FormValidator {
  constructor(validationRules) {
    this.validationRules = validationRules;
    this.errors = {};
    this.touchedFields = {};
    this.formSubmitted = false;

    this.resetValidationState();
  }

  /**
   * Reset the validation state of the form
   * It clears all errors and sets all fields as untouched
   * @returns {void}
   */
  resetValidationState() {
    Object.keys(this.validationRules).forEach(fieldName => {
      this.errors[fieldName] = { isError: false, message: '' };
      this.touchedFields[fieldName] = false;
    });
    this.formSubmitted = false;
  }

  /**
   * Format a field name for display
   * @param {string} fieldName - The field name to format
   * @returns {string} - The formatted field name
  */
  formatFieldNameForDisplay(fieldName) {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (str) { return str.toUpperCase(); });
  }

  /**
   * Validate a field and update the error object
   * @param {HTMLElement} field - The field to validate
   * @returns {void}
  */
  validateField(field) {
    const fieldName = field.id;
    const value = field.value;
    let errorMessage = '';

    if (this.validationRules[fieldName]) {
      const rule = this.validationRules[fieldName];
      // Check if the rule exists
      if (!rule || !rule.validate) {
        return;
      }
      // Check if the field is empty
      if (!rule.validate(value)) {
        errorMessage = rule.message;
      } else if (rule.additionalCheck) {
        // Check if the field passes an additional check
        const additionalResult = rule.additionalCheck(value);
        if (!additionalResult.isValid) {
          errorMessage = additionalResult.message;
        }
      }
    }
    // Update the error object
    this.errors[fieldName] = {
      isError: !!errorMessage,
      message: errorMessage
    };
  }

  /**
   * Validate all fields in the form
   * @param {Object} formFields - The form fields to validate
   * @returns {boolean} - Whether the form is valid
  */
  validateForm(formFields) {
    // Pass each field to the validateField method
    Object.keys(this.validationRules).forEach(key => {
      const field = formFields[key];
      // Validate the field, if it exists
      if (field) {
        // Validate the field
        this.validateField(field);
        // Mark the field as touched when validating the form
        this.setFieldTouched(key);
      }
    });

    return !Object.values(this.errors).some(error => error.isError);
  }

  /**
   * Clear an error from a field
   * @param {string} fieldName - The field name to clear
   * @returns {void}
  */
  clearError(fieldName) {
    if (this.errors[fieldName]) {
      this.errors[fieldName].isError = false;
      this.errors[fieldName].message = '';
    }
  }

  /**
   * Check if the form is valid
   * Iterate over the errors object and check if any errors are present
   * If no errors are present, the form is valid
   * @returns {boolean} - True if the form is valid, false otherwise
  */
  isFormValid() {
    return Object.values(this.errors).every(error => !error.isError);
  }

  /**
   * Set a field as touched when the user interacts with it
   * Used as a flag to show error messages only after the user interacts with the field
   * @param {string} fieldName - The field name to set as touched
   * @returns {void}
  */
  setFieldTouched(fieldName) {
    this.touchedFields[fieldName] = true;
  }

  /**
   * Check if a field is touched
   * @param {string} fieldName - The field name to check
   * @returns {boolean} - True if the field is touched, false otherwise
  */
  isFieldTouched(fieldName) {
    return this.touchedFields[fieldName];
  }

  /**
   * Set the form as submitted
   * @returns {void}
  */
  setFormSubmitted() {
    this.formSubmitted = true;
  }

  /**
   * Check if the form is submitted or not
   * @returns {boolean} - True if the form is submitted, false otherwise
  */
  isFormSubmitted() {
    return this.formSubmitted;
  }
}

export default FormValidator;
