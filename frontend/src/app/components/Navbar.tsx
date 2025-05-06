'use client';
import { Button, ConnectBtn } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BsTwitterX } from "react-icons/bs";
import Link from "next/link";
import { IoMenu } from "react-icons/io5";
import { useConnect, useDisconnect, useAccount } from "wagmi";
import { injected } from '@wagmi/connectors'
import { ConnectWalletIcon, DisconnectWalletIcon } from "@/components/ui/walletIcon";
import i18next, { changeLanguage } from "i18next";
import { LanguageConfig } from "@/app/config/langConfig"
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { push } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const navRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const onChangeLanguage = (lang: any) => {
    if (lang) {
      const language = lang.language
      changeLanguage(lang.language);
      setSelectedLang(lang.language);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !navRef.current?.contains(event.target as Node) &&
        !actionRef.current?.contains(event.target as Node) &&
        !langRef.current?.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };


  }, []);

  const toggleLang = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLangOpen(!langOpen);
    setMobileMenuOpen(false);
  };

  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[2px] bg-[#1C1F2F]/60">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center transition-transform duration-300 hover:scale-110">
            <a href="/" className="flex items-center">
              <img src="/brand.webp" className="h-8 mr-3" alt="Logo" />
            </a>
          </div>

          {/* Everything else aligns to the right */}
          <div className="ml-auto flex items-center space-x-2">
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-6 mr-6">
              <Link href="/" className="nav-link">{t("home")}</Link>
              <Link href="/ranking" className="nav-link">{t("ranking")}</Link>
            </div>

            {/* Socials */}
            <div className="hidden md:flex mr-6">
              <SocialLink />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center">
              <div className="mr-2"> {/* Narrower gap */}
                <ConnectBtn />
              </div>

              <div className="mr-4"> {/* Wider gap */}
                <Button onClick={() => push("/create")} className="text-md text-white">
                  {t("createToken")}
                </Button>
              </div>

              <div className="relative w-8 h-8 ml-4">
                <button
                  onClick={toggleLang}
                  className="w-full h-full p-0 border-none bg-transparent cursor-pointer"
                >
                  <img
                    src="/lan.png"
                    alt="Language"
                    className="w-full h-full object-contain"
                  />
                </button>

                {langOpen && (
                  <div
                    ref={langRef}
                    className="fixed top-16 right-0 bg-[#1C1F2F]/95 p-2 rounded shadow-lg z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {LanguageConfig.map((lang) => (
                      <button
                        key={lang.language}
                        className="flex justify-between items-center w-full text-left px-2 py-1 hover:bg-[#2C2F40] text-white text-sm"
                        onClick={() => {
                          onChangeLanguage(lang);
                          setLangOpen(false);
                        }}
                      >
                        <span>{lang.name}</span>
                        {selectedLang == lang.language && (
                          <span className="text-[#8346FF] font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Toggles */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <IoMenu size={24} style={{ color: '#8346FF' }} />
              </button>

              {/* Mobile Wallet Action */}
              <button className="md:hidden" onClick={isConnected ? () => disconnect() : () => connect({ connector: injected() })}>
                {isConnected ? <DisconnectWalletIcon /> : <ConnectWalletIcon />}
              </button>

              <img
                src="/lan.png"
                alt="Language"
                className="w-5 h-5 cursor-pointer"
                onClick={toggleLang}
              />
            </div>

            {/* language options */}
            {langOpen && (
              <div
                ref={langRef}
                className="fixed top-16 right-0 w-40 bg-[#1C1F2F]/95 p-2 rounded shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {LanguageConfig.map((lang, index) => (
                  <button
                    key={index}
                    className="flex justify-between items-center w-full text-left px-2 py-1 hover:bg-[#2C2F40] text-white text-sm"
                    onClick={() => {
                      onChangeLanguage(lang);
                      setLangOpen(false);
                    }}
                  >
                    <span>{lang.name}</span>
                    {selectedLang == lang.language && (
                      <span className="text-[#8346FF] font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          ref={navRef}
          className="absolute top-16 right-4 bg-[#1C1F2F]/95 px-4 py-3 space-y-3 z-50 shadow-lg rounded min-w-max"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Nav Links */}
          <Link href="/" className="block nav-link">{t("home")}</Link>
          <Link href="/ranking" className="block nav-link">{t("ranking")}</Link>

          {/* Create Token */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              push("/create");
            }}
            disabled={!isConnected}
            className={cn(
              "block nav-link text-left w-full",
              !isConnected && "opacity-50 cursor-not-allowed"
            )}
          >
            {t("createToken")}
          </button>
        </div>
      )}

    </nav>
  );
}

const SocialLink = () => (
  <div className="flex items-center space-x-5">
    <a href="/tw" className="nav-link">
      <BsTwitterX />
    </a>
  </div>
);