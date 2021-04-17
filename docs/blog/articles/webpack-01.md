# 关于webpack的那些事

webpack是现代前端工程中必备的一个打包工具，它帮我们做了很多事情，使得我们的开发效率极大提高，本文来一起了解webpack  

----

## 什么是webpack

webpack 是一个模块打包机，将根据文件间的依赖关系对其进行静态分析，然后将这些模块按指定规则生成静态资源  

当 webpack 处理程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle  

在webpack眼里，万物皆模块，webpack 以模块化思想为核心，帮助开发者更好的管理整个前端工程  

![aVXCHx.png](https://s1.ax1x.com/2020/07/29/aVXCHx.png)

----

## webpack核心概念

### Entry

告诉 webpack 从哪个文件开始构建，这个文件将作为 webpack 依赖关系图的起点，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的，每个依赖项随即被处理，最后输出到称之为 bundles 的文件中  

----

### Output

告诉 webpack 在哪里输出构建后的包、包的名称等，以及如何命名这些文件，默认值为 ./dist，基本上，整个应用程序结构，都会被编译到你指定的输出路径的文件夹中  

----

### Module

模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块  

----

### Chunk

代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割  

----

### Loader

loader 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript），loader 可以将所有类型的文件转换为 webpack 能够处理的有效模块  

----

### Plugins

loader 被用于转换某些类型的模块，而插件则可以用于执行范围更广的任务，插件的范围包括，从打包优化和压缩，一直到重新定义环境中的变量。插件接口功能极其强大，可以用来处理各种各样的任务  

----

## 打包优化手段

### 开发环境

**1. 开启HMR(热模块替换)功能，优化打包构建速度**

如果只有一个模块发生了变化，只会重新构建这一个模块，其他模块使用缓存  

**2. source-map优化代码调试**

source-map是一个代码的映射，打包后的文件如果报错了，提示信息会映射到我们的源码中  

----

### 生产环境

**1. 使用缓存**

缓存分为以下三种:  

- hash:每次打包构建后都会生成一个唯一的hash值
- chunkhash:来自同一个chunk(同一个入口)的文件，打包构建后hash值相同，不同chunk的hash值不同
- contenthash:根据文件内容生成的hash值，文件被修改了这个hash值就会发生变化

合理的利用缓存可以减少请求数量，减轻服务器压力，优化性能，提高用户体验  

----

**2. 树摇(tree-shaking)**

树摇，要求必须使用的是ES6 Module，去除掉代码中没有引用到的模块，使得文件体积更小，请求速度更快  

----

**3. 代码分割(split-code)**

如果打包后只生成一个 bundle，那么这个bundle的体积会比较大，请求需要花费的时间就更多，可以把这一个 bundle 拆分成多个文件，这样加载的时候更快，这一点在 SPA 单页应用中的首屏渲染特别有体现  

----

**4. 代码压缩**

把所有代码去除空格、去除注释等，并进行压缩，这样打包后的文件体积更小  

**5. 懒加载**

懒加载对性能优化也是一种重要手段，等到需要的时候再加载，就拿 SPA 的路由模式来说，在首屏的时候只渲染首屏用到的东西，跳转至其他路由的时候，才渲染这个路由对应的文件

这里顺便提一下懒加载的原理，其实就是先返回一个 `promise`，当需要加载的时候 `promise` 的状态变为 `resolved` ，再去执行相应的回调

----

**6. Externals**

可以指定在打包的时候哪些模块不打包，比如一些第三方的库文件 Vue、React 等，然后需要使用CDN或者其他的方式引入第三方库文件  

----

## webpack构建流程

Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程:  

1. 初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数  
2. 开始编译：用上一步得到的参数初始化 `Compiler` 对象，加载所有配置的插件，执行对象的 `run` 方法开始执行编译  
3. 确定入口：根据配置中的 `Entry` 找出所有的入口文件
4. 编译模块：从入口文件出发，调用所有配置的 `Loader` 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理  
5. 完成模块编译：在经过第 4 步使用 `Loader` 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系  
6. 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 `Chunk`，再把每个 `Chunk` 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会  
7. 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

**在以上过程中，webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果**

我自己写了一个简易的 webpack，模拟了 webpack 打包的主要流程，对于理解 webpack 的构建流程和原理有很大的帮助，可以看这里 [传送门](https://github.com/EmotionBin/variousDemo/tree/master/webpack/25-handle-webpack)  

----

## 部分功能实现原理

### dev-server

webpack 的 dev-server 给开发者带来了极大的遍历，其实它的实现原理也很简单，在本地利用 **express** 启动一个 `Http` 服务器，这个服务器与客户端采用 **websocket** 通信协议，当原始文件发生改变， dev-server 会实时编译并更新到客户端  

有以下几点是需要注意的:  

1. dev-server 不会对 `index.html` 的修改作出反应，只会对资源文件进行监听  
2. dev-server 只在内存中生成文件，不会出现在目录文件中，生成的目录由 `contentBase` 指定  

dev-server 精髓的地方是它的 **HMR(热模块替换)**，下面会探究 HMR 实现原理  

----

### HMR

Hot Module Replacement（以下简称 HMR）是 webpack 发展至今引入的最令人兴奋的特性之一，当你对代码进行修改并保存后，webpack 将对代码重新打包，并将新的模块发送到浏览器端，浏览器通过新的模块替换老的模块，这样在不刷新浏览器的前提下就能够对应用进行更新，下面会对 HMR 功能一探究竟，请看下面一张图:  

![aiF69U.jpg](https://s1.ax1x.com/2020/07/27/aiF69U.jpg)

**第一步：webpack 对文件系统进行 watch 打包到内存中**

webpack 会对文件进行监听，判断文件是否修改，webpack 对文件监听的原理就是**轮询判断文件的最后编辑时间是否发生变化**，如果发现文件修改时间不一致则，则说明文件发生了改变，此时 webpack 会重新对该文件进行编译打包，然后保存到内存中  

**第二步：devServer 通知浏览器端文件发生改变**

在启动 devServer 的时候，服务端和浏览器端建立了一个 webSocket 长连接，以便将 webpack 编译和打包的各个阶段状态告知浏览器，当编译完成后，将编译打包后的新模块 hash 值发送到浏览器端  

**第三步：webpack-dev-server/client 接收到服务端消息做出响应**

浏览器接收到 type 为 hash 消息后会将 hash 值暂存起来，当接收到 type 为 ok 的消息后对应用执行 reload 操作，在 reload 操作中，会调用 `reloadApp` 函数，根据 hot 配置决定是刷新浏览器还是对代码进行热更新（HMR），请看下面一段代码:  

```javascript
function reloadApp() {
  // ...
  if (hot) {
    log.info('[WDS] App hot update...');
    const hotEmitter = require('webpack/hot/emitter');
    hotEmitter.emit('webpackHotUpdate', currentHash);
    // ...
  } else {
    log.info('[WDS] App updated. Reloading...');
    self.location.reload();
  }
}
```

如果配置了模块热更新，将最新 hash 值发送给 webpack，然后将控制权交给 webpack 客户端代码。如果没有配置模块热更新，就直接调用 `location.reload` 方法刷新页面  

**第四步：webpack 接收到最新 hash 值验证并请求模块代码**

webpack 拿到 hash 值后先验证是否有更新，如果有更新则使用 ajax 请求服务端，服务端将有更新的文件列表返回；再使用 jsonp 方式请求最新的模块代码，根据返回的新模块代码做进一步处理，可能是刷新页面，也可能是对模块进行热更新  

**第五步：HotModuleReplacement.runtime 对模块进行热更新**

调用 `hotApply` 方法，先找出所以需要更新的模块和依赖，再删除缓存中过期的模块和依赖，最后将新的模块添加到 modules 中，当下次调用 `__webpack_require__` 方法的时候，就是获取到了新的模块代码了。如果在热更新过程中出现错误，热更新将回退并刷新浏览器，这部分代码在 dev-server 代码中，简要代码如下:  

```javascript
module.hot.check(true).then(function(updatedModules) {
  if(!updatedModules) {
    return window.location.reload();
  }
  // ...
}).catch(function(err) {
  var status = module.hot.status();
  if(["abort", "fail"].indexOf(status) >= 0) {
    window.location.reload();
  }
});
```

dev-server 先验证是否有更新，没有代码更新的话，重载浏览器。如果在 `hotApply` 的过程中出现 abort 或者 fail 错误，也进行重载浏览器  

**第六步：业务代码需要做些什么？**

这里假设更改了 `print.js` ，进行 HMR ，如果要在 HMR 后进行一些操作，那么可以像下面这样操作:  

```javascript
if(module.hot){
  // 一旦module.hot为true说明开启了HMR功能 
  module.hot.accept('./print.js', function(){
    // 方法会监听 print.js 文件的变化，一旦发生变化，其他默认不会重新打包构建
    // do something
  })
}
```

----

## 实践

### 手写loader

开始之前先介绍一下 loader ，所谓 loader 只是一个导出为函数的 JavaScript 模块，只要使用了 loader ， webpack 在构建的时候就会自动调用这个 loader 函数，把上一个 loader 产生的结果或者资源文件(resource file)传入进去，最终得到最后一个 loader 产生的处理结果  

这里手写了两个 loader ，分别是 `banner-loader` 和 `my-style-loader`  

**banner-loader**  

可以在每个文件的头部加入一段注释，包括作者名称和时间，作者名称可以在该 loader 的 options 中的 author 进行配置  

```javascript
function loader(source) {
  const time = new Date().toLocaleTimeString();
  const { author } = this.query;
  return `
    /**
    ** @author ${author}
    ** @time ${time}
    **/
    console.log('我是banner-loader注入的代码~作者是${author}');
    ${source}
  `
}

module.exports = loader;
```

**my-style-loader**  

模拟了 style-loader ，可以在 js 中引入 css 文件，运行的时候会自动将 css 文件生成 style 标签并插入 html 的 head 中  

```javascript
function loader(source) {
  let style = `
    let style = document.createElement('style');
    // 将css文件的内容字符串化
    style.innerHTML = ${JSON.stringify(source)}; 
    document.head.appendChild(style)
  `;
  return style;
}

module.exports = loader;
```

以上的两个完整 demo 可以在这里看到，[传送门](https://github.com/EmotionBin/variousDemo/tree/master/webpack/26-handle-loader)  

----

### 手写plugins

插件是 webpack 的支柱功能，插件的功能要比 loader 更灵活，loader 一般情况下是帮助 webpack 实现翻译的功能，因为 webpack 只能理解 js 代码，所以插件目的在于解决 loader 无法实现的其他事  

下面引用 webpack 官网的一段解释:  

> webpack 插件是一个具有 apply 属性的 JavaScript 对象。apply 属性会被 webpack compiler 调用，并且 compiler 对象可在整个编译生命周期访问

**在 webpack 运行的声明周期中会广播许多事件，plugin 可以监听这些事件，在特定的时刻调用 webpack 提供的 API 执行相应的操作**  

这里我自己写了一个 `RemoveCommentsPlugin` 插件，该插件的功能是移除打包后的文件中的注释(类似/\*\*\*\*\*\*/)，打包后代码更干净，可读性更高  

```javascript
class RemoveCommentsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('RemoveCommentsPlugin', compilation => {
      // compilation => 可以理解为此次打包的上下文
      for (const name in compilation.assets) {
        // 只处理 js 结尾的文件
        if (name.endsWith('.js')) {
          const contents = compilation.assets[name].source()
          const noComments = contents.replace(/\/\*{2,}\/\s?/g, '')
          compilation.assets[name] = {
            source: () => noComments,
            size: () => noComments.length
          }
        }
      }
    })
  }
}

module.exports = RemoveCommentsPlugin;
```

这个 demo 可以在这里看到，[传送门](https://github.com/EmotionBin/variousDemo/tree/master/webpack/27-handle-plugin)  

----

###  手写一个简易Webpack打包工具

这里不详细展开，可以直接看 demo，[传送门](https://github.com/EmotionBin/variousDemo/tree/master/webpack/25-handle-webpack)  

----

## 结束语

Webpack 是一个庞大的基于 Node.js 的应用，它可以帮助我们编译并打包代码，是一个强大的工具，它也是当前前端开发必不可少的工具之一，对于前端的生态圈有着非常重要的作用。如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[webpack打包原理?看完这篇你就懂了!](https://segmentfault.com/a/1190000021494964?utm_source=tag-newest)  
[webpack4.X 实战（一）：全面认识webpack、核心概念](https://juejin.im/post/5c62a137f265da2db87b87bb)  
[Webpack HMR 原理解析](https://zhuanlan.zhihu.com/p/30669007?group_id=911546876953591808)

