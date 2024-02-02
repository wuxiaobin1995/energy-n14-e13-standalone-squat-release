<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-01 11:34:57
 * @LastEditTime: 2024-02-02 17:17:22
 * @Description : 快速测试-具体测量
-->
<template>
  <div class="test-fast-measure">
    <div class="wrapper">
      <!-- 顶部部分 -->
      <div class="top">
        <el-page-header
          title="返回上一页"
          content="极限力量-快速测试"
          @back="handleBack"
        ></el-page-header>
      </div>

      <!-- 文字说明 -->
      <div class="text">
        <div class="item">
          说明：该模式下，用于快速得出1RM的极限力量值，请用户先设定好后端配重、前端配重（程序会自动算出实际配重）；
        </div>
        <div class="item">
          然后进行测试，一直做到力竭为止，然后把本次运动的“次数”输入到次数框内；
        </div>
        <div class="item">
          点击“确认”按钮，程序会根据相关公式，计算出该用户的1RM极限力量值，并保存。
        </div>
      </div>

      <!-- 主内容 -->
      <div class="main">
        <div class="left">
          <div class="item">
            <span>后端配重（kg）：</span>
            <el-input-number
              v-model="backWeight"
              :step="5"
              :min="0"
              :max="165"
              :precision="1"
              @change="handleChangeBackWeight"
            ></el-input-number>
          </div>
          <div class="item">
            <span>前端配重（kg）：</span>
            <el-input-number
              v-model="frontWeight"
              :step="5"
              :min="0"
              :max="1000"
              :precision="1"
              @change="handleChangeFrontWeight"
            ></el-input-number>
          </div>
          <div class="item">
            <span>实际配重（kg）：</span>
            <span>{{ weight }}</span>
          </div>
        </div>

        <div class="right">
          <div class="item">
            <span>次数：</span>
            <el-input-number
              v-model="num"
              :min="1"
              :max="1000"
              :precision="0"
            ></el-input-number>
          </div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="primary" @click="handleConfirm"
          >确 认</el-button
        >
        <el-button class="item" type="danger" @click="handleRefresh"
          >刷 新 页 面</el-button
        >
      </div>

      <!-- 结果弹窗 -->
      <el-dialog
        title="测试结果"
        :visible.sync="centerDialogVisible"
        width="30%"
        top="35vh"
        center
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
      >
        <div class="dialog-main">
          <div class="item">测量日期：{{ pdfTime }}</div>
          <div class="item">
            1RM极限力量值：<span class="val">{{ oneRM }} kg</span>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button class="item" type="primary" @click="handleBack"
            >返 回</el-button
          >
          <el-button class="item" type="success" @click="handlePDF"
            >长期趋势报告</el-button
          >
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/* 数据库 */
import { initDB } from '@/db/index.js'

export default {
  name: 'test-fast-measure',

  data() {
    return {
      backWeight: 0, // 后端配重（kg），0~165kg，（165kg接近配平）
      frontWeight: 0, // 前端配重（kg）
      weight: 0, // 实际配重（kg）
      num: 1, // 次数

      centerDialogVisible: false,
      oneRM: 0, // 1RM值（kg）
      pdfTime: ''
    }
  },

  created() {
    this.countWeight()
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/test-select'
      })
    },

    /**
     * @description: 后端配重改变触发
     */
    handleChangeBackWeight() {
      if (!this.backWeight) {
        this.backWeight = 0
      }
      this.countWeight()
    },

    /**
     * @description: 前端配重改变触发
     */
    handleChangeFrontWeight() {
      if (!this.frontWeight) {
        this.frontWeight = 0
      }
      this.countWeight()
    },

    /**
     * @description: 实际配重kg
     */
    countWeight() {
      const L1 = 0.35
      const L2 = 1.05
      const L3 = 0.8
      const L4 = 0.73
      const L5 = 0.12
      this.weight = parseFloat(
        (
          ((((L4 + L5) / L4) *
            ((L2 / L3) * this.frontWeight -
              (L1 / (L3 + L1)) * this.backWeight +
              24) +
            33) *
            0.73) /
          1.7
        ).toFixed(0)
      )
    },

    /**
     * @description: 确认按钮
     */
    handleConfirm() {
      /* 计算结果 */
      this.countWeight()
      this.oneRM = parseInt(this.weight * (1 + (this.num - 1) / 30))

      /* 保存数据库 */
      this.pdfTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
      const db = initDB()
      db.test_data
        .add({
          userId: this.$store.state.currentUserInfo.userId,
          userName: this.$store.state.currentUserInfo.userName,
          sex: this.$store.state.currentUserInfo.sex,
          height: this.$store.state.currentUserInfo.height,
          weight: this.$store.state.currentUserInfo.weight,
          birthday: this.$store.state.currentUserInfo.birthday,
          pdfTime: this.pdfTime,
          oneRM: this.oneRM
        })
        .then(() => {
          this.centerDialogVisible = true
        })
        .catch(() => {
          this.$alert(`请点击"刷新页面"按钮，然后重新确认！`, '数据保存失败', {
            type: 'error',
            showClose: false,
            center: true,
            confirmButtonText: '刷新页面',
            callback: () => {
              this.handleRefresh()
            }
          })
        })
    },

    /**
     * @description: 长期趋势报告
     */
    handlePDF() {
      this.$router.push({
        path: '/test-oneRM-secular-trend-pdf',
        query: {
          routerName: JSON.stringify('/test-select')
        }
      })
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/test-fast-measure'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-fast-measure {
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
      margin-bottom: 20px;
    }

    .text {
      .item {
        font-size: 22px;
        margin-bottom: 8px;
      }
    }

    .main {
      flex: 1;
      @include flex(row, space-around, center);
      .left {
        @include flex(column, stretch, stretch);
        .item {
          margin: 20px 0;
          font-size: 20px;
        }
      }
      .right {
        @include flex(column, stretch, stretch);
        .item {
          font-size: 20px;
        }
      }
    }

    .dialog-main {
      @include flex(column, stretch, center);
      .item {
        font-size: 22px;
        margin-bottom: 10px;
        font-weight: 700;
        .val {
          font-size: 34px;
          color: green;
        }
      }
    }

    .dialog-footer {
      .item {
        margin: 0 20px;
      }
    }

    .btn {
      margin-top: 20px;
      @include flex(row, center, center);
      .item {
        width: 150px;
        font-size: 22px;
        margin: 0 50px;
      }
    }
  }
}
</style>
