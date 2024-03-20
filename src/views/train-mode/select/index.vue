<!--
 * @Author      : Mr.bin
 * @Date        : 2024-01-31 18:01:15
 * @LastEditTime: 2024-03-19 16:19:49
 * @Description : 训练项目选择
-->
<template>
  <div class="train-select">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回首页"
        content="请选择训练项目"
        @back="handleToHome"
      ></el-page-header>

      <!-- 项目 -->
      <div class="select">
        <div class="select-item">
          <el-image
            class="img"
            :src="img1"
            fit="scale-down"
            @click.native="handleEndurance"
          ></el-image>
          <div class="text">肌耐力训练</div>
        </div>

        <div class="select-item">
          <el-image
            class="img"
            :src="img2"
            fit="scale-down"
            @click.native="handleHypertrophy"
          ></el-image>
          <div class="text">肌肥大训练</div>
        </div>

        <div class="select-item">
          <el-image
            class="img"
            :src="img3"
            fit="scale-down"
            @click.native="handleNeuromuscular"
          ></el-image>
          <div class="text">神经肌肉募集训练</div>
        </div>

        <div class="select-item">
          <el-image
            class="img"
            :src="img4"
            fit="scale-down"
            @click.native="handleExplosiveness"
          ></el-image>
          <div class="text">爆发力训练</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-select',

  data() {
    return {
      img1: require('@/assets/img/Train/Select/肌耐力训练.png'),
      img2: require('@/assets/img/Train/Select/肌肥大训练.png'),
      img3: require('@/assets/img/Train/Select/神经肌肉募集训练.png'),
      img4: require('@/assets/img/Train/Select/爆发力训练.png')
    }
  },

  methods: {
    /**
     * @description: 肌耐力训练
     */
    handleEndurance() {
      this.$router.push({
        path: '/train-endurance-desc'
      })
    },

    /**
     * @description: 肌肥大训练
     */
    handleHypertrophy() {
      this.$router.push({
        path: '/train-hypertrophy-desc'
      })
    },

    /**
     * @description: 神经肌肉募集训练
     */
    handleNeuromuscular() {
      this.$router.push({
        path: '/train-neuromuscular-desc'
      })
    },

    /**
     * @description: 爆发力训练
     */
    handleExplosiveness() {
      this.$router.push({
        path: '/train-explosiveness-desc'
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
.train-select {
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
