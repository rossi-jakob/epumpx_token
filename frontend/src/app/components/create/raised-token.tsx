'use client'
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { raisedTokens, tags } from "./constant";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const RaisedToken = () => {
  const [selectedTags, setSelectedTags] = useState<number[]>([1])
  const {t} = useTranslation()

  const toggleTag = (tag: number) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  return (
    <div className="flex flex-row items-start justify-between">
      <div className="w-[50%]">
        <Label className="block text-white font-bold mb-4">{t("raisedToken")}</Label>
        <div className="flex gap-2 flex-wrap">
          {raisedTokens.map((token, index) => (
            <div
              key={token.id}
              onClick={() => toggleTag(token.id)}
              className={cn(
                `aspect-square rounded-2xl flex items-center justify-center text-2x p-1 h-18 w-18 cursor-pointer `,
                {
                  "bg-[#161616] ": !selectedTags.includes(token.id),
                  "bg-linear-to-r from-[#AE96E0] to-[#A590D0]":
                    selectedTags.includes(token.id),
                }
              )}
            >
              <img
                src={token.image}
                alt="Token"
                className="h-8 w-8 object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {/* <div className="w-[50%]">
        <Label className="block text-white mb-4 text-md font-bold">Tags</Label>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag, index) => (
            <Button
              key={tag}
              // onClick={() => toggleTag(tag)}
              variant={index === 0 ? "default" : "outline"}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div> */}
    </div>
  );
};
