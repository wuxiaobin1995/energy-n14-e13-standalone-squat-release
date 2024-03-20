<!--
 * @Author      : Mr.bin
 * @Date        : 2024-03-20 08:41:09
 * @LastEditTime: 2024-03-20 11:38:15
 * @Description : 肌耐力训练-具体测量
-->
<template>
  <div class="train-endurance-measure">
    <div class="wrapper">
      <div class="title">肌耐力训练</div>

      <div class="main">
        <!-- 图形 -->
        <div class="chart">
          <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
        </div>

        <!-- 实时次数和组数 -->
        <div class="num">
          <div class="item">
            <div class="text">训练次数</div>
            <div class="value">{{ nowNum }}/{{ num }}</div>
          </div>
          <div class="item">
            <div class="text">训练组数</div>
            <div class="value">{{ nowGroups }}/{{ groups }}</div>
          </div>
        </div>
      </div>

      <div class="btn">
        <el-button class="item" type="primary" @click="handleStart"
          >开 始</el-button
        >
        <el-button class="item" type="danger" @click="handleBack"
          >返回上一页</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-endurance-measure',

  data() {
    return {
      /* 路由传参 */
      num: JSON.parse(this.$route.query.num), // 训练次数
      groups: JSON.parse(this.$route.query.groups), // 训练组数
      groupRestTime: JSON.parse(this.$route.query.groupRestTime), // 组间休息时长
      weight: JSON.parse(this.$route.query.weight), // 实际配重（kg）
      type: JSON.parse(this.$route.query.type),
      routerName: JSON.parse(this.$route.query.routerName),

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [],

      /* 参考曲线相关 */
      standardArray: [], // 基础参考曲线
      bgArray: [], // 参考曲线，暂定5个一组

      /* 其他 */
      nowNum: 0, // 实时次数
      nowGroups: 0, // 实时组数

      restDialogVisible: false, // 休息倒计时弹窗
      restTimeClock: null, // 休息计时器
      nowGroupRestTime: JSON.parse(this.$route.query.groupRestTime) // 实时休息时间倒计时
    }
  },

  created() {},
  mounted() {
    this.countChart().then(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    // // 清除计时器
    // if (this.restTimeClock) {
    //   clearInterval(this.restTimeClock)
    // }
    // // 关闭串口
    // if (this.usbPort) {
    //   if (this.usbPort.isOpen) {
    //     this.usbPort.close()
    //   }
    // }
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: this.routerName
      })
    },

    /**
     * @description: 开始
     */
    handleStart() {},

    /**
     * @description: 计算图形所需参数逻辑函数
     */
    countChart() {
      return new Promise((resolve, reject) => {
        const targetUp = this.$store.state.currentUserInfo.angularRange
          ? this.$store.state.currentUserInfo.angularRange
          : 50 // 上限
        const targetDown = 0 // 下限
        const intervalTime = 2 // 间隔时长

        const interval = parseFloat(
          ((targetUp - targetDown) / (intervalTime * 10)).toFixed(3)
        ) // 间隔值

        this.standardArray.push(targetDown)
        let sum = targetDown
        for (let i = 0; i < intervalTime * 10 - 1; i++) {
          sum = sum + interval
          this.standardArray.push(sum)
        }
        sum = targetUp
        for (let i = 0; i < intervalTime * 10; i++) {
          this.standardArray.push(sum)
          sum = sum - interval
        }
        for (let i = 0; i < 5; i++) {
          this.bgArray.push(...this.standardArray)
        }
        this.bgArray.push(targetDown)

        /* x轴 */
        this.xData = []
        for (let i = 0; i < this.bgArray.length; i++) {
          this.xData.push(parseFloat((i * 0.1).toFixed(1)))
        }

        resolve()
      })
    },

    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '秒',
          data: this.xData,
          boundaryGap: false // 从0点开始
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false // 隐藏背景网格线
          },
          min: this.targetDown - 10 >= 0 ? this.targetDown - 10 : 0,
          max: this.targetUp + 10 <= 100 ? this.targetUp + 10 : 100
        },
        legend: {},
        series: [
          {
            name: '单组轨迹',
            data: [],
            color: 'red',
            type: 'line',
            smooth: true,
            showSymbol: false
          },
          {
            name: `参考曲线`,
            data: this.bgArray,
            color: 'rgba(0, 255, 0, 0.5)',
            type: 'line',
            smooth: false,
            showSymbol: false
          }
        ],
        animation: false
      }
      this.myChart.setOption(this.option)
    }
  }
}
</script>

<style lang="scss" scoped>
.train-endurance-measure {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 94%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 40px;
    @include flex(column, stretch, stretch);

    .title {
      font-size: 34px;
    }

    .main {
      flex: 1;
      .chart {
        width: 100%;
        height: 400px;
      }
    }
  }
}
</style>
