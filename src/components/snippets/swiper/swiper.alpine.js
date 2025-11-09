import './swiper.scss'

// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle'

// import styles bundle
import 'swiper/css/bundle'

export default (props = {}) => ({
	...props,

	init() {
		this.initializeSwiper()
	},

	setActiveSlide(index) {
		// console.log('set active slide:', index, this.id, this[this.id])
		this[this.id].slideTo(index)
	},

	initializeSwiper() {
		this[this.id] = new Swiper(this.$refs.swiperEl, this.options)

		this[this.id].on('slideChange', () => {
			this.$dispatch('set-active-color-variation', this[this.id].realIndex)
		})
	}
})
