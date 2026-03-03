"use client";

import useUser from "@/hooks/useUser";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { SmartAvatar } from "../reusables/smart-avatar";
import { LuBell } from "react-icons/lu";
import { cn } from "@/lib/utils";
import AppLogo from "../reusables/app-logo";
import { useIsMobile } from "@/hooks/useMobile";

type Props = {
  isSidebarCollapsed?: boolean;
  showSidebar?: boolean; // New prop to determine if sidebar exists
};

const AuthHeader = ({ isSidebarCollapsed, showSidebar = false }: Props) => {
  const { user } = useUser();
  const isMobile = useIsMobile();

  return (
    <header
      className={cn(
        "h-16 sm:h-20 fixed top-0 z-50 backdrop-blur-3xl bg-background/80 supports-[backdrop-filter]:bg-background/80",
        // Adjust positioning based on sidebar presence
        showSidebar
          ? cn(
              "left-0 right-0", // Full width
              // Add left margin to account for sidebar width, just like main content
              !isMobile && (isSidebarCollapsed ? "ml-16" : "ml-64"),
            )
          : "left-0 right-0", // Full width when no sidebar
      )}
    >
      <div className="container relative flex justify-between items-center h-full">
        {!showSidebar && (
          <AppLogo logoSrc="/images/logo.png" width={50} height={50} />
        )}

        {!user ? (
          <Skeleton className="h-9 w-40 ml-8" />
        ) : (
          <div
            className={cn(
              "flex items-center space-x-4",
              // When sidebar exists, take full width to push content to the right
              showSidebar && "ml-auto",
            )}
          >
            <Link
              href="/notifications"
              className="h-9 w-9 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <LuBell size={16} />
            </Link>
            <SmartAvatar
              data={user}
              src={user.passport}
              getKey={(u) => u.email || u.id || `${u.lastname}${u.firstname}`}
              getName={(u) => u.firstname}
              getInitialsName={(u) => `${u.lastname} ${u.firstname}`}
              responsiveName
              className="bg-[#FAFBFC] pr-5 text-[#4E5D78] text-sm rounded-full hover:bg-[#F0F1F2] transition-colors"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default AuthHeader;
