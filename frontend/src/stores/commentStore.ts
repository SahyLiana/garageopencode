import { create } from 'zustand';
import api from '../services/api';
import type { Comment } from '../types';

interface CommentState {
  comments: Comment[];
  fetchComments: (repairId?: number, appointmentId?: number) => Promise<void>;
  addComment: (data: { content: string; repairId?: number; appointmentId?: number }) => Promise<void>;
  deleteComment: (id: number) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],

  fetchComments: async (repairId, appointmentId) => {
    const params = new URLSearchParams();
    if (repairId) params.set('repairId', String(repairId));
    if (appointmentId) params.set('appointmentId', String(appointmentId));
    const { data } = await api.get(`/api/comments?${params}`);
    set({ comments: data });
  },

  addComment: async (commentData) => {
    await api.post('/api/comments', commentData);
  },

  deleteComment: async (id) => {
    await api.delete(`/api/comments/${id}`);
  },
}));