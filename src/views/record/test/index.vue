<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-06 16:53:03
 * @LastEditTime: 2024-03-22 11:09:12
 * @Description : 测试-数据记录
-->
<template>
  <div class="test-record">
    <div class="wrapper">
      <div class="btn">
        <el-button class="item" type="info" round plain @click="handleOneRM"
          >1RM测试</el-button
        >

        <el-button
          class="item"
          type="info"
          round
          plain
          @click="handleExplosiveness"
          >爆发力测试</el-button
        >
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
  name: 'test-record',

  methods: {
    /**
     * @description: 1RM测试
     */
    handleOneRM() {
      this.$router.push({ path: '/test-record/oneRM' })
    },

    /**
     * @description: 爆发力测试
     */
    handleExplosiveness() {
      this.$router.push({ path: '/test-record/explosiveness' })
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

.test-record {
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
        width: 180px;
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
