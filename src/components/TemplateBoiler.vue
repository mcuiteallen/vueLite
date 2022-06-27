 <template>
  <div class="TemplateBoiler">
    <div class="row">
      <div class="col-xl-4 col-lg-4">
        <div class="sampleSimpleSelect">
          <div class="item-list">
            <div class="item-title">鍋爐</div>
            <vuestic-simple-select
              v-model="selectedAccount"
              option-key="name"
              :options="accountOptions"
              :unselect-disabled="true"
              :notCollapse="true"
              :showSearchBox="true"
              :searchText="$t('deviceon.wizard.keywordSearch')"
              v-tooltip.top-center="{ content: selectedAccount.name, trigger: 'hover', offset: 8}"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xl-4 col-lg-6">
        <div class="row divBorder">
          <div class="col-xl-6 col-lg-6">
            <img :src="CurrentBoiler.image" class="productImage" />
          </div>
          <div class="col-xl-6 col-lg-6">
            <div class="divInformation">
              <span>型號 : </span>
              <span>{{CurrentBoiler.model}}</span>
              <br>
              <span>位置 : </span>
              <span>{{CurrentBoiler.Location}}</span>
              <br>
              <span>負責人 : </span>
              <span>{{CurrentBoiler.charge}}</span>
              <br>
              <span>電話 : </span>
              <span>{{CurrentBoiler.Tel}}</span>
              <br>
              <span>下次維護時間 : </span>
              <span>{{CurrentBoiler.NextMaintain}}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-4 col-lg-6">
        <div class="divBorder">
          <div class="gaugeLabel">爐體溫度</div>
          <div class="chart" ref="chart1"></div>
        </div>
      </div>
      <div class="col-xl-4 col-lg-6">
        <div class="divBorder">
          <div class="gaugeLabel">煙囪溫度</div>
          <div class="chart" ref="chart2"></div>
        </div>
      </div>
    </div>
    <br>
    <div class="row">
      <div class="col-xl-4 col-lg-4">
        <table class="tblBoiler">
          <tr>
            <th>運轉狀態顯示
            </th>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>迴路正常/停止
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>給水泵浦
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>目標到達
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot error"></span>火焰檢測
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>瓦斯閥
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot error"></span>低燃燒
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>高燃燒
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>正常燃燒
            </td>
          </tr>
        </table>
      </div>
      <div class="col-xl-4 col-lg-4">
        <table class="tblBoiler">
          <tr>
            <th>故障警報顯示
            </th>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>低水位
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot error"></span>水位過高
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>風壓異常
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>瓦斯壓力異常
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>蒸氣超壓
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>點火失敗
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot normal"></span>燃燒熄火
            </td>
          </tr>
          <tr>
            <td>
              <span class="icon-dot error"></span>馬達過載
            </td>
          </tr>
        </table>
      </div>
      <div class="col-xl-4 col-lg-4">
        <div class="divBorder">
          <div class="btnAction">
            <button class="btn btn-primary btn-small ml-auto">
              <i class="ion"></i>
              運轉/停止
            </button>
          </div>
          <div class="btnAction">
            <button class="btn btn-primary btn-small ml-auto">
              <i class="ion"></i>
              電鈴切
            </button>
          </div>
          <div class="btnAction">
            <button class="btn btn-primary btn-small ml-auto">
              <i class="ion"></i>
              給水幫浦
            </button>
          </div>
          <div class="btnAction">
            <button class="btn btn-primary btn-small ml-auto">
              <i class="ion"></i>
              低燃燒
            </button>
          </div>
          <div class="btnAction">
            <button class="btn btn-primary btn-small ml-auto">
              <i class="ion"></i>
              高燃燒
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
let self = {}
export default {
  data () {
    return {
      selectedAccount: {},
      accountOptions: [
        {
          name: '1 號鍋爐',
          mail: 'Boiler001'
        },
        {
          name: '2 號鍋爐',
          mail: 'Boiler002'
        },
        {
          name: '3 號鍋爐',
          mail: 'Boiler003'
        },
      ],
      CurrentBoiler: {},
      aBoiler: [],
      model: 'Samson T101',
      chart1: null,
      chart2: null,
      option: {
        backgroundColor: 'transparent',
        series: [
          {
            name: 'Scale',
            type: 'gauge',
            radius: '55%',
            min: 0, // Minimum scale
            max: 16, // Maximum scale
            splitNumber: 8, // Number of ticks
            startAngle: 225,
            endAngle: -45,
            center: ['50%', '58%'],
            axisLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: [[1, 'rgba(0,0,0,0)']]
              }
            },
            // Dashboard axis
            axisLabel: {
              show: true,
              color: '#789789',
              distance: 15,
              formatter: function (v) {
                return self.splitNumber(v)
              }
            },
            // Scale label.
            axisTick: {
              show: true,
              splitNumber: 7,
              lineStyle: {
                color: '#789789',
                width: 1,
              },
              length: -4
            },
            // Scale style
            splitLine: {
              show: true,
              length: -10,
              lineStyle: {
                color: '#789789'
              }
            },

            detail: {
              show: false
            },
            pointer: {
              show: false
            }
          },
          {
            type: 'gauge',
            radius: '90%',
            center: ['50%', '58%'],
            splitNumber: 0, // Number of ticks
            startAngle: 225,
            endAngle: -45,
            axisLine: {
              show: true,
              lineStyle: {
                width: 40,
                color: [
                  [
                    1, '#456456'
                  ]
                ]
              }
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },
            pointer: {
              show: false,
              length: '60%'
            },
            itemStyle: {
              color: '#789789'
            },
            title: {
              show: true,
              offsetCenter: [0, '35%'], // x, y, unit px
              textStyle: {
                color: '#789789',
                fontSize: 20
              }
            },
            // Large value in the middle
            detail: {
              show: true,
              offsetCenter: [0, '0%'],
              color: '#323232',
              formatter: function (params) {
                return params
              },
              textStyle: {
                fontSize: 44
              }
            },
            // unit below
            data: [{
              name: '°C',
              value: 0
            }]
          }
        ]
      },
      maxSpeed: 1000,

      ChartTime: '',
      timLoadDataInterval: 2000,
      resizeTimer: 0
    }
  },
  mounted () {
    self = this
    let oBoiler = {}
    oBoiler.model = 'Samson T101'
    oBoiler.charge = 'Dylan'
    oBoiler.Tel = '#9144'
    oBoiler.Location = 'M01 A-5'
    oBoiler.NextMaintain = '2021/05/15'
    oBoiler.image = require('../assets/img/Turbo.png')
    this.aBoiler.push(oBoiler)
    oBoiler = {}
    oBoiler.model = 'Musi X20'
    oBoiler.charge = 'Iris'
    oBoiler.Tel = '#9132'
    oBoiler.Location = 'M01 A-7'
    oBoiler.NextMaintain = '2021/09/30'
    oBoiler.image = require('../assets/img/BBQ_4697.png')
    this.aBoiler.push(oBoiler)
    oBoiler = {}
    oBoiler.model = 'EQSH-502'
    oBoiler.charge = 'Wunhuei'
    oBoiler.Tel = '#9137'
    oBoiler.Location = 'M01 B-9'
    oBoiler.NextMaintain = '2021/07/01'
    oBoiler.image = require('../assets/img/IMG_0059.jpg')
    this.aBoiler.push(oBoiler)
    this.selectedAccount = this.accountOptions[2]

    self.initChart()
    // Events
    window.addEventListener('resize', self.resizeWindowHandler)
  },
  methods: {
    initChart () {
      // Introduce echart to chart
      self.chart1 = echarts.init(this.$refs.chart1)
      self.chart2 = echarts.init(this.$refs.chart2)
      // get data from api
      self.getData()
    },
    getData () {
      // simulation get data from api.
      setTimeout(() => {
        // data for echart
        let color = ''
        let color1 = new echarts.graphic.LinearGradient(
          0, 1, 1, 0, [{
            offset: 0,
            color: '#79FF79'
          }, {
            offset: 1,
            color: '#A8FF24'
          }])
        let color2 = new echarts.graphic.LinearGradient(
          0, 1, 1, 0, [{
            offset: 0,
            color: '#79FF79'
          }, {
            offset: 0.5,
            color: '#A8FF24'
          }, {
            offset: 1,
            color: '#FFD306	'
          }])
        let color3 = new echarts.graphic.LinearGradient(
          0, 1, 1, 0, [{
            offset: 0,
            color: '#79FF79'
          }, {
            offset: 0.5,
            color: '#FFD306	'
          }, {
            offset: 1,
            color: '#FF2D2D'
          }])
        let radius1 = Math.floor(Math.random() * this.maxSpeed) / this.maxSpeed.toFixed(2)
        // let radius = 0.9
        if (radius1 <= 0.1) {
          color = color1
        } else if (radius1 > 0.1 && radius1 <= 0.4) {
          color = color2
        } else {
          color = color3
        }
        self.option.series[1].axisLine.lineStyle.color[0] = [radius1, color]
        self.option.series[1].axisLine.lineStyle.color[1] = [1, '#ebe8ed']
        self.option.series[1].data[0].value = radius1 * this.maxSpeed

        // Prepare all thel data, and pass it to the chart.
        if (self.chart1) self.chart1.setOption(self.option)

        let radius2 = Math.floor(Math.random() * this.maxSpeed) / this.maxSpeed.toFixed(2)
        // let radius = 0.9
        if (radius2 <= 0.1) {
          color = color1
        } else if (radius2 > 0.1 && radius2 <= 0.4) {
          color = color2
        } else {
          color = color3
        }
        self.option.series[1].axisLine.lineStyle.color[0] = [radius2, color]
        self.option.series[1].axisLine.lineStyle.color[1] = [1, '#ebe8ed']
        self.option.series[1].data[0].value = radius2 * this.maxSpeed

        // Prepare all thel data, and pass it to the chart.
        if (self.chart2) self.chart2.setOption(self.option)

        self.ChartTime = setTimeout(function () {
          self.getData()
        }, self.timLoadDataInterval)
      }, 1000)
    },

    resizeWindowHandler () {
      let that = this
      clearTimeout(self.resizeTimer)
      self.resizeTimer = setTimeout(function () {
        if (that.chart) {
          that.chart.resize()
        }
      }, 800)
    },
    splitNumber (v) {
      switch (v + '') {
        case '0' : return self.maxSpeed / 16 * 0
        case '4' : return self.maxSpeed / 16 * 4
        case '8' : return self.maxSpeed / 16 * 8
        case '12' : return self.maxSpeed / 16 * 12
        case '16' : return self.maxSpeed / 16 * 16
      }
    }
  },
  watch: {
    selectedAccount (val) {
      switch (val.mail) {
        case 'Boiler001':
          this.CurrentBoiler = this.aBoiler[0]
          break
        case 'Boiler002':
          this.CurrentBoiler = this.aBoiler[1]
          break
        case 'Boiler003':
          this.CurrentBoiler = this.aBoiler[2]
          break
        default:
          this.CurrentBoiler = this.aBoiler[0]
          break
      }
    },
  },
  beforeDestroy () {
    self.chart1 = null
    self.chart2 = null
    window.removeEventListener('resize', self.resizeWindowHandler)
  }
}
</script>

<style lang="scss">
.TemplateBoiler {
  padding-top: 1rem;
  .divInformation{
    height: 100%;
    padding-top: 8rem;
    color: darkgray;
    font-size: 1.2rem;;
  }
  .chart {
    margin-top: -36px;
  }
  .productImage{
    height: 300px;
  }
  .row {
    margin-right: 0px;
    margin-left: 0px;
  }
  .btn {
    background-color: darkcyan;
    color: #ffffff;
    display: inline;
  }
  .divBorder{
    border: 1px solid #ddd;
  }
  .chart{
    width: 100%;
    height: 300px;
  }
  .gaugeLabel {
    text-align: center;
    font-size: x-large;
    color: darkgray;
  }
  .icon-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: inline-block;
    margin-bottom: -1px;
    margin-right: 5px;
  }
  .normal {
    background-color: #38a277;
  }
  .error {
    background-color: #8b3749;
  }
  .tblBoiler {
    font-size: 16px;
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
  }
  .tblBoiler th {
      padding-top: 11px;
      padding-bottom: 11px;
      background-color: #4CAF50;
      color: white;
      text-align: center;
  }
  .tblBoiler td {
    border: 1px solid #ddd;
    text-align: left;
    padding: 8px;
  }
  .btnAction{
    text-align: center;
    padding: 1rem;
  }
}
</style>
