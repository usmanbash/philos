// import './card-slider.scss'

// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle'

// @TODO remove this, put it in the global styles
// import styles bundle
// import 'swiper/css/bundle'

export default (props = {}) => ({
  ...props,

  // @note temporary to enable backwards compatibility with slider-navbar.liquid
  showNavigation: true,
  loop: true,

  // @TODO implement this
  isBeginning: true,
  isEnd: false,

  init() {
    this.initSwiper()
  },

  /**
   * Initialize the Swiper instance
   */
  initSwiper() {
    this.swiper = new Swiper(this.$refs.sliderEl, {
      effect: 'slide',
      grabCursor: true,
      spaceBetween: 20,
      allowTouchMove: true,
      simulateTouch: true,
      // autoplay: {
      //   delay: 5000,
      // },
      navigation: {
        enabled: true,
        nextEl: '.swiper-button__next',
        prevEl: '.swiper-button__prev',
      },
      breakpoints: {
        0: {
          slidesPerView: 1.2,
          loop: true,
          centeredSlides: true,
        },
        640: {
          slidesPerView: 2,
          loop: true,
        },
        1024: {
          slidesPerView: this.slidesPerViewLg || 3,
          loop: true,
        },
      },
    })
  },

  destroy() {
    if (this.swiper) {
      this.swiper.destroy()
    }
  },
})
