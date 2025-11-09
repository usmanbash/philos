export default async (formData, callback) => {
	// console.log('add to cart:', formData)

	return await fetch('/cart/add.js', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(formData)
	})
		.then(response => {
			callback && callback()

			return response.json()
		})
		.catch(error => {
			console.error('Error:', error)
		})
}
