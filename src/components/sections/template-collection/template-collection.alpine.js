import './template-collection.scss'
// import { isMobile, isLandscapeOrientation } from '../../common/isMobile';

export default (props = {}) => ({
  ...props,
  activeGrid: '',

  init() {
    this.initialGrid();
  },

  // Set the initial grid based on the device
  initialGrid() {
    this.setGridTwo()
    // if (isMobile) {
    //   isLandscapeOrientation() ? this.setGridTwo() : this.setGridOne();
    // } else {
    //   this.setGridTwo();
    // }
  },

  setGridOne() {
    this.activeGrid = 'gridOne';
  },

  setGridTwo() {
    // Set the active grid identifier
    this.activeGrid = 'gridTwo';
  },

  // Check if the grid is active
  isActive(gridName) {
    return this.activeGrid === gridName;
  },

  toggleFilters() {
    this.$store.filters.isOpen = !this.$store.filters.isOpen;
  },

  destroy() { },
});
