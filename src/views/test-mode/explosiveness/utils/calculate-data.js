/*
 * @Author      : 吴晓斌
 * @Date        : 2020-09-11 15:49:43
 * @LastEditTime: 2024-02-06 15:24:02
 * @Description : 数据计算方法
 */

/**
 * @description: 爆发力运动
 * @param {Array} angularVelocityArray 角速度数组[rad/s]
 * @param {Number} dropWeight 传感器所在点的负重[kg]
 * @return: {Object}
 */
export function calculateData(angularVelocityArray = [], dropWeight = 1) {
  /* 峰值功率[W] */
  let power = 0 // 瞬时功率值
  const powerDataArray = [] // 瞬时功率数组
  for (let i = 0; i < angularVelocityArray.length; i++) {
    power = parseFloat(
      (dropWeight * 10 * angularVelocityArray[i] * 0.1).toFixed(0)
    )
    powerDataArray.push(power)
  }
  const maxPower = Math.max(...powerDataArray) ? Math.max(...powerDataArray) : 0

  /* 峰值角速度[rad/s] */
  const maxAngularVelocity = Math.max(...angularVelocityArray)
    ? Math.max(...angularVelocityArray)
    : 0

  /* 返回计算结果 */
  return {
    maxPower, // 峰值功率[W]
    maxAngularVelocity // 峰值角速度[rad/s]
  }
}
