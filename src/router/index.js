import Vue from 'vue'
import Router from 'vue-router'
import lazyLoading from './lazyLoading'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: lazyLoading('main')
    },
    {
      path: '/iEdgeDownload',
      name: 'iEdgeDownload',
      component: lazyLoading('setting/iEdgeDownload')
    },
    {
      path: '/eisPluginConfig',
      name: 'eisPluginConfig',
      component: lazyLoading('eisPlugin/eisPluginConfig')
    },
    {
      path: '/UserManual',
      name: 'UserManual',
      component: lazyLoading('UserManual/UserManual'),
    },
  ]
})
