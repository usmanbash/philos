import './header.scss';

const MENU_DELAY_MS = 100;

export default () => ({
  timeOut: null,

  init() {
    this.$watch(() => this.$store.app.menuOpen, this.onMenuOpenChanged.bind(this));
  },

  destroy() {
    clearTimeout(this.timeOut);
  },

  get menuOpen() {
    return this.isMenuOpen();
  },

  setMenu(id) {
    this.$store.app.menuOpen = id;
  },

  isMenuOpen(id) {
    const current = this.$store.app.menuOpen;
    return id === undefined ? !!current : current === id;
  },

  toggleMenu(id) {
    this.setMenu(this.isMenuOpen(id) ? false : id);
  },

  openMenu(id) {
    clearTimeout(this.timeOut);
    if (this.isMenuOpen(id)) return;
    this.openTo = setTimeout(() => this.setMenu(id), MENU_DELAY_MS);
  },

  closeMenu() {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => this.setMenu(false), MENU_DELAY_MS);
  },

  onMenuOpenChanged(value) {
    if (!value) {
      this.$dispatch('accordion-set-active', { id: false, group: 'mobile-menu' });
    }
  },

  toggleCart() {
    this.$dispatch('toggle-cart');
  },
});
