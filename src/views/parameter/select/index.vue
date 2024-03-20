<!--
 * @Author      : Mr.bin
 * @Date        : 2024-01-31 18:01:15
 * @LastEditTime: 2024-02-01 15:14:45
 * @Description : 配置项目选择
-->
<template>
  <div class="parameter-select">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="请选择配置项目"
        @back="handleToHome"
      ></el-page-header>

      <!-- 项目 -->
      <div class="select">
        <!-- <div class="select-item">
          <el-image
            class="img"
            :src="img1"
            fit="scale-down"
            @click.native="handleAction"
          ></el-image>
          <div class="text">训练动作配置</div>
        </div> -->

        <div class="select-item">
          <el-image
            class="img"
            :src="img2"
            fit="scale-down"
            @click.native="handleCurrent"
          ></el-image>
          <div class="text">通用配置</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'parameter-select',

  data() {
    return {
      img1: require('@/assets/img/Parameter/Select/训练动作配置.png'),
      img2: require('@/assets/img/Parameter/Select/通用配置.png')
    }
  },

  methods: {
    /**
     * @description: 前往训练动作配置
     */
    handleAction() {
      this.$router.push({
        path: '/parameter-action'
      })
    },

    /**
     * @description: 前往通用配置
     */
    handleCurrent() {
      this.$router.push({
        path: '/parameter-current'
      })
    },

    /**
     * @description: 回到首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.parameter-select {
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
    position: relative;
    @include flex(column, stretch, stretch);

    .page {
      position: absolute;
      top: 20px;
      left: 30px;
    }

    /* 项目 */
    .select {
      flex: 1;
      @include flex(row, space-around, center);
      .select-item {
        @include flex(column, center, center);
        .img {
          transform: scale(1.2);
          box-shadow: 0 0 8px #1fc047;
          padding: 5px;
        }
        .text {
          color: green;
          margin-top: 35px;
          font-size: 30px;
          font-weight: 700;
        }
      }
    }
  }
}
</style>
