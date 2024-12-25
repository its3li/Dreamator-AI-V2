import { motion, AnimatePresence } from 'framer-motion';
import { ImageGenerator } from './components/ImageGenerator';
import { generateImage, downloadImage } from './services/imageService';
import { ImageGenerationError } from './utils/errors';
import { useCallback, useState, useEffect } from 'react';
import { Download, Link, X, Wand2, Sun, Moon } from 'lucide-react';
import { HelpTooltip } from './components/HelpTooltip';
import { Loader2 } from 'lucide-react';

interface ImageData {
  url: string;
  prompt: string;
  editPrompt: string;
  isEditing: boolean;
  isLoading: boolean;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [lastPrompt, setLastPrompt] = useState('');
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preference on mount
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Function to check if text is Arabic
  const isArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setMessage({ text: 'Please enter a description for your image', type: 'error' });
      return;
    }

    if (prompt.trim() === lastPrompt.trim()) {
      setMessage({ text: 'Please modify your prompt for a different result', type: 'error' });
      return;
    }

    setIsGenerating(true);
    setMessage({ text: 'Creating your masterpiece...', type: 'info' });
    setImages([
      { url: '', prompt: prompt, editPrompt: '', isEditing: false, isLoading: true },
      { url: '', prompt: prompt, editPrompt: '', isEditing: false, isLoading: true }
    ]);
    setShowDownloadPanel(false);

    try {
      // Generate two images in parallel
      const imagePromises = [
        generateImage(prompt),
        generateImage(prompt)
      ];

      // Process each image as it completes
      const results = await Promise.all(imagePromises.map(async (promise, index) => {
        try {
          const result = await promise;
          // Create a new Image object to preload the image
          const img = new Image();
          const imageLoaded = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          img.src = result.url;
          await imageLoaded;
          return result;
        } catch (error) {
          console.error(`Error loading image ${index}:`, error);
          throw error;
        }
      }));

      setImages(results.map(result => ({
        url: result.url,
        prompt: prompt,
        editPrompt: '',
        isEditing: false,
        isLoading: false
      })));
      
      setLastPrompt(prompt);
      setMessage({ text: 'Images generated successfully!', type: 'success' });
    } catch (error) {
      if (error instanceof ImageGenerationError) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' });
      }
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, lastPrompt]);

  const handleEdit = async (index: number, editPrompt: string) => {
    if (!editPrompt.trim()) {
      setMessage({ text: 'Please enter edit details', type: 'error' });
      return;
    }

    try {
      setIsGenerating(true);
      setMessage({ text: 'Applying your changes...', type: 'info' });
      
      // Update loading state for the specific image
      const newImages = [...images];
      newImages[index] = { ...newImages[index], isLoading: true };
      setImages(newImages);

      const newPrompt = `${images[index].prompt} ${editPrompt}`;
      const result = await generateImage(newPrompt);
      
      // Preload the image
      const img = new Image();
      const imageLoaded = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      img.src = result.url;
      await imageLoaded;

      newImages[index] = {
        url: result.url,
        prompt: newPrompt,
        editPrompt: '',
        isEditing: false,
        isLoading: false
      };
      setImages(newImages);
      setMessage({ text: 'Image updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to edit image. Please try again.', type: 'error' });
      console.error('Edit error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleEdit = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isEditing: i === index ? !img.isEditing : false
    }));
    setImages(newImages);
  };

  const updateEditPrompt = (index: number, editPrompt: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], editPrompt };
    setImages(newImages);
  };

  const handleDownload = async (url: string) => {
    try {
      setMessage({ text: 'Preparing download...', type: 'info' });
      await downloadImage(url);
      setShowDownloadPanel(false);
      setMessage({ text: 'Download started!', type: 'success' });
    } catch (error) {
      console.error('Failed to download image:', error);
      setMessage({ 
        text: 'Failed to download image. Please try right-clicking and "Save Image As" instead.',
        type: 'error'
      });
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage({ text: 'Link copied to clipboard!', type: 'success' });
      setShowDownloadPanel(false);
    } catch {
      setMessage({ text: 'Failed to copy link', type: 'error' });
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-700'}`}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-opacity-20 backdrop-blur-sm transition-all duration-300 hover:scale-110"
        style={{
          background: isDarkMode ? 'rgba(147,51,234,0.2)' : 'rgba(6,182,212,0.2)',
        }}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-purple-300" />
        ) : (
          <Moon className="w-5 h-5 text-cyan-300" />
        )}
      </button>

      {/* Dark Mode Background */}
      {isDarkMode ? (
        <div className="fixed inset-0 pointer-events-none">
          {/* Primary gradient blob */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotateX: [0, 10, 0],
              rotateY: [0, 15, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(126,34,206,0.2) 45%, rgba(88,28,135,0.1) 70%)',
              filter: 'blur(60px)',
              transform: 'perspective(1000px)',
            }}
          />

          {/* Secondary gradient blob */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
              rotateX: [0, -15, 0],
              rotateY: [0, -10, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              delay: 1
            }}
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(37,99,235,0.2) 45%, rgba(29,78,216,0.1) 70%)',
              filter: 'blur(60px)',
              transform: 'perspective(1000px)',
            }}
          />

          {/* Accent gradient blob */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 40, 0],
              rotateZ: [0, 20, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 2
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(219,39,119,0.2) 45%, rgba(190,24,93,0.1) 70%)',
              filter: 'blur(60px)',
              transform: 'perspective(1000px)',
            }}
          />

          {/* Overlay to control brightness */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        /* Light Mode Background */
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotateX: [0, 5, 0],
              rotateY: [0, 10, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 opacity-30"
            style={{ transform: 'perspective(1000px)' }}
          >
            <div className="absolute w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl -top-48 -right-48"></div>
            <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl top-1/4 left-1/4"></div>
            <div className="absolute w-[700px] h-[700px] bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl -bottom-48 -left-48"></div>
          </motion.div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-purple-100' : 'text-white'} font-handwriting`}>
            Dreamator <span className="text-5xl font-sans">AI</span>
          </h1>

          <p className={`text-xl ${isDarkMode ? 'text-purple-200' : 'text-cyan-100'}`}>
            Transform your imagination into reality
          </p>
          <p className={`text-xl ${isDarkMode ? 'text-purple-200' : 'text-cyan-100'} font-arabic`}>
            حوّل خيالك إلى واقع
          </p>
        </motion.div>

        <ImageGenerator
          prompt={prompt}
          isGenerating={isGenerating}
          message={message}
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          isDarkMode={isDarkMode}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div
                onClick={() => {
                  if (!image.isLoading) {
                    setSelectedImage(index);
                    setShowDownloadPanel(true);
                  }
                }}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl ${
                  image.isLoading ? 'cursor-wait' : ''
                }`}
              >
                {image.isLoading ? (
                  <div className={`w-full h-0 pb-[100%] ${isDarkMode ? 'bg-purple-900/30' : 'bg-cyan-800/50'} rounded-2xl relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-cyan-400'}`} />
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-0 pb-[100%] relative">
                    <img
                      src={image.url}
                      alt={`Generated artwork ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transform transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-cyan-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-cyan-50 text-sm font-medium">Click for options</p>
                    </div>
                  </div>
                )}
              </div>

              {image.isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 ${isDarkMode ? 'bg-purple-900/30' : 'bg-cyan-800/50'} rounded-xl backdrop-blur-sm`}
                >
                  <input
                    type="text"
                    value={image.editPrompt}
                    onChange={(e) => updateEditPrompt(index, e.target.value)}
                    className={`w-full p-3 ${
                      isDarkMode ? 'bg-purple-800/30 focus:ring-purple-400' : 'bg-cyan-700/30 focus:ring-cyan-400'
                    } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                      isArabic(image.editPrompt) ? 'font-arabic text-right' : ''
                    }`}
                    placeholder="Add details to modify the image..."
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(index, image.editPrompt)}
                      className={`flex-1 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-purple-400 to-blue-500' 
                          : 'bg-gradient-to-r from-cyan-400 to-cyan-500'
                      } text-white px-4 py-2 rounded-lg font-medium hover:opacity-90`}
                    >
                      Apply Edit
                    </button>
                    <button
                      onClick={() => toggleEdit(index)}
                      className={`px-4 py-2 ${
                        isDarkMode ? 'bg-purple-800/30 hover:bg-purple-700/50' : 'bg-cyan-700/30 hover:bg-cyan-700/50'
                      } text-white rounded-lg`}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showDownloadPanel && selectedImage !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full relative border border-white/10">
                <button
                  onClick={() => {
                    setShowDownloadPanel(false);
                    setSelectedImage(null);
                  }}
                  className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                
                <h3 className="text-xl font-semibold mb-4 text-white">Image Options</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={() => handleDownload(images[selectedImage].url)}
                    className={`w-full ${
                      isDarkMode 
                        ? 'bg-purple-800/30 hover:bg-purple-700/50' 
                        : 'bg-cyan-700/30 hover:bg-cyan-700/50'
                    } text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2`}
                  >
                    <Download />
                    Download Image
                  </button>
                  
                  <button
                    onClick={() => handleCopyLink(images[selectedImage].url)}
                    className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Link />
                    Copy Image Link
                  </button>

                  <button
                    onClick={() => {
                      toggleEdit(selectedImage);
                      setShowDownloadPanel(false);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Wand2 />
                    Edit Image
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className={`text-center ${isDarkMode ? 'text-purple-300/70' : 'text-cyan-300/70'} mt-8 font-arabic`}>
        <p>💻 Built with ❤ by Ali Mahmoud using <span className="font-semibold">React</span>, <span className="font-semibold">Vite</span>, <span className="font-semibold">Tailwind CSS</span>, and <span className="font-semibold">Pollinations API</span>.</p>
        <p>All rights reserved. © 2024 Dreamator AI</p>
      </footer>
    </div>
  );
}

export default App;
