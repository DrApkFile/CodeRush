export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Upload error details:', data);
      throw new Error(data.error || 'Failed to upload image');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image');
  }
}; 