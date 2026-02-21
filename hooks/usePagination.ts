// hooks/use-pagination.ts

export type PaginationPage = number | "ellipsis";

export const usePagination = ({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}): PaginationPage[] => {
  const pages: PaginationPage[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
    } else if (currentPage > totalPages - 4) {
      pages.push(1, "ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages
      );
    }
  }

  return pages;
};
