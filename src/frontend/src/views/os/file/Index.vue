<template>
  <div id="app-base-file">
    <div class="one-block-1">
      <span>
        OpenHarmony设备控制
      </span>
    </div>  
    <div class="one-block-2">
      <!-- <a-space width:100%> -->
      <a-select
        mode="single"
        :default-value="selectedDevid"
        :value="selectedDevid"
        style="width: 50%"
        placeholder="Please select"
        @change="handleChange"
      >
        <a-select-option v-for="i in devidList" :key="i.name">
          {{ i.name }}
        </a-select-option>
      </a-select>
      <a-button @click="getHdcDevice()"> 获取设备列表 </a-button>
      <a-button :disabled="selectedDevid.length>0?false:true" @click="takeSnapshot()" > 获取设备截屏 </a-button>
      <!-- </a-space> -->
    </div>
    <!-- <div class="one-block-1">
      <span>
        2. 选择保存目录
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="12">
          <a-input v-model="dir_path" :value="dir_path" addon-before="保存目录" />
        </a-col>
        <a-col :span="12">
          <a-button @click="selectDir">
            修改目录
          </a-button>
        </a-col>
      </a-row>
    </div>       -->
    <div class="one-block-1">
      <span>
      </span>
    </div>  
    <div class="one-block-2">
      <div class="one-block-3">
        <a-card title="设备投屏" style="width: 100%;" @mousedown ="handleStart" @mouseup="handleEnd" @mousemove="handleMove">
          <!-- <a-button style="height:500px">
            截图 @mouseover="handleOver" @mousemove="handleOver "
          </a-button> -->
          <img v-for="(imgSrc,index) of imgSrcList" :key="index" :src="imgSrc" :width="imgWidth" @click="handleClick">
          <div class="one-block-3">
          <a-card title="操作区" style="width: 100%;">
            <div class="one-block-4">
              <a-space>
                <a-input v-model="mousepos" :value="mousepos" addon-before="鼠标位置" style="width:100%" />
              </a-space>
            </div>
            <div class="one-block-4">
              <a-space>
                <a-input v-model="posmsg" :value="posmsg" addon-before="按键坐标" style="width:100%" />
                <a-button @click="sendKey">
                  发送
                </a-button>
              </a-space>
            </div>
            <div class="one-block-4">
              <a-space>
                <a-input v-model="repeatinterval" :value="repeatinterval" addon-before="重复时间" style="width:100%" />
                <a-input v-model="repeatcnt" :value="repeatcnt" addon-before="重复按键" style="width:100%" />
                <a-button @click="handleRepeat">
                  发送
                </a-button>
              </a-space>
            </div>
          </a-card>
        </div>
        </a-card>
      </div>
      <div class="one-block-4">
        <div class="one-block-3">
          <a-card title="按键区" style="width: 100%;">
            <div class="one-block-4">
              <a-space>
                <a-button @click="handleHardkey(18)">
                  电源
                </a-button>
                <a-button @click="handleHardkey(2)">
                  返回
                </a-button>
                <a-button @click="handleHardkey(16)">
                  音量+
                </a-button>
                <a-button @click="handleHardkey(17)">
                  音量-
                </a-button>
              </a-space>
            </div>
          </a-card>
        </div>
        <div class="one-block-3">
          <a-card title="设备/应用信息" style="width: 100%;">
            <div class="one-block-4">
              <a-space>
                <a-button @click="getDevinfo()">
                  设备信息
                </a-button>
                <a-button @click="installApp">
                  安装应用
                </a-button>
              </a-space>
            </div>
            <div class="one-block-4">
              <a-space>
                <a-select
                  mode="single"
                  :default-value="selectedHap"
                  :value="selectedHap"
                  style="width: 200px"
                  placeholder="Please select"
                  @change="changeSelectHap"
                >
                  <a-select-option v-for="i in installedHapList" :key="i">
                    {{ i }}
                  </a-select-option>
                </a-select>
                <a-button @click="uninstallApp">
                  卸载应用
                </a-button>
                <a-button @click="getAppinfo()">
                  应用信息
                </a-button>
              </a-space>
            </div>
          </a-card>
        </div>
        <div class="one-block-3">
          <a-card title="文件信息" style="width: 100%;">
            <div class="one-block-4">
              <a-space>
                <a-button>
                  文件推送
                </a-button>
                <a-button>
                  文件获取
                </a-button>
                <a-button>
                  日志获取
                </a-button>
              </a-space>
            </div>
          </a-card>
        </div>
        <div class="one-block-3">
          <a-card title="自定义命令" style="width: 100%;">
            <div class="one-block-4">
              <a-input v-model="taskCmd" :value="taskCmd" addon-before="hdc命令" style="width:60%" />
              <a-button @click="sendHdc">
                  发送
                </a-button>
            </div>
          </a-card>
        </div>
        <div class="one-block-3">
          <a-card title="执行命令" style="width: 100%;">
            <textarea v-model="logmsg" cols="60" rows="10"></textarea>
          </a-card>
        </div>
      </div>
    </div>
    <div class="footer">
    </div>
  </div>
</template>
<script>
import storage from 'store2'
import { ipcApiRoute } from '@/api/main'
import {getCurrentTime} from '../../../model/utils'
import {parseCmdType, listHdcTargets, getHdcDeviceInfo, traceFault, traceMem, stopTraceMem, 
  parseHdclist, taskSnapshot, stopTraceFault, recvFile, recvFileWithName, getProcessInfo, getMemoryInfo, saveResult, 
  execWukong, stopWukong, parseHdcParamGet, parseProcessInfo, parseHidumperMem, parseHidumperFault} from '../../../model/parse'

const fileList = [
  {
    content: '【下载】目录',
    id: 'downloads'
  },
  {
    content: '【图片】目录',
    id: 'pictures'
  },
  {
    content: '【文档】目录',
    id: 'documents'
  },
  {
    content: '【音乐】目录',
    id: 'music'
  }
];

export default {
  data() {
    return {
      file_list: fileList,
      action_url: '',
      image_info: [],
      num: 0,
      servicAddress: '',
			dir_path: "D:\\www\\ee",
      selectedDevid: '',
      devidList: [],
      installedHapList: [],
      currentDevid: '',
      selectedHap: '',
      taskCmd: '',
      imgSrcList: [],
      logmsg: '',
      timeInter: null,
      posx: 0,
      poxy: 0,
      movestartx: 0,
      movestarty: 0,
      movetox: 0,
      movetoy: 0,
      slideendtime: 0,
      posmsg: '',
      mousepos: '',
      repeatinterval: 120,
      repeatcnt: 10,
      taskName: 'hdc',
      imgRatio: 0.5,
      imgWidth: 720

    };
  },
  mounted () {
    this.getHost();
    this.init();
    this.getHdcDevice();
  },
  methods: {
    getHdcDevice () {
      this.devidData = []
      listHdcTargets()
    },
    sendHdc() {
      if (this.selectedDevid.length > 0) {
        let devidData = this.selectedDevid
        const params = {
          type: 'hdcShellcmd',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + ' shell ' + this.taskCmd
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      }
    },
    sendKey() {
      if (this.selectedDevid.length > 0) {
        let devidData = this.selectedDevid
        if (this.posmsg.length>0) {
          let slist = this.posmsg.split(',')
          this.posx = Number(slist[0])
          this.posy = Number(slist[1])
        } 
        const params = {
          type: 'hdcShellcmd',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + ' shell uinput -T -c ' + this.posx.toString() + " " + this.posy.toString()
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      }
    },
    handleRepeat() {
      console.log('handleRepeat', this.repeatcnt, this.repeatinterval, this.posx, this.posy)
      if (this.timeInter) {
        clearInterval(this.timeInter)
        this.timeInter = null
      }
      this.timeInter = setInterval(() => {
        this.sendKey()
        this.repeatcnt -= 1
        if (this.repeatcnt <= 0) {
          clearInterval(this.timeInter)
          this.timeInter = null
        }
      }, this.repeatinterval * 1000)
    },
    handleHardkey(keycode) { 
      //const int32_t KeyEvent::KEYCODE_POWER = 18;
      if (this.selectedDevid.length > 0) {
        let devidData = this.selectedDevid
        const params = {
          type: 'hdcUinput',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + ' shell uinput -K -d ' + keycode.toString() + ' -i 30 -u ' + keycode.toString()
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      }
    },
    getDevinfo() { 
      if (this.selectedDevid.length > 0) {
        let devidData = this.selectedDevid
        const params = {
          type: 'hdcParam',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + ' shell param get'
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      }
    },
    installApp() { 
      let happath = ''
      if (this.selectedDevid.length > 0) {
        const params = {}
        this.$ipc.invoke(ipcApiRoute.selectFile, params).then(res => {
          console.log('res:', res)
          if (res) {
            let devidData = this.selectedDevid
            happath = res
            const bmparams = {
              type: 'hdcShellbm',
              devid: devidData,
              content: 'hdc_std.exe -t ' + devidData + ' install ' + happath
            }
            this.$ipc.send(ipcApiRoute.ipcRunCmd, bmparams)
          }
        })
      } else {
        this.$message.warning('请选择hap');
      }
    },
    uninstallApp() { 
      let bundlename = this.selectedHap
      if (this.selectedDevid.length > 0) {
        let devidData = this.selectedDevid
        const params = {
          type: 'hdcShellbm',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + ' uninstall ' + bundlename
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      }
    },
    installAppinfo() { 
      if (this.selectedDevid.length > 0) {
        let devidData = this.selectedDevid
        const params = {
          type: 'hdcBmDumpall',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + ' shell bm dump -a'
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      }
    },
    getAppinfo() { 
      if (this.selectedDevid.length > 0) {
        let devidData = this.selectedDevid
        const params = {
          type: 'hdcBmDumpn',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + ' shell bm dump -n ' + this.selectedHap 
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      }
    },
    handleOver(event) {
      const x = event.offsetX / this.imgRatio;
      const y = event.offsetY / this.imgRatio;
      console.log(`Over at (${x}, ${y})`);
      this.mousepos = x.toString() + ',' + y.toString()
    },
    handleStart(event) {
      event.preventDefault && event.preventDefault();
      const x = event.offsetX / this.imgRatio;
      const y = event.offsetY / this.imgRatio;
      this.movestartx = x;
      this.movestarty = y;
      console.log(`handleStart at (${x}, ${y})`);
      // if (this.selectedDevid.length > 0) {
      //   let devidData = this.selectedDevid
      //   const params = {
      //     type: 'hdcUinput',
      //     devid: devidData,
      //     content: 'hdc_std.exe -t ' + devidData + ' shell uinput -T -d ' + x.toString() + " " + y.toString()
      //   }
      //   console.log(`handleStart uinput -T -d (${x}, ${y})`);
      //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      // }
      this.movestart = 1
    },
    handleMove(event) {
      const x = event.offsetX / this.imgRatio;
      const y = event.offsetY / this.imgRatio;
      this.mousepos = x.toString() + ',' + y.toString()
      if (0 && this.movestart) {
        const x = event.offsetX / this.imgRatio;
        const y = event.offsetY / this.imgRatio;
        this.movetox = x;
        this.movetoy = y;
        console.log(`handleMove at (${this.movetox}, ${this.movetoy}) (${this.movestartx}, ${this.movestarty})`);
        let deltax = Math.abs(this.movetox - this.movestartx)
        let deltay = Math.abs(this.movetoy - this.movestarty)
        if (deltax > 100 || deltay > 100) {
          if (this.selectedDevid.length > 0) {
            let devidData = this.selectedDevid
            const params = {
              type: 'hdcUinput',
              devid: devidData,
              content: 'hdc_std.exe -t ' + devidData + ' shell uinput -T -m ' + 
                this.movestartx.toString() + " " + this.movestarty.toString() + " " +
                this.movetox.toString() + " " + this.movetoy.toString()
            }
            console.log(`handleMove uinput -T -m (${this.movestartx}, ${this.movestarty}, 
              ${this.movetox}, ${this.movetoy})`);
            this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
            this.movestartx = this.movetox
            this.movestarty = this.movetoy
          }
          
        }
        
      }
    },
    handleEnd(event) {
      const x = event.offsetX / this.imgRatio;
      const y = event.offsetY / this.imgRatio;
      console.log(`handleEnd at (${x}, ${y})`);
      this.movetox = x;
      this.movetoy = y;
      let deltax = Math.abs(this.movetox - this.movestartx)
      let deltay = Math.abs(this.movetoy - this.movestarty)
      // if (deltax > 10 || deltay > 10) {
      //   if (this.selectedDevid.length > 0) {
      //     let devidData = this.selectedDevid
      //     const params = {
      //       type: 'hdcUinput',
      //       devid: devidData,
      //       content: 'hdc_std.exe -t ' + devidData + ' shell uinput -T -m ' + 
      //         this.movestartx.toString() + " " + this.movestarty.toString() + " " +
      //         this.movetox.toString() + " " + this.movetoy.toString()
      //     }
      //     console.log(`handleEnd uinput -T -m (${this.movestartx}, ${this.movestarty}, 
      //       ${this.movetox}, ${this.movetoy})`);
      //     this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      //   }
      //   this.movestartx = x
      //   this.movestarty = y
      // }
      if (deltax > 10 || deltay > 10) {
        if (this.selectedDevid.length > 0) {
          let devidData = this.selectedDevid
          let hdccmd = 'hdc_std.exe -t ' + devidData + ' shell '
          let cmdstr = hdccmd + 'uinput -T -u ' + this.movestartx + ' ' + this.movestarty + ' & ' + 
            hdccmd + 'uinput -T -i 100 & ' + 
            hdccmd + 'uinput -T -m ' + this.movestartx + ' ' + this.movestarty + ' ' + x + ' ' + y + ' & ' + 
            hdccmd + 'uinput -T -i 100 & ' +
            hdccmd + 'uinput -T -u 374 350'

          const params = {
            type: 'hdcUinput',
            devid: devidData,
            content: cmdstr
          }
          this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
          console.log(`handleMove uinput -T -u (${x}, ${y})`);
        }
        this.slideendtime = Date.parse(new Date());
      }
      this.movestart = 0
      
    },
    handleClick(event) {
      let cutime = Date.parse(new Date());
      console.log("handclick: ", cutime, this.slideendtime)
      if (cutime - this.slideendtime > 500) {
        const x = event.offsetX / this.imgRatio;
        const y = event.offsetY / this.imgRatio;
        console.log(`Clicked at (${x}, ${y})`);
        this.posx = x
        this.posy = y
        this.posmsg = this.posx.toString() + ',' + this.posy.toString()
        if (this.selectedDevid.length > 0) {
          let devidData = this.selectedDevid
          const params = {
            type: 'hdcUinput',
            devid: devidData,
            content: 'hdc_std.exe -t ' + devidData + ' shell uinput -T -c ' + x.toString() + " " + y.toString()
          }
          this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
        }
      } 
    },
    selectFile () {
      const params = {}
      this.$ipc.invoke(ipcApiRoute.selectFile, params).then(res => {
        console.log('res:', res)
        if (res) {
          // this.fileUrl = res;
          // this.p.start(self.fileUrl);
          const params = {
            filepath: res,
          }
          this.$ipc.invoke(ipcApiRoute.readImgFile, params).then(res => {
            console.log('res:', res.img_list.length, res);
            this.imgSrcList = res.img_list
            // if (res.all_list.length == 0) {
            //   return false;
            // }
            // this.all_list = res.all_list;
          })
        } else {
          this.$message.warning('请选择视频');
        }
      }) 
    },
    takeSnapshot() {
      if (this.selectedDevid.length > 0) {
        console.log('takeSnapshot')
        taskSnapshot(this.selectedDevid)
      }
      // this.selectFile()
    },
    fileRecv(filepath, outpath) {
      if (this.selectedDevid.length > 0) {
        recvFileWithName(this.selectedDevid, this.taskName+this.selectedDevid, filepath, outpath, "mirrorImg.jpeg")
      }
    },
    handleChange(value) {
      console.log(`process selected :`, value);
      this.selectedDevid = value;
      this.installAppinfo()
      // store.state.selectedProcess = this.selectedProcess
    },
    changeSelectHap(value) {
      console.log(`hap selected :`, value);
      this.selectedHap = value;
      // store.state.selectedProcess = this.selectedProcess
    },
    init () {
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      this.$ipc.removeAllListeners(ipcApiRoute.readLogs);
      this.$ipc.on(ipcApiRoute.readImgFile, (event, result) => {
        console.log("onreadImgFile:", result)
        let width = result.split(":")[1]
        this.imgWidth = width * this.imgRatio
      })
      this.$ipc.removeAllListeners(ipcApiRoute.ipcRunCmd);
      this.$ipc.on(ipcApiRoute.ipcRunCmd, (event, result) => {
        console.log("onipc:", result)
        if (result) {
          // let cmdType = result.split(":") ? result.split(":")[0] : "NA"
          let cmdType, curDevid = ""
          let retlist = parseCmdType(result)
          cmdType = retlist[0]
          curDevid = retlist[1]
          console.log("cmdType:", cmdType)
          switch(cmdType.trim()) {
            case "hdcShellcmd":
              {
                if (result.indexOf("-start") > 0) {
                  this.logmsg = ""
                } else {
                  this.logmsg += result
                }
              }
              break;
            case "hdcShellbm":
              {
                if (result.indexOf("-close") > 0) {
                  this.installAppinfo()
                }
              }
              break;
            case "hdcBmDumpall":
              {
                if (result.indexOf("-start") > 0) {
                  this.logmsg = ""
                  this.installedHapList = []
                  this.selectedHap = ""
                } else {
                  this.logmsg += result
                  let bmdump = result.replace("\t", "")
                  let bmlist = bmdump.split("\r\n")
                  for (let off=1;off<bmlist.length;off++) {
                    this.installedHapList.push(bmlist[off])
                  }
                }
              }
              break;
              case "hdcBmDumpn":
              {
                if (result.indexOf("-start") > 0) {
                  this.logmsg = ""
                } else {
                  this.logmsg += result
                }
              }
              break;
            case "hdcParam":
              {
                if (result.indexOf("-start") > 0) {
                  this.logmsg = ""
                } else {
                  this.logmsg += result
                }
              }
              break;
            case "hdcUinput":
              {
                // if (result.indexOf("end coordinate") > 0 || result.indexOf("-close") > 0) {
                  
                // }
                this.takeSnapshot()
              }
              break;
            case "hdc_std.exe":
              {
                if (result.indexOf("file recv") > 0) {
                  let hdclist = result.split(" ")
                  let dirpath = hdclist[hdclist.length-1]
                  let imgpath = hdclist[hdclist.length-2]
                  console.log("dirpath:", dirpath, imgpath)
                  let imgfile = dirpath
                  //  + "/" + imgpath.replace("/data/", "")
                  this.snapshotImg = imgfile
                  
                }
              }
              break;
            case "hdcListTargets":
              {
                parseHdclist(this.devidList, result)
              }
              break;
            case "hdcSnapshotDisplay":
              {
                let resultList = result.split("\n")
                console.log("hdcSnapshotDisplay resultList:", resultList)
                if (resultList.length>1 && resultList[1].indexOf("write to") >= 0) {
                  let itemList = resultList[1].split(" ")
                  let fileItem = itemList[7]
                  // console.log('hdcSnapshotDisplay result:', itemList);
                  this.fileRecv(fileItem, "snapshot")
                } 
              }
              break;
            case "hdcFileRecvSnapshot":
              {
                if (result.indexOf("FileTransfer finish") > 0) {
                  console.log("trans")
                  const params = {
                    filepath: this.snapshotImg,
                  }
                  this.$ipc.invoke(ipcApiRoute.readImgFile, params).then(res => {
                    console.log('res:', res.img_list.length, res);
                    this.imgSrcList = res.img_list
                  })
                }
              }
              break;

          }
          // console.log("parsecmdtype ret: ", cmdType, curDevid)
          // switch(cmdType) {
          //   case "hdcListTargets":
          //     {
          //       parseHdclist(this.devidData, result)
          //       this.rowSelection.selectedRowKeys = []
          //       for (let i=0;i<this.devidData.length;i++) {
          //         if (this.devidData[i].name == this.currentDevid) {
          //           this.rowSelection.selectedRowKeys.push(i)
          //           break
          //         }
          //       }
          //       // // console.log('[ipcRenderer] [selectedDevids] result:', this.currentDevid, this.rowSelection.selectedRowKeys);
          //     }
          //     break;
          //   case "hdcParamGet":
          //     {
          //       console.log("this.devidData : ", this.devidData)
          //       parseHdcParamGet(result, this.devidData)
          //     }
          //     break;
          //   case "hdcHidumperMem":
          //     {
          //       parseHidumperMem(result, this.wkResult.top5Process, this.wkResult.top5Series, this.wkResult.memtraceTime)
          //       this.initChart()
          //     }
              
          //     break;
          //   case "hdcSnapshotDisplay":
          //     {
          //       let resultList = result.split("\n")
          //       // console.log("hdcSnapshotDisplay resultList:", resultList)
          //       if (resultList.length>1 && resultList[1].indexOf("write to") >= 0) {
          //         let itemList = resultList[1].split(" ")
          //         let fileItem = itemList[7]
          //         // console.log('hdcSnapshotDisplay result:', itemList);
          //         this.fileRecv(fileItem, "snapshot")
          //       }
          //     }
          //     break;
          //   case "hdcHidumperFault":
          //     {
          //       let ret = parseHidumperFault(result, curDevid, this.wkResult)
          //       if (ret === -1) {
          //         this.wkResult.resultData = []
          //       }
          //       let typeItemList = result.split("-")
          //       if (typeItemList.length >= 3 && typeItemList[2].indexOf("start") >= 0) {
          //         console.log("hdcHidumperFault start:", this.wkResult.resultData)
          //       }
          //     }
          //     break;
          //   case "hdcProcessInfo":
          //     {
          //       parseProcessInfo(result, this.processList)
          //       this.monProcname = "监控进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"
          //       // store.state.processList = this.processList
          //     }
          //     break;
          //   case "hdcWuKong":
          //     {
          //       let resultList = result.split("\n")
          //       let itemList = resultList[0].replace(/\s+/ig," ").split(" ")
          //       let myDate = new Date();
          //       let dateString = myDate.toLocaleString( );  //获取日期与时间
          //       this.wkResult.costTime = ((myDate.getTime() - this.testStarttime) / 60000).toFixed(4)
          //       store.state.costTime = this.wkResult.costTime
          //       // let fileItem = itemList[itemList.length-1]
          //       // console.log('hdcWuKong result:', dateString, resultList.length, resultList, itemList, curDevid);
          //       if (result.indexOf("EnvInit :") > 0) {
          //         // console.log("EnvInit :---------------------")
          //         for (let i=0; i<resultList.length; i++) {
          //           let eventItem = resultList[i]
          //           let eventitemList = resultList[i].replace(/\s+/ig," ").split(" ")
          //           // console.log("EnvInit :---------------------", eventItem)
          //           if (eventItem.indexOf("Report currentTestDir:") >= 0) {
          //             for (let j=0; j<eventitemList.length; j++) {
          //               if (eventitemList[j].indexOf("(/data") >= 0) {
          //                 this.wkResult.testTime = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
          //                 store.state.testDir = this.wkResult.testTime
          //               }
          //             }
          //           } else if (eventItem.indexOf("Report CSV:") >= 0) {
          //             for (let j=0; j<eventitemList.length; j++) {
          //               if (eventitemList[j].indexOf("(/data") >= 0) {
          //                 this.wkResult.testReport = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
          //                 store.state.testReport = this.wkResult.testReport
          //               }
          //             }
          //           } else if (eventItem.indexOf("Report JSON:") >= 0) {
          //             // console.log(" JSON -----------------")
          //             for (let j=0; j<eventitemList.length; j++) {
          //               if (eventitemList[j].indexOf("(/data") >= 0) {
          //                 this.wkResult.testJson = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
          //                 store.state.testJson = this.wkResult.testJson
          //               }
          //             }
          //           } else if (eventItem.indexOf("Report exception dir:") >= 0) {
          //             // console.log(" exception -----------------")
          //             for (let j=0; j<eventitemList.length; j++) {
          //               if (eventitemList[j].indexOf("(/data") >= 0) {
          //                 this.wkResult.testException = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
          //                 store.state.testException = this.wkResult.testException
          //               }
          //             }
          //           }
          //         }
          //       }
          //       if (itemList.length == 12) {
          //         let wukongItem = {
          //           cmdTime: dateString,
          //           devid: curDevid,
          //           cmdId: itemList[2] + itemList[3],
          //           cmdName: itemList[4],
          //           cmdMsg: itemList[6]+itemList[7]+itemList[8]+itemList[9]+itemList[10],
          //           resultInfo: result
          //         }
          //         this.wukongCmdList.push(wukongItem)
          //         // console.log('wukongCmdList result:', this.wukongCmdList);
          //         this.makeSnapshot()
          //         store.state.cmdHistory = this.wukongCmdList
          //       }
          //       if (result.indexOf("all test Finished") >= 0) {
          //         // console.log('hdcWuKong test finished!');
          //         this.stopRandomTest()
          //       } 
          //       this.wukongHistoryCmd += result
          //       store.state.wukongHistoryCmd += result
          //     }
          //     break;
          //   default:
          //     break;
          // }
          this.messageString = result;
          this.execLog = result;

          // 调用后端的另一个接口
          // this.sendMsgStop();
        }  
      })
      this.taskName = this.taskName + getCurrentTime();
    },
    getHost () {
      this.$ipc.invoke(ipcApiRoute.checkHttpServer, {}).then(r => {
        if (r.enable) {
          this.servicAddress = r.server;
          storage.set('httpServiceConfig', r);

          // url转换
          const host = r.server || 'http://localhost:7071';
          let uri = ipcApiRoute.uploadFile;
          let url = uri.split('.').join('/');
          this.action_url = host + '/' + url;
        }
      })
    },
    openDirectry (id) {
      this.$ipc.invoke(ipcApiRoute.openDirectory, {id: id}).then(res => {
        //console.log('res:', res)
      })      
    },
    selectDir() {
      this.$ipc.invoke(ipcApiRoute.selectFolder, '').then(r => {
        this.dir_path = r;
        this.$message.info(r);
      })      
    },
		messageShow() {
      this.$ipc.invoke(ipcApiRoute.messageShow, '').then(r => {
        this.$message.info(r);
      })
    },    
    messageShowConfirm() {
      this.$ipc.invoke(ipcApiRoute.messageShowConfirm, '').then(r => {
        this.$message.info(r);
      })
    },
    handleFileChange(info) {
      console.log('handleFileChange-----');
      if (this.action_url == '') {
        this.$message.error('http服务未开启');
        return;
      }
      const status = info.file.status;
      if (status !== 'uploading') {
        console.log(info.file);
      }
      if (status === 'done') {
        const uploadRes = info.file.response;
        console.log('uploadRes:', uploadRes)
        if (uploadRes.code !== 'success') {
          this.$message.error(`file upload failed ${uploadRes.code} .`);
          return false;
        }
        this.num++;
        const picInfo = uploadRes.data;
        picInfo.id = this.num;
        picInfo.imageUrlText = 'image url';
        this.image_info.push(picInfo);
        this.$message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`);
      }
    },
  }
};
</script>
<style lang="less" scoped>
#app-base-file {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
    height: 100%;
  }
  .one-block-2 {
    padding-top: 10px;
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: flex-start;
    align-content: space-around;
  }
  .one-block-3 {
    padding-top: 10px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex: 1;
  }
  .one-block-4 {
    width: 100%;
    height: 80%;
    padding: 10px;
    display: flew;
    flex-direction: column;
    justify-content: flex-end;
    align-content: space-around;
    flex: 1;
  }
  .footer {
    padding-top: 10px;
  }
}
</style>
