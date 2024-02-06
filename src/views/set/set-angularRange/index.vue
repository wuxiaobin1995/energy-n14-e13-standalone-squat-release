<!--
 * @Author      : Mr.bin
 * @Date        : 2024-01-31 16:52:11
 * @LastEditTime: 2024-02-02 17:45:01
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

      <!-- 实时角度显示 -->
      <div class="angle">实时角度显示：{{ angle }} °</div>

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
          :disabled="!isStart"
          @click="handleStart"
          >开 始</el-button
        >
        <el-button
          class="item"
          type="danger"
          :disabled="isStart"
          @click="handleFinish"
          >结 束 完 成</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷 新 页 面</el-button
        >
      </div>
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
  name: 'set-angularRange',

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

      /* 其他 */
      isStart: true, // 是否开始
      angle: 0, // 实时角度
      angularRangeArray: [], // 完整的角度范围数组
      angularRange: '' // 运动角度范围结果
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
     * @description: 回到首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
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
            this.$notify({
              title: '通知',
              message: `连接到串口：${this.comPath}`,
              type: 'success',
              position: 'bottom-left',
              duration: 4000
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
                this.handleToHome()
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
              this.handleToHome()
            })
        })
    },

    /**
     * @description: 开始按钮
     */
    handleStart() {
      this.isStart = false
      this.angularRangeArray = []
      this.angularRange = ''

      // 初始化端口
      const comNum = parseInt(this.comPath.split('M')[1])
      const initDll = this.myAddDll.serial_init(comNum, 115200, 1024)

      if (initDll) {
        this.setTimer = setInterval(() => {
          const res1 = this.myAddDll.Device_receive_data(80, 1) // 绕X轴角度

          /* 数据预处理 */
          // 实时角度[°]，去掉后面2位才是角度值
          this.angle = parseInt((res1 / 100).toFixed(0))

          /* 数据计算，改传感器有正负，越过180就变成-180 */
          let positive = 0 // 正数
          let negative = 0 // 负数
          if (this.angle >= 0) {
            positive = Math.abs(180 - this.angle)
            this.angularRangeArray.push(positive)
          } else {
            negative = -Math.abs(180 + this.angle)
            this.angularRangeArray.push(negative)
          }

          /* 默认10秒自动结束 */
          if (this.angularRangeArray.length === 100) {
            this.handleFinish()
          }
        }, 100)
      }
    },

    /**
     * @description: 结束完成，并保存数据
     */
    handleFinish() {
      this.isStart = true
      if (this.setTimer) {
        window.clearInterval(this.setTimer)
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

      /* 结果计算 */
      const min = Math.min(...this.angularRangeArray)
      const max = Math.max(...this.angularRangeArray)
      this.angularRange = max - min

      /* 保存数据库 */
      if (this.angularRange) {
        const db = initDB()
        db.user
          .update(this.$store.state.currentUserInfo.userId, {
            angularRange: this.angularRange
          })
          .then(() => {
            // 同步更新Vuex
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
              message: '测量完成，可前往训练模块',
              type: 'success',
              duration: 2500
            })
          })
          .catch(err => {
            this.$alert(
              `${err}。设置运动角度范围失败，点击"刷新页面"按钮，然后重试！`,
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
          message: '设置失败，运动角度范围不能为0°，请重试！',
          type: 'error',
          duration: 4000
        })
      } else {
        this.$message({
          message: `设置失败，运动角度范围值异常：${this.angularRange}，请重试！`,
          type: 'error',
          duration: 4000
        })
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
      margin-top: 20px;
      @include flex(row, flex-start, center);
      font-size: 20px;
      color: red;
    }
    /* 实时角度 */
    .angle {
      margin-top: 10px;
      font-size: 18px;
    }
    /* 运动角度范围结果 */
    .result {
      flex: 1;
      @include flex(row, center, center);
      font-size: 36px;
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
