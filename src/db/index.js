/*
 * @Author      : Mr.bin
 * @Date        : 2022-07-28 10:28:30
 * @LastEditTime: 2023-11-21 10:11:54
 * @Description : Dexie
 */
import Dexie from 'dexie'

export function initDB() {
  const db = new Dexie('Energy_N14_E13_Standalone_Squat_Release') // 与项目名保持一致
  db.version(1).stores({
    user: 'userId,userName',
    train_data:
      '++,userId,pdfTime,action,[userId+pdfTime],[userId+action],[userId+action+pdfTime]'
  })
  return db
}
