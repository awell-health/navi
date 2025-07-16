"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps {
  className?: string;
  children: React.ReactNode;
}

// H1 - Main page heading
export function TypographyH1({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-pretty",
        "navi-h1",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

// H2 - Section heading
export function TypographyH2({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "mt-10 scroll-m-20 text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight transition-colors first:mt-0",
        "navi-h2",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

// H3 - Subsection heading
export function TypographyH3({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "mt-8 scroll-m-20 text-lg md:text-xl lg:text-2xl font-semibold tracking-tight",
        "navi-h3",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

// H4 - Sub-subsection heading
export function TypographyH4({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-lg md:text-xl lg:text-2xl font-medium tracking-tight",
        "navi-h4",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

// P - Paragraph text
export function TypographyP({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-6",
        "navi-p",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Blockquote - Quote text
export function TypographyBlockquote({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    >
      {children}
    </blockquote>
  );
}

// Table - Data table
export function TypographyTable({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"div">) {
  return (
    <div className={cn("my-6 w-full overflow-y-auto", className)} {...props}>
      <table className="w-full">{children}</table>
    </div>
  );
}

// Table Header
export function TypographyTableHeader({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

// Table Row
export function TypographyTableRow({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"tr">) {
  return (
    <tr className={cn("even:bg-muted m-0 border-t p-0", className)} {...props}>
      {children}
    </tr>
  );
}

// Table Cell
export function TypographyTableCell({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

// Inline Code - Code snippets
export function TypographyInlineCode({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        "navi-code",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

// Lead - Large introductory text
export function TypographyLead({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"p">) {
  return (
    <p 
      className={cn(
        "text-muted-foreground text-xl",
        "navi-lead",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Large - Larger text
export function TypographyLarge({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"div">) {
  return (
    <div 
      className={cn(
        "text-lg font-semibold",
        "navi-large",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Small - Smaller text
export function TypographySmall({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"small">) {
  return (
    <small
      className={cn(
        "text-sm leading-none font-medium",
        "navi-small",
        className
      )}
      {...props}
    >
      {children}
    </small>
  );
}

// Muted - Subtle text
export function TypographyMuted({
  className,
  children,
  ...props
}: TypographyProps & React.ComponentProps<"p">) {
  return (
    <p 
      className={cn(
        "text-muted-foreground text-sm",
        "navi-muted",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Compound Typography component with all variants
export const Typography = {
  H1: TypographyH1,
  H2: TypographyH2,
  H3: TypographyH3,
  H4: TypographyH4,
  P: TypographyP,
  Blockquote: TypographyBlockquote,
  Table: TypographyTable,
  TableHeader: TypographyTableHeader,
  TableRow: TypographyTableRow,
  TableCell: TypographyTableCell,
  InlineCode: TypographyInlineCode,
  Lead: TypographyLead,
  Large: TypographyLarge,
  Small: TypographySmall,
  Muted: TypographyMuted,
};
