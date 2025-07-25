/*
 * @Author: wshikh wangshi@kaihong.com
 * @Date: 2023-12-10 10:34:10
 * @LastEditors: wshikh wangshi@kaihong.com
 * @LastEditTime: 2023-12-10 15:11:33
 * @FilePath: \elec_wukong\src\frontend\src\api\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import storage from 'store2'
import request from '@/utils/request'

/**
 * 路由定义（主进程与渲染进程通信频道定义）
 */
const ipcApiRoute = {
  // framework
  test: 'controller.framework.test',
  checkForUpdater: 'controller.framework.checkForUpdater',
  downloadApp: 'controller.framework.downloadApp',
  dbOperation: 'controller.framework.dbOperation',
  sqlitedbOperation: 'controller.framework.sqlitedbOperation',
  uploadFile: 'controller.framework.uploadFile',
  checkHttpServer: 'controller.framework.checkHttpServer',
  doHttpRequest: 'controller.framework.doHttpRequest',
  doSocketRequest: 'controller.framework.doSocketRequest',
  ipcInvokeMsg: 'controller.framework.ipcInvokeMsg',
  ipcSendSyncMsg: 'controller.framework.ipcSendSyncMsg',
  ipcSendMsg: 'controller.framework.ipcSendMsg',
  startJavaServer: 'controller.framework.startJavaServer',
  closeJavaServer: 'controller.framework.closeJavaServer',
  someJob: 'controller.framework.someJob',
  timerJobProgress: 'controller.framework.timerJobProgress',
  createPool: 'controller.framework.createPool',
  createPoolNotice: 'controller.framework.createPoolNotice',
  someJobByPool: 'controller.framework.someJobByPool',
  hello: 'controller.framework.hello',
  openSoftware: 'controller.framework.openSoftware', 
  execSoftware:'controller.framework.execSoftware', 
  ipcRunCmd: 'controller.framework.ipcRunCmd',
  createFile: 'controller.framework.createFile',
  readLogs: 'controller.framework.readLogs',
  fileRecvSnapshort: 'controller.framework.fileRecvSnapshort',
  filesRecv: 'controller.framework.filesRecv',
  readImgFile: 'controller.framework.readImgFile',

  // os
  messageShow: 'controller.os.messageShow',
  messageShowConfirm: 'controller.os.messageShowConfirm',
  selectFolder: 'controller.os.selectFolder',
  openDirectory: 'controller.os.openDirectory',
  loadViewContent: 'controller.os.loadViewContent',
  removeViewContent: 'controller.os.removeViewContent',
  createWindow: 'controller.os.createWindow',
  getWCid: 'controller.os.getWCid',
  sendNotification: 'controller.os.sendNotification',
  initPowerMonitor: 'controller.os.initPowerMonitor',
  getScreen: 'controller.os.getScreen',
  autoLaunch: 'controller.os.autoLaunch',
  setTheme: 'controller.os.setTheme',
  getTheme: 'controller.os.getTheme',
  createTerminal: 'controller.os.createTerminal',
  runTerminal: 'controller.os.runTerminal',

  // hardware
  getPrinterList: 'controller.hardware.getPrinterList',
  print: 'controller.hardware.print',
  printStatus: 'controller.hardware.printStatus',

  // effect
  selectFile: 'controller.effect.selectFile',
}

/**
 * 特殊的路由（频道）定义
 */
const specialIpcRoute = {
  appUpdater: 'app.updater', // 此频道在后端也有相同定义
  window1ToWindow2: 'window1-to-window2', // 窗口之间通信
  window2ToWindow1: 'window2-to-window1', // 窗口之间通信
}

/**
 * 访问内置http服务
 */
const requestHttp = (uri, parameter) => {
  // url转换
  const config = storage.get('httpServiceConfig');
  const host = config.server || 'http://localhost:7071';
  let url = uri.split('.').join('/');
  url = host + '/' + url;
  console.log('url:', url);
  return request({
    url: url,
    method: 'post', 
    data: parameter, // body
    params: {}, // URL 参数
    timeout: 60000,
  })
}

export {
  ipcApiRoute,
  specialIpcRoute,
  requestHttp,
}
