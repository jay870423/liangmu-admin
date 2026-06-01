import React, { useEffect, useState } from 'react'
import { dashboardStats, aiAnalyze } from '../api'
import { ShoppingCart, DollarSign, Users, Package, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react'
import type { DashboardStats } from '../types'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [aiTip, setAiTip] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data: any = await dashboardStats()
      setStats(data)
    } catch (err) {
      // 后端可能没有/admin/stats，用兜底数据
      setStats({
        today_orders: 0,
        today_sales: 0,
        today_users: 0,
        total_products: 0,
        pending_orders: 0,
        low_stock_products: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAiAnalyze = async () => {
    setAiLoading(true)
    try {
      const res: any = await aiAnalyze('dashboard_summary', stats)
      setAiTip(res.analysis || res.suggestion || '今日数据已分析完毕，整体运营状况良好。')
    } catch (err: any) {
      setAiTip('AI分析功能暂不可用，请检查后端AI模块配置。')
    } finally {
      setAiLoading(false)
    }
  }

  const cards = [
    { label: '今日订单', value: stats?.today_orders ?? '-', icon: <ShoppingCart size={24} color="#e94560" />, sub: '' },
    { label: '今日销售额', value: stats?.today_sales ? `¥${stats.today_sales}` : '-', icon: <DollarSign size={24} color="#52c41a" />, sub: '' },
    { label: '今日新用户', value: stats?.today_users ?? '-', icon: <Users size={24} color="#1677ff" />, sub: '' },
    { label: '商品总数', value: stats?.total_products ?? '-', icon: <Package size={24} color="#722ed1" />, sub: '' },
    { label: '待处理订单', value: stats?.pending_orders ?? '-', icon: <AlertTriangle size={24} color="#faad14" />, sub: stats?.pending_orders > 0 ? '需处理' : '无积压' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>首页看板</h2>

      {/* AI分析面板 */}
      <div className="ai-panel">
        <h3><Sparkles size={18} /> AI运营助手</h3>
        <div className="ai-tip">
          {aiTip || '点击下方按钮，获取今日数据AI分析和运营建议。'}
        </div>
        <button
          onClick={handleAiAnalyze}
          disabled={aiLoading}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 6,
            color: '#fff',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            fontSize: 13
          }}
        >
          {aiLoading ? '分析中...' : '✨ AI分析今日数据'}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stat-cards">
        {cards.map((card, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="label">{card.label}</div>
              {card.icon}
            </div>
            <div className="value">{loading ? '...' : card.value}</div>
            {card.sub && <div className="sub">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* 低库存预警 */}
      {stats?.low_stock_products && stats.low_stock_products.length > 0 && (
        <div className="table-card">
          <div className="card-title" style={{ color: '#faad14' }}>
            <AlertTriangle size={16} style={{ marginRight: 8 }} />
            低库存预警（共{stats.low_stock_products.length}件）
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {stats.low_stock_products.slice(0, 5).map(p => (
              <div key={p.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: '#fffbe6',
                borderRadius: 6,
                fontSize: 13
              }}>
                <span>{p.name}</span>
                <span style={{ color: '#faad14', fontWeight: 600 }}>库存 {p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快捷入口 */}
      <div className="table-card">
        <div className="card-title"><TrendingUp size={16} style={{ marginRight: 8 }} /> 快捷操作</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '添加商品', path: '/products' },
            { label: '查看订单', path: '/orders' },
            { label: '创建优惠券', path: '/coupons' },
            { label: 'AI助手', path: '/ai' },
          ].map(item => (
            <a key={item.path} href={item.path} style={{
              padding: '10px 20px',
              background: '#f5f7fa',
              borderRadius: 8,
              color: '#333',
              textDecoration: 'none',
              fontSize: 14
            }}>{item.label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
