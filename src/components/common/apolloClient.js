import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'

const APP = window.Shopify.APP || {}

// store api url without trailing slash
let storeUrl = APP?.api?.baseUrl || `https://${window.Shopify.shop}/api`

// Get access token from our APP object, defined in theme.liquid (head)
let storefront_access_token = APP?.api?.storefront_access_token

// Warn if the access token is missing
if (!storefront_access_token) {
	console.error('[apolloClient] Storefront access token is missing')
	// throw new Error('Storefront access token is missing')
}

const httpLink = new HttpLink({
	uri: `${storeUrl}/graphql`,
	headers: {
		'X-Shopify-Storefront-Access-Token': storefront_access_token
	}
})

/**
 * Apollo client instance.
 * @type {ApolloClient}
 */
const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache({
		typePolicies: {
			Product: {
				keyFields: ['id']
			},
			AllProducts: {
				keyFields: []
			},
			FilterValue: {
				merge(existing, incoming) {
					return incoming
				}
			},
			Filter: {
				fields: {
					values: {
						merge(existing, incoming) {
							return incoming
						}
					}
				}
			}
		}
	})
})

export default client
