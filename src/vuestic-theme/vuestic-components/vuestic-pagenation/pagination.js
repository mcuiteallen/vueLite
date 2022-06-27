'use strict'

// Object.defineProperty(exports, "__esModule", {
//     value: true
// });

var _pager = require('./vuestic-pagenation.vue')

var _pager2 = _interopRequireDefault(_pager)

var _index = require('../vuestic-simple-select/VuesticSimpleSelect.vue')

var _index2 = _interopRequireDefault(_index)

function _interopRequireDefault (obj) { return obj && obj.__esModule ? obj : { default: obj } }

export default {
  name: 'v-pagination',
  props: {
    layout: {
      type: Array,
      default: function _default () {
        return ['total', 'first', 'prev', 'pager', 'next', 'last', 'sizer', 'jumper']
      }
    },

    size: {
      type: String
    },

    total: {
      type: Number,
      require: true
    },

    pageIndex: {
      type: Number
    },

    showPagingCount: {
      type: Number,
      default: 5
    },

    pageSize: {
      type: Number,
      default: 10
    },

    pageSizeOption: {
      type: Array,
      default: function _default () {
        return [10, 20, 30]
      }
    }

  },
  data: function data () {
    return {
      newPageIndex: this.pageIndex && this.pageIndex > 0 ? parseInt(this.pageIndex) : 1,

      newPageSize: this.pageSize,

      newPageSizeOption: [],

      sizeMaps: {
        'large': 40,
        'middle': 32,
        'small': 24
      },

      sizeMapDefault: 32,

      scrollbarClass: 'v-scrollbar-wrap',

      dataCount: 0
    }
  },

  computed: {
    pageCount: function pageCount () {
      return Math.ceil(this.total / this.newPageSize)
    }
  },

  render: function render (h) {
    var template = h('ul', { 'class': 'v-page-ul' })

    var comps = {
      'total': h('total'),
      'first': h('first'),
      'prev': h('prev'),
      'pager': h('pager', {
        attrs: { pageCount: this.pageCount,
          pageIndex: this.newPageIndex,
          showPagingCount: this.showPagingCount
        },
        on: {
          'jumpPageHandler': this.jumpPageHandler
        }
      }),
      'next': h('next'),
      'last': h('last'),
      'sizer': h('sizer'),
      'jumper': h('jumper', {
        on: {
          'jumpPageHandler': this.jumpPageHandler
        }
      })
    }

    template.children = template.children || []

    this.layout.forEach(function (item) {
      template.children.push(comps[item])
    })

    var size = this.sizeMaps[this.size] || this.sizeMapDefault
    var sizeClass = size === this.sizeMaps['large'] ? ' v-page--large' : size === this.sizeMaps['middle'] ? ' v-page--middle' : ' v-page--small'

    template.data.class += sizeClass

    return template
  },

  components: {

    Total: {
      render: function render (h) {
        return h(
          'span',
          { 'class': 'v-page-total' },
          [ this.$parent.total, ' ', this.$t('deviceon.device.tabs.set')]
        )
      }
    },

    First: {
      render: function render (h) {
        return h(
          'li',
          {
            on: {
              'click': this.$parent.firstPage
            },

            'class': [this.$parent.newPageIndex === 1 ? 'v-page-disabled' : '', 'v-page-li', 'v-page-first']
          },
          [h('a', { 'class': 'btn-svg-page' },
            [h('svg', { 'class': 'v-icon-angle-left' },
              [h('g',
                [
                  h('path', { attrs: { 'fill': 'none', 'd': 'M32,32H0V0h32V32z' } }),
                  [h('g',
                    [
                      h('path', { attrs: { 'd': 'M16,17l6.707-6.707l1.414,1.414L18.828,17l5.293,5.293l-1.414,1.414L16,17z' } }),
                      h('path', { attrs: { 'd': 'M7.879,17l6.707-6.707L16,11.708L10.707,17L16,22.293l-1.414,1.414L7.879,17z' } })
                    ]
                  )]
                ]
              )
              ]
            )
            ]
          )
          ]
        )
      }
    },
    Prev: {
      render: function render (h) {
        return h(
          'li',
          {
            on: {
              'click': this.$parent.prevPage
            },

            'class': [this.$parent.newPageIndex === 1 ? 'v-page-disabled' : '', 'v-page-li', 'v-page-prev']
          },
          [h('a', { 'class': 'btn-svg-page' },
            [h('svg', { 'class': 'v-icon-angle-left' },
              [h('g', { attrs: { 'fill': 'none', 'fill-rule': 'evenodd' } },
                [
                  h('path', { attrs: { 'd': 'M0 0h32v32H0z' } }),
                  h('path', { attrs: { 'class': 'fill-text-color', 'd': 'M11.549 16.08l6.707-6.706 1.414 1.414-5.293 5.293 5.293 5.293-1.414 1.414z' } })
                ]
              )
              ]
            )
            ]
          )
          ]
        )
      }
    },

    pager: _pager2.default,

    Next: {
      render: function render (h) {
        return h(
          'li',
          {
            on: {
              'click': this.$parent.nextPage
            },

            'class': [this.$parent.newPageIndex === this.$parent.pageCount ? 'v-page-disabled' : '', 'v-page-li', 'v-page-next']
          },
          [h('a', { 'class': 'btn-svg-page' },
            [h('svg', { 'class': 'v-icon-angle-double-right' },
              [h('g', { attrs: { 'fill': 'none', 'fill-rule': 'evenodd' } },
                [
                  h('path', { attrs: { 'd': 'M0 0h32v32H0z' } }),
                  h('path', { attrs: { 'class': 'fill-text-color', 'd': 'M19.67 16.08l-6.707 6.708-1.414-1.414 5.293-5.293-5.293-5.293 1.414-1.414z' } })
                ]
              )
              ]
            )
            ]
          )
          ]
        )
      }
    },

    Last: {
      render: function render (h) {
        return h(
          'li',
          {
            on: {
              'click': this.$parent.lastPage
            },

            'class': [this.$parent.newPageIndex === this.$parent.pageCount ? 'v-page-disabled' : '', 'v-page-li', 'v-page-last']
          },
          [h('a', { 'class': 'btn-svg-page' },
            [h('svg', { 'class': 'v-icon-angle-double-right' },
              [
                h('path', { attrs: { 'fill': 'none', 'd': 'M0,0h32v32H0V0z' } }),
                h('g',
                  [
                    h('path', { attrs: { 'd': 'M18,17l-6.707,6.707l-1.414-1.414L15.172,17l-5.293-5.292l1.414-1.414L18,17z' } }),
                    h('path', { attrs: { 'd': 'M26.121,17l-6.707,6.707l-1.413-1.414L23.293,17l-5.292-5.292l1.413-1.414L26.121,17z' } })
                  ]
                )
              ]
            )
            ]
          )
          ]
        )
      }
    },

    Sizer: {
      components: {
        VSelect: _index2.default
      },

      render: function render (h) {
        return h('v-select', {
          attrs: { size: this.$parent.size,
            value: this.$parent.newPageSizeOption
          },
          'class': 'v-page-select',
          on: {
            'input': this.handleChange
          },
          directives: [{
            name: 'model',
            value: this.$parent.newPageSizeOption
          }]
        })
      },

      methods: {
        handleChange: function handleChange (items) {
          if (Array.isArray(items) && items.length > 0) {
            var item = items.find(function (x) {
              return x.selected
            })
            if (item) {
              this.$parent.pageSizeChangeHandler(item.value)
            }
          }
        }
      },

      created: function created () {}
    },

    Jumper: {
      methods: {
        jumperEnter: function jumperEnter (event) {
          if (event.keyCode !== 13) return

          var val = this.$parent.getValidNum(event.target.value)

          this.$parent.newPageIndex = val

          this.$emit('jumpPageHandler', val)
        }
      },
      render: function render (h) {
        return h(
          'span',
          { 'class': 'v-page-goto' },
          [ h('input', {
            'class': 'v-page-goto-input',
            domProps: {
              'value': this.$parent.newPageIndex
            },
            on: {
              'keyup': this.jumperEnter
            },
            attrs: {
              type: 'input'
            }
          }), ' / ', Math.ceil(this.$parent.total / this.$parent.pageSize)]
        )
      }
    }
  },

  methods: {
    getPage: function () {
      return this.newPageIndex
    },
    getValidNum: function getValidNum (value) {
      var result = 1

      value = parseInt(value, 10)

      if (isNaN(value) || value < 1) {
        result = 1
      } else {
        if (value < 1) {
          result = 1
        } else if (value > this.pageCount) {
          result = this.pageCount
        } else {
          result = value
        }
      }
      return result
    },
    jumpPageHandler: function jumpPageHandler (newPageIndex) {
      this.newPageIndex = newPageIndex
      this.$emit('page-change', this.newPageIndex)
    },
    firstPage: function firstPage () {
      if (this.newPageIndex > 1) {
        this.newPageIndex = 1
        this.$emit('page-change', 1)
      }
    },
    prevPage: function prevPage () {
      if (this.newPageIndex > 1) {
        this.newPageIndex = this.newPageIndex - 1
        this.$emit('page-change', this.newPageIndex)
      }
    },
    nextPage: function nextPage () {
      if (this.newPageIndex < this.pageCount) {
        this.newPageIndex = this.newPageIndex + 1
        this.$emit('page-change', this.newPageIndex)
      }
    },
    lastPage: function lastPage () {
      if (this.newPageIndex < this.pageCount) {
        this.newPageIndex = this.pageCount
        this.$emit('page-change', this.pageCount)
      }
    },
    pageSizeChangeHandler: function pageSizeChangeHandler () {
      var item = this.newPageSizeOption.find(function (x) {
        return x.selected
      })

      if (item) {
        this.newPageSize = item.value
        this.newPageIndex = 1
        this.$emit('page-size-change', this.newPageSize)
      }
    },
    initSelectOption: function initSelectOption () {
      var _this = this

      this.newPageSizeOption = this.pageSizeOption.map(function (x) {
        var temp = {}

        temp.value = x
        temp.label = x + ' 頁'
        if (_this.newPageSize === x) {
          temp.selected = true
        }

        return temp
      })
    },
    goBackPageIndex: function goBackPageIndex () {
      this.newPageIndex = this.pageIndex && this.pageIndex > 0 ? parseInt(this.pageIndex) : 1
    },
    goBackPageSize: function goBackPageSize () {
      if (this.pageSize > 0) {
        this.newPageSize = this.pageSize
        this.initSelectOption()
      }
    }
  },
  watch: {
    pageIndex: function pageIndex (newVal, oldVal) {
      this.newPageIndex = newVal
    },

    pageSize: function pageSize (newVal, oldVal) {
      this.newPageSize = newVal
      this.initSelectOption()
    }
  },
  created: function created () {
    this.initSelectOption()
  }
}
