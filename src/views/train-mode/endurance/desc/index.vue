<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-04 11:42:36
 * @LastEditTime: 2024-03-20 08:41:17
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

      <!-- 参数配置 -->
      <div class="set">
        <div class="left">
          <!-- 训练次数 -->
          <div class="item">
            <span class="text">训练次数：</span>
            <el-input-number
              v-model="num"
              :precision="0"
              :step="1"
              :min="15"
              :max="20"
            ></el-input-number>
          </div>
          <!-- 训练组数 -->
          <div class="item">
            <span class="text">训练组数：</span>
            <el-input-number
              v-model="groups"
              :precision="0"
              :step="1"
              :min="2"
              :max="4"
            ></el-input-number>
          </div>
          <!-- 组间休息时长 -->
          <div class="item">
            <span class="text">组间休息时长：</span>
            <el-input-number
              v-model="groupRestTime"
              :precision="0"
              :step="1"
              :min="35"
              :max="45"
            ></el-input-number>
          </div>
        </div>

        <div class="right">
          <!-- 后端配重 -->
          <div class="item">
            <span class="text">后端配重（kg）：</span>
            <el-input-number
              v-model="backWeight"
              :step="5"
              :min="0"
              :max="165"
              :precision="1"
              @change="handleChangeBackWeight"
            ></el-input-number>
          </div>
          <!-- 前端配重 -->
          <div class="item">
            <span class="text">前端配重（kg）：</span>
            <el-input-number
              v-model="frontWeight"
              :step="5"
              :min="0"
              :max="1000"
              :precision="1"
              @change="handleChangeFrontWeight"
            ></el-input-number>
          </div>
          <!-- 实际配重 -->
          <div class="item">
            <span class="text">实际配重（kg）：</span>
            <span class="text">{{ weight }}</span>
          </div>
        </div>
      </div>

      <div class="rhythm">
        <div class="item">
          <span class="text">运动节奏：</span>
          <span>2 - 0 - 2</span>
        </div>
      </div>

      <div class="btn">
        <el-button class="item" type="primary" @click="handleStart"
          >确 定</el-button
        >
        <el-button class="item" type="danger" @click="handleRefresh"
          >刷 新 页 面</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'train-endurance-desc',

  data() {
    return {
      num: 15, // 训练次数，15~20
      groups: 2, // 训练组数，2~4
      groupRestTime: 35, // 组间休息时长(s)，35~45
      backWeight: 0, // 后端配重（kg），0~165kg，（165kg接近配平）
      frontWeight: 0, // 前端配重（kg）
      weight: 0 // 实际配重（kg）
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
        path: '/train-select'
      })
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/train-endurance-desc'),
          duration: JSON.stringify(300)
        }
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
     * @description: 确定
     */
    handleStart() {
      this.$router.push({
        path: '/train-endurance-measure',
        query: {
          num: JSON.stringify(this.num), // 训练次数
          groups: JSON.stringify(this.groups), // 训练组数
          groupRestTime: JSON.stringify(this.groupRestTime), // 组间休息时长
          weight: JSON.stringify(this.weight), // 实际配重（kg）
          type: JSON.stringify('肌耐力训练'),
          routerName: JSON.stringify('/train-endurance-desc')
        }
      })
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
      font-size: 26px;
      font-weight: 700;
      margin-top: 12px;
    }

    .set {
      flex: 1;
      @include flex(row, space-around, center);
      .item {
        margin: 60px 0;
        .text {
          font-size: 22px;
        }
      }
    }

    .rhythm {
      font-size: 22px;
      font-weight: 700;
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
