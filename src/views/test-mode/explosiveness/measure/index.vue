<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-06 10:15:49
 * @LastEditTime: 2024-03-19 16:08:14
 * @Description : 爆发力测试-具体测量
-->
<template>
  <div class="test-explosiveness-measure">
    <div class="wrapper">
      <!-- 顶部部分 -->
      <div class="top">
        <el-page-header
          title="返回上一页"
          content="爆发力测试"
          @back="handleBack"
        ></el-page-header>
      </div>

      <!-- 文字说明 -->
      <div class="text">
        <div class="item">
          说明：该模式下，用于测量爆发力指标，请用户先设定好后端配重、前端配重（程序会自动算出实际配重）；
        </div>
        <div class="item">
          开始测试，点击“开 始”按钮，用户做好准备动作，然后瞬间发力蹲起一次；
        </div>
        <div class="item">
          结束测试，点击“结 束”按钮，系统弹窗算出爆发力指标。
        </div>
      </div>

      <!-- 主内容 -->
      <div class="main">
        <div class="item">
          <span>后端配重（kg）：</span>
          <el-input-number
            v-model="backWeight"
            :step="5"
            :min="0"
            :max="165"
            :precision="1"
            @change="handleChangeBackWeight"
          ></el-input-number>
        </div>
        <div class="item">
          <span>前端配重（kg）：</span>
          <el-input-number
            v-model="frontWeight"
            :step="5"
            :min="0"
            :max="1000"
            :precision="1"
            @change="handleChangeFrontWeight"
          ></el-input-number>
        </div>
        <div class="item">
          <span>实际配重（kg）：</span>
          <span>{{ weight }}</span>
        </div>
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
          >结 束</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷 新 页 面</el-button
        >
      </div>

      <!-- 结果弹窗 -->
      <el-dialog
        title="测试结果"
        :visible.sync="centerDialogVisible"
        width="30%"
        top="35vh"
        center
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
      >
        <div class="dialog-main">
          <div class="item">测量日期：{{ pdfTime }}</div>
          <div class="item">
            爆发力值：<span class="val">{{ explosivenessVal }} W</span>
          </div>
          <div class="item">
            峰值角速度：<span class="val">{{ maxAngularVelocity }} rad/s</span>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button class="item" type="primary" @click="handleBack"
            >返 回</el-button
          >
          <el-button class="item" type="success" @click="handlePDF"
            >长期趋势报告</el-button
          >
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

/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'test-explosiveness-measure',

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

      angularVelocity: 0, // 角速度
      angularVelocityArray: [], // 角速度数组

      backWeight: 0, // 后端配重（kg），0~165kg，（165kg接近配平）
      frontWeight: 0, // 前端配重（kg）
      weight: 0, // 实际配重（kg）

      centerDialogVisible: false,
      isStart: true, // 是否开始

      explosivenessVal: 0, // 爆发力指标（峰值功率[W]）
      maxAngularVelocity: 0, // 峰值角速度[rad/s]
      pdfTime: ''
    }
  },

  created() {
    this.initSerialPort() // 初始化SerialPort串口

    this.initDll() // 初始化dll实例

    this.countWeight()
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
        duration: 1000
      })
    }
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/test-select'
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
            // this.$notify({
            //   title: '通知',
            //   message: `连接到串口：${this.comPath}`,
            //   type: 'success',
            //   position: 'bottom-left',
            //   duration: 1000
            // })
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
                cancelButtonText: '返回上一页'
              }
            )
              .then(() => {
                this.handleRefresh()
              })
              .catch(() => {
                this.handleBack()
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
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleBack()
            })
        })
    },

    /**
     * @description: 后端配重改变触发
     */
    handleChangeBackWeight() {
      if (!this.backWeight) {
        this.backWeight = 0
      }
      this.countWeight()
    },

    /**
     * @description: 前端配重改变触发
     */
    handleChangeFrontWeight() {
      if (!this.frontWeight) {
        this.frontWeight = 0
      }
      this.countWeight()
    },

    /**
     * @description: 实际配重kg
     */
    countWeight() {
      const L1 = 0.35
      const L2 = 1.05
      const L3 = 0.8
      const L4 = 0.73
      const L5 = 0.12
      this.weight = parseFloat(
        (
          ((((L4 + L5) / L4) *
            ((L2 / L3) * this.frontWeight -
              (L1 / (L3 + L1)) * this.backWeight +
              24) +
            33) *
            0.73) /
          1.7
        ).toFixed(0)
      )
    },

    /**
     * @description: 开始
     */
    handleStart() {
      this.isStart = false

      // 初始化端口
      const comNum = parseInt(this.comPath.split('M')[1])
      const initDll = this.myAddDll.serial_init(comNum, 115200, 1024)

      if (initDll) {
        this.setTimer = setInterval(() => {
          const res3 = this.myAddDll.Device_receive_data(80, 7) // 绕X轴角速度

          /* 数据预处理 */
          // 角速度[rad/s]，°/s换成弧度单位rad/s
          this.angularVelocity = parseFloat(
            Math.abs((res3 / (Math.PI * 2)).toFixed(2))
          )

          this.angularVelocityArray.push(this.angularVelocity)

          /* 安全设置，默认30s自动结束 */
          if (this.angularVelocityArray.length === 300) {
            this.handleFinish()
          }
        }, 100)
      }
    },

    /**
     * @description: 结束
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
          duration: 1000
        })
      }

      /* 调用数据计算方法，算出结果 */
      const calculateDataResult = calculateData(
        this.angularVelocityArray, // 角速度数组
        parseFloat(((this.weight / 0.73) * 1.7).toFixed(0)) // 传感器所在点的负重
      )
      this.explosivenessVal = calculateDataResult.maxPower // 爆发力指标（峰值功率[W]）
      this.maxAngularVelocity = calculateDataResult.maxAngularVelocity // 峰值角速度[rad/s]

      this.pdfTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      const db = initDB()
      db.test_data
        .add({
          userId: this.$store.state.currentUserInfo.userId,
          userName: this.$store.state.currentUserInfo.userName,
          sex: this.$store.state.currentUserInfo.sex,
          height: this.$store.state.currentUserInfo.height,
          weight: this.$store.state.currentUserInfo.weight,
          birthday: this.$store.state.currentUserInfo.birthday,

          pdfTime: this.pdfTime,
          maxAngularVelocity: this.maxAngularVelocity,
          explosivenessVal: this.explosivenessVal,
          type: '爆发力测试'
        })
        .then(() => {
          this.centerDialogVisible = true
        })
        .catch(() => {
          this.$alert(`请点击"刷新页面"按钮，然后重新确认！`, '数据保存失败', {
            type: 'error',
            showClose: false,
            center: true,
            confirmButtonText: '刷新页面',
            callback: () => {
              this.handleRefresh()
            }
          })
        })
    },

    /**
     * @description: 爆发力测试-长期趋势报告
     */
    handlePDF() {
      this.$router.push({
        path: '/test-explosiveness-secular-trend-pdf',
        query: {
          routerName: JSON.stringify('/test-select')
        }
      })
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/test-explosiveness-measure'),
          duration: JSON.stringify(800)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-explosiveness-measure {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 26px 40px;
    @include flex(column, stretch, stretch);

    .top {
      margin-bottom: 20px;
    }

    .text {
      .item {
        font-size: 22px;
        margin-bottom: 8px;
      }
    }

    .main {
      flex: 1;
      .item {
        margin-top: 20px;
        font-size: 20px;
      }
    }

    .dialog-main {
      @include flex(column, stretch, center);
      .item {
        font-size: 22px;
        margin-bottom: 10px;
        font-weight: 700;
        .val {
          font-size: 34px;
          color: green;
        }
      }
    }

    .dialog-footer {
      .item {
        margin: 0 20px;
      }
    }

    .btn {
      margin-top: 20px;
      @include flex(row, center, center);
      .item {
        width: 150px;
        font-size: 22px;
        margin: 0 50px;
      }
    }
  }
}
</style>
