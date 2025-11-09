export default class SizeGuide {
	constructor(metafields) {
		this.type = this.getSizeGuideType(metafields)
		this.galleryModels = this.getGalleryModels(metafields)
		this.measurementDisclaimer = this.getSizeGuideDisclaimer(metafields)
	}

  // Find a specific metaobject in the metafields array by its type
  findMetaObjectByType(metaobjects, type) {
    const obj = metaobjects?.find(metaobject => metaobject.type === type)
    if (!obj || !obj.fields) {
      return null
    }
    return obj.fields
  }

  // Get size guide type (Shoes or Clothing) from the metafields array
  getSizeGuideType(metafields) {
    try {
      const sizeGuideMetaObject = this.findMetaObjectByType(metafields, 'size_guide_type')

      if (sizeGuideMetaObject) {
        const shoes = sizeGuideMetaObject.find(o => o.key === 'shoes')?.value === 'true'
        const clothing = sizeGuideMetaObject.find(o => o.key === 'clothing')?.value === 'true'

        if (shoes) return 'Shoes'
        if (clothing) return 'Clothing'
      }
      return 'Unknown'
    } catch (e) {
      console.error('Error while parsing size guide type:', e)
      return 'Unknown'
    }
  }

  // Get gallery models from the metafields array using reduce to accumulate objects into an array
  getGalleryModels(metafields) {
    try {
      const galleryModelsMetaObjects = metafields?.filter(metaobject => metaobject.type === 'gallery_model')
      if (!galleryModelsMetaObjects || galleryModelsMetaObjects.length === 0) return []

      // Map each model's fields into an object and return an array of these objects
      return galleryModelsMetaObjects.map(modelMetaObject => {
        return modelMetaObject.fields.reduce((obj, field) => {
          obj[field.key] = field.value
          return obj
        }, {})
      })
    } catch (e) {
      console.error('Error while parsing gallery models:', e)
      return []
    }
  }


  // Get size guide measurement disclaimer from the metafields array
  getSizeGuideDisclaimer(metafields) {
    try {
      const measurementDisclaimerMetaObject = this.findMetaObjectByType(
        metafields,
        'product_measurement_disclaimer'
      )
      if (!measurementDisclaimerMetaObject) return { title: '', text: '' }

      return measurementDisclaimerMetaObject.reduce((obj, item) => {
        obj[item.key] = item.value
        return obj
      }, {})
    } catch (e) {
      console.error('Error while parsing size guide disclaimer:', e)
      return {
        title: '',
        text: ''
      }
    }
  }
}
