import { ChevronDown } from "lucide-react";
import { ImRedo, ImUndo } from "react-icons/im";
import { MdCandlestickChart } from "react-icons/md";
import { TbMathFunction } from "react-icons/tb";

export const ChartHeader = () => {
  return (
    <div className="border-b-4 border-gray-700 p-4 flex items-center justify-between ">
      <div className="flex items-center space-x-4">
        {/* Time intervals */}
        <div className="flex space-x-2">
          <button className="px-2 py-1 text-sm text-gray-400">1m</button>
          <button className="px-2 py-1 text-sm  text-gray-400 ">5m</button>
          <button className="px-2 py-1 text-sm  text-gray-400">15m</button>
          <button className="px-2 py-1 text-sm  text-gray-400 ">1h</button>
          <button className="px-2 py-1 text-sm  text-gray-400 ">4h</button>
          <button className="px-2 py-1 text-sm flex items-center space-x-1  text-gray-400">
            D<ChevronDown size={16} />
          </button>
        </div>

        {/* Chart type and indicators */}
        <div className="flex items-center space-x-2">
          <button className="px-2 py-1 text-sm  text-gray-400  flex items-center gap-3">
            <span className="text-gray-400">|</span>{" "}
            <MdCandlestickChart size={20} />{" "}
            <span className="text-gray-400">|</span>
          </button>
          <button className="py-1 text-sm  text-gray-400 flex items-center space-x-2">
            <TbMathFunction size={16} />
            <span>Indicators</span>
            <span className="text-gray-400">|</span>
          </button>
        </div>

        <button className=" py-1 text-sm  flex items-center space-x-2">
          <ImUndo size={16} />
        </button>
        <button className="py-1 text-sm   text-gray-400 flex items-center space-x-2">
          <ImRedo size={16} />
        </button>
      </div>

      {/* Right side tools */}
      <div className="flex items-center space-x-1">
        <button className="text-gray-400 hover:text-white">
          <img src="/chart-search.svg" alt="chart-search" className="w-8" />
        </button>
        <button className="text-gray-400 hover:text-white">
          <img src="/setting-chart.svg" alt="setting-chart" className="w-8" />
        </button>
        <button className="text-gray-400 hover:text-white">
          <img src="/zoom-chart.svg" alt="setting-chart" className="w-8" />
        </button>
        <button className="text-gray-400 hover:text-white">
          <img src="/camera-chart.svg" alt="setting-chart" className="w-8" />
        </button>
      </div>
    </div>
  );
};
