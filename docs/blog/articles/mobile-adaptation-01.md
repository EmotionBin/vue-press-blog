# 关于移动端适配

这里会讲解一些关于移动端的知识，比如逻辑像素、物理像素等，这些也是我们前端攻城狮所必备的知识

---

## 物理像素与逻辑像素

首先要来了解两个重要的概念，就是物理像素与逻辑像素

**物理像素**：也叫物理分辨率，设备屏幕实际拥有的像素点，比如 iPhone 6 的屏幕在宽度方向有 750 个像素点，高度方向有 1334 个像素点，所以 iPhone 6 总共有 750 X 1334 个物理像素点，它的物理分辨率是 750 X 1334，在同一个设备上，它的物理像素是固定的，这是厂商在出厂时就设置好了的

**逻辑像素**：也叫显示屏分辨率，比如 iPhone 6 的逻辑像素是 375 X 667，可以理解为反映在 CSS / JS 代码里的像素点数

这里再来一个概念，**设备像素比(Device Pixel Ratio，简称 DPR)**，它是指一个设备的物理像素与逻辑像素之比

一般情况下，电脑显示屏的设备像素比是 1，也就是说它的逻辑像素和物理像素是相等的，CSS 里写个 1px，屏幕就给你渲染成 1 个实际的像素点

但是在手机屏幕下，设备像素比不一定是 1，比如 Retina 屏幕，比如 iPhone 6 的物理像素是 750 X 1334，逻辑像素是 375 X 667，设备像素比是 2，也就是 1 个逻辑像素点用 4(2 X 2) 个实际像素点来渲染

看到这里你可能一脸懵逼，物理像素、逻辑像素、设备像素比，what？？？？，没关系，下面会慢慢讲解

[![BHdxYR.png](https://s1.ax1x.com/2020/11/09/BHdxYR.png)](https://s1.ax1x.com/2020/11/09/BHdxYR.png)

看上面这张图，以 iPhone 6 为例子，它的物理像素是 750 \* 1334，也就是横向 750 个像素点，纵向 1334 个像素点，图中每一个**白色**小方块表示一个像素点

[![BqxTgg.png](https://s1.ax1x.com/2020/11/10/BqxTgg.png)](https://s1.ax1x.com/2020/11/10/BqxTgg.png)

再来看这张图，还是以 iPhone 6 为例子，它的逻辑像素是 375 \* 667，也就是横向 375 个像素点，纵向 667 个像素点，图中每一个**红色**小方块表示一个像素点

最后来综合看这两张图，细心观察会发现，**红色小方块的边长是白色小方块的边长的 2 倍，一个红色小方块刚好由 4 个白色小方块组成**，看下图

[![BHXfHK.png](https://s1.ax1x.com/2020/11/09/BHXfHK.png)](https://s1.ax1x.com/2020/11/09/BHXfHK.png)

所以在 iPhone 6 中，逻辑像素(CSS 像素) 1px 等于物理像素(设备实际像素点的个数) 2px，设备像素比(DPR) 为 2，2 个设备实际的像素点表示 1 个 CSS 像素点

下面我会用代码来证明这个结论

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style type="text/css">
      #box1 {
        width: 375px;
        height: 667px;
        background: blueviolet;
      }
    </style>
  </head>
  <body>
    <div id="box1"></div>
  </body>
</html>
```

[![BHvQJg.png](https://s1.ax1x.com/2020/11/09/BHvQJg.png)](https://s1.ax1x.com/2020/11/09/BHvQJg.png)

通过这个图可以看到，一个宽 375px，高 667px 的 div 正好占满了整个屏幕，验证了 iPhone 6 的逻辑像素就是 375 \* 667

**如何获取设备的物理像素与逻辑像素**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>显示手机分辨率</title>
    <script>
      var width = window.screen.width;
      var height = window.screen.height;
      var dpr = window.devicePixelRatio;
      console.log('逻辑分辨率-宽度：' + width);
      console.log('逻辑分辨率-高度：' + height);
      console.log('物理分辨率-宽度：' + width * dpr);
      console.log('物理分辨率-高度：' + height * dpr);
    </script>
  </head>
  <body></body>
</html>
```

---

## 关于移动端 1px 的问题

这个问题网上有很多的人都说和 DPR 有关，其实不是这样的

试问，如果是 DPR 的原因，那为什么只有 1px 才出现视觉效果变粗的问题，而 10px、20px 的没有？

**其实这个问题的原因和 DPR 没有半毛钱的关系**，DPR 可以用来解释不同分辨率手机呈现页面的精细度的差异，但并不能解释 1px 问题

我们做移动端页面时一般都会设置 `<meta name="viewport" content="width=device-width" />`，这里就是把 html 视窗宽度大小设置等于设备宽度的大小

而 UI 给设计图的时候基本上都是给的二倍图甚至三倍图，假设设计图是 750px 的二倍图，在 750px 上设计了 1px 的边框，要拿到 375px 宽度的手机来显示，就相当于整体设计图缩小一倍，所以在 375px 手机上要以 0.5px 呈现才符合预期效果，然而 CSS 里最低只支持 1px 大小，不足 1px 就以 1px 显示，所以你看到的就显得边框较粗，实际上只是设计图整体缩小了，而 1px 的边框没有跟着缩小导致的

简而言之就是：**多倍的设计图设计了 1px 的边框，在手机上缩小呈现时，由于 CSS 最低只支持显示 1px 大小，导致边框太粗的效果**

移动端 1px 问题可以用 CSS3 的 `transform:scale()` 属性，进行缩放，可以这样

```css
/* 这个是盒子 */
.box {
  position: relative;
  padding: 10px;
}

/* 这个是盒子后的伪元素 */
.box:after {
  content: ' ';
  position: absolute;
  left: 0;
  top: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #f00;
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  -webkit-transform: scale(0.5, 0.5);
  transform: scale(0.5, 0.5);
}
```

这里最好利用伪元素，不直接修改原来盒子的 CSS 属性，还有这个伪元素的宽高要给 `200%`，因为 `transform: scale(.5, .5);` 会让宽高缩小为原来的一半，所以给 `200%` 才是真正的 `100%` 宽高

---

## 移动端适配解决方案

### vw / vh

vw(Viewport Width)、vh(Viewport Height)是基于视图窗口的单位，是 CSS3 的一部分，基于视图窗口的单位，除了 vw、vh 还有 vmin、vmax

- vw:1vw 等于视口宽度的 1%
- vh:1vh 等于视口高度的 1%
- vmin:选取 vw 和 vh 中最小的那个，即在手机竖屏时，1vmin = 1vw
- vmax:选取 vw 和 vh 中最大的那个，即在手机竖屏时，1vmax = 1vh

举个例子，假设浏览器宽度为 1920px，高度为 1080px，此时 1vw = 19.2px， 1vh = 10.8px

vw、vh 都是相对于视图窗口(viewport)的，每个设备的视图窗口大小可能会不一样，vw、vh 会随着视图窗口的改变而改变，实现了移动端下的适配

在每个页面中的视图窗口(viewport)也是可以手动设置的，默认的视图窗口宽度就是设备宽度

```html
<!-- 默认的视图窗口设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- 自定义的视图窗口设置 -->
<meta
  name="viewport"
  content="height=100,width=100,initial-scale=1.0,user-scalable=no"
/>
```

---

### rem

rem 是相对长度单位，它是基于 em 的，em 也是一个相对长度单位，**em 是相对于父元素的**，看下面的例子

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>demo</title>
  </head>
  <style>
    body {
      font-size: 100px;
    }
    .box {
      font-size: 1.5em;
    }
    .box p {
      font-size: 0.5em;
    }
  </style>
  <body>
    <div class="box">
      div
      <p>ppppp</p>
    </div>
  </body>
</html>
```

浏览器默认尺寸是 16px，这里我把它改为了 100px，`.box` 元素 `font-size` 为 1.5em，也就是 body 的 1.5 倍，即为 100 X 1.5 = 150px，`.box p` 元素 `font-size` 为 0.5em，也就是 `.box` 元素的 0.5 倍，即为 150 X 0.5 = 75px，总之 em 是相对于上一级的

了解了 em 之后再来看 rem，rem 与 em 相比就多了一个 r，r = root 根元素，顾名思义 rem 是相对于根元素 html 的

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>demo</title>
  </head>
  <style>
    html {
      font-size: 100px;
    }
    .box {
      font-size: 1.5rem;
    }
    .box p {
      font-size: 0.5rem;
    }
  </style>
  <body>
    <div class="box">
      div
      <p>ppppp</p>
    </div>
  </body>
</html>
```

这里给根元素 html 设置了 `font-size:100px;`，也就是设置了根元素是 100px，也可以说基准值就是 100px，`.box` 元素 1.5rem 即为 100 X 1.5 = 150px，`.box p` 元素 0.5rem 即为 100 X 0.5 = 50px，总而言之，rem 只会相对于根元素进行计算

如果每次页面大小发生变化的时候，重新计算根元素 html 的 `font-size`，改变基准值，是不是就能实现响应式布局了呢，这就是 rem 布局的原理

我的 github 上有一个 demo，可以看这里 [传送门](https://github.com/EmotionBin/various-demo/tree/master/rem-layout)

---

### 小程序的 rpx

写过微信小程序的都知道，微信小程序中写样式的单位不是 px 而是 rpx，其实 rpx 经过计算后最终还是被渲染成 px 的，这个计算过程不需要我们操心

> rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。规定屏幕宽为 750rpx。如在 iPhone6 上，屏幕宽度为 375px，共有 750 个物理像素，则 750rpx = 375px = 750 物理像素，1rpx = 0.5px = 1 物理像素

[![Bq4MuD.png](https://s1.ax1x.com/2020/11/10/Bq4MuD.png)](https://s1.ax1x.com/2020/11/10/Bq4MuD.png)

想要详细了解可以看 [微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html)

---

## 结束语

以上就是本文的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[CSS 中的 px 与物理像素、逻辑像素、1px 边框问题](https://www.cnblogs.com/xiaocaiyuxiaoniao/p/10156680.html)  
[移动端 Web 页面适配方案（整理版）](https://www.jianshu.com/p/2c33921d5a68)
[1px 像素问题（一）：真正原因](https://blog.csdn.net/u010059669/article/details/88953620)
