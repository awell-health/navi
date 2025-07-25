import React, { useState } from "react";
import { ControlledQuestionProps } from "./types";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Typography,
} from "@/components/ui";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useICDClassificationList } from "@/hooks/use-icd-classification-list";
import type { Question } from "@/lib/awell-client/generated/graphql";

/**
 * Validation utility for ICD10Question
 */
export function createICD10ValidationRules(question: Question) {
  const rules: Record<string, unknown> = {};

  // Required validation
  if (question.is_required) {
    rules.required = "This field is required";
  }

  // Validate that the selected value is in proper ICD-10 format
  rules.validate = (value: string) => {
    if (!value && !question.is_required) return true;
    if (!value && question.is_required) return "Please select an ICD-10 code";

    // Value should be in format "CODE|NAME"
    if (!value.includes("|")) {
      return "Please select a valid ICD-10 code from the search results";
    }

    return true;
  };

  return rules;
}

/**
 * ICD10Question component - searchable select for ICD-10 classification codes
 * Uses Clinical Tables NLM API for real-time code lookup
 */
export function ICD10Question({
  question,
  field,
  fieldState,
  disabled = false,
  className = "",
}: ControlledQuestionProps) {
  const [open, setOpen] = useState(false);
  const hasError = fieldState.invalid && fieldState.error;
  const errorMessage = fieldState.error?.message;

  const {
    options,
    loading,
    error: searchError,
    searchValue,
    onIcdClassificationSearchChange,
  } = useICDClassificationList(question.id);

  const selectedOption = options.find((option) => option.value === field.value);

  const handleSelect = (optionValue: string) => {
    field.onChange(optionValue);
    setOpen(false);
  };

  const handleClear = () => {
    field.onChange("");
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        <Label className="block">
          {question.title.replace(/<[^>]*>/g, "")}
          {question.is_required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                "font-[var(--font-family-body,inherit)]",
                "text-[var(--font-size-base,1rem)]",
                hasError && "border-destructive focus:ring-destructive",
                !selectedOption && "text-muted-foreground"
              )}
              disabled={disabled}
              onBlur={field.onBlur}
            >
              {selectedOption ? (
                <div className="flex items-center justify-between w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate">{selectedOption.label}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[400px]">
                      <div className="space-y-1">
                        <div className="font-medium">{selectedOption.code}</div>
                        <div className="text-sm">{selectedOption.name}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  {!disabled && (
                    <X
                      className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                    />
                  )}
                </div>
              ) : (
                <>
                  <span>Search ICD-10 codes...</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Type to search ICD-10 codes..."
                value={searchValue}
                onValueChange={onIcdClassificationSearchChange}
              />
              <CommandList>
                {loading && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Searching...
                    </span>
                  </div>
                )}

                {searchError && (
                  <div className="p-4 text-sm text-destructive">
                    {searchError}
                  </div>
                )}

                {!loading && !searchError && searchValue.length <= 1 && (
                  <CommandEmpty>
                    Type at least 2 characters to search for ICD-10 codes
                  </CommandEmpty>
                )}

                {!loading &&
                  !searchError &&
                  searchValue.length > 1 &&
                  options.length === 0 && (
                    <CommandEmpty>
                      No ICD-10 codes found for &quot;{searchValue}&quot;
                    </CommandEmpty>
                  )}

                {options.length > 0 && (
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={handleSelect}
                        className="flex items-start gap-2 p-3"
                      >
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            selectedOption?.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {option.code}
                          </div>
                          <div className="text-xs text-muted-foreground break-words">
                            {option.name}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
    </TooltipProvider>
  );
}
