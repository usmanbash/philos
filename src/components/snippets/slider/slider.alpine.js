import './slider.scss'
// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle'

// import styles bundle
import 'swiper/css/bundle'

/**
 * @see https://gist.github.com/nagavinodcse/e8f4da1efed0132ad8998b885e8c79e0
 */

export default (props = {}) => ({
	...props,
  isBeginning: true,
  isEnd: false,
  showNavigation: true,
  loop: true,


	init() {
    this.initSwiper()
	},
  /**
   * Watch for changes in the isBeginning and isEnd properties
   */
  watchForChanges() {
    this.$watch('isBeginning', (value) => {
      if (this.swiper) {
        this.swiper.isBeginning = value
      }
    })

    this.$watch('isEnd', (value) => {
      if (this.swiper) {
        this.swiper.isEnd = value
      }
    })
  },

  /**
   * Update the visibility of the navigation buttons
   */
  updateNavigationVisibility() {
    // Get the total number of slides
    const totalSlides = this.swiper.slides.length
    // Get the number of active slides per view
    let activeSlidesPerView = this.getActiveSlidesPerView()
    // Check if the total number of slides is less than the number of active slides per view
    this.showNavigation = totalSlides > activeSlidesPerView

    // Check if the loop option is enabled
    if (this.getLoopValue()) {
      // Check if the total number of slides is greater than the number of active slides per view
      if (totalSlides > activeSlidesPerView) {
        this.isBeginning = false
        this.isEnd = false
      }
    }
  },

  /**
   * Get the number of active slides per view
   * @returns {number}
  */
  getActiveSlidesPerView() {
    // Get the number of active slides per view
    let activeSlidesPerView = this.options.slidesPerView || 1
    // Check if breakpoints are defined
    if (this.options.breakpoints) {
      // Get the breakpoints in ascending order
      const sortedBreakpoints = Object.keys(this.options.breakpoints).sort((a, b) => a - b)
      // Loop through the breakpoints
      sortedBreakpoints.forEach((breakpoint) => {
        if (window.innerWidth >= breakpoint) {
          activeSlidesPerView = this.options.breakpoints[breakpoint].slidesPerView
        }
      })
    }

    return activeSlidesPerView
  },

  // get loop value from options per breakpoint
  getLoopValue() {
    let loop = this.options.loop || false
    if (this.options.breakpoints) {
      const sortedBreakpoints = Object.keys(this.options.breakpoints).sort((a, b) => a - b)
      sortedBreakpoints.forEach((breakpoint) => {
        if (window.innerWidth >= breakpoint) {
          loop = this.options?.breakpoints[breakpoint]?.loop
        }
      })
    }
    return loop
  },

  /**
   * Initialize the Swiper instance
  */
	initSwiper() {
    this.swiper = new Swiper(
      this.$refs.sliderEl, {
        ...this.options,
        init: (swiper) => {
          this.isBeginning = swiper?.isBeginning
          this.isEnd = swiper?.isEnd
          this.updateNavigationVisibility()
        },
        resize: () => {
          this.updateNavigationVisibility()
        },
        on: {
          slideChange: () => {
            this.isBeginning = this.swiper?.isBeginning
            this.isEnd = this.swiper?.isEnd
          }
        }
      }
    )

    this.watchForChanges()
    this.loop = this.getLoopValue()
	},

  setActiveSlide(index) {
		this.swiper.slideTo(index)
	},

  destroy() {
    if (this.swiper) {
      this.swiper.destroy()
    }
  }
})
