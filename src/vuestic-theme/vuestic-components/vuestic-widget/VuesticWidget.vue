<template>
  <div class="vuestic-widget" :class="{'no-header': !headerText}">
    <div class="vuestic-widget-header" v-if="headerText" :class="{'border-theme':IconFilter}">
      <!-- 靠左 -->
      <div>
        <span class="theme-color mr-2" v-if="accountName">{{accountName}}</span>{{headerText}}
        <slot name="headerTxt"></slot>
      </div>

      <!-- 靠右 -->
      <div class="d-flex align-items-center">
        <!-- 看詳細資訊的按鈕 -->
        <button v-if="moreIcon" class="btn btn-primary btn-more" :class="{'disable': isdisablebtn}">
          <slot name="ModalOpen"></slot>
          More
        </button>

        <!-- 展開看更多 -->
        <button
          v-if="IconFilter"
          class="btn btn-svg toggle-Filter-icon"
        >
          <slot name="ModalOpen"></slot>
          <icon iconName="main-dropdown"/>
        </button>

        <!-- 其他按鈕 -->
        <div v-if="otherIcon" class="d-flex align-items-center">
          <slot name="otherIcon"></slot>
        </div>

      </div>
    </div>
    <div class="vuestic-widget-body" v-if="hasSlotData">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'vuestic-widget',
  props: [
    'headerText',
    'moreIcon',
    'otherIcon',
    'IconFilter',
    'showBack',
    'showDelete',
    'routeName',
    'routeParams',
    'isdisablebtn',
    'accountName'
  ],
  computed: {
    hasSlotData () {
      return this.$slots.default
    }
  },
  data () {
    return {
    }
  },
  methods: {
    backPressed () {
      if (this.routeName) { return this.$router.push({ name: this.routeName, params: this.routeParams }) } else { return this.$router.go(-1) }
    }
  }
}
</script>

<style lang="scss">
.vuestic-widget {
  background: $dashbordheader-bg;
  padding: 0;

  .vuestic-widget-body{
    padding: 14px;
  }

  &.larger-padding {
    .vuestic-widget-body {
      padding: $widget-larger-padding;
    }
  }

  &.no-v-padding {
    .vuestic-widget-body {
      padding: 0;
    }
  }

  &.brand-info {
    background-color: $brand-info;
    color: $white;
    box-shadow: $widget-info-shadow;
  }

  &.brand-danger {
    background-color: $brand-danger;
    color: $white;
    box-shadow: $widget-danger-shadow;
  }

  &.info-widget {
    width: 100%;
    margin-bottom: 10px;
    position: relative;
    transition: all 0.3s;
    background-color: $dashbordcontent-bg;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid $border-color;
    &.no-bottm{
      margin-bottom: 0px;
    }

    &.brand-info {
      border-top-color: $brand-info;
    }

    &.brand-danger {
      border-top-color: $brand-danger;
    }
    &.theme-color{
      border: 1px solid $main-theme;
      .vuestic-widget-header{
        background: $main-theme-light;
        border-bottom: 1px solid $main-theme;
      }
    }
  }
  .vuestic-widget-header {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    line-height: 16px;
    padding: 10px 15px;
    letter-spacing: 0.5px;
    color: $text-color;
    // background: $dashbordheader-bg;
    align-items: center;
    height: 45px;
    border-bottom: 1px solid $border-color;
    transition: all 0.3s;
    &.border-theme{
      border-bottom: 3px solid $main-theme;
      margin-top: -1px;
    }
    @include media-breakpoint-down(sm) {
      font-size: 16px;
      height: 38px;
    }
  }
  .btnBack {
    margin-right: 8px;
    cursor: pointer;
  }
  .backIcon {
    margin: 8px;
    box-shadow: 0px 0px white;
  }
  .deleteIcon{
    margin: 8px;
    color:black;
    background-color:  white;
    box-shadow: 0px 0px white;
  }
  .moreIcon {
    display: inline-flex;
    div {
      margin-left: 10px;
    }
  }
}
.vuestic-widget-body-inner{
  padding: 26px 15px 0px;
  transition: all 0.3s;
}

.box-fix{
  .vuestic-widget.info-widget{
    border-radius: 0;
    overflow: inherit;
  }
}
.toggle-Filter-icon{
  position: relative;
  margin-top: -36px;
  padding: 0 !important;
  margin-right: 12px;
}

</style>
