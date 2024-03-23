<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-06 16:53:03
 * @LastEditTime: 2024-03-22 16:46:26
 * @Description : 训练-数据记录
-->
<template>
  <div class="train-record">
    <div class="wrapper">
      <div class="btn">
        <el-button class="item" type="info" round plain @click="handleEndurance"
          >肌耐力训练</el-button
        >

        <el-button
          class="item"
          type="info"
          round
          plain
          @click="handleHypertrophy"
          >肌肥大训练</el-button
        >

        <!-- <el-button
          class="item"
          type="info"
          round
          plain
          @click="handleNeuromuscular"
          >神经肌肉募集训练</el-button
        >

        <el-button
          class="item"
          type="info"
          round
          plain
          @click="handleExplosiveness"
          >爆发力训练</el-button
        > -->
      </div>

      <div class="divider"></div>

      <transition mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-record',

  methods: {
    /**
     * @description: 肌耐力训练
     */
    handleEndurance() {
      this.$router.push({ path: '/train-record/endurance' })
    },

    /**
     * @description: 肌肥大训练
     */
    handleHypertrophy() {
      this.$router.push({ path: '/train-record/hypertrophy' })
    },

    /**
     * @description: 神经肌肉募集训练
     */
    handleNeuromuscular() {
      this.$router.push({ path: '/train-record/neuromuscular' })
    },

    /**
     * @description: 爆发力训练
     */
    handleExplosiveness() {
      this.$router.push({ path: '/train-record/explosiveness' })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 路由过渡动效 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s;
}
.v-enter,
.v-leave-to {
  opacity: 0;
}

.train-record {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 20px;

    .btn {
      @include flex(row, space-around, center);
      .item {
        width: 220px;
        font-size: 22px;
      }
    }

    .divider {
      margin-top: 20px;
      border: 1px solid rgb(204, 204, 204);
      width: 100%;
    }
  }
}
</style>
