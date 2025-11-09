export default (element, callback = () => {}) => {
	// console.log('start listening for resize:', element)

	const resizeObserver = new ResizeObserver(entries => {
		let bounds = entries[0].target.getBoundingClientRect()
		bounds.y += window.LocoScroll?.lenisInstance.targetScroll.value || 0

		callback(bounds)
	})

	resizeObserver.observe(element)

	return resizeObserver
}
