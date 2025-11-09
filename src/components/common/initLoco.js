import LocomotiveScroll from 'locomotive-scroll'
import { isMobile } from './isMobile'

const updateLocoScroll = () => {
  window.LocoScroll && window.LocoScroll.update()
}

const destroyLocoScroll = () => {
  if (window.LocoScroll) {
    window.LocoScroll.destroy()
    document.removeEventListener('shopify:section:load', updateLocoScroll)
  }
}

export default (
  options = {
    wrapper: isMobile ? window : document.querySelector('#MainContent'),
    content: isMobile
      ? document.documentElement
      : document.querySelector('.lenis-scroller'),
    lerp: 0.1,
    duration: 1.2,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    normalizeWheel: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  }
) => {
  if (isMobile) {
    document.documentElement.classList.add('is-mobile')
  }

  destroyLocoScroll()

  // initialize new LocoScroll instance
  window.LocoScroll = new LocomotiveScroll({
    lenisOptions: options,
  })

  document.addEventListener('shopify:section:load', updateLocoScroll)

  return window.LocoScroll
}
