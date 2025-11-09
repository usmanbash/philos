import './facet-color.scss'
import lightOrDark from '../../common/lightOrDark'

export default (props = {}) => ({
	...props,

  colors: props.colors || {},
  colorsMap: {},

	init() {
    if (this.colors.length > 0) {
      this.colorsMap = this.createColorsMap(this.colors);
    }
  },

  // Convert the colors array into a map of label: color
  createColorsMap(colors) {
		return colors.reduce((map, item) => {
			map[item.label] = item.color;
			return map;
		}, {});
	},

	getColor(color) {
		return this.colorsMap[color] || '#ffffff'
	},

	getCheckboxColor(color) {
		return lightOrDark(this.getColor(color)) === 'dark' ? '#ffffff' : '#000000'
	},

  destroy() {
    this.colors = [];
    this.colorsMap = {};
  }
})
