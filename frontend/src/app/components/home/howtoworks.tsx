// components/HowItWorks.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export const HowItWorks = ({ onClose }: { onClose: () => void }) => {
    const [openSection, setOpenSection] = useState<'create' | 'trade' | 'listing' | null>('create');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const toggleSection = (section: typeof openSection) => {
        setOpenSection(prev => (prev === section ? null : section));
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center px-4">
            <div className="bg-[#1A1D2B] text-white p-6 rounded-[8px] max-w-xl w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-[#7037EF]">
                    <X />
                </button>

                <h2 className="text-2xl font-bold text-[#7037EF] mb-2">How it works</h2>
                <p className="text-gray-300 mb-4">
                    Launching your project on Four.meme requires no technical skills, takes only a few seconds.
                </p>

                <div className="aspect-video rounded overflow-hidden mb-2">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                        title="How it works video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <AccordionItem
                    title="Create Token"
                    isOpen={openSection === 'create'}
                    onClick={() => toggleSection('create')}
                >
                    <ol className="list-decimal ml-6 mt-2 space-y-1">
                        <li>
                            Click <span className="text-blue-400 font-medium">[Create Token]</span>
                        </li>
                        <li>Choose a name, symbol (ticker), and upload an image</li>
                        <li>Token is now created and tradable on the bonding curve</li>
                    </ol>
                </AccordionItem>

                <AccordionItem
                    title="Trade Token"
                    isOpen={openSection === 'trade'}
                    onClick={() => toggleSection('trade')}
                >
                    <p className="mt-2 text-gray-300">
                        Users can buy/sell your token directly from the bonding curve without needing liquidity pools.
                    </p>
                </AccordionItem>

                <AccordionItem
                    title="MudSwap Listing"
                    isOpen={openSection === 'listing'}
                    onClick={() => toggleSection('listing')}
                >
                    <p className="mt-2 text-gray-300">
                        1. 100% of the liquidity is then deposited in MudSwap and burned<br/>
                        2. Once bonding curve reaches 100% (approximately 8500 EPIX), the seeding process will begin
                    </p>
                </AccordionItem>
            </div>
        </div>
    );

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

type AccordionProps = {
    title: string;
    isOpen: boolean;
    onClick: () => void;
    children: React.ReactNode;
};

const AccordionItem = ({ title, isOpen, onClick, children }: AccordionProps) => (
    <div className="border border-gray-700 rounded mb-2">
        <button
            className="w-full flex justify-between items-center p-4 text-left text-white bg-gray-800 hover:bg-gray-700"
            onClick={onClick}
        >
            <span className="font-semibold">{title}</span>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isOpen && <div className="p-4 bg-gray-900">{children}</div>}
    </div>
);
