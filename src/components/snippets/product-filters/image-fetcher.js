import apolloClient from './../../common/apolloClient'
import { gql } from '@apollo/client/core'
import getOptionValue from '../../common/getOptionValue'

export default class ImageFetcher {
  constructor(filteredProducts) {
    this.filteredProducts = filteredProducts
    this.variantImages = new Map()
  }

  /**
   * Fetches the images for the variants.
   * @returns {Promise<void>} - A promise that resolves when the images are fetched.
   */
  async fetchImagesForVariants() {
    if (!this.filteredProducts || this.filteredProducts.length === 0) {
      console.warn('No products to process.')
      return
    }

    for (const product of this.filteredProducts) {
      const variants = product?.variants?.nodes || []
      // Extract product gallery data
      const productGallery = this.extractProductGalleryData(product)
      // Extract product colors
      const productColors = this.extractProductColors(product)

      for (const variant of variants) {
        // Get the color of the variant (the selected option)
        const variantColorOption = getOptionValue(variant, 'Color')

        // Fetch the image IDs that match the variant color with the gallery metaobjects' color labels
        const imageIDs = await this.filterProductImagesByColor(productGallery, variantColorOption, productColors)

        try {
          // Fetch the images for the variant
          const images = await this.fetchImages(imageIDs)
          // Store the images for the variant
          this.variantImages.set(variant.id, images)
        } catch (error) {
          console.error(`Error fetching images for variant ID: ${variant.id}:`, error)
          // Ensure images is always an array even on error
          this.variantImages.set(variant.id, [])
        }
      }
    }
  }

  /**
   * Extracts the product gallery data from the product.
   * @param {Object} product - The product to extract the gallery data from.
   * @returns {Array} - An array of gallery data.
   */
  extractProductGalleryData(product) {
    return product?.productGallery?.references?.edges?.map(({ node }) => {
      return node.fields.reduce((acc, field) => {
        acc[field.key] = field.value
        return acc
      }, {})
    }) || []
  }

  /**
   * Extracts the product color data from the productColors metafield.
   * @param {Object} product - The product to extract the color metaobjects from.
   * @returns {Array} - An array of product color metaobjects.
   */
  extractProductColors(product) {
    return product?.productColors?.references?.edges?.map(({ node }) => {
      return {
        id: node.id,
        fields: node.fields.reduce((acc, field) => {
          acc[field.key] = field.value
          return acc
        }, {})
      }
    }) || []
  }

  /**
   * Filters the product images by matching the variant color to the gallery metaobject's color.
   * @param {Array} gallery - The gallery data to filter.
   * @param {string} variantColorOption - The variant color to match.
   * @param {Array} productColors - The colors metaobjects extracted from the product.
   * @returns {Array} - An array of image IDs.
   */
  async filterProductImagesByColor(gallery, variantColorOption, productColors) {
    if (!gallery || gallery.length === 0) {
      return []
    }

    // Step 1: Create a map of color IDs to color labels from productColors
    const colorLabelMap = productColors.reduce((map, colorMetaobject) => {
      const colorLabel = colorMetaobject.fields.label // Label is the color name (e.g., 'Black', 'Red')
      const colorID = colorMetaobject.id // This is the GID from the color metaobject
      if (colorLabel && colorID) {
        map[colorID] = colorLabel // Map the ID to the label
      }
      return map
    }, {})

    // Step 2: Filter the gallery based on the matching color label for the variant
    const colorImages = gallery.filter(metaobject => {
      const colorGID = metaobject.color
      const fetchedColorLabel = colorLabelMap[colorGID]
      return fetchedColorLabel === variantColorOption // Check if the color label matches the variant color
    })

    // Step 3: Parse and return the product card images for the matching color metaobjects
    return colorImages.map(metaobject => {
      try {
        return JSON.parse(metaobject?.product_card_images || '[]')
      } catch (e) {
        console.error('Failed to parse product images:', e)
        return []
      }
    }).flat()
  }

  /**
   * Constructs a batch query for fetching images.
   * @param {Array} ids - The IDs of the images to fetch.
   * @returns {string} - The batch query.
   */
  constructBatchQuery(ids) {
    /**
      * Solution 1: Using the node function to fetch images
      * Constructs a GraphQL query dynamically by appending image fields
      * for each provided ID. Each image is accessed via a node query with
      * a unique alias ("image0", "image1", etc.), allowing multiple
      * images to be fetched in a single request.
    */
    // let query = 'query {';
    // ids.forEach((id, index) => {
    //   query += `
    //     image${index}: node(id: "${id}") {
    //       ... on MediaImage {
    //         id
    //         image {
    //           altText
    //           height
    //           id
    //           originalSrc
    //           src
    //           url
    //           width
    //         }
    //       }
    //     }
    //   `;
    // });
    // query += '}';

    /**
      * Solution 2: Using the nodes function to fetch images
      * Constructs a GraphQL query to fetch multiple images using their IDs.
      * The query uses the `nodes` function of GraphQL, which is designed to
      * fetch multiple nodes by IDs. * This simplifies the query structure
      * and avoids the need for aliases.
    */
    const formattedIds = ids?.map(id => `"${id}"`).join(', ')

    const query = `
      {
        nodes(ids: [${formattedIds}]) {
          ... on MediaImage {
            id
            image {
              altText
              height
              id
              originalSrc
              src
              url
              width
            }
          }
        }
      }
    `
    return query
  }

  /**
   * Fetches the images for the specified image IDs.
   * @param {Array} imageIds - The IDs of the images to fetch.
   * @returns {Array} - An array of images.
   */
  async fetchImages(imageIds) {
    const query = this.constructBatchQuery(imageIds)
    try {
      const { data } = await apolloClient.query({ query: gql`${query}` })
      return Object.values(data?.nodes).map(item => item?.image)
    } catch (error) {
      console.error('Error fetching images:', error)
      return []
    }
  }
}
