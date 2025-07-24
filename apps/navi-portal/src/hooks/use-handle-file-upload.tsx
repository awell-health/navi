import { useCallback } from 'react';
import { useFileUpload } from './use-file-upload';

export const useHandleFileUpload = () => {
  const [getGcsSignedUrl] = useFileUpload();

  const handleFileUpload = useCallback(
    async (file: File, config_slug?: string): Promise<string> => {
      try {
        if (!config_slug) {
          throw new Error('Config slug is required for file upload');
        }

        console.log(`🔄 Starting file upload for: ${file.name} (${file.size} bytes)`);

        // Get signed URL with milliseconds for expires_in
        const { upload_url, file_url } = await getGcsSignedUrl({
          file_name: file.name,
          content_type: file.type,
          expires_in: 360000, // 6 minutes in milliseconds
          config_slug,
        });

        console.log(`✅ Got signed URLs for ${file.name}`);

        // For stub implementation, we'll simulate the upload
        // TODO: Replace with actual GCS upload when signed URLs are real
        if (upload_url.includes('stub-bucket')) {
          console.log(`🧪 Simulating file upload for: ${file.name}`);
          // Simulate upload delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log(`✅ Simulated upload complete for: ${file.name}`);
          return file_url;
        }

        // Determine content type for upload
        let contentType = 'application/octet-stream';
        try {
          const url = new URL(upload_url);
          const signedHeaders = url.searchParams.get('X-Goog-SignedHeaders');
          if (signedHeaders?.includes('content-type')) {
            contentType = file.type || 'application/octet-stream';
          }
        } catch (e) {
          console.warn('Error parsing upload URL:', e);
        }

        // Upload file to GCS
        console.log(`📤 Uploading ${file.name} to GCS...`);
        const response = await fetch(upload_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': contentType,
            'Content-Length': file.size.toString(),
            Origin: window.location.origin,
          },
          credentials: 'omit',
          mode: 'cors',
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to upload file ${file.name}: ${errorText}`);
          throw new Error(
            `Failed to upload file: ${response.status} ${response.statusText}`
          );
        }

        console.log(`✅ Successfully uploaded: ${file.name}`);
        return file_url;
      } catch (error) {
        console.error('❌ File upload failed:', error);
        throw error;
      }
    },
    [getGcsSignedUrl]
  );

  return { handleFileUpload };
}; 