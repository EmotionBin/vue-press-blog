module.exports = [
  {
    text: 'Home',
    link: '/'
  },
  {
    text: '博客',
    link: '/blog/'
  },
  {
    text: '工具箱',
    items: [{
        text: '在线编辑',
        items: [{
          text: '图片压缩',
          link: 'https://tinypng.com/'
        }]
      },
      {
        text: '在线服务',
        items: [{
            text: '阿里云',
            link: 'https://www.aliyun.com/'
          },
          {
            text: '腾讯云',
            link: 'https://cloud.tencent.com/'
          }
        ]
      },
      {
        text: '博客指南',
        items: [{
            text: '掘金',
            link: 'https://juejin.im/'
          },
          {
            text: 'CSDN',
            link: 'https://blog.csdn.net/'
          }
        ]
      }
    ]
  },
  {
    text: 'github',
    link: 'https://github.com/EmotionBin/vue-press-blog'
  },
]