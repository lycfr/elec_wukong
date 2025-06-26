<template>
  <div id="app-hw-bluetooth">
    <a-collapse v-model="activeKey">
      <a-collapse-panel key="1" header="选择设备">
        <div class="one-block-1">
          <a-input v-model="taskName" :value="taskName" addon-before="任务名称" />
          <span>
            <a-button @click="getHdcDevice()"> 获取设备列表 </a-button>
          </span>
        </div> 
        <div class="one-block-2">
          <a-table
            :columns="devidColumns"
            :data-source="devidData"
            :row-selection="rowSelection"
            :customRow="rowClick"
          >
            <a slot="name" slot-scope="text" @click="clickDevid(text)">{{ text }}</a>
          </a-table>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="悟空配置">
        <div class="one-block-1">
          <span class="one-block-10">
            {{monProcname}}：
          </span>
          <a-select
            mode="multiple"
            :default-value="selectedProcess"
            :value="selectedProcess"
            :disabled="isTesting"
            style="width: 90%"
            placeholder="Please select"
            @change="handleChange"
          >
            <a-select-option v-for="i in processList" :key="i">
              {{ i }}
            </a-select-option>
          </a-select>
        </div>
        <div class="one-block-1">
          <a-col :span="8" class="one-block-5">
            <a-input v-model="wkParam.testTime" :value="wkParam.testTime" addon-before="测试时长(分钟)" :disabled="isTesting" />
          </a-col>
          <a-col :span="8" class="one-block-5">
            <a-input v-model="wkParam.testDuration" :value="wkParam.testDuration" addon-before="操作间隔(分钟)" :disabled="isTesting" />
          </a-col>
          <a-col :span="8" class="one-block-5">
            <a-input v-model="wkParam.hilogTime" :value="wkParam.hilogTime" addon-before="Hilog保存时长(分钟)" :disabled="isTesting" />
          </a-col>
          <a-col :span="3" class="one-block-4">
            <span>
              开启截图:
            </span>
            <a-switch v-model="wkParam.needScreenshot" :value="wkParam.needScreenshot" :disabled="isTesting"/>
          </a-col>
          <a-col :span="3" class="one-block-4">
            <span>
              开启Hilog:
            </span>
            <a-switch v-model="wkParam.needHilog" :value="wkParam.needHilog" :disabled="isTesting"/>
          </a-col>
          <a-col :span="3" class="one-block-4">
            <span>
              忽略重复问题:
            </span>
            <a-switch v-model="wkParam.ignoreDefeat" :value="wkParam.ignoreDefeat" :disabled="isTesting"/>
          </a-col>
        </div>
        <div class="one-block-1">
          <a-col :span="6" class="one-block-5">
            <a-input v-model="wkParam.appWeight" :value="wkParam.appWeight" addon-before="应用拉起权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="6" class="one-block-5">
            <a-input v-model="wkParam.touchWeight" :value="wkParam.touchWeight" addon-before="按键操作权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="6" class="one-block-5">
            <a-input v-model="wkParam.slideWeight" :value="wkParam.slideWeight" addon-before="滑动操作权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="6" class="one-block-5">
            <a-input v-model="wkParam.clickWeight" :value="wkParam.clickWeight" addon-before="点击操作权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="9" class="one-block-9">
            <span style="font-size: 14px">
              内存采集间隔:
            </span>
            <a-select :default-value="wkParam.memTraceInter" style="width: 120px" @change="memtimeSet" :disabled="isTesting">
              <a-select-option value="10">
                10分钟
              </a-select-option>
              <a-select-option value="30">
                30分钟
              </a-select-option>
              <a-select-option value="60">
                60分钟
              </a-select-option>
            </a-select>
          </a-col>
        </div>
        <div class="one-block-2">
          <a-button class="one-block-5" @click="doRandomTest()"> 开始应用随机测试 </a-button>
          <a-button class="one-block-5" @click="stopRandomTest()"> 结束应用随机测试 </a-button>
          <!-- <a-button class="one-block-5" @click="traceMemory()"> 采内存 </a-button> -->
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="3" header="测试结果">
        <div class="one-block-1">
          <span class="one-block-10">
            选择记录:
          </span>
          <a-select
            :default-value="currentDevid"
            :value="currentDevid"
            style="width: 90%"
            placeholder="Please select"
            @change="handleDevResChange"
          >
            <a-select-option v-for="devid in hdcDeviceList" :key="devid" >
              {{ devid }}
            </a-select-option>
          </a-select>
        </div>
        <div class="one-block-1">
          <div class="one-block-1">        
            <div>
              <a-spin v-if="isTesting"/>
            </div>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="测试时长(分钟)" :value="wkResult.costTime" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="异常数(个)" :value="wkResult.exceptionCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="cppcrash(个)" :value="wkResult.cppcrashCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="jscrash(个)" :value="wkResult.jscrashCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="appfreeze(个)" :value="wkResult.appfreezeCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="sysfreeze(个)" :value="wkResult.sysfreezeCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="memleak(个)" :value="wkResult.memleakCnt" style="margin-right: 50px" />
            </a-col>
          </div>
        </div>
        <div class="one-block-2">
          <a-textarea v-model="execLog" :rows="4" :disabled="true"/>
        </div>
        <div class="one-block-1">
          <a-col :span="8" class="one-block-9">
            <a-input v-model="wkResult.testDir" :value="wkResult.testDir" addon-before="测试目录" />
          </a-col>
          <a-col :span="6" class="one-block-9">
            <a-input v-model="wkResult.testReport" :value="wkResult.testReport" addon-before="测试报告" />
          </a-col>
          <a-col :span="6" class="one-block-9">
            <a-input v-model="wkResult.testJson" :value="wkResult.testJson" addon-before="测试JSON" />
          </a-col>
          <a-col :span="6" class="one-block-9">
            <a-input v-model="wkResult.testException" :value="wkResult.testException" addon-before="测试异常" />
          </a-col>
        </div>
        <div class="one-block-1">
          <div id="myechart" class="one-block-8" style="height: 200px; width: 99%"></div>
        </div>
      </a-collapse-panel>
    </a-collapse>
    
    <div class="one-block-1">
      <a-table class="one-block-6" :columns="resultColumn" :data-source="wkResult.resultData">
        <a slot="name" slot-scope="text">{{ text }}</a>
        <span slot="customTitle"><a-icon type="smile-o" /> Name</span>
        <span slot="tags" slot-scope="tags">
          <a-tag
            v-for="tag in tags"
            :key="tag"
            :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"
          >
            {{ tag.toUpperCase() }}
          </a-tag>
        </span>
        <span slot="action">
          <a>概要信息</a>
          <a-divider type="vertical" />
          <a>故障信息</a>
          <a-divider type="vertical" />
          <a>日志查看</a>
          <a-divider type="vertical" />
          <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
        </span>
      </a-table>
    </div>
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main'
import * as echarts from "echarts"
import store from '../../../model/store'
import {parseCmdType, listHdcTargets, getHdcDeviceInfo, traceFault, traceMem, stopTraceMem, 
  parseHdclist, taskSnapshot, stopTraceFault, recvFile, getProcessInfo, getMemoryInfo, saveResult, 
  execWukong, stopWukong, parseHdcParamGet, parseProcessInfo, parseHidumperMem, parseHidumperFault} from '../../../model/parse'
import {getCurrentTime} from '../../../model/utils'

export default {
  data() {
    const panes = [
      { title: 'Tab 1', content: 'Content of Tab 1', key: '1' },
      { title: 'Tab 2', content: 'Content of Tab 2', key: '2' },
    ];
    return {
      chartDom: "",
      myChart: "",
      option: "",
      
      tabActiveKey: panes[0].key,
      panes,
      newTabIndex: 0,

      defaultDeviceName: '',
      printerList: [],
      hdcDeviceList: [],
      currentDevid: '',
      processList: [],
      selectedProcess: ['com.ohos.photos', 'com.ohos.callui'],
      wukongCmdList: [],
      wukongHistoryCmd: '',
      views: [
        {
          type: 'html',
          content: '/public/html/view_example.html'
        },        
      ],
      activeKey: ['1','2','3'],
      taskName: "Task",
      monProcname: "监控进程",
      testStarttime: 0,
      needScreenshot: true,
      wkParam: {
        testTime: 60,
        testDuration: 2000,
        appWeight: 0.25,
        touchWeight: 0.45,
        slideWeight: 0.1,
        clickWeight: 0.2,
        hilogTime: 2,
        needHilog: false,
        ignoreDefeat: false,
        interSelect: [10,30,60],
        memTraceInter: 10,
      },
      
      wukongCmd: "hdc_std.exe shell wukong exec -s 10 -i 1000 -a 0.28 -t 0.72 -c 10",
      wukongCmdLine: "",
      execLog: "wukongCmd",
      wkResult: {
        testDir: "",
        testReport: "",
        testJson: "",
        testException: "",
        costTime: 0,
        exceptionCnt: 0,
        cppcrashCnt: 0,
        jscrashCnt: 0,
        watchdogCnt: 0,
        appfreezeCnt: 0,
        sysfreezeCnt: 0,
        memleakCnt: 0,
        resultData: [],
        // memtraceTime: ['2023-05-23 14:08:31', '2023-05-23 15:08:38', '2023-05-23 16:08:38', '2023-05-23 17:08:38', '2023-05-23 18:08:38', '2023-05-23 19:08:38', '2023-05-23 20:08:38'],
        memtraceTime: [],
        // 'com.ohos.system', 'com.ohos.smartp', 'com.ohos.note', 'com.ohos.permis', 'com.ohos.launch'
        top5Process: [],
        top5Series: [],
      },
      
      isTesting: false,
            
      devidColumns: [{
        title: '设备ID',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }
      }, {
        title: '硬件',
        dataIndex: 'hardware',
        key: 'hardware',
      }, {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
      }, {
        title: '接口版本',
        dataIndex: 'apiversion',
        key: 'apiversion',
      }],
      devidData: [{
        name: 'Joe Black',
      }],
      rowSelection: {
        selectedRowKeys: [],
        onChange: (selectedRowKeys, selectedRows) => {
          // console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows: ', selectedRows);
          this.rowSelection.selectedRowKeys = selectedRowKeys
          this.hdcDeviceList = []
          for (var i=0; i<selectedRows.length; i++) {
            this.hdcDeviceList.push(selectedRows[i].name)
          }
          this.currentDevid = this.hdcDeviceList[0]
          store.state.devid = this.currentDevid
        },
        onSelect: (record, selected, selectedRows) => {
          // console.log("onSelect:", record, selected, selectedRows);
          this.hdcDeviceList = []
          for (var i=0; i<selectedRows.length; i++) {
            this.hdcDeviceList.push(selectedRows[i].name)
          }
          getProcessInfo(record.name)
          this.currentDevid = this.hdcDeviceList[0]
          // console.log("onSelect hdcDeviceList:", this.hdcDeviceList)
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          // console.log("onSelectAll:", selected, selectedRows, changeRows);
          this.hdcDeviceList = []
          for (var i=0; i<selectedRows.length; i++) {
            this.hdcDeviceList.push(selectedRows[i].name)
          }
          // console.log("onSelectAll hdcDeviceList:", this.hdcDeviceList)
        },
        type: 'radio'
      },
      rowClick: function (record, index) {
        // // console.log("rowClick : ", record, index)
      },

      resultColumn: [
        {
          title: 'No.',
          dataIndex: 'no',
          key: 'no',
        },
        {
          title: '设备',
          dataIndex: 'devid',
          key: 'devid',
        },
        {
          title: '类型',
          key: 'tags',
          dataIndex: 'tags',
          scopedSlots: { customRender: 'tags' },
        },
        {
          title: '模块',
          dataIndex: 'module',
          key: 'module',
        },
        {
          title: '时间',
          dataIndex: 'octime',
          key: 'octime',
        },
        {
          title: '发生次数',
          dataIndex: 'hcnt',
          key: 'hcnt',
        },
        {
          title: 'Action',
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
      ],
      // resultData: [],
    };
  },
  mounted () {
    // console.log("-------mount----------------------")
    this.init();
    this.monProcname = "监控进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"
    this.chartDom = document.getElementById("myechart");
    this.myChart = echarts.init(this.chartDom);
    this.getState();
    this.initChart();
    this.getHdcDevice();
    window.addEventListener("resize", () => {
      this.myChart.resize();
    })
  }, 
  watch: {
    activeKey(key) {
      // console.log(key);
    },
  }, 
  methods: {
    callback(key) {
      // console.log(key);
    },
    onEdit(targetKey, action) {
      // console.log("onEdit ---------------:", targetKey)
      this[action](targetKey);
    },
    abbTab() {
      const panes = this.panes;
      const activeKey = `newTab${this.newTabIndex++}`;
      // console.log("add ---------------:", activeKey)
      panes.push({
        title: `New Tab ${activeKey}`,
        content: `Content of new Tab ${activeKey}`,
        key: activeKey,
      });
      this.panes = panes;
      this.tabActiveKey = activeKey;
    },
    remove(targetKey) {
      let activeKey = this.activeKey;
      let lastIndex;
      this.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.panes.filter(pane => pane.key !== targetKey);
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].key;
        } else {
          activeKey = panes[0].key;
        }
      }
      this.panes = panes;
      this.activeKey = activeKey;
    },
    initChart() {
      // console.log(document.getElementById("main"), "----d");

      this.option = {
        title: {
          text: '内存使用'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: this.wkResult.top5Process
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.wkResult.memtraceTime,
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: this.wkResult.top5Series,
      };
      this.option && this.myChart.setOption(this.option);
      store.state.costTime = this.wkResult.costTime
      store.state.exceptionCnt = this.wkResult.exceptionCnt
      store.state.cppcrashCnt = this.wkResult.cppcrashCnt
      store.state.jscrashCnt = this.wkResult.jscrashCnt
      store.state.appfreezeCnt = this.wkResult.appfreezeCnt
      store.state.memleakCnt = this.wkResult.memleakCnt
      store.state.top5Process = this.wkResult.top5Process
      store.state.top5Series = this.wkResult.top5Series
      store.state.memtraceTime = this.wkResult.memtraceTime
    },
    getState() {
      console.log("getstate-----:", store.state.pageName, store.state.isTesting, store.state.count)
      if (store.state.pageName == 'AppRandomTest' && 
        (store.state.isTesting || (store.state.count > 0))) {
        this.testStarttime = store.state.testStarttime
        this.wkResult.costTime = store.state.costTime
        this.isTesting = store.state.isTesting
        this.wkResult.exceptionCnt = store.state.exceptionCnt
        this.wkResult.cppcrashCnt = store.state.cppcrashCnt
        this.wkResult.jscrashCnt = store.state.jscrashCnt
        this.wkResult.appfreezeCnt = store.state.appfreezeCnt
        this.wkResult.memleakCnt = store.state.memleakCnt
        this.wkResult.top5Process = store.state.top5Process
        this.wkResult.top5Series = store.state.top5Series
        this.wkResult.memtraceTime = store.state.memtraceTime
        this.wkResult.resultData = store.state.faultResult
        this.testStarttime = store.state.testStarttime
        this.wkResult.testTime = store.state.testDir
        this.wkResult.testJson = store.state.testJson
        this.wkResult.testException = store.state.testException
        this.wkResult.testReport = store.state.testReport
        this.wkParam.testTime = store.state.testTime
        this.wkParam.testDuration = store.state.testDuration
        this.needScreenshot = store.state.needScreenshot

        this.wkParam.memTraceInter = store.state.memTraceInter
        this.wkParam.appWeight = store.state.appWeight
        this.wkParam.touchWeight = store.state.touchWeight
        this.wkParam.slideWeight = store.state.slideWeight
        this.wkParam.clickWeight = store.state.clickWeight
        this.wkParam.hilogTime = store.state.hilogTime
        this.wkParam.needHilog = store.state.needHilog
        this.wkParam.ignoreDefeat = store.state.ignoreDefeat
      }
      this.currentDevid = store.state.devid
      if (this.currentDevid.length > 1) {
        this.hdcDeviceList.push(this.currentDevid)
      }
      this.selectedProcess = store.state.selectedProcess
      this.processList = store.state.processList
      this.monProcname = "监控进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"

      // console.log("costTime:", store.state.devid, this.selectedProcess)
    },
    init () {
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      this.$ipc.removeAllListeners(ipcApiRoute.ipcRunCmd);
      this.$ipc.on(ipcApiRoute.ipcRunCmd, (event, result) => {
        // // console.log("onipc:", result)
        if (result) {
          // let cmdType = result.split(":") ? result.split(":")[0] : "NA"
          let cmdType, curDevid = ""
          let retlist = parseCmdType(result)
          cmdType = retlist[0]
          curDevid = retlist[1]
          // console.log("parsecmdtype ret: ", cmdType, curDevid)
          switch(cmdType) {
            case "hdcListTargets":
              {
                parseHdclist(this.devidData, result)
                this.rowSelection.selectedRowKeys = []
                for (let i=0;i<this.devidData.length;i++) {
                  if (this.devidData[i].name == this.currentDevid) {
                    this.rowSelection.selectedRowKeys.push(i)
                    break
                  }
                }
                // // console.log('[ipcRenderer] [selectedDevids] result:', this.currentDevid, this.rowSelection.selectedRowKeys);
              }
              break;
            case "hdcParamGet":
              {
                console.log("this.devidData : ", this.devidData)
                parseHdcParamGet(result, this.devidData)
              }
              break;
            case "hdcHidumperMem":
              {
                parseHidumperMem(result, this.wkResult.top5Process, this.wkResult.top5Series, this.wkResult.memtraceTime)
                this.initChart()
              }
              
              break;
            case "hdcSnapshotDisplay":
              {
                let resultList = result.split("\n")
                // console.log("hdcSnapshotDisplay resultList:", resultList)
                if (resultList.length>1 && resultList[1].indexOf("write to") >= 0) {
                  let itemList = resultList[1].split(" ")
                  let fileItem = itemList[7]
                  // console.log('hdcSnapshotDisplay result:', itemList);
                  this.fileRecv(fileItem, "snapshot")
                }
              }
              break;
            case "hdcHidumperFault":
              {
                let ret = parseHidumperFault(result, curDevid, this.wkResult)
                if (ret === -1) {
                  this.wkResult.resultData = []
                }
                let typeItemList = result.split("-")
                if (typeItemList.length >= 3 && typeItemList[2].indexOf("start") >= 0) {
                  console.log("hdcHidumperFault start:", this.wkResult.resultData)
                }
              }
              break;
            case "hdcProcessInfo":
              {
                parseProcessInfo(result, this.processList)
                // let resultList = result.split("\n")
                // console.info("hdcProcessInfo : ", resultList)
                // if (resultList.length > 1) {
                //   for (let i=1;i<resultList.length;i++) {
                //     let pname = resultList[i].replace("\t", "").replace("\r", "")
                //     let pos = this.processList.indexOf(pname, 0)
                //     if (pos < 0 && pname != "com.ohos.systemui" && pname != "com.ohos.launcher") {
                //       this.processList.push(pname)
                //     }
                //   }
                // }
                // console.info("hdcProcessInfo processList: ", this.processList)
                this.monProcname = "监控进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"
                // store.state.processList = this.processList
              }
              break;
            case "hdcWuKong":
              {
                let resultList = result.split("\n")
                let itemList = resultList[0].replace(/\s+/ig," ").split(" ")
                let myDate = new Date();
                let dateString = myDate.toLocaleString( );  //获取日期与时间
                this.wkResult.costTime = ((myDate.getTime() - this.testStarttime) / 60000).toFixed(4)
                store.state.costTime = this.wkResult.costTime
                // let fileItem = itemList[itemList.length-1]
                // console.log('hdcWuKong result:', dateString, resultList.length, resultList, itemList, curDevid);
                if (result.indexOf("EnvInit :") > 0) {
                  // console.log("EnvInit :---------------------")
                  for (let i=0; i<resultList.length; i++) {
                    let eventItem = resultList[i]
                    let eventitemList = resultList[i].replace(/\s+/ig," ").split(" ")
                    // console.log("EnvInit :---------------------", eventItem)
                    if (eventItem.indexOf("Report currentTestDir:") >= 0) {
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.wkResult.testTime = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testDir = this.wkResult.testTime
                        }
                      }
                    } else if (eventItem.indexOf("Report CSV:") >= 0) {
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.wkResult.testReport = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testReport = this.wkResult.testReport
                        }
                      }
                    } else if (eventItem.indexOf("Report JSON:") >= 0) {
                      // console.log(" JSON -----------------")
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.wkResult.testJson = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testJson = this.wkResult.testJson
                        }
                      }
                    } else if (eventItem.indexOf("Report exception dir:") >= 0) {
                      // console.log(" exception -----------------")
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.wkResult.testException = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testException = this.wkResult.testException
                        }
                      }
                    }
                  }
                }
                if (itemList.length == 12) {
                  let wukongItem = {
                    cmdTime: dateString,
                    devid: curDevid,
                    cmdId: itemList[2] + itemList[3],
                    cmdName: itemList[4],
                    cmdMsg: itemList[6]+itemList[7]+itemList[8]+itemList[9]+itemList[10],
                    resultInfo: result
                  }
                  this.wukongCmdList.push(wukongItem)
                  // console.log('wukongCmdList result:', this.wukongCmdList);
                  this.makeSnapshot()
                  store.state.cmdHistory = this.wukongCmdList
                }
                if (result.indexOf("all test Finished") >= 0) {
                  // console.log('hdcWuKong test finished!');
                  this.stopRandomTest()
                } 
                this.wukongHistoryCmd += result
                store.state.wukongHistoryCmd += result
              }
              break;
            default:
              break;
          }
          this.messageString = result;
          this.execLog = result;

          // 调用后端的另一个接口
          // this.sendMsgStop();
        }  
      })
      this.taskName = this.taskName + getCurrentTime();
    },
    handleChange(value) {
      // console.log(`process selected :`, value);
      this.selectedProcess = value;
      store.state.selectedProcess = this.selectedProcess
    },
    handleDevResChange(value) {
      // console.log(`devid result selected ${value}`);
    },
    memtimeSet(value) {
      // console.log(`selected ${value}`);
      this.wkParam.memTraceInter = value
    },
    sendFaultTraceStart() {
      // console.log("FaultTrace :", this.hdcDeviceList)
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      traceFault(this.wkParam.memTraceInter, this.hdcDeviceList)
      this.isTesting = true;
    },
    sendFaultTraceStop() {
      stopTraceFault()
      this.isTesting = false;
      // const params = {
      //   type: 'stopFaultTrace',
      //   content: 'stopFaultTrace'
      // }
      // 
      // this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    sendMemTraceStart() {
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      traceMem(this.hdcDeviceList, this.wkParam.memTraceInter)
      this.isTesting = true;
    },
    sendMemTraceStop() {
      stopTraceMem()
      this.isTesting = false;
    },
    sendWukongStop() {
      if (this.hdcDeviceList.length > 0) {
        let devidData = this.hdcDeviceList[0]
        stopWukong(devidData)
        this.isTesting = false;
      }
    },
    sendMsgStart() {
      const params = {
        type: 'start',
        content: 'ipconfig'
      }
      this.isTesting = true;
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    sendMsgStop() {
      const params = {
        type: 'end',
        content: 'ipconfig'
      }
      this.isTesting = false;
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    doRandomTest() {
      // console.log('doRandomTest');
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      this.testStarttime = new Date().getTime()
      this.wkResult.costTime = 0
      this.wkResult.exceptionCnt = 0
      this.wkResult.cppcrashCnt = 0
      this.wkResult.jscrashCnt = 0
      this.wkResult.appfreezeCnt = 0
      this.wkResult.memleakCnt = 0
      this.wkResult.top5Process = []
      this.wkResult.top5Series = []
      this.wkResult.memtraceTime = []
      this.wukongCmdList = []
      this.wukongHistoryCmd = ''
      this.faultResult = []

      store.state.devid = this.currentDevid
      store.state.pageName = 'AppRandomTest'
      store.state.isTesting = true
      store.state.caseName = this.taskName
      store.state.testStarttime = this.testStarttime
      store.state.costTime = 0
      store.state.exceptionCnt = 0
      store.state.cppcrashCnt = 0
      store.state.jscrashCnt = 0
      store.state.appfreezeCnt = 0
      store.state.memleakCnt = 0
      store.state.top5Process = []
      store.state.top5Series = []
      store.state.memtraceTime = []
      store.state.cmdHistory = []
      store.state.wukongHistoryCmd = ''
      store.state.faultResult = []
      store.state.testTime = this.wkParam.testTime
      store.state.testDuration = this.wkParam.testDuration
      store.state.needScreenshot = this.needScreenshot
      store.state.appWeight = this.wkParam.appWeight
      store.state.touchWeight = this.wkParam.touchWeight
      store.state.slideWeight = this.wkParam.slideWeight
      store.state.clickWeight = this.wkParam.clickWeight
      store.state.hilogTime = this.wkParam.hilogTime
      store.state.needHilog = this.wkParam.needHilog
      store.state.ignoreDefeat = this.wkParam.ignoreDefeat
      store.state.memTraceInter = this.wkParam.memTraceInter
      store.state.selectedProcess = this.selectedProcess
      this.wkResult.resultData = []
      this.sendMemTraceStart()
      this.sendFaultTraceStart()
      this.runWukongCmd()
    },
    async stopRandomTest() {
      // console.log('stopRandomTest');
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      store.state.isTesting = false
      store.state.count = 1
      this.sendWukongStop()
      this.sendMemTraceStop()
      this.sendFaultTraceStop()
      let sindex = this.rowSelection.selectedRowKeys[0]

      //存历史记录
      let testHistory = {
        caseName: this.taskName,
        pageName: 'SysRandomTest',
        costTime: this.wkResult.costTime,
        testTime: this.wkParam.testTime,
        testDuration: this.wkParam.testDuration,
        needScreenshot: this.needScreenshot,
        appWeight: this.wkParam.appWeight,
        touchWeight: this.wkParam.touchWeight,
        slideWeight: this.wkParam.slideWeight,
        clickWeight: this.wkParam.clickWeight,
        hilogTime: this.wkParam.hilogTime,
        memTraceInter: this.wkParam.memTraceInter,
        needHilog: this.wkParam.needHilog,
        ignoreDefeat: this.wkParam.ignoreDefeat,
        selectedProcess: this.selectedProcess,
        devid: this.currentDevid,
        exceptionCnt: this.wkResult.exceptionCnt,
        cppcrashCnt: this.wkResult.cppcrashCnt,
        jscrashCnt: this.wkResult.jscrashCnt,
        appfreezeCnt: this.wkResult.appfreezeCnt,
        memleakCnt: this.wkResult.memleakCnt,
        top5Process: this.wkResult.top5Process,
        top5Series: this.wkResult.top5Series,
        memtraceTime: this.wkResult.memtraceTime,
        cmdHistory: this.wukongCmdList,
        wukongHistoryCmd: this.wukongHistoryCmd,
        faultResult: this.wkResult.resultData,
        testDir: this.wkResult.testTime,
        testReport: this.wkResult.testReport,
        testJson: this.wkResult.testJson,
        testException: this.wkResult.testException,
        testStarttime: this.testStarttime,
        hardware: this.devidData[sindex] ? this.devidData[sindex].hardware : "N/A",
        version: this.devidData[sindex] ? this.devidData[sindex].version : "N/A",
        apiversion: this.devidData[sindex] ? this.devidData[sindex].apiversion : "N/A",
        releasetype: this.devidData[sindex] ? this.devidData[sindex].releasetype : "N/A",
        wukongCmdLine: this.wukongCmdLine,
      }
      store.state.testHistory.push(testHistory)

      this.saveTaskResult(testHistory)
      await this.sleep(2000)
      //取wukong报告
      this.fileRecv(this.wkResult.testTime+"/wukong.log", "")
      await this.sleep(2000)
      this.fileRecv(this.wkResult.testReport, "")
      await this.sleep(2000)
      this.fileRecv(this.wkResult.testJson, "")
      await this.sleep(2000)
      this.fileRecv(this.wkResult.testException, "")
      await this.sleep(2000)
      this.taskName = "Task" + getCurrentTime();
    },
    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    },
    getPrinter () {
      this.$ipc.invoke(ipcApiRoute.getPrinterList, {}).then(res => {
        this.printerList = res;
      }) 
    },
    clickDevid (text) {
      // console.log('clickDevid:', text);
      getHdcDeviceInfo(text)
    },
    traceMemory() {
      if (this.hdcDeviceList.length > 0) {
        getProcessInfo(this.hdcDeviceList[0])
      }
    },
    makeSnapshot() {
      if (this.needScreenshot) {
        if (this.hdcDeviceList.length > 0) {
          let devidData = this.hdcDeviceList[0]
          taskSnapshot(devidData)
        }
      }
    },
    fileRecv(filepath, outpath) {
      if (this.hdcDeviceList.length > 0) {
        let devidData = this.hdcDeviceList[0]
        recvFile(devidData, this.taskName, filepath, outpath)
        // const params = {
        //   type: 'hdcFileRecvSnapshot',
        //   taskName: this.taskName,
        //   devid: devidData,
        //   filepath: filepath,
        //   outpath: outpath,
        //   content: 'hdc_std.exe -t ' + devidData + ' file recv ' + filepath
        // }
        // // console.log("fileRecv : ", params.content)
        // this.$ipc.send(ipcApiRoute.fileRecvSnapshort, params)
      }
    },
    saveTaskResult(testHistory) {
      let devidData = this.hdcDeviceList[0] ? this.hdcDeviceList[0] : "NA"
      saveResult(devidData, this.taskName, testHistory)
      // const param = {
      //   fileName: this.taskName + "-" + devidData + ".txt",
      //   taskName: this.taskName,
      //   devid: devidData,
      //   data: JSON.stringify(testHistory)
      // }
      // this.$ipc.send(ipcApiRoute.createFile, param)
    },
    runWukongCmd() {
      //wukong exec -s 10 -i 1000 -a 0.28 -t 0.72 -c 100
      if (this.hdcDeviceList.length > 0) {
        let devidData = this.hdcDeviceList[0]
        let selecedProcname = ""
        for (let i=0;i<this.selectedProcess.length;i++) {
          selecedProcname += this.selectedProcess[i] + ","
        }
        if (selecedProcname.length > 1) {
          selecedProcname = " -b" + selecedProcname
        }
        let seed = Math.round(Math.random()*10+10);
        let wukongCmd = " shell wukong exec -s " + seed.toString() + " -i " + this.wkParam.testDuration +
          " -a " + this.wkParam.appWeight + " -t " + this.wkParam.touchWeight + " -T " + this.wkParam.testTime +
          selecedProcname + " -S " + this.wkParam.slideWeight
        // const params = {
        //   type: 'hdcWuKong',
        //   devid: devidData,
        //   content: 'hdc_std.exe -t ' + devidData + wukongCmd
        // }
        // this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
        let content = execWukong(devidData, wukongCmd)
        this.wukongCmdLine = content
        store.state.wukongCmdLine = this.wukongCmdLine
      }
    },
    getHdcDevice () {
      this.devidData = []
      listHdcTargets()
    },
    // getHdcDeviceInfo (devid) {
    //   const params = {
    //     type: 'hdcParamGet',
    //     content: 'hdc_std.exe -t ' + devid + " shell param get"
    //   }
    //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    // },
    // getProcessInfo (devid) {
    //   const params = {
    //     type: 'hdcProcessInfo',
    //     devid: devid,
    //     content: 'hdc_std.exe -t ' + devid + " shell bm dump -a"
    //   }
    //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    // },
    // getMemoryInfo (devid) {
    //   const params = {
    //     type: 'hdcHidumperMem',
    //     content: 'hdc_std.exe -t ' + devid + " shell hidumper --mem"
    //   }
    //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    // },
    doPrint (index) {
      // console.log('defaultDeviceName:', this.defaultDeviceName)
      const params = {
        view: this.views[index],
        deviceName: this.defaultDeviceName
      };
      this.$ipc.send(ipcApiRoute.print, params)
    },
    defaultDevice (item) {
      let desc = "";
      if (item.isDefault) {
        desc = "- 默认";
        this.defaultDeviceName = item.name;
      }
      
      return desc;
    } 
  }
};
</script>
<style lang="less" scoped>
#app-hw-bluetooth {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
    display: flex;
    // flex-wrap: nowrap;
  }
  .one-block-2 {
    padding-top: 10px;
  }
  .one-block-3 {
    margin-right: 10px;
    width: 200px;
  }
  .one-block-4 {
    padding: 5px 5px;
    font-size: 14px;
  }
  .one-block-5 {
    margin-left: 5px;
    margin-right: 5px;
    width: 200px;
  }
  .one-block-6 {
    margin-top: 20px;
    background-color:darkgray;
    width: 100%;
    height: 1px;
  }

  .one-block-7 {
    padding-left: 20px;
    width: 17%;
  }

  .one-block-8 {
    padding-left: 5px;
    width: 100%;
  }

  .one-block-9 {
    margin-right: 5px;
    width: 24%;
  }

  .one-block-10 {
    margin-right: 10px;
    width: 150px;
    font-size: 15px;
  }
}
</style>
