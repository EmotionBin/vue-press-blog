# h5 唤起 app

## 什么是唤端

举个简单的例子，有时候你会收到一些短信，告诉你有活动，点击下方链接打开 XXX app 立即查看，短信中附带着一个链接，当你点击这个链接后，如果下载了对应的 app，就会自动打开它

[![TaHa9S.jpg](https://s4.ax1x.com/2021/12/25/TaHa9S.jpg)](https://s4.ax1x.com/2021/12/25/TaHa9S.jpg)

[![TaHs7q.jpg](https://s4.ax1x.com/2021/12/25/TaHs7q.jpg)](https://s4.ax1x.com/2021/12/25/TaHs7q.jpg)

简单的来说，就是通过一些引导方式(比如点击链接)，唤起另一个应用

## 唤端原理

唤端原理的核心就是 `URL Schemes`，先来介绍一下它是什么

### URL Schemes

URL Scheme 是一种页面内跳转协议，通过这个协议可以比较方便的跳转到 app 某一个页面

URL Scheme 主要有以下常见的应用场景：

- 通过小程序，打开原生 app
- 通过 h5 页面跳转到 app 端具体的页面
- app 根据 url 跳转到另一个 app
- 通过短信息中的 url 打开原生 app

Schemes 一般是下面的格式：

```javascript
[scheme]://[host]:[port]/[path]?[query]
```

- `scheme`: 协议名称（必须，由开发人员自定义)
- `host`: 域名
- `port`：端口
- `path`: 页面路径
- `query`： 请求参数(注意某些场景下需要编码)

那么 URL Schemes 到底该怎么使用呢，下面以 h5 唤起淘宝 app 来举一个例子

页面上有一个 `a` 标签，点击后唤起 app

```html
<a href="taobao://path?title=test">打开淘宝app</a>
```

点击这个 `a` 标签后就会打开淘宝 app

### 常见唤醒媒介

- iframe

```javascript
const ifr = document.createElement('iframe');
ifr.setAttribute('src', 'taobao://');
ifr.style.display = 'none';
document.body.appendChild(ifr);
```

这种方式兼容性没有那么的好，不推荐

- a 标签

```javascript
const a = document.createElement('a');
a.setAttribute('href', 'taobao://');
a.style.display = 'none';
document.body.appendChild(a);
```

注意，`a` 标签如果目标 Scheme 错误，即应用不存在也不会报错

- window.location 跳转

```javascript
window.location.href = 'taobao://';
```

## 业务场景

### h5 跳转至应用市场下载 app

在 h5 页面上，不管用户是否安装过该 app，都直接跳转到应用市场，让用户从应用市场上打开 app

思路:这种场景处理比较简单，直接判断判断是 android 端还是 ios 端，然后在点击按钮上赋值对应终端的应用市场下载链接就可以了，应用市场下载链其实就是一个地址，对于前端来说就是一个 url

### h5 跳转至 app 指定页面

在 h5 页面上，用户点击打开 app 按钮，在用户手机上已经安装了 app 时，打开 app，否则就引导用户前往应用市场下载安装

在 h5 页面上唤醒 app ，需要用到 Schemes 协议（由 app 端小伙伴提供），先判断是 android 端还是 ios 端，然后做相应的处理。跳转到 app 指定页面只需要在 URL Schemes 中添加上对应的传参即可，但是问题来了，如何判断用户有没有安装对应的 app 呢，如果安装了 app 则成功唤起 app，浏览器页面被隐藏，否则一直停留在当前页面，解决方案就是利用 `setTimeout` 判断浏览器当前页面是否隐藏，如果没被隐藏，直接跳转到 app 对应的应用市场，下面看代码

```javascript
//对应 app 的 Schemes 协议 以淘宝举例
window.location.href = 'taobao://';
setTimeout(() => {
  const hidden =
    window.document.hidden ||
    window.document.mozHidden ||
    window.document.msHidden ||
    window.document.webkitHidden;
  if (typeof hidden === 'undefined' || hidden === false) {
    // 跳转到对应的下载地址 这里以跳转到 ios 的 app store 为例子
    window.location.href = 'https://itunes.apple.com/app/id387682726';
  }
}, 2000);
```

这段代码的执行逻辑是这样的，如果能检测到 Schemes 就跳转到协议 `taobao://`，即打开 app，如果 2 秒后还没有唤醒 `taobao://`，那么就认为该设备上没有安装淘宝 app，即跳转到应用市场

## 使用中常见问题及解决方案

- 问题：可能会被某些 app 拦截，比如微信，qq 等

解决方案：通常会检测要打开 app 时的环境，如果是微信，qq 等环境，提示用户浏览器内打开

- 问题：ios9+ 禁止掉了 `iframe` 方式

解决方案：通常会检测 ios 的版本，ios9+ 不使用 `iframe` 方式，或直接用 `window.location.href` 进行唤起

- 问题：h5 无法感知是否唤醒成功

解决方案：一段时间之后自动跳转下载页，或者是依赖 `setTimeout` 在浏览器进入后台后进程切换导致的时间延迟判断

- 问题：携带参数跳转到 app 指定页面失败

解决方案：参数在某些情况下需要经过编码，使用 `encodeURI()` 或 `encodeURIComponent()` 进行处理

## 参考资料

[复杂场景下唤起 App 实践](https://mp.weixin.qq.com/s/PJEshGqbGPNdJNkNeXgJOQ)  
[从 H5 唤起 APP](https://www.jianshu.com/p/09a4303e49c9)  
[H5 页面唤起指定 app 或跳转到应用市场](https://www.jianshu.com/p/21380058d609/)  
[h5 唤起 app 方法](https://www.jianshu.com/p/fd7d187632ac)
