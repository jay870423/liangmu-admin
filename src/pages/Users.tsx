import React, { useEffect, useState } from 'react'
import { userList } from '../api'
import type { User } from '../types'
import { Search } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => { loadData() }, [page, keyword])

  const loadData = async () => {
    setLoading(true)
    try {
      const data: any = await userList({ page, page_size: 10, keyword: keyword || undefined })
      setUsers(data.items || data.list || [])
      setTotal(data.total || 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>用户管理</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPage(1) }}
          placeholder="搜索用户昵称/手机号..."
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 240 }}
        />
      </div>

      <div className="table-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left' }}>用户</th>
              <th style={{ padding: '10px 8px' }}>手机号</th>
              <th style={{ padding: '10px 8px' }}>积分</th>
              <th style={{ padding: '10px 8px' }}>累计消费</th>
              <th style={{ padding: '10px 8px' }}>订单数</th>
              <th style={{ padding: '10px 8px' }}>注册时间</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#888' }}>加载中...</td></tr> :
              users.length === 0 ? <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#888' }}>暂无用户</td></tr> :
                users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{u.nickname || `用户${u.id}`}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#888' }}>{u.phone || '-'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#faad14' }}>{u.points}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>¥{u.total_spent || 0}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{u.order_count || 0}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#888' }}>{u.created_at?.slice(0, 10)}</td>
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
    </div>
  )
}
