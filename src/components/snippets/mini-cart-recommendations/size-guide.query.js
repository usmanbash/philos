import { gql } from '@apollo/client/core';

export const GET_ALL_PRODUCTS_WITH_SIZE_GUIDE = gql`
  query GetAllProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          options {
            name
            values
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
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
                quantityAvailable
              }
            }
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
            references(first: 10) {
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
        }
      }
    }
  }
`;
