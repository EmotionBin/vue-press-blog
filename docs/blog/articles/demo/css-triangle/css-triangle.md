# css 绘制三角形

**用 css 绘制三角形的原理**

设置一个 `div` 的 `width` 和 `height` 都为 0，然后其他三面的 `border` 都设为 0，只设置一边的 `border` 即可

---

具体代码如下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>css-triangle</title>
    <style>
      * {
        margin: 0;
      }
      .triangle_wrap {
        display: flex;
        width: 100%;
        height: 100vh;
        flex-direction: column;
        align-items: center;
      }
      .triangle {
        width: 0;
        height: 0;
        margin-top: 100px;
        border: 50px solid red;
      }
      .top {
        border-right-color: transparent;
        border-top-color: transparent;
        border-left-color: transparent;
      }
      .left {
        border-bottom-color: transparent;
        border-top-color: transparent;
        border-left-color: transparent;
      }
      .right {
        border-right-color: transparent;
        border-top-color: transparent;
        border-bottom-color: transparent;
      }
      .bottom {
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
      }
    </style>
  </head>
  <body>
    <div class="triangle_wrap">
      <h1>纯css绘制三角形😎</h1>
      <div class="triangle top"></div>
      <div class="triangle left"></div>
      <div class="triangle right"></div>
      <div class="triangle bottom"></div>
    </div>
  </body>
</html>
```

---

效果图：

[![4O1liF.png](https://z3.ax1x.com/2021/10/04/4O1liF.png)](https://z3.ax1x.com/2021/10/04/4O1liF.png)
