import React, { useEffect, useState } from 'react'
import { categoryList, categoryCreate, categoryUpdate, categoryDelete } from '../api'
import type { Category } from '../types'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function Categories() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', sort_order: 0 })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const data: any = await categoryList()
      setCats(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const openForm = (c?: Category) => {
    setEditCat(c || null)
    setForm({ name: c?.name || '', sort_order: c?.sort_order || 0 })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      if (editCat) {
        await categoryUpdate(editCat.id, form)
      } else {
        await categoryCreate(form)
      }
      setShowForm(false)
      loadData()
    } catch (err: any) { alert(err.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>分类管理</h2>
        <button onClick={() => openForm()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          <Plus size={16} /> 添加分类
        </button>
      </div>

      <div className="table-card">
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>加载中...</div> :
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>分类名称</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', width: 120 }}>排序</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', width: 160 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', color: '#888' }}>{c.sort_order}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <button onClick={() => openForm(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1677ff', marginRight: 12 }}><Edit2 size={14} /></button>
                    <button onClick={() => { if (confirm('确认删除？')) categoryDelete(c.id).then(() => loadData()) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 400 }}>
            <h3 style={{ marginBottom: 20 }}>{editCat ? '编辑分类' : '添加分类'}</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>分类名称</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>排序（数字越小越靠前）</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>取消</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
