/*
 * @Author      : Mr.bin
 * @Date        : 2023-11-21 09:11:54
 * @LastEditTime: 2024-01-31 09:12:43
 * @Description : Vuex
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* 当前选择的用户及其信息 */
    currentUserInfo: {
      userId: '', // 唯一id
      userName: '', // 姓名
      sex: '', // 性别
      height: '', // 身高
      weight: '', // 体重
      birthday: '', // 出生日期
      angularRange: '', // 运动角度范围(°)，用于设定训练模式的角度范围，是一个相对值
      lastLoginTime: '' // 最后登录时间
    }
  },

  mutations: {
    /* 当前选择的用户及其信息 */
    CHANGE_CURRENTUSERINFO(state, currentUserInfo) {
      state.currentUserInfo = currentUserInfo
    }
  },

  actions: {
    /* 当前选择的用户及其信息 */
    changeCurrentUserInfo({ commit }, currentUserInfo) {
      return new Promise((resolve, reject) => {
        commit('CHANGE_CURRENTUSERINFO', currentUserInfo)
        resolve()
      })
    }
  }
})
