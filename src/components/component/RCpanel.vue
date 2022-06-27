<template>
  <div class="controlPanel">
    <div class="panel-header">
      <!-- 左邊 -->
      <div class="d-flex align-items-center">
        <span class="panel-icon"><slot name="headericon"></slot></span>
        <input
          v-model="titleName"
          v-if="isEditName"
          class="panel-name"
        />
        <span
          v-else
          class="panel-name"
          v-tooltip.top-center="{ content: titleName, trigger: 'hover', offset: 8}"
        >
          {{titleName}}
        </span>
      </div>
      <!-- 右邊 -->
      <div class="d-flex align-items-end">
        <toggle-button
          v-if="showtogglebutton"
          v-model="toogleEnable"
          :sync="true"
          :value="isEnable"
          :width="51"
          :height="31"
          :speed="480"
          :color="{checked: '#34c759', unchecked: '#c3c3c3'}"
        />
        <button v-if="showEditBtn && !editBtn" class="btn btn-edit btn-more" style="margin-right: 10px;" @click="defaultSet('open')">{{'deviceon.device.advanced.restoreToDefault' | translate}}</button>
        <button v-if="showEditBtn && !editBtn" class="btn btn-edit btn-more" @click="clickEdit('open')">{{'deviceon.device.column.edit' | translate}}</button>
        <button v-if="showEditBtn && editBtn" class="btn btn-edit btn-more" style="margin-right: 10px;" @click="$refs.settingModal.open()">{{'modal.save' | translate}}</button>
        <button v-if="showEditBtn && editBtn" class="btn btn-edit btn-more" @click="clickEdit('cancel')">{{'modal.cancel' | translate}}</button>
      </div>
      <slot name="togglebtn"></slot>
    </div>
    <div class="panel-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
// import DeviceOnApis from '@/util/DeviceOnApis'
export default {
  name: 'controlPanel',
  props: {
    name: {
      type: String,
      default: ''
    },
    showtogglebutton: {
      type: Boolean,
      default: false
    },
    showEditBtn: {
      type: Boolean,
      default: false
    },
    isEnable: {
      type: Boolean,
      default: false
    },
    isEditName: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      toogleEnable: this.isEnable,
      titleName: this.name,
      editBtn: false
    }
  },
  watch: {
    toogleEnable () {
      this.$emit('update:isEnable', this.toogleEnable)
    },
    isEnable (val) {
      this.toogleEnable = this.isEnable
    },
    name (val) {
      this.titleName = val
    }
  },
  methods: {
    clickEdit (action) {
      this.toogleEnable = !this.toogleEnable
      this.editBtn = !this.editBtn
      if (action === 'cancel') {
        this.titleName = this.name
        this.$emit('GPIOcancel')
      }
    },
    saveEdit (type) {
      this.toogleEnable = !this.toogleEnable
      this.editBtn = !this.editBtn
      this.$emit('update:name', this.titleName)
      this.$emit('GPIOSave', type)
    },
    defaultSet (action) {
      if (action === 'open') {
        this.$refs.defaultModal.open()
      } else {
        this.$emit('GPIODefault', action)
      }
    }
  }
}
</script>

<style lang="scss">
  .controlPanel{
    background: $dashbordcontent-bg;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid $border-color;
    .panel-header{
      height: 43px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: $main-theme;
      .align-items-center {
        min-width: 36%;
        max-width: 85%;
        .panel-name {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .panel-content{
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
      background: $dashbordcontent-bg;
    }
    .panel-icon{
      margin-right: 10px;
      pointer-events: none;
      display: inline-block;
      color: #ffffff;
    }
    .panel-name{
      font-size: 16px;
      overflow : hidden;
      text-overflow : ellipsis;
      white-space : nowrap;
      color: #ffffff !important;
    }
    .vue-js-switch{
      margin-bottom:0px;
    }
    .modal-footer {
      margin-top: 30px;
    }

    .device-action-disable {
      .panel-header{
        background: $main-theme-light;
        .panel-icon{
          opacity: 0.7;
          use{
            color: $main-theme;
          }
        }
        .panel-name{
          color: $main-theme;
          opacity: 0.7;
        }
      }
    }
    .btn-edit {
      color: #ffffff;
      border: 1px solid #ffffff;
      background-color: $main-theme;
      &:hover{
        color: $main-theme;
        background-color: #ffffff;
      }
    }

  }

  //編輯模式
  input.panel-name{
    padding-left: 10px;
    border: none;
    background-color: rgba(0,0,0,0.1);
    border-bottom: 1px solid $border-color;
  }
  .card-panel{
    input{
      padding-left: 10px;
      margin-right: 10px;
      border: none;
      background-color: rgba(0,0,0,0.1);
      border-bottom: 1px solid $border-color;
      &.disabled{
        padding-left: 0px;
        margin-right: 0px;
        background-color: transparent;
        border-bottom: none;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>
