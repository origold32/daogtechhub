"use client";

import AppLogo from "../app-logo";
import SparklingSeparator from "@/public/images/sparkling-separator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useUser from "@/hooks/useUser";
import useAuth from "@/auth/use-auth";
import { TbMedicalCross } from "react-icons/tb";
import { IoFitnessOutline, IoLogOut } from "react-icons/io5";
import DashboardIcon from "../../public/images/dashboard-icon";
import FolderIcon from "../../public/images/folder-icon";
import { GrUserWorker } from "react-icons/gr";
import { PiPackage } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { useIsMobile } from "@/hooks/useMobile";

const studentNavItems = [
  { name: "Dashboard", href: "/student", icon: DashboardIcon },
  { name: "Appointments", href: "/student/appointments", icon: TbMedicalCross },
  {
    name: "Medical Records",
    href: "/student/medical-records",
    icon: IoFitnessOutline,
  },
  { name: "Profile", href: "/student/profile", icon: CgProfile },
  { name: "Logout", href: "#", icon: IoLogOut },
];

const staffNavItems = [
  { name: "Dashboard", href: "/staff", icon: DashboardIcon },
  {
    name: "Record Management",
    href: "/staff/record-management",
    icon: FolderIcon,
  },
  // { name: "Reporting", href: "/staff/reporting", icon: PiPackage },
  { name: "Staff Log", href: "/staff/staff-log", icon: GrUserWorker },
  { name: "Logout", href: "#", icon: IoLogOut },
];

type Props = {
  isCollapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export default function Sidebar({
  isCollapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const { user } = useUser();
  const { logout } = useAuth();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const navItems = user?.isStaff ? staffNavItems : studentNavItems;
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onMobileClose}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 h-full flex flex-col bg-[#121528] p-4 space-y-4 transition-all duration-300 z-50",
          isMobile
            ? mobileOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64"
            : isCollapsed
            ? "w-16"
            : "w-64"
        )}
      >
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center justify-center",
              isMobile ? "w-full" : !isCollapsed ? "w-full" : "hidden"
            )}
          >
            <AppLogo
              className="shrink-0"
              logoSrc="https://lasu.edu.ng/central_admission_clearance/student/images/logo.png"
            />
          </div>
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-[#1a1c2b] text-white transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          )}
        </div>

        {(!isCollapsed || isMobile) && <SparklingSeparator />}

        <div className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.name === "Logout") {
              return (
                <button
                  key={item.name}
                  onClick={() => logout("/login")}
                  className={cn(
                    "flex items-center w-full rounded-md font-semibold transition-colors group relative",
                    isCollapsed && !isMobile
                      ? "justify-center p-2"
                      : "py-3 px-4 space-x-3",
                    "text-[#A0AEC0] hover:bg-[#1a1c2b]"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon size={20} className="text-white" />
                  {(!isCollapsed || isMobile) && (
                    <span className="text-sm">Logout</span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md font-semibold transition-colors group relative",
                  isCollapsed && !isMobile
                    ? "justify-center p-2"
                    : active
                    ? "py-4 px-4 space-x-3"
                    : "py-3 px-4 space-x-3",
                  active
                    ? "bg-[#242637] text-white"
                    : "text-[#A0AEC0] hover:bg-[#1a1c2b]"
                )}
                title={isCollapsed ? item.name : ""}
              >
                <Icon
                  size={20}
                  className={cn(active ? "text-[#328BE0]" : "text-white")}
                />
                {(!isCollapsed || isMobile) && (
                  <span className="text-sm">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
