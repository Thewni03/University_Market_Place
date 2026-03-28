import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const SelectContext = createContext(null);

const Select = ({ value: controlledValue, defaultValue = "", onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [labels, setLabels] = useState({});
  const rootRef = useRef(null);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const setValue = useCallback((nextValue, nextLabel) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(nextValue);
    }
    if (nextLabel) {
      setLabels((prev) => ({ ...prev, [nextValue]: nextLabel }));
    }
    onValueChange?.(nextValue);
  }, [controlledValue, onValueChange]);

  const ctx = useMemo(
    () => ({ value, setValue, open, setOpen, labels, setLabels, rootRef }),
    [value, setValue, open, labels]
  );

  return (
    <SelectContext.Provider value={ctx}>
      <div ref={rootRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectGroup = ({ children }) => <div>{children}</div>;

const SelectValue = ({ placeholder }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) return <span className="text-muted-foreground">{placeholder || "Select"}</span>;

  const label = ctx.labels[ctx.value] || "";
  return <span className={cn(!label && "text-muted-foreground")}>{label || placeholder || "Select"}</span>;
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const ctx = useContext(SelectContext);

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      onClick={() => ctx?.setOpen(!ctx.open)}
      {...props}
    >
      <span className="line-clamp-1">{children}</span>
      <ChevronDown className="h-4 w-4 opacity-60" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const ctx = useContext(SelectContext);
  if (!ctx?.open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const ctx = useContext(SelectContext);
  const isSelected = ctx?.value === value;
  const labelText = typeof children === "string" ? children : undefined;

  useEffect(() => {
    if (!ctx || !labelText) return;
    ctx.setLabels((prev) => (prev[value] === labelText ? prev : { ...prev, [value]: labelText }));
  }, [ctx, value, labelText]);

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent/50",
        className
      )}
      onClick={() => {
        ctx?.setValue(value, labelText);
        ctx?.setOpen(false);
      }}
      {...props}
    >
      <span>{children}</span>
      {isSelected ? <Check className="h-4 w-4" /> : null}
    </button>
  );
});
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("my-1 h-px bg-muted", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectScrollUpButton = ({ children }) => children || null;
const SelectScrollDownButton = ({ children }) => children || null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
