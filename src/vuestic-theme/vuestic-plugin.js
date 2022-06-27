import Widget from './vuestic-components/vuestic-widget/VuesticWidget.vue'
import Checkbox from './vuestic-components/vuestic-checkbox/VuesticCheckbox.vue'
import RadioButton from './vuestic-components/vuestic-radio-button/VuesticRadioButton.vue'
import SimpleSelect from './vuestic-components/vuestic-simple-select/VuesticSimpleSelect.vue'
import VuesticCollapse from './vuestic-components/vuestic-collapse/VuesticCollapse'
import VPagination from './vuestic-components/vuestic-pagenation/pagination'
import vueMultiselect from './vuestic-components/vusetic-multiselect2/vusetic-multiselect2'
import Modal from './vuestic-components/vuestic-modal/VuesticModal.vue'
import Wizard from './vuestic-components/vuestic-wizard/VuesticWizard.vue'
import Tag from './vuestic-components/vuestic-tag/VuesticTag'
import TagGroup from './vuestic-components/vuestic-tag/VuesticTagGroup'
import Popover from './vuestic-components/vuestic-popover/VuesticPopover.vue'

import VuesticToasted from './vuestic-mixins/VuesticToasted'
import Dropdown from './vuestic-directives/Dropdown'
import { installQuasarPlatform } from './vuestic-components/vuestic-popup/quasar/install'

installQuasarPlatform()

const VuesticPlugin = {
  install (Vue, options) {
    [
      Widget,
      Checkbox,
      RadioButton,
      SimpleSelect,
      VPagination,
      vueMultiselect,
      VuesticCollapse,
      Modal,
      Wizard,
      Tag,
      TagGroup,
      Popover
    ].forEach(component => {
      Vue.component(component.name, component)
    })

    Vue.mixin(VuesticToasted)

    Vue.directive('dropdown', Dropdown)
  },
}

export default VuesticPlugin
