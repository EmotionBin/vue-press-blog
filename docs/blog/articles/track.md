# 埋点监控

项目上线后，如果我们要知道该产品的使用情况，不加入埋点监控可能无法获取关键信息。埋点监控可以帮助我们获取用户行为，跟踪产品的使用情况，根据收集到的数据指明产品的优化方向  

## 埋点监控的意义

埋点监控的意义是，**获取用户行为以及跟踪产品在用户端的使用情况，并以监控数据为基础，指明产品优化的方向**  

埋点监控主要可以分为三类，数据监控、性能监控和异常监控  

### 数据监控

数据监控，顾名思义就是监听用户的行为。常见的数据监控包括以下几点  

- PV/UV:PV(page view)，即页面浏览量或点击量。UV:指访问某个站点或点击某条新闻的不同 IP 地址的人数
- 用户在每一个页面的停留时间
- 用户通过什么入口来访问该网页（可以从入口 url 参数判断）
- 用户在相应的页面中触发的行为

统计这些数据是有意义的，比如我们知道了用户来源的渠道，可以促进产品的推广，知道用户在每一个页面停留的时间，可以针对停留较长的页面，增加广告推送等等  

### 性能监控

性能监控指的是监听前端的性能，主要包括监听网页或者说产品在用户端的体验。常见的性能监控数据包括以下几点  

- 不同用户，不同机型和不同系统下的首屏加载时间
- 白屏时间
- http 等请求的响应时间
- 静态资源整体下载时间
- 页面渲染时间
- 页面交互动画完成时间

这些性能监控的结果，可以展示前端性能的好坏，根据性能监测的结果可以进一步的去优化前端性能，比如兼容低版本浏览器的动画效果，加快首屏加载等等

### 异常监控

此外，产品的前端代码在执行过程中也会发生异常，因此需要引入异常监控。及时的上报异常情况，可以避免线上故障的发生。虽然大部分异常可以通过try catch的方式捕获，但是比如内存泄漏以及其他偶现的异常难以捕获。常见的需要监控的异常包括以下几点  

- Javascript 的异常监控
- 样式丢失的异常监控

Javascript 的异常监控可以通过监听 `error` 事件，`window.addEventListener('error', errorHandler, false)`

## 埋点方案总结

目前常见的前端埋点方案分为三种：手动埋点、可视化埋点和无痕埋点

### 手动埋点

手动埋点，也叫代码埋点，即纯手动写代码，以嵌入代码的形式进行埋点，埋点代码和业务代码写在一起，比如需要监控用户的点击事件，会选择在用户点击时，插入一段代码，保存这个监听行为或者直接将监听行为以某一种数据格式直接传递给 server 端。此外比如需要统计产品的 PV 和 UV 的时候，需要在网页的初始化时，发送用户的访问信息等  

优点：  

- 可以在任意时刻，精确的发送或保存所需要的数据信息
- 可以方便地设置自定义属性、自定义事件

缺点：  

- 工作量较大，每个需要埋点的地方都需要添加相应的代码

### 可视化埋点

通过可视化交互的手段，代替代码埋点。将业务代码和埋点代码分离，提供一个可视化交互的页面，输入为业务代码，通过这个可视化系统，可以在业务代码中自定义的增加埋点事件等等，最后输出的代码耦合了业务代码和埋点代码  

可视化埋点听起来比较高大上，实际上跟代码埋点还是区别不大。也就是用一个系统来实现手动插入代码埋点的过程  

缺点：  

- 可视化埋点可以埋点的控件有限，不能手动定制

### 无埋点

无埋点并不是说不需要埋点，而是前端自动采集全部事件，上报埋点数据，由后端来过滤和计算出有用的数据。通过定期上传记录文件，配合文件解析，解析出来我们想要的数据，并生成可视化报告供专业人员分析因此实现“无埋点”统计  

从语言层面实现无埋点也很简单，比如从页面的 js 代码中，找出 dom 上被绑定的事件，然后进行全埋点  

优点：  

- 由于采集的是全量数据，所以产品迭代过程中是不需要关注埋点逻辑的，也不会出现漏埋、误埋等现象

缺点：  

- 无埋点采集全量数据，给数据传输和服务器增加压力
- 无法灵活的定制各个事件所需要上传的数据

## 埋点数据上报

在收集到了数据后，下一步就是要把数据进行上报  

### 上报数据类型

确定需要埋点上报的数据，上报的信息包括用户个人信息以及用户行为，主要数据可以分为以下几点：  

- who: appid(系统或者应用的 id),userAgent(用户的系统、网络等信息)
- when: timestamp(上报的时间戳)
- from where: currentUrl(用户当前 url),fromUrl(从哪一个页面跳转到当前页面),type(上报的事件类型),element(触发上报事件的元素）
- what: 上报的自定义扩展数据 data:{},扩展数据中可以按需求定制，比如包含 uid 等信息

### 上报周期

如果埋点的事件不是很多，上报可以时时进行，比如监控用户的交互事件，可以在用户触发事件后，立刻上报用户所触发的事件类型  

如果埋点的事件较多，或者说网页内部交互频繁，可以通过本地存储的方式先缓存上报信息，然后定期上报  

### 上报方案

#### 收集用户信息

通过浏览器内置的 JavaScript 对象，我们就可以收集当前用户的一些基本信息  

```javascript
const params = {};
// document
if (document) {
  params.domain = document.domain || ''; // 域名
  params.url = document.URL || ''; // 当前 URL 地址
  params.title = document.title || ''; // 当前页面标题
  params.referrer = document.referrer || ''; // 上一个访问页面 URL 地址
}
// window
if(window && window.screen) {
  params.sh = window.screen.height || 0; // 屏幕高度
  params.sw = window.screen.width || 0; // 屏幕宽度
  params.cd = window.screen.colorDepth || 0; // 屏幕颜色深度
}
// navigator
if(navigator) {
  params.lang = navigator.language || ''; // 语言
}
```

可以根据具体的实际需求，利用 JavaScript 的内置 API，还可以获取到更多的信息，这里只是举例  

#### 获取 web 各阶段响应时间

为了准确获取我们的 web 应用程序的性能特性，我们就得知道该应用程序在各个阶段的响应时间，比如：DNS 解析时间、TCP 建立连接时间、首页白屏时间、DOM 渲染完成时间、页面 load 时间等。好在这些信息都可以通过 [Performance](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance) 接口获取相关信息来计算得出  

```javascript
let timing = performance.timing,
    start = timing.navigationStart,
    dnsTime = 0,
    tcpTime = 0,
    firstPaintTime = 0,
    domRenderTime = 0,
    loadTime = 0;

dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
tcpTime = timing.connectEnd - timing.connectStart;
firstPaintTime = timing.responseStart - start;
domRenderTime = timing.domContentLoadedEventEnd - start;
loadTime = timing.loadEventEnd - start;

console.log('DNS解析时间:', dnsTime, 
            '\nTCP建立时间:', tcpTime, 
            '\n首屏时间:', firstPaintTime,
            '\ndom渲染完成时间:', domRenderTime, 
            '\n页面onload时间:', loadTime);
```

#### 批量上报

批量上报的思路就是，记录下需要埋点上报的数据，在数据量达到一定的数值(比如到了 10 条)，就把所有数据上报  

这种凑够 N 条数据再统一发送的行为会出现断层，如果在没有凑够 N 条数据的时候用户就关掉页面，或者是超过 N 倍数但凑不到 N 的那部分，如果不处理的话这部分数据就丢失了  

解决方案是监听页面 `beforeunload` 事件，在页面离开前把剩余不足 N 条的 log 全部上传  

#### 无网络延时上报

思考一个问题，假如我们的页面处于断网离线状态（比如就是信号不好），用户在这期间进行了操作，而我们又想收集这部分数据该如何进行  

解决方案就是先本地存储，再延时上报，归纳为以下几点：  

1. 上报数据，`navigator.onLine` 判断网络状况
2. 有网正常发送
3. 无网络时记入 `localstorage`, 延时上报

## 总结

埋点监控主要分为三个步骤，数据收集、数据上报、数据分析  

埋点监控也是我们开发中很重要的一个环节，收到了用户信息后才能给运营提供可靠的数据支撑，以及为我们产品后续的迭代优化指明了方向  

## 参考资料

[前端监控和前端埋点方案设计](https://juejin.cn/post/6844903650603565063)  
[前端监控和前端埋点](https://zhuanlan.zhihu.com/p/65834362)  
[从一个前端埋点上报文件说起](https://www.jianshu.com/p/fe1fa97fe9a1)  
