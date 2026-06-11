import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { useCommentStore } from '../stores/commentStore';
import { useAuthStore } from '../stores/authStore';

export default function CommentSection({ repairId, appointmentId, status }: { repairId?: number; appointmentId?: number; status?: string }) {
  const [content, setContent] = useState('');
  const { comments, fetchComments, addComment, deleteComment } = useCommentStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLocked = status === 'CANCELLED' || status === 'CANCEL_REQUESTED';

  useEffect(() => {
    if (repairId || appointmentId) fetchComments(repairId, appointmentId);
  }, [repairId, appointmentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await addComment({ content, repairId, appointmentId });
    setContent('');
    fetchComments(repairId, appointmentId);
  };

  const handleDelete = async (id: number) => {
    await deleteComment(id);
    fetchComments(repairId, appointmentId);
  };

  return (
    <div className="flex flex-col h-[450px] bg-white dark:bg-violet-950/20 rounded-[32px] overflow-hidden border border-violet-100 dark:border-white/10 shadow-2xl">
      <div className="bg-violet-50/50 dark:bg-white/5 px-8 py-5 border-b border-violet-100 dark:border-white/10 flex justify-between items-center">
        <h4 className="text-sm font-black text-violet-950 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={16} /> Discussion Log
        </h4>
        <span className="text-[10px] text-violet-400 dark:text-gold-500 font-black uppercase tracking-widest bg-white dark:bg-violet-900 px-3 py-1 rounded-xl shadow-sm border border-violet-100 dark:border-gold-500/20">
          {comments.length} Entries
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {comments.map((c) => {
            const isMe = user?.id === c.authorId;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] group relative ${isMe ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-3 mb-2 px-2">
                    {!isMe && <span className="text-[10px] font-black text-violet-600 dark:text-gold-500 uppercase tracking-widest">{c.author.name}</span>}
                    <span className="text-[9px] text-violet-300 dark:text-white/40 font-bold uppercase tracking-widest">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={`relative px-6 py-3 rounded-[24px] text-sm shadow-xl inline-block font-medium
                    ${isMe 
                      ? 'bg-violet-600 dark:bg-gold-500 text-white dark:text-violet-950 rounded-tr-none' 
                      : 'bg-white dark:bg-violet-900 text-violet-950 dark:text-white border border-violet-100 dark:border-white/10 rounded-tl-none'}
                  `}>
                    {c.content}
                    
                    {(isMe || user?.role === 'ADMIN') && (
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl bg-red-50 dark:bg-red-500/20 text-red-500 dark:text-red-400 shadow-2xl border border-red-100 dark:border-red-500/30
                          ${isMe ? '-left-12' : '-right-12'}
                        `}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {comments.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-violet-200 dark:text-white/10 italic">
            <MessageSquare size={32} className="opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No communication records found.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-violet-50/30 dark:bg-white/5 border-t border-violet-100 dark:border-white/10 flex gap-4">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLocked}
          placeholder={isLocked ? "THREAD LOCKED" : "TYPE MESSAGE..."}
          className={`flex-1 bg-white dark:bg-violet-950/50 border border-violet-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-violet-950 dark:text-white focus:ring-4 focus:ring-violet-500/20 dark:focus:ring-gold-500/20 transition-all outline-none placeholder:text-violet-200 dark:placeholder:text-white/20 uppercase tracking-widest
            ${isLocked ? 'cursor-not-allowed opacity-40' : ''}`}
        />
        <button 
          type="submit" 
          disabled={!content.trim() || isLocked}
          className="bg-violet-600 dark:bg-gold-500 hover:opacity-90 disabled:bg-violet-100 dark:disabled:bg-white/5 text-white dark:text-violet-950 px-6 rounded-2xl transition-all active:scale-95 shadow-xl flex items-center justify-center border border-violet-200 dark:border-gold-500/20"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}