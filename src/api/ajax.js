import request from '@/plugin/axios'

export function postStatic(data) {
  return request({
    url: '/v1/static',
    method: 'post',
    data
  })
}

export function getStatic(params) {
  return request({
    url: '/v1/static',
    method: 'get',
    params,
  })
}

export function putStatic(body,id) {
  return request({
    url: `/v1/static/${id}`,
    method: 'put',
    data:body
  })
}

export function deleteStatic(id) {
  return request({
    url: `/v1/static/${id}`,
    method: 'delete',
  })
}

export function getTitle(params) {
  return request({
    url: '/v1/title',
    method: 'get',
    params,
  })
}

export function putTitle(body, id) {
  return request({
    url: `/v1/title/${id}`,
    method: 'put',
    data: body
  })
}

export function postTitle(data) {
  return request({
    url: '/v1/title',
    method: 'post',
    data
  })
}

export function postArticle(data, title_id) {
  return request({
    url: `/v1/article/${title_id}`,
    method: 'post',
    data
  })
}

export function putArticle(data, article_id) {
  return request({
    url: `/v1/article/${article_id}`,
    method: 'put',
    data
  })
}

export function getArticle(article_id) {
  return request({
    url: `/v1/article/${article_id}`,
    method: 'get',
  })
}

export function deleteArticle(title_id, article_id) {
  return request({
    url: `/v1/article/${title_id}/${article_id}`,
    method: 'delete',
  })
}

export function deleteTitle(title_id) {
  return request({
    url: `/v1/title/${title_id}`,
    method: 'delete'
  })
}