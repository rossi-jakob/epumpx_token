import DynamicStaggeredGrid from "./masonary-card";

// Example usage
const MasonryGrid = () => {
  // Replace this with your actual image data
  const sampleImages = [
    { id: 1, src: "/sleeping.svg", aspectRatio: "3/4" },
    {
      id: 2,
      src: "/homepage1.svg",

      aspectRatio: "1/1",
    },
    { id: 3, src: "/homepage3.svg", aspectRatio: "4/5" },
    {
      id: 4,
      src: "/homepage3.svg",

      aspectRatio: "1/1",
    },
    {
      id: 5,
      src: "/create-left-2.svg",

      aspectRatio: "4/5",
    },
    {
      id: 6,
      src: "/homepage4.svg",

      aspectRatio: "4/5",
    },
    {
      id: 7,
      src: "/homepage5.svg",

      aspectRatio: "4/5",
    },
    {
      id: 8,
      src: "/homepage6.png",

      aspectRatio: "1/1",
    },
    {
      id: 9,
      src: "/homepage7.png",

      aspectRatio: "3/4",
    },
    {
      id: 10,
      src: "/homepage8.png",

      aspectRatio: "1/1",
    },
    {
      id: 11,
      src: "/homepage4.svg",

      aspectRatio: "1/1",
    },
    {
      id: 12,
      src: "/create-right-2.svg",

      aspectRatio: "1/1",
    },
  ];

  return <DynamicStaggeredGrid images={sampleImages} />;
};

export default MasonryGrid;
