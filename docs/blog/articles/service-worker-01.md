# Service Worker

之前讲了 Web worker，后来我还发现有一个东西叫 Service Worker，最近花了点时间去研究学习它，把关于 Service Worker 的内容整理了一下，本文就介绍一下 Service Worker。  

----

## Service Worker 是什么

Service Worker 到底是什么？它与 Web Worker 有什么区别？又有什么联系？  

Service Worker 可以理解为一个介于客户端和服务器之间的一个代理服务器。在 Service Worker 中我们可以做很多事情，比如拦截客户端的请求、向客户端发送消息、向服务器发起请求等等，其中最重要的作用之一就是离线资源缓存。  

与 Web Worker 相比，它有以下相同点：  

1. Service Worker 工作在 worker context 中，是没有访问 DOM 的权限的，所以我们无法在 Service Worker 中获取 DOM 节点，也无法在其中操作 DOM 元素
2. 可以通过 `postMessage` API 把数据传递给其他 JS 文件
3. Service Worker 中运行的代码不会被阻塞，也不会阻塞其他页面的 JS 文件中的代码

不同的地方在于，Service Worker 是一个浏览器中的进程而不是浏览器内核下的线程，因此它在被注册安装之后，**能够被在多个页面中使用，也不会因为页面的关闭而被销毁**。因此，Service Worker 很适合被用于多个页面需要使用的复杂数据的计算。  

另外有一点需要注意的是，出于对安全问题的考虑，**Service Worker 只能被使用在 https 或者本地的 localhost 环境下。**  

----

## 注册和安装

下面就让我们来使用 Service Worker  

如果当前使用的浏览器支持 Service Worker ，则在 window.navigator 下会存在 serviceWorker 对象，我们可以使用这个对象的 register 方法来注册一个 Service Worker。  

```javascript
// index.js
if ('serviceWorker' in window.navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' })
    .then(function (reg) {
      console.log('success', reg)
    })
    .catch(function (err) {
      console.log('fail', err)
    })
}
```

在这段代码中，我们先使用 if 判断下浏览器是否支持 Service Worker ，避免由于浏览器不兼容导致的 bug。  

register 方法接受两个参数，第一个是 service worker 文件的路径，请注意：**这个文件路径是相对于 Origin，也就是相对于根路径，而不是当前 JS 文件的目录的；第二个参数是 Serivce Worker 的配置项，可选填，其中比较重要的是 scope 属性。**按照文档上描述，它是 Service Worker 控制的内容的子目录，这个属性所表示的路径不能在 service worker 文件的路径之上，默认是 Serivce Worker 文件所在的目录。  

register 方法返回一个 Promise。如果注册失败，可以通过 catch 来捕获错误信息；如果注册成功，可以使用 then 来获取一个 ServiceWorkerRegistration 的实例。  

注册完 Service Worker 之后，浏览器会为我们自动安装它，因此我们就可以在 service worker 文件中监听它的 install 事件了。  

```javascript
// sw.js
this.addEventListener('install', function (event) {
  console.log('Service Worker install')
})
```

同样的，Service Worker 在安装完成后会被激活，所以我们也可监听 activate 事件  

```javascript
// sw.js
this.addEventListener('activate', function (event) {
  console.log('Service Worker activate')
})
```

这时，我们可以在 Chorme 的开发者工具中看到我们注册的 Service Worker。  

F12 打开控制台，选择 Application，再选择 Service Workers 就可以看到我们注册的 Service Worker。  

在同一个 Origin 下，我们可以注册多个 Service Worker。但是请注意，这些 Service Worker 所使用的 **scope 必须是不相同的。**  

```javascript
// index.js
if ('serviceWorker' in window.navigator) {
  navigator.serviceWorker.register('./sw/sw.js', { scope: './sw' })
    .then(function (reg) {
      console.log('success', reg)
    })
  navigator.serviceWorker.register('./sw2/sw2.js', { scope: './sw2' })
    .then(function (reg) {
      console.log('success', reg)
    })
}
```

----

## 信息通讯

使用 postMessage 方法可以进行 Service Worker 和页面之间的通讯，下面来看一下如何实现。  

----

### 从页面到 Service Worker

首先是从页面发送信息到 Serivce Worker 。  

```javascript
// index.js
if ('serviceWorker' in window.navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' })
    .then(function (reg) {
      console.log('success', reg)
      navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage("this message is from page")
    })
    .catch(function (err) {
      console.log('fail', err)
    })
}
```

为了保证 Service Worker 能够接收到信息，我们在它被注册完成之后再发送信息，和普通的 `window.postMessage()` 的使用方法不同，为了向 Service Worker 发送信息，我们要在 ServiceWorker 实例上调用 `postMessage()` 方法，这里我们使用到的是 `navigator.serviceWorker.controller` 。  

```javascript
// sw.js
this.addEventListener('message', function (event) {
  console.log(event.data) // this message is from page
})
```

在 service worker 文件中我们可以直接在 `this` 上绑定 message 事件，这样就能够接收到页面发来的信息了。  

对于不同 scope 的多个 Service Worker ，也可以给指定的 Service Worker 发送信息。  

```javascript
if ('serviceWorker' in window.navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './sw' })
    .then(function (reg) {
      console.log('success', reg)
      reg.active.postMessage("this message is from page, to sw")
    })
  navigator.serviceWorker.register('./sw2.js', { scope: './sw2' })
    .then(function (reg) {
      console.log('success', reg)
      reg.active.postMessage("this message is from page, to sw 2")
    })
}

// sw.js
this.addEventListener('message', function (event) {
  console.log(event.data) // this message is from page, to sw
})

// sw2.js
this.addEventListener('message', function (event) {
  console.log(event.data) // this message is from page, to sw 2
})
```

请注意，当我们在注册 Service Worker 时，如果使用的 scope 不是 Origin ，那么 `navigator.serviceWorker.controller` 会为 `null`。这种情况下，我们可以使用 `reg.active` 这个对象下的 `postMessage()` 方法，`reg.active` 就是被注册后激活 Serivce Worker 实例。但是，由于 Service Worker 的激活是异步的，因此第一次注册 Service Worker 的时候，Service Worker 不会被立刻激活， `reg.active` 为 `null`，系统会报错。我采用的方式是返回一个 Promise ，在 Promise 内部进行轮询，如果 Service Worker 已经被激活，则 resolve 。  

```javascript
// index.js
navigator.serviceWorker.register('./sw/sw.js')
  .then(function (reg) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(function () {
        if (reg.active) {
          clearInterval(interval)
          resolve(reg.active)
        }
      }, 100)
    })
  }).then(sw => {
    sw.postMessage("this message is from page, to sw")
  })

navigator.serviceWorker.register('./sw2/sw2.js')
  .then(function (reg) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(function () {
        if (reg.active) {
          clearInterval(interval)
          resolve(reg.active)
        }
      }, 100)
    })
  }).then(sw => {
    sw.postMessage("this message is from page, to sw2")
  })
```

----

### 从 Service Worker 到页面

下一步就是从 Service Worker 发送信息到页面了，不同于页面向 Service Worker 发送信息，我们需要在 WindowClient 实例上调用 `postMessage()` 方法才能达到目的。而在页面的 JS 文件中，监听 `navigator.serviceWorker` 的 message 事件即可收到信息。  

而最简单的方法就是从页面发送过来的消息中获取 WindowClient 实例，使用的是 `event.source` ，不过这种方法只能向消息的来源页面发送信息。  

```javascript
// sw.js
this.addEventListener('message', function (event) {
  event.source.postMessage('this message is from sw.js, to page')
})

// index.js
navigator.serviceWorker.addEventListener('message', function (e) {
  console.log(e.data) // this message is from sw.js, to page
})
```

如果不想受到这个限制，则可以在 serivce worker 文件中使用 `this.clients` 来获取其他的页面，并发送消息。  

```javascript
// sw.js
this.clients.matchAll().then(client => {
  client[0].postMessage('this message is from sw.js, to page')
})
```

但是请注意，**注册 Service Worker 时候设置的 scope 的值会对获取到的 client 产生影响。**  

**如果在注册 Service Worker 的时候，把 scope 设置为非 origin 目录，那么在 service worker 文件中，我无法获取到 Origin 路径对应页面的 client，目前还没有找到原因。**  

```javascript
// index.js
navigator.serviceWorker.register('./sw.js', { scope: './sw/' })

// sw.js
this.clients.matchAll().then(client => {
  console.log(client) // []
})
```

----

### 使用 Message Channel 来通信

另外一种比较好用的通信方式是使用 Message Channel 。  

```javascript
// index.js
navigator.serviceWorker.register('./sw.js', { scope: './' })
  .then(function (reg) {
    const messageChannel = new MessageChannel()
    messageChannel.port1.onmessage = e => {
      console.log(e.data) // this message is from sw.js, to page
    }
    reg.active.postMessage("this message is from page, to sw", [messageChannel.por2])
  })

// sw.js
this.addEventListener('message', function (event) {
  console.log(event.data) // this message is from page, to sw
  event.ports[0].postMessage('this message is from sw.js, to page')
})
```

使用这种方式能够使得通道两端之间可以相互通信，而不是只能向消息源发送信息。举个例子，两个 Service Worker 之间的通信。  

```javascript
// index.js
const messageChannel = new MessageChannel()

navigator.serviceWorker.register('./sw/sw.js')
  .then(function (reg) {
    console.log(reg)
    return new Promise((resolve, reject) => {
      const interval = setInterval(function () {
        if (reg.active) {
          clearInterval(interval)
          resolve(reg.active)
        }
      }, 100)
    })
  }).then(sw => {
    sw.postMessage("this message is from page, to sw", [messageChannel.port1])
  })

navigator.serviceWorker.register('./sw2/sw2.js')
  .then(function (reg) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(function () {
        if (reg.active) {
          clearInterval(interval)
          resolve(reg.active)
        }
      }, 100)
    })
  }).then(sw => {
    sw.postMessage("this message is from page, to sw2", [messageChannel.port2])
  })

// sw.js
this.addEventListener('message', function (event) {
  console.log(event.data) // this message is from page, to sw
  event.ports[0].onmessage = e => {
    console.log('sw:', e.data) // sw: this message is from sw2.js
  }
  event.ports[0].postMessage('this message is from sw.js')
})

// sw2.js
this.addEventListener('message', function (event) {
  console.log(event.data) // this message is from page, to sw2
  event.ports[0].onmessage = e => {
    console.log('sw2:', e.data) // sw2: this message is from sw.js
  }
  event.ports[0].postMessage('this message is from sw2.js')
})
```

首先让页面给两个 Service Worker 发送信息，并且把信息通道的端口发送过去，然后在两个 service worker 文件中使用端口分别设置接受信息的回调函数，之后它们就能够互相发送信息并接收到来自通道对面的消息了。  

----

## 静态资源缓存

下面要讲的就是重头戏，也是 Service Worker 能够实现的最主要的功能——静态资源缓存。  

正常情况下，用户打开网页，浏览器会自动下载网页所需要的 JS 文件、图片等静态资源。我们可以通过 Chrome 开发工具的 Network 选项来查看。  

但是如果用户在没有联网的情况下打开网页，浏览器就无法下载这些展示页面效果所必须的资源，页面也就无法正常的展示出来。  

我们可以使用 Service Worker 配合 CacheStroage 来实现对静态资源的缓存。  

----

### 缓存指定静态资源

```javascript
// sw.js
this.addEventListener('install', function (event) {
  console.log('install')
  event.waitUntil(
    caches
      .open('sw_demo')
      .then(function (cache) {
        return cache.addAll([
          '/style.css',
          '/panda.jpg',
          './main.js'
        ])
      })
  )
})
```

当 Service Worker 在被安装的时候，我们能够对指定路径的资源进行缓存。CacheStroage 在浏览器中的接口名是 caches ，我们使用 `caches.open()` 方法新建或打开一个已存在的缓存；`cache.addAll()` 方法的作用是请求指定链接的资源并把它们存储到之前打开的缓存中。由于资源的下载、缓存是异步行为，所以我们要使用事件对象提供的 `event.waitUntil()` 方法，它能够保证资源被缓存完成前 Service Worker 不会被安装完成，避免发生错误。  

从 Chrome 开发工具中的 Application 的 Cache Strogae 中可以看到我们缓存的资源。  

这种方法只能缓存指定的资源，无疑是不实用的，所以我们需要针对用户发起的每一个请求进行缓存。  

----

### 动态缓存静态资源

```javascript
this.addEventListener('fetch', function (event) {
  console.log(event.request.url)
  event.respondWith(
    caches.match(event.request).then(res => {
      return res ||
        fetch(event.request)
          .then(responese => {
            const responeseClone = responese.clone()
            caches.open('sw_demo').then(cache => {
              cache.put(event.request, responeseClone)
            })
            return responese
          })
          .catch(err => {
            console.log(err)
          })
    })
  )
})
```

我们需要监听 fetch 事件，每当用户向服务器发起请求的时候这个事件就会被触发。有一点需要注意，**页面的路径不能大于 Service Worker 的 scope**，不然 fetch 事件是无法被触发的。  

在回调函数中我们使用事件对象提供的 `respondWith()` 方法，它可以劫持用户发出的 http 请求，并把一个 Promise 作为响应结果返回给用户。然后我们使用用户的请求对 Cache Stroage 进行匹配，如果匹配成功，则返回存储在缓存中的资源；如果匹配失败，则向服务器请求资源返回给用户，并使用 `cache.put()` 方法把这些新的资源存储在缓存中。因为请求和响应流只能被读取一次，所以我们要使用 clone 方法复制一份存储到缓存中，而原版则会被返回给用户。  

在这里有几点需要注意：  

1. 当用户第一次访问页面的时候，资源的请求是早于 Service Worker 的安装的，所以静态资源是无法缓存的，只有当 Service Worker 安装完毕，用户第二次访问页面的时候，这些资源才会被缓存起来。
2. Cache Stroage 只能缓存静态资源，所以它只能缓存用户的 GET 请求。
3. Cache Stroage 中的缓存不会过期，但是浏览器对它的大小是有限制的，所以需要我们定期进行清理。

对于用户发起的 POST 请求，我们也可以在拦截后，通过判断请求中携带的 body 的内容来进行有选择的返回。  

```javascript
if(event.request.method === 'POST') {
  event.respondWith(
    new Promise(resolve => {
      event.request.json().then(body => {
        console.log(body) // 用户请求携带的内容
      })
      resolve(new Response({ a: 2 })) // 返回的响应
    })
  )
}
```

我们可以在 fetch 事件的回调函数中对请求的 method 、url 等各项属性进行判断，选择不同的操作。  

对于静态资源的缓存，Cache Stroage 是个不错的选择。而对于数据，我们可以使用 IndexedDB 来存储，同样是拦截用户请求后，使用缓存在 IndexDB 中的数据作为响应返回。  

----

### 更新 Cache Stroage

前面提到过，当有新的 service worker 文件存在的时候，他会被注册和安装，等待使用旧版本的页面全部被关闭后，才会被激活。这时候，我们就需要清理下我们的 Cache Stroage 了，删除旧版本的 Cache Stroage 。  

```javascript
this.addEventListener('install', function (event) {
  console.log('install')
  event.waitUntil(
    caches.open('sw_demo_v2').then(function (cache) { // 更换 Cache Stroage
      return cache.addAll([
        '/style.css',
        '/panda.jpg',
        './main.js'
      ])
    })
  )
})

const cacheNames = ['sw_demo_v2'] // Cahce Stroage 白名单

this.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all[keys.map(key => {
        if (!cacheNames.includes(key)) {
          console.log(key)
          return caches.delete(key) // 删除不在白名单中的 Cache Stroage
        }
      })]
    })
  )
})
```

首先在安装 Service Worker 的时候，要换一个 Cache Stroage 来存储，然后设置一个白名单，当 Service Worker 被激活的时候，将不在白名单中的 Cache Stroage 删除，释放存储空间。同样使用 event.waitUntil ，在 Service Worker 被激活前执行完删除操作。  

----

## 结束语

以上就是本文的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[Service Worker —这应该是一个挺全面的整理](https://juejin.cn/post/6844903613270081543)  
