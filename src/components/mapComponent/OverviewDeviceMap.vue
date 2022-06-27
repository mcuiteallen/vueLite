<template>
  <div class="OverviewDeviceMap">
    <div class="d-flex justify-content-between">
      <div class="col-maplist d-flex flex-column" v-if="defaultView">
        <!-- 列表 -->
        <div class="row row-m-0 h-100 mapList" :class="{'full-mapList':!menuDetail}">
          <vuestic-widget
            class="widget-customized__widget info-widget no-v-padding"
            :headerText="'deviceon.dashboard.mapCoordinate.mapList' | translate"
            :otherIcon="true"
          >
            <button
              class="btn btn-svg"
              slot="otherIcon"
              @click="ShowAddEditMode('add', 'location')"
              v-tooltip.top-center="{ content: $t('deviceon.dashboard.mapCoordinate.addLDTitle'), trigger: 'hover', offset: 8}"
            >
              <icon iconName="main-add-normal"/>
            </button>
            <!-- 單獨列表或詳細資訊 -->
            <div slot="otherIcon" class="btn-svg svg-colorful" @click="listMode()">
              <!-- 單獨列表 -->
              <icon iconName="tool-menu" v-if="menuDetail" v-tooltip.top-center="{ content: $t('deviceon.dashboard.hiddenListDetail'), trigger: 'hover', offset: 8}"/>
              <!-- 詳細資訊 -->
              <icon iconName="tool-menuDetail" v-else v-tooltip.top-center="{ content: $t('deviceon.dashboard.showListDetail'), trigger: 'hover', offset: 8}"/>
            </div>

            <!-- content  -->
            <div class="col-sm-12" v-if="buildingList.length>0 ||deviceBuildingList.length>0">
              <!-- 地點列表 -->
              <div class="row">
                <ul v-for="(build,index) in buildingList" :key="index" class="allList">
                  <vuestic-collapse :editIcon="true" :mapIcon="true" ref="markers" class="underlocation-hasplan" :closeToggle="true" @iconClick="clickMarker(build, index)">
                    <div slot="header" class="Collapse-Toolicon-right" data-floor="1">
                      <div class="Collapse-Toolicon-right-inner" :class="{selected: build.isActive, active: build.isHover}" @mouseover="hoverAction(build, 'over')" @mouseleave="hoverAction(build, 'leave')">
                        <div
                          class="text-over-w100px position-relative item-name"
                          v-tooltip.top-center="{ content: build.name, trigger: 'hover', offset: 8}"
                          @click="clickMarker(build, index)"
                        >
                          {{build.name}}
                          <div class="alert-dot" v-if="build.allErrorDevices > 0"><span>{{build.allErrorDevices}}</span></div>
                          <span class="btn-focus" :class="{'pickThis': pickThisItem.Type === 'build' && pickThisItem.Index === index}" @click.stop="pickThis('build', index, build)">
                            <i class="fas fa-crosshairs"></i>
                          </span>
                        </div>
                        <div class="Collapse-Toolicon-right-button">
                          <vuestic-popover
                            ref="popover"
                            popover-class="vuestic-tooltip more-function-tooltip"
                            placement="right"
                            :disabled="false"
                            :auto-hide="true"
                            :open="false"
                            @hide="build.isEdit = false"
                            :delay="{show: 0, hide: 400}"
                          >
                            <div slot="trigger">
                              <div
                                class="btn-svg svg-smallMargin svg-noPadding cursor-pointer more-function"
                                :class="{'isSelected': build.isEdit}"
                                @click="build.isEdit = !build.isEdit"
                              >
                                <icon iconName="tool-more-function"/>
                              </div>
                            </div>
                            <div slot="body">
                              <div class="PopoverContent SettingContent">
                                <!-- 新增樓層 -->
                                <div @click="ShowAddEditMode('add', 'area', build)" v-close-popover>
                                  <span>{{ 'deviceon.dashboard.mapCoordinate.addADTitle' | translate }}</span>
                                  <icon iconName="main-add-normal"/>
                                </div>
                                <!-- 編輯建築 -->
                                <div @click="editMarker('location',build)" v-close-popover>
                                  <span>{{ 'deviceon.dashboard.mapCoordinate.editLocationsTitle' | translate }}</span>
                                  <icon iconName="main-edit-normal"/>
                                </div>
                                <!-- 刪除建築 -->
                                <div @click="showDeleteModel(build, index, 'location')" v-close-popover>
                                  <span>{{ 'deviceon.dashboard.mapCoordinate.deleteLocationTitle' | translate }}</span>
                                  <icon iconName="main-delet-normal"/>
                                </div>

                              </div>
                            </div>
                          </vuestic-popover>
                        </div>
                      </div>
                    </div>
                    <ul slot="body" data-body="1">
                      <!-- 區域平面圖 -->
                      <ul v-for="(plan, i) in build.plans" :key="i">
                        <vuestic-collapse :editIcon="true" :mapIcon="true" ref="plans" :id="plan.id" :closeToggle="true" @iconClick="showFloorPlan(plan)">
                          <div slot="header" class="Collapse-Toolicon-right" data-floor="2" >
                            <div class="Collapse-Toolicon-right-inner">
                              <div
                                class="text-over-w100px list-floorName"
                                v-tooltip.top-center="{ content: plan.name, trigger: 'hover', offset: 8}"
                                @click="showFloorPlan(plan)"
                              >
                                {{plan.name}}
                                <div class="alert-dot" v-if="plan.errorDevices > 0"><span>{{plan.errorDevices}}</span></div>
                              </div>
                              <div class="Collapse-Toolicon-right-button">
                                <vuestic-popover
                                  ref="popover"
                                  popover-class="vuestic-tooltip more-function-tooltip"
                                  placement="right"
                                  :disabled="false"
                                  :auto-hide="true"
                                  :open="false"
                                  @hide="plan.isEdit = false"
                                  :delay="{show: 0, hide: 400}"
                                >
                                  <div slot="trigger">
                                    <div
                                      class="btn-svg svg-smallMargin svg-noPadding cursor-pointer more-function"
                                      :class="{'isSelected': plan.isEdit}"
                                      @click="plan.isEdit = !plan.isEdit"
                                    >
                                      <icon iconName="tool-more-function"/>
                                    </div>
                                  </div>
                                  <div slot="body">
                                    <div class="PopoverContent SettingContent">
                                      <!-- 新增設備 -->
                                      <div @click="ShowAddEditMode('add', 'insideDevice', build, plan)" v-close-popover>
                                        <span>{{ 'deviceon.device.tabs.add' | translate }}</span>
                                        <icon iconName="main-add-normal"/>
                                      </div>
                                      <!-- 編輯樓層 -->
                                      <div @click="editMarker('area',build, plan)" v-close-popover>
                                        <span>{{ 'deviceon.dashboard.mapCoordinate.editPlanTitle' | translate }}</span>
                                        <icon iconName="main-edit-normal"/>
                                      </div>
                                      <!-- 刪除樓層 -->
                                      <div @click="showDeleteModel(plan, i, 'area')" v-close-popover>
                                        <span>{{ 'deviceon.dashboard.mapCoordinate.deletePlanTitle' | translate }}</span>
                                        <icon iconName="main-delet-normal"/>
                                      </div>
                                    </div>
                                  </div>
                                </vuestic-popover>
                              </div>
                            </div>
                          </div>
                          <ul slot="body" class="list-device-body" data-body="2">
                            <!-- 區域裡面的設備 -->
                            <li
                              v-for="(device, i) in plan.devices"
                              :key="i"
                              class="d-flex justify-content-between align-items-center"
                            >
                              <div class="list-deviceName" :class="{'isSelected': device.name === showDetail.name, 'isError': device.status === 'error'}" @click.stop="showDeviceDetail(device)">{{device.name}}</div>
                              <div>
                                <vuestic-popover
                                  ref="popover"
                                  popover-class="vuestic-tooltip more-function-tooltip"
                                  placement="right"
                                  :disabled="false"
                                  :auto-hide="true"
                                  :open="false"
                                  @hide="device.isEdit = false"
                                  :delay="{show: 0, hide: 400}"
                                >
                                  <div slot="trigger">
                                    <div
                                      class="btn-svg svg-smallMargin svg-noPadding cursor-pointer more-function"
                                      :class="{'isSelected': device.isEdit}"
                                      @click="device.isEdit = !device.isEdit"
                                    >
                                      <icon iconName="tool-more-function"/>
                                    </div>
                                  </div>
                                  <div slot="body">
                                    <div class="PopoverContent SettingContent">
                                      <!-- 編輯設備 -->
                                      <div @click="editMarker('insideDevice', build, plan, device)" v-close-popover>
                                        <span>{{ 'deviceon.device.tabs.edit' | translate }}</span>
                                        <icon iconName="main-edit-normal"/>
                                      </div>
                                      <!-- 刪除設備 -->
                                      <div @click="showDeleteModel(device, i, 'insideDevice')" v-close-popover>
                                        <span>{{ 'deviceon.device.tabs.delete' | translate }}</span>
                                        <icon iconName="main-delet-normal"/>
                                      </div>
                                    </div>
                                  </div>
                                </vuestic-popover>
                              </div>
                            </li>
                          </ul>
                        </vuestic-collapse>
                      </ul>
                    </ul>
                  </vuestic-collapse>
                </ul>
              </div>
              <!-- 設備列表 -->
              <div class="row">
                <ul v-for="(device, index) in deviceBuildingList" :key="index" class="allList">
                  <div :class="{selected: device.isActive, active: device.isHover}" @mouseover="hoverAction(device, 'over')" @mouseleave="hoverAction(device, 'leave')" @click="clickMarker(device)">
                    <div class="device-header">
                      <div
                        class="text-over-w100px position-relative item-name"
                        v-tooltip.top-center="{ content: device.name, trigger: 'hover', offset: 8}"
                      >
                        <span :class="{'isError': device.status === 'error'}">{{device.name}}</span>
                        <span class="btn-focus" :class="{'pickThis': pickThisItem.Type === 'device' && pickThisItem.Index === index }" @click="pickThis('device',index, device)">
                          <i class="fas fa-crosshairs"></i>
                        </span>
                      </div>
                      <div class="Collapse-Toolicon-right-button">
                        <vuestic-popover
                          ref="popover"
                          popover-class="vuestic-tooltip more-function-tooltip"
                          placement="right"
                          :disabled="false"
                          :auto-hide="true"
                          :open="false"
                          @hide="device.isEdit = false"
                          :delay="{show: 0, hide: 400}"
                        >
                          <div slot="trigger">
                            <div
                              class="btn-svg svg-smallMargin svg-noPadding cursor-pointer more-function"
                              :class="{'isSelected': device.isEdit}"
                              @click="device.isEdit = !device.isEdit"
                            >
                              <icon iconName="tool-more-function"/>
                            </div>
                          </div>
                          <div slot="body">
                            <div class="PopoverContent SettingContent">
                              <!-- 編輯設備 -->
                              <div @click="editMarker('device' ,device)" v-close-popover>
                                <span>{{ 'deviceon.dashboard.mapCoordinate.editDeviceTitle' | translate }}</span>
                                <icon iconName="main-edit-normal"/>
                              </div>
                              <!-- 刪除設備 -->
                              <div @click="showDeleteModel(device, index, 'device')" v-close-popover>
                                <span>{{ 'deviceon.dashboard.mapCoordinate.deleteDeviceTitle' | translate }}</span>
                                <icon iconName="main-delet-normal"/>
                              </div>
                            </div>
                          </div>
                        </vuestic-popover>
                      </div>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
            <!-- 無資料 -->
            <div class="show-unavailable" v-else>
              <div class="btn-svg svg-show-unavailable">
                <icon iconName="notice-nodata" class="w100px"/>
              </div>
              <div class="title-unavailable">{{'deviceon.device.message.NoData' | translate}}</div>
            </div>
          </vuestic-widget>
        </div>
        <!-- 詳細資料 -->
        <div class="row row-m-0 h-100 mapDetail list-detail" v-if="menuDetail">
          <vuestic-widget
            class="widget-customized__widget info-widget"
            :headerText="'deviceon.dashboard.mapCoordinate.detail' | translate"
          >
            <!-- 請先選擇地點或是設備 -->
            <div v-if="!isSelected" class="mapbox-right-noselect">
              <div>
                <div>
                  <icon iconName="mapunselect" width="70" height="70"/>
                </div>
                <div>{{'deviceon.device.message.firstSelected' | translate}}</div>
              </div>
            </div>
            <div v-if="isSelected" class="h-100">
              <div class="swiper-container" v-swiper:mySwiper="swiperOptions">
                <div class="swiper-wrapper">
                  <div class="swiper-slide" v-if="showDetail.areaName">
                    <!-- 名稱 -->
                    <div class="item-list">
                      <div class="item-title">{{'deviceon.dashboard.mapCoordinate.areaDevice' | translate}}</div>
                      <div class="item-text">{{showDetail.areaName}}</div>
                      <div class="item-text">{{showDetail.agentName}}</div>
                    </div>
                    <!-- 設備 -->
                    <div class="item-list">
                      <div
                        class="item-text error-text"
                        :class="{'haserror':showDetail.statusMsg, 'connect': showDetail.status === 'connect'}"
                        v-tooltip.top-center="{ content: showDetail.statusMsg, trigger: 'hover', offset: 8}"
                      >
                        {{showDetail.statusMsg}}
                      </div>
                    </div>
                  </div>
                  <div class="swiper-slide">
                    <!-- 名稱 -->
                    <div class="item-list">
                      <div class="item-title">{{'deviceon.dashboard.mapCoordinate.locationDevice' | translate}}</div>
                      <div class="item-text">
                        {{showDetail.name}}
                      </div>
                    </div>
                    <!-- 地點 -->
                    <div v-if="showDetail.type === 'location'" class="w-100">
                      <div class="item-list">
                        <div class="item-title">{{'deviceon.device.view.connectedDevice' | translate}}({{'deviceon.device.view.allDevices' | translate}})</div>
                        <div class="item-text">{{showDetail.connectDevices + ' (' + showDetail.allDevicesNum + ')'}}</div>
                      </div>
                      <div class="row">
                        <div class="col-sm-6 item-list">
                          <div class="item-title">{{'deviceon.dashboard.mapCoordinate.longitude' | translate}}</div>
                          <div class="item-text">{{showDetail.lat}}</div>
                        </div>
                        <div class="col-sm-6 item-list">
                          <div class="item-title">{{'deviceon.dashboard.mapCoordinate.latitude' | translate}}</div>
                          <div class="item-text">{{showDetail.lng}}</div>
                        </div>
                      </div>
                    </div>
                    <!-- 設備 -->
                    <div v-else>
                      <div class="item-list">
                        <div class="item-title">{{'deviceon.dashboard.mapCoordinate.deviceStatus' | translate}}</div>
                        <div class="item-text" style="color: #228f39" v-if="showDetail.status==='connect'">{{'deviceon.eventAlert.device-connected' | translate}}</div>
                        <div class="item-text" style="color: #999999" v-if="showDetail.status==='disconnect'">{{'deviceon.eventAlert.device-disconnect' | translate}}</div>
                        <div class="item-text" style="color: #f12742" v-if="showDetail.status==='error'">{{'deviceon.eventAlert.device-error' | translate}}</div>
                        <div
                          class="item-text error-text"
                          :class="{'haserror':showDetail.statusMsg}"
                          v-if="showDetail.status==='error'"
                          v-tooltip.top-center="{ content: showDetail.statusMsg, trigger: 'hover', offset: 8}"
                        >
                          {{showDetail.statusMsg}}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 資料2 -->
                  <div class="swiper-slide" v-if="showDetail.type !== 'location'">
                    <!-- 設備 -->
                    <div>
                      <div class="item-list">
                        <div class="item-title">{{'deviceon.dashboard.mapCoordinate.deviceId' | translate}}</div>
                        <div class="item-text">{{showDetail.deviceId}}</div>
                      </div>
                      <div class="item-list row" v-if="centerPanelType ===  'map'">
                        <div class="col-md-6">
                          <div class="item-title">{{'deviceon.dashboard.mapCoordinate.longitude' | translate}}</div>
                          <div class="item-text">{{showDetail.lat}}</div>
                        </div>
                        <div class="col-md-6 ">
                          <div class="item-title">{{'deviceon.dashboard.mapCoordinate.latitude' | translate}}</div>
                          <div class="item-text">{{showDetail.lng}}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 圖片 -->
                  <div class="swiper-slide">
                    <img :src="showDetail.image" class="detailImg" v-if="showDetail.image.indexOf('undefined') === -1"/>
                    <!-- 如果沒有圖 -->
                    <div class="detailImg no-detailImg" v-if="showDetail.image.indexOf('undefined') !== -1">
                      <div class="box-noimage">
                        <icon iconName="notice-noimage" class="noimage"/>
                        <div>{{'deviceon.message.warnings.noImage' | translate}}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- If we need navigation buttons -->
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
              </div>
              <div class="swiper-pagination"></div>
            </div>
          </vuestic-widget>
        </div>
      </div>

      <!-- 地圖 -->
      <div class="col-mapPanel" :class="{'col-mapPanel-full':!defaultView}">
        <div class="row row-m-0">
          <vuestic-widget
            class="widget-customized__widget info-widget"
            :headerText="'deviceon.dashboard.mapCoordinate.map' | translate"
            :otherIcon="true"
          >
            <!-- 自動指向Event設備功能 -->
            <div slot="otherIcon" class="pr-2" v-tooltip.top-center="{ content: $t('deviceon.dashboard.mapCoordinate.autoPlan'), trigger: 'hover', offset: 8}">
              <toggle-button
                v-model="panToEnable"
                :sync="true"
                :width="51"
                :height="31"
                :speed="480"
                :color="{checked: '#34c759', unchecked: '#c3c3c3'}"
              />
            </div>
            <!-- 放大縮小 -->
            <div slot="otherIcon" class="btn-svg pr-2 svg-colorful" @click="Zoom()" v-tooltip.top-center="{ content: $t('deviceon.dashboard.mapCoordinate.ZoomInMapTitle'), trigger: 'hover', offset: 8}">
              <!-- 放大 -->
              <icon iconName="tool-zoomin" v-if="ZoomIn"/>
              <!-- 縮小 -->
              <icon iconName="tool-zoomout" v-if="!ZoomIn" v-tooltip.top-center="{ content: $t('deviceon.dashboard.mapCoordinate.ZoomOutMapTitle'), trigger: 'hover', offset: 8}"/>
            </div>
            <!-- 鎖定滑動 -->
            <div slot="otherIcon" class="btn-svg svg-colorful pr-2" @click="LockMap()" v-tooltip.top-center="{ content: $t('deviceon.dashboard.lockMapOperation'), trigger: 'hover', offset: 8}">
              <!-- 鎖定 -->
              <icon iconName="tool-lock" v-if="MapLocked"/>
              <!-- 解鎖 -->
              <icon iconName="tool-unlock" v-else/>
            </div>
            <!-- 放寬或縮短 -->
            <div slot="otherIcon" class="btn-svg svg-colorful pr-2" @click="viewMode()">
              <!-- 放寬 -->
              <icon iconName="tool-theater" v-if="defaultView" v-tooltip.top-center="{ content: $t('deviceon.dashboard.theaterMode'), trigger: 'hover', offset: 8}"/>
              <!-- 縮短 -->
              <icon iconName="tool-defaultView" v-else v-tooltip.top-center="{ content: $t('deviceon.dashboard.defaultViewMode'), trigger: 'hover', offset: 8}"/>
            </div>

            <!-- 選擇地圖 -->
            <div class="d-flex justify-content-between align-items-center" :class="{'google': selectedMap.name === 'GoogleMap', 'offlineMap': selectedMap.name === 'LeafletMapOffline'}">
              <label class="labelTitle">{{'deviceon.overview.wizard.selectedMapType' | translate}}</label>
              <vuestic-simple-select
                class="small-height w-100 px-3"
                v-model="selectedMap"
                option-key="description"
                :options="mapType"
              />
              <i
                v-if="selectedMap.name === 'LeafletMapOffline'"
                class="fas fa-question-circle"
                v-tooltip.left="{ content: $t('deviceon.dashboard.mapCoordinate.popContent.title'), trigger: 'hover', offset: 12, classes: ['tooltip-map-offline']}"
                @click="$refs.OfflineModal.open()"
              ></i>
            </div>

            <!-- 顯示 -->
            <!-- 地圖 -->
            <div class="mapPanel" ref="mapPanel" v-if="centerPanelType === 'map'">
              <div class="MapLockedPanel" v-show="MapLocked" @click="LockMap"></div>
              <map-component
                :orign-markers="orignMarkers"
                :selected-map="selectedMap"
                :selected-marker="selectedMarker"
                :delete-marker="deleteMarkerId"
                :resize="defaultView"
                @deleteMarkerResponse = "getDeleteMarResponse"
                @clickMarker="clickMapMarker($event)"
                @addMarker="addNewMarkerShow($event)"
                @openModal="openModal($event)"
              />
            </div>

            <!-- 樓層 -->
            <div class="floorPanel" ref="floorPanel" v-if="centerPanelType === 'floor'">
              <img :src="floorImg" ref="floorImg" v-if="floorImg && floorImg.indexOf('undefined') === -1"/>
              <!-- 客戶新增的區域，沒有上傳圖 -->
              <div class="floor-image" v-if="!floorImg || floorImg.indexOf('undefined') !== -1">
                <div class="box-noimage">
                  <icon iconName="notice-noimage" class="noimage"/>
                  <div>{{'deviceon.message.warnings.noImage' | translate}}</div>
                </div>
              </div>
              <!-- 客戶新增的區域，有Device -->
              <ul v-if="floorImg && floorImg.indexOf('undefined') === -1">
                <li v-for="(e, i) in floorDevices" :key="i">
                  <!-- IDS -->
                  <div
                    :style="{left: e.px + left - e.popupContentOffset + 'px',top: e.py + top + e.popupContentTopOffset + 'px', zIndex: 9, visibility: e.isSelected ? 'visible': 'hidden'}"
                    style="position: absolute;"
                    class="floor-popup"
                    ref="popupContent"
                  >
                    <div class="popup-device-name">
                      {{e.name}}
                    </div>
                    <!-- PowerOn -->
                    <div class="map-popup-btn" @click="openModal(e, 'powerOn')" v-show="e.status === 'disconnect'">
                      {{'deviceon.power.actions.start' | translate}}
                    </div>
                    <!-- IDS -->
                    <!-- <div class="map-popup-btn" @click="openModal(e, 'OSD')" v-if="e.hasIDS && e.status !== 'disconnect'">
                      {{'deviceon.device.view.OSD' | translate}}
                    </div> -->
                    <!-- ARK -->
                    <!-- <div class="map-popup-btn" @click="openModal(e, 'monitoring')" v-if="enableARK && e.status !== 'disconnect'">
                      {{'deviceon.menu.device.devicemonitoring' | translate}}
                    </div>
                    <div class="map-popup-btn" @click="openModal(e, 'screenshot')" v-if="enableARK && e.status !== 'disconnect'">
                      {{'deviceon.overview.action.takeScreen' | translate}}
                    </div>
                    <div class="map-popup-btn" @click="openModal(e, 'remotedesktop')" v-if="enableARK && e.status !== 'disconnect'">
                      {{'deviceon.device.view.remoteDesktop' | translate}}
                    </div> -->
                    <!-- Event -->
                    <!-- <div class="map-popup-btn" @click="openModal(e, 'event')" v-if="e.status === 'error'">
                      {{'deviceon.menu.event' | translate}}
                    </div> -->
                  </div>
                  <span
                    :class="{
                      connected: e.status==='connect',
                      disconnected: e.status==='disconnect',
                      error: e.status==='error',
                      isSelected: e.isSelected
                    }"
                    :style="{left: e.px + left + 'px',top: e.py + top + 'px'}"
                    style="position: absolute;"
                    @mousedown="mouseDown(e,$event)"
                    draggable="drag"
                  >
                    <!-- connect normal-->
                    <!-- disconnect normal-->
                    <!--error normal-->
                    <!-- connect selected-->
                    <!-- disconnect selected-->
                    <!-- error selected-->
                  </span>
                </li>
              </ul>
            </div>
          </vuestic-widget>
        </div>
      </div>

    </div>

    <!--popUp ----------------------------------------------------------------------->
    <!-- Offline Modal-->
    <vuestic-modal
      ref="OfflineModal"
      :noButtons="true"
      class="app-popup"
    >
      <div slot="title">{{'deviceon.dashboard.mapCoordinate.popContent.title' | translate}}</div>
      <div class="modal-content-inner pt-3 pb-3">
        {{'deviceon.dashboard.mapCoordinate.popContent.tips' | translate}}<br>
        <hr>
        <ul class="ul-123">
          <li>
            {{'deviceon.dashboard.mapCoordinate.popContent.step1' | translate}}
            (<a href="http://download.geofabrik.de" target="_blank">http://download.geofabrik.de</a>)
          </li>
          <li>
            {{'deviceon.dashboard.mapCoordinate.popContent.step2' | translate}}
            (<a href="https://wiki.openstreetmap.org/wiki/Osmconvert" target="_blank">osmconvert64-0.8.8p.exe</a>)
            <ul class="ul-abc">
              <li>{{'deviceon.dashboard.mapCoordinate.popContent.step2a' | translate}}</li>
              <li>
                {{'deviceon.dashboard.mapCoordinate.popContent.step2b' | translate}}
                <ul class="ul-roman">
                  <li>{{'deviceon.dashboard.mapCoordinate.popContent.step2b1' | translate}}</li>
                  <li>{{'deviceon.dashboard.mapCoordinate.popContent.step2b2' | translate}}</li>
                  <li>{{'deviceon.dashboard.mapCoordinate.popContent.step2b3' | translate}}</li>
                  <li>{{'deviceon.dashboard.mapCoordinate.popContent.step2b4' | translate}}</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            {{'deviceon.dashboard.mapCoordinate.popContent.step3' | translate}}<a href="http://maperitive.net/" target="_blank">Maperitive</a><br>
            <ul class="ul-abc">
              <li>{{'deviceon.dashboard.mapCoordinate.popContent.step3a' | translate}}</li>
              <li>{{'deviceon.dashboard.mapCoordinate.popContent.step3b' | translate}}<br>{{'deviceon.dashboard.mapCoordinate.popContent.step3bex' | translate}}</li>
              <li>{{'deviceon.dashboard.mapCoordinate.popContent.step3c' | translate}}</li>
              <li>{{'deviceon.dashboard.mapCoordinate.popContent.step3d' | translate}}<br>-- {{'deviceon.dashboard.mapCoordinate.popContent.step3p' | translate}}</li>
            </ul>
          </li>
        </ul>
      </div>
    </vuestic-modal>

    <!--DeleteMarkerModal-->
    <vuestic-modal
      ref="DeleteMarkerModal"
      :noButtons="true"
    >
      <div slot="title">{{'deviceon.device.message.AlertTitle' | translate}}</div>
      <delete-modal @delete="deleteType(deleteMarkerInfo.type)" @cancel="$refs.DeleteMarkerModal.cancel()"></delete-modal>
    </vuestic-modal>

    <!--Add/EditMarkerModal-->
    <!-- 在列表最上面 --------------- 新增區域 -->
    <vuestic-modal
      ref="AddEditMarkerModal"
      :noButtons="true"
      :force="true"
      :shownote="addMarkerMode"
      @close="cancel"
    >
      <div slot="title" v-if="addMarkerMode">
        {{'deviceon.dashboard.mapCoordinate.addLDTitle' | translate}}
      </div>
      <div slot="title" v-if="!addMarkerMode">
        {{'deviceon.dashboard.mapCoordinate.editLDTitle' | translate}}
      </div>
      <!-- 提醒 -->
      <div slot="note-title" v-if="addMarkerMode">
        {{'deviceon.dashboard.mapCoordinate.selectType' | translate}}
      </div>
      <!-- content  -->
      <div class="modal-content-inner mb-3" :class="{'pt-3': !addMarkerMode}">
        <!-- 新增地點 -->
        <vuestic-collapse
          :editIcon="true"
          ref="addLocationCollapse"
          @toggle="changeType('location')" :disable="!addMarkerMode"
          class="collapse-header-noPadding collapse-body-transparent pb-1 overflow-inherit"
          v-show="isShowCollapseLocation"
          :class="{'mb-3': !isShowCollapseDevice}"
        >
          <div slot="header" class="Collapse-Toolicon-right collapse-head d-flex justify-content-between align-items-center">
            <span>{{'deviceon.dashboard.mapCoordinate.location' | translate}}</span>
          </div>
          <div slot="body" class="input-editmarker-box">
            <!-- 如果要修改的時候會出現 -->
            <div class="item-list">
              <div class="form-group with-icon-right" :class="{'has-error': errors.has('location.locationName')}">
                <div class="input-group">
                  <div class="item-title">{{'deviceon.dashboard.mapCoordinate.name' | translate}}</div>
                  <input
                    name="locationName"
                    v-model="input.name"
                    v-validate="'required'"
                    data-vv-scope="location"
                  />
                  <i class="fa fa-exclamation-triangle input-icon error-icon"></i>
                  <i class="bar"></i>
                  <small
                    v-show="errors.has('location.locationName')"
                    class="text-danger">
                    {{'deviceon.dashboard.mapCoordinate.locationNameMsg' | translate}}
                  </small>
                </div>
              </div>
            </div>
            <div class="item-list">
              <div
                class="form-group with-icon-right"
                :class="{'has-error': errors.has('location.successLongitude')}"
              >
                <div class="input-group">
                  <div class="item-title">{{'deviceon.dashboard.mapCoordinate.longitude' | translate}}</div>
                  <input
                    name="successLongitude"
                    v-model="input.longitude"
                    v-validate="'required|between: -180,180'"
                    data-vv-scope="location"

                  />
                  <i class="fa fa-exclamation-triangle input-icon error-icon"></i>
                  <i class="bar"></i>
                  <small
                    v-show="errors.has('location.successLongitude')"
                    class="text-danger"
                  >{{'deviceon.dashboard.mapCoordinate.longitudeMsg' | translate}}</small>
                </div>
              </div>
            </div>
            <div class="item-list">
              <div
                class="form-group with-icon-right"
                :class="{'has-error': errors.has('location.successLatitude')}"
              >
                <div class="input-group">
                  <div class="item-title">{{'deviceon.dashboard.mapCoordinate.latitude' | translate}}</div>
                  <input
                    ref="successLatitude"
                    name="successLatitude"
                    v-model="input.latitude"
                    v-validate="'required|between: -90,90'"
                    data-vv-scope="location"
                  />
                  <i class="fa fa-exclamation-triangle input-icon error-icon"></i>
                  <i class="bar"></i>
                  <small
                    v-show="errors.has('location.successLatitude')"
                    class="text-danger"
                  >{{'deviceon.dashboard.mapCoordinate.latitudeMsg' | translate}}</small>
                </div>
              </div>
            </div>
            <!-- 地址轉換經緯度 -->
            <div class="mb-3">
              <vuestic-collapse>
                <div slot="header">
                  <span class="item-title">{{'deviceon.dashboard.mapCoordinate.getLatLng' | translate}}</span>
                  <button
                    type="button"
                    class="btn btn-svg svg-noPadding"
                     @click="resetCollapse()"
                  >
                    <icon iconName="main-search-normal"/>
                  </button>
                </div>
                <div slot="body">
                  <div class="form-group" :class="{'has-error': errors.has('address')}">
                    <div class="input-group mb-3">
                      <el-autocomplete
                        v-model="input.address"
                        :fetch-suggestions="querySearch"
                        :placeholder="$t('deviceon.dashboard.mapCoordinate.addressMsg')"
                        :trigger-on-focus="true"
                        @select="handleSelect"
                        class="address-input"
                      />
                      <i class="bar"></i>
                    </div>
                  </div>
                </div>
              </vuestic-collapse>
            </div>
            <!-- 上傳圖片 -->
            <div>
              <!-- 按鈕 -->
              <div class="d-flex align-items-center mb-2 position-relative">
                <div class="item-title">{{'deviceon.dashboard.mapCoordinate.uploadImage' | translate}}</div>
                <div class="position-relative">
                  <input
                    type="file"
                    accept=".png, .jpeg, .gif, .jpg"
                    @change="ChangeImg($event, 'marker')"
                    class="img-input"
                    ref="fileupload"
                    v-if="fileClear"
                  />
                  <button type="button" class="btn btn-svg svg-noPadding">
                    <icon iconName="tool-upload"/>
                  </button>
                </div>
              </div>
              <!-- 顯示 -->
              <div class="mb-4">
                <img :src="input.image" class="img-add" v-if="input.image.indexOf('undefined') === -1"/>
                <div class="box-noimage" v-if="input.image.indexOf('undefined') !== -1">
                  <icon iconName="notice-noimage" class="noimage"/>
                  <div>{{'deviceon.message.warnings.noImageConent' | translate}}</div>
                </div>
              </div>
            </div>
          </div>
        </vuestic-collapse>

        <!-- 新增設備 -->
        <vuestic-collapse
          :editIcon="true"
          ref="addDeviceCollapse"
          @toggle="changeType('device')" :disable="!addMarkerMode"
          class="collapse-header-noPadding collapse-body-transparent overflow-inherit"
          v-show="isShowCollapseDevice"
        >
          <div slot="header" class="Collapse-Toolicon-right collapse-head">
            <span>{{'deviceon.dashboard.mapCoordinate.device' | translate}}</span>
          </div>
          <div slot="body" class="input-editmarker-box">
            <div v-if="addMarkerMode">
              <div class="item-list">
                <div class="item-title">{{'deviceon.account.title' | translate}}</div>
                <vuestic-simple-select
                  class="small-height"
                  v-model="selectedAccount"
                  option-key="mail"
                  :options="accountOptions"
                  :unselect-disabled="true"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                  v-tooltip.top-center="{ content: selectedAccount.mail, trigger: 'hover', offset: 8}"
                />
              </div>
              <div class="item-list">
                <div class="item-title">{{'deviceon.group.title' | translate}}</div>
                <vuestic-simple-select
                  class="small-height"
                  v-model="selectedGroup"
                  option-key="gid"
                  option-value="description"
                  :options="groupList"
                  :unselect-disabled="true"
                  @input="getDevices($event, true)"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                />
              </div>
              <div class="item-list">
                <div class="item-title">{{'deviceon.message.title.device' | translate}}</div>
                <vuestic-simple-select
                  class="small-height"
                  v-model="selectedDevice"
                  option-key="agentid"
                  option-value="name"
                  :options="groupDeviceList"
                  :unselect-disabled="true"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                  :showdropdownstatus="true"
                  :dropStatus='dropStatus'
                  :limitclass="'device-data-dropdown'"
                  :class="{'disable': selectedGroup.totalDevices === 0}"
                  @filterSelection="serchTxt"
                  @scroll-to-bottom="ScrollToBottom"
                />
              </div>
            </div>
            <div v-if="!addMarkerMode">
              <label>{{'deviceon.group.title' | translate}}</label>
            </div>
            <div v-if="!addMarkerMode">
              <label>{{selectedGroup.description}}</label>
            </div>
            <div v-if="!addMarkerMode">
              <label>{{'deviceon.message.title.device' | translate}}</label>
            </div>
            <div v-if="!addMarkerMode">
              <label>{{selectedDevice.name}}</label>
            </div>
            <div class="row">
              <div class="col-sm-6">
                <div class="item-list">
                  <div
                    class="form-group with-icon-right"
                    :class="{'has-error': errors.has('device.successLongitude')}"
                  >
                    <div class="input-group">
                      <div class="item-title">{{'deviceon.dashboard.mapCoordinate.longitude' | translate}}</div>
                      <input
                        name="successLongitude"
                        v-model="input.longitude"
                        v-validate="'required|between: -180,180'"
                        data-vv-scope="device"
                      />
                      <i class="fa fa-exclamation-triangle input-icon error-icon"></i>
                      <i class="bar"></i>
                      <small
                        v-show="errors.has('device.successLongitude')"
                        class="text-danger"
                      >{{'deviceon.dashboard.mapCoordinate.longitudeMsg' | translate}}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="item-list">
                  <div
                    class="form-group with-icon-right"
                    :class="{'has-error': errors.has('device.successLatitude')}"
                  >
                    <div class="input-group">
                      <div class="item-title">{{'deviceon.dashboard.mapCoordinate.latitude' | translate}}</div>
                      <input
                        ref="successLatitude"
                        name="successLatitude"
                        v-model="input.latitude"
                        v-validate="'required|between: -90,90'"
                        data-vv-scope="device"
                      />
                      <i class="fa fa-exclamation-triangle input-icon error-icon"></i>
                      <i class="bar"></i>
                      <small
                        v-show="errors.has('device.successLatitude')"
                        class="text-danger"
                      >{{'deviceon.dashboard.mapCoordinate.latitudeMsg' | translate}}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 地址轉換經緯度 -->
            <div class="mb-3">
              <vuestic-collapse>
                <div slot="header">
                  <span class="item-title">{{'deviceon.dashboard.mapCoordinate.getLatLng' | translate}}</span>
                  <button
                    type="button"
                    class="btn btn-svg svg-noPadding"
                  >
                    <icon iconName="main-search-normal"/>
                  </button>
                </div>
                <div slot="body">
                  <div class="form-group" style="margin-bottom: 0.5rem;" :class="{'has-error': errors.has('address')}">
                    <div class="input-group">
                      <el-autocomplete
                        v-model="input.address"
                        :fetch-suggestions="querySearch"
                        :placeholder="$t('deviceon.dashboard.mapCoordinate.addressMsg')"
                        :trigger-on-focus="true"
                        @select="handleSelect"
                        class="address-input"
                      />
                      <i class="bar"></i>
                    </div>
                  </div>
                </div>
              </vuestic-collapse>
            </div>
            <!-- 上傳圖片 -->
            <div class="mb-4">
              <div class="d-flex align-items-center position-relative">
                <div class="item-title">{{'deviceon.dashboard.mapCoordinate.uploadImage' | translate}}</div>
                <div class="mapBtn">
                  <input
                    type="file"
                    accept=".png, .jpeg, .gif, .jpg"
                    @change="ChangeImg($event, 'marker')"
                    class="img-input"
                    ref="fileupload"
                    v-if="fileClear"
                  />
                  <button type="button" class="btn btn-svg svg-noPadding">
                    <icon iconName="tool-upload"/>
                  </button>
                </div>
              </div>
              <!-- 顯示 -->
              <div>
                <img :src="input.image" class="img-add" v-if="input.image.indexOf('undefined') === -1"/>
                <div class="box-noimage" v-if="input.image.indexOf('undefined') !== -1">
                  <icon iconName="notice-noimage" class="noimage"/>
                  <div>{{'deviceon.message.warnings.noImageConent' | translate}}</div>
                </div>
              </div>
            </div>
          </div>
        </vuestic-collapse>

        <!-- 按鈕 -->
        <div class="text-center">
          <button
            type="button"
            v-if="!noSaveButton"
            class="btn btn-primary btn-middle mt-3"
            @click="addSave('marker')"
          >{{ 'modal.save' | translate}}</button>
        </div>
      </div>

    </vuestic-modal>

    <!-- Add/EditAreaDeviceModal -->
    <!-- 在列表之中 --------------- 新增區域/設備 或是編輯 -->

    <vuestic-modal
      ref="AddEditAreaDeviceModal"
      :noButtons="true"
      :force="true"
      :shownote="true"
      @close="cancel"
    >
      <div slot="title" v-if="addMarkerMode">
        {{'deviceon.dashboard.mapCoordinate.addADTitle' | translate}}
      </div>
      <div slot="title" v-if="!addMarkerMode">
        {{'deviceon.dashboard.mapCoordinate.editADTitle' | translate}}
      </div>

      <!-- 提醒 -->
      <div slot="note-title">
        <!-- 在 "地點" 按新增按鈕 -->
        <span v-if="isShowCollapseLocation && isShowCollapseDevice">
          {{'deviceon.device.message.underLocationTitle' | translate}}
        </span>
        <span v-else>
          <!-- 在區域 按新增按鈕 -->
          <div v-show="isShowDeviceAddTitle && isShowCollapseDevice">
            {{'deviceon.device.message.addDeviceTitle' | translate}}
          </div>
          <!-- 在區域 按編輯按鈕 -->
          <div v-show="isShowCollapseLocation">
            {{'deviceon.device.message.editAreaTitle' | translate}}
          </div>
          <!-- 在設備 按編輯按鈕 -->
          <div v-show="!isShowDeviceAddTitle && !isShowCollapseLocation">
            {{'deviceon.device.message.editDeviceTitle' | translate}}
          </div>
        </span>
      </div>
      <div slot="note-text">
        <!-- 在最上面做按新增按鈕 -->
        <span v-if="isShowCollapseLocation && isShowCollapseDevice">
          {{'deviceon.device.message.underLocationAddInfomation' | translate}}
        </span>
        <span v-else>
          <!-- 在區域 按新增按鈕 -->
          <div v-show="isShowDeviceAddTitle && isShowCollapseDevice">
            {{'deviceon.device.message.addDeviceNote' | translate}}
          </div>
          <!-- 在區域 按編輯按鈕 -->
          <div v-show="isShowCollapseLocation">
            {{'deviceon.device.message.editAreaNote' | translate}}
          </div>
          <!-- 在設備 按編輯按鈕 -->
          <div v-show="!isShowDeviceAddTitle && !isShowCollapseLocation">
            {{'deviceon.device.message.editDeviceNote' | translate}}
          </div>
        </span>
      </div>

      <!-- content  -->
      <div class="modal-content-inner mb-3">
        <div class="item-list">
          <div class="item-title">{{'deviceon.dashboard.mapCoordinate.location' | translate}}</div>
          <div class="item-text">{{locationName}}</div>
        </div>
        <!-- 選擇新增的類型文字 -->
        <div v-if="isShowCollapseLocation && isShowCollapseDevice" class="item-title">
          {{'deviceon.dashboard.mapCoordinate.selectType' | translate}}
        </div>
        <div v-else class="item-title">
          <div v-show="isShowCollapseLocation">{{'deviceon.dashboard.mapCoordinate.editPlanTitle' | translate}}</div>
          <div v-show="isShowDeviceAddTitle && isShowCollapseDevice">{{'deviceon.device.tabs.add' | translate}}</div>
          <div v-show="!isShowDeviceAddTitle && !isShowCollapseLocation">{{'deviceon.device.tabs.edit' | translate}}</div>
        </div>

        <!-- 區域樓層手風琴 -->
        <vuestic-collapse
          :editIcon="true"
          ref="addAreaCollapse"
          @toggle="changeType('area')"
          class="collapse-header-noPadding collapse-body-transparent pb-1 overflow-inherit"
          :disable="!addMarkerMode || (inputType==='insideDevice'&& areaAddDeviceBtn)"
          v-show="isShowCollapseLocation"
        >
          <div slot="header" class="Collapse-Toolicon-right collapse-head d-flex justify-content-between align-items-center">
            <span>{{'deviceon.dashboard.mapCoordinate.area' | translate}}</span>
          </div>
          <div slot="body" class="input-editmarker-box">
            <!-- 輸入區域名稱 -->
            <div class="item-list">
              <div class="form-group with-icon-right" :class="{'has-error': errors.has('area.areaName')}">
                <div class="input-group">
                  <div class="item-title">{{'deviceon.dashboard.mapCoordinate.areaName' | translate}}</div>
                  <input
                    name="areaName"
                    v-model="inputArea.name"
                    v-validate="'required'"
                    data-vv-scope="area"
                  />
                  <i class="fa fa-exclamation-triangle input-icon error-icon"></i>
                  <i class="bar"></i>
                  <small
                    v-show="errors.has('area.areaName')"
                    class="text-danger">
                    {{'deviceon.dashboard.mapCoordinate.areaNameMsg' | translate}}
                  </small>
                </div>
              </div>
            </div>
            <!-- 上傳圖片 -->
            <div>
              <!-- 按鈕 -->
              <div class="d-flex align-items-center position-relative">
                <div class="item-title">{{'deviceon.dashboard.mapCoordinate.uploadImage' | translate}}</div>
                <div class="position-relative">
                  <input
                    type="file"
                    accept=".png, .jpeg, .gif, .jpg"
                    @change="ChangeImg($event, 'area')"
                    class="img-input"
                    ref="fileupload"
                    v-if="fileClear"
                  />
                  <button type="button" class="btn btn-svg svg-noPadding">
                    <icon iconName="tool-upload"/>
                  </button>
                </div>
              </div>
              <!-- 顯示 -->
              <div class="mb-4">
                <img :src="inputArea.image" class="img-add" v-if="inputArea.image.indexOf('undefined') === -1"/>
                <div class="box-noimage" v-if="inputArea.image.indexOf('undefined') !== -1">
                  <icon iconName="notice-noimage" class="noimage"/>
                  <div>{{'deviceon.message.warnings.noImageConent' | translate}}</div>
                </div>
              </div>
            </div>
          </div>
        </vuestic-collapse>

        <!-- 設備手風琴 -->
        <vuestic-collapse
          :editIcon="true"
          ref="addInnerDeviceCollapse"
          class="collapse-header-noPadding collapse-body-transparent overflow-inherit"
          @toggle="changeType('insideDevice')"
          :disable="!addMarkerMode || areaList.length === 0"
          v-show="isShowCollapseDevice"
        >
          <div slot="header" class="Collapse-Toolicon-right collapse-head d-flex align-items-center">
            <span>{{'deviceon.dashboard.mapCoordinate.device' | translate}}</span>
            <span v-show="areaList.length === 0" style="margin-left: 2rem;">( {{'deviceon.dashboard.mapCoordinate.addPlanFirst' | translate}} )</span>
          </div>
          <div slot="body" class="input-editmarker-box">
            <!-- 設備 按儲存後出現，或是已經在某樓層底下時 -->
            <div class="item-list" v-if="areaAddDeviceBtn">
              <div class="form-group">
                <div class="input-group">
                  <div class="item-title">{{'deviceon.dashboard.mapCoordinate.areaName' | translate}}</div>
                  <input
                    v-model="selectedArea.name"
                    :disabled="areaAddDeviceBtn"
                  />
                </div>
              </div>
            </div>
            <!-- 設備 按儲存 -->
            <div class="item-list" v-if="!addMarkerMode">
              <div class="form-group">
                <div class="input-group">
                  <div class="item-title">{{'deviceon.group.title' | translate}}</div>
                  <input
                    v-model="selectedGroup.description"
                    :disabled="!addMarkerMode"
                  />
                </div>
              </div>
            </div>
            <!-- 設備 按儲存 -->
            <div class="item-list" v-if="!addMarkerMode">
              <div class="form-group">
                <div class="input-group">
                  <div class="item-title">{{'deviceon.message.title.device' | translate}}</div>
                  <input
                    v-model="selectedDevice.name"
                    :disabled="!addMarkerMode"
                  />
                </div>
              </div>
            </div>

            <!-- 設備 還未按儲存，未被分配在某樓層-->
            <div v-if="!areaAddDeviceBtn" class="item-list">
              <div class="item-title">{{'deviceon.dashboard.mapCoordinate.areaName' | translate}}</div>
              <vuestic-simple-select
                class="small-height"
                v-model="selectedArea"
                option-key="name"
                :options="areaList"
                :unselect-disabled="true"
                :notCollapse="true"
                :showSearchBox="true"
                :searchText="$t('deviceon.wizard.keywordSearch')"
              />
            </div>
            <!-- 設備 還未按儲存，群組和設備-->
            <div v-if="addMarkerMode">
              <div class="item-list">
                <div class="item-title">{{'deviceon.account.title' | translate}}</div>
                <vuestic-simple-select
                  class="small-height"
                  v-model="selectedAccount"
                  option-key="mail"
                  v-bind:options="accountOptions"
                  :unselect-disabled="true"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                  v-tooltip.top-center="{ content: selectedAccount.mail, trigger: 'hover', offset: 8}"
                />
              </div>
              <div class="item-list">
                <div class="item-title">{{'deviceon.group.title' | translate}}</div>
                <vuestic-simple-select
                  class="small-height"
                  v-model="selectedGroup"
                  option-key="gid"
                  option-value="description"
                  :options="groupList"
                  :unselect-disabled="true"
                  @input="getDevices($event, true)"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                />
              </div>
              <div class="item-list">
                <div class="item-title">{{'deviceon.message.title.device' | translate}}</div>
                <vuestic-simple-select
                  class="small-height"
                  v-model="selectedDevice"
                  option-key="agentid"
                  option-value="name"
                  :options="groupDeviceList"
                  :unselect-disabled="true"
                  :notCollapse="true"
                  :showSearchBox="true"
                  :searchText="$t('deviceon.wizard.keywordSearch')"
                  :showdropdownstatus="true"
                  :dropStatus='dropStatus'
                  :limitclass="'device-data-dropdown'"
                  :class="{'disable': selectedGroup.totalDevices === 0}"
                  @filterSelection="serchTxt"
                  @scroll-to-bottom="ScrollToBottom"
                />
              </div>
            </div>

            <!-- 上傳圖片 -->
            <div class="d-flex collapse-head position-relative">
              <div class="item-title">{{'deviceon.dashboard.mapCoordinate.uploadImage' | translate}}</div>
              <div class="mapBtn">
                <input
                  type="file"
                  accept=".png, .jpeg, .gif, .jpg"
                  @change="ChangeImg($event, 'device')"
                  class="img-input"
                  ref="fileupload"
                  v-if="fileClear"
                />
                <button type="button" class="btn btn-svg svg-noPadding">
                  <icon iconName="tool-upload"/>
                </button>
              </div>
            </div>
            <!-- 顯示圖片 -->
            <div>
              <img :src="inputArea.image" class="img-add" v-if="inputArea.image.indexOf('undefined') === -1"/>
              <div class="box-noimage" v-if="inputArea.image.indexOf('undefined') !== -1">
                <icon iconName="notice-noimage" class="noimage"/>
                <div>{{'deviceon.message.warnings.noImageConent' | translate}}</div>
              </div>
            </div>
          </div>
        </vuestic-collapse>
        <div class="text-center">
          <button
            type="button"
            v-if="!noSaveButton"
            class="btn btn-primary btn-middle mt-3"
            @click="addSave('area')"
          >{{ 'modal.save' | translate}}
          </button>
        </div>
      </div>
    </vuestic-modal>

    <!-- On Screen Display -->
    <!--Monitor Control-->
    <vuestic-modal
      ref="MonitorModal"
      show.sync="true"
      :largeXL="true"
      :noButtons="true"
    >
      <div slot="title" ref="largeModalTitle" class="modelTitle">
        {{'deviceon.device.view.OSD' | translate}}
      </div>
      <monitor :did="monitorControl.did" :agent-id="monitorControl.agentId"></monitor>
    </vuestic-modal>

    <!-- ARK (監控 截圖 遠端桌面) -->
    <vuestic-modal
      ref="ARKModal"
      show.sync="true"
      :largeXL="true"
      :noButtons="true"
      @close="closeARKModal"
      class="arkModal"
    >
      <div slot="title" ref="largeModalTitle" class="modelTitle">
        {{ARKModalTitle}}
      </div>
      <devicemonitoring
        :aid="propsAid"
        :gid="propsGid"
        :odid="propsDid"
        :hidden="propsHidden"
        v-if="arkDeviceMonitoring"
      />
      <screenshot
        :aid="propsAid"
        :gid="propsGid"
        :did="propsDid"
        :agentid="propsAgentid"
        :hidden="propsHidden"
        v-if="arkScreenshot"
      />
      <kvm
        :aid="propsAid"
        :gid="propsGid"
        :did="propsDid"
        :os="propsOs"
        :amtsupport="propsAmtsupport"
        :agentid="propsAgentid"
        :vncMode="propsStrVncMode"
        :hidden="propsHidden"
        v-if="arkRemotedesktop"
      />
      <eventList
        v-if="eventPopup"
        :getaid="propsAid"
        :getgid="propsGid"
        :getserchkey="propsName"
        :getSeverity="2"
      />
    </vuestic-modal>
  </div>
</template>

<script>
import DeviceOnApis from '@/util/DeviceOnApis'
import RMMGlobal from '@/util/RMMGlobal'
import { tify } from 'chinese-conv'
import deleteModal from '@/components/component/deleteModal'

import mapComponent from './map/mapComponent'
import moment from 'moment'

// ARK
// import devicemonitoring from '@/components/deviceon/device/monitoring/DeviceMonitoring'
// import screenshot from '@/components/deviceon/device/control/Screenshot'
// import kvm from '@/components/deviceon/device/control/KVM'
// Monitor
// import monitor from '../device/control/Monitor'
// Event
// import eventList from '../event/EventAlert'

// import Swiper styles
import 'swiper/swiper-bundle.css'
import { Swiper as SwiperClass, Pagination, Navigation } from 'swiper/swiper.esm.js'
import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter'

// Swiper modules
SwiperClass.use([Pagination, Navigation])
// local component
const { directive } = getAwesomeSwiper(SwiperClass)

let self = {}

const getPlanDevices = async (value) => {
  let ds = []
  for (let item of value) {
    let result = await DeviceOnApis.devicemap.get.map(item.id)
    ds.push(result.data)
  }
  return ds
}

// 監聽套件
const erd = require('element-resize-detector')()

export default {
  name: 'OverviewDeviceMap',
  directives: {
    swiper: directive
  },
  data () {
    return {
      isLoading: false,
      MapLocked: true,
      defaultView: false,
      menuDetail: true,
      saveMarkerBtn: false,
      addMarkerMode: true,
      isSelected: false,
      saveDisable: true,
      fileClear: true,
      areaAddDeviceBtn: true,
      ZoomIn: true,
      buildingList: [],
      buildings: [],
      deviceBuildingList: [],
      floorDevices: [],
      accountOptions: [],
      selectedAccount: '',
      deviceList: [],
      groupList: [],
      groupDeviceList: [],
      areaList: [],
      selectedGroup: {},
      selectedDevice: {},
      selectedArea: {},
      selectedMap: {},
      deleteMarkerInfo: {},
      areaDeviceInfo: {},
      editInfo: {},
      config: {},
      oRMM: RMMGlobal.get(),
      selectedMarker: '',
      deleteMarkerId: '',
      markerIndex: '',
      changePlan: '',
      floorImg: '',
      locationName: '',
      map: '',
      centerPanelType: '',
      inputType: '',
      editid: '',
      top: 0,
      left: 0,
      input: {
        name: '',
        latitude: '',
        longitude: '',
        image: 'undefined',
        imgFile: '',
        address: ''
      },
      inputArea: {
        name: '',
        image: 'undefined',
        imgFile: ''
      },
      showDetail: {
        name: '',
        status: '',
        connectDevices: 0,
        allDevicesNum: 0,
        lat: '',
        lng: '',
        image: '',
        statusMsg: ''
      },
      mapSize: {
        width: '',
        height: ''
      },
      mapType: [
        {
          name: 'BaiduMap',
          description: this.$t('deviceon.dashboard.BaiduMap')
        },
        {
          name: 'LeafletMap',
          description: this.$t('deviceon.dashboard.OpenStreetMap')
        },
        {
          name: 'LeafletMapOffline',
          description: this.$t('deviceon.dashboard.OpenStreetOfflineMap')
        },
        {
          name: 'GoogleMap',
          description: this.$t('deviceon.dashboard.GoogleMap')
        }
      ],
      myConfig: {},
      panToEnable: true,

      // 手風琴
      isShowCollapseLocation: true,
      isShowCollapseDevice: true,
      isShowDeviceAddTitle: false,

      noSaveButton: true,

      // 撈下拉選單資料
      dropNo: 1,
      totalDevices: 0,
      // onloading   finish  nodata
      dropStatus: '',
      keyword: '', // string
      keywordTimer: 0,
      isopendropdown: 'close',

      pickThisItem: {
        Type: '',
        Index: -1,
      },
      planLock: false,
      hoverTimer: 0,
      refreshBuilding: [],

      // OSD
      monitorControl: {
        did: 0,
        agentId: ''
      },
      enableIDS: false,

      // swiper // 詳細資料翻動設定
      swiperOptions: {
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction',
        },
        // Navigation arrows
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }
      },

      // ARK
      ARKModalTitle: '',
      arkDeviceMonitoring: false,
      arkScreenshot: false,
      arkRemotedesktop: false,
      eventPopup: false,

      // props
      propsAid: 0,
      propsGid: 0,
      propsDid: 0,
      propsAgentid: '',
      propsName: '',
      propsHidden: true,
      propsOs: '',
      propsAmtsupport: false,
      propsStrVncMode: '',

      enableARK: false,
      buildingTimeout: 0
    }
  },
  components: {
    deleteModal,
    mapComponent,
    // monitor,
    // devicemonitoring,
    // screenshot,
    // kvm,
    // eventList
  },
  mounted () {
    self = this
    this.getMapBuildings()
    this.selectedMap = self.mapType[0]
    this.centerPanelType = 'map'
    setTimeout(function () {
      switch (navigator.language) {
        case 'zh-CN':
          self.mapType = self.mapType.filter((map) => {
            return map.name !== 'GoogleMap'
          })
          self.selectedMap = self.mapType[0]
          break
        default:
          self.selectedMap = self.mapType[1]
          break
      }
    }, 10)

    DeviceOnApis.ui.get
      .my()
      .then(function (xhr) {
        if (xhr && xhr.data && xhr.data.params) {
          self.myConfig = xhr.data.params
          self.panToEnable = typeof self.myConfig.mapAutoPan !== 'undefined' ? self.myConfig.mapAutoPan : true
        }
      })
      .catch(function (error) {
        console.log(error)
      })

    // 檢查是否有開啟IDS or ARK 的功能
    DeviceOnApis.file.get
      .localFile('/static/defaultConfigNew.json')
      .then(function (xhr) {
        if (xhr.data && xhr.data.IDS) {
          self.enableIDS = xhr.data.IDS
        }
        if (xhr.data && xhr.data.ARK) {
          self.enableARK = xhr.data.ARK
        }
      })
      .catch(function (error) {
        self.isLoading = false
        DeviceOnApis.MessageBox.Error(self, error)
      })
    // Events
    window.addEventListener('message', this.eventHandler)

    this.$bus.$on('bmap', this.getBmap)
  },
  methods: {
    Zoom () {
      this.ZoomIn = !this.ZoomIn
      if (!self.ZoomIn) {
        document.getElementById('DeviceMap').classList.add('changeBigMap')
        document.body.classList.add('modal-open')
      } else {
        document.getElementById('DeviceMap').classList.remove('changeBigMap')
        document.body.classList.remove('modal-open')
        let top = document.getElementById('DeviceMap').offsetTop - document.getElementById('Action').clientHeight - document.getElementById('Navsub').clientHeight
        window.scrollTo({
          top: top,
          behavior: 'smooth'
        })
      }
    },
    LockMap () {
      this.MapLocked = !this.MapLocked
    },
    viewMode () {
      this.defaultView = !this.defaultView
    },
    listMode () {
      this.menuDetail = !this.menuDetail
    },
    querySearch (queryString, cb) {
      var options = {
        onSearchComplete: function (results) {
          if (local.getStatus() === 0) {
            var s = []
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              var x = results.getPoi(i)
              var item = { value: x.title, point: x.point }
              switch (navigator.language) {
                case 'zh-TW':
                  item.value = tify(item.value)
                  break
              }
              s.push(item)
              cb(s)
            }
          } else {
            cb()
          }
        }
      }
      var local = new window.BMap.LocalSearch(this.map, options)
      local.search(queryString)
    },
    handleSelect (item) {
      var { point } = item
      if (point) {
        self.input.latitude = point.lat
        self.input.longitude = point.lng
      }
    },
    resetCollapse () {
      setTimeout(function () {
        self.resetCollapseHeight(self.$refs.addLocationCollapse)
      }, 500)
    },
    ChangeImg (event, type) {
      if (event.target.files.length === 0) return
      if (type === 'marker') {
        self.input.imgFile = event.target.files[0]
        let reader = new FileReader()
        if (self.input.imgFile) {
          reader.readAsDataURL(self.input.imgFile)
          reader.onload = function (e) {
            self.input.image = e.target.result
          }
        } else {
          self.input.image = ''
        }
      } else {
        self.inputArea.imgFile = event.target.files[0]
        let reader = new FileReader()
        if (self.inputArea.imgFile) {
          reader.readAsDataURL(self.inputArea.imgFile)
          reader.onload = function (e) {
            self.inputArea.image = e.target.result
          }
          if (type === 'area') {
            setTimeout(function () {
              self.resetCollapseHeight(self.$refs.addAreaCollapse)
            }, 300)
          } else {
            setTimeout(function () {
              self.resetCollapseHeight(self.$refs.addInnerDeviceCollapse)
            }, 300)
          }
        } else {
          self.inputArea.image = ''
        }
      }
    },
    changeType (type) {
      self.inputType = type
      switch (type) {
        case 'device':
          self.$refs.addLocationCollapse.show = false
          break
        case 'location':
          self.$refs.addDeviceCollapse.show = false
          break
        case 'area':
          self.$refs.addInnerDeviceCollapse.show = false
          break
        case 'insideDevice':
          self.$refs.addAreaCollapse.show = false
          break
      }
      if (type === 'device' || type === 'location') {
        if (!self.$refs.addLocationCollapse.show && !self.$refs.addDeviceCollapse.show) {
          this.noSaveButton = true
        } else {
          this.noSaveButton = false
        }
      } else {
        if (!self.$refs.addInnerDeviceCollapse.show && !self.$refs.addAreaCollapse.show) {
          this.noSaveButton = true
        } else {
          this.noSaveButton = false
        }
      }
      // self.clearInput()
    },
    getMapBuildings () {
      self.buildingList = []
      self.deviceBuildingList = []
      self.buildings = []
      DeviceOnApis.devicemap.get
        .allBuildings()
        .then(function (xhr) {
          if (xhr && xhr.data && xhr.data.buildings) {
            self.getDeviceList()
            self.buildings = JSON.parse(JSON.stringify(xhr.data.buildings))
            for (let i = 0; i < self.buildings.length; i++) {
              self.$set(self.buildings[i], 'isActive', false)
              self.$set(self.buildings[i], 'isHover', false)
              self.$set(self.buildings[i], 'isEdit', false)
              self.$set(self.buildings[i], 'image', 'data:image/jpeg;base64,' + self.buildings[i].image)
              if (self.buildings[i].devices.length !== 0 && self.buildings[i].devices[0].name === self.buildings[i].name.replace('!@#', '')) {
                // 設備
                self.buildings[i].name = self.buildings[i].name.replace('!@#', '')
                self.$set(self.buildings[i], 'type', 'device')
              } else {
                if (self.buildings[i].name.indexOf('!@#') === -1) {
                  // 地點
                  self.$set(self.buildings[i], 'type', 'location')
                }
              }
            }
          }
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    setMapDeviceInfo () {
      for (let i = 0; i < self.buildings.length; i++) {
        if (self.buildings[i].type === 'device') {
          // Device Building
          if (self.buildings[i].devices[0]) {
            self.deviceList.forEach((dev) => {
              if (dev.agentid === self.buildings[i].devices[0].agentId) {
                let status = self.getDeviceStatus(dev)
                self.$set(self.buildings[i], 'status', status)
                self.$set(self.buildings[i], 'hasARK', self.enableARK)
                self.$set(self.buildings[i].devices[0], 'did', dev.did)
                self.$set(self.buildings[i].devices[0], 'amtsupport', dev.amtsupport)
                self.$set(self.buildings[i].devices[0], 'os', dev.ostype)
                self.checkHasIDS('init', self.buildings[i].devices[0].agentId, self.buildings[i])
              }
            })
          }
        } else {
          // Location
          let info = {
            connectNum: 0,
            allDevicesNum: 0,
            allErrorDevices: 0,
            allDevices: []
          }
          if (self.buildings[i].plans.length !== 0) {
            for (let j = 0; j < self.buildings[i].plans.length; j++) {
              self.$set(self.buildings[i].plans[j], 'isHover', false)
              self.$set(self.buildings[i].plans[j], 'isEdit', false)
              self.getMap(i, j, self.buildings[i].plans[j].id, self.buildings[i].plans[j], info)
            }
          } else {
            self.$set(self.buildings[i], 'connectDevices', 0)
            self.$set(self.buildings[i], 'allDevicesNum', 0)
            self.$set(self.buildings[i], 'allErrorDevices', 0)
          }
        }
      }
    },
    getMap (i, j, id, plan, info) {
      DeviceOnApis.devicemap.get
        .map(id)
        .then(function (x) {
          let mapData = x.data
          let errorDevices = 0
          self.$set(plan, 'image', mapData.image ? 'data:image/jpeg;base64,' + mapData.image : '')
          getPlanDevices(mapData.devices).then((result) => {
            let devices = mapData.devices
            if (self.deviceList && result) {
              for (let device of devices) {
                device.check = false
                for (let dev of self.deviceList) {
                  if (device.agentId === dev.agentid) {
                    device.check = true
                    let status = self.getDeviceStatus(dev)
                    self.checkHasIDS('init', device.agentId, device)
                    if (dev.connected) {
                      info.connectNum++
                    }
                    if (status === 'error') {
                      errorDevices++
                    }
                    self.$set(device, 'status', status)
                    self.$set(device, 'areaName', plan.name)
                    self.$set(device, 'agentId', dev.agentid)
                    self.$set(device, 'x', device.x)
                    self.$set(device, 'y', device.y)
                    self.$set(device, 'isSelected', false)
                    self.$set(device, 'isEdit', false)
                    self.$set(device, 'did', dev.did)
                    self.$set(device, 'os', dev.ostype)
                    self.$set(device, 'amtsupport', dev.amtsupport)
                    info.allDevices.push(device)
                  }
                }
                for (let d of result) {
                  if (device.agentid === d.agentid) {
                    self.$set(device, 'image', d.image ? 'data:image/jpeg;base64,' + d.image : '')
                  }
                }
              }
            }

            let hasDevices = devices.filter(d => {
              return d.check
            })
            info.allDevicesNum += hasDevices.length
            self.$set(plan, 'devices', hasDevices)
            self.$set(plan, 'errorDevices', errorDevices)
            info.allErrorDevices += errorDevices
            if (j === self.buildings[i].plans.length - 1) {
              self.$set(self.buildings[i], 'connectDevices', info.connectNum)
              self.$set(self.buildings[i], 'allDevicesNum', info.allDevicesNum)
              self.$set(self.buildings[i], 'allErrorDevices', info.allErrorDevices)
              self.$set(self.buildings[i], 'devices', info.allDevices)
            }
          })
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    getDeviceList () {
      self.deviceList = []
      let other = {
        pageSize: 1000,
        no: 1,
        onlyMine: false
      }
      this.isLoading = true
      DeviceOnApis.devicegroups.get
        .devicesAll(other)
        .then(xhr => {
          if (xhr && xhr.data && xhr.data.devices) {
            self.deviceList = xhr.data.devices
            self.setMapDeviceInfo()
          }
          self.isLoading = false
        })
        .catch(error => {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    getBmap (value) {
      this.map = value
    },
    hoverAction (item, action) {
      clearTimeout(self.hoverTimer)
      self.hoverTimer = setTimeout(function () {
        if (this.centerPanelType !== 'floor' && !self.planLock) {
          if (action === 'over') {
            self.selectedMarker = {
              id: item.id,
              plans: item.plans,
              devices: item.devices,
              status: item.status,
              isSelected: true
            }
            item.isHover = true
            self.showMarkerDetail(item)
          } else if (action === 'refresh') {
            self.selectedMarker = {
              id: item.id,
              plans: item.plans,
              devices: item.devices,
              status: item.status,
              isSelected: false
            }
            if (self.isSelected && self.showDetail.name === item.name) {
              self.showMarkerDetail(item)
            }
          } else {
            item.isHover = false
          }
        }
      }, 50)
    },
    ShowAddEditMode (action, type, build, plan) {
      self.isShowCollapseLocation = true
      self.isShowCollapseDevice = true

      if (type === 'location' || type === 'device') {
        this.$refs.AddEditMarkerModal.open()
      } else {
        this.$refs.AddEditAreaDeviceModal.open()
      }

      // 按新增的時候
      if (action === 'add') {
        // 選擇展開地點或設備
        setTimeout(() => {
          if (type === 'location') {
            self.$refs.addLocationCollapse.toggle()
          } else if (type === 'device') {
            self.$refs.addDeviceCollapse.toggle()
          }
          self.changeType(type)
          if (action === 'add' && type === 'insideDevice') self.noSaveButton = false
        }, 200)

        // 在location 都可以更新
        // 在樓層區域裡面只能新增設備
        if (type === 'insideDevice') {
          self.isShowCollapseLocation = false
          self.isShowDeviceAddTitle = true
        }
      }
      // 按編輯的時候
      if (action === 'edit') {
        if (type === 'location' || type === 'area') {
          self.isShowCollapseDevice = false
        }
        if (type === 'device' || type === 'insideDevice') {
          self.isShowCollapseLocation = false
          self.isShowDeviceAddTitle = false
        }
      }

      self.inputType = type
      if (self.oRMM.Login.aid > 0) {
        this.getAccounts(self.oRMM.Login.aid)
      }
      this.addMarkerMode = (action === 'add')
      if (type !== 'location' && type !== 'device') {
        self.areaAddDeviceBtn = (this.addMarkerMode && type === 'insideDevice')
        setTimeout(() => {
          self.$refs.addInnerDeviceCollapse.show = (type === 'insideDevice')
        }, 200)
        this.locationName = build.name

        self.areaList = []
        self.areaDeviceInfo = build
        build.plans.forEach((p) => {
          let area = {
            name: p.name,
            id: p.id
          }
          self.areaList.push(area)
          if (plan && plan.name && p.name === plan.name) self.selectedArea = area
        })
        if (type !== 'insideDevice' && self.areaList.length !== 0) self.selectedArea = self.areaList[0]
      }
    },
    clickMarker (item, index) {
      if (self.centerPanelType === 'floor') {
        // marker 刷新
        this.refreshBuilding.unshift({})
        setTimeout(() => {
          self.refreshBuilding.shift()
        }, 20)
      }
      self.centerPanelType = 'map'
      self.markerIndex = index
      item.isActive = true
      if (self.$refs.plans) {
        self.$refs.plans.forEach((plan, i) => {
          plan.show = false
        })
      }
      self.$refs.markers.forEach((mar, i) => {
        if (i !== index) {
          mar.show = false
        } else {
          mar.show = !mar.show
        }
      })

      // self.showMarkerDetail(item)
    },
    clickMapMarker (params) {
      let item = (params.type === 'location') ? self.buildingList.filter((build) => {
        return build.id === params.id
      })[0] : self.deviceBuildingList.filter((build) => {
        return build.id === params.id
      })[0]

      if (typeof item !== 'undefined') this.showMarkerDetail(item)
    },
    showMarkerDetail (item) {
      this.isSelected = true
      if (item.type === 'location') {
        self.showDetail = {
          name: item.name,
          connectDevices: (item.connect) ? item.connect.connectedNum : item.connectDevices,
          allDevicesNum: (item.connect) ? item.connect.allDevicesNum : item.allDevicesNum,
          lat: item.lat,
          lng: (item.lon) ? item.lon : item.lng,
          image: item.image,
          type: item.type,
          statusMsg: item.statusMsg ? item.statusMsg : '',
          areaName: item.error ? item.error.areaName : '',
          agentName: item.error ? item.error.agentName : '',
          status: item.error ? item.error.status : ''
        }
      } else {
        self.showDetail = {
          name: item.name,
          status: item.status,
          lat: item.lat,
          lng: (item.lon) ? item.lon : item.lng,
          image: item.image,
          type: item.type,
          deviceId: item.devices[0].agentId,
          statusMsg: item.statusMsg ? item.statusMsg : ''
        }
      }
    },
    addNewMarkerShow (location) {
      self.ShowAddEditMode('add', 'location')
      self.input.latitude = location.lat
      self.input.longitude = location.lng
    },
    addSave (type) {
      this.$validator.validateAll(self.inputType).then(result => {
        if (result) {
          if (self.inputType === 'device' || self.inputType === 'insideDevice') {
            if (self.selectedDevice !== '') {
              if (type === 'marker') {
                self.SaveMarker()
              } else {
                self.SaveAreaDevice()
              }
              self.errors.clear()
            } else {
              DeviceOnApis.MessageBox.Normal(
                self,
                self.$t('deviceon.message.warning'),
                self.$t('deviceon.device.message.selectDevice'),
                'warning'
              )
            }
          } else {
            if (type === 'marker') {
              self.SaveMarker()
            } else {
              self.SaveAreaDevice()
            }
            self.errors.clear()
          }
        }
      })
    },
    SaveMarker () {
      let check = true
      if (self.inputType === 'location') {
        let name = self.input.name
        self.buildingList.forEach((build) => {
          if (build.name === name && self.editid !== build.id) {
            check = false
            DeviceOnApis.MessageBox.Normal(
              self,
              self.$t('deviceon.message.warning'),
              self.$t('deviceon.device.message.duplicateLocationName'),
              'warning'
            )
            self.input.name = ''
          }
        })
      }
      if (check) {
        var buildInfo = new FormData()
        buildInfo.append('name', (self.inputType === 'location') ? self.input.name : '!@#' + self.selectedDevice.name)
        buildInfo.append('lat', self.input.latitude)
        buildInfo.append('lon', self.input.longitude)
        if (self.input.imgFile) {
          buildInfo.append('image', self.input.imgFile)
        }
        if (self.addMarkerMode) {
          DeviceOnApis.devicemap.post
            .building(buildInfo)
            .then(function (xhr) {
              // 新增地點設備
              if (self.inputType === 'device') {
                let device = xhr.data.map
                let id = device.id
                let deviceInfo = new FormData()
                deviceInfo.append('name', device.name.replace('!@#', ''))
                deviceInfo.append('parentId', device.id)
                deviceInfo.append('x', 300)
                deviceInfo.append('y', 350)
                deviceInfo.append('agentId', self.selectedDevice.agentid)
                if (self.input.imgFile) {
                  deviceInfo.append('image', self.input.imgFile)
                }

                DeviceOnApis.devicemap.post
                  .device(deviceInfo)
                  .then(function (xhr) {
                    let dev = self.deviceList.find(dev => dev.agentid === self.selectedDevice.agentid)
                    let deviceBuild = {
                      id: device.id,
                      name: device.name.replace('!@#', ''),
                      lat: parseFloat(device.lat),
                      lon: parseFloat(device.lon),
                      image: self.input.image,
                      devices: [{
                        name: device.name.replace('!@#', ''),
                        parentId: device.id,
                        x: 300,
                        y: 350,
                        agentId: self.selectedDevice.agentid,
                        id: xhr.data.map.id,
                        did: dev.did,
                        amtsupport: dev.amtsupport,
                        os: dev.ostype
                      }],
                      plans: [],
                      type: 'device',
                      status: self.getDeviceStatus(dev),
                      isActive: false,
                      isEdit: false,
                      isHover: false,
                      hasARK: self.enableARK
                    }
                    self.checkHasIDS('buildDevice', self.selectedDevice.agentid, deviceBuild)
                    DeviceOnApis.MessageBox.Normal(
                      self,
                      self.$t('deviceon.action.messages.addSuccess'),
                      '',
                      'success'
                    )
                    self.deviceBuildingList.push(deviceBuild)
                    self.$refs.AddEditMarkerModal.close()
                  })
                  .catch(function (err) {
                    self.isLoading = false
                    let error = err.response.data
                    if (error.ErrorCode === '1704' && error.Field === 'agentId' && error.FieldValue === 'already existed') {
                      let building = {
                        id: id,
                        name: self.selectedDevice.name,
                        lat: self.input.latitude,
                        lng: self.input.longitude,
                        image: self.input.image,
                      }
                      self.editOldDevice(self.selectedDevice.agentid, building, 'map')
                    } else if (error.ErrorCode === '1704' && error.Field === 'image' && error.FieldValue === 'not supported image types (gif/png/jpeg)') {
                      DeviceOnApis.MessageBox.Normal(
                        self,
                        self.$t('deviceon.message.error'),
                        self.$t('deviceon.device.message.imageFormat'),
                        'error'
                      )
                    }
                    // DeviceOnApis.devicemap.delete.mapid(id)

                    self.$refs.AddEditMarkerModal.close()
                    self.clearInput()
                  })
              } else {
                // 新增地點
                let data = xhr.data.map
                let location = {
                  id: data.id,
                  name: data.name,
                  lat: parseFloat(data.lat),
                  lon: parseFloat(data.lon),
                  image: self.input.image,
                  devices: [],
                  plans: [],
                  type: 'location',
                  isActive: false,
                  isEdit: false,
                  isHover: false,
                  allDevicesNum: 0,
                  allErrorDevices: 0,
                  connectDevices: 0,
                }
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.action.messages.addSuccess'),
                  '',
                  'success'
                )
                self.buildingList.push(location)
                self.$refs.AddEditMarkerModal.close()
              }
            })
            .catch(function (error) {
              self.isLoading = false
              if (error.response.data.ErrorCode === '1704' && error.response.data.Field === 'image' && error.response.data.FieldValue === 'not supported image types (gif/png/jpeg)') {
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.message.error'),
                  self.$t('deviceon.device.message.imageFormat'),
                  'error'
                )
              } else {
                DeviceOnApis.MessageBox.Error(self, error)
              }
              self.$refs.AddEditMarkerModal.close()
            })
        } else {
          DeviceOnApis.devicemap.patch
            .building(self.editid, buildInfo)
            .then(function (xhr) {
              if (self.inputType === 'device') {
                let mapId = 0
                self.deviceBuildingList.forEach((device) => {
                  if (device.devices[0].agentId === self.selectedDevice.agentid) {
                    mapId = device.id
                  }
                })
                DeviceOnApis.devicemap.get
                  .map(mapId)
                  .then(function (xhr) {
                    var data = xhr.data
                    var deviceInfo = new FormData()
                    deviceInfo.append('parentId', self.editid)
                    deviceInfo.append('name', self.selectedDevice.name)
                    deviceInfo.append('agentId', self.selectedDevice.agentid)
                    if (self.input.imgFile) {
                      deviceInfo.append('image', self.input.imgFile)
                    }
                    DeviceOnApis.devicemap.patch
                      .device(data.devices[0].id, deviceInfo)
                      .then(function (xhr) {
                        let dev = self.deviceList.find(dev => dev.agentid === data.devices[0].agentId)
                        let deviceBuild = {
                          id: data.id,
                          name: data.name.replace('!@#', ''),
                          lat: parseFloat(data.lat),
                          lon: parseFloat(data.lon),
                          image: self.input.image,
                          devices: [{
                            name: data.devices[0].name,
                            parentId: data.id,
                            x: 300,
                            y: 350,
                            agentId: data.devices[0].agentId,
                            id: data.devices[0].id
                          }],
                          plans: [],
                          type: 'device',
                          status: self.getDeviceStatus(dev),
                          isActive: false,
                          isEdit: false,
                          isHover: false
                        }

                        self.deviceBuildingList.forEach((dev, i) => {
                          if (dev.id === data.id) {
                            self.deviceBuildingList.splice(i, 1, deviceBuild)
                          }
                        })

                        // 更新顯示詳細資料的內容
                        self.selectedMarker = {
                          id: deviceBuild.id,
                          plans: deviceBuild.plans,
                          devices: deviceBuild.devices,
                          status: deviceBuild.status,
                          isSelected: true
                        }
                        deviceBuild.isHover = true
                        self.showMarkerDetail(deviceBuild)

                        self.$refs.AddEditMarkerModal.close()
                        DeviceOnApis.MessageBox.Normal(
                          self,
                          self.$t('deviceon.action.messages.editSuccess'),
                          '',
                          'success'
                        )
                      })
                      .catch(function (error) {
                        self.isLoading = false
                        if (error.response.data.ErrorCode === '1704' && error.response.data.Field === 'image' && error.response.data.FieldValue === 'not supported image types (gif/png/jpeg)') {
                          DeviceOnApis.MessageBox.Normal(
                            self,
                            self.$t('deviceon.message.error'),
                            self.$t('deviceon.device.message.imageFormat'),
                            'error'
                          )
                        } else {
                          DeviceOnApis.MessageBox.Error(self, error)
                        }
                        self.$refs.AddEditMarkerModal.close()
                      })
                  })
                  .catch(function (error) {
                    self.isLoading = false
                    DeviceOnApis.MessageBox.Error(self, error)
                  })
              } else {
                let location = {
                  id: self.editid,
                  name: self.input.name,
                  lat: parseFloat(self.input.latitude),
                  lon: parseFloat(self.input.longitude),
                  image: self.input.image,
                  devices: [],
                  plans: [],
                  type: 'location',
                  isActive: false,
                  isEdit: false,
                  isHover: false,
                  allDevicesNum: 0,
                  allErrorDevices: 0,
                  connectDevices: 0,
                }
                self.buildingList.forEach((build, i) => {
                  if (build.id === self.editid) {
                    self.buildingList.splice(i, 1, location)
                  }
                })

                // 更新顯示詳細資料的內容
                self.selectedMarker = {
                  id: location.id,
                  plans: location.plans,
                  devices: location.devices,
                  status: location.status,
                  isSelected: true
                }
                location.isHover = true
                self.showMarkerDetail(location)

                self.$refs.AddEditMarkerModal.close()
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.action.messages.editSuccess'),
                  '',
                  'success'
                )
              }
            })
            .catch(function (error) {
              self.isLoading = false
              if (error.response.data.ErrorCode === '1704' && error.response.data.Field === 'image' && error.response.data.FieldValue === 'not supported image types (gif/png/jpeg)') {
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.message.error'),
                  self.$t('deviceon.device.message.imageFormat'),
                  'error'
                )
              } else {
                DeviceOnApis.MessageBox.Error(self, error)
              }
              self.$refs.AddEditMarkerModal.close()
            })
        }
      }
    },
    SaveAreaDevice () {
      let check = true
      // 檢查是否重複新增相同的區域名稱
      if (self.inputType === 'area') {
        self.areaDeviceInfo.plans.forEach((p) => {
          if (self.inputArea.name === p.name && self.editid !== p.id) {
            check = false
          }
        })
      }

      if (check) {
        if (self.inputType === 'area') {
          let planInfo = new FormData()
          planInfo.append('parentId', self.areaDeviceInfo.id)
          planInfo.append('name', self.inputArea.name)
          if (self.inputArea.imgFile) {
            planInfo.append('image', self.inputArea.imgFile)
          }

          if (this.addMarkerMode) {
            // 新增區域
            DeviceOnApis.devicemap.post
              .plan(planInfo)
              .then(function (xhr) {
                let plan = xhr.data.map
                self.buildingList.forEach((e) => {
                  if (e.name === self.areaDeviceInfo.name) {
                    e.plans.push({
                      id: plan.id,
                      name: plan.name,
                      image: self.inputArea.image,
                      parentId: plan.parentId,
                      devices: [],
                      isHover: false
                    })
                  }
                })
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.action.messages.addSuccess'),
                  '',
                  'success'
                )
                self.changeMarkerCollapseHeight()
                self.$refs.AddEditAreaDeviceModal.close()
              })
              .catch(function (error) {
                self.isLoading = false
                if (error.response.data.ErrorCode === '1704' && error.response.data.Field === 'image' && error.response.data.FieldValue === 'not supported image types (gif/png/jpeg)') {
                  DeviceOnApis.MessageBox.Normal(
                    self,
                    self.$t('deviceon.message.error'),
                    self.$t('deviceon.device.message.imageFormat'),
                    'error'
                  )
                } else {
                  DeviceOnApis.MessageBox.Error(self, error)
                }
                self.$refs.AddEditAreaDeviceModal.close()
              })
          } else {
            // 編輯區域
            DeviceOnApis.devicemap.patch
              .plan(self.editid, planInfo)
              .then(function (xhr) {
                self.buildingList.forEach((e) => {
                  e.plans.forEach((p, i) => {
                    if (p.id === self.editid) {
                      let newPlan = {
                        name: self.inputArea.name,
                        parentId: self.areaDeviceInfo.id,
                        id: self.editid,
                        image: self.inputArea.image,
                        isHover: false,
                        devices: p.devices
                      }
                      e.plans.splice(i, 1, newPlan)
                    }
                  })
                })
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.action.messages.editSuccess'),
                  '',
                  'success'
                )
                self.floorImg = self.inputArea.image
                self.$refs.AddEditAreaDeviceModal.close()
              })
              .catch(function (error) {
                self.isLoading = false
                if (error.response.data.ErrorCode === '1704' && error.response.data.Field === 'image' && error.response.data.FieldValue === 'not supported image types (gif/png/jpeg)') {
                  DeviceOnApis.MessageBox.Normal(
                    self,
                    self.$t('deviceon.message.error'),
                    self.$t('deviceon.device.message.imageFormat'),
                    'error'
                  )
                } else {
                  DeviceOnApis.MessageBox.Error(self, error)
                }
                self.$refs.AddEditAreaDeviceModal.close()
              })
          }
        } else if (self.inputType === 'insideDevice') {
          if (this.addMarkerMode) {
            // 區域下新增設備
            let deviceInfo = new FormData()
            deviceInfo.append('name', self.selectedDevice.name)
            deviceInfo.append('parentId', self.selectedArea.id)
            deviceInfo.append('x', 300)
            deviceInfo.append('y', 350)
            if (self.inputArea.imgFile) {
              deviceInfo.append('image', self.inputArea.imgFile)
            }
            deviceInfo.append('agentId', self.selectedDevice.agentid)
            let status = self.getDeviceStatus(self.selectedDevice)
            DeviceOnApis.devicemap.post
              .device(deviceInfo)
              .then(function (xhr) {
                let data = xhr.data.map
                let point = {
                  id: data.id,
                  name: data.name,
                  x: data.x,
                  y: data.y,
                  agentId: data.agentId,
                  parentId: data.parentId,
                  status: status,
                  image: self.inputArea.image
                }
                self.checkHasIDS('areaDevice', point.agentId, self.selectedArea.name)
                for (let b of self.buildingList) {
                  if (self.areaDeviceInfo.name === b.name) {
                    if (status === 'connect') b.connectDevices++
                    if (status === 'error') b.allErrorDevices++
                    b.allDevicesNum++
                    let dev = self.deviceList.filter(dev => {
                      return data.agentId === dev.agentid
                    }).map(dev => {
                      return {
                        agentId: dev.agentid,
                        areaName: self.selectedArea.name,
                        id: data.id,
                        image: self.inputArea.image,
                        name: dev.name,
                        parentId: self.selectedArea.id,
                        status: self.getDeviceStatus(dev),
                        x: data.x,
                        y: data.y,
                        check: true,
                        isEdit: false,
                        isSelected: false,
                        did: dev.did,
                        amtsupport: dev.amtsupport,
                        os: dev.ostype
                      }
                    })[0]
                    b.devices.push(dev)
                    for (let p of b.plans) {
                      // 新的區域新增設備
                      if (p.id === data.parentId) {
                        if (point.status === 'error') p.errorDevices++
                        point.did = dev.did
                        point.amtsupport = dev.amtsupport
                        point.os = dev.ostype
                        p.devices.push(point)
                      }
                    }
                    break
                  }
                }

                // 顯示新增設備的區域 並更新顯示在平面圖上的設備
                let plan = self.buildingList.find(build => build.name === self.areaDeviceInfo.name).plans.find(p => p.id === data.parentId)
                self.showFloorPlan(plan)

                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.action.messages.addSuccess'),
                  '',
                  'success'
                )
                self.changePlanCollapseHeight()
                setTimeout(function () {
                  self.changeMarkerCollapseHeight()
                }, 400)
                self.$refs.AddEditAreaDeviceModal.close()
              })
              .catch(function (err) {
                self.isLoading = false
                let error = err.response.data
                if (error.ErrorCode === '1704' && error.Field === 'agentId' && error.FieldValue === 'already existed') {
                  let device = {
                    id: self.selectedArea.id,
                    name: self.selectedDevice.name,
                    status: status,
                    image: self.inputArea.image,
                  }
                  self.editOldDevice(self.selectedDevice.agentid, device, 'insideDevice')
                } else if (error.ErrorCode === '1704' && error.Field === 'image' && error.FieldValue === 'not supported image types (gif/png/jpeg)') {
                  DeviceOnApis.MessageBox.Normal(
                    self,
                    self.$t('deviceon.message.error'),
                    self.$t('deviceon.device.message.imageFormat'),
                    'error'
                  )
                }

                self.changePlanCollapseHeight()
                setTimeout(function () {
                  self.changeMarkerCollapseHeight()
                }, 400)
                self.$refs.AddEditAreaDeviceModal.close()
              })
          } else {
            // 區域下編輯設備
            let modifyDevice = new FormData()
            modifyDevice.append('name', self.selectedDevice.name)
            modifyDevice.append('parentId', self.selectedArea.id)
            modifyDevice.append('agentId', self.selectedDevice.agentid)
            if (self.inputArea.imgFile) {
              modifyDevice.append('image', self.inputArea.imgFile)
            }
            DeviceOnApis.devicemap.patch
              .device(self.editid, modifyDevice)
              .then(function (xhr) {
                let status = self.getDeviceStatus(self.selectedDevice)
                let point = {
                  id: self.editid,
                  name: self.selectedDevice.name,
                  x: self.editInfo.x,
                  y: self.editInfo.y,
                  agentId: self.editInfo.agentId,
                  parentId: self.selectedArea.id,
                  status: status,
                  image: self.inputArea.image
                }
                self.buildingList.forEach((b) => {
                  if (self.areaDeviceInfo.name === b.name) {
                    b.plans.forEach((p) => {
                      // 刪除原本地區設備
                      if (p.id === self.editInfo.parentId) {
                        p.devices.forEach((d, index) => {
                          if (d.id === self.editid) {
                            if (point.status === 'error') p.errorDevices--
                            point.did = d.did
                            point.amtsupport = d.amtsupport
                            point.os = d.ostype
                            p.devices.splice(index, 1)
                          }
                        })
                      }
                      // 新的區域新增設備
                      if (p.id === self.selectedArea.id) {
                        if (point.status === 'error') p.errorDevices++
                        p.devices.push(point)
                      }
                    })
                  }
                })
                self.checkHasIDS('areaDevice', point.agentId, self.selectedArea.name)

                // 顯示新增設備的區域 並更新顯示在平面圖上的設備
                let plan = self.buildingList.find(build => build.name === self.areaDeviceInfo.name).plans.find(p => p.id === self.selectedArea.id)
                self.showFloorPlan(plan)

                self.showDeviceDetail(point)
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.action.messages.editSuccess'),
                  '',
                  'success'
                )
                self.changePlanCollapseHeight()
                setTimeout(function () {
                  self.changeMarkerCollapseHeight()
                }, 400)
                self.$refs.AddEditAreaDeviceModal.close()
              })
              .catch(function (error) {
                self.isLoading = false
                if (error.response.data.ErrorCode === '1704' && error.response.data.Field === 'image' && error.response.data.FieldValue === 'not supported image types (gif/png/jpeg)') {
                  DeviceOnApis.MessageBox.Normal(
                    self,
                    self.$t('deviceon.message.error'),
                    self.$t('deviceon.device.message.imageFormat'),
                    'error'
                  )
                } else {
                  DeviceOnApis.MessageBox.Error(self, error)
                }
                self.$refs.AddEditAreaDeviceModal.close()
              })
          }
        }
      } else {
        DeviceOnApis.MessageBox.Normal(
          self,
          self.$t('deviceon.message.warning'),
          self.$t('deviceon.device.message.duplicateArea'),
          'warning'
        )
        self.inputArea.name = ''
      }
    },
    editOldDevice (agentId, building, field) {
      let deviceInfo = new FormData()
      deviceInfo.append('name', building.name)
      deviceInfo.append('parentId', building.id)
      deviceInfo.append('x', 300)
      deviceInfo.append('y', 350)

      DeviceOnApis.devicemap.patch
        .deviceByAgentId(agentId, deviceInfo)
        .then(function (xhr) {
          let mapid = xhr.data.id
          // 如果刪除的設備資料在地圖上
          self.deviceBuildingList.forEach((d, index) => {
            if (d.devices.length === 0 || d.devices[0].agentId === agentId) {
              DeviceOnApis.devicemap.delete.mapid(d.id)
              self.deviceBuildingList.splice(index, 1)
            }
          })

          // 如果刪除的設備資料在區域中
          for (let b of self.buildingList) {
            if (b.devices.find(dev => dev.id === mapid)) {
              b.allDevicesNum--
              b.allErrorDevices--
              b.devices = b.devices.filter(dev => {
                return dev.id !== mapid
              })
              for (let p of b.plans) {
                let flag = false
                p.devices.forEach((d, i) => {
                  if (mapid === d.id) {
                    if (d.status === 'error') p.errorDevices--
                    if (d.status === 'connect') b.connectDevices--
                    p.devices.splice(i, 1)
                    flag = true
                  }
                })
                if (flag) break
              }
              break
            }
          }

          if (field === 'map') {
            // 地點設備
            let dev = self.deviceList.find(dev => dev.agentid === agentId)
            let deviceBuild = {
              id: building.id,
              name: building.name,
              lat: building.lat,
              lon: building.lng,
              image: building.image,
              devices: [{
                name: building.name,
                parentId: building.id,
                x: 300,
                y: 350,
                agentId: agentId,
                id: mapid
              }],
              plans: [],
              type: 'device',
              status: self.getDeviceStatus(dev),
              isActive: false,
              isEdit: false,
              isHover: false
            }
            self.checkHasIDS('buildDevice', agentId, deviceBuild)
            self.deviceBuildingList.push(deviceBuild)
          } else {
            // 區域下的設備
            let point = {
              id: mapid,
              name: building.name,
              x: 300,
              y: 350,
              did: true,
              agentId: agentId,
              parentId: building.id,
              status: building.status,
              image: building.image
            }
            self.buildingList.forEach((b) => {
              if (self.areaDeviceInfo.name === b.name) {
                if (building.status === 'connect') b.connectDevices++
                b.allDevicesNum++
                let dev = self.deviceList.filter(dev => {
                  return agentId === dev.agentid
                }).map(dev => {
                  return {
                    agentId: dev.agentid,
                    areaName: b.name,
                    id: mapid,
                    image: building.image,
                    name: dev.name,
                    parentId: building.id,
                    status: self.getDeviceStatus(dev),
                    x: 300,
                    y: 350,
                    check: true,
                    isEdit: false,
                    isSelected: false
                  }
                })[0]
                b.devices.push(dev)
                let planName = ''
                b.plans.forEach((p) => {
                  if (p.id === building.id) {
                    planName = p.name
                    p.devices.push(point)
                  }
                })
                self.checkHasIDS('areaDevice', dev.agentId, planName)
              }
            })
          }

          DeviceOnApis.MessageBox.Normal(
            self,
            self.$t('deviceon.action.messages.editSuccess'),
            '',
            'success'
          )
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    showFloorPlan (item) {
      // 關閉其餘plan Collapse
      self.$refs.plans.forEach((plan, i) => {
        if (plan.id !== item.id) {
          plan.show = false
        } else {
          plan.show = !plan.show
          self.changePlan = plan
        }
      })

      self.floorImg = item.image
      self.centerPanelType = 'floor'
      self.floorDevices = item.devices
      self.isSelected = false
      setTimeout(() => {
        if (self.$refs.floorImg) {
          let element = document.getElementsByClassName('floorPanel')[0]
          // 監聽floor大小 標示位置隨著圖片大小調整
          erd.listenTo(element, function (element) {
            self.top = self.$refs.floorImg.offsetTop
            self.left = self.$refs.floorImg.offsetLeft
            let ww = self.$refs.floorImg.offsetWidth
            let wh = self.$refs.floorImg.offsetHeight
            for (let [index, dev] of self.floorDevices.entries()) {
              let ph = self.$refs.popupContent[index].offsetHeight
              let pw = self.$refs.popupContent[index].clientWidth
              self.$set(dev, 'px', dev.x < 1 ? parseInt(ww * dev.x) : parseInt(dev.x))
              self.$set(dev, 'py', dev.y < 1 ? parseInt(wh * dev.y) : parseInt(dev.y))
              self.$set(dev, 'popupContentOffset', parseInt(pw / 2) - 15)
              self.$set(dev, 'popupContentTopOffset', (dev.py + ph > wh) ? ph * (-1) - 5 : 35)
              dev.isSelected = false
            }
          })
        }
      }, 200)
      self.changeMarkerCollapseHeight()
    },
    showDeviceDetail (item) {
      self.isSelected = true
      self.floorDevices.forEach((dev) => {
        dev.isSelected = (dev.id === item.id)
      })
      self.showDetail = {
        name: item.name,
        status: item.status,
        image: item.image,
        type: 'device',
        deviceId: item.agentId,
        statusMsg: ''
      }
    },
    showDeleteModel (item, index, type) {
      this.$refs.DeleteMarkerModal.open()
      self.deleteMarkerInfo.id = item.id
      self.deleteMarkerInfo.index = index
      self.deleteMarkerInfo.type = type
    },
    deleteType (type) {
      if (type === 'area') {
        DeviceOnApis.devicemap.delete
          .mapid(self.deleteMarkerInfo.id)
          .then(function (xhr) {
            self.buildingList.forEach(function (e) {
              e.plans.forEach(function (p) {
                if (p.id === self.deleteMarkerInfo.id) {
                  e.plans.splice(self.deleteMarkerInfo.index, 1)
                }
              })
            })
            DeviceOnApis.MessageBox.Normal(
              self,
              self.$t('deviceon.action.messages.deleteSuccess'),
              '',
              'success'
            )
            self.changeMarkerCollapseHeight()
            self.$refs.DeleteMarkerModal.cancel()
          })
          .catch(function (error) {
            self.isLoading = false
            self.$refs.DeleteMarkerModal.cancel()
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
      } else if (type === 'insideDevice') {
        DeviceOnApis.devicemap.delete
          .mapid(self.deleteMarkerInfo.id)
          .then(function (xhr) {
            self.buildingList.forEach(function (e) {
              e.devices = e.devices.filter(dev => {
                return dev.id !== self.deleteMarkerInfo.id
              })
              e.plans.forEach(function (p) {
                p.devices.forEach(function (d) {
                  if (d.id === self.deleteMarkerInfo.id) {
                    if (d.status === 'connect') e.connectDevices--
                    if (d.status === 'error') p.errorDevices--
                    e.allDevicesNum--
                    e.allErrorDevices--
                    p.devices.splice(self.deleteMarkerInfo.index, 1)
                    self.isSelected = false
                  }
                })
              })
            })
            DeviceOnApis.MessageBox.Normal(
              self,
              self.$t('deviceon.action.messages.deleteSuccess'),
              '',
              'success'
            )
            self.changePlanCollapseHeight()
            setTimeout(function () {
              self.changeMarkerCollapseHeight()
            }, 400)
            self.$refs.DeleteMarkerModal.cancel()
          })
          .catch(function (error) {
            self.$refs.DeleteMarkerModal.cancel()
            self.isLoading = false
            DeviceOnApis.MessageBox.Error(self, error)
          })
      } else {
        if (this.centerPanelType === 'map') {
          self.deleteMarkerId = self.deleteMarkerInfo.id
          setTimeout(() => {
            self.deleteMarkerId = -1
          }, 10)
        } else {
          // 中間顯示為區域圖時
          if (type === 'location') {
            // 刪除建築
            DeviceOnApis.devicemap.delete
              .mapid(self.deleteMarkerInfo.id)
              .then(function (xhr) {
                self.buildingList = self.buildingList.filter(function (e) {
                  return e.id !== self.deleteMarkerInfo.id
                })
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.action.messages.deleteSuccess'),
                  '',
                  'success'
                )
                self.changePlanCollapseHeight()
                setTimeout(function () {
                  self.changeMarkerCollapseHeight()
                }, 400)
                self.$refs.DeleteMarkerModal.cancel()
              })
              .catch(function (error) {
                self.$refs.DeleteMarkerModal.cancel()
                self.isLoading = false
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
          } else {
            // 刪除地點設備
            let deviceDeleteId = self.deviceBuildingList.filter(d => {
              return d.id === self.deleteMarkerInfo.id
            })[0]
            deviceDeleteId = deviceDeleteId ? deviceDeleteId.devices[0].id : ''
            if (deviceDeleteId) {
              // 先刪除底下設備
              DeviceOnApis.devicemap.delete
                .mapid(deviceDeleteId)
                .then(function (xhr) {
                  // 刪除建築
                  DeviceOnApis.devicemap.delete
                    .mapid(self.deleteMarkerInfo.id)
                    .then(function (xhr) {
                      self.deviceBuildingList = self.deviceBuildingList.filter(function (e) {
                        return e.id !== self.deleteMarkerInfo.id
                      })
                      DeviceOnApis.MessageBox.Normal(
                        self,
                        self.$t('deviceon.action.messages.deleteSuccess'),
                        '',
                        'success'
                      )
                      self.$refs.DeleteMarkerModal.cancel()
                    })
                    .catch(function (error) {
                      self.$refs.DeleteMarkerModal.cancel()
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
                })
                .catch(function (error) {
                  self.$refs.DeleteMarkerModal.cancel()
                  DeviceOnApis.MessageBox.Error(self, error)
                })
            }
          }
        }
        self.isSelected = false
        self.showDetail = {}
        self.$refs.DeleteMarkerModal.cancel()
      }
    },
    getDeleteMarResponse (val) {
      if (val) {
        if (self.deleteMarkerInfo.type === 'location') {
          self.buildingList.splice(self.deleteMarkerInfo.index, 1)
        } else {
          self.deviceBuildingList.splice(self.deleteMarkerInfo.index, 1)
        }
        self.centerPanelType = 'map'
        self.$refs.DeleteMarkerModal.cancel()
      }
    },
    editMarker (type, item, plan, device) {
      self.inputType = type
      self.ShowAddEditMode('edit', type, item, plan)
      this.noSaveButton = false
      setTimeout(() => {
        switch (type) {
          case 'location':
            self.$refs.addLocationCollapse.show = true
            self.$refs.addDeviceCollapse.show = false

            self.isShowCollapseLocation = true
            self.isShowCollapseDevice = false

            self.input.name = item.name
            self.editid = item.id
            self.input.latitude = item.lat
            self.input.longitude = item.lon
            self.input.image = item.image
            break
          case 'device':
            self.$refs.addDeviceCollapse.show = true
            self.$refs.addLocationCollapse.show = false

            self.isShowCollapseLocation = false
            self.isShowCollapseDevice = true

            self.deviceList.forEach((dev) => {
              if (dev.agentid === item.devices[0].agentId) {
                self.selectedDevice = dev
              }
            })
            self.editid = item.id
            self.input.latitude = item.lat
            self.input.longitude = item.lon
            self.input.image = item.image
            break
          case 'area':
            self.$refs.addInnerDeviceCollapse.show = false
            self.$refs.addAreaCollapse.show = true

            self.isShowCollapseLocation = true
            self.isShowCollapseDevice = false

            self.editid = plan.id
            self.inputArea.name = plan.name
            self.inputArea.image = plan.image
            break
          case 'insideDevice':
            self.$refs.addInnerDeviceCollapse.show = true
            self.$refs.addAreaCollapse.show = false
            self.isShowCollapseLocation = false
            self.isShowCollapseDevice = true

            self.editid = device.id
            self.editInfo = {
              name: device.name,
              agentId: device.agentId,
              x: device.x,
              y: device.y,
              parentId: device.parentId,
              status: device.status,
              image: device.image
            }
            self.deviceList.forEach(function (d) {
              if (d.agentid === device.agentId) self.selectedDevice = d
            })
            self.selectedArea = {
              name: plan.name,
              id: plan.id
            }
            self.inputArea.image = device.image
            break
        }
      }, 200)
    },
    changeMarkerCollapseHeight () {
      setTimeout(function () {
        self.$refs.markers[self.markerIndex].$el.children[1].style.height = self.$refs.markers[self.markerIndex].$slots.body[0].elm.clientHeight + 'px'
      }, 400)
    },
    changePlanCollapseHeight () {
      setTimeout(function () {
        self.changePlan.$el.children[1].style.height = self.changePlan.$slots.body[0].elm.clientHeight + 'px'
      }, 400)
    },
    cancel () {
      self.clearInput()
      self.isShowDeviceAddTitle = false
      self.noSaveButton = true
    },
    clearInput () {
      // 新增地點
      this.input = {
        name: '',
        latitude: '',
        longitude: '',
        image: 'undefined',
        imgFile: '',
        address: ''
      }

      // 新增地區
      this.inputArea = {
        name: '',
        image: 'undefined',
        imgFile: ''
      }

      // 新增設備
      this.selectedDevice = self.groupDeviceList[0]

      // this.addSaveMode = false
      this.fileClear = false
      this.$nextTick(() => {
        this.fileClear = true
      })
      setTimeout(() => {
        self.errors.clear('location')
        self.errors.clear('device')
        self.errors.clear('area')
      }, 100)
    },
    getAccounts (aid) {
      this.isLoading = true
      DeviceOnApis.accounts.get
        .accounts(aid)
        .then(function (xhr) {
          let data = self.sortAccounts(xhr, aid)
          if (data) {
            self.accountOptions = data.accountOptions
            self.selectedAccount = data.selectedAccount
          }
          self.isLoading = false
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    getGroups (aid) {
      DeviceOnApis.accounts.get
        .deviceGroups(aid)
        .then(function (xhr) {
          let data = self.sortGroups(xhr, aid, self.gid, false)
          if (data) {
            let groups = data.groupOptions
            self.groupList = []
            groups.forEach((g) => {
              self.groupList.push({ gid: g.gid, description: g.name, no: 1, totalDevices: 0 })
            })
            if (self.groupList.length > 0) {
              self.selectedGroup = self.groupList[0]
              self.getDevices(self.selectedGroup, true)
              self.GetGid = self.groupList[0].gid
            }
          }
        })
        .catch(function (error) {
          self.isLoading = false
          DeviceOnApis.MessageBox.Error(self, error)
        })
    },
    getDevices (gid, first, like) {
      let oData = {
        pageSize: 10,
        no: gid.no,
        orderBy: 'connected',
        orderType: 'desc',
        like: like
      }
      if (first) self.groupDeviceList = []
      if (gid.gid === 0) {
        DeviceOnApis.devicegroups.get
          .devicesAll(oData)
          .then(function (xhr) {
            if (xhr && xhr.data && xhr.data.devices) {
              let devices = xhr.data.devices
              devices.forEach(function (d) {
                self.groupDeviceList.push({
                  did: d.did,
                  name: d.name,
                  agentid: d.agentid,
                  normal: d.normal,
                  connected: d.connected,
                  checked: false
                })
              })
              if (first) {
                // set group Total device number
                self.groupList.forEach((group) => {
                  if (group.gid === gid.gid) {
                    group.totalDevices = xhr.data.total
                  }
                })
                if (self.groupDeviceList.length > 0) {
                  if (self.selectedDevice) {
                    let index = self.groupDeviceList.findIndex(function (d, i) {
                      return d.did === self.selectedDevice.did
                    })

                    if (index > -1) {
                      self.selectedDevice = self.groupDeviceList[index]
                    } else {
                      self.selectedDevice = self.groupDeviceList[0]
                    }
                  } else {
                    self.selectedDevice = self.groupDeviceList[0]
                  }
                } else {
                  self.selectedDevice = ''
                }
              } else {
                self.dropStatus = 'finish'
              }
            }
          })
          .catch(function (error) {
            self.isLoading = false
            DeviceOnApis.MessageBox.Error(self, error)
          })
      } else {
        DeviceOnApis.devicegroups.get
          .devices(gid.gid, oData)
          .then(function (xhr) {
            if (
              xhr &&
              xhr.data &&
              xhr.data.groups &&
              xhr.data.groups[0] &&
              xhr.data.groups[0] &&
              xhr.data.groups[0].devices
            ) {
              let devices = xhr.data.groups[0].devices
              devices.forEach((d) => {
                self.groupDeviceList.push({
                  did: d.did,
                  name: d.name,
                  agentid: d.agentid,
                  connected: d.connected,
                  checked: false
                })
              })
              if (first) {
                // set group Total device number
                self.groupList.forEach((group) => {
                  if (group.gid === gid.gid) {
                    group.totalDevices = xhr.data.groups[0].total_acc_cond
                  }
                })
                if (self.groupDeviceList.length > 0) {
                  if (self.selectedDevice) {
                    let index = self.groupDeviceList.findIndex(function (d, i) {
                      return d.did === self.selectedDevice.did
                    })
                    if (index > -1) {
                      self.selectedDevice = self.groupDeviceList[index]
                    } else {
                      self.selectedDevice = self.groupDeviceList[0]
                    }
                  } else {
                    self.selectedDevice = self.groupDeviceList[0]
                  }
                } else {
                  self.selectedDevice = ''
                }
              } else {
                self.dropStatus = 'finish'
              }
            }
          })
          .catch(function (error) {
            self.isLoading = false
            DeviceOnApis.MessageBox.Error(self, error)
          })
      }
    },
    mouseDown (item, e) {
      var moveX = e.clientX - e.offsetX - item.px
      var moveY = e.clientY - e.offsetY - item.py
      var ww = self.$refs.floorImg.offsetWidth
      var wh = self.$refs.floorImg.offsetHeight

      var firstX = item.px
      var firstY = item.py

      var firstTime = ''
      var lastTime = ''

      if (e.preventDefault) {
        e.preventDefault()
      } else {
        e.returnValue = false
      }
      document.onmousemove = function (ev) {
        var event = ev || window.event
        firstTime = moment().valueOf()
        self.drag = true
        if (
          event.clientY < moveY ||
          event.clientX < moveX ||
          event.clientY > moveY + wh ||
          event.clientX > moveX + ww
        ) {
          return false
        }

        var endx = event.clientX - moveX
        var endy = event.clientY - moveY

        item.px = endx
        item.py = endy
      }
      document.onmouseup = function (ev) {
        lastTime = moment().valueOf()
        if (lastTime - firstTime > 100) {
          /// //* Click */////
          self.drag = false
          self.isSelected = true
          for (let [index, dev] of self.floorDevices.entries()) {
            dev.isSelected = (dev.id === item.id) ? !dev.isSelected : false
            if (dev.isSelected) {
              let ph = self.$refs.popupContent[index].offsetHeight
              let pw = self.$refs.popupContent[index].clientWidth
              dev.popupContentOffset = parseInt(pw / 2) - 15
              dev.popupContentTopOffset = (dev.py + ph > wh) ? ph * (-1) - 5 : 35
            }
          }
          self.showDetail = {
            name: item.name,
            deviceId: item.agentId,
            status: item.status,
            image: item.image,
            type: 'device'
          }
        }
        if (firstX !== item.px || firstY !== item.py) {
          let modifyDevice = new FormData()
          item.x = (item.px / ww).toFixed(3)
          item.y = (item.py / wh).toFixed(3)
          modifyDevice.append('x', item.x)
          modifyDevice.append('y', item.y)
          DeviceOnApis.devicemap.patch
            .device(item.id, modifyDevice)
            .then(function (xhr) {
              // do nothing
            })
            .catch(function (error) {
              self.isLoading = false
              DeviceOnApis.MessageBox.Error(self, error)
            })
        }
        document.onmousemove = function () {}
        document.onmouseup = function () {}
      }
    },
    eventHandler (e) {
      let cmd = e.data
      if (cmd.type === 'language') {
        // change map option language
        switch (navigator.language) {
          case 'zh-CN':
            self.mapType = [{
              name: 'BaiduMap',
              description: this.$t('deviceon.dashboard.BaiduMap')
            },
            {
              name: 'LeafletMap',
              description: this.$t('deviceon.dashboard.OpenStreetMap')
            },
            {
              name: 'LeafletMapOffline',
              description: this.$t('deviceon.dashboard.OpenStreetOfflineMap')
            }]
            break
          default:
            self.mapType = [{
              name: 'BaiduMap',
              description: this.$t('deviceon.dashboard.BaiduMap')
            },
            {
              name: 'LeafletMap',
              description: this.$t('deviceon.dashboard.OpenStreetMap')
            },
            {
              name: 'LeafletMapOffline',
              description: this.$t('deviceon.dashboard.OpenStreetOfflineMap')
            },
            {
              name: 'GoogleMap',
              description: this.$t('deviceon.dashboard.GoogleMap')
            }]
            break
        }

        self.selectedMap = self.mapType.filter((map) => {
          return self.selectedMap.name === map.name
        })[0]
      } else if (cmd.type === 'EVents' && cmd.value.length !== 0) {
        for (let value of cmd.value) {
          if (value.type.toLowerCase() === 'device') {
            let agentId = value.agent_id
            let name = value.agent_name

            let connect = true
            let normal = true
            let status = 'connect'
            switch (value.subtype) {
              case 'DEVICE_DISCONNECTED':
                connect = false
                normal = true
                status = 'disconnect'
                break
              case 'DEVICE_CONNECTED':
                connect = true
                normal = true
                status = 'connect'
                break
              case 'THRESHOLD_CHECK_ERROR':
                connect = true
                normal = false
                status = 'error'
                break
            }

            // 修改device List
            self.deviceList.forEach(d => {
              if (d.agentid === agentId) {
                d.connected = connect
                d.normal = normal
              }
            })

            let flag = true
            // 修改device building
            for (let i = 0; i < self.deviceBuildingList.length; i++) {
              if (self.deviceBuildingList[i].name === name) {
                self.deviceBuildingList[i].status = status
                self.deviceBuildingList[i].statusMsg = value.message
                self.hoverAction(self.deviceBuildingList[i], self.panToEnable ? 'over' : 'refresh')
                flag = false
                break
              }
            }
            // 修改building 內 device
            if (flag) {
              let check = true
              for (let i = 0; i < self.buildingList.length; i++) {
                let connectCount = 0
                let errorCount = 0
                if (self.buildingList[i].devices.length !== 0) {
                  self.buildingList[i].devices.forEach(d => {
                    self.deviceList.forEach(e => {
                      if (e.agentid === d.agentId) {
                        if (e.connected) connectCount++
                        if (!e.normal) errorCount++
                        if (d.agentId === agentId) {
                          d.status = status
                          self.buildingList[i].error = {
                            areaName: self.buildingList[i].name + ' -- ' + d.areaName,
                            agentName: e.name,
                            status: status
                          }
                          check = false
                        }
                      }
                    })
                  })
                  self.buildingList[i].connectDevices = connectCount
                  self.buildingList[i].allErrorDevices = errorCount
                  self.buildingList[i].plans.forEach(p => {
                    if (p.devices.length !== 0) {
                      let perrorCount = 0
                      for (let d of p.devices) {
                        if (d.agentId === agentId) {
                          d.status = status
                        }
                        if (d.status === 'error') perrorCount++
                      }
                      p.errorDevices = perrorCount
                    }
                  })
                  if (!check) {
                    self.buildingList[i].statusMsg = value.message
                    self.hoverAction(self.buildingList[i], self.panToEnable ? 'over' : 'refresh')
                    break
                  }
                }
              }
            }
          }
        }
      }
    },
    // dropdown
    ScrollToBottom () {
      if (self.groupDeviceList.length % 10 === 0 && (self.groupDeviceList.length < self.selectedGroup.totalDevices) && self.dropStatus !== 'onloading') {
        self.selectedGroup.no += 1
        self.dropStatus = 'onloading'
        setTimeout(function () {
          self.getDevices(self.selectedGroup, false)
        }, 1000)
      }
    },
    serchTxt (Txt) {
      self.keyword = Txt
    },
    resetGetDevice (hasKeyWord) {
      // ""Group""" dropdown status:
      // if open : reset anything
      // if close: reset anything, and push how many dropNo for device, and focus selected device did
      self.dropStatus = ''
      if (hasKeyWord) {
        self.selectedGroup.no = 1
        self.getDevices(self.selectedGroup, true, hasKeyWord)
      } else {
        self.selectedGroup.no = 1
        self.getDevices(self.selectedGroup, true)
      }
    },
    errorMsg (msg) {
      if (msg) {
        return `<p class="marquee"><span>${msg}</span></p>`
      } else {
        return ''
      }
    },
    pickThis (e, i, item) {
      if (e === self.pickThisItem.Type && i === self.pickThisItem.Index) {
        self.pickThisItem.Type = ''
        self.pickThisItem.Index = -1
      } else {
        self.pickThisItem.Type = e
        self.pickThisItem.Index = i
      }
      self.selectedMarker = {
        id: item.id,
        plans: item.plans,
        devices: item.devices,
        status: item.status,
        isSelected: true
      }
      if (e === 'device') {
        self.showMarkerDetail(item)
        item.isHover = true

        // 關閉地點marker
        if (self.$refs.plans) {
          self.$refs.plans.forEach((plan) => {
            plan.show = false
          })
        }
        self.$refs.markers.forEach((mar) => {
          mar.show = false
        })
      }
    },
    checkHasIDS (type, agentId, item) {
      if (!this.enableIDS) return
      // 檢查是否為研華設備或是是否有認證
      let dev = self.deviceList.find(dev => dev.agentid === agentId)
      let oRMM = RMMGlobal.get()
      if (dev && ((!dev.platformname && oRMM.trialCode === 0) || dev.platformname)) {
        DeviceOnApis.devices.get
          .devicePlugins(dev.did, true)
          .then(xhr => {
            let result = false
            // 檢查是否啟用螢幕遠端控制
            if (xhr.data.Plugins && xhr.data.Plugins.length !== 0) {
              result = !!xhr.data.Plugins.find(p => p.plugin === 'EmbDDC')
            }
            if (type === 'init') {
              self.$set(item, 'hasIDS', result)
            } else if (type === 'buildDevice') {
              let dev = self.deviceBuildingList.find(dev => dev.devices[0].agentId === agentId)
              if (dev) self.$set(dev, 'hasIDS', result)
            } else {
              self.buildingList.forEach(build => {
                let plan = build.plans.find(p => p.name === item)
                if (plan) {
                  let dev = plan.devices.find(dev => dev.agentId === agentId)
                  if (dev) {
                    self.$set(dev, 'hasIDS', result)
                  }
                }
              })
            }
          })
          .catch(error => {
            console.log(error)
          })
      }
    },
    openModal (e, otherType) {
      if (e.type === 'OSD' || otherType === 'OSD') {
        let dev = this.deviceList.find(dev => dev.agentid === e.agentId)
        this.monitorControl.did = dev.did
        this.monitorControl.agentId = dev.agentid
        this.$refs.MonitorModal.open()
      } else if (e.type === 'powerOn' || otherType === 'powerOn') {
        DeviceOnApis.MessageBox.Normal(
          self,
          self.$t('deviceon.device.title') +
            ' ' +
            self.$t('deviceon.device.management.tableheading.option'),
          self.$t('deviceon.power.messages.confirm') + ' : ' +
            self.$t('deviceon.power.actions.start'),
          'warning',
          true
        ).then(value => {
          if (value.value) {
            let oData = {}
            oData.did = e.did
            oData.action = 'start'
            DeviceOnApis.power.put
              .devices(oData)
              .then(function (xhr) {
                self.isLoading = false
                DeviceOnApis.MessageBox.Normal(
                  self,
                  self.$t('deviceon.power.messages.success'),
                  '',
                  'success'
                ).then(value => {})
              })
              .catch(function (error) {
                self.isLoading = false
                DeviceOnApis.MessageBox.Error(self, error)
              })
          }
        })
      } else {
        self.propsAgentid = e.agentId
        self.propsDid = e.did
        self.propsName = e.name
        self.propsHidden = true
        // 搜到設備歸屬者後，把資料props下去
        DeviceOnApis.devices.get
          .belongings(e.agentId)
          .then(function (xhr) {
            if (xhr && xhr.data) {
              let oData = xhr.data.devices[0][e.agentId]
              if (oData.length !== 0) {
                self.propsAid = oData[0].aid
                Object.keys(oData[0]).forEach(field => {
                  if (
                    field !== 'mail' &&
                    field !== 'role' &&
                    field !== 'phone' &&
                    field !== 'rid' &&
                    field !== 'aid'
                  ) {
                    let tmpAccountDetail = oData[0][field]
                    self.propsGid = tmpAccountDetail[0].gid
                  }
                })
              }
            }
          })
          .then(function () {
            switch (e.type || otherType) {
              case 'screenshot':
                self.ARKModalTitle = self.$t('deviceon.overview.action.takeScreen')
                self.arkScreenshot = true
                self.$refs.ARKModal.open()
                break
              case 'remotedesktop':
                self.ARKModalTitle = self.$t('deviceon.device.view.remoteDesktop')
                self.propsOs = e.os
                self.propsAmtsupport = e.amtsupport

                DeviceOnApis.data.get.capability(e.agentId)
                  .then(function (xhr) {
                    if (xhr && xhr.data) {
                      let capability = xhr.data
                      if (capability && capability.remote_kvm && capability.remote_kvm.Information && capability.remote_kvm.Information.e) {
                        let ae = capability.remote_kvm.Information.e
                        for (let i = 0; i < ae.length; i++) {
                          if (ae[i].n === 'vncMode') {
                            self.propsStrVncMode = ae[i].sv
                            self.arkRemotedesktop = true
                            self.$refs.ARKModal.open()
                            break
                          }
                        }
                      }
                    }
                  })
                  .catch(function (error) {
                    console.log(error)
                  })

                break
              case 'monitoring':
                self.ARKModalTitle = self.$t('deviceon.menu.device.devicemonitoring')
                self.arkDeviceMonitoring = true
                self.$refs.ARKModal.open()
                break
              case 'event':
                self.ARKModalTitle = self.$t('deviceon.menu.event')
                self.eventPopup = true
                self.$refs.ARKModal.open()
                break
            }
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    closeARKModal () {
      self.arkScreenshot = false
      self.arkRemotedesktop = false
      self.arkDeviceMonitoring = false
      self.eventPopup = false
    }
  },
  watch: {
    selectedAccount (data) {
      if (data !== '') {
        this.getGroups(data.aid)
      }
    },
    selectedMap (data) {
      self.isSelected = false
      if (data.name === 'GoogleMap') {
        this.mapSize = {
          width: this.$refs.mapPanel.clientWidth + 'px',
          height: this.$refs.mapPanel.clientHeight + 'px'
        }
      }
    },
    keyword (val) {
      clearTimeout(self.keywordTimer)
      self.keywordTimer = setTimeout(function () {
        self.resetGetDevice(val)
      }, 1000)
    },
    panToEnable (val) {
      self.myConfig.mapAutoPan = val
      DeviceOnApis.ui.post
        .my(self.myConfig)
        .then(function (xhr) {
          // do nothiing
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    pickThisItem: {
      handler (val) {
        self.planLock = val.Type !== '' && val.Index !== -1
      },
      deep: true
    },
    buildings: {
      handler (val) {
        clearTimeout(self.buildingTimeout)
        self.buildingTimeout = setTimeout(() => {
          let buildings = JSON.parse(JSON.stringify(val))
          self.buildingList = buildings.filter((d) => {
            return d.type === 'location'
          })
          self.deviceBuildingList = buildings.filter((d) => {
            return d.type === 'device'
          })
        }, 200)
      },
      deep: true
    }
  },
  computed: {
    orignMarkers () {
      let building = JSON.parse(JSON.stringify(self.buildingList.concat(self.deviceBuildingList).concat(self.refreshBuilding)))
      let markers = []
      for (let item of building) {
        let imgUrl = item.image
        let value = {
          id: item.id,
          name: item.name,
          image: imgUrl,
          lat: item.lat,
          lng: item.lon,
          devices: item.devices,
          plans: item.plans,
          type: item.type
        }
        if (item.type === 'location') {
          value.hasError = item.allErrorDevices > 0
        } else if (item.type === 'device') {
          value.hasARK = item.hasARK
          value.status = item.status
          value.hasIDS = item.hasIDS
        }
        markers.push(value)
      }
      return markers
    }
  },
  destroyed () {
    window.removeEventListener('message', this.eventHandler)
  }
}
</script>

<style lang="scss">
  .OverviewDeviceMap{
    &>.d-flex.justify-content-between{
      @include media-breakpoint-down(md){
        flex-wrap: wrap;
      }
    }

    .swiper-slide{
      padding: 0 30px;
    }

    .swiper-button-prev{
      left: 4px;
    }
    .swiper-button-next{
      right: 4px;
    }

    .swiper-button-prev:after,
    .swiper-button-next:after{
      font-size: 27px;
    }

    // 整個框架
    .col-maplist{
      flex: 0 0 25%;
      max-width: 25%;
      @include PC-small{
        flex: 0 0 30%;
        max-width: 30%;
      }
      @include media-breakpoint-down(md){
        flex: 0 0 100%;
        max-width: 100%;
      }
      @include media-breakpoint-down(sm){
        margin-bottom: 25px;
      }
    }
    .col-mapPanel{
      flex: 0 0 73%;
      max-width: 73%;
      @include PC-small{
        flex: 0 0 66.7%;
        max-width: 66.7%;
      }
      @include media-breakpoint-down(md){
        flex: 0 0 100%;
        max-width: 100%;
      }
      &.col-mapPanel-full{
        flex: 0 0 100%;
        max-width: 100%;
         @include PC-small{
          flex: 0 0 100%;
          max-width: 100%;
         }
      }
      .tip {
        position: absolute;
        top: -35px;
        left: 51px;
      }
    }

    //--------------------------------------左側 地圖列表
    //選擇某一項
    .btn-focus{
      color: rgba(0,0,0,0.2) !important;
      cursor: pointer;
      position: absolute;
      right: 0;
      &.pickThis{
        color: $main-theme !important;
      }
    }

    .alert-dot {
      top: 0px;
      left: 1rem;
      position: relative;
      span {
        color: #ffffff !important;
      }
    }
    .isError {
      color: #ff0000;
    }
    .mapList{
      .vuestic-widget-body{
        height: 19vw;
        overflow-y: auto;
        @include media-breakpoint-down(sm){
          height: 265px;
        }
      }
      &.full-mapList{
        .vuestic-widget-body{
          height: 41vw;
        }
      }
    }
    .allList{
      width: 100%;
    }
    .vuestic-collapse{
      border-radius: 0px;
    }
    .more-function {
      &.isSelected svg{
        border-radius: 50%;
        background-color: $main-theme;
        use {
          color: #ffffff;
        }
      }
    }
    .vuestic-collapse__header{
      &__button{
        padding: 10px 12px;
        display: flex;
        align-items: center;
      }
    }
    .device-header {
      padding: 10px 12px 10px 55px;
      display: flex;
      justify-content: space-between;
      font-weight: normal;
    }
    .btn-map{
      padding: 0;
    }

    // device popup
    .popup-device-name{
      font-size: 14px;
      border-bottom: 1px solid;
      text-align: center;
      margin-bottom: 8px;
    }

    .map-popup-btn {
      color: white;
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
      padding: 5px;
      border-radius: 20px;
      text-align: center;
      margin-bottom: 10px;
      background-color: $main-theme;
      &:hover {
        background-color: $maindark-theme;
      }
    }

    // 新增地點設備
    .input-editmarker-box{
      margin-top: 10px;
      padding-left: 43px;
      padding-right: 20px;
      .right {
        float: right;
      }
    }
    .img-add{
      max-height: 200px;
      display: block;
      margin: 0 auto;
    }

    // 地點底下有 平面圖或設備
    .underlocation-hasplan{
      .vuestic-collapse__body{
        .vuestic-collapse__header__button{
          padding-left: 30px;
        }
        .vuestic-collapse__body{
          padding-left: 70px;
        }
      }
    }

    .list-deviceName{
      font-weight: initial;
      &:hover{
        color: $main-theme;
      }
      &.isSelected{
        color: $main-theme;
      }
    }
    .list-device-body{
      li{
        padding: 5px 0;
        cursor: pointer;
        &:last-child{
          padding-bottom: 10px;
        }
      }
    }

    //----------------------------------------------中間部分
    .google {
      width: 97%;
    }
    .offlineMap {
      width: 99%;
      .fa-question-circle {
        cursor: pointer;
        font-size: 25px;
        margin-top: -20px;
        color: $text-color;
      }
    }
    .mapPanel{
      position: relative;
      height: 36vw;
      @include media-breakpoint-down(sm){
        height: 500px;
      }
    }
    .floorPanel {
      position: relative;
      height: 36vw;
      .floor-image {
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      img{
        max-height: 100%;
        max-width: 100%;
        margin: 0 auto;
        display: block;
      }

      // 錨點
      li {
        span{
          width: 25px;
          height: 25px;
          border-radius: 99%;
          border: 1px solid #ffffff;
          box-shadow: 0px 0px 5px rgba(0,0,0,1);
          background-image: url('./map/white-device.svg');
          background-size: 84%;
          background-position: center bottom 1px;
          background-repeat: no-repeat;
          &.connected{
            background-color: #38a277;
          }
          &.error{
            background-color: #d32d2d;
          }
          &.disconnected{
            background-color: #727272;
          }
          &.isSelected{
            width: 30px;
            height: 30px;
            box-shadow: 0px 0px 5px rgba(0,0,0,0.68);
            &.connected{
              background-color: #077e4e;
            }
            &.error{
              background-color: #a30f0f;
            }
            &.disconnected{
              background-color: #505050;
            }
          }
        }
      }

      .floor-popup{
        padding: 10px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid #c5c5c5;
        box-shadow:0 0 10px rgba(0,0,0,0.2);
      }
    }

    //地圖Lock
    .MapLockedPanel {
      position: absolute;
      z-index: 100;
      width: 100%;
      height: 100%;
    }

    // -----------------------------------------右邊
    .mapDetail{
      .vuestic-widget-body{
        height: 17vw;
        padding: 18px 0;
        @include PC-middle{
          padding: 15px 0;
        }
        @include PC-small{
          height: 27vh;
        }
        @include media-breakpoint-down(sm){
          height: 300px;
        }
      }

      .item-text{
        font-size: 16px;
        &.error-text{
          font-size: 15px;
          background: #d32d2d;
          padding: 0px;
          color: #ffffff;
          width: 100%;
          @include PC-middle{
            font-size: 14px;
          }
          &.haserror{
            padding: 5px;
          }
          &.connect {
            background: #228f39;
          }
        }
      }

      .swiper-pagination.swiper-pagination-fraction{
        position: absolute;
        bottom: 0;
      }
    }
    .mapbox-right-noselect{
      height:100%;
      background: rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .detailImg{
      display: block;
      max-height: 200px;
      max-width: 100%;
      height: auto !important;
      width: 100% !important;
      margin: 0 auto;
    }
    .no-detailImg{
      text-align: center;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // popUp -------------------------------------

    //手風琴
    .box-noimage{
      background-color: rgba(0,0,0,0.05);
      border: 1px solid #d1d1d1;
      padding-bottom: 12px;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      @include media-breakpoint-down(md){
        height: 182px;
      }
    }
    // 上傳圖片
    .mapBtn {
      position: relative;
      cursor: pointer;
      background-color: transparent;
      border: 0px solid transparent;
      margin-top: -5px;
      margin-left: 5px;
      &:hover{
        use{
          color: #ffffff;
        }
        svg{
          border-radius: 50%;
          background-color: $main-theme;
        }
      }
    }
    // 上傳圖片的svg
    .img-input {
      cursor: pointer;
      opacity: 0;
      position: absolute;
      width: 32px;
      left: 0;
      top: 0;
      padding: 0px;
      z-index: 9;
      &:hover + button{
        use{
          color: #ffffff;
        }
        svg{
          border-radius: 50%;
          background-color: $main-theme;
        }
      }
    }

    //無圖片svg
    .noimage{
      height: 100px;
    }

    .el-autocomplete {
      display: block;
    }

    .center-vertically {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .hint {
      font-size: 15px;
      color: $main-theme;
    }
  }
  .changeBigMap {
    width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 55px;
    transition: all 0.3s;
    background: #ebebeb;
    overflow: hidden;
    z-index: 99;
    .OverviewDeviceMap .mapPanel{
      height: 76vh;
    }
  }
  .item-name{
    padding-right: 30px;
    cursor: pointer;
    display: flex;
  }
  .list-floorName {
    cursor: pointer;
    display: flex;
  }
  .overflow-inherit{
    .vuestic-collapse__header.isopen + .vuestic-collapse__body{
      overflow: inherit;
      height: auto !important;
    }
  }

  .map-card{
    div{
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      span{
        font-weight: bold;
        padding-left: 10px;
      }
    }
    .map-card-connect{
      color: #077e4e;
    }
    .map-card-disconnect{
      color: #727272;
    }
    .map-card-abnormal{
      color: #d32d2d;
      border-bottom: 1px solid #757575;
      padding-bottom: 5px;
    }
    .map-card-all{
      padding-top: 7px;
    }
  }
.ul-123 {
    margin-left: 1rem;
    li{
      list-style-type: decimal;
      .ul-abc {
        margin-left: 1rem;
        li{
          list-style-type: lower-alpha;
        }
        .ul-roman {
          margin-left: 1rem;
          li {
            list-style-type: lower-roman;
          }
        }
      }
    }
  }
</style>
