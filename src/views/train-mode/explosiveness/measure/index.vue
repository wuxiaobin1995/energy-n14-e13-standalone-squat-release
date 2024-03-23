<!--
 * @Author      : Mr.bin
 * @Date        : 2024-03-20 08:41:09
 * @LastEditTime: 2024-03-23 10:10:37
 * @Description : 爆发力训练-具体测量
-->
<template>
  <div class="train-explosiveness-measure">
    <div class="wrapper">
      <div class="title">爆发力训练</div>

      <div class="main">
        <!-- 图形 -->
        <div class="chart">
          <div id="chart1" :style="{ width: '48%', height: '100%' }"></div>
          <div id="chart2" :style="{ width: '48%', height: '100%' }"></div>
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
            <div class="value">{{ weight }}</div>
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

/* 数据计算方法 */
import { calculateData } from '../utils/calculate-data.js'

export default {
  name: 'train-explosiveness-measure',

  data() {
    return {
      /* 路由传参 */
      num: JSON.parse(this.$route.query.num), // 训练次数
      groups: JSON.parse(this.$route.query.groups), // 训练组数
      groupRestTime: JSON.parse(this.$route.query.groupRestTime), // 组间休息时长
      weight: JSON.parse(this.$route.query.weight), // 实际配重（kg）
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

      isUp: false, // 开始上升
      isOneNum: false, // 完成一次

      /* 图形相关变量 */
      myChart1: null,
      option1: {},
      myChart2: null,
      option2: {},

      /* 其他 */
      nowNum: 0, // 实时次数
      nowGroups: 0, // 实时组数

      restDialogVisible: false, // 休息倒计时弹窗
      restTimeClock: null, // 休息计时器
      nowGroupRestTime: JSON.parse(this.$route.query.groupRestTime), // 实时休息时间倒计时

      angleArray: [], // 角度数组
      angularVelocityArray: [], // 角速度数组
      explosivenessVal: 0, // 爆发力指标（峰值功率[W]）
      maxAngularVelocity: 0 // 峰值角速度[rad/s]
    }
  },

  created() {
    this.initSerialPort() // 初始化SerialPort串口

    this.initDll() // 初始化dll实例
  },
  mounted() {
    this.initChart()
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
      this.isUp = true

      // 初始化端口
      const comNum = parseInt(this.comPath.split('M')[1])
      const initDll = this.myAddDll.serial_init(comNum, 115200, 1024)

      let angularRangeArrayLinShi = []
      let angularRange = 0 // 实时角度
      let isSaveCount = 0 // 用于灵敏度
      let isSafeSwitchClose = 0 // 用于安全
      if (initDll) {
        this.setTimer = setInterval(() => {
          /* 是否休息 */
          if (this.isRest === false) {
            const res1 = this.myAddDll.Device_receive_data(80, 1) // 绕X轴角度
            const res3 = this.myAddDll.Device_receive_data(80, 7) // 绕X轴角速度

            /* 数据预处理 */
            // 实时角度[°]，去掉后面2位才是角度值
            const angle = parseInt((res1 / 100).toFixed(0))
            // 角速度[rad/s]，°/s换成弧度单位rad/s
            const angularVelocity = parseFloat(
              Math.abs((res3 / (Math.PI * 2)).toFixed(2))
            )

            if (angularRangeArrayLinShi.length != 10) {
              angularRangeArrayLinShi.push(angle)
            }
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

            /* 安全开关，长时间无动作自动返回上一页 */
            if (angularVelocity === 0) {
              isSafeSwitchClose += 1
            } else {
              isSafeSwitchClose = 0
            }
            /* 连续30分钟无动作，则自动关闭串口连接 */
            if (isSafeSwitchClose >= 18000) {
              isSafeSwitchClose = 0
              this.$message({
                message: '警告，检测到您连续30分钟内均没有动作，自动退出训练！',
                type: 'warning',
                duration: 5000
              })
              this.handleBack()
            }

            /* 过滤掉角速度 = 0rad/s 的数据 */
            if (angularVelocity > 0) {
              this.angleArray.push(angularRange)
              this.angularVelocityArray.push(angularVelocity)
            }

            /* 开始点 */
            if (this.isUp) {
              if (this.angleArray.length >= 2) {
                const angle1 = this.angleArray[this.angleArray.length - 2]
                const angle2 = this.angleArray[this.angleArray.length - 1]
                // 开始往上
                if (angle2 - angle1 > 0) {
                  this.isUp = false

                  this.angleArray = []
                  this.angularVelocityArray = []

                  this.isOneNum = true
                }
              }
            }

            /* 正在往上运动 */
            if (this.isOneNum) {
              if (this.angleArray.length >= 2) {
                const angle1 = this.angleArray[this.angleArray.length - 2]
                const angle2 = this.angleArray[this.angleArray.length - 1]
                if (angle2 - angle1 <= 0) {
                  isSaveCount += 1
                  /* 完成一次 */
                  if (isSaveCount === 5) {
                    this.isOneNum = false

                    this.nowNum += 1 // 实时次数+1

                    /* 调用数据计算方法，算出结果 */
                    const calculateDataResult = calculateData(
                      this.angularVelocityArray, // 角速度数组
                      parseFloat(((this.weight / 0.73) * 1.7).toFixed(0)) // 传感器所在点的负重
                    )
                    this.explosivenessVal = calculateDataResult.maxPower // 爆发力指标（峰值功率[W]）
                    this.maxAngularVelocity =
                      calculateDataResult.maxAngularVelocity // 峰值角速度[rad/s]

                    /* 渲染图形 */
                    this.option1.series[0].data = [this.explosivenessVal]
                    this.myChart1.setOption(this.option1)
                    this.option2.series[0].data = [this.maxAngularVelocity]
                    this.myChart2.setOption(this.option2)

                    this.angleArray = []
                    this.angularVelocityArray = []

                    this.isUp = true
                    isSaveCount = 0
                  }
                }
              }
            }

            /* 完成一组 */
            if (this.nowNum === this.num) {
              this.nowGroups += 1 // 实时组数+1
              // 休息弹窗
              if (this.nowGroups < this.groups) {
                this.onRestDialog()
              }
            }

            /* 训练完成 */
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
     * @description: 初始化echarts图形
     */
    initChart() {
      this.myChart1 = this.$echarts.init(document.getElementById('chart1'))
      this.myChart2 = this.$echarts.init(document.getElementById('chart2'))
      this.option1 = {
        title: {
          text: '峰值功率',
          subtext: '单位：W'
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar',
            data: [0],
            color: 'green',
            label: {
              show: true,
              position: 'outside'
            }
          }
        ],
        animation: true
      }
      this.option2 = {
        title: {
          text: '峰值角速度',
          subtext: '单位：rad/s'
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar',
            data: [0],
            color: 'blue',
            label: {
              show: true,
              position: 'outside'
            }
          }
        ],
        animation: true
      }
      this.myChart1.setOption(this.option1)
      this.myChart2.setOption(this.option2)
    },

    /**
     * @description: 训练完成，并返回上一页
     */
    handleFinish() {
      this.$message({
        message: '训练结束',
        type: 'success',
        duration: 5000
      })
      this.handleBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.train-explosiveness-measure {
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
      margin-bottom: 10px;
    }

    .main {
      flex: 1;
      @include flex(row, space-between, stretch);
      .chart {
        flex: 1;
        @include flex(row, space-around, stretch);
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
