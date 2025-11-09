import gsap from 'gsap'
import './accordion.scss'

/**
 * Represents an accordion component.
 * @param {Object} props - The properties of the accordion.
 * @param {boolean} props.isOpen - Indicates whether the accordion is initially open or closed.
 * @param {number} props.height - The height of the accordion.
 * @param {string} props.group - The group to which the accordion belongs.
 * @param {string} props.id - The unique identifier of the accordion.
 * @param {Object} props.animationOptions - The animation options for opening and closing the accordion.
 * @returns {Object} - The accordion object.
 */
export default (props = {}) => ({
	...props,

	isOpen: false,
	height: 0,

	/**
	 * Initializes the accordion.
	 */
	init() {
		this.group = props.group
		this.isOpen = props.isOpen
		this.id = props.id
		this.initAccordion()

		// Reset isOpen when the mobile menu is closed
	},

	/**
	 * Initializes the accordion and sets its initial state.
	 */
	initAccordion() {
		this.initResizeObserver()
		this.watchForChanges()

		if (!this.isOpen && this.$refs.foldable) {
			gsap.set(this.$refs.foldable, { height: 0 })
		}
	},

	/**
	 * Watches for changes in the isOpen property and updates the accordion accordingly.
	 */
	watchForChanges() {
		this.$watch('isOpen', value => {
			if (!this.$refs.foldable) return

			gsap.to(this.$refs.foldable, {
				...props?.animationOptions,
				height: value ? this.height : 0,
				duration: 1,
				overwrite: true,
				ease: 'Power2.easeInOut'
			})

			// @TODO FINE TUNE ANIAMATION
			gsap.to(this.$refs.reference, {
				opacity: value ? 1 : 0,
				duration: 0.5,
				delay: value ? 0 : 0.25,
				overwrite: true
			})
		})
	},

	/**
	 * Initializes the ResizeObserver to track changes in the accordion's height.
	 */
	initResizeObserver() {
		if (!this.$refs.reference) {
			return
		}

		this.resizeObserver = new ResizeObserver(entries => {
			this.height = entries[0].target.offsetHeight
			// console.log('height:', this.height, entries[0].target.offsetHeight)
		})

		this.resizeObserver.observe(this.$refs.reference)
	},

	/**
	 * Toggles the state of the accordion.
	 */
	toggle() {
		if (typeof this.group === 'undefined') {
			this.isOpen = !this.isOpen
		} else {
			this.$dispatch('accordion-set-active', {
				id: this.id,
				group: this.group
			})
		}
	},

	/**
	 * Sets the active state of the accordion based on the activeObject.
	 * @param {Object} activeObject - The active object containing the id and group.
	 */
	setActive(activeObject) {
		let isActive = activeObject.id === this.id

		// close if it is already active
		if (isActive && this.isOpen) {
			this.$dispatch('accordion-set-active', {
				id: false,
				group: this.group
			})
		} else {
			// react only within the same group or if there is no group
			if (this.group == activeObject.group) {
				this.isOpen = isActive
			}
		}
	},

	/**
	 * Destroys the accordion.
	 */
	destroy() {}
})
