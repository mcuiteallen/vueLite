<template>
  <aside class="vuestic-sidebar">
    <vuestic-scrollbar>
      <ul class="sidebar-menu">
        <slot name="menu"></slot>
      </ul>
    </vuestic-scrollbar>
  </aside>
</template>

<script>
import Expanding from 'vue-bulma-expanding/src/Expanding'
export default {
  name: 'vuestic-sidebar',
  components: {
    Expanding
  },
  props: {
    hidden: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss">
.vuestic-sidebar {
  background: $menu-bg;
  height: calc(100% - 55px);
  position: fixed;
  width: $sidebar-width;
  top: 55px;
  transition: all 0.2s ease;
  opacity: 1;
  z-index: 99;
  &+.content-wrap{
    &::before{
      display: none;
    }
  }
  @include media-breakpoint-down(lg){
    top: 55px;
    left: 0;
    width: 230px;
    z-index: 999;
    &+.content-wrap{
      &::before{
        display: block;
      }
    }
  }
  .vuestic-scrollbar {
    height: 100%;
    border:none;
    border-right: 1px solid $border-color;
    .sidebar-menu {
      max-height: 100%;
      margin-bottom: 0;
      list-style: none;
      padding-left: 0;
      z-index: 99999;
      li {
        display: block;
        padding-left: 0;
      }
      @include media-breakpoint-down(md) {
      margin-top: 0rem;
      }
    }
    .sidebar-menu-item-icon{
      vertical-align: bottom;
    }
  }
  &.sidebar-hidden {
    top: $sidebar-hidden-top;
    opacity: 0;
    z-index: $min-z-index;

    @include media-breakpoint-down(md) {
      top: $sidebar-hidden-top-mobile;
      opacity: 0;
      z-index: $sidebar-mobile-z-index;
      height: $sidebar-hidden-height-mobile;
    }
    &+.content-wrap{
      &::before{
        display: none;
      }
    }
  }
  &.sidebar-hidden + .content-wrap {
    margin-left: $sidebar-left;
  }
  span{
    @include PC-small{
      font-size: 15px;
    }
  }
  .collapse{
    span{
      @include PC-small{
        font-size: 14px;
      }
    }
  }

  &::before{
    content: "";
    position: absolute;
    background: #000000;
    opacity: 0;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  &.fakeCover{
		&::before{
      opacity: 0.5;
      z-index: 9;
		}
	}
}
</style>
