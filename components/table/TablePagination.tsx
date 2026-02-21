import * as React from "react";
import { Pagination, PaginationContent, PaginationLink, PaginationEllipsis, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface ITablePaginationProps {
  page: string | number;
  total: string | number;
  onNext: () => void;
  onPrev: () => void;
  isLast?: boolean;
  isFirst?: boolean;
  className?: string;
}

const TablePagination: React.FunctionComponent<ITablePaginationProps> = (props) => {
  return (
    <Pagination className={cn("mt-6", props.className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={props.onPrev} href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">{props.page}</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext onClick={props.onNext} href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;
