<!--
 * @Author: wshikh wangshi@kaihong.com
 * @Date: 2023-12-10 10:34:10
 * @LastEditors: wshikh wangshi@kaihong.com
 * @LastEditTime: 2023-12-10 14:18:36
 * @FilePath: \elec_wukong\src\frontend\src\views\os\windowview\Index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="app-base-window-view">
    <div class="one-block-1">
      <!-- <span>
        1. 嵌入web内容
      </span> -->
      <div class="container">
        <div class="button-container">
          <button @click="addTab">+</button>
        </div>
        <div class="button-container">
          <button class="delete-button" @click="deleteTab()">-</button>
        </div>
        <div class="tabs-container">
          <a-tabs v-model="selectedTab">
            <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.title">
              
              
              <!-- {{ tab.content }} -->
              <div class="one-block-1">
                <div class="one-block-1" :ref="'terminal'+tab.key" :id="'terminal'+tab.key"></div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
      
      
      
    </div>
    <!-- <div class="one-block-2">
      <a-space>
        <a-button @click="loadViewContent(0)">加载百度页面</a-button>
        <a-button @click="removeViewContent(0)">移除百度页面</a-button>
      </a-space>
    </div>
    <div class="one-block-1">
      <span>
        2. 嵌入html内容
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="loadViewContent(1)">加载html页面</a-button>
        <a-button @click="removeViewContent(1)">移除html页面</a-button>
      </a-space>
    </div> -->
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main'
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const upArrow = 'G1tB';
const downArrow = 'G1tC';
const leftArrow = 'G1tE';
const rightArrow = 'G1tD';
const enterKey = 'DQ==';

export default {
  data() {
    return {
      order: "",
      urlParam: {
        fullTag: "",
        namespace: "",
        podName: ""
      },
      tabs: [],
      selectedTab: 1,
      shellWs: "", // ws实例
      currentTid: "",
      terminals: new Map(),
      fitAddons: new Map(),
      term: "", // 保存terminal实例
      shellCmd: "",
      xterm: null,
      fitAddon: null,
      channels: null,
      showOrder: "", // 保存服务端返回的命令
      inputList: [], // 保存用户输入的命令，用以上下健切换
      resList: [],
      views: [
        {
          type: 'web',
          content: 'https://www.baidu.com/'
        },
        {
          type: 'html',
          content: '/public/html/view_example.html'
        },
      ],
    };
  },
  created() {

  },
  mounted() {
    this.init()
    this.addTab()
  },
  methods: {
    addTab() {
      const newTab = {
        key: (this.tabs.length + 1).toString(),
        title: `Tab ${this.tabs.length + 1}`,
        content: `Content of Tab ${this.tabs.length + 1}`
      }
      this.tabs.push(newTab)
      this.selectedTab = newTab.key
      let terminalkey = 'terminal'+newTab.key
      this.initConnect(terminalkey)
    },
    deleteTab() {
      let key = this.selectedTab
      console.log('deleteTab: ', key)
      this.tabs = this.tabs.filter(tab => tab.key !== key)
      if (this.selectedTab === key) {
        this.selectedTab = this.tabs.length > 0 ? this.tabs[0].key : ''
      }
      let terminalkey = 'terminal'+key
      this.destroyTerm(terminalkey)
    },
    init() {
      let that = this
      this.$ipc.on(ipcApiRoute.openSoftware, (event, result) => {
        // that.resList.push(result)
        if (!that.inputList.includes(result)) {
          console.log("%o", result)
          console.log("termnials", that.terminals, that.selectedTab)
          let terminalkey = 'terminal'+that.selectedTab
          if (that.terminals.has(terminalkey)) {
            that.terminals.get(terminalkey).write(result)
          }
          // that.xterm.write(result)
          // console.log("inputList: ", that.inputList, that.resList)
          
        } else {
          console.log("%o", result)
        }
      })
    },
    initConnect(terminalkey) {
      if (this.terminals.has(terminalkey)) {
        return
      }
      let that = this;
      const params = {
        tid: this.currentTid,
        softName: "powershell.exe"
      }
      this.$ipc.invoke(ipcApiRoute.createTerminal, params).then(result => {
        console.log("openSoft:", result)
        this.data = result;
          let terminalContainer = document.getElementById(terminalkey)
          let term = new Terminal({
            cursorBlink: true,
            cols: 120,
            rows: 9999,
          })
          let fitAddon = new FitAddon();
          term.loadAddon(fitAddon);
          term.open(terminalContainer, true)
          
          console.log("data:", this.data)
          that.xterm = term
          that.fitAddon = fitAddon;
          term.onData((data) => {
            let input = btoa(data)
            console.log("data", data, btoa(data))
            switch (input) {
              case upArrow:
                {
                  console.log("upArrow")
                }
                break;
              case downArrow:
                {
                  console.log("downArrow")
                }
                break;
              case leftArrow:
                {
                  console.log("leftArrow")
                }
                break;
              case rightArrow:
                {
                  console.log("rightArrow")
                }
                break;
              case enterKey:
                console.log("enterKey")
                // that.shellCmd += data
                {
                  that.shellCmd += '\n'
                  console.log("回车")
                  that.inputList.push(that.shellCmd)
                  let tkey = 'terminal' + that.selectedTab
                  that.terminals.get(tkey).write('\r\n')
                  const inputParams = {
                    tid: this.currentTid,
                    softName: that.shellCmd
                  }
                  this.$ipc.invoke(ipcApiRoute.runTerminal, inputParams).then(result => {
                    console.log("openSoft:", result)
                  })
                  
                  that.shellCmd = ""
                }
                break;
              default:
                {
                  let tkey = 'terminal' + that.selectedTab
                  that.terminals.get(tkey).write(data)
                  that.shellCmd += data
                  console.log("input")
                }
                break;
            }
          })
          term.onSelectionChange(() => {
            let hasSelection = term.hasSelection()
            if (hasSelection) {
              console.log("selection:", term.getSelection())
            }
          })
          console.log("add terminals", that.terminals)
          that.terminals.set(terminalkey, term)
          that.fitAddons.set(terminalkey, fitAddon)
          that.terminals.get(terminalkey).write('xterm')
      })
      // this.$ipc.invoke(ipcApiRoute.getScreen, 0).then(result => {
          
      //     // term.on("selection", function() {
      //     //   if (term.hasSelection()) {
      //     //     console.log("copy", term.getSelection())
      //     //   }
      //     // })
      //   })
    },
    destroyTerm(terminalkey) {
      if (!this.terminals.has(terminalkey)) {
        console.log("cant find terminal: ", terminalkey)
        return
      }
      let xterm = this.terminals.get(terminalkey)
      if (xterm) {
        xterm.dispose();
        xterm = null;
      }
      let fitAddon = this.fitAddons.get(terminalkey)
      if (fitAddon) {
          fitAddon.dispose();
          fitAddon = null;
      }
      this.terminals.delete(terminalkey)
      this.fitAddons.delete(terminalkey)
    },
    loadViewContent (index) {
      this.$ipc.invoke(ipcApiRoute.loadViewContent, this.views[index]).then(r => {
        console.log(r);
      })
    },
    removeViewContent (index) {
      this.$ipc.invoke(ipcApiRoute.removeViewContent, this.views[index]).then(r => {
        console.log(r);
      })
    },
  }
};
</script>
<style lang="less" scoped>
.container {
  display: flex;
}

.button-container {
  margin-right: 10px;
}

.tabs-container {
  flex-grow: 1;
}
.tab-container {
  display: flex;
  align-items: center;
}
#app-base-window-view {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  height: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
    height: 100%;
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
