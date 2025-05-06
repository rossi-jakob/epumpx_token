import React from "react";
import { TradingChart } from "./trading-chart";
import { ChartSidebar } from "./chart/sidebar";
import { ChartHeader } from "./chart/header";
import { BottomControl } from "./chart/bottom-control";

function TokenChart() {
  return (
    <div className="bg-[#1B2028] text-white flex flex-col md:flex-row w-full min-w-0 ">
      {/* Sidebar - collapses on small screens if needed */}
      <div className="hidden md:block">
        <ChartSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="hidden md:block">
          <ChartHeader />
        </div>

        {/* Main Chart - Constrained to prevent overflow */}
        <div className="p-4 w-full overflow-auto scrollbar-container ">
          <div className="min-w-[500px]">
            {" "}
            <TradingChart />
          </div>
        </div>

        {/* Bottom Controls */}
        <BottomControl />
      </div>
    </div>
  );
}

export default TokenChart;
