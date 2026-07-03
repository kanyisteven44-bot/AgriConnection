import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { formatDate, formatTime } from '../lib/utils';
import { MessageCircle, Heart, Share2, Bookmark, Plus, Search, ListFilter as Filter, TrendingUp, Clock, Users, Hash, ChevronRight, Loader as Loader2, CircleAlert as AlertCircle, Pin, Award, ThumbsUp, Eye, Flag, MoveVertical as MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  created_at: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  posts_count: number;
  icon?: string;
}

const categories: Topic[] = [
  { id: 'all', name: 'All Topics', description: 'Browse all posts', posts_count: 0, icon: '📋' },
  { id: 'crops', name: 'Crop Production', description: 'Growing techniques & tips', posts_count: 245, icon: '🌾' },
  { id: 'pests', name: 'Pest Control', description: 'Identify and manage pests', posts_count: 189, icon: '🐛' },
  { id: 'livestock', name: 'Livestock', description: 'Cattle, poultry, goats & more', posts_count: 167, icon: '🐄' },
  { id: 'market', name: 'Market Prices', description: 'Prices, trends & trading', posts_count: 134, icon: '💰' },
  { id: 'weather', name: 'Weather & Climate', description: 'Seasonal discussions', posts_count: 98, icon: '🌤' },
  { id: 'equipment', name: 'Equipment', description: 'Tools & machinery', posts_count: 76, icon: '🚜' },
  { id: 'business', name: 'Farm Business', description: 'Finance & planning', posts_count: 89, icon: '📊' },
  { id: 'success', name: 'Success Stories', description: 'Share your wins', posts_count: 54, icon: '🏆' },
  { id: 'help', name: 'Help & Support', description: 'Get help from the community', posts_count: 312, icon: '🆘' },
];

const samplePosts: Post[] = [
  {
    id: '1',
    title: 'My tomato harvest increased by 40% using this simple technique',
    content: 'I want to share a technique that significantly improved my tomato yield. After struggling with low production for two seasons, I discovered that proper staking and pruning made a huge difference...',
    author_id: 'farmer1',
    author_name: 'John Kamau',
    category: 'crops',
    tags: ['tomatoes', 'yield', 'techniques'],
    likes_count: 124,
    comments_count: 34,
    views_count: 1567,
    is_pinned: true,
    is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    title: 'Warning: Fall armyworm outbreak in Nakuru county',
    content: 'Fellow farmers in Nakuru, please be on high alert. I\'ve spotted fall armyworm in my maize farm. Check your crops daily for signs of damage...',
    author_id: 'farmer2',
    author_name: 'Mary Wanjiku',
    category: 'pests',
    tags: ['armyworm', 'maize', 'nakuru', 'alert'],
    likes_count: 87,
    comments_count: 56,
    views_count: 2341,
    is_pinned: true,
    is_featured: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Best dairy feed formulations for maximum milk production',
    content: 'After years of dairy farming, I\'ve found the right feed mix that keeps my cows healthy and productive. Sharing my formula for 15 cows...',
    author_id: 'farmer3',
    author_name: 'Peter Ochieng',
    category: 'livestock',
    tags: ['dairy', 'feed', 'milk', 'nutrition'],
    likes_count: 67,
    comments_count: 23,
    views_count: 987,
    is_pinned: false,
    is_featured: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '4',
    title: 'Current maize prices across major markets in Kenya',
    content: 'I visited several markets this week. Here\'s the current price per 90kg bag: Nairobi - KSh 4,200, Eldoret - KSh 3,800, Nakuru - KSh 3,900...',
    author_id: 'farmer4',
    author_name: 'Sarah Njeri',
    category: 'market',
    tags: ['maize', 'prices', 'market', 'kenya'],
    likes_count: 43,
    comments_count: 19,
    views_count: 1543,
    is_pinned: false,
    is_featured: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '5',
    title: 'How I started my organic vegetable farm with KSh 50,000',
    content: 'Three years ago I had only 50,000 KSh and a quarter acre. Today I supply three supermarkets. Here\'s my journey and lessons learned...',
    author_id: 'farmer5',
    author_name: 'Michael Kiprop',
    category: 'success',
    tags: ['organic', 'startup', 'vegetables', 'success'],
    likes_count: 156,
    comments_count: 67,
    views_count: 3452,
    is_pinned: false,
    is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export default function Community() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [showNewPost, setShowNewPost] = useState(false);

  const filteredPosts = samplePosts
    .filter(post => activeCategory === 'all' || post.category === activeCategory)
    .filter(post =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes_count - a.likes_count;
        case 'trending':
          return b.views_count - a.views_count;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const pinnedPosts = filteredPosts.filter(p => p.is_pinned);
  const regularPosts = filteredPosts.filter(p => !p.is_pinned);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">Connect, share, and learn with fellow farmers</p>
        </div>
        <button onClick={() => setShowNewPost(true)} className="btn btn-primary">
          <Plus className="h-5 w-5" />
          New Post
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              Topics
            </h3>
            <div className="space-y-1">
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="flex-1 text-left">{cat.name}</span>
                  <span className="text-xs text-gray-400">{cat.posts_count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <h3 className="font-semibold text-gray-900 mb-2">Top Contributors</h3>
            <div className="space-y-3">
              {['John Kamau', 'Mary Wanjiku', 'Peter Ochieng'].map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-gray-500">{(89 - i * 12)} posts</div>
                  </div>
                  <Award className="h-4 w-4 text-yellow-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['tomatoes', 'maize', 'dairy', 'organic', 'pests', 'irrigation'].map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="input pl-12"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {pinnedPosts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <Pin className="h-4 w-4" /> Pinned Posts
              </h3>
              <div className="space-y-4">
                {pinnedPosts.map(post => (
                  <PostCard key={post.id} post={post} isPinned />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {regularPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No posts found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {showNewPost && (
        <NewPostModal onClose={() => setShowNewPost(false)} />
      )}
    </div>
  );
}

function PostCard({ post, isPinned }: { post: Post; isPinned?: boolean }) {
  return (
    <div className={`card p-6 ${isPinned ? 'border-primary-200 bg-primary-50/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
            {post.author_name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{post.author_name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatDate(post.created_at)}
              {isPinned && (
                <span className="flex items-center gap-1 text-primary-600">
                  <Pin className="h-3 w-3" /> Pinned
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer">
        {post.title}
      </h3>
      <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
          {post.likes_count}
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <MessageCircle className="h-5 w-5" />
          {post.comments_count}
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <Eye className="h-5 w-5" />
          {post.views_count}
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 ml-auto">
          <Bookmark className={`h-5 w-5 ${post.is_bookmarked ? 'fill-primary-600 text-primary-600' : ''}`} />
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function NewPostModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('crops');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Post created successfully!');
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {categories.slice(1).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="What's your question or story?"
            />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-32"
              placeholder="Share details with the community..."
            />
          </div>

          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="tomatoes, farming, tips"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
