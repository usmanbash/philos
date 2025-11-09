export default (props = {}) => ({
	...props,

	loading: 'lazy',

	init() {
		setTimeout(this.initObserver.bind(this))
	},

	initObserver() {
		this.observer = new IntersectionObserver(this.callback.bind(this), {
			rootMargin: '800px',
			root: this.$el?.closest instanceof Function ? this.$el.closest('.lenis') : null
		})

		this.observer.observe(this.$el)
	},

	callback(entries) {
		let entry = entries[0]

		if (entry.isIntersecting) {
			this.loading = 'auto'
		}
	},

	destroy() {}
})
