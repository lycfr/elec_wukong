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
            <a-input v-model="testTime" :value="testTime" addon-before="测试时长(分钟)" :disabled="isTesting" />
          </a-col>
          <a-col :span="8" class="one-block-5">
            <a-input v-model="testDuration" :value="testDuration" addon-before="操作间隔(分钟)" :disabled="isTesting" />
          </a-col>
          <a-col :span="8" class="one-block-5">
            <a-input v-model="hilogTime" :value="hilogTime" addon-before="Hilog保存时长(分钟)" :disabled="isTesting" />
          </a-col>
          <a-col :span="3" class="one-block-4">
            <span>
              开启截图:
            </span>
            <a-switch v-model="needScreenshot" :value="needScreenshot" :disabled="isTesting"/>
          </a-col>
          <a-col :span="3" class="one-block-4">
            <span>
              开启Hilog:
            </span>
            <a-switch v-model="needHilog" :value="needHilog" :disabled="isTesting"/>
          </a-col>
          <a-col :span="3" class="one-block-4">
            <span>
              忽略重复问题:
            </span>
            <a-switch v-model="ignoreDefeat" :value="ignoreDefeat" :disabled="isTesting"/>
          </a-col>
        </div>
        <div class="one-block-1">
          <a-col :span="6" class="one-block-5">
            <a-input v-model="appWeight" :value="appWeight" addon-before="应用拉起权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="6" class="one-block-5">
            <a-input v-model="touchWeight" :value="touchWeight" addon-before="按键操作权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="6" class="one-block-5">
            <a-input v-model="slideWeight" :value="slideWeight" addon-before="滑动操作权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="6" class="one-block-5">
            <a-input v-model="clickWeight" :value="clickWeight" addon-before="点击操作权重(%)"  :disabled="isTesting"/>
          </a-col>
          <a-col :span="9" class="one-block-9">
            <span style="font-size: 14px">
              内存采集间隔:
            </span>
            <a-select :default-value="memTraceInter" style="width: 120px" @change="memtimeSet" :disabled="isTesting">
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
          <a-button class="one-block-5" @click="traceMemory()"> 采内存 </a-button>
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
              <a-statistic title="测试时长(分钟)" :value="costTime" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="异常数(个)" :value="exceptionCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="cppcrash(个)" :value="cppcrashCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="jscrash(个)" :value="jscrashCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="appfreeze(个)" :value="appfreezeCnt" style="margin-right: 50px" />
            </a-col>
            <a-col :span="6" class="one-block-7">
              <a-statistic title="memleak(个)" :value="memleakCnt" style="margin-right: 50px" />
            </a-col>
          </div>
        </div>
        <div class="one-block-2">
          <a-textarea v-model="execLog" :rows="4" :disabled="true"/>
        </div>
        <div class="one-block-1">
          <a-col :span="8" class="one-block-9">
            <a-input v-model="testDir" :value="testDir" addon-before="测试目录" />
          </a-col>
          <a-col :span="6" class="one-block-9">
            <a-input v-model="testReport" :value="testReport" addon-before="测试报告" />
          </a-col>
          <a-col :span="6" class="one-block-9">
            <a-input v-model="testJson" :value="testJson" addon-before="测试JSON" />
          </a-col>
          <a-col :span="6" class="one-block-9">
            <a-input v-model="testException" :value="testException" addon-before="测试异常" />
          </a-col>
        </div>
        <div class="one-block-1">
          <span class="one-block-10">
            {{monMemory}}：
          </span>
          <a-select
            mode="multiple"
            :default-value="monitorProcess"
            :value="monitorProcess"
            style="width: 90%"
            placeholder="Please select"
            @change="handleMonMemoryChange"
          >
            <a-select-option v-for="i in processMemoryList" :key="i">
              {{ i }}
            </a-select-option>
          </a-select>
        </div>
        <div class="one-block-1">
          <div id="myechart" class="one-block-8" style="height: 200px; width: 99%"></div>
        </div>
      </a-collapse-panel>
    </a-collapse>
    
    <div class="one-block-1">
      <a-table class="one-block-6" :columns="resultColumn" :data-source="resultData">
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
      processMemoryList: [],
      selectedProcess: ['com.ohos.photos', 'com.ohos.callui'],
      monitorProcess: ['render_service', 'foundation', 'com.ohos.system'],
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
      monProcname: "规避进程",
      monMemory: "内存查看",
      testTime: 60,
      testStarttime: 0,
      testDuration: 2000,
      needScreenshot: true,
      appWeight: 0.25,
      touchWeight: 0.45,
      slideWeight: 0.1,
      clickWeight: 0.2,
      hilogTime: 2,
      needHilog: false,
      ignoreDefeat: false,
      wukongCmd: "hdc_std.exe shell wukong exec -s 10 -i 1000 -a 0.28 -t 0.72 -c 10",
      wukongCmdLine: "",
      execLog: "wukongCmd",
      testDir: "",
      testReport: "",
      testJson: "",
      testException: "",
      costTime: 0,
      exceptionCnt: 0,
      cppcrashCnt: 0,
      jscrashCnt: 0,
      appfreezeCnt: 0,
      sysfreezeCnt: 0,
      memleakCnt: 0,
      isTesting: false,
      interSelect: [10,30,60],
      memTraceInter: 10,
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
          console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows: ', selectedRows);
          this.rowSelection.selectedRowKeys = selectedRowKeys
          this.hdcDeviceList = []
          for (var i=0; i<selectedRows.length; i++) {
            this.hdcDeviceList.push(selectedRows[i].name)
          }
          this.currentDevid = this.hdcDeviceList[0]
          store.state.devid = this.currentDevid
        },
        onSelect: (record, selected, selectedRows) => {
          console.log("onSelect:", record, selected, selectedRows);
          this.hdcDeviceList = []
          for (var i=0; i<selectedRows.length; i++) {
            this.hdcDeviceList.push(selectedRows[i].name)
          }
          this.getProcessInfo(record.name)
          this.currentDevid = this.hdcDeviceList[0]
          console.log("onSelect hdcDeviceList:", this.hdcDeviceList)
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          console.log("onSelectAll:", selected, selectedRows, changeRows);
          this.hdcDeviceList = []
          for (var i=0; i<selectedRows.length; i++) {
            this.hdcDeviceList.push(selectedRows[i].name)
          }
          console.log("onSelectAll hdcDeviceList:", this.hdcDeviceList)
        },
        type: 'radio'
      },
      rowClick: function (record, index) {
        // console.log("rowClick : ", record, index)
      },
      memProcess: [],
      // memtraceTime: ['2023-05-23 14:08:31', '2023-05-23 15:08:38', '2023-05-23 16:08:38', '2023-05-23 17:08:38', '2023-05-23 18:08:38', '2023-05-23 19:08:38', '2023-05-23 20:08:38'],
      memtraceTime: [],
      // 'com.ohos.system', 'com.ohos.smartp', 'com.ohos.note', 'com.ohos.permis', 'com.ohos.launch'
      top5Process: [],
      top5Series: [],
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
      resultData: [],
    };
  },
  mounted () {
    console.log("-------mount----------------------")
    this.init();
    this.monProcname = "规避进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"
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
      console.log(key);
    },
  }, 
  methods: {
    callback(key) {
      console.log(key);
    },
    onEdit(targetKey, action) {
      console.log("onEdit ---------------:", targetKey)
      this[action](targetKey);
    },
    abbTab() {
      const panes = this.panes;
      const activeKey = `newTab${this.newTabIndex++}`;
      console.log("add ---------------:", activeKey)
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
      console.log(document.getElementById("main"), "----d");

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
          data: this.top5Process
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
            data: this.memtraceTime,
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: this.top5Series,
      };
      this.option && this.myChart.setOption(this.option);
      store.state.costTime = this.costTime
      store.state.exceptionCnt = this.exceptionCnt
      store.state.cppcrashCnt = this.cppcrashCnt
      store.state.jscrashCnt = this.jscrashCnt
      store.state.appfreezeCnt = this.appfreezeCnt
      store.state.memleakCnt = this.memleakCnt
      store.state.top5Process = this.top5Process
      store.state.top5Series = this.top5Series
      store.state.memtraceTime = this.memtraceTime
    },
    getState() {
      // console.log("getstate-----:", store.state.pageName, store.state.isTesting, store.state.count)
      if (store.state.pageName == 'SysRandomTest' && 
        (store.state.isTesting || (store.state.count > 0))) {
        this.isTesting = store.state.isTesting
        this.costTime = store.state.costTime 
        this.exceptionCnt = store.state.exceptionCnt
        this.cppcrashCnt = store.state.cppcrashCnt
        this.jscrashCnt = store.state.jscrashCnt
        this.appfreezeCnt = store.state.appfreezeCnt
        this.memleakCnt = store.state.memleakCnt
        this.top5Process = store.state.top5Process
        this.top5Series = store.state.top5Series
        this.memtraceTime = store.state.memtraceTime
        this.resultData = store.state.faultResult
        this.testStarttime = store.state.testStarttime
        this.testDir = store.state.testDir
        this.testJson = store.state.testJson
        this.testException = store.state.testException
        this.testReport = store.state.testReport
        this.memTraceInter = store.state.memTraceInter
        this.testTime = store.state.testTime
        this.testDuration = store.state.testDuration
        this.needScreenshot = store.state.needScreenshot
        this.appWeight = store.state.appWeight
        this.touchWeight = store.state.touchWeight
        this.slideWeight = store.state.slideWeight
        this.clickWeight = store.state.clickWeight
        this.hilogTime = store.state.hilogTime
        this.needHilog = store.state.needHilog
        this.ignoreDefeat = store.state.ignoreDefeat
        this.processMemoryList = store.state.processMemoryList
        this.memProcess = store.state.memProcess
      }
      this.currentDevid = store.state.devid
      if (this.currentDevid.length > 1) {
        this.hdcDeviceList.push(this.currentDevid)
      }
      this.selectedProcess = store.state.selectedProcess
      this.processList = store.state.processList
      this.monProcname = "规避进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"

      // console.log("costTime:", store.state.devid, this.selectedProcess)
    },
    init () {
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      this.$ipc.removeAllListeners(ipcApiRoute.ipcRunCmd);
      this.$ipc.on(ipcApiRoute.ipcRunCmd, (event, result) => {
        console.log("onipc:", result)
        if (result) {
          // let cmdType = result.split(":") ? result.split(":")[0] : "NA"
          let cmdType, curDevid = ""
          let retlist = parseCmdType(result)
          cmdType = retlist[0]
          curDevid = retlist[1]
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
                this.costTime = ((myDate.getTime() - this.testStarttime) / 60000).toFixed(4)
                store.state.costTime = this.costTime
                // let fileItem = itemList[itemList.length-1]
                console.log('hdcWuKong result:', dateString, resultList.length, resultList, itemList, curDevid);
                if (result.indexOf("EnvInit :") > 0) {
                  // console.log("EnvInit :---------------------")
                  for (let i=0; i<resultList.length; i++) {
                    let eventItem = resultList[i]
                    let eventitemList = resultList[i].replace(/\s+/ig," ").split(" ")
                    // console.log("EnvInit :---------------------", eventItem)
                    if (eventItem.indexOf("Report currentTestDir:") >= 0) {
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.testDir = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testDir = this.testDir
                        }
                      }
                    } else if (eventItem.indexOf("Report CSV:") >= 0) {
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.testReport = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testReport = this.testReport
                        }
                      }
                    } else if (eventItem.indexOf("Report JSON:") >= 0) {
                      // console.log(" JSON -----------------")
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.testJson = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testJson = this.testJson
                        }
                      }
                    } else if (eventItem.indexOf("Report exception dir:") >= 0) {
                      // console.log(" exception -----------------")
                      for (let j=0; j<eventitemList.length; j++) {
                        if (eventitemList[j].indexOf("(/data") >= 0) {
                          this.testException = eventitemList[j].replace("(", "").replace(")", "").replace("\"", "")
                          store.state.testException = this.testException
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
                  this.taskSnapshot()
                  store.state.cmdHistory = this.wukongCmdList
                }
                if (result.indexOf("all test Finished") >= 0) {
                  console.log('hdcWuKong test finished!');
                  this.stopRandomTest()
                } 
                if (result.indexOf("-close") >= 0) {
                  console.log('hdcWuKong test terminated!');
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
      this.taskName = this.taskName + this.getCurrentTime();
    },
    handleChange(value) {
      console.log(`process selected :`, value);
      this.selectedProcess = value;
      store.state.selectedProcess = this.selectedProcess
      this.monProcname = "规避进程"+"["+this.selectedProcess.length+"/"+this.processList.length+"]"
    },
    handleMonMemoryChange(value) {
      console.log(`process selected :`, value);
      this.monitorProcess = value;
      store.state.monitorProcess = this.monitorProcess
    },
    handleDevResChange(value) {
      console.log(`devid result selected ${value}`);
    },
    memtimeSet(value) {
      console.log(`selected ${value}`);
      this.memTraceInter = value
    },
    sendFaultTraceStart() {
      console.log("FaultTrace :", this.hdcDeviceList)
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      var cmdContent = []
      let devidList = []
      for (var i=0; i<this.hdcDeviceList.length; i++) {
        var cmdItem = "hdc_std.exe -t " + this.hdcDeviceList[i] + " shell ls -l /data/log/faultlog/faultlogger/"
        cmdContent.push(cmdItem)
        devidList.push(this.hdcDeviceList[i])
      }
      const params = {
        type: 'startFaultTrace',
        replyType: 'hdcHidumperFault',
        intertime: this.memTraceInter*60*1000,
        devid: devidList,
        content: cmdContent
      }
      this.isTesting = true;
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    sendFaultTraceStop() {
      const params = {
        type: 'stopFaultTrace',
        content: 'stopFaultTrace'
      }
      this.isTesting = false;
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    sendMemTraceStart() {
      let devidList = []
      let cmdContent = []
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      for (var i=0; i<this.hdcDeviceList.length; i++) {
        var cmdItem = "hdc_std.exe -t " + this.hdcDeviceList[i] + " shell hidumper --mem"
        cmdContent.push(cmdItem)
        devidList.push(this.hdcDeviceList[i])
      }
      const params = {
        type: 'startMemTrace',
        replyType: 'hdcHidumperMem',
        intertime: this.memTraceInter*60*1000,
        devid: devidList,
        content: cmdContent
      }
      this.isTesting = true;
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    sendMemTraceStop() {
      const params = {
        type: 'stopMemTrace',
        content: 'stopMemTrace'
      }
      this.isTesting = false;
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
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
    getCurrentTime() {
      //获取当前时间并打印
      let yy = new Date().getFullYear();
      let mm = new Date().getMonth()+1;
      let dd = new Date().getDate();
      let hh = new Date().getHours();
      let mf = new Date().getMinutes()<10 ? '0'+new Date().getMinutes() : new Date().getMinutes();
      let ss = new Date().getSeconds()<10 ? '0'+new Date().getSeconds() : new Date().getSeconds();
      let time = yy+''+mm+''+dd+'-'+hh+''+mf+''+ss;
      return time;
    },
    doRandomTest() {
      console.log('doRandomTest');
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      this.testStarttime = new Date().getTime()
      this.costTime = 0
      this.exceptionCnt = 0
      this.cppcrashCnt = 0
      this.jscrashCnt = 0
      this.appfreezeCnt = 0
      this.memleakCnt = 0
      this.top5Process = []
      this.top5Series = []
      this.memtraceTime = []
      this.wukongCmdList = []
      this.wukongHistoryCmd = ''
      this.faultResult = []
      this.processMemoryList = []
      this.memProcess = []

      store.state.devid = this.currentDevid
      store.state.pageName = 'SysRandomTest'
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
      store.state.testTime = this.testTime
      store.state.testDuration = this.testDuration
      store.state.needScreenshot = this.needScreenshot
      store.state.appWeight = this.appWeight
      store.state.touchWeight = this.touchWeight
      store.state.slideWeight = this.slideWeight
      store.state.clickWeight = this.clickWeight
      store.state.hilogTime = this.hilogTime
      store.state.needHilog = this.needHilog
      store.state.ignoreDefeat = this.ignoreDefeat
      store.state.memTraceInter = this.memTraceInter
      store.state.selectedProcess = this.selectedProcess
      store.state.processMemoryList = this.processMemoryList
      store.state.memProcess = this.memProcess
      
      this.sendMemTraceStart()
      this.sendFaultTraceStart()
      this.runWukongCmd()
    },
    async stopRandomTest() {
      console.log('stopRandomTest');
      if (this.hdcDeviceList.length <= 0) {
        this.$message.error("请选择待测设备！");
        return
      }
      store.state.isTesting = false
      store.state.count = 1
      this.sendMemTraceStop()
      this.sendFaultTraceStop()
      let sindex = this.rowSelection.selectedRowKeys[0]

      //存历史记录
      let testHistory = {
        caseName: this.taskName,
        pageName: 'SysRandomTest',
        costTime: this.costTime,
        testTime: this.testTime,
        testDuration: this.testDuration,
        needScreenshot: this.needScreenshot,
        appWeight: this.appWeight,
        touchWeight: this.touchWeight,
        slideWeight: this.slideWeight,
        clickWeight: this.clickWeight,
        hilogTime: this.hilogTime,
        memTraceInter: this.memTraceInter,
        needHilog: this.needHilog,
        ignoreDefeat: this.ignoreDefeat,
        selectedProcess: this.selectedProcess,
        devid: this.currentDevid,
        exceptionCnt: this.exceptionCnt,
        cppcrashCnt: this.cppcrashCnt,
        jscrashCnt: this.jscrashCnt,
        appfreezeCnt: this.appfreezeCnt,
        memleakCnt: this.memleakCnt,
        top5Process: this.top5Process,
        top5Series: this.top5Series,
        memtraceTime: this.memtraceTime,
        cmdHistory: this.wukongCmdList,
        wukongHistoryCmd: this.wukongHistoryCmd,
        faultResult: this.resultData,
        testDir: this.testDir,
        testReport: this.testReport,
        testJson: this.testJson,
        testException: this.testException,
        testStarttime: this.testStarttime,
        hardware: this.devidData[sindex].hardware,
        version: this.devidData[sindex].version,
        apiversion: this.devidData[sindex].apiversion,
        releasetype: this.devidData[sindex].releasetype,
        wukongCmdLine: this.wukongCmdLine,
        memProcess: this.memProcess
      }
      store.state.taskHistory.push(testHistory)

      this.saveTaskResult(testHistory)
      await this.sleep(2000)
      //取wukong报告
      this.fileRecv(this.testDir+"/wukong.log", "")
      await this.sleep(2000)
      this.fileRecv(this.testReport, "")
      await this.sleep(2000)
      this.fileRecv(this.testJson, "")
      await this.sleep(2000)
      this.fileRecv(this.testException, "")
      await this.sleep(2000)
      this.taskName = "Task" + this.getCurrentTime();
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
      console.log('clickDevid:', text);
      this.getHdcDeviceInfo(text)
    },
    traceMemory() {
      console.log("traceMemory :", this.hdcDeviceList)
      if (this.hdcDeviceList.length > 0) {
        let devidData = this.hdcDeviceList[0]
        this.getMemoryInfo(devidData)
      }
      // if (this.hdcDeviceList.length > 0) {
      //   let devidData = this.hdcDeviceList[0]
      //   const params = {
      //     type: 'hdcHidumperFault',
      //     devid: devidData,
      //     content: 'hdc_std.exe -t ' + devidData + ' shell ls -l /data/log/faultlog/faultlogger/'
      //   }
      //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      // }

      // const param = {
      //   fileName: "testa.txt",
      //   data: "{name:'123'}"
      // }
      // this.$ipc.send(ipcApiRoute.createFile, param)
      // console.log("createFile :", param)

      // if (this.hdcDeviceList.length > 0) {
      //   let devidData = this.hdcDeviceList[0]
      //   const params = {
      //     type: 'hdcSnapshotDisplay',
      //     devid: devidData,
      //     content: 'hdc_std.exe -t ' + devidData + ' shell snapshot_display'
      //   }
      //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      // }

      // if (this.hdcDeviceList.length > 0) {
      //   let devidData = this.hdcDeviceList[0]
      //   const params = {
      //     type: 'hdcFileRecv',
      //     devid: devidData,
      //     content: 'hdc_std.exe -t ' + devidData + ' file recv /data/snapshot_2023-05-27_11-21-45.jpeg .'
      //   }
      //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      // }


      // //wukong exec -s 10 -i 1000 -a 0.28 -t 0.72 -c 100
      // if (this.hdcDeviceList.length > 0) {
      //   let devidData = this.hdcDeviceList[0]
      //   let wukongCmd = " shell wukong exec -s 10 -i " + this.testDuration +
      //     " -a " + this.appWeight + " -t " + this.touchWeight + " -T 1"
      //   const params = {
      //     type: 'hdcWuKong',
      //     devid: devidData,
      //     content: 'hdc_std.exe -t ' + devidData + wukongCmd
      //   }
      //   this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
      // }
      // if (this.hdcDeviceList.length > 0) {
      //   this.getProcessInfo(this.hdcDeviceList[0])
      // }
    },
    taskSnapshot() {
      if (this.needScreenshot) {
        if (this.hdcDeviceList.length > 0) {
          let devidData = this.hdcDeviceList[0]
          const params = {
            type: 'hdcSnapshotDisplay',
            devid: devidData,
            content: 'hdc_std.exe -t ' + devidData + ' shell snapshot_display'
          }
          this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
        }
      }
    },
    fileRecv(filepath, outpath) {
      if (this.hdcDeviceList.length > 0) {
        let devidData = this.hdcDeviceList[0]
        const params = {
          type: 'hdcFileRecvSnapshot',
          taskName: this.taskName,
          devid: devidData,
          filepath: filepath,
          outpath: outpath,
          content: 'hdc_std.exe -t ' + devidData + ' file recv ' + filepath
        }
        // console.log("fileRecv : ", params.content)
        this.$ipc.send(ipcApiRoute.fileRecvSnapshort, params)
      }
    },
    filesRecv(filepaths, outpaths) {
      if (this.hdcDeviceList.length > 0) {
        let devidData = this.hdcDeviceList[0]
        let cmdContent = []
        for (let i=0;i<filepaths.length;i++) {
          cmdContent.push('hdc_std.exe -t ' + devidData + ' file recv ' + filepaths[i])
        }
        const params = {
          type: 'hdcFileRecvSnapshot',
          taskName: this.taskName,
          devid: devidData,
          filepath: filepaths,
          outpath: outpaths,
          content: cmdContent
        }
        console.log("filesRecv : ", params.content)
        this.$ipc.send(ipcApiRoute.filesRecv, params)
      }
    },
    saveTaskResult(testHistory) {
      let devidData = this.hdcDeviceList[0] ? this.hdcDeviceList[0] : "NA"
      const param = {
        fileName: this.taskName + "-" + devidData + ".txt",
        taskName: this.taskName,
        devid: devidData,
        data: JSON.stringify(testHistory)
      }
      this.$ipc.send(ipcApiRoute.createFile, param)
    },
    runWukongCmd() {
      //wukong exec -s 10 -i 1000 -a 0.28 -t 0.72 -c 100
      if (this.hdcDeviceList.length > 0) {
        let devidData = this.hdcDeviceList[0]
        let selecedProcname = ""
        for (let i=0;i<this.selectedProcess.length;i++) {
          selecedProcname += this.selectedProcess[i] + ","
        }
        let procCmd = ""
        if (selecedProcname.length > 1) {
          procCmd += " -p " + selecedProcname
        }
        let wukongCmd = " shell wukong exec -s 10 -i " + this.testDuration +
          " -a " + this.appWeight + " -t " + this.touchWeight + " -T " + this.testTime +
          procCmd + " -S " + this.slideWeight
        const params = {
          type: 'hdcWuKong',
          devid: devidData,
          content: 'hdc_std.exe -t ' + devidData + wukongCmd
        }
        this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
        this.wukongCmdLine = params.content
        store.state.wukongCmdLine = params.content
      }
    },
    getHdcDevice () {
      const params = {
        type: 'hdcListTargets',
        content: 'hdc_std.exe list targets'
      }
      this.devidData = []
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    getHdcDeviceInfo (devid) {
      const params = {
        type: 'hdcParamGet',
        content: 'hdc_std.exe -t ' + devid + " shell param get"
      }
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    getProcessInfo (devid) {
      const params = {
        type: 'hdcProcessInfo',
        devid: devid,
        content: 'hdc_std.exe -t ' + devid + " shell bm dump -a"
      }
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    getMemoryInfo (devid) {
      const params = {
        type: 'hdcHidumperMem',
        devid: devid,
        content: 'hdc_std.exe -t ' + devid + " shell hidumper --mem"
      }
      this.$ipc.send(ipcApiRoute.ipcRunCmd, params)
    },
    doPrint (index) {
      console.log('defaultDeviceName:', this.defaultDeviceName)
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
    padding-left: 50px;
    width: 19%;
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
