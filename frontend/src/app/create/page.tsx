"use client";
import React from "react";

import GradientEllipse from "../components/gradient-ellipsis";

import { CreateForms } from "../components/create/create-forms";
import { CreateFloatingImage } from "../components/create/floating-image";

export default function CreateToken() {
  return (
    <div className="min-h-screen bg-[#282D44] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden component-edge-root">
      <GradientEllipse
        position="top-center"
        width="25%"
        height="30%"
        opacity={0.8}
        color="#1E99A299"
        blur="60px"
        zIndex={20}
      />
      <CreateFloatingImage />

      <div className="max-w-6xl mx-auto">
        {" "}
        <CreateForms />
      </div>
    </div>
  );
}
