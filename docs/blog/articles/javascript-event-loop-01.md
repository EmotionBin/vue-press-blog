# 详解JavaScript中的事件循环机制

## JavaScript的运行机制

`JavaScript`语言的一大特点就是单线程，也就是说，同一个时间只能做一件事。单线程就意味着，所有任务需要排队，前一个任务结束，才会执行后一个任务。如果前一个任务耗时很长，后一个任务就不得不一直等着。

----

## 为什么JavaScript是单线程

`JavaScript`的单线程，与它的用途有关，`JavaScript`的主要用途是与用户互动，以及操作`DOM`。这决定了它只能是单线程，否则会带来很复杂的同步问题。比如，假定`JavaScript`同时有两个线程，一个线程在某个`DOM`节点上添加内容，另一个线程删除了这个节点，这时浏览器应该以哪个线程为准？所以`JavaScript`必须是单线程。

----

## 执行栈

当执行某个函数、用户点击一次鼠标，ajax完成，一个图片加载完成等事件发生时，只要指定过回调函数，这些事件发生时就会进入执行栈队列中，等待主线程读取，遵循先进先出原则。

----

## 任务队列

因为`JavaScript`是单线程的，所以他运行的线程就叫主线程。要明确的一点是，主线程跟执行栈是不同概念，主线程规定现在执行执行栈中的哪个事件。  

主线程循环：即主线程会不停的从执行栈中读取事件，会执行完所有栈中的同步代码。  

当遇到一个异步事件后，并不会一直等待异步事件返回结果，而是会将这个事件挂在与执行栈不同的队列中，我们称之为任务队列。  

接下来的这句话很重要：**当主线程将执行栈中所有的代码执行完之后，主线程将会去查看任务队列是否有任务。如果有，那么主线程会依次执行那些任务队列中的回调函数。**  

什么意思呢？就好比现在有一段`JavaScript`代码，`JavaScript`正在运行，这时候主线程会执行一些静态的代码，当执行完后，假设现在用户点击了一个按钮，触发了一个点击事件clickA，这时候clickA这个事件就会进入`JavaScript`的执行栈中，主线程会去执行clickA这个事件的回调函数，也就是clickA()，此时`JavaScript`主线程正在执行clickA()中的内容，如果clickA()中发送了一个异步ajaxA请求，那么此时这个ajaxA异步请求会进入任务队列中，注意，此时ajaxA不会马上执行，而是被挂起，因为此时在执行栈中的clickA()并没有执行结束，所以继续执行clickA()，直到clickA()结束后，主线程再去异步队列中查看是否有异步操作，它查找到异步队列中有一个ajaxA任务，这时候它会去执行ajaxA的回调函数。  
下面是用图和代码来模拟这一段过程：
```javascript
		//JavaScript开始执行
		console.log('script start!');
		//这里定义clickA
		const clickA = () => {
			console.log('clickA start');
			//发送异步请求ajaxA,这里用setTimeout模拟
			const ajaxA = setTimeout(() => {
				//这里是ajaxA的回调函数
				console.log('ajaxA completed');
			}, 0);
			console.log('clickA end');
		}
		console.log('do something...');

		//到这里，JavaScript已经把所有静态代码执行完毕
		console.log('script end!');
		//这时候用户点击了一个按钮，触发了一个事件clickA
		//clickA进入执行栈开始执行
		clickA();

		//输出结果
		// script start!
		// do something...
		// script end!
		// clickA start
		// clickA end
		// ajaxA completed
```

这是`JavaScript`开始执行的时候的状态，先执行一些静态的代码:

![GP39w8.png](https://s1.ax1x.com/2020/03/27/GP39w8.png)

执行完毕后，过了一会儿，用户点击按钮，触发了clickA事件，clickA事件进入执行栈:

![GP8OKI.png](https://s1.ax1x.com/2020/03/27/GP8OKI.png)

因为clickA事件中发送了一个异步请求ajaxA，ajaxA异步请求进入任务队列，暂时挂起：

![GPJz9g.png](https://s1.ax1x.com/2020/03/27/GPJz9g.png)

clickA事件执行结束后，再去任务队列中执行ajaxA的回调函数:

![GPYxVx.png](https://s1.ax1x.com/2020/03/27/GPYxVx.png)

在执行完ajaxA的回调函数后，这整个过程也就结束了。

### JavaScript异步执行机制

总结一下JavaScript异步执行的运行机制:

1. 所有任务都在主线程上执行，形成一个执行栈。  
2. 主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。  
3. 一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"。那些对应的异步任务，结束等待状态，进入执行栈并开始执行。  
4. **主线程不断重复上面的第三步。**  

----

### 宏任务与微任务

#### 宏任务(macro-task)

- script(整体代码)
- setTimeout
- setInterval
- setImmediate
- postMessage
- I/O
- UI render

#### 微任务(micro-task) 

- Promise
- Async/Await(实际就是promise)
- process.nextTick(Node.js环境）
- MutationObserver(html5新特性)

对于他们之间的关于以及执行的顺序，请看下图:

![GiJKaV.png](https://s1.ax1x.com/2020/03/27/GiJKaV.png)

![GiMcNQ.png](https://s1.ax1x.com/2020/03/27/GiMcNQ.png)

总的结论就是，执行宏任务，然后执行该宏任务产生的微任务，若微任务在执行过程中产生了新的微任务，则继续执行微任务，微任务执行完毕后，再回到宏任务中进行下一轮循环。

----

### 事件循环(Event Loop)

事件循环(Event Loop)中，每一次循环称为 tick, 每一次tick的任务如下：  

- 执行栈选择最先进入队列的宏任务(通常是script整体代码)，如果有则执行
- 检查是否存在 microtask，如果存在则不停的执行，直至清空 microtask 队列
- 更新render(每一次事件循环，浏览器都可能会去更新渲染)
- 重复以上步骤  

如下图所示：

![GilIkF.png](https://s1.ax1x.com/2020/03/27/GilIkF.png)

综上所述:  

1. 执行一个宏任务（栈中没有就从事件队列中获取）   
2. 执行过程中如果遇到微任务，就将它添加到微任务的任务队列中    
3. 宏任务执行完毕后，立即执行当前微任务队列中的所有微任务（依次执行）    
4. 当前宏任务执行完毕，开始检查渲染，然后GUI线程接管渲染    
5. 渲染完毕后，JS线程继续接管，开始下一个宏任务（从事件队列中获取）   

----

### ajax请求

这里再简单说一下ajax请求与事件循环的关系。**虽然说解析JS是单线程的，但是浏览器并不一定是单线程的，这就意味着JS跑在浏览器环境下并不一定是单线程的**。  

比如一段JS代码，在浏览器上运行的时候，遇到了ajax请求，那么它会怎么处理呢，ajax请求是由浏览器的内核`Network`模块处理的。浏览器在解析JS的时候如果遇到ajax请求，会调用自身的`Network`模块进行处理，立马开启另一个线程发送ajax请求，这个线程和解析JS的线程都是独立的，不会影响解析JS的线程，也就是说JS继续解析，同时发出ajax请求，只有在ajax请求有了返回结果之后，浏览器`Network`模块会把ajax的回调函数放置到任务队列中，根据JS的事件循环机制，主线程清空后就会去任务队列中读取这个回调函数，从而执行ajax请求成功之后的回调。  

关于由浏览器内核处理的，主要有以下内容：  

- 类似的click事件等，由浏览器内核的`DOM binding`模块处理，事件触发时，回调函数添加到任务队列中
- `setTimeout`等，由浏览器内核的`Timer`模块处理，时间到达时，回调函数添加到任务队列中
- ajax，由浏览器内核的`Network`模块处理，网络请求返回后，添加到任务队列中

----

## 实践与练习

首先来看一道经典的面试题:  

```javascript
		console.log('script start')

		async function async1() {
			await async2()
			console.log('async1 end')
		}
		async function async2() {
			console.log('async2 end')
		}
		async1()

		setTimeout(function() {
			console.log('setTimeout')
		}, 0)

		new Promise(resolve => {
			console.log('Promise')
			resolve()
		})
		.then(function() {
			console.log('promise1')
		})
		.then(function() {
			console.log('promise2')
		})

		console.log('script end')
```
这道题在chrome浏览器控制台中的输出如下:  

script start > async2 end > Promise > script end > async1 end > promise1 > promise2 > setTimeout  

注意这是是chrome环境下的输出结果，如果是在nodejs环境下，输出结果可能会略有差别，因为chrome优化了，`await`变得更快了。  

分析这段代码：  

- 执行代码，输出script start。
- 执行async1(),会调用async2(),然后输出async2 end,跳出`await`,把console.log('async1 end')注册成第一个微任务。
- 遇到`setTimeout`，产生一个宏任务。
- 执行`Promise`，输出Promise（这里注意Promise中还是同步的，它的异步体现在.then()）。
- 遇到then，产生微任务，把console.log('promise1')注册成第二个微任务。
- 遇到then，产生微任务，把console.log('promise2')注册成第三个微任务。
- 继续执行代码，输出script end，此时主线程执行栈清空(当前宏任务执行完毕)，开始执行任务队列(开始执行微任务)。
- 依次输出async1 end > promise > promise2，微任务执行完毕。
- 最后，执行下一个宏任务，即执行`setTimeout`，输出setTimeout。  

这里要说明一下，await其实可以分为2种情况：  

1. 如果`await` 后面直接跟的是一个变量，或者同步操作，比如：`await 1`；这种情况的话相当于直接把`await`后面的代码注册为一个微任务，可以简单理解为promise.then(await下面的代码)。然后跳出async1函数，执行其他代码，当遇到`promise`函数的时候，会注册promise.then()函数到微任务队列，注意此时微任务队列里面已经存在`await`后面的微任务。所以这种情况会先执行`await`后面的代码（async1 end），再执行async1函数后面注册的微任务代码(promise1,promise2)。  
2. 如果`await`后面跟的是一个异步函数的调用，比如上面的代码，将代码改成这样：  

```javascript
		console.log('script start')

		async function async1() {
			await async2()
			console.log('async1 end')
		}
		async function async2() {
			console.log('async2 end')
			return Promise.resolve().then(()=>{
				console.log('async2 end1')
			})
		}
		async1()

		setTimeout(function() {
			console.log('setTimeout')
		}, 0)

		new Promise(resolve => {
			console.log('Promise')
			resolve()
		})
		.then(function() {
			console.log('promise1')
		})
		.then(function() {
			console.log('promise2')
		})

		console.log('script end')
```
输出结果为:script start > async2 end > Promise > script end > async2 end1 >  promise1 > promise2 > async1 end > setTimeout  

此时执行完`await`并不先把`await`后面的代码注册到微任务队列中去，而是先把`await`后面的代码暂时挂起，直接跳出async1函数，继续执行下面的代码。然后遇到`promise`的时候，把promise.then注册为微任务。下面的代码执行完毕后，需要回到async1函数去执行`await`后面的代码，然后把`await`后面的代码注册到微任务队列当中，注意此时微任务队列中是有之前注册的微任务的。所以这种情况会先执行async1函数之外的微任务(promise1,promise2)，然后才执行async1内注册的微任务(async1 end)。  

可以理解为，这种情况下，`await` 后面的代码会在本轮循环的最后被执行，或者可以这样理解，把`await`下面的代码加入当前微任务队列的队尾。

----

## 结语

本文中运行环境是chrome运行环境，如果是在nodejs环境下运行，会略有不同。只有不断学习才能提升自己，如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[阮一峰-JavaScript 运行机制详解](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)  
[思否-Js 的事件循环(Event Loop)机制以及实例讲解](https://segmentfault.com/a/1190000015317434)    
[掘金-说说事件循环机制](https://juejin.im/post/5e5c7f6c518825491b11ce93#heading-3)  


