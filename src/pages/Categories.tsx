import React, { useEffect, useState, useRef } from 'react'
import { categoryList, categoryCreate, categoryUpdate, categoryDelete, categoryAiGenerate } from '../api'
import type { Category } from '../types'
import { Plus, Edit2, Trash2, Sparkles, Upload } from 'lucide-react'

export default function Categories() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', sort_order: 0, icon_url: '' })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiIcon, setAiIcon] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setForm({ name: c?.name || '', sort_order: c?.sort_order || 0, icon_url: (c as any)?.icon_url || '' })
    setAiIcon((c as any)?.icon_url || null)
    setShowForm(true)
  }

  const handleAiGenerate = async () => {
    if (!form.name) { alert('请先填写分类名称'); return }
    setAiLoading(true)
    try {
      const res: any = await categoryAiGenerate(form.name, '')
      const iconUrl = res.icon_url || res.image_url || res.url || res.data?.icon_url || ''
      if (iconUrl) {
        setAiIcon(iconUrl)
        setForm(f => ({ ...f, icon_url: iconUrl }))
      } else {
        alert('生成失败，请重试')
      }
    } catch (err: any) {
      alert(err.message || 'AI生成失败')
    } finally {
      setAiLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setAiIcon(dataUrl)
      setForm(f => ({ ...f, icon_url: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      const data: any = { name: form.name, sort_order: form.sort_order }
      if (aiIcon) data.icon_url = aiIcon
      if (editCat) {
        await categoryUpdate(editCat.id, data)
      } else {
        await categoryCreate(data)
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
                <th style={{ padding: '12px 8px', textAlign: 'left', width: 80 }}>图标</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>分类名称</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', width: 120 }}>排序</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', width: 200 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 8px' }}>
                    {(c as any).icon_url ? (
                      <img src={(c as any).icon_url} alt={c.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} onError={(e) => (e.target as any).style.display = 'none'} />
                    ) : (
                      <div style={{ width: 40, height: 40, background: '#f5f7fa', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 20 }}>🗂</span>
                      </div>
                    )}
                  </td>
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
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 440 }}>
            <h3 style={{ marginBottom: 20 }}>{editCat ? '编辑分类' : '添加分类'}</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>分类名称</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>排序（数字越小越靠前）</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                图标
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button onClick={handleAiGenerate} disabled={aiLoading || !form.name} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    background: '#f5f7fa', border: '1px solid #ddd', borderRadius: 6,
                    fontSize: 12, cursor: aiLoading || !form.name ? 'not-allowed' : 'pointer',
                    color: '#667eea'
                  }}>
                    <Sparkles size={12} /> {aiLoading ? '生成中...' : 'AI生成'}
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    background: '#f5f7fa', border: '1px solid #ddd', borderRadius: 6,
                    fontSize: 12, cursor: 'pointer', color: '#666'
                  }}>
                    <Upload size={12} /> 上传
                  </button>
                </span>
              </label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              {aiIcon && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={aiIcon} alt="图标预览" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                  <span style={{ fontSize: 12, color: '#52c41a' }}>✓ 已选择</span>
                </div>
              )}
              {!aiIcon && (
                <div style={{ marginTop: 8, width: 64, height: 64, background: '#f5f7fa', borderRadius: 8, border: '1px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                  <span style={{ fontSize: 24 }}>🗂</span>
                </div>
              )}
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
