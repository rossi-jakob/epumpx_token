export const BottomControl = () => {
  return (
    <div className="border-t-4 border-gray-700 p-4 flex items-center justify-between">
      <div className="flex space-x-4 items-center">
        <button className="px-3 py-1 text-sm  text-gray-400">1d</button>
        <button className="px-3 py-1 text-sm  text-gray-400">4h</button>
        <button className="px-3 py-1 text-sm  text-gray-400">1h</button>
        <span className="  text-gray-400">|</span>
        <button className="px-2 py-1 text-sm rounded  text-gray-400">
          <img
            src="/chart-calender.svg"
            alt="chart-calender"
            className="w-10"
          />
        </button>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-400">
        <span>05:45:22 UTC</span>
        <span>|</span>
        <button className="hover:text-white">%</button>
        <button className="hover:text-white">log</button>
        <button className="text-green-400">auto</button>
      </div>
    </div>
  );
};
