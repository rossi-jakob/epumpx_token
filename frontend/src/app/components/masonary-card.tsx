"use client";
import React from "react";
type Image = { id: number; src: string };

const DynamicStaggeredGrid = ({
  //only for 3 columns
  images,
  dynamicMargin = ["mt-10", "mt-20", ""],
}: {
  images: Image[];
  dynamicMargin?: string[];
}) => {
  const distributeImages = () => {
    const columns: Image[][] = [[], [], []];

    // Distribute images across the three columns
    images.forEach((image: Image, index: number) => {
      const columnIndex = index % 3;
      columns[columnIndex].push(image);
    });

    return columns;
  };

  const columns = distributeImages();

  return (
    <div className={`flex  w-[400px] gap-4`}>
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={`flex-1 flex flex-col gap-4  ${dynamicMargin[columnIndex]} `}
        >
          {column.map((image: Image) => (
            <div key={image.id}>
              <img
                key={image?.id}
                src={image?.src}
                className=" object-contain"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DynamicStaggeredGrid;
