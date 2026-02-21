// components/FileIcon.tsx
"use client";

import { FiImage, FiFileText, FiFile } from "react-icons/fi";
import { FaRegFilePdf, FaRegFileWord, FaRegFileExcel } from "react-icons/fa";
import { fileTextColors } from "@/lib/text";

type FileIconProps = {
  url: string;
  size?: number;
  className?: string;
};

const getHashFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const getDeterministicColor = (input: string) => {
  const hash = getHashFromString(input);
  const index = Math.abs(hash) % fileTextColors.length;
  return fileTextColors[index];
};

const getFileIcon = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return FiImage;
    case "pdf":
      return FaRegFilePdf;
    case "doc":
    case "docx":
      return FaRegFileWord;
    case "xls":
    case "xlsx":
      return FaRegFileExcel;
    case "txt":
    case "md":
      return FiFileText;
    default:
      return FiFile;
  }
};

export default function FileIcon({ url, size = 20, className }: FileIconProps) {
  const Icon = getFileIcon(url);
  const colorClass = className || getDeterministicColor(url);

  return <Icon size={size} className={colorClass} />;
}
