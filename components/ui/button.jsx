import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import utils from "@/lib/utils";

const { cn } = utils;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary shadow hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({ className, variant, size, asChild = false, style, ...props }) {
  const Comp = asChild ? Slot : "button";
  const resolvedVariant = variant || "default";
  const resolvedStyle = resolvedVariant === "default" ? { color: "var(--primary-foreground)", ...style } : style;

  return <Comp className={cn(buttonVariants({ variant, size, className }))} style={resolvedStyle} {...props} />;
}

export { Button, buttonVariants };
