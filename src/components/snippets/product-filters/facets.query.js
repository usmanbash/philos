import { gql } from '@apollo/client/core'

/**
 * GraphQL query to fetch facets for a specific collection.
 *
 * @param {String} $collectionHandle - The handle of the collection.
 * @returns {Object} - The facets data for the collection.
 */
export default gql`
	query Facets($collectionHandle: String!) {
		collection(handle: $collectionHandle) {
			handle
			id
			products(first: 10) {
				filters {
					id
					label
					type
					values {
						id
						label
						count
						input
					}
				}
			}
		}
	}
`
