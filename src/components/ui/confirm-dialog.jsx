import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger",
  isLoading = false
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-500/20',
          icon: '⚠',
          iconColor: 'text-red-400',
          confirmBg: 'bg-red-500/50 hover:bg-red-500/70 border-red-500/30'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-500/20',
          icon: '⚠',
          iconColor: 'text-yellow-400',
          confirmBg: 'bg-yellow-500/50 hover:bg-yellow-500/70 border-yellow-500/30'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-500/20',
          icon: 'ℹ',
          iconColor: 'text-blue-400',
          confirmBg: 'bg-blue-500/50 hover:bg-blue-500/70 border-blue-500/30'
        };
      default:
        return {
          iconBg: 'bg-gray-500/20',
          icon: '?',
          iconColor: 'text-gray-400',
          confirmBg: 'bg-white/60 hover:bg-white/80 text-black'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="relative w-full max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:3px_3px] opacity-30" />
            
            <div className="relative z-10 p-6">
              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center`}>
                  <span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
              </div>
              
              {/* Message */}
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed">{message}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={onClose}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isLoading}
                  size="sm"
                  className={`${styles.confirmBg} border border-white/20 text-white`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg 
                        className="animate-spin h-4 w-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { ConfirmDialog };