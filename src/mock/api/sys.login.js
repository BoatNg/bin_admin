const userDB = [
  { user_name: 'admin', password: 'admin', uuid: 'admin-uuid', name: 'Admin' },
  { user_name: 'editor', password: 'editor', uuid: 'editor-uuid', name: 'Editor' },
  { user_name: 'user1', password: 'user1', uuid: 'user1-uuid', name: 'User1' }
]

export default [
  {
    path: '/api/login',
    method: 'post',
    handle ({ body }) {
      const user = userDB.find(e => e.user_name === body.user_name && e.password === body.password)
      if (user) {
        return {
          code: 0,
          msg: '登录成功',
          data: {
            ...user,
            token: '8dfhassad0asdjwoeiruty'
          }
        }
      } else {
        return {
          code: 401,
          msg: '用户名或密码错误',
          data: {}
        }
      }
    }
  }
]
