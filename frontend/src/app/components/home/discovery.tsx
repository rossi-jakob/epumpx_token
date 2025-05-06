"use client";
import React, { useState } from "react";
import TokenCard from "./token-card";
import PaginationComponent from "./pagination";

export default function DiscoverTags({ allTokenInfoArray } : any) {
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this number based on your preference
  const totalItems = allTokenInfoArray.length;

  // Get current tokens for the page
  const indexOfLastToken = currentPage * itemsPerPage;
  const indexOfFirstToken = indexOfLastToken - itemsPerPage;
  const currentTokens = allTokenInfoArray.slice(indexOfFirstToken, indexOfLastToken);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-[#282D44] py-12 sm:px-6 lg:px-8 component-edge-root">
      <div className="container mx-auto">
        {/* Token Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
          {currentTokens.map((tokenInfo : any, index: number) => {
            // Log the token object at the current index
            return <TokenCard key={index} tokenInfo={tokenInfo} />; // ✅ Pass full object
          })}
        </div>
        <div>
          <PaginationComponent
            totalItems={totalItems}
            itemsPerPage={10}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
