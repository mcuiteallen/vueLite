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
        class="cust-iframe"
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
      url: 'https://support.advantech.com/support/SearchResult.aspx?keyword=DeviceOn%2fiEdge&searchtabs=BIOS,Certificate,Datasheet,Documentation,Driver,Firmware,Manual,Online%20Training,Software%20Utility,Utility,FAQ,Installation,Software%20API,Software%20API%20Manual,3D%20Model,Quick%20Start%20Guide,Reference,eCatalog,Video,Webcast,Whitepaper,SDK,OS&select_tab=Utility',
      //url: 'https://www.advantech.com/search/?q=DeviceOn%2FiEdge&st=product&sst=Products',
    }
  },
  mounted () {
    self = this
    //this.url = ''
    //self.getSystemData()

    // 滾動頁面
    window.addEventListener('scroll', self.htmlScroll)
  },
  watch: {
  },
  computed: {
  },
  methods: {
    getSystemData () {
      DeviceOnApis.ui.get
        .system()
        .then(function (xhr) {
            debugger
          self.isLoading = false
          if (xhr && xhr.data && xhr.data.menus) {
            self.config = xhr.data
            self.url = xhr.data.iEdgeDownload
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
    .cust-iframe {
      width: 100%; 
      height: 100vh;
    }
  }
</style>
