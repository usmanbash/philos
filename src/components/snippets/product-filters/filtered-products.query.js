import { gql } from '@apollo/client/core';

export default gql`
  query FilteredProducts(
    $collectionHandle: String!
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $collectionHandle) {
      handle
      id

      products(first: 250, filters: $filters, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          id
          title
          handle
          availableForSale
          productType
          vendor
          createdAt
          publishedAt
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }

          availableFrom: metafield(namespace: "custom", key: "available_from") {
            value
            type
            key
            id
          }

          sizeGuide: metafield(namespace: "custom", key: "size_guide") {
            value
            reference {
              ... on Metaobject {
                id
                handle
                type
                fields {
                  key
                  value
                }
              }
            }
          }

          galleryModels: metafield(namespace: "custom", key: "gallery_models") {
            value
            references(first: 250) {
              edges {
                node {
                  ... on Metaobject {
                    id
                    handle
                    type
                    fields {
                      key
                      value
                    }
                  }
                }
              }
            }
          }

          measurementDisclaimer: metafield(namespace: "custom", key: "measurement_disclaimer") {
            value
            reference {
              ... on Metaobject {
                id
                handle
                type
                fields {
                  key
                  value
                }
              }
            }
          }

          productGallery: metafield(namespace: "custom", key: "color_variant_gallery") {
            value
            references(first: 250) {
              edges {
                node {
                  ... on Metaobject {
                    id
                    handle
                    type
                    fields {
                      key
                      value
                    }
                  }
                }
              }
            }
          }

          productColors: metafield(namespace: "shopify", key: "color-pattern") {
            value
            references(first: 250) {
              edges {
                node {
                  ... on Metaobject {
                    id
                    handle
                    type
                    fields {
                      key
                      value
                    }
                  }
                }
              }
            }
          }

          variants(first: 250) {
            nodes {
              id
              availableForSale
              currentlyNotInStock

              variantAvailableFrom: metafield(namespace: "custom", key: "variant_available_from") {
                value
                type
                key
                id
              }

              image {
                altText
                height
                id
                originalSrc
                src
                url
                width
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              quantityAvailable
              title
              weight
              sku
              requiresShipping
              weightUnit
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;
