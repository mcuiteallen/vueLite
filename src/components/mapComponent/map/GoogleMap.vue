<template>
  <div class="h-100">
    <loading :active.sync="isLoading" :can-cancel="true" :is-full-page="false"></loading>
    <!-- 輸入APIkey -->
    <button
      type="button"
      class="btn btn-svg svg-noPadding api-key"
      @click="ShowMapAPI"
      v-tooltip.top-center="{ content: $t('deviceon.dashboard.mapCoordinate.apiKeyBtn'), trigger: 'hover', offset: 8}"
    >
      <icon iconName="tool-key"/>
    </button>

    <GmapMap
      ref="googleMap"
      class="googleMap"
      :center="center"
      :zoom="zoom"
      map-type-id="roadmap"
      @click="clickMap($event)"
    >
    <GmapCluster :averageCenter="true" @mouseover="hoverAction('cluster',$event)" @mouseout="infoWinOpen = false">
      <GmapMarker
        :key="index"
        v-for="(m, index) in markers"
        :position="{lat: m.lat,lng: m.lng}"
        :icon="m.icon"
        :clickable="true"
        :draggable="false"
        @click="clickMarker(index)"
        @mouseover="hoverAction('marker',$event)"
        @mouseout="outAction()"
      />
    </GmapCluster>
    <GmapMarker
      v-if="addNewMarker.isTrue"
      :position="{lat: addNewMarker.lat,lng: addNewMarker.lng}"
      :icon="addNewMarker.icon"
    />
    <gmap-info-window
      :options="infoOptions"
      :position="infoWindowPos"
      :opened="infoWinOpen"
      @closeclick="infoWinOpen=false"
      >
      <div v-if="action === 'hover'" v-html="infoContent"></div>
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
    </gmap-info-window>
    </GmapMap>

    <!-- 填入API -->
    <vuestic-modal
      ref="ModalMapAPI"
      :force="true"
      :shownote="true"
      :keepOpen="true"
      :okText="'modal.confirm' | translate"
      :cancelText="'modal.cancel' | translate"
      @close="closeAPIModal"
      @ok="saveAPIkey"
    >
      <div slot="title">{{'deviceon.dashboard.mapCoordinate.APIkey' | translate}}</div>
      <div slot="note-title">
        {{'deviceon.dashboard.mapCoordinate.APITitle' | translate}}
      </div>
      <div slot="note-text">
        <div class="mt-2">{{'deviceon.dashboard.mapCoordinate.APIContent' |translate}}</div>
        <div class="mt-2">
          <a rel="noopener noreferrer"
            href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">
            {{'deviceon.dashboard.mapCoordinate.APIGet' | translate}}
          </a>
        </div>
      </div>
      <div class="modal-content-inner mt-4 mb-4">
        <div class="item-list">
          <div class="form-group with-icon-right" :class="{'has-error': errors.has('APIkey')}">
            <div class="input-group">
              <div class="item-title">{{'deviceon.dashboard.mapCoordinate.APIkey' | translate}}</div>
              <input v-model="APIkey" name="APIkey" v-validate="'required'"/>
              <i class="fa fa-exclamation-triangle input-icon error-icon"></i>
              <i class="bar"></i>
              <small
                v-show="errors.has('APIkey')"
                class="text-danger"
              >{{errors.first('APIkey')}}</small>
              </div>
          </div>
        </div>
      </div>
    </vuestic-modal>
  </div>
</template>

<script>

import DeviceOnApis from '@/util/DeviceOnApis'
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'
import GmapCluster from 'vue2-google-maps/dist/components/cluster'
import RMMGlobal from '@/util/RMMGlobal'
import { deviceStatusConnect, deviceStatusDisconnect, deviceStatusError, deviceStatusConnectSelected, deviceStatusDisconnectSelected, deviceStatusErrorSelected, locationErrorNormal, locationErrorSelected, locationNormal, locationSelected } from './icon'

// import google from 'google'
// const oRMM = RMMGlobal.get()
let self = {}
let firstapi = false
Vue.use(VueGoogleMaps)
Vue.component('GmapCluster', GmapCluster)

// Google Map setAPI

function setAPI (options, loadCn) {
  const googleMapScript = document.createElement('SCRIPT')
  // Allow options to be an object.
  // This is to support more esoteric means of loading Google Maps,
  // such as Google for business
  // https://developers.google.com/maps/documentation/javascript/get-api-key#premium-auth
  if (typeof options !== 'object') {
    throw new Error('options should  be an object')
  }

  // libraries
  if (Array.prototype.isPrototypeOf(options.libraries)) {
    options.libraries = options.libraries.join(',')
  }
  options['callback'] = 'vueGoogleMapsInit'

  let baseUrl = 'https://maps.googleapis.com/'

  if (typeof loadCn === 'boolean' && loadCn === true) {
    baseUrl = 'https://ditu.google.com/'
  }

  let url = baseUrl + 'maps/api/js?' +
    Object.keys(options)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(options[key]))
      .join('&')

  googleMapScript.setAttribute('src', url)
  googleMapScript.setAttribute('async', '')
  googleMapScript.setAttribute('defer', '')
  document.head.appendChild(googleMapScript)
}

export default {
  name: 'google-map',
  props: ['selectedMarker', 'orignMarkers'],
  data () {
    return {
      isLoading: true,
      show: false,
      APIkey: '',
      map: '',
      zoom: 3,
      markers: [],
      bounds: '',
      locationIconNormal: {
        url: locationNormal,
        size: { width: 36, height: 36 },
        opts: { anchor: { width: 18, height: 36 } }
      },
      locationIconError: {
        url: locationErrorNormal,
        size: { width: 36, height: 36 },
        opts: { anchor: { width: 18, height: 36 } }
      },
      locationIconSelected: {
        url: locationSelected,
        size: { width: 42, height: 42 },
        opts: { anchor: { width: 21, height: 42 } }
      },
      locationIconErrorSelected: {
        url: locationErrorSelected,
        size: { width: 42, height: 42 },
        opts: { anchor: { width: 21, height: 42 } }
      },
      deviceIconConnectedNormal: {
        url: deviceStatusConnect,
        size: { width: 32, height: 32 },
        opts: { anchor: { width: 25, height: 50 } }
      },
      deviceIconDisconnectedNormal: {
        url: deviceStatusDisconnect,
        size: { width: 32, height: 32 },
        opts: { anchor: { width: 25, height: 50 } }
      },
      deviceIconErrorNormal: {
        url: deviceStatusError,
        size: { width: 32, height: 32 },
        opts: { anchor: { width: 25, height: 50 } }
      },
      deviceIconConnectedSelected: {
        url: deviceStatusConnectSelected,
        size: { width: 38, height: 38 },
        opts: { anchor: { width: 19, height: 38 } }
      },
      deviceIconDisconnectedSelected: {
        url: deviceStatusDisconnectSelected,
        size: { width: 38, height: 38 },
        opts: { anchor: { width: 19, height: 38 } }
      },
      deviceIconErrorSelected: {
        url: deviceStatusErrorSelected,
        size: { width: 38, height: 38 },
        opts: { anchor: { width: 19, height: 38 } }
      },
      addNewMarker: {
        isTrue: false,
        lat: 0,
        lng: 0,
        icon: ''
      },
      infoWinOpen: false,
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
      infoWindowPos: {
        lat: 10,
        lng: 10
      },
      infoContent: '',
      center: {
        lat: 25.055,
        lng: 121.234
      },

      config: {},
      oRMM: RMMGlobal.get(),
      action: '',
      selected: '',

      deviceStatus: '',
      deviceName: '',
      hasIDS: false,
      hasARK: false
    }
  },
  components: {

  },
  watch: {
    orignMarkers (value) {
      if (value.length !== 0 && window.google) {
        self.markers = []
        this.bounds = new window.google.maps.LatLngBounds()
        for (let m of value) {
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
          self.bounds.extend({ lat: m.lat, lng: m.lng })
          self.markers.push(m)
        }
        // self.$refs.googleMap.$mapObject.fitBounds(self.bounds)
        // let minZoom = 3
        // let nowZoom = self.$refs.googleMap.$mapObject.getZoom()
        // if (nowZoom > minZoom) {
        //   self.$refs.googleMap.$mapObject.setZoom(minZoom)
        // }
      }
      self.isLoading = false
    },
    selectedMarker (value) {
      self.markers.forEach((item, index) => {
        if (item.id === value.id) {
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

          item.plans = value.plans
          item.devices = value.devices
          if (value.isSelected) self.map.panTo({ lat: item.lat, lng: item.lng })
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
    }
  },
  created () {
    if (!firstapi) {
      firstapi = true
      var options = {
        key: (RMMGlobal.get().GoogleAPIKey) ? RMMGlobal.get().GoogleAPIKey : 'AIzaSyCCGhv7ryot0iu9ufz-BXlZBZxcYhB7q8c',
        libraries: ['geometry', 'places'],
        language: RMMGlobal.currentLanguage() === 'en-US' ? 'en' : RMMGlobal.currentLanguage(),
      }
      setAPI(options, navigator.language === 'zh-CN')
    }
  },
  mounted () {
    self = this
    self.mapInit()

    // Events
    window.addEventListener('message', this.eventHandler)
  },
  methods: {
    clickMap (e) {
      self.addNewMarker.lat = e.latLng.lat()
      self.addNewMarker.lng = e.latLng.lng()
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
    mapInit () {
      this.$refs.googleMap.$mapPromise.then((map) => {
        this.map = map
      })
    },
    clickMarker (index) {
      self.$emit('clickMarker', {
        id: self.markers[index].id,
        type: self.markers[index].type
      })
      self.markers.forEach((m, i) => {
        if (i !== index) {
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
            self.$set(m, 'icon', self.locationIconNormal)
          }
        }
      })
      if (self.markers[index].type === 'device') {
        self.deviceName = self.markers[index].name
        this.hasIDS = self.markers[index].hasIDS
        this.hasARK = self.markers[index].hasARK
        this.deviceStatus = self.markers[index].status
        // 有IDS顯示控制按鈕
        if (self.markers[index].hasIDS || self.markers[index].hasARK) {
          this.infoWinOpen = true
          this.action = 'click'
          this.selected = self.markers[index]
        }
        switch (self.markers[index].status) {
          case 'connect':
            self.$set(self.markers[index], 'icon', self.deviceIconConnectedSelected)
            break
          case 'error':
            self.$set(self.markers[index], 'icon', self.deviceIconErrorSelected)
            break
          default:
            self.$set(self.markers[index], 'icon', self.deviceIconDisconnectedSelected)
            break
        }
      } else {
        self.$set(self.markers[index], 'icon', self.locationIconSelected)
      }
    },
    ShowMapAPI () {
      self.$refs.ModalMapAPI.open()
      DeviceOnApis.ui.get
        .my()
        .then(function (xhr) {
          if (xhr && xhr.data && xhr.data.menus) {
            self.config = xhr.data
            if (!self.config.GoogleAPIKey) {
              self.$set(self.config, 'GoogleAPIKey', 'AIzaSyCCGhv7ryot0iu9ufz-BXlZBZxcYhB7q8c')
              DeviceOnApis.ui.post
                .my(self.config)
                .then(function (xhr) {
                  let option = {
                    key: 'AIzaSyCCGhv7ryot0iu9ufz-BXlZBZxcYhB7q8c',
                    libraries: ['geometry', 'places'],
                    language: RMMGlobal.currentLanguage() === 'en-US' ? 'en' : RMMGlobal.currentLanguage()
                  }
                  setAPI(option, (navigator.language === 'zh-CN'))
                  self.$emit('refresh')
                  // location.reload()
                })
                .catch(function (error) {
                  self.isLoading = false
                  DeviceOnApis.MessageBox.Error(self, error)
                })
            } else if (self.config.GoogleAPIKey !== self.oRMM.GoogleAPIKey) {
              self.$set(self.oRMM, 'GoogleAPIKey', self.config.GoogleAPIKey)
              RMMGlobal.set(self.oRMM)
            }
          }
          self.isLoading = false
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    saveAPIkey () {
      this.$validator.validate('APIkey').then(function (result) {
        if (result) {
          self.$set(self.oRMM, 'GoogleAPIKey', self.APIkey)
          RMMGlobal.set(self.oRMM)
          self.$set(self.config, 'GoogleAPIKey', self.APIkey)

          DeviceOnApis.ui.post
            .system(self.config)
            .then(function (xhr) {
              self.isLoading = false
              // 刪除 google map api key <script>
              const allScripts = document.getElementsByTagName('script');
              [].filter.call(
                allScripts,
                (scpt) => scpt.src.indexOf('/maps/api/js') >= 0
              )[0].remove()

              let option = {
                key: self.APIkey,
                libraries: ['geometry', 'places'],
                language: RMMGlobal.currentLanguage() === 'en-US' ? 'en' : RMMGlobal.currentLanguage()
              }
              setAPI(option, (navigator.language === 'zh-CN'))

              self.$emit('refresh')
              self.$refs.ModalMapAPI.close()

              DeviceOnApis.MessageBox.Normal(
                self,
                self.$t('deviceon.action.messages.editSuccess'),
                '',
                'success'
              )
              // location.reload()
            })
            .catch(function (error) {
              self.isLoading = false
              DeviceOnApis.MessageBox.Error(self, error)
            })
        }
      })
    },
    closeAPIModal () {
      setTimeout(function () {
        self.APIkey = ''
      }, 20)
      setTimeout(function () {
        self.errors.clear()
      }, 50)
    },
    eventHandler (e) {
      let cmd = e.data
      if (cmd.type === 'language') {
        // 更改googlemap 語言顯示
        // 刪除 google map api key <script>
        const allScripts = document.getElementsByTagName('script');
        [].filter.call(
          allScripts,
          (scpt) => scpt.src.indexOf('/maps/api/js') >= 0
        )[ 0 ].remove()
        let option = {
          key: self.config.GoogleAPIKey ? self.config.GoogleAPIKey : 'AIzaSyCCGhv7ryot0iu9ufz-BXlZBZxcYhB7q8c',
          libraries: ['geometry', 'places'],
          language: RMMGlobal.currentLanguage() === 'en-US' ? 'en' : RMMGlobal.currentLanguage()
        }
        setAPI(option, (navigator.language === 'zh-CN'))
        self.$emit('refresh')
      }
    },
    hoverAction (type, e) {
      this.infoWinOpen = true
      this.action = 'hover'
      let connect = 0
      let disconnect = 0
      let error = 0
      let inside = []
      if (type === 'cluster') {
        this.infoWindowPos = {
          lat: e.center_.lat(),
          lng: e.center_.lng()
        }
        let index = e.markerClusterer_.clusters_.findIndex((m) => {
          return e.center_.lat() === m.center_.lat() && e.center_.lng() === m.center_.lng()
        })
        inside = self.markers.filter((m) => {
          let flag = false
          for (let mar of e.markerClusterer_.clusters_[index].markers_) {
            if (m.lat === mar.position.lat() && m.lng === mar.position.lng()) {
              flag = true
              break
            }
          }
          return flag
        })
      } else {
        this.infoWindowPos = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        }
        inside = self.markers.filter((m) => {
          return m.lat === e.latLng.lat() && m.lng === e.latLng.lng()
        })
        if (inside[0].type === 'device') this.infoWinOpen = false
      }
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
      this.infoContent = `
        <div class="map-card">
          <div class="map-card-connect">${this.$t('deviceon.device.status.connected')} : <span>${connect}</span></div>
          <div class="map-card-disconnect">${this.$t('deviceon.device.status.disconnected')} : <span>${disconnect}</span></div>
          <div class="map-card-abnormal">${this.$t('deviceon.device.status.abnormal')} : <span>${error}</span></div>
          <div class="map-card-all">${this.$t('deviceon.device.status.all')} : <span>${connect + disconnect + error}</span></div>
        </div>
      `
    },
    outAction () {
      if (this.action === 'hover') {
        this.infoWinOpen = false
      }
    },
    openModal (type) {
      let Deviceinfo = {
        type: type,
        agentId: this.selected.devices[0].agentId,
        did: this.selected.devices[0].did,
        name: this.selected.devices[0].name
      }
      switch (type) {
        case 'remotedesktop':
          Deviceinfo.os = this.selected.devices[0].os
          Deviceinfo.amtsupport = this.selected.devices[0].amtsupport
          break
      }
      this.$emit('openModal', Deviceinfo)
    }
  },
  computed: {
  },
  destroyed () {
    window.removeEventListener('message', this.eventHandler)
  }
}
</script>

<style lang="scss">
.googleMap{
  color: black;
  height: 100%;
	// popUp 的三角形
  .gm-style .gm-style-iw-t::after{
    content: none;
  }
  .gm-style img{
    max-width: 100% !important;
    max-height: 100% !important;
  }
}
.api-key {
  position: absolute;
  right: 1rem;
  top: -3rem;
}
</style>
