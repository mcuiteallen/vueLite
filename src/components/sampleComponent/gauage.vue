 <template>
  <div>
    <div class="chart" ref="chart"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
let self = {}
export default {
  props: {
    unit: {
      type: String,
      default: 'Mbps'
    }
  },
  data () {
    return {
      chart: null,
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
              name: this.unit,
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
    this.initChart()
    // Events
    window.addEventListener('resize', this.resizeWindowHandler)
  },
  methods: {
    initChart () {
      // Introduce echart to chart
      this.chart = echarts.init(this.$refs.chart)

      // get data from api
      this.getData()
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
        let radius = Math.floor(Math.random() * this.maxSpeed) / this.maxSpeed.toFixed(2)
        // let radius = 0.9
        if (radius <= 0.1) {
          color = color1
        } else if (radius > 0.1 && radius <= 0.4) {
          color = color2
        } else {
          color = color3
        }
        this.option.series[1].axisLine.lineStyle.color[0] = [radius, color]
        this.option.series[1].axisLine.lineStyle.color[1] = [1, '#ebe8ed']
        this.option.series[1].data[0].value = radius * this.maxSpeed

        // Prepare all thel data, and pass it to the chart.
        if (this.chart) this.chart.setOption(this.option)

        let that = this
        this.ChartTime = setTimeout(function () {
          that.getData()
        }, this.timLoadDataInterval)
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
  beforeDestroy () {
    self.chart = null
    window.removeEventListener('resize', self.resizeWindowHandler)
  }
}
</script>

<style lang="scss">
  .chart{
    width: 100%;
    height: 280px;
  }
</style>
