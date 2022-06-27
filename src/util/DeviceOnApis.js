import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import baseURL from '@/util/baseURL'
import CryptoJS from 'crypto-js'
import VueSweetalert2 from 'vue-sweetalert2'
import RMMGlobal from '@/util/RMMGlobal'
// import { data } from 'autoprefixer'
let _Language = {
  'gb': 'en-US',
  'en': 'en-US',
  'tw': 'zh-TW',
  'cn': 'zh-CN',
}
let _Cancel = '_CancelByLogout'

// import { callbackify } from 'util'
Vue.use(VueSweetalert2)

Vue.use(VueAxios, axios)
const axiosDefaultArgs = {
  timeout: 30000,
  withCredentials: true,
}
axiosDefaultArgs.baseURL = baseURL.RMM
Vue.prototype.$axios = axios.create(axiosDefaultArgs)
const oAxios = Vue.prototype.$axios

let Base64 = require('js-base64').Base64

// Intercept request
let oRMM = {}
let aAllowMethod = []
let oGet = { 'get': [] }
let oPut = { 'put': [] }
let oPost = { 'post': [] }
oPut.put.push({ 'api': '/rmm/v1/devicectrl/intermittent_report' })
oPost.post.push({ 'api': '/rmm/v1/sso/login' })
oPost.post.push({ 'api': '/rmm/v1/accounts/logout' })
oPost.post.push({ 'api': '/rmm/v1/devicectrl/intermittent_report' })
oPost.post.push({ 'api': '/rmm/v1/action/exec/tally' })
oPost.post.push({ 'api': '/rmm/v1/devicectrl/data' })
aAllowMethod.push(oGet)
aAllowMethod.push(oPut)
aAllowMethod.push(oPost)

let serverRestart = false
window.addEventListener('message', function (e) {
  let cmd = e.data
  if (cmd.type === 'EVents') {
    // Tomcat Server 關閉後所發送的消息 跳出Server正在重啟畫面
    for (let item of cmd.value) {
      if (item.agent_id === 'DEVICEON-SERVER' && item.extMsg.indexOf('PORTAL_RESTART') > -1) {
        serverRestart = true
        break
      }
    }
  } else if (cmd.type === 'WebSocket') {
    // websocket重新連線後 關閉Server正在重啟畫面
    serverRestart = false
  }
})

oAxios.interceptors.request.use(config => {
  oRMM = RMMGlobal.get()
  if (process.env.NODE_ENV === 'development') {
    config.headers.Authorization = 'Basic ' + Base64.encode(baseURL.user + ':' + baseURL.password)
  }
  // if (navigator.platform === 'iPhone' || navigator.userAgent.indexOf('Edge') > -1) {
  if (config.method === 'get') {
    let aNoCache = []
    aNoCache.push('/rmm/v1/data')
    aNoCache.push('/rmm/v1/system')
    aNoCache.push('/rmm/v1/events')
    aNoCache.push('/rmm/v1/devices/topn')
    aNoCache.push('/rmm/v1/ads/anomaly')
    aNoCache.push('/rmm/v1/ui-config')
    aNoCache.push('/static/defaultConfigNew.json')
    let bCache = true

    let strURL = config.url.substring(config.baseURL.length)
    for (let i = 0; i < aNoCache.length; i++) {
      if (strURL.substring(0, aNoCache[i].length) === aNoCache[i]) {
        bCache = false
        break
      }
    }
    if (bCache) {
      let dNow = new Date()
      if (config.url.indexOf('?') > -1) { config.url = config.url + '&timeStemp=' + dNow.valueOf() } else { config.url = config.url + '?timeStemp=' + dNow.valueOf() }
    }
  }
  // }
  if ((config.url.lastIndexOf('—') > -1) || (config.url.lastIndexOf('／') > -1)) {
    config.url = config.url.replace(/\—/g, '@2D')
    config.url = config.url.replace(/\／/g, '@2F')
  }

  if (config.data) {
    let strData = JSON.stringify(config.data)
    let bReplace = false
    if ((strData.lastIndexOf('—') > -1) || (strData.lastIndexOf('／') > -1)) {
      strData = strData.replace(/\—/g, '@2D')
      strData = strData.replace(/\／/g, '@2F')
      bReplace = true
    }
    if (bReplace) { config.data = JSON.parse(strData) }

    // Trim Data
    if (strData !== '{}') {
      let oTemp = JSON.parse(strData)
      Json.Trim(oTemp)
      config.data = oTemp
    }
  }

  if ((config.method === 'post') && (config.url.lastIndexOf('packagecontrol/package') > -1)) {
    config.timeout = 0
  }

  let isMentee = false
  if (oRMM && oRMM.Login && oRMM.Login.rid) {
    if (oRMM.Login.rid === 4) {
      isMentee = true
    }
  }

  let cmd = {}
  if (isMentee) {
    let bAllowMethod = false
    let bAllowAPIs = false
    let aAPIs = []
    for (let i = 0; i < aAllowMethod.length; i++) {
      if (aAllowMethod[i].hasOwnProperty(config.method)) {
        bAllowMethod = true
        aAPIs = aAllowMethod[i][config.method]
        break
      }
    }

    if (aAPIs.length === 0) {
      bAllowAPIs = true
    } else {
      for (let i = 0; i < aAPIs.length; i++) {
        if (aAPIs[i].api === config.url.substring(config.baseURL.length)) {
          bAllowAPIs = true
          break
        }
      }
    }
    if (bAllowMethod && bAllowAPIs) {
      return config
    } else {
      cmd = {
        type: 'ajax',
        value: 'deviceon.product.demouser',
        reLogin: false
      }
      window.parent.postMessage(cmd, window.origin)
      return Promise.reject
    }
  } else {
    // if (config.url.indexOf('/static/') > 0) {
    //   let aURL = config.url.split('/static/')
    //   config.url = '/static/' + aURL[1]
    // }
    config.headers['Accept-Language'] = _Language[Vue.i18n.locale()]
    return config
  }
}, err => {
  let cmd = {
    type: 'ajax',
    value: 'deviceon.message.warnings.408',
    reLogin: false
  }
  window.parent.postMessage(cmd, window.origin)
  return Promise.reject(err)
})

// Intercept response
oAxios.interceptors.response.use(
  response => {
    let strData = JSON.stringify(response.data)
    if ((strData.indexOf('@2D') > -1) || (strData.indexOf('@2F') > -1)) {
      strData = strData.replace(/@2D/g, '—')
      strData = strData.replace(/@2F/g, '／')
      // var txt = document.createElement("textarea");
      // txt.innerHTML = strData
      // strData = txt.value
      response.data = JSON.parse(strData)
    }
    return response
  },
  err => {
    oRMM = RMMGlobal.get()
    let cmd = {}
    if (err.response) {
      let bExclude = false
      let aExcludeAPI = []
      aExcludeAPI.push({ 'api': '/rmm/v1/proxy' })
      aExcludeAPI.push({ 'api': '/rmm/v1/accounts/password' })
      let reqURL = err.config.url.split('?')[0]
      for (let i = 0; i < aExcludeAPI.length; i++) {
        if (aExcludeAPI[i].api === reqURL.substring(err.config.baseURL.length)) {
          bExclude = true
          break
        }
      }
      if (!bExclude) {
        switch (err.response.status) {
          case 402:
            let bExpired = false
            try {
              if ((err.response.data.ErrorCode !== '') && (err.response.data.Description !== '')) {
                bExpired = (err.response.data.ErrorCode === '1009')
              } else {
                bExpired = false
              }
            } catch (e) {
              bExpired = false
            }
            // bExpired = true //Test
            if (bExpired) {
              cmd = {
                type: 'ajax',
                value: 'deviceon.message.warnings.1009',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            break
          case 401:
            if (oRMM.userLogout) {
              throw new axios.Cancel(_Cancel)
            }
            let aExclude = ['myself', 'login', '2fa']
            let strURL = err.config.url.split('?')[0]
            let aURL = strURL.split('/')
            if (aExclude.indexOf(aURL[aURL.length - 1]) === -1) {
              cmd = {
                type: 'ajax',
                value: 'deviceon.message.warnings.401',
                reLogin: true
              }
              window.parent.postMessage(cmd, window.origin)
            }
            if (err.response.data.message === '40105: The username or password is incorrect.') {
              cmd = {
                type: 'ajax',
                value: 'deviceon.account.login.changepassowrderror',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            if (err.response.data.ErrorCode === '1717') {
              // 在登入後修改密碼時，舊密碼輸入錯誤
              cmd = {
                type: 'ajax',
                value: 'deviceon.account.error.1717',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            /*
            if (err.response.data.ErrorCode === '1305') {
              // 在登入頁輸入錯的電子郵件
              cmd = {
                type: 'ajax',
                value: 'deviceon.account.login.incorrect',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            */
            break
          case 403:
            if (err.response.data.ErrorCode === 1009) {
              cmd = {
                type: 'ajax',
                value: 'deviceon.account.login.incorrect',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            break
          case 503:
            if (err.response.statusText === 'Service Unavailable') {
              cmd = {
                type: 'ajax',
                value: 'deviceon.message.warnings.503',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            break
          case 1353:
            if (err.response.statusText === 'Mail Server Configuration Error') {
              cmd = {
                type: 'ajax',
                value: 'deviceon.message.warnings.1353',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            break
          case 408:
            cmd = {
              type: 'ajax',
              value: 'deviceon.message.warnings.408',
            }
            window.parent.postMessage(cmd, window.origin)
            break
          case 404:
            if (err.response.data.FieldValue === 'format error') {
              cmd = {
                type: 'ajax',
                value: 'deviceon.device.message.formatError',
              }
              window.parent.postMessage(cmd, window.origin)
            } else if (err.response.data.ErrorCode === '1304' && err.response.data.Field === 'wolrepeater') {
              cmd = {
                type: 'ajax',
                value: 'deviceon.device.message.proxyAgentNotFound',
              }
              window.parent.postMessage(cmd, window.origin)
            } else if (err.response.statusText === 'Not Found' && (err.response.data.Field !== 'pluginName/configName') && (err.response.data.FieldValue !== 'RuleEngine')) {
              cmd = {
                type: 'ajax',
                value: 'deviceon.message.warnings.40402',
              }
              window.parent.postMessage(cmd, window.origin)
            }
            break
          default:
            break
        }
      }
      if (!serverRestart) {
        return Promise.reject(err)
      } else {
        return false
      }
    } else {
      if (!serverRestart) {
        return Promise.reject(err)
      } else {
        return false
      }
    }
  }
)

const Json = {
  Trim: function (oData) {
    for (var key in oData) {
      if (oData.hasOwnProperty(key)) {
        if (typeof oData[key] === 'string') {
          oData[key] = oData[key].trim()
        } else if (typeof oData[key] === 'object') {
          Json.Trim(oData[key])
        }
      }
    }
  }
}
const DeviceOnApis = {
  MessageBox: {
    Error: function (obj, error) {
      if (error.message && (error.message === _Cancel)) {
        console.log(error)
        return
      }
      let strIcon = 'error'
      let strTitle = obj.$t('deviceon.message.error')
      let strMessage = obj.$t('deviceon.message.error')
      try {
        if (typeof error.message !== 'undefined') {
          strMessage = error.message
          if (strMessage.indexOf('timeout') > -1) {
            strIcon = 'warning'
            strTitle = obj.$t('deviceon.message.warning')
            strMessage = obj.$t('deviceon.message.warnings.408')
          }
        }
      } catch (e) { }
      try {
        if (typeof error.response.data.message !== 'undefined') strMessage = error.response.data.message
      } catch (e) { }
      try {
        if (typeof error.response.data.ErrorDetail !== 'undefined') strMessage = error.response.data.ErrorDetail
      } catch (e) { }
      try {
        if (typeof error.response.data.Description !== 'undefined') {
          switch (error.response.data.ErrorCode) {
            case '1704':
              if (error.response.data.Field !== 'groupId') {
                strMessage = obj.$t('deviceon.message.errors.1704')
              } else {
                strMessage = error.response.data.Description
              }
              break
            default:
              strMessage = error.response.data.Description
          }
        }
      } catch (e) { }
      try {
        if (typeof error.response.data.ErrorCode !== 'undefined') {
          let aField = error.response.data.Field.split('/')
          let aFieldValue = error.response.data.FieldValue.split('/')
          let strField = aField[aField.length - 1]
          let strFieldValue = aFieldValue[aFieldValue.length - 1]
          switch (error.response.data.ErrorCode) {
            case '1001':
              strMessage = strField + ' : ' + strFieldValue
              break
            case '1303':
              strIcon = 'warning'
              strTitle = obj.$t('deviceon.message.warning')
              strMessage = obj.$t('deviceon.message.errors.1303', { field: strField, fieldvalue: strFieldValue })
              break
            case '408':
              strIcon = 'warning'
              strTitle = obj.$t('deviceon.message.warning')
              strMessage = obj.$t('deviceon.message.warnings.408')
              break
            default:
              if (error.response.data.FieldValue !== '') {
                if (error.response.data.Field !== 'groupId') {
                  strMessage = strMessage + ' - ' + error.response.data.Field + ' : ' + error.response.data.FieldValue
                }
              }
              break
          }
        }
      } catch (e) { }

      return obj.$swal({
        title: strTitle,
        text: strMessage,
        icon: strIcon,
        type: strIcon,
        confirmButtonText: obj.$t('modal.confirm'),
        cancelButtonText: obj.$t('modal.cancel'),
      })
    },
    Normal: function (obj, strTitle, strText, strIcon, showCancelBtn) {
      return obj.$swal({
        title: strTitle,
        text: strText,
        icon: strIcon,
        type: strIcon,
        confirmButtonText: obj.$t('modal.confirm'),
        cancelButtonText: obj.$t('modal.cancel'),
        showCancelButton: showCancelBtn
      })
    },
    HTML: function (obj, strTitle, strText, strIcon, showCancelBtn) {
      return obj.$swal({
        title: strTitle,
        html: strText,
        icon: strIcon,
        type: strIcon,
        confirmButtonText: obj.$t('modal.confirm'),
        cancelButtonText: obj.$t('modal.cancel'),
        buttons: showCancelBtn
      })
    }
  },
  CryptoJS: {
    decryption: function (value) {
      if (value !== '') {
        var key = CryptoJS.enc.Latin1.parse('TYScottSephiroth')
        var iv = CryptoJS.enc.Latin1.parse('TYScottSephiroth')
        var decrypted
        try {
          decrypted = CryptoJS.AES.decrypt(value, key, {
            iv: iv,
            padding: CryptoJS.pad.ZeroPadding
          })
          return decrypted.toString(CryptoJS.enc.Utf8).replace(/^\s+|\s+$/g, '')
        } catch (e) {
          return ''
        }
      } else {
        return ''
      }
    },
    encryption: function (value) {
      var key = CryptoJS.enc.Latin1.parse('TYScottSephiroth')
      var iv = CryptoJS.enc.Latin1.parse('TYScottSephiroth')

      var encrypted = CryptoJS.AES.encrypt(value, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding
      })
      return encrypted.toString()
    },
  },
  roles: {
    get: {
      roles: function (pageSize, no, orderBy, orderType, like, others) {
        let api = '/rmm/v1/roles'
        let oData = { pageSize: pageSize, no: no, orderBy: orderBy, orderType: orderType, like: like }
        return oAxios.get(api, { params: oData })
      },
      role: function (rid, others) {
        let api = '/rmm/v1/roles/' + rid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      rolePrivileges: function (rid, others) {
        let api = '/rmm/v1/roles/' + rid + '/privileges'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      accounts: function (rid, parameters, others) {
        let api = '/rmm/v1/roles/' + rid + '/accounts?'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      }
    }
  },
  overview: {
    get: {
      loading: function () {
        let api = '/rmm/v1/system/loading'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      statusNum: function () {
        let api = '/rmm/v1/devices/own/status/number'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      eventCount: function (since, to) {
        let api = '/rmm/v1/events/statistics/type?' + 'since=' + since + '&to=' + to + '&detail=true'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      eventAccount: function (eventType, severity, since, to) {
        let api = '/rmm/v1/events/statistics/account?' + 'type=' + eventType + '&severity=' + severity + '&since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      eventDevice: function (severity, since, to) {
        let api = '/rmm/v1/events/statistics/device?' + '&severity=' + severity + '&since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceCount: function (since, to) {
        let api = '/rmm/v1/devices/own/status/statistics?' + 'since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      storageHist: function (since, to) {
        let api = '/rmm/v1/system/statistics/storage?' + 'since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      memoryHist: function (since, to) {
        let api = '/rmm/v1/system/statistics/memory?' + 'since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      cpuHist: function (since, to) {
        let api = '/rmm/v1/system/statistics/cpu?' + 'since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      elapsedTime: function (since, to) {
        let api = '/rmm/v1/system/statistics/uptime?' + 'since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      top5Hist: function (agentid, data, since, to) {
        let api = '/rmm/v1/data/timeseries?' + 'agentId=' + agentid + '&data=' + data + '&since=' + since + '&to=' + to
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    }
  },
  accounts: {
    get: {
      myself: function (aid, others) {
        let api = '/rmm/v1/accounts/myself'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      login: function (username, password, ldap, agentId, ldapDomain, others) {
        let url = '/rmm/v1/accounts/login'
        const params = {}
        if (username && password) {
          params.auth = {
            username,
            password,
          }
        }
        let ret = ''
        if (ldap) {
          params.headers = { 'X-DeviceOn-Auth': 'ldap', 'X-DeviceOn-LDAP': ldapDomain }
          ret = oAxios.get(url, params)
        } else if (agentId) {
          url = '/rmm/v1/accounts/login?agentId=' + agentId
          ret = oAxios.get(url, params)
        } else {
          ret = oAxios.get(url, params)
        }
        return ret
        /* let url = '/rmm/v1/accounts/login'
        let oData = {url, auth:{username, password}}
        return oAxios.get(url, { params: oData }) */
      },
      account: function (aid, others) {
        let api = '/rmm/v1/accounts/' + aid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      accounts: function (others) {
        let api = '/rmm/v1/accounts?pageSize=1000&no=1&orderBy=rid&orderType=asc&like='
        let oData = {}
        if (others && others.pageSize) {
          api = '/rmm/v1/accounts'
          oData = others
        }
        return oAxios.get(api, { params: oData })
      },
      allAccounts: function (others) {
        let api = '/rmm/v1/accounts/groups/basics'
        return oAxios.get(api)
      },
      deviceGroups: function (accountId, others) {
        let api = '/rmm/v1/accounts/' + accountId + '/groups'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      validity: function (others) {
        let api = '/rmm/v1/accounts/token/validity'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      overall: function (others) {
        let api = '/rmm/v1/devices/number/assigned/overall'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      channelMessages: function (others) {
        let api = '/rmm/v1/accounts/channel/messages'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      channelMessagesPublished: function (others) {
        let api = '/rmm/v1/accounts/channel/messages?published=true'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      refreshToken: function (token, others) {
        let api = '/rmm/v1/accounts/refresh/' + token
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
    },
    post: {
      account: function (data, others) {
        let api = '/rmm/v1/accounts'
        let oData = data
        return oAxios.post(api, oData)
      },
      logout: function (data, others) {
        let api = '/rmm/v1/accounts/logout'
        let oData = data
        return oAxios.post(api, oData)
      },
      signup: function (data, others) {
        let api = '/rmm/v1/accounts/signup'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      accounts: function (data, others) {
        let api = '/rmm/v1/accounts'
        let oData = data
        return oAxios.put(api, oData)
      }
    },
    patch: {
      password: function (data, others) {
        let api = '/rmm/v1/accounts/myself/password'
        let oData = data
        return oAxios.patch(api, oData)
      },
      accountPrivileges: function (data, others) {
        let api = '/rmm/v1/accounts/privileges'
        let oData = data
        return oAxios.patch(api, oData)
      },
      accountTrial: function (data, others) {
        let api = '/rmm/v1/accounts/trial'
        let oData = data
        return oAxios.patch(api, oData)
      },
      accountTrialDays: function (data, others) {
        let api = '/rmm/v1/accounts/trial/days'
        let oData = data
        return oAxios.patch(api, oData)
      }
    },
    delete: {
      account: function (aid, others) {
        let api = '/rmm/v1/accounts/' + aid
        return oAxios.delete(api)
      },
      resetPassword: function (userEmail, others) {
        let api = '/rmm/v1/accounts/password?mail=' + userEmail
        return oAxios.delete(api)
      }
    }
  },
  devicegroups: {
    get: {
      deviceGroups: function (others) {
        let api = '/rmm/v1/devicegroups'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceGroup: function (gid, others) {
        let api = '/rmm/v1/devicegroups/' + gid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devices: function (gid, parameters, others) {
        let api = '/rmm/v1/devicegroups/' + gid + '/devices'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      devicesAll: function (parameters, others) {
        let api = '/rmm/v1/devicegroups/devices'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      deviceExport: function (gid, parameters, others) {
        let api = '/rmm/v1/devicegroups' + (gid === 0 ? '' : ('/' + gid)) + '/devices/export'
        let oData = parameters
        return oAxios.get(api, { params: oData, responseType: 'blob' })
      },
      devicefields: function (others) {
        let api = '/rmm/v1/devicegroups/fields/filterable'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
    },
    post: {
      deviceGroup: function (data, others) {
        let api = '/rmm/v1/devicegroups/'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      deviceGroups: function (data, others) {
        let api = '/rmm/v1/devicegroups/'
        let oData = data
        return oAxios.put(api, oData)
      }
    },
    patch: {
      coManagedBy: function (gorupId, coManagerId) {
        let api = '/rmm/v1/devicegroups/' + gorupId + '/coManagedBy/' + coManagerId
        return oAxios.patch(api)
      }
    },
    delete: {
      deviceGroup: function (gid, others) {
        let api = '/rmm/v1/devicegroups/' + gid
        return oAxios.delete(api)
      },
      coManaged: function (gorupId) {
        let api = '/rmm/v1/devicegroups/' + gorupId + '/coManaged'
        return oAxios.delete(api)
      }
    }
  },
  devices: {
    get: {
      device: function (did, others) {
        let api = '/rmm/v1/devices/' + did
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      belongings: function (agentId, others) {
        let api = '/rmm/v1/devices/belongings?agentId=' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      unassignedDevices: function (parameters, others) {
        let api = '/rmm/v1/devices/unassigned?'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      unassignedDevice: function (agentId, others) {
        let api = '/rmm/v1/devices/unassigned/device?agentId=' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devicePlugins: function (did, current, others) {
        let api = '/rmm/v1/devices/' + did + '/plugins?current=' + current
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devicePluginSensors: function (did, plugin, parameters, others) {
        let api = '/rmm/v1/devices/' + did + '/' + plugin + '/sensors?'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      groupPluginSensors: function (gid, plugin, current) {
        let api = '/rmm/v1/devicegroups/' + gid + '/' + plugin + '/sensors?current=' + current
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      connectivity: function (parameters, others) {
        let api = '/rmm/v1/devices/connectivity'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      statusNumber: function (parameters, others) {
        let api = '/rmm/v1/devices/own/status/number'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      unassignedNumber: function (others) {
        let api = '/rmm/v1/devices/unassigned/number'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceAgentId: function (agentId, others) {
        let api = '/rmm/v1/devices?agentId=' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devicesTop: function (topN, topType, others) {
        let api = '/rmm/v1/devices/topn?n=' + topN + '&data=' + topType // cpu|memory|nerwork|disk|disconnect
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceTags: function (agentIDs, other) {
        let api = '/rmm/v1/devices/tags?agent_id='
        for (let i = 0; i < agentIDs.length; i++) {
          if (i !== agentIDs.length - 1) {
            api += agentIDs[i] + '&agent_id='
          } else {
            api += agentIDs[i]
          }
        }
        let oData = {}
        return oAxios.get(api, { params: oData })
      },

    },
    put: {
    },
    patch: {
      name: function (agentId, data, others) {
        let api = '/rmm/v1/devices/name/' + agentId
        let oData = data
        return oAxios.patch(api, oData)
      },
      deviceGroups: function (data, others) {
        let api = '/rmm/v1/devices'
        let oData = data
        return oAxios.patch(api, oData)
      },
      devices: function (data, others) {
        let api = '/rmm/v1/devices'
        let oData = data
        return oAxios.patch(api, oData)
      },
      deviceWOL: function (data, others) {
        let api = '/rmm/v1/devices/wol'
        let oData = data
        return oAxios.patch(api, oData)
      },
      coordinates: function (data, others) {
        let api = '/rmm/v1/devices/coordinates'
        let oData = data
        return oAxios.patch(api, oData)
      },
      grafana: function (data, others) {
        let api = '/rmm/v1/devices/grafana/templates'
        let oData = data
        return oAxios.patch(api, oData)
      }
    },
    delete: {
      refuse: function (agentId, others) {
        let api = '/rmm/v1/devices/connection/' + agentId
        return oAxios.delete(api)
      }
    }
  },
  devicemap: {
    get: {
      allBuildings: function (other) {
        let api = '/rmm/v1/devicemap/building?image=true'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      building: function (name, image, other) {
        let api = '/rmm/v1/devicemap/building?name=' + name + '&image=' + image
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      map: function (mid, other) {
        let api = '/rmm/v1/devicemap/' + mid
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      building: function (data, others) {
        let api = '/rmm/v1/devicemap/building'
        let oData = data
        return oAxios.post(api, oData)
      },
      device: function (data, others) {
        let api = '/rmm/v1/devicemap/device'
        let oData = data
        return oAxios.post(api, oData)
      },
      plan: function (data, others) {
        let api = '/rmm/v1/devicemap/plan'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    patch: {
      building: function (mid, data, others) {
        let api = '/rmm/v1/devicemap/building/' + mid
        let oData = data
        return oAxios.patch(api, oData)
      },
      device: function (mid, data, others) {
        let api = '/rmm/v1/devicemap/device/' + mid
        let oData = data
        return oAxios.patch(api, oData)
      },
      deviceByAgentId: function (agentId, data, others) {
        let api = '/rmm/v1/devicemap/agent/' + agentId
        let oData = data
        return oAxios.patch(api, oData)
      },
      plan: function (mid, data, others) {
        let api = '/rmm/v1/devicemap/plan/' + mid
        let oData = data
        return oAxios.patch(api, oData)
      }
    },
    delete: {
      mapid: function (mid) {
        let api = '/rmm/v1/devicemap/' + mid + '?verbose=' + true
        return oAxios.delete(api)
      }
    }
  },
  notifymgmt: {
    get: {
      notification: function (eid, others) {
        let api = '/rmm/v1/notifymgmt/custom/' + eid
        return oAxios.get(api)
      },
      notifications: function (type, severity, category, language, others) {
        var ajaxUrl = '/rmm/v1/notifymgmt?type=' + type + '&language=' + language
        if (severity !== 'All') { ajaxUrl += '&severity=' + severity }
        if (category !== 'All') { ajaxUrl += '&category=' + category }

        let api = ajaxUrl
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      notificationCategories: function (type, severity, language, others) {
        var params = {}
        if (type) { params.type = type }
        if (severity !== 'All') { params.severity = severity }
        if (language) { params.language = language }

        let api = '/rmm/v1/notifymgmt/category'
        let oData = params
        return oAxios.get(api, { params: oData })
      },
      notificationBind: function (aid) {
        let params = {}
        if (aid) { params.aid = aid }
        let api = '/rmm/v1/notifymgmt/bind'
        let oData = params
        return oAxios.get(api, { params: oData })
      },
    },
    post: {
      customizedNotifications: function (data, others) {
        let api = '/rmm/v1/notifymgmt/custom'
        let oData = data
        return oAxios.post(api, oData)
      },
      bindNotification: function (data, aid, others) {
        let api = '/rmm/v1/notifymgmt/bind'
        let oData = {}
        if (aid) { oData.aid = aid }
        oData.notifyEvent = data.notifyEvent
        return oAxios.post(api, oData)
      },
      sendEmail: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_email'
        let oData = data
        return oAxios.post(api, oData)
      },
      sendSMS: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_sms'
        let oData = data
        return oAxios.post(api, oData)
      },
      send_sms_2016: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_sms_2016'
        let oData = data
        return oAxios.post(api, oData)
      },
      sendLINE: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_line'
        let oData = data
        return oAxios.post(api, oData)
      },
      sendWechat: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_wechat'
        let oData = data
        return oAxios.post(api, oData)
      },
      sendWhatsapp: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_whatsapp'
        let oData = data
        return oAxios.post(api, oData)
      },
      sendTelegram: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_telegram'
        let oData = data
        return oAxios.post(api, oData)
      },
      sendTeams: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_teams'
        let oData = data
        return oAxios.post(api, oData)
      },
      sendSlack: function (data, others) {
        let api = '/rmm/v1/notifymgmt/send_slack'
        let oData = data
        return oAxios.post(api, oData)
      },
    },
    put: {
      customizedNotifications: function (data, others) {
        let api = '/rmm/v1/notifymgmt/custom'
        let oData = data
        return oAxios.put(api, oData)
      },
      notifications: function (data, others) {
        let api = '/rmm/v1/notifymgmt'
        let oData = data
        return oAxios.put(api, oData)
      }
    },
    delete: {
      customizedNotification: function (eid, others) {
        let api = '/rmm/v1/notifymgmt/custom?eid=' + eid
        return oAxios.delete(api)
      },
      bindNotification: function (eid, aid, others) {
        let oaid
        if (aid) { oaid = '&aid=' + aid }
        let api = '/rmm/v1/notifymgmt/bind?eid=' + eid + oaid
        return oAxios.delete(api)
      },
    }
  },
  events: {
    get: {
      events: function (accountId, groupId, eventType, severity, category, beginTs, endTs, orderBy, orderType, like, forExport, pageSize, no, others) {
        let url, language
        let currentLanguage = RMMGlobal.currentLanguage()
        if (currentLanguage) {
          if (currentLanguage === 'zh-TW') { language = 'zh-TW' } else if (currentLanguage === 'zh-CN') { language = 'zh-CN' } else { language = 'en-US' }
        } else {
          language = 'en-US'
        }
        if (eventType.toLowerCase() === 'device') {
          url =
          '/rmm/v1/events/devices?' +
          'severity=' + severity +
          '&groupId=' + groupId +
          '&beginTs=' + beginTs +
          '&endTs=' + endTs +
          '&orderBy=' + orderBy +
          '&orderType=' + orderType +
          '&language=' + language +
          '&pageSize=' + pageSize +
          '&no=' + no
        } else if (eventType.toLowerCase() === 'operation') {
          if (groupId) {
            url = '/rmm/v1/events/operation?' +
            'severity=' + severity +
            '&accountId=' + accountId +
            '&groupId=' + groupId +
            '&beginTs=' + beginTs +
            '&endTs=' + endTs +
            '&orderBy=' + orderBy +
            '&orderType=' + orderType +
            '&language=' + language +
            '&pageSize=' + pageSize +
            '&no=' + no
          } else {
            url = '/rmm/v1/events/operation?' +
            'severity=' + severity +
            '&accountId=' + accountId +
            '&beginTs=' + beginTs +
            '&endTs=' + endTs +
            '&orderBy=' + orderBy +
            '&orderType=' + orderType +
            '&language=' + language +
            '&pageSize=' + pageSize +
            '&no=' + no
          }
        } else if (eventType.toLowerCase() === 'system') {
          if (groupId) {
            url = '/rmm/v1/events/system?' +
            'severity=' + severity +
            '&accountId=' + accountId +
            '&groupId=' + groupId +
            '&beginTs=' + beginTs +
            '&orderBy=' + orderBy +
            '&endTs=' + endTs +
            '&orderType=' + orderType +
            '&language=' + language +
            '&pageSize=' + pageSize +
            '&no=' + no
          } else {
            url = '/rmm/v1/events/system?' +
            'severity=' + severity +
            '&accountId=' + accountId +
            '&beginTs=' + beginTs +
            '&endTs=' + endTs +
            '&orderBy=' + orderBy +
            '&orderType=' + orderType +
            '&language=' + language
          }
        }

        if (category !== 'All') { url += '&category=' + category }

        if (like !== '') {
          url += '&like_field=message%7Cagent_name%7Cseverity%7Csubtype'
          url += '&like_condition=' + like
        }

        if (forExport) { url += '&amount=10000' }
        // if (forExport) { url += '&amount=10000' } else { url += '&amount=20' }

        if (pageSize && no) { url += '&pageSize=' + pageSize + '&no=' + no }

        let api = url
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceEvents: function (agentId, groupId, eventType, severity, category, beginTs, endTs, orderType, others) {
        let language
        let currentLanguage = RMMGlobal.currentLanguage()
        if (currentLanguage) {
          if (currentLanguage === 'zh-TW') { language = 'zh-TW' } else if (currentLanguage === 'zh-CN') { language = 'zh-CN' } else { language = 'en-US' }
        }

        var url = '/rmm/v1/events/devices?' + 'severity=' + severity + '&agentId=' + agentId + '&beginTs=' + beginTs + '&endTs=' + endTs + '&orderType=' + orderType + '&language=' + language + '&amount=10'

        if (category !== 'All') { url += '&category=' + category }

        let api = url
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    delete: {
      events: function (type, dateTime, timeZone, others) {
        let api = '/rmm/v1/events?type=' + type + '&dateTime=' + dateTime + '&timeZone=' + timeZone
        return oAxios.delete(api)
      }
    }
  },
  settings: {
    get: {
      setting: async function (service, others) {
        let api = '/rmm/v1/settings?type=' + service + '&_=' + new Date().getTime()
        let oData = {}
        let res = await oAxios.get(api, { params: oData })
        return res
      },
      settings: async function (others) {
        let api = '/rmm/v1/settings'
        let res = await oAxios.get(api)
        return res
      },
      settingsEnabled: async function (featureName, ...args) {
        let api = '/rmm/v1/settings/enabled?f=' + featureName
        if (args.length > 0) {
          for (let i = 0; i < args.length; i++) {
            api += '&f=' + args[i]
          }
        }
        let res = await oAxios.get(api)
        return res
      },
      pluginListByDevice: async function (agentId, others) {
        let api = '/rmm/v1/data/devices/sensorinfos?agentId=' + agentId
        let res = await oAxios.get(api)
        return res
      },
      pluginListByGroup: async function (gid, others) {
        let api = '/rmm/v1/data/groups/sensorinfos?gid=' + gid
        let res = await oAxios.get(api)
        return res
      },
      pluginListByGroupBasic: async function (gid, others) {
        let api = '/rmm/v1/data/groups/sensorinfos?all=false&gid=' + gid
        let res = await oAxios.get(api)
        return res
      },
      ruleSensor: async function (did, pluginName, others) {
        let api = '/rmm/v1/devices/' + did + '/' + pluginName + '/sensors'
        let res = await oAxios.get(api)
        return res
      },
      ruleCapability: async function (did, language, others) {
        let api = '/rmm/v1/data/devices/' + did + '/capability?&language=' + language
        let res = await oAxios.get(api)
        return res
      },
      ruleActionsByAgentId: async function (agentId, others) {
        let api = '/rmm/v1/data/devices/rule_actions?agentId=' + agentId
        let res = await oAxios.get(api)
        return res
      },
      ruleActionsByGroupId: async function (gid, others) {
        let api = '/rmm/v1/data/devices/rule_actions?groupId=' + gid
        let res = await oAxios.get(api)
        return res
      },
      currentValue: async function (did, agentId, pluginName, sensorId, others) {
        let api = '/rmm/v1/devicectrl/devices/' + did + '/data?agentId=' + agentId + '&plugin=' + pluginName + '&sensorId=' + sensorId
        let res = await oAxios.get(api)
        return res
      },
      ruleList: async function (type, aid, others) {
        let api = '/rmm/v1/rules?type=' + type + '&aid=' + aid
        let res = await oAxios.get(api)
        return res
      },
      screenshot: async function () {
        let api = '/rmm/v1/settings/screenshot'
        let res = await oAxios.get(api)
        return res
      },
      ldap: async function () {
        let api = '/rmm/v1/settings/ldap'
        let res = await oAxios.get(api)
        return res
      }
    },
    post: {
      setDeviceRule: function (data, others) {
        debugger
        let api = '/rmm/v1/rules/device/'
        let oData = data
        return oAxios.post(api, oData)
      },
      setGroupRule: function (data, others) {
        let api = '/rmm/v1/rules/group/'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      settings: async function (data, others) {
        let api = '/rmm/v1/settings'
        let oData = data
        let res = await oAxios.put(api, oData)
        return res
      },
      updateDeviceRule: function (data, others) {
        let api = '/rmm/v1/rules/device/'
        let oData = data
        return oAxios.put(api, oData)
      },
      updateGroupRule: function (data, others) {
        let api = '/rmm/v1/rules/group/'
        let oData = data
        return oAxios.put(api, oData)
      }
    },
    patch: {
      report: function (data, others) {
        let api = '/rmm/v1/settings/system/report'
        let oData = data
        return oAxios.patch(api, oData)
      },
      screenshot: function (data) {
        let api = '/rmm/v1/settings/screenshot'
        let oData = data
        return oAxios.patch(api, oData)
      },
      ldap: function (data) {
        let api = '/rmm/v1/settings/ldap'
        let oData = data
        return oAxios.patch(api, oData)
      }
    },
    delete: {
      rule: async function (ruleId, others) {
        let api = '/rmm/v1/rules/' + ruleId
        let res = await oAxios.delete(api)
        return res
      }
    }
  },
  system: {
    get: {
      system: function (others) {
        let api = '/rmm/v1/system'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      iscfapp: function (others) {
        let api = '/rmm/v1/system/iscfapp'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      report: function (data, others) {
        let api = '/rmm/v1/system/report'
        let oData = data
        return oAxios.get(api, { params: oData })
      },
      downloadReport: function (reportId, others) {
        let api = '/rmm/v1/system/report/' + reportId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      checkIsOffline: function (others) {
        let api = '/rmm/v1/system/activate/connectionTest'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      customer: function (others) {
        let api = '/rmm/v1/system/customer'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      activationQrcode: function (others) {
        let api = '/rmm/v1/system/activation/qrcode'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
    },
    post: {
      activateServer: function (data, others) {
        let api = '/rmm/v1/system/activate'
        let oData = data
        return oAxios.post(api, oData)
      },
      trialExtend: function (data, others) {
        let api = '/rmm/v1/system/trialExtend'
        let oData = data
        return oAxios.post(api, oData)
      },
      licenseExtend: function (data, others) {
        let api = '/rmm/v1/system/license/extend'
        let oData = data
        return oAxios.post(api, oData)
      },
      feedback: function (data, others) {
        let api = '/rmm/v1/system/feedback'
        let oData = data
        return oAxios.post(api, oData)
      }
    }
  },
  mp: {
    post: {
      serviceKeys: function (data, others) {
        let api = '/rmm/v1/mp/service_keys'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      serviceKeys: function (data, serviceKeyGuid, others) {
        let api = '/rmm/v1/mp/service_keys/' + serviceKeyGuid
        let oData = data
        return oAxios.put(api, oData)
      }
    }
  },
  sso: {
    get: {
      users: function (others) {
        let api = '/rmm/v1/sso/users/'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      logout: function (others) {
        let api = '/rmm/v1/sso/logout?redirectUri=' + window.location.origin
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      resetPassword: function (userEmail, others) {
        let api = '/rmm/v1/sso/users/' + userEmail + '/pwdresetemail'
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      login: function (data, others) {
        let api = '/rmm/v1/sso/login'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    patch: {
      userScope: function (userEmail, data, others) {
        let api = '/rmm/v1/sso/users/' + userEmail + '/scopes'
        let oData = data
        return oAxios.patch(api, oData)
      },
      activation: function (username, activationCode, newPasswd, others) {
        let api = '/rmm/v1/sso/activation/users/' + username + '/password?activationCode=' + activationCode
        let oData = { new_password: newPasswd }
        return oAxios.patch(api, oData)
      },
      changePassword: function (userEmail, data, others) {
        let api = '/rmm/v1/sso/users/' + userEmail + '/password'
        let oData = data
        return oAxios.patch(api, oData)
      },
    }
  },
  scheduleControl: {
    get: {
      allschedule: function (parameters, others) {
        let api = '/rmm/schedulecontrol/all/schedule?'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      schedulecontrol: function (type, others) {
        let api = '/rmm/schedulecontrol/schedules?type=' + type
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    delete: {
      scheduleByGid: function (gid, pkgType, actType, others) {
        let api = '/rmm/schedulecontrol/group/' + gid + '/schedule?pkgType=' + pkgType + '&actType=' + actType
        return oAxios.delete(api)
      },
      scheduleByDid: function (did, pkgType, actType, others) {
        let api = '/rmm/schedulecontrol/schedule?agentIds=' + did + '&pkgType=' + pkgType + '&actType=' + actType
        return oAxios.delete(api)
      }
    }
  },
  schedules: {
    get: {
      schedule: function (sid, others) {
        let api = '/rmm/v1/schedules/' + sid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      schedules: function (parameters, others) {
        let api = '/rmm/v1/schedules'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      device: function (data, others) {
        let api = '/rmm/v1/schedules/devices/'
        let oData = data
        return oAxios.post(api, oData)
      },
      deviceGroup: function (data, others) {
        let api = '/rmm/v1/schedules/groups/'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      device: function (data, others) {
        let api = '/rmm/v1/schedules/devices/'
        let oData = data
        return oAxios.put(api, oData)
      },
      deviceGroup: function (data, others) {
        let api = '/rmm/v1/schedules/groups/'
        let oData = data
        return oAxios.put(api, oData)
      }
    },
    delete: {
      schedule: function (sid, others) {
        let api = '/rmm/v1/schedules/' + sid
        return oAxios.delete(api)
      }
    }
  },
  protection: {
    get: {
      accountsGroupDevice: function (aid) {
        let api = '/rmm/v1/protection/groups/account/' + aid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceGroups: function (gid, others) {
        let api = '/rmm/v1/protection/groups/' + gid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      statusNumber: function (others) {
        let api = '/rmm/v1/protection/devices/own/status/number'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      status: function (others) {
        let api = '/rmm/v1/protection/devices/own/status'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devices: function (agentId) {
        let api = '/rmm/v1/protection/devices?agentId=' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    put: {
      devices: function (data, others) {
        let api = '/rmm/v1/protection/device'
        let oData = data
        return oAxios.put(api, oData)
      },
      devices_sn: function (data, others) {
        let api = '/rmm/v1/protection/device_sn'
        let oData = data
        return oAxios.put(api, oData)
      },
      deviceGroups: function (data, others) {
        let api = '/rmm/v1/protection/group'
        let oData = data
        return oAxios.put(api, oData)
      },
      deviceGroups_sn: function (data, others) {
        let api = '/rmm/v1/protection/group_sn'
        let oData = data
        return oAxios.put(api, oData)
      }
    }
  },
  recovery: {
    get: {
      accountsGroupDevice: function (aid) {
        let api = '/rmm/v1/recovery/groups/account/' + aid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceGroups: function (gid, others) {
        let api = '/rmm/v1/recovery/groups/' + gid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      statusNumber: function (others) {
        let api = '/rmm/v1/recovery/devices/own/status/number'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      status: function (others) {
        let api = '/rmm/v1/recovery/devices/own/status'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devices: function (agentId) {
        let api = '/rmm/v1/recovery/devices?agentId=' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    put: {
      devices: function (data, others) {
        let api = '/rmm/v1/recovery/device'
        let oData = data
        return oAxios.put(api, oData)
      },
      devices_sn: function (data, others) {
        let api = '/rmm/v1/recovery/device_sn'
        let oData = data
        return oAxios.put(api, oData)
      },
      deviceGroups: function (data, others) {
        let api = '/rmm/v1/recovery/group'
        let oData = data
        return oAxios.put(api, oData)
      },
      deviceGroups_sn: function (data, others) {
        let api = '/rmm/v1/recovery/group_sn'
        let oData = data
        return oAxios.put(api, oData)
      }
    }
  },
  power: {
    get: {
      device: function (did, others) {
        let api = '/rmm/v1/power/devices/' + did
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    put: {
      devices: function (data, others) {
        let api = '/rmm/v1/power/device'
        let oData = data
        return oAxios.put(api, oData)
      },
      deviceGroups: function (data, others) {
        let api = '/rmm/v1/power/group'
        let oData = data
        return oAxios.put(api, oData)
      }
    }
  },
  iamt: {
    get: {
      devices: function (agentId, others) {
        let api = '/rmm/v1/iamt/devices?agentId=' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
    },
    post: {
      devices: function (data, others) {
        let api = '/rmm/v1/iamt/devices'
        let oData = data
        return oAxios.post(api, oData)
      }
    }
  },
  ibmc: {
    post: {
      devices: function (data, others) {
        let api = '/rmm/v1/ibmc'
        let oData = data
        return oAxios.post(api, oData)
      }
    }
  },
  devicectrl: {
    get: {
      sensorRealTimeData: function (did, agentId, plugin, sensorId, others) {
        let api = '/rmm/v1/devicectrl/devices/data?agentId=' + agentId + '&plugin=' + plugin + '&sensorId=' + sensorId
        api = encodeURI(api)
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      selfWeb: function (agentId, plugin, others) {
        let api = '/rmm/v1/devicectrl/selfweb?agentId=' + agentId + '&plugin=' + plugin
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      selfWeb: function (others) {
        let api = '/rmm/v1/devicectrl/selfweb'
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    put: {
      sensor: function (data, others) {
        let api = '/rmm/v1/devicectrl/data'
        let oData = data
        return oAxios.put(api, oData)
      },
      periodicReport: function (data, others) {
        let api = '/rmm/v1/devicectrl/periodic_report'
        let oData = data
        return oAxios.put(api, oData)
      },
      suspendReport: function (data, others) {
        let api = '/rmm/v1/devicectrl/report_suspension'
        let oData = data
        return oAxios.put(api, oData)
      },
      intermittentReport: function (data, others) {
        let api = '/rmm/v1/devicectrl/intermittent_report'
        let oData = data
        return oAxios.put(api, oData)
      }
    }
  },
  data: {
    get: {
      pluginLatestData: function (did, agentId, handler, sensorId, others) {
        // let api = '/rmm/v1/data/devices/' + did + '/latestdata_by_opts?agentId=' + agentId + '&plugin=' + handler
        // let api = '/rmm/v1/data/devices/latestdata_by_opts?agentId=' + agentId + '&plugin=' + handler
        let api = '/rmm/v1/data/devices/latestdata?agentId=' + agentId + '&plugin=' + handler
        if (sensorId) { api = api + '&sensorId=' + sensorId }

        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      histdata: function (agentId, plugin, sensorId, beginTs, endTs, amount, order, others) {
        let api = '/rmm/v1/data/devices/histdata?agentId=' + agentId + '&plugin=' + plugin + '&sensorId=' + sensorId + '&beginTs=' + beginTs + '&endTs=' + endTs + '&amount=' + amount + '&order=' + order
        // let api = '/rmm/v1/data/devices/histdata/delimited?agentId=' + agentId + '&plugin=' + plugin + '&sensorId=' + sensorId + '&beginTs=' + beginTs + '&endTs=' + endTs + '&amount=' + amount + '&order=' + order
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      capability: function (agentId, plugin, current, analysis) {
        // let api = (handler) ? '/rmm/v1/data/devices/' + did + '/capability?plugin=' + handler : '/rmm/v1/data/devices/' + did + '/capability'
        let api = '/rmm/v1/data/devices/capability?agentId=' + agentId
        if (plugin) { api = api + '&plugin=' + plugin }
        if (current) { api = api + '&current=' + current }
        if (analysis) { api = api + '&analysis=' + analysis }

        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      capabilityRefresh: async function (agentId, plugin, others) {
        let api = '/rmm/v1/data/devices/capability?agentId=' + agentId
        if (plugin) { api = api + '&plugin' + plugin }
        let oData = {}
        let res = await oAxios.get(api, { params: oData })
        if (res.data.PluginManage && res.data.PluginManage.action) {
          // set PluginManage refresh
          let octrlData = {}
          octrlData.agentid = agentId
          octrlData.plugin = 'PluginManage'
          octrlData.sensorIds = []
          let oSensor = {}
          oSensor.bv = true
          oSensor.n = '/action/Reflash'
          octrlData.sensorIds.push(oSensor)
          let ctrlapi = '/rmm/v1/devicectrl/data'
          let oRet = {}
          await oAxios.put(ctrlapi, octrlData)
            .then(async function (xhr) {
              if (xhr.data && xhr.data.items && xhr.data.items[0].statusCode === 200) {
                let api = '/rmm/v1/data/devices/capability?agentId=' + agentId
                let oData = {}
                oRet = await oAxios.get(api, { params: oData })
              } else {
                oRet = xhr
              }
            })
            .catch(async function (error) {
              // DeviceOnApis.MessageBox.Error(self, error)
              console.log(error)
              oRet = res
            })
          return oRet
        } else {
          return res
        }
      },
    },
    delete: {
      deviceData: function (dateTime, timeZone, others) {
        let api = '/rmm/v1/data?dateTime=' + dateTime + '&timeZone=' + timeZone
        return oAxios.delete(api)
      }
    }
  },
  screenshot: {
    get: {
      device: function (agentId, resType, others) {
        let api = '/rmm/v1/screenshot/devices?agentId=' + agentId + '&resType=' + resType
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    }
  },
  kvm: {
    post: {
      device: function (data, others) {
        let api = '/rmm/v1/kvm/'
        let oData = data
        return oAxios.post(api, oData)
      }
    }
  },
  processes: {
    put: {
      device: function (data, others) {
        let api = '/rmm/v1/processes/'
        let oData = data
        return oAxios.put(api, oData)
      }
    },
    post: {
      device: function (data, others) {
        let api = '/rmm/v1/processes/'
        let oData = data
        return oAxios.post(api, oData)
      }
    }
  },
  rules: {
    get: {
      deviceGroup: function (gid, others) {
        let api = '/rmm/v1/rules/groups/' + gid
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      deviceRuleMap: function (did, others) {
        let api = '/rmm/v1/rules/rulemaps/devices/' + did
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    put: {
      deviceGroups: function (data, others) {
        let api = '/rmm/v1/rules/group/'
        let oData = data
        return oAxios.put(api, oData)
      },
      devices: function (data, others) {
        let api = '/rmm/v1/rules/device/'
        let oData = data
        return oAxios.put(api, oData)
      },
      ruleMaps: function (data, others) {
        let api = '/rmm/v1/rules/rulemaps/devices'
        let oData = data
        return oAxios.put(api, oData)
      }

    },
    post: {
      deviceGroup: function (data, others) {
        let api = '/rmm/v1/rules/group/'
        let oData = data
        return oAxios.post(api, oData)
      },
      device: function (data, others) {
        let api = '/rmm/v1/rules/device/'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    delete: {
      rule: function (rid, others) {
        let api = '/rmm/v1/rules/' + rid
        return oAxios.delete(api)
      }
    }
  },
  appinfo: {
    get: {
      version: function () {
        let api = '/rmm/v1/appinfo/version'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      info: function () {
        let api = '/rmm/v1/appinfo/info?product=deviceon'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
    }
  },
  proxy: {
    get: {
      proxy: function (url, auth, others) {
        let api = '/rmm/v1/proxy?url=' + url + '&authorization=' + auth
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      proxy: function (data, others) {
        let api = '/rmm/v1/proxy'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    delete: {
      proxy: function (url, auth, others) {
        let api = '/rmm/v1/proxy?url=' + url + '&authorization=' + auth
        return oAxios.delete(api)
      }
    }
  },
  prediction: {
    get: {
      sensorReport: function (did, agentId, plugin, sensorId, others) {
        let api = '/rmm/v1/prediction/devices/data?agentId=' + agentId + '&plugin=' + plugin + '&sensorId=' + sensorId
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    }
  },
  action: {
    get: {
      actionTypes: function (language, others) {
        let api = '/rmm/v1/action/types?&language=' + language
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      actionDefined: async function (language, others) {
        let api = '/rmm/v1/action/defined?&language=' + language
        let oData = {}
        let res = await oAxios.get(api, { params: oData })
        return res
      },
      actionExex: function (others) {
        let api = '/rmm/v1/action/exec'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      actionExexCheck: function (actionId, others) {
        let api = '/rmm/v1/action/exec/check/' + actionId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      actionExexTime: function (StartTime, EndTime, others) {
        let api = '/rmm/v1/action/exec?st=' + StartTime + '&et=' + EndTime
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      scheduleList: function (StartTime, EndTime, others) {
        let api = '/rmm/v1/action/schedule?st=' + StartTime + '&et=' + EndTime
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      action: function (data, others) {
        let api = '/rmm/v1/action/defined'
        let oData = data
        return oAxios.post(api, oData)
      },
      actionExex: function (data, others) {
        let api = '/rmm/v1/action/exec/tally'
        let oData = data
        return oAxios.post(api, oData)
      },
      actionSchedule: function (data, others) {
        let api = '/rmm/v1/action/schedule'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      action: function (data, others) {
        let api = '/rmm/v1/action/defined'
        let oData = data
        return oAxios.put(api, oData)
      },
      runAction: function (definedId, data, others) {
        let api = '/rmm/v1/action/fire/' + definedId
        let oData = data
        return oAxios.put(api, oData)
      },
      actionSchedule: function (data, others) {
        let api = '/rmm/v1/action/schedule'
        let oData = data
        return oAxios.put(api, oData)
      },
    },
    delete: {
      action: function (eid, others) {
        let api = '/rmm/v1/action/defined/' + eid
        return oAxios.delete(api)
      },
      actionSchedule: function (sid, others) {
        let api = '/rmm/v1/action/schedule/' + sid
        return oAxios.delete(api)
      }
    }
  },
  ota: {
    get: {
      fetchNorm: function () {
        let api = '/rmm/upgradecontrol/upgrader/norm'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      storage: function () {
        let api = '/rmm/storagemanager/storages'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      package: function (stgId, others) {
        let api = '/rmm/packagecontrol/packages'
        if (stgId) api += '?stgId=' + stgId
        let oData = others
        return oAxios.get(api, { params: oData })
      },
      packageByAgent: function (agentId) {
        let api = '/rmm/packagecontrol/device/packages?agentId=' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      packageByAgentInfo: function (agentId) {
        let api = '/rmm/v1/devices/upgrade-info/' + agentId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      packageCategory: function (stgId) {
        let api = '/rmm/packagecontrol/all/package/category?stgId=' + stgId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      packageSupport: function (agentId, support, startIndex, obtainCnt, stgId) {
        let api = '/rmm/packagecontrol/device/packages/support?agentId=' + agentId
        if (support) api += '&support=' + support
        if (startIndex) api += '&startIndex=' + startIndex
        if (obtainCnt) api += '&obtainCnt=' + obtainCnt
        if (stgId) api += '&stgId=' + stgId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      packageInstall: function (agentId, stgId) {
        let api = '/rmm/packagecontrol/device/packages/install?agentId=' + agentId
        if (stgId) api += '&stgId=' + stgId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      packageHasnew: function (agentId, stgId) {
        let api = '/rmm/packagecontrol/device/packages/hasnew?agentId=' + agentId
        if (stgId) api += '&stgId=' + stgId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      fetchDelStatusCluster: function (stgId, pkgname) {
        let api = '/rmm/packagecontrol/cluster/package/deletestatus?stgId=' + stgId + '&names=' + pkgname
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      fetchFileSizeLimit: function () {
        let api = '/rmm/upgradecontrol/upgrader/norm'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      upgradeDevices: function (gid, page, searchKey) {
        const filter = { status: 'ONLINE' } // status: ALL/ONLINE/OFFLINE
        const sort = { key: 'name', order: 'ASC' }
        let api = `/rmm/otadevicemanager/group/${gid}/devices`
        api += `?searchKey=${searchKey}`
        api += `&sortKey=${sort.key}&sortType=${sort.order}`
        api += `&statusType=${filter.status}`
        let oData = page
        return oAxios.get(api, { params: oData })
      },
      hasSoftwareInfoHandler: function (agentId) {
        let api = `/rmm/v1/devices?agentId=${agentId}`
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      listPrograms: function (agentId, deviceId) {
        let api = '/rmm/v1/data/devices'
        api += ('/' + deviceId)
        api += ('/latestdata')
        api += ('?agentId=' + agentId)
        api += ('&plugin=SoftwareInfoHandler')
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      listPackages: function (agentId, pkgOwnerId) {
        let api = '/rmm/upgradecontrol/bydevice/extantpackage'
        api += '?agentId=' + agentId + '&pkgOwnerId=' + pkgOwnerId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      listSoftwares: function (agentId) {
        let api = `/rmm/otadevicemanager/bydevice/softwares?agentId=${agentId}`
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      listSchedule: function (type, agentId, gid, actType = undefined) {
        let api = '/rmm/schedulecontrol/group/' + gid + '/somedevice/schedule?agentId=' + agentId
        if (type === 'Device') {
          api = '/rmm/schedulecontrol/group/' + gid + '/somedevice/schedule?agentId=' + agentId
        } else {
          api = '/rmm/schedulecontrol/group/' + gid + '/schedule'
        }

        if (actType) api += ('&actType=' + actType)
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      AgnetScheduleListAll: function (agentId) {
        let api = `/rmm/schedulecontrol/somedevice/schedule?agentId=${agentId}`
        return oAxios.get(api)
      },
      listUpgradeStatus: function (agentId, statusType) {
        let api = '/rmm/upgradecontrol/bydevice/lastfailed/upgradestatus'
        api += ('?agentId=' + agentId)
        api += ('&statusType=' + (statusType === 'ongoing' ? 'ds' : 'lfs'))
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      fetchTypeAll: function (stgId) {
        let api = '/rmm/packagecontrol/all/package/type'
        if (stgId) api += '?stgId=' + stgId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      uploadstatus: function (stgId, pkgName, pkgOwnerId) {
        let api = '/rmm/packagecontrol/byname/package/uploadstatus'
        if (stgId) api += '?stgId=' + stgId + '&name=' + pkgName + '&pkgOwnerId=' + pkgOwnerId

        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      upgrader: function (data, others) {
        let api = '/rmm/upgradecontrol/upgrader'
        let oData = {}
        if (data.type === 'Device') {
          api = '/rmm/upgradecontrol/upgrader'
          oData.agentIds = data.agentIds
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        } else {
          api = '/rmm/upgradecontrol/group/' + data.gid + '/upgrader'
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        }
        return oAxios.post(api, oData)
      },
      downloader: function (data, others) {
        let api = '/rmm/upgradecontrol/downloader'
        let oData = {}
        if (data.type === 'Device') {
          api = '/rmm/upgradecontrol/downloader'
          oData.agentIds = data.agentIds
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        } else {
          api = '/rmm/upgradecontrol/group/' + data.gid + '/downloader'
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        }
        return oAxios.post(api, oData)
      },
      deployer: function (data, others) {
        let api = '/rmm/upgradecontrol/deployer'
        let oData = {}
        if (data.type === 'Device') {
          api = '/rmm/upgradecontrol/deployer'
          oData.agentIds = data.agentIds
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        } else {
          api = '/rmm/upgradecontrol/group/' + data.gid + '/deployer'
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        }
        return oAxios.post(api, oData)
      },
      setNorm: function (data, others) {
        let api = '/rmm/upgradecontrol/upgrader/norm'
        let oData = data
        return oAxios.post(api, oData)
      },
      storage: function (data, others) {
        let api = '/rmm/storagemanager/storage'
        let oData = data
        return oAxios.post(api, oData)
      },
      package: function (data, config, others) {
        let api = '/rmm/packagecontrol/package'
        let oData = data
        return oAxios.post(api, oData, config)
      },
      setupSchedule: function (type, data, gid) {
        let api = '/rmm/schedulecontrol/schedule'
        if (type === 'Group') api = `/rmm/schedulecontrol/group/${gid}/schedule`
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      storage: function (data, others) {
        let api = '/rmm/storagemanager/storage'
        let oData = data
        return oAxios.put(api, oData)
      },
    },
    delete: {
      storage: function (id, others) {
        let api = '/rmm/storagemanager/storage?storageId=' + id
        return oAxios.delete(api)
      },
      package: function (stgId, pkgname, others) {
        // let api = '/rmm/packagecontrol/byname/package?stgId=' + stgId + '&names=' + pkgname
        let api = '/rmm/packagecontrol/cluster/package?stgId=' + stgId + '&names=' + pkgname

        return oAxios.delete(api)
      },
      removePackages: function (agentId, pkgOwnerId, pkgs) {
        let api = '/rmm/upgradecontrol/bydevice/extantpackage'
        let oData = {}
        oData.data = {
          agentId,
          pkgOwnerId: pkgOwnerId,
          pkgNames: pkgs,
        }
        return oAxios.delete(api, oData)
      },
      removeSchedule: function (agentIdOrGid, actType, pkgType, pkgOwnerId) {
        const isGroupMode = typeof agentIdOrGid === 'number'
        let api = '/rmm/schedulecontrol/schedule?'
        if (isGroupMode) {
          api = `/rmm/schedulecontrol/group/${agentIdOrGid}/schedule`
          let subUrl = ''
          if (pkgType) {
            subUrl = '?' + 'pkgType=' + pkgType
          }
          if (actType) {
            if (subUrl.length === 0) {
              subUrl = '?' + 'actType=' + actType
            } else {
              subUrl += '&' + 'actType=' + actType
            }
          }
          if (pkgOwnerId) {
            if (subUrl.length === 0) {
              subUrl = '?' + 'pkgOwnerId=' + pkgOwnerId
            } else {
              subUrl += '&' + 'pkgOwnerId=' + pkgOwnerId
            }
          }
          api += subUrl
        } else {
          api += 'agentIds=' + agentIdOrGid
          if (pkgType) { api += '&' + 'pkgType=' + pkgType }
          if (actType) { api += '&' + 'actType=' + actType }
          if (pkgOwnerId) { api += '&' + 'pkgOwnerId=' + pkgOwnerId }
        }
        return oAxios.delete(api)
      },
      upgrader: function (data, others) {
        let api = '/rmm/upgradecontrol/upgrader'
        let oData = {}
        if (data.type === 'Device') {
          api = '/rmm/upgradecontrol/upgrader'
          oData.agentIds = data.agentIds
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        } else {
          api = '/rmm/upgradecontrol/group/' + data.gid + '/upgrader'
          oData.pkgName = data.pkgName
          oData.pkgOwnerId = data.pkgOwnerId
          oData.stgId = data.stgId
        }
        return oAxios.delete(api, { data: oData })
      },
    }
  },
  file: {
    get: {
      localFile: function (strFile, isLinkServer) {
        let api
        if (process.env.NODE_ENV === 'development' && isLinkServer) {
          api = baseURL.RMM + strFile
        } else {
          api = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/')) + strFile
        }
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
    }
  },
  ui: {
    get: {
      system: function (others) {
        let api = '/rmm/v1/ui-config/system'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      my: function (others) {
        let api = '/rmm/v1/ui-config/my'
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      system: function (data, others) {
        let api = '/rmm/v1/ui-config/system'
        let oData = data
        return oAxios.post(api, oData)
      },
      my: function (data, others) {
        let api = '/rmm/v1/ui-config/my'
        return oAxios.post(api, { params: data })
      }
    }
  },
  plugin: {
    get: {
      allPlugin: function (pluginName) {
        let api = '/rmm/v1/plugin-config/' + pluginName
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      plugin: function (pluginName, configName) {
        let api = '/rmm/v1/plugin-config/' + pluginName + '/' + configName
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    },
    patch: {
      plugin: function (pluginName, data) {
        let api = '/rmm/v1/plugin-config/' + pluginName
        let oData = data
        return oAxios.patch(api, oData)
      },
    },
    put: {
      allPlugin: function (pluginName, data) {
        let api = '/rmm/v1/plugin-config/' + pluginName
        let oData = data
        return oAxios.put(api, oData)
      },
      plugin: function (pluginName, configName, data) {
        let api = '/rmm/v1/plugin-config/' + pluginName + '/' + configName
        let oData = data
        return oAxios.put(api, oData)
      }
    },
    delete: {
      allPlugin: function (pluginName) {
        let api = '/rmm/v1/plugin-config/' + pluginName
        return oAxios.delete(api)
      },
      plugin: function (pluginName, configName) {
        let api = '/rmm/v1/plugin-config/' + pluginName + '/' + configName
        return oAxios.delete(api)
      }
    }
  },
  ads: {
    get: {
      anomaly: function (agentId, since, to, type, screenshot, pageSize, no) {
        let api = '/rmm/v1/ads/anomaly?agentId=' + agentId + '&since=' + since + '&to=' + to + '&screenshot=' + screenshot + '&pageSize=' + pageSize + '&no=' + no
        if (type !== '') {
          api = '/rmm/v1/ads/anomaly?agentId=' + agentId + '&since=' + since + '&to=' + to + '&type=' + type + '&screenshot=' + screenshot + '&pageSize=' + pageSize + '&no=' + no
        }
        return oAxios.get(api)
      },
      anomalyLast: function (type, screenshot, pageSize, no) {
        let api = '/rmm/v1/ads/anomaly/last?screenshot=' + screenshot + '&pageSize=' + pageSize + '&no=' + no
        if (type !== '') {
          api = '/rmm/v1/ads/anomaly/last?type=' + type + '&screenshot=' + screenshot + '&pageSize=' + pageSize + '&no=' + no
        }
        return oAxios.get(api)
      },
      anomalyById: function (anomalyId) {
        let api = '/rmm/v1/ads/anomaly/' + anomalyId
        return oAxios.get(api)
      },
      rule: function (pageSize, no) {
        let api = '/rmm/v1/ads?pageSize=' + pageSize + '&no=' + no
        return oAxios.get(api)
      },
      device: function (agentId) {
        let api = '/rmm/v1/ads/device/' + agentId
        return oAxios.get(api)
      },
      group: function (groupId) {
        let api = '/rmm/v1/ads/group/' + groupId
        return oAxios.get(api)
      },
      anomalydevice: function (gid, since, to, pageSize, no) {
        let api = '/rmm/v1/ads/anomaly/group/' + gid + '/devices?'
        if (since) api += 'since=' + since
        if (to) api += '&to=' + to
        if (pageSize && no) api += '&pageSize=' + pageSize + '&no=' + no
        return oAxios.get(api)
      },
      setting: function () {
        let api = '/rmm/v1/ads/setting'
        return oAxios.get(api)
      },
    },
    post: {
      device: function (agentId, data) {
        let api = '/rmm/v1/ads/device/' + agentId
        let oData = data
        return oAxios.post(api, oData)
      },
      group: function (groupId, data) {
        let api = '/rmm/v1/ads/group/' + groupId
        let oData = data
        return oAxios.post(api, oData)
      },
    },
    patch: {
      device: function (agentId, data) {
        let api = '/rmm/v1/ads/device/' + agentId
        let oData = data
        return oAxios.patch(api, oData)
      },
      group: function (groupId, data) {
        let api = '/rmm/v1/ads/group/' + groupId
        let oData = data
        return oAxios.patch(api, oData)
      },
      setting: function (data) {
        let api = '/rmm/v1/ads/setting'
        let oData = data
        return oAxios.patch(api, oData)
      },
    },
    delete: {
      device: function (agentId) {
        let api = '/rmm/v1/ads/device/' + agentId
        return oAxios.delete(api)
      },
      group: function (groupId) {
        let api = '/rmm/v1/ads/group/' + groupId
        return oAxios.delete(api)
      }
    }
  },
  statistics: {
    get: {
      abnormalSystemVoltage: function (base = 0.05) {
        let api = '/rmm/v1/devices/statistics/abnormal-system-voltage?base=' + base
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      ramSPDLock: function () {
        let api = '/rmm/v1/devices/statistics/ram-spd-lock'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      ssdOPALEnabled: function () {
        let api = '/rmm/v1/devices/statistics/ssd-opal'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      virusPatternStatus: function () {
        let api = '/rmm/v1/devices/statistics/virus-pattern'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      rAMBusSpeed: function () {
        let api = '/rmm/v1/devices/statistics/group-v?pluginName=SQPlugin&sensorId=/data/RAMList/RAM%/Speed&exactly=false'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      dataReliability: function () {
        let api = '/rmm/v1/devices/statistics/group-v?pluginName=SQPlugin&sensorId=/data/hddInfoList/Disk%/eccCount&exactly=false&by=v=0&by=v>=1,v<10&v>=10'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      connectionReliability: function () {
        let api = '/rmm/v1/devices/statistics/group-v?pluginName=SQPlugin&sensorId=/data/hddInfoList/Disk%/crcError&exactly=false&by=v=0&by=v>=1,v<20&v>=20'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devicesTop: function (topN, topType, others) {
        let api = '/rmm/v1/devices/topn?desc=true&exactly=false&n=' + topN + '&data=' + topType // cpu|memory|nerwork|disk|disconnect
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      devicesList: function (gid, data) {
        let api = '/rmm/v1/devicegroups/' + gid + '/sq-info'
        if (data.pageSize) {
          api += '?pageSize=' + data.pageSize
        }
        if (data.no) {
          api += '&no=' + data.no
        }
        if (data.type) {
          api += '&type=' + data.type
        }
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      histData: function (agentid, disk, since, day) {
        let api = '/rmm/v1/devices/statistics/daily-sq-data-vol?agentId=' + agentid + '&disk=' + disk + '&since=' + since + '&days=' + day
        let oData = {}
        return oAxios.get(api, { params: oData })
      }
    }
  },
  appStore: {
    get: {
      company: function (comName) {
        let api = '/rmm/packagecontrol/cluster/package/company'
        if (comName) {
          api += '?comName=' + comName
        }
        return oAxios.get(api)
      },
      contact: function (name) {
        let api = '/rmm/packagecontrol/contact'
        if (name) {
          api += '?comName=' + name
        }
        return oAxios.get(api)
      },
      category: function (stgId) {
        let api = '/rmm/packagecontrol/cluster/package/category'
        if (stgId) {
          api += '?stgId=' + stgId
        }
        return oAxios.get(api)
      },
      keyword: function () {
        let api = '/rmm/packagecontrol/package/detail/keyword'
        return oAxios.get(api)
      },
      typeValid: function (pkgType) {
        let api = '/rmm/packagecontrol/package/typeValid?pkgType=' + pkgType
        return oAxios.get(api)
      },
      tagDevice: function () {
        let api = '/rmm/otadevicemanager/tagDevice'
        return oAxios.get(api)
      },
      package: function (stgid, kind) {
        let api = '/rmm/packagecontrol/packages/latest?stgId=' + stgid
        if (kind) {
          api += '&kind=' + kind
        }
        return oAxios.get(api)
      },
      packageByType: function (stgId, pkgType, other) {
        let api = '/rmm/packagecontrol/bytype/new/package?stgId=' + stgId + '&type=' + pkgType
        let oData = other
        return oAxios.get(api, { params: oData })
      },
      packageByGroupType: function (stgid, groupType, other) {
        let api = '/rmm/packagecontrol/stg/' + stgid + '/version?groupType=' + groupType
        let oData = other
        return oAxios.get(api, { params: oData })
      },
      deleteStatus: function (stgId, types) {
        let api = '/rmm/packagecontrol/bytype/package/deletestatus?stgId=' + stgId
        if (types && types.length !== 0) {
          for (let type of types) {
            api += '&type=' + type
          }
        }
        return oAxios.get(api)
      },
      versionDeleteStatus: function (stgId, names) {
        let api = '/rmm/packagecontrol/cluster/package/deletestatus?stgId=' + stgId
        for (let name of names) {
          api += '&names=' + name
        }
        return oAxios.get(api)
      },
      installedApp: function (agentId, stgId) {
        let api = '/rmm/packagecontrol/device/packages/install?agentId=' + agentId
        if (stgId) {
          api += '&stgId=' + stgId
        }
        return oAxios.get(api)
      },
      installingByGroup: function (gid) {
        let api = '/rmm/upgradecontrol/group/' + gid + '/installing'
        return oAxios.get(api)
      },
      installCountByGroup: function (gid) {
        let api = '/rmm/upgradecontrol/account/' + gid + '/installing/count'
        return oAxios.get(api)
      },
      installStatus: function (agentId) {
        let api = '/rmm/upgradecontrol/bydevice/install/status?agentId=' + agentId
        return oAxios.get(api)
      },
      installServerStatus: function (pkgNam) {
        let api = '/rmm/upgradecontrol/bydevice/bypackage/upgradestatus?agentId=DEVICEON-SERVER&pkgName=' + pkgNam
        return oAxios.get(api)
      },
      installSummary (parameter) {
        let api = '/rmm/upgradecontrol/summary?'
        let oData = parameter
        return oAxios.get(api, { params: oData })
      },
      installSummaryDetail (parameter) {
        let api = '/rmm/upgradecontrol/summary/detail?'
        let oData = parameter
        return oAxios.get(api, { params: oData })
      },
      installSummaryByDevice (agentId, parameter) {
        let api = '/rmm/upgradecontrol/bydevice/summary?' + 'agentId=' + agentId
        let oData = parameter
        return oAxios.get(api, { params: oData })
      },
      installStatusByGroup: function (gid) {
        let api = '/rmm/upgradecontrol/group/' + gid + '/install/status'
        return oAxios.get(api)
      },
      installStatusByPkgName: function (pkgType) {
        let api = '/rmm/upgradecontrol/bypkg/install/status?groupType=' + pkgType
        return oAxios.get(api)
      },
      installablePackage: function (type, id) {
        let api = '/rmm/packagecontrol/all/package/installable'
        if (type === 'Device') {
          api += '?agentId=' + id
        } else if (type === 'Group') {
          api += '?gid=' + id
        }
        return oAxios.get(api)
      },
      installablePackageBrick: function (type, id) {
        let api = '/rmm/packagecontrol/package/installable/brick'
        if (type === 'Device') {
          api += '?agentId=' + id
        } else if (type === 'Group') {
          api += '?gid=' + id
        }
        return oAxios.get(api)
      },
      upgradeStorage: function (type, pkgType) {
        let api = '/rmm/packagecontrol/package/latest/storageinfo?' + type + '=' + pkgType
        return oAxios.get(api)
      },
      usedCategory: function (ts) {
        let api = '/rmm/packagecontrol/package/detail/category'
        if (ts) {
          api += '?ts=' + ts
        }
        return oAxios.get(api)
      },
      allAppBrief: function (data) {
        let api = '/rmm/packagecontrol/package/app/brick'
        let oData = data
        return oAxios.get(api, { params: oData })
      },
      appDetail: function (pkgType) {
        let api = '/rmm/packagecontrol/package/app?groupType=' + pkgType
        return oAxios.get(api)
      },
      upgradeDevices: function (gid, page, status, searchKey) {
        let sort = { key: 'name', order: 'desc' }
        if (status === 'ALL') sort = { key: 'connected', order: 'desc' }
        let api = `/rmm/otadevicemanager/group/${gid}/devices`
        api += `?searchKey=${searchKey}`
        api += `&sortKey=${sort.key}&sortType=${sort.order}`
        api += `&statusType=${status}` // status: ALL/ONLINE/OFFLINE
        let oData = page
        return oAxios.get(api, { params: oData })
      },
      canInstall: function (gid, stgid, groupType, version, filter) {
        let api = '/rmm/otadevicemanager/group/' + gid + '/devices/caninstall?stgId=' + stgid + '&groupType=' + groupType + '&version=' + version + '&filter=' + filter
        return oAxios.get(api)
      },
      packageScheduleNum: function (pkgType) {
        let api = '/rmm/schedulecontrol/schedule/cnt?groupType=' + pkgType
        return oAxios.get(api)
      },
      hisVersion: function (pkgType, stgId, other) {
        let api = '/rmm/packagecontrol/bytype/package?type=' + pkgType + '&stgId=' + stgId
        let oData = other
        return oAxios.get(api, { params: oData })
      }
    },
    post: {
      company: function (data) {
        let api = '/rmm/packagecontrol/package/company'
        let oData = data
        return oAxios.post(api, oData)
      },
      contact: function (data) {
        let api = '/rmm/packagecontrol/contact'
        let oData = data
        return oAxios.post(api, oData)
      },
      app: function (data) {
        let api = '/rmm/packagecontrol/package/detail'
        let oData = data
        return oAxios.post(api, oData)
      },
      install: function (data) {
        let api = '/rmm/upgradecontrol/devgroup/upgrader'
        let oData = data
        return oAxios.post(api, oData)
      },
      installSoln: function (data) {
        let api = '/rmm/upgradecontrol/upgrader/soln'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    patch: {
      app: function (stgid, pkgtype, data) {
        let api = '/rmm/packagecontrol/package/detail?stgId=' + stgid + '&groupType=' + pkgtype
        let oData = data
        return oAxios.patch(api, oData)
      },
      company: function (data) {
        let api = '/rmm/packagecontrol/package/company'
        return oAxios.patch(api, data)
      },
      contact: function (id, data) {
        let api = '/rmm/packagecontrol/contact?id=' + id
        return oAxios.patch(api, data)
      }
    },
    delete: {
      packageByType: function (stgid, types) {
        let api = '/rmm/packagecontrol/bytype/package?stgId=' + stgid
        if (types && types.length !== 0) {
          for (let type of types) {
            api += '&groupType=' + type
          }
        }
        return oAxios.delete(api)
      },
      packageByName: function (stgid, names) {
        let api = '/rmm/packagecontrol/cluster/package?stgId=' + stgid
        if (names && names.length !== 0) {
          for (let name of names) {
            api += '&names=' + name
          }
        }
        return oAxios.delete(api)
      },
      uninstallPackage: function (oData) {
        let api = '/rmm/upgradecontrol/upgrader'
        return oAxios.delete(api, { data: oData })
      },
      uninstallSoln: function (oData) {
        let api = '/rmm/upgradecontrol/upgrader/soln'
        return oAxios.delete(api, { data: oData })
      },
      company: function (pcid) {
        let api = '/rmm/packagecontrol/package/company?pcid=' + pcid
        return oAxios.delete(api)
      },
      contact: function (id) {
        let api = '/rmm/packagecontrol/contact?id=' + id
        return oAxios.delete(api)
      }
    }
  },
  ipmi: {
    get: {
      servers: function (parameters, others) {
        let api = '/rmm/v1/ipmi'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      sensors: function (serverId, others) {
        let api = '/rmm/v1/ipmi/sensors?serverId=' + serverId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      selEventLog: function (parameters, others) {
        let api = '/rmm/v1/ipmi/sel'
        let oData = parameters
        return oAxios.get(api, { params: oData })
      },
      powerState: function (serverId, others) {
        let api = '/rmm/v1/ipmi/power?serverId=' + serverId
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      canInstall: function (gid, stgid, pkgName) {
        let api = '/rmm/otadevicemanager/group/' + gid + '/devices/caninstall?stgId=' + stgid + '&pkgName=' + pkgName
        return oAxios.get(api)
      }
    },
    post: {
      server: function (data, others) {
        let api = '/rmm/v1/ipmi'
        let oData = data
        return oAxios.post(api, oData)
      }
    },
    put: {
      powerUp: function (serverId, others) {
        let api = '/rmm/v1/ipmi/power/up/' + serverId
        let oData = {}
        return oAxios.put(api, oData)
      },
      powerDown: function (serverId, others) {
        let api = '/rmm/v1/ipmi/power/down/' + serverId
        let oData = {}
        return oAxios.put(api, oData)
      },
      powerReset: function (serverId, others) {
        let api = '/rmm/v1/ipmi/power/reset/' + serverId
        let oData = {}
        return oAxios.put(api, oData)
      }
    },
    patch: {
      server: function (data, others) {
        let api = '/rmm/v1/ipmi'
        let oData = data
        return oAxios.patch(api, oData)
      },
    },
    delete: {
      server: function (serverId, others) {
        let api = '/rmm/v1/ipmi/' + serverId
        return oAxios.delete(api)
      }
    }
  },
  gridLayout: {
    post: {
      publish: function (data) {
        let api = '/rmm/packagecontrol/gridLayout'
        return oAxios.post(api, data)
      }
    },
    delete: {
      unpublish: function (deleteArray) {
        let api = '/rmm/packagecontrol/gridLayout'
        if (deleteArray) {
          for (let delString of deleteArray) {
            if (api.indexOf('?') > -1) {
              api += '&layout=' + delString
            } else {
              api += '?layout=' + delString
            }
          }
        }
        return oAxios.delete(api)
      }
    }
  },
  twoFA: {
    get: {
      login: function (TOTP, others) {
        let api = '/rmm/v1/accounts/login/2fa'
        const params = {}
        params.headers = { 'X-DeviceOn-2FA': TOTP }
        return oAxios.get(api, params)
      },
      secret: function (others) {
        let api = '/rmm/v1/accounts/login/2fa/secret'
        let oData = {}
        return oAxios.get(api, { params: oData })
      },
      secretEnable: function (TOTP, others) {
        let api = '/rmm/v1/accounts/login/2fa?enable=true'
        const params = {}
        params.headers = { 'X-DeviceOn-2FA': TOTP }
        return oAxios.get(api, params)
      }
    },
    patch: {
      setting: function (data, others) {
        // {"enforce-2FA": true | false}
        let api = '/rmm/v1/settings/2fa'
        return oAxios.patch(api, data)
      }
    },
    delete: {
      secretDisable: function (others) {
        let api = '/rmm/v1/accounts/login/2fa'
        return oAxios.delete(api)
      }
    },
    post: {
      pause: function (data) {
        let api = '/rmm/v1/accounts/2fa/pause'
        return oAxios.post(api, data)
      }
    },
  }
}

export default DeviceOnApis
