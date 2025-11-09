import './big-image-with-caption.scss'

export default (props = {}) => ({
  ...props,

  init() { },

  compUpdateFunc() {

    // fix: when in customizer, components animation is not working after changes (re-render)
    if (window?.Shopify?.designMode) {
      window?.LocoScroll?.removeScrollElements()
      this.$nextTick(() => {
        window?.LocoScroll?.addScrollElements(this.$el)
      })
    }

  },

  destroy() { }
})
