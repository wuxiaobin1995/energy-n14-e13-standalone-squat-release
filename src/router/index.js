/*
 * @Author      : Mr.bin
 * @Date        : 2023-11-21 09:11:54
 * @LastEditTime: 2024-03-22 15:50:12
 * @Description : 路由
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  /*
   * 前面加"/"表示绝对路径，不加"/"表示相对路径
   * 一般嵌套路由中的子路由不需要加"/"，它会在父路由后自动加上"/子路由"
   * 比如父 "/father"，子 "child"，要想访问子路由，跳转链接需要写成 "/father/child"
   */

  {
    path: '/',
    name: 'layout',
    component: () => import('@/layout'),
    redirect: '/home',
    children: [
      // 首页
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home'),
        meta: ['首页']
      },
      // 用户
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user'),
        meta: ['用户']
      },
      // 导出所选用户的数据（测试、训练、......）
      {
        path: 'user-data-output',
        name: 'user-data-output',
        component: () => import('@/views/user-data-output'),
        meta: ['导出所选用户的数据']
      },
      // 添加用户
      {
        path: 'user-add',
        name: 'user-add',
        component: () => import('@/views/user-add'),
        meta: ['添加用户']
      },
      // 用户信息修改
      {
        path: 'user-edit',
        name: 'user-edit',
        component: () => import('@/views/user-edit'),
        meta: ['用户信息修改']
      },
      // 设置运动角度范围
      {
        path: 'set-angularRange',
        name: 'set-angularRange',
        component: () => import('@/views/set/set-angularRange'),
        meta: ['设置运动角度范围']
      },
      // 开发者
      {
        path: 'set-developer',
        name: 'set-developer',
        component: () => import('@/views/set/set-developer'),
        meta: ['开发者']
      },
      // 数据迁移
      {
        path: 'set-data-migration',
        name: 'set-data-migration',
        component: () => import('@/views/set/set-data-migration'),
        meta: ['数据迁移']
      },

      /* 参数配置 */
      // 配置项目选择
      {
        path: 'parameter-select',
        name: 'parameter-select',
        component: () => import('@/views/parameter/select'),
        meta: ['配置项目选择']
      },
      // 训练动作-配置
      {
        path: 'parameter-action',
        name: 'parameter-action',
        component: () => import('@/views/parameter/action'),
        meta: ['训练动作-配置']
      },
      // 通用-配置
      {
        path: 'parameter-current',
        name: 'parameter-current',
        component: () => import('@/views/parameter/current'),
        meta: ['通用-配置']
      },

      /* 测试模块 */
      // 测试项目选择
      {
        path: 'test-select',
        name: 'test-select',
        component: () => import('@/views/test-mode/select'),
        meta: ['测试项目选择']
      },
      // 快速测试-具体测量
      {
        path: 'test-fast-measure',
        name: 'test-fast-measure',
        component: () => import('@/views/test-mode/fast/measure'),
        meta: ['快速测试-具体测量']
      },
      // 精准测试-具体测量
      {
        path: 'test-precise-measure',
        name: 'test-precise-measure',
        component: () => import('@/views/test-mode/precise/measure'),
        meta: ['精准测试-具体测量']
      },
      // 爆发力测试-具体测量
      {
        path: 'test-explosiveness-measure',
        name: 'test-explosiveness-measure',
        component: () => import('@/views/test-mode/explosiveness/measure'),
        meta: ['爆发力测试-具体测量']
      },

      /* 训练模块 */
      // 训练项目选择
      {
        path: 'train-select',
        name: 'train-select',
        component: () => import('@/views/train-mode/select'),
        meta: ['训练项目选择']
      },
      // 肌耐力训练-介绍与参数设置
      {
        path: 'train-endurance-desc',
        name: 'train-endurance-desc',
        component: () => import('@/views/train-mode/endurance/desc'),
        meta: ['肌耐力训练-介绍与参数设置']
      },
      // 肌耐力训练-具体测量
      {
        path: 'train-endurance-measure',
        name: 'train-endurance-measure',
        component: () => import('@/views/train-mode/endurance/measure'),
        meta: ['肌耐力训练-具体测量']
      },
      // 肌肥大训练-介绍与参数设置
      {
        path: 'train-hypertrophy-desc',
        name: 'train-hypertrophy-desc',
        component: () => import('@/views/train-mode/hypertrophy/desc'),
        meta: ['肌肥大训练-介绍与参数设置']
      },
      // 肌肥大训练-具体测量
      {
        path: 'train-hypertrophy-measure',
        name: 'train-hypertrophy-measure',
        component: () => import('@/views/train-mode/hypertrophy/measure'),
        meta: ['肌肥大训练-具体测量']
      },
      // 神经肌肉募集训练-介绍与参数设置
      {
        path: 'train-neuromuscular-desc',
        name: 'train-neuromuscular-desc',
        component: () => import('@/views/train-mode/neuromuscular/desc'),
        meta: ['神经肌肉募集训练-介绍与参数设置']
      },
      // 神经肌肉募集训练-具体测量
      {
        path: 'train-neuromuscular-measure',
        name: 'train-neuromuscular-measure',
        component: () => import('@/views/train-mode/neuromuscular/measure'),
        meta: ['神经肌肉募集训练-具体测量']
      },
      // // 爆发力训练-介绍与参数设置
      // {
      //   path: 'train-explosiveness-desc',
      //   name: 'train-explosiveness-desc',
      //   component: () => import('@/views/train-mode/explosiveness/desc'),
      //   meta: ['爆发力训练-介绍与参数设置']
      // },

      /* 数据记录 */
      // 测试
      {
        path: 'test-record',
        name: 'test-record',
        component: () => import('@/views/record/test'),
        meta: ['测试-数据记录'],
        redirect: '/test-record/oneRM',
        children: [
          // 1RM测试
          {
            path: 'oneRM',
            name: 'oneRM',
            component: () => import('@/views/record/test/oneRM'),
            meta: ['1RM测试']
          },
          // 爆发力测试
          {
            path: 'explosiveness',
            name: 'test-explosiveness',
            component: () => import('@/views/record/test/explosiveness'),
            meta: ['爆发力测试']
          }
        ]
      },
      // 训练
      {
        path: 'train-record',
        name: 'train-record',
        component: () => import('@/views/record/train'),
        meta: ['训练-数据记录'],
        redirect: '/train-record/endurance',
        children: [
          // 肌耐力训练
          {
            path: 'endurance',
            name: 'endurance',
            component: () => import('@/views/record/train/endurance'),
            meta: ['肌耐力训练']
          },
          // 肌肥大训练
          {
            path: 'hypertrophy',
            name: 'hypertrophy',
            component: () => import('@/views/record/train/hypertrophy'),
            meta: ['肌肥大训练']
          },
          // 神经肌肉募集训练
          {
            path: 'neuromuscular',
            name: 'neuromuscular',
            component: () => import('@/views/record/train/neuromuscular'),
            meta: ['神经肌肉募集训练']
          },
          // 爆发力训练
          {
            path: 'explosiveness',
            name: 'train-explosiveness',
            component: () => import('@/views/record/train/explosiveness'),
            meta: ['爆发力训练']
          }
        ]
      }
    ]
  },

  /* 测试报告 */
  // 1RM极限力量测试-长期趋势报告
  {
    path: '/test-oneRM-secular-trend-pdf',
    name: 'test-oneRM-secular-trend-pdf',
    component: () => import('@/views/test-mode/oneRM-pdf'),
    meta: ['1RM极限力量测试-长期趋势报告']
  },
  // 爆发力测试-长期趋势报告
  {
    path: '/test-explosiveness-secular-trend-pdf',
    name: 'test-explosiveness-secular-trend-pdf',
    component: () => import('@/views/test-mode/explosiveness-pdf'),
    meta: ['爆发力测试-长期趋势报告']
  },

  {
    path: '/refresh',
    name: 'refresh',
    component: () => import('@/views/refresh')
  },

  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  routes,
  /* 自定义路由切换时页面如何滚动 */
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 } // 回到顶部
  }
})
export default router
