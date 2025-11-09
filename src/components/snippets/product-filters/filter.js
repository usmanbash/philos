import apolloClient from './../../common/apolloClient'

import filteredProductsQuery from './filtered-products.query'
import ImageFetcher from './image-fetcher'
import _each from 'lodash/each'
import _camelCase from 'lodash/camelCase'

const VARIANT_OPTIONS = ['color', 'size']

/**
 * Represents a product filter.
 */
export default class ProductsFilter {
	/**
	 * Creates a new instance of ProductsFilter.
	 * @param {Object} options - The options for the filter.
	 * @param {string} options.collectionHandle - The handle of the collection to filter.
	 */
	constructor({ collectionHandle }) {
		this.collectionHandle = collectionHandle
		this.filteredProducts = []
    this.variantImages = new Map()
	}

	/**
	 * Sanitizes the sort key by converting it to uppercase and replacing hyphens with underscores.
	 *
	 * @param {string} sortKey - The sort key to be sanitized.
	 * @returns {string} The sanitized sort key.
	 */
	sanitizeSortKey(sortKey) {
		// SORT OPTIONS
		// TITLE: Sort products alphabetically by title.
		// PRICE: Sort products by their price.
		// RELEVANCE: Sort products based on relevance to the search query.
		// CREATED_AT: Sort products by their creation date.
		// BEST_SELLING: Sort products by their sales popularity.

		// turn e.g 'best-selling' into 'BEST_SELLING'
		return sortKey.toUpperCase().replace('-', '_')
	}

	/**
	 * Filters the products based on the specified facets.
	 * @param {Object} facets - The facets to filter the products by.
	 * @returns {Array} - The filtered products.
	 */
	async filterProducts(facets, sortKey) {
		const variables = {
			collectionHandle: this.collectionHandle,
			filters: []
		}

		_each(facets, (facetValues, name) => {
			let slug = _camelCase(name.split('.').pop())

			if (facetValues.length) {
				facetValues.forEach(value => {
					let option = VARIANT_OPTIONS.includes(slug)
						? { variantOption: { name: slug, value } }
						: { [slug]: value }
					variables.filters.push(option)
				})
			}
		})

		try {
			const result = await apolloClient.query({
				query: filteredProductsQuery,
				variables,
				sortKey: this.sanitizeSortKey(sortKey) || 'BEST_SELLING',
				reverse: false
			})

			this.filteredProducts = result.data?.collection?.products?.nodes

      // console.log('this.filteredProducts', this.filteredProducts)
      // Fetch images for the variants using the ImageFetcher class
      const imageFetcher = new ImageFetcher(this.filteredProducts)
      try {
        await imageFetcher.fetchImagesForVariants()
        this.variantImages = imageFetcher.variantImages

        // console.log('this.variantImages', this.variantImages)
      } catch (error) {
        console.error('Failed to fetch images for variants:', error)
        return []
      }

      return this.filteredProducts
		} catch (error) {
			console.error('Failed to filter products:', error)
			return []
		}
	}
}
