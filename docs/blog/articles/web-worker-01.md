# Web Worker

Web Worker 是 HTML5 标准的一部分，本文就来研究一些关于它的新特性  

----

## Web Worker 是什么

JavaScript 语言采用的是单线程模型，也就是说，所有任务只能在一个线程上完成，一次只能做一件事。前面的任务没做完，后面的任务只能等着。  

Web Worker 是 HTML5 标准的一部分，它允许一段JavaScript程序运行在主线程之外的另外一个线程中。  

Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。  

Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。  

----

## Web Worker 怎样使用

Web Worker 有以下几个使用注意点：  

**（1）同源限制**  

分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。  

**（2）DOM 限制**  

Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用 `document`、`window`、`parent` 这些对象。但是，Worker 线程可以使用 `navigator` 对象和 `location` 对象。  

**（3）通信联系**  

Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。

**（4）脚本限制**  

Worker 线程不能执行 `alert()` 方法和 `confirm()` 方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。  

**（5）文件限制**  

Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。  

----

### 创建

只需调用 `Worker()` 构造函数并传入一个要在 worker 线程内运行的脚本的 URI，即可创建一个新的 worker。  

```javascript
// worker.js 是本地的一个 js 文件
const myWorker = new Worker("worker.js")
```

另外，通过 `URL.createObjectURL()` 创建 URL 对象，可以实现创建内嵌的 worker。  

```javascript
const worker = `
  onmessage = function (e) {
    console.log('我是 worker', e)
  }
`

const blob = new Blob([worker])
const myWorker = new Worker(window.URL.createObjectURL(blob))
```

这两种创建 Web Worker 的方法效果是一样的，可以自行进行选择。  

Worker 线程的创建是异步的，主线程代码不会阻塞在这里等待 worker 线程去加载、执行指定的脚本文件，而是会立即向下继续执行后面代码。  

----

### 通信

Web Worker 与其主页面之间的通信是通过 onmessage 事件和 `postMessage()` 方法实现的。  

使用构造时传入本地文件创建 worker。

```javascript
const myWorker = new Worker("worker.js")

myWorker.onmessage = function (e) {
  const { data } = e
  console.log('我是页面，我收到了web worker发来的消息', data)
}

const message = '这是页面发送的消息'
myWorker.postMessage(message)
```

```javascript
// worker.js
onmessage = function (e) {
  const { data } = e
  console.log('我是worker，我收到了页面发来的消息: ', data)
  const message = '这是worker发送的消息'
  postMessage(message)
}
```

使用 `URL.createObjectURL()` 创建内嵌的 worker。  

```javascript
const worker = `
  onmessage = function (e) {
    const { data } = e
    console.log('我是worker，我收到了页面发来的消息: ', data)
    const message = '这是worker发送的消息'
    postMessage(message)
  }
`

const blob = new Blob([worker])
const myWorker = new Worker(window.URL.createObjectURL(blob))

myWorker.onmessage = function (e) {
  const { data } = e
  console.log('我是页面，我收到了web worker发来的消息', data)
}

const message = '这是页面发送的消息'
myWorker.postMessage(message)
```

在主页面与 Worker 之间传递的数据是通过拷贝，而不是共享来完成的。页面与 Worker 不会共享同一个实例，最终的结果就是在每次通信结束时生成了数据的一个副本。也就是说，传递的数据经过拷贝生成的一个副本，**在一端对数据进行修改不会影响另一端。**

```javascript
const worker = `
  onmessage = function (e) {
    const { data } = e
    console.log('我是worker，我收到了页面发来的消息: ', data)
    data.push('hello')
    console.log('我是worker，我修改了数据，修改后的数据是: ', data)
    postMessage(data)
  }
`

const blob = new Blob([worker])
const myWorker = new Worker(window.URL.createObjectURL(blob))

myWorker.onmessage = function (e) {
  const { data } = e
  console.log('我是页面，我收到了web worker发来的消息', data)
  console.log('arr:', arr)
}

const arr = [1, 2, 3]
myWorker.postMessage(arr)
```

----

### 加载脚本

Worker 内部如果要加载其他脚本，有一个专门的方法 `importScripts()`。  

```javascript
importScripts('script1.js')
```

该方法可以同时加载多个脚本。  

```javascript
importScripts('script1.js', 'script2.js')
```

----

### 错误处理

当 worker 出现运行时错误时，它的 onerror 事件处理函数会被调用。可以在主线程监听也可以在 Worker 内部监听。  

```javascript
// 主线程监听
myWorker.onerror = function (e) {
  // dosomething
}
```

错误事件有三个实用的属性：  

- filename：发生错误的脚本文件名
- lineno：出现错误的行号
- message：可读性良好的错误消息

```javascript
const worker = `
  onmessage = function (e) {
    console.log('我是 worker', e)
  }

  // 使用未声明的变量
  arr.push('error')
`

const blob = new Blob([worker])
const myWorker = new Worker(window.URL.createObjectURL(blob))

myWorker.onerror = function (e) {
  const { lineno, filename, message } = e
  console.log('我是页面，我监听到了 worker 发生的错误:', lineno, filename, message)
}
```

----

### 终止

在主页面上调用 `terminate()` 方法，可以立即杀死 Worker 线程，不会留下任何机会让它完成自己的操作或清理工作。另外，Worker 也可以调用自己的 `close()` 方法来关闭自己  

```javascript
// 主页面(主线程)调用
myWorker.terminate()

// Worker 线程调用
close()
```

前面有说到过，Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且**一旦使用完毕，就应该关闭。**  

----

## 总结

最后总结下 Web Worker 为 Javascript 带来了什么，以及典型的应用场景。  

**强大的计算能力**  

可以加载一个 Javascript 进行大量的复杂计算而不挂起主进程，并通过 `postMessage()`，onmessage 事件进行通信，解决了大量计算对 UI 渲染的阻塞问题。  

**典型应用场景**  

1. 数学运算  

- Web Worker最简单的应用就是用来做后台计算，对CPU密集型的场景再适合不过了。  

2. 图像处理  

- 通过使用从 `<canvas>` 中获取的数据，可以把图像分割成几个不同的区域并且把它们推送给并行的不同 Workers 来做计算，对图像进行像素级的处理，再把处理完成的图像数据返回给主页面。  

3. 大数据的处理  

- 目前 mvvm 框架越来越普及，基于数据驱动的开发模式也越愈发流行，未来大数据的处理也可能转向到前台，这时，将大数据的处理交给在 Web Worker 也是上上之策了吧。  

----

## 结束语

以上就是本文的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[Web Worker 使用教程](http://www.ruanyifeng.com/blog/2018/07/web-worker.html)  
[浅谈HTML5 Web Worker](https://juejin.cn/post/6844903496550989837)  



