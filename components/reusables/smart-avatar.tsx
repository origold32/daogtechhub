import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getFallbackBgClassFromKey } from "@/lib/getFallbackBgClassFromKey";
import { extractFirstLetters } from "@/lib/text";
import { cn } from "@/lib/utils";

interface SmartAvatarProps<T = any> {
  data: T | undefined;
  src?: string;
  alt?: string;
  className?: string;
  getKey: (data: T) => string | undefined;
  getName?: (data: T) => string;
  getInitialsName?: (data: T) => string;
  showName?: boolean; // Always show name
  showInitials?: boolean; // Always show initials
  responsiveName?: boolean; // Show name on desktop, initials on mobile
  nameClassName?: string;
  initialsClassName?: string;
  fallbackTextClassName?: string;
  avatarSizeClassName?: string;
  upContent?: string | React.ReactNode;
  upContentClassName?: string;
  downContent?: string | React.ReactNode;
  downContentClassName?: string;
}

export function SmartAvatar<T = any>({
  data,
  src,
  alt = "avatar",
  className,
  getKey,
  getName = (d) => (d as any)?.firstName || (d as any)?.text || "",
  getInitialsName = (d) => (d as any)?.firstName || (d as any)?.text || "",
  showName = false,
  showInitials = false,
  responsiveName = false,
  nameClassName,
  initialsClassName,
  fallbackTextClassName,
  avatarSizeClassName,
  upContent,
  upContentClassName,
  downContent,
  downContentClassName,
}: SmartAvatarProps<T>) {
  const key = data ? getKey(data) : undefined;
  const displayName = data ? getName(data) : "";
  const initials = data ? extractFirstLetters(getInitialsName(data), 2) : "";
  const fallbackBgClass = getFallbackBgClassFromKey(key);

  const avatarElement = (
    <Avatar className={cn("shrink-0", avatarSizeClassName)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback
        className={cn(
          "text-white font-semibold",
          fallbackBgClass,
          fallbackTextClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (
    !showName &&
    !showInitials &&
    !responsiveName &&
    !upContent &&
    !downContent
  ) {
    return avatarElement;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {avatarElement}
      <div className="flex flex-col">
        {upContent && (
          <div className={cn("text-xs", upContentClassName)}>{upContent}</div>
        )}
        {(showName || showInitials || responsiveName) && (
          <div className="flex gap-2">
            {showName && !responsiveName && (
              <span
                className={cn(
                  "text-sm font-medium text-foreground",
                  nameClassName
                )}
              >
                {displayName}
              </span>
            )}
            {showInitials && !responsiveName && (
              <span
                className={cn(
                  "text-sm font-medium text-foreground",
                  initialsClassName
                )}
              >
                {initials}
              </span>
            )}
            {responsiveName && (
              <>
                <span
                  className={cn(
                    "text-sm font-medium text-foreground hidden md:inline",
                    nameClassName
                  )}
                >
                  {displayName}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium text-foreground md:hidden",
                    initialsClassName
                  )}
                >
                  {initials}
                </span>
              </>
            )}
          </div>
        )}
        {downContent && (
          <div className={cn("text-xs", downContentClassName)}>
            {downContent}
          </div>
        )}
      </div>
    </div>
  );
}
