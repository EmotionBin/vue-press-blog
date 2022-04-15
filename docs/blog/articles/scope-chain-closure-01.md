# JS 作用域链与闭包

## 作用域

首先来了解一下**变量作用域**的概念，所谓变量作用域，就是一个变量可以使用的范围。js 代码在运行的时候也有着它自己的作用域，分别是**全局作用域**和**函数作用域**(eval 作用域暂不考虑)

**全局作用域**：顾名思义，在任何地方都能访问到，比如 window 对象的内置属性都拥有全局作用域

**函数作用域**：可以理解成块级作用域，函数包裹着一个代码块，函数作用域就是这个代码块所包裹的内容

来看一些例子:

```javascript
var a = 10;
function b() {
  var a = 20;
  console.log(a);
}
function c() {
  var a = 30;
  console.log(a);
}
console.log(a); // 10
b(); // 20
c(); // 30
```

上述代码中，变量 a 被定义了三次并赋予不同的值，在函数 b 中打印 a 的值，则使用函数 b 作用域中变量 a 的值，输出 20，在函数 c 中打印 a 的值，则使用函数 c 作用域中变量 a 的值，输出 30，在全局作用域下打印变量 a 的值，输出全局变量 a 的值 10，这个例子应该很好理解

再来看一个例子:

```javascript
var a = 'global';
function t() {
  var b = 5;
  console.log(c); // undefined
  var c = 'local';
  console.log(c); // local
}
t();
console.log(b); // Uncaught ReferenceError: b is not defined
```

按照 `console.log()` 的顺序来一个个分析，第一个是 `console.log(c)`,这里输出 `undefined`，因为 js 的**变量提升**机制，在函数中用 `var` 声明的变量会被提升到当前函数作用域的顶部，并且只是先声明而未初始化值，第二个是 `console.log(c)`，输出 local，这里没什么问题，下来是 `console.log(b)`，这里会报错，因为这条语句的执行环境是全局作用域，全局作用域下根本没有定义 b 这个变量，函数 t 中定义的变量 b 只在函数 t 作用域下能够被访问到

---

## 作用域链

在说作用域链之前要说一下 js 的**变量提升和函数提升**以及**执行上下文和执行上下文栈**这几个概念，这些是理解作用域链和闭包的前备知识

---

### 变量提升和函数提升

这里要记住一句话：**所谓变量提升和函数提升，就是函数和变量的声明会被 js 的解释器放到最上面，但仅限于 var 声明**

其实 `let` 和 `const` 也存在提升，只是他们会在我们声明(初始化)它们之前，它们是不可访问的，这被称为**暂时死区**，这里不详细讨论

```javascript
function f() {
  console.log(a); // undefined
  var a = 1;
  console.log(a); // 1
}
f();
```

在函数 f 中声明了变量 a，会被提升至函数顶部，所以上面这段代码相当于这样：

```javascript
function f() {
  var a; // var 声明的变量会发生变量提升
  console.log(a); // undefined
  a = 1;
  console.log(a); // 1
}
f();
```

这里再说一下 js 的一个坑点，在函数中使用 `var` 声明的变量作用域是当前的函数作用域，并且会发生变量提升，没有用 `var` 声明变量，会自动挂载到全局对象 `window` 上

```javascript
function f() {
  a = 1;
}
f();
console.log(a); // 1
```

```javascript
function f() {
  var a = 1;
}
f();
console.log(a); // Uncaught ReferenceError: a is not defined
```

不仅仅是变量，函数也会进行声明提升：

```javascript
function f() {
  fn();
  function fn() {
    console.log('this is fn');
  }
}
f(); // this is fn
```

**变量提升和函数提升的先后顺序**

```javascript
function foo() {
  var a;
  function a() {}
  console.log(a); // ƒ a() {}
}
foo();
```

在函数 foo 中声明了变量 a 同时也声明了函数 a，它们都会发生提升，**函数提升要比变量提升的优先级高**，函数会首先被提升，然后才是变量，上述代码相当于：

```javascript
function foo() {
  function a() {}
  var a;
  console.log(a); // ƒ a() {}
}
foo();
```

**函数提升优先级比变量提升要高，且不会被变量声明覆盖，但是会被变量赋值覆盖**

再来看一个例子：

```javascript
function foo() {
  console.log(a); // a(){}
  var a = 1;
  console.log(a); // 1
  function a() {}
  console.log(a); // 1
}
foo();
```

这段代码 js 进行提升后是这样的：

```javascript
function foo() {
  function a() {}
  var a;
  console.log(a); // a(){}
  a = 1;
  console.log(a); // 1
  console.log(a); // 1
}
foo();
```

---

### 执行上下文

执行上下文可以分为**全局执行上下文**和**函数执行上下文**(不考虑 eval)

全局执行上下文只有一个，在客户端中一般由浏览器创建，也就是我们熟悉的 `window` 对象，全局对象 `window` 上预定义了大量的方法和属性，我们在全局环境的任意处都能直接访问这些属性方法，同时 `window` 对象还是 `var` 声明的全局变量的载体，我们通过 `var` 创建的全局对象，都会被挂载到 `window` 对象上，都可以通过 `window` 对象直接访问，比如 `window.variable`

函数执行上下文是每当一个函数被调用时都会创建一个函数上下文，需要注意的是，**同一个函数被多次调用，都会创建一个新的上下文**

---

### 执行上下文栈(执行栈)

执行上下文栈它是一个栈结构，具有**后进先出**的特性，所以执行上下文栈也叫执行栈，也叫调用栈，**执行栈用于存储代码执行期间创建的所有上下文**

每次 js 代码开始运行时，都会先创建一个全局执行上下文并压入到执行栈中，之后每当有函数被调用，都会创建一个新的函数执行上下文并压入栈内，JS 代码执行完毕前全局上下文会一直在栈底，来看个例子:

```javascript
function f1() {
  f2();
  console.log(1);
}

function f2() {
  f3();
  console.log(2);
}

function f3() {
  console.log(3);
}

f1(); //3 2 1
```

首先，在全局作用域下调用了函数 f1，f1 进入执行栈，在 f1 中调用了函数 f2，f2 进入执行栈，在 f2 中调用了函数 f3，f3 进入执行栈，在 f3 中打印 3，f3 执行完毕，f3 出栈，这时回到 f2，打印 2，f2 执行完毕，f2 出栈，回到 f1，打印 1，f1 执行完毕，f1 出栈，回到全局作用域下，所有代码执行完毕

以画图的方式更便于理解，矩形表示执行栈，处于栈顶位置的是当前在执行的代码

[![dSsRz9.png](https://s1.ax1x.com/2020/08/13/dSsRz9.png)](https://s1.ax1x.com/2020/08/13/dSsRz9.png)

执行上下文有以下特点:

1. 函数每被调用一次，都会产生一个新的执行上下文环境
2. 同步单线程执行，从上往下按顺序执行
3. 全局上下文只有一个，浏览器关闭时会被弹出栈

执行上下文可存在多个，虽然没有明确的数量限制，但如果超出栈分配的空间，会造成堆栈溢出，常见于递归，**如果递归没有设置终止条件则会造成栈溢出**，还有一种情况就是**递归的尾调用**，递归尾调用没有处理好也会造成栈溢出

---

### 作用域链

所谓作用域链，就是作用域用一条链子串联起来，也就是说，在查找变量的作用域的时候，会顺着这条链子的方向进行查找，其实这里和原型链有点类似

一般来说，当使用一个变量的时候，js 会去查找这个变量的作用域，看这个变量在当前环境下是否可用，一般会按照以下方式查找：

1. 首先查看当前作用域，判断在当前作用域下这个变量是否可用，如果当前作用域声明了这个变量，则可用
2. 若在当前作用域不可用，查找当前作用域的上级作用域，也就是当前函数的上级函数，继续判断在上级函数中这个变量是否可用
3. 一级一级的往上找，直到找到全局作用域，找到了则使用，没找到则报错，`xxx is not defined`

```javascript
var name = 'xiaoming';
function f() {
  var name = 'xiaohong';
  console.log(name);
}
f(); // xiaohong
```

```javascript
var name = 'xiaoming';
function f() {
  console.log(name);
  var name = 'xiaohong'; // 发生变量提升
}
f(); // undefined
```

```javascript
var name = 'xiaoming';
function f() {
  console.log(name);
}
f(); // xiaoming
```

```javascript
function f() {
  console.log(a);
}
f(); // Uncaught ReferenceError: a is not defined
```

关于作用域链，这里有一点需要注意下，如果在当前作用域下找不到这个变量，则会往上一级作用域去找，关于上一级作用域的定义，**不是看函数在哪里调用，而是看函数在哪里被定义**

这样说可能会有点抽象，下面直接来看例子：

```javascript
var a = 1;
function b() {
  console.log(a);
}
function c() {
  var a = 3;
  b();
}
c(); // 1
```

调用函数 c，函数 c 又调用函数 b，在函数 b 中要打印变量 a，在函数 b 作用域中没有找到变量 a，向上一级查找，因为函数 b 是定义在全局作用域下的，所以它的上一级作用域就是全局作用域，在全局作用域中找到变量 a 的值是 1，所以这里直接输出 1，再来看下面一个例子

```javascript
var a = 1;
function c() {
  var a = 3;
  function b() {
    console.log(a);
  }
  b();
}
c(); // 3
```

同样的也是在函数 c 中调用了函数 b，只是这里函数 b 被嵌套定义在了函数 c 中，所以这里函数 b 的上一级作用域是函数 c，使用的是函数 c 中变量 a 的值

根据上面的两个例子对比，得出结论**查找函数上一级作用域时，关于上一级作用域到底在哪，不是看函数在哪里调用，而是看函数在哪里被定义**

---

## 垃圾回收与闭包

在说闭包之前要先了解 js 的垃圾回收机制，这和闭包有着重要的联系

---

### 垃圾回收

js 中的内存管理是自动执行的，而且是不可见的，我们创建基本类型、对象、函数等，所有这些都需要内存，当不再需要使用它们的时候，js 会自动清理它们并释放内存空间，这就是垃圾回收

```javascript
// user 具有对象的引用
let user = {
  name: 'John',
};
```

上述代码中，声明了一个变量 `user` 并赋值为一个对象 `{ name: "John" }`，对象是引用类型，变量 `user` 存储的值是这个对象的地址，变量 `user` 是这个对象的一个引用

```javascript
user = null;
```

这里将变量 `user` 置为 `null`，现在它已经不再是对象 `{ name: "John" }` 的引用，此时将进行垃圾回收，释放对象 `{ name: "John" }`，释放内存

js 垃圾回收的策略有两个，**标记清除**和**引用计数**，最常用的是标记清除策略

**标记清除：** 当变量进入环境(例如，在函数中声明一个变量)时，将这个变量标记为 “进入环境”，当变量离开环境时，则将其标记为 “离开环境”，根据变量的标记进行垃圾回收

**引用计数：** 当声明了一个变量并将一个引用类型值赋给该变量时，这个值的引用次数就是 1，如果同一个值又被赋值给另一个变量，则引用次数加 1，相反，如果包含对这个值的引用的变量有取了另一个值，则引用次数减 1，当这个值的引用次数变为 0 时，说明已经没法再访问这个值了，因此可以将其占用的内存回收了

**使用引用计数时，有一个很严重的问题，就是循环引用**，如果对象 A 中包含一个指针指向对象 B，而对象 B 中也包含一个指针指向对象 A，那么这两个对象引用次数都不为 0，但实际上已经可以回收了

对于垃圾回收，这里只是简单概括，不打算详细介绍，想要详细了解可以看看这篇写得不错的文章 [传送门](https://segmentfault.com/a/1190000018605776?utm_source=tag-newest)

---

### 闭包

闭包是什么，一句话总结，**闭包是指有权访问另一个函数作用域中的变量的函数**或**闭包就是能够读取其他函数内部变量的函数**

闭包主要有以下三个特性：

1. 在函数中嵌套函数
2. 函数内部可以引用函数外部的参数和变量
3. 参数和变量不会被垃圾回收机制回收

```javascript
function a() {
  var b = 1;
  return function() {
    return b;
  };
}
var f = a();
console.log(f()); // 1
```

在上述例子中，函数 a 定义了一个变量 b 并返回了一个新函数，这个新函数又返回了变量 b，`var f = a();` 拿到这个函数，`f()` 可以获取到函数 a 中变量 b 的值，这就是一个闭包，函数 a 中的变量 b 被外部函数引用了，所以在函数 a 执行完毕后不会被垃圾回收机制回收它里面的变量，所以在外部仍然可以访问到函数 a 内部的变量 b

```javascript
function a() {
  var num = 5;
  return function() {
    var n = 0;
    console.log(++n);
    console.log(++num);
  };
}

var f = a();
f(); // 1 6
f(); // 1 7
f(); // 1 8
```

这也是一个闭包的例子，变量 num 被外部引用了，所以不会被垃圾回收机制销毁，使用的一直是同一个值，而变量 n 是每次调用都会初始化为 0 的一个值

闭包的优点：

- 可以读取函数内部的变量
- 避免变量污染全局环境
- 变量私有化，保护了变量的安全

闭包的缺点：

- 对内存开销较大，使用不当容易造成内存泄漏(解决方法是可以在使用完闭包后手动为它赋值为 null)

---

## 一些面试题

**第一题：**

```javascript
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```

这是一道经典的面试题，输出结果是一秒后输出 5 个 5，原因很简单，一秒后 i 的值变为 5，所以打印 5 个 5

这道题不会就这么简单，现在要求一秒后输出 0 1 2 3 4

```javascript
// 可以利用es6 let 的块级作用域
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```

```javascript
// IIFE
for (var i = 0; i < 5; i++) {
  ((j) => {
    setTimeout(function() {
      console.log(j);
    }, 1000);
  })(i);
}
```

解决方案目前给出两个，利用 es6 的 `let` 产生块级作用域或利用 IIFE 自执行函数把参数 i 传入以保存 i 的值

**第二题：**

```javascript
var name = 'The Window';
var object = {
  name: 'My Object',
  getNameFunc: function() {
    return function() {
      return this.name;
    };
  },
};
console.log(object.getNameFunc()());
```

输出：`The Window`，`object.getNameFunc()` 先返回一个函数，`object.getNameFunc()()` 执行返回的函数，返回 `this.name`，这里的 this 发生了默认绑定，指向 `window`，所以输出是 `The Window`

这题再改一下，输出结果又会是什么呢

```javascript
var name = 'The Window';
var object = {
  name: 'My Object',
  getNameFunc: function() {
    var that = this;
    return function() {
      return that.name;
    };
  },
};
console.log(object.getNameFunc()());
```

输出：`My Object`，`object.getNameFunc()()` 返回 `that.name`，这个变量 that 保存了上个函数的 this，上个函数的 this 指向对象 object，所以 `that.name` 等价于 `object.name`，这里是个闭包

---

## 结束语

以上就是关于本文的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[JS 作用域&作用域链](https://www.jianshu.com/p/9edd0f6908bc)  
[学习 Javascript 闭包（Closure）](http://www.ruanyifeng.com/blog/2009/08/learning_javascript_closures.html)  
[前端面试：谈谈 JS 垃圾回收机制](https://segmentfault.com/a/1190000018605776?utm_source=tag-newest)
