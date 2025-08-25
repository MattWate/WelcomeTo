import React from "react";

const base = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm transition";
const variants = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300",
  outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
};
const sizes = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

export default function Button({ variant = "primary", size = "md", className = "", ...props }) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}
