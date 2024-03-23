<!--
 * @Author      : Mr.bin
 * @Date        : 2024-02-04 10:17:59
 * @LastEditTime: 2024-03-22 11:14:57
 * @Description : 肌耐力训练-数据记录
-->
<template>
  <div class="endurance">
    <!-- 顶部 -->
    <div class="top">
      <!-- 返回首页 -->
      <el-page-header
        title="返回首页"
        content="肌耐力训练"
        @back="handleToHome"
      ></el-page-header>
      <!-- 日期筛选 -->
      <el-date-picker
        v-model="selectDateValue"
        type="daterange"
        :picker-options="pickerOptions"
        range-separator="——"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        :editable="false"
        :clearable="false"
        :unlink-panels="true"
        align="right"
        @change="changeData"
      >
      </el-date-picker>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      class="table"
      style="width: 100%"
      height="auto"
      :default-sort="{ prop: 'pdfTime', order: 'descending' }"
      :stripe="false"
      :border="true"
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <!-- No -->
      <el-table-column align="center" type="index" label="No" width="80" />
      <!-- 用户姓名 -->
      <el-table-column
        align="center"
        prop="userName"
        label="用户姓名"
        width="250"
      />
      <!-- 完成度 -->
      <el-table-column
        align="center"
        prop="completion"
        label="完成度%"
        width="165"
      />
      <!-- 训练时间 -->
      <el-table-column
        align="center"
        prop="pdfTime"
        label="训练时间"
        sortable
      />

      <!-- 删除按钮 -->
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            @click="handleDelete(scope.$index, scope.row)"
            >删 除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 按钮组 -->
    <div class="btn">
      <el-button class="item" type="primary" @click="handleRefresh"
        >刷新页面</el-button
      >
    </div>
  </div>
</template>

<script>
import { initDB } from '@/db/index.js'

export default {
  name: 'endurance',

  data() {
    return {
      tableData: [],
      allData: [],

      loading: false, // 加载动画

      // 日期选择器的筛选值
      selectDateValue: [
        this.$moment().format('YYYY-MM-DD 00:00:00'),
        this.$moment().format('YYYY-MM-DD 23:59:59')
      ],
      /* 日期选择器快捷选项 */
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
              end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一周',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '该用户所有数据',
            onClick(picker) {
              const start = new Date(new Date().setHours(0, 0, 0))
              const end = new Date(new Date().setHours(23, 59, 59))
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 36000)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },

  created() {
    this.initTable()
  },

  methods: {
    /**
     * @description: 返回首页
     */
    handleToHome() {
      this.$router.push({
        path: '/home'
      })
    },

    /**
     * @description: 初始化表格
     */
    initTable() {
      const db = initDB()
      this.loading = true
      db.train_data
        .where({
          userId: this.$store.state.currentUserInfo.userId,
          type: '肌耐力训练'
        })
        .toArray()
        .then(res => {
          this.tableData = res
          this.allData = res
        })
        .catch(err => {
          this.$confirm(`${err}。获取数据失败，请点击刷新按钮重试！`, '提示', {
            type: 'warning',
            center: true,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            confirmButtonText: '刷 新',
            cancelButtonText: '返回首页'
          })
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleToHome()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 根据日期选择获取表格数据
     */
    getData() {
      const db = initDB()
      this.loading = true
      db.train_data
        .where(['userId', 'type', 'pdfTime'])
        .between(
          [
            this.$store.state.currentUserInfo.userId,
            '肌耐力训练',
            this.selectDateValue[0]
          ],
          [
            this.$store.state.currentUserInfo.userId,
            '肌耐力训练',
            this.selectDateValue[1]
          ],
          true,
          true
        )
        .toArray()
        .then(res => {
          this.tableData = res
        })
        .catch(err => {
          this.$confirm(`${err}。获取数据失败，请点击刷新按钮重试！`, '提示', {
            type: 'warning',
            center: true,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            confirmButtonText: '刷 新',
            cancelButtonText: '返回首页'
          })
            .then(() => {
              this.handleRefresh()
            })
            .catch(() => {
              this.handleToHome()
            })
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 用户确认选定的值时触发
     * @param {*} value 选择的日期数组
     */
    changeData(value) {
      this.selectDateValue = value
      this.getData()
    },

    /**
     * @description: 删除按钮
     * @param {*} index
     * @param {*} row
     */
    handleDelete(index, row) {
      this.$confirm('此操作将"永久删除"该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const db = initDB()
          db.train_data
            .where({
              userId: row.userId,
              type: '肌耐力训练',
              pdfTime: row.pdfTime
            })
            .delete()
            .then(() => {
              this.$message({
                message: '删除成功',
                type: 'success',
                duration: 1500
              })
            })
            .then(() => {
              this.getData()
            })
            .catch(() => {
              this.$alert(`删除失败，请刷新页面后重试！`, '警告', {
                type: 'error',
                showClose: false,
                confirmButtonText: '刷新页面',
                callback: () => {
                  this.handleRefresh()
                }
              })
            })
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
          routerName: JSON.stringify('/train-record/endurance'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.endurance {
  width: 100%;
  height: 90%;
  @include flex(column, stretch, center);

  /* 顶部 */
  .top {
    width: 100%;
    margin: 20px 0;
    @include flex(row, space-between, center);
  }

  /* 表格 */
  .table {
    flex: 1;
  }

  /* 长期趋势 */
  .btn {
    margin-top: 20px;
    @include flex(row, center, center);
    .item {
      font-size: 22px;
      margin: 0 50px;
    }
  }
}
</style>
