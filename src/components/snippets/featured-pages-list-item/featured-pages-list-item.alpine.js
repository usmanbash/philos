// import component styles
import './featured-pages-list-item.scss'

import gsap from 'gsap'

// export component (Alpine.data)
// @see https://alpinejs.dev/directives/data
export default (props = {}) => ({
	...props,

	notActive: false,

	interacted: false,

	activeIndex: false,

	init() {
		this.index = props.index
		window.addEventListener('mousemove', this.onMouseMove.bind(this))
	},

	onMouseMove(e) {
		if (!this.$refs.img) return

		gsap.to(this.$refs.img, {
			x: e.clientX,
			y: e.clientY,
			duration: 1,
			ease: 'Power4.easeOut',
			overwrite: true
		})
	},

	destroy() {
		window.removeEventListener('mousemove', this.onMouseMove)
	},

	onHover() {
		this.$dispatch('item-hovered', this.index)
	},

	onLeave() {
		this.$dispatch('item-hovered', false)
	},

	setActive(index) {
		this.activeIndex = index
	},

	get isActive() {
		return this.activeIndex == this.index
	},

	get notActive() {
		return this.activeIndex && !this.isActive
	}
})
