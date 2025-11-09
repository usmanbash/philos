import './theme.scss';
import Alpine from 'alpinejs';

window.Alpine = Alpine;

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}

// register all alpine components
import '../alpine-components.js';

// import alpine stores
import './../../stores/app.store';
import './../../stores/sizeGuide.store';
import './../../stores/filters.store';
import './../../stores/backInStock.store';

Alpine.start();
console.log('alpine.js started');

// In Viewport Animations
import './../common/inViewportAnimation.js';

// Locomotive Scroll
import initLoco from './../common/initLoco.js';
initLoco();

// ----------------------------------------------------------------------------
// SWUP

// import Swup from 'swup'

// initialize swup
// window.swup = new Swup({
//   containers: ['#header', '#MainContent'],
//   // plugins: [],
//   linkSelector: 'a:not(.no-swup)',
//   // cache: false,
// })

// example of swup hooks
// @see https://swup.js.org/hooks/
// window.swup.hooks.on('page:view', () => {
//   initLoco()
// })

// window.swup.hooks.on(
//   'content:replace',
//   () => {
//     // console.log('content:replace before')
//     Alpine.store('app').transparentHeader = false
//   },
//   { before: true }
// )

// ----------------------------------------------------------------------------
