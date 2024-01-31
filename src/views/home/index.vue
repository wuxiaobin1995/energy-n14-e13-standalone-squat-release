<!--
 * @Author      : Mr.bin
 * @Date        : 2022-07-28 11:18:12
 * @LastEditTime: 2024-01-31 17:50:52
 * @Description : home
-->
<template>
  <div class="home">
    <div class="wrapper">
      <!-- 用户管理 -->
      <el-image
        class="item"
        :src="src1"
        fit="scale-down"
        @click.native="handleClick('src1')"
      ></el-image>
      <!-- 参数配置 -->
      <el-image
        class="item"
        :src="src2"
        fit="scale-down"
        @click.native="handleClick('src2')"
      ></el-image>
      <!-- 运动测试 -->
      <el-image
        class="item"
        :src="src3"
        fit="scale-down"
        @click.native="handleClick('src3')"
      ></el-image>
      <!-- 运动训练 -->
      <el-image
        class="item"
        :src="src4"
        fit="scale-down"
        @click.native="handleClick('src4')"
      ></el-image>
      <!-- 数据记录 -->
      <el-image
        class="item"
        :src="src5"
        fit="scale-down"
        @click.native="handleClick('src5')"
      ></el-image>

      <!-- 数据记录选择弹窗 -->
      <el-dialog
        :visible.sync="centerDialogVisible"
        width="45%"
        center
        top="35vh"
        :show-close="false"
      >
        <div class="record-select-wrapper">
          <el-button class="btn" type="success" @click="handleGoTestRecord"
            >测试记录</el-button
          >
          <el-button class="btn" type="primary" @click="handleGoTrainRecord"
            >训练记录</el-button
          >
        </div>
      </el-dialog>

      <!-- 免责声明 -->
      <div class="disclaimer">
        <el-button
          type="danger"
          size="small"
          round
          @click="dialogVisible = true"
          >用 户 告 知</el-button
        >
      </div>
      <el-dialog
        title="用户告知"
        :visible.sync="dialogVisible"
        width="40%"
        center
      >
        <div>
          终端用户名称：<span :style="{ color: 'red' }">{{ name }}</span>
        </div>
        <div>
          设备编号：<span :style="{ color: 'red' }">{{ deviceId }}</span>
        </div>
        <div>
          <h3>为了避免纠纷，特做如下说明：</h3>
          <p>
            1、请用户核对上面的"终端用户名称"，若该名称和你目前的名称不相符，请及时联系厂家（电话：0750-6318728）
          </p>
          <p>
            2、若长时间未告知厂家，而后续出现问题需要厂家提供服务时，则合同上的一切承诺的售后服务等将失效！
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false"
            >已 阅</el-button
          >
        </span>
      </el-dialog>

      <!-- 设置运动角度范围 -->
      <div class="set-angularRange">
        <el-button
          type="success"
          size="small"
          round
          @click="handleSetAngularRange"
          >运 动 角 度 范 围</el-button
        >
      </div>
    </div>

    <!-- 打开控制台按钮 -->
    <el-button
      class="btn-control"
      type="info"
      size="mini"
      @click="handleOpenDev"
      >Open Dev</el-button
    >
  </div>
</template>

<script>
/* 用于打开控制台 */
import { remote } from 'electron'

export default {
  name: 'home',

  data() {
    return {
      src1: require('@/assets/img/Home/用户管理.png'),
      src2: require('@/assets/img/Home/参数配置.png'),
      src3: require('@/assets/img/Home/运动测试.png'),
      src4: require('@/assets/img/Home/运动训练.png'),
      src5: require('@/assets/img/Home/数据记录.png'),

      centerDialogVisible: false, // 数据记录选择弹窗

      /* 免责声明 */
      dialogVisible: false,
      name: window.localStorage.getItem('disclaimer_name'),
      deviceId: window.localStorage.getItem('disclaimer_device_id')
    }
  },

  methods: {
    /**
     * @description: 页面跳转
     * @param {String} src
     */
    handleClick(src) {
      // 用户管理
      if (src === 'src1') {
        this.$router.push({
          path: '/user'
        })
      }
      // 参数配置
      else if (src === 'src2') {
        this.$router.push({
          path: '/set'
        })
      }
      // 运动测试
      else if (src === 'src3') {
        if (this.$store.state.currentUserInfo.userId) {
          this.$router.push({
            path: '/test-select'
          })
        } else {
          this.$confirm(
            `检测到您还没有选择用户，请先到用户页面进行选择！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '确 定'
            }
          )
            .then(() => {
              this.$router.push({
                path: '/user'
              })
            })
            .catch(() => {})
        }
      }
      // 运动训练
      else if (src === 'src4') {
        if (this.$store.state.currentUserInfo.userId) {
          this.$router.push({
            path: '/train-select'
          })
        } else {
          this.$confirm(
            `检测到您还没有选择用户，请先到用户页面进行选择！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '确 定'
            }
          )
            .then(() => {
              this.$router.push({
                path: '/user'
              })
            })
            .catch(() => {})
        }
      }
      // 数据记录
      else if (src === 'src5') {
        if (this.$store.state.currentUserInfo.userId) {
          this.centerDialogVisible = true
        } else {
          this.$confirm(
            `检测到您还没有选择用户，请先到用户页面进行选择！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showCancelButton: false,
              confirmButtonText: '确 定'
            }
          )
            .then(() => {
              this.$router.push({
                path: '/user'
              })
            })
            .catch(() => {})
        }
      }
    },

    /**
     * @description: 设置运动角度范围
     */
    handleSetAngularRange() {
      if (this.$store.state.currentUserInfo.userId) {
        this.$router.push({
          path: '/set-angularRange'
        })
      } else {
        this.$confirm(
          `检测到您还没有选择用户，请先到用户页面进行选择！`,
          '提示',
          {
            type: 'warning',
            center: true,
            showCancelButton: false,
            confirmButtonText: '确 定'
          }
        )
          .then(() => {
            this.$router.push({
              path: '/user'
            })
          })
          .catch(() => {})
      }
    },

    /**
     * @description: 打开控制台
     */
    handleOpenDev() {
      this.$prompt('请输入密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^htpm$/,
        inputErrorMessage: '密码不正确',
        showClose: true,
        closeOnClickModal: false
      })
        .then(() => {
          try {
            remote.getCurrentWebContents().openDevTools()
          } catch (err) {
            this.$message({
              type: 'error',
              message: `打开控制台失败：${err}`
            })
          }
        })
        .catch(() => {})
    },

    /**
     * @description: 跳转至测试记录页
     */
    handleGoTestRecord() {
      this.$router.push({ path: '/test-record' })
    },
    /**
     * @description: 跳转至训练记录页
     */
    handleGoTrainRecord() {
      this.$router.push({ path: '/train-record' })
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    position: relative;
    @include flex(row, space-around, center);

    /* 数据记录选择弹窗 */
    .record-select-wrapper {
      @include flex(row, space-around, center);
      .btn {
        font-size: 30px;
        margin-bottom: 15px;
      }
    }

    /* 免责声明 */
    .disclaimer {
      position: absolute;
      left: 30px;
      top: 25px;
    }

    /* 设置运动角度范围 */
    .set-angularRange {
      position: absolute;
      left: 30px;
      top: 75px;
    }
  }

  /* 打开控制台按钮 */
  .btn-control {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
