import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import './i18n'

// VuesticPlugin
import VuesticPlugin from '@/vuestic-theme/vuestic-plugin'

// tooltip
import VTooltip from 'v-tooltip'

// icon
import SvgIcon from './components/component/SvgIcon'

// table
import { ClientTable } from 'vue-tables-2'

// toggle
import ToggleButton from 'vue-js-toggle-button'

// NOTE: workaround for VeeValidate + vuetable-2
import dataMixin from './components/component/dataMixin'

// tree
import LiquorTree from 'liquor-tree'

// 檢測
import runValidator from './validator/validatorExtend'



import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
Vue.component('Loading', Loading)
Vue.use(LiquorTree)
Vue.use(VuesticPlugin)
Vue.use(VTooltip)
VTooltip.options.disposeTimeout = 0
VTooltip.options.defaultHideOnTargetClick = true
VTooltip.enabled = window.innerWidth > 600
Vue.component('icon', SvgIcon)
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./assets/icons', true, /\.svg$/)
requireAll(req)
Vue.use(ClientTable)
Vue.use(ToggleButton)
Vue.mixin(dataMixin)
runValidator()

// event bus
var bus = new Vue()
Object.defineProperty(Vue.prototype, '$bus', {
  get () {
    return bus
  }
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
