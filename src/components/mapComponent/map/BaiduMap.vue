<template>
  <div class="h-100">
    <baidu-map
      class="BaiduMap h-100"
      :center="center"
      :zoom="zoom"
      @ready="mapInit"
      :scroll-wheel-zoom="true"
      ref="BaiduMap"
      @click="clickMap($event)"
    >
    <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT" ref="navbar01"></bm-navigation>
    <bml-marker-clusterer :averageCenter="true" ref="clusterRef" @clusterHover="clusterHover($event)" @clusterOut="outAction" @clusterClick="show=true">
      <bm-marker
        v-for="(marker,index) in markers"
        :key="index"
        :position="{lng: marker.lng, lat: marker.lat}"
        :icon="{url: marker.iconUrl, size: {width: 36, height: 42}}"
        :offset="{width: 0,height: -15}"
        @click="clickMarker($event ,index)"
        @mouseover="hoverAction(marker)"
        @mouseout="outAction()"
        ref="markerRef"
      />
      <bm-info-window
        :show="inforWindow.show"
        :position="{lng: inforWindow.lng, lat: inforWindow.lat}"
        :height="0"
        :offset="{width: 0,height: -20}"
        @close="infoWindowClose"
        @open="infoWindowOpen"
      >
        <div v-if="action === 'click'">
          <div class="popup-device-name">
            {{deviceName}}
          </div>
          <!-- PowerOn -->
          <div class="map-popup-btn" @click="openModal('powerOn')" v-if="deviceStatus === 'disconnect'">
            {{'deviceon.power.actions.start' | translate}}
          </div>
          <!-- IDS -->
          <div class="map-popup-btn" @click="openModal('OSD')" v-if="hasIDS && deviceStatus !=='disconnect'">
            {{'deviceon.device.view.OSD' | translate}}
          </div>
          <!-- ARK -->
          <div class="map-popup-btn" @click="openModal('monitoring')" v-if="hasARK && deviceStatus !=='disconnect'">
            {{'deviceon.menu.device.devicemonitoring' | translate}}
          </div>
          <div class="map-popup-btn" @click="openModal('screenshot')" v-if="hasARK && deviceStatus !=='disconnect'">
            {{'deviceon.overview.action.takeScreen' | translate}}
          </div>
          <div class="map-popup-btn" @click="openModal('remotedesktop')" v-if="hasARK && deviceStatus !=='disconnect'">
            {{'deviceon.device.view.remoteDesktop' | translate}}
          </div>
          <!-- Event -->
          <div class="map-popup-btn" @click="openModal('event')" v-if="deviceStatus ==='error'">
            {{'deviceon.menu.event' | translate}}
          </div>
        </div>
        <div v-if="action === 'hover'" class="map-card">
          <div class="map-card-connect">{{'deviceon.device.status.connected' | translate}} : <span>{{inforWindow.connect}}</span></div>
          <div class="map-card-disconnect">{{'deviceon.device.status.disconnected'  | translate}} : <span>{{inforWindow.disconnect}}</span></div>
          <div class="map-card-abnormal">{{'deviceon.device.status.abnormal' | translate}} : <span>{{inforWindow.error}}</span></div>
          <div class="map-card-all">{{'deviceon.device.status.all' | translate}} : <span>{{inforWindow.connect + inforWindow.disconnect + inforWindow.error}}</span></div>
        </div>
      </bm-info-window>
      <bm-marker
        v-if="addNewMarker.isTrue"
        :position="{lng: addNewMarker.lng, lat: addNewMarker.lat}"
        :icon="{ url: addNewMarker.icon,size: { width: 36, height: 42 }, opts: { anchor: { width: 18, height: 42 }}}"
      ></bm-marker>
    </bml-marker-clusterer>
  </baidu-map>
  <div>
    </div>
  </div>
</template>

<script>
import DeviceOnApis from '@/util/DeviceOnApis'
import Vue from 'vue'
// import RMMGlobal from '@/util/RMMGlobal'
import BaiduMap from 'vue-baidu-map'
import BmlMarkerClusterer from 'deviceon-baidumap-marker-cluster'
import { deviceStatusConnect, deviceStatusDisconnect, deviceStatusError, deviceStatusConnectSelected, deviceStatusDisconnectSelected, deviceStatusErrorSelected, locationErrorNormal, locationErrorSelected, locationNormal, locationSelected } from './icon'
Vue.use(BaiduMap, {
  ak: 'fVwxO2FtvgezfQtWzqdHaoGb'
})

let self = {}

export default {
  name: 'baidu-mapD',
  props: ['selectedMarker', 'orignMarkers'],
  data () {
    return {
      APIkey: '',
      apiKeyFT: -1,
      show: false,
      bmap: '',
      center: { lng: 0, lat: 0 },
      zoom: 5,
      markers: [],
      addNewMarker: {
        isTrue: false,
        lat: 0,
        lng: 0,
        icon: ''
      },
      inforWindow: {
        show: false,
        lat: 0,
        lng: 0
      },
      action: '',

      deviceStatus: '',
      deviceName: '',
      hasIDS: false,
      hasARK: false
    }
  },
  components: {
    BmlMarkerClusterer
  },
  watch: {
    orignMarkers (value) {
      if (value.length !== 0) {
        self.markers = []
        for (let m of value) {
          if (m.type === 'device') {
            switch (m.status) {
              case 'connect':
                self.$set(m, 'iconUrl', deviceStatusConnect)
                break
              case 'error':
                self.$set(m, 'iconUrl', deviceStatusError)
                break
              default:
                self.$set(m, 'iconUrl', deviceStatusDisconnect)
                break
            }
          } else {
            if (!m.hasError) this.$set(m, 'iconUrl', locationNormal)
            else this.$set(m, 'iconUrl', locationErrorNormal)
          }
          self.markers.push(m)
        }

        // Set viewport to all makers
        let minZoon = 5
        setTimeout(() => {
          self.bmap.setViewport(self.markers)
          let oView = self.bmap.getViewport(self.markers)
          if (oView.zoom > minZoon) {
            self.bmap.setZoom(minZoon)
          }
        }, 300)
      }
    },
    selectedMarker (value) {
      self.markers.forEach((item, index) => {
        if (item.id === value.id) {
          if (item.type === 'device') {
            item.status = value.status
            switch (item.status) {
              case 'connect':
                self.$set(item, 'iconUrl', value.isSelected ? deviceStatusConnectSelected : deviceStatusConnect)
                break
              case 'error':
                self.$set(item, 'iconUrl', value.isSelected ? deviceStatusErrorSelected : deviceStatusError)
                break
              default:
                self.$set(item, 'iconUrl', value.isSelected ? deviceStatusDisconnectSelected : deviceStatusDisconnect)
                break
            }
          } else {
            if (!item.hasError) self.$set(item, 'iconUrl', value.isSelected ? locationSelected : locationNormal)
            else self.$set(item, 'iconUrl', value.isSelected ? locationErrorSelected : locationErrorNormal)
          }
          item.plans = value.plans
          item.devices = value.devices
          if (value.isSelected) self.bmap.centerAndZoom(new BMap.Point(item.lng, item.lat), 5)
        } else {
          if (item.type === 'device') {
            switch (item.status) {
              case 'connect':
                self.$set(item, 'iconUrl', deviceStatusConnect)
                break
              case 'error':
                self.$set(item, 'iconUrl', deviceStatusError)
                break
              default:
                self.$set(item, 'iconUrl', deviceStatusDisconnect)
                break
            }
          } else {
            if (!item.hasError) self.$set(item, 'iconUrl', locationNormal)
            else self.$set(item, 'iconUrl', locationErrorNormal)
          }
        }
      })
    }
  },
  mounted () {
    self = this
  },
  methods: {
    clickMap (e) {
      if (!this.show) {
        self.addNewMarker.lat = e.point.lat
        self.addNewMarker.lng = e.point.lng
        self.addNewMarker.icon = self.locationSelected
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
      } else {
        this.show = !this.show
      }
    },
    mapInit ({ BMap, map }) {
      this.center.lng = 121.234
      this.center.lat = 25.055
      this.zoom = 3
      this.bmap = map
      this.$bus.$emit('bmap', this.bmap)
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
                self.$set(m, 'iconUrl', deviceStatusConnect)
                break
              case 'error':
                self.$set(m, 'iconUrl', deviceStatusError)
                break
              default:
                self.$set(m, 'iconUrl', deviceStatusDisconnect)
                break
            }
          } else {
            self.$set(m, 'iconUrl', locationNormal)
          }
        }
      })
      if (self.markers[index].type === 'device') {
        this.inforWindow.did = self.markers[index].devices[0].did
        this.inforWindow.os = self.markers[index].devices[0].os
        this.inforWindow.amtsupport = self.markers[index].devices[0].amtsupport
        this.deviceName = self.markers[index].name
        this.hasIDS = self.markers[index].hasIDS
        this.hasARK = self.markers[index].hasARK
        this.deviceStatus = self.markers[index].status
        if (self.markers[index].hasIDS || self.markers[index].hasARK) {
          this.action = 'click'
          this.inforWindow.lat = self.markers[index].lat
          this.inforWindow.lng = self.markers[index].lng
          this.inforWindow.agentId = self.markers[index].devices[0].agentId
          this.inforWindow.show = true
        } else {
          this.inforWindow.show = false
        }
        switch (self.markers[index].status) {
          case 'connect':
            this.$set(self.markers[index], 'iconUrl', deviceStatusConnectSelected)
            break
          case 'error':
            this.$set(self.markers[index], 'iconUrl', deviceStatusErrorSelected)
            break
          default:
            this.$set(self.markers[index], 'iconUrl', deviceStatusDisconnectSelected)
            break
        }
      } else {
        this.$set(self.markers[index], 'iconUrl', locationSelected)
      }
      this.show = true
    },
    clusterHover (e) {
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
    },
    hoverAction (e) {
      if (e.type === 'location' || e.type === 'cluster') {
        let connect = 0
        let disconnect = 0
        let error = 0

        this.action = 'hover'
        this.inforWindow.lat = e.lat
        this.inforWindow.lng = e.lng
        this.inforWindow.show = true

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
        this.inforWindow.connect = connect
        this.inforWindow.disconnect = disconnect
        this.inforWindow.error = error
      }
    },
    outAction () {
      if (this.action === 'hover') {
        this.inforWindow.show = false
      }
    },
    infoWindowClose (e) {
      this.inforWindow.show = false
    },
    infoWindowOpen (e) {
      this.inforWindow.show = true
    },
    openModal (type) {
      let Deviceinfo = {
        type: type,
        agentId: this.inforWindow.agentId,
        did: this.inforWindow.did,
        name: this.inforWindow.name
      }
      switch (type) {
        case 'remotedesktop':
          Deviceinfo.os = this.inforWindow.os
          Deviceinfo.amtsupport = this.inforWindow.amtsupport
          break
      }
      this.$emit('openModal', Deviceinfo)
    }
  },
  computed: {}
}
</script>

<style lang="scss">
.BaiduMap {
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
