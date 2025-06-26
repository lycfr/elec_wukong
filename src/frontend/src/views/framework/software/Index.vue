<!--
 * @Author: wshikh wangshi@kaihong.com
 * @Date: 2023-12-10 10:34:10
 * @LastEditors: wshikh wangshi@kaihong.com
 * @LastEditTime: 2023-12-10 21:54:54
 * @FilePath: \elec_wukong\src\frontend\src\views\framework\software\Index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="app-base-software-open">
    <div class="one-block-1">
      <span>
        1. 调用其它软件（exe、bash等可执行程序）
      </span>
      <p/>
      <span class="sub-content">
        注：请先将【powershell.exe】复制到【electron-egg/build/extraResources】目录中
      </span>
    </div>  
    <div class="one-block-2">
      <a-list bordered :data-source="data">
        <a-list-item slot="renderItem" slot-scope="item" @click="openSoft(item.id)">
          {{ item.content }}
          <a-button type="link">
            执行
          </a-button>
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main'

const data = [
  {
    content: 'powershell.exe',
    id: 'powershell.exe'
  }
];

export default {
  data() {
    return {
      data,
    };
  },
  mounted () {

  },
  methods: {
    openSoft (id) {
      const params = {
        softName: id
      }
    // ipc.send(ipcApiRoute.ipcRunCmd, params)
      this.$ipc.invoke(ipcApiRoute.openSoftware, params).then(result => {
        console.log("openSoft:", result)
      })
    },
  }
};
</script>
<style lang="less" scoped>
#app-base-software-open {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
    .sub-content {
      font-size: 14px;
    }
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
