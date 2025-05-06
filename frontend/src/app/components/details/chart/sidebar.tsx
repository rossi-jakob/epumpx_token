import { Ruler, Type } from "lucide-react";
import { FaRegSmile } from "react-icons/fa";
import { RiBrushLine } from "react-icons/ri";

export const ChartSidebar = () => {
  return (
    <div className="w-12 bg-[#1B2028] border-r-4 border-gray-700 flex flex-col items-center py-2 space-y-4 mt-17">
      <button className="p-2 text-green-500  rounded w-14">
        <img src="/chart-plus.svg" alt="chart-plus" className="" />
      </button>
      <button className="p-2 text-gray-400  hover:text-white rounded w-14">
        <img src="/chart-bolt.svg" alt="chart-join" className="" />
      </button>
      <button className="p-2 text-gray-400  hover:text-white rounded w-14">
        <img src="/chart-menu.svg" alt="chart-menu" className="w-full" />
      </button>
      <button className="p-2 text-gray-400  hover:text-white rounded w-14">
        <img src="/chart-react.svg" alt="chart-react" className="w-full" />
      </button>
      <button className="p-2 text-gray-400 ] hover:text-white rounded w-14">
        <img src="/chart-setting2.svg" alt="chart-react" />
      </button>
      <button className="p-2 text-gray-400  rounded">
        <RiBrushLine size={25} />
      </button>

      <button className="p-2 text-gray-400   rounded">
        <Type size={25} />
      </button>
      <button className="p-2 text-gray-400   rounded">
        <FaRegSmile size={25} />
      </button>

      <button className="p-2 text-gray-400  rounded">
        <Ruler size={25} />
      </button>
    </div>
  );
};
