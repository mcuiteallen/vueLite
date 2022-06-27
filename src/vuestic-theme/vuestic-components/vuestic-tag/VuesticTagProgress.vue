<template>
  <div>
    <div class="vuestic-tag-progress">
      <vuestic-tag
        v-for="(item, index) in value"
        :key="index"
        :name="item.name || item"
        :type="type || item.type"
        :removable="removable"
        :toggleRemove="toggleRemove"
        :isprogress="isprogress"
        :progressnum="item.progressnum"
        :showsync="showsync"
        @remove="removeTag(index)"
        @opendetail="openDetail($event)"
        :isopnedetail="isopnedetail"
        :removeEnable="!item.removable"
        :removeEableContent="item.removableContent"
      />
    </div>

  </div>
</template>

<script>
import VuesticTag from './VuesticTag.vue'

export default {
  name: 'vuestic-tag-progress',
  props: {
    removable: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array
    },
    type: {
      type: String,
      default: '',
    },
    isprogress: {
      type: Boolean,
      default: false
    },
    showsync: {
      type: Boolean,
      default: false
    },
    isopnedetail: {
      type: Boolean,
      default: false
    },
    toggleRemove: {
      type: Boolean,
      default: true
    }
  },
  components: {
    VuesticTag
  },
  methods: {
    removeTag (tagIndex) {
      if (this.toggleRemove) this.$emit('input', this.value.filter((item, i) => i !== tagIndex))
      this.$emit('remove', this.value.find((item, i) => i === tagIndex))
    },
    openDetail (event) {
      this.$emit('opendetail', this.value.find((item) => item.name === event))
    }
  },
  computed: {

  }
}
</script>

<style lang="scss">
  .vuestic-tag-progress {
    display: flex;
    flex-wrap: wrap;
    small{
      color: $text-color;
      line-height: 27px;
      height: 27px;
    }

    .vuestic-tag{
      border: 1px solid #0d80bf !important;
      line-height: 20px ;
      padding: 3px 20px 4px;
      border-radius: 30px;

      .vuestic-tag-name{
        font-weight: bold;
        width: 180px;
        max-width: 180px;
        @include PC-small{
          width: 160px;
          max-width: 160px;
        }
        @include media-breakpoint-down(sm){
          width: 150px;
          max-width: 150px;
        }
      }
      .vuestic-tag-button{
        color:#3b3b3b;
      }
    }
  }
</style>
