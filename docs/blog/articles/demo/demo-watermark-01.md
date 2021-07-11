# 水印

**前端生成水印的原理：**

先利用 `canvas` 绘制一张布满水印的画布，然后调用 `toDataURL` 方法把画布转换成一张 base64 图片，接下来创建一个 `div`，并且将该 `div` 的背景图片设置为刚才生成的 base64 图片，设置该 `div` 占满整个屏幕，层级 `z-index` 要设置为最高，最后将这个 `div` 添加到 `body` 下即可

---

具体代码如下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body></body>
</html>
```

```javascript
/**
 * @description 水印
 * @author huangweibin
 * @date 2021-07-11
 * @param {string} [id="watermark"] 水印元素ID
 * @param {number} [height=80] 单个水印块高度
 * @param {number} [width=150] 单个水印块宽度
 * @param {string} [text] 水印文本
 * @param {number} [fontSize=13] 文本字体大小
 * @param {string} [color="rgba(100,100,100,0.2)"] 文本颜色
 * @param {string} [displayMethod] 展现方式：background 背景图(采用repeat特性) canvas 画布(采用画布方式，建议isOnResize=true)
 * @param {boolean} [isOnResize=false] 是否监听浏览器窗口变化，重绘水印
 */
function Watermark(options) {
  options = options || {};
  this.id = options.id || 'watermark';
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.height = options.height || 80;
  this.width = options.width || 150; // 控制水印的间隙大小
  this.text = options.text || '';
  this.fontSize = options.fontSize || 13;
  this.color = options.color || 'rgba(100,100,100,0.2)';
  this.displayMethod = options.displayMethod || 'background';
  this.isOnResize = options.isOnResize || false;

  // 获取设备像素比
  this.PIXEL_RATIO = function() {
    var dpr = window.devicePixelRatio || 1;
    var bsr =
      this.ctx.webkitBackingStorePixelRatio ||
      this.ctx.mozBackingStorePixelRatio ||
      this.ctx.msBackingStorePixelRatio ||
      this.ctx.oBackingStorePixelRatio ||
      this.ctx.backingStorePixelRatio ||
      1;
    return dpr / bsr;
  }.bind(this)();

  /**
   * @description 初始化执行函数
   * @author huangweibin
   * @date 2021-07-11
   */
  this.init = function() {
    this.draw();
    this.addToBody();

    this.isOnResize &&
      (window.onresize = function() {
        this.draw();
        this.displayMethod === 'canvas' || this.addToBody();
      }.bind(this));
  };

  /**
   * @description 绘制水印
   * @author huangweibin
   * @date 2021-07-11
   */
  this.draw = function() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight * 2;

    // 适配高清屏，canvas内容的宽高是实际的宽高的PIXEL_RATIO倍
    this.canvas.width = canvasWidth * this.PIXEL_RATIO;
    this.canvas.height = canvasHeight * this.PIXEL_RATIO;
    this.canvas.style.width = canvasWidth + 'px';
    this.canvas.style.height = canvasHeight + 'px';
    // 缩放绘图
    this.ctx.setTransform(this.PIXEL_RATIO, 0, 0, this.PIXEL_RATIO, 0, 0);

    this.ctx.font = this.fontSize + 'px 黑体';
    this.ctx.rotate((-20 * Math.PI) / 180);
    this.ctx.fillStyle = this.color;

    // 绘制文字
    for (var y = 1; y < (window.innerHeight * 2) / this.height + 1; y++) {
      for (var x = 1; x < (window.innerWidth * 2) / this.width; x++) {
        this.ctx.fillText(
          this.text,
          (y % 2 ? 0 : this.width / 2) + x * this.width - window.innerWidth,
          y * this.height
        );
      }
    }
  };

  /**
   * @description 将水印添加到body上
   * @author huangweibin
   * @date 2021-07-11
   */
  this.addToBody = function() {
    var element = null;

    if (this.displayMethod === 'canvas') {
      element = this.canvas;
    } else {
      var base64 = this.canvas.toDataURL('image/png');
      element = document.createElement('div');
      element.style.backgroundSize = innerWidth + 'px';
      element.style.backgroundImage = 'url(' + base64 + ')';
      element.style.backgroundRepeat = 'repeat';
    }

    element.id = this.id;
    element.style.position = 'fixed';
    element.style.left = 0;
    element.style.right = 0;
    element.style.top = 0;
    element.style.bottom = 0;
    element.style.pointerEvents = 'none'; // 蒙层事件穿透
    element.style.zIndex = 20000000;

    document.getElementById(this.id) &&
      document.body.removeChild(document.getElementById(this.id));
    document.body.appendChild(element);
  };
}

new Watermark({
  text: '测试水印',
  isOnResize: false,
  displayMethod: 'background',
}).init();
```

---

效果图：

[![W9Z4De.png](https://z3.ax1x.com/2021/07/11/W9Z4De.png)](https://z3.ax1x.com/2021/07/11/W9Z4De.png)
