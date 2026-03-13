import utils from "@/lib/utils";

const { cn } = utils;

function Alert({ className, ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        "relative grid w-full grid-cols-[0_1fr] items-start gap-[20px] rounded-lg border px-4 py-3 text-sm shadow-sm [&>svg]:size-4 [&>svg]:translate-y-0.5 justify-center",
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return <h5 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }) {
  return <div className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
