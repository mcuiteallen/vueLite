<template>
  <div class="BaiduMapOffline h-100">
    <div style="left:0;top:0;width:100%;height:100%;position:absolute;" id="container"></div>
  </div>
</template>

<script>
import DeviceOnApis from '@/util/DeviceOnApis'
import Vue from 'vue'
// import { deviceStatusConnect, deviceStatusDisconnect, deviceStatusError, deviceStatusConnectSelected, deviceStatusDisconnectSelected, deviceStatusErrorSelected, locationErrorNormal, locationErrorSelected, locationNormal, locationSelected } from './icon'

let self = {}

export default {
  name: 'baidu-mapD',
  props: ['selectedMarker', 'orignMarkers'],
  data () {
    return {
      bmap: '',
      markers: [],
      mapMarkers: [],
      markerClusterer: '',
      infoWindow: '',
      locationErrorNormal: require('@/assets/img/map-status/map-location/location-normal-error.svg'),
      locationNormal: require('@/assets/img/map-status/map-location/normal.svg'),
      locationSelected: require('@/assets/img/map-status/map-location/selected.svg'),
      locationErrorSelected: require('@/assets/img/map-status/map-location/location-selected-error.svg'),
      deviceStatusConnect: require('@/assets/img/map-status/map-device-status/connect.svg'),
      deviceStatusDisconnect: require('@/assets/img/map-status/map-device-status/disconnect.svg'),
      deviceStatusError: require('@/assets/img/map-status/map-device-status/error.svg'),
      deviceStatusConnectSelected: require('@/assets/img/map-status/map-device-status-selected/connect.svg'),
      deviceStatusDisconnectSelected: require('@/assets/img/map-status/map-device-status-selected/disconnect.svg'),
      deviceStatusErrorSelected: require('@/assets/img/map-status/map-device-status-selected/error.svg'),
      addNewMarker: {
        isTrue: false,
        lat: 0,
        lng: 0,
        icon: ''
      },
    }
  },
  components: {},
  watch: {
    orignMarkers (value) {
      if (value.length !== 0) {
        if (self.markers.length !== 0) {
        // 地圖標記初始化
          self.markers = []
          if (self.markerClusterer) self.markerClusterer.clearMarkers(self.mapMarkers)
          for (let m of self.mapMarkers) {
            self.bmap.removeOverlay(m)
          }
          self.mapMarkers = []
        }

        for (let [i, m] of value.entries()) {
          if (m.type === 'device') {
            switch (m.status) {
              case 'connect':
                self.$set(m, 'iconUrl', self.deviceStatusConnect)
                break
              case 'error':
                self.$set(m, 'iconUrl', self.deviceStatusError)
                break
              default:
                self.$set(m, 'iconUrl', self.deviceStatusDisconnect)
                break
            }
          } else {
            if (!m.hasError) self.$set(m, 'iconUrl', self.locationNormal)
            else self.$set(m, 'iconUrl', self.locationErrorNormal)
          }
          let point = new BMap.Point(m.lng, m.lat)
          self.markerIcon(m.iconUrl, point, i)
          self.markers.push(m)
        }
        // Marker Cluster
        this.markerClusterer = new BMapLib.MarkerClusterer(self.bmap, { markers: self.mapMarkers })
        self.bmap.addEventListener('clusterHover', function (e) {
          let devices = []
          let value = e.detail
          self.markers.forEach(mar => {
            if (value.markers.find(m => mar.lat === m.lat && mar.lng === m.lng)) {
              if (mar.type === 'device') mar.devices[0].status = mar.status
              devices = devices.concat(mar.devices)
            }
          })

          let tmp = {
            type: 'cluster',
            lat: value.lat,
            lng: value.lng,
            devices: devices
          }
          self.hoverAction(tmp)
        })
        self.bmap.addEventListener('clusterOut', function (e) {
          self.outAction()
        })
      }
    },
    selectedMarker (value) {
      self.markers.forEach((item, i) => {
        if (item.id === value.id) {
          let icon = ''
          if (item.type === 'device') {
            item.status = value.status
            switch (item.status) {
              case 'connect':
                icon = value.isSelected ? self.deviceStatusConnectSelected : self.deviceStatusConnect
                break
              case 'error':
                icon = value.isSelected ? self.deviceStatusErrorSelected : self.deviceStatusError
                break
              default:
                icon = value.isSelected ? self.deviceStatusDisconnectSelected : self.deviceStatusDisconnect
                break
            }
          } else {
            if (!item.hasError) {
              icon = value.isSelected ? self.locationSelected : self.locationNormal
            } else {
              icon = value.isSelected ? self.locationErrorSelected : self.locationErrorNormal
            }
          }
          self.mapMarkers[i].setIcon(this.icon(icon))
          self.$set(item, 'iconUrl', icon)
          item.plans = value.plans
          item.devices = value.devices
          if (value.isSelected) self.bmap.centerAndZoom(new BMap.Point(item.lng, item.lat), 5)
        } else {
          if (item.type === 'device') {
            switch (item.status) {
              case 'connect':
                self.mapMarkers[i].setIcon(this.icon(self.deviceStatusConnect))
                self.$set(item, 'iconUrl', self.deviceStatusConnect)
                break
              case 'error':
                self.mapMarkers[i].setIcon(this.icon(self.deviceStatusError))
                self.$set(item, 'iconUrl', self.deviceStatusError)
                break
              default:
                self.mapMarkers[i].setIcon(this.icon(self.deviceStatusDisconnect))
                self.$set(item, 'iconUrl', self.deviceStatusDisconnect)
                break
            }
          } else {
            if (!item.hasError) {
              self.mapMarkers[i].setIcon(this.icon(self.locationNormal))
              self.$set(item, 'iconUrl', self.locationNormal)
            } else {
              self.mapMarkers[i].setIcon(this.icon(self.locationErrorNormal))
              self.$set(item, 'iconUrl', self.locationErrorNormal)
            }
          }
        }
      })
    }
  },
  mounted () {
    self = this
    self.init()
  },
  methods: {
    clickMap (e) {
      self.addNewMarker.lat = e.point.lat
      self.addNewMarker.lng = e.point.lng
      self.addNewMarker.icon = locationSelected
      self.addNewMarker.isTrue = true

      DeviceOnApis.MessageBox.Normal(
        self,
        self.$t('deviceon.message.information'),
        self.$t('deviceon.dashboard.mapCoordinate.setNewMarker'),
        'info',
        true
      ).then(value => {
        if (value.value) {
          self.$emit('addMarker', {
            lat: self.addNewMarker.lat,
            lng: self.addNewMarker.lng
          })
        }
        self.addNewMarker.isTrue = false
      })
    },
    init () {
      var tileLayer = new BMap.TileLayer({
        isTransparentPng: true
      })
      tileLayer.getTilesUrl = function (tileCoord, zoom) {
        var x = tileCoord.x
        var y = tileCoord.y
        return '/static/offlineMap/BaiduMap/tiles/' + zoom + '/' + x + '/' + y + '.png'
      }

      this.bmap = new BMap.Map('container')
      var point = new BMap.Point(121.234, 25.055)
      this.bmap.centerAndZoom(point, 5)
      // var marker = new BMap.Marker(point);        // 创建标注
      // this.bmap.addOverlay(marker);
      this.bmap.addTileLayer(tileLayer)
      this.bmap.addControl(new BMap.NavigationControl())

      this.bmap.enableScrollWheelZoom() // 启用滚轮放大缩小
      this.bmap.enableKeyboard() // 启用键盘操作，默认禁用。键盘的上、下、左、右键可连续移动地图。
      this.bmap.enableContinuousZoom()// 启用连续缩放效果

      var copyCtrl = new BMap.CopyrightControl({
        anchor: BMAP_ANCHOR_BOTTOM_RIGHT
      })
      this.bmap.addControl(copyCtrl)

      this.bmap.addEventListener('click', function (e) {
        if (!e.overlay && !e.currentTarget.clusterClick) {
          self.clickMap(e)
        }
      })
    },
    markerIcon (type, point, index) {
      var myIcon = this.icon(type)
      // 创建标注对象并添加到地图
      var marker = new BMap.Marker(point, { icon: myIcon })
      marker.addEventListener('click', function (e) {
        self.clickMarker(e, index)
      })
      marker.addEventListener('mouseover', function (e) {
        self.hoverAction(self.markers[index])
      })
      marker.addEventListener('mouseout', function (e) {
        self.outAction()
      })
      this.mapMarkers.push(marker)
      // this.bmap.addOverlay(marker);
    },
    icon (type) {
      return new BMap.Icon(type, new BMap.Size(36, 42), {
        anchor: new BMap.Size(18, 36),
        imageOffset: new BMap.Size(0, 0)
      })
    },
    clickMarker (e, index) {
      self.$emit('clickMarker', {
        id: self.markers[index].id,
        type: self.markers[index].type
      })
      self.markers.forEach((m, i) => {
        if (i !== index) {
          if (m.type === 'device') {
            switch (m.status) {
              case 'connect':
                self.mapMarkers[i].setIcon(this.icon(self.deviceStatusConnect))
                self.$set(m, 'iconUrl', self.deviceStatusConnect)
                break
              case 'error':
                self.mapMarkers[i].setIcon(this.icon(self.deviceStatusError))
                self.$set(m, 'iconUrl', self.deviceStatusError)
                break
              default:
                self.mapMarkers[i].setIcon(this.icon(self.deviceStatusDisconnect))
                self.$set(m, 'iconUrl', self.deviceStatusDisconnect)
                break
            }
          } else {
            if (!m.hasError) {
              self.mapMarkers[i].setIcon(this.icon(self.locationNormal))
              self.$set(m, 'iconUrl', self.locationNormal)
            } else {
              self.mapMarkers[i].setIcon(this.icon(self.locationErrorNormal))
              self.$set(m, 'iconUrl', self.locationErrorNormal)
            }
          }
        }
      })

      if (self.markers[index].type === 'device') {
        var content = `<div class="popup-device-name">${this.markers[index].name}</div>`
        var height = 50
        if (self.markers[index].status === 'disconnect') {
          content += `<div class="map-popup-btn" id="powerOn">${this.$t('deviceon.power.actions.start')}</div>`
          height += 30
        }
        if (self.markers[index].hasIDS && self.markers[index].status === 'connect') {
          content += `<div class="map-popup-btn" id="OSD">${this.$t('deviceon.device.view.OSD')}</div>`
          height += 30
        }
        if (self.markers[index].hasARK && self.markers[index].status === 'connect') {
          content += `<div class="map-popup-btn" id="monitoring">${this.$t('deviceon.menu.device.devicemonitoring')}</div>
          <div class="map-popup-btn" id="screenshot">${this.$t('deviceon.overview.action.takeScreen')}</div>
          <div class="map-popup-btn" id="remotedesktop">${this.$t('deviceon.device.view.remoteDesktop')}</div>`
          height += 100
        }
        var opts = {
          width: 250, // 信息窗口宽度
          height: height, // 信息窗口高度
          offset: new BMap.Size(0, -20),
          title: '',
        }
        var infoWindow = new BMap.InfoWindow(content, opts) // 创建信息窗口对象
        var point = new BMap.Point(self.markers[index].lng, self.markers[index].lat)
        this.bmap.openInfoWindow(infoWindow, point)

        setTimeout(() => {
          if (self.markers[index].status === 'disconnect') {
            document.getElementById('powerOn').addEventListener('click', function () {
              self.openModal('powerOn', {
                agentId: self.markers[index].devices[0].agentId,
                did: self.markers[index].devices[0].did
              })
            })
          }
          if (self.markers[index].hasIDS) {
            document.getElementById('OSD').addEventListener('click', function () {
              self.openModal('OSD', {
                agentId: self.markers[index].devices[0].agentId,
                did: self.markers[index].devices[0].did
              })
            })
          }
          if (self.markers[index].hasARK) {
            let tmp = {
              agentId: self.markers[index].devices[0].agentId,
              did: self.markers[index].devices[0].did,
              os: self.markers[index].devices[0].os,
              amtsupport: self.markers[index].devices[0].amtsupport
            }
            document.getElementById('monitoring').addEventListener('click', function () {
              self.openModal('monitoring', tmp)
            })
            document.getElementById('screenshot').addEventListener('click', function () {
              self.openModal('screenshot', tmp)
            })
            document.getElementById('remotedesktop').addEventListener('click', function () {
              self.openModal('remotedesktop', tmp)
            })
          }
        }, 100)

        switch (self.markers[index].status) {
          case 'connect':
            self.mapMarkers[index].setIcon(this.icon(self.deviceStatusConnectSelected))
            this.$set(self.markers[index], 'iconUrl', self.deviceStatusConnectSelected)
            break
          case 'error':
            self.mapMarkers[index].setIcon(this.icon(self.deviceStatusErrorSelected))
            this.$set(self.markers[index], 'iconUrl', self.deviceStatusErrorSelected)
            break
          default:
            self.mapMarkers[index].setIcon(this.icon(self.deviceStatusDisconnectSelected))
            this.$set(self.markers[index], 'iconUrl', self.deviceStatusDisconnectSelected)
            break
        }
      } else {
        if (!self.markers[index].hasError) {
          self.mapMarkers[index].setIcon(this.icon(self.locationSelected))
          self.$set(self.markers[index], 'iconUrl', self.locationSelected)
        } else {
          self.mapMarkers[index].setIcon(this.icon(self.locationErrorSelected))
          self.$set(self.markers[index], 'iconUrl', self.locationErrorSelected)
        }
      }
    },
    hoverAction (e) {
      if (e.type === 'location' || e.type === 'cluster') {
        let connect = 0
        let disconnect = 0
        let error = 0

        e.devices.forEach((d) => {
          switch (d.status) {
            case 'connect':
              connect++
              break
            case 'disconnect':
              disconnect++
              break
            case 'error':
              error++
              break
          }
        })
        var content = `<div class="map-card">
          <div class="map-card-connect">${this.$t('deviceon.device.status.connected')} : <span>${connect}</span></div>
          <div class="map-card-disconnect">${this.$t('deviceon.device.status.disconnected')} : <span>${disconnect}</span></div>
          <div class="map-card-abnormal">${this.$t('deviceon.device.status.abnormal')} : <span>${error}</span></div>
          <div class="map-card-all">${this.$t('deviceon.device.status.all')} : <span>${connect + disconnect + error}</span></div>
        </div>`
        var opts = {
          width: 250, // 信息窗口宽度
          height: 100, // 信息窗口高度
          offset: new BMap.Size(0, -20),
          title: '',
        }
        this.infoWindow = new BMap.InfoWindow(content, opts) // 创建信息窗口对象
        var point = new BMap.Point(e.lng, e.lat)
        this.bmap.openInfoWindow(this.infoWindow, point)
      }
    },
    outAction () {
      if (this.infoWindow) this.infoWindow.close()
    },
    openModal (type, info) {
      let Deviceinfo = {
        type: type,
        agentId: info.agentId,
        did: info.did
      }
      switch (type) {
        case 'remotedesktop':
          Deviceinfo.os = info.os
          Deviceinfo.amtsupport = info.amtsupport
          break
      }
      this.$emit('openModal', Deviceinfo)
    }
  },
  computed: {},
  // beforeDestroy() {
  //   document.body.removeChild(a)
  //   document.body.removeChild(b)
  //   document.body.removeChild(c)
  // }
}
</script>

<style lang="scss">
.BaiduMapOffline {
  // popUp
  .BMap_bubble_content {
    margin-right: 15px;
    margin-top: 5px;
  }
  .OSD {
    margin-top: 15px;
  }
}

</style>
