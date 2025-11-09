// import component styles
import './product-card.scss'

// export component (Alpine.data)
// @see https://alpinejs.dev/directives/data
export default (props = {}) => ({
	...props,

	init() {},

	destroy() {},

  navigateToProductDetailPage() {
    window.location.href = this.url;
  }
})
