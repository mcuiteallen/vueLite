<template>
  <div class="mapComponent">
    <keep-alive>
      <baidu-map
        :orign-markers="markers"
        :selected-marker="selectedMarker"
        @clickMarker="clickMarker"
        @addMarker="addNewMarker($event)"
        @openModal="openModal($event)"
        v-if="selectedMap.name === 'BaiduMap'"
      />
      <leaflet-map
        :orign-markers="markers"
        :selected-marker="selectedMarker"
        :resize="resize"
        @clickMarker="clickMarker"
        @addMarker="addNewMarker($event)"
        @openModal="openModal($event)"
        v-if="selectedMap.name === 'LeafletMap'"
      />
      <leaflet-map-offline
        :orign-markers="markers"
        :selected-marker="selectedMarker"
        :resize="resize"
        @clickMarker="clickMarker"
        @addMarker="addNewMarker($event)"
        @openModal="openModal($event)"
        v-if="selectedMap.name === 'LeafletMapOffline'"
      />
      <!-- <baidu-map-offline
        :orign-markers="markers"
        :selected-marker="selectedMarker"
        @clickMarker="clickMarker"
        @addMarker="addNewMarker($event)"
        @openModal="openModal($event)"
        v-if="selectedMap.name === 'BaiduMap' && offline"
      /> -->
    </keep-alive>
    <google-map
      :orign-markers="markers"
      :selected-marker="selectedMarker"
      @clickMarker="clickMarker"
      @addMarker="addNewMarker($event)"
      @refresh="googleRefresh()"
      @openModal="openModal($event)"
      v-if="selectedMap.name === 'GoogleMap' && refresh"
    />
  </div>
</template>

<script>
import DeviceOnApis from '@/util/DeviceOnApis'
import RMMGlobal from '@/util/RMMGlobal'

import GoogleMap from './GoogleMap'
import LeafletMap from './LeafletMap'
import BaiduMap from './BaiduMap'

import LeafletMapOffline from './leafletMapOffline'
import BaiduMapOffline from './BaiduMapOffline'
let self = {}

export default {
  name: 'mapComponent',
  props: ['orignMarkers', 'deleteMarker', 'selectedMarker', 'selectedMap', 'resize'],
  components: {
    LeafletMap,
    BaiduMap,
    GoogleMap,
    LeafletMapOffline,
    BaiduMapOffline
  },
  data () {
    return {
      markers: [],
      refreshMarkers: [],
      refresh: true,
      oldMarkers: ''
    }
  },
  watch: {
    orignMarkers (data) {
      let value = JSON.stringify(data)
      let cmpValue = self.oldMarkers
      if (data.length !== 0 && value !== cmpValue) {
        self.markers = JSON.parse(JSON.stringify(data))
        self.refreshMarkers = JSON.parse(JSON.stringify(data))
        self.oldMarkers = JSON.stringify(data)
      }
    },
    deleteMarker (id) {
      if (id !== -1) {
        self.deleteBuilding(id)
      }
    },
    selectedMap () {
      self.markers = []
      setTimeout(() => {
        self.markers = JSON.parse(JSON.stringify(self.refreshMarkers))
      }, 200)
    },
  },
  computed: {},
  mounted () {
    self = this
    let oRMM = RMMGlobal.get()
  },
  methods: {
    deleteBuilding (id) {
      let deleteMarker = ''
      let index = 0
      for (let i = 0; i < self.markers.length; i++) {
        if (self.markers[i].id === id) {
          deleteMarker = self.markers[i]
          index = i
          break
        }
      }
      if (deleteMarker !== '') {
        if (deleteMarker.type === 'device') {
          // 先刪除地點上的設備
          DeviceOnApis.devicemap.delete
            .mapid(deleteMarker.devices[0].id)
            .then(function (xhr) {
              // 刪除建築
              self.deleteMapId(deleteMarker.id, index)
            })
            .catch(function (error) {
              self.$emit('deleteMarkerResponse', false)
              DeviceOnApis.MessageBox.Error(self, error)
            })
        } else if (deleteMarker.type === 'location') {
          // 先刪除Default_Area
          if (deleteMarker.plans.length !== 0 && deleteMarker.plans[0].name === 'Default_Area') {
            DeviceOnApis.devicemap.delete
              .mapid(deleteMarker.plans[0].id)
              .then(function (xhr) {
                // 刪除建築
                self.deleteMapId(deleteMarker.id, index)
              })
              .catch(function (error) {
                self.$emit('deleteMarkerResponse', false)
                if (error.response.status === 403 && error.response.data.ErrorCode === '1458' && error.response.data.Field === 'mapId') {
                  DeviceOnApis.MessageBox.Normal(
                    self,
                    self.$t('deviceon.message.warning'),
                    self.$t('deviceon.device.message.deleteMapDevice'),
                    'warning'
                  )
                } else {
                  DeviceOnApis.MessageBox.Error(self, error)
                }
              })
          } else {
            // 刪除建築
            self.deleteMapId(deleteMarker.id, index)
          }
        }
      }
    },
    deleteMapId (id, index) {
      DeviceOnApis.devicemap.delete
        .mapid(id)
        .then(function (xhr) {
          DeviceOnApis.MessageBox.Normal(
            self,
            self.$t('deviceon.action.messages.deleteSuccess'),
            '',
            'success'
          )
          self.markers.splice(index, 1)
          self.refreshMarkers.splice(index, 1)
          self.$emit('deleteMarkerResponse', true)
        })
        .catch(function (error) {
          self.isLoading = false
          self.$emit('deleteMarkerResponse', false)
          if (error.response.status === 403 && error.response.data.ErrorCode === '1458' && error.response.data.Field === 'mapId') {
            DeviceOnApis.MessageBox.Normal(
              self,
              self.$t('deviceon.message.warning'),
              self.$t('deviceon.device.message.deleteMapArea'),
              'warning'
            )
          } else {
            DeviceOnApis.MessageBox.Error(self, error)
          }
        })
    },
    clickMarker (val) {
      self.$emit('clickMarker', val)
    },
    addNewMarker (val) {
      self.$emit('addMarker', val)
    },
    googleRefresh (val) {
      if (this.selectedMap.name === 'GoogleMap') {
        this.refresh = false
        self.markers = []
        setTimeout(() => {
          self.refresh = true
        }, 1000)
        setTimeout(() => {
          self.markers = JSON.parse(JSON.stringify(self.refreshMarkers))
        }, 2000)
      }
    },
    openModal (e) {
      this.$emit('openModal', e)
    }
  }
}
</script>

<style lang="scss">
.mapComponent {
  height: 100%;
}
</style>
