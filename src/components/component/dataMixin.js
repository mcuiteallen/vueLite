import RMMGlobal from '@/util/RMMGlobal'
// import DeviceOnApis from '@/util/DeviceOnApis'
window.momentTZ = require('moment-timezone')

let self = {}
export default {
  name: 'data-mixins',
  components: {},
  props: {},
  computed: {},
  data () {
    return {
      oRMM: RMMGlobal.get(),
      mentorAid: 0,
    }
  },
  mounted () {
    self = this
    // if (this.oRMM.Login.rid === 4) {
    //   DeviceOnApis.accounts.get
    //     .account(this.oRMM.Login.aid)
    //     .then(function (xhr) {
    //       self.mentorAid = xhr.data.accounts[0].mentor.aid
    //     })
    //     .catch(function (error) {
    //       console.log(error)
    //     })
    // }
  },
  methods: {
    sortAccounts (accounts, aid, sortType) {
      // sortType ? sortType = sortType : sortType = 'name'
      if (!sortType) sortType = 'name'
      // 接全部的帳號
      let catchData = accounts.filter((e) => {
        return e.enable === true && !e.title
      })

      // 新增4種 account role
      let SuperAdminRole = {
        title: 'RoleTitle',
        name: '-Role: super admin',
        mail: '-Role: super admin',
        email: '-Role: super admin'
      }
      let AdminRole = {
        title: 'RoleTitle',
        name: '-Role: admin',
        mail: '-Role: admin',
        email: '-Role: admin'
      }
      let DeviceAdminRole = {
        title: 'RoleTitle',
        name: '-Role: device admin',
        mail: '-Role: device admin',
        email: '-Role: device admin'
      }

      // 過濾四種 account role + 重新排列 + 各別加上Role Title
      let SuperAdmin = catchData.filter(function (item, ind) {
        // return item.role === 'super admin'
        return item.rid === 1
      })
      SuperAdmin.unshift(SuperAdminRole)

      let Admin = catchData.filter(function (item, ind) {
        // return item.role === 'admin'
        return item.rid === 2
      })
      Admin = Admin.sort(function (a, b) {
        if (sortType === 'name') {
          if (a[sortType].toLowerCase() < b[sortType].toLowerCase()) return -1
          else return 1
        } else {
          if (a[sortType] > b[sortType]) return -1
          if (a[sortType] < b[sortType]) return 1
          return 0
        }
      })
      Admin.unshift(AdminRole)

      let DeviceAdmin = catchData.filter(function (item, ind) {
        // return item.role === 'device admin'
        return item.rid === 3
      })
      DeviceAdmin = DeviceAdmin.sort(function (a, b) {
        if (sortType === 'name') {
          if (a[sortType].toLowerCase() < b[sortType].toLowerCase()) return -1
          else return 1
        } else {
          if (a[sortType] > b[sortType]) return -1
          if (a[sortType] < b[sortType]) return 1
          return 0
        }
      })
      DeviceAdmin.unshift(DeviceAdminRole)

      let allData = SuperAdmin.concat(Admin, DeviceAdmin)
      let selectedAccount = {}
      // self.accountOptions = allData

      let nAid = 0
      if (aid && aid > 0) {
        nAid = aid
      } else {
        nAid = this.oRMM.Login.aid
      }
      let aAccount = allData.filter(function (g, i) {
        return g.aid === Number(nAid)
      })
      if ((aAccount.length === 0) && (allData.length > 0)) {
        for (let i = 0; i < allData.length; i++) {
          if (allData[i].aid) {
            selectedAccount = allData[i]
            break
          }
        }
      } else { selectedAccount = aAccount[0] }
      let accountData = {
        accountOptions: allData,
        selectedAccount: selectedAccount
      }
      return accountData
    },
    sortGroups (xhr, aid, gid, notAll, noSubGroup) {
      if (
        xhr &&
				xhr.data &&
				xhr.data.accounts &&
				xhr.data.accounts[0] &&
				xhr.data.accounts[0].groups
      ) {
        let oAllGroup = {
          aid: aid,
          description: '--- All ---',
          gid: 0,
          name: self.$t('deviceon.group.all')
        }
        if (noSubGroup === 'noSubGroup') {
          for (let i of xhr.data.accounts[0].groups) {
            if (i.subgroups) {
              delete i.subgroups
            }
          }
        }
        let groups = xhr.data.accounts[0].groups
        let selectedGroup = {}
        if (groups.length > 0) {
          groups = groups.sort(function (a, b) {
            if (a.name < b.name) return -1
            else if (a.name > b.name) return 1
            else return 0
          })
          // 自己的帳戶 和 mentee的創建者帳號 可以看全部
          if (aid === this.oRMM.Login.aid || aid === this.mentorAid) {
            groups.unshift(oAllGroup)
            if (notAll) groups.shift()
          }

          // add subgroups
          for (let i = 0; i < groups.length; i++) {
            if (groups[i].subgroups) {
              for (let j = 0; j < groups[i].subgroups.length; j++) {
                // '--' + groups[i].subgroups[j].mail + ' : '
                groups[i].subgroups[j].name = groups[i].subgroups[j].name + '<span class="hidden">' + groups[i].subgroups[j].mail + '</span>'
                // groups[i].subgroups[j].mail
                groups.splice(i + 1, 0, groups[i].subgroups[j])
              }
            }
          }

          // self.groupOptions = groups
          let aGroup = groups.filter(function (g, i) {
            return g.gid === Number(gid)
          })
          if ((aGroup.length === 0) && (groups.length > 0)) {
            selectedGroup = groups[0]
          } else {
            if (self.gid !== 0) {
              for (let i = 0; i < groups.length; i++) {
                if (parseInt(gid) === groups[i].gid) {
                  selectedGroup = groups[i]
                }
              }
            } else {
              selectedGroup = groups[0]
            }
          }
        } else {
          groups = []
          selectedGroup = ''
        }

        let groupData = {
          groupOptions: groups,
          selectedGroup: selectedGroup
        }
        return groupData
      }
      return false
    },
    sortDevice (devicesData, did) {
      let deviceOptions = []
      let selectedDevice = {}
      let devices = devicesData.sort(function (a, b) {
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
        deviceOptions.push({
          did: d.did,
          name: d.name,
          agentid: d.agentid,
          connected: d.connected,
          os: d.ostype,
          amtsupport: d.amtsupport,
          showIcon: true,
          iconClass: 'fa fa-circle fa-lg',
          iconColor: iconColor
        })
      })
      if (deviceOptions.length > 0) {
        if (did) {
          let aDevice = deviceOptions.filter(function (g, i) {
            return g.did === Number(did)
          })
          if ((aDevice.length === 0) && (deviceOptions.length > 0)) {
            selectedDevice = deviceOptions[0]
          } else {
            selectedDevice = aDevice[0]
          }
        } else {
          selectedDevice = deviceOptions[0]
        }
      } else {
        deviceOptions = []
        selectedDevice = ''
      }

      let deviceData = {
        deviceOptions: deviceOptions,
        selectedDevice: selectedDevice
      }

      return deviceData
    },

    LimitDevice_forEach (devicesData) {
      let deviceOptions = []
      let devices = devicesData

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
        deviceOptions.push({
          did: d.did,
          name: d.name,
          agentid: d.agentid,
          connected: d.connected,
          os: d.ostype,
          amtsupport: d.amtsupport,
          showIcon: true,
          iconClass: 'fa fa-circle fa-lg',
          iconColor: iconColor,
          autoreport: d.autoreport,
          platformname: d.platformname
        })
      })

      let deviceData = {
        deviceOptions: deviceOptions,
      }

      return deviceData
    },
    LimitDevice_sort (devicesData) {
      let deviceData = devicesData.sort(function (a, b) {
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

      return deviceData
    },
    LimitDevice_did (devicesData, did) {
      let selectedDevice = {}
      if (devicesData.length > 0) {
        if (did) {
          let aDevice = devicesData.filter(function (g, i) {
            return g.did === Number(did)
          })
          if ((aDevice.length === 0) && (devicesData.length > 0)) {
            selectedDevice = devicesData[0]
          } else {
            selectedDevice = aDevice[0]
          }
        } else {
          selectedDevice = devicesData[0]
        }
      } else {
        selectedDevice = ''
      }

      // let deviceData = {
      //   selectedDevice: selectedDevice
      // }

      return selectedDevice
    },

    getUTCFromLocalTime (val, type) {
      var timeStamp = val.replace(new RegExp(/-/gm), '/')
      if (timeStamp && timeStamp.indexOf('.') > -1) {
        timeStamp = timeStamp.substring(0, timeStamp.indexOf('.'))
      }
      var d = new Date(timeStamp)
      return (
        d.getUTCFullYear() +
        '-' +
        this.returnAppropriateMonthFormat(d.getUTCMonth()) +
        '-' +
        this.returnAppropriateOtherTimeFormats(d.getUTCDate()) +
        ' ' +
        this.returnAppropriateOtherTimeFormats(d.getUTCHours()) +
        ':' +
        this.returnAppropriateOtherTimeFormats(d.getUTCMinutes()) +
        ':' +
        this.returnAppropriateOtherTimeFormats(d.getUTCSeconds()) +
        '.' +
        this.returnAppropriateMillisecondTimeFormats(d.getUTCMilliseconds())
      )
    },
    getUTCFromLocalTimeTZ (val, type) {
      var timeStamp = val.replace(new RegExp(/-/gm), '/')
      if (timeStamp && timeStamp.indexOf('.') > -1) {
        timeStamp = timeStamp.substring(0, timeStamp.indexOf('.'))
      }
      var d = new Date(timeStamp)
      return (
        d.getUTCFullYear() +
        '-' +
        this.returnAppropriateMonthFormat(d.getUTCMonth()) +
        '-' +
        this.returnAppropriateOtherTimeFormats(d.getUTCDate()) +
        'T' +
        this.returnAppropriateOtherTimeFormats(d.getUTCHours()) +
        ':' +
        this.returnAppropriateOtherTimeFormats(d.getUTCMinutes()) +
        ':' +
        this.returnAppropriateOtherTimeFormats(d.getUTCSeconds()) +
        '.' +
        this.returnAppropriateMillisecondTimeFormats(d.getUTCMilliseconds()) + 'Z'
      )
    },
    getUTCTimeZone () {
      return window.momentTZ.tz.guess()
    },
    getUTCTimeZoneList () {
      let aNames = window.momentTZ.tz.names()
      var aTZ = []
      for (let i in aNames) {
        let oTZ = {}
        oTZ.tz = window.momentTZ.tz(aNames[i]).format('Z')
        oTZ.offset = parseInt(oTZ.tz.split(':')[0] * 60) + parseInt(oTZ.tz.split(':')[1])
        oTZ.value = aNames[i]
        oTZ.description = '(' + window.momentTZ.tz(aNames[i]).format('Z') + ') ' + aNames[i]
        aTZ.push(oTZ)
      }
      let aResult = aTZ.sort((a, b) => {
        return b.offset < a.offset ? 1 : -1
      })
      return aResult
    },
    returnAppropriateMonthFormat (utcMonth) {
      if (utcMonth < 9) {
        return '0' + (utcMonth + 1)
      } else {
        return utcMonth + 1
      }
    },
    returnAppropriateOtherTimeFormats (time) {
      if (time < 10) {
        return '0' + time
      } else {
        return time
      }
    },
    returnAppropriateMillisecondTimeFormats (milliseconds) {
      var length = milliseconds.toString().length
      if (length === 1) {
        return '00' + milliseconds
      } else if (length === 2) {
        return '0' + milliseconds
      } else {
        return milliseconds
      }
    },

    resetCollapseHeight (Collapse) {
      Collapse.$el.children[1].style.height = Collapse.$slots.body[0].elm.clientHeight + 'px'
    },

    getDeviceStatus (device) {
      let status = ''
      if (device.connected && !device.normal) {
        status = 'error'
      } else if (device.connected) {
        status = 'connect'
      } else if (!device.connected) {
        status = 'disconnect'
      }
      return status
    },

    // Table row 標示選擇項目
    addTableClass (index, queryClass) {
      let vuetableTR = queryClass ? document.querySelectorAll(queryClass + ' .VueTables__row') : document.querySelectorAll('.VueTables__row')
      if (index !== '' && vuetableTR[index] && !vuetableTR[index].classList.value.includes('focusTr')) vuetableTR[index].classList.add('focusTr')
    },
    clearTableClass (index, queryClass) {
      let vuetableTR = queryClass ? document.querySelectorAll(queryClass + ' .VueTables__row') : document.querySelectorAll('.VueTables__row')
      if (index !== '' && vuetableTR[index] && vuetableTR[index].classList.value.includes('focusTr')) vuetableTR[index].classList.remove('focusTr')
    },
    addAllTableClass (queryClass) {
      let vuetableTR = queryClass ? document.querySelectorAll(queryClass + ' .VueTables__row') : document.querySelectorAll('.VueTables__row')
      if (vuetableTR.length === 0) return
      for (let TR of vuetableTR) {
        if (!TR.classList.value.includes('focusTr')) TR.classList.add('focusTr')
      }
    },
    clearAllTableClass (queryClass) {
      let vuetableTR = queryClass ? document.querySelectorAll(queryClass + ' .VueTables__row') : document.querySelectorAll('.VueTables__row')
      for (let TR of vuetableTR) {
        if (TR.classList.value.includes('focusTr')) TR.classList.remove('focusTr')
      }
    },

    // echart 變色前檢查網站色系
    checkTheme () {
      // check the html is has --varible color
      let ThemeColor = document.documentElement.style.getPropertyValue('--mainTheme').trim()
      let textColor = document.documentElement.style.getPropertyValue('--textColor').trim()
      let ThemeData = {}
      if (ThemeColor !== '' || textColor !== '') {
        ThemeData.ThemeColor = ThemeColor
        ThemeData.textColor = textColor
      } else {
        ThemeData.ThemeColor = '#9e3398'
        ThemeData.textColor = textColor
      }

      // check the body classname is has 'theme-Dark' or 'theme-Blue'
      ThemeData = document.querySelector('body')
      return ThemeData
    },
    checkHasClass (elem, className) {
      let reg = new RegExp('(^|\\s+)' + className + '($|\\s+)')
      if (className === 'theme-Dark') {
        let isDark = reg.test(elem.className)
        if (isDark) {
          return className
        }
      }
      if (className === 'theme-Blue') {
        let isBlue = reg.test(elem.className)
        if (isBlue) {
          return className
        }
      }
    }
  }
}
