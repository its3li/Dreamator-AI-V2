import { HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function HelpTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="w-6 h-6 text-cyan-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 p-4 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md mx-auto relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-4 -right-4 text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full"
              >
                <X className="text-cyan-400" />
              </button>

              {/* English Instructions */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">How to Use</h3>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Enter image description</li>
                  <li>Click Generate or press Enter</li>
                  <li>Wait for generation</li>
                  <li>Click The Image To Download it or share It With Your Freinds</li>
                </ol>
                <p className="mt-2">Made by ali 👌ㅤ</p>
              </div>

              {/* Arabic Instructions */}
              <div className="font-arabic" dir="rtl">
                <h3 className="text-lg font-semibold text-white mb-2">كيفية الاستخدام</h3>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>أدخل وصف الصورة</li>
                  <li>انقر على (Generate) أو اضغط Enter</li>
                  <li>انتظر عملية الإنشاء</li>
                  <li> اضغط علي الصورة لتحملها أو تشاركها مع اصحابك</li>
                </ol>
                <p className="mt-2">من صنع علي 😁ㅤ</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
