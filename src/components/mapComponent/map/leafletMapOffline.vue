<template>
  <div class="leaflet-map h-100" id="map"/>
</template>

<script>
import Vue from 'vue'
import DeviceOnApis from '@/util/DeviceOnApis'
import { deviceStatusConnect, deviceStatusDisconnect, deviceStatusError, deviceStatusConnectSelected, deviceStatusDisconnectSelected, deviceStatusErrorSelected, locationErrorNormal, locationErrorSelected, locationNormal, locationSelected } from './icon'

Vue.config.productionTip = false

// 設定預設 icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

let self = {}
export default {
  name: 'leaflet-map',
  props: ['selectedMarker', 'orignMarkers', 'resize'],
  components: {},
  data () {
    return {
      map: '',
      zoom: 10,
      minZoom: 17,
      center: [25.05782, 121.37812],
      url: '/static/offlineMap/OpenStreetMap/Tiles/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      markers: [],
      mapMarkers: [],
      clusters: [],
      bound: [],
      bounds: [],
      locationIconNormal: new L.Icon({
        iconUrl: locationNormal,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      }),
      locationIconError: new L.Icon({
        iconUrl: locationErrorNormal,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      }),
      locationIconSelected: new L.Icon({
        iconUrl: locationSelected,
        iconSize: [42, 42],
        iconAnchor: [21, 42]
      }),
      locationIconErrorSelected: new L.Icon({
        iconUrl: locationErrorSelected,
        iconSize: [42, 42],
        iconAnchor: [21, 42]
      }),
      deviceIconConnectedNormal: new L.Icon({
        iconUrl: deviceStatusConnect,
        iconSize: [32, 32],
        iconAnchor: [15, 30]
      }),
      deviceIconDisconnectedNormal: new L.Icon({
        iconUrl: deviceStatusDisconnect,
        iconSize: [32, 32],
        iconAnchor: [15, 30]
      }),
      deviceIconErrorNormal: new L.Icon({
        iconUrl: deviceStatusError,
        iconSize: [32, 32],
        iconAnchor: [15, 30]
      }),
      deviceIconConnectedSelected: new L.Icon({
        iconUrl: deviceStatusConnectSelected,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      }),
      deviceIconDisconnectedSelected: new L.Icon({
        iconUrl: deviceStatusDisconnectSelected,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      }),
      deviceIconErrorSelected: new L.Icon({
        iconUrl: deviceStatusErrorSelected,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      }),
      addNewMarker: {
        isTrue: false,
        lat: 0,
        lng: 0,
        icon: ''
      },
      hasIDS: false
    }
  },
  watch: {
    selectedMarker (value) {
      self.markers.forEach((item) => {
        if (item.id === value.id) {
          item.plans = value.plans
          item.devices = value.devices
          if (value.isSelected) self.map.panTo(new L.LatLng(item.lat, item.lng), { animate: true })
          if (item.type === 'device') {
            item.status = value.status
            switch (item.status) {
              case 'connect':
                self.$set(item, 'icon', value.isSelected ? self.deviceIconConnectedSelected : self.deviceIconConnectedNormal)
                break
              case 'error':
                self.$set(item, 'icon', value.isSelected ? self.deviceIconErrorSelected : self.deviceIconErrorNormal)
                break
              default:
                self.$set(item, 'icon', value.isSelected ? self.deviceIconDisconnectedSelected : self.deviceIconDisconnectedNormal)
                break
            }
          } else {
            if (!item.hasError) self.$set(item, 'icon', value.isSelected ? self.locationIconSelected : self.locationIconNormal)
            else self.$set(item, 'icon', value.isSelected ? self.locationIconErrorSelected : self.locationIconError)
          }
        } else {
          if (item.type === 'device') {
            switch (item.status) {
              case 'connect':
                self.$set(item, 'icon', self.deviceIconConnectedNormal)
                break
              case 'error':
                self.$set(item, 'icon', self.deviceIconErrorNormal)
                break
              default:
                self.$set(item, 'icon', self.deviceIconDisconnectedNormal)
                break
            }
          } else {
            if (!item.hasError) self.$set(item, 'icon', self.locationIconNormal)
            else self.$set(item, 'icon', self.locationIconError)
          }
        }

        let sMar = self.mapMarkers.find(mar => mar._latlng.lat === item.lat && mar._latlng.lng === item.lng)
        sMar.setIcon(item.icon)
      })
    },
    orignMarkers (value) {
      if (value.length !== 0) {
        // set marker icon
        self.markers = []
        self.bound = []
        this.clusters.clearLayers()
        for (let mar of self.mapMarkers) {
          this.map.removeLayer(mar)
        }
        self.mapMarkers = []
        for (let m of value) {
          self.bound.push([m.lat, m.lng])
          if (m.type === 'device') {
            switch (m.status) {
              case 'connect':
                self.$set(m, 'icon', self.deviceIconConnectedNormal)
                break
              case 'error':
                self.$set(m, 'icon', self.deviceIconErrorNormal)
                break
              default:
                self.$set(m, 'icon', self.deviceIconDisconnectedNormal)
                break
            }
          } else {
            if (!m.hasError) self.$set(m, 'icon', self.locationIconNormal)
            else self.$set(m, 'icon', self.locationIconError)
          }
          self.markers.push(m)
          let mar = L.marker([m.lat, m.lng], {
            icon: m.icon
          }).on('mouseover', function (e) {
            self.HoverAction(e)
          }).on('mouseout', function (e) {
            self.HoverAction(e)
          }).on('click', function (e) {
            self.clickMarker(e)
          })
          if (m.type === 'device') {
            let str = `<div class="popup-device-name">${m.name}</div>`
            if (m.status === 'disconnect') {
              str += `<div class="map-popup-btn" id="powerOn">${this.$t('deviceon.power.actions.start')}</div>`
            }
            if (m.hasIDS && m.status === 'connect') {
              str += `<div class="map-popup-btn" id="OSD">${this.$t('deviceon.device.view.OSD')}</div>`
            }
            if (m.hasARK && m.status === 'connect') {
              str += `<div class="map-popup-btn" id="monitoring">${this.$t('deviceon.menu.device.devicemonitoring')}</div>
                <div class="map-popup-btn" id="screenshot">${this.$t('deviceon.overview.action.takeScreen')}</div>
                <div class="map-popup-btn" id="remotedesktop">${this.$t('deviceon.device.view.remoteDesktop')}</div>`
            }
            str += `<div class="map-popup-btn" id="event">${this.$t('deviceon.menu.event')}</div>`
            mar.bindPopup(str)
          }
          self.mapMarkers.push(mar)
          this.clusters.addLayer(mar)
        }
        this.clusters.on('clustermouseover', function (e) {
          // a.layer is actually a cluster
          self.setTooltip(e)
        }).on('clustermouseout', function (e) {
          self.map.closePopup()
        })
        self.map.addLayer(self.clusters)

        // self.bounds = latLngBounds(self.bound)
        // if (self.map.zoom > self.minZoom) {
        //   setTimeout(() => {
        //     self.map.setZoom(self.minZoom)
        //   }, 150)
        // }
      }
    },
    resize () {
      window.dispatchEvent(new Event('resize'))
    }
  },
  computed: {},
  mounted () {
    self = this
    this.init()
  },
  methods: {
    init () {
      let osm = L.tileLayer(this.url, {
        minZoom: 3,
        maxZoom: 17,
        attribution: this.attribution
      })
      this.map = L.map('map')
        .setView([25.05782, 121.37812], 10)
        .addLayer(osm)
      this.clusters = L.markerClusterGroup()

      this.map.on('popupopen', function (e) {
        // How to retrieve marker?
        let item = self.markers.find(mar => e.popup._latlng.lat === mar.lat && e.popup._latlng.lng === mar.lng)
        for (let btn of document.getElementsByClassName('map-popup-btn')) {
          L.DomEvent.addListener(btn, 'click', function (a) {
            self.openModal(item, a.target.id)
          })
        }
      })

      this.map.on('click', function (e) {
        self.clickMap(e)
      })
    },
    clickMap (e) {
      self.addNewMarker.lat = e.latlng.lat
      self.addNewMarker.lng = e.latlng.lng
      self.addNewMarker.icon = self.locationIconSelected
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
    clickMarker (e) {
      self.markers.forEach((item, i) => {
        if (item.lat === e.latlng.lat && item.lng === e.latlng.lng) {
          self.$emit('clickMarker', {
            id: item.id,
            type: item.type
          })
          if (item.type === 'device') {
            switch (item.status) {
              case 'connect':
                self.$set(item, 'icon', self.deviceIconConnectedSelected)
                break
              case 'error':
                self.$set(item, 'icon', self.deviceIconErrorSelected)
                break
              default:
                self.$set(item, 'icon', self.deviceIconDisconnectedSelected)
                break
            }
          } else {
            if (!item.hasError) self.$set(item, 'icon', self.locationIconSelected)
            else self.$set(item, 'icon', self.locationIconErrorSelected)
          }
        } else {
          if (item.type === 'device') {
            switch (item.status) {
              case 'connect':
                self.$set(item, 'icon', self.deviceIconConnectedNormal)
                break
              case 'error':
                self.$set(item, 'icon', self.deviceIconErrorNormal)
                break
              default:
                self.$set(item, 'icon', self.deviceIconDisconnectedNormal)
                break
            }
          } else {
            if (!item.hasError) self.$set(item, 'icon', self.locationIconNormal)
            else self.$set(item, 'icon', self.locationIconError)
          }
        }
        self.mapMarkers[i].setIcon(item.icon)
      })
    },
    setTooltip (a) {
      let connect = 0
      let disconnect = 0
      let error = 0
      let checkMarkers = self.checkChildCluster(a.layer, 0)
      let inside = self.markers.filter((m) => {
        return checkMarkers.find((mar) => mar.lat === m.lat && mar.lng === m.lng)
      })
      if (inside.length !== 0) {
        inside.forEach((m) => {
          if (m.type === 'location') {
            m.devices.forEach((d) => {
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
          } else {
            switch (m.status) {
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
          }
        })
      }
      let msg = `
          <div class="map-card">
            <div class="map-card-connect">${this.$t('deviceon.device.status.connected')} : <span>${connect}</span></div>
            <div class="map-card-disconnect">${this.$t('deviceon.device.status.disconnected')} : <span>${disconnect}</span></div>
            <div class="map-card-abnormal">${this.$t('deviceon.device.status.abnormal')} : <span>${error}</span></div>
            <div class="map-card-all">${this.$t('deviceon.device.status.all')} : <span>${connect + disconnect + error}</span></div>
          </div>
        `
      var popup = L.popup()
        .setLatLng(a.layer.getLatLng())
        .setContent(msg)
        .openOn(this.map)
    //   a.target.bindTooltip(,
    //   {
    //     offset: [30, 0],
    //     direction: 'right'
    //   }
    //   ).openTooltip()
    },
    checkChildCluster (e, index) {
      let arr = []
      if (e._childClusters.length !== 0) {
        for (let child of e._childClusters) {
          arr = arr.concat(self.checkChildCluster(child, index + 1))
        }
      }
      if (e._markers.length !== 0) {
        for (let m of e._markers) {
          arr.push({
            lat: m._latlng.lat,
            lng: m._latlng.lng
          })
        }
      }
      return arr
    },
    HoverAction (e) {
      if (e.type === 'mouseover') {
        let connect = 0
        let disconnect = 0
        let error = 0
        let inside = self.markers.filter((m) => {
          return e.latlng.lat === m.lat && e.latlng.lng === m.lng
        })[0]
        if (inside && inside.type === 'location') {
          inside.devices.forEach((d) => {
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
          e.target.bindTooltip(`
            <div class="map-card">
              <div class="map-card-connect">${this.$t('deviceon.device.status.connected')} : <span>${connect}</span></div>
              <div class="map-card-disconnect">${this.$t('deviceon.device.status.disconnected')} : <span>${disconnect}</span></div>
              <div class="map-card-abnormal">${this.$t('deviceon.device.status.abnormal')} : <span>${error}</span></div>
              <div class="map-card-all">${this.$t('deviceon.device.status.all')} : <span>${connect + disconnect + error}</span></div>
            </div>
            `, {
            offset: [20, -20],
            direction: 'right'
          }).openTooltip()
        }
      } else {
        e.target.unbindTooltip()
      }
    },
    openModal (e, type) {
      let Deviceinfo = {
        type: type,
        agentId: e.devices[0].agentId,
        did: e.devices[0].did
      }
      switch (type) {
        case 'remotedesktop':
          Deviceinfo.os = e.devices[0].os
          Deviceinfo.amtsupport = e.devices[0].amtsupport
          break
      }
      this.$emit('openModal', Deviceinfo)
    }
  }
}
</script>

<style lang="scss">
  .leaflet-map {
    position: absolute;
    bottom: 0;
    top: 0;
    width: 100%;
  }
  .leaflet-fade-anim .leaflet-map-pane .leaflet-popup {
    bottom: 30px !important;
  }
</style>
