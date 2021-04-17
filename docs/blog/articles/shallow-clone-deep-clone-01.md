# 深拷贝与浅拷贝

js 的深拷贝，浅拷贝问题在项目的开发过程中是频繁出现的。对于一个合格的前端开发者来说，对于深刻理解它们是必要的，并能合理使用深拷贝浅拷贝处理问题  

----

## 堆和栈

js 中的堆和栈都是存放临时数据的地方，声明了一些变量，这些变量就是存放在 js 的堆或者栈中  

**栈(stack)**是先进后出的一种数据结构，就像一个桶，后进去的先出来，它下面本来有的东西要等其他出来之后才能出来  

**堆(heap)**是在程序运行时，而不是在程序编译时，申请某个大小的内存空间，所以堆是**动态分配内存**的  

----

### 基本数据类型

js 的基本数据类型有 5 种(不考虑es6 `Symbol` )，分别是 `String`、`Number`、`Boolean`、`null`、`undefined`  

基本数据类型又被称为**值类型**，因为它们是**存放在栈内存中的，从栈当中直接存取变量的值**  

来看一个例子，有一行语句 `var a = 1;`，声明了一个变量 `a` 并给它赋值为 1，那么在这个过程中究竟发生了什么  

![aucedH.png](https://s1.ax1x.com/2020/07/30/aucedH.png)  

变量 `a` 的值是 1，是值类型，所以它被存放在栈内存中，在栈内存中存放了一个 name 为 `a`，value 为 1 的变量  

接着，又有一行语句 `var b = a;`，声明了一个变量 `b`，并把变量 `a` 的值赋值给变量 `b`  

![auRBlt.png](https://s1.ax1x.com/2020/07/30/auRBlt.png)  

**值类型复制时，会在栈中创建一个新变量，然后把值复制给新变量**  

又有一行语句 `a = 2;`，把变量 `a` 的值修改为 2  

![aufS8s.png](https://s1.ax1x.com/2020/07/30/aufS8s.png)  

直接在占内存中把变量 `a` 的值修改为 2，此时 `a = 2;b = 1`，语句 `a === b` 的返回值是 `false`，很明显，它们的值不相等  

**总结:值类型的变量存放在栈内存中，并且它们相互都是独立的，互不干扰**

----

### 引用数据类型

js 的引用数据类型是 `Object` 类型，其中还包括 `Array`、`Function` 等  

**引用类型存放在栈内存和堆内存中，栈内存中存放的是它的地址，堆内存中存放它的值，栈内存中的地址指向堆内存中的值**  

这样说可能有点绕，来看一个例子，`var obj = {a:1};`，声明了一个变量 `obj`，它的值是一个对象，这个过程又发生了什么  

![au5uxs.png](https://s1.ax1x.com/2020/07/30/au5uxs.png)  

变量 `obj` 的值是一个对象，所以它是引用类型，**它在栈内存中的值是一个地址(这里假设是0x0012ff7d)**，这个地址指向堆内存中的某一个位置，堆内存中存储的是这个变量真正的值，栈内存中存储的地址指向这个值  

`var obj1 = obj`，声明了一个变量 `obj1` 并把变量 `obj` 的值赋值给它  

![auo0UK.png](https://s1.ax1x.com/2020/07/30/auo0UK.png)  

**引用类型复制的是存储在栈中的地址指针，先在栈内存中创建一个新变量，再把地址指针赋值给这个变量，这个指针副本和原指针指向存储在堆中的同一个对象**  

由上图中可以看出，`obj1` 和 `obj` 存储的地址指针是同一个值，它们都指向了堆内存中的同一个地址  

`obj.a = 8`，把变量 `obj` 中的属性 `a` 改变为 8，继续看图  

![au7EOs.png](https://s1.ax1x.com/2020/07/30/au7EOs.png)  

`obj` 是对象是引用类型，它在栈内存中只存储地址，真正的值存储在堆内存中，所以修改属性 `a`的值实际上就是修改堆内存中的值  

修改过后可以发现，`obj` 和 `obj1` 在栈内存中存储的地址指针没有变化，只是堆内存中的值发生了变化，所以在修改过后，`obj = {a:8};obj1 = {a:8}`  

`var obj2 = {a:8}`，声明了一个变量 `obj2`，它是值是 `{a:8}`  

![aubsot.png](https://s1.ax1x.com/2020/07/30/aubsot.png)  

因为 `obj2` 是新声明的一个变量，它在栈内存中存储的值是另一个新的地址，这个地址指针指向了堆内存中的某一个地址，语句 `obj === obj1` 的返回值是 `true`，`obj === obj2` 的返回值是 `false`，因为**引用类型在比较值时，是比较栈内存中的地址**  

**总结:引用类型在栈内存中存储地址，在堆内存中存储真正的值，引用类型通过栈内存地址指针比较是否相等**

----

## 浅拷贝与深拷贝

**浅拷贝：**仅仅是复制了引用，也就是复制了栈内存中的地址指针，彼此之间的操作会相互影响  

**深拷贝：**在堆中重新分配了新的地址，地址不同，堆内存中的值相同，互不影响  

----

### 浅拷贝

```javascript
var obj = {
  value:1
};
var obj1 = obj;
obj.value = 666;
console.log(obj); // {value: 666}
console.log(obj1); // {value: 666}
```

在这个例子中，只改变了 `obj` 中的 `value` 属性，但是 `obj1` 中的 `value` 属性也跟着变了，这就是浅拷贝，在赋值的时候只是复制了引用的地址，也就是说 `obj` 和 `obj1` 指向的是同一个地址，他们都引用了堆内存中的同一个地址  

下面列举一些浅拷贝的方法:  

- **直接赋值**

上面例子已经有提到，这里不再赘述  

- **Object.assign()**  

其实 `Object.assign()` 既是深拷贝又是浅拷贝，要分情况，当对象属性为基本数据类型时是深拷贝，当对象属性为引用类型时是浅拷贝，下面展示浅拷贝的情况    

```javascript
var obj = {
  innerObj:{
    value:1
  }
}
var obj1 = Object.assign({},obj);
obj.innerObj.value = 8;
console.log(obj); // {innerObj: {value:8}}
console.log(obj1); // {innerObj: {value:8}}
```

- **解构赋值、展开运算符**

```javascript
var obj = {
  innerObj:{
    value:1
  }
}
var { innerObj } = obj;
obj.innerObj.value = 2;
console.log(obj.innerObj); // {value: 2}
console.log(innerObj); // {value: 2}
```

```javascript
var obj = {
  innerObj:{
    value:1
  }
}
var obj1 = {...obj};
obj.innerObj.value = 888;
console.log(obj); // {innerObj: {value:888}}
console.log(obj1); // {innerObj: {value:888}}
```

----

### 深拷贝

所谓深拷贝，通俗的说就是新值和原值互不影响，各自都是独立的，下面来看一些深拷贝的方法  

- **手动赋值**

```javascript
var obj = {
  a:1,
  b:2,
  c:3
}
var obj1 = {
  a:obj.a,
  b:obj.b,
  c:obj.c
}
obj.a = 100;
console.log(obj); // {a: 100, b: 2, c: 3}
console.log(obj1); // {a: 1, b: 2, c: 3}
```

这种方法比较笨，不够灵活，不建议使用  

- **JSON转换**

```javascript
var obj = {
  a:1,
  b:2,
  c:3
}
var obj1 = JSON.parse(JSON.stringify(obj));
obj.a = 100;
console.log(obj); // {a: 100, b: 2, c: 3}
console.log(obj1); // {a: 1, b: 2, c: 3}
```

这种方法算是最简单的深拷贝方法了，但是它也有弊端，**undefined、function、symbol 在转化中会被忽略**

- **递归**

```javascript
function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone');
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  })
  return targetObj;
}
```

这是一个递归的深拷贝函数，实现思路就是遍历对象，判断对象的属性值是否还是对象，如果还是那就递归。其实这并不是一个完美的深拷贝函数，还缺少一些边界条件的判断，建议使用 `lodash` 的 `_.cloneDeep` 方法  

----

## 一些需要注意的地方

### 函数的参数传递

```javascript
function add(num){
  return ++num;
};
var a = 1;
var result = add(a);
console.log(a); // 1
console.log(result); // 2
```

值类型的情况比较简单，所以这里只讨论引用类型  

```javascript
function setName(obj){
  obj.name = '李四';
};
var person = {name:'张三'};
setName(person);
console.log(person); // {name: "李四"}
```

很简单，在一个函数里面修改了该对象的属性  

```javascript
function setName(obj){
  obj.name = '李四';
  obj = {};
  obj.name = '王五';
};
var person = {name:'张三'};
setName(person);
console.log(person); // {name: "李四"}
```

下面这张图来揭开内部的执行机制:  

![aQ5i7t.png](https://s1.ax1x.com/2020/07/31/aQ5i7t.png)  

在 `person` 参数传入函数的时候，其实是在函数内部声明了一个临时变量 `obj`，并把参数 `person` 的值赋值给 `obj`，所以 `obj` 存储的地址指针和 `person` 指向同一个堆内存地址，因为它是复制而来的  

`obj.name = '李四';` 把堆内存中的值修改，`obj = {}`，这里要注意，变量 `obj` 被重新赋值了，所以 `obj` 会指向另外一个新地址，看下图:  

![aQIsZn.png](https://s1.ax1x.com/2020/07/31/aQIsZn.png)

`obj.name = '王五';` 修改 `obj` 的值，看下图:  

![aQotm9.png](https://s1.ax1x.com/2020/07/31/aQotm9.png)  

看到这里应该就恍然大悟了，在这个函数执行完毕后，临时变量 `obj` 会被**js垃圾回收机制**释放掉  

----

### 垃圾回收

**栈内存中变量一般在它的当前执行环境结束就会被销毁被垃圾回收机制回收， 而堆内存中的变量则不会，因为不确定其他的地方是不是还有一些对它的引用。 堆内存中的变量只有在所有对它的引用都结束的时候才会被回收**  

闭包中的变量并不保存中栈内存中，而是保存在堆内存中，这也就解释了函数调用之后之后为什么闭包还能引用到函数内的变量  

```javascript
function A() {
  var a = 1;
  function B() {
    console.log(a);
  }
  return B;
}
var res = A();
res(); // 1
```

函数 A 返回了一个函数 B，并且函数 B 中使用了函数 A 的变量，函数 B 就被称为闭包，函数 A 中的变量是存储在堆内存中的，所以函数 B 依旧能引用到函数 A 中的变量  

----

## 实践

来看一些面试题:  

**题目1:**

```javascript
var a = {n: 1};

var b = a;  

a.x = a = {n: 2};

console.log(a.x);  
console.log(b.x);
```

输出: `undefined` `{n: 2}`  

解析: `var a = {n: 1};var b = a;` 不多解释了，看下图:  

![alkxXQ.png](https://s1.ax1x.com/2020/07/31/alkxXQ.png)

`a.x = a = {n: 2};` 关键就在这句话，正常执行顺序应该是 `a = {n:2};a.x = a;`，这里`a.x` 中因为有 `.` 运算符，优先级比 `=` 运算符高，先执行 `a.x` 在 `a` 中声明了一个属性 `x`，等待赋值，执行 `a = {n:2};`，变量 `a` 被重新赋值，指向一个新的地址，看下图:  

![a1V3Dg.png](https://s1.ax1x.com/2020/07/31/a1V3Dg.png)

接下来执行 `a.x = a;`，这里也有一个坑点要注意，虽然执行到这里的时候 `a` 的地址已经改变了，但是上面已经说过，`.` 运算符优先级比 `=` 运算符高，`a.x` 在 `a` 的地址没改变之前就声明好了，所以这里 `a.x` 中变量 `a` 使用的是旧地址，让变量 `a` 中属性 `x` 的值指向 `a` 的地址，继续看下图:  

![a1mJVe.png](https://s1.ax1x.com/2020/07/31/a1mJVe.png)

这里 `x` 的值实际上是 `{n:2}`，为了体现地址相同，我在图中写成了指针地址，如果不理解可以看下图:  

![a1mc5j.png](https://s1.ax1x.com/2020/07/31/a1mc5j.png)

这时候执行完毕后的栈内存和堆内存的情况，所以答案就很明显了，`a` 中没有 `x` 属性，所以 `a.x` 输出 `undefined`，`b.x` 输出 `{n:2}`  

**题目2:**

```javascript
var a = {"x": 1};
var b = a;
a.x = 2;
console.log(b.x);


a = {"x": 3};
console.log(b.x);
a.x = 4;
console.log(b.x);
```

输出: `2` `2` `2`  

解析:`var a = {"x": 1};var b = a;`，此时 `a` 和 `b` 指向的是同一个地址，`a.x = 2;` 执行完之后 `b.x` 也等于 2，`a = {"x": 3};` 重新赋值，重新分配新的内存地址，此时 `a` 和 `b` 指向不同地址，所以他们互不影响，所以都输出 2  

----

## 结束语

以上就是关于值类型和引用类型，以及深拷贝浅拷贝的内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[聊聊深拷贝浅拷贝](https://juejin.im/post/5f1f5c41f265da22ab2d7db6)  
[JS中的栈内存堆内存](https://www.jianshu.com/p/3d6b82f5242c)  
[JS基础-连续赋值](https://segmentfault.com/a/1190000008475665)




