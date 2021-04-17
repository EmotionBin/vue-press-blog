# 浅谈Promise

`Promise` 是异步编程的一种解决方案，ES6 将其写进了语言标准，统一了用法，原生提供了 `Promise` 对象。`Promise` 的出现对于异步编程有了很大的便利，掌握好 `Promise` 将会有极大的帮助  

----

## Promise是什么

所谓 `Promise`，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，`Promise` 是一个对象，从它可以获取异步操作的消息。`Promise` 提供统一的 API，各种异步操作都可以用同样的方法进行处理  

`Promise` 对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和 `rejected`（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。由此可以得出一个结论，**Promise对象的状态不受外界影响**  

`Promise`对象的状态改变，只有两种可能：

1. 从 `pending` 变为 `fulfilled(resolved)`  
2. 从 `pending` 变为 `rejected`  

只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果。**一旦Promise状态改变，就不会再变，任何时候都可以得到这个结果**  

----

## Promise基本用法

```javascript
const promise = new Promise((resolve, reject) => {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

`Promise` 构造函数接受一个函数作为参数，该函数的两个参数分别是 `resolve` 和 `reject`

`resolve` 函数的作用是，将 `Promise` 对象的状态从“未完成”变为“成功”（即从 `pending` 变为 `resolved`），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去； `reject` 函数的作用是，将 `Promise` 对象的状态从“未完成”变为“失败”（即从 `pending` 变为 `rejected`），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去  

`Promise` 实例生成以后，可以用 `then` 方法分别指定 `resolved` 状态和 `rejected` 状态的回调函数  

```javascript
promise.then(function(value) {
  // success
  console.log(value);
}, function(error) {
  // failure
  console.log(error);
});
```

`then` 方法可以接受两个回调函数作为参数。第一个回调函数是 `Promise` 对象的状态变为 `resolved` 时调用，第二个回调函数是 `Promise` 对象的状态变为 `rejected` 时调用。其中，第二个函数是可选的，不一定要提供。这两个函数都接受 `Promise` 对象传出的值作为参数  

**注意，Promise 新建后就会立即执行，在Promise中的函数是同步执行的，它的异步体现在then方法中**  

```javascript
let promise = new Promise(function(resolve, reject) {
  console.log('Promise');
  resolve();
});

promise.then(function() {
  console.log('resolved.');
});

console.log('Hi!');

// Promise
// Hi!
// resolved
```

上面的代码中，一旦创建了 `Promise` 对象就会立即执行它里面的内容，输出`Promise`，因为 `then` 方法是异步的，是微任务，要等到本轮事件循环中的所有同步任务执行完毕后才会执行，所以输出 `Hi!` 之后再输出 `resolved`  

**注意，调用resolve或reject并不会终结 Promise 的参数函数的执行**  

```javascript
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});

// 2
// 1
```

对于上面的代码， 虽然 `console.log` 在 `resolve` 的后面，但是它依然会执行，先输出2再输出1，原理同上。但是不建议使用这种写法，因为一般来说，调用 `resolve` 或 `reject` 以后， `Promise` 的使命就完成了，后继操作应该放到 `then` 方法里面，而不应该直接写在 `resolve` 或 `reject` 的后面。所以，最好在它们前面加上 `return` 语句，这样就不会有意外  

```javascript
new Promise((resolve, reject) => {
  return resolve(1);
  // 后面的语句不会执行
  console.log(2);
});
```

----

## Promise各种常用API的使用

### Promise.prototype.then()

`Promise` 的 `then` 方法是定义在原型对象 `Promise.prototype` 上的， `then` 方法的第一个参数是 `resolved` 状态的回调函数，第二个参数（可选）是 `rejected` 状态的回调函数  

`then` 方法返回的是一个新的 `Promise` 实例（注意，不是原来那个 `Promise` 实例）。因此可以采用链式写法，即 `then` 方法后面再调用另一个 `then` 方法  

```javascript
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // ...
});
```

采用链式的 `then` ，可以指定一组按照次序调用的回调函数，这对异步嵌套是很友好的，有效的解决了回调地狱的问题  

```javascript
getData('/test').then(res => {
  console.log('res: ', res);
  return getData(res.a);
}).then(res1 => {
  console.log('res1: ', res1);
  return getData(res1.b);
}).then(
  res2 => console.log('res2: ', res2),
  err => console.log('err: ', err)
);
```

----

### Promise.prototype.catch()

`Promise.prototype.catch()` 方法用于指定发生错误时的回调函数  

```javascript
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // 处理 getJSON 和 前一个回调函数运行时发生的错误
  console.log('发生错误！', error);
});
```

上面代码中， `getJSON()` 方法返回一个 `Promise` 对象，如果该对象状态变为 `resolved` ，则会调用 `then()` 方法指定的回调函数；如果异步操作抛出错误，状态就会变为 `rejected`，就会调用 `catch()` 方法指定的回调函数，处理这个错误。另外，`then()` 方法指定的回调函数，如果运行中抛出错误，也会被 `catch()` 方法捕获  

其实 `Promise.prototype.catch()` 方法是 `.then(null, rejection)` 或 `.then(undefined, rejection)` 的别名  

```javascript
p.then((val) => console.log('fulfilled:', val))
  .catch((err) => console.log('rejected', err));

// 等同于
p.then((val) => console.log('fulfilled:', val))
  .then(null, (err) => console.log("rejected:", err));
```

`Promise` 中 `reject()` 方法的作用，等同于抛出错误  

```javascript
const promise = new Promise(function(resolve, reject) {
  reject(new Error('test'));
});
promise.catch(function(error) {
  console.log(error);
});
```

如果 `Promise` 状态已经变成 `resolved`，再抛出错误是无效的，不会被捕获，等于没有抛出。因为 `Promise` 的状态一旦改变，就永久保持该状态，不会再变了  

```javascript
const promise = new Promise(function(resolve, reject) {
  resolve('ok');
  throw new Error('test');
});
promise
  .then(function(value) { console.log(value) })
  .catch(function(error) { console.log(error) });
// ok
```

`Promise` 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个 `catch` 语句捕获  

```javascript
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // 处理前面三个Promise产生的错误
});
```

一般来说，不要在 `then()` 方法里面定义 `reject` 状态的回调函数（即 `then` 的第二个参数），总是使用 `catch` 方法  

```javascript
// bad
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });

// good
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
```

上面代码中，第二种写法要好于第一种写法，理由是第二种写法可以捕获前面then方法执行中的错误，因此，建议总是使用 `catch()` 方法，而不使用 `then()` 方法的第二个参数  

如果没有使用 `catch()` 方法指定错误处理的回调函数，`Promise` 对象抛出的错误不会传递到外层代码，即不会有任何反应  

```javascript
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  console.log('everything is great');
});

setTimeout(() => { console.log(123) }, 2000);
// Uncaught (in promise) ReferenceError: x is not defined
// 123
```

上面代码中，`someAsyncThing()` 函数产生的 `Promise` 对象，内部有语法错误。浏览器运行到这一行，会打印出错误提示 `ReferenceError: x is not defined` ，但是不会退出进程、终止脚本执行，2 秒之后还是会输出123。这就是说， **Promise 内部的错误不会影响到 Promise 外部的代码**，通俗的说法就是“ `Promise` 会吃掉错误”  

----

### Promise.prototype.finally()

`finally()` 方法用于指定不管 `Promise` 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的  

下面是一个例子，服务器使用 `Promise` 处理请求，然后使用 `finally` 方法关掉服务器  

```javascript
server.listen(port)
  .then(function () {
    // ...
  })
  .finally(server.stop);
```

`finally` 方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 `Promise` 状态到底是 `fulfilled` 还是 `rejected`。这表明，`finally` 方法里面的操作，应该是与状态无关的，不依赖于 `Promise` 的执行结果  

其实 `finally` 本质上是 `then` 方法的特例  

```javascript
promise
.finally(() => {
  // 语句
});

// 等同于
promise
.then(
  result => {
    // 语句
    return result;
  },
  error => {
    // 语句
    throw error;
  }
);
```

上面代码中，如果不使用 `finally` 方法，同样的语句需要为成功和失败两种情况各写一次。有了 `finally` 方法，则只需要写一次  

它的实现也很简单，下面来手写一个 `finally` 方法  

```javascript
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
```

----

### Promise.all()

`Promise.all()` 方法用于将多个 `Promise` 实例，包装成一个新的 `Promise` 实例  

```javascript
const p = Promise.all([p1, p2, p3]);
```

上面代码中，`Promise.all()` 方法接受一个数组作为参数，`p1`、`p2`、`p3`都是 `Promise` 实例，如果不是，就会先调用 `Promise.resolve` 方法，将参数转为 `Promise` 实例，再进一步处理。另外，`Promise.all()` 方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 `Promise` 实例  

`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况:  

1. 只有`p1`、`p2`、`p3`的状态都变成 `fulfilled`，`p` 的状态才会变成 `fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数  
2. 只要`p1`、`p2`、`p3`之中有一个被 `rejected`，`p`的状态就变成 `rejected` ，此时第一个被 `reject` 的实例的返回值，会传递给`p`的回调函数  

下面是一个具体的例子  

```javascript
// 生成一个Promise对象的数组
const promises = [2, 3, 5, 7, 11, 13].map(function (id) {
  return getJSON('/post/' + id + ".json");
});

Promise.all(promises).then(function (posts) {
  // ...
}).catch(function(reason){
  // ...
});
```

上面代码中，`promises` 是包含 6 个 `Promise` 实例的数组，只有这 6 个实例的状态都变成 `fulfilled` ，或者其中有一个变为 `rejected`，才会调用 `Promise.all` 方法后面的回调函数  

**注意，如果作为参数的 Promise 实例，自己定义了catch方法，那么它一旦被rejected，并不会触发Promise.all()的catch方法**  

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: 报错了]
```

上面代码中，`p1`会 `resolved`，`p2`首先会 `rejected`，但是`p2`有自己的 `catch` 方法，该方法返回的是一个新的 `Promise` 实例，`p2`指向的实际上是这个实例。该实例执行完 `catch` 方法后，也会变成 `resolved`，导致 `Promise.all()` 方法参数里面的两个实例都会 `resolved`，因此会调用 `then` 方法指定的回调函数，而不会调用 `catch` 方法指定的回调函数  

如果`p2`没有自己的 `catch` 方法，就会调用 `Promise.all()` 的 `catch` 方法  

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// Error: 报错了
```

----

### Promise.race()

`Promise.race()` 方法同样是将多个 `Promise` 实例，包装成一个新的 `Promise` 实例  

```javascript
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的 `Promise` 实例的返回值，就传递给`p`的回调函数  

`Promise.race()` 方法的参数与 `Promise.all()` 方法一样，如果不是 `Promise` 实例，就会先调用 `Promise.resolve()` 方法，将参数转为 `Promise` 实例，再进一步处理  

下面是一个例子，如果指定时间内没有获得结果，就将 `Promise` 的状态变为 `reject`，否则变为`resolve`  

```javascript
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(console.log)
.catch(console.error);
```

----

## Promise的注意事项

1. Promise 的状态不受外界影响，只有异步操作的结果，可以决定当前是哪一种状态
2. Promise 状态的不可逆性，一旦状态改变，就不会再变，任何时候都可以得到这个结果
3. 无法取消 Promise，一旦新建它就会立即执行，无法中途取消
4. 错误需要通过回调函数捕获，如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部
5. 当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）

----

## 实践

### 一些面试题

**题目1:**  

```javascript
Promise.resolve()
  .then(() => {
    return new Error('error!!!')
  })
  .then((res) => {
    console.log('then: ', res)
  })
  .catch((err) => {
    console.log('catch: ', err)
  })
```

运行结果：  

```javascript
then: Error: error!!!
    at Promise.resolve.then (...)
    at ...
```

`.then` 或者 `.catch` 中 `return` 一个 `Error` 对象并不会抛出错误，所以不会被后续的 `.catch` 捕获，需要改成其中一种：  

```javascript
return Promise.reject(new Error('error!!!'))
throw new Error('error!!!')
```

因为返回任意一个非 `promise` 的值都会被包裹成 `promise` 对象，即 `return new Error('error!!!')` 等价于 `return Promise.resolve(new Error('error!!!'))`  

**题目2:**  

```javascript
var promise = new Promise(function(resolve, reject){
  setTimeout(function() {
    resolve(1);
  }, 3000)
})

// 下面三种有何不同
// 1
promise.then(() => {
  return Promise.resolve(2);
}).then((n) => {
  console.log(n)
});

// 2
promise.then(() => {
  return 2
}).then((n) => {
  console.log(n)
});

// 3
promise.then(2).then((n) => {
  console.log(n)
});
```

1.输出2。`Promise.resolve(2)` 返回了一个新的 `Promise`对象并把参数传入 `then`  
2.输出2。这里的 `return 2` 会自动被包裹成 `Promise`对象，`return 2` 等价于 `return Promise.resolve(2)`  
3.输出1。`then` 和 `catch` 期望接收函数做参数，如果非函数就会发生 `Promise` 穿透现象，打印的是上一个 `Promise` 的返回  

**题目3:**  

```javascript
let a;
const b = new Promise((resolve, reject) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
}).then(() => {
  console.log('promise3');
}).then(() => {
  console.log('promise4');
});

a = new Promise(async (resolve, reject) => {
  console.log(a);
  await b;
  console.log(a);
  console.log('after1');
  await a
  resolve(true);
  console.log('after2');
});

console.log('end');
```

输出结果：  

```javascript
promise1
undefined
end
promise2
promise3
promise4
Promise {<pending>}
after1
```

1.`Promise`会立即执行，输出 `promise1`，调用 `resolve()` 后把后面的 `then` 方法都注册成微任务，会在下一个事件循环进行  
2.`b` 中的同步任务已经执行完毕，现在来到了 `a`，立即执行 `Promise`内的方法 `console.log(a)`,此时 `a` 还没有被赋值，因为 `new Promise`这个过程还没有执行完，所以 `a` 是 `undefined`  
3.`await b` 会把它后面的代码注册成微任务，此时输出同步任务中的 `end`，同步任务执行完毕后，开始执行微任务，依次输出 `promise2`,`promise3`,`promise4`  
4.这里有点坑，要转一下弯，此时执行到 `await b` 后面的 `console.log(a)` ，`Promise` 中的函数是同步的，因为当前事件循环中的同步任务已经执行完毕了，所以 `new Promise` 这个过程已经执行完了，`a` 已经被赋值为一个 `Promise` 对象，但是它的状态是 `pending`，坑就坑在这里  
5.这里也很坑。接着输出 `after1`，后面的 `await a` 真的是个奇怪的操作，其实这里的 `await a` 后面的代码并不会执行，因为 `a` 是一个 `Promise`， 必须要等到 `a` 的状态从 `pending` 到 `fullfilled` 才会继续往下执行，`a` 的状态一直得不到更改，所以无法执行下面的代码，坑在这里，特别恶心，只要在 `await a` 上面加一行 `resolve()` 就能让后面的代码执行  

----

### 可取消的Promise

`Promise` 有一个缺陷就是无法得知执行到了哪个地步，也无法取消，只能被动的等 `resolve` 或者 `reject` 执行或者抛错。要想实现可手动取消的 `Promise` ，思路就是外部再包裹一层 `Promise`，并提供 `abort` 方法， 用来 `reject` 内部 `Promise`  

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(123);
  }, 10000);
});

function wrap(p) {
  let resol = null;
  let abort = null;

  let p1 = new Promise((resolve, reject) => {
    resol = resolve;
    abort = reject;
  });

  p1.abort = abort;
  p.then(resol, abort);

  return p1;
}

let newPromise = wrap(promise);

newPromise.then(res => console.log(res))
newPromise.catch(err => console.log(err))

setTimeout(() => {
    newPromise.abort('手动取消Promise')
},2000)

//两秒后输出
//手动取消Promise
```

原理就是现在有两个 `Promise`对象，一个是在外面声明的 `promise`，一个是在函数里面声明的 `p1`。假设我们不手动取消，10秒后，外面的 `promise` 状态变为 `resolved`，由函数内部的 `p.then(resol, abort)` 可知，调用`p1` 中的 `resolve`，此时 `p1`状态也变为 `resolved`；若我们手动取消，调用 `newPromise.abort()` 其实也就是调用了 `p1.abort()`，也就是把 `p1` 的状态变为 `rejected`，本例中 `promise` 的状态在10秒后依然会变为 `resolved`，但是它并没有定义 `then`，就算被 `resolved` 也不知道接下来要执行什么，这就是取消的原理  

----

### 顺序输出Promise

```javascript
//实现mergePromise函数，把传进去的数组顺序先后执行，
//并且把返回的数据先后放到数组data中
const timeout = ms => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, ms);
});

const ajax1 = () => timeout(2000).then(() => {
    console.log('1');
    return 1;
});

const ajax2 = () => timeout(1000).then(() => {
    console.log('2');
    return 2;
});

const ajax3 = () => timeout(2000).then(() => {
    console.log('3');
    return 3;
});

function mergePromise(ajaxArray) {
    //todo 补全函数
}

mergePromise([ajax1, ajax2, ajax3]).then(data => {
    console.log('done');
    console.log(data); // data 为 [1, 2, 3]
});

// 分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]
```

补全后的函数如下：  

```javascript
function mergePromise(ajaxArray) {
  let p = Promise.resolve();
  let arr = [];
  ajaxArray.forEach(promise => {
    p = p.then(promise).then((data) => {
        arr.push(data);
        return arr;
    });
  });
  return p;
}
```

实现思路就是用 `Promise.resolve` 将所有 `promise` 串成一个任务队列。开始就声明了一个状态为 `resolved` 的 `Promise`对象`p`，遍历传入的函数数组，`p.then(promise)` 利用状态为 `resolved` 的 `p` 调用 `then` 方法执行数组中每一个函数，数组中的函数返回的是 `Promise` 对象，待它的状态变为 `resolved` 之后，在调用 `then` 方法，将数据拿到并 `push` 进 `arr` 数组保存，再将 `arr` 数组返回，因为这里是在 `then` 方法中返回的数组，会自动被包裹成 `Promise` 对象，一直重复这个过程直到遍历完数组所有成员.....这时候 `p` 是一个状态为 `resolved` 的 `Promise` 对象，数据是一个依次保存着传入的各个函数的 `resolve` 值的数组，在将 `p` 返回即可  

----

### 关于Promise嵌套执行顺序问题

```javascript
Promise.resolve().then(function F1() {
    console.log('promise1')
    Promise.resolve().then(function F4() {
        console.log('promise2');
        Promise.resolve().then(function F5() {
            console.log('promise4');
        }).then(function F6() {
            console.log('promise?');
        })
    }).then(function F7() {
        console.log('promise5');
    })
}).then(function F2() {
    console.log('promise3');
}).then(function F3() {
    console.log('promise6');
});
```

输出结果：  

```javascript
promise1
promise2
promise3
promise4
promise5
promise6
promise?
```

执行的过程图解：  

![UKr5rV.png](https://s1.ax1x.com/2020/07/10/UKr5rV.png)

分析：  

1. 最开始代码执行，遇到 `Promise`，直接执行，将回调函数 `F1` 扔进了 `Micro Task` 中。执行栈为空，开始执行 `Micro Task` 中的代码，为第一个快照  

2. 执行函数 `F1`，打印出 `Promise1`，执行 `Promise.resolve()`，将函数 `F4` 扔进了 `Micro Task` 中；此时状态已更改为 `resolve`，将 `then` 中的函数 `F2` 扔进 `Micro Task`，为第二个快照  

3. (1)执行函数 `F4` ，打印出 `promise2`，执行 `Promise.resolve()`，将函数 `F5` 扔进了 `Micro Task` 中；`F4` 执行完毕，状态更改，将函数 `F7` 扔进 `Micro Task` 中  
(2)执行函数 `F2`，打印出 `promise3`，状态更改，将函数 `F3` 扔进了扔进了 `Micro Task` 中，为第三个快照  

4. (1)执行函数 `F5`，打印出 `promise4`， 状态更改，将函数 `F6` 扔进了 `Micro Task` 中  
(2)执行函数 `F7`，打印出 `promise5`  
(3)执行函数 `F3`，打印出 `promise6`，为第四个快照  

5. 执行函数 `F3`，打印出 `promise?`，结束  

**小结:执行完当前 promise，会把紧挨着的 then 放入 Micro Task 队尾，链后面的 then 暂不处理（每一个 then 返回一个新的 promise，第二个 then 是第一个 then 返回的 promise 的 then）**  

----

### 手写简易Promise

这里不考虑异常情况，实现一个可异步链式调用的简易 `Promise`  

```javascript
function MyPromise(fn) {
  this.cbs = [];

  const resolve = (value) => {
    setTimeout(() => {
      this.data = value;
      this.cbs.forEach((cb) => cb(value));
    });
  }

  fn(resolve.bind(this));
}

MyPromise.prototype.then = function (onResolved) {
  return new MyPromise((resolve) => {
    this.cbs.push(() => {
      const res = onResolved(this.data);
      if (res instanceof MyPromise) {
        res.then(resolve);
      } else {
        resolve(res);
      }
    });
  });
};
```

----

## 结束语

`Promise` 在开发过程中出现的频率是非常高的，也是面试题中的一个热点，它对于我们的异步编程提供了非常大的帮助，不再继续使用看了让人头大的无数层回调嵌套，解决了回调地狱的问题。如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[阮一峰es6Promise](https://es6.ruanyifeng.com/#docs/promise)  
[关于Promise嵌套then和多级then的解析](https://www.jianshu.com/p/b1abaf792491)  
[最简实现Promise，支持异步链式调用（20行）](https://juejin.im/post/5e6f4579f265da576429a907)
