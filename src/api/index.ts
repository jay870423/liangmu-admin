import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://81.70.144.73:5176/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: false,
})

// 请求拦截：注入 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一错误处理
api.interceptors.response.use(
  response => response.data,
  error => {
    const msg = error.response?.data?.message || error.message || '请求失败'
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(new Error(msg))
  }
)

export default api

// ============ 认证 ============
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password })

export const adminInfo = () =>
  api.get('/auth/admin')

// ============ 首页统计 ============
export const dashboardStats = () =>
  api.get('/admin/stats')

export const dashboardOrders = (date?: string) =>
  api.get('/admin/orders/recent', { params: { date } })

export const aiAnalyze = (type: string, data: any) =>
  api.post('/admin/ai/analyze', { type, data })

// ============ 商品 ============
export const productList = (params?: { page?: number; page_size?: number; category_id?: number; keyword?: string }) =>
  api.get('/products', { params })

export const productDetail = (id: number) =>
  api.get(`/products/${id}`)

export const productCreate = (data: any) =>
  api.post('/products', data)

export const productUpdate = (id: number, data: any) =>
  api.put(`/products/${id}`, data)

export const productDelete = (id: number) =>
  api.delete(`/products/${id}`)

export const productToggleStatus = (id: number) =>
  api.post(`/products/${id}/toggle`)

// ============ 分类 ============
export const categoryList = () =>
  api.get('/categories')

export const categoryCreate = (data: any) =>
  api.post('/categories', data)

export const categoryUpdate = (id: number, data: any) =>
  api.put(`/categories/${id}`, data)

export const categoryDelete = (id: number) =>
  api.delete(`/categories/${id}`)

// ============ 轮播图 ============
export const bannerList = () =>
  api.get('/home/banners')

export const bannerCreate = (data: any) =>
  api.post('/home/banners', data)

export const bannerUpdate = (id: number, data: any) =>
  api.put(`/home/banners/${id}`, data)

export const bannerDelete = (id: number) =>
  api.delete(`/home/banners/${id}`)

export const bannerAiGenerate = (banner_title: string, banner_desc: string) =>
  api.get('/home/banners/ai/generate_image', { params: { banner_title, banner_desc }, timeout: 60000 })

export const categoryAiGenerate = (category_name: string, category_type: string) =>
  api.get('/home/categories/ai/generate_icon', { params: { category_name, category_type }, timeout: 60000 })

// ============ 订单 ============
export const orderList = (params?: { page?: number; page_size?: number; status?: string }) =>
  api.get('/orders', { params })

export const orderDetail = (id: number) =>
  api.get(`/orders/${id}`)

export const orderUpdateStatus = (id: number, status: string) =>
  api.put(`/orders/${id}/status`, { status })

// ============ 优惠券 ============
export const couponList = () =>
  api.get('/coupons')

export const couponCreate = (data: any) =>
  api.post('/coupons', data)

export const couponUpdate = (id: number, data: any) =>
  api.put(`/coupons/${id}`, data)

export const couponDelete = (id: number) =>
  api.delete(`/coupons/${id}`)

// ============ 用户 ============
export const userList = (params?: { page?: number; page_size?: number; keyword?: string }) =>
  api.get('/admin/users', { params })

export const userDetail = (id: number) =>
  api.get(`/admin/users/${id}`)

export const userPoints = (userId: number) =>
  api.get(`/admin/users/${userId}/points`)

// ============ AI能力 ============
export const aiGenerateDesc = (productName: string, category: string) =>
  api.post('/admin/ai/generate_desc', { product_name: productName, category })

export const aiChat = (message: string, context?: string) =>
  api.post('/admin/ai/chat', { message, context })

export const aiPredict = (type: string, data: any) =>
  api.post('/admin/ai/predict', { type, data })
