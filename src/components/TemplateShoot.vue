 <template>
  <div class="sampleWidget">
		<div class="row mb-4">
			<div class="col-2 tab-button" :class="{'active': selectId === 0}" @click="chagneTab(0)">
				機械式微電腦控制器
			</div>
			<div class="col-2 tab-button" :class="{'active': selectId === 1}" @click="chagneTab(1)">
				射出機微電腦控制器
			</div>
		</div>
    <div class="row mb-5">
      <div class="col-sm-12 col-md-6 col-xl-4 col-xxl-4">
				<vuestic-widget
					class="widget-customized__widget info-widget"
					headerText="機械式微電腦控制器"
					:moreIcon="false"
				>
					<div class="row">
						<div class="col-md-6">
							<img :src="data[selectId].img" />
						</div>
						<div class="col-md-6 m-auto">
							<div class="mb-3">
								<span>型號: </span> {{data[selectId].type}}
							</div>
							<div class="mb-3">
								<span>位置: </span> {{data[selectId].position}}
							</div>
							<div class="mb-3">
								<span>負責人: </span> {{data[selectId].person}}
							</div>
							<div class="mb-3">
								<span>分機: </span> {{data[selectId].tel}}
							</div>
						</div>
					</div>
				</vuestic-widget>
      </div>
      <div class="col-sm-12 col-md-6 col-xl-4 col-xxl-4">
        <gauage unit="kg"/>
				<div class="title center">壓力</div>
      </div>
      <div class="col-sm-12 col-md-6 col-xl-4 col-xxl-4">
        <gauage />
				<div class="title center">速度</div>
      </div>
    </div>
		<div class="row">
			<div class="col-sm-12 col-md-6 col-xl-4 col-xxl-4">
				<div class="title mb-2">運轉狀態: </div>
				<div class="row justify-content-end mb-3">
					<div class="col-sm-12 col-md-6 col-xl-3 col-xxl-3 center">
						<i class="icon-dot" :class="data[selectId].d1s"/>
						<div>{{data[selectId].d1}}</div>
					</div>
					<div class="col-sm-12 col-md-6 col-xl-3 col-xxl-3 center">
						<i class="icon-dot" :class="data[selectId].d2s"/>
						<div>{{data[selectId].d2}}</div>
					</div>
					<div class="col-sm-12 col-md-6 col-xl-3 col-xxl-3 center">
						<i class="icon-dot" :class="data[selectId].d3s"/>
						<div>{{data[selectId].d3}}</div>
					</div>
				</div>
					<button	class="btn btn-primary mb-3">手動</button>
					<button	class="btn btn-primary mb-3">半自動</button>
					<button	class="btn btn-primary mb-3">自動</button>
			</div>
			<div class="col-sm-12 col-md-6 col-xl-8 col-xxl-8">
				<div class="title mb-2">運轉詳細資料: </div>
				<table>
					<tbody>
						<tr>
							<td class="title">設定時間</td>
							<td>0000.0S</td>
							<td class="title">設定位置</td>
							<td>0000.0</td>
							<td class="title">運轉時間</td>
							<td>0000.0S</td>
							<td class="title">運轉位置</td>
							<td>0000.0</td>
							<td class="title">全程時間</td>
							<td>0000.0S</td>
						</tr>
						<tr>
							<td class="title">上模全程</td>
							<td>0000.0</td>
							<td class="title">合模時間</td>
							<td>0000.0S</td>
							<td class="title">加料運轉</td>
							<td>0000.0</td>
							<td class="title">開模時間</td>
							<td>0000.0S</td>
							<td class="title">不良品</td>
							<td>0000.0</td>
						</tr>
						<tr>
							<td class="title">射料時間</td>
							<td>0000.0S</td>
							<td class="title">包裝量</td>
							<td>0000.0</td>
							<td class="title">加料時間</td>
							<td>0000.0S</td>
							<td class="title">總產量</td>
							<td>0000.0</td>
							<td class="title">總增值產額</td>
							<td>0000.0</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
  </div>
</template>

<script>
import gauage from './sampleComponent/gauage'
export default {
  name: 'sampleWidget',
  data () {
    return {
      selectId: 0,
      data: [{
        type: 'CE205T',
        img: 'https://advdownload.advantech.com/productfile/PIS/UNO-1251G/Product%20-%20Photo(Main)/UNO-1251G_1_S20160401103900.png',
        position: 'M廠一樓 303室',
        person: 'Jason',
        tel: '#9120',
        d1: '機台 U-170',
        d1s: 'connected',
        d2: '機台 TUX-550',
        d2s: 'disconnected',
        d3: '機台 RD-640',
        d3s: 'abnormal',
      }, {
        type: 'CE205B',
        img: 'https://advdownload.advantech.com/productfile/PIS/UNO-3075G/Product%20-%20Photo(Main)/UNO-3075G_S20140221114520.png',
        position: 'E廠五樓 508室',
        person: 'kelly',
        tel: '#5858',
        d1: '機台 ER-584',
        d1s: 'disconnected',
        d2: '機台 AU-770',
        d2s: 'abnormal',
        d3: '機台 PD-940',
        d3s: 'connected',
      }]
    }
  },
  components: {
    gauage
  },
  mounted () {
  },
  methods: {
    chagneTab (id) {
      this.selectId = id
    }
  },
  destroyed () {
  }
}
</script>

<style lang="scss">
.sampleWidget {
	margin: 30px;
	.tab-button {
		text-align: center;
		font-size: 25px;
		font-weight: bold;
		cursor: pointer;
		&.active {
			color: #9e3398;
			border-bottom: 1px solid;
		}
	}
  .widgetBody {
    min-height: 10rem;
  }
	.vuestic-widget-body {
		height: 100%;
	}
	.icon-dot {
		width: 50px;
    height: 50px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.6);
	}
	table {
		border: 3px dashed #9e3398;
		margin: auto;
		tr td{
			padding: 15px;
			border: 1px solid #9e3398;
			&.title {
				background-color: #f5d5ea;
			}
		}
	}
}
</style>
