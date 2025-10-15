import React from 'react';
import {
  HStack,
  Button,
  IconButton,
  Text,
  Select,
  Box,
  Flex
} from '@chakra-ui/react';
import {
  FiArrowRight, FiArrowLeft, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiMoreHorizontal
} from "react-icons/fi";

const Pagination = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  showPageSize = true,
  showTotal = true,
  ...props
}) => {
 
    const current_page = pagination?.current_page || 1;
    const total_pages = pagination?.total_pages || 1;
    const total_items = pagination?.total_items || 0;
    const page_size = pagination?.page_size || 6;
    const has_next = pagination?.has_next || false;
    const has_prev = pagination?.has_prev || false;
  

  console.log("Pagination props:", pagination);

  // Don't render if no pages or only one page
  if (total_pages <= 1 && !showPageSize && !showTotal) {
    return null;
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= total_pages && newPage !== current_page) {
      onPageChange?.(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    onPageSizeChange?.(newSize);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (total_pages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, current_page - 1);
      let end = Math.min(total_pages - 1, current_page + 1);
      
      // Adjust if at the beginning
      if (current_page <= 3) {
        end = 4;
      }
      
      // Adjust if at the end
      if (current_page >= total_pages - 2) {
        start = total_pages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < total_pages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (total_pages > 1) {
        pages.push(total_pages);
      }
    }
    
    return pages;
  };

  return (
    <Box {...props}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align="center"
        gap={4}
        width="full"
      >

        {/* Total Items */}
        {showTotal && total_items > 0 && (
          <Text fontSize="sm" color="gray.600">
           Showing page {current_page} of {total_pages} | {total_items} {total_items === 1 ? 'item' : 'items'}
          </Text>
        )}

        {/* Pagination Controls */}
        {(total_pages > 1 || showPageSize) && (
          <HStack spacing={1}>
            {/* Previous Button */}
            <IconButton
              variant="outline"
              size="sm"
              isDisabled={!has_prev}
              onClick={() => handlePageChange(current_page - 1)}
              aria-label="Previous page"
            >
              <FiArrowLeft />
            </IconButton>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <Text px={2} color="gray.500">
                    ...
                  </Text>
                ) : (
                  <Button
                    variant={page === current_page ? 'solid' : 'outline'}
                    colorScheme={page === current_page ? 'blue' : 'gray'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    minW="8"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}

            {/* Next Button */}
            <IconButton
              variant="outline"
              size="sm"
              isDisabled={!has_next}
              onClick={() => handlePageChange(current_page + 1)}
              aria-label="Next page"
            >
              <FiArrowRight />
            </IconButton>
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default Pagination;