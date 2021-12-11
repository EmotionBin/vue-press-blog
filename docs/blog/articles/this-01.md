# 令人头疼的 this

`this` 指向问题真的很令人头大，本文就来讨论一下关于 `this` 指向的问题

---

## 绑定规则

### 默认绑定

```javascript
var a = 1;

function foo() {
  console.log(this.a);
}

function bar() {
  'use strict';
  console.log(this.a);
}

foo(); //1，非严格模式下，this 指向全局对象 Window，这里相当于 Window.a，输出1

bar(); // Uncaught TypeError: Cannot read property 'a' of undefined，严格模式下，this 会绑定到 undefined，尝试从 undefined 读取属性会报错
```

默认绑定的规则为：**非严格模式下，this 指向全局对象，严格模式下，this 会绑定到 undefined**

---

### 隐式绑定

**如果函数在调用位置有上下文对象，this 就会隐式地绑定到这个对象上**

```javascript
var a = 1;

function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo, // <-- foo 的调用位置
};

obj.foo(); // 2，foo 在调用位置有上下文对象 obj，this 会隐式地绑定到 obj，this.a 相当于 obj.a
```

调用的时候是通过 `obj.foo()` 调用的，所以 `foo()` 中的 `this` 指向对象 `obj`

```javascript
var a = 1;

function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo,
};

var bar = obj.foo;

bar(); // 1，赋值并不会改变引用本身，使用函数别名调用时，bar 虽然是 obj.foo 的一个引用，但是实际上引用的还是 foo 函数本身，所以这里隐式绑定并没有生效， this 应用的是默认绑定
```

这里把 `foo` 函数赋值给了另外一个变量 `bar`，`bar` 虽然是 `obj.foo` 的一个引用，但是实际上引用的还是 `foo` 函数本身，是一个**独立的函数**，所以这里的 `this` 是默认绑定

**一般情况下，谁点出来的就指向谁，this 永远指向最后调用它的那个对象**

---

### 显示绑定

`call`，`apply`，`bind` 方法可以改变 `this` 指向，调用这些方法的时候就是显示绑定

---

#### call

引用 MDN 的解释:

> call() 方法使用一个指定的 this 值和单独给出的一个或多个参数来调用一个函数
> function.call(thisArg, arg1, arg2, ...)

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 0,
};
var obj1 = {
  a: 1,
};

foo.call(obj); // 0
foo.call(obj1); // 1
```

`foo.call(obj)` 显示的把 `this` 绑定到 `obj`，所以调用的时候 `this` 指向 `obj`，`foo.call(obj1)`同理

---

#### apply

引用 MDN 的解释:

> apply() 方法调用一个具有给定 this 值的函数，以及作为一个数组（或类似数组对象）提供的参数
> func.apply(thisArg, [argsArray])

```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 0,
};
var obj1 = {
  a: 1,
};

foo.apply(obj); // 0
foo.apply(obj1); // 1
```

原理同上面的 `call`，`apply` 和 `call` 的第一个参数都是想要 `this` 绑定的对象，他们的区别就是后面的传参方式不同

---

#### bind

引用 MDN 的解释:

> bind() 方法创建一个新的函数，在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用
> function.bind(thisArg[, arg1[, arg2[, ...]]])

```javascript
function foo() {
  console.log(this.a);
}

var obj = { a: 2 };

var a = 1;

var bar = foo.bind(obj);

bar(); // 2，bar 是通过 bind 返回后的一个硬绑定函数，其内部应用了显式绑定
```

---

#### 小结

使用 `call`，`apply`，`call` 方法可以手动显式的改变 `this` 指向，但是有一点需要注意，**将 null，undefined 作为第一个参数传入 call，apply，bind ，调用时会被忽略，实际应用的是默认绑定规则，即严格模式下，this 为 undefined，非严格模式下为全局对象**

---

### new 绑定

#### new()发生了什么

`new`的时候到底发生了什么，下面模拟 `new` 方法的实现原理:

```javascript
function _new() {
  let obj = new Object(); // 1. 创建一个空对象
  let Constructor = [].shift.call(arguments); // 2. 获得构造函数
  obj.__proto__ = Constructor.prototype; // 3. 链接到原型
  let result = Constructor.apply(obj, arguments); // 4. 绑定 this，执行构造函数
  return typeof result === 'object' ? result : obj; // 5. 返回 new 出来的对象
}
```

1. 创建一个新对象
2. 把这个新对象的 `__proto__` 属性指向原函数的 `prototype` 属性(即继承原函数的原型)
3. 将这个新对象绑定到此函数的 `this` 上
4. 如果无返回值或者返回一个非对象值，则将新对象返回；如果返回值是一个对象的话那么直接返回该对象

---

#### 使用 new()调用构造方法

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
let person = new Person('小明', 18);
console.log(person); // Person {name: "小明", age: 18}
```

用 `new` 调用构造函数创建实例时，`this` 会绑定到这个实例上，上面代码中 `person` 是调用构造函数 `Person`创建出来的，所以构造函数中的 `this` 指向实例 `person`

下面有一种情况需要注意，**当构造函数有返回值的时候，如果返回值是一个对象的话那么直接返回该对象**，直接看代码：

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  return {
    sex: 'male',
  };
}
let person = new Person('小明', 18);
console.log(person); // {sex: "male"}
```

在这种情况下，`this` 的绑定会失效，因为原构造函数返回了一个对象，所以这个 `person` 实例指向这个对象。结合 `new` 的原理就可以知道为什么了，因为这时候确实是创建了一个新的对象，但是这个对象没有被返回罢了，返回的是原构造函数返回的对象

---

## 改变 this 指向

先来看一个例子：

```javascript
var name = 'windowsName';

var a = {
  name: 'Cherry',

  func1: function() {
    console.log(this.name);
  },

  func2: function() {
    setTimeout(function() {
      this.func1();
    }, 100);
  },
};

a.func2(); // Uncaught TypeError: this.func1 is not a function
```

在这个例子中，直接报错了，因为最后调用 `setTimeout` 的对象是 `window`，但是在 `window` 中并没有 `func1` 函数

### 使用箭头函数

箭头函数没有自己的 `this`，`arguments`，**箭头函数的 this 始终指向函数定义时的 this，而非执行时，根据最外层的词法作用域来确定 this，箭头函数的 this 就是它外面第一个不是箭头函数的函数的 this**

```javascript
var name = 'windowsName';

var a = {
  name: 'Cherry',

  func1: function() {
    console.log(this.name);
  },

  func2: function() {
    setTimeout(() => {
      this.func1();
    }, 100);
  },
};

a.func2(); // Cherry
```

这里把 `setTimeout` 中的代码改成了箭头函数形式，虽然最后调用它的还是 `window`，但是箭头函数不会绑定 `this` 到 `window` 上，这里的 `this` 是它外面第一个不是箭头函数的函数的 `this`，也就是说这里的 `this` 指向和 `func2` 中的 `this` 指向是一致的，最后会输出 `Cherry`

**注意，由于箭头函数没有自己的 this 指针，通过 call()，apply()，bind() 方法调用一个箭头函数时，只能传递参数（不能绑定 this），他们的第一个参数会被忽略**，看下面的代码

```javascript
var name = 'windowsName';

var a = {
  name: 'Cherry',

  func1: function() {
    console.log(this.name);
  },

  func2: function() {
    setTimeout(() => {
      this.func1();
    }, 100);
  },

  func3: function() {
    setTimeout(() => {
      var f = () => console.log(this.name);
      var obj = {
        name: 'test',
      };
      f.call(obj);
    }, 100);
  },
};

a.func2(); // Cherry
a.func3(); // Cherry
```

虽然在 `func3` 中调用了 `call` 进行显示绑定，但是由于箭头函数不绑定 `this`，所以这里的 `this` 会被忽略

---

### 把 this 保存下来

先将调用这个函数的对象保存在变量 `_this` 中，然后在函数中都使用这个 `_this`，这样 `_this` 就不会改变了

```javascript
var name = 'windowsName';

var a = {
  name: 'Cherry',

  func1: function() {
    console.log(this.name);
  },

  func2: function() {
    var _this = this;
    setTimeout(function() {
      _this.func1();
    }, 100);
  },
};

a.func2(); // Cherry
```

---

### 使用 apply、call、bind

可以查看上文对 `apply`、`call`、`bind` 的讲解，这里不再赘述

---

## this 绑定的优先级

new 绑定 > 显示绑定 > 隐式绑定 > 默认绑定

---

## 总结

1. 如果是通过 `new` 构造调用生成的实例对象，那么 `this` 绑定到新创建的对象上

2. 如果函数是使用 `call`,`apply`,`bind` 来调用的，那么进行显示绑定，`this` 绑定到 `call`,`apply`,`bind` 第一个参数的对象上，箭头函数除外，因为箭头函数不绑定 `this`

3. 如果函数是在某个上下文对象下被调用，进行隐式绑定，`this` 永远指向最后调用它的那个对象

4. 如果都不是，即使用默认绑定，非严格模式下 `this` 绑定到 `window`，严格模式下是 `undefined`

5. **匿名函数的 this 永远指向 window**

解释一下第 5 点，因为**this 永远指向最后调用它的那个对象**，那么我们就来找最后调用匿名函数的对象，这就很尴尬了，因为匿名函数没有函数名，所以是没有办法被其他对象调用的，所以说**匿名函数的 this 永远指向 window**

---

## 实践

下面来看一些面试题目进行实践，加强理解

**题目 1:**

```javascript
function test(arg) {
  this.x = arg;
  return this;
}

var x = test(5);
var y = test(6);
console.log(x.x);
console.log(y.x);
```

输出: `undefined` 6，`var x = test(5)` 调用了 `test` 函数，这里的 `this` 是默认绑定的 `window`，所以此时 `x = window`，`var y = test(6)` 再次调用 `test` 函数，这里的 `this` 还是 `window`，此时 `x = 6, y = window`，`console.log(x.x)` 即 `console.log(6.x)`，输出 `undefined`，`console.log(y.x)` 即 `console.log(window.x)`，输出 6

**题目 2:**

```javascript
var name = 'The Window';
var obj = {
  name: 'My obj',
  getName: function() {
    return function() {
      console.log(this.name);
    };
  },
};

obj.getName()();
```

输出 `The Window`，调用函数的时候又返回了一个函数，这个函数是匿名函数，`this` 绑定的是 `window`对象

**题目 3:**

```javascript
var point = {
  x: 0,
  y: 0,
  moveTo: function(x, y) {
    this.y = y;
    var moveX = function(x) {
      this.x = x;
    };
    moveX(x);
  },
};
point.moveTo(1, 1);
console.log(point.x);
console.log(point.y);
```

输出:0 1，调用 `point.moveTo(1, 1)` 时，在 `moveTo` 函数中 `this` 指向 `point` 对象，`this.y = y` 即 `point.y = 1`，之后定义一个函数并调用，调用函数的时候 `this` 是默认绑定，所以此时 `this` 指向 `window`，`this.x = x` 即 `window.x = 1`

**题目 4:**

```javascript
function foo() {
  getName = function() {
    console.log(1);
  };
  return this;
}
foo.getName = function() {
  console.log(2);
};
foo.prototype.getName = function() {
  console.log(3);
};
var getName = function() {
  console.log(4);
};
function getName() {
  console.log(5);
}

foo.getName();
getName();
foo().getName();
getName();
new foo.getName();
new foo().getName();
new new foo().getName();
```

输出:2 4 1 1 2 3 3

解析:

首先声明了一个函数 `foo`，然后给函数 `foo` 上挂载了 `getName` 属性，它也是一个函数，再给 `foo` 函数的原型链上挂载 `getName` 属性，它也是一个函数，定义一个全局变量 `getName`，它的值是一个函数，定义了全局函数 `getName`，下面来看详细解释

1. `foo.getName ()`，直接调用 `foo` 函数上的 `getName` 方法，输出 2
2. `getName ()` 调用全局方法，这里要注意这个 `getName` 定义了两次，这里还需要结合**函数提升和变量提升**，在声明过程中的最后两行代码等价于下面的代码:

```javascript
function getName() {
  console.log(5);
}
var getName;
getName = function() {
  console.log(4);
};
```

**函数提升优先级比变量提升要高，且不会被变量声明覆盖，但是会被变量赋值覆盖**，所以这里输出 4

3. `foo().getName ()`，这里先调用 `foo` 函数，给 `getName` 赋值成一个函数，注意，**函数中的赋值如果没有加上 var，则赋值会被提升到全局**，这里没有 `var`，所以等价于 `window.getName = function () { console.log (1); };`，执行完之后返回 `this`，这里的 `this` 是默认绑定，就是 `window`，接下来就是调用 `window.getName ()`，输出 1
4. `getName ()`，同上也输出 1
5. `new foo.getName ()`，这里是 `new` 构造调用，调用了 `foo` 的 `getName` 构造方法，输出 2
6. `new foo().getName ()`，这里等价于 `var obj = new foo();obj.getName ()`，`obj` 中没有 `getName` 这个方法，因为`obj` 是 `foo` 函数的一个实例，所以会去原型链上一层一层往上找，即 `obj.getName ()` 等价于 `foo.prototype.getName()`，输出 3
7. `new new foo().getName ()`，等价于 `var obj = new foo();new obj.getName ()`，结合上面的例子来看，这里也输出 3

---

## 结束语

以上就是对 `this` 的理解，如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[可能是最好的 this 解析了](https://juejin.im/post/5edd6d816fb9a047d3711550)  
[this、apply、call、bind](https://juejin.im/post/59bfe84351882531b730bac2)  
[深入理解 js this 绑定](https://segmentfault.com/a/1190000011194676)
