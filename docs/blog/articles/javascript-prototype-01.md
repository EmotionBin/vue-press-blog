# 谈谈 JavaScript 中的原型和原型链

**说到 JS 的原型，首先要了解以下几个要点，这几个要点是理解原型的关键点：**

1. 所有的引用类型（数组、函数、对象）可以自由扩展属性（除`null`以外）
2. 所有的引用类型都有一个`__proto__`属性(也叫隐式原型，它是一个普通的对象)
3. 所有的函数都有一个`prototype`属性(这也叫显式原型，它也是一个普通的对象)
4. 所有引用类型，它的`__proto__`属性指向它的构造函数的`prototype`属性
5. 当试图得到一个对象的属性时，如果这个对象本身不存在这个属性，那么就会去它的`__proto__`属性(也就是它的构造函数的`prototype`属性)中去寻找

---

## 原型

到底什么是原型,先来看一个原型的例子：

```javascript
//这是一个构造函数
function Foo(name, age) {
  this.name = name;
  this.age = age;
}
/*根据要点3，所有的函数都有一个prototype属性，这个属性是一个对象
		再根据要点1，所有的对象可以自由扩展属性
		于是就有了以下写法*/
Foo.prototype = {
  // prototype对象里面又有其他的属性
  showName: function() {
    console.log("I'm " + this.name); //this是什么要看执行的时候谁调用了这个函数
  },
  showAge: function() {
    console.log("And I'm " + this.age); //this是什么要看执行的时候谁调用了这个函数
  },
};
var fn = new Foo('小明', 19);
/*当试图得到一个对象的属性时，如果这个对象本身不存在这个属性，那么就会去它
		构造函数的'prototype'属性中去找*/
fn.showName(); //I'm 小明
fn.showAge(); //And I'm 19
```

这就是所谓的原型，很好理解，那么为什么要使用原型呢？

试想如果我们要通过 Foo()来创建**很多很多个**对象，如果我们是这样子写的话：

```javascript
function Foo(name, age) {
  this.name = name;
  this.age = age;
  this.showName = function() {
    console.log("I'm " + this.name);
  };
  this.showAge = function() {
    console.log("And I'm " + this.age);
  };
}
```

那么我们创建出来的每一个对象，里面都有 showName 和 showAge 方法，这样就会占用很多的资源。

而通过原型来实现的话，只需要在构造函数里面给属性赋值，而把方法写在`Foo.prototype`属性(这个属性是唯一的)里面。这样每个对象都可以使用`prototype`属性里面的 showName、showAge 方法，并且节省了不少的资源

---

## 原型链

如果理解了原型，那么原型链也就很好理解了

**下面这段话可以帮助理解原型链**

根据要点 5，当试图得到一个对象的属性时，如果这个对象本身不存在这个属性，那么就会去它构造函数的`prototype`属性中去寻找。那又因为`prototype`属性是一个对象，所以它也有一个`__proto__`属性

那么我们来看一个例子：

```javascript
// 构造函数
function Foo(name, age) {
  this.name = name;
  this.age = age;
}
Object.prototype.toString = function() {
  //this是什么要看执行的时候谁调用了这个函数。
  console.log("I'm " + this.name + " And I'm " + this.age);
};
var fn = new Foo('小明', 19);
fn.toString(); //I'm 小明 And I'm 19
console.log(fn.toString === Foo.prototype.__proto__.toString); //true
console.log(fn.__proto__ === Foo.prototype); //true
console.log(Foo.prototype.__proto__ === Object.prototype); //true
console.log(Object.prototype.__proto__ === null); //true
```

是不是觉得有点奇怪？我们来分析一下:

[![8qlxNF.png](https://s1.ax1x.com/2020/03/24/8qlxNF.png)](https://s1.ax1x.com/2020/03/24/8qlxNF.png)

首先，fn 的构造函数是 Foo()。所以：`fn.__proto__=== Foo.prototype`

又因为`Foo.prototype`是一个普通的对象，它的构造函数是`Object`，所以：`Foo.prototype.__proto__=== Object.prototype`

通过上面的代码，我们知道这个 toString()方法是在`Object.prototype`里面的，当调用这个对象的本身并不存在的方法时，它会一层一层地往上去找，一直到`null`为止

**所以当 fn 调用 toString()时，JS 发现 fn 中没有这个方法，于是它就去 Foo.prototype 中去找，发现还是没有这个方法，然后就去 Object.prototype 中去找，找到了，就调用 Object.prototype 中的 toString()方法**

这就是原型链，fn 能够调用`Object.prototype`中的方法正是因为存在原型链的机制

另外，在使用原型的时候，一般推荐将需要扩展的方法写在构造函数的`prototype`属性中，避免写在`__proto__`属性里面，这样做的目的是，如果写在了构造函数的`prototype`属性中,那么构造函数构造出的每一个成员都可以访问构造函数的`prototype`属性，这样每一个成员就共有了这个扩展的方法。写在`__proto__`属性里面则达不到这个目的

---

### 一个特殊的例子

这里会提到一个比较特殊的情况，就是函数的构造函数`Function`，在 js 中使用`Function`可以实例化函数对象，也就是说在 js 中函数与普通对象一样, 也是一个对象类型(非常特殊)，接下来看一张图：

[![G7ION4.png](https://s1.ax1x.com/2020/04/11/G7ION4.png)](https://s1.ax1x.com/2020/04/11/G7ION4.png)

这样绕来绕去或许有点头晕，没关系，下面来看一个例子：

```javascript
function Foo() {
  console.log('this is Foo');
}
Object.prototype.fObj = function() {
  console.log('this is Object.prototype.fObj');
};
Function.prototype.myfun = function() {
  console.log('this is Function.prototype.myfun');
};
Foo.myfun(); //this is Function.prototype.myfun
Foo.fObj(); //this is Object.prototype.fObj
console.log(Foo.__proto__ === Function.prototype); // true
console.log(Foo.myfun === Function.prototype.myfun); // true
console.log(Foo.__proto__.__proto__ === Object.prototype); // true
console.log(Foo.__proto__.__proto__.fObj === Object.prototype.fObj); // true
```

来分析一下，请看下图:

[![GHSSF1.png](https://s1.ax1x.com/2020/04/11/GHSSF1.png)](https://s1.ax1x.com/2020/04/11/GHSSF1.png)

首先，Foo 的构造函数是`Function`。所以： `Foo.__proto__=== Function.prototype`， 又因为`Function.prototype`是一个普通的对象，它的构造函数是`Object`，所以： `Function.prototype.__proto__=== Object.prototype`，通过上面的代码，当调用 Foo.myfun()的时候，因为 Foo 本身没有 myfun()这个方法，所以它会去`Foo.__proto__`里面去找，也就是`Function.prototype`，发现`Function.prototype`里面有 myfun()这个方法，则直接调用，当调用 Foo.fObj()的时候，因为 Foo 本身没有 fObj()这个方法，先去`Foo.__proto__`里面去找，也没有这个方法，继续往上找，也就是去`Foo.__proto__.__proto__`里面找，其实就是找`Object.prototype`里面有没有 fObj()这个方法，找到了直接调用

其实上面的两个例子可以结合在一起，我又画了一张图：

[![GHPbqS.png](https://s1.ax1x.com/2020/04/11/GHPbqS.png)](https://s1.ax1x.com/2020/04/11/GHPbqS.png)

这是这两个例子结合在一起的图，只要上面的例子都理解了，这个图应该也很好理解的

---

## 实践

下面来看一些题目，来巩固对原型链的理解

来看一道经典的面试题(其实考察是`this`指向问题)：

```javascript
var a = function() {
  this.b = 3;
};
var c = new a();
a.prototype.b = 9;
var b = 7;
a();

console.log(b);
console.log(c.b);
```

这一段代码运行的输出结果是这样的：

```javascript
3;
3;
```

为什么？来解读一下这段代码，首先声明了一个全局变量 a，它是一个`function`，然后再声明了一个全局变量 c，它是调用 a()这个方法构造出来的一个成员，当调用 a()这个方法的时候，执行`this.b = 3`，因为是`new`出来的，所以这里的`this`指向当前对象，也就是指向 a，`this.b = 3`，也就是在 a 中挂载了一个属性 b，它的值是 3，然后再把 a 这一整个对象赋值给 c，此时 c = a{b: 3}，再下来执行`a.prototype.b = 9`，即在 a 的原型链上挂载一个属性 b，它是 9，再下来声明了一个全局变量 b，值是 7，然后再执行 a()，执行`this.b = 3`，注意，在这里的情况下，`this`指向`window`，`this.b = 3`等于`window.b = 3`，全局变量 b 的值由 9 被覆盖为 3，`console.log(b)`其实就是`console.log(window.b)`，这里输出 3，继续往下，`console.log(c.b)`，c.b 就是对 c 中的成员变量取值，所以也输出 3

再来升华一下，如果在**严格模式**下执行这段代码，那么结果又会如何呢？

```javascript
'use strict';
var a = function() {
  this.b = 3;
};
var c = new a();
a.prototype.b = 9;
var b = 7;
a();

console.log(b);
console.log(c.b);

//输出结果为
//Uncaught TypeError: Cannot set property 'b' of undefined
```

这又是为什么呢？关键在于严格模式下`this`指向问题，在执行到 a()这个语句时报错了，执行 a()即执行`this.b = 3`，这里要注意在严格模式下，这里的 this 指向`undefined`，并不是指向`window`，给`undefined`的一个属性 b 赋值为 3，这里就报错了

再来看另一道题目:

```javascript
var F = function() {};
Object.prototype.a = function() {};
Function.prototype.b = function() {};

var f = new F();
```

请问 f 有属性 a 吗？那么属性 b 呢？如果没有，那么要怎么调用才能正确读取到？

来分析一下，f 的构造函数是 F()，那么`f.__proto__ === F.prototype`，`F.prototype.__proto__ === Object.prototype`，f 本身没有 a 这个属性，去上一层找，还是没有，再去上一层找，最终在`Object.prototype`中找到了属性 a，f 是有属性 a 的，同样的 f 本身没有属性 b，一层一层往上找，根本找不到，f 没有属性 b，要读到 b 这个属性，可以这样：F.b，因为 F 的构造函数是`Function`，F 中没有 b 这个属性，会去`Function.prototype`中找，可以找到 b 这个属性，所以 F.b 可以正确读取到 b 属性

---

## 结语

以上就是关于`JavaScript`中原型和原型链的相关知识，只有不断学习才能提升自己，如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[JS 中的原型和原型链](https://blog.csdn.net/qq_36996271/article/details/82527256?depth_1-utm_source=distribute.pc_relevant.none-task&utm_source=distribute.pc_relevant.none-task)
