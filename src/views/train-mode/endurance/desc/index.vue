<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-04 11:42:36
 * @LastEditTime: 2024-02-04 16:44:53
 * @Description : 肌耐力训练-介绍与参数设置
-->
<template>
  <div class="train-endurance-desc">
    <div class="wrapper">
      <el-page-header
        class="page"
        title="返回上一页"
        content="肌耐力训练-参数设置"
        @back="handleBack"
      ></el-page-header>

      <div class="text">
        训练要求：建议使用50-70%RM，每组15-20次，运动节奏2-0-2
      </div>
      <div class="text">训练组数：进行2-4组的训练，组间休息35-45s</div>

      <div class="set">参数设置</div>

      <div class="rhythm">运动节奏</div>

      <div class="btn">
        <el-button class="item" type="primary" @click="handleStart"
          >确 定</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-endurance-desc',

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/train-select'
      })
    },

    /**
     * @description: 确定
     */
    handleStart() {
      // this.$router.push({
      //   path: '/train-endurance-measure',
      //   query: {
      //     action: JSON.stringify(this.action),
      //     type: JSON.stringify('肌耐力训练'),
      //     routerName: JSON.stringify('/train-endurance-desc')
      //   }
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.train-endurance-desc {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 86%;
    height: 90%;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 60px 60px 20px 60px;
    @include flex(column, stretch, stretch);
    position: relative;

    .page {
      position: absolute;
      top: 20px;
      left: 30px;
    }

    .text {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .set {
      flex: 1;
    }

    .rhythm {
      font-size: 22px;
      font-weight: 700;
    }

    .btn {
      margin-top: 20px;
      @include flex(row, center, center);
      .item {
        font-size: 24px;
        margin: 0 80px;
      }
    }
  }
}
</style>
