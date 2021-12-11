# vue-router 原理

vue-router 是 vue 全家桶的成员之一， 它的主要作用就是管理前端路由，是单页应用的核心，下面就来探讨它的实现原理

---

## 什么是单页应用

单页应用简称 SPA(Single Page Application)，通俗的说就是一个网站只有一个 html 页面

单页应用有着以下的优缺点：

优点：

- 用户体验更好，内容的改变不需要刷新整个页面
- 对前后端分离更友好，减轻服务器压力

缺点：

- 不利于 SEO
- 可能会出现首屏加载过慢的问题

单页应用的页面路由一般都是由前端来维护的，也就是说，各个路由所渲染的视图都是前端所建立好的

vue-router 就是一个管理前端路由的框架，它是 vue 单页应用项目的基石

---

## 两种模式

**hash 模式**

通过 hash 来实现路由，url 的 hash 就是类似于：

```html
http://www.xxx.com/#/login
```

url 中会带有一个 `#`，`#` 后面的部分就叫做 hash，可通过 window.location.hash 属性读取，通过改变 `#` 后面的值来渲染不同的视图，后面 hash 值的变化，并不会导致浏览器向服务器发出请求，浏览器不发出请求，也就不会刷新页面

另外每次 hash 值的变化，还会触发 hashchange 这个事件，通过这个事件我们就可以知道 hash 值发生了哪些变化，然后我们便可以监听 hashchange 来实现更新页面部分内容的操作

```javascript
function matchAndUpdate() {
  // todo 匹配 hash 做 dom 更新操作
}

window.addEventListener('hashchange', matchAndUpdate);
```

**history 模式**

history 模式与 hash 模式相比，最大的特点就是 url 中没有 `#`

```html
http://www.xxx.com/login
```

它是直接改变页面的 url 地址来渲染不同的视图的，它的实现是基于 `pushState` 和 `replaceState` 这两个 API 实现的，通过这两个 API 可以改变 url 地址且不会发送请求

原理和 hash 模式大同小异，使用 history 需要注意，因为它没有 `#`，所以用户刷新页面的时候还是会向服务端发送请求的，所以这里需要服务端进行路由处理，**服务端需要把所有路由都重定向到根页面**，否则服务端就会找不到这个路由，就会出现 404 的情况

---

## vue-router 实现原理

创建 VueRouter 对象的时候，会有两个参数，mode 是模式，hash 或者 history，routes 是路由数组

```javascript
const router = new VueRouter({
  mode: 'history', // 指定路由的模式
  routes: [...] // 传入配置的路由数组
})
```

下面来看一下 VueRouter 这个类的源码

```javascript
export default class VueRouter {
  mode: string; // 传入的字符串参数，指示history类别
  history: HashHistory | HTML5History | AbstractHistory; // 实际起作用的对象属性，必须是以上三个类的枚举
  fallback: boolean; // 如浏览器不支持，'history'模式需回滚为'hash'模式

  constructor(options: RouterOptions = {}) {
    let mode = options.mode || 'hash'; // 默认为'hash'模式
    this.fallback = mode === 'history' && !supportsPushState; // 通过supportsPushState判断浏览器是否支持'history'模式
    if (this.fallback) {
      mode = 'hash'; // 若不支持'history'模式则默认使用'hash'模式
    }
    if (!inBrowser) {
      mode = 'abstract'; // 不在浏览器环境下运行需强制为'abstract'模式
    }
    this.mode = mode;

    // 根据mode确定history实际的类并实例化
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base);
        break;
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback);
        break;
      case 'abstract':
        this.history = new AbstractHistory(this, options.base);
        break;
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`);
        }
    }
  }

  init(app: any /* Vue component instance */) {
    const history = this.history;

    // 根据history的类别执行相应的初始化操作和监听
    if (history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation());
    } else if (history instanceof HashHistory) {
      const setupHashListener = () => {
        history.setupListeners();
      };
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      );
    }

    history.listen((route) => {
      this.apps.forEach((app) => {
        app._route = route;
      });
    });
  }

  // VueRouter类暴露的以下方法实际是调用具体history对象的方法
  push(location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.push(location, onComplete, onAbort);
  }

  replace(location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.replace(location, onComplete, onAbort);
  }
}
```

总结一下上面这段源码在做的事情

1. 传入的参数 mode 只是在做一个标记，选择哪种模式，并用对应的类去实现

- 'history' -> 'HTML5History'
- 'hash' -> 'HashHistory'
- 'abstract' -> 'AbstractHistory'

2. 在初始化对应的 history 之前，会对 mode 做一些校验，若浏览器不支持 HTML5History 方式（通过 supportsPushState 变量判断），则 mode 强制设为 'hash'，若不是在浏览器环境下运行，则 mode 强制设为 'abstract'

3. VueRouter 类中的 push() 等方法只是一个代理，实际是调用的具体 history 对象的对应方法，在 init() 方法中初始化时，也是根据 history 对象具体的类别执行不同操作

---

### HashHistory

下面就来揭开 `HashHistory` 的神秘面纱

**HashHistory.push()**

```javascript
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  this.transitionTo(location, route => {
    pushHash(route.fullPath)
    onComplete && onComplete(route)
  }, onAbort)
}

function pushHash (path) {
  window.location.hash = path
}
```

transitionTo() 方法是父类中定义的是用来处理路由变化中的基础逻辑的，push() 方法最主要的是对 window 的 hash 进行了直接赋值

```javascript
window.location.hash = route.fullPath;
```

hash 的改变会自动添加到浏览器的访问历史记录中

那么视图的更新是怎么实现的呢，我们来看父类 History 中 transitionTo() 方法的这么一段

```javascript
transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const route = this.router.match(location, this.current)
  this.confirmTransition(route, () => {
    this.updateRoute(route)
    ...
  })
}

updateRoute (route: Route) {

  this.cb && this.cb(route)

}

listen (cb: Function) {
  this.cb = cb
}
```

可以看到，当路由变化时，调用了 History 中的 this.cb 方法，而 this.cb 方法是通过 History.listen(cb) 进行设置的，回到 VueRouter 类定义中，找到了在 init() 方法中对其进行了设置

```javascript
init (app: any /* Vue component instance */) {

  this.apps.push(app)

  history.listen(route => {
    this.apps.forEach((app) => {
      app._route = route
    })
  })
}
```

根据注释，app 为 Vue 组件实例，但我们知道 Vue 作为渐进式的前端框架，本身的组件定义中应该是没有有关路由内置属性 \_route，如果组件中要有这个属性，应该是在插件加载的地方，即 VueRouter 的 install() 方法中混合入 Vue 对象的，查看 install.js 源码，有如下一段

```javascript
export function install(Vue) {
  Vue.mixin({
    beforeCreate() {
      if (isDef(this.$options.router)) {
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      }
      registerInstance(this, this);
    },
  });
}
```

通过 Vue.mixin() 方法，全局注册一个混合，影响注册之后所有创建的每个 Vue 实例，该混合在 beforeCreate 钩子中通过 Vue.util.defineReactive() 定义了响应式的 \_route 属性。所谓响应式属性，即当 \_route 值改变时，会自动调用 Vue 实例的 render() 方法，更新视图

总结一下，从设置路由改变到视图更新的流程如下：

\$router.push() --> HashHistory.push() --> History.transitionTo() --> History.updateRoute() --> {app.\_route = route} --> vm.render()

**HashHistory.replace()**

replace() 方法与 push() 方法不同之处在于，它并不是将新路由添加到浏览器访问历史的栈顶，而是替换掉当前的路由

```javascript
replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  this.transitionTo(location, route => {
    replaceHash(route.fullPath)
    onComplete && onComplete(route)
  }, onAbort)
}

function replaceHash (path) {
  const i = window.location.href.indexOf('#')
  window.location.replace(
    window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
  )
}
```

可以看出，它与 push() 的实现结构上基本相似，不同点在于它不是直接对 window.location.hash 进行赋值，而是调用 window.location.replace 方法将路由进行替换

**监听地址栏**

以上讨论的 VueRouter.push() 和 VueRouter.replace() 是可以在 vue 组件的逻辑代码中直接调用的，除此之外在浏览器中，用户还可以直接在浏览器地址栏中输入改变路由，因此 VueRouter 还需要能监听浏览器地址栏中路由的变化，并具有与通过代码调用相同的响应行为，在 HashHistory 中这一功能通过 setupListeners 实现

```javascript
setupListeners () {
  window.addEventListener('hashchange', () => {
    if (!ensureSlash()) {
      return
    }
    this.transitionTo(getHash(), route => {
      replaceHash(route.fullPath)
    })
  })
}
```

该方法设置监听了浏览器事件 hashchange，调用的函数为 replaceHash，即在浏览器地址栏中直接输入路由相当于代码调用了 replace() 方法

---

### HTML5History

History interface 是浏览器历史记录栈提供的接口，通过 back(), forward(), go() 等方法，我们可以读取浏览器历史记录栈的信息，进行各种跳转操作

从 HTML5 开始，History interface 提供了两个新的方法 pushState(), replaceState() 使得我们可以对浏览器历史记录栈进行修改

```javascript
window.history.pushState(stateObject, title, URL);
window.history.replaceState(stateObject, title, URL);
```

- stateObject: 当浏览器跳转到新的状态时，将触发 popState 事件，该事件将携带这个 stateObject 参数的副本
- title: 所添加记录的标题
- URL: 所添加记录的 URL

这两个方法有个共同的特点：当调用他们修改浏览器历史记录栈后，虽然当前 URL 改变了，但浏览器不会立即发送请求该 URL，这就为单页应用前端路由**更新视图但不重新请求页面**提供了基础

我们来看 vue-router 中的源码：

```javascript
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(location, route => {
    pushState(cleanPath(this.base + route.fullPath))
    handleScroll(this.router, route, fromRoute, false)
    onComplete && onComplete(route)
  }, onAbort)
}

replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(location, route => {
    replaceState(cleanPath(this.base + route.fullPath))
    handleScroll(this.router, route, fromRoute, false)
    onComplete && onComplete(route)
  }, onAbort)
}

// src/util/push-state.js
export function pushState (url?: string, replace?: boolean) {
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    if (replace) {
      history.replaceState({ key: _key }, '', url)
    } else {
      _key = genKey()
      history.pushState({ key: _key }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}

export function replaceState (url?: string) {
  pushState(url, true)
}
```

代码结构以及更新视图的逻辑与 hash 模式基本类似，只不过将对 window.location.hash 直接进行赋值 window.location.replace() 改为了调用 history.pushState() 和 history.replaceState() 方法

在 HTML5History 中添加对修改浏览器地址栏 URL 的监听是直接在构造函数中执行的

```javascript
constructor (router: Router, base: ?string) {

  window.addEventListener('popstate', e => {
    const current = this.current
    this.transitionTo(getLocation(this.base), route => {
      if (expectScroll) {
        handleScroll(router, route, current, true)
      }
    })
  })
}
```

当然了 HTML5History 用到了 HTML5 的新特特性，是需要特定浏览器版本的支持的，前文已经知道，浏览器是否支持是通过变量 supportsPushState 来检查的

```javascript
export const supportsPushState =
  inBrowser &&
  (function() {
    const ua = window.navigator.userAgent;

    if (
      (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1
    ) {
      return false;
    }

    return window.history && 'pushState' in window.history;
  })();
```

以上就是 hash 模式与 history 模式源码的导读，这两种模式都是通过浏览器接口实现的，除此之外 vue-router 还为非浏览器环境准备了一个 abstract 模式，其原理为用一个数组 stack 模拟出浏览器历史记录栈的功能。当然，以上只是一些核心逻辑，为保证系统的鲁棒性源码中还有大量的辅助逻辑

---

## 结束语

以上就是本文的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[从 vue-router 看前端路由的两种实现](https://zhuanlan.zhihu.com/p/27588422)  
[vue-router 源码分析-history](https://zhuanlan.zhihu.com/p/24574970)  
[前端路由简介以及 vue-router 实现原理](https://zhuanlan.zhihu.com/p/37730038)
