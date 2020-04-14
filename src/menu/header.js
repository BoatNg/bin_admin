// 菜单 顶栏
export default [
  { path: '/index', title: '首页', icon: 'home' },
  {
    title: '首页编辑',
    icon: 'folder-o',
    children: [
      { path: '/page1', title: '上传资源' },
      { path: '/page2', title: 'banner' },
      { path: '/page3', title: '视频' }
    ]
  }
]
