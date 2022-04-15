# 事件冒泡、事件捕获、事件委托

词穷就不多逼逼了，本文来了解一下 JavaScript 中的事件冒泡、事件捕获、事件委托机制

---

## 事件冒泡与事件捕获

**事件冒泡**就是从当前触发的事件目标一级一级往上传递，依次触发，直到 document 为止

单纯的看定义可能会有点抽象，举个例子，其实就像我敲击了一下键盘，我在敲击键盘的同时，我是不是也敲击了这台电脑

我用代码写了一个 demo，看完这个 demo 或许就明白了

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style type="text/css">
      #box1 {
        width: 300px;
        height: 300px;
        background: blueviolet;
      }
      #box2 {
        width: 200px;
        height: 200px;
        background: aquamarine;
      }
      #box3 {
        width: 100px;
        height: 100px;
        background: tomato;
      }
      div {
        overflow: hidden;
        margin: 50px auto;
      }
    </style>
  </head>
  <body>
    <div id="box1">
      <div id="box2">
        <div id="box3"></div>
      </div>
    </div>
  </body>
  <script>
    function sayBox3() {
      console.log('你点了最里面的box');
    }
    function sayBox2() {
      console.log('你点了最中间的box');
    }
    function sayBox1() {
      console.log('你点了最外面的box');
    }
    // 事件监听，第三个参数是布尔值，默认false，false是事件冒泡，true是事件捕获
    document.getElementById('box3').addEventListener('click', sayBox3, false);
    document.getElementById('box2').addEventListener('click', sayBox2, false);
    document.getElementById('box1').addEventListener('click', sayBox1, false);
  </script>
</html>
```

这里一共有三个盒子，结构都是父子关系，分别绑定了打印事件，现在我们来点击最中间的红色盒子

[![Bglvo6.png](https://s1.ax1x.com/2020/11/04/Bglvo6.png)](https://s1.ax1x.com/2020/11/04/Bglvo6.png)

可以在控制台中看到打印的结果，虽然我们只是点击了最里面的红色盒子，但是它外层的绿色盒子与紫色盒子也被触发了打印事件，**触发的顺序是 红色->绿色->紫色**，这种现象就是事件冒泡

接下来，修改代码，把事件冒泡改成事件捕获

```javascript
...
// 事件监听，第三个参数是布尔值，默认false，false是事件冒泡，true是事件捕获
document.getElementById('box3').addEventListener('click', sayBox3, true);
document.getElementById('box2').addEventListener('click', sayBox2, true);
document.getElementById('box1').addEventListener('click', sayBox1, true);
...
```

再次点击最中间的红色盒子，和上次一样，它外层的绿色盒子与紫色盒子也被触发了打印事件，但是顺序刚好反过来了，**紫色->绿色->红色**，这种现象就是事件捕获

[![Bg1tYT.png](https://s1.ax1x.com/2020/11/04/Bg1tYT.png)](https://s1.ax1x.com/2020/11/04/Bg1tYT.png)

看完上面的两个例子，很容易理解事件冒泡和事件捕获，我们平时都是默认冒泡的，冒泡是一直冒到 document 根文档为止

那么，能不能阻止元素的事件冒泡呢，答案是可以的，一开始那个例子，假如我们真的只想点击最里面的那个红色 box，不想另外两个 box 的事件被触发，我们可以在给红色 box 绑定事件的函数里这么写

```javascript
function sayBox3(event) {
  // 阻止冒泡
  event.stopPropagation();
  console.log('你点了最里面的box');
}
document.getElementById('box3').addEventListener('click', sayBox3, false);
```

再来点击最里面的红色盒子，只触发了红色盒子本身的事件，没有发生事件冒泡

[![BgJyKe.png](https://s1.ax1x.com/2020/11/04/BgJyKe.png)](https://s1.ax1x.com/2020/11/04/BgJyKe.png)

那阻止冒泡有没有实际用途呢？答案是有的，我们看这个例子

[![BgYZRK.png](https://s1.ax1x.com/2020/11/04/BgYZRK.png)](https://s1.ax1x.com/2020/11/04/BgYZRK.png)

这是一个模态框，现在的需求是当我们点击红色的按钮需要跳转页面，然后点击白色的对话框不需要任何反应，点其它任何地方就关闭这个模态框

这里就需要用到阻止冒泡了，红色的按钮是白色对话框的子元素，白色对话框又是这整个模态框的子元素，我们给模态框加上一个点击事件关闭，然后给红色的按钮加上一个点击事件跳转，这时就产生了一个问题，只要点击白色的对话框，由于冒泡机制，这个模态框也会关闭，实际上我们并不想点击白色的对话框有任何反应，这时我们就给这个白色的对话框绑定一个点击事件，函数里写上 `event.stopPropagation();`，这样就 OK 了

---

## 事件委托

事件委托又称之为事件代理，这里引用一个例子来解释

> 有三个同事预计会在周一收到快递，为了签收快递，有两种办法：1.三个人在公司门口等快递；2.委托给前台 MM 代为签收。现实当中，我们大都采用委托的方案（公司也不会容忍那么多员工站在门口就为了等快递）。前台 MM 收到快递后，她会判断收件人是谁，然后按照收件人的要求签收，甚至代为付款。这种方案还有一个优势，那就是即使公司里来了新员工（不管多少），前台 MM 也会在收到寄给新员工的快递后核实并代为签收(可以给暂时不存在的节点也绑定上事件)。

再引用一个例子

> 现在有一个 ul，ul 里又有 100 个 li，我想给这 100 个 li 都绑定一个点击事件，我们一般可以通过 for 循环来绑定，但是要是有 1000 个 li 呢？ 为了提高效率和速度，所以我们这时可以采用事件委托，只给 ul 绑定一个事件，根据事件冒泡的规则，只要你点了 ul 里的每一个 li，都会触发 ul 的绑定事件，我们在 ul 绑定事件的函数里通过一些判断，就可以给这 100li 都触发点击事件了。

具体实现直接看代码

```javascript
function clickLi() {
  alert('你点击了li');
}
document.getElementById('isUl').addEventListener('click', function(event) {
  // 每一个函数内都有一个event事件对象，它有一个target属性，指向事件源
  var src = event.target;
  // 我们判断如果target事件源的节点名字是li，那就执行这个函数
  // target里面的属性是非常多的，id名、class名、节点名等等都可以取到
  if (src.nodeName.toLowerCase() === 'li') {
    clickLi();
  }
});
```

这样我们就通过给 ul 绑定一个点击事件，让所有的 li 都触发了函数，那如果想给不同的 li 绑定不同的函数怎么办？

假设有 3 个 li，我们先写 3 个不同的函数，再给 3 个 li 设置不同的 id 名，通过判断 id 名就能给不同的 li 绑定不同的函数，看代码

```html
<body>
  <ul id="isUl">
    <li id="li01">1</li>
    <li id="li02">2</li>
    <li id="li03">3</li>
  </ul>
  <script>
    function clickLi01() {
      alert('你点击了第1个li');
    }
    function clickLi02() {
      alert('你点击了第2个li');
    }
    function clickLi03() {
      alert('你点击了第3个li');
    }
    document.getElementById('isUl').addEventListener('click', function(event) {
      var srcID = event.target.id;
      if (srcID == 'li01') {
        clickLi01();
      } else if (srcID == 'li02') {
        clickLi02();
      } else if (srcID == 'li03') {
        clickLi03();
      }
    });
  </script>
</body>
```

这就是所谓的事件委托，通过监听一个父元素，来给不同的子元素绑定事件，减少监听次数，从而提升速度

**事件委托是利用事件冒泡的运行机制来实现的，给父元素监听事件，只要子元素触发了事件，会一级一级依次往上冒泡，这样父元素必然能触发事件**

---

## 结束语

以上就是本文关于事件冒泡、事件捕获、事件委托的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[关于事件冒泡、事件捕获和事件委托](https://www.jianshu.com/p/d3e9b653fa95)
