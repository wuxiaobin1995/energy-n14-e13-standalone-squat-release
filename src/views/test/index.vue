<!--
 * @Author      : Mr.bin
 * @Date        : 2023-11-21 14:17:23
 * @LastEditTime: 2023-11-21 15:30:24
 * @Description : 蹲起释放
-->
<template>
  <div class="test">
    <div>
      <el-button @click="open">开始</el-button>
      <el-button @click="close">结束</el-button>
    </div>
    <div>
      <div class="item">角度：{{ angle }} °</div>
      <div class="item">角速度：{{ angularVelocity }} rad/s</div>
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

export default {
  name: 'test',

  data() {
    return {
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

      angle: 0,
      angularVelocity: 0
    }
  },

  created() {
    this.initSerialPort() // 初始化SerialPort串口

    this.initDll() // 初始化dll实例
  },
  beforeDestroy() {
    if (this.setTimer) {
      window.clearInterval(this.setTimer)
    }
    // 关闭端口
    const colseResult = this.myAddDll.close_serial(1)
    if (colseResult) {
      this.$message({
        message: '端口关闭成功',
        type: 'success',
        duration: 1500
      })
    }
  },

  methods: {
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
            this.$notify({
              title: '通知',
              message: `连接到串口：${this.comPath}`,
              type: 'success',
              position: 'bottom-left',
              duration: 4000
            })
          } else {
            this.$notify({
              title: '没有检测到USB连接',
              message: '请重新连接USB线，然后刷新页面或重启设备',
              type: 'error',
              position: 'bottom-left'
            })
          }
        })
        .catch(err => {
          this.$notify({
            title: `初始化SerialPort.list失败：${err}`,
            message: '请重新连接USB线，然后刷新页面或重启设备',
            type: 'error',
            position: 'bottom-left',
            duration: 10000
          })
        })
    },

    open() {
      // 初始化端口
      const comNum = parseInt(this.comPath.split('M')[1])
      const initDll = this.myAddDll.serial_init(comNum, 115200, 1024)

      if (initDll) {
        this.setTimer = setInterval(() => {
          const res1 = this.myAddDll.Device_receive_data(80, 1) // 绕X轴角度
          const res3 = this.myAddDll.Device_receive_data(80, 7) // 绕X轴角速度

          /* 数据预处理 */
          // 角度[°]，去掉后面2位才是角度值
          this.angle = parseInt((res1 / 100).toFixed(0))
          // 角速度[rad/s]，°/s换成弧度单位rad/s
          this.angularVelocity = parseFloat(
            Math.abs((res3 / (Math.PI * 2)).toFixed(2))
          )
        }, 100)
      }
    },

    close() {
      if (this.setTimer) {
        window.clearInterval(this.setTimer)
      }
      // 关闭端口
      const colseResult = this.myAddDll.close_serial(1)
      if (colseResult) {
        this.$message({
          message: '端口关闭成功',
          type: 'success',
          duration: 1500
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.test {
  width: 100%;
  height: 100%;
}
</style>
