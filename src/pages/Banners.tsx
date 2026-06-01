import React, { useEffect, useState } from 'react'
import { bannerList, bannerCreate, bannerUpdate, bannerDelete, bannerAiGenerate } from '../api'
import type { Banner } from '../types'
import { Plus, Edit2, Trash2, Image, Sparkles } from 'lucide-react'

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBanner, setEditBanner] = useState<Banner | null>(null)
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', sort_order: 0, is_active: true })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPreview, setAiPreview] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const data: any = await bannerList()
      setBanners(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const openForm = (b?: Banner) => {
    setEditBanner(b || null)
    setForm({
      title: b?.title || '', image_url: b?.image_url || '',
      link_url: b?.link_url || '', sort_order: b?.sort_order || 0,
      is_active: b?.is_active ?? true
    })
    setAiPreview(b?.image_url || null)
    setShowForm(true)
  }

  const handleAiGenerate = async () => {
    if (!form.title) { alert('请先填写标题'); return }
    setAiLoading(true)
    try {
      const res: any = await bannerAiGenerate(form.title, form.link_url || '')
      const imageUrl = res.image_url || res.url || res.data?.image_url || ''
      if (imageUrl) {
        setAiPreview(imageUrl)
        setForm(f => ({ ...f, image_url: imageUrl }))
      } else {
        alert('生成失败，请重试')
      }
    } catch (err: any) {
      alert(err.message || 'AI生成失败')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editBanner) {
        await bannerUpdate(editBanner.id, form)
      } else {
        await bannerCreate(form)
      }
      setShowForm(false)
      loadData()
    } catch (err: any) { alert(err.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>轮播图管理</h2>
        <button onClick={() => openForm()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          <Plus size={16} /> 添加轮播图
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888', gridColumn: '1/-1' }}>加载中...</div> :
          banners.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#888', gridColumn: '1/-1' }}>暂无轮播图</div> :
            banners.map(b => (
              <div key={b.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ height: 160, background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                  {b.image_url ? <img src={b.image_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Image size={48} />}
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{b.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={b.is_active ? 'tag-active' : 'tag-inactive'}>{b.is_active ? '显示' : '隐藏'}</span>
                    <div>
                      <button onClick={() => openForm(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1677ff', marginRight: 8 }}><Edit2 size={14} /></button>
                      <button onClick={() => { if (confirm('确认删除？')) bannerDelete(b.id).then(() => loadData()) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 520 }}>
            <h3 style={{ marginBottom: 20 }}>{editBanner ? '编辑轮播图' : '添加轮播图'}</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#666' }}>标题</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
                  图片URL
                  <button onClick={handleAiGenerate} disabled={aiLoading || !form.title} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px',
                    background: '#f5f7fa', border: '1px solid #ddd', borderRadius: 6,
                    fontSize: 12, cursor: aiLoading || !form.title ? 'not-allowed' : 'pointer',
                    color: '#667eea', marginLeft: 'auto'
                  }}>
                    <Sparkles size={12} /> {aiLoading ? '生成中...' : 'AI生成图片'}
                  </button>
                </label>
                <input value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setAiPreview(e.target.value || null) }} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} placeholder="https://..." />
              </div>
              {aiPreview && (
                <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', height: 160 }}>
                  <img src={aiPreview} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setAiPreview(null)} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 13, color: '#666' }}>跳转链接（可选）</label>
                <input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>排序</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>状态</label>
                  <select value={form.is_active ? '1' : '0'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === '1' }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }}>
                    <option value="1">显示</option>
                    <option value="0">隐藏</option>
                  </select>
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
