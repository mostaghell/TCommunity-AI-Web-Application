import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface MessageSkeletonProps {
  role: "user" | "assistant"
}

export default function MessageSkeleton({ role }: MessageSkeletonProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex items-start gap-3 max-w-[85%]", isUser && "flex-row-reverse")}>
        <Skeleton
          className={cn(
            "h-10 w-10 rounded-full",
            isUser ? "bg-[#5a1c3a]" : "bg-[#5a1c1a]",
            "border-2",
            isUser ? "border-[#d63384]/30" : "border-[#c2185b]/30",
          )}
        />

        <div
          className={cn(
            "rounded-2xl p-5",
            isUser ? "bg-[#5a1c3a]/50 rounded-tr-none" : "bg-[#5a1c1a]/50 rounded-tl-none",
          )}
        >
          <div className="space-y-3">
            <Skeleton className="h-4 w-[250px] bg-[#a287bc]/20" />
            <Skeleton className="h-4 w-[180px] bg-[#a287bc]/20" />
            {!isUser && <Skeleton className="h-4 w-[120px] bg-[#a287bc]/20" />}
          </div>

          <div className="mt-3">
            <Skeleton className="h-3 w-[100px] bg-[#a287bc]/10" />
          </div>

          {/* Decorative elements */}
          <div
            className={cn(
              "absolute w-3 h-3 rotate-45",
              isUser ? "bg-[#5a1c3a]/50 top-4 right-[-6px]" : "bg-[#5a1c1a]/50 top-4 left-[-6px]",
            )}
          />
        </div>
      </div>
    </div>
  )
}
