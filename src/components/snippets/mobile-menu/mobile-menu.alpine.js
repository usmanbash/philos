import gsap from 'gsap'
import './mobile-menu.scss'

/**
 * Represents an accordion component.
 * @param {Object} props - The properties of the accordion.
 * @param {boolean} props.isOpen - Indicates whether the accordion is initially open or closed.
 * @param {number} props.height - The height of the accordion.
 * @param {string} props.group - The group to which the accordion belongs.
 * @param {string} props.id - The unique identifier of the accordion.
 * @param {Object} props.animationOptions - The animation options for opening and closing the accordion.
 * @returns {Object} - The accordion object.
 *
 * @todo reset the isOpen state when the route changes (menu is closed)
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
		this.$watch(
			() => this.$store.app.mobileMenuOpen,
			(newValue) => {
				if (!newValue) {
					this.isOpen = false
				}
			}
		)
	},

	/**
	 * Initializes the accordion and sets its initial state.
	 */
	initAccordion() {
		this.initResizeObserver()
		this.watchForChanges()

		/**
		 * @NOTE: there was an error here
		 * GSAP target undefined not found.
		 *
		 * added this condition to check if the foldable element exists
		 */
		if (!this.isOpen && this.$refs.foldable) {
			gsap.set(this.$refs.foldable, { height: 0 })
		}
	},

	/**
	 * Watches for changes in the isOpen property and updates the accordion accordingly.
	 */
	watchForChanges() {
		this.$watch('isOpen', (value) => {
			/**
			 * @NOTE: there was an error here
			 * GSAP target undefined not found.
			 *
			 * added this condition to check if the foldable element exists
			 * if it does not exist, it will not animate
			 */
			if (!this.$refs.foldable) return

			gsap.to(this.$refs.foldable, {
				...props?.animationOptions,
				height: value ? this.height : 0,
				duration: 1,
				overwrite: true,
				ease: 'Power2.easeInOut'
			})

			// @TODO FINE TUNE ANIAMATION
			// gsap.to(this.$refs.reference, {
			//   opacity: value ? 1 : 0,
			//   duration: 0.5,
			//   delay: value ? 0 : 0.25,
			//   overwrite: true,
			// });
		})
	},

	/**
	 * Initializes the ResizeObserver to track changes in the accordion's height.
	 *
	 * @NOTE: there was an error here
	 * ResizeObserver is not defined
	 * Added this condition to check if the ResizeObserver is available
	 * if it is not available, it will not initialize the ResizeObserver
	 */
	initResizeObserver() {
		if (this.$refs.reference) {
			this.resizeObserver = new ResizeObserver((entries) => {
				this.height = entries[0].contentRect.height
			})

			this.resizeObserver.observe(this.$refs.reference)
		}
	},

	/**
	 * Toggles the state of the accordion.
	 */
	toggle() {
		this.$dispatch('accordion-menu-set-active', {
			id: this.id,
			group: this.group
		})
	},

	/**
	 * Sets the active state of the accordion based on the activeObject.
	 * @param {Object} activeObject - The active object containing the id and group.
	 */
	setActive(activeObject) {
		let isActive = activeObject.id === this.id

		// close if it is already active
		if (isActive && this.isOpen) {
			this.$dispatch('accordion-menu-set-active', {
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
