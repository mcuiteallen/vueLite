<template>
  <div>
    <div v-if="!limitable" class="vuestic-tag-group">
      <vuestic-tag
        v-for="(item, index) in valueTag"
        :key="index"
        :name="item.name || item"
        :type="type || item.type"
        :disabletag="disablerid > item.rid"
        :removable="removable"
        @remove="removeTag(item, index)"
        :addable="addable"
        @add="addTag(item, index)"
        :isopnedetail="isopnedetail"
        :routerinfomation="routerinfomation"
        @routerinfomation="$emit('routerinfomation', item)"
        @opendetail="$emit('opendetail', $event)"
        :class="{
          'hight-light-tag': item.appinstall ? filterTxt === item.appinstall : false,
          'disable-tag': addable && item.isselected,
          'hidden': item.rid === 4
        }"
      />
    </div>
    <div v-else class="vuestic-tag-group">
      <vuestic-tag
        v-for="(item, index) in valueTag"
        :key="index"
        :name="item.name || item"
        :type="type || item.type"
        :removable="removable"
        @remove="removeTag(index)"
      />
      <small v-if="value.length > limit && moretxt">
        {{'deviceon.eventAlert.button.more'  | translate}} ...
      </small>
    </div>
  </div>
</template>

<script>
import VuesticTag from './VuesticTag.vue'

export default {
  name: 'vuestic-tag-group',
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
    limitable: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 3
    },
    moretxt: {
      type: Boolean,
      default: false
    },
    filterTxt: {
      type: String,
      default: '',
    },
    isopnedetail: {
      type: Boolean,
      default: false
    },
    routerinfomation: {
      type: Boolean,
      default: false
    },
    addable: {
      type: Boolean,
      default: false
    },
    disablerid: {
      type: Number,
      default: 0
    }
  },
  components: {
    VuesticTag
  },
  methods: {
    removeTag (item, tagIndex) {
      this.$emit('delete', item)
      this.$emit('input', this.value.filter((item, i) => i !== tagIndex))
    },
    addTag (item) {
      this.$emit('add', item)
    }
  },
  computed: {
    valueTag () {
      if (this.limitable && this.value.length > this.limit) {
        return this.value.filter((item, index) => {
          if (index < this.limit) return true
          else return false
        })
      } else {
        return this.value
      }
    }
  }
}
</script>

<style lang="scss">
  .vuestic-tag-group {
    display: flex;
    flex-wrap: wrap;
    small{
      color: $text-color;
      line-height: 27px;
      height: 27px;
    }
  }
</style>
