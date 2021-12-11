# Vue 生命周期

Vue 的生命周期是一个比较重要的概念，在开发过程中，会频繁的接触这些生命周期的钩子，有时候往往会遇到一些问题，就需要从 Vue 的生命周期钩子去一步一步的分析，才能找出问题的关键，本文将会详细的介绍 Vue 生命周期。

---

## 生命周期图示

首先先来看一张 Vue 官网的生命周期图示：

[![Y3nzpF.png](https://s1.ax1x.com/2020/05/10/Y3nzpF.png)](https://s1.ax1x.com/2020/05/10/Y3nzpF.png)

这张图描述了从创建 vue 实例到实例销毁的过程，接下来会一步一步的慢慢解析各个过程的区别与作用

---

### beforeCreate

从上图中可以看到，`beforeCreate`是 Vue 生命周期中的第一个钩子。new Vue()即创建了一个 Vue 实例，之后开始初始化事件以及生命周期，在接下来就到了`beforeCreate`这个钩子，那么`beforeCreate`到底可以干什么呢，我自己写了一个 demo 进行测试：

```html
<div id="app">
  <h1 id="h1">{{msg}}</h1>
</div>
```

```javascript
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'ok',
  },
  beforeCreate() {
    console.log(this.msg);
    this.show();
  },
  methods: {
    show() {
      console.log('执行了show方法');
    },
  },
});
```

在`beforeCreate`这个钩子中，打印 msg 并执行了 show 方法，运行，`F12`观察控制台：

[![Y8EzFS.png](https://s1.ax1x.com/2020/05/10/Y8EzFS.png)](https://s1.ax1x.com/2020/05/10/Y8EzFS.png)

msg 为`undefined`，并且找不到 show 这个方法，说明**在 beforeCreate 这个钩子中，data 和 methods 中的数据还没有被初始化**

---

### created

再看到官网的声明周期图示，经过了`beforeCreate`钩子之后，来到下一个生命周期钩子`created`：

```html
<div id="app">
  <h1 id="h1">{{msg}}</h1>
</div>
```

```javascript
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'ok',
  },
  created() {
    console.log(this.msg);
    this.show();
  },
  methods: {
    show() {
      console.log('执行了show方法');
    },
  },
});
```

在`created`这个钩子中，做了同样的事情，再次观察控制台：

[![Y8VGTK.png](https://s1.ax1x.com/2020/05/10/Y8VGTK.png)](https://s1.ax1x.com/2020/05/10/Y8VGTK.png)

成功打印了 msg 并执行了 show 方法，说明**在 created 这个钩子中，data 和 methods 都已经被初始化好了，如果要调用 methods 中的方法，或者操作 data 中的数据，最早只能在 created 中操作**

---

### beforeMount

再下来来到了`beforeMount`钩子，此时 data 和 methods 都已经初始化完成，那么数据有没有被挂载到`dom`上呢，继续看：

```html
<div id="app">
  <h1 id="h1">{{msg}}</h1>
</div>
```

```javascript
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'ok',
  },
  beforeMount() {
    console.log(document.getElementById('h1').innerText);
  },
});
```

在`beforeMount`钩子中，想看看数据有没有被渲染到`dom`上，打印了`dom`中的`innerText`，观察控制台：

[![Y8VWlj.png](https://s1.ax1x.com/2020/05/10/Y8VWlj.png)](https://s1.ax1x.com/2020/05/10/Y8VWlj.png)

可以看到`dom`中的数据并没有被渲染，它还是我们之前写的模板字符串，即`{{msg}}`，说明**在 beforeMount 这个钩子中，页面中的元素还没有被真正替换渲染，仍然是之前写的一些模板字符串**

---

### mounted

在`beforeMount`钩子之后，就是`mounted`钩子了，在这个页面中，数据应该已经被渲染到`dom`上了，继续实验测试：

```html
<div id="app">
  <h1 id="h1">{{msg}}</h1>
</div>
```

```javascript
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'ok',
  },
  mounted() {
    console.log(document.getElementById('h1').innerText);
  },
});
```

在`mounted`钩子中，做了同样的操作，观察控制台的结果：

[![Y8ZPhD.png](https://s1.ax1x.com/2020/05/10/Y8ZPhD.png)](https://s1.ax1x.com/2020/05/10/Y8ZPhD.png)

控制台输出了 ok，这正是 data 中 msg 的值，数据已经被渲染到`dom`上了，说明**在 mounted 这个钩子中，页面中的模板字符串已经被真实的挂载渲染，用户可以看到已经渲染好的页面了**

---

### beforeUpdate

前面的阶段一直到`mounted`的时候，表示 Vue 实例已经被创建好了，创建的生命周期钩子已经执行完毕，接着来来到了运行的生命周期钩子`beforeUpdate`，值得注意的是，**beforeUpdate 这个钩子只有在数据发生改变的时候才会触发**，继续进行实验：

```html
<div id="app">
  <input type="button" value="修改msg" @click="msg = 'no'" />
  <h1 id="h1">{{msg}}</h1>
</div>
```

```javascript
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'ok',
  },
  beforeUpdate() {
    console.log(`界面上元素的内容：${document.getElementById('h1').innerText}`);
    console.log(`data中msg的数据：${this.msg}`);
  },
});
```

运行页面，打开控制台，点击修改 msg 的按钮，观察控制台的输出：

[![Y8eQVx.png](https://s1.ax1x.com/2020/05/10/Y8eQVx.png)](https://s1.ax1x.com/2020/05/10/Y8eQVx.png)

可以得出结论，**当执行 beforeUpdate 的时候，页面中的显示的数据还是旧的数据，此时 data 中的数据是最新的数据，页面尚未和最新的数据保持同步**

---

### updated

在`updated`这个钩子中，`dom`中的数据应该已经完成更新，和 data 中的数据保持一致，继续实验：

```html
<div id="app">
  <input type="button" value="修改msg" @click="msg = 'no'" />
  <h1 id="h1">{{msg}}</h1>
</div>
```

```javascript
const vm = new Vue({
  el: '#app',
  data: {
    msg: 'ok',
  },
  updated() {
    console.log(`界面上元素的内容：${document.getElementById('h1').innerText}`);
    console.log(`data中msg的数据：${this.msg}`);
  },
});
```

运行，打开控制台，点击按钮，观察控制台输出结果：

[![Y8eyRg.png](https://s1.ax1x.com/2020/05/10/Y8eyRg.png)](https://s1.ax1x.com/2020/05/10/Y8eyRg.png)

可以得出结论，**当执行 updated 的时候，页面和 data 中的数据已经保持同步了，都是最新的**

---

### beforeDestroy 和 destroyed

`beforeDestroy`和`destroyed`这两个钩子是销毁的时候所执行的，这里就偷懒没有演示了

---

### 关于 Vue 生命周期总结

上面说了挺多的，对于每一个生命周期钩子都进行了说明和实验，下面将会给出一张图对所有过程进行总结：

[![Y3o2kD.png](https://s1.ax1x.com/2020/05/10/Y3o2kD.png)](https://s1.ax1x.com/2020/05/10/Y3o2kD.png)

---

## nextTick

在开发的时候，有时候需要操作`dom`，但是有时候你会发现并没有正确的获取到`dom`，这是因为 Vue 中对`dom`的更新是异步更新的，如果我们想要正确的获取`dom`，可以用 Vue 的`nextTick`获取

Vue 的`nextTick`到底是什么，先来看一下官网的例子了解一下关于 Vue 中`dom`的更新以及`nextTick`的作用：

```html
<div id="example">{{message}}</div>
```

```javascript
var vm = new Vue({
  el: '#example',
  data: {
    message: '123',
  },
});
vm.message = 'new message'; // 更改数据
vm.$el.textContent === 'new message'; // false
Vue.nextTick(function() {
  vm.$el.textContent === 'new message'; // true
});
```

在这个例子中可以看到，先的对 message 进行了更改，之后再打印`dom`中的内容，发现这时候`dom`中的内容并没有马上更改，但是在 Vue 的`nextTick`钩子中打印了`dom`中的内容，却可以得到更改后的数据

下面引用了 Vue 官网的说明：

> **Vue 在更新 DOM 时是异步执行的。只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。**如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作是非常重要的。然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。Vue 在内部对异步队列尝试使用原生的 Promise.then、MutationObserver 和 setImmediate，如果执行环境不支持，则会采用 setTimeout(fn, 0) 代替

> 例如，当你设置 vm.someData = 'new value'，该组件不会立即重新渲染。当刷新队列时，组件会在下一个事件循环“tick”中更新。多数情况我们不需要关心这个过程，但是如果你想基于更新后的 DOM 状态来做点什么，这就可能会有些棘手。虽然 Vue.js 通常鼓励开发人员使用“数据驱动”的方式思考，避免直接接触 DOM，但是有时我们必须要这么做。为了在数据变化之后等待 Vue 完成更新 DOM，可以在数据变化之后立即使用 Vue.nextTick(callback)。这样回调函数将在 DOM 更新完成后被调用

总结一下，如果你想要去改变一个 Vue 中响应式的数据，不管你改变了一次还是多次，Vue 都会在所有的改变的完成后，渲染到虚拟`dom`上，虚拟`dom`完成更新后，最终只用一次渲染，渲染到真实的`dom`上

再回顾上面的例子，对 message 作出了更改，但是此时并没有渲染到真正的`dom`上，所以此时去获取真实`dom`上的信息，肯定不是最新的，但是可以通过 Vue 的`nextTick`中去获取`dom`，Vue 的`nextTick`是`dom`渲染完成后的一个回调，是异步的，只有在`dom`完成渲染之后才会执行，所以，要操作`dom`最好在`Vue.nextTick`中进行

为什么 Vue 要异步渲染，试想一下，假设 Vue 同步渲染，如果在一个事件执行的过程中，一个数据改变了多次，那么每次数据的改变都会触发真实`dom`的更新，更新真实的`dom`可能会触发**重排和重绘**，这对浏览器的开销是非常大的，对性能的消耗也是非常大的，而且重复渲染做了很多无用功，最终的结果也只是最后一次渲染的效果罢了，异步渲染就解决了这个问题，先把所有的数据改变都在虚拟`dom`上更新，最终把最新的虚拟`dom`渲染到真实的`dom`上，这就是为什么 Vue 要异步渲染的原因

---

## 结束语

关于 Vue 的生命周期，是 Vue 比较重要的一个概念，它解释了 Vue 渲染的大致流程，每个过程做了什么事情，以及每个渲染过程我们可以进行什么样的操作，理解 Vue 的生命周期可以对我们提供很大的帮助。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[b 站-vue 生命周期](https://www.bilibili.com/video/BV1sb411M7RT?p=1)  
[vue 官网](https://cn.vuejs.org)
