<template>
  <div class="Dashboards">
    <!--<loading :active.sync="isLoading" :can-cancel="true" :is-full-page="fullPage"></loading>-->
    <!-- 外連結 -->
    <div>
      <iframe
        ref="subframe2"
        frameborder="0"
        :src="url"
        @load="iFrameLoad()"
        class="box-iframe"
        title="iFrame"
      ><a>{{'deviceon.message.informations.onlyAllowNewWindow' | translate}}</a></iframe>
    </div>
  </div>
</template>

<script>
import RMMGlobal from '@/util/RMMGlobal'
import DeviceOnApis from '@/util/DeviceOnApis'

let self = {}

function evil (fn) {
  var Fn = Function // 一个变量指向Function，防止有些前端编译工具报错
  return new Fn('return ' + fn)()
}

export default {
  name: 'Dashboards',
  components: {
  },
  data () {
    return {
      isLoading: true,
      fullPage: true,
      oRMM: RMMGlobal.get(),
      url: '',
    }
  },
  mounted () {
    self = this
    this.url = ''
    self.getUserManualJson()

    // 滾動頁面
    window.addEventListener('scroll', self.htmlScroll)
  },
  watch: {
  },
  computed: {
  },
  methods: {
    getUserManualJson () {
      DeviceOnApis.file.get
        .localFile('/static/userManual/manual.json')
        .then(function (xhr) {
          self.isLoading = false
          if (xhr.data) {
            if (xhr.data.manual && xhr.data.manual.length > 0) {
              self.url = xhr.data.manual[0].path
            }
          }
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    iFrameLoad () {
      self.isLoading = false
    },      
  },
  destroyed () {
    window.removeEventListener('scroll', self.htmlScroll)
  }
}
</script>
<style lang="scss">
  .Dashboards{
    .title-category.d-flex{
      margin-top: 60px;
      align-items: center;
    }
    .div-editDashboard {
      button {
        margin-left: -2.5rem;
      }
    }
  }
</style>
