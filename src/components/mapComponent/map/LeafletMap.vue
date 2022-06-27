<template>
  <div class="leaflet-map h-100">
    <l-map :zoom="zoom" :center="center" ref="map" :bounds="bounds" @click="clickMap($event)">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <v-marker-cluster ref="clusterRef">
        <l-marker v-for="(m, index) in markers" :key="index" :lat-lng="[m.lat, m.lng]" ref="markersRef" :icon="m.icon" @click="clickMarker(index)" @mouseover="HoverAction($event)" @mouseout="HoverAction($event)">
          <l-popup v-if="m.type === 'device'">
            <div class="popup-device-name">
              {{m.name}}
            </div>
            <!-- PowerOn -->
            <div class="map-popup-btn" @click="openModal(m, 'powerOn')" v-show="m.status === 'disconnect'">
              {{'deviceon.power.actions.start' | translate}}
            </div>
            <!-- IDS -->
            <div class="map-popup-btn" @click="openModal(m, 'OSD')" v-show="m.hasIDS && m.status !== 'disconnect'">
              {{'deviceon.device.view.OSD' | translate}}
            </div>
            <!-- ARK -->
            <div class="map-popup-btn" @click="openModal(m, 'monitoring')" v-show="m.hasARK && m.status !== 'disconnect'">
              {{'deviceon.menu.device.devicemonitoring' | translate}}
            </div>
            <div class="map-popup-btn" @click="openModal(m, 'screenshot')" v-show="m.hasARK && m.status !== 'disconnect'">
              {{'deviceon.overview.action.takeScreen' | translate}}
            </div>
            <div class="map-popup-btn" @click="openModal(m, 'remotedesktop')" v-show="m.hasARK && m.status !== 'disconnect'">
              {{'deviceon.device.view.remoteDesktop' | translate}}
            </div>
            <!-- Event -->
            <div class="map-popup-btn" @click="openModal(m, 'event')" v-show="m.status === 'error'">
              {{'deviceon.menu.event' | translate}}
            </div>
          </l-popup>
        </l-marker>
      </v-marker-cluster>
      <l-marker v-if="addNewMarker.isTrue" :lat-lng="[addNewMarker.lat, addNewMarker.lng]" :icon="addNewMarker.icon"/>
    </l-map>
  </div>
</template>

<script>
import Vue from 'vue'
import DeviceOnApis from '@/util/DeviceOnApis'
// import { latLngBounds } from 'leaflet'
import L from 'leaflet'
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

// 引入 leaflet.markercluster
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import { deviceStatusConnect, deviceStatusDisconnect, deviceStatusError, deviceStatusConnectSelected, deviceStatusDisconnectSelected, deviceStatusErrorSelected, locationErrorNormal, locationErrorSelected, locationNormal, locationSelected } from './icon'

// 設定預設 icon
Vue.component('v-marker-cluster', Vue2LeafletMarkerCluster)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

Vue.config.productionTip = false

let self = {}
export default {
  name: 'leaflet-map',
  props: ['selectedMarker', 'orignMarkers', 'resize'],
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  data () {
    return {
      zoom: 3,
      minZoom: 5,
      center: [25.2304, 121.4737],
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      markers: [],
      bound: [],
      bounds: [],
      markerObjects: null,
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
      self.markers.forEach((item, index) => {
        if (item.id === value.id) {
          item.plans = value.plans
          item.devices = value.devices
          if (value.isSelected) self.$refs.map.setCenter([item.lat, item.lng])
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
      })
    },
    orignMarkers (value) {
      if (value.length !== 0) {
        this.$nextTick(() => {
          self.markerObjects = self.$refs.markersRef.map(ref => ref.mapObject)
        })
        // set marker icon
        self.markers = []
        self.bound = []
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
        }
      }
    },
    resize () {
      window.dispatchEvent(new Event('resize'))
    }
  },
  computed: {},
  mounted () {
    self = this
    this.$refs.map.mapObject._onResize()

    document.getElementsByClassName('vue2leaflet-map')[0].style.zIndex = 0
    this.$nextTick(() => {
      self.$refs.clusterRef.mapObject.on('clustermouseover', function (a) {
        // a.layer is actually a cluster
        self.setTooltip(a)
      }).on('clustermouseout', function (a) {
        a.propagatedFrom.unbindTooltip()
      })
    })
  },
  methods: {
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
    clickMarker (index) {
      self.markers.forEach((item, i) => {
        if (i === index) {
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
            self.$set(item, 'icon', self.locationIconSelected)
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
            self.$set(item, 'icon', self.locationIconNormal)
          }
        }
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
      a.propagatedFrom.bindTooltip(`
          <div class="map-card">
            <div class="map-card-connect">${this.$t('deviceon.device.status.connected')} : <span>${connect}</span></div>
            <div class="map-card-disconnect">${this.$t('deviceon.device.status.disconnected')} : <span>${disconnect}</span></div>
            <div class="map-card-abnormal">${this.$t('deviceon.device.status.abnormal')} : <span>${error}</span></div>
            <div class="map-card-all">${this.$t('deviceon.device.status.all')} : <span>${connect + disconnect + error}</span></div>
          </div>
        `,
      {
        offset: [30, 0],
        direction: 'right'
      }
      ).openTooltip()
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
        did: e.devices[0].did,
        name: e.devices[0].name
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
