export default {
  data () {
    return {
      pointer: 0,
      pointerDirty: false,
      dropdownWrapper: {}
    }
  },
  props: {
    /**
       * Enable/disable highlighting of the pointed value.
       * @type {Boolean}
       * @default true
       */
    showPointer: {
      type: Boolean,
      default: true
    },
    optionHeight: {
      type: Number,
      default: 40
    }
  },
  mounted () {
    this.dropdownWrapper = document.querySelector('.multiselect__content-wrapper')
  },
  computed: {
    pointerPosition () {
      return this.pointer * this.optionHeight
    },
    visibleElements () {
      return this.optimizedHeight / this.optionHeight
    }
  },
  watch: {
    filteredOptions () {
      this.pointerAdjust()
    },
    isOpen () {
      this.pointerDirty = false
    },
    pointer () {
      this.$refs.search.setAttribute('aria-activedescendant', this.id + '-' + this.pointer.toString())
    }
  },
  methods: {
    optionHighlight (index, option) {
      return {
        'multiselect__option--highlight': index === this.pointer && this.showPointer,
        'multiselect__option--selected': this.isSelected(option),
        'multiselect__option--disabled': option.title
      }
    },
    groupHighlight (index, selectedGroup) {
      if (!this.groupSelect) {
        return ['multiselect__option--group', 'multiselect__option--disabled']
      }

      const group = this.options.find(option => {
        return option[this.groupLabel] === selectedGroup.$groupLabel
      })

      return group && !this.wholeGroupDisabled(group) ? [
        'multiselect__option--group',
        { 'multiselect__option--highlight': index === this.pointer && this.showPointer },
        { 'multiselect__option--group-selected': this.wholeGroupSelected(group) }
      ] : 'multiselect__option--disabled'
    },
    addPointerElement ({ key } = 'Enter') {
      /* istanbul ignore else */
      if (this.filteredOptions.length > 0) {
        this.select(this.filteredOptions[this.pointer], key)
      }
      this.pointerReset()
    },
    pointerForward () {
      /* istanbul ignore else */
      if (this.pointer < this.filteredOptions.length - 1) {
        this.pointer++
        /* istanbul ignore next */
        if (this.$refs.list.scrollTop <= this.pointerPosition - (this.visibleElements - 1) * this.optionHeight) {
          this.$refs.list.scrollTop = this.pointerPosition - (this.visibleElements - 1) * this.optionHeight
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
            this.filteredOptions[this.pointer].$isLabel &&
            !this.groupSelect
        ) this.pointerForward()
      }
      this.pointerDirty = true
    },
    pointerBackward () {
      if (this.pointer > 0) {
        this.pointer--
        /* istanbul ignore else */
        if (this.$refs.list.scrollTop >= this.pointerPosition) {
          this.$refs.list.scrollTop = this.pointerPosition
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
            this.filteredOptions[this.pointer].$isLabel &&
            !this.groupSelect
        ) this.pointerBackward()
      } else {
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
            this.filteredOptions[0].$isLabel &&
            !this.groupSelect
        ) this.pointerForward()
      }
      this.pointerDirty = true
    },
    pointerReset () {
      /* istanbul ignore else */
      if (!this.closeOnSelect) return
      this.pointer = 0
      /* istanbul ignore else */
      if (this.$refs.list) {
        this.$refs.list.scrollTop = 0
      }
    },
    pointerAdjust () {
      /* istanbul ignore else */
      if (this.pointer >= this.filteredOptions.length - 1) {
        this.pointer = this.filteredOptions.length
          ? this.filteredOptions.length - 1
          : 0
      }

      if (this.filteredOptions.length > 0 &&
          this.filteredOptions[this.pointer].$isLabel &&
          !this.groupSelect
      ) {
        this.pointerForward()
      }
    },
    pointerSet (index) {
      this.pointer = index
      this.pointerDirty = true
    },
    scroll () {
      // 元素被向上捲動的高度
      let scrollTop = this.dropdownWrapper.scrollTop
      // 元素所限制的高度
      let clientHeight = this.dropdownWrapper.clientHeight
      // 整個元素高度
      let scrollHeight = this.dropdownWrapper.scrollHeight
      if (scrollTop + clientHeight === scrollHeight) {
        this.$emit('scroll-to-bottom')
      }
    }
  }
}
