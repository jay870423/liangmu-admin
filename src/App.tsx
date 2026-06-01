import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Layout, Users, Package, Tag, Image, ShoppingCart, Ticket, Home, Bot, LogOut } from 'lucide-react'

// 页面
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Banners from './pages/Banners'
import Orders from './pages/Orders'
import Coupons from './pages/Coupons'
import UsersPage from './pages/Users'
import AIAssistant from './pages/AIAssistant'

function Sidebar() {
  const location = useLocation()
  const menus = [
    { path: '/dashboard', icon: <Home size={18} />, label: '首页看板' },
    { path: '/products', icon: <Package size={18} />, label: '商品管理' },
    { path: '/categories', icon: <Tag size={18} />, label: '分类管理' },
    { path: '/banners', icon: <Image size={18} />, label: '轮播图' },
    { path: '/orders', icon: <ShoppingCart size={18} />, label: '订单管理' },
    { path: '/coupons', icon: <Ticket size={18} />, label: '优惠券' },
    { path: '/users', icon: <Users size={18} />, label: '用户管理' },
    { path: '/ai', icon: <Bot size={18} />, label: 'AI助手' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/login'
  }

  return (
    <div className="admin-sidebar">
      <div className="logo">
        <Layout size={18} style={{ display: 'inline', marginRight: 8 }} />
        <span>良木森林</span>
      </div>
      <nav>
        {menus.map(m => (
          <Link
            key={m.path}
            to={m.path}
            className={location.pathname === m.path ? 'active' : ''}
          >
            {m.icon}
            <span>{m.label}</span>
          </Link>
        ))}
        <a onClick={handleLogout} style={{ cursor: 'pointer', marginTop: 'auto' }}>
          <LogOut size={18} />
          <span>退出登录</span>
        </a>
      </nav>
    </div>
  )
}

function Header() {
  return (
    <div className="admin-header">
      <div style={{ fontSize: 14, color: '#888' }}>良木森林小程序管理后台</div>
      <div style={{ fontSize: 13, color: '#666' }}>管理员</div>
    </div>
  )
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AuthRoute><AppLayout><Dashboard /></AppLayout></AuthRoute>} />
        <Route path="/products" element={<AuthRoute><AppLayout><Products /></AppLayout></AuthRoute>} />
        <Route path="/categories" element={<AuthRoute><AppLayout><Categories /></AppLayout></AuthRoute>} />
        <Route path="/banners" element={<AuthRoute><AppLayout><Banners /></AppLayout></AuthRoute>} />
        <Route path="/orders" element={<AuthRoute><AppLayout><Orders /></AppLayout></AuthRoute>} />
        <Route path="/coupons" element={<AuthRoute><AppLayout><Coupons /></AppLayout></AuthRoute>} />
        <Route path="/users" element={<AuthRoute><AppLayout><UsersPage /></AppLayout></AuthRoute>} />
        <Route path="/ai" element={<AuthRoute><AppLayout><AIAssistant /></AppLayout></AuthRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
