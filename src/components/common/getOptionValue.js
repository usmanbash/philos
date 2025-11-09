export default (variant, optionName = 'Size') => {
	return variant.selectedOptions.find(option => option.name === optionName)?.value
}
