# 彻底弄懂 cookie、session、token、webstorage

本文要讲述的主要就是 cookie、session、token、webstorage 这四兄弟之间的关系与区别，他们都是我们前端攻城狮经常接触的，特别是关于鉴权、用户信息这一方面

---

## cookie

### cookie 是什么

cookie 指某些网站为了辨别用户身份而储存在用户浏览器上的数据(通常经过加密)，以便于用户再次访问的时候对用户进行身份校验。cookie 是服务器保存在浏览器的一小段文本信息，每个 cookie 的大小一般不能超过 4KB。浏览器每次向服务器发出请求，就会自动附上这段信息

HTTP 是一种无状态传输协议，它不能以状态来区分和管理请求和响应。也就是说，服务器接收到了一个 HTTP 请求时，服务器并不知道这个请求是谁发来的，假如现在有三个人，A、B、C，他们的编号分别为 1、2、3，这三个人向服务器发送请求时，把自己的编号带过去，服务器就可以知道请求是谁发来的了。cookie 也是一样的道理，cookie 中存储用户的信息，在发送请求时把 cookie 存储的用户信息带到服务器，服务器就可以根据带过来的用户信息来区分请求来自哪个用户了

---

### cookie 的属性

cookie 有以下重要参数

[![0y0AWd.png](https://s1.ax1x.com/2020/10/10/0y0AWd.png)](https://s1.ax1x.com/2020/10/10/0y0AWd.png)

除了以上参数外，cookie 还新增了一个参数 `SameSite`，用来防止 CSRF 攻击和用户追踪

CSRF 可以看我之前的文章，这里就不多说了，这里引用阮一峰老师的文章解释一下 cookie 实现用户追踪的原理

比如，Facebook 在第三方网站插入一张看不见的图片

```html
<img src="facebook.com" style="visibility:hidden;" />
```

浏览器加载上面代码时，就会向 Facebook 发出带有 cookie 的请求，从而 Facebook 就会知道你是谁，访问了什么网站

cookie 的 SameSite 属性用来限制第三方 cookie，从而减少安全风险，它有三个值 **Strict**、**Lax**、**None**

- Strict，最为严格，完全禁止第三方 cookie，跨站点时，任何情况下都不会发送 cookie。换言之，只有当前网页的 url 与请求目标一致，才会带上 cookie

```javascript
Set-Cookie: CookieName=CookieValue; SameSite=Strict;
```

- Lax，规则稍稍放宽，大多数情况也是不发送第三方 cookie，但是导航到目标网址的 get 请求(链接、预加载、get 表单)除外

| 请求类型  |                 示例                 |  正常情况   |     Lax     |
| :-------: | :----------------------------------: | :---------: | :---------: |
|   链接    |         `<a href="..."></a>`         | 发送 cookie | 发送 cookie |
|  预加载   | `<link rel="prerender" href="..."/>` | 发送 cookie | 发送 cookie |
| get 表单  |  `<form method="GET" action="...">`  | 发送 cookie | 发送 cookie |
| post 表单 | `<form method="POST" action="...">`  | 发送 cookie |   不发送    |

- None，显式关闭 SameSite 属性，前提是必须同时设置 Secure 属性（cookie 只能通过 HTTPS 协议发送），否则无效

```javascript
Set-Cookie: widget_session=abc123; SameSite=None; Secure
```

cookie 其中一个属性 `HttpOnly`，指定该 cookie 无法通过 js 脚本拿到，主要是 `document.cookie` 属性、`XMLHttpRequest` 对象和 `Request API` 都拿不到该属性。这样就防止了该 cookie 被脚本读到，只有浏览器发出 HTTP 请求时，才会带上该 cookie

---

### 如何设置 cookie

服务器通过 response 的 `set-cookie` 字段告诉客户端去写入 cookie，后面的请求都会携带该 cookie

[![0ydcC9.png](https://s1.ax1x.com/2020/10/10/0ydcC9.png)](https://s1.ax1x.com/2020/10/10/0ydcC9.png)

浏览器可以设置不接受 cookie，也可以设置不向服务器发送 cookie，`window.navigator.cookieEnabled` 属性返回一个布尔值，表示浏览器是否打开 cookie 功能

```javascript
// 浏览器是否打开 cookie 功能
window.navigator.cookieEnabled; // true
```

---

### 如何使用 cookie

浏览器每次向服务器发出请求，就会自动附上当前网页所存储的 cookie

`document.cookie` 属性返回当前网页的 cookie

```javascript
// 当前网页的 cookie
document.cookie;
```

对 `document.cookie` 属性以键值对的形式赋值可以写入 cookie

```javascript
// 写入 cookie 一次只能写入一个 cookie，而且写入并不是覆盖，而是添加
document.cookie = 'test = 111';
```

写入 cookie 的时候，可以一起写入 cookie 的属性

```javascript
document.cookie = 'foo=bar; expires=Fri, 31 Dec 2020 23:59:59 GMT';
```

cookie 的属性一旦设置完成，就没有办法读取这些属性的值

不同浏览器对 cookie 数量和大小的限制，是不一样的。一般来说，单个域名设置的 cookie 不应超过 30 个，每个 cookie 的大小不能超过 4KB。超过限制以后，cookie 将被忽略，不会被设置

浏览器的同源政策规定，两个网址只要域名相同和端口相同，就可以共享 cookie。注意，这里不要求协议相同。也就是说，`http://example.com` 设置的 cookie，可以被 `https://example.com` 读取

---

## session

session 是另一种记录服务器和客户端会话状态的机制，只不过 session 存储在服务器端，该会话对应的 key 即 sessionId 会被存储到客户端的 cookie 中

在用户登录成功后，服务器在当前对话（session）里面保存相关数据，比如用户角色、登录时间等等，并向客户端返回一个 session_id，写入客户端的 cookie，用户随后的每一次请求，都会通过 cookie，将 session_id 传回服务器，服务器收到 session_id，找到之前保存的数据，由此得知用户的身份

**使用 session 有以下缺点**

- 占资源，需要为每个认证用户在内存中存储 session，如果用户数量很大，服务端的开销将会增大
- 扩展性差，如果后端是一个服务器集群，需要 session 数据共享，每台服务器都能够读取 session，这就要进行一定的处理(加一层持久层或者写入数据库的方式存储 session)
- 不能防止 CSRF 攻击，基于 cookie 来进行用户识别时，用户 cookie 如果被截获，就容易受到跨站请求伪造的攻击

**cookie 和 session 对比**

- 安全性：session 比 cookie 安全，session 是存储在服务器端的，cookie 是存储在客户端的，相比而言 session 更安全
- 存取值的类型：cookie 只支持存字符串数据，想要设置其他类型的数据，需要将其转换成字符串，session 可以存任意数据类型
- 有效期：cookie 可设置为长时间保持，比如我们经常使用的默认登录功能，session 一般失效时间较短，客户端关闭(默认情况下)或者 session 超时都会失效
- 存储大小：单个 cookie 保存的数据不能超过 4KB，session 可存储数据远高于 cookie，但是当访问量过多，会占用过多的服务器资源

---

## token

token 是一串字符串，通常作为鉴权凭据，最常用的使用场景是 API 鉴权

在用户登录成功后，服务端根据用户认证凭证使用特定算法生成一个字符串，这就是 token，然后把这个 token 返回给客户端，客户端每次向服务端请求资源的时候需要带着服务端签发的 token，服务端会对 token 进行验证，验证成功则返回数据，验证失败则返回具体内容，前端再进行对应操作(比如跳转到登录页面)

目前比较常用的就是 JWT(jsonwebtoken)，这里不再赘述，可以看看阮一峰老师的文章 [JSON Web Token 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

**对比 cookie 与 session，token 有以下优点**

- 适当减少服务端压力，服务端不需要像 session 那样为每个用户都存储一份认证信息
- 支持跨域访问，cookie 是不支持跨域访问的，也就是说 HTTP 请求在跨域的情况下不会自动携带 cookie，但是 token 支持跨域访问
- 防止 CSRF 攻击，CSRF 利用的就是 cookie，使用 token 可以很好的预防
- 无状态，可以在多个服务间共享

关于 cookie 不支持跨域与 CSRF 攻击的联系，cookie 在跨域 HTTP 请求确实是不会自动带上的，根本原因就是浏览器同源策略，CSRF 攻击是利用钓鱼网站携带用户认证的 cookie 向源站服务器发送请求，这种情况下是跨域的，cookie 不会自动携带，那么可以利用不受浏览器同源策略限制的手段进行 CSRF 攻击，比如用 script，img 或者 iframe 之类的请求源站服务器，浏览器就会自动带上 cookie，从而进行 CSRF 攻击，**script、image、iframe 的 src 都不受同源策略的影响，所以可以借助这一特点，实现跨域，进行 CSRF 攻击**

**token 有以下缺点**

- 占带宽，token 是一个比较长的字符串，因此传输过程中会消耗比较多的带宽
- 无法在服务端注销，token 是无法手动注销的，只有 token 的时效过期，才能达到注销 token 的目的
- 性能问题，因为 token 是根据加密算法生成的，所以在加密、解密生成 token 时，需要花费一定的计算时间

对于 token 无法在服务端注销这一问题，是有解决办法的，我们可以给 token 做一个映射，比如用字符串 A 代表 token1，用字符串 B 代表 token2，既然 token 无法手动注销，那么我们可以对 token 的映射进行操作即可，让各个 token 的映射无法访问到真实 token 即可，我写过一个 token 自动刷新的 demo，原理是一样的，可以看这里 [传送门](https://github.com/EmotionBin/various-demo/tree/master/token-auto-refresh)

---

## webstorage

### sessionStorage 与 localStorage

Storage 接口用于脚本在浏览器保存数据。两个对象部署了这个接口：window.sessionStorage 和 window.localStorage

sessionStorage 特别的一点在于，即便是相同域名下的两个页面，只要它们不在同一个浏览器窗口中打开，那么它们的 sessionStorage 内容便无法共享；localStorage 在所有同源窗口中都是共享的

sessionStorage 保存的数据用于浏览器的一次会话(session)，当会话结束(通常是窗口关闭)，数据被清空;localStorage 保存的数据长期存在，下一次访问该网站的时候，网页可以直接读取以前保存的数据。除了保存期限的长短不同，这两个对象的其他方面都一致

sessionStorage 与 localStorage 保存的数据都以“键值对”的形式存在，所有的数据都是以文本格式保存

与 cookie 相比，他们两能够使用大得多的存储空间。目前，每个域名的存储上限视浏览器而定，Chrome 是 5MB。另外，与 cookie 一样，它们也受同域限制。某个网页存入的数据，只有同域下的网页才能读取，**协议和端口都有影响**，如果跨域操作会报错，请看下面的例子

- http://a.com 和 https://a.com 不共享
- http://a.com:80 和 http://a.com:8080 不共享
- http://a.com 和 http://a.com:80 共享

---

### 属性和方法

**返回保存的数据项个数**

```javascript
window.sessionStorage.length;
window.localStorage.length;
```

**写入数据**

以键值对的形式写入数据，如果键名已经存在，该方法会更新已有的键值

```javascript
window.sessionStorage.setItem('key', 'value');
window.localStorage.setItem('key', 'value');
```

**读取数据**

```javascript
window.sessionStorage.getItem('key');
window.localStorage.getItem('key');
```

**清除某一条数据**

```javascript
window.sessionStorage.removeItem('key');
window.localStorage.removeItem('key');
```

**清除所有数据**

```javascript
window.sessionStorage.clear();
window.localStorage.clear();
```

**遍历所有数据项**

```javascript
for (var i = 0; i < window.localStorage.length; i++) {
  console.log(localStorage.key(i));
}
```

**事件监听**

```javascript
function onStorageChange(e) {
  console.log(e.key);
}

window.addEventListener('storage', onStorageChange);
```

注意，该事件有一个很特别的地方，就是它不在导致数据变化的当前页面触发，而是在同一个域名的其他窗口触发。也就是说，如果浏览器只打开一个窗口，可能观察不到这个事件。比如同时打开多个窗口，当其中的一个窗口导致储存的数据发生改变时，只有在其他窗口才能观察到监听函数的执行。**可以通过这种机制，实现多个窗口之间的通信，实现同域下的页面之间广播机制**

---

## 实践

来看一些面试题

### cookie、sessionStorage 和 localStorage 的区别

这是一道老生常谈的面试题了，我觉得这道题的回答思路可以分为以下几个方面

**从存储时效来说**

- cookie 可以手动设置失效期，默认为会话级(即浏览器关闭，会话结束后自动清空)
- sessionStorage 的存储时长也是会话级
- localStorage 的存储时长是永久，除非用户手动删除

**从访问的局限性来说**

- cookie 可以设置路径 path，path 不一致不能访问，但是 path 设为根路径都可以访问，所以他要比另外两个多了一层访问限制
- localStorage 和 sessionStorage 的访问受到浏览器同源策略限制，同协议、域名、端口才能访问
- cookie 可以通过设置 domain 属性值，可以不同二级域名下共享 cookie，而 Storage 不可以(Storage 可以通过 iframe 实现跨域访问)

**从存储大小限制来说**

- cookie 适合存储少量数据，他的大小限制是个数进行限制，每个浏览器的限制数量不同
- Storage 可以存储数据的量较大，此外他是通过占用空间大小来做限制的

**其他**

- 在发送 http 请求时，如果是非跨域请求，默认情况下浏览器会将 cookie 自动带上发送到服务端
- cookie 可以由服务端通过 http 来设定

---

## 结束语

以上就是关于本文的所有内容。如果本文中有说的不正确的地方，欢迎大佬鞭策!

**参考资料：**

[前端鉴权知识学习](https://juejin.im/post/6844903708938108935)  
[Cookie 的 SameSite 属性](http://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html)  
[阮一峰 Cookie](https://javascript.ruanyifeng.com/bom/cookie.html)  
[JSON Web Token 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)  
[Web Storage：浏览器端数据储存机制](https://javascript.ruanyifeng.com/bom/webstorage.html)
