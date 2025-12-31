'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Trash2, Bot, CheckCircle, Settings } from 'lucide-react'

interface Message {
  id: string
  platform: 'whatsapp' | 'messenger'
  sender: string
  content: string
  timestamp: Date
  aiSuggestion?: string
  status: 'unread' | 'ai-processed' | 'replied'
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key')
    if (savedKey) {
      setApiKey(savedKey)
    }

    // Load demo messages
    const demoMessages: Message[] = [
      {
        id: '1',
        platform: 'whatsapp',
        sender: 'John Doe',
        content: 'Hey! Can we schedule a meeting for tomorrow?',
        timestamp: new Date(Date.now() - 3600000),
        status: 'unread'
      },
      {
        id: '2',
        platform: 'messenger',
        sender: 'Sarah Smith',
        content: 'Thanks for the info! Really appreciate it.',
        timestamp: new Date(Date.now() - 7200000),
        status: 'unread'
      },
      {
        id: '3',
        platform: 'whatsapp',
        sender: 'Mike Johnson',
        content: 'Did you receive my email about the project update?',
        timestamp: new Date(Date.now() - 10800000),
        status: 'unread'
      },
      {
        id: '4',
        platform: 'messenger',
        sender: 'Emily Brown',
        content: 'Quick question - what\'s your availability next week?',
        timestamp: new Date(Date.now() - 14400000),
        status: 'unread'
      }
    ]

    const stored = localStorage.getItem('messages')
    if (stored) {
      const parsed = JSON.parse(stored)
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
    } else {
      setMessages(demoMessages)
      localStorage.setItem('messages', JSON.stringify(demoMessages))
    }
  }, [])

  const saveMessages = (updatedMessages: Message[]) => {
    localStorage.setItem('messages', JSON.stringify(updatedMessages))
  }

  const handleGetAISuggestion = async (message: Message) => {
    if (!apiKey) {
      alert('Please set your OpenAI API key in settings')
      setShowSettings(true)
      return
    }

    setSelectedMessage(message)
    setLoading(true)
    setAiResponse('')

    try {
      const response = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.content,
          sender: message.sender,
          platform: message.platform,
          apiKey: apiKey
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion')
      }

      const data = await response.json()
      setAiResponse(data.suggestion)

      const updatedMessages = messages.map(m =>
        m.id === message.id
          ? { ...m, aiSuggestion: data.suggestion, status: 'ai-processed' as const }
          : m
      )
      setMessages(updatedMessages)
      saveMessages(updatedMessages)
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
      alert('Failed to get AI suggestion. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsReplied = (messageId: string) => {
    const updatedMessages = messages.map(m =>
      m.id === messageId ? { ...m, status: 'replied' as const } : m
    )
    setMessages(updatedMessages)
    saveMessages(updatedMessages)
    setSelectedMessage(null)
  }

  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(m => m.id !== messageId)
    setMessages(updatedMessages)
    saveMessages(updatedMessages)
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null)
    }
  }

  const handleAddMessage = () => {
    const platforms: ('whatsapp' | 'messenger')[] = ['whatsapp', 'messenger']
    const names = ['Alex Wilson', 'Chris Lee', 'Jordan Taylor', 'Casey Morgan']
    const contents = [
      'Can you help me with something?',
      'Let me know when you\'re free',
      'I have a question about the project',
      'Thanks for your help earlier!'
    ]

    const newMessage: Message = {
      id: Date.now().toString(),
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      sender: names[Math.floor(Math.random() * names.length)],
      content: contents[Math.floor(Math.random() * contents.length)],
      timestamp: new Date(),
      status: 'unread'
    }

    const updatedMessages = [newMessage, ...messages]
    setMessages(updatedMessages)
    saveMessages(updatedMessages)
  }

  const handleSaveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey)
    setShowSettings(false)
    alert('API key saved successfully!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">Messaging Manager</h1>
                  <p className="text-blue-100">AI-Powered WhatsApp & Messenger Management</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="bg-yellow-50 border-b border-yellow-200 p-6">
              <h3 className="font-semibold mb-3 text-gray-800">OpenAI API Settings</h3>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Save
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Get your API key from{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  OpenAI Platform
                </a>
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                <button
                  onClick={handleAddMessage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  + Add Demo Message
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p>No messages yet. Click "Add Demo Message" to get started.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                        selectedMessage?.id === message.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200'
                      } ${message.status === 'replied' ? 'opacity-60' : ''}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              message.platform === 'whatsapp'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className="font-semibold text-gray-800">
                            {message.sender}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {message.status === 'replied' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {message.status === 'ai-processed' && (
                            <Bot className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="text-xs text-gray-500 capitalize">
                            {message.platform}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-2">{message.content}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMessage(message.id)
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              {selectedMessage ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Message Details
                    </h3>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedMessage.platform === 'whatsapp'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-semibold">
                          {selectedMessage.sender}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto capitalize">
                          {selectedMessage.platform}
                        </span>
                      </div>
                      <p className="text-gray-700">{selectedMessage.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {selectedMessage.timestamp.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleGetAISuggestion(selectedMessage)}
                      disabled={loading || selectedMessage.status === 'replied'}
                      className="w-full mb-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                    >
                      <Bot className="w-5 h-5" />
                      {loading ? 'Getting AI Suggestion...' : 'Get AI Reply Suggestion'}
                    </button>
                  </div>

                  {(aiResponse || selectedMessage.aiSuggestion) && (
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-800">
                          AI Suggested Reply
                        </h4>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {aiResponse || selectedMessage.aiSuggestion}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const text = aiResponse || selectedMessage.aiSuggestion || ''
                            navigator.clipboard.writeText(text)
                            alert('Copied to clipboard!')
                          }}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Copy Reply
                        </button>
                        <button
                          onClick={() => handleMarkAsReplied(selectedMessage.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Replied
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-20 h-20 mx-auto mb-4 opacity-30" />
                    <p>Select a message to view details and get AI suggestions</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-100 border-t p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Unread: {messages.filter(m => m.status === 'unread').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>AI Processed: {messages.filter(m => m.status === 'ai-processed').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Replied: {messages.filter(m => m.status === 'replied').length}</span>
                  </div>
                </div>
                <span className="text-xs">Total: {messages.length} messages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
