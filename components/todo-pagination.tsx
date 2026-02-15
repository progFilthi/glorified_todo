"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { motion } from "motion/react";

interface TodoPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TodoPagination({
  page,
  totalPages,
  onPageChange,
}: TodoPaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(0);

      if (page > 2) pages.push("ellipsis");

      // Show pages around current
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 3) pages.push("ellipsis");

      // Always show last page
      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-4"
    >
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (page > 0) onPageChange(page - 1);
              }}
              className={`cursor-pointer select-none ${
                page === 0
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-accent"
              }`}
              href="#"
            />
          </PaginationItem>

          {/* Page Numbers */}
          {getPageNumbers().map((p, idx) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(p);
                  }}
                  isActive={p === page}
                  className="cursor-pointer select-none"
                  href="#"
                >
                  {p + 1}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages - 1) onPageChange(page + 1);
              }}
              className={`cursor-pointer select-none ${
                page >= totalPages - 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-accent"
              }`}
              href="#"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </motion.div>
  );
}
