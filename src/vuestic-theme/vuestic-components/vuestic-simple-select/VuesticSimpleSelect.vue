<template>
  <div class="vuestic-simple-select">
    <div
      class="form-group with-icon-right dropdown select-form-group"
      v-dropdown="{
        isBlocked: true,
        onDropdownClose: onDropdownClose,
        closedropdown: closeDropdown,
        opendropdown: showDropdown
      }"
      :class="{'has-error': hasErrors()}"
    >
      <div class="input-group dropdown-toggle vuestic-simple-select__dropdown-toggle">
        <div>
          <input
            :class="{'has-value': !!value}"
            v-model="displayValue"
            :name="name"
            :options="options"
            autocomplete="off"
            :placeholder="'deviceon.device.wizard.nothingSelected' | translate"
            readonly
          />
          <label class="control-label">{{label}}</label>
          <i class="bar" />
          <small v-show="hasErrors()" class="text-danger">{{ showRequiredError() }}</small>
        </div>
        <i class="ion ion-ios-arrow-down icon-right input-icon vuestic-simple-select__dropdown-arrow"/>
      </div>
      <div v-if="isClearable">
        <i
          class="fa fa-close icon-cross icon-right input-icon vuestic-simple-select__unselect"
          @click="unselectOption"
          v-if="!this.unselectDisabled"
        />
      </div>
      <div
        class="dropdown-menu vuestic-simple-select__dropdown-menu"
        aria-labelledby="dropdownMenuButton"
      >
        <scrollbar
          ref="scrollbar"
          :class="limitclass"
          @scroll-to-bottom="ScrollToBottom"
        >
          <div class="dropdown-menu-content vuestic-simple-select__dropdown-menu-content">
            <div class="bs-searchbox not-collapse" v-if="showSearchBox">
              <input
                type="text"
                class="keyword not-collapse"
                @keyup="filterSelection"
                v-model="filterInput"
                :placeholder="searchText"
                ref="search"
              />
            </div>
            <div
              class="dropdown-item vuestic-simple-select__dropdown-item"
              v-for="(option, index) in filterOptions"
              :key="index"
              :class="{'selected': isOptionSelected(option), 'noclick': (option.title === 'RoleTitle')}"
              @click="toggleSelection(option)"
              v-tooltip.top-center="{ content: option.mail, trigger: 'hover', offset: 8,}"
            >
              <span
                class="text-over"
                :title="optionName ? getOptionDetail(option, optionName) : option"
              >
                <span v-if="option.showIcon">
                  <i
                    :class="option.iconClass"
                    :style="{'color': option.iconColor}"
                    aria-hidden="true"
                  ></i>
                  <span style="margin-left:5px;"></span>
                </span>
                {{optionName ? getOptionDetail(option, optionName) : option}}
              </span>
            </div>
            <div v-if="showdropdownstatus" class="isloadingTxT">
              <span v-show="dropStatus === 'onloading'" class="drop-onloading">
                {{'deviceon.dropdown.onloading' | translate}}
              </span>
              <span v-show="dropStatus === 'finish'" class="drop-finish">
                {{'deviceon.dropdown.finish' | translate}}
              </span>
              <span v-show="dropStatus === 'nodata'" class="drop-nodata">
                {{'deviceon.dropdown.nodata' | translate}}
              </span>
            </div>
          </div>
        </scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from 'vuestic-directives/Dropdown'
import Scrollbar from '../vuestic-scrollbar/VuesticScrollbar.vue'
export default {
  name: 'vuestic-simple-select',
  components: {
    Scrollbar
  },
  directives: {
    dropdown: Dropdown
  },
  props: {
    label: String,
    options: Array,
    value: {
      default: '',
      required: true
    },
    optionKey: String,
    optionValue: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: 'simple-select'
    },
    unselectDisabled: {
      type: Boolean,
      default: false
    },
    notCollapse: {
      type: Boolean,
      default: false
    },
    showSearchBox: {
      type: Boolean,
      default: false
    },
    searchText: {
      type: String,
      default: 'Search...'
    },
    showdropdownstatus: {
      type: Boolean,
      default: false
    },
    dropStatus: {
      type: String,
      default: 'onloading'
    },
    limitclass: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      validated: false,
      displayValue: this.value || '',
      selectedValue: this.value,
      filterInput: '',
      filterOptions: [],
      optionName: ''
    }
  },
  mounted () {
    this.optionName = (this.optionValue) ? this.optionValue : this.optionKey
  },
  watch: {
    value: {
      handler (value) {
        if (!value || !this.optionKey) {
          this.displayValue = value || ''
          this.selectedValue = value || ''
          return
        }
        this.selectedValue = this.getOptionDetail(value, this.optionKey)
        this.displayValue = this.getOptionDetail(value, this.optionName)
      },
      immediate: true
    },
    options: {
      handler (value) {
        this.filterOptions = this.options
      },
      immediate: true // 聲明此方法後，立即執行一次
    }
  },
  computed: {
    // filteredList () {
    //   return this.options
    //   /* const optionKey = this.optionKey
    //   const displayValue = this.displayValue
    //   if (displayValue === '') {
    //     return this.options
    //   } else {
    //     // HACK This is done poorly.
    //     return this.options.filter(function (item) {
    //       if (optionKey && item && item[optionKey]) {
    //         // option is object
    //         if (displayValue) {
    //           return item[optionKey].toLowerCase()
    //             .search(displayValue.toLowerCase()) === 0
    //         }
    //       } else {
    //         // option is string
    //         return (item + '').toLowerCase()
    //           .search(displayValue.toLowerCase()) === 0
    //       }
    //     })
    //   } */
    // },
    isClearable () {
      return (
        this.clearable &&
        this.selectedValue !== '' &&
        this.displayValue !== '' &&
        this.selectedValue !== undefined
      )
    },
    placeholder () {
      if (this.optionName && this.selectedValue) {
        return this.getOptionDetail(this.selectedValue, this.optionName)
      } else {
        return this.selectedValue
      }
    }
  },
  methods: {
    getOptionDetail (option, optionKey) {
      if (option[optionKey] && typeof (option[optionKey]) === 'string') {
        let optionSplit = option[optionKey].split(' ')
        switch (optionSplit[1]) {
          case 'minutes':
            return optionKey
              ? optionSplit[0] + ' ' + this.$t('deviceon.device.list.minutes')
              : option
          case 'seconds':
            return optionKey
              ? optionSplit[0] + ' ' + this.$t('deviceon.device.list.seconds')
              : option
          default:
            return optionKey ? option[optionKey] : option
        }
      } else if (option[optionKey]) {
        return optionKey ? option[optionKey] : option
      }
    },
    onDropdownClose () {
      if (!this.value) {
        this.displayValue = ''
      }
      if (this.value) {
        if (this.optionName) {
          this.displayValue = this.getOptionDetail(this.value, this.optionName)
        } else {
          this.displayValue = this.value
        }
      }
    },
    toggleSelection (option) {
      if (this.value !== option) {
        this.isOptionSelected(option)
          ? this.unselectOption()
          : this.selectOption(option)
      }
    },
    unselectOption () {
      if (!this.unselectDisabled) {
        this.selectedValue = ''
        this.$emit('input', this.selectedValue)
      }
    },
    showDropdown () {
      this.displayValue = ''
      let that = this
      setTimeout(function () {
        if (that.showSearchBox) {
          that.$refs.search.focus()
        }
      }, 200)
      this.$emit('showdropdown')
    },
    closeDropdown () {
      // this.$refs.scrollbar.content.style.marginTop = 0
      this.$emit('closedropdown')
    },
    isOptionSelected (option) {
      if (this.optionKey) {
        return (
          this.selectedValue === this.getOptionDetail(option, this.optionKey)
        )
      } else {
        return this.selectedValue === option
      }
    },
    selectOption (option) {
      if (!option) {
        this.displayValue = ''
      }
      if (option && this.optionName) {
        this.displayValue = this.getOptionDetail(option, this.optionName)
      }
      this.selectedValue = option
      this.$emit('input', option)
      this.resetSelection()
    },
    validate () {
      this.validated = true
    },
    isValid () {
      let isValid = true
      if (this.required) {
        isValid = !!this.value
      }
      return isValid
    },
    hasErrors () {
      let hasErrors = false
      if (this.required) {
        hasErrors = this.validated && !this.value
      }
      return hasErrors
    },
    showRequiredError () {
      return `The ${this.name} field is required`
    },
    filterSelection (event) {
      let that = this
      if (event.keyCode === 13) {
        for (let i = 0; i < this.filterOptions.length; i++) {
          let option = this.filterOptions[i]
          if (!this.isOptionSelected(option)) {
            this.selectOption(option)
            break
          }
        }
        document.getElementsByTagName('body')[0].click()
        this.resetSelection()
      }
      if (this.filterInput.trim()) {
        this.filterOptions = this.options.filter(function (option, index) {
          let value = that.optionName ? option[that.optionName] : option
          return (
            value.toLowerCase().indexOf(that.filterInput.trim().toLowerCase()) >
            -1
          )
        })
      } else {
        this.filterOptions = this.options
      }
      this.$emit('filterSelection', this.filterInput)
    },
    resetSelection () {
      this.filterInput = ''
      this.filterOptions = this.options
    },
    ScrollToBottom () {
      this.$emit('scroll-to-bottom')
    }
  }
}
</script>

<style lang="scss">
.vuestic-simple-select {
  &__unselect {
    margin-right: 20px;
    cursor: pointer;
  }
  &__dropdown-menu {
    padding: 0;
  }
  .vuestic-simple-select__dropdown-arrow {
    top: 12px !important;
    color: $text-color;
    font-size: 18px;
    @include PC-small{
      top: 6px !important;
    }
  }
}
.form-group.select-form-group .dropdown-item {
  &.selected {
    color: $main-theme !important;
    background-color: rgba(0,0,0,0.1);
    box-shadow: inset 0px 1px 1.5px #d4d4d4;
  }
  &.noclick {
    pointer-events: none;
    cursor: none;
    color: $text-color;
    opacity: 0.4;
    span[title^=--All--]{
      color:#cecece;
    }
  }
}
.bs-searchbox {
  padding: 4px 8px;
  border-bottom: 1px solid $border-color;
  .keyword {
    border: 1px solid $border-color;
    padding: 0px 17px;
    line-height: 20px;
    height: 35px;
  }
  .keyword:focus {
    border: 1px solid $main-theme;
  }
}

</style>
