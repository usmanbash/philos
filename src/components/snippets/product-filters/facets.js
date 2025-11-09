import apolloClient from './../../common/apolloClient'
import facetsQuery from './facets.query'
import _mapValues from 'lodash/mapValues'
// import _camelCase from 'lodash/camelCase'

/**
 * Represents a class for managing facets.
 */
export default class Facets {
	/**
	 * Creates an instance of Facets.
	 * @param {Object} options - The options for initializing the Facets instance.
	 * @param {string} options.collectionHandle - The handle of the collection.
	 */
	constructor({ collectionHandle }) {
		this.collectionHandle = collectionHandle
		this.facets = []
	}

	/**
	 * Fetches the facets data from the server.
	 * @returns {Array} - The fetched facets data.
	 */
	async fetchFacets() {
		try {
			const result = await apolloClient.query({
				query: facetsQuery,
				variables: { collectionHandle: this.collectionHandle }
			})
			return result.data.collection?.products?.filters
		} catch (error) {
			console.error('Failed to load facets:', error)
			return []
		}
	}

	/**
	 * Maps the facet inputs to a structured format.
	 * @param {Array} facets - The facets to map.
	 * @returns {Array} - The mapped facets.
	 */
	mapFacetInputs(facets) {
		return _mapValues(facets, facet => {
			let values = _mapValues(facet.values, value => {
				let input = JSON.parse(value.input)
				let inputValue = Object.values(input)[0]

				// let name = value.id.split('.').slice(0, -1).join('.')
				// let slug = inputValue.name || _camelCase(facet.label)

				// Standardize the structure of inputValue for consistent handling
				if (typeof inputValue === 'string') {
					inputValue = {
						value: inputValue
					}
				}

				return {
					...value,
					value: inputValue
				}
			})

			return {
				...facet,
				values
			}
		})
	}

	/**
	 * Loads the facets by fetching and mapping them.
	 * @returns {Array} - The loaded facets.
	 * @throws {Error} - If there is an error fetching the facets.
	 */
	async loadFacets() {
		try {
			let facets = await this.fetchFacets()

			// Process the raw facets data to map inputs to a structured format
			this.facets = this.mapFacetInputs(facets)

			return this.facets
		} catch (error) {
			console.error('Error fetching facets:', error)
			throw new Error('Failed to fetch facets.')
		}
	}
}
