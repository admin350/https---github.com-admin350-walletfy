import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
    value: number | string
    onValueChange: (value: number | undefined) => void
    currencySymbol?: string
  }
>(({ className, value, onValueChange, currencySymbol = "$", ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState("")

  React.useEffect(() => {
    let formattedValue = "";
    if (typeof value === 'number') {
      formattedValue = `${currencySymbol} ${new Intl.NumberFormat('es-CL').format(value)}`;
    } else if (typeof value === 'string') {
        const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
        if(!isNaN(numericValue)) {
          formattedValue = `${currencySymbol} ${new Intl.NumberFormat('es-CL').format(numericValue)}`;
        }
    }
    setDisplayValue(formattedValue);
  }, [value, currencySymbol])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const numericValue = rawValue.replace(/[^0-9]/g, '')
    const number = numericValue ? parseInt(numericValue, 10) : undefined

    onValueChange(number);
    
    const formatted = number ? `${currencySymbol} ${new Intl.NumberFormat('es-CL').format(number)}` : ''
    setDisplayValue(formatted)
  }

  return (
    <input
      type="text"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={displayValue}
      onChange={handleChange}
      ref={ref}
      {...props}
    />
  )
})
CurrencyInput.displayName = "CurrencyInput"


export { Input, CurrencyInput }
