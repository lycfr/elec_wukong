'use strict';

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { exec, execSync } = require('child_process');
const { Controller } = require('ee-core');
const { app: electronApp, shell, MenuItem } = require('electron');
const dayjs = require('dayjs');
const Ps = require('ee-core/ps');
const Log = require('ee-core/log');
const Utils = require('ee-core/utils');
const Conf = require('ee-core/config');

var shellList = []

/**
 * electron-egg framework - 功能demo
 * @class
 */
class FrameworkController extends Controller {
  constructor(ctx) {
    super(ctx);

    this.memTraceTimer = null;
  }

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test() {
    const result = await this.service.framework.test('electron');

    // let tmpDir = Ps.getLogDir();
    // Log.info('tmpDir:', tmpDir);

    let mid = await Utils.machineIdSync(true);
    Log.info('mid 11111111:', mid);

    Utils.machineId().then((id) => {
      Log.info('mid 222222222:', id);
    });

    return result;
  }

  /**
   * json数据库操作
   */   
  async dbOperation(args) {
    const { service } = this;
    const paramsObj = args;
    //Log.info('eeeee paramsObj:', paramsObj);
    const data = {
      action: paramsObj.action,
      result: null,
      all_list: []
    };
    
    switch (paramsObj.action) {
      case 'add' :
        data.result = await service.storage.addTestData(paramsObj.info);;
        break;
      case 'del' :
        data.result = await service.storage.delTestData(paramsObj.delete_name);;
        break;
      case 'update' :
        data.result = await service.storage.updateTestData(paramsObj.update_name, paramsObj.update_age);
        break;
      case 'get' :
        data.result = await service.storage.getTestData(paramsObj.search_age);
        break;
    }

    data.all_list = await service.storage.getAllTestData();

    return data;
  }

  /**
   * sqlite数据库操作
   */   
  async sqlitedbOperation(args) {
    const { service } = this;
    const paramsObj = args;
    //Log.info('eeeee paramsObj:', paramsObj);
    const data = {
      action: paramsObj.action,
      result: null,
      all_list: []
    };
    
    switch (paramsObj.action) {
      case 'add' :
        data.result = await service.storage.addTestDataSqlite(paramsObj.info);;
        break;
      case 'del' :
        data.result = await service.storage.delTestDataSqlite(paramsObj.delete_name);;
        break;
      case 'update' :
        data.result = await service.storage.updateTestDataSqlite(paramsObj.update_name, paramsObj.update_age);
        break;
      case 'get' :
        data.result = await service.storage.getTestDataSqlite(paramsObj.search_age);
        break;
      case 'getDataDir' :
        data.result = await service.storage.getDataDir();
        break;
      case 'setDataDir' :
        data.result = await service.storage.setCustomDataDir(paramsObj.data_dir);
        break;            
    }

    data.all_list = await service.storage.getAllTestDataSqlite();

    return data;
  }  

  /**
   * 调用其它程序（exe、bash等可执行程序）
   */
  async openSoftware(args, event) {
    const { softName } = args;
    const channel = 'controller.framework.openSoftware';
    let result = "";
    var arr = [];
    let iconv = require('iconv-lite');
    if (!softName) {
      return false;
    }

    // 命令行字符串 并 执行
    let cmdStr = softName;
    let workerProcess = exec(cmdStr, {encoding:'GBK'});
    workerProcess.stdout.on('data', function (data) {
      arr = []
      arr.push(data);
      console.log('stdout:', data);
      result = iconv.decode(Buffer.from(data), 'GBK')
        const trimmedStr = result.replace(/\n+$/, '');
        console.log(trimmedStr);
        event.sender.send(`${channel}`, trimmedStr)
    });
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    // 退出之后的输出
    workerProcess.on('close', function (code) {
        result = iconv.decode(Buffer.concat(arr), 'GBK')
        console.log(result);
        console.log('out code：' + code);
    })
    shellList.push(workerProcess)
    workerProcess.stdin.write("ls\n")
    return true;
  }

  execSoftware(softName) {
    if (!softName) {
      return false;
    }
    let result = "";
    var arr = [];
    let iconv = require('iconv-lite');
    let softwarePath = path.join(Ps.getExtraResourcesDir(), softName);
    Log.info('[execSoftware] softwarePath:', softwarePath);

    // 检查程序是否存在
    // if (!fs.existsSync(softwarePath.split(" ")[0])) {
    //   Log.info('[execSoftware] cant not find softwarePath:', softwarePath.split(" ")[0]);
    //   return false;
    // }
    // 命令行字符串 并 执行
    let cmdStr = 'execute: ' + softwarePath;
    cmdStr = "ipconfig"
    let workerProcess = exec(cmdStr, {encoding:'GBK'});
    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on('data', function (data) {
      arr.push(data);
      console.log(data);
    });
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    // 退出之后的输出
    workerProcess.on('close', function (code) {
        result = iconv.decode(Buffer.concat(arr), 'GBK')
        console.log(result);
        console.log('out code：' + code);
    })

    return result
  } 
  
  /**
   * 检查是否有新版本
   */
  checkForUpdater() { 
    const autoUpdaterAddon = this.app.addon.autoUpdater;
    autoUpdaterAddon.checkUpdate();  

    return;
  }

  /**
   * 下载新版本
   */
  downloadApp() {
    const autoUpdaterAddon = this.app.addon.autoUpdater;
    autoUpdaterAddon.download();
    return;
  }

  /**
   * 检测http服务是否开启
   */ 
  async checkHttpServer() {
    const httpServerConfig = Conf.getValue('httpServer');
    const url = httpServerConfig.protocol + httpServerConfig.host + ':' + httpServerConfig.port;

    const data = {
      enable: httpServerConfig.enable,
      server: url
    }
    return data;
  }

  /**
   * 一个http请求访问此方法
   */ 
  async doHttpRequest() {
    // http方法
    const method = this.app.request.method;
    // http get 参数
    let params = this.app.request.query;
    params = (params instanceof Object) ? params : JSON.parse(JSON.stringify(params));
    // http post 参数
    const body = this.app.request.body;

    const httpInfo = {
      method,
      params,
      body
    }
    Log.info('httpInfo:', httpInfo);

    if (!body.id) {
      return false;
    }
    const dir = electronApp.getPath(body.id);
    shell.openPath(dir);
    
    return true;
  } 
 
  /**
   * 一个socket io请求访问此方法
   */ 
  async doSocketRequest(args) {
    if (!args.id) {
      return false;
    }
    const dir = electronApp.getPath(args.id);
    shell.openPath(dir);
    
    return true;
  }
  
  /**
   * 异步消息类型
   */ 
  async ipcInvokeMsg(args, event) {
    let timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const data = args + ' - ' + timeNow;
    
    return data;
  }  

  /**
   * 同步消息类型
   */ 
  async ipcSendSyncMsg(args) {
    let timeNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const data = args + ' - ' + timeNow;
    
    return data;
  }  

  /**
   * 双向异步通信
   */
  async ipcSendMsg(args, event) {
    const { type, content } = args;
    const data = await this.service.framework.bothWayMessage(type, content, event);

    return data;
  }

  async runShellCmdSync(event, channel, type, content) {
    let cmdStr = content
    let result = "";
    var arr = [];
    let iconv = require('iconv-lite');
    console.log("runShellCmd:", type, content)
    let testout = execSync(cmdStr, {cwd: Ps.getExtraResourcesDir()});
    console.log("testout:", testout)
    // arr.push(testout);
    // result = iconv.decode(Buffer.concat(arr), 'GBK')
    // // 打印正常的后台可执行程序输出
    // workerProcess.stdout.on('data', function (data) {
    //   arr.push(data);
    //   if (type.indexOf("hdcHidumperMem") != 0 && type.indexOf("hdcParamGet") != 0) {
    //     result = iconv.decode(Buffer.concat(arr), 'GBK')
    //     console.log("stdout:", result);
    //     event.reply(`${channel}`, type+":"+result)
    //     arr = []
    //   }
    // });
    // // 打印错误的后台可执行程序输出
    // workerProcess.stderr.on('data', function (data) {
    //     console.log('stderr:' + data);
    // });
    // // 退出之后的输出
    // workerProcess.on('close', function (code) {
    //     result = iconv.decode(Buffer.concat(arr), 'GBK')
    //     event.reply(`${channel}`, type+":"+result)
    //     arr = []
    //     // console.log(result);
    //     // console.log('out code：' + code);
    // })
    event.reply(`${channel}`, type+":"+testout)
    console.log("ipcRunCmd finished: ", type)
  }

  async runShellCmd(event, channel, type, content) {
    let cmdStr = content
    let result = "";
    var arr = [];
    let splitChar = "^@^"
    let iconv = require('iconv-lite');
    console.log("runShellCmd:", type, content)
    event.reply(`${channel}`, type+"-start")
    let workerProcess = exec(cmdStr, {cwd: Ps.getExtraResourcesDir(), encoding:'GBK'});
    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on('data', function (data) {
      arr.push(data);
      if (type.indexOf("hdcHidumperMem") != 0 && type.indexOf("hdcParamGet") != 0) {
        result = iconv.decode(Buffer.concat(arr), 'GBK')
        console.log("stdout:", result);
        event.reply(`${channel}`, type+splitChar+result)
        arr = []
      }
    });
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
        console.log('stderr:' + data);
    });
    // 退出之后的输出
    workerProcess.on('close', function (code) {
        result = iconv.decode(Buffer.concat(arr), 'GBK')
        event.reply(`${channel}`, type+"-close"+splitChar+result)
        arr = []
        // console.log(result);
        // console.log('out code：' + code);
    })
    event.reply(`${channel}`, content)
    console.log("ipcRunCmd finished: ", type)
  }

  async startMemTraceTimer(type, intertime, event, channel, content, replyType, devid) {
      const data = await this.service.framework.doMemTraceTimer(type, intertime, channel, content, event, (e, c, msg) => {
        let timeNow = Date.now();
        let data = msg + ':' + timeNow;
        console.log("startMemTrace doMemTraceTimer:", data)
        this.runShellCmd(event, channel, replyType+"-"+devid[0], msg[0])
        e.reply(`${c}`, data)
      });
      return data
  }

  async stopMemTraceTimer(type, intertime, event, channel, content) {
    console.log("stopMemTraceTimer: ", this.memTraceTimer)
    const data = await this.service.framework.doMemTraceTimer(type, intertime, channel, content, event);
    return data
  }

  async ipcRunCmd(args, event) {
    const { type, content, intertime, devid, replyType } = args;
    // const data = await this.service.framework.bothWayMessage(type, content, event);

    /**
     * ipc通信(双向)
     */
    {
      // 前端ipc频道 channel
      const channel = 'controller.framework.ipcRunCmd';
      console.log("ipcRunCmd type: [", type, "], content: ", content)
      if (type == 'start') {
        this.runShellCmd(event, channel, type, content)
        return '开始了'
      } else if (type == 'end') {
        console.log("ipcRunCmd end: ", type)
        event.reply(`${channel}`, content)
        return '停止了'    
      } else if (type == 'hdcListTargets') {
        console.log("ipcRunCmd type: ", type)
        this.runShellCmd(event, channel, type, content)
        return '停止了'
      } else if (type == 'hdcParamGet') {
        console.log("ipcRunCmd type: ", type)
        this.runShellCmd(event, channel, type, content)
        return '停止了'
      } else if (type == 'startMemTrace') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.startMemTraceTimer(type, intertime, event, channel, content, replyType, devid)
      } else if (type == 'stopMemTrace') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.stopMemTraceTimer(type, intertime, event, channel, content)
      } else if (type == 'startFaultTrace') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.startMemTraceTimer(type, intertime, event, channel, content, replyType, devid)
      } else if (type == 'stopFaultTrace') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.stopMemTraceTimer(type, intertime, event, channel, content)
      } else if (type == 'hdcHidumperMem') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcHidumperFault') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcSnapshotDisplay') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcWuKong') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'taskSnapshot') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcShellcmd') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcShellbm') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcUinput') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcParam') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcBmDumpall') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcBmDumpn') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else if (type == 'hdcProcessInfo') {
        console.log("ipcRunCmd type: ", type, intertime)
        // this.runShellCmd(event, channel, type, content)
        return this.runShellCmd(event, channel, type+"-"+devid, content)
      } else {
        return 'ohther'
      }
    }
  }

  /**
   * 上传文件
   */  
  async uploadFile() {
    let tmpDir = Ps.getLogDir();
    const files = this.app.request.files;
    let file = files.file;
    
    let tmpFilePath = path.join(tmpDir, file.originalFilename);
    try {
      let tmpFile = fs.readFileSync(file.filepath);
      fs.writeFileSync(tmpFilePath, tmpFile);
    } finally {
      await fs.unlink(file.filepath, function(){});
    }
    const fileStream = fs.createReadStream(tmpFilePath);
    const uploadRes = await this.service.framework.uploadFileToSMMS(fileStream);

    return uploadRes;
  }
  
  getLogs(logpath) {
    let taskLogs = []
    let files = fs.readdirSync(logpath)
    for (let i=0;i<files.length;i++) {
      let devid = files[i];
      let deviceLogDir = path.join(logpath, devid);
      let chfiles = fs.readdirSync(deviceLogDir)
      for (let j=0;j<chfiles.length;j++) {
        let taskDir = chfiles[j]
        console.log(taskDir);
        let taskFileName = taskDir+"-"+devid+".txt"
        let taskPath = path.join(deviceLogDir, taskDir)
        let taskLogFile = path.join(taskPath, taskFileName)
        try {
          let fileData = fs.readFileSync(taskLogFile, {encoding:'utf8', flag:'r'})
          let jsonObj = JSON.parse(fileData)
          console.log("fileData:", jsonObj.caseName, jsonObj.devid, jsonObj.pageName);
          let logItem = {
            devid: devid,
            taskName: chfiles[j],
            jsonObj: jsonObj
          }
          taskLogs.push(logItem)
        } catch (err) {
          console.log("file not exists :", taskLogFile);
        }
      }
    }
    // console.log("getlogs:", taskLogs)
    return taskLogs
  }

  async readLogs(args, event) {
    const channel = 'controller.framework.readlogs';
    let tmpDir = Ps.getLogDir();
    let tmpDirPath = path.join(tmpDir, "./taskresult");
    let taskLogs = this.getLogs(tmpDirPath)
    console.log("readLogs: ", taskLogs)
    event.reply(`${channel}`, JSON.stringify(taskLogs))
    return JSON.stringify(taskLogs);
  }

  async createFile(args, event) {
    const { fileName, devid, data, taskName } = args;
    
    let tmpDir = Ps.getLogDir();
    let tmpDirPath = path.join(tmpDir, "./taskresult");
    let tmpDevDirPath = path.join(tmpDirPath, devid);
    let tmpDevTaskDirPath = path.join(tmpDevDirPath, taskName);
    let tmpFilePath = path.join(tmpDevTaskDirPath, fileName);
    
    console.log("createFile:", tmpFilePath)
    try {
      let isExist = await this.getStat(tmpDirPath)
      if (!(isExist && isExist.isDirectory())) {
        fs.mkdirSync(tmpDirPath)
      }
      isExist = await this.getStat(tmpDevDirPath)
      if (!(isExist && isExist.isDirectory())) {
        fs.mkdirSync(tmpDevDirPath)
      }
      isExist = await this.getStat(tmpDevTaskDirPath)
      if (!(isExist && isExist.isDirectory())) {
        fs.mkdirSync(tmpDevTaskDirPath)
      }
      fs.writeFileSync(tmpFilePath, data);
    } finally {
      // await fs.unlink(tmpFilePath, function(){});
      console.log("createFile "+tmpFilePath+" success!")
    }
    return "createFile";
  }

  async getStat(filePath) {
    return new Promise((resolve, rejest) => {
      // console.log("getStat:", filePath)
      fs.stat(filePath, (err, stats) => {
        if (err) {
          // console.log("getStat err:", err)
          resolve(false)
        } else {
          // console.log("getStat true:", stats)
          resolve(stats)
        }
      })
    })
  }

  async readImgFile(args, event) {
    const { filepath } = args
    const channel = 'controller.framework.readImgFile';
    let resdata = {
      img_list: []
    };
    console.log("readImgFile:", filepath)
    
    const data = fs.readFileSync(filepath)
    const finfo = fs.statSync(filepath)
    console.log("fstat:", finfo)
    
    sharp(filepath)
      .metadata()
      .then(info => {
        console.log(`Image width: ${info.width}`);
        console.log(`Image height: ${info.height}`);
        // event.sender.send(`${channel}`, "readImgFile:")
        event.sender.send(`${channel}`, "readImgFile:"+info.width+":"+info.height)
      })
      .catch(err => {
        console.error(err);
      });
      
    let imgsrc = "data:image/jpg;base64," + data.toString('base64')
    // console.log("imgsrc:", imgsrc)
    // let imgsrc_list = []
    // imgsrc_list.push(imgsrc)
    // console.log("push imgsrc_list:", imgsrc_list.length)
    resdata.img_list.push(imgsrc)
    console.log("push:", resdata.img_list.length)
    
    return resdata
  }

  async fileRecvSnapshort(args, event) {
    const { type, devid, content, taskName, filepath, outpath, outname } = args;
    
    let tmpDir = Ps.getLogDir();
    let tmpDirPath = path.join(tmpDir, "./taskresult");
    let tmpDevDirPath = path.join(tmpDirPath, devid);
    let tmpDevTaskDirPath = path.join(tmpDevDirPath, taskName);
    let tmpSnapshotDirPath = path.join(tmpDevTaskDirPath, outpath);

    const channel = 'controller.framework.ipcRunCmd';
    // console.log("fileRecvSnapshort dirpath:", tmpSnapshotDirPath)
    try {
      let isExist = await this.getStat(tmpDirPath)
      if (!(isExist && isExist.isDirectory())) {
        fs.mkdirSync(tmpDirPath)
      }
      isExist = await this.getStat(tmpDevDirPath)
      if (!(isExist && isExist.isDirectory())) {
        fs.mkdirSync(tmpDevDirPath)
      }
      isExist = await this.getStat(tmpDevTaskDirPath)
      if (!(isExist && isExist.isDirectory())) {
        fs.mkdirSync(tmpDevTaskDirPath)
      }
      isExist = await this.getStat(tmpSnapshotDirPath)
      if (!(isExist && isExist.isDirectory())) {
        fs.mkdirSync(tmpSnapshotDirPath)
      }
      let cmdstr = content + " " + tmpSnapshotDirPath
      console.log("cmd:", cmdstr)
      
      if (filepath) {
        console.log("filepath : ", filepath, )
        if (filepath.charAt(filepath.length-1) == "/") {
          cmdstr = "hdc_std.exe -t " + devid + " shell tar czvf /data/local/tmp/filerecv.tar.gz " + filepath
          // await this.runShellCmd(event, channel, type+"-"+devid, cmdstr)
          cmdstr += " & hdc_std.exe -t " + devid + " file recv /data/local/tmp/filerecv.tar.gz " + tmpDevTaskDirPath
          // await this.runShellCmd(event, channel, type+"-"+devid, cmdstr)
          cmdstr += " & hdc_std.exe -t " + devid + " shell rm /data/local/tmp/filerecv.tar.gz"
          await this.runShellCmd(event, channel, type+"-"+devid, cmdstr)
        } else if (outname.length > 0) {
          this.runShellCmd(event, channel, type+"-"+devid, cmdstr+"/"+outname)  
        } else {
          this.runShellCmd(event, channel, type+"-"+devid, cmdstr)  
        }
      } 
    } finally {
      // await fs.unlink(tmpFilePath, function(){});
      console.log("fileRecvSnapshort "+tmpSnapshotDirPath+" success!")
    }
    return "fileRecvSnapshort";
  }

  async filesRecv(args, event) {
    const { type, devid, content, taskName, filespath, outpath } = args;
    let tmpDir = Ps.getLogDir();
    let tmpDirPath = path.join(tmpDir, "./taskresult");
    let tmpDevDirPath = path.join(tmpDirPath, devid);
    let tmpDevTaskDirPath = path.join(tmpDevDirPath, taskName);
    const channel = 'controller.framework.ipcRunCmd';
    let cmdList = []
    try {
      for (let i=0;i<filespath.length>1;i++) {
        let cmdstr = ""
        let filepath = filespath[i]
        let tmpSnapshotDirPath = path.join(tmpDevTaskDirPath, outpath[i]);
        let isExist = await this.getStat(tmpDirPath)
        if (!(isExist && isExist.isDirectory())) {
          fs.mkdirSync(tmpDirPath)
        }
        isExist = await this.getStat(tmpDevDirPath)
        if (!(isExist && isExist.isDirectory())) {
          fs.mkdirSync(tmpDevDirPath)
        }
        isExist = await this.getStat(tmpDevTaskDirPath)
        if (!(isExist && isExist.isDirectory())) {
          fs.mkdirSync(tmpDevTaskDirPath)
        }
        isExist = await this.getStat(tmpSnapshotDirPath)
        if (!(isExist && isExist.isDirectory())) {
          fs.mkdirSync(tmpSnapshotDirPath)
        }
        cmdstr = content + " " + tmpSnapshotDirPath
        console.log("cmd:", cmdstr)
        
        if (filepath) {
          console.log("filepath : ", filepath)
          if (filepath.charAt(filepath.length-1) == "/") {
            cmdstr = "hdc_std.exe -t " + devid + " shell tar czvf /data/local/tmp/filerecv.tar.gz " + filepath
            // await this.runShellCmd(event, channel, type+"-"+devid, cmdstr)
            cmdstr += " & hdc_std.exe -t " + devid + " file recv /data/local/tmp/filerecv.tar.gz " + tmpDevTaskDirPath
            // await this.runShellCmd(event, channel, type+"-"+devid, cmdstr)
            cmdstr += " & hdc_std.exe -t " + devid + " shell rm /data/local/tmp/filerecv.tar.gz"
            // this.runShellCmd(event, channel, type+"-"+devid, cmdstr)
          } 
          // else {
          //   // this.runShellCmd(event, channel, type+"-"+devid, cmdstr)  
          // }
        }

        cmdList.push(cmdstr)
      }

      let mergedCmd = ""
      for (let j=0;j<cmdList.length;j++) {
        if (j < cmdList.length-1) {
          mergedCmd += cmdList[j] + " & "
        } else {
          mergedCmd += cmdList[j]
        }
      }
      console.log("mergedCmd: ", mergedCmd)
      this.runShellCmd(event, channel, type+"-"+devid, mergedCmd)

    } finally {
      // await fs.unlink(tmpFilePath, function(){});
      console.log("filesRecv "+tmpSnapshotDirPath+" success!")
    }
        
    return "filesRecv";
  }


  /**
   * 启动java项目
   */ 
  async startJavaServer() {
    let data = {
      code: 0,
      msg: '',
      server: ''
    }
    const javaCfg = Conf.getValue('addons.javaServer') || {};
    if (!javaCfg.enable) {
      data.code = -1;
      data.msg = 'addon not enabled!';
      return data;
    }

    const javaServerAddon = this.app.addon.javaServer;
    await javaServerAddon.createServer();

    data.server = 'http://localhost:' + javaCfg.port;

    return data;
  }

  /**
   * 关闭java项目
   */ 
  async closeJavaServer() {
    let data = {
      code: 0,
      msg: '',
    }
    const javaCfg = Conf.getValue('addons.javaServer') || {};
    if (!javaCfg.enable) {
      data.code = -1;
      data.msg = 'addon not enabled!';
      return data;
    }

    const javaServerAddon = this.app.addon.javaServer;
    await javaServerAddon.kill();

    return data;
  }

  /**
   * 任务
   */ 
  someJob(args, event) {
    let jobId = args.id;
    let action = args.action;
    
    let result;
    switch (action) {
      case 'create':
        result = this.service.framework.doJob(jobId, action, event);
        break;       
      case 'close':
        this.service.framework.doJob(jobId, action, event);
        break;
      default:  
    }
    
    let data = {
      jobId,
      action,
      result
    }
    return data;
  }

  /**
   * 创建任务池
   */ 
  async createPool(args, event) {
    let num = args.number;
    this.service.framework.doCreatePool(num, event);

    // test monitor
    this.service.framework.monitorJob();

    return;
  }

  /**
   * 通过进程池执行任务
   */ 
  someJobByPool(args, event) {
    let jobId = args.id;
    let action = args.action;
    
    let result;
    switch (action) {
      case 'run':
        result = this.service.framework.doJobByPool(jobId, action, event);
        break;
      default:  
    }
    
    let data = {
      jobId,
      action,
      result
    }
    return data;
  }

  /**
   * 测试接口
   */ 
  hello(args) {
    Log.info('hello ', args);
  }   
}

FrameworkController.toString = () => '[class FrameworkController]';
module.exports = FrameworkController;  