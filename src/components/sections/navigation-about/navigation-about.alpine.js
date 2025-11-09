import './navigation-about.scss'

// export component (Alpine.data)
// @see https://alpinejs.dev/directives/data
export default (props = {}) => ({
	...props,

	activeTab: props.activeTab || 'vision',

	init() {
		this.getActiveTabFromQuery()
	},

	destroy() {},

	// get url params
	getUrlParams() {
		return new URLSearchParams(window.location.search)
	},

	// get active tab from query params
	getActiveTabFromQuery() {
		const params = this.getUrlParams()
		this.activeTab = params.get('tab') || 'vision'
	},

	// set active tab
	setActiveTab(tab) {
		// update active tab
		this.activeTab = tab

		// update url
		const params = this.getUrlParams()
		params.set('tab', tab)
		window.history.pushState({}, '', `${window.location.pathname}?${params}`)

		// dispatch custom event
		this.$dispatch('set-active-nav-tab', { tab: this.activeTab })

		this.$nextTick(() => {
			window.LocoScroll.resize()
		})
	}
})
