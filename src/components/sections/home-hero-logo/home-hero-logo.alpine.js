import gsap from 'gsap';
import './home-hero-logo.scss';
import { isMobile } from '../../common/isMobile';

export default (props = {}) => ({
  ...props,

  tl: null,
  progress: 0,

  logoBounds: {},
  placeholderBounds: {},

  windowHeight: window.innerHeight,
  windowWidth: window.innerWidth,

  // Mobile logic
  disableAnimation: false,
  scrollListener: null,
  isScrollingStarted: false,

  init() {
    this.$store.app.logoFull = true;
    this.$store.app.transparentHeader = false;

    // Mobile logic
    if (isMobile) {
      this.$store.app.isLogoAnimated = false;
      this.disableAnimation = true;
      return;
    }

    // Desktop logic
    this.$store.app.isLogoAnimated = true;
    this.disableAnimation = false;

    this.initResizeObserver();

    // Watching menu open state
    this.$watch(() => this.$store.app.menuOpen, this.onMenuOpenChanged.bind(this));
  },

  onMenuOpenChanged(isOpen) {
    if (this.tl) {
      this.tl.progress(isOpen ? 1 : this.progress);
    }
  },

  destroy() {
    this.destroyLogoAnimation();

    this.$store.app.transparentHeader = false;
    this.$store.app.logoFull = false;
    this.$store.app.isLogoAnimated = false;

    window.removeEventListener('resize', this.onResize);
  },

  onResize() {
    if (this.disableAnimation) {
      return;
    }

    // Mobile logic
    if (isMobile) {
      this.$store.app.isLogoAnimated = false;
      this.disableAnimation = true;
    }

    const logoNav = document.querySelector('.logo-nav');
    this.logoBounds = logoNav.getBoundingClientRect();

    this.placeholderBounds = this.$refs.logoPlaceholder.getBoundingClientRect();
    this.placeholderBounds.y += window.LocoScroll?.lenisInstance.targetScroll || 0;

    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;
  },

  initResizeObserver() {
    this.$watch('logoBounds', this.initLogoAnimation.bind(this));

    this.$watch('windowHeight', this.initLogoAnimation.bind(this));
    this.$watch('windowWidth', this.initLogoAnimation.bind(this));

    window.addEventListener('resize', this.onResize.bind(this), false);
    this.$nextTick(this.onResize.bind(this));
  },

  destroyLogoAnimation() {
    window.removeEventListener('logoProgressEvent', this.controlProgressAnimation, false);

    if (!this.tl) {
      return;
    }

    this.tl.progress(0);
    this.tl.pause();

    this.tl.getChildren().forEach((tween) => {
      const targetElement = tween.targets();

      gsap.set(targetElement, { clearProps: 'all' });
    });

    this.tl.invalidate();
    this.tl.kill();
  },

  initLogoAnimation() {
    if (this.disableAnimation) return;
    if (!this.logoBounds) return;

    if (this.tl) {
      this.destroyLogoAnimation();
    }

    // const bottomSpace = 50
    // let scale = (this.windowHeight - bottomSpace) / this.logoBounds.height
    let scale = this.placeholderBounds.width / this.logoBounds.width;
    const y = this.placeholderBounds.y - this.logoBounds.y;
    const $logo = document.querySelector('.logo-nav--wrapper');

    this.tl = gsap.timeline({ paused: true });
    let tween = gsap.from($logo, {
      scale,
      y,
      force3D: false,
      transformOrigin: 'top',
      overwrite: true,
    });

    this.tl.add(tween, 0);

    window.addEventListener('logoProgressEvent', this.controlProgressAnimation.bind(this), false);

    this.tl.progress(this.progress);

    return this.tl;
  },

  controlProgressAnimation(e) {
    if (!this.tl || this.$store.app.menuOpen) return;

    this.$store.app.transparentHeader = e.detail.progress < 1;
    this.$store.app.logoFull = e.detail.progress < 1;

    this.progress = e.detail?.progress;
    this.tl.progress(this.progress);
  },
});
