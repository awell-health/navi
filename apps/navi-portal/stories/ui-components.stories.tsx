import type { Meta, StoryObj } from "@storybook/nextjs-vite";
// Mock function for event handlers
const fn = () => () => console.log("Button clicked");
import { useState } from "react";
import type { CheckedState } from "@radix-ui/react-checkbox";

// Import all our UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Component showcase wrapper
const ComponentShowcase = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="space-y-4 p-6 border rounded-lg">
    <h3 className="text-lg font-semibold">{title}</h3>
    {children}
  </div>
);

// Button Stories
const ButtonMeta: Meta<typeof Button> = {
  title: "UI Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A button component built with Radix UI primitives and styled with Tailwind CSS. Supports multiple variants and sizes.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "The visual style variant of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
  },
};

export default ButtonMeta;

type ButtonStory = StoryObj<typeof ButtonMeta>;

export const Default: ButtonStory = {
  args: {
    children: "Button",
    onClick: fn(),
  },
};

export const Secondary: ButtonStory = {
  args: {
    variant: "secondary",
    children: "Secondary",
    onClick: fn(),
  },
};

export const Destructive: ButtonStory = {
  args: {
    variant: "destructive",
    children: "Delete",
    onClick: fn(),
  },
};

export const Outline: ButtonStory = {
  args: {
    variant: "outline",
    children: "Outline",
    onClick: fn(),
  },
};

export const Ghost: ButtonStory = {
  args: {
    variant: "ghost",
    children: "Ghost",
    onClick: fn(),
  },
};

export const Link: ButtonStory = {
  args: {
    variant: "link",
    children: "Link",
    onClick: fn(),
  },
};

export const Small: ButtonStory = {
  args: {
    size: "sm",
    children: "Small",
    onClick: fn(),
  },
};

export const Large: ButtonStory = {
  args: {
    size: "lg",
    children: "Large",
    onClick: fn(),
  },
};

export const Disabled: ButtonStory = {
  args: {
    disabled: true,
    children: "Disabled",
    onClick: fn(),
  },
};

export const AllVariants: ButtonStory = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All button variants displayed together for comparison.",
      },
    },
  },
};

// Input Stories
export const InputStories: Meta<typeof Input> = {
  title: "UI Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A form input component with consistent styling and accessibility features.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
      description: "The input type",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
  },
};

export const TextInput: StoryObj<typeof InputStories> = {
  args: {
    type: "text",
    placeholder: "Enter your name",
  },
};

export const EmailInput: StoryObj<typeof InputStories> = {
  args: {
    type: "email",
    placeholder: "Enter your email",
  },
};

export const PasswordInput: StoryObj<typeof InputStories> = {
  args: {
    type: "password",
    placeholder: "Enter your password",
  },
};

export const NumberInput: StoryObj<typeof InputStories> = {
  args: {
    type: "number",
    placeholder: "Enter a number",
  },
};

export const DisabledInput: StoryObj<typeof InputStories> = {
  args: {
    type: "text",
    placeholder: "Disabled input",
    disabled: true,
    value: "Cannot edit this",
  },
};

export const InputWithLabel: StoryObj<typeof InputStories> = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Input component with a proper label for accessibility.",
      },
    },
  },
};

// Textarea Stories
export const TextareaStories: Meta<typeof Textarea> = {
  title: "UI Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A textarea component for multi-line text input with consistent styling.",
      },
    },
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Whether the textarea is disabled",
    },
    rows: {
      control: "number",
      description: "Number of visible rows",
    },
  },
};

export const BasicTextarea: StoryObj<typeof TextareaStories> = {
  args: {
    placeholder: "Enter your message here...",
  },
};

export const TextareaWithRows: StoryObj<typeof TextareaStories> = {
  args: {
    placeholder: "This textarea has 6 rows",
    rows: 6,
  },
};

export const DisabledTextarea: StoryObj<typeof TextareaStories> = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
    value: "This content cannot be edited",
  },
};

export const TextareaWithLabel: StoryObj<typeof TextareaStories> = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="feedback">Feedback</Label>
      <Textarea
        id="feedback"
        placeholder="Please share your thoughts..."
        rows={4}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Textarea component with a proper label for accessibility.",
      },
    },
  },
};

// Checkbox Stories
export const CheckboxStories: Meta<typeof Checkbox> = {
  title: "UI Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A checkbox component built with Radix UI for accessibility and customization.",
      },
    },
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
    },
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
  },
};

export const BasicCheckbox: StoryObj<typeof CheckboxStories> = {
  render: () => {
    const [checked, setChecked] = useState<CheckedState>(false);
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    );
  },
};

export const CheckedCheckbox: StoryObj<typeof CheckboxStories> = {
  args: {
    checked: true,
  },
};

export const DisabledCheckbox: StoryObj<typeof CheckboxStories> = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked">Disabled unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" checked disabled />
        <Label htmlFor="disabled-checked">Disabled checked</Label>
      </div>
    </div>
  ),
};

export const CheckboxGroup: StoryObj<typeof CheckboxStories> = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleCheckboxChange = (value: string, checked: boolean) => {
      if (checked) {
        setSelectedItems([...selectedItems, value]);
      } else {
        setSelectedItems(selectedItems.filter((item) => item !== value));
      }
    };

    return (
      <div className="space-y-4">
        <div className="font-medium">Select your preferences:</div>
        <div className="space-y-2">
          {[
            "Email notifications",
            "SMS alerts",
            "Push notifications",
            "Weekly digest",
          ].map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={item.toLowerCase().replace(/\s+/g, "-")}
                checked={selectedItems.includes(item)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(item, checked as boolean)
                }
              />
              <Label htmlFor={item.toLowerCase().replace(/\s+/g, "-")}>
                {item}
              </Label>
            </div>
          ))}
        </div>
        {selectedItems.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Selected: {selectedItems.join(", ")}
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multiple checkboxes working together as a group with state management.",
      },
    },
  },
};

// RadioGroup Stories
export const RadioGroupStories: Meta<typeof RadioGroup> = {
  title: "UI Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A radio group component built with Radix UI for mutually exclusive selection.",
      },
    },
  },
};

export const BasicRadioGroup: StoryObj<typeof RadioGroupStories> = {
  render: () => {
    const [value, setValue] = useState("comfortable");

    return (
      <div className="space-y-4">
        <div className="font-medium">
          How comfortable are you with technology?
        </div>
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner">Beginner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="comfortable" />
            <Label htmlFor="comfortable">Comfortable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expert" id="expert" />
            <Label htmlFor="expert">Expert</Label>
          </div>
        </RadioGroup>
        <div className="text-sm text-muted-foreground">Selected: {value}</div>
      </div>
    );
  },
};

export const DisabledRadioGroup: StoryObj<typeof RadioGroupStories> = {
  render: () => (
    <RadioGroup disabled defaultValue="option2">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="disabled1" />
        <Label htmlFor="disabled1">Option 1 (disabled)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="disabled2" />
        <Label htmlFor="disabled2">Option 2 (disabled, selected)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="disabled3" />
        <Label htmlFor="disabled3">Option 3 (disabled)</Label>
      </div>
    </RadioGroup>
  ),
};

export const HealthcareRadioGroup: StoryObj<typeof RadioGroupStories> = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4 w-80">
        <div className="font-medium">Rate your current pain level:</div>
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="pain-none" />
            <Label htmlFor="pain-none">No pain (0)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mild" id="pain-mild" />
            <Label htmlFor="pain-mild">Mild pain (1-3)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="moderate" id="pain-moderate" />
            <Label htmlFor="pain-moderate">Moderate pain (4-6)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="severe" id="pain-severe" />
            <Label htmlFor="pain-severe">Severe pain (7-10)</Label>
          </div>
        </RadioGroup>
        {value && (
          <div className="text-sm text-muted-foreground border-l-2 border-primary pl-4">
            Selected pain level: <strong>{value}</strong>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Healthcare-specific radio group for pain level assessment.",
      },
    },
  },
};

// All Components Showcase
export const AllComponents: StoryObj = {
  render: () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      message: "",
      newsletter: false,
      priority: "",
      notifications: [] as string[],
    });

    return (
      <div className="max-w-2xl space-y-6 p-6">
        <h2 className="text-2xl font-bold">Healthcare Form Components</h2>

        <ComponentShowcase title="Text Inputs">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Textarea">
          <div className="space-y-2">
            <Label htmlFor="message">Additional Comments</Label>
            <Textarea
              id="message"
              placeholder="Please provide any additional information..."
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Checkbox">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, newsletter: checked as boolean })
              }
            />
            <Label htmlFor="newsletter">
              Subscribe to health tips newsletter
            </Label>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Radio Group">
          <div className="space-y-2">
            <Label>Message Priority</Label>
            <RadioGroup
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low - Response within 48 hours</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">
                  Normal - Response within 24 hours
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent">Urgent - Response within 4 hours</Label>
              </div>
            </RadioGroup>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Buttons">
          <div className="flex gap-2 flex-wrap">
            <Button variant="default">Submit Form</Button>
            <Button variant="outline">Save Draft</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="destructive">Clear Form</Button>
          </div>
        </ComponentShowcase>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Form Data Preview:</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "A comprehensive showcase of all UI components working together in a healthcare form context.",
      },
    },
  },
};
