import React, { useCallback, useState } from "react";
import { ControlledQuestionProps } from "./types";
import { Button, Label, Typography } from "@/components/ui";
import { Upload, File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHandleFileUpload } from "@/hooks/use-handle-file-upload";
import type { Question } from "@/lib/awell-client/generated/graphql";

/**
 * Validation utility for FileQuestion
 */
export function createFileValidationRules(question: Question) {
  const rules: Record<string, unknown> = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // File type validation
  rules.validate = (value: string) => {
    if (!value && !question.is_required) return true;
    if (!value && question.is_required) return "Please upload a file";

    // Value should be a file URL after upload
    if (!value.startsWith("http")) {
      return "Please upload a valid file";
    }

    return true;
  };

  return rules;
}

/**
 * Utility to check if file type is accepted
 */
function isFileTypeAccepted(
  file: File,
  acceptedTypes?: string[] | null
): boolean {
  if (!acceptedTypes || acceptedTypes.length === 0) {
    return true; // No restrictions
  }

  return acceptedTypes.some((acceptedType) => {
    // Handle wildcards like "image/*" or "application/*"
    if (acceptedType.includes("*")) {
      const baseType = acceptedType.split("/")[0];
      return file.type.startsWith(baseType + "/");
    }

    // Handle exact matches like "application/pdf"
    if (acceptedType.includes("/")) {
      return file.type === acceptedType;
    }

    // Handle extensions like ".pdf", ".doc"
    if (acceptedType.startsWith(".")) {
      return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
    }

    return false;
  });
}

/**
 * Utility to format file size
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Utility to get file name from URL
 */
function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return decodeURIComponent(pathname.split("/").pop() || "file");
  } catch {
    return "file";
  }
}

/**
 * FileQuestion component - file upload for documents
 */
export function FileQuestion({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { handleFileUpload } = useHandleFileUpload();

  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;
  const fileConfig = question.config?.file_storage;
  const acceptedTypes = fileConfig?.accepted_file_types;
  const configSlug = fileConfig?.file_storage_config_slug;

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!configSlug) {
        console.error("No file storage config slug provided");
        return;
      }

      // Validate file type
      if (!isFileTypeAccepted(file, acceptedTypes)) {
        console.error(`File type ${file.type} not accepted`);
        return;
      }

      try {
        setIsUploading(true);
        const fileUrl = await handleFileUpload(file, configSlug);
        field.onChange(fileUrl);
      } catch (error) {
        console.error("File upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [handleFileUpload, configSlug, acceptedTypes, field]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, isUploading, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !isUploading) {
        setDragActive(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleClear = useCallback(() => {
    field.onChange("");
  }, [field]);

  const acceptString = acceptedTypes?.join(",") || "";
  const currentFileName = field.value
    ? getFileNameFromUrl(field.value as string)
    : null;

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

      {!field.value ? (
        <div
          className={cn(
            "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6",
            "transition-colors duration-200",
            "font-[var(--font-family-body,inherit)]",
            dragActive && "border-primary bg-primary/5",
            hasError && "border-destructive",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed",
            !disabled &&
              !isUploading &&
              "hover:border-muted-foreground/40 cursor-pointer"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !isUploading) {
              document.getElementById(`file-input-${field.name}`)?.click();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <Typography.Small className="text-muted-foreground">
                  Uploading file...
                </Typography.Small>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <Typography.Small className="font-medium">
                    Click to upload or drag and drop
                  </Typography.Small>
                  {acceptedTypes && acceptedTypes.length > 0 && (
                    <Typography.Small className="text-muted-foreground mt-1">
                      Accepted types: {acceptedTypes.join(", ")}
                    </Typography.Small>
                  )}
                </div>
              </>
            )}
          </div>

          <input
            id={`file-input-${field.name}`}
            type="file"
            accept={acceptString}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-muted-foreground" />
            <div>
              <Typography.Small className="font-medium">
                {currentFileName}
              </Typography.Small>
              <Typography.Small className="text-muted-foreground">
                File uploaded successfully
              </Typography.Small>
            </div>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
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
