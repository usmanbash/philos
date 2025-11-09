import Alpine from 'alpinejs'
import _each from 'lodash/each'

const fields = [
  'type',
	'sizeGuide',
	'galleryModels',
	'measurementDisclaimer'
]

const store = Alpine.store('sizeGuide', {
	init() {},

	isOpen: false,

	// type: 'Clothes',

	sizeGuide: false,
	galleryModels: false,
	measurementDisclaimer: {
    title: false,
    text: false
  },

	setSizeGuide(obj) {
    _each(fields, fieldKey => {
      // Special case for measurementDisclaimer
      switch(fieldKey) {
        case 'measurementDisclaimer':
          // Merge the object with the default object
          Object.assign(this.measurementDisclaimer, obj[fieldKey])
          break
        case 'galleryModels':
          this.galleryModels = Array.isArray(obj[fieldKey]) ? obj[fieldKey] : []
          break;
        default:
          this[fieldKey] = obj[fieldKey]
      }
    });

    this.isOpen = true;
  }
})

export default store
