<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-01 11:34:57
 * @LastEditTime: 2024-02-01 11:36:52
 * @Description : 精准测试-具体测量
-->
<template>
  <div class="test-precise-measure">
    <div class="wrapper">
      <div>精准测试-具体测量</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test-precise-measure'
}
</script>

<style lang="scss" scoped>
.test-precise-measure {
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
  }
}
</style>
