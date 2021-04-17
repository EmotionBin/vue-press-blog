# 防抖和节流

防抖和节流是前端用来做性能优化的手段，比如一些输入搜索，需要监听输入事件，只要用户输入了就发送一次 ajax 请求向后台请求搜索数据，当用户频繁输入时，会导致大量请求并发，影响性能也浪费服务器的带宽，所以这种情况就需要用防抖处理，本文就来聊一聊防抖和节流  

----

## 防抖

防抖顾名思义防止抖动，可以理解为防止因为用户行为而频繁触发某一个事件，在用户行为结束后再触发事件，多用于输入框搜索等  

----

### 防抖原理

防抖原理简单概括为：**在事件触发结束后，n 秒后执行响应函数，如果在这个时间(n 秒)内，事件再次被触发，则重新计时**  

实现原理：**设置一个 timer 计时器(可以是全局变量也可以利用闭包)，每次触发事件的时候，先利用 clearTimeout 清空上一次的结果，再调用 setTimeout 函数，它的返回值赋值给 timer，如果在指定时间内重复触发事件， timer 都会重新赋值，所以不会触发事件回调函数；如果在指定时间内事件没有被再次触发，则到达指定时间后，则执行该事件的回调函数**  

```javascript
/**
 * 防抖函数
 * @param {function} cb 
 * @param {number} wait 
 * @param {boolean} immediate 
 */
function debounce(cb, wait, immediate){
  let timer;
  return function (){
    const args = arguments; 
    const context = this;
    if(timer) clearTimeout(timer);
    if(immediate){
      let callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, wait)
      if(callNow) return cb.apply(context, args);
    }else{
      timer = setTimeout(function() {
        return cb.apply(context, args);
      }, wait);
    }
  }
}
```

这里说一下参数，`cb` 为事件的回调函数，`wait` 为等待时间间隔，`immediate` 为是否立即执行  

----

### 应用场景

1. 搜索框输入查询
2. scroll触发滚动事件
3. 表单验证
4. 按钮提交事件
5. 浏览器窗口缩放，resize事件

----

## 节流

节流顾名思义节省流量，可以理解为在必须要频繁触发某一事件的情况下，控制触发频率(比如一秒触发一次)，多用于 scroll 事件的图片懒加载等  

----

### 节流原理

节流原理简单概括为：**持续触发事件，每隔一段时间，只执行一次事件**  

实现原理就不说了，看代码就好了，这里的节流我会给出几个版本  

**1. 时间戳版本(第一次会触发，最后一次不会触发)**

```javascript
/**
 * 节流函数时间戳版 第一次会触发 最后一次不会触发
 * @param {function} cb 
 * @param {number} wait 
 */
function throttle(cb, wait){
  let context, args;
  let old = 0;
  return function(){
    context = this;
    args = arguments;
    let now = + new Date();
    if(now - old > wait){
      cb.apply(context, args);
      old = now;
    }
  }
}
```

**2. 定时器版本(第一次不会触发，最后一次会触发)**

```javascript
/**
 * 节流函数定时器版 第一次不会触发 最后一次会触发
 * @param {function} cb 
 * @param {number} wait 
 */
function throttle(cb, wait){
  let context, args, timer;
  return function(){
    context = this;
    args = arguments;
    if(!timer){
      timer = setTimeout(() => {
        cb.apply(context, args);
        timer = null;
      }, wait)
    }
  }
}
```

**3. 时间戳和定时器结合版本(第一次会触发，最后一次也会触发)**

```javascript
/**
 * 节流函数结合版 第一次会触发 最后一次也会触发
 * @param {function} cb 
 * @param {number} wait 
 */
function throttle(cb, wait){
  let context, args, timer;
  let old = 0; // 时间戳
  let later = function(){
    old = + new Date();
    timer = null;
    cb.apply(context, args);
  }
  return function(){
    context = this;
    args = arguments;
    let now = + new Date();
    if(now - old > wait){
      if(timer){
        clearTimeout(timer);
        timer = null;
      }
      cb.apply(context, args);
      old = now;
    }else if(!timer){
      timer = setTimeout(later, wait)
    }
  }
}
```

**4. 可配置版本(可自行配置，除了第一次不会触发，最后一次也不会触发的情况)**

```javascript
/**
 * 节流函数可配置版本 可自由配置 除了第一次不触发，最后一次也不触发的情况，这样会有bug
 * @param {function} cb 
 * @param {number} wait 
 * @param {object} options
 *  options 参数:
 *  leading {boolean} 第一次是否触发 true-触发 false-不触发
 *  trailing {boolean} 最后一次是否触发 true-触发 false-不触发
 *  注意，leading 和 trailing 不能同时为 false
 */
function throttle(cb, wait, options){
  let context, args, timer;
  let old = 0; // 时间戳
  if(!options) options = {};
  let later = function(){
    old = + new Date();
    timer = null;
    cb.apply(context, args);
  }
  return function(){
    context = this;
    args = arguments;
    let now = + new Date();
    if(options.leading === false){
      old = now;
    }
    if(now - old > wait){
      if(timer){
        clearTimeout(timer);
        timer = null;
      }
      cb.apply(context, args);
      old = now;
    }else if(!timer && options.trailing !== false){
      timer = setTimeout(later, wait)
    }
  }
}
```

----
 
### 应用场景

1. DOM 元素的拖拽功能实现(拖拽过程中每隔几秒做一些事情)
2. 射击游戏(每隔一段时间进行一次射击)
3. 计算鼠标移动距离(每隔一段时间计算一次鼠标移动的距离)
4. 监听 scroll 滚动事件(图片懒加载)

----

## 结束语

以上就是本文关于防抖和节流的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[js 函数的防抖(debounce)与节流(throttle)](https://www.cnblogs.com/cc-freiheit/p/10827372.html)  