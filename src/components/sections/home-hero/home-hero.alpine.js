import './home-hero.scss'

export default (props = {}) => ({
  ...props,

  // Mobile logic
  scrollListener: null,
  isScrollingStarted: false,

  init() {
    // assign cb function
    this.scrollListener = this.setScrollingStarted.bind(this)
    window.addEventListener('scroll', this.scrollListener, { passive: true })
  },

  setScrollingStarted() {
    // Use LocoScroll's lenisInstance if available, otherwise fallback to default scroll behavior
    let currentScrollY = window.LocoScroll?.lenisInstance?.targetScroll || window.scrollY

    // Check if the user has scrolled more than 100px
    this.isScrollingStarted = currentScrollY > 100
  },

  destroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener)
    }
  },
})
