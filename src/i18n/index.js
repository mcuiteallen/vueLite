import Vue from 'vue'
import RMMGlobal from '@/util/RMMGlobal'
import VeeValidate from 'vee-validate'

// add translations directly to the application
Vue.i18n.add('en', require('./en.json'))
Vue.i18n.add('tw', require('./tw.json'))
Vue.i18n.add('cn', require('./cn.json'))

// set the start locale to use
var lang = (RMMGlobal.get().language) ? RMMGlobal.get().language : navigator.language
switch (lang) {
  case 'zh-TW':
    Vue.i18n.set('tw')
    document.querySelector('html').setAttribute('lang', 'zh-TW')
    VeeValidate.Validator.localize('tw')
    break
  case 'zh-CN':
    Vue.i18n.set('cn')
    document.querySelector('html').setAttribute('lang', 'zh-CN')
    VeeValidate.Validator.localize('cn')
    break
  default:
    Vue.i18n.set('en')
    document.querySelector('html').setAttribute('lang', 'en')
    VeeValidate.Validator.localize('en')
    break
}

// set fallback for non-translated strings
Vue.i18n.fallback('en')
