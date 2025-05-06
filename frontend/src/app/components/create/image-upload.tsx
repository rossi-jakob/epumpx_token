'use client'
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

const PINATA_API_KEY = "168a64fa92226270cf8d";
const PINATA_SECRET_API_KEY = "7129eac52a098d6a2dc228e22a89bf3f727aa6ac658d5564a04ca28805770c77";

// Define props interface with onImageUploaded callback function
interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

export const ImageUpload = ({ onImageUploaded }: ImageUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {t} = useTranslation()

  async function uploadToPinata(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "pinata_api_key": PINATA_API_KEY,
          "pinata_secret_api_key": PINATA_SECRET_API_KEY
        }
      });

      if (response.status === 200) {
        const cid = response.data.IpfsHash;
        const strCID = `https://gateway.pinata.cloud/ipfs/${cid}`;
        return strCID;
      } else {
        toast.error('Upload failed.');
      }
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      return "";
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const cidString = await uploadToPinata(file);
      onImageUploaded(cidString?cidString:"");
      setSelectedImage(URL.createObjectURL(file));
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex justify-center items-center gap-10">
      <div className="relative w-32 h-32 bg-gray-800/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800/70 transition-colors">
        {selectedImage ? (
          <img src={selectedImage} alt={t("selected")} className="rounded-full w-full h-full object-cover" />
        ) : (
          <img src="/image-preview.svg" alt="Token" />
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <div className="text-center">
        <Button 
          className="text-white px-4 py-4 font-medium w-[90%]" 
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? t("uploading") : t("selectMedia")}
        </Button>
        <p className="text-gray-400 text-sm mt-2">
          [jpg / png / webp / gif] (&lt; 5MB)
        </p>
        {selectedImage && (
          <p className="text-sm mt-2 break-all text-green-500">
            {t("uploadSuccess")}
          </p>
        )}
      </div>
    </div>
  );
};