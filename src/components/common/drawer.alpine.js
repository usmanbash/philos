import gsap from 'gsap'

const DIRECTIONS = {
	top: {
		x: 0,
		y: '100%'
	},

	bottom: {
		x: 0,
		y: '-100%'
	},

	left: {
		x: '100%',
		y: 0
	},

	right: {
		x: '-100%',
		y: 0
	}
}

export default (props = {}) => ({
	...props,

	isOpen: false,

	init() {
		this.direction = props.direction

		this.$watch('isOpen', isOpen => this.toggleDrawer(isOpen))

		if (this.store) {
			this.$watch(
				() => this.$store[this.store].isOpen,
				isOpen => (this.isOpen = isOpen)
			)
		}
	},

	destroy() {},

	// Ensure the drawer closes when the history state changes
	handlePopstate() {
		this.close()
	},
	toggleDrawer(isOpen) {
		let el = this.$refs.drawer || this.$el

		window.LocoScroll && window.LocoScroll.lenisInstance[isOpen ? 'stop' : 'start']()

		gsap.to(el, {
			x: !isOpen ? 0 : DIRECTIONS[this.direction].x,
			y: !isOpen ? 0 : DIRECTIONS[this.direction].y,
			duration: 1,
			ease: 'Power2.easeInOut'
		})

		if (this.$refs.backdrop) {
			gsap.to(this.$refs.backdrop, {
				opacity: isOpen ? 1 : 0,
				duration: 1,
				ease: 'Power2.easeInOut'
			})

			this.$refs.backdrop.style.pointerEvents = isOpen ? 'auto' : 'none'
		}
	},

	toggle() {
		this.isOpen = !this.isOpen
	},

	close() {
		this.isOpen = false

		if (this.store) {
			this.$store[this.store].isOpen = false
		}
	},

	open() {
		this.isOpen = true
	}
})
