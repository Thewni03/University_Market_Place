import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Send, Clock, User, Loader2, ThumbsUp, Flag, 
  AlertTriangle, Trash2, Edit3, CornerDownRight
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function getRelativeTime(dateInput) {
  if (!dateInput) return "Just now";
  const now = new Date();
  const past = new Date(dateInput);
  const diffInMinutes = Math.floor((now - past) / 60000);
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `1d ago`;
  return `${diffInDays}d ago`;
}

export default function CampusFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");
  
  const [replyingToPostId, setReplyingToPostId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Zustand stores
  const authUser = useAuthStore((state) => state.authUser);
  const socket = useAuthStore((state) => state.Socket);
  
  const fetchedRef = useRef(false);

  // Fetch Feed Posts
  useEffect(() => {
    if (fetchedRef.current) return;
    
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/feed`, {
          withCredentials: true,
        });
        setPosts(res.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch posts", error);
        toast.error("Failed to load campus feed");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    fetchedRef.current = true;
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;
    
    const handleNewPost = (newPost) => {
      setPosts((prev) => {
        if (prev.some((p) => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
    };

    const handleUpdatePost = (updatedData) => {
      setPosts((prev) => 
        prev.map((p) => 
          p._id === updatedData.postId 
            ? { 
                ...p, 
                ...(updatedData.upvotes !== undefined && { upvotes: updatedData.upvotes }),
                ...(updatedData.flags !== undefined && { flags: updatedData.flags }),
                ...(updatedData.content !== undefined && { content: updatedData.content })
              }
            : p
        )
      );
    };

    const handleDeleteSocket = (deletedData) => {
      setPosts((prev) => prev.filter((p) => p._id !== deletedData.postId));
    };

    const handleReplySocket = (data) => {
      setPosts((prev) => prev.map((p) => {
        if (p._id === data.postId) {
          const replies = p.replies || [];
          return { ...p, replies: [...replies, data.reply] };
        }
        return p;
      }));
    };

    socket.on("new-feed-post", handleNewPost);
    socket.on("feed-post-updated", handleUpdatePost);
    socket.on("feed-post-deleted", handleDeleteSocket);
    socket.on("feed-post-replied", handleReplySocket);

    return () => {
      socket.off("new-feed-post", handleNewPost);
      socket.off("feed-post-updated", handleUpdatePost);
      socket.off("feed-post-deleted", handleDeleteSocket);
      socket.off("feed-post-replied", handleReplySocket);
    };
  }, [socket]);

  const handleEditSubmit = async (postId) => {
    if (!editContent.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/feed/${postId}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setEditingPostId(null);
      toast.success("Post updated!");
    } catch(err) { toast.error("Failed to edit post"); }
  };

  const handleReplySubmit = async (postId) => {
    if (!replyContent.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/feed/${postId}/reply`, { content: replyContent }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setReplyingToPostId(null);
      setReplyContent("");
      toast.success("Replied!");
    } catch(err) { toast.error("Failed to reply"); }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/feed/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleInteraction = async (postId, type) => {
    if (!authUser) return toast.error("Please log in to interact!");
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/feed/${postId}/${type}`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
    } catch (error) {
      toast.error("Failed to process interaction");
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/feed`,
        { content },
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
      setContent("");
      toast.success("Posted successfully!");
    } catch (error) {
      console.error("Failed to post message", error);
      toast.error(error.response?.data?.message || "Error posting message");
    } finally {
      setIsPosting(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="chat-ambient min-h-[calc(100vh-4rem)] px-3 py-3 sm:px-4 sm:py-4 flex flex-col">
      <div className="chat-ambient-inner mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-7xl sm:h-[calc(100vh-6rem)] relative">
        <div className="chat-shell flex flex-col h-full w-full overflow-y-auto bg-slate-50/80 rounded-[28px] shadow-lg border border-white/50 backdrop-blur-sm">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 pt-6 pb-4 sticky top-0 z-30 shrink-0 px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 font-display tracking-tight">Campus Feed</h1>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">The Pulse of the University</p>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full px-5 lg:px-8 mt-6 pb-12">
        <div className="flex flex-col gap-8">
          
          {/* CENTER COLUMN: THE FEED */}
          <div className="flex flex-col gap-6">
            {/* Post Creator */}
            {authUser && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <form onSubmit={handlePost}>
                  <textarea
                    placeholder="What's happening on campus right now?"
                    className="w-full resize-none bg-transparent text-slate-800 text-lg outline-none placeholder:text-slate-400 min-h-[80px]"
                    maxLength={500}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400">
                      {500 - content.length} chars left
                    </span>
                    <button
                      type="submit"
                      disabled={!content.trim() || isPosting}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full inline-flex items-center gap-2 transition-colors shadow-sm"
                    >
                      {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Share
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Feed List */}
            {loading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-lg">No posts yet</h3>
                <p className="text-slate-500 text-sm">Be the first to share something with the campus!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const authorName = post.authorId?.fullname || post.authorId?.username || "Student";
                  const authorAvatar = getAvatarUrl(post.authorPicture);
                  
                  const upvoteCount = post.upvotes?.length || 0;
                  const flagCount = post.flags?.length || 0;
                  
                  const hasUpvoted = authUser && post.upvotes?.includes(authUser._id);
                  const hasFlagged = authUser && post.flags?.includes(authUser._id);

                  // Anti Fake News visual penalty
                  const isSuspicious = flagCount > 0 && flagCount >= (upvoteCount * 2) && flagCount >= 3;
                  const isOwner = authUser && (String(authUser._id) === String(post.authorId?._id || post.authorId));

                  return (
                    <div 
                      key={post._id} 
                      className={`bg-white rounded-2xl p-5 shadow-sm border transition-shadow animate-in slide-in-from-top-2 fade-in ${
                        isSuspicious ? "border-rose-200 opacity-70 hover:opacity-100" : "border-slate-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {authorAvatar ? (
                          <img 
                            src={authorAvatar} 
                            alt={authorName} 
                            className={`w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100 ${isSuspicious && 'grayscale'}`} 
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSuspicious ? 'bg-rose-50' : 'bg-emerald-100'}`}>
                            <User className={`w-5 h-5 ${isSuspicious ? 'text-rose-400' : 'text-emerald-600'}`} />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold truncate ${isSuspicious ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{authorName}</h4>
                              {isSuspicious && <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Flagged</span>}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-slate-400 shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{getRelativeTime(post.createdAt)}</span>
                              {isOwner && (
                                <>
                                  <button 
                                    onClick={() => { setEditingPostId(post._id); setEditContent(post.content); }}
                                    className="ml-2 text-indigo-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50"
                                    title="Edit your post"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => deletePost(post._id)}
                                    className="text-rose-400 hover:text-rose-600 transition-colors p-1 rounded-full hover:bg-rose-50"
                                    title="Delete your post"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {editingPostId === post._id ? (
                            <div className="mt-2 mb-3">
                              <textarea 
                                className="w-full resize-none border border-emerald-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30" 
                                value={editContent} onChange={e => setEditContent(e.target.value)} rows={2} 
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => handleEditSubmit(post._id)} className="bg-emerald-600 text-white px-4 py-1.5 text-xs rounded-full font-bold hover:bg-emerald-500">Save</button>
                                <button onClick={() => setEditingPostId(null)} className="bg-slate-200 text-slate-700 px-4 py-1.5 text-xs rounded-full font-bold hover:bg-slate-300">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className={`text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isSuspicious ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                              {post.content}
                            </p>
                          )}
                          
                          {/* Interaction Bar */}
                          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                            <button 
                              onClick={() => handleInteraction(post._id, 'upvote')}
                              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors group ${
                                hasUpvoted ? 'text-emerald-600' : isSuspicious ? 'text-slate-400 opacity-50' : 'text-slate-500 hover:text-emerald-600'
                              }`}
                            >
                              <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : 'group-hover:scale-110'}`} />
                              <span>{upvoteCount} Trust</span>
                            </button>
                            
                            <button 
                              onClick={() => handleInteraction(post._id, 'flag')}
                              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors group ${
                                hasFlagged ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                              }`}
                            >
                              <Flag className={`w-4 h-4 ${hasFlagged ? 'fill-current' : 'group-hover:scale-110'}`} />
                              <span>{flagCount}</span>
                            </button>
                            
                            <button 
                              onClick={() => {
                                setReplyingToPostId(replyingToPostId === post._id ? null : post._id);
                                setReplyContent("");
                              }}
                              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors group"
                            >
                              <MessageSquare className={`w-4 h-4 ${replyingToPostId === post._id ? 'fill-current text-indigo-500' : 'group-hover:scale-110'}`} />
                              <span className={replyingToPostId === post._id ? 'text-indigo-600' : ''}>{post.replies?.length || 0} Replies</span>
                            </button>
                          </div>
                          
                          {/* Replies Display */}
                          {(post.replies?.length > 0 || replyingToPostId === post._id) && (
                            <div className="mt-4 pl-4 border-l-2 border-slate-100 space-y-3">
                              {post.replies?.map((reply, idx) => (
                                <div key={idx} className="flex gap-2 text-sm animate-in fade-in">
                                  <div className="font-bold text-slate-700 shrink-0">
                                    {reply.authorId?.fullname || reply.authorId?.username || "Student"}:
                                  </div>
                                  <div className="text-slate-600 break-words">{reply.content}</div>
                                </div>
                              ))}
                              
                              {replyingToPostId === post._id && (
                                <div className="mt-3 flex gap-2 animate-in slide-in-from-top-1">
                                  <input 
                                    autoFocus 
                                    type="text" 
                                    className="flex-1 text-sm border border-slate-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                                    placeholder="Write a reply..."
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    onKeyDown={e => { if(e.key === 'Enter') handleReplySubmit(post._id) }}
                                    maxLength={200}
                                  />
                                  <button 
                                    disabled={!replyContent.trim()} 
                                    onClick={() => handleReplySubmit(post._id)}
                                    className="bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm"
                                  >
                                    <CornerDownRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
