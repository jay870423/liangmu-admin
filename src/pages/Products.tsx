import React, { useEffect, useState } from 'react'
import { productList, productDelete, productToggleStatus, categoryList, aiGenerateDesc } from '../api'
import type { Product, Category } from '../types'
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, Search } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    name: '', category_id: 0, price: 0, original_price: 0,
    stock: 0, description: '', images: '', is_active: true
  })
  const [aiDesc, setAiDesc] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { loadData() }, [page, keyword, categoryId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [proRes, catRes]: any = await Promise.all([
        productList({ page, page_size: 10, keyword: keyword || undefined, category_id: categoryId }),
        categoryList()
      ])
      setProducts(proRes.items || proRes.list || [])
      setTotal(proRes.total || 0)
      setCategories(catRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAiDesc = async () => {
    if (!form.name) return
    setAiLoading(true)
    try {
      const res: any = await aiGenerateDesc(form.name, categories.find(c => c.id === form.category_id)?.name || '')
      setAiDesc(res.description || res.content || 'AI描述生成失败')
      setForm(f => ({ ...f, description: res.description || res.content || f.description }))
    } catch {
      setAiDesc('AI生成失败，请重试')
    } finally {
      setAiLoading(false)
    }
  }

  const openForm = (p?: Product) => {
    if (p) {
      setEditProduct(p)
      setForm({
        name: p.name, category_id: p.category_id, price: p.price,
        original_price: p.original_price || 0, stock: p.stock,
        description: p.description || '', images: (p.images || []).join(','), is_active: p.is_active
      })
    } else {
      setEditProduct(null)
      setForm({ name: '', category_id: 0, price: 0, original_price: 0, stock: 0, description: '', images: '', is_active: true })
    }
    setAiDesc('')
    setShowForm(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>商品管理</h2>
        <button onClick={() => openForm()} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 20px', background: '#e94560', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14
        }}>
          <Plus size={16} /> 添加商品
        </button>
      </div>

      {/* 搜索过滤 */}
      <div className="table-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }}
            placeholder="搜索商品名称..."
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 200 }}
          />
          <select
            value={categoryId || ''}
            onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
          >
            <option value="">全部分类</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="table-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>商品</th>
              <th style={{ padding: '10px 8px' }}>分类</th>
              <th style={{ padding: '10px 8px' }}>价格</th>
              <th style={{ padding: '10px 8px' }}>库存</th>
              <th style={{ padding: '10px 8px' }}>状态</th>
              <th style={{ padding: '10px 8px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#888' }}>加载中...</td></tr> :
              products.length === 0 ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#888' }}>暂无商品</td></tr> :
                products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>ID: {p.id}</div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{p.category_name || '-'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ color: '#e94560', fontWeight: 600 }}>¥{p.price}</div>
                      {p.original_price > p.price && <div style={{ fontSize: 11, color: '#888', textDecoration: 'line-through' }}>¥{p.original_price}</div>}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ color: p.stock < 10 ? '#faad14' : '#333' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span className={p.is_active ? 'tag-active' : 'tag-inactive'}>
                        {p.is_active ? '上架' : '下架'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => openForm(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1677ff', padding: 4 }} title="编辑"><Edit2 size={14} /></button>
                        <button onClick={() => productToggleStatus(p.id).then(() => loadData())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.is_active ? '#faad14' : '#52c41a', padding: 4 }} title={p.is_active ? '下架' : '上架'}>
                          {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => { if (confirm('确认删除？')) productDelete(p.id).then(() => loadData()) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', padding: 4 }} title="删除"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        {/* 分页 */}
        {total > 10 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>上一页</button>
            <span style={{ padding: '6px 12px', fontSize: 13 }}>第 {page} / {Math.ceil(total / 10)} 页</span>
            <button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer', opacity: page >= Math.ceil(total / 10) ? 0.5 : 1 }}>下一页</button>
          </div>
        )}
      </div>

      {/* 简易弹窗表单（不做复杂表单，后续有需要再完善） */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 520, maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: 20 }}>{editProduct ? '编辑商品' : '添加商品'}</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#666' }}>商品名称</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>分类</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }}>
                    <option value={0}>请选择</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>价格</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>原价</label>
                  <input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#666' }}>库存</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13 }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 13, color: '#666' }}>商品描述</label>
                  <button onClick={handleAiDesc} disabled={aiLoading || !form.name} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    background: '#f5f7fa', border: '1px solid #ddd', borderRadius: 6,
                    fontSize: 12, cursor: aiLoading || !form.name ? 'not-allowed' : 'pointer', color: '#667eea'
                  }}>
                    <Sparkles size={12} /> {aiLoading ? '生成中...' : 'AI生成'}
                  </button>
                </div>
                {aiDesc && <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>✨ {aiDesc}</div>}
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4, fontSize: 13, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>取消</button>
              <button
                onClick={async () => {
                  const data = { ...form, images: form.images ? form.images.split(',').filter(Boolean) : [] }
                  if (editProduct) {
                    const { productUpdate } = await import('../api')
                    await productUpdate(editProduct.id, data)
                  } else {
                    const { productCreate } = await import('../api')
                    await productCreate(data)
                  }
                  setShowForm(false)
                  loadData()
                }}
                style={{ padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
