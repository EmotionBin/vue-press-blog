# 前端也要懂HTTP缓存机制

记得在我刚工作刚做项目的时候，将更改过的文件更新到服务器上，打开项目网站刷新后发现更改并没有生效，查来查去也没查出问题，之后师傅对我说，你清空一下浏览器缓存，在我清空浏览器缓存之后，奇迹发生了，一切都恢复正常，那时候我就很郁闷，缓存是个啥东西，于是最近终于抽空看了一下浏览器缓存这一方面的知识，在我总结之后，搭建后台进行了测试，加深我对缓存的理解。  

----

## Http简介

浏览器和服务器之间通信是通过`HTTP`协议，`HTTP`协议永远都是客户端发起请求，服务器回送响应。模型如下：

![GOltde.png](https://s1.ax1x.com/2020/04/12/GOltde.png)

`HTTP`报文就是浏览器和服务器间通信时发送及响应的数据块。浏览器向服务器请求数据，发送请求(request)报文；服务器向浏览器返回数据，返回响应(response)报文。报文信息主要分为两部分：  

1. 报文头部：一些附加信息（cookie，缓存信息等），与缓存相关的规则信息，均包含在头部中
2. 数据主体部分：`HTTP`请求真正想要传输的数据内容

----

## 后台搭建与测试

这里我自己用node.js搭建了一个后台，使用了`Express`框架，首先是不添加任何缓存信息头，代码如下：

```javascript
		const express = require('express');
		const app = express();
		const port = 9527;
		const fs = require('fs');
		const path = require('path');

		app.get('/',(req,res) => {
			res.send(`<!DOCTYPE html>
			<html lang="en">
			<head>
				<title>Document</title>
			</head>
			<body>
				Http Cache Demo
				<script src="/demo.js"></script>
			</body>
			</html>`);
		});

		app.get('/demo.js',(req, res)=>{
			let jsPath = path.resolve(__dirname,'./static/js/demo.js');
			let cont = fs.readFileSync(jsPath);
			res.end(cont);
		});

		app.listen(port,()=>{
			console.log(`listen on ${port}`)  ; 
		});
```

可以看到请求结果如下：

![GOG6cn.png](https://s1.ax1x.com/2020/04/12/GOG6cn.png)

请求过程大致为：

- 浏览器请求静态资源demo.js
- 服务器读取磁盘文件demo.js，返给浏览器

如果这时候浏览器再次发出请求，或者说以后会有很多次这样的请求，那么这个过程就要一直重复。  

看得出来这种请求方式的流量与请求次数有关，同时，缺点也很明显：

- 浪费用户流量
- 浪费服务器资源，服务器要读磁盘文件，然后发送文件到浏览器
- 浏览器要等待js下载并且执行后才能渲染页面，影响用户体验

接下来，在请求头中添加上缓存信息，添加了缓存头信息之后又会是怎样的结果呢？

----

## Http缓存分类

`Http`缓存可以分为两大类，强制缓存（也称强缓存）和协商缓存。两类缓存规则不同，强制缓存在缓存数据未失效的情况下，不需要再和服务器发生交互；而协商缓存，顾名思义，需要进行比较判断是否可以使用缓存。  

两类缓存规则可以同时存在，强制缓存优先级高于协商缓存，也就是说，当执行强制缓存的规则时，如果缓存生效，直接使用缓存，不再执行协商缓存规则。

----

### 强制缓存

强制缓存分为两种情况，`Expires`和`Cache-Control`。

----

#### Expires

`Expires`的值是服务器告诉浏览器的缓存过期时间（值为GMT时间，即格林尼治时间），即下一次请求时，如果浏览器端的当前时间还没有到达过期时间，则直接使用缓存数据。下面通过我的`Express`服务器来设置一下`Expires`响应头信息。

```javascript
		//其他代码...
		const moment = require('moment');

		app.get('/demo.js',(req, res)=>{
		  let jsPath = path.resolve(__dirname,'./static/js/demo.js');
		  let cont = fs.readFileSync(jsPath);
		  //这里缓存设置两分钟
		  res.setHeader('Expires', getGLNZ());
		  res.end(cont);
		});

		function getGLNZ(){
		  return moment().utc().add(2,'m').format('ddd, DD MMM YYYY HH:mm:ss')+' GMT';
		}
		//其他代码...
```

在demo.js中添加了一个`Expires`响应头，通过momentjs转换成格林尼治时间。第一次请求的时候还是会向服务器发起请求，同时会把过期时间和文件一起返回给我们，响应头中多了一个字段`Expires`，见下图：

![GXh0un.png](https://s1.ax1x.com/2020/04/13/GXh0un.png)

不难发现`Expires`字段的时间与`Date`字段的时间相差了两分钟，也正好就是我们在响应头设置的两分钟的时间。  

当我们在这两分钟之内，刷新页面，奇迹发生了，看下图：

![GX51Ff.png](https://s1.ax1x.com/2020/04/13/GX51Ff.png)

注意看红框标注的地方，可以看出文件是直接从缓存（memory cache）中读取的，并没有发起请求。我们在这边设置过期时间为两分钟，两分钟过后，已经超过了过期时间，刷新页面看到浏览器再次发送请求了。

关于`Expires`，总结一下：  

虽然这种方式添加了缓存控制，节省流量，但是还是有以下几个问题的：

- 由于浏览器时间和服务器时间不同步，如果浏览器设置了一个很后的时间，过期时间一直没有用
- 缓存过期后，不管文件有没有发生变化，服务器都会再次读取文件返回给浏览器

不过`Expires` 是`HTTP 1.0`的东西，现在浏览器均默认使用`HTTP 1.1`，所以它的作用基本忽略。

----

#### Cache-Control

针对浏览器和服务器时间不同步，加入了新的缓存方案。这次服务器不是直接告诉浏览器过期时间，而是告诉一个相对时间，如Cache-Control=10秒，意思是10秒内，直接使用浏览器缓存。下面我将会在响应头中写入`Cache-Control`字段，时间设置为120秒：

```javascript
		//其他代码...
		app.get('/demo.js',(req, res)=>{
		  let jsPath = path.resolve(__dirname,'./static/js/demo.js');
		  let cont = fs.readFileSync(jsPath);
		  //这里缓存设置两分钟
		  res.setHeader('Cache-Control', 'public,max-age=120');
		  res.end(cont);
		});
		//其他代码...
```

然后刷新页面，可以看到响应头中多了`Cache-Control`字段：

![Gji3Se.png](https://s1.ax1x.com/2020/04/13/Gji3Se.png)

在两分钟之内，刷新页面，查看请求数据：

![GjiyOs.png](https://s1.ax1x.com/2020/04/13/GjiyOs.png)

由于之前我们设置了响应头字段`Cache-Control`，时间为120秒，所以在这120秒之内刷新页面，文件还是直接从缓存中读取。  

关于`Cache-Control`，总结一下：

- 设置的时间为相对时间，有效的解决了浏览器和服务器时间不一致的问题
- 缓存过期后，不管文件有没有发生变化，服务器都会再次读取文件返回给浏览器

----

### 协商缓存

强制缓存的弊端很明显，即每次都是根据时间来判断缓存是否过期；但是当到达过期时间后，如果文件没有改动，再次去获取文件就有点浪费服务器的资源了。这里就引出了协商缓存，协商缓存就是浏览器给服务器发送请求，服务器来判断缓存资源是否可用，如果可用，则告诉浏览器直接读取缓存资源，如果不可用，则服务器重新读取资源返回给浏览器。  

协商缓存主要有两组报文结合使用：  

1. `Last-Modified`和`If-Modified-Since`
2. `ETag`和`If-None-Match`

这里引用别人的一张图：

![GjkhM4.jpg](https://s1.ax1x.com/2020/04/13/GjkhM4.jpg)

看起来可能有点复杂，再继续往下一点一点分析。  

----

#### Last-Modified

`Last-Modified`即上次修改时间。为了节省服务器的资源，再次改进方案。浏览器和服务器协商，服务器每次返回文件的同时，告诉浏览器文件在服务器上最近的修改时间。请求过程如下：

- 浏览器请求静态资源demo.js
- 服务器读取磁盘文件demo.js，返给浏览器，同时带上文件上次修改时间 `Last-Modified`（GMT标准格式）
- 当浏览器上的缓存文件过期时，浏览器带上请求头`If-Modified-Since`（等于上一次请求的`Last-Modified`）请求服务器
- 服务器比较请求头里的`If-Modified-Since`和文件的上次修改时间。如果一致就继续使用本地缓存（304），如果不一致就再次返回文件内容和`Last-Modified`

```javascript
		//其他代码...
		app.get('/demo.js',(req, res)=>{
			let jsPath = path.resolve(__dirname,'./static/js/demo.js');
			let cont = fs.readFileSync(jsPath);
			let status = fs.statSync(jsPath);

			let lastModified = status.mtime.toUTCString();
			if(lastModified === req.headers['if-modified-since']){
				res.writeHead(304, 'Not Modified');
				res.end();
			} else {
				res.setHeader('Cache-Control', 'public,max-age=5');
				res.setHeader('Last-Modified', lastModified);
				res.writeHead(200, 'OK');
				res.end(cont);
			}
		});
		//其他代码...
```

下面来看第一次请求的结果：

![GjV0MD.png](https://s1.ax1x.com/2020/04/13/GjV0MD.png)

再次刷新页面，再查看请求结果：

![GjV2JP.png](https://s1.ax1x.com/2020/04/13/GjV2JP.png)

关于`Last-Modified`，总结一下：  

虽然这个方案比前面的方案有了进一步的优化，浏览器检测文件是否有修改，如果没有变化就不再发送文件，但是还是有以下缺点：

- 由于`Last-Modified`修改时间是GMT时间，只能精确到秒，如果文件在1秒内有多次改动，服务器并不知道文件有改动，浏览器拿不到最新的文件
- 如果服务器上文件被多次修改了但是内容却没有发生改变，服务器需要再次重新返回文件

----

#### ETag

为了解决文件修改时间不精确带来的问题，服务器和浏览器再次协商，这次不返回时间，返回文件的唯一标识`ETag`。只有当文件内容改变时，`ETag`才改变。请求过程如下：

- 浏览器请求静态资源demo.js
- 服务器读取磁盘文件demo.js，返给浏览器，同时带上文件的唯一标识ETag
- 当浏览器上的缓存文件过期时，浏览器带上请求头`If-None-Match`（等于上一次请求的`ETag`）请求服务器
- 服务器比较请求头里的`If-None-Match`和文件的`ETag`。如果一致就继续使用本地缓存（304），如果不一致就再次返回文件内容和`ETag`

```javascript
		//其他代码...
		const md5 = require('md5');

		app.get('/demo.js',(req, res)=>{
		  let jsPath = path.resolve(__dirname,'./static/js/demo.js');
		  let cont = fs.readFileSync(jsPath);
		  let etag = md5(cont);

		  if(req.headers['if-none-match'] === etag){
			res.writeHead(304, 'Not Modified');
			res.end();
		  } else {
			res.setHeader('ETag', etag);
			res.writeHead(200, 'OK');
			res.end(cont);
		  }
		});
		//其他代码...
```

下面来看第一次请求的结果：

![GjNKKJ.png](https://s1.ax1x.com/2020/04/13/GjNKKJ.png)

再次刷新页面，再查看请求结果：

![GjNNxe.png](https://s1.ax1x.com/2020/04/13/GjNNxe.png)

关于`ETag`，总结一下：  

这种策略和之前的相比，确实是有了不少的优化，我个人认为是一种不错的缓存策略。  

----

## 一些额外的东西

在报文头的表格中我们可以看到有一个字段叫`Pragma`，这是一段尘封的历史...   

在“遥远的”`http1.0`时代，给客户端设定缓存方式可通过两个字段，`Pragma`和`Expires`。虽然这两个字段早可抛弃，但为了做`http`协议的向下兼容，还是可以看到很多网站依旧会带上这两个字段。

----

### 关于Pragma

当该字段值为`no-cache`的时候，会告诉浏览器不要对该资源缓存，即每次都得向服务器发一次请求才行。  

```javascript
		res.setHeader('Pragma', 'no-cache') //禁止缓存
		res.setHeader('Cache-Control', 'public,max-age=120') //2分钟
```

通过`Pragma`来禁止缓存，通过`Cache-Control`设置两分钟缓存，但是重新访问我们会发现浏览器会再次发起一次请求，说明了`Pragma`的优先级高于`Cache-Control`。

----

### 关于Cache-Control

我们看到`Cache-Control`中有一个属性是`public`，那么这代表了什么意思呢？其实`Cache-Control`不光有`max-age`，它常见的取值`private`、`public`、`no-cache`、`max-age`，`no-store`，默认值为`private`，各个取值的含义如下：

- private: 客户端可以缓存
- public: 客户端和代理服务器都可缓存
- max-age=xxx: 缓存的内容将在 xxx 秒后失效
- no-cache: 需要使用对比缓存来验证缓存数据
- no-store: 所有内容都不会缓存，强制缓存，对比缓存都不会触发

所以我们在刷新页面的时候，如果只按`F5`只是单纯的发送请求，按`Ctrl+F5`会发现请求头上多了两个字段`Pragma: no-cache`和`Cache-Control: no-cache`。

----

## 缓存的优先级

上面我们说过强制缓存的优先级高于协商缓存，`Pragma`的优先级高于`Cache-Control`，那么其他缓存的优先级顺序怎么样呢？网上查阅了资料得出以下顺序：

**Pragma > Cache-Control > Expires > ETag > Last-Modified**

----

## 结束语

以上就是关于`http`缓存的一些理解，从一开始对`http`缓存的一无所知，到现在终于对`http`缓存有了一定的理解，用好`http`缓存，对于一些项目的优化有了不少的提升，这也确实会对用户体验有很大的改善，但是缓存也有它的弊端，如果缓存没设置恰当，有时候资源更新了，却还使用了旧的资源，这就会带来一些不可预期的问题。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[知乎-前端也要懂Http缓存机制](https://zhuanlan.zhihu.com/p/100890757)  