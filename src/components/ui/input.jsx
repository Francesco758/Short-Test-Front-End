import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-gray-700 bg-[#000000] px-4 py-2.5 text-sm !text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{ color: "#ffffff" }}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
