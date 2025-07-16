import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConversationalForm,
  ConversationalFormStep,
} from "../../activities/conversational-form";

const mockSteps: ConversationalFormStep[] = [
  {
    id: "step1",
    title: "Personal Information",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "First Name",
        required: true,
        validation: { min: 2 },
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        required: true,
      },
    ],
  },
  {
    id: "step2",
    title: "Preferences",
    fields: [
      {
        id: "agree",
        type: "checkbox",
        label: "I agree",
        description: "Agree to terms",
        required: true,
      },
    ],
  },
];

describe("ConversationalForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnStepChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    steps: mockSteps,
    onSubmit: mockOnSubmit,
    onStepChange: mockOnStepChange,
  };

  it("renders the first step correctly", () => {
    render(<ConversationalForm {...defaultProps} />);

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("shows progress indicator by default", () => {
    render(<ConversationalForm {...defaultProps} />);

    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("hides progress indicator when showProgress is false", () => {
    render(<ConversationalForm {...defaultProps} showProgress={false} />);

    expect(screen.queryByText("Step 1 of 2")).not.toBeInTheDocument();
  });

  it("validates required fields before proceeding to next step", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    expect(screen.getByText("First Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Personal Information")).toBeInTheDocument(); // Still on first step
  });

  it("validates field length constraints", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, "A"); // Too short (min: 2)

    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    expect(
      screen.getByText("First Name must be at least 2 characters")
    ).toBeInTheDocument();
  });

  it("proceeds to next step when validation passes", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");

    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    // Should now be on step 2
    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("100% complete")).toBeInTheDocument();
  });

  it("allows going back to previous step", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    // Go to step 2
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Go back to step 1
    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John")).toBeInTheDocument(); // Data preserved
  });

  it("hides back button on first step", () => {
    render(<ConversationalForm {...defaultProps} />);

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toHaveClass("invisible");
  });

  it("shows submit button on last step", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    // Navigate to last step
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /continue/i })
    ).not.toBeInTheDocument();
  });

  it("handles form submission", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    // Fill first step
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Fill second step
    // For checkbox first (doesn't need select interaction)
    await user.click(screen.getByRole("checkbox"));

    // Submit
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      firstName: "John",
      email: "john@example.com",
      agree: "true",
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    const slowSubmit = vi.fn(
      (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ConversationalForm {...defaultProps} onSubmit={slowSubmit} />);

    // Navigate to last step and fill form
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // For checkbox (doesn't need select interaction for this test)
    await user.click(screen.getByRole("checkbox"));

    // Submit and check loading state
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("Submitting...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });
  });

  it("calls onStepChange when step changes", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    // Initial call
    expect(mockOnStepChange).toHaveBeenCalledWith(1, 2);

    // Navigate to next step
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(mockOnStepChange).toHaveBeenCalledWith(2, 2);
  });

  it("handles custom button text", () => {
    render(
      <ConversationalForm
        {...defaultProps}
        submitButtonText="Custom Submit"
        nextButtonText="Custom Next"
        previousButtonText="Custom Previous"
      />
    );

    expect(
      screen.getByRole("button", { name: /custom next/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /custom previous/i })
    ).toBeInTheDocument();
  });

  it("handles textarea field type", () => {
    const stepsWithTextarea: ConversationalFormStep[] = [
      {
        id: "step1",
        title: "Comments",
        fields: [
          {
            id: "comments",
            type: "textarea",
            label: "Comments",
            description: "Enter your comments",
          },
        ],
      },
    ];

    render(<ConversationalForm {...defaultProps} steps={stepsWithTextarea} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.getAttribute("placeholder")).toBe("Enter your comments");
  });

  it("handles radio group field type", async () => {
    const user = userEvent.setup();
    const stepsWithRadio: ConversationalFormStep[] = [
      {
        id: "step1",
        title: "Choice",
        fields: [
          {
            id: "choice",
            type: "radio",
            label: "Choose one",
            options: [
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
            ],
          },
        ],
      },
    ];

    render(<ConversationalForm {...defaultProps} steps={stepsWithRadio} />);

    const optionA = screen.getByLabelText("Option A");
    await user.click(optionA);

    expect(optionA).toBeChecked();
  });

  it("clears validation errors when field value changes", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    // Trigger validation error
    const continueButton = screen.getByRole("button", { name: /continue/i });
    await user.click(continueButton);

    expect(screen.getByText("First Name is required")).toBeInTheDocument();

    // Type in field to clear error
    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, "John");

    expect(
      screen.queryByText("First Name is required")
    ).not.toBeInTheDocument();
  });

  it("preserves form data when navigating between steps", async () => {
    const user = userEvent.setup();
    render(<ConversationalForm {...defaultProps} />);

    // Fill first step
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Go back
    await user.click(screen.getByRole("button", { name: /back/i }));

    // Data should be preserved
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });
});
