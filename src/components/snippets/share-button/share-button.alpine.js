import './share-button.scss'

// export component (Alpine.data)
// @see https://alpinejs.dev/directives/data

/**
 * Share button component
 * Description: Share button with social media sharing options.
 * It uses the Web Share API if available, otherwise it falls back to the default sharing options.
 * Default sharing options include Facebook, Twitter, Pinterest, and copying the link to the clipboard.
 *
 * @param {Object} props
 * @param {Boolean} props.detailsOpen
 * @param {String} props.successMessage
 * @param {String} props.urlToShare
 * @param {Boolean} props.canShare
 *
 * @returns {Object}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator
 *
 */
export default (props = {}) => ({
  ...props,
  detailsOpen: false,
  successMessage: '',
  urlToShare: document.location.href,
  canShare: navigator.share ? true : false,
  timeoutId: null,

  init() {},

  destroy() {},

  toggleDetails() {
    this.detailsOpen = !this.detailsOpen
    this.successMessage = ''
  },

  share() {
    if (this.canShare) {
      navigator
        .share({
          url: this.urlToShare,
          title: document.title
        })
        .catch(error => {
          console.error('Error sharing:', error)
          console.error('Sharing is not supported or was cancelled.')
        })
    } else {
      console.warn('Web Share API is not supported in this browser.')
    }
  },

  shareOnFacebook() {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      this.urlToShare
    )}`
    window.open(facebookShareUrl, '_blank')
  },

  shareOnTwitter(title = '') {
    const tweetText = encodeURIComponent(title)
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(
      this.urlToShare
    )}`
    window.open(twitterShareUrl, '_blank')
  },

  shareOnPinterest(title = '', imageUrl = '') {
    const description = encodeURIComponent(title)
    // URL to the image to pin
    const media = encodeURIComponent(imageUrl)
    const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
      this.urlToShare
    )}&media=${media}&description=${description}`
    window.open(pinterestShareUrl, '_blank')
  },

  // @todo check this url
  shareOnLinkedIn() {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      this.urlToShare
    )}`
    window.open(linkedInShareUrl, '_blank')
  },

  copyToClipboard() {
    navigator.clipboard.writeText(this.urlToShare).then(() => {
      this.successMessage = 'Link copied to clipboard.'
    })

    this.clearSuccessMessage();
  },

  clearSuccessMessage() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  },

  close() {
    this.detailsOpen = false
    this.successMessage = ''
  },

  updateUrl(url) {
    this.urlToShare = url
  }
})
