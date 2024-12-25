import { ImageGenerationError } from '../utils/errors';

export interface ImageSettings {
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
  enhance?: boolean;
  nologo?: boolean;
  private?: boolean;
  safe?: boolean;
}

export interface ImageResponse {
  url: string;
  settings: ImageSettings;
}

const defaultSettings: ImageSettings = {
  width: 1024,
  height: 1024,
  model: 'flux',
  enhance: true,
  nologo: true,
  private: false,
  safe: false,
  seed: Math.floor(Math.random() * 2147483647)
};



export async function generateImage(
  prompt: string,
  settings: ImageSettings = {}
): Promise<ImageResponse> {
  try {
    const finalSettings = { ...defaultSettings, ...settings };
    const encodedPrompt = encodeURIComponent(prompt);

    // Construct the URL with all parameters
    const params = new URLSearchParams({
      width: finalSettings.width?.toString() || '',
      height: finalSettings.height?.toString() || '',
      seed: Math.floor(Math.random() * 2147483647).toString(),
      model: finalSettings.model || '',
      enhance: finalSettings.enhance?.toString() || '',
      nologo: finalSettings.nologo?.toString() || '',
      private: finalSettings.private?.toString() || '',
      safe: finalSettings.safe?.toString() || ''
    });

    const baseUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    const url = `${baseUrl}?${params.toString()}`;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    return {
      url,
      settings: finalSettings
    };
  } catch (error) {
    if (error instanceof ImageGenerationError) {
      throw error;
    }
    throw new ImageGenerationError('An unexpected error occurred');
  }
}

export async function downloadImage(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Generate filename if not provided
    const randomString = Math.random().toString(36).substring(2, 15);
    link.download = filename || `dreamator-${randomString}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error('Failed to download image. Please try right-clicking and "Save Image As" instead.');
  }
}