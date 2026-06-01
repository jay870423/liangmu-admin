// 商品
export interface Product {
  id: number
  name: string
  category_id: number
  category_name?: string
  price: number
  original_price?: number
  stock: number
  description?: string
  images?: string[]
  specs?: { name: string; options: string[] }[]
  is_active: boolean
  created_at: string
}

// 分类
export interface Category {
  id: number
  name: string
  sort_order: number
  created_at: string
}

// 轮播图
export interface Banner {
  id: number
  title: string
  image_url: string
  link_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

// 订单
export interface Order {
  id: number
  order_no: string
  user_id: number
  user_nickname?: string
  total_amount: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded'
  created_at: string
  updated_at: string
  items?: OrderItem[]
  address?: Address
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
}

export interface Address {
  id: number
  receiver_name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
}

// 优惠券
export interface Coupon {
  id: number
  name: string
  type: 'fixed' | 'percent'
  value: number
  min_amount: number
  total_count: number
  used_count: number
  start_time: string
  end_time: string
  is_active: boolean
}

// 用户
export interface User {
  id: number
  nickname: string
  phone?: string
  points: number
  total_spent: number
  order_count: number
  created_at: string
  tags?: string[]
}

// 仪表盘统计
export interface DashboardStats {
  today_orders: number
  today_sales: number
  today_users: number
  total_products: number
  pending_orders: number
  low_stock_products: Product[]
}
