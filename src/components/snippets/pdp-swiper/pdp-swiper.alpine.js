import './pdp-swiper.scss'

// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle'

// import styles bundle
import 'swiper/css/bundle'

export default (props = {}) => ({
	...props,

  swipers: {},

	init() {
		this.initializeSwiper()
	},

	setActiveSlide(index) {
		// console.log('set active slide:', index, this.id, this[this.id])
    // console.log('this.swipers[this.id]', this.swipers[this.id])
    // console.log('index', index)
    // console.log('Active Index:', this.swipers[this.id].activeIndex);
		this.swipers[this.id].slideTo(index)
	},

  initializeSwiper() {
    this.swipers[this.id] = new Swiper(this.$refs.pdpSwiperEl, {
      ...this.options,
      on: {
        slideChange: function() {
          // Get the swiper instance -> this refers to the swiper instance here
          let swiper = this
          // Check if loop is currently disabled and the swiper is at the last slide
          if (!swiper.params.loop && swiper.isEnd) {
            setTimeout(() => {
              // Transition back to the first slide
              swiper?.slideTo(0, 1000);
            }, 1000); // Delay for the last slide
          }
        }
      }
    });
  },

})
