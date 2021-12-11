# JS 算法练习

## 实现 es6 模板字符串变量解析

```javascript
//已知
info = { status: 'good', emotion: 'happy' };
//输入
('today is a ${info.status} day,I am so ${info.emotion}');
//输出
('today is a good day,I am so happy');
```

思路:观察可知，在遇到形如 `${xxx}` 的字符串时，会把中间的内容替换成对应变量，所以可以利用**正则表达式**匹配 `${xxx}` 把匹配到的中间的值当成一个变量解析，并替换 `${xxx}`

```javascript
const info = { status: 'good', emotion: 'happy' };
const str = 'today is a ${info.status} day,I am so ${info.emotion}';
const s = str.replace(/\$\{(.*?)\}/g, (matched, key) => eval(key));
console.log(s); // "today is a good day,I am so happy"
```

---

## 实现 forEach、map、filter、reduce

**实现 forEach**

```javascript
Array.prototype.forEach = function(cb, context) {
  if (typeof cb !== 'function') {
    throw new TypeError(`${cb} is not a function`);
  }
  for (let i = 0; i < this.length; i++) {
    cb.call(context, this[i], i, this);
  }
};
```

**实现 map**

```javascript
Array.prototype.map = function(cb, context) {
  if (typeof cb !== 'function') {
    throw new TypeError(`${cb} is not a function`);
  }
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(cb.call(context, this[i], i, this));
  }
  return result;
};
```

**实现 filter**

```javascript
Array.prototype.filter = function(cb, context) {
  if (typeof cb !== 'function') {
    throw new TypeError(`${cb} is not a function`);
  }
  const result = [];
  for (let i = 0; i < this.length; i++) {
    const flag = !!cb.call(context, this[i], i, this);
    flag && result.push(this[i]);
  }
  return result;
};
```

**实现 reduce**

```javascript
Array.prototype.reduce = function(cb, initValue) {
  if (typeof cb !== 'function') {
    throw new TypeError(`${cb} is not a function`);
  }
  if (initValue && typeof initValue !== 'number') {
    throw new TypeError(`'${initValue}' is not a number`);
  }
  let result = initValue || 0;
  for (let i = 0; i < this.length; i++) {
    result = cb(result, this[i], i, this);
  }
  return result;
};
```

关于以上函数的实现，只考虑了一些主要的核心代码，还有一些边界条件是缺少检测的

---

## 实现 instanceof

```javascript
// L 表示左表达式，R 表示右表达式
function instance_of(L, R) {
  // 取 R 的显示原型
  var O = R.prototype;
  // 取 L 的隐式原型
  L = L.__proto__;
  while (true) {
    if (L === null) {
      return false;
    }
    if (O === L) {
      // 当 O 显式原型 严格等于  L隐式原型 时，返回true
      return true;
    }
    L = L.__proto__;
  }
}
```

---

## 实现 indexOf

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/implement-strstr/)

> 28 实现 strStr()  
> 给定一个  haystack 字符串和一个 needle 字符串，在 haystack 字符串中找出 needle 字符串出现的第一个位置 (从 0 开始)。如果不存在，则返回   -1

其实这道题用 `indexOf` 就可以解决了，但是这样太无趣，于是我自己手写了一个函数模拟 `indexOf` 的实现，边界条件判断确实有点恶心

```javascript
/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
function myIndexOf(haystack, needle) {
  if (!needle) {
    return 0;
  }
  if (!haystack || needle.length > haystack.length) {
    return -1;
  }
  for (let i = 0; i < haystack.length; i++) {
    if (i > haystack.length - needle.length) {
      return -1;
    }
    if (haystack[i] === needle[0]) {
      if (needle.length === 1) {
        return i;
      }
      for (let j = 1; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          break;
        } else if (j === needle.length - 1) {
          return i;
        }
      }
    } else if (i === haystack.length - 1) {
      return -1;
    }
  }
}
```

看到这复杂的边界条件判断，于是我决定进行优化，下面给出了一个优化后的版本

```javascript
/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
function myIndexOf(haystack, needle) {
  const haystackLength = haystack.length;
  const needleLength = needle.length;
  if (!needle) {
    return 0;
  }
  for (let i = 0; i < haystackLength; i++) {
    if (i > haystackLength - needleLength) {
      return -1;
    }
    if (haystack[i] === needle[0]) {
      if (needleLength === 1) {
        return i;
      }
      for (let j = 1; j < needleLength; j++) {
        if (haystack[i + j] !== needle[j]) {
          break;
        } else if (j === needleLength - 1) {
          return i;
        }
      }
    }
  }
  return -1;
}
```

---

## 实现防抖节流

**防抖**

```javascript
function debounce(cb, wait, immediate) {
  let timer;
  return function() {
    const args = arguments;
    const context = this;
    if (timer) clearTimeout(timer);
    if (immediate) {
      let callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      if (callNow) return cb.apply(context, args);
    } else {
      timer = setTimeout(function() {
        return cb.apply(context, args);
      }, wait);
    }
  };
}
```

**节流**

```javascript
function throttle3(cb, wait) {
  let context, args, timer;
  let old = 0; // 时间戳
  let later = function() {
    old = +new Date();
    timer = null;
    cb.apply(context, args);
  };
  return function() {
    context = this;
    args = arguments;
    let now = +new Date();
    if (now - old > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      cb.apply(context, args);
      old = now;
    } else if (!timer) {
      timer = setTimeout(later, wait);
    }
  };
}
```

---

## 两数之和

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/two-sum/)

> 1 两数之和  
> 给定一个整数数组 nums  和一个目标值 target，请你在该数组中找出和为目标值的那   两个   整数，并返回他们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素不能使用两遍

思路:使用一个对象作为映射，遍历数组，对象的键记录数组中元素的值，对象的值记录数组中元素的索引，先获取差值 `diff`，如果映射对象中存在 `diff` 属性，且它的值大于等于 0，则说明条件成立，反之，条件不成立，则往映射对象中记录当前元素的值和索引

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
  var NUM_MAP = {};
  for (let i = 0; i < nums.length; i++) {
    const item = nums[i];
    const diff = target - item;
    if (NUM_MAP[diff] >= 0) return [NUM_MAP[diff], i];
    NUM_MAP[item] = i;
  }
};
```

其实这里还可以优化，就是把映射对象利用 `new Map()` 代替

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
  var NUM_MAP = new Map();
  for (let i = 0; i < nums.length; i++) {
    const item = nums[i];
    const diff = target - item;
    if (NUM_MAP[diff] >= 0) return [NUM_MAP[diff], i];
    NUM_MAP[item] = i;
  }
};
```

---

## 实现 new、call、apply、bind

**实现 new**

```javascript
function _new() {
  let obj = {}; // 1. 创建一个空对象
  let Constructor = [].shift.call(arguments); // 2. 获得构造函数
  obj.__proto__ = Constructor.prototype; // 3. 链接到原型
  let result = Constructor.apply(obj, arguments); // 4. 绑定 this，执行构造函数
  return typeof result === 'object' ? result : obj; // 5. 返回 new 出来的对象
}
```

简化版：

```javascript
function _new(fn, ...args) {
  let obj = Object.create(fn.prototype);
  let result = fn.apply(obj, args);
  return typeof result === 'object' ? result : obj;
}
```

演示：

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
var person = _new(Person, '小明', 18);
console.log(person);
// Person {name: "小明", age: 18}
```

**实现 call**

```javascript
Function.prototype._call = function(target, ...args) {
  target.fn = this;
  let res = target.fn(...args);
  delete target.fn;
  return res;
};
```

演示:

```javascript
var a = 1;
var b = 2;

var obj = {
  a: 10,
  b: 20,
};

function test(params1, params2) {
  console.log(this.a);
  console.log(this.b);
  console.log(params1);
  console.log(params2);
}
test(100, 200); // 1 2 100 200
test._call(obj, 100, 200); // 10 20 100 200
```

**实现 apply**

```javascript
Function.prototype._apply = function(target, args) {
  target.fn = this;
  let res;
  if (args && args.length) {
    res = target.fn(...args);
  } else {
    res = target.fn();
  }
  delete target.fn;
  return res;
};
```

演示:

```javascript
var a = 1;
var b = 2;

var obj = {
  a: 10,
  b: 20,
};

function test(params1, params2) {
  console.log(this.a);
  console.log(this.b);
  console.log(params1);
  console.log(params2);
}
test(100, 200); // 1 2 100 200
test._apply(obj, [100, 200]); // 10 20 100 200
```

**实现 bind**

```javascript
Function.prototype._bind = function(target, ...args) {
  target.fn = this;
  return function() {
    const newArgs = args.concat(...arguments);
    let res = target.fn(...newArgs);
    delete target.fn;
    return res;
  };
};
```

演示:

```javascript
var a = 1;
var b = 2;

var obj = {
  a: 10,
  b: 20,
};

function test(params1, params2) {
  console.log(this.a);
  console.log(this.b);
  console.log(params1);
  console.log(params2);
}
test(100, 200); // 1 2 100 200
test._bind(obj, 100, 200)(); // 10 20 100 200
test._bind(obj, 100)(200); // 10 20 100 200
```

---

## Promise 实现 setTimeout

```javascript
function _setTimeout(cb, delay, ...args) {
  const currentTimestamp = +new Date();
  return Promise.resolve().then(() => {
    let flag = true;
    while (flag) {
      if (+new Date() - currentTimestamp > delay) {
        cb(...args);
        flag = false;
      }
    }
  });
}
```

测试：

```javascript
console.log('script start');
_setTimeout(doSomething, 2000, 1, 2, 3, 4, 5);
console.log('script end');

function _setTimeout(cb, delay, ...args) {
  const currentTimestamp = +new Date();
  return Promise.resolve().then(() => {
    let flag = true;
    while (flag) {
      if (+new Date() - currentTimestamp > delay) {
        cb(...args);
        flag = false;
      }
    }
  });
}

function doSomething() {
  console.log(arguments);
  console.log('时间到');
}

// script start
// script end
// Arguments(5) [1, 2, 3, 4, 5, callee: ƒ, Symbol(Symbol.iterator): ƒ]
// 时间到
```

这里用 Promise 模拟的 setTimeout 和真实的 setTimeout 还是有区别的，区别就在于 **Promise 是微任务，setTimeout 是宏任务**，我只实现了核心功能，对于微任务和宏任务的问题暂时没有想到解决办法

---

## 最大子序和

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/maximum-subarray/)

> 给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和

这道题我第一次做的时候没有做出来，然后看了别人的解答，受到了很大的启发，别人的解答如下：

- 这道题用动态规划的思路并不难解决，比较难的是后文提出的用分治法求解，但由于其不是最优解法，所以先不列出来
- 动态规划的是首先对数组进行遍历，当前最大连续子序列和为 sum，结果为 ans
- 如果 sum > 0，则说明 sum 对结果有增益效果，则 sum 保留并加上当前遍历数字
- 如果 sum <= 0，则说明 sum 对结果无增益效果，需要舍弃，则 sum 直接更新为当前遍历数字
- 每次比较 sum 和 ans 的大小，将最大值置为 ans，遍历结束返回结果
- 时间复杂度：O(n)

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
  let ans = nums[0];
  let sum = 0;
  for (const num of nums) {
    if (sum > 0) {
      sum += num;
    } else {
      sum = num;
    }
    ans = Math.max(ans, sum);
  }
  return ans;
};
```

我在参考了他的思路后，自己也总结一下，我觉得这样更容易理解：

1. 如果全部都是负数，负数越加越小，所以直接找最大值
2. 如果有正数，从正数开始计算，因为如果算上前面的负数，和肯定变小了
3. 当和小于 0 时，这个区间就告一段落了，从下一个正数开始计算

---

## 最后一个单词的长度

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/length-of-last-word/)

> 给定一个仅包含大小写字母和空格  ' '  的字符串 s，返回其最后一个单词的长度。如果字符串从左向右滚动显示，那么最后一个单词就是最后出现的单词。  
> 如果不存在最后一个单词，请返回 0。

思路：空格不一定穿插在单词之间，也可能在字符串的开肉和结尾，而且空格数量不明确，所以先用 `trim()` 进行处理，再用 `split()` 对空格进行分割，返回分割后的数组最后一个元素的长度

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLastWord = function(s) {
  s = s.trim();
  const arr = s.split(' ');
  return arr[arr.length - 1].length;
};
```

---

## 手写 trim()

手写 js 的 `trim()`

这是我自己写的，代码有点长......

```javascript
String.prototype.trim = function() {
  let s = this;
  while (deleteStart(s)) {
    s = deleteStart(s);
  }
  while (deleteEnd(s)) {
    s = deleteEnd(s);
  }
  return s;

  function deleteStart(str) {
    if (str.startsWith(' ')) {
      return str.substr(1);
    }
    return false;
  }

  function deleteEnd(str) {
    if (str.endsWith(' ')) {
      return str.substr(0, str.length - 1);
    }
    return false;
  }
};
```

然后在网上看了一下别人写的，自愧不如

```javascript
String.prototype.trim = function() {
  return this.replace(/(^\s*)|(\s*$)/g, '');
};
```

---

## 加一

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/plus-one/)

> 给定一个由整数组成的非空数组所表示的非负整数，在该数的基础上加一。  
> 最高位数字存放在数组的首位， 数组中每个元素只存储单个数字。  
> 你可以假设除了整数 0 之外，这个整数不会以零开头。

思路：有一个 res 记录结果的数组，有一个变量 flag 表示是否需要加一，从后往前遍历数组，如果需要加一，判断加一后是否大于 9，大于 9，则往 res 头部加入 0，保持控制加一的变量 flag;小于 9，则直接把当前元素加入 res 头部，更改控制加一的变量 flag，如果不需要加一，直接把当前元素加入 res 头部

```javascript
/**
 * @param {number[]} digits
 * @return {number[]}
 */
var plusOne = function(digits) {
  let res = [];
  let flag = 1;
  for (let i = digits.length - 1; i >= 0; i--) {
    if (flag) {
      const num = digits[i] + 1;
      if (num > 9) {
        res.unshift(0);
      } else {
        res.unshift(num);
        flag = 0;
      }
    } else {
      res.unshift(digits[i]);
    }
  }
  res[0] === 0 && res.unshift(1);
  return res;
};
```

---

## 二进制求和

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/add-binary/)

> 给你两个二进制字符串，返回它们的和（用二进制表示）。  
> 输入为 非空 字符串且只包含数字 1 和 0。

思路：先把两个二进制数转换成十进制数再把它们相加，把得到的结果再转成二进制就完成了

```javascript
/**
 * @param {string} a
 * @param {string} b
 * @return {string}
 */
var addBinary = function(a, b) {
  return (parseInt(a, 2) + parseInt(b, 2)).toString(2);
};
```

**但是这样做对于太大的数是行不通的，因为 js 的最大安全整数是 2^53 - 1，超出这个范围的整数运算就不再准确**

下面的代码是一段改进后的代码，使用了 ES10 的 `BigInt`，兼容性目前还不算太好，API 可以看这里 [传送门](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

```javascript
/**
 * @param {string} a
 * @param {string} b
 * @return {string}
 */
var addBinary = function(a, b) {
  return (BigInt('0b' + a) + BigInt('0b' + b)).toString(2);
};
```

---

## 合并两个有序数组

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/merge-sorted-array/)

> 给你两个有序整数数组 nums1 和 nums2，请你将 nums2 合并到 nums1 中，使 nums1 成为一个有序数组。
>
> - 初始化 nums1 和 nums2 的元素数量分别为 m 和 n 。
> - 你可以假设 nums1 有足够的空间（空间大小大于或等于 m + n）来保存 nums2 中的元素。

思路：双指针法，用两个指针分别指向两个数组的末尾，从后往前同时遍历两个数组元素，大的往后放即可

```javascript
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {
  let index1 = m - 1;
  let index2 = n - 1;
  let tail = m + n - 1;
  while (index2 >= 0) {
    if (nums1[index1] > nums2[index2]) {
      nums1[tail] = nums1[index1];
      index1--;
      tail--;
    } else {
      nums1[tail] = nums2[index2];
      index2--;
      tail--;
    }
  }
};
```

---

## 计算一个数的平方根

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/sqrtx/)

> 实现 int sqrt(int x) 函数  
> 计算并返回 x 的平方根，其中 x 是非负整数  
> 由于返回类型是整数，结果只保留整数的部分，小数部分将被舍去

思路：从 0 开始遍历，每次加一，如果 i 的平方小于等于 x 并且 i + 1 的平方大于 x ，那么 x 的平方根就是 i

```javascript
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function(x) {
  for (let i = 0; i < Infinity; i++) {
    if (i * i <= x && (i + 1) * (i + 1) > x) {
      return i;
    }
  }
};
```

这样确实是能解题，但是效率实在是太低，下面我会结合二分法进行解题

使用二分法，废话不多说，直接上代码

```javascript
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function(x) {
  let head = 0;
  let tail = x;
  let res = -1;
  while (head <= tail) {
    let mid = Math.floor((head + tail) / 2);
    if (mid * mid < x) {
      head = mid + 1;
      res = mid;
    } else if (mid * mid > x) {
      tail = mid - 1;
    } else {
      return mid;
    }
  }
  return res;
};
```

---

## 爬楼梯

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/climbing-stairs/)

> 假设你正在爬楼梯。需要 n 阶你才能到达楼顶。  
> 每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？  
> 注意：给定 n 是一个正整数。

思路：动态规划，分解成若干个子问题，爬第 n 阶楼梯的方法数量，等于这 2 部分之和

1. 爬上 n-1 阶楼梯的方法数量，因为再爬 1 阶就能到第 n 阶
2. 爬上 n-2 阶楼梯的方法数量，因为再爬 2 阶就能到第 n 阶

所以我们得到公式 `dp[n] = dp[n−1] + dp[n−2]`，同时需要初始化 `dp[0]=1` 和 `dp[1]=1`

```javascript
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
  const arr = [];
  arr[0] = 1;
  arr[1] = 1;
  for (let i = 2; i <= n; i++) {
    arr[i] = arr[i - 1] + arr[i - 2];
  }
  return arr[n];
};
```

---

## 相同的树

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/same-tree/)

> 给定两个二叉树，编写一个函数来检验它们是否相同。
> 如果两个树在结构上相同，并且节点具有相同的值，则认为它们是相同的。

思路:递归判断，当两棵树当前节点都为 `null` 时返回 `true`，当其中一个为 `null`，另一个不为 `null` 时返回 `false`，当两个都不为 `null` 并且值不相等时返回 `false`，递归判断树的左右子节点

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {boolean}
 */
var isSameTree = function(p, q) {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};
```

**这里总结一下写树算法的套路框架**

二叉树算法的设计的总路线：明确一个节点要做的事情，然后剩下的事抛给框架

```java
void traverse(TreeNode root) {
  // root 需要做什么？在这做。
  // 其他的不用 root 操心，抛给框架
  traverse(root.left);
  traverse(root.right);
}
```

举两个简单的例子体会一下这个思路，热热身

**1.如何把二叉树所有的节点中的值加一？**

```java
void plusOne(TreeNode root) {
  if (root == null) return;
  root.val += 1;

  plusOne(root.left);
  plusOne(root.right);
}
```

**2.如何判断两棵二叉树是否完全相同？**

```java
boolean isSameTree(TreeNode root1, TreeNode root2) {
  // 都为空的话，显然相同
  if (root1 == null && root2 == null) return true;
  // 一个为空，一个非空，显然不同
  if (root1 == null || root2 == null) return false;
  // 两个都非空，但 val 不一样也不行
  if (root1.val != root2.val) return false;

  // root1 和 root2 该比的都比完了
  return isSameTree(root1.left, root2.left) && isSameTree(root1.right, root2.right);
}
```

总之就是，只处理当前节点，剩下的操作利用递归进行处理

本文参考自 [传送门](https://leetcode-cn.com/problems/same-tree/solution/xie-shu-suan-fa-de-tao-lu-kuang-jia-by-wei-lai-bu-/)

## 对称二叉树

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/symmetric-tree/)

> 给定一个二叉树，检查它是否是镜像对称的。  
> 例如，二叉树 [1,2,2,3,4,4,3] 是对称的。  
> 但是下面这个 [1,2,2,null,3,null,3] 则不是镜像对称的。

思路:递归判断，两棵树为对称二叉树有两个条件

1. 根节点相同
2. 一棵树的左子树和另一棵树的右子树为对称二叉树，并且它的右子树和另一棵树的左子树为对称二叉树

由以上条件，递归可得

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isSymmetric = function(root) {
  if (!root) return true;
  return isDiff(root.left, root.right);
  function isDiff(leftTree, rightTree) {
    // 两个都为 null 显然对称
    if (!leftTree && !rightTree) return true;
    // 一个为 null 另一个不为 null 显然不对称
    if (!leftTree || !rightTree) return false;
    // 值不同 显然不对称
    if (leftTree.val !== rightTree.val) return false;
    // 递归
    return (
      isDiff(leftTree.left, rightTree.right) &&
      isDiff(leftTree.right, rightTree.left)
    );
  }
};
```

---

## 二叉树的最大深度

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/)

> 给定一个二叉树，找出其最大深度。  
> 二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。

思路:递归，一句话完事，一棵树的最大高度等于它的左子树的高度与右子树的高度的最大值加一

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
  if (!root) return 0;
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
};
```

---

## 二叉树的层次遍历

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/binary-tree-level-order-traversal-ii/)

> 给定一个二叉树，返回其节点值自底向上的层次遍历。 （即按从叶子节点所在层到根节点所在的层，逐层从左向右遍历）

思路:创建一个队列，先把根节点放进去。对于当前队列中的所有节点，即当前层的节点，按顺序出列，节点值记录一下，让它们的子节点加入队列，重复上述步骤，直到队列为空，就遍历完所有节点

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrderBottom = function(root) {
  if (!root) return [];
  const res = [];
  const queue = [root];
  while (queue.length) {
    const data = [];
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const cur = queue.shift();
      data.push(cur.val);
      if (cur.left) queue.push(cur.left);
      if (cur.right) queue.push(cur.right);
    }
    res.unshift(data);
  }
  return res;
};
```

---

## 平衡二叉树

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/balanced-binary-tree/)

> 给定一个二叉树，判断它是否是高度平衡的二叉树  
> 本题中，一棵高度平衡二叉树定义为：  
> 一个二叉树每个节点 的左右两个子树的高度差的绝对值不超过 1 。

思路:递归，先判断当前节点的左右子树的高度是否满足条件，若满足则继续递归判断左右子树

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isBalanced = function(root) {
  if (!root) return true;
  return (
    Math.abs(depth(root.left) - depth(root.right)) <= 1 &&
    isBalanced(root.left) &&
    isBalanced(root.right)
  );
};

var depth = function(root) {
  if (!root) return 0;
  return Math.max(depth(root.left), depth(root.right)) + 1;
};
```

但是这样感觉会存在大量冗余操作，因为在计算树的高度的时候，也使用了递归，会一直递归到树的最底部，所以这里会有两个嵌套的递归，待优化~

---

## 二叉树的最小深度

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/minimum-depth-of-binary-tree/)

> 给定一个二叉树，找出其最小深度。  
> 最小深度是从根节点到最近叶子节点的最短路径上的节点数量。  
> 说明：叶子节点是指没有子节点的节点。

思路:递归，如果当前节点既有左子树又有右子树，则向左右两个子树分别递归，这个二叉树的最小深度就是左右子树中小的那个加 1，如果只有左子树，则向最子树递归，这个二叉树的最小深度就是左子树深度加 1，如果只有右子树，则向右子树递归，这个二叉树的最小深度就是右子树深度加 1

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var minDepth = function(root) {
  if (!root) return 0;
  if (root.left && root.right)
    return 1 + Math.min(minDepth(root.left), minDepth(root.right));
  if (root.left) return 1 + minDepth(root.left);
  if (root.right) return 1 + minDepth(root.right);
  return 1;
};
```

---

## 买卖股票的最佳时机

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

> 给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。  
> 如果你最多只允许完成一笔交易（即买入和卖出一支股票一次），设计一个算法来计算你所能获取的最大利润。  
> 注意：你不能在买入股票前卖出股票。

思路：双指针，双重 for 循环，外层遍历，遍历数组各个元素，外层指针指向当前元素，内层遍历，遍历数组剩余元素，内层指针指向当前元素，内层指针减去外层指针的最大值即为最大利润

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
  let profit = 0;
  let buy = -1,
    sold = -1;
  const { length } = prices;
  for (let i = 0; i < length; i++) {
    buy = prices[i];
    for (let j = i + 1; j < length; j++) {
      sold = prices[j];
      if (sold > buy) profit = Math.max(profit, sold - buy);
    }
  }
  return profit;
};
```

但是这里利用了双重 for 循环，时间复杂度开销太大，下面会用动态规划的方法来解决

思路：动态规划，用文字描述优点抽象，直接看代码

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
/*
 * dp[i] 前i天卖出的最大利润
 * min : prices 前i项中的最小值
 * prices[i] - min: 当前位置卖出可得最大利润
 * dp[i - 1] : 前i-1项目卖出可得的最大利润
 */
var maxProfit = function(prices) {
  if (!prices || !prices.length) return 0;
  const len = prices.length,
    dp = new Array(len).fill(0);
  let min = prices[0];
  for (let i = 1, price; i < len; i++) {
    price = prices[i];
    min = Math.min(min, price);
    dp[i] = Math.max(dp[i - 1], price - min);
  }
  return dp[len - 1];
};
```

---

## 买卖股票的最佳时机 II

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-ii/)

> 给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。  
> 设计一个算法来计算你所能获取的最大利润。你可以尽可能地完成更多的交易（多次买卖一支股票）。  
> 注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

思路：贪心算法，要想收益最大化，只要明天的价格比今天高，则今天买入，明天卖出，赚取差价，但是这样进行交易是与题目有冲突的，这题算的是最大收益，所以不关心买入过程，只关心结果，贪心算法只能用于计算最大利润，计算的过程并不是实际的交易过程，这也是贪心算法的意义所在

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
  // 贪心算法
  let res = 0;
  const { length } = prices;
  for (let i = 1; i < length; i++) {
    res += Math.max(0, prices[i] - prices[i - 1]);
  }
  return res;
};
```

---

## 只出现一次的数字

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/single-number/)

> 给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

思路：声明一个对象用来记录各个数字出现的次数，循环遍历，如果对象中有该数字的记录，则次数加 1，如果没有，则往对象中写入该值，次数记为 1，循环结束后再进行一次循环找出次数为 1 的数字返回即可

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
  const MAP = {};
  const { length } = nums;
  for (let i = 0; i < length; i++) {
    const item = nums[i];
    if (MAP[item]) MAP[item]++;
    else MAP[item] = 1;
  }
  for (let key in MAP) {
    if (MAP[key] === 1) return key;
  }
};
```

---

## 环形链表

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/linked-list-cycle/)

> 给定一个链表，判断链表中是否有环。  
> 如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。注意：pos 不作为参数进行传递，仅仅是为了标识链表的实际情况。  
> 如果链表中存在环，则返回 true 。 否则，返回 false 。

思路：快慢指针，初始化的时候慢指针指向头，快指针指向慢指针的下一个节点，慢指针一次走一步，快指针一次走两步，如果快指针能追上慢指针，则说明有环，如果快指针走到末尾时都没有追上慢指针，则说明没有环

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function(head) {
  // 成环至少需要两个节点
  if (!head || !head.next) {
    return false;
  }
  // 初始化快慢指针
  let slow = head;
  let fast = head.next;
  // 如果快指针一直没有追上慢指针
  while (slow !== fast) {
    // 快指针走到链表末尾 则说明没有环
    if (!fast || !fast.next) return false;
    slow = slow.next;
    fast = fast.next.next;
  }
  // 如果有环，快指针会追上慢指针
  return true;
};
```

---

## 相交链表

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/intersection-of-two-linked-lists/)

> 编写一个程序，找到两个单链表相交的起始节点。

思路：标记法，遍历其中一个链表，每经过一个节点，就给节点进行标记，完成后再遍历另一个链表，如果该链表上的节点有标记，则该节点为相交节点

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
var getIntersectionNode = function(headA, headB) {
  while (headA) {
    headA.flag = true;
    headA = headA.next;
  }
  while (headB) {
    if (headB.flag) return headB;
    headB = headB.next;
  }
  return null;
};
```

---

## Excel 表列名称

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/excel-sheet-column-title/)

> 给定一个正整数，返回它在 Excel 表中相对应的列名称  
> 1 -> A  
> 2 -> B  
> 3 -> C  
> ...  
> 26 -> Z  
> 27 -> AA  
> 28 -> AB  
> ...

思路：这道题无非就是二十六进制的转换罢了，想一下我们平时熟悉的十进制，再把它转换成二十六进制就可以了

```javascript
/**
 * @param {number} n
 * @return {string}
 */
var convertToTitle = function(n) {
  const MAP = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  let result = '';
  while (n > 0) {
    n--;
    result = MAP[n % 26] + result;
    n = Math.floor(n / 26);
  }
  return result;
};
```

---

## 阶乘后的零

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/factorial-trailing-zeroes/)

> 给定一个整数 n，返回 n! 结果尾数中零的数量。

思路：5 的阶乘尾数有 1 个零，10 的阶乘尾数有 2 个零，15 的阶乘尾数有 3 个零...有零说明能被 10 整除，又因为 2 乘 5 等于 10，所以找出所有的因数为 2 和 5 的即可，每 2 个数出现一次 2，每 5 个数出现一次 5，因为 5 比 2 少，由于木桶效应，找出所有的因数 5 即可，那就是 5, 10，15，20，25，但是 25 会出现 2 个 5，125 会出现 3 个 5，所以所有包含 5 的数为 n / 5 + n / 25 + n / 125...用程序算出来这个算术式的结果就是答案

```javascript
/**
 * @param {number} n
 * @return {number}
 */
var trailingZeroes = function(n) {
  let count = 0;
  while (n > 0) {
    count += Math.floor(n / 5);
    n = n / 5;
  }
  return count;
};
```

[思路参考](https://leetcode-cn.com/problems/factorial-trailing-zeroes/solution/xiang-xi-tong-su-de-si-lu-fen-xi-by-windliang-3/)

---

## 打家劫舍

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/house-robber/)

> 你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。
> 给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。

思路：动态规划，dp[n] = MAX( dp[n-1], dp[n-2] + num )，由于不可以在相邻的房屋闯入，所以在当前位置 n 房屋可盗窃的最大值，要么就是 n-1 房屋可盗窃的最大值，要么就是 n-2 房屋可盗窃的最大值加上当前房屋的值，二者之间取最大值

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
  const dp = [];
  const { length } = nums;
  dp[0] = 0;
  dp[1] = nums[0];
  for (let i = 1; i < length; i++) {
    dp[i + 1] = Math.max(dp[i], dp[i - 1] + nums[i]);
  }
  return dp[length];
};
```

---

## 快乐数

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/happy-number/)

> 编写一个算法来判断一个数 n 是不是快乐数。
> 「快乐数」定义为：对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和，然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。如果 可以变为   1，那么这个数就是快乐数。
> 如果 n 是快乐数就返回 True ；不是，则返回 False 。

思路：用对象记录每次出现的新数字，对当前数字先从低位到高位依次拆解，求平方和得到新数字，如果新数字不为 1，则记录到该对象中，如果为 1，则返回 `true`，如果数字在对象中已经有过记录，说明出现了循环，直接返回 `false`

```javascript
/**
 * @param {number} n
 * @return {boolean}
 */
var isHappy = function(n) {
  const map = {};
  let res = getNumber(n);
  while (res != 1) {
    if (res in map) return false;
    map[res] = 1;
    res = getNumber(res);
  }
  return true;
};

function getNumber(n) {
  let sum = 0;
  while (n > 0) {
    const remaider = n % 10;
    sum += Math.pow(remaider, 2);
    n = Math.floor(n / 10);
  }
  return sum;
}
```

---

## 同构字符串

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/isomorphic-strings/)

> 给定两个字符串 s 和 t，判断它们是否是同构的。  
> 如果 s 中的字符可以按某种映射关系替换得到 t ，那么这两个字符串是同构的。  
> 每个出现的字符都应当映射到另一个字符，同时不改变字符的顺序。不同字符不能映射到同一个字符上，相同字符只能映射到同一个字符上，字符可以映射到自己本身。

思路：哈希表。用两个哈希表记录他们的映射关系，s2t 记录 s 映射到 t，t2s 记录 t 映射到 s，如果出现重复的记录，且记录的映射不一致时，则发生冲突，直接返回 false

```javascript
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isIsomorphic = function(s, t) {
  const s2t = {};
  const t2s = {};
  const { length } = s;
  for (let i = 0; i < length; i++) {
    const charS = s[i];
    const charT = t[i];
    if (
      (s2t[charS] && s2t[charS] !== charT) ||
      (t2s[charT] && t2s[charT] !== charS)
    ) {
      return false;
    }
    s2t[charS] = charT;
    t2s[charT] = charS;
  }
  return true;
};
```

---

## 存在重复元素

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/contains-duplicate/)

> 给定一个整数数组，判断是否存在重复元素。  
> 如果存在一值在数组中出现至少两次，函数返回 true 。如果数组中每个元素都不相同，则返回 false 。

思路：先对数组去重，如果去重后得到的新数组的长度不等于原数组长度，说明有重复值，返回 true，否则返回 false

```javascript
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
  return [...new Set(nums)].length !== nums.length;
};
```

其实这道题的思路非常多，这里我只列举了其中一种

---

## 存在重复元素 II

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/contains-duplicate-ii/)

> 给定一个整数数组和一个整数  k，判断数组中是否存在两个不同的索引  i  和  j，使得  nums [i] = nums [j]，并且 i 和 j  的差的 绝对值 至多为 k。

思路：搞对象，建立一个对象存储值与索引，遍历数组，如果对象中没有该值的记录，则存入该值与其对应的索引，如果有记录，则判断当前索引与对象中记录的索引的差值是否小于 k，小于 k 则返回 true，若数组遍历完后还没有找到满足条件的项目，则直接返回 false

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var containsNearbyDuplicate = function(nums, k) {
  const map = {};
  const { length } = nums;
  for (let i = 0; i < length; i++) {
    const cur = nums[i];
    if (map[cur] >= 0 && i - map[cur] <= k) {
      return true;
    } else {
      map[cur] = i;
    }
  }
  return false;
};
```

---

## 汇总区间

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/summary-ranges/)

> 给定一个无重复元素的有序整数数组 nums 。  
> 返回 恰好覆盖数组中所有数字 的 最小有序 区间范围列表。也就是说，nums 的每个元素都恰好被某个区间范围所覆盖，并且不存在属于某个范围但不属于 nums 的数字 x 。

思路：不太好口述，直接看代码

```javascript
/**
 * @param {number[]} nums
 * @return {string[]}
 */
var summaryRanges = function(nums) {
  if (!nums.length) return [];
  if (nums.length === 1) return [nums[0] + ''];
  const { length } = nums;
  let start = nums[0];
  let range = 1;
  const res = [];
  for (let i = 1; i < length; i++) {
    if (start + range !== nums[i]) {
      range === 1
        ? res.push(start + '')
        : res.push(`${start}->${start + range - 1}`);
      start = nums[i];
      range = 1;
    } else {
      range++;
    }
    if (i === length - 1) {
      range > 1
        ? res.push(`${start}->${start + range - 1}`)
        : res.push(start + '');
    }
  }
  return res;
};
```

这是我自己写的代码，判断条件相对有点多，我觉得并不是最优的代码~

---

## 2 的幂

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/power-of-two/)

> 给定一个整数，编写一个函数来判断它是否是 2 的幂次方。

思路：用一个 while 循环，一直让那个数除以 2，如果能达到 1，则返回 true，如果这个数对 2 除余除不尽，直接返回 false

```javascript
/**
 * @param {number} n
 * @return {boolean}
 */
var isPowerOfTwo = function(n) {
  if (n <= 0) return false;
  while (n > 0) {
    if (n === 1) return true;
    if (n % 2) return false;
    n = n / 2;
  }
};
```

---

## 回文链表

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/palindrome-linked-list/)

> 请判断一个链表是否为回文链表。

思路：先遍历链表，用一个数组存储链表中所有结点的值，再遍历数组，判断当前索引 i 与对称索引 length - i - 1 的值是否相等，如果不相等说明不对称，直接返回 false，如果能遍历完整个数组，则说明是对称的，直接返回 true

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var isPalindrome = function(head) {
  const val = [];
  while (head) {
    val.push(head.val);
    head = head.next;
  }
  const { length } = val;
  for (let i = 0; i < length; i++) {
    if (val[i] !== val[length - i - 1]) {
      return false;
    }
  }
  return true;
};
```

---

## 二叉搜索树的最近公共祖先

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-search-tree/)

> 给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。

思路：如果 p.val 与 q.val 都比 root.val 小，那么 p, q 肯定在 root 左子树，此时递归左子树，如果 p.val 与 q.val 都比 root.val 大，同理递归右子树，其他情况，root 即为所求

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */

/**
 * @param {TreeNode} root
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {TreeNode}
 */
var lowestCommonAncestor = function(root, p, q) {
  if (p.val < root.val && q.val < root.val) {
    return lowestCommonAncestor(root.left, p, q);
  }
  if (p.val > root.val && q.val > root.val) {
    return lowestCommonAncestor(root.right, p, q);
  }
  return root;
};
```

其实这道题一开始没做出来，后来看了解析才恍然大悟的，我认为比较好理解的解析在这里 [传送门](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-search-tree/solution/di-gui-he-die-dai-fa-by-hyj8/)

---

## 有效的字母异位词

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/valid-anagram/)

> 给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。

思路：两个字符串异位等价于他们排序后相等，直接看代码

```javascript
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
  return (
    s
      .split('')
      .sort()
      .join('') ===
    t
      .split('')
      .sort()
      .join('')
  );
};
```

---

## 二叉树的所有路径

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/binary-tree-paths/)

> 给定一个二叉树，返回所有从根节点到叶子节点的路径。

思路：递归，先判断当前节点是不是叶子结点，如果当前节点的左子树和右子树都为空，那么就是叶子结点，如果是叶子结点，则给 path 拼接上当前叶子结点的值，如果不是叶子结点，则拼接上 `->` ，并继续递归左子树和右子树

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {string[]}
 */
var binaryTreePaths = function(root) {
  const res = [];
  const getPath = function(root, path) {
    if (root) {
      path += root.val.toString();
      if (!root.left && !root.right) {
        res.push(path);
      } else {
        path += '->';
        getPath(root.left, path);
        getPath(root.right, path);
      }
    }
  };
  getPath(root, '');
  return res;
};
```

---

## 各位相加

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/add-digits/)

> 给定一个非负整数 num，反复将各个位上的数字相加，直到结果为一位数。

思路：提取各位上的数字，求和，和大于 10 则继续递归即可

```javascript
/**
 * @param {number} num
 * @return {number}
 */
var addDigits = function(num) {
  if (num < 10) {
    return num;
  }
  let next = 0;
  while (num !== 0) {
    next += Math.floor(num % 10);
    num /= 10;
  }
  return addDigits(next);
};
```

---

## 丑数

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/ugly-number/)

> 编写一个程序判断给定的数是否为丑数。  
> 丑数就是只包含质因数 2, 3, 5 的正整数。

思路：看看这个数能不能被 2、3、5 整除，如果能整除则继续检查，看这个数被除后的结果是否能被 2、3、5 整除，不断检查，如果当前数字小于 6 则为丑数，返回 true，否则返回 false

```javascript
/**
 * @param {number} num
 * @return {boolean}
 */
var isUgly = function(num) {
  if (num <= 0) return false;
  while (num > 0) {
    if (num < 6) return true;
    if (num % 2 === 0) {
      num /= 2;
    } else if (num % 3 === 0) {
      num /= 3;
    } else if (num % 5 === 0) {
      num /= 5;
    } else {
      return false;
    }
  }
};
```

---

## 丢失的数字

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/missing-number/)

> 给定一个包含 [0, n] 中 n 个数的数组 nums ，找出 [0, n] 这个范围内没有出现在数组中的那个数。

思路：首先对这个数组进行排序，再遍历，如果索引值与当前值不匹配，说明索引值丢失，返回索引值，如果遍历结束还没有返回，说明最后一个数丢失，直接返回数组长度

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var missingNumber = function(nums) {
  const arr = nums.sort((a, b) => a - b);
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== i) return i;
  }
  return nums.length;
};
```

---

## 移动零

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/move-zeroes/)

> 给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

思路：变量 count 统计 0 的个数，遍历数组，遇到 0 则删除同时在数组末尾加入 0，count 加 1，如果不是 0 则继续往下遍历，当 i 大于或等于数组长度减去 count 时跳出循环

```javascript
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function(nums) {
  const { length } = nums;
  let i = 0;
  let count = 0;
  while (i < length - count) {
    if (nums[i] === 0) {
      nums.splice(i, 1);
      nums.push(0);
      count++;
    } else {
      i++;
    }
  }
  return nums;
};
```

---

## 单词规律

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/word-pattern/)

> 给定一种规律 pattern 和一个字符串 str ，判断 str 是否遵循相同的规律。  
> 这里的 遵循 指完全匹配，例如， pattern 里的每个字母和字符串 str 中的每个非空单词之间存在着双向连接的对应规律。

思路：哈希表，两用个哈希表记录相互之间的映射关系，如果出现了有冲突的映射，直接返回 false，如果遍历结束都没有出现冲突，返回 true

```javascript
/**
 * @param {string} pattern
 * @param {string} s
 * @return {boolean}
 */
var wordPattern = function(pattern, s) {
  const strArr = s.split(' ');
  const pattern2s = {};
  const s2pattern = {};
  for (let i = 0; i < s.length; i++) {
    const str = pattern[i];
    const word = strArr[i];
    if (
      (pattern2s[str] && pattern2s[str] !== word) ||
      (s2pattern[word] && s2pattern[word] !== str)
    ) {
      return false;
    }
    pattern2s[str] = word;
    s2pattern[word] = str;
  }
  return true;
};
```

---

## 3 的幂

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/power-of-three/)

> 给定一个整数，写一个函数来判断它是否是 3 的幂次方。如果是，返回 true ；否则，返回 false 。  
> 整数 n 是 3 的幂次方需满足：存在整数 x 使得 n == 3 的 x 次幂

思路：如果这个数不能被 3 除尽则直接返回 false，否则除以 3 继续判断，到最后结果为 0 返回 false，结果为 1 返回 true

```javascript
/**
 * @param {number} n
 * @return {boolean}
 */
var isPowerOfThree = function(n) {
  if (n <= 0) return false;
  while (n > 0) {
    if (n === 0) return false;
    if (n === 1) return true;
    if (n % 3 !== 0) return false;
    n /= 3;
  }
};
```

---

## 反转字符串

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/reverse-string/)

> 编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 char[] 的形式给出。  
> 不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。  
> 你可以假设数组中的所有字符都是 ASCII 码表中的可打印字符。

思路：双指针，从两侧向数组中间夹，每走一步交换一次值

```javascript
/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
  let head = 0;
  let tail = s.length - 1;
  while (head < tail) {
    [s[head], s[tail]] = [s[tail], s[head]];
    head++;
    tail--;
  }
  return s;
};
```

---

## 反转字符串中的元音字母

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/reverse-vowels-of-a-string/)

> 编写一个函数，以字符串作为输入，反转该字符串中的元音字母。

思路：双指针，头尾两个指针，不断往中间逼近，任意一个指针遇到元音字母，则停下，等到另一个指针也找到元音字母，此时，两个指针都指向元音字母，进行交换

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var reverseVowels = function(s) {
  const VOWEL_LIST = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
  let head = 0;
  let tail = s.length - 1;
  s = s.split('');
  while (head < tail) {
    const isHeadVowel = isVowel(s[head]);
    const isTailVowel = isVowel(s[tail]);
    if (isHeadVowel && isTailVowel) {
      [s[head], s[tail]] = [s[tail], s[head]];
      head++;
      tail--;
    }
    if (isHeadVowel && !isTailVowel) {
      tail--;
    }
    if (!isHeadVowel && isTailVowel) {
      head++;
    }
    if (!isHeadVowel && !isTailVowel) {
      head++;
      tail--;
    }
  }
  function isVowel(str) {
    return VOWEL_LIST.indexOf(str) !== -1;
  }
  return s.join('');
};
```

---

## 两个数组的交集

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/intersection-of-two-arrays/)

> 给定两个数组，编写一个函数来计算它们的交集。

思路：先对两个数组去重再排序，遍历长度短的那个数组，如果长度一样随便遍历一个，依次寻找当前元素是否在另一个数组中出现，出现则 push 到新数组中，最后把新数组返回

```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersection = function(nums1, nums2) {
  const arr1 = [...new Set(nums1)].sort((a, b) => a - b);
  const arr2 = [...new Set(nums2)].sort((a, b) => a - b);
  const res = [];
  const flag = arr1.length > arr2.length;
  const length = flag ? arr2.length : arr1.length;
  for (let i = 0; i < length; i++) {
    if (flag && arr1.includes(arr2[i])) {
      res.push(arr2[i]);
    }
    if (!flag && arr2.includes(arr1[i])) {
      res.push(arr1[i]);
    }
  }
  return res;
};
```

---

## 两个数组的交集 II

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/intersection-of-two-arrays-ii/)

> 给定两个数组，编写一个函数来计算它们的交集。

思路：双指针，先对两个数组进行排序，创建两个指针分别指向两个排序后的数组的头部，遍历数组，如果此时两个指针指向的数相等，则直接 push 到 res 中，两个指针都前进一步，如果此时两个指针指向的数不相等，则大的指针不动，小的前进一步，直到遍历结束

```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
  nums1.sort((a, b) => a - b);
  nums2.sort((a, b) => a - b);
  const res = [];
  let p1 = 0;
  let p2 = 0;
  while (p1 < nums1.length && p2 < nums2.length) {
    if (nums1[p1] > nums2[p2]) {
      p2++;
    } else if (nums1[p1] < nums2[p2]) {
      p1++;
    } else {
      res.push(nums1[p1]);
      p1++;
      p2++;
    }
  }
  return res;
};
```

---

## 有效的完全平方数

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/valid-perfect-square/)

> 给定一个正整数 num，编写一个函数，如果 num 是一个完全平方数，则返回 True，否则返回 False。  
> 说明：不要使用任何内置的库函数，如 sqrt。

思路：for 循环，从 0 一直到 num 的平方根(不让用 sqrt)，如果满足 i \* i === num 直接返回 true，遍历结束则返回 false

```javascript
/**
 * @param {number} num
 * @return {boolean}
 */
var isPerfectSquare = function(num) {
  for (let i = 0; i * i <= num; i++) {
    if (i * i === num) return true;
  }
  return false;
};
```

---

## 字符串中的第一个唯一字符

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/first-unique-character-in-a-string/)

> 给定一个字符串，找到它的第一个不重复的字符，并返回它的索引。如果不存在，则返回 -1。

思路：用一个对象记录各个单词出现的次数，找到只出现一次的字符返回其索引，没找到则返回 -1

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function(s) {
  const map = {};
  const { length } = s;
  for (let i = 0; i < length; i++) {
    const item = s[i];
    if (map[item]) {
      map[item]++;
    } else {
      map[item] = 1;
    }
  }
  const arr = Object.keys(map);
  const index = arr.findIndex((item) => map[item] === 1);
  if (index === -1) return -1;
  const item = arr[index];
  return s.indexOf(item);
};
```

---

## 找不同

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/find-the-difference/)

> 给定两个字符串 s 和 t，它们只包含小写字母。  
> 字符串 t 由字符串 s 随机重排，然后在随机位置添加一个字母。  
> 请找出在 t 中被添加的字母。

思路：先遍历 s，记录各个字符出现的次数，在遍历 t，每遍历到一个字符，记录的出现次数就减一，如果没有该字符出现次数的记录或次数为 0，直接返回该字符

```javascript
/**
 * @param {string} s
 * @param {string} t
 * @return {character}
 */
var findTheDifference = function(s, t) {
  const map = {};
  const { length } = s;
  for (let i = 0; i < length; i++) {
    const item = s[i];
    if (map[item]) {
      map[item]++;
    } else {
      map[item] = 1;
    }
  }
  for (let i = 0; i < t.length; i++) {
    const item = t[i];
    if (map[item]) {
      map[item]--;
    } else {
      return item;
    }
  }
};
```

---

## 数组中重复的数字

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof/)

> 找出数组中重复的数字。

思路：搞对象，遍历数组，用一个对象记录数组中各个值出现的次数，如果对象中出现重复的记录，直接返回该值

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findRepeatNumber = function(nums) {
  const { length } = nums;
  const map = {};
  for (let i = 0; i < length; i++) {
    const item = nums[i];
    if (map[item]) {
      return item;
    } else {
      map[item] = 1;
    }
  }
};
```

---

## 合并两个有序链表

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

> 将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

思路：先创建一个新链表，遍历 l1 和 l2，让新链表的 next 指针指向 l1 或 l2 值小的那个，若小的是 l1，则 l1 后移，l2 同理，同时 pre 后移，直到遍历结束后，返回新链表的 next

```javascript
var mergeTwoLists = function(l1, l2) {
  const prehead = new ListNode(-1);
  let pre = prehead;
  while (l1 !== null && l2 !== null) {
    if (l2.val > l1.val) {
      pre.next = l1;
      l1 = l1.next;
    } else {
      pre.next = l2;
      l2 = l2.next;
    }
    pre = pre.next;
  }
  pre.next = l1 === null ? l2 : l1;
  return prehead.next;
};
```

---

## 从尾到头打印链表

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/cong-wei-dao-tou-da-yin-lian-biao-lcof/)

> 输入一个链表的头节点，从尾到头反过来返回每个节点的值（用数组返回）。

思路：遍历链表，用一个数组记录链表中各个节点的值，最后将这个数组反转并返回

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {number[]}
 */
var reversePrint = function(head) {
  const res = [];
  while (head) {
    res.push(head.val);
    head = head.next;
  }
  return res.reverse();
};
```

---

## 二叉搜索树中的搜索

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/search-in-a-binary-search-tree/)

> 给定二叉搜索树（BST）的根节点和一个值。 你需要在 BST 中找到节点值等于给定值的节点。 返回以该节点为根的子树。 如果节点不存在，则返回 NULL。

思路：递归，如果给定值比当前节点的值大，递归右子树，如果给定值比当前节点的值小，递归左子树，如果相等则直接返回这一整棵树

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} val
 * @return {TreeNode}
 */
var searchBST = function(root, val) {
  if (!root) return root;
  if (root.val === val) return root;
  return root.val > val
    ? searchBST(root.left, val)
    : searchBST(root.right, val);
};
```

---

## 旋转数组的最小数字

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/xuan-zhuan-shu-zu-de-zui-xiao-shu-zi-lcof/)

> 把一个数组最开始的若干个元素搬到数组的末尾，我们称之为数组的旋转。输入一个递增排序的数组的一个旋转，输出旋转数组的最小元素。例如，数组  [3,4,5,1,2] 为 [1,2,3,4,5] 的一个旋转，该数组的最小值为 1。

思路：遍历数组，只要出现不是递增的元素，直接返回该元素的值，若遍历结束，则返回第一个元素

```javascript
/**
 * @param {number[]} numbers
 * @return {number}
 */
var minArray = function(numbers) {
  const { length } = numbers;
  let last = -Infinity;
  for (let i = 0; i < length; i++) {
    if (numbers[i] >= last) {
      last = numbers[i];
    } else {
      return numbers[i];
    }
  }
  return numbers[0];
};
```

---

## 二进制中 1 的个数

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/er-jin-zhi-zhong-1de-ge-shu-lcof/)

> 请实现一个函数，输入一个整数（以二进制串形式），输出该数二进制表示中 1 的个数。例如，把 9  表示成二进制是 1001，有 2 位是 1。因此，如果输入 9，则该函数输出 2。

思路：对于输入的整数，调用 `toString(2)` 转换成 2 进制，再用正则匹配 1，统计 1 的个数

```javascript
/**
 * @param {number} n - a positive integer
 * @return {number}
 */
var hammingWeight = function(n) {
  const list = n.toString(2).match(/1/g);
  return list ? list.length : 0;
};
```

---

## 打印从 1 到最大的 n 位数

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/da-yin-cong-1dao-zui-da-de-nwei-shu-lcof/)

> 输入数字 n，按顺序打印出从 1 到最大的 n 位十进制数。比如输入 3，则打印出 1、2、3 一直到最大的 3 位数 999。

思路：先算出最大值，即为 10 的 n 次方减一，for 循环把数字装入一个数组中，最后将数组返回

```javascript
/**
 * @param {number} n
 * @return {number[]}
 */
var printNumbers = function(n) {
  const res = [];
  const max = Math.pow(10, n);
  for (let i = 1; i < max; i++) {
    res.push(i);
  }
  return res;
};
```

---

## 删除链表的节点

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/shan-chu-lian-biao-de-jie-dian-lcof/)

> 给定单向链表的头指针和一个要删除的节点的值，定义一个函数删除该节点。

思路：先创建一个哑结点接入链表，遍历链表，找到要删除的节点，删掉后将哑结点的 next 返回

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} val
 * @return {ListNode}
 */
var deleteNode = function(head, val) {
  const list = new ListNode(-1);
  list.next = head;
  let prev = list;
  while (prev.next) {
    if (prev.next.val === val) {
      prev.next = prev.next.next;
      break;
    }
    prev = prev.next;
  }
  return list.next;
};
```

---

## 调整数组顺序使奇数位于偶数前面

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/diao-zheng-shu-zu-shun-xu-shi-qi-shu-wei-yu-ou-shu-qian-mian-lcof/)

思路：遍历数组，如果是奇数就放到奇数数组中，如果是偶数就放到偶数数组中，按规定返回即可

```javascript
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var exchange = function(nums) {
  const { length } = nums;
  const odd = [];
  const even = [];
  for (let i = 0; i < length; i++) {
    nums[i] % 2 ? odd.push(nums[i]) : even.push(nums[i]);
  }
  return [...odd, ...even];
};
```

思路 2：双指针，让两个指针分别指向头和尾，判断头指针是不是奇数，如果是，则头指针后移，如果不是，再判断尾指针是不是奇数，如果是奇数，则头尾指针交换，否则尾指针前移

```javascript
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var exchange = function(nums) {
  const { length } = nums;
  let start = 0;
  let end = length - 1;
  while (end > start) {
    if (!isOdd(nums[start])) {
      if (isOdd(nums[end])) {
        [nums[start], nums[end]] = [nums[end], nums[start]];
      }
      end--;
    } else {
      start++;
    }
  }
  function isOdd(num) {
    return num % 2;
  }
  return nums;
};
```

---

## 链表中倒数第 k 个节点

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/lian-biao-zhong-dao-shu-di-kge-jie-dian-lcof/)

思路：快慢指针，让快指针先走 k 步，慢指针才开始走，这样一来，快指针走到链表末尾的时候，慢指针刚好走到倒数第 k 个节点

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
var getKthFromEnd = function(head, k) {
  const list = new ListNode(-1);
  list.next = head;
  let fast = list;
  let slow = list;
  while (fast.next) {
    fast = fast.next;
    k--;
    if (k <= 0) {
      slow = slow.next;
    }
  }
  return slow;
};
```

---

## 反转链表

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/fan-zhuan-lian-biao-lcof/)

思路：口头比较难叙述，直接看代码

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
  let prev = null;
  let cur = head;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
};
```

---

## 合并两个排序的链表

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/he-bing-liang-ge-pai-xu-de-lian-biao-lcof/)

思路：新建一个空列表依次接入两个链表中小的值

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var mergeTwoLists = function(l1, l2) {
  const list = new ListNode(-1);
  let head = list;
  while (l1 && l2) {
    if (l1.val > l2.val) {
      head.next = l2;
      l2 = l2.next;
    } else {
      head.next = l1;
      l1 = l1.next;
    }
    head = head.next;
  }
  head.next = l1 === null ? l2 : l1;
  return list.next;
};
```

---

## 二叉树的镜像

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/er-cha-shu-de-jing-xiang-lcof/)

思路：递归，先交换当前节点的左右子树节点，在依次递归左右子树即可

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var mirrorTree = function(root) {
  if (!root) {
    return null;
  }
  [root.left, root.right] = [root.right, root.left];
  mirrorTree(root.left);
  mirrorTree(root.right);
  return root;
};
```

---

## 对称的二叉树

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/dui-cheng-de-er-cha-shu-lcof/)

思路：递归，判断一棵树是否是对称的，即它左子树节点的值和它的右子树节点的值相等，依次递归

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isSymmetric = function(root) {
  function isMirror(r1, r2) {
    if (!r1 && !r2) {
      return true;
    }
    if (!r1 || !r2) {
      return false;
    }
    return (
      r1.val === r2.val &&
      isMirror(r1.left, r2.right) &&
      isMirror(r1.right, r2.left)
    );
  }
  return isMirror(root, root);
};
```

---

## 从上到下打印二叉树 II

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/)

思路：队列循环，直接看代码

```javascript
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
  if (!root) return [];
  const queue = [root];
  const res = [];
  let level = 0;
  while (queue.length) {
    res[level] = [];
    let levelNum = queue.length;
    while (levelNum--) {
      const front = queue.shift();
      res[level].push(front.val);
      if (front.left) queue.push(front.left);
      if (front.right) queue.push(front.right);
    }
    level++;
  }
  return res;
};
```

这题其实一开始我并没有做出来，后来看了解析才恍然大悟的 [解析](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/solution/jie-zhu-dui-lie-zai-jie-guo-zhong-ti-xian-chu-ceng/)

---

## 数组中出现次数超过一半的数字

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/shu-zu-zhong-chu-xian-ci-shu-chao-guo-yi-ban-de-shu-zi-lcof/)

思路：用一个对象记录各个数字出现的次数，如果有数字出现的次数大于数组长度的一半，直接返回

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function(nums) {
  const { length } = nums;
  if (length <= 1) return nums[0];
  const map = {};
  for (let i = 0; i < length; i++) {
    const item = nums[i];
    if (map[item]) {
      map[item]++;
      if (map[item] > Math.floor(length / 2)) return item;
    } else {
      map[item] = 1;
    }
  }
};
```

看了别人的解答后，发现还有一种不错的思路 [传送门](https://leetcode-cn.com/problems/shu-zu-zhong-chu-xian-ci-shu-chao-guo-yi-ban-de-shu-zi-lcof/solution/yi-dong-jsliang-xing-jie-jue-jian-zhi-of-371h/)

---

## 连续子数组的最大和

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/lian-xu-zi-shu-zu-de-zui-da-he-lcof/)

思路：动态规划，遍历数组，当遍历到第 i 个的时候，如果前 i - 1 个的和大于 0，则累加，否则置为 0 并重新计数，求出最大值即可，可以这样理解，如果前 i - 1 个的和大于 0，说明前 i - 1 个元素有正贡献，暂时保留，如果前 i - 1 个的和小于 0，说明前 i - 1 个元素是负贡献，重新计数

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
  let { length } = nums;
  let res = nums[0];
  for (let i = 1; i < length; i++) {
    nums[i] += Math.max(nums[i - 1], 0);
    res = Math.max(res, nums[i]);
  }
  return res;
};
```

---

## 第一个只出现一次的字符

这是 leetCode 的一道题，[传送门](https://leetcode-cn.com/problems/di-yi-ge-zhi-chu-xian-yi-ci-de-zi-fu-lcof/)

思路：哈希表，遍历字符串，用一个对象记录各个字符出现的次数，找一下有没有出现一次的，有则将该字符返回，没有则返回空字符串

```javascript
/**
 * @param {string} s
 * @return {character}
 */
var firstUniqChar = function(s) {
  const map = {};
  const { length } = s;
  for (let i = 0; i < length; i++) {
    const item = s[i];
    if (map[item]) {
      map[item]++;
    } else {
      map[item] = 1;
    }
  }
  const arr = Object.keys(map);
  for (const key of arr) {
    if (map[key] === 1) return key;
  }
  return ' ';
};
```
