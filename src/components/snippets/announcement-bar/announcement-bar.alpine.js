// import component styles
import './announcement-bar.scss'
import gsap from 'gsap'

export default (props = {}) => ({
  ...props,
  currentAnnouncement: '',  // Tracks the current text being displayed
  textOne: '',  // First announcement text
  textTwo: '',  // Second announcement text
  announcements: [],  // Array of announcement texts
  announcementIndex: 0,  // Tracks which text is currently active
  interval: null,  // Interval for rotating text

  // Initialize the component
  init() {
    this.textOne = props.textOne || ''  // Set the first text from the props
    this.textTwo = props.textTwo || ''  // Set the second text from the props

    this.initializeAnnouncements()  // Initialize the announcements
    this.rotateAnnouncement()               // Start the text rotation after first message
  },

  initializeAnnouncements() {
    if (!this.textOne && !this.textTwo) {
      console.warn('Announcement Bar: No announcement content provided.')
      return
    }

    // Add announcements based on availability
    if (this.textOne) this.announcements.push(this.textOne)
    if (this.textTwo) this.announcements.push(this.textTwo)

    // Set the initial text
    this.currentAnnouncement = this.announcements[this.announcementIndex]
    this.$refs.announcementText.innerText = this.currentAnnouncement
  },

  // Rotate text every 5 seconds
  rotateAnnouncement() {
    if (this.interval) {
      clearInterval(this.interval)
    }

    if (this.announcements.length < 2) {
      return
    }

    // Start interval after the initial message is shown
    this.interval = setInterval(() => {
      this.announcementIndex = (this.announcementIndex + 1) % this.announcements.length
      this.currentAnnouncement = this.announcements[this.announcementIndex]

      // Animate the text rotation from bottom to top
      gsap.fromTo(
        this.$refs.announcementText,
        {
          opacity: 0,
          y: 20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'Power2.easeOut',
          onStart: () => (this.$refs.announcementText.innerText = this.currentAnnouncement)
        }
      )
    }, 5000)
  },

  destroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
})
