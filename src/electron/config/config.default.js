'use strict';

const path = require('path');

/**
 * 默认配置
 */
module.exports = (appInfo) => {

  const config = {};

  /**
   * 应用模式配置
   */
  config.developmentMode = {
    default: 'vue',
    mode: {
      vue: {
        hostname: 'localhost',
        port: 8080
      },
      react: {
        hostname: 'localhost',
        port: 3000
      },
      html: {
        hostname: 'localhost',
        indexPage: 'index.html'
      },
    }
  };

  /**
   * 开发者工具
   */
  config.openDevTools = false;

  /**
   * 应用程序顶部菜单
   */
  config.openAppMenu = 'dev-show';

  /**
   * 主窗口
   */
  config.windowsOption = {
    title: '悟空',
    width: 1020,
    height: 650,
    minWidth: 800,
    minHeight: 650,
    webPreferences: {
      //webSecurity: false, // 跨域问题 -> 打开注释
      contextIsolation: false, // false -> 可在渲染进程中使用electron的api，true->需要bridge.js(contextBridge)
      nodeIntegration: true,
      //preload: path.join(appInfo.baseDir, 'preload', 'bridge.js'),
    },
    frame: true,
    show: false,
    icon: path.join(appInfo.home, 'public', 'images', 'logo-32.png'),
  };

  /**
   * ee框架日志
   */  
  config.logger = {
    encoding: 'utf8',
    level: 'INFO',
    outputJSON: false,
    buffer: true,
    enablePerformanceTimer: false,
    rotator: 'day',
    appLogName: 'ee.log',
    coreLogName: 'ee-core.log',
    errorLogName: 'ee-error.log' 
  }

  /**
   * 远程模式-web地址
   */    
  config.remoteUrl = {
    enable: false,
    url: 'http://electron-egg.kaka996.com/'
  };

  /**
   * 内置socket服务
   */   
  config.socketServer = {
    enable: false,
    port: 7070,
    path: "/socket.io/",
    connectTimeout: 45000,
    pingTimeout: 30000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e8,
    transports: ["polling", "websocket"],
    cors: {
      origin: true,
    }
  };

  /**
   * 内置http服务
   */     
  config.httpServer = {
    enable: false,
    https: {
      enable: false, 
      key: '/public/ssl/localhost+1.key',
      cert: '/public/ssl/localhost+1.pem'
    },
    port: 7071,
    cors: {
      origin: "*"
    },
    body: {
      multipart: true,
      formidable: {
        keepExtensions: true
      }
    },
    filterRequest: {
      uris:  [
        'favicon.ico'
      ],
      returnData: ''
    }
  };

  /**
   * 主进程
   */     
  config.mainServer = {
    host: 'localhost',
    port: 8080,
  }; 

  /**
   * 硬件加速
   */
  config.hardGpu = {
    enable: false
  };

  /**
   * 异常捕获
   */
  config.exception = {
    mainExit: false,
    childExit: true,
    rendererExit: true,
  };  

  /**
   * 插件功能
   */
  config.addons = {
    window: {
      enable: true,
    },
    tray: {
      enable: true,
      title: '悟空',
      icon: '/public/images/tray_logo.png'
    },
    security: {
      enable: true,
    },
    awaken: {
      enable: true,
      protocol: 'ee',
      args: []
    },
    autoUpdater: {
      enable: true,
      windows: false, 
      macOS: false, 
      linux: false,
      options: {
        provider: 'generic', 
        url: 'http://kodo.qiniu.com/'
      },
      force: false,
    },
    javaServer: {
      enable: false,
      port: 18080,
      jreVersion: 'jre1.8.0_201',
      opt: '-server -Xms512M -Xmx512M -Xss512k -Dspring.profiles.active=prod -Dserver.port=${port} -Dlogging.file.path="${path}" ',
      name: 'java-app.jar'
    }
  };

  return {
    ...config
  };
}
