import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, CheckCircle, Clock, Trash2, Edit3 } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function ForumThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threadData, setThreadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const authUser = useAuthStore(state => state.authUser);

  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editQData, setEditQData] = useState({ title: "", description: "", category: "General" });
  
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAContent, setEditAContent] = useState("");

  const fetchThread = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/forum/${id}`);
      setThreadData(res.data.data);
    } catch (error) {
      toast.error("Failed to load thread");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [id]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return toast.error("Answer cannot be empty.");
    if (answerContent.trim().length < 10) return toast.error("Your answer must be at least 10 characters long.");
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/forum/${id}/answer`, 
        { content: answerContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswerContent("");
      toast.success("Answer posted!");
      fetchThread();
    } catch (error) {
      toast.error("Failed to post answer");
    }
  };

  const handleEditQuestion = async () => {
    if (editQData.title.trim().length < 10) return toast.error("Title must be at least 10 chars");
    if (editQData.description.trim().length < 20) return toast.error("Description must be at least 20 chars");
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/forum/${id}`, editQData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Question updated!");
      setEditingQuestion(false);
      fetchThread();
    } catch (e) { toast.error("Failed to update question"); }
  };

  const handleEditAnswer = async (answerId) => {
    if (editAContent.trim().length < 10) return toast.error("Answer must be 10 chars long");
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/forum/answer/${answerId}`, { content: editAContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Answer updated!");
      setEditingAnswerId(null);
      fetchThread();
    } catch (e) { toast.error("Failed to update answer"); }
  };

  const deleteQuestion = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this question? It will erase all answers as well.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/forum/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success("Question deleted");
      navigate("/forum");
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const toggleQuestionUpvote = async () => {
    if (!authUser) return toast.error("Please login");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/forum/${id}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setThreadData(prev => ({ 
        ...prev, 
        question: { ...prev.question, upvotes: res.data.upvotes } 
      }));
    } catch (e) { toast.error("Error upvoting"); }
  };

  const toggleAnswerUpvote = async (answerId) => {
    if (!authUser) return toast.error("Please login");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/forum/answer/${answerId}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setThreadData(prev => ({
        ...prev,
        answers: prev.answers.map(a => a._id === answerId ? { ...a, upvotes: res.data.upvotes } : a)
      }));
    } catch (e) { toast.error("Error upvoting"); }
  };

  const acceptAnswer = async (answerId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/forum/${id}/answer/${answerId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Success!");
      fetchThread(); // reload to reflect UI state changes properly across all answers
    } catch (e) { 
      toast.error(e.response?.data?.message || "Failed to accept answer"); 
    }
  };

  if (loading) return <div className="min-h-screen py-20 flex justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!threadData?.question) return <div className="text-center py-20 bg-slate-50">Question not found.</div>;

  const { question, answers } = threadData;
  const isQuestionOwner = authUser && String(authUser._id) === String(question.authorId._id);
  const qUpvotes = question.upvotes || [];
  const qHasUpvoted = authUser && qUpvotes.includes(authUser._id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8">
        
        <div className="flex justify-between items-center mb-6">
          <Link to="/forum" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Q&A
          </Link>

          {isQuestionOwner && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setEditQData({ title: question.title, description: question.description, category: question.category });
                  setEditingQuestion(true);
                }}
                className="text-indigo-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-1.5 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-indigo-200 shadow-sm transition-colors"
                title="Edit Question"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button 
                onClick={deleteQuestion}
                className="text-rose-500 hover:text-rose-600 font-bold text-sm flex items-center gap-1.5 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-200 shadow-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Thread
              </button>
            </div>
          )}
        </div>
        
        {/* Main Question Block */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
          <div className="p-6 border-b border-slate-100 flex items-start gap-4">
            <div className="flex flex-col items-center">
              <button 
                onClick={toggleQuestionUpvote}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-colors ${qHasUpvoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <span className="font-bold text-slate-700 mt-2 text-xl">{qUpvotes.length}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editingQuestion ? (
                <div className="flex flex-col gap-3">
                  <input 
                    className="text-2xl sm:text-3xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editQData.title}
                    onChange={e => setEditQData({ ...editQData, title: e.target.value })}
                  />
                  <textarea 
                    className="w-full text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editQData.description}
                    onChange={e => setEditQData({ ...editQData, description: e.target.value })}
                  />
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editQData.category}
                    onChange={e => setEditQData({ ...editQData, category: e.target.value })}
                  >
                    {["Academics", "Campus Life", "Career & Internships", "Tech Support", "Roommates & Housing", "General"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={handleEditQuestion} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded-lg transition-colors">Save Changes</button>
                    <button onClick={() => setEditingQuestion(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-4 rounded-lg transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">{question.title}</h1>
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {question.description}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-sm font-semibold">{question.category}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex items-center gap-3">
             <img src={(question.authorId.profile_picture || "").startsWith("http") ? question.authorId.profile_picture : `${API_BASE_URL}${question.authorId.profile_picture || ""}`} alt="" className="w-8 h-8 rounded-full border border-slate-200 bg-white" />
             <div className="text-sm">
               <span className="font-semibold text-slate-800">{question.authorId.fullname || question.authorId.username}</span>
               <span className="text-slate-500 ml-2 text-xs">asked {new Date(question.createdAt).toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Answers List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</h2>
        </div>

        <div className="space-y-6 mb-12">
          {answers.map(ans => {
            const aUpvotes = ans.upvotes || [];
            const aHasUpvoted = authUser && aUpvotes.includes(authUser._id);
            return (
              <div key={ans._id} className={`bg-white rounded-2xl shadow-sm border p-6 flex items-start gap-4 ${ans.isAccepted ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => toggleAnswerUpvote(ans._id)}
                    className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-colors ${aHasUpvoted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-slate-700 mt-2">{aUpvotes.length}</span>
                  
                  {ans.isAccepted && (
                    <div className="mt-3 text-emerald-500 flex flex-col items-center">
                      <CheckCircle className="w-6 h-6 fill-emerald-100" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {editingAnswerId === ans._id ? (
                    <div className="mt-1">
                      <textarea 
                        className="w-full text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={editAContent}
                        onChange={e => setEditAContent(e.target.value)}
                      />
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => handleEditAnswer(ans._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-colors">Save Answer</button>
                        <button onClick={() => setEditingAnswerId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-4 rounded-lg text-sm transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {ans.content}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                    {/* Mark as accepted logic */}
                    <div className="flex items-center gap-3">
                      {isQuestionOwner && (
                        <button 
                          onClick={() => acceptAnswer(ans._id)}
                          className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${ans.isAccepted ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                        >
                          {ans.isAccepted ? "Unmark Solution" : "Mark as Solution"}
                        </button>
                      )}

                      {authUser && String(authUser._id) === String(ans.authorId._id) && (
                         <button 
                           onClick={() => { setEditAContent(ans.content); setEditingAnswerId(ans._id); }}
                           className="text-indigo-500 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-md transition-colors"
                           title="Edit Your Answer"
                         >
                           <Edit3 className="w-4 h-4" />
                         </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <img src={(ans.authorId.profile_picture || "").startsWith("http") ? ans.authorId.profile_picture : `${API_BASE_URL}${ans.authorId.profile_picture || ""}`} alt="" className="w-6 h-6 rounded-full border border-slate-200 bg-white" />
                      <span className="font-semibold text-slate-700">{ans.authorId.fullname || ans.authorId.username}</span>
                      <span className="text-slate-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(ans.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Your Answer Input */}
        {authUser ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Your Answer</h3>
            <form onSubmit={handlePostAnswer}>
              <textarea 
                className="w-full border border-slate-300 px-4 py-3 rounded-xl min-h-[150px] resize-y focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none mb-4"
                placeholder="Write your definitive answer here... (Min 10 characters)"
                value={answerContent}
                onChange={e => setAnswerContent(e.target.value)}
                required
                minLength={10}
                maxLength={3000}
              />
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
              >
                Post Your Answer
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-2xl p-6 text-center border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Join the Discussion</h3>
            <p className="text-slate-500 mb-4">Please log in to answer this question.</p>
            <Link to="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors inline-block">Log In</Link>
          </div>
        )}
      </div>
    </div>
  );
}
