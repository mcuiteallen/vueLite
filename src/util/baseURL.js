let baseUrl
if (process.env.NODE_ENV === 'development') {
  baseUrl = {
    RMM: 'http://e2i-demo.wise-paas.com/',
    user: 'root@advantech.com.tw',
    password: 'e2iP@ssw0rd'
  }
} else {
  baseUrl = {
    RMM: window.location.origin,
  }
}
let oRMM = {}
if (typeof (Storage) !== 'undefined') {
  if (typeof (localStorage.RMMGlobal) !== 'undefined') {
    oRMM = JSON.parse(localStorage.RMMGlobal)
  }
}
if (oRMM.urlSearch) {
  let sParam = 'server'
  let sServer = ''
  let sPageURL = oRMM.urlSearch.substring(1)
  let sURLVariables = sPageURL.split('&')
  for (let i = 0; i < sURLVariables.length; i++) {
    let sParameterName = sURLVariables[i].split('=')
    if (sParameterName[0] === sParam) {
      sServer = sParameterName[1]
      break
    }
  }

  if (sServer !== '') {
    baseUrl = {
      RMM: sServer
    }
  }
}
export default baseUrl
