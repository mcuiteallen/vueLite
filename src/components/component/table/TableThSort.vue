<template>
	<button class="btn btn-svg svg-noPadding">
		<icon iconName="main-sort-normal" v-if="sort"/>
		<icon iconName="main-sort2-normal" v-else/>
	</button>
</template>

<script>

export default {
  name: 'TableThSort',
  props: ['sort'],
  data () {
    return {}
  },
  mounted () {
  },
  methods: {
  }
}
</script>
