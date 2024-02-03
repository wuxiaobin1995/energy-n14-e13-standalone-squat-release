<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-02 16:48:50
 * @LastEditTime: 2024-02-03 09:56:33
 * @Description : 1RM极限力量-长期趋势报告
-->
<template>
  <div
    class="test-oneRM-secular-trend-pdf"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <!-- PDF区域 -->
    <div id="pdf" class="pdf-wrapper">
      <div class="top">
        <el-image class="logo" :src="logoSrc" fit="scale-down"></el-image>

        <div class="title">1RM极限力量-长期趋势报告</div>

        <div class="id">用户id：{{ userId }}</div>

        <div class="divider"></div>

        <div class="info">
          <div class="item">姓名：{{ userName }}</div>
          <div class="item">性别：{{ sex }}</div>
          <div class="item">出生日期：{{ birthday }}</div>
          <div class="item">身高：{{ height }}cm</div>
          <div class="item">体重：{{ weight }}kg</div>
        </div>

        <div class="divider"></div>
      </div>

      <div class="chart">
        <div id="chart" :style="{ width: '100%', height: '100%' }"></div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="item" type="primary" @click="handlePdf"
        >保存PDF</el-button
      >
      <el-button class="item" type="warning" @click="handleGoBack"
        >返回上一页</el-button
      >
    </div>
  </div>
</template>

<script>
/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'test-oneRM-secular-trend-pdf',

  data() {
    return {
      /* 路由传参 */
      routerName: JSON.parse(this.$route.query.routerName),

      /* 图形相关变量 */
      myChart: null,
      option: {},
      xData: [], // 横坐标数组

      /* 其他 */
      fullscreenLoading: false,
      logoSrc: require('@/assets/img/Company_Logo/logo_1.png'), // 公司商标

      userId: this.$store.state.currentUserInfo.userId,
      userName: this.$store.state.currentUserInfo.userName,
      sex: this.$store.state.currentUserInfo.sex,
      weight: this.$store.state.currentUserInfo.weight,
      height: this.$store.state.currentUserInfo.height,
      birthday: this.$store.state.currentUserInfo.birthday,

      oneRMArray: [] // 1RM数组
    }
  },

  created() {
    this.getData()
  },

  methods: {
    /**
     * @description: 根据userId查询数据
     */
    getData() {
      this.fullscreenLoading = true
      const db = initDB()
      db.test_data
        .where({
          userId: this.userId
        })
        .toArray()
        .then(res => {
          for (let i = 0; i < res.length; i++) {
            const element = res[i]

            this.oneRMArray.push(element.oneRM)
            this.xData.push(element.pdfTime)
          }
        })
        .then(() => {
          // 绘图
          this.initChart()
        })
        .catch(err => {
          this.$confirm(
            `${err}。获取ID为 [${this.userId}] 的用户数据失败，请重试！`,
            '提示',
            {
              type: 'warning',
              center: true,
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
              confirmButtonText: '重 试',
              cancelButtonText: '返回上一页'
            }
          )
            .then(() => {
              this.getData()
            })
            .catch(() => {
              this.handleGoBack()
            })
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    },

    /**
     * @description: 初始化echarts图形
     */
    initChart() {
      this.myChart = this.$echarts.init(document.getElementById('chart'))
      this.option = {
        xAxis: {
          type: 'category',
          name: '测量日期',
          data: this.xData,
          boundaryGap: true // 从0点开始
        },
        yAxis: {
          type: 'value',
          name: '1RM极限力量值（kg）'
          // splitLine: {
          //   show: false // 隐藏背景网格线
          // }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        series: [
          {
            type: 'line',
            name: '1RM极限力量',
            color: '#2BB983',
            label: {
              show: true,
              position: 'top',
              color: 'rgba(255, 0, 0, 1)',
              fontWeight: 'bold',
              fontSize: 16
            },
            lineStyle: {
              width: 3
            },
            symbolSize: 8,
            smooth: true,
            data: this.oneRMArray
          }
        ],
        animation: false
      }
      this.myChart.setOption(this.option)
    },

    /**
     * @description: 保存PDF
     */
    handlePdf() {
      this.$htmlToPdf(
        'pdf',
        `1RM极限力量-长期趋势报告-${this.userName} ${this.$moment().format(
          'YYYY-MM-DD HH_mm_ss'
        )}`,
        500
      )
    },

    /**
     * @description: 返回上一页
     */
    handleGoBack() {
      this.$router.push({
        path: this.routerName
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-oneRM-secular-trend-pdf {
  width: 100vw;
  height: 100vh;
  padding: 10px;
  @include flex(column, stretch, stretch);

  /* PDF区域 */
  .pdf-wrapper {
    flex: 1;
    @include flex(column, stretch, stretch);

    .top {
      position: relative;
      @include flex(column, stretch, center);
      .logo {
        position: absolute;
        top: 10px;
        left: 5px;
        width: 180px;
      }
      .id {
        position: absolute;
        top: 50px;
        right: 5px;
        font-size: 18px;
        font-weight: 700;
      }
      .title {
        font-size: 50px;
      }
      .divider {
        margin-top: 15px;
        border: 1px solid rgb(204, 204, 204);
        width: 100%;
      }
      .info {
        width: 100%;
        margin-top: 15px;
        @include flex(row, space-around, center);
        .item {
          font-size: 20px;
        }
      }
    }

    .chart {
      flex: 1;
      margin-top: 20px;
    }
  }

  /* 按钮组 */
  .btn {
    @include flex(row, center, center);
    margin: 20px 0;
    .item {
      width: 180px;
      font-size: 28px;
      margin: 0 60px;
    }
  }
}
</style>
