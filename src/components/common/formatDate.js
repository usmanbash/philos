export default dateString => {
	const date = new Date(dateString)
	const options = {
		day: 'numeric',
		month: 'short',
		hour12: true
	}

	return new Intl.DateTimeFormat('en-US', options).format(date)
}
