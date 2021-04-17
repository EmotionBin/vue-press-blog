# Web 前端安全

随着互联网的高速发展，信息安全越来越备受大家关注，大多数网站从早期的 HTTP 已经升级到了 HTTPS，可见安全这个概念的重要性，本文就来探讨一下关于 web 前端的安全问题  

## XSS攻击

XSS 攻击全称跨站脚本攻击(Cross Site Script)，是为了不和层叠样式表 CSS(Cascading Style Sheets) 的混淆，故将跨站脚本攻击缩写为 XSS，XSS 是一种在 web 应用中的计算机安全漏洞，它允许恶意 web 用户将代码植入到提供给其它用户使用的页面中  

----

### 模拟 XSS 攻击

我对 XSS 攻击比较好奇，所以自己写了个 demo 进行试验，下面直接上代码：  

```html
<body>
  <div id="app">
    <input v-model="test" type="text">
    <div class="value">
      <p v-html="test"></p>
    </div>
  </div>
  <script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.js"></script>
</body>
```

```javascript
new Vue({
  el:'#app',
  data:{
    test:''
  }
})
```

在本地启动一个服务，打开页面，在输入框中输入 `<img src="x" onerror="alert('xss!')">`，下一秒奇迹就发生了  

![wGSOl6.png](https://s1.ax1x.com/2020/09/10/wGSOl6.png)

弹出了一个 `alert` 弹窗，这说明这个网页执行了输入的代码，只要用户输入了一些可执行的代码，这个网页就会执行，这是非常危险的，这就是 XSS 攻击，试想一下假设有一个留言板系统，如果有人输入一些恶意代码，这些恶意代码就会被记录到留言板上，以后每个用户打开这个留言板页面的时候，都会执行一次这些恶意代码，非常容易导致用户信息泄露，造成一些不必要的损失  

再来看下面一个例子：  

```html
<body>
  <div id="app">
    <input type="text" v-model="test">
    <a :href="test">跳转</a>
  </div>
  <script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.js"></script>
</body>
```

```javascript
new Vue({
  el:'#app',
  data:{
    test:''
  }
})
```

在本地启动一个服务，打开页面，在输入框中输入 `javascript:alert('xss!')`，点击 “跳转”，同样的页面也显示了一个 `alert` 弹窗  

----

### 如何预防 XSS

**对特殊字符进行转义**

将前端输出的数据都进行转义，对特殊字符如 `<`、`>` 转义，就可以从根本上防止这一问题，来看下面的例子:  

```html
<body>
  <div id="app">
    <input v-model="test" type="text">
    <div class="value">
      <p v-html="encodedCode"></p>
    </div>
  </div>
  <script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.js"></script>
</body>
```

```javascript
new Vue({
  el:'#app',
  data:{
    test:''
  },
  computed: {
    encodedCode(){
      return encodeURI(this.test)
    }
  },
})
```

这个例子还是引用上面 XSS 攻击的例子，只是多了一个计算属性 `encodedCode` 来对要输出的数据进行转义  

进行测试，输入 `<img src="x" onerror="alert('xss!')">`，什么都没有发生  

![waPhr9.png](https://s1.ax1x.com/2020/09/12/waPhr9.png)  

**对 javascript:xxx 特殊字符进行过滤**

若某些标签的 `href`、`scr` 属性中包含 `javascript:xxx`，也会造成安全隐患，所以应该进行过滤  

```html
<body>
  <div id="app">
    <input type="text" v-model="test">
    <a :href="encodedCode">跳转</a>
  </div>
  <script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.js"></script>
</body>
```

```javascript
new Vue({
  el:'#app',
  data:{
    test:''
  },
  computed: {
    encodedCode(){
      return this.test.toLowerCase().indexOf('javascript:') > -1 ? '' : encodeURI(this.test);
    }
  },
})
```

这个例子还是引用上面 XSS 攻击的例子，对输入的 `javascript:` 进行了过滤，注意这里要进行大小写转换  

进行测试，`javascript:alert('xss!')`，点击 “跳转”，页面被刷新了，没有出现异常情况  

----

## CSRF

CSRF(Cross Site Request Forgery)，即跨站请求伪造，是一种常见的Web攻击，通过伪装来自受信任用户的请求来利用受信任的网站，可以这么理解，攻击者盗用了用户的身份信息，伪装成用户，以用户的名义向第三方网站发送恶意请求，看下面的图片：  

![wa0dts.png](https://s1.ax1x.com/2020/09/12/wa0dts.png)  

CSRF 攻击是利用钓鱼网站携带用户 cookie 向源站服务器发送 HTTP 请求，这种情况下是跨域的，cookie 不会自动携带，那么可以利用不受浏览器同源策略限制的手段进行 CSRF 攻击，比如用 script，img 或者 iframe 之类的请求源站服务器，浏览器就会自动带上 cookie，从而进行 CSRF 攻击，**script、image、iframe 的 src 都不受同源策略的影响，所以可以借助这一特点，实现跨域，进行 CSRF 攻击**  

**如何防止 CSRF**

1. 加入验证码，在用户提交关键请求(如转账)前，强制用户输入验证码
2. 使用 token，登录成功后前端存储 token，提交请求时在请求头中带上这个 token，后端对 token 进行验证
3. 同源检测，大多数 HTTP 请求在头部都会自动带上 `Origin` 和 `Referer` 这两个字段，可以通过这两个字段来禁用第三方网站发来的请求
4. `SamesiteCookie`，为 `Set-Cookie` 响应头新增 `Samesite` 属性，它用来标明这个 cookie 是个同站 cookie，同站 cookie 只能作为第一方 cookie，不能作为第三方 cookie  

关于第二点，为什么使用 token 而不使用 cookie，**因为浏览器发送请求的时候不会自动带上 token，而cookie在浏览器发送请求的时候会被自动带上**，CSRF 就是利用的这一特性，所以 token 可以防范 CSRF，而 cookie 不能  

----

## SQL 注入

SQL 注入也是一种比较常见的网络攻击方式之一，多见于登录场景，在登陆时通过 SQL 注入实现无账号登录，甚至篡改数据库等，这是非常危险的行为  

举个简单的例子，下面是后端的 SQL 语句，两个变量 `username`、`password` 是用户登录时传过来的用户名和密码  

```javascript
`select * from userinfo where username = '${username}' and password = '${password}'`
```

假设用户输入的用户名为 `' or 1 = 1 --`，密码为空，这个 SQL 语句这时候就变成了这样：  

```javascript
`select * from userinfo where username = '' or 1 = 1 --' and password = ''`
```

`--` 在 SQL 语句中表示注释，它后面的代码会被忽略，所以这个 SQL 语句总是会成功的，这就实现了无账号登录  

**如何防止 SQL 注入**

1. 输入的时候对有关 SQL 语句的关键字进行排查，如 `select`、`update`、`drop` 等，对单引号和 `--` 进行转换等，只要检测到用户输入了就进行提示而且不发送请求
2. 后端校验，先验证用户名，如果能在数据库中查到用户名，再进行密码校验，密码一致则说明登录成功
3. 后端使用参数化的 SQL 或直接使用存储过程进行数据查询与存取

----

## 前端加密是否有意义

前端加密有意义而又没有意义  

----

### 前端加密有意义

**保护敏感信息**  

在客户端向服务端发送 HTTP 请求时，如果所有的数据都不加密，都采用明文传输，则一些敏感信息(如密码等)十分容易暴露，不用抓包，在浏览器 F12 就能看到，所以这就很容易泄漏用户的一些敏感信息，因此，对于一些敏感信息，在传输前应该使用**单向加密**，比如 MD5 加密，服务端直接存储加密后的值即可  

**降低被攻下的概率**  

明文传输就好比裸奔，黑客不用费一丝一毫力气就能获取数据，在加密之后，数据不再是明文传输了，但是不排除有一些高级黑客依然能够通过抓包暴力破解，所以有时候前端的加密不是为了完全阻挡攻击，而是为了提高攻击成本，降低被攻下的概率  

----

### 前端加密无意义

**前端是完全开源的**  

前端所做的一切都是不安全的，因为前端代码完全是开源的，在浏览器的 F12 控制台，都能够看到源代码，尽管很多 JS 文件都被混淆压缩，极大的降低了可读性，但是懂技术的人耐心的读代码，也还是可以把所有逻辑都摸透，既然是加密，那么加密用的密钥和算法肯定是保存在前端的，攻击者通过查看源码就能得到算法和密钥  

**重放攻击**  

所谓重放攻击，就是不对数据进行解密操作，直接把获取的数据原封不动的重新发送一次，虽然发送到服务器的是加密后的数据，但是黑客拦截后，把加密后的数据重发一遍，验证依然是通过的  

----

### 总结

**如何防止重放攻击**

重放攻击是二次请求，所以在每一次请求都多加入两个参数，这也是常说的**加盐**，分别是 `timestamp` 和 `nonce`，前者代表当前时间戳，后者是一个随机字符串  

时间戳的目的是只对 60S 内的请求有效，在服务端收到客户端的第一次请求(也就是正常请求)时，服务端判断时间戳与当前时间相差是否超过了 60S，超过则认为是非法请求

随机字符串是为了防止 60S 内的重放攻击，服务端收到客户端的第一次请求(也就是正常请求)时，服务端把这个随机字符串记录到一个集合中，存储 60S，到时间后释放，60S 内如果有重复的随机字符串则认为是非法请求  

这样做有一个要求，**服务端和客户端的时间必须同步**，在这种情况下，黑客进行重放攻击，重放攻击的请求超过了 60S 会被判定为无效请求，即使在 60S 内进行了重放攻击，随机字符串是一样的，也无法通过服务端校验，如果二次请求是用户正常发送的，每次的随机字符串都不一样，被服务端认为是合法请求  

**怎样才能提高安全性**

使用 HTTPS，在传输层加密，这样黑客抓包时得到的数据是加密的，不敢保证绝对安全，但是相比于前端加密更安全  

----

## 结束语

以上就是关于前端安全的内容，参考资料的第一和第二篇文章写得不错也很全面，想要详细了解可以看看这两篇文章。如果本文中有说的不正确的地方，欢迎大佬鞭策!  

**参考资料：**

[前端安全系列一：如何防止XSS攻击？](https://juejin.im/post/6844903685122703367)  
[前端安全系列二：如何防止CSRF攻击？](https://juejin.im/post/6844903689702866952)  
[web大前端开发中一些常见的安全性问题](https://www.jianshu.com/p/f8e47a132e1c)  
[聊一聊WEB前端安全那些事儿](https://segmentfault.com/a/1190000006672214)  


