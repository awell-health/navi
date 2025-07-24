import React, { useCallback, useState } from "react";
import { ControlledQuestionProps } from "./types";
import {
  Button,
  Label,
  Typography,
} from "@/components/ui";
import { Upload, Image, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHandleFileUpload } from "@/hooks/use-handle-file-upload";
import type { Question } from "@/lib/awell-client/generated/graphql";

/**
 * Validation utility for ImageQuestion
 */
export function createImageValidationRules(question: Question) {
  const rules: any = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Image validation
  rules.validate = (value: string) => {
    if (!value && !question.is_required) return true;
    if (!value && question.is_required) return "Please upload an image";
    
    // Value should be a file URL after upload
    if (!value.startsWith('http')) {
      return "Please upload a valid image";
    }
    
    return true;
  };

  return rules;
}

/**
 * Utility to check if file type is accepted for images
 */
function isImageTypeAccepted(file: File, acceptedTypes?: string[] | null): boolean {
  // Default to common image types if none specified
  const defaultImageTypes = ['image/*', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const typesToCheck = acceptedTypes && acceptedTypes.length > 0 ? acceptedTypes : defaultImageTypes;

  return typesToCheck.some(acceptedType => {
    // Handle wildcards like "image/*"
    if (acceptedType.includes('*')) {
      const baseType = acceptedType.split('/')[0];
      return file.type.startsWith(baseType + '/');
    }
    
    // Handle exact matches like "image/jpeg"
    if (acceptedType.includes('/')) {
      return file.type === acceptedType;
    }
    
    // Handle extensions like ".jpg", ".png"
    if (acceptedType.startsWith('.')) {
      return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
    }
    
    return false;
  });
}

/**
 * Utility to get file name from URL
 */
function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return decodeURIComponent(pathname.split('/').pop() || 'image');
  } catch {
    return 'image';
  }
}

/**
 * ImageQuestion component - image upload with preview
 */
export function ImageQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { handleFileUpload } = useHandleFileUpload();
  
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const fileConfig = question.config?.file_storage;
  const acceptedTypes = fileConfig?.accepted_file_types;
  const configSlug = fileConfig?.file_storage_config_slug;

  const handleFileSelect = useCallback(async (file: File) => {
    if (!configSlug) {
      console.error('No file storage config slug provided');
      return;
    }

    // Validate file type (ensure it's an image)
    if (!isImageTypeAccepted(file, acceptedTypes)) {
      console.error(`File type ${file.type} not accepted for images`);
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      const fileUrl = await handleFileUpload(file, configSlug);
      field.onChange(fileUrl);
      
      // Clean up object URL after upload
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Image upload failed:', error);
      // Clean up on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  }, [handleFileUpload, configSlug, acceptedTypes, field, previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClear = useCallback(() => {
    field.onChange("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [field, previewUrl]);

  // Default to image types if none specified
  const imageTypes = acceptedTypes && acceptedTypes.length > 0 
    ? acceptedTypes 
    : ['image/*'];
  const acceptString = imageTypes.join(',');
  const currentFileName = field.value ? getFileNameFromUrl(field.value) : null;
  const displayImageUrl = previewUrl || field.value;

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="block">
        {question.title.replace(/<[^>]*>/g, "")}
        {question.is_required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>

      {!field.value && !previewUrl ? (
        <div
          className={cn(
            "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6",
            "transition-colors duration-200",
            "font-[var(--font-family-body,inherit)]",
            dragActive && "border-primary bg-primary/5",
            hasError && "border-destructive",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed",
            !disabled && !isUploading && "hover:border-muted-foreground/40 cursor-pointer"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !isUploading) {
              document.getElementById(`image-input-${field.name}`)?.click();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <Typography.Small className="text-muted-foreground">
                  Uploading image...
                </Typography.Small>
              </>
            ) : (
              <>
                <Image className="h-8 w-8 text-muted-foreground" />
                <div>
                  <Typography.Small className="font-medium">
                    Click to upload or drag and drop an image
                  </Typography.Small>
                  <Typography.Small className="text-muted-foreground mt-1">
                    Accepted formats: {imageTypes.join(', ')}
                  </Typography.Small>
                </div>
              </>
            )}
          </div>
          
          <input
            id={`image-input-${field.name}`}
            type="file"
            accept={acceptString}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative">
            <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
              <img
                src={displayImageUrl}
                alt={currentFileName || "Uploaded image"}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  console.error('Failed to load image:', displayImageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <Typography.Small>Uploading...</Typography.Small>
                  </div>
                </div>
              )}
            </div>
            
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClear}
                className="absolute top-2 right-2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* File Info */}
          <div className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-muted/30">
            <Image className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <Typography.Small className="font-medium">
                {currentFileName}
              </Typography.Small>
              <Typography.Small className="text-muted-foreground">
                {isUploading ? "Uploading..." : "Image uploaded successfully"}
              </Typography.Small>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <Typography.Small
          id={`${field.name}-error`}
          className="text-destructive"
          role="alert"
        >
          {errorMessage}
        </Typography.Small>
      )}
    </div>
  );
} 