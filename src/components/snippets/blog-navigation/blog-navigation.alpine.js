import './blog-navigation.scss'

export default (props = {}) => ({
  ...props,

  init() {
    this.getUrlPath()
  },

  destroy() {},

  // get url path
  getUrlPath() {
    return window.location.pathname
  },

  isActive(link) {
    // example link: /blogs/running-philosophy/tagged/beauty
    // example this.getUrlPath: /blogs/running-philosophy/tagged/beauty
    return this.getUrlPath() === link
  }

})
