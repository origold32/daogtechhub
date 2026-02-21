"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import useUser from "@/hooks/useUser";
import { FaRegCalendarPlus } from "react-icons/fa6";
import { IoFitnessOutline } from "react-icons/io5";
import { FaUserEdit } from "react-icons/fa";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import DateFormatterToText from "@/components/date-formatter-to-text";

export default function Page() {
  const { user } = useUser();
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const actions = [
    {
      action: "Schedule Appointment",
      link: "/student/appointments",
      icon: FaRegCalendarPlus,
    },
    {
      action: "View Medical Records",
      link: "/student/medical-records",
      icon: IoFitnessOutline,
    },
    {
      action: "Update Profile",
      link: "/student/profile",
      icon: FaUserEdit,
    },
  ];

  const announcements = [
    {
      title: "Vaccination Campaign",
      content: {
        description:
          "Annual flu vaccination campaign is now active. Schedule your vaccination appointment today.",
        date: "2002-08-10", // use ISO-like for safe parsing
        location: "Health Center, Room 101",
      },
      decoration: "bg-[#D1ECF1] text-[#0C5460]",
    },
    {
      title: "Health Advisory",
      content: {
        description:
          "There has been an increase in cases of seasonal allergies. If you experience symptoms, please visit the Medical Centre.",
      },
      decoration: "bg-[#FFF3CD] text-[#856404]",
    },
    {
      title: "Wellness Program",
      content: {
        description:
          "Join our wellness program for 100 Level students. Learn stress management techniques and healthy lifestyle habits.",
        date: "2025-09-05",
        datePrefix: "Starting:",
        info: "Register at the Medical Centre",
      },
      decoration: "bg-[#D4EDDA] text-[#155724]",
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="flex items-center gap-2 md:text-2xl font-semibold text-[#040404]">
              Welcome{" "}
              {user?.lastname && user?.firstname && user?.middlename
                ? `${user.lastname} ${user.firstname} ${user.middlename}`
                : "Student"}
              !
            </h1>
            <p className="text-sm text-[#475367]">
              Today’s a great day, we hope you’re taking good care of your
              health 😊
            </p>
          </div>

          <div className="flex items-center gap-4 border border-[#E4E7EC] rounded-md px-4 py-2">
            <div className="rounded-full p-2 bg-[#F0F2F5] text-[#344054]">
              <Calendar size={16} />
            </div>

            <div className="flex md:flex-col md:space-y-1 items-center space-x-4 md:space-x-0">
              <p className="text-xs text-[#475467]">Today&apos;s Date</p>
              <p className="font-semibold text-[#040404] text-sm">{today}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 w-full bg-[#121528] p-2 text-white">
          {actions.map((act, idx) => (
            <Link
              href={act.link}
              key={idx}
              className="flex flex-col items-center hover:text-[#328BE0]"
            >
              {act.icon && <act.icon className="h-6 w-6" />}
              <p title={act.action} className="hidden md:block">
                {act.action}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[70vh] mt-6 pb-20 md:pb-0">
        <div className="flex flex-col space-y-4">
          <Card className="space-y-4 bg-white">
            {announcements.map((anc, idx) => {
              const { description, date, datePrefix, location, info } =
                anc.content;

              const hasExtras = date || location || info;

              return (
                <div key={idx} className={cn("p-4 space-y-2", anc.decoration)}>
                  <h4 className="font-bold">{anc.title}</h4>
                  {description && <p>{description}</p>}

                  {hasExtras && <Separator className="w-full bg-[#9A9A9A]" />}

                  {hasExtras && (
                    <p className="text-sm">
                      {date && (
                        <>
                          <DateFormatterToText
                            date={date}
                            prefix={datePrefix || "Date:"}
                            className="inline"
                          />{" "}
                        </>
                      )}

                      {location
                        ? `| Location: ${location}`
                        : info
                        ? `| ${info}`
                        : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      </ScrollArea>
    </>
  );
}
