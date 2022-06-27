import Vue from 'vue'
import Vuex from 'vuex'
import VuexI18n from 'vuex-i18n' // load vuex i18n module

import app from './modules/app'

import * as getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true, // process.env.NODE_ENV !== 'production',
  getters,
  modules: {
    app
  },
  state: {
    Loading: false,
    sessionid: '',
    showAddDevice: false,
    EventCounts: 0,
    breadListState: [{ name: 'Home', path: 'Home' }],
    PURPOSE: 'PRODUCTION', // 'DEMO'
  },
  mutations: {
    setLoading (state, value) {
      state.Loading = value
    },
    SET_SESSION_ID (state, value) {
      state.sessionid = value
    },
    SET_SHOW_ADD_DEVICE (state, value) {
      state.showAddDevice = value
    },
    SET_EVENT_COUNTS (state, value) {
      state.EventCounts = value
    },
    breadListStateAdd (state, obj) {
      state.breadListState.push(obj)
    },
    breadListStateRemove (state, num) {
      state.breadListState = state.breadListState.slice(0, num)
    },
    UPDATE_ACCOUNT (state, value) {
      state.EventAccount = value
    }
  }
})

Vue.use(VuexI18n.plugin, store)

export default store
