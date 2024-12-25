import React from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageSettings } from '../services/imageService';
import { useState } from 'react';

interface ImageGeneratorProps {
  prompt: string;
  isGenerating: boolean;
  message: { text: string; type: string };
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
}

export function ImageGenerator({
  prompt,
  isGenerating,
  message,
  onPromptChange,
  onGenerate,
}: ImageGeneratorProps) {
  // Function to check if text is Arabic
  const isArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative z-20 backdrop-blur-lg bg-white/5 rounded-2xl p-8 shadow-2xl border border-white/10"
      style={{
        transform: 'perspective(1000px)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isGenerating && onGenerate()}
              placeholder={isArabic(prompt) ? "صف صورتك هنا..." : "Describe your image..."}
              className={`w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none min-h-[120px] transition-all duration-200 ${
                isArabic(prompt) ? 'font-arabic text-right' : ''
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
                lineHeight: '1.5',
              }}
              disabled={isGenerating}
            />
            <motion.div
              animate={{ opacity: isGenerating ? 0.5 : 1 }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 top-4"
            >
              <Sparkles className="text-cyan-400 w-5 h-5" />
            </motion.div>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group"
          style={{
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
              <span>Creating Magic...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 transform group-hover:rotate-12 transition-transform" />
              <span>Generate Images</span>
            </>
          )}
        </button>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl backdrop-blur-sm ${
                message.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
