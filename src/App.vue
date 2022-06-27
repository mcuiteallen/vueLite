<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'App',
  computed: {},
  components: {
  },
  data () {
    return {
    }
  },
  mounted () {
    window.addEventListener('message', this.eventCallBack)
  },
  watch: {
  },
  methods: {
    eventCallBack (e) {
      let cmd = e.data
      switch (cmd.type) {
        case 'language':
          Vue.i18n.set(cmd.value)
          break
        case 'changeThemeColor':
          document.querySelector('body').className = ''
          document.querySelector('body').classList.add(cmd.theme)
          break
      }
    },
  },
  beforeDestroy () {}
}
</script>

<style lang="scss">
  @import "sass/main";
</style>
