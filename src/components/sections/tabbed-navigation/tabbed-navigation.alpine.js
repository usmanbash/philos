import './tabbed-navigation.scss'

/**
 * Represents a tabbed navigation component.
 * @param {Object} props - The properties for the tabbed navigation component.
 * @param {boolean} props.activeTab - The initial active tab.
 * @returns {Object} - The tabbed navigation component object.
 */
export default (props = {}) => ({
	...props,

	activeTab: false,

	/**
	 * Initializes the tabbed navigation component.
	 * Checks if the URL contains a hash and sets the activeTab accordingly.
	 * Adds an event listener for hash change.
	 * @returns {void}
	 */
	init() {
		const hash = window.location.hash

		// If a hash is present, use it as the active tab, otherwise use the default active tab
		this.activeTab = hash ? hash.substring(1) : (this.activeTab = props.activeTab)

		window.addEventListener('hashchange', this.onHashChange.bind(this), false)

		// mozda ovo radi ceo posao - cekiraj?
		this.$nextTick(() => {
			if (hash) {
        window.LocoScroll?.lenisInstance.scrollTo(hash, { immediate: true })
      }

			window.swup?.hooks.on('link:anchor', anchor => {
				this.activeTab = anchor.to.hash.split('#')[1]

				// console.log('SCROLLTO:', anchor.to.hash, document.querySelector(anchor.to.hash))
				// console.log('NE RADI:', window.LocoScroll?.lenisInstance, anchor.to.hash)
				// window.LocoScroll?.lenisInstance.scrollTo(anchor.to.hash)
			})
		})
	},

	/**
	 * Destroys the tabbed navigation component.
	 * Removes the event listener for hash change.
	 * @returns {void}
	 */
	destroy() {
		window.removeEventListener('hashchange', this.onHashChange.bind(this), false)
	},

	/**
	 * Updates the active tab when the hash changes.
	 * @param {HashChangeEvent} hash - The hash change event.
	 * @returns {void}
	 */
	onHashChange(hash) {

		this.activeTab = hash.newURL.split('#')[1]
	},

	/**
	 * Checks if a section is active.
	 * @param {string} sectionId - The ID of the section.
	 * @returns {boolean} - True if the section is active, false otherwise.
	 */
	isActive(sectionId) {
		return sectionId === this.activeTab
	},

	/**
	 * Updates the active tab and scrollTo the element
	 * Also updates the URL to match the active tab.
	 * @param {string} sectionId - The ID of the section.
	 * @returns {void}
	 */
	updateActiveTab(sectionId) {
		this.activeTab = sectionId

		let hash = `#${this.activeTab}`

		history.pushState(null, null, hash)

		window.LocoScroll?.lenisInstance.scrollTo(hash)
	}
})
