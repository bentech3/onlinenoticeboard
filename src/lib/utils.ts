import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDepartmentColor(departmentName?: string | null): string {
  if (!departmentName) return 'bg-slate-400';
  
  const name = departmentName.toLowerCase();
  if (name.includes('ict') || name.includes('computer')) return 'bg-blue-600';
  if (name.includes('finance') || name.includes('accounting')) return 'bg-emerald-600';
  if (name.includes('exam')) return 'bg-rose-600';
  if (name.includes('academic')) return 'bg-indigo-600';
  if (name.includes('student')) return 'bg-amber-600';
  if (name.includes('admin')) return 'bg-violet-600';
  if (name.includes('library')) return 'bg-cyan-600';
  if (name.includes('registry')) return 'bg-orange-600';
  
  return 'bg-primary';
}
