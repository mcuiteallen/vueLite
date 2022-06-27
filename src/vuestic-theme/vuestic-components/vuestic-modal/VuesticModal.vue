<template>
  <div class="vuestic-modal app-popup">
    <transition name="modal" :duration="duration">
      <div v-if="show" class="modal-container">
        <div class="modal" @click.self="clickMask">
          <div class="modal-dialog" :class="modalClass">
            <div class="modal-content" style="padding-top: 10px;">
              <!--Header-->
              <div class="modal-header">
                <slot name="header">
                  <div class="modal-title">
                    <slot name="title"></slot>
                  </div>
                  <i
                    class="ion ion-md-close close-modal"
                    v-if="closeIconShown"
                    @click.prevent="close"
                  />
                </slot>
              </div>
              <!--Container-->
              <div class="modal-body" :class="{'modal-nofooter': noButtons, 'modal-body-Limit-height':islimitbodyH}">
                <div class="modal-note" v-if="shownote">
                  <div class="note-title">
                    <slot name="note-title"></slot>
                  </div>
                  <div class="note-text">
                    <slot name="note-text"></slot>
                  </div>
                </div>
                <slot></slot>
              </div>
              <!--Footer-->
              <div class="modal-footer" v-if="!noButtons">
                <slot name="footer">
                  <button
                    type="button"
                    v-if="!noButtons"
                    :class="okClass"
                    @click="ok"
                    :disabled="okDisabled"
                  >{{ okText }}</button>
                  <button
                    type="button"
                    v-if="!noButtons"
                    :class="customizedClass"
                    @click="customized"
                    :disabled="customizedDisabled"
                  >{{ customizedText }}</button>
                  <button
                    type="button"
                    v-if="!noButtons"
                    :class="cancelClass"
                    @click="cancel"
                    :disabled="cancelDisabled"
                  >{{ cancelText }}</button>
                </slot>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-backdrop"></div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'vuestic-modal',
  props: {
    transition: {
      type: String,
      default: 'modal'
    },
    small: {
      type: Boolean,
      default: false
    },
    large: {
      type: Boolean,
      default: false
    },
    largeXL: {
      type: Boolean,
      default: false
    },
    force: {
      type: Boolean,
      default: false
    },
    okText: {
      type: String,
      default: 'CONFIRM'
    },
    cancelText: {
      type: String,
      default: 'CANCEL'
    },
    customizedText: {
      type: String,
      default: 'DEMO'
    },
    okClass: {
      type: String,
      default: 'btn btn-primary'
    },
    cancelClass: {
      type: String,
      default: 'btn btn-secondary'
    },
    customizedClass: {
      type: String,
      default: 'none'
    },
    closeIconShown: {
      type: Boolean,
      default: true
    },
    okDisabled: {
      type: Boolean,
      default: false
    },
    cancelDisabled: {
      type: Boolean,
      default: false
    },
    customizedDisabled: {
      type: Boolean,
      default: false
    },
    noButtons: {
      type: Boolean,
      default: false
    },
    keepOpen: {
      type: Boolean,
      default: false
    },
    ignoreCancel: {
      type: Boolean,
      default: false
    },
    shownote: {
      type: Boolean,
      default: false
    },
    islimitbodyH: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      show: false,
      duration: 500
    }
  },
  computed: {
    modalClass () {
      return {
        'modal-lg': this.large,
        'modal-sm': this.small,
        'modal-xl': this.largeXL
      }
    }
  },
  created () {
    if (this.show) {
      document.body.className += ' modal-open'
    }
  },
  beforeDestroy () {
    document.body.className = document.body.className.replace(
      /\s?modal-open/,
      ''
    )
  },
  watch: {
    show (value) {
      this.$emit('update:show', value)
      if (value) {
        document.body.className += ' modal-open'
      } else {
        window.setTimeout(() => {
          document.body.className = document.body.className.replace(
            /\s?modal-open/,
            ''
          )
        }, this.duration)
      }
    }
  },
  methods: {
    listenKeyUp (event) {
      if (event.key === 'Escape') {
        this.cancel()
      }
    },
    ok () {
      this.$emit('ok')
      if (!this.keepOpen) {
        this.show = false
        window.removeEventListener('keyup', this.listenKeyUp)
      }
      window.parent.postMessage({
        cmd: 'iFrameZoomout',
      }, window.origin)
    },
    cancel () {
      this.$emit('cancel')
      if (!this.ignoreCancel) {
        this.show = false
        window.removeEventListener('keyup', this.listenKeyUp)
      }
      window.parent.postMessage({
        cmd: 'iFrameZoomout',
      }, window.origin)
    },
    customized () {
      this.$emit('customized')
      this.show = false
      window.removeEventListener('keyup', this.listenKeyUp)
    },
    clickMask () {
      if (!this.force) {
        this.cancel()
      }
    },
    open () {
      this.show = true
      window.addEventListener('keyup', this.listenKeyUp)
      window.parent.postMessage({
        cmd: 'iFrameZoomin',
      }, window.origin)
    },
    close () {
      //this.$emit('close');
      this.show = false
      window.removeEventListener('keyup', this.listenKeyUp)
      window.parent.postMessage({
        cmd: 'iFrameZoomout',
      }, window.origin)  
    }  
  }
}
</script>

<style lang="scss">
  //Modals
  $modal-header-padding-x: $widget-padding;
  $modal-header-padding-y: 0;
  $modal-header-height: $widget-header-height;
  $modal-header-border: $widget-header-border;
  $modal-content-border-width: 0;
  $modal-content-border-radius: 0;
  $modal-inner-padding: 25px;
  $modal-footer-btns-padding-bottom: 20px;
  $modal-footer-btns-margin-x: 10px;
  $modal-md: 650px;
  $modal-lg: 850px;

.vuestic-modal {
  height: 0;
  width: 0;

  // For Transitioning
  .modal {
    display: block;
  }
  .modal-body{
    padding: 0px;
    color: $text-color;
    border-right: 1px solid $dashbordcontent-bg;
    background: $dashbordcontent-bg;
    &.modal-body-Limit-height{
      max-height: 72vh;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      @include media-breakpoint-down(xs){
        max-height: 70vh;
      }
      &.modal-nofooter{
        max-height: 80vh;
        @include media-breakpoint-down(xs){
          max-height: 70vh;
        }
      }
    }
  }

  .modal-dialog,
  .modal-backdrop {
    transition: all 0.5s ease;
  }

  .modal-enter .modal-dialog,
  .modal-leave-active .modal-dialog {
    opacity: 0;
    transform: translateY(-30%);
  }

  .modal-enter .modal-backdrop,
  .modal-leave-active .modal-backdrop {
    opacity: 0;
  }

  .modal-backdrop {
    opacity: 0.5;
  }

  //Modal styles

  .modal-header {
    color: $text-color;
    height: 45px;
    padding: $modal-header-padding-y $modal-header-padding-x;
    font-size: $font-size-larger;
    display: flex;
    align-items: center;
    background-color: #e6e6e6;
    @include PC-small{
      font-size: 16px;
      height: 40px;
    }
  }

  .close-modal {
    margin-left: 1rem;
    font-size: 12px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    text-align: center;
    line-height: 19px;
    color: #ffffff;
    background: #797979;
    cursor: pointer;
  }

  .modal-note{
    padding: 10px 25px;
    margin-bottom: 20px;
    background-color: $main-theme-light-2;
    border-top: 1px solid $main-theme;
    border-bottom: 1px solid $main-theme;
    width: 100%;
    .note-title{
      font-size: 16px;
    }
    .note-text{
      font-size: 15px;
    }
    @include PC-small{
      padding: 7px 25px;
      margin-bottom: 10px;
      .note-title{
        font-size: 15px;
      }
      .note-text{
        font-size: 13px;
      }
    }
  }

  .modal-content-inner{
    padding: 0px 25px;
    @include media-breakpoint-down(sm){
      padding: 0px 15px;
    }

  }
  .modal-title-category{
    margin-bottom: 20px;
    border-bottom: 1px solid ;
  }
  .item-text-input:valid{
    border:none;
    color: $text-color !important;
  }

  .multiselect__single{
    font-size: 19px;
    padding-left: 0;
    margin-bottom: 0;
    font-weight: initial;
    color: $main-theme;
  }

  .modal-content {
    border-radius: $modal-content-border-radius;
    background-color: $dashbordcontent-bg;
  }

  .modal-footer {
    justify-content: center;
    padding: 0 14px;
    padding-bottom: 20px;
    flex-wrap: nowrap;
    border-right:1px solid #ffffff;
    .btn {
      margin: 0 10px 10px 10px;
    }
    @include PC-small{
      padding-bottom: 10px;
    }
  }

  .modal-dialog {
    box-shadow: $modal-content-box-shadow-sm-up;
    margin: 0 auto;
    margin-top: 4rem;
    // top: 50%;
    // transform: translateY(-50%);
    @include PC-small{
      margin-top: 3rem;
    }
    @include media-breakpoint-down(xs){
      max-width: 98%;
    }
  }

  .modal-ask-title{
    font-weight:bold;
    margin-bottom: 2px;
    font-size: 20px;
  }
  .modal-ask-text{
    font-size: 16px;
  }

  .collapse-header-noPadding{
    .vuestic-collapse__header__button{
      padding: 0;
      &:hover{
        background-color:transparent;
        color: $main-theme;
      }
    }
  }
  .collapse-body-transparent{
    .vuestic-collapse__body{
      background-color: transparent;
    }
  }

}
.theme-Dark{
  .modal-header{
    background-color: $maindark-theme;
  }
}
</style>
