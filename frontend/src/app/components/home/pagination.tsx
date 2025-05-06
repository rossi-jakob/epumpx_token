import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationComponent({
  totalItems,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange
}: PaginationProps) {
  const [pages, setPages] = useState<(number | string)[]>([]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Generate page numbers array with ellipsis
  useEffect(() => {
    const generatePageNumbers = () => {
      const pageNumbers: (number | string)[] = [];
      
      if (totalPages <= 7) {
        // If 7 pages or less, show all page numbers
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Always show first page
        pageNumbers.push(1);
        
        // Calculate middle pages to show
        if (currentPage <= 3) {
          // If current page is in first segment
          pageNumbers.push(2, 3, 4, '...', totalPages - 1);
        } else if (currentPage >= totalPages - 2) {
          // If current page is in last segment
          pageNumbers.push('...', totalPages - 3, totalPages - 2, totalPages - 1);
        } else {
          // If current page is in middle segment
          pageNumbers.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
        }
        
        // Always show last page
        pageNumbers.push(totalPages);
      }
      
      setPages(pageNumbers);
    };
    
    generatePageNumbers();
  }, [currentPage, totalPages]);
  
  // Handle navigation
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  // Handle previous and next
  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };
  
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            className={`w-8 h-8 rounded-sm border-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Previous</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>

          {pages.map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === 'number' ? (
                <Button
                  variant="outline"
                  className={`w-8 h-8 p-0 rounded-sm ${
                    page === currentPage ? 'border-[#8346FF]' : 'border-gray-700'
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0 rounded-sm border-gray-700"
                  disabled
                >
                  ...
                </Button>
              )}
            </React.Fragment>
          ))}

          <Button
            variant="outline"
            className={`w-8 h-8 p-0 rounded-sm border-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
}