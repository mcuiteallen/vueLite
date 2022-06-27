<template>
  <div class="DeviceData">
    <div class="box-fix">
      <div class="title-category cursor-pointer" @click="showFilter">{{'deviceon.menu.device.devicedata' | translate}}</div>
      <div class="box-content box-no-bottom">
        <!-- 過濾資料 -->
        <vuestic-widget
          class="widget-customized__widget info-widget no-v-padding no-header"
          :headerText="' '"
          :IconFilter="true">
          <span slot="ModalOpen" @click="showFilter" class="btn-showModal" :class="{isActive:!hideFilter}"></span>
          <div class="row vuestic-widget-body-inner" v-show="!hideFilter">
            <div class="col-md-3">
              <div class="item-list">
                <div class="item-title">{{'deviceon.device.wizard.selectAccount' | translate}}</div>
                <vuestic-simple-select
                  v-model="selectedAccount"
                  option-key="mail"
                  option-value="name"
                  :options="accountOptions"
                  :unselect-disabled="true"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                  v-tooltip.top-center="{ content: selectedAccount.mail, trigger: 'hover', offset: 8}"
                  :showdropdownstatus="true"
                  :dropStatus='accountDropStatus'
                  :limitclass="'device-data-dropdown'"
                  :haskeyword="haskeywordAccount"
                  @showdropdown="showdropdown('account')"
                  @filterSelection="serchTxt('account', $event)"
                  @scroll-to-bottom="ScrollToBottom('account')"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="item-list">
                <div class="item-title">{{'deviceon.device.wizard.selectGroup' | translate}}</div>
                <vuestic-simple-select
                  class="select-group-html"
                  v-model="selectedGroup"
                  option-key="name"
                  :options="groupOptions"
                  :unselect-disabled="true"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                  :showchildgroup="true"
                  @showdropdown="groupDropStatus('open')"
                  @closedropdown="groupDropStatus('close')"
                  :groupmodeneedaid="selectedAccount.aid"
                  :htmlmode="true"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="item-list">
                <div class="item-title">{{'deviceon.device.wizard.selectDevice' | translate}}</div>
                <vuestic-simple-select
                  v-model="selectedDevice"
                  option-value="name"
                  option-key="agentid"
                  :options="deviceOptions"
                  :unselect-disabled="true"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                  :showdropdownstatus="true"
                  :dropStatus='dropStatus'
                  :limitclass="'device-data-dropdown'"
                  :class="{'disable': totalDevices === 0}"
                  :haskeyword="haskeyword"
                  :placeholder="deviceOptions.length === 0 ? $t('deviceon.appStore.message.noDevie') : ''"
                  @showdropdown="showdropdown('device')"
                  @filterSelection="serchTxt('device', $event)"
                  @scroll-to-bottom="ScrollToBottom('device')"
                />
              </div>
            </div>
            <div class="col-md-3">
              <div class="item-list">
                <div class="item-title">{{'deviceon.device.advanced.plugin' | translate}}</div>
                <vuestic-simple-select
                  v-model="selectedPlugin"
                  option-key="aliasName"
                  v-bind:options="plugins"
                  :unselect-disabled="true"
                />
              </div>
            </div>
          </div>
        </vuestic-widget>
      </div>
    </div>

    <!-- 彈跳popup_Historical Data-->
    <vuestic-modal
      ref="selfWebModal"
      show.sync="true"
      :largeXL="true"
      :noButtons="true"
      :otherIcon="true"
      @close="clear()"
      @cancel="clear()"
    >
      <div class="modal-content-inner pt-3 pb-3">
        <loading :active.sync="isLoading" :can-cancel="false" :is-full-page="fullPage"></loading>
        <div class="row" v-if="selfWeb">
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
    </vuestic-modal>


  </div>
</template>

<script>
import Vue from 'vue'
import DeviceOnApis from '@/util/DeviceOnApis'
import RMMGlobal from '@/util/RMMGlobal'
import { mapState } from 'vuex'
import moment from 'moment'

let self = {}

export default {
  name: 'DeviceData',
  components: {
  },
  data () {
    return {
      isLoading: false,
      fullPage: false,
      oRMM: RMMGlobal.get(),
      selectedAccount: '',
      accountOptions: [],
      selectedGroup: '',
      groupOptions: [],
      selectedDevice: '',
      deviceOptions: [],
      skipReloadAgent: false,
      aid: 0,
      gid: 0,
      did: 0,
      agentid: '',

      showPanel: true,
      showChart: false,
      hideFilter: true,
      tableMode: true,
      setMode: false,

      showType: 'lost_connection', // 'lost_connection' or 'no_device',

      pluginData: '',

      plugins: [],
      selectedPlugin: '',
      stillPlugin: '',

      show: false,

      historicalOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false,
            type: 'cross'
          },
          padding: [5, 10]
        },
        toolbox: {
          right: 15,
          itemSize: 15,
          top: 50,
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              title: {
                zoom: 'Zoom',
                back: 'Back'
              },
              iconStyle: {
                borderColor: 'transparent',
                borderWidth: 2,
                emphasis: {
                  borderColor: 'transparent',
                  borderWidth: 2
                }
              }
            }
          }
        },
        grid: {
          left: 40,
          right: 40,
          bottom: 40,
          top: 60,
          containLabel: true
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false
          },
          axisLabel: {
            formatter: function (value) {
              return moment(value).format('HH:mm:ss')
            }
          },
          axisLine: {
            lineStyle: {
              color: '#333333'
            }
          },
          name: '',
          nameLocation: 'middle',
          nameGap: 40
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#333333'
            }
          },
          name: '',
          nameLocation: 'middle',
          nameGap: 40
        },
        legend: {
          data: [],
          icon: 'circle',
          top: 10,
          textStyle: {
            color: '#333333',
            borderRadius: 20,
            borderColor: '#333333',
            borderWidth: 1,
            padding: [10, 10, 8, 10],
          }
        },
        series: []
      },
      COLOR: '#92308D',

      // 計算點擊table tr第幾個
      clickTableIndex: '',
      // 搜尋控制
      serchShow: false,
      // 控制table顯示數量
      showtableLimtiNum: 10,
      currentPage: 1,

      // 撈下拉選單資料
      dropNo: 1,
      totalDevices: 0,
      // onloading   finish  nodata
      dropStatus: '',
      isopendropdown: 'close',

      resizeTimer: 0,

      keyword: '', // string
      keywordText: '', // string
      keywordTimer: 0,
      haskeyword: '',

      // Account dropdown
      accountDropNo: 1,
      countAccount: 0,
      totalAccount: 0,
      keywordAccountTimer: 0,
      accountDropStatus: '',
      haskeywordAccount: '',
      searchAccountTxt: '',
      url: '',
      selfWeb: false,
      devLocation: 'http://172.22.12.118:8080',      
    }
  },
  mounted () {
    self = this
    if (window.innerWidth >= 1200) {
      self.hideFilter = false
      self.showtableLimtiNum = 10
    } else {
      self.showtableLimtiNum = 6
    }
    self.init(self.oRMM.Login.aid)
    // Events
    window.addEventListener('message', this.eventHandler)
    // 滾動頁面
    window.addEventListener('scroll', self.htmlScroll)
    // 縮拉視窗寬度
    window.addEventListener('resize', self.resizeWindowHandler)

  },
  methods: {
    init (aid) {
      self.getAccounts(aid)
      if (self.$refs.clientTable !== undefined) {
        self.$refs.clientTable.setLimit(self.showtableLimtiNum)
      }
    },
    getSelfWeb (pluginName) {
      self.isLoading = true
      DeviceOnApis.devicectrl.get
        .selfWeb(self.agentid, pluginName)
        .then(function (xhr) {
          let tmpData = xhr.data
          let localUrl = window.location.origin
          if (process.env.NODE_ENV === 'development') {
            self.url = self.devLocation + tmpData.url
          } else {
            self.url = localUrl + tmpData.url
          }
          self.selfWeb = true
          self.isLoading = false
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },    
    iFrameLoad () {
      self.isLoading = false
    },   
    openModal () {
      self.$refs.selfWebModal.open()
    },
    cancelModal () {
      self.selfWeb = false
      self.$refs.selfWebModal.close()
    },       
    eventHandler (e) {
      let cmd = e.data
      let bRefresh = false
      let bCurrentAgent = false
      if (cmd.type === 'EVents') {
        for (let i = 0; i < cmd.value.length; i++) {
          if (
            cmd.value[i].subtype.toLowerCase().indexOf('device_connected') >
              -1 ||
            cmd.value[i].subtype.toLowerCase().indexOf('device_disconnected') >
              -1
          ) {
            bRefresh = true
            // if current agent , reload it
            if (this.agentid === cmd.value[i].agent_id) {
              bCurrentAgent = true
            }
          }
        }
        if (bRefresh) {
          this.skipReloadAgent = !bCurrentAgent
          this.resetGetDevice()
        }
      } else if (cmd.type === 'language') {
        this.groupOptions.splice(0, 1, {
          aid: this.selectedAccount.aid,
          description: '--- All ---',
          gid: 0,
          name: self.$t('deviceon.group.all')
        })
        this.selectedGroup = this.groupOptions.find(e => e.gid === this.selectedGroup.gid)
        this.getPluginList(this.selectedDevice.did, this.selectedDevice.agentid)
      }
    },
    getAccounts (aid) {
      this.showPanel = true
      this.showChart = false
      let oData = {
        pageSize: 10,
        no: this.accountDropNo,
        orderBy: 'rid',
        orderType: 'asc',
        like: this.searchAccountTxt ? this.searchAccountTxt : ''
      }
      DeviceOnApis.accounts.get
        .accounts(oData)
        .then(function (xhr) {
          if (xhr && xhr.data && xhr.data.accounts) {
            let data = self.sortAccounts(self.accountOptions.concat(xhr.data.accounts), aid)
            self.accountOptions = data.accountOptions
            if (!self.selectedAccount) self.selectedAccount = data.selectedAccount

            self.countAccount += xhr.data.accounts.length
            self.totalAccount = xhr.data.total_acc_cond
          }
          self.accountDropStatus = 'finish'
        })
        .catch(function (error) {
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    getDeviceGroups (aid) {
      this.isLoading = true
      this.showPanel = true
      this.showChart = false
      self.groupOptions = []
      self.selectedGroup = ''
      self.deviceOptions = []
      self.selectedDevice = ''

      DeviceOnApis.accounts.get
        .deviceGroups(aid)
        .then(function (xhr) {
          let data = self.sortGroups(xhr, aid, self.gid, false)
          
          if (data) {
            self.groupOptions = data.groupOptions
            self.selectedGroup = data.selectedGroup
          }
          if (self.groupOptions.length === 0) {
            self.showPanel = false
            self.showType = 'no_device'
          }
          self.isLoading = false
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    getDevices (gid, data, ignoreSelected) {
      if (gid === 0) {
        // this.isLoading = true
        DeviceOnApis.devicegroups.get
          .devicesAll(data)
          .then(function (xhr) {
            if (xhr && xhr.data && xhr.data.devices) {
              self.deviceOptions = []
              let devices = xhr.data.devices

              devices.forEach(function (d, i) {
                let iconColor
                if (d.connected) {
                  if (d.normal) {
                    iconColor = 'rgb(117,181,51)'
                  } else {
                    iconColor = 'rgb(253,147,87)'
                  }
                } else {
                  iconColor = 'rgb(153,153,153)'
                }
                self.deviceOptions.push({
                  did: d.did,
                  name: d.name,
                  agentid: d.agentid,
                  connected: d.connected,
                  showIcon: true,
                  iconClass: 'fa fa-circle fa-lg',
                  iconColor: iconColor,
                  autoreport: d.autoreport,
                  interval: d.interval
                })
              })
              self.deviceOptions.sort(function (a, b) {
                let statusA = 0
                let statusB = 0
                if (a.connected) {
                  if (a.normal) {
                    statusA = 2
                  } else {
                    statusA = 1
                  }
                }
                if (b.connected) {
                  if (b.normal) {
                    statusB = 2
                  } else {
                    statusB = 1
                  }
                }
                if (statusA < statusB) return 1
                else if (statusA > statusB) return -1
                else {
                  if (a.name < b.name) return -1
                  else if (a.name > b.name) return 1
                  else return 0
                }
              })

              self.totalDevices = xhr.data.total
              if (!ignoreSelected) {
                if (self.deviceOptions.length > 0) {
                  if (self.did) {
                    let aDevice = self.deviceOptions.filter(function (g, i) {
                      return g.did === Number(self.did)
                    })
                    if (aDevice.length === 0 && self.deviceOptions.length > 0) {
                      // self.selectedDevice = self.deviceOptions[0]
                      for (let i = 0; i < self.deviceOptions.length; i++) {
                        if (self.did === self.deviceOptions[i].did) {
                          self.selectedDevice = self.deviceOptions[i]
                        }
                      }
                      if (!self.selectedDevice) {
                        self.selectedDevice = self.deviceOptions[0]
                      }
                    } else {
                      self.selectedDevice = aDevice[0]
                    }
                  } else {
                    self.selectedDevice = self.deviceOptions[0]
                  }
                  self.dropStatus = 'finish'
                } else {
                  self.deviceOptions = []
                  self.selectedDevice = ''
                  self.showPanel = false
                  self.showType = 'no_device'
                  self.dropStatus = 'nodata'
                }
              }
            }
            self.isLoading = false
          })
          .catch(function (error) {
            self.isLoading = false
            DeviceOnApis.MessageBox.Error(self, error)
          })
      } else {
        // this.isLoading = true
        DeviceOnApis.devicegroups.get
          .devices(gid, data)
          .then(function (xhr) {
            if (
              xhr &&
              xhr.data &&
              xhr.data.groups &&
              xhr.data.groups[0] &&
              xhr.data.groups[0] &&
              xhr.data.groups[0].devices
            ) {
              self.deviceOptions = []
              let devices = xhr.data.groups[0].devices

              devices.forEach(function (d, i) {
                let iconColor
                if (d.connected) {
                  if (d.normal) {
                    iconColor = 'rgb(117,181,51)'
                  } else {
                    iconColor = 'rgb(253,147,87)'
                  }
                } else {
                  iconColor = 'rgb(153,153,153)'
                }
                self.deviceOptions.push({
                  did: d.did,
                  name: d.name,
                  agentid: d.agentid,
                  connected: d.connected,
                  showIcon: true,
                  iconClass: 'fa fa-circle fa-lg',
                  iconColor: iconColor,
                  autoreport: d.autoreport,
                  interval: d.interval
                })
              })
              self.deviceOptions.sort(function (a, b) {
                let statusA = 0
                let statusB = 0
                if (a.connected) {
                  if (a.normal) {
                    statusA = 2
                  } else {
                    statusA = 1
                  }
                }
                if (b.connected) {
                  if (b.normal) {
                    statusB = 2
                  } else {
                    statusB = 1
                  }
                }
                if (statusA < statusB) return 1
                else if (statusA > statusB) return -1
                else {
                  if (a.name < b.name) return -1
                  else if (a.name > b.name) return 1
                  else return 0
                }
              })

              self.totalDevices = xhr.data.groups[0].total_acc_cond
              if (!ignoreSelected) {
                if (self.deviceOptions.length > 0) {
                  self.dropStatus = 'finish'
                  if (self.did) {
                    let aDevice = self.deviceOptions.filter(function (g, i) {
                      return g.did === Number(self.did)
                    })
                    if (aDevice.length === 0 && self.deviceOptions.length > 0) {
                      // self.selectedDevice = self.deviceOptions[0]
                      for (let i = 0; i < self.deviceOptions.length; i++) {
                        if (self.did === self.deviceOptions[i].did) {
                          self.selectedDevice = self.deviceOptions[i]
                          self.isLoading = false
                          return false
                        } else {
                          self.selectedDevice = self.deviceOptions[0]
                        }
                      }
                    } else {
                      self.selectedDevice = aDevice[0]
                    }
                  } else {
                    self.selectedDevice = self.deviceOptions[0]
                  }
                } else {
                  self.deviceOptions = []
                  self.selectedDevice = ''
                  self.showPanel = false
                  self.showType = 'no_device'
                  self.dropStatus = 'nodata'
                }
              }
            }
            self.isLoading = false
          })
          .catch(function (error) {
            self.isLoading = false
            DeviceOnApis.MessageBox.Error(self, error)
          })
      }
    },
    getDevicePlugins (did, agentid) {
      this.isLoading = true
      // this.selectedPlugin = ''
      DeviceOnApis.data.get
        .capability(agentid)
        .then(function (xhr) {
          if (xhr && xhr.data) {
            self.capability = xhr.data
            DeviceOnApis.devices.get
              .devicePlugins(did, true)
              .then(function (xhr) {
                if (xhr && xhr.data && xhr.data.Plugins) {
                  let plugins = xhr.data.Plugins
                  self.plugins = []
                  for (let i = 0; i < plugins.length; i++) {
                    if (plugins[i].analysis) {
                      self.plugins.push(plugins[i])
                    }
                  }
                  if (self.plugins.length > 0) {
                    if (self.stillPlugin === '') {
                      self.selectedPlugin = self.plugins[0]
                    } else {
                      self.selectedPlugin = self.plugins.filter((plugin) => {
                        return plugin.plugin === self.stillPlugin.plugin
                      })[0]
                      if (!self.selectedPlugin) self.selectedPlugin = self.plugins[0]
                    }
                  }
                }
                self.isLoading = false
              })
              .catch(function (error) {
                self.isLoading = false
                DeviceOnApis.MessageBox.Error(self, error)
              })
          }
        })
        .catch(function (error) {
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    getPluginList (did, agentid) {
      if (did !== 0) {
        DeviceOnApis.settings.get
          .ruleCapability(did, RMMGlobal.currentLanguage())
          .then(function (xhr) {
            self.plugins = []
            Object.keys(xhr.data).map((key) => {
              if (key !== 'RuleEngine') {
                if (xhr.data[key]['info']) {
                  if (xhr.data[key]['info']['e']) {
                    for (let i = 0; i < xhr.data[key]['info']['e'].length; i++) {
                      let tmpData = xhr.data[key]['info']['e'][i]
                      if (tmpData['n'] === 'selfWeb') {
                        if (tmpData['bv'] === true) {
                          self.plugins.push({ 'aliasName': key })
                        }
                      }
                    }
                    if (self.plugins.length <= 0) {
                      self.selectedPlugin = ''
                    }
                  }
                }
              }
              return xhr.data[key]
            })
          })
          .catch(function () {
            self.isLoading = false
            // DeviceOnApis.MessageBox.Error(self, error)
          })
      }
    },    

    // UI set
    pageChange (pageIndex) {
      this.currentPage = pageIndex
      self.$nextTick(() => {
        if (self.$refs.clientTable) self.$refs.clientTable.setPage(pageIndex)
      })
    },
    htmlScroll () {
      if (window.pageYOffset > 1) {
        document.querySelector('.title-category').classList.add('hidden')
      } else {
        document.querySelector('.title-category').classList.remove('hidden')
      }
    },
    clear () {
      self.$refs.selfWebModal.close()
    },
    showFilter () {
      this.hideFilter = !this.hideFilter
    },
    // dropdown
    ScrollToBottom (type) {
      if (type === 'account' && (self.countAccount < self.totalAccount) && self.accountDropStatus !== 'onloading') {
        self.accountDropNo += 1
        self.accountDropStatus = 'onloading'
        setTimeout(function () {
          self.getAccounts(self.selectedAccount.aid)
        }, 1000)
      } else if (type === 'device' && self.deviceOptions.length % 10 === 0 && (self.deviceOptions.length < self.totalDevices) && self.dropStatus !== 'onloading') {
        self.dropNo += 1
        self.dropStatus = 'onloading'
        let oData = {
          pageSize: 10,
          no: self.dropNo,
          orderBy: 'connected',
          orderType: 'desc',
          like: ''
        }
        setTimeout(function () {
          self.getDevices(self.gid, oData)
        }, 1000)
      }
    },
    groupDropStatus (value) {
      self.isopendropdown = value
    },
    serchTxt (type, Txt) {
      if (type === 'account') {
        this.searchAccountTxt = Txt
        this.accountOptions = []
        this.countAccount = 0
        this.accountDropNo = 1
        this.accountDropStatus = 'onloading'
        clearTimeout(self.keywordAccountTimer)
        self.keywordAccountTimer = setTimeout(function () {
          self.getAccounts(self.selectedAccount.aid)
        }, 1000)
      } else if (type === 'device') {
        self.keyword = Txt
      }
    },
    // other function call this.getDevices(data.gid, oData)
    resetGetDevice (hasKeyWord, ignoreSelected) {
      // ""Group""" dropdown status:
      // if open : reset anything
      // if close: reset anything, and push how many dropNo for device, and focus selected device did
      self.deviceOptions = []
      self.totalDevices = 0
      let oData = {
        pageSize: 10,
        no: 1,
        orderBy: 'connected',
        orderType: 'desc',
        like: ''
      }
      if (hasKeyWord) {
        oData.like = hasKeyWord
        self.getDevices(self.gid, oData, ignoreSelected)
      } else {
        if (self.isopendropdown === 'open') {
          self.dropNo = 1
          self.getDevices(self.gid, oData, ignoreSelected)
        } else {
          if (self.dropNo > 1) {
            for (let i = 1; i <= self.dropNo; i++) {
              let ArrayData = {
                pageSize: 10,
                no: i,
                orderBy: 'connected',
                orderType: 'desc',
                like: ''
              }
              self.getDevices(self.gid, ArrayData, ignoreSelected)
            }
          } else {
            self.getDevices(self.gid, oData, ignoreSelected)
          }
        }
      }
    },
    showdropdown (type) {
      if (type === 'account') {
        // 避免第二次選擇之後 keyword 沒有重新載入
        this.haskeywordAccount = ''
        setTimeout(() => {
          this.haskeywordAccount = this.searchAccountTxt
        }, 100)
      } else if (type === 'device') {
        self.haskeyword = self.keyword
      }
    }
  },
  watch: {
    selectedAccount (data) {
      if (data !== '') {
        self.aid = data.aid
        self.dropNo = 1
        this.getDeviceGroups(data.aid)
      }
    },
    selectedGroup (data) {
      if (data !== '') {
        self.gid = data.gid

        self.resetGetDevice()
      }
    },
    selectedDevice (data) {
      self.selfWeb = false
      self.currentPage = 1
      self.plugins = []
      self.selectedPlugin = ''
      if (Object.keys(data).length !== 0) {
        if (this.skipReloadAgent) {
          this.skipReloadAgent = false
        } else {
          this.skipReloadAgent = false
          self.did = parseInt(data.did)
          if (data && data.did) {
            if (data.connected) {
              self.did = parseInt(data.did)
              self.agentid = data.agentid
              self.showPanel = true
              self.showChart = true
              self.getPluginList(data.did, data.agentid)
            } else {
              this.showPanel = false
              this.showType = 'lost_connection'
            }
          } else {
            this.showPanel = false
            this.showType = 'no_device'
          }
        }
      } else {
        self.selectedPlugin = ''
        self.plugins = []
      }
    },
    selectedPlugin (val) {
      if (val !== '' && this.did) {
        self.currentPage = 1
        self.stillPlugin = val
        self.getSelfWeb(val['aliasName'])
        self.openModal()        
      }
    },
    keyword (val) {
      clearTimeout(self.keywordTimer)
      self.keywordTimer = setTimeout(function () {
        self.resetGetDevice(val, true)
      }, 1000)
    },
  },
  computed: {
    ...mapState(['PURPOSE']),
  },
  destroyed () {
    window.removeEventListener('scroll', self.htmlScroll)
    window.removeEventListener('message', this.eventHandler)
    window.removeEventListener('resize', self.resizeWindowHandler)
  },
  beforeRouteLeave (to, from, next) {
    const oRMM = RMMGlobal.get()
    if (oRMM.lastRoute !== undefined) {
      oRMM.lastLeaveTime = moment().valueOf()
      RMMGlobal.set(oRMM)
    }
    next()
  }
}

</script>

<style lang="scss">
  .DeviceData{
    .device-action-disable{
      opacity: 0 !important;
    }
    .text-datatime{
      color:$main-theme;
      white-space: nowrap;
      margin-left: 3rem;
      letter-spacing: 0.5px;
    }
    .box-chart{
      height: 320px;
      width: 100%;
      &>div{
        height: 320px;
        width: 100%;
      }
    }
    .input-text{
      min-width: 100px;
      margin-right: 1rem;
      margin-bottom: 0rem;
    }
    .div_treeviewlist{
      max-height: 400px;
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }
</style>
