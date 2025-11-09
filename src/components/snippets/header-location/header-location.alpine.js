import './header-location.scss'

import axios from 'axios'
/**
 * Luxon is a successor of Moment.js
 * @see https://moment.github.io/luxon/index.html#/?id=luxon
 * @see https://moment.github.io/luxon/api-docs/index.html
 * @see https://moment.github.io/luxon/api-docs/index.html#datetimetolocalestring
 */
import { DateTime } from 'luxon'

// export component (Alpine.data)
// @see https://alpinejs.dev/directives/data
export default (props = {}) => ({
	...props,
	location: 'Amsterdam', // current location
	time: '', // current time
	temperature: '', // current temperature
	errorMessage: '',

	async fetchWeatherData() {
		try {
      /**
       *
       * @TODO move this to a .env file
       */
			const WEATHER_KEY = '2a9c0b8fa4c278730d04b930fb02a75a'
      // Amsterdam lat and lon - @see https://mapsofworld.com/lat_long/amsterdam.html
      const lat = 52.37022
      const lon = 4.89517

			const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`

			const { data } = await axios.get(url)

			// this.location = data.name
			this.temperature = `${Math.round(data.main.temp)}°`
			this.updateTime()
		} catch (error) {
			console.error('Error fetching weather data:', error)
			this.errorMessage = 'Unable to retrieve weather data'
		}
	},

	// getCurrentLocation() {
	// 	if ('geolocation' in navigator) {
	// 		navigator.geolocation.getCurrentPosition(
	// 			async position => {
	// 				console.log('POSITION:', position.coords)

	// 				await this.fetchWeatherData(position.coords.latitude, position.coords.longitude)
	// 			},
	// 			error => {
	// 				console.error('Geolocation error:', error)
	// 				this.errorMessage = 'Unable to retrieve your location'
	// 			}
	// 		)
	// 	} else {
	// 		console.log('Geolocation is not supported by this browser.')
	// 		this.errorMessage = 'Geolocation is not supported by this browser.'
	// 	}
	// },

	updateTime() {
    this.time = DateTime.local({ zone: 'Europe/Amsterdam' }).toLocaleString(DateTime.TIME_SIMPLE)
    // this.time = DateTime.now().setZone('Europe/Amsterdam').toLocaleString(DateTime.TIME_SIMPLE)
		// this.time = DateTime.local().toLocaleString(DateTime.TIME_SIMPLE)
	},

	init() {
		// Fetch the weather data
    this.fetchWeatherData()
		// this.getCurrentLocation()

		// Set an interval to update the time every minute
		setInterval(() => {
			this.updateTime()
		}, 60000)
	},

	destroy() {}
})
