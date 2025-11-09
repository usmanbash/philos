/**
 * Handles the in-viewport animation for elements.
 * @param {Event} event - The event object containing the target element, direction, and animation parameters.
 */
import gsap from 'gsap';
import _get from 'lodash/get';
import _merge from 'lodash/merge';
import _isEmpty from 'lodash/isEmpty';

// Animation presets for different types of animations
const animation_presets = {
  moveUp: {
    from: {
      y: '3rem',
    },
    to: {
      y: 0,
      ease: 'Power2.easeOut',
      duration: 1.4,
    },
  },

  fadeUp: {
    from: {
      opacity: 0,
      y: '3rem',
    },
    to: {
      opacity: 1,
      y: 0,
      duration: 0.8,
    },
  },

  fade: {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
      duration: 0.6,
    },
  },

  scaleDown: {
    from: {
      scale: 1.2,
    },
    to: {
      scale: 1,
      duration: 1.4,
      ease: 'Power3.easeOut',
    },
  },

  scaleDownFade: {
    from: {
      opacity: 0,
      scale: 1.2,
    },
    to: {
      opacity: 1,
      scale: 1,
      duration: 1.4,
      ease: 'Power3.easeOut',
    },
  },
};

const animateElements = (e) => {
  const { target, way, from } = e.detail;
  // console.log('inViewportAnimation', target, way, from);
  let animatedElements = target.querySelectorAll('[data-animate]');
  // console.log('inViewportAnimation', animatedElements)

  gsap.set(animatedElements, { opacity: 1 });

  if (from === 'end') return;

  animatedElements.forEach((el) => {
    try {
      const preset = _get(animation_presets, el.dataset.preset, {});
      const customFrom = el.dataset.from ? JSON.parse(el.dataset.from) : {};
      const customTo = el.dataset.to ? JSON.parse(el.dataset.to) : {};

      // Use Lodash's merge to create the final 'from' and 'to' objects
      const animationFrom = _merge({}, preset.from, customFrom);
      const animationTo = _merge({}, preset.to, customTo);

      // Check the existence of 'from' and 'to' data more succinctly
      if (way === 'enter') {
        // Clear any existing animations first
        gsap.killTweensOf(el);

        if (!_isEmpty(animationFrom) && !_isEmpty(animationTo)) {
          animationTo.overwrite = true;
          animationFrom.overwrite = true;
          gsap.fromTo(el, animationFrom, animationTo);
        } else if (!_isEmpty(animationFrom)) {
          animationFrom.overwrite = true;
          gsap.from(el, animationFrom);
        } else if (!_isEmpty(animationTo)) {
          animationTo.overwrite = true;
          gsap.to(el, animationTo);
        }
      } else {
        gsap.set(el, animationFrom);
      }
    } catch (e) {
      console.error('Error parsing JSON in animation attributes', e);
    }
  });
};

// Event listener for the 'inViewportAnimation' event
window.addEventListener('inViewportAnimation', animateElements);

export default animateElements;
