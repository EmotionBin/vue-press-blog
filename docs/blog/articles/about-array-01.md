# 关于数组的一些思考

数组是一个特别常见的存储结构，本文来讨论一下数组去重、数组排序以及 Vue 中关于数组的响应式监听

---

## 数组去重

数组又分为简单数组和复杂数组，简单数组就是一维数组，复杂数组可能会嵌套对象等

---

### 简单数组去重

为了方便对比，在数组最后两个元素加入了两个空对象`{}`，严格意义上说，这并不算是简单数组

---

#### 双重 for 循环 + splice

```javascript
function unique(arr) {
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i] === array[j]) {
        array.splice(j, 1);
        j--;
      }
    }
  }
  return arr;
}
const array = [
  1,
  1,
  'true',
  'true',
  'true',
  true,
  true,
  15,
  15,
  false,
  false,
  undefined,
  undefined,
  null,
  null,
  NaN,
  NaN,
  'NaN',
  0,
  0,
  'a',
  'a',
  {},
  {},
];
console.log(unique(array));
//[1, "true", true, 15, false, undefined, null, NaN, NaN, "NaN", 0, "a", {}, {}]
```

可以发现利用这种方法进行去重时，无法去除`NaN`和`{}`

---

#### 双重 for 循环

```javascript
function unique(arr) {
  const res = [];
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < res.length; j++) {
      if (res[j] === arr[i]) break;
    }
    if (res.length === j) res.push(arr[i]);
  }
  return res;
}
const array = [
  1,
  1,
  'true',
  'true',
  'true',
  true,
  true,
  15,
  15,
  false,
  false,
  undefined,
  undefined,
  null,
  null,
  NaN,
  NaN,
  'NaN',
  0,
  0,
  'a',
  'a',
  {},
  {},
];
console.log(unique(array));
//[1, "true", true, 15, false, undefined, null, NaN, NaN, "NaN", 0, "a", {}, {}]
```

这种方法也无法去除`NaN`和`{}`

---

#### for 循环 + indexOf

```javascript
function unique(arr) {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (res.indexOf(arr[i]) === -1) res.push(arr[i]);
  }
  return res;
}
const array = [
  1,
  1,
  'true',
  'true',
  'true',
  true,
  true,
  15,
  15,
  false,
  false,
  undefined,
  undefined,
  null,
  null,
  NaN,
  NaN,
  'NaN',
  0,
  0,
  'a',
  'a',
  {},
  {},
];
console.log(unique(array));
// [1, "true", true, 15, false, undefined, null, NaN, NaN, "NaN", 0, "a", {}, {}]
```

这种方法也对`NaN`和`{}`无效

---

#### for 循环 + includes

```javascript
function unique(arr) {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (!res.includes(arr[i])) res.push(arr[i]);
  }
  return res;
}
const array = [
  1,
  1,
  'true',
  'true',
  'true',
  true,
  true,
  15,
  15,
  false,
  false,
  undefined,
  undefined,
  null,
  null,
  NaN,
  NaN,
  'NaN',
  0,
  0,
  'a',
  'a',
  {},
  {},
];
console.log(unique(array));
//[1, "true", true, 15, false, undefined, null, NaN, "NaN", 0, "a", {}, {}]
```

这种方法可以有效的对`NaN`进行去重，但是仍然无法对`{}`去重

---

#### filter + indexOf

```javascript
function unique(arr) {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}
const array = [
  1,
  1,
  'true',
  'true',
  'true',
  true,
  true,
  15,
  15,
  false,
  false,
  undefined,
  undefined,
  null,
  null,
  NaN,
  NaN,
  'NaN',
  0,
  0,
  'a',
  'a',
  {},
  {},
];
console.log(unique(array));
//[1, "true", true, 15, false, undefined, null, "NaN", 0, "a", {}, {}]
```

根据得到的结果，发现原来的`NaN`直接被忽略掉了，无法对`{}`去重

---

#### es6 的 Set

```javascript
function unique(arr) {
  return [...new Set(arr)];
}
const array = [
  1,
  1,
  'true',
  'true',
  'true',
  true,
  true,
  15,
  15,
  false,
  false,
  undefined,
  undefined,
  null,
  null,
  NaN,
  NaN,
  'NaN',
  0,
  0,
  'a',
  'a',
  {},
  {},
];
console.log(unique(array));
//[1, "true", true, 15, false, undefined, null, NaN, "NaN", 0, "a", {}, {}]
```

这种方法代码最少，对`NaN`可以有效去重，无法对`{}`去重

---

### 复杂数组去重

复杂数组即在数组中嵌套了对象，下面会详细讨论根据对象中指定的`key`去重

---

#### filter + findIndex

```javascript
function unique(arr, key) {
  return arr.filter((item, index, self) => {
    const targetIndex = self.findIndex((el) => el[key] === item[key]);
    return targetIndex === index;
  });
}
const array = [
  {
    name: '小明',
    age: 10,
    tall: 180,
  },
  {
    name: '小明',
    age: 12,
    tall: 170,
  },
  {
    name: '小红',
    age: 10,
    tall: 180,
  },
  {
    name: '小明',
    age: 10,
    tall: 180,
  },
  {
    name: '小明',
    age: 10,
    tall: 180,
  },
];
console.log(unique(array, 'name'));
//[{name:'小明',age:10,tall:180},{name:'小红',age:10,tall:180}]
```

可以看到，在这个对象数组中，对象中的`name`属性值为`小明`的被去重了，只留一下了一个

---

#### for 循环

```javascript
function unique(arr, key) {
  const res = [];
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i][key]]) {
      res.push(arr[i]);
      obj[arr[i][key]] = true;
    }
  }
  return res;
}
const array = [
  {
    name: '小明',
    age: 10,
    tall: 180,
  },
  {
    name: '小明',
    age: 12,
    tall: 170,
  },
  {
    name: '小红',
    age: 10,
    tall: 180,
  },
  {
    name: '小明',
    age: 10,
    tall: 180,
  },
  {
    name: '小明',
    age: 10,
    tall: 180,
  },
];
console.log(unique(array, 'name'));
//[{name:'小明',age:10,tall:180},{name:'小红',age:10,tall:180}]
```

这种方法需要开辟相对比较多的新空间，比较占用资源，不太推荐

---

## 数组排序

### 冒泡排序

```javascript
const arr = [5, 23, 89, 42, 1, 20, 6, 2, 46, 51, 88, 12, 64, 3, 100];
for (let i = 0; i < arr.length; i++) {
  for (let j = i + 1; j < arr.length; j++) {
    if (arr[i] > arr[j]) {
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
}
console.log(arr);
// [1, 2, 3, 5, 6, 12, 20, 23, 42, 46, 51, 64, 88, 89, 100]
```

冒泡排序的大概思路是，双重`for`循环，第一遍`for`循环先遍历数组中的各个元素，第二遍`for`循环遍历数组中除了这个元素本身的其他元素，通过对比大小来互换位置

---

### sort

```javascript
const arr = [5, 23, 89, 42, 1, 20, 6, 2, 46, 51, 88, 12, 64, 3, 100];
arr.sort((x, y) => x - y);
console.log(arr);
// [1, 2, 3, 5, 6, 12, 20, 23, 42, 46, 51, 64, 88, 89, 100]
```

`sort()`方法排序的时候是按照**字符串**顺序进行排序的，所以使用的时候需要格外注意这一点，即使要排序的数组里面全是`number`类型的值，它也会先转换成字符串再进行排序，所以在对`number`数组进行排序的时候需要传入参数，看这个例子就知道了

---

### 快速排序

```javascript
const arr = [5, 23, 89, 42, 1, 20, 6, 2, 46, 51, 88, 12, 64, 3, 100];
function quickSort(arr) {
  //如果数组中元素只有一个，直接返回
  if (arr.length <= 1) {
    return arr;
  }
  //记录中间数的索引值，向下取整
  const midIndex = Math.floor(arr.length / 2);
  //记录中间数的值
  const midValue = arr.splice(midIndex, 1);
  const left = [],
    right = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < midValue) {
      //小于中间值的放到左边
      left.push(arr[i]);
    } else {
      //大于中间值的放到右边
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat(midValue, quickSort(right));
}
console.log(quickSort(arr));
// [1, 2, 3, 5, 6, 12, 20, 23, 42, 46, 51, 64, 88, 89, 100]
```

快速排序的思路就是：先记录数组中间数的索引和值，遍历数组，小于这个值的放到左边，大于这个值的放到右边，再对左边数组和右边数组进行递归，数组元素只剩下一个的时候设置递归出口

---

### 插入排序

```javascript
const arr = [5, 23, 89, 42, 1, 20, 6, 2, 46, 51, 88, 12, 64, 3, 100];
function Insertion(arr) {
  const { length } = arr;
  let preIndex, current;
  for (let i = 1; i < length; i++) {
    preIndex = i - 1;
    current = arr[i];
    while (preIndex >= 0 && current < arr[preIndex]) {
      arr[preIndex + 1] = arr[preIndex];
      preIndex--;
    }
    arr[preIndex + 1] = current;
  }
  return arr;
}
console.log(Insertion(arr));
// [1, 2, 3, 5, 6, 12, 20, 23, 42, 46, 51, 64, 88, 89, 100]
```

思路:

1. 从第一个元素开始，该元素可以认为已经被排序
2. 取出下一个元素，在已经排序的元素序列中从后向前扫描
3. 如果该元素（已排序）大于新元素，将该元素移到下一位置
4. 重复步骤 3，直到找到已排序的元素小于或者等于新元素的位置
5. 将新元素插入到该位置后
6. 重复步骤 2~5

我在网上看到了一个挺不错的例子，里面还有动图演示，可以看看 [转送门](https://www.cnblogs.com/cc-freiheit/p/10983395.html)

---

### 选择排序

```javascript
const arr = [5, 23, 89, 42, 1, 20, 6, 2, 46, 51, 88, 12, 64, 3, 100];
function selsetSort(arr) {
  const { length } = arr;
  let index;
  for (var i = 0; i < length - 1; i++) {
    index = i;
    for (var j = i + 1; j < length; j++) {
      //寻找最小值
      if (arr[index] > arr[j]) {
        //保存最小值的索引
        index = j;
      }
    }
    if (index != i) {
      var temp = arr[i];
      arr[i] = arr[index];
      arr[index] = temp;
    }
  }
  return arr;
}
console.log(selsetSort(arr));
// [1, 2, 3, 5, 6, 12, 20, 23, 42, 46, 51, 64, 88, 89, 100]
```

思路:

1. 假设未排序序列的第一个是最大值，记下该元素的位置，从前往后比较
2. 若某个元素比该元素大，覆盖之前的位置
3. 重复第二个步骤，直到找到未排序的末尾
4. 将未排序元素的第一个元素和最大元素交换位置
5. 重复前面几个步骤，直到所有元素都已经排序

---

### 希尔排序

```javascript
const arr = [5, 23, 89, 42, 1, 20, 6, 2, 46, 51, 88, 12, 64, 3, 100];
function shellSort(arr) {
  var { length } = arr;
  gap = Math.floor(length / 2);
  while (gap !== 0) {
    for (var i = gap; i < length; i++) {
      var temp = arr[i];
      var j;
      for (j = i - gap; j >= 0 && temp < arr[j]; j -= gap) {
        arr[j + gap] = arr[j];
      }
      arr[j + gap] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  return arr;
}
console.log(shellSort(arr));
// [1, 2, 3, 5, 6, 12, 20, 23, 42, 46, 51, 64, 88, 89, 100]
```

希尔排序的算法思想就是把数据分组，比如十个数据可以分为五组，每组两个元素，对这五个组分别进行排序，再继续把排序后的数据分成两个组，每组五个元素，再进行排序，不断重复....直到最后只有一个组的时候，直接进行排序，这里有比较详细的图解 [转送门](https://blog.csdn.net/Macuroon/article/details/80560504)

---

## 数组查找

### 顺序查找

```javascript
const arr = [5, 23, 89, 42, 1, 20, 6, 2, 46, 51, 88, 12, 64, 3, 100];
function sequenceSearch(arr, target) {
  const { length } = arr;
  for (let i = 0; i < length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
console.log(sequenceSearch(arr, 20));
// 5
```

通过一个`for`循环遍历数组，如果找到了对应的元素就返回该元素的索引，否则返回-1

优点：

- 顺序查找也称为线形查找，属于无序查找算法，对于数组元素的排序没有特别要求

缺点：

- 需要依次对数组中的元素作比较，效率较低

---

### 二分法

```javascript
const arr = [1, 2, 3, 5, 6, 12, 20, 23, 42, 46, 51, 64, 88, 89, 100];
function binarySearch(arr, target) {
  let start = 0,
    end = arr.length,
    midIndex,
    midValue;
  while (start <= end) {
    midIndex = Math.floor((start + end) / 2);
    midValue = arr[midIndex];
    if (midValue === target) {
      return midIndex;
    } else if (midValue < target) {
      start = midIndex;
    } else if (midValue > target) {
      end = midIndex;
    }
  }
  return -1;
}
console.log(binarySearch(arr, 20));
// 6
```

算法思想：

1. 取数组的中间元素，用中间元素和目标值比较
2. 如果中间元素和目标值相等，返回中间元素索引
3. 如果中间元素比目标值小，则在中间元素至数组最后一个元素中继续查找
4. 如果中间元素比目标值大，则在数组开始元素至中间元素中继续查找
5. 不断重复前面的过程

优点：

- 效率较高

缺点：

- 要求数组必须为有序数组

---

## 数组扁平化

### while + some + concat

```javascript
const arr = [1, 2, ['a', 'b', ['中', '文', [1, 2, 3, [11, 21, 31]]]], 3];
function myFlat(arr) {
  while (arr.some((item) => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
}
console.log(myFlat(arr));
// [1 ,2, 'a', 'b', '中', '文', 1, 2, 3, 11, 21, 31, 3]
```

思路就是如果当前数组中嵌套了数组，就把这个嵌套的数组用 es6 的拓展运算符(...)展开，再用`concat`拼接

---

### 递归

```javascript
const arr = [1, 2, ['a', 'b', ['中', '文', [1, 2, 3, [11, 21, 31]]]], 3];
function myFlat(arr) {
  const res = [];
  const { length } = arr;
  for (let i = 0; i < length; i++) {
    const item = arr[i];
    if (Array.isArray(item)) {
      res.push(...myFlat(item));
    } else {
      res.push(item);
    }
  }
  return res;
}
console.log(myFlat(arr));
// [1 ,2, 'a', 'b', '中', '文', 1, 2, 3, 11, 21, 31, 3]
```

思路就是遍历数组，如果当前数组元素还是一个数组，则递归处理，否则直接`push`

---

### es6 的 flat

```javascript
const arr = [1, 2, ['a', 'b', ['中', '文', [1, 2, 3, [11, 21, 31]]]], 3];
console.log(arr.flat(Infinity));
// [1 ,2, 'a', 'b', '中', '文', 1, 2, 3, 11, 21, 31, 3]
```

es6 的`flat`和`flatMap`虽然好用，但是要注意它的兼容性，`chrome`浏览器版本至少要在**69**及以上

---

## 数组集合

### 数组的交集

```javascript
const arr1 = [1, 2, 3, 4, 5, 6];
const arr2 = [5, 6, 7, 8, 9, 10];
function intersection(arr1, arr2) {
  return arr1.filter((item) => arr2.includes(item));
}
console.log(intersection(arr1, arr2));
// [5, 6]
```

---

### 数组的并集

```javascript
const arr1 = [1, 2, 3, 4, 5, 6];
const arr2 = [5, 6, 7, 8, 9, 10];
function union(arr1, arr2) {
  return [...new Set([...arr1, ...arr2])];
}
console.log(union(arr1, arr2));
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

---

### 数组的差集

这里只是举个例子，计算 arr1 相对于 arr2 的差集

```javascript
const arr1 = [1, 2, 3, 4, 5, 6];
const arr2 = [5, 6, 7, 8, 9, 10];
function diff(arr1, arr2) {
  return arr1.filter((item) => !arr2.includes(item));
}
console.log(diff(arr1, arr2));
// [1, 2, 3, 4]
```

---

## 如何判断是不是数组

在 js 中，数组和对象都是引用类型，如果用 `typeof` 来判断一个变量是不是数组，这是不可行的，因为用它判断数组和对象输出都是 `object`

```javascript
var a = [];
typeof a; // "object"

var b = {};
typeof b; // "object"
```

那么应该如何去准确的判断一个变量是不是数组呢，下面给出一些方法

**instanceof**

`instanceof` 用于判断该实例是否由某一个构造函数创建出来的，返回一个布尔值

```javascript
var a = [];
a instanceof Array; // true
```

**constructor**

实例的构造函数属性 `constructor` 指向构造函数，所以通过 `constructor` 可以判断该实例的构造函数是什么

```javascript
var a = [];
a.constructor === Array; // true
```

**Object.prototype.toString.call()**

调用 `Object` 原型链属性 `toString()` 方法用于输出该对象，再使用 `call` 强绑定改变 `this` 指向

```javascript
var a = [];
Object.prototype.toString.call(a) === '[object Array]'; // true
```

**Array.isArray()**

`Array.isArray` 是原生自带的方法，也可以用于判断是否是数组，返回一个布尔值

```javascript
var a = [];
Array.isArray(a); // true
```

---

## 数组合并

### 合并两个有序数组

对于两个有序的数组，要将他们合并到一个数组中，最快的方法可能是**双指针法**，假设是从小到大排序，同时遍历两个数组，把两个数组当前的元素作比较，大的加入到数组末尾，指针左移.....

说的可能有点抽象，下面来直接看代码，其实这是 LeetCode 上的一道题：

> 88. 合并两个有序数组  
>     给你两个有序整数数组 nums1 和 nums2，请你将 nums2 合并到 nums1 中，使 nums1 成为一个有序数组。
>
> 说明：
>
> - 初始化 nums1 和 nums2 的元素数量分别为 m 和 n 。
> - 你可以假设 nums1 有足够的空间（空间大小大于或等于 m + n）来保存 nums2 中的元素。
>
> 示例：  
>  输入：  
>  nums1 = [1,2,3,0,0,0], m = 3  
>  nums2 = [2,5,6], n = 3  
>  输出：[1,2,2,3,5,6]

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

这里有两个指针，index1 和 index2 分别指向 nums1 和 nums2 中元素的末尾，有一个指针 tail，直接指向 num1 的末尾(可以假设 nums1 有足够的空间(空间大小大于或等于 m + n))，两个数组一起遍历，比较 index1 和 index2 当前指向元素的大小，大的赋值给 tail 指针指向的元素，并且大的元素的指针左移一位，tail 指针也左移一位，直到 index2 小于 0，遍历结束

---

## Vue 对于数组的响应式监听

### Vue 对数组监听的坑

Vue 对于数组的监听会有一定的弊端，这是官网的说明：

> Vue 不能检测以下数组的变动：
>
> 当你利用索引直接设置一个数组项时，例如：vm.items[indexOfItem] = newValue  
> 当你修改数组的长度时，例如：vm.items.length = newLength

看一下这个官网的例子：

```javascript
var vm = new Vue({
  data: {
    items: ['a', 'b', 'c'],
  },
});
vm.items[1] = 'x'; // 不是响应性的
vm.items.length = 2; // 不是响应性的
```

---

### 对于 Vue 不能对数组响应式监听的解决办法

1. `Vue.set(vm.items, indexOfItem, newValue)`或`vm.$set(vm.items, indexOfItem, newValue)`
2. 使用部分数组操作方法，如`splice()`、`push()`、`pop()`等，使用这些方法操作数组可以触发更新
3. 替换原数组，使用如`map()`、`filter()`等方法返回新数组，再把原数组用新数组替换掉

---

### Vue 为什么要对数组做这样的设计

Vue 的双向绑定是通过`Object.defineProperty`给对象添加`getter`和`setter`方法实现的

是不是因为`Object.defineProperty`对数组失效呢?下面来看一段代码:

```javascript
var array = ['a', 'b'];

// 枚举数组各项，试图设置各项的getter，setter，
for (var i = 0, len = array.length; i < len; i++) {
  // 数组的index就相当于对象的属性
  Object.defineProperty(array, i, {
    get: function() {
      console.log('trigger subscription');
    },
    set: function() {
      // 数组项变动触发通知
      console.log('trigger notify');
    },
  });
}

array[0] = 'x'; // 输出 trigger notify
```

事实证明，是可以通过`array[index] = newValue`这样的方式触发响应的。那 Vue 为什么不这样做呢？

1. 试想一下，如果数组有 100 个元素，对数组内的每个元素都这样设置，会很笨拙，也会很损耗性能
2. `Javascript`的数组是可变的，可以通过`array[index] = value`添加数组项，而`Object.defineProperty`是针对已有项的设置，新加的项是不会被 `Object.definePropert`设置的，也就不会触发响应更新了

正因为以上原因，Vue 没有对数组进行响应式的监听，对象可以响应式的监听是因为我们在创建 Vue 实例的时候，data 中的属性是预先定义好了的，Vue 会去遍历 data 中的属性添加数据劫持

既然数组不是响应式的，那么为什么`splice()`、`push()`这些方法改变数据可以被监听到呢？实际上，是因为 Vue 对部分数组方法（pop, push, shift, unshift, splice, sort, reverse）进行了重写，可以在浏览器控制台打印一个 Vue 实例中 data 的属性，再打印一个普通数组进行对比，比如下面这段代码：

```javascript
const vm = new Vue({
  el: '#app',
  data: {
    items: ['a', 'b', 'c'],
  },
});
const test = ['a', 'b', 'c'];
console.log(vm.items, test);
```

这段代码创建了一个 Vue 实例，并打印了 Vue 实例中的数组和一个普通数组，在控制台点开它们的`__proto__`属性就会发现，Vue 实例中的部分数组方法果然被重写了

---

### 小结

Vue 不能检测到以元素赋值方式的数组变动是因为：

1. 动态添加的数组项不能被劫持生成`getter`，`setter`，因此无法产生响应
2. 给数组每一项做劫持，性能低且笨拙

---

## 结束语

在开发的过程中，经常会遇到数组，而且还要对数组进行一些对应的操作，比如增删改查等，能熟练运用这些方法，就可以大大提高我们的开发效率。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[掘金-Vue 为什么不能检测到以元素赋值方式的数组变动](https://juejin.im/post/5e002644e51d45581054216a)
