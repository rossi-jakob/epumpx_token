'use client'
import Link from "next/link";
import { BsFacebook, BsInstagram, BsTwitterX } from "react-icons/bs";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const {t} = useTranslation();

  return (
    <footer className=" bg-[#282D44] py-6 component-edge-root">
      <div className="px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <a href="/" className="flex items-center">
              <img src="/logo.png" className="h-8 mr-3" alt="Logo" />
            </a>
            <p className="text-white text-xl mt-2">
              {t("unleashPower")}
              <br />
              {t("Digital")}
            </p>
          </div>

          <div className="flex flex-col  items-center">
            <nav className="flex space-x-6">
              <Link
                href="/board"
                className="text-sm text-gray-300 hover:text-white"
              >
                {t("home")}
              </Link>
              <Link
                href="/ranking"
                className="text-sm text-gray-300 hover:text-white"
              >
                {t("ranking")}
              </Link>
              {/* <Link
                href="/alpha"
                className="text-sm text-gray-300 hover:text-white"
              >
                Alpha
              </Link> */}
              {/* <Link
                href="/contact-us"
                className="text-sm text-gray-300 hover:text-white"
              >
                Contact Us
              </Link> */}
            </nav>
          </div>
        </div>
        <div className=" flex flex-1 justify-center  md:justify-end items-center space-x-2">
          {/* <a href="/fb" className="nav-link">
            <BsFacebook />
          </a> */}
          <a href="/tw" className="nav-link">
            <BsTwitterX />
          </a>
          {/* <a href="/ig" className="nav-link">
            <BsInstagram />
          </a> */}
        </div>

        <div className="mt-4 flex flex-1 justify-center  md:justify-end items-center text-white">
          {t("footer")}
        </div>
      </div>
    </footer>
  );
}
