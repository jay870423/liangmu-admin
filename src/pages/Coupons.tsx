import React, { useEffect, useState } from 'react'
import { couponList, couponCreate, couponUpdate, couponDelete } from '../api'
import type { Coupon } from '../types'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null)
  const [form, setForm] = useState({
    name: '', type: 'fixed', value: 0, min_amount: 0,
    total_count: 0, start_time: '', end_time: '', is_active: true
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const data: any = await couponList()
      setCoupons(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const openForm = (c?: Coupon) => {
    setEditCoupon(c || null)
    setForm({
      name: c?.name || '', type: c?.type || 'fixed',
      value: c?.value || 0, min_amount: c?.min_amount || 0,
      total_count: c?.total_count || 0,
      start_time: c?.start_time || '',
      end_time: c?.end_time || '',
      is_active: c?.is_active ?? true
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      if (editCoupon) {
        await couponUpdate(editCoupon.id, form)
      } else {
        await couponCreate(form)
      }
      setShowForm(false)
      loadData()
    } catch (err: any) { alert(err.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>优惠券管理</h2>
        <button onClick={() => openForm()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          <Plus size={16} /> 创建优惠券
        </button>
      </div>

      <div className="table-card">
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>加载中...</div> :
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>优惠券名称</th>
                <th style={{ padding: '10px 8px' }}>类型</th>
                <th style={{ padding: '10px 8px' }}>优惠内容</th>
                <th style={{ padding: '10px 8px' }}>使用门槛</th>
                <th style={{ padding: '10px 8px' }}>发放/使用</th>
                <th style={{ padding: '10px 8px' }}>有效期</th>
                <th style={{ padding: '10px 8px' }}>状态</th>
                <th style={{ padding: '10px 8px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{c.type === 'fixed' ? '满减' : '折扣'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#e94560', fontWeight: 600 }}>
                    {c.type === 'fixed' ? `¥${c.value}` : `${c.value}折`}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#888' }}>满¥{c.min_amount}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12 }}>
                    <span style={{ color: '#52c41a' }}>{c.total_count - c.used_count}</span>
                    <span style={{ color: '#888' }}>/{c.total_count}</span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, color: '#888' }}>
                    {c.start_time?.slice(0, 10)}<br />至 {c.end_time?.slice(0, 10)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span className={c.is_active ? 'tag-active' : 'tag-inactive'}>{c.is_active ? '有效' : '失效'}</span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button onClick={() => openForm(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1677ff', marginRight: 8 }}><Edit2 size={14} /></button>
                    <button onClick={() => { if (confirm('确认删除？')) couponDelete(c.id).then(() => loadData()) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480 }}>
            <h3 style={{ marginBottom: 20 }}>{editCoupon ? '编辑优惠券' : '创建优惠券'}</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#666' }}>名称</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>类型</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }}>
                    <option value="fixed">满减券</option>
                    <option value="percent">折扣券</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>面值/折扣</label>
                  <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>最低消费</label>
                  <input type="number" value={form.min_amount} onChange={e => setForm(f => ({ ...f, min_amount: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>发放数量</label>
                  <input type="number" value={form.total_count} onChange={e => setForm(f => ({ ...f, total_count: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>开始时间</label>
                  <input type="date" value={form.start_time?.slice(0, 10)} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>结束时间</label>
                  <input type="date" value={form.end_time?.slice(0, 10)} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>取消</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
