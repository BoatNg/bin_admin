// 菜单 顶栏
export default [
  { path: '/index', title: '首页', icon: 'home' },
  {
    title: '上传资源',
    icon: 'upload',
    path: '/page1'
  },
  {
    title: '首页编辑',
    icon: 'folder-o',
    children: [
      { path: '/page2/banner', title: 'banner管理' },
      { path: '/page2/video', title: 'video管理' },
    ]
  },
  {
    title: '菜单编辑',
    icon: 'folder-o',
    children: [
      { path: '/page3', title: '菜单管理' },
      // { path: '/edit-article', title: '文章编辑' }

    ]
  }
]
