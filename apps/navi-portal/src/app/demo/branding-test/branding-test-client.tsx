"use client";

import React from "react";
import {
  Button,
  Input,
  Label,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Typography,
  Progress,
  Slider,
} from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { awellDefaultBranding } from "@/lib/branding/defaults";

interface BrandingTestClientProps {
  orgId: string;
  hasCustomBranding: boolean;
}

export function BrandingTestClient({
  orgId,
  hasCustomBranding,
}: BrandingTestClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <Typography.H1>
            {hasCustomBranding
              ? "Branding Test Page"
              : "Unstyled Components Preview"}
          </Typography.H1>
          <Typography.P className="text-muted-foreground max-w-2xl mx-auto">
            {hasCustomBranding
              ? "This page showcases different UI components with your custom branding applied. Your colors, fonts, and styling are active across all components."
              : "This page shows unstyled UI components. Set up your organization branding on the CareOps platform to see how your custom styling will transform these components."}
          </Typography.P>
          {orgId !== awellDefaultBranding.orgId && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <Typography.P className="text-sm">
                <strong>Testing Org ID:</strong>{" "}
                <code className="bg-primary/10 px-2 py-1 rounded">{orgId}</code>
              </Typography.P>
            </div>
          )}
        </div>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>
              Headers, paragraphs, and text styling with your custom fonts and
              colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Typography.H1>Heading 1 - Main Title</Typography.H1>
            <Typography.H2>Heading 2 - Section Title</Typography.H2>
            <Typography.H3>Heading 3 - Subsection</Typography.H3>
            <Typography.H4>Heading 4 - Component Title</Typography.H4>
            <Typography.P>
              This is a paragraph of body text. It demonstrates how your custom
              typography choices affect readability and visual hierarchy. Custom
              fonts and line heights should be clearly visible here.
            </Typography.P>
            <Typography.P className="text-muted-foreground">
              This is muted text that shows secondary content styling.
            </Typography.P>
            <Typography.P className="text-sm">
              Small text for captions and fine print.
            </Typography.P>
          </CardContent>
        </Card>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons & Actions</CardTitle>
            <CardDescription>
              Primary, secondary, and variant buttons with your brand colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small Button</Button>
              <Button size="default">Default Button</Button>
              <Button size="lg">Large Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled Button</Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Input fields, selects, and form controls with your branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="text-input">Text Input</Label>
                <Input id="text-input" placeholder="Enter your name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-input">Email Input</Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="select">Select Dropdown</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textarea">Text Area</Label>
                <Textarea
                  id="textarea"
                  placeholder="Enter your message here..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Checkboxes</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check1" />
                    <Label htmlFor="check1">Option A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check2" defaultChecked />
                    <Label htmlFor="check2">Option B (pre-checked)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="check3" />
                    <Label htmlFor="check3">Option C</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Radio Buttons</Label>
                <RadioGroup defaultValue="radio1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="radio1" id="radio1" />
                    <Label htmlFor="radio1">Choice 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="radio2" id="radio2" />
                    <Label htmlFor="radio2">Choice 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="radio3" id="radio3" />
                    <Label htmlFor="radio3">Choice 3</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress & Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle>Progress & Feedback</CardTitle>
            <CardDescription>
              Progress indicators, badges, and status components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Progress Bar</Label>
              <Progress value={65} className="w-full" />
              <Typography.P className="text-sm text-muted-foreground">
                65% complete
              </Typography.P>
            </div>

            <div className="space-y-2">
              <Label>Slider</Label>
              <Slider
                defaultValue={[50]}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Your Branding</CardTitle>
            <CardDescription>
              Use this page to verify your custom branding across all components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <strong>Colors:</strong> Check how your primary, secondary, and
                accent colors appear across buttons, inputs, and highlights
              </li>
              <li>
                <strong>Typography:</strong> Verify that custom fonts render
                correctly in headers, body text, and form labels
              </li>
              <li>
                <strong>Layout:</strong> Ensure spacing, borders, and component
                sizing align with your design system
              </li>
              <li>
                <strong>Accessibility:</strong> Test color contrast and
                readability with your brand colors
              </li>
              <li>
                <strong>Interactions:</strong> Try clicking buttons, filling
                forms, and interacting with components
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
