import './template-product.scss'

// ------------------------------------------------------------
// Constant: 

// Name of the component
const COMPONENT_NAME = 'templateProduct'
// id of the script element that contains the JSON data
const JSON_SCRIPT_ID = 'pdpData__templateProduct'
// ------------------------------------------------------------


export default (props = {}) => ({
  ...props,

  type: null,
  galleryModels: null,
  measurementDisclaimer: null,

  init() {

    // load data from json script
    const _data = this.loadJsonData()

    this.type = _data?.type
    this.galleryModels = _data?.galleryModels
    this.measurementDisclaimer = _data?.measurementDisclaimer

  },

  loadJsonData() {

    // Get JSON data from script element
    const dataScript = document.getElementById(JSON_SCRIPT_ID)
    if (dataScript) {
      try {
        const data = JSON.parse(dataScript.textContent || dataScript.innerHTML)
        // console.log(`[${COMPONENT_NAME}] data:`, data)
        return data
      } catch (error) {
        console.error(
          `[${COMPONENT_NAME}] Error parsing json '#${JSON_SCRIPT_ID}'`,
          error.message || error
        )
        return {}
      }
    }
  },

  destroy() { },

  openSizeGuide() {
    this.$store.sizeGuide.setSizeGuide({
      type: this.type,
      galleryModels: this.galleryModels,
      measurementDisclaimer: this.measurementDisclaimer
    })
  },

  closeSizeGuide() {
    this.$store.sizeGuide.isOpen = false
  },

  toggleSizeGuide() {
    this.$dispatch('toggle-filter-drawer')
    this.$store.sizeGuide.isOpen = !this.$store.sizeGuide.isOpen
  }
})
