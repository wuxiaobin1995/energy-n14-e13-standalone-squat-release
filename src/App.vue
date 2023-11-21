<!--
 * @Author      : Mr.bin
 * @Date        : 2022-07-27 10:32:39
 * @LastEditTime: 2023-11-21 10:40:29
 * @Description : 根组件
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',

  created() {
    this.initLocalStorage()
  },

  methods: {
    /**
     * @description: 软件启动后，初始化localStorage的一些值
     */
    initLocalStorage() {
      /* 初始化localStorage中的波特率 */
      if (!window.localStorage.getItem('scmBaudRate')) {
        window.localStorage.setItem('scmBaudRate', '115200')
      }
      /* 初始化localStorage中的后端配重值 */
      if (!window.localStorage.getItem('balanceWeight')) {
        window.localStorage.setItem('balanceWeight', '165')
      }
      /* 初始化localStorage中的前端配重值 */
      if (!window.localStorage.getItem('heavyWeight')) {
        window.localStorage.setItem('heavyWeight', '0')
      }
      // 初始化localStorage中的人员设定的峰值功率百分比
      if (!window.localStorage.getItem('maxPowerPercent')) {
        window.localStorage.setItem('maxPowerPercent', '90')
      }
      /* 初始化免责声明的终端用户名称 */
      if (!window.localStorage.getItem('disclaimer_name')) {
        window.localStorage.setItem('disclaimer_name', '')
      }
      /* 初始化免责声明的设备编号 */
      if (!window.localStorage.getItem('disclaimer_device_id')) {
        window.localStorage.setItem('disclaimer_device_id', '')
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
