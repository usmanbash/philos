import './section-about.scss'

// export component (Alpine.data)
// @see https://alpinejs.dev/directives/data
export default (props = {}) => ({
	...props,
	tab: props.tab || 'vision',

	init() {
		this.setActiveTabFromQuery()

		this.$watch('tab', (newTab) => {
			this.tab = newTab
		})
	},

	setActiveTabFromQuery() {
		const params = new URLSearchParams(window.location.search)
		const tabFromUrl = params.get('tab')
		if (tabFromUrl) {
			this.tab = tabFromUrl
		}
	},

	destroy() {}
})
