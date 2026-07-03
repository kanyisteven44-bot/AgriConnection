import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { formatDate, formatTime, getInitials } from '../lib/utils';
import { MessageCircle, Send, Search, Plus, MoveVertical as MoreVertical, Phone, Video, Image, Paperclip, Mic, Smile, Check, CheckCheck, Clock, Loader as Loader2, CircleAlert as AlertCircle, User, Users, X, ArrowLeft, Reply, Trash2, Copy, Star, Heart, ThumbsUp, Frown, SmilePlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: { id: string; name: string; avatar?: string }[];
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  is_online?: boolean;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'call';
  reply_to?: Message;
  reactions?: { emoji: string; users: string[] }[];
  attachments?: { url: string; name: string; type: string; size: number }[];
  created_at: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  members_count: number;
  is_public: boolean;
}

const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function ChatPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'calls'>('chats');
  const [search, setSearch] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleChats: Chat[] = [
    {
      id: '1',
      type: 'direct',
      participants: [{ id: 'user1', name: 'John Kamau' }],
      last_message: 'Hi, interested in tomatoes?',
      last_message_time: new Date(Date.now() - 3600000).toISOString(),
      unread_count: 2,
      is_online: true,
    },
    {
      id: '2',
      type: 'direct',
      participants: [{ id: 'user2', name: 'Mary Wanjiku' }],
      last_message: 'Price for 50kg maize?',
      last_message_time: new Date(Date.now() - 86400000).toISOString(),
      unread_count: 0,
      is_online: false,
    },
    {
      id: '3',
      type: 'group',
      name: 'Nakuru Farmers Group',
      participants: [
        { id: 'u1', name: 'Peter' },
        { id: 'u2', name: 'Jane' },
        { id: 'u3', name: 'Sam' },
      ],
      last_message: 'Meeting tomorrow at 4pm',
      last_message_time: new Date(Date.now() - 7200000).toISOString(),
      unread_count: 5,
    },
  ];

  const sampleGroups: ChatGroup[] = [
    { id: 'g1', name: 'Nakuru Farmers', members_count: 234, is_public: true },
    { id: 'g2', name: 'Organic Farming Kenya', members_count: 892, is_public: true },
    { id: 'g3', name: 'Dairy Farmers Association', members_count: 145, is_public: false },
  ];

  const sampleMessages: Message[] = [
    {
      id: 'm1',
      chat_id: '1',
      sender_id: 'user1',
      sender_name: 'John Kamau',
      content: 'Hello! I saw your listing for organic tomatoes. Are they still available?',
      type: 'text',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'read',
    },
    {
      id: 'm2',
      chat_id: '1',
      sender_id: user?.id || 'me',
      sender_name: user?.name || 'Me',
      content: 'Yes, I have about 200kg ready for harvest. Where are you located?',
      type: 'text',
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      status: 'read',
    },
    {
      id: 'm3',
      chat_id: '1',
      sender_id: 'user1',
      sender_name: 'John Kamau',
      content: "I'm in Nakuru town. Can I come see them tomorrow?",
      type: 'text',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
    },
    {
      id: 'm4',
      chat_id: '1',
      sender_id: user?.id || 'me',
      sender_name: user?.name || 'Me',
      content: 'Sure! I\'m available from 9am to 4pm. Call me when you\'re on your way.',
      type: 'text',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      status: 'delivered',
    },
  ];

  useEffect(() => {
    if (activeChat) {
      setMessages(sampleMessages);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredChats = sampleChats.filter(chat => {
    const name = chat.type === 'group'
      ? chat.name
      : chat.participants[0]?.name || 'Unknown';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSendMessage = () => {
    if (!message.trim() && !replyTo) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chat_id: activeChat?.id || '1',
      sender_id: user?.id || 'me',
      sender_name: user?.name || 'Me',
      content: message,
      type: 'text',
      reply_to: replyTo || undefined,
      created_at: new Date().toISOString(),
      status: 'sent',
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    setReplyTo(null);

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m)
      );
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          const reactions = m.reactions || [];
          const existing = reactions.find(r => r.emoji === emoji);
          if (existing) {
            if (existing.users.includes(user?.id || 'me')) {
              return {
                ...m,
                reactions: reactions.map(r =>
                  r.emoji === emoji
                    ? { ...r, users: r.users.filter(u => u !== (user?.id || 'me')) }
                    : r
                ).filter(r => r.users.length > 0),
              };
            } else {
              return {
                ...m,
                reactions: reactions.map(r =>
                  r.emoji === emoji ? { ...r, users: [...r.users, user?.id || 'me'] } : r
                ),
              };
            }
          } else {
            return {
              ...m,
              reactions: [...reactions, { emoji, users: [user?.id || 'me'] }],
            };
          }
        }
        return m;
      })
    );
    setShowReactionPicker(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    toast.success('Message deleted');
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name || 'Group';
    return chat.participants[0]?.name || 'Unknown';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') return null;
    const name = chat.participants[0]?.name || 'Unknown';
    return getInitials(name);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-primary-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)]">
      <div className="grid md:grid-cols-4 h-full gap-4">
        <div className="md:col-span-1 card flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2 mt-4">
              {(['chats', 'groups', 'calls'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'chats' && (
              <div className="divide-y">
                {filteredChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      activeChat?.id === chat.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                        {chat.type === 'group' ? (
                          <Users className="h-6 w-6" />
                        ) : (
                          getChatAvatar(chat)
                        )}
                      </div>
                      {chat.type === 'direct' && chat.is_online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 truncate">
                          {getChatName(chat)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {chat.last_message_time && formatTime(chat.last_message_time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.last_message}</p>
                    </div>
                    {chat.unread_count > 0 && (
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                        {chat.unread_count}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="divide-y">
                {sampleGroups.map(group => (
                  <button
                    key={group.id}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{group.name}</div>
                      <div className="text-sm text-gray-500">
                        {group.members_count} members
                      </div>
                    </div>
                    {group.is_public && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        Public
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'calls' && (
              <div className="p-4 text-center text-gray-500">
                <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent calls</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3 card flex flex-col overflow-hidden">
          {activeChat ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                    {activeChat.type === 'group' ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      getChatAvatar(activeChat)
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{getChatName(activeChat)}</div>
                    <div className="text-xs text-gray-500">
                      {activeChat.type === 'group'
                        ? `${activeChat.participants.length} members`
                        : activeChat.is_online
                          ? 'Online'
                          : 'Last seen recently'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Video className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => {
                  const isOwn = msg.sender_id === (user?.id || 'me');
                  const showDateDivider =
                    i === 0 ||
                    new Date(msg.created_at).toDateString() !==
                      new Date(messages[i - 1].created_at).toDateString();

                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="text-center my-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`relative group max-w-[70%] ${
                            isOwn ? 'order-2' : ''
                          }`}
                        >
                          {msg.reply_to && (
                            <div
                              className={`text-xs p-2 rounded-t-lg border-l-2 mb-1 ${
                                isOwn
                                  ? 'bg-primary-600 border-primary-300'
                                  : 'bg-gray-100 border-gray-300'
                              }`}
                            >
                              <span className="font-medium">
                                {msg.reply_to.sender_name}
                              </span>
                              <p
                                className={`truncate ${
                                  isOwn ? 'text-primary-200' : 'text-gray-600'
                                }`}
                              >
                                {msg.reply_to.content}
                              </p>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-900 rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 ${
                                isOwn ? 'text-primary-200' : 'text-gray-400'
                              }`}
                            >
                              <span className="text-xs">
                                {formatTime(msg.created_at)}
                              </span>
                              {isOwn && getStatusIcon(msg.status)}
                            </div>
                          </div>

                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {msg.reactions.map(r => (
                                <button
                                  key={r.emoji}
                                  onClick={() => handleReaction(msg.id, r.emoji)}
                                  className={`text-sm px-2 py-0.5 rounded-full ${
                                    r.users.includes(user?.id || 'me')
                                      ? 'bg-primary-100'
                                      : 'bg-gray-100'
                                  }`}
                                >
                                  {r.emoji} {r.users.length}
                                </button>
                              ))}
                            </div>
                          )}

                          <div
                            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isOwn ? '-left-8' : '-right-8'
                            } flex gap-1`}
                          >
                            <button
                              onClick={() => setShowReactionPicker(msg.id)}
                              className="p-1 bg-white rounded-full shadow hover:bg-gray-50"
                            >
                              <SmilePlus className="h-4 w-4 text-gray-600" />
                            </button>
                            {!isOwn && (
                              <button
                                onClick={() => setReplyTo(msg)}
                                className="p-1 bg-white rounded-full shadow hover:bg-gray-50"
                              >
                                <Reply className="h-4 w-4 text-gray-600" />
                              </button>
                            )}
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1 bg-white rounded-full shadow hover:bg-gray-50"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyMessage(msg.content)}
                              className="p-1 bg-white rounded-full shadow hover:bg-gray-50"
                            >
                              <Copy className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>

                          {showReactionPicker === msg.id && (
                            <div className="absolute top-0 left-0 flex gap-1 bg-white rounded-full shadow-lg p-1 z-10">
                              {reactions.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                onClick={() => setShowReactionPicker(null)}
                                className="text-gray-400 hover:text-gray-600 px-1"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                    <span className="text-sm">typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {replyTo && (
                <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Reply className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Replying to <strong>{replyTo.sender_name}</strong>
                    </span>
                    <span className="text-gray-500 truncate max-w-48">
                      {replyTo.content}
                    </span>
                  </div>
                  <button onClick={() => setReplyTo(null)}>
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              )}

              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Paperclip className="h-5 w-5 text-gray-600" />
                    </button>
                    {showAttachmentMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 hover:bg-gray-100 rounded-lg"
                        >
                          <Image className="h-5 w-5 text-green-600" />
                        </button>
                        <button className="p-3 hover:bg-gray-100 rounded-lg">
                          <Paperclip className="h-5 w-5 text-blue-600" />
                        </button>
                        <button className="p-3 hover:bg-gray-100 rounded-lg">
                          <Mic className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                  />
                  <div className="relative flex-1">
                    <textarea
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={1}
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Smile className="h-5 w-5 text-gray-600" />
                    </button>
                    {showEmoji && (
                      <div className="absolute bottom-full right-0 mb-2 z-50 bg-white rounded-xl shadow-lg p-3 flex flex-wrap gap-2">
                        {['😀', '😂', '😊', '😍', '🥰', '👍', '❤️', '🙏', '🎉', '🔥', '✨', '💯'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmoji(false);
                            }}
                            className="text-xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="btn btn-primary"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p>Choose from your existing chats or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
