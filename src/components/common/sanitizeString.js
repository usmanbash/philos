// function to sanitize the string for the url
export default str => {
	return typeof str == 'string'
		? str
				.toLowerCase()
				.replace(/ /g, '-')
				.replace(/[^\w-]+/g, '')
				.replace(/--+/g, '-')
				.replace(/^-+/, '')
				.replace(/-+$/, '')
		: null
}
