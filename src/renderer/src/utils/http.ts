import axios from 'axios'

export const http = axios.create({
  baseURL: 'http://8.137.123.249:3000/', // 线上
  // baseURL: 'http://127.0.0.1:3000', //   本地地址
  timeout: 10000
})

http.interceptors.request.use(
  (conifg) => {
    return conifg
  },
  (err) => {
    return Promise.reject(err)
  }
)

http.interceptors.response.use(
  (response) => {
    return response.data
  },
  (res) => {
    return Promise.reject(res.response ? res.response.data : res)
  }
)
