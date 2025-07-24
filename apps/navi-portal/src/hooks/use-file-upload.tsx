import { useCallback } from 'react';

// TODO: Replace with actual GraphQL query when provided
// This is a stub implementation
export type GetSignedUrlQueryVariables = {
  content_type: string;
  expires_in?: number;
  file_name: string;
  config_slug: string;
};

export type GetSignedUrlResponse = {
  upload_url: string;
  file_url: string;
};

// Stub function - will be replaced with actual GraphQL query
const stubGetSignedUrl = async (variables: GetSignedUrlQueryVariables): Promise<GetSignedUrlResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('🔄 Stub getSignedUrl called with:', variables);
  
  // Return mock URLs for development
  return {
    upload_url: `https://storage.googleapis.com/stub-bucket/upload?file=${encodeURIComponent(variables.file_name)}&content_type=${encodeURIComponent(variables.content_type)}`,
    file_url: `https://storage.googleapis.com/stub-bucket/files/${encodeURIComponent(variables.file_name)}`,
  };
};

export const useFileUpload = (): [
  (args: GetSignedUrlQueryVariables) => Promise<GetSignedUrlResponse>
] => {
  return [
    useCallback(async (args: GetSignedUrlQueryVariables): Promise<GetSignedUrlResponse> => {
      try {
        const { content_type, expires_in, file_name, config_slug } = args;

        // Ensure content_type is properly set
        const safeContentType = content_type || 'application/octet-stream';

        // TODO: Replace with actual GraphQL query
        const result = await stubGetSignedUrl({
          content_type: safeContentType,
          expires_in,
          file_name,
          config_slug,
        });

        if (!result) {
          throw new Error('No data returned from getSignedUrl');
        }

        return result;
      } catch (error) {
        console.error('useFileUpload - Error getting signed URL:', error);
        throw error;
      }
    }, [])
  ];
}; 