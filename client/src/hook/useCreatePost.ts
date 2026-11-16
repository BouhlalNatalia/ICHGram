import { useState, useEffect, useCallback, useRef } from 'react';
import { getImageUrl } from '../config';
import type { IPost } from '../features/feed/types/feed.types';

interface PublishData {
  file: File | null;
  caption: string;
}

export const useCreatePost = (
  onPublish?: (data: PublishData) => Promise<IPost | undefined | void>,
  initialData?: IPost | null
) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialData) {
      setCaption(initialData.description || '');
      setImagePreview(
        initialData.image ? getImageUrl(initialData.image) : null
      );
    } else {
      setCaption('');
      setImagePreview(null);
      setFile(null);
    }
  }, [initialData]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    },
    []
  );

  const addEmoji = useCallback(
    (emoji: string) => {
      const textarea = textAreaRef.current;

      if (!textarea) {
        setCaption((prev) => prev + emoji);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const textBefore = caption.substring(0, start);
      const textAfter = caption.substring(end);

      const newText = textBefore + emoji + textAfter;

      setCaption(newText);

      setTimeout(() => {
        textarea.focus();
        const pos = start + emoji.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    },
    [caption]
  );

  const handleSubmit = async (onSuccess: () => void) => {
    const isEditMode = !!initialData;

    setIsLoading(true);

    try {
      if (onPublish) {
        // Пост создаёт/обновляет сам onPublish (через redux thunk) — здесь повторно ничего не отправляем
        await onPublish({ file, caption });
        onSuccess();
      } else {
        if (!isEditMode && !file) {
          alert('Please select a photo');
        } else {
          console.warn('useCreatePost: missing onPublish handler');
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Failed to process post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return {
    file,
    caption,
    setCaption,
    imagePreview,
    isLoading,
    handleFileChange,
    handleSubmit,
    addEmoji,
    textAreaRef
  };
};