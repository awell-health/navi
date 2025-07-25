import type { Question } from "@/lib/awell-client/generated/graphql";
import type { FormPage, FormRenderConfig, FormData } from "./types";

/**
 * Generates form pages based on the render configuration
 */
export function generateFormPages(
  form: FormData,
  config: FormRenderConfig
): FormPage[] {
  switch (config.mode) {
    case "traditional":
      return generateTraditionalPages(form);
    case "conversational":
      return generateConversationalPages(form);
    case "custom":
      return generateCustomPages(form, config.pageBreakAfterQuestions || []);
    default:
      throw new Error(`Unsupported form mode: ${config.mode}`);
  }
}

/**
 * Traditional form: All questions on a single page
 */
function generateTraditionalPages(form: FormData): FormPage[] {
  return [
    {
      id: `${form.id}-page-1`,
      questions: form.questions,
    },
  ];
}

/**
 * Conversational form: Each question gets its own page
 */
function generateConversationalPages(form: FormData): FormPage[] {
  return form.questions.map((question, index) => ({
    id: `${form.id}-page-${index + 1}`,
    questions: [question],
  }));
}

/**
 * Custom form: Page breaks defined by customer configuration
 */
function generateCustomPages(
  form: FormData,
  pageBreakAfterQuestions: string[]
): FormPage[] {
  const pages: FormPage[] = [];
  let currentQuestions: Question[] = [];
  let pageNumber = 1;

  for (const question of form.questions) {
    currentQuestions.push(question);

    // Check if this question should trigger a page break
    if (pageBreakAfterQuestions.includes(question.id)) {
      pages.push({
        id: `${form.id}-page-${pageNumber}`,
        questions: [...currentQuestions],
      });
      currentQuestions = [];
      pageNumber++;
    }
  }

  // Add remaining questions as the final page
  if (currentQuestions.length > 0) {
    pages.push({
      id: `${form.id}-page-${pageNumber}`,
      questions: currentQuestions,
    });
  }

  // Ensure at least one page exists
  if (pages.length === 0) {
    pages.push({
      id: `${form.id}-page-1`,
      questions: form.questions,
    });
  }

  return pages;
}

/**
 * Get all questions from all pages (useful for validation and data collection)
 */
export function getAllQuestionsFromPages(pages: FormPage[]): Question[] {
  return pages.flatMap((page) => page.questions);
}

/**
 * Find which page contains a specific question
 */
export function findPageForQuestion(
  pages: FormPage[],
  questionId: string
): { page: FormPage; pageIndex: number } | null {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const question = page.questions.find((q) => q.id === questionId);
    if (question) {
      return { page, pageIndex: i };
    }
  }
  return null;
}
