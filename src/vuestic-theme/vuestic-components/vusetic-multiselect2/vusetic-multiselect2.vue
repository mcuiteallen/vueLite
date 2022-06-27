<template>
  <div
    :tabindex="searchable ? -1 : tabindex"
    :class="{ 'multiselect--active': isOpen, 'multiselect--disabled': disabled, 'multiselect--above': isAbove }"
    @focus="activate()"
    @blur="searchable ? false : deactivate()"
    @keydown.self.down.prevent="pointerForward()"
    @keydown.self.up.prevent="pointerBackward()"
    @keypress.enter.tab.stop.self="addPointerElement($event)"
    @keyup.esc="deactivate()"
    class="multiselect"
    role="combobox"
    :aria-owns="'listbox-'+id">
      <slot name="caret" :toggle="toggle">
        <i
          @mousedown.prevent.stop="toggle()"
          class="ion ion-ios-arrow-down icon-right input-icon multiselect__select"
        />
      </slot>
      <slot name="clear" :search="search"></slot>
      <div ref="tags" class="multiselect__tags">
        <slot
          name="selection"
          :search="search"
          :remove="removeElement"
          :values="visibleValues"
          :is-open="isOpen"
        >
          <div class="multiselect__tags-wrap" v-show="visibleValues.length > 0">
            <template v-for="(option, index) of visibleValues" @mousedown.prevent>
              <slot name="tag" :option="option" :search="search" :remove="removeElement">
                <span class="multiselect__tag" :key="index">
                  <span
                    v-text="getOptionLabel(option)"
                    v-tooltip.top-center="{ content: getOptionLabel(option), trigger: 'hover', offset: 8}"
                  />
                  <i tabindex="1" @keypress.enter.prevent="removeElement(option)"  @mousedown.prevent="removeElement(option)" class="ion-md-close ion tag-close"></i>
                </span>
              </slot>
            </template>
          </div>
          <template v-if="internalValue && internalValue.length > limit">
            <slot name="limit">
              <div class="multiselect__strong" v-text="limitText"/>
            </slot>
          </template>
        </slot>
        <transition name="multiselect__loading">
          <slot name="loading">
            <div v-show="loading" class="multiselect__spinner"/>
          </slot>
        </transition>
        <span
          v-if="isSingleLabelVisible"
          class="multiselect__single"
          @mousedown.prevent="toggle"
        >
          <slot name="singleLabel" :option="singleValue">
            <template>{{ currentOptionLabel }}</template>
          </slot>
        </span>
        <span
          v-if="isPlaceholderVisible"
          class="multiselect__placeholder"
          @mousedown.prevent="toggle"
        >
          <slot name="placeholder">
            {{ placeholder }}
          </slot>
        </span>
      </div>
      <transition name="multiselect">
        <div
          class="multiselect__content-wrapper"
          v-show="isOpen"
          @focus="activate"
          tabindex="-1"
          @mousedown.prevent
          :style="{ maxHeight: optimizedHeight + 'px' }"
          ref="list"
          @wheel="scroll"
        >
          <ul class="multiselect__content" :style="contentStyle" role="listbox" :id="'listbox-'+id">
            <slot name="beforeList"></slot>
            <li class="input_search">
              <input
                ref="search"
                v-if="searchable"
                :name="name"
                :id="id"
                type="text"
                autocomplete="off"
                spellcheck="false"
                :placeholder="searchPlaceholder"
                :style="inputStyle"
                :value="search"
                :disabled="disabled"
                :tabindex="tabindex"
                @input="updateSearch($event.target.value)"
                @focus.prevent="activate()"
                @blur.prevent="deactivate()"
                @keyup.esc="deactivate()"
                @keydown.down.prevent="pointerForward()"
                @keydown.up.prevent="pointerBackward()"
                @keypress.enter.prevent.stop.self="addPointerElement($event)"
                @keydown.delete.stop="removeLastElement()"
                class="multiselect__input"
                :aria-controls="'listbox-'+id"
              />
            </li>
            <li v-if="multiple && max === internalValue.length">
              <span class="multiselect__option">
                <slot name="maxElements">Maximum of {{ max }} options selected. First remove a selected option to select another.</slot>
              </span>
            </li>
            <template v-if="!max || internalValue.length < max">
              <li class="multiselect__element"
                v-for="(option, index) of filteredOptions"
                :key="index"
                :id="id + '-' + index"
                :role="!(option && (option.$isLabel || option.$isDisabled)) ? 'option' : null">
                <span
                  :class="optionHighlight(index, option)"
                  class="icon-haschebox"
                  v-if="showchebox && !option.title"
                  @click.stop="select(option)"
                >
                </span>
                <span
                  v-if="!(option && (option.$isLabel || option.$isDisabled))"
                  :class="optionHighlight(index, option)"
                  @click.stop="select(option)"
                  @mouseenter.self="pointerSet(index)"
                  :data-select="option && option.isTag ? tagPlaceholder : selectLabelText"
                  :data-selected="selectedLabelText"
                  :data-deselect="deselectLabelText"
                  class="multiselect__option"
                  :disabled="!option.title">
                    <slot
                      name="option"
                      :option="option"
                      :search="search"
                    >
                      <span v-tooltip.top-center="{ content: getOptionLabel(option), trigger: 'hover', offset: 8}">
                        {{ getOptionLabel(option) }}
                      </span>
                    </slot>
                </span>
                <span
                  v-if="option && (option.$isLabel || option.$isDisabled)"
                  :data-select="groupSelect && selectGroupLabelText"
                  :data-deselect="groupSelect && deselectGroupLabelText"
                  :class="groupHighlight(index, option)"
                  @mouseenter.self="groupSelect && pointerSet(index)"
                  @mousedown.prevent="selectGroup(option)"
                  class="multiselect__option">
                    <slot name="option" :option="option" :search="search">
                      <span>{{ getOptionLabel(option) }}</span>
                    </slot>
                </span>
              </li>
            </template>
            <slot name="afterList"></slot>
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
              <span class="drop-close" @click="closeSelect">{{'deviceon.message.title.close' | translate}}</span>
            </div>
          </ul>
        </div>
      </transition>
  </div>
</template>

<script>
import multiselectMixin from './multiselectMixin'
import pointerMixin from './pointerMixin'
export default {
  name: 'vue-multiselect',
  mixins: [multiselectMixin, pointerMixin],
  props: {
    /**
     * name attribute to match optional label element
     * @default ''
     * @type {String}
     */
    name: {
      type: String,
      default: ''
    },
    /**
     * String to show when pointing to an option
     * @default 'Press enter to select'
     * @type {String}
     */
    selectLabel: {
      type: String,
      default: 'Press enter to select'
    },
    /**
     * String to show when pointing to an option
     * @default 'Press enter to select'
     * @type {String}
     */
    selectGroupLabel: {
      type: String,
      default: 'Press enter to select group'
    },
    /**
     * String to show next to selected option
     * @default 'Selected'
     * @type {String}
     */
    selectedLabel: {
      type: String,
      default: 'Selected'
    },
    /**
     * String to show when pointing to an already selected option
     * @default 'Press enter to remove'
     * @type {String}
     */
    deselectLabel: {
      type: String,
      default: 'Press enter to remove'
    },
    /**
     * String to show when pointing to an already selected option
     * @default 'Press enter to remove'
     * @type {String}
     */
    deselectGroupLabel: {
      type: String,
      default: 'Press enter to deselect group'
    },
    /**
     * Decide whether to show pointer labels
     * @default true
     * @type {Boolean}
     */
    showLabels: {
      type: Boolean,
      default: true
    },
    /**
     * Limit the display of selected options. The rest will be hidden within the limitText string.
     * @default 99999
     * @type {Integer}
     */
    limit: {
      type: Number,
      default: 99999
    },
    /**
     * Sets maxHeight style value of the dropdown
     * @default 300
     * @type {Integer}
     */
    maxHeight: {
      type: Number,
      default: 300
    },
    /**
     * Function that process the message shown when selected
     * elements pass the defined limit.
     * @default 'and * more'
     * @param {Int} count Number of elements more than limit
     * @type {Function}
     */
    limitText: {
      type: String,
      default: 'more ...'
    },
    /**
     * Set true to trigger the loading spinner.
     * @default False
     * @type {Boolean}
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * Disables the multiselect if true.
     * @default false
     * @type {Boolean}
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Fixed opening direction
     * @default ''
     * @type {String}
     */
    openDirection: {
      type: String,
      default: ''
    },
    /**
     * Shows slot with message about empty options
     * @default true
     * @type {Boolean}
     */
    showNoOptions: {
      type: Boolean,
      default: true
    },
    showNoResults: {
      type: Boolean,
      default: true
    },
    tabindex: {
      type: Number,
      default: 0
    },
    showchebox: {
      type: Boolean,
      default: false
    },
    listisempty: {
      type: String,
      default: ''
    },
    searchPlaceholder: {
      type: String,
      default: 'Search'
    },
    showdropdownstatus: {
      type: Boolean,
      default: false
    },
    dropStatus: {
      type: String,
      default: 'onloading'
    },
    options: {
      type: Array,
      default: []
    },
    placeholder: {
      type: String,
      default: 'Select option'
    }
  },
  computed: {
    isSingleLabelVisible () {
      return (
        (this.singleValue || this.singleValue === 0) &&
        (!this.isOpen || !this.searchable) &&
        !this.visibleValues.length
      )
    },
    isPlaceholderVisible () {
      return !this.internalValue.length && (!this.searchable || !this.isOpen)
    },
    visibleValues () {
      return this.multiple ? this.internalValue.slice(0, this.limit) : []
    },
    singleValue () {
      return this.internalValue[0]
    },
    deselectLabelText () {
      return this.showLabels ? this.deselectLabel : ''
    },
    deselectGroupLabelText () {
      return this.showLabels ? this.deselectGroupLabel : ''
    },
    selectLabelText () {
      return this.showLabels ? this.selectLabel : ''
    },
    selectGroupLabelText () {
      return this.showLabels ? this.selectGroupLabel : ''
    },
    selectedLabelText () {
      return this.showLabels ? this.selectedLabel : ''
    },
    inputStyle () {
      if (
        this.searchable ||
        (this.multiple && this.value && this.value.length)
      ) {
        // Hide input by setting the width to 0 allowing it to receive focus
        return this.isOpen
          ? { width: '97%', margin: '5px', borderRadius: '0px' }
          : { width: '0', position: 'absolute', padding: '0' }
      }
    },
    contentStyle () {
      return this.options.length
        ? { display: 'inline-block' }
        : { display: 'block' }
    },
    isAbove () {
      if (this.openDirection === 'above' || this.openDirection === 'top') {
        return true
      } else if (
        this.openDirection === 'below' ||
        this.openDirection === 'bottom'
      ) {
        return false
      } else {
        return this.preferredOpenDirection === 'above'
      }
    },
    showSearchInput () {
      return (
        this.searchable &&
        (this.hasSingleSelectedSlot &&
        (this.visibleSingleValue || this.visibleSingleValue === 0)
          ? this.isOpen
          : true)
      )
    }
  },
  methods: {
    closeSelect: function () {
      this.deactivate()
    }
  }
}
</script>

<style lang="scss">
fieldset[disabled] .multiselect {
  pointer-events: none;
}
.multiselect__spinner {
  position: absolute;
  right: 1px;
  top: 1px;
  width: 48px;
  height: 35px;
  background: #fff;
  display: block;
}
.multiselect__spinner:before,
.multiselect__spinner:after {
  position: absolute;
  content: "";
  top: 50%;
  left: 50%;
  margin: -8px 0 0 -8px;
  width: 16px;
  height: 16px;
  border-radius: 100%;
  border-color: #41b883 transparent transparent;
  border-style: solid;
  border-width: 2px;
  box-shadow: 0 0 0 1px transparent;
}
.multiselect__spinner:before {
  animation: spinning 2.4s cubic-bezier(0.41, 0.26, 0.2, 0.62);
  animation-iteration-count: infinite;
}
.multiselect__spinner:after {
  animation: spinning 2.4s cubic-bezier(0.51, 0.09, 0.21, 0.8);
  animation-iteration-count: infinite;
}
.multiselect__loading-enter-active,
.multiselect__loading-leave-active {
  transition: opacity 0.4s ease-in-out;
  opacity: 1;
}
.multiselect__loading-enter,
.multiselect__loading-leave-active {
  opacity: 0;
}
.multiselect,
.multiselect__input,
.multiselect__single {
  font-family: inherit;
  font-size: 16px;
  touch-action: manipulation;
}

.multiselect {
  box-sizing: content-box;
  display: block;
  position: relative;
  width: 100%;
  height: 28px;
  text-align: left;
  color: $text-color;
}
.multiselect * {
  box-sizing: border-box;
}
.multiselect:focus {
  outline: none;
}
.multiselect--disabled {
  background: #ededed;
  pointer-events: none;
  opacity: 0.6;
}
.multiselect--active {
  z-index: 50;
}

.multiselect__input,
.multiselect__single {
  position: relative;
  display: inline-block;
  min-height: 32px;
  line-height: 20px;
  border: none;
  border-radius: 5px;
  background: $dashbordcontent-bg;
  padding: 0 0 0 5px;
  width: calc(100%);
  transition: border 0.1s ease;
  box-sizing: border-box;
  vertical-align: top;
}
.multiselect__input::placeholder {
  color:  $text-color;
}
.multiselect__tag ~ .multiselect__input,
.multiselect__tag ~ .multiselect__single {
  width: auto;
}
.multiselect__input:hover,
.multiselect__single:hover {
  border-color: #cfcfcf;
}
.multiselect__input:focus,
.multiselect__single:focus {
  border-color: #a8a8a8;
  outline: none;
}
.multiselect__single {
  padding-left: 5px;
  margin-bottom: 8px;
}
.multiselect__tags-wrap {
  display: inline;
}
.multiselect__tags {
  font-size: 14px;
  height: 28px;
  display: block;
  border-radius: 0;
  border-bottom: 1px solid #a2a2a2;
  background: transparent;
  overflow: hidden;
}
.multiselect__tag {
  position: relative;
  display: inline-block;
  padding: 5px 20px 4px 9px;
  border-radius: 21px;
  margin-left: 3px;
  margin-right: 5px;
  margin-bottom: 5px;
  color: $text-color;
  line-height: 1;
  background: $dashbordcontent-bg;
  border: 1px solid $text-color;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}
.tag-close{
  position: absolute;
  right: 8px;
  cursor: pointer;
  color: $main-theme;
}
.multiselect__tag-icon {
  cursor: pointer;
  margin-left: 7px;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  font-weight: 700;
  font-style: initial;
  width: 22px;
  text-align: center;
  line-height: 30px;
  transition: all 0.2s ease;
  border-radius: 5px;
}
.multiselect__tag-icon:after {
  content: "x";
  color: $main-theme;
  font-size: 14px;
  font-weight: initial;
}
.multiselect__current {
  line-height: 16px;
  min-height: 40px;
  box-sizing: border-box;
  display: block;
  overflow: hidden;
  padding: 8px 12px 0;
  padding-right: 30px;
  white-space: nowrap;
  margin: 0;
  text-decoration: none;
  border-radius: 5px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
}
.multiselect__select {
  position: absolute;
  right: 4px;
  top: 11px;
  font-size: 19px;
}
.multiselect__placeholder {
  color: #9b9999;
  display: inline-block;
  margin-bottom: 0px;
  font-weight: initial;
  font-size: 16px;
}
.multiselect--active .multiselect__placeholder {
  display: none;
}
.multiselect__content-wrapper {
  position: absolute;
  top: 37px;
  display: block;
  background: $dashbordcontent-bg;
  width: 100%;
  max-height: 200px !important;
  overflow-x: hidden;
  overflow-y: auto;
  border-top: 1px solid #c6c6c6 !important;
  border: 1px solid #c6c6c6;
  border-top: none;
  z-index: 50;
  -webkit-overflow-scrolling: touch;
  .input_search {
    border-bottom: 1px solid $border-color;
    input{
      border: 1px solid $main-theme;
    }
  }
  @include PC-small{
    max-height: 160px !important;
  }
}
.multiselect__content {
  list-style: none;
  display: inline-block;
  padding: 0;
  margin: 0;
  width: 100%;
  vertical-align: top;
}
.multiselect__content::webkit-scrollbar {
  display: none;
}
.multiselect__element {
  // display: block;
  display: flex;
  align-items: center;
}
.multiselect__option {
  font-size: 14px;
  display: block;
  padding-left: 8px;
  min-height: 24px;
  text-decoration: none;
  text-transform: none;
  position: relative;
  cursor: pointer;
  width: 82%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @include PC-small{
    max-width: 200px;
  }

}
.multiselect__option:after {
  top: 0;
  right: 0;
  position: absolute;
  line-height: 40px;
  padding-right: 12px;
  padding-left: 20px;
  font-size: 13px;
}
.multiselect__option--selected {
  color: $text-color;
}
.multiselect--disabled .multiselect__current,
.multiselect--disabled .multiselect__select {
  background: #ededed;
  color: #a6a6a6;
}
.multiselect__option--disabled {
  background: #ededed !important;
  color: #a6a6a6 !important;
  cursor: text;
  pointer-events: none;
}
.multiselect__option--group {
  background: #ededed;
  color: $text-color;
}
.multiselect-enter-active,
.multiselect-leave-active {
  transition: all 0.15s ease;
}
.multiselect-enter,
.multiselect-leave-active {
  opacity: 0;
}
.multiselect__strong {
  margin-left: 10px;
  line-height: 25px;
  display: inline-block;
  vertical-align: top;
  color:$main-theme;
  font-size: 16px;
}
*[dir="rtl"] .multiselect {
  text-align: right;
}
*[dir="rtl"] .multiselect__select {
  right: auto;
  left: 1px;
}
*[dir="rtl"] .multiselect__tags {
  padding: 8px 8px 0px 40px;
}
*[dir="rtl"] .multiselect__content {
  text-align: right;
}
*[dir="rtl"] .multiselect__option:after {
  right: auto;
  left: 0;
}
*[dir="rtl"] .multiselect__clear {
  right: auto;
  left: 12px;
}
*[dir="rtl"] .multiselect__spinner {
  right: auto;
  left: 1px;
}
@keyframes spinning {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(2turn);
  }
}
</style>
