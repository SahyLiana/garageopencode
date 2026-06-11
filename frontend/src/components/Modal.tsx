import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-violet-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-violet-900 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative border border-violet-100 dark:border-white/10"
            >
              <div className="flex justify-between items-center p-8 border-b border-violet-50 dark:border-white/5">
                <h3 className="text-2xl font-black text-violet-950 dark:text-white tracking-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-violet-50 dark:bg-white/5 text-violet-400 dark:text-white/40 hover:text-violet-600 dark:hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 dark:text-white/80">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
