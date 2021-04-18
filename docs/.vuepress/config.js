module.exports = {
  base: process.env.NODE_ENV === 'development' ? '/' : '/blog/', // 设置根路径
  title: '黄伟斌的博客',
  description: '冲冲冲，淦就完事了',
  dest: './dist',  // 默认在 .vuepress 目录下
  port: '7777',
  head: [
    ['link', {
      rel: 'icon',
      href: '/img/avatar.jpg'
    }],
    ['link', {
      rel: 'stylesheet',
      href: '/css/style.css'
    }]
  ],
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    nav: require("./nav"),
    sidebar: require("./sidebar"),
    sidebarDepth: 2,
    lastUpdated: 'Last Updated',
    searchMaxSuggestoins: 10,
    serviceWorker: {
      updatePopup: {
        message: "有新的内容.",
        buttonText: '更新'
      }
    },
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页 ！'
  }
}