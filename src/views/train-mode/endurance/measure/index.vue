<!--
 * @Author      : Mr.bin
 * @Date        : 2024-03-20 08:41:09
 * @LastEditTime: 2024-03-26 11:39:21
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
          <div class="item">
            <div class="text">负重kg</div>
            <div class="value">{{ counterWeight }}</div>
          </div>
        </div>
      </div>

      <div class="btn">
        <el-button
          class="item"
          type="primary"
          :disabled="isStart"
          @click="handleStart"
          >开 始</el-button
        >
        <el-button class="item" type="danger" @click="handleBack"
          >返回上一页</el-button
        >
      </div>

      <!-- 休息倒计时弹窗 -->
      <el-dialog
        title="休 息 倒 计 时"
        :visible.sync="restDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        top="30vh"
        width="20%"
        center
      >
        <div class="rest-dialog">
          <div class="item">{{ nowGroupRestTime }}</div>
        </div>
        <span slot="footer">
          <el-button type="primary" @click="handleSkip">跳 过</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

/* 串口通信库 */
import SerialPort from 'serialport'

/* dll调用库 */
import ffi from 'ffi-napi'

/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'train-endurance-measure',

  data() {
    return {
      /* 路由传参 */
      num: JSON.parse(this.$route.query.num), // 训练次数
      groups: JSON.parse(this.$route.query.groups), // 训练组数
      groupRestTime: JSON.parse(this.$route.query.groupRestTime), // 组间休息时长
      counterWeight: JSON.parse(this.$route.query.counterWeight), // 实际配重（kg）
      type: JSON.parse(this.$route.query.type),
      routerName: JSON.parse(this.$route.query.routerName),

      comPath: '', // 端口号
      setTimer: null, // 计时器
      myAddDll: null, // dll实例
      // dll路径
      dllSrc:
        process.env.NODE_ENV === 'production'
          ? path
              .join(__static, 'dll/controller.dll')
              .replace('app.asar', 'app.asar.unpacked')
          : path.join(__static, 'dll/controller.dll'),

      /* 状态标志位 */
      isStart: false, // 是否开始训练
      isRest: false, // 是否处于休息状态

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
      nowGroupRestTime: JSON.parse(this.$route.query.groupRestTime), // 实时休息时间倒计时

      nowNumArray: [], // 用于计算剩余次数的数组
      angularRangeArray: [], // 一组实时角度数组
      showAngularRangeArray: [], // 展示的实时角度数组
      allAngularRangeArray: [], // 完整数据数组
      pdfTime: '' // 测量日期
    }
  },

  created() {
    this.initSerialPort() // 初始化SerialPort串口

    this.initDll() // 初始化dll实例
  },
  mounted() {
    this.countChart().then(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (this.setTimer) {
      window.clearInterval(this.setTimer)
    }
    // 清除休息计时器
    if (this.restTimeClock) {
      clearInterval(this.restTimeClock)
    }
    // 关闭端口
    const colseResult = this.myAddDll.close_serial(1)
    if (colseResult) {
      this.$notify({
        title: '通知',
        message: 'DLL端口关闭成功',
        type: 'success',
        position: 'bottom-right',
        duration: 2500
      })
    }
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
     * @description: 初始化dll实例
     */
    initDll() {
      this.myAddDll = ffi.Library(this.dllSrc, {
        serial_init: ['bool', ['int', 'int', 'int']], // 初始化端口函数
        Device_receive_data: ['int', ['int', 'int']], // 取数函数
        close_serial: ['bool', ['int']] // 关闭端口函数
      })
    },

    /**
     * @description: 初始化SerialPort串口方法
     */
    initSerialPort() {
      /**
       * @description: SerialPort.list()返回Promise
       * @param {Array[Object]} ports 所有串口的基本信息
       */
      SerialPort.list()
        .then(ports => {
          /* 遍历设备的USB串口，目标设备需安装驱动 */
          this.comPath = ''
          for (const port of ports) {
            if (/^USB/.test(port.pnpId)) {
              this.comPath = port.path
              break
            }
          }

          /* 验证USB有没有连接到电脑，但不能验证有无数据发送给上位机 */
          if (this.comPath) {
          } else {
            this.$alert(
              `请点击"返 回"按钮，然后重新测量！`,
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                center: true,
                confirmButtonText: '返 回',
                callback: () => {
                  this.handleBack()
                }
              }
            )
          }
        })
        .catch(err => {
          this.$alert(
            `${err}。请点击"返 回"按钮，然后重新测量！`,
            '初始化SerialPort.list失败',
            {
              type: 'error',
              showClose: false,
              center: true,
              confirmButtonText: '返 回',
              callback: () => {
                this.handleBack()
              }
            }
          )
        })
    },

    /**
     * @description: 开始
     */
    handleStart() {
      this.isStart = true

      // 初始化端口
      const comNum = parseInt(this.comPath.split('M')[1])
      const initDll = this.myAddDll.serial_init(comNum, 115200, 1024)

      let angularRangeArrayLinShi = []
      let angularRange = 0 // 实时角度，用于绘制轨迹曲线
      if (initDll) {
        this.setTimer = setInterval(() => {
          /* 是否休息 */
          if (this.isRest === false) {
            const res1 = this.myAddDll.Device_receive_data(80, 1) // 绕X轴角度

            /* 数据预处理 */
            // 实时角度[°]，去掉后面2位才是角度值
            const angle = parseInt((res1 / 100).toFixed(0))

            /* 数据计算，传感器有正负 */
            angularRangeArrayLinShi.push(angle)
            if (angularRangeArrayLinShi[0] >= 0) {
              if (angle >= 0) {
                angularRange = angle - angularRangeArrayLinShi[0]
              } else {
                angularRange = 360 + angle - angularRangeArrayLinShi[0]
              }
            } else {
              if (angle >= 0) {
                angularRange = angle + angularRangeArrayLinShi[0]
              } else {
                angularRange = angle - angularRangeArrayLinShi[0]
              }
            }

            this.nowNumArray.push(angularRange) // 用于计算剩余次数的数组
            this.angularRangeArray.push(angularRange) // 完整实时角度数组
            this.showAngularRangeArray.push(angularRange) // 展示的实时角度数组

            // 渲染图形
            this.option.series[0].data = this.showAngularRangeArray
            this.myChart.setOption(this.option)

            // 曲线走到末尾，清空一下展示数组
            if (this.showAngularRangeArray.length === this.bgArray.length) {
              this.showAngularRangeArray = []
            }

            // 完成一次
            if (this.nowNumArray.length === this.standardArray.length) {
              this.nowNumArray = []
              this.nowNum += 1 // 实时次数+1
            }

            // 完成一组
            if (
              this.angularRangeArray.length ===
              this.num * this.standardArray.length
            ) {
              this.allAngularRangeArray.push(...this.angularRangeArray)

              this.nowNumArray = []
              this.angularRangeArray = []
              this.showAngularRangeArray = []
              this.nowGroups += 1 // 实时组数+1

              // 休息弹窗
              if (this.nowGroups < this.groups) {
                this.onRestDialog()
              }
            }

            /* 训练完成，保存数据 */
            if (this.nowGroups === this.groups) {
              this.handleFinish()
            }
          }
        }, 100)
      } else {
        this.$alert(`请点击"返 回"按钮，然后重新测量！`, 'DLL调用失败', {
          type: 'error',
          showClose: false,
          center: true,
          confirmButtonText: '返 回',
          callback: () => {
            this.handleBack()
          }
        })
      }
    },

    /**
     * @description: 休息倒计时弹窗函数
     */
    onRestDialog() {
      // 进入休息状态，标志位置true
      this.isRest = true

      // 清一下实时次数
      this.nowNum = 0

      // 开启弹窗
      this.restDialogVisible = true

      // 初始化倒计时长
      this.nowGroupRestTime = this.groupRestTime

      // 开始倒计时
      this.restTimeClock = setInterval(() => {
        this.nowGroupRestTime -= 1
        if (this.nowGroupRestTime === 0) {
          this.handleSkip()
        }
      }, 1000)
    },
    /**
     * @description: 跳过休息按钮
     */
    handleSkip() {
      // 休息结束，标志位置false
      this.isRest = false

      // 清除休息计时器
      if (this.restTimeClock) {
        clearInterval(this.restTimeClock)
      }

      // 关闭弹窗
      this.restDialogVisible = false
    },

    /**
     * @description: 计算图形所需参数逻辑函数
     */
    countChart() {
      return new Promise((resolve, reject) => {
        const targetUp = this.$store.state.currentUserInfo.angularRange
          ? this.$store.state.currentUserInfo.angularRange
          : 50 // 上限
        const targetDown = 0 // 下限
        const intervalTime = 2 // 间隔时长s

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
          min: 0
        },
        series: [
          {
            name: '轨迹曲线',
            data: this.angularRangeArray,
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
    },

    /**
     * @description: 训练完成，保存数据
     */
    handleFinish() {
      if (this.setTimer) {
        window.clearInterval(this.setTimer)
      }

      /* 计算完成度 */
      const contrastArray = []
      for (let i = 0; i < this.groups; i++) {
        contrastArray.push(...this.bgArray)
      }
      const yesArray = []
      for (let i = 0; i < this.allAngularRangeArray.length; i++) {
        const item = this.allAngularRangeArray[i]
        const contrast = contrastArray[i]
        const differenceVal = Math.abs(item - contrast)
        if (differenceVal >= 0 && differenceVal <= 5) {
          yesArray.push(differenceVal)
        }
      }
      const completion = parseFloat(
        ((yesArray.length / this.allAngularRangeArray.length) * 100).toFixed(0)
      )

      /* 保存到数据库 */
      this.pdfTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      const db = initDB()
      db.train_data
        .add({
          userId: this.$store.state.currentUserInfo.userId,
          userName: this.$store.state.currentUserInfo.userName,
          sex: this.$store.state.currentUserInfo.sex,
          height: this.$store.state.currentUserInfo.height,
          weight: this.$store.state.currentUserInfo.weight,
          birthday: this.$store.state.currentUserInfo.birthday,

          num: this.num, // 训练次数
          groups: this.groups, // 训练组数
          groupRestTime: this.groupRestTime, // 组间休息时长
          counterWeight: this.counterWeight, // 实际配重（kg）

          standardArray: this.standardArray, // 基础参考曲线
          allAngularRangeArray: this.allAngularRangeArray, // 完整实时角度数组

          completion: completion, // 完成度%

          pdfTime: this.pdfTime,

          type: this.type
        })
        .then(() => {
          this.$message({
            message: '数据保存成功',
            type: 'success',
            duration: 1500
          })
          this.handleBack()
        })
        .catch(() => {
          this.$alert(`请点击"返 回"按钮，然后重新测量！`, '数据保存失败', {
            type: 'error',
            showClose: false,
            center: true,
            confirmButtonText: '返 回',
            callback: () => {
              this.handleBack()
            }
          })
        })
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
      @include flex(row, space-between, stretch);
      .chart {
        flex: 1;
      }
      .num {
        @include flex(column, center, stretch);
        padding: 0 20px;
        .item {
          font-size: 24px;
          @include flex(column, center, center);
          margin: 20px 0;
          .text {
            margin-bottom: 12px;
          }
          .value {
            @include flex(row, center, center);
            padding: 4px 0;
            border: 1px solid black;
            border-radius: 5px;
            width: 100px;
            background-color: rgb(216, 216, 216);
          }
        }
      }
    }

    .btn {
      @include flex(row, center, center);
      .item {
        font-size: 28px;
        margin: 0 40px;
      }
    }

    .rest-dialog {
      @include flex(column, center, center);
      .item {
        font-size: 90px;
        font-weight: 700;
        color: green;
      }
    }
  }
}
</style>
