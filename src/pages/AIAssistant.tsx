import React, { useState, useRef, useEffect } from 'react'
import { aiChat } from '../api'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  '今日销售情况如何？',
  '哪些商品库存不足需要补货？',
  '生成本周运营周报',
  '分析用户购买行为',
  '预测下周订单量',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好！我是良木森林AI运营助手，有什么可以帮您的？您可以问我关于销售数据分析、用户画像、商品推荐、运营建议等问题。' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res: any = await aiChat(text)
      const aiMsg: Message = { role: 'assistant', content: res.message || res.content || res.reply || '处理完毕' }
      setMessages(m => [...m, aiMsg])
    } catch (err: any) {
      setMessages(m => [...m, { role: 'assistant', content: `抱歉出错：${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>AI助手</h2>

      {/* 快捷问题 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            style={{
              padding: '6px 14px',
              background: '#f5f7fa',
              border: '1px solid #ddd',
              borderRadius: 20,
              fontSize: 13,
              cursor: 'pointer',
              color: '#333'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* 对话区 */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: 'calc(100vh - 300px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 消息列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 12,
              marginBottom: 16,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: msg.role === 'assistant' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e94560',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: 12,
                background: msg.role === 'assistant' ? '#f5f7fa' : 'linear-gradient(135deg, #e94560, #764ba2)',
                color: msg.role === 'assistant' ? '#333' : '#fff',
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Bot size={18} />
              </div>
              <div style={{ padding: '12px 16px', background: '#f5f7fa', borderRadius: 12, fontSize: 14 }}>
                <span style={{ animation: 'blink 1s infinite' }}>思考中...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 输入框 */}
        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && send(input)}
            placeholder="输入您的问题，按回车发送..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: 24,
              fontSize: 14,
              outline: 'none'
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #e94560, #764ba2)',
              border: 'none',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
