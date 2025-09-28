import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
    const formatValue = (num: number | string) => {
      const numericValue = typeof num === 'string' ? parseFloat(num.replace(/[^0-9]/g, '')) : num;
      if (isNaN(numericValue)) {
        return ""
      }
      return `${currencySymbol} ${new Intl.NumberFormat('es-CL').format(numericValue)}`
    }
    setDisplayValue(formatValue(value))
  }, [value, currencySymbol])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const numericValue = rawValue.replace(/[^0-9]/g, '')
    const number = numericValue ? parseInt(numericValue, 10) : undefined

    const formatted = number ? `${currencySymbol} ${new Intl.NumberFormat('es-CL').format(number)}` : ''
    setDisplayValue(formatted)
    onValueChange(number)
  }

  return (
    <input
      type="text"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
