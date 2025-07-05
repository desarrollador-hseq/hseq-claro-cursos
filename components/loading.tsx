

import { Loader2 } from "lucide-react";

export const Loading = () => {
  return (
    <div className="w-full h-full flex justify-center items-center min-h-screen bg-slate-100">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />

    </div>
  )
}

