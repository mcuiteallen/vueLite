<template>
  <div class="vuestic-collapse">
    <div
      class="vuestic-collapse__header"
      :class="{
        'vuestic-collapse__header--no-header': noHeader,
        'isopen': show,
        'vuestic-collapse__header--no-padding': noHeaderPadding,
        'collapse-dontClick': disable
      }"
      @click="onHeaderClick()"
    >
      <template v-if="noHeader">
        <slot name="header"/>
      </template>
      <!-- 加Less -->
      <button
        v-if="mapIcon"
        class="vuestic-collapse__header__button btn btn-accordion d-flex align-items-center"
        :class="{'collapse-closeToggle': closeToggle}"
      >
        <div class="Collapse-isopneIcon" v-if="editIcon" @click="iconClick">
          <div v-if="show">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 32h32V0H0z"/>
                <path fill="currentColor" d="M9 23h13.999V9H9z"/>
                <path fill="#FFF" fill-rule="nonzero" d="M11 15h10v2H11z"/>
              </g>
            </svg>
          </div>
          <div v-else>
            <svg width="32" height="32" viewBox="0 0 32 32" >
              <g fill="none" fill-rule="evenodd">
                <path d="M0 32h32V0H0z"/>
                <path class="fill-text-color" d="M9 23h13.999V9H9z"/>
                <path fill="#FFF" fill-rule="nonzero" d="M15 11h2v10h-2z"/>
                <path fill="#FFF" fill-rule="nonzero" d="M11 15h10v2H11z"/>
              </g>
            </svg>
          </div>
        </div>
        <slot name="header"/>
      </button>
      <!-- radio -->
      <button
        v-else
        class="vuestic-collapse__header__button btn btn-accordion"
      >
        <div class="Collapse-isopneIcon" v-if="editIcon">
          <div v-if="show">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 32h32V0H0z"/>
                <path class="stroke-text-color" stroke-width="2" d="M16 9c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7"/>
                <circle cx="16" cy="16" r="4" fill="#92308D" fill-rule="nonzero"/>
              </g>
            </svg>
          </div>
          <div v-else>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 32h32V0H0z"/>
                <path class="stroke-text-color" stroke-width="2" d="M16 9c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7"/>
              </g>
            </svg>
          </div>
        </div>
        <slot name="header"/>
      </button>
    </div>
    <div
      class="vuestic-collapse__body"
      ref="collapseBody"
      :class="{'collapseBody_height':limitbodyH, 'overflow_hidden': collapseHalf&&!show}"
      @wheel="scroll"
    >
      <slot name="body"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'vuestic-collapse',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    noHeader: Boolean,
    mapIcon: {
      type: Boolean,
      default: false
    },
    editIcon: {
      type: Boolean,
      default: false,
    },
    // header禁止點擊
    disable: {
      type: Boolean,
      default: false
    },
    // 關閉collapse預留寬度
    collapseHalf: {
      type: Boolean,
      default: false
    },
    noHeaderPadding: {
      type: Boolean,
      default: false
    },
    // 限制collapse下拉高度
    limitbodyH: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: 0
    },
    // 關閉Toggle事件
    closeToggle: {
      type: Boolean,
      default: false
    }
  },
  inject: {
    accordion: {
      default: () => ({
        onChildChange: () => {},
      }),
    },
  },
  data () {
    return {
      show: this.value,
      collapseBody: {}
    }
  },
  watch: {
    show (show) {
      if (show) {
        this.expand()
      } else {
        this.collapse()
      }
    },
  },
  mounted () {
    this.$refs.collapseBody.style.height = this.collapseHalf ? '33px' : 0
    this.collapseBody = document.querySelector('.vuestic-collapse__body')
  },
  methods: {
    scroll () {
      // 元素被向上捲動的高度
      let scrollTop = this.collapseBody.scrollTop
      // 元素所限制的高度
      let clientHeight = this.collapseBody.clientHeight
      // 整個元素高度
      let scrollHeight = this.collapseBody.scrollHeight

      if (scrollTop + clientHeight === scrollHeight) {
        this.$emit('collapseBody-scroll-to-bottom')
      }
    },
    expand () {
      setTimeout(() => {
        const bodyContent = this.$refs.collapseBody
        bodyContent.style.height = this.$slots.body[0].elm.scrollHeight + 'px'
        // bodyContent.style.marginBottom = 12 + 'px'
      }, 150)

      this.show = true
    },
    collapse () {
      const bodyContent = this.$refs.collapseBody
      bodyContent.style.height = this.collapseHalf ? '33px' : 0
      this.$nextTick(() => {
        bodyContent.scrollTop = 0
      })
      this.show = false
    },
    onHeaderClick () {
      if (!this.closeToggle) {
        this.toggle()
        this.accordion.onChildChange(this, this.show)
        this.$emit('toggle')
      }
    },
    iconClick () {
      this.$emit('iconClick')
    },
    // Public
    toggle () {
      this.show ? this.collapse() : this.expand()
    },
    changeHeight () {
      const bodyContent = this.$refs.collapseBody
      bodyContent.style.height = this.$slots.body[0].elm.scrollHeight + 'px'
    }
  },
}
</script>

<style lang="scss">
.vuestic-collapse {
  border-radius: 5px;
  overflow: hidden;
  & + & {
    margin-top: 8px;
  }

  &__body {
    height: 0;
    transition: height 0.3s;
    margin-top: 0px;
    overflow-x: hidden;
    background-color: $main-theme-light-2;
  }

  &__header {
    &.isopen{
      .btn{

      }
      div{
        color: $main-theme;
      }
      span{
        color: $main-theme;
      }
    }
    &__button {
      width: 100%;
      padding-left: 1.5rem;
      border-radius: 0;
      text-align: left;
      &:hover{
        background-color: rgba(0,0,0,0.2);
      }
    }
    &--no-header {
      margin-bottom: 1rem;
    }
    &--no-padding {
      .vuestic-collapse__header__button{
        padding: 0;
      }
    }
  }

  &.no-bg-color{
    .vuestic-collapse__header{
      &.isopen{
        .btn{
          background-color: transparent;
        }
      }
      .vuestic-collapse__header__button{
        &:hover{
          background-color: transparent;
        }
      }
    }
    .vuestic-collapse__body{
      background-color: transparent;
    }
  }
}
.vuestic-collapse__small-note{
  color: $main-theme;
  font-size: 13px;
  border-bottom: 1px solid;
  margin: 0 10px;
  &.show-more {
		float: right;
		cursor: pointer;
		margin-right: 20px;
  }
  &.onloading {
    color: $border-color;
    transition: all 0.3s;
		animation: blink 1s infinite linear;
  }
  &.nodata {
    color: $border-color;
    cursor: auto;
  }
  &.finish {
    color: $border-color;
    cursor: auto;
  }
}

@keyframes blink{
  50% {
    border-color: transparent;
  }
}
</style>
