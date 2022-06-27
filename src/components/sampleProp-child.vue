<template>
  <!-- Lower layer (child) -->
  <div class="child-layer">
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h5>Lower layer (child)</h5>
        <h6>props data, emit event method</h6>
      </div>
      <div class="catchparentinfo">{{catchparentinfo}}</div>
      <button @click="emitEvent" class="btn btn-primary btn-small">Emit the event</button>
    </div>
  </div>
</template>

<script>
let self = {}
export default {
  props: {
    catchparentinfo: {
      type: String,
      default: ''
    }
  },
  data () {
    return {}
  },
  mounted () {
    self = this
  },
  methods: {
    emitEvent () {
      self.$emit('childClick', 'get Lower layer (child)event')
    }
  },
  watch: {

  }
}

</script>

<style lang="scss">
  .child-layer{
    border: 1px solid #aaaaaa;
    margin-top: 25px;
    padding: 17px;
    .catchparentinfo{
      border: 1px solid #aaaaaa;
      height: 30px;
      width: 180px;
    }
  }
</style>
