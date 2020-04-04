const pcApi = {
  develop: 'http://dev.com',
  release: 'https://api.com/api'
}

const wcApi = {
  develop: 'http://dev.com',
  release: 'https://api.com/api'
}

export const wwwApi = pcApi['release']
export const wechatApi = wcApi['release']
