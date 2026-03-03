import React from "react";
import Loader1 from "@/components/loaders/loader-1";
import { cn } from "@/lib/utils";

interface AccountNameDisplayProps {
  accountName: string;
  isResolving: boolean;
  error?: string | null;
  className?: string;
  nameClassName?: string;
}

export const AccountNameDisplay: React.FC<AccountNameDisplayProps> = ({
  accountName,
  isResolving,
  error,
  className = "",
  nameClassName = "",
}) => {
  // Debug logging to see what's being passed
  // console.log("AccountNameDisplay props:", { accountName, isResolving, error });

  if (!isResolving && !accountName && !error) {
    return null;
  }

  return (
    <div
      className={`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-sm z-10 ${className}`}
    >
      {isResolving ? (
        <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded shadow-sm">
          <Loader1 className="text-[#328BE0]" />
          <span className="text-[#94A2B3]">Resolving...</span>
        </div>
      ) : error ? (
        <span className="text-red-500 text-xs bg-white px-2 py-1 rounded shadow-sm">
          Failed
        </span>
      ) : accountName ? (
        <div className={cn("bg-transparent", nameClassName)}>
          <p className="font-medium text-[#39BD78]" title={accountName}>
            {accountName}
          </p>
        </div>
      ) : null}
    </div>
  );
};
