import Toasted from 'vue-toasted'
import Vue from 'vue'

const toastOptions = {
  closeOnSwipe: true,
  position: 'bottom-center',
  className: 'vuestic-toast',
  iconPack: 'custom-class',
  duration: 2500
}

Vue.use(Toasted, toastOptions)

export default {
  methods: {
    showToast (msg, options) {
      this.$toasted.show(msg, options)
    }
  }
}
