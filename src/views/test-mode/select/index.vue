<!--
 * @Author      : Mr.bin
 * @Date        : 2024-01-31 18:01:15
 * @LastEditTime: 2024-02-06 09:37:34
 * @Description : 测试项目选择
-->
<template>
  <div class="test-select">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="请选择测试项目"
        @back="handleToHome"
      ></el-page-header>

      <!-- 项目 -->
      <div class="select">
        <div class="select-item">
          <el-image
            class="img"
            :src="img1"
            fit="scale-down"
            @click.native="handleFast"
          ></el-image>
          <div class="text">1RM快速测试</div>
        </div>

        <div class="select-item">
          <el-image
            class="img"
            :src="img2"
            fit="scale-down"
            @click.native="handlePrecise"
          ></el-image>
          <div class="text">1RM精准测试</div>
        </div>

        <div class="select-item">
          <el-image
            class="img"
            :src="img3"
            fit="scale-down"
            @click.native="handleExplosiveness"
          ></el-image>
          <div class="text">爆发力测试</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test-select',

  data() {
    return {
      img1: require('@/assets/img/Test/Select/1RM快速测试.png'),
      img2: require('@/assets/img/Test/Select/1RM精准测试.png'),
      img3: require('@/assets/img/Test/Select/爆发力测试.png')
    }
  },

  methods: {
    /**
     * @description: 快速测试
     */
    handleFast() {
      this.$router.push({
        path: '/test-fast-measure'
      })
    },

    /**
     * @description: 精准测试
     */
    handlePrecise() {
      this.$router.push({
        path: '/test-precise-measure'
      })
    },

    /**
     * @description: 爆发力测试
     */
    handleExplosiveness() {
      this.$router.push({
        path: '/test-explosiveness-measure'
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
.test-select {
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
