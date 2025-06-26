import { ipcApiRoute } from '@/api/main'
import { ipc } from '@/utils/ipcRenderer'
import store from './store'

const splitChar = "^@^"
const listHdcTargets = () => {
      const params = {
        type: 'hdcListTargets',
        content: 'hdc_std.exe list targets'
      }
      ipc.send(ipcApiRoute.ipcRunCmd, params)
    }
const getHdcDeviceInfo = (devid) => {
    const params = {
      type: 'hdcParamGet',
      content: 'hdc_std.exe -t ' + devid + " shell param get"
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
  }

const taskSnapshot = (devid) => {
    const params = {
        type: 'hdcSnapshotDisplay',
        devid: devid,
        content: 'hdc_std.exe -t ' + devid + ' shell snapshot_display'
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
  }

const recvFile = (devid, taskName, filepath, outpath) => {
    const params = {
        type: 'hdcFileRecvSnapshot',
        taskName: taskName,
        devid: devid,
        filepath: filepath,
        outpath: outpath,
        outname: "",
        content: 'hdc_std.exe -t ' + devid + ' file recv ' + filepath
    }
    console.log("fileRecv : ", params.content)
    ipc.send(ipcApiRoute.fileRecvSnapshort, params)
}

const recvFileWithName = (devid, taskName, filepath, outpath, outname) => {
  const params = {
      type: 'hdcFileRecvSnapshot',
      taskName: taskName,
      devid: devid,
      filepath: filepath,
      outpath: outpath,
      outname: outname,
      content: 'hdc_std.exe -t ' + devid + ' file recv ' + filepath
  }
  console.log("fileRecv : ", params.content)
  ipc.send(ipcApiRoute.fileRecvSnapshort, params)
}

const getProcessInfo = (devid) => {
    const params = {
      type: 'hdcProcessInfo',
      devid: devid,
      content: 'hdc_std.exe -t ' + devid + " shell bm dump -a"
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
  }

const getMemoryInfo = (devid) => {
    const params = {
      type: 'hdcHidumperMem',
      content: 'hdc_std.exe -t ' + devid + " shell hidumper --mem"
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
}

const traceFault = (memTraceInter, hdcDeviceList) => {
    var cmdContent = []
    let devidList = []
    for (var i=0; i<hdcDeviceList.length; i++) {
        var cmdItem = "hdc_std.exe -t " + hdcDeviceList[i] + " shell ls -l /data/log/faultlog/faultlogger/"
        cmdContent.push(cmdItem)
        devidList.push(hdcDeviceList[i])
    }
    const params = {
        type: 'startFaultTrace',
        replyType: 'hdcHidumperFault',
        intertime: memTraceInter*60*1000,
        devid: devidList,
        content: cmdContent
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
}

const stopTraceFault = () => {
    const params = {
        type: 'stopFaultTrace',
        content: 'stopFaultTrace'
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
}

const traceMem = (hdcDeviceList, memTraceInter) => {
    let devidList = []
    let cmdContent = []
    for (var i=0; i<hdcDeviceList.length; i++) {
      var cmdItem = "hdc_std.exe -t " + hdcDeviceList[i] + " shell hidumper --mem"
      cmdContent.push(cmdItem)
      devidList.push(hdcDeviceList[i])
    }
    const params = {
      type: 'startMemTrace',
      replyType: 'hdcHidumperMem',
      intertime: memTraceInter*60*1000,
      devid: devidList,
      content: cmdContent
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
}

const stopTraceMem = () => {
    const params = {
        type: 'stopMemTrace',
        content: 'stopMemTrace'
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
}

const execWukong = (devid, wukongCmd) => {
    const params = {
        type: 'hdcWuKong',
        devid: devid,
        content: 'hdc_std.exe -t ' + devid + wukongCmd
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
    return params.content
}

const stopWukong = (devid) => {
    const params = {
      type: 'hdcWuKong',
      devid: devid,
      content: 'hdc_std.exe -t ' +devid + ' pkill wukong'
    }
    ipc.send(ipcApiRoute.ipcRunCmd, params)
    return params.content
}

const saveResult = (devid, taskName, testHistory) => {
    const param = {
        fileName: taskName + "-" + devid + ".txt",
        taskName: taskName,
        devid: devid,
        data: JSON.stringify(testHistory)
    }
    ipc.send(ipcApiRoute.createFile, param)
}

const parseHdclist = (devlist, result) => {
    console.log('hdcListTargets result:', result);
    // this.hdcDeviceList.push(result.split(splitChar)[1])

    if (result.split(splitChar).length <= 1) {
        return [];
    }
    let idstr = result.split(splitChar)[1]
    let devidlist = idstr.split("\r\n")
    
    for (let j=0; j<devidlist.length; j++) {
      let devid = devidlist[j]
      let isExist = false;
      for (let i=0; i<devlist.length; i++) {
        if (devlist[i].name == devid) {
            isExist = true;
            break
        }
      }
      if (!isExist && devid.length > 1) {
          devlist.push({name: devid})
          console.log('[ipcRenderer] [socketMsgStart] result:', devlist);
          getHdcDeviceInfo(devid)
          // console.log('[ipcRenderer] [selectedDevids] result:', this.rowSelection.selectedRowKeys);
      }
    }
    

    // this.rowSelection.selectedRowKeys = []
    // for (let i=0;i<devlist.length;i++) {
    //     if (this.devidData[i].name == this.currentDevid) {
    //         this.rowSelection.selectedRowKeys.push(i)
    //         break
    //     }
    // }
    // console.log('[ipcRenderer] [selectedDevids] result:', this.currentDevid, this.rowSelection.selectedRowKeys);
}

const parseCmdType = (result) => {
    let cmdType, curDevid = ""
    cmdType = result.split(splitChar) ? result.split(splitChar)[0] : "NA"
    if (cmdType.indexOf("-") > 0) {
        curDevid = cmdType.split("-")[1]
        cmdType = cmdType.split("-")[0]
    }
    // console.log("parsecmdtype: ", cmdType, curDevid, result)
    return [cmdType, curDevid]
  }

const parseHdcParamGet = (result, devList) => {
    if (result.split(splitChar).length <= 1) {
        return
    }
    let resultValue = result.split(splitChar)[1]
    let paramList = resultValue.split("\n")
    let hardware = ""
    let version = ""
    let sn = ""
    let apiversion = ""
    let releasetype = ""
    console.log("parseHdcParamGet: ", paramList)
    for (let i=0;i<paramList.length;i++) {
        let key = paramList[i].split("=")[0].trim()
        let val = paramList[i].split("=")[1] ? paramList[i].split("=")[1].trim() : "NA"
        console.log('hdcParamGet param:', i, ">"+key+"<");
        switch (key) {
            case "ohos.boot.hardware":
            hardware = val;
            break;
            case "const.product.software.version":
            version = val;
            break;
            case "ohos.boot.sn":
            sn = val;
            break;
            case "const.ohos.apiversion":
            apiversion = val;
            break;
            case "const.ohos.releasetype":
            releasetype = val;
            break;
            default:
            break;
        }
    }
    console.log("parseHdcParamGet sn: ", sn, hardware)
    for (let j=0;j<devList.length;j++) {
        if (devList[j].name == sn) {
            console.log("find sn: ", sn)
            devList[j].hardware = hardware
            devList[j].version = version
            devList[j].apiversion = apiversion
            devList[j].releasetype = releasetype
            devList.sort()
            // console.log('[ipcRenderer] [socketMsgStart] result:', this.devidData);
        }
    }
}

const parseProcessInfo = (result, processList) => {
    let resultList = result.split("\n")
    // console.info("hdcProcessInfo : ", resultList)
    if (resultList.length > 1) {
        for (let i=1; i<resultList.length; i++) {
        let pname = resultList[i].replace("\t", "").replace("\r", "")
        let pos = processList.indexOf(pname, 0)
        if (pos < 0 && pname != "com.ohos.systemui" && pname != "com.ohos.launcher") {
            processList.push(pname)
        }
        }
    }
    // console.info("hdcProcessInfo processList: ", processList)
    // this.monProcname = "监控进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"
    store.state.processList = processList
}

const parseHidumperMem = (result, topProcess, topSeries, memtraceTime) => {
    if (result.indexOf("-start") >= 0) {
        return
    }
    let resultList = result.split("\n")
    // console.log('hdcHidumperMem result:', resultList.length, resultList);
    var startOff = resultList.length
    var topCnt = 0
    var topMax = 10
    var myDate = new Date();
    var dateString = myDate.toLocaleString( );  //获取日期与时间
    memtraceTime.push(dateString)
    for (let j=0; j<resultList.length; j++) {
    // // console.log("list: ", resultList[j], resultList[j].indexOf('Total Memory Usage by Size'))
    if (resultList[j].indexOf('Total Memory Usage by Size') >= 0) {
        // console.log("hdcHidumperMem: ", resultList[j])
        startOff = j+1;
    }
    if (resultList[j].indexOf('Total Pss by OOM adjustment') >= 0) {
        break;
    }
    let itemList = resultList[j].replace(/\s+/ig," ").split(" ")
    // if (startOff < j && itemList.length > 3) {
    //   let pname = itemList[1]
    //   let pos = this.processList.indexOf(pname, 0)
    //   if (pos < 0) {
    //     this.processList.push(pname)
    //   }
    // }
    if (startOff < j && topCnt < topMax) {
        topCnt += 1
        
        let pid = itemList[0]
        let pname = itemList[1]
        let pss = itemList[2].split("(")[0]
        // // console.log("hdcHidumperMem top proc: ", resultList[j], "parse:", pid, pname, pss, itemList)
        // let pos = this.processList.indexOf(pname, 0)
        // if (pos < 0) {
        //   this.processList.push(pname)
        // }
        let off = topProcess.indexOf(pname, 0)
        if (off >= 0) {
            topSeries[off].data.push(pss)
        } else {
            topProcess.push(pname)
            var seriesItem = {
                name: pname,
                type: 'line',
                stack: 'Total',
                areaStyle: {},
                emphasis: {
                focus: 'series'
                },
                data: []
            }
            seriesItem.data.push(pss)
            topSeries.push(seriesItem)
        } 
    }
    }
}

const parseHidumperFault = (result, curDevid, wkResult) => {
    // console.log('hdcHidumperFault result:', result);
    let typeItemList = result.split("-")
    if (typeItemList.length >= 3 && typeItemList[2].indexOf("start") >= 0) {
        wkResult.resultData = []
        wkResult.appfreezeCnt = 0
        store.state.appfreezeCnt = wkResult.appfreezeCnt
        wkResult.sysfreezeCnt = 0
        store.state.sysfreezeCnt = wkResult.sysfreezeCnt
        wkResult.jscrashCnt = 0
        store.state.jscrashCnt = wkResult.jscrashCnt
        wkResult.cppcrashCnt = 0
        store.state.cppcrashCnt = wkResult.cppcrashCnt
        wkResult.exceptionCnt = 0
        store.state.exceptionCnt = wkResult.exceptionCnt
        store.state.faultResult = wkResult.resultData
        return -1
      }
    if (typeItemList.length >= 3 && typeItemList[2].indexOf("close") >= 0) {
      // console.log("hdcHidumperFault close")
      return 0
    }
    let resultItemList = result.split(splitChar)
    // console.log('hdcHidumperFault resultItemList:', result);
    if (resultItemList.length < 2) {
      wkResult.appfreezeCnt = 0
      store.state.appfreezeCnt = wkResult.appfreezeCnt
      wkResult.sysfreezeCnt = 0
      store.state.sysfreezeCnt = wkResult.sysfreezeCnt
      wkResult.jscrashCnt = 0
      store.state.jscrashCnt = wkResult.jscrashCnt
      wkResult.cppcrashCnt = 0
      store.state.cppcrashCnt = wkResult.cppcrashCnt
      wkResult.exceptionCnt = 0
      store.state.exceptionCnt = wkResult.exceptionCnt
      wkResult.resultData = []
      store.state.faultResult = wkResult.resultData
      return;
    }
    let inOff = result.indexOf(splitChar) + 1
    // console.log("inOff :", result.substr(inOff))
    let resultItem = result.substr(inOff)
    let resultList = resultItem.split("\n")
    // console.log('hdcHidumperFault result:', resultList.length, resultList);
    let off = wkResult.resultData.length
    for (var i=0; i<resultList.length; i++) {
      let faultItem = resultList[i].replace(/\s+/ig," ").split(" ")
      if (faultItem.length < 8) {
        continue
      }
      let item = faultItem[7]
      // // console.log('hdcHidumperFault item:', item, faultItem);
      let res = item.split("-")[0]
      let pname = item.split("-")[1]
      let htime = faultItem[5] + " " + faultItem[6]
      let fItem = {
        no: off,
        devid: curDevid,
        octime: htime,
        module: pname,
        hcnt: 1,
        tags: [res],
        filename: item,
      }

      if (wkResult.resultData.length == 0) {
        wkResult.resultData.push(fItem)
        off += 1
        switch (res) {
          case "appfreeze":
            wkResult.appfreezeCnt += 1
            store.state.appfreezeCnt = wkResult.appfreezeCnt
            break
          case "cppcrash":
            wkResult.cppcrashCnt += 1
            store.state.cppcrashCnt = wkResult.cppcrashCnt
            break
          case "sysfreeze":
            wkResult.sysfreezeCnt += 1
            store.state.sysfreezeCnt = wkResult.sysfreezeCnt
            break
          case "jscrash":
            wkResult.jscrashCnt += 1
            store.state.jscrashCnt = wkResult.jscrashCnt
            break
          case "watchdog":
            wkResult.watchdogCnt += 1
            store.state.watchdogCnt = wkResult.watchdogCnt
            break
          default:
            break
        }
      } else {
        let isFind = -1
        if (wkResult.ignoreDefeat) {
          for (var j=0; j<wkResult.resultData.length; j++) {
            let existItem = wkResult.resultData[j]
            if (existItem.module == pname && existItem.octime == htime) {
              isFind = j
              break
            } else if (existItem.module == pname) {
              wkResult.resultData[j].hcnt += 1
              isFind = j
              break
            }
          }
        }
        
        if (isFind == -1) {
          wkResult.resultData.push(fItem)
          off += 1
          switch (res) {
            case "appfreeze":
              wkResult.appfreezeCnt += 1
              store.state.appfreezeCnt = wkResult.appfreezeCnt
              break
            case "sysfreeze":
              wkResult.sysfreezeCnt += 1
              store.state.sysfreezeCnt = wkResult.sysfreezeCnt
              break
            case "cppcrash":
              wkResult.cppcrashCnt += 1
              store.state.cppcrashCnt = wkResult.cppcrashCnt
              break
            case "jscrash":
              wkResult.jscrashCnt += 1
              store.state.jscrashCnt = wkResult.jscrashCnt
              break
            case "watchdog":
              wkResult.watchdogCnt += 1
              store.state.watchdogCnt = wkResult.watchdogCnt
              break
            default:
              break
          }
        }
      }
      store.state.faultResult = wkResult.resultData
      wkResult.exceptionCnt = off;
      store.state.exceptionCnt = wkResult.exceptionCnt;
    }
    return 0;
}
  
export {
    listHdcTargets,
    getHdcDeviceInfo,
    taskSnapshot,
    recvFile,
    recvFileWithName,
    getProcessInfo,
    getMemoryInfo,
    execWukong,
    stopWukong,
    traceFault,
    stopTraceFault,
    traceMem,
    stopTraceMem,
    saveResult,
    parseCmdType,
    parseHdclist,
    parseHdcParamGet,
    parseProcessInfo,
    parseHidumperMem,
    parseHidumperFault

}