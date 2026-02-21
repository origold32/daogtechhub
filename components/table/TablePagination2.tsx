import * as React from "react";
import { Pagination, PaginationContent, PaginationLink, PaginationEllipsis, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { cn } from "@/lib";

interface ITablePagination2Props {
  page: string | number;
  total: string | number;
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
  isFirst?: boolean;
  className?: string;
}

const TablePagination2: React.FunctionComponent<ITablePagination2Props> = ({ page, total, onNext, onPrev, className, ...props }) => {
  const firstPage = +page == 1;
  const lastPage = +page == +total;

  const onPrevPage = () => {
    if (!firstPage) {
      onPrev();
    }
  };
  const onNextPage = () => {
    if (!lastPage) {
      onNext();
    }
  };
  return (
    <Pagination className={cn("mt-6 flex items-center justify-between", className)} {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink className=" w-max px-2" href="#">
            Page: {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>of:</PaginationItem>
        <PaginationItem>
          <PaginationLink className="w-max px-2" href="#">
            {total}
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
      {/* ------------------------- */}
      <PaginationContent>
        <PaginationItem>
          <PaginationLink role="link" aria-disabled={firstPage} onClick={onPrevPage} href={!firstPage ? "#" : undefined}>
            <ChevronLeft className=" text-black/80" />
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationLink className=" border" href="#">
            {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink role="link" aria-disabled={lastPage} onClick={onNextPage} href={!lastPage ? "#" : undefined}>
            <ChevronRight className=" text-black/80" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination2;
