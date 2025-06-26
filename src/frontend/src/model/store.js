import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    count: 0,
    isTesting: false,
    caseName: 'unknown',
    pageName: 'unknown',
    devid: 'unknown',
    hardware: '',
    version: '',
    apiVersion: '',
    testTime: 60,
    testDuration: 2000,
    needScreenshot: true,
    appWeight: 0.25,
    touchWeight: 0.45,
    slideWeight: 0.1,
    clickWeight: 0.2,
    hilogTime: 2,
    memTraceInter: 10,
    needHilog: false,
    ignoreDefeat: false,
    selectedProcess: ['com.ohos.photos', 'com.ohos.callui'],
    monitorProcess: ['render_service', 'foundation', 'com.ohos.system'],
    memProcess: [],
    processMemoryList: [],
    processList: [],
    taskHistory: [],
    cmdHistory: [],
    wukongCmdLine: '',
    wukongHistoryCmd: '',
    testHistory: [],
    testStarttime: 0,
    costTime: 0,
    exceptionCnt: 0,
    cppcrashCnt: 0,
    jscrashCnt: 0,
    appfreezeCnt: 0,
    memleakCnt: 0,
    top5Process: [],
    top5Series: [],
    memtraceTime: [],
    faultResult: [],
    testDir: "",
    testReport: "",
    testJson: "",
    testException: "",
    logHistroy: [],
    currentHistoryTask: {}
}

export default new Vuex.Store({
    state
})