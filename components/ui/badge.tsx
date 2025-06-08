import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full bg-white border px-2.5 py-1.5 text-sm font-normal w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2 aria-invalid:ring-destructive/15 dark:aria-invalid:ring-destructive/25 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 bg-gray-100 text-gray-700 [a&]:hover:bg-gray-200 [a&]:hover:border-gray-400",
        secondary:
          "border-transparent bg-gray-50 text-gray-600 [a&]:hover:bg-gray-100 dark:bg-gray-900/50 dark:text-gray-400 dark:[a&]:hover:bg-gray-800/50",
        destructive:
          "border-transparent bg-red-25 text-red-500 [a&]:hover:bg-red-50 focus-visible:ring-red-100 dark:bg-red-950/30 dark:text-red-400 dark:[a&]:hover:bg-red-900/30",
        outline:
          "text-gray-500 border-none bg-transparent [a&]:hover:bg-gray-50 [a&]:hover:text-gray-700 [a&]:hover:border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
