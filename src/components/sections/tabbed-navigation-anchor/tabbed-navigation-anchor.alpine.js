import './tabbed-navigation-anchor.scss'

export default (props = {}) => ({
	...props,

	init() {},

	destroy() {},

	/**
	 * Listen for the custom event and scroll to the section
	 * This method is called when the custom event is dispatched from the tabbed
	 * navigation component and it scrolls to the section with the matching ID.
	 *
	 * @param {string} sectionId
	 *
	 * @returns {void}
	 *
	 * @todo @Filip do your magic here
	 */
	handleScrollEvent(sectionId) {
		// Check if the event's sectionId matches this anchor's ID
		if (sectionId === this.$el.id) {
			this.$el.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}
})
