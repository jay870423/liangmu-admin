import React, { useEffect, useState } from 'react'
import { orderList, orderUpdateStatus } from '../api'
import type { Order } from '../types'
import { Eye, CheckCircle } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string, class: string }> = {
  pending: { label: '待支付', class: 'tag-pending' },
  paid: { label: '已支付', class: 'tag-active' },
  shipped: { label: '已发货', class: 'tag-active' },
  delivered: { label: '已完成', class: 'tag-active' },
  refunded: { label: '已退款', class: 'tag-inactive' },
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('')
  const [detail, setDetail] = useState<Order | null>(null)

  useEffect(() => { loadData() }, [page, status])

  const loadData = async () => {
    setLoading(true)
    try {
      const data: any = await orderList({ page, page_size: 10, status: status || undefined })
      setOrders(data.items || data.list || [])
      setTotal(data.total || 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>订单管理</h2>

      {/* 状态过滤 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['', 'pending', 'paid', 'shipped', 'delivered', 'refunded'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            style={{
              padding: '6px 14px',
              border: '1px solid',
              borderColor: status === s ? '#e94560' : '#ddd',
              borderRadius: 20,
              background: status === s ? '#e94560' : '#fff',
              color: status === s ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            {s === '' ? '全部' : STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="table-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>订单号</th>
              <th style={{ padding: '10px 8px' }}>用户</th>
              <th style={{ padding: '10px 8px' }}>金额</th>
              <th style={{ padding: '10px 8px' }}>状态</th>
              <th style={{ padding: '10px 8px' }}>时间</th>
              <th style={{ padding: '10px 8px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#888' }}>加载中...</td></tr> :
              orders.length === 0 ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#888' }}>暂无订单</td></tr> :
                orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace' }}>{o.order_no}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{o.user_nickname || `用户${o.user_id}`}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#e94560', fontWeight: 600 }}>¥{o.total_amount}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span className={STATUS_MAP[o.status]?.class || 'tag-pending'}>{STATUS_MAP[o.status]?.label || o.status}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#888', fontSize: 12 }}>{o.created_at?.slice(0, 16)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <button onClick={() => setDetail(o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1677ff' }}><Eye size={14} /></button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        {total > 10 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>上一页</button>
            <span style={{ padding: '6px 12px', fontSize: 13 }}>第 {page} / {Math.ceil(total / 10)} 页</span>
            <button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer', opacity: page >= Math.ceil(total / 10) ? 0.5 : 1 }}>下一页</button>
          </div>
        )}
      </div>

      {/* 订单详情弹窗 */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 560, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>订单详情</h3>
              <span className={STATUS_MAP[detail.status]?.class}>{STATUS_MAP[detail.status]?.label}</span>
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              <div>订单号：{detail.order_no}</div>
              <div>用户：{detail.user_nickname || `ID: ${detail.user_id}`}</div>
              <div>金额：<span style={{ color: '#e94560', fontWeight: 600 }}>¥{detail.total_amount}</span></div>
              <div>时间：{detail.created_at}</div>
            </div>
            {detail.items && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>商品明细</div>
                {detail.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                    <span>{item.product_name} x{item.quantity}</span>
                    <span style={{ color: '#e94560' }}>¥{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
            {detail.address && (
              <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>收货地址</div>
                <div>{detail.address.receiver_name} {detail.address.phone}</div>
                <div>{detail.address.province} {detail.address.city} {detail.address.district} {detail.address.detail}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {detail.status === 'paid' && (
                <button
                  onClick={async () => {
                    await orderUpdateStatus(detail.id, 'shipped')
                    setDetail(null)
                    loadData()
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                  <CheckCircle size={16} /> 确认发货
                </button>
              )}
              <button onClick={() => setDetail(null)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
