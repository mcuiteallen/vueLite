<template>
  <div class="vuestic-tag" :class="tagClass">
    <span class="vuestic-tag-name"
      v-tooltip.top-center="{ content: name, trigger: 'hover', offset: 8}"
      @click="seeDetail(disabletag)"
    >
      {{name}}
    </span>

    <div class="spinner-border text-success spinner-border-sm" role="status" v-if="showsync"></div>
    <span v-if="isprogress && !showsync" class="progress-num">{{progressnum}}%</span>
    <!-- Less -->
    <span class="vuestic-tag-button"
      v-if="removable && !showsync"
      v-tooltip.top-center="{ content: removeEableContent, trigger: 'hover', offset: 8}"
      :class="{'enabled': removeEnable}"
      @click="remove"
    >
      <i class="ion-md-close ion"></i>
    </span>
    <!-- plus-->
    <span class="vuestic-tag-button" v-if="addable && !removable && !showsync" @click="$emit('add')">
      <i class="ion-md-add ion"></i>
    </span>
    <!-- install 安裝進度 -->
    <div v-if="isprogress && !showsync" class="progress-bar">
      <span :style="{width:progressnum +'%'}"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'vuestic-tag',
  data () {
    return {
      deleted: false
    }
  },
  props: {
    name: {
      type: String,
    },
    removable: {
      type: Boolean,
      default: false
    },
    addable: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'primary',
    },
    isprogress: {
      type: Boolean,
      default: false
    },
    progressnum: {
      type: Number,
      default: 0,
    },
    showsync: {
      type: Boolean,
      default: false
    },
    isopnedetail: {
      type: Boolean,
      default: false
    },
    routerinfomation: {
      type: Boolean,
      default: false
    },
    toggleRemove: {
      type: Boolean,
      default: true
    },
    removeEnable: {
      type: Boolean,
      default: false
    },
    removeEableContent: {
      type: String,
      default: ''
    },
    disabletag: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    tagClass () {
      return `vuestic-tag-${this.type} ${this.deleted ? 'vuestic-tag-deleted' : ''} ${this.disabletag ? 'vuestic-tag-disable' : ''}`
    },
  },
  methods: {
    remove () {
      if (this.removeEnable) return
      if (this.toggleRemove) {
        this.deleted = true
        setTimeout(() => {
          this.$emit('remove')
          this.deleted = false
        }, 500)
      } else {
        this.$emit('remove')
      }
    },
    seeDetail (val) {
      if (this.routerinfomation) {
        if (!val) {
          this.$emit('routerinfomation')
        }
      }
      if (this.isopnedetail) {
        this.$emit('opendetail', this.name)
      }
    }
  }
}
</script>

<style lang="scss">
  .vuestic-tag {
    border-radius: 16px;
    padding: 1px 7px;
    color: $text-color;
    border: solid 1px $text-color !important;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 5px;
    opacity: 1;
    line-height: 24px;
    padding: 0px 7px;
    &:not(:last-child) {
      margin-right: 15px;
    }
    &-deleted {
      opacity: 0;
      transition: all 0.5s ease;
    }
    &.vuestic-tag-disable{
      opacity: 0.4;
      cursor: context-menu;
    }

    .vuestic-tag-name{
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100px;
    }
    &.hidden{
      display: none;
    }
  }
  .vuestic-tag-primary {
    border-color: gray;
    .vuestic-tag-button {
      color: $main-theme;
      font-size: 17px;
      opacity: 0.8;
      &:hover {
        color: $main-theme;
        opacity: 1;
      }
      &:focus, &:active {
        color: $main-theme;
        opacity: 1;
      }
    }
  }
  .vuestic-tag-danger {
    border-color: theme-color("danger");
    .vuestic-tag-button {
      color: theme-color("danger");
      &:hover {
        color: lighten(theme-color("danger"), 15%);
      }
      &:focus, &:active {
        color: darken(theme-color("danger"), 15%);
      }
    }
  }
  .vuestic-tag-info {
    border-color: theme-color("info");
    .vuestic-tag-button {
      color: theme-color("info");
      &:hover {
        color: lighten(theme-color("info"), 15%);
      }
      &:focus, &:active {
        color: darken(theme-color("info"), 15%);
      }
    }
  }
  .vuestic-tag-dark {
    border-color: theme-color("dark");
    .vuestic-tag-button {
      color: theme-color("dark");
      &:hover {
         color: lighten(theme-color("dark"), 35%);
       }
      &:focus, &:active {
        color: darken(theme-color("dark"), 15%);
      }
    }
  }
  .vuestic-tag-warning {
    border-color: theme-color("warning");
    .vuestic-tag-button {
      color: theme-color("warning");
      &:hover {
        color: lighten(theme-color("warning"), 15%);
      }
      &:focus, &:active {
        color: darken(theme-color("warning"), 15%);
      }
    }
  }
  .vuestic-tag-pale {
    border-color: theme-color("pale");
    .vuestic-tag-button {
      color: theme-color("pale");
      &:hover {
        color: lighten(theme-color("pale"), 5%);
      }
      &:focus, &:active {
        color: darken(theme-color("pale"), 15%);
      }
    }
  }

  .vuestic-tag-button {
    font-size: 1.2rem;
    margin-left: 7px;
    cursor: pointer;
    &.enabled {
      cursor: not-allowed;
      opacity: 0.3;
    }
  }
</style>
