<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-01 11:34:57
 * @LastEditTime: 2024-02-01 16:58:15
 * @Description : 训练动作-配置
-->
<template>
  <div class="parameter-action">
    <div class="wrapper">
      <!-- 顶部部分 -->
      <div class="top">
        <el-page-header
          title="返回上一页"
          content="训练动作-配置"
          @back="handleBack"
        ></el-page-header>
      </div>

      <!-- 添加动作 -->
      <div class="add">
        <el-input
          class="item"
          v-model.trim="actionName"
          type="text"
          placeholder="请输入动作名称"
          maxlength="20"
          show-word-limit
          clearable
        >
        </el-input>
        <el-button icon="el-icon-circle-plus" type="success" @click="handleAdd"
          >添 加 训 练 动 作</el-button
        >
      </div>

      <!-- 表格 -->
      <el-table
        class="table"
        :data="tableData"
        style="width: 100%"
        height="auto"
        :stripe="false"
        :border="false"
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <!-- No -->
        <el-table-column align="center" type="index" label="No" width="150" />
        <!-- 动作名称 -->
        <el-table-column
          align="center"
          prop="actionName"
          label="动作名称"
        ></el-table-column>

        <!-- 删除按钮 -->
        <el-table-column align="center" label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              @click="handleDelete(scope.$index, scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="primary" @click="handleRefresh"
          >刷 新 页 面</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'parameter-action',

  data() {
    return {
      actionName: '', // 动作名称

      loading: false, // 加载动画
      tableData: [] // 表格显示的数据
    }
  },

  created() {
    this.initTable()
  },

  methods: {
    /**
     * @description: 返回上一页
     */
    handleBack() {
      this.$router.push({
        path: '/parameter-select'
      })
    },

    /**
     * @description: 从LocalStorage获取动作名称数据，用于初始化表格
     */
    initTable() {
      if (!window.localStorage.getItem('actionName')) {
        window.localStorage.setItem('actionName', JSON.stringify([]))
      }

      this.loading = true
      this.tableData = JSON.parse(window.localStorage.getItem('actionName'))
      this.loading = false
    },

    /**
     * @description: 添加动作
     */
    handleAdd() {
      if (this.actionName) {
        this.loading = true

        this.tableData = JSON.parse(window.localStorage.getItem('actionName'))
        this.tableData.push({ actionName: this.actionName })
        window.localStorage.setItem(
          'actionName',
          JSON.stringify(this.tableData)
        )

        this.actionName = ''
        this.loading = false
      }
    },

    /**
     * @description: 删除动作
     * @param {Number} index 该行索引
     * @param {Object} row 某一行数据
     */
    handleDelete(index, row) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true

          this.tableData = JSON.parse(window.localStorage.getItem('actionName'))
          this.tableData.splice(index, 1)
          window.localStorage.setItem(
            'actionName',
            JSON.stringify(this.tableData)
          )

          this.loading = false
        })
        .catch(() => {})
    },

    /**
     * @description: 刷新页面
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/parameter-action'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.parameter-action {
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

    .add {
      @include flex(row, stretch, center);
      margin: 0 100px 20px 100px;
      .item {
        margin-right: 20px;
      }
    }

    .table {
      flex: 1;
    }

    .btn {
      margin-top: 20px;
      @include flex(row, center, center);
      .item {
        font-size: 20px;
      }
    }
  }
}
</style>
