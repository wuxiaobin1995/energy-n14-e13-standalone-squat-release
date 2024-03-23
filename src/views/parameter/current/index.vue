<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-01 11:34:57
 * @LastEditTime: 2024-03-23 10:27:22
 * @Description : 通用-配置
-->
<template>
  <div class="parameter-current">
    <div class="wrapper">
      <!-- 顶部部分 -->
      <div class="top">
        <el-page-header
          title="返回上一页"
          content="通用-配置"
          @back="handleBack"
        ></el-page-header>
      </div>

      <div class="main">
        <!-- 峰值功率百分比 -->
        <!-- <div>
          <el-divider>峰值功率百分比（默认是90%）</el-divider>
          <el-input-number
            v-model="maxPowerPercent"
            label="请输入峰值功率百分比"
            :min="1"
            :max="99"
            :precision="0"
            @change="handleSetMaxPowerPercent"
          ></el-input-number>
        </div> -->

        <!-- 波特率 -->
        <div>
          <el-divider>波特率</el-divider>
          <el-input-number
            v-model="scmBaudRate"
            :min="1"
            :max="9999999"
            :precision="0"
            @change="handleCheckScmBaudRate"
          ></el-input-number>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="primary" @click="handleRefresh"
          >刷 新 页 面</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'parameter-current',

  data() {
    return {
      maxPowerPercent: 90, // 人员设定的峰值功率百分比，默认90%
      scmBaudRate: 115200 // 波特率值
    }
  },

  created() {
    if (!window.localStorage.getItem('maxPowerPercent')) {
      window.localStorage.setItem('maxPowerPercent', '90')
    }
    if (!window.localStorage.getItem('scmBaudRate')) {
      window.localStorage.setItem('scmBaudRate', '115200')
    }

    this.maxPowerPercent = parseInt(
      window.localStorage.getItem('maxPowerPercent')
    )
    this.scmBaudRate = parseInt(window.localStorage.getItem('scmBaudRate'))
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/parameter-select'
      })
    },

    /**
     * @description: 设置峰值功率百分比
     */
    handleSetMaxPowerPercent() {
      if (!this.maxPowerPercent) {
        this.maxPowerPercent = 90
      }
      window.localStorage.setItem('maxPowerPercent', this.maxPowerPercent)
      this.$message({
        type: 'success',
        message: '设置成功',
        duration: 1500
      })
    },

    /**
     * @description: 设置波特率
     */
    handleCheckScmBaudRate() {
      if (!this.scmBaudRate) {
        this.scmBaudRate = 115200
      }
      window.localStorage.setItem('scmBaudRate', this.scmBaudRate)
      this.$message({
        type: 'success',
        message: '设置成功',
        duration: 1500
      })
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/parameter-current'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.parameter-current {
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
      margin-bottom: 10px;
    }

    .main {
      flex: 1;
    }

    .btn {
      margin-top: 20px;
      @include flex(row, center, center);
      .item {
        font-size: 20px;
      }
    }
  }
}
</style>
