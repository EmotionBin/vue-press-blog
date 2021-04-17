# 关于MVC与MVVM以及Vue的实现原理

之前一直对MVC和MVVM一知半解，直到最近看了一些相关的文章，才弄懂了MVC和MVVM，于是就打算写这篇文章，来谈谈我对MVC和MVVM的理解。  

----

## MVC

MVC到底是什么意思，下面引用阮一峰老师的一张图：  

![GKx1wF.png](https://s1.ax1x.com/2020/03/31/GKx1wF.png)

从这张图中可以看出MVC就是M（Model）+V（View）+C（Controller），下面来详细讨论他们之间的关系。

- 视图（View）：用户界面
- 控制器（Controller）：业务逻辑
- 模型（Model）：数据保存

再引用阮一峰老师的一张图说明一下他们之间的通信关系：  

![GMiU4U.png](https://s1.ax1x.com/2020/03/31/GMiU4U.png)

1. View 传送指令到 Controller
2. Controller 完成业务逻辑后，要求 Model 改变状态
3. Model 将新的数据发送到 View，用户得到反馈

view（视图）上发生变化，通过Controller（控件）将响应传入到Model（数据源），由数据源改变View上面的数据。这种方式看似可行，**但是如果以后业务逻辑越来越复杂，这种架构就会暴露出很多弊端**：

1. 需要大量调用`DOM`的API，冗余而繁琐，这样一来代码很难维护
2. 大量`DOM`操作有可能会使页面渲染性能降低，加载速度变慢，影响用户体验
3. Model每变化一次，就要手动触发View的渲染更新，如果Model频繁变化，就要不停的手动更新，操作繁琐，这样只会越来越臃肿，而且很难维护复杂多变的数据状态

其实，早期`jquery`的出现就是为了前端能更简洁的操作`DOM`而设计的，但是它只解决了第一个问题，它只是封装了`DOM`的API的调用方式，确实使得操作`DOM`的时候变得简洁了，但假如在项目中大量用到了`DOM`操作，大量的数据变化，这样一来，根本的问题还是没有得到解决。于是到后来MVVM的出现，才解决了以上的问题。

----

## MVVM
MVVM又是什么？MVVM其实就是M（Model）+V（View）+VM（ViewModel）

- 数据模型（Model）：保存数据
- 视图（View）：数据的UI展现
- ViewModel：一个同步View 和 Model的对象，起到一个连接桥的作用

这样解释可能还是有点抽象，下面再来看一张图：

![GM1osP.png](https://s1.ax1x.com/2020/03/31/GM1osP.png)

由上图可以看到，View通过ViewModel的`DOM Listeners`将事件绑定到Model上，而Model则通过`Data Bindings`来管理View中的数据，ViewModel从中起到一个连接桥的作用。在MVVM架构下，View和Model之间并没有直接的联系，而是通过ViewModel进行交互，Model和 ViewModel之间的交互是双向的，因此View数据的变化会同步到Model中，而Model数据的变化也会立即反应到View上。  

可以得出结论，MVVM架构与MVC架构的区别可以概括为：  

1. **实现数据与视图的分离**
2. **数据驱动视图，只需要关心数据变化，DOM操作被封装了**

----

### MVVM实现原理
下面来解析一下Vue.js中的MVVM架构，先来看一张图： 

![GMUY4K.png](https://s1.ax1x.com/2020/03/31/GMUY4K.png)

首先要对数据进行劫持监听，所以我们需要设置一个监听器`Observer`，用来监听所有属性。如果属性发生变化了，就需要告诉订阅者`Watcher`看是否需要更新。因为订阅者是有很多个，所以我们需要有一个消息订阅器Dep来专门收集这些订阅者，然后在监听器`Observer`和订阅者`Watcher`之间进行统一管理的。接着，我们还需要有一个指令解析器`Compile`，对每个节点元素进行扫描和解析，将相关指令对应初始化成一个订阅者`Watcher`，并替换模板数据或者绑定相应的函数，此时当订阅者`Watcher`接收到相应属性的变化，就会执行对应的更新函数，从而更新视图。

可能会有点抽象，接下来一点一点讲解，它的实现主要是三个核心点： 

1. **响应式：vue如何监听data的属性变化**
2. **模板解析：vue的模板是如何被解析的**
3. **渲染：vue模板是如何被渲染成HTML的**

----

### 响应式
Vue2.0中响应式原理主要是ES5的`Object.defineProperty`，其实就是给数据加了一层**数据劫持**，每当访问数据（getter）或者修改数据（setter）的时候，Vue都能够检测到数据的一举一动。最近听说Vue3.0准备发布，Vue3.0的响应式操作会改为ES6的`Proxy`，这里暂时不展开叙述，未来Vue3.0发布了之后再仔细研究。  

我曾经看到过一段代码，这段代码简洁精炼的模拟了Vue的响应式原理 [传送门](https://github.com/answershuto/VueDemo/blob/master/%E3%80%8A%E5%93%8D%E5%BA%94%E5%BC%8F%E7%B3%BB%E7%BB%9F%E7%9A%84%E5%9F%BA%E6%9C%AC%E5%8E%9F%E7%90%86%E3%80%8B.js)。     
 
下面给出另一段简短的代码来模拟Vue的响应式操作：

```javascript
		var Book = {}
		Object.defineProperty(Book, 'name', {
			get: function () {
				return '《' + name + '》'
			},
			set: function (value) {
				name = value;
				console.log('你取了一个书名叫做' + value);
			}
		})
		console.log(Book.name);  // 《》
		Book.name = 'vue权威指南';  // 你取了一个书名叫做vue权威指南
		console.log(Book.name);  // 《vue权威指南》
```

通过以上代码示例可以发现，通过`Object.defineProperty`将Book对象中的name属性添加了get和set监听，这样一来，只要触发了这个属性的getter/setter，都可以监听到。Vue在监听到这个动作之后可以对`Dom`进行相应处理。  

**综上所述，Vue的响应式原理可以总结为：当执行 new Vue() 时，Vue 就进入了初始化阶段，一方面Vue 会遍历 data 选项中的属性，并用 Object.defineProperty 将它们转为 getter/setter，实现数据变化监听功能；另一方面，Vue 的指令编译器Compile 对元素节点的指令进行扫描和解析，初始化视图，并订阅 Watcher 来更新视图， 此时Wather 会将自己添加到消息订阅器中(Dep)，初始化完毕。当数据发生变化时，Observer 中的 setter 方法被触发，setter 会立即调用Dep.notify()，Dep 开始遍历所有的订阅者，并调用订阅者的 update 方法，订阅者收到通知后对视图进行相应的更新。**

----

### 模板解析

模板本质上是一串字符串，它看起来和`html`的格式很相像，实际上有很大的区别，因为模板本身还带有逻辑运算，比如`v-if`，`v-for`等等，但它最后还是要转换为`html`来显示，模板必须转换成JS函数(render函数),进而转换成`html`渲染页面。Vue会将模板解析成`AST`（abstract syntax tree,抽象语法树），然后使用`AST`生成渲染函数。由于静态节点不需要总是重新渲染，所以生成`AST`之后，生成渲染函数之前这个阶段，需要做一个优化操作：遍历一遍`AST`，给所有静态节点做一个标记，这样在虚拟`DOM`中更新节点时，如果发现这个节点有这个标记，就不会重新渲染它。通过执行渲染函数生成最新的`vnode`（Virtual DOM），最后根据`vnode`进行渲染。  

模板解析可以总结为三个部分：

1. **将模板解析成AST**
2. **优化AST树，主要是标记静态节点**
3. **通过调用render函数生成虚拟DOM**

----

### 渲染

这里来说一下虚拟`DOM`，所谓的虚拟`DOM`，其实就是**用JS来模拟DOM结构，把DOM的变化操作放在JS层来做，尽量减少对DOM的操作**（个人认为主要是因为操作JS比操作`DOM`快了不知道多少倍，JS运行效率高）。然后对比前后两次的虚拟`DOM`的变化，只重新渲染变化了的部分，而没有变化的部分则不会重新渲染。模板渲染为`html`分为两种情况，第一种是初次渲染的时候，第二种是渲染之后数据发生改变的时候，首先读取当前的虚拟`DOM`，判断其是否为空，若为空，则为初次渲染，将虚拟`DOM`全部渲染到所对应的容器当中，若不为空，则是数据发生了修改，通过响应式我们可以监听到这一情况，使用`diff`算法完成新旧对比并修改，`diff`算法会比较原`vnode`和`newVnode`的差异，以最小的代价重新渲染页面。  

----

#### v-for为什么要加key

在使用 `v-for` 指令时，Vue建议我们都给每个项目加上一个独立的 `key`，这其中的秘密就是 `diff` 算法  

来看一段代码，是没有加上 `key` 的情况：  

```html
  <div id="app">
    <div>
      <input type="text" v-model="name">
      <button @click="add">添加</button>
    </div>
    <ul>
      <li v-for="(item, i) in list">
        <input type="checkbox"> {{item.name}}
      </li>
    </ul>
  </div>
```

```javascript
  var vm = new Vue({
    el: '#app',
    data: {
      name: '',
      newId: 3,
      list: [
        { id: 1, name: '李斯' },
        { id: 2, name: '吕不韦' },
        { id: 3, name: '嬴政' }
      ]
    },
    methods: {
      add() {
        //注意这里是unshift
        this.list.unshift({ id: ++this.newId, name: this.name })
        this.name = ''
      }
    }
  });
```

当选中吕不为时，添加楠楠后选中的确是李斯，并不是我们想要的结果，我们想要的是当添加楠楠后，选中的仍然是吕不韦  

![Usr5kt.png](https://s1.ax1x.com/2020/07/17/Usr5kt.png)

![UsrH1S.png](https://s1.ax1x.com/2020/07/17/UsrH1S.png)

再来看一段代码，这是加上 `key` 的情况，js代码同上：  

```html
  <div id="app">
    <div>
      <input type="text" v-model="name">
      <button @click="add">添加</button>
    </div>
    <ul>
      <li v-for="(item, i) in list" :key="item.id">
        <input type="checkbox"> {{item.name}}
      </li>
    </ul>
  </div>
```

![Usr5kt.png](https://s1.ax1x.com/2020/07/17/Usr5kt.png)

![Ussc40.png](https://s1.ax1x.com/2020/07/17/Ussc40.png)

同样当选中吕不为时，添加楠楠后依旧选中的是吕不为  

可以这样理解，**加了key(一定要具有唯一性) id的checkbox跟内容进行了一个关联**  

----

#### 关于diff算法

diff算法的处理方法，就是对操作前后的 `dom` 树同一层的节点进行对比，一层一层对比:  

![Usx9Cq.png](https://s1.ax1x.com/2020/07/17/Usx9Cq.png)

当某一层有很多相同的节点时，也就是列表节点，diff 算法的更新过程默认情况下也是遵循以上原则，比如有节点 A-E，我们希望在B、C之间加入一个新节点 F，我们期望应该是直接在B、C之间插入节点 F:  

![UsxQxK.jpg](https://s1.ax1x.com/2020/07/17/UsxQxK.jpg)

但是 diff 算法执行起来却是这样的:  

![Usx6aj.jpg](https://s1.ax1x.com/2020/07/17/Usx6aj.jpg)

即把 C 更新成 F，D 更新成 C，E 更新成 D，最后再加入一个新节点 E，这样的效率是非常低的，因为插入位置后面的节点全部都被重新渲染了，而且这种渲染是不必要的，如果我们把各个节点能够对应起来，应该就能够复用节点，这样会好很多。所以用一个唯一的 key 来标识节点，diff 算法就可以正确的识别此节点，找到正确的位置插入新的节点  

![UszFJI.jpg](https://s1.ax1x.com/2020/07/17/UszFJI.jpg)

根据以上例子，总结一下，Vue 中 `v-for` 加 `:key="唯一标识"`(唯一标识可以是 item 里面的 id 等，尽量不要用 index 作为唯一标识，因为增加、删除节点都会改变 index 值）就是为了标识唯一性，Vue 组件是高度复用的，有了 `key` 之后，就可以更好的区分各个组件，高效的更新虚拟 `dom`  

----

### vue 实现原理

关于 vue 具体的实现原理，我有写过一些 demo，主要是关于以下几个方面  

- vue 的虚拟 dom 的具体实现
- vue 的 emit 与 on 具体实现原理
- vue 观察者模式具体实现
- 手写一个简易的 vue 框架

感兴趣的话可以看这里 [传送门](https://github.com/EmotionBin/various-demo/tree/master/vue-principle)  

----

## 结束语

以上就是我关于MVC和MVVM的一些理解，如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**  

[阮一峰-MVC，MVP 和 MVVM 的图示](http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html)  
[思否-MVVM框架理解及其原理实现](https://segmentfault.com/a/1190000015895017)    
[MVVM模式理解](https://www.cnblogs.com/goloving/p/8520030.html)  
[简书-MVVM响应式系统的基本实现原理](https://www.jianshu.com/p/9fc69a38da50)  
[知乎-Vue 模板编译原理](https://zhuanlan.zhihu.com/p/85105001)  
[简书-VUE中演示v-for为什么要加key](https://www.jianshu.com/p/4bd5e745ce95)  