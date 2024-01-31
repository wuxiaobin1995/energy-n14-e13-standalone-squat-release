<!--
 * @Author      : Mr.bin
 * @Date        : 2024-01-31 16:52:11
 * @LastEditTime: 2024-01-31 17:04:56
 * @Description : 设置运动角度范围（用于确定训练模块的最大值）
-->
<template>
  <div class="set-angularRange">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="设置运动角度范围"
        @back="handleToHome"
      ></el-page-header>

      <!-- 文字说明 -->
      <div class="text">
        PS：为设置训练任务，每次开始训练前，请确认训练开始位置后，点击“开始”，蹲起到最大角度范围后回到开始位置。
      </div>

      <!-- 运动角度范围结果 -->
      <div class="result">
        结果(°)：<span class="value">{{
          angularRange ? angularRange : '待测'
        }}</span>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button
          class="item"
          type="primary"
          :disabled="!startAllow"
          @click="handleStart"
          >开 始</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷 新</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'set-angularRange',

  data() {
    return {
      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 其他 */
      startAllow: true, // 开始按钮的禁用与否
      angularRangeArray: [], // 完整的角度范围数组
      angularRange: '' // 运动角度范围结果
    }
  },

  created() {
    this.initSerialPort()
  },
  beforeDestroy() {
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
    }
  },

  methods: {
    /**
     * @description: 回到首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    },

    /**
     * @description: 初始化串口对象
     */
    initSerialPort() {
      SerialPort.list()
        .then(ports => {
          /* 遍历设备的USB串口，目标设备需安装驱动 */
          let comPath = ''
          for (const port of ports) {
            if (/^USB/.test(port.pnpId)) {
              comPath = port.path
              break
            }
          }

          /* 验证USB有没有连接到电脑，但不能验证有无数据发送给上位机 */
          if (comPath) {
            /**
             * @description: 创建串口实例
             * @param {String} comPath 串行端口的系统路径。例如：在Mac、Linux上的/dev/tty.XXX或Windows上的COM1
             * @param {Object} 配置项
             */
            this.usbPort = new SerialPort(comPath, {
              baudRate: this.scmBaudRate, // 默认波特率115200
              autoOpen: false // 是否自动开启串口
            })
            /* 调用 this.usbPort.open() 成功时触发（开启串口成功） */
            this.usbPort.on('open', () => {})
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$alert(
                `请重新连接USB线，然后点击"刷新页面"按钮！`,
                '串口开启失败',
                {
                  type: 'error',
                  showClose: false,
                  center: true,
                  confirmButtonText: '刷新页面',
                  callback: () => {
                    this.handleRefresh()
                  }
                }
              )
            })

            this.parser = this.usbPort.pipe(new Readline({ delimiter: '\n' }))
            this.parser.on('data', data => {
              // console.log(data) // {String} 00326740032826,125

              const dataArray = data.split(',') // 将原始数据以逗号作为分割符，组成一个数组
              // const weightDigital = dataArray[0] // 负重数字量，比如00327640032720
              const distancePulse = dataArray[1] // 位移脉冲量

              /* 计算拉绳位移值，有正负，精确到1mm */
              const distance = parseFloat(
                (parseInt(distancePulse) * 1).toFixed(0)
              )
              /* 数据校验 */
              if (!isNaN(distance)) {
                this.angularRangeArray.push(distance) // 完整的角度范围数组
                this.option.series[0].data = this.angularRangeArray
                this.myChart.setOption(this.option)
                // 结束，暂定8秒时长
                if (this.angularRangeArray.length === 80) {
                  // 关闭串口
                  if (this.usbPort) {
                    if (this.usbPort.isOpen) {
                      this.usbPort.close()
                    }
                  }
                  // 计算
                  this.startAllow = true
                  const min = Math.min(...this.angularRangeArray)
                  const max = Math.max(...this.angularRangeArray)
                  this.angularRange = parseInt((max - min).toFixed(0))
                  if (this.angularRange) {
                    const db = initDB()
                    db.user
                      .update(this.$store.state.currentUserInfo.userId, {
                        angularRange: this.angularRange
                      })
                      .then(() => {
                        const oldCurrentUserInfo = JSON.parse(
                          JSON.stringify(this.$store.state.currentUserInfo)
                        )
                        this.$store.dispatch('changeCurrentUserInfo', {
                          userId: oldCurrentUserInfo.userId,
                          userName: oldCurrentUserInfo.userName,
                          sex: oldCurrentUserInfo.sex,
                          height: oldCurrentUserInfo.height,
                          weight: oldCurrentUserInfo.weight,
                          birthday: oldCurrentUserInfo.birthday,
                          angularRange: this.angularRange,
                          lastLoginTime: oldCurrentUserInfo.lastLoginTime
                        })
                      })
                      .then(() => {
                        this.$message({
                          message: `设置运动角度范围成功`,
                          type: 'success',
                          duration: 1000
                        })
                      })
                      .catch(err => {
                        this.$alert(
                          `${err}。设置运动角度范围失败，然后点击"刷新页面"按钮！`,
                          '提示',
                          {
                            type: 'error',
                            showClose: false,
                            center: true,
                            confirmButtonText: '刷新页面',
                            callback: () => {
                              this.handleRefresh()
                            }
                          }
                        )
                      })
                  } else if (this.angularRange === 0) {
                    this.$message({
                      message: '设置失败，运动角度范围不能为0度，请重试！',
                      type: 'error',
                      duration: 5000
                    })
                  } else {
                    this.$message({
                      message: `设置失败，运动角度范围值异常：${this.angularRange}，请重试！`,
                      type: 'error',
                      duration: 5000
                    })
                  }
                }
              }
            })
          } else {
            this.$confirm(
              `请重新连接USB线，然后点击"刷新页面"按钮！`,
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
                center: true,
                confirmButtonText: '刷新页面',
                cancelButtonText: '返回首页'
              }
            )
              .then(() => {
                this.handleRefresh()
              })
              .catch(() => {
                this.$router.push({
                  path: '/home'
                })
              })
          }
        })
        .catch(err => {
          this.$confirm(
            `${err}。请重新连接USB线，然后点击"刷新页面"按钮！`,
            `初始化SerialPort.list失败`,
            {
              type: 'error',
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              center: true,
              confirmButtonText: '刷新页面',
              cancelButtonText: '返回首页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.$router.push({
                path: '/home'
              })
            })
        })
    },

    /**
     * @description: 开始按钮
     */
    handleStart() {
      this.startAllow = false
      this.angularRangeArray = []
      this.angularRange = ''

      if (this.usbPort) {
        if (!this.usbPort.isOpen) {
          this.usbPort.open()
        }
      }
    },

    /**
     * @description: 刷新页面按钮
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/set-angularRange'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.set-angularRange {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 40px 40px 20px 40px;
    @include flex(column, stretch, stretch);
    position: relative;

    .page {
      position: absolute;
      top: 20px;
      left: 30px;
    }

    /* 文字说明 */
    .text {
      margin: 20px 0 0 0;
      @include flex(row, flex-start, center);
      font-size: 18px;
      color: red;
    }
    /* 运动角度范围结果 */
    .result {
      flex: 1;
      margin: 10px 0 0 0;
      @include flex(row, center, center);
      font-size: 18px;
      .value {
        color: #ffffff;
        background-color: #929292;
        padding: 6px 20px;
        border-radius: 6px;
      }
    }
    /* 按钮组 */
    .btn {
      @include flex(row, center, center);
      .item {
        margin: 0 50px;
        font-size: 22px;
      }
    }
  }
}
</style>
