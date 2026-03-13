"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import utils from "@/lib/utils";

const { cn } = utils;

const Label = React.forwardRef(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn("text-sm font-semibold leading-none text-foreground", className)}
      {...props}
    />
  );
});

export { Label };
