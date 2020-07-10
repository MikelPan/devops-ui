// An highlighted block
import axios from 'axios'
// import { MessageBox, Message } from 'element-ui'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

axios.defaults.withCredentials = true
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.getters.token && config.url !== '/auth/oauth/check_token') {
      config.headers['Authorization'] = 'Bearer ' + getToken()
      // config.headers['Authorization'] = 'Basic YW1hemluZ2xhbmQ6YW1hemluZ2xhbmQ='
    } else {
      config.headers['Authorization'] = process.env.VUE_APP_BASIC_TOKEN
    }

    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const { data, config } = response
    if (response.headers['content-type'] === 'application/x-excel;charset=UTF-8') {
      return response
    }

    if (config.url.indexOf('auth') === -1 && data.code !== 0) {
      Message({
        message: data.msg.split(':')[1] || data.msg.split(':')[0] || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject(new Error(data.msg.split(':')[1] || 'Error'))
    } else {
      return data
    }
  },
  error => {
    if (error.response) {
      const { status, config, data } = error.response
      if (status === 400 && config.url.indexOf('/auth/oauth/check_token') !== -1 || status === 401 || status === 403) {
        // store.dispatch('user/logout')
        // store.dispatch('user/logout')
        return
      } else {
        return data
      }
    } else {
      if (error.message.indexOf('timeout') !== -1) {
        error.message = '网络请求超时'
      }
      if (error.message.indexOf('Network') !== -1) {
        error.message = '网络异常'
      }
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject(error)
    }
  }
)

export default service
