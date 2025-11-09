import './hero-slider-logo.scss';
// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle';

// @TODO remove this, put it in the global styles
// import styles bundle
import 'swiper/css/bundle';

/**
 * @see https://gist.github.com/nagavinodcse/e8f4da1efed0132ad8998b885e8c79e0
 */

export default (props = {}) => ({
  ...props,

  init() {
    this.initSwiper();
  },

  handleSlideClick(e) {
    const href = e.target.dataset.href;
    if (href) {
      // window.location.href = href
      window?.swup.navigate(href);
    }
  },

  /**
   * Initialize the Swiper instance
   */
  initSwiper() {
    this.swiper = new Swiper(this.$refs.sliderEl, {
      loop: true,
      effect: 'slide',
      fadeEffect: {
        crossFade: true,
      },
      grabCursor: true,
      parallax: true,
      autoplay: {
        delay: 5000,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      preventClicks: false,
      breakpoints: {
        // desktop (lg)
        1024: {
          allowTouchMove: false,
          grabCursor: false,
          effect: 'fade',
          fadeEffect: {
            crossFade: true,
          },
        },
      },
    });
  },

  setActiveSlide(index) {
    this.swiper.slideTo(index);
  },

  destroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  },
});
