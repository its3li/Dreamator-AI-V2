import { Download, Link, Share2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { downloadImage } from '../services/imageService';

interface ImageViewerProps {
  imageUrl: string;
  isModalOpen: boolean;
  onModalClose: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  prompt: string;
  onDownload: () => Promise<void>;
}

export function ImageViewer({
  imageUrl,
  isModalOpen,
  onModalClose,
  onCopyLink,
  onShare,
}: ImageViewerProps) {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!imageUrl) return null;

  const handleDownload = () => {
    downloadImage(imageUrl)
      .catch(error => console.error('Download failed:', error));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setIsLinkCopied(true);
      setTimeout(() => {
        setIsLinkCopied(false);
      }, 1000);
      onCopyLink();
    } catch {
      // Handle error if needed
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <div
          onClick={() => onModalClose()}
          className="relative group cursor-pointer overflow-hidden rounded-2xl w-full max-w-[384px] aspect-square mx-auto"
        >
          <img
            src={imageUrl}
            alt="Generated artwork"
            className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white text-sm font-medium">Click to view</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 p-4 flex items-center justify-center"
            onClick={onModalClose}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full mx-auto relative font-sans"
            >
              <button
                onClick={onModalClose}
                className="absolute -top-4 -right-4 text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full"
              >
                <X className="text-cyan-400" />
              </button>
              <div className="flex justify-center items-center mb-6">
                {imageError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 text-center p-4">
                    <div>
                      <div className="text-lg font-medium mb-2">Failed to load image</div>
                      <div className="text-sm opacity-80">Please try again with a different prompt or settings</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Generated artwork"
                    onError={handleImageError}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors"
                >
                  <Download className="text-cyan-400" /> Download
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-700 hover:bg-cyan-600 rounded-xl transition-colors"
                >
                  {isLinkCopied ? <Check className="text-cyan-400" /> : <Link className="text-cyan-400" />}
                  {isLinkCopied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={onShare}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-700 hover:bg-cyan-600 rounded-xl transition-colors"
                >
                  <Share2 className="text-cyan-400" /> Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
