<template>
    <span class="v-page-pager">
      <li @click.stop.prevent="jumpPage(1)" :class='[pageIndex === 1 ? "v-page-li-active":"","v-page-li"]'><a>1</a></li>

      <li @click.stop.prevent="jumpPage(pageIndex - showPagingCount)" v-if="showJumpPrev"
          :class="[pageIndex=== 1 ? 'disabled' :'','v-page-li','v-page-jump-prev']"
          >
          <a>
            <svg class="v-icon-angle-double-left">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 0h32v32H0z"/>
                <path class="fill-text-color" d="M11.549 16.08l6.707-6.706 1.414 1.414-5.293 5.293 5.293 5.293-1.414 1.414z"/>
              </g>
            </svg>
          </a>
      </li>

      <li v-for="(num,index) in pagingCounts" @click.stop.prevent="jumpPage(num)"
          :class='[num === pageIndex ? "v-page-li-active":"","v-page-li"]' :key="index"><a>{{num}}</a></li>

      <li @click.stop.prevent="jumpPage(pageIndex + showPagingCount)" v-if="showJumpNext"
          class="v-page-li v-page-jump-next" >
          <a>
            <svg class="v-icon-angle-double-right">
              <g fill="none" fill-rule="evenodd">
                <path d="M0 0h32v32H0z"/>
                <path class="fill-text-color" d="M19.67 16.08l-6.707 6.708-1.414-1.414 5.293-5.293-5.293-5.293 1.414-1.414z"/>
              </g>
            </svg>
          </a>

      <li v-if="pageCount >1" @click.stop.prevent="jumpPage(pageCount)"
          :class='[pageIndex === pageCount ? "v-page-li-active":"","v-page-li"]'><a>{{pageCount}}</a></li>
    </span>
</template>

<script>
export default{
  props: {
    pageCount: Number,
    pageIndex: Number,
    showPagingCount: Number
  },
  computed: {
    numOffset () {
      return Math.floor((this.showPagingCount + 2) / 2) - 1
    },

    showJumpPrev () {
      if (this.pageCount > this.showPagingCount + 2) {
        if (this.pageIndex > this.showPagingCount) {
          return true
        }
      }
      return false
    },

    showJumpNext () {
      if (this.pageCount > this.showPagingCount + 2) {
        // if (this.pageIndex < this.pageCount - this.numOffset) {
        if (this.pageIndex <= this.pageCount - this.showPagingCount) {
          return true
        }
      }
      return false
    },

    // 当前要显示的数字按钮集合
    pagingCounts () {
      let vm = this
      let startNum
      let result = []
      let showJumpPrev = vm.showJumpPrev
      let showJumpNext = vm.showJumpNext

      if (showJumpPrev && !showJumpNext) {
        startNum = vm.pageCount - vm.showPagingCount
        for (let i = startNum; i < vm.pageCount; i++) {
          result.push(i)
        }
      } else if (!showJumpPrev && showJumpNext) {
        for (let i = 2; i < vm.showPagingCount + 2; i++) {
          result.push(i)
        }
      } else if (showJumpPrev && showJumpNext) {
        for (let i = vm.pageIndex - vm.numOffset; i <= vm.pageIndex + vm.numOffset; i++) {
          result.push(i)
        }
      } else {
        for (let i = 2; i < vm.pageCount; i++) {
          result.push(i)
        }
      }

      return result
    }
  },
  methods: {
    jumpPage (pageIndex) {
      this.$emit('jumpPageHandler', pageIndex)
    },
  },
  created () {

  }
}
</script>
