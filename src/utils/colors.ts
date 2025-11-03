import { NotionColor } from "../types";

export const notionColors: Record<NotionColor, { bg: string; text: string; border: string }> = {
  gray: { bg: "bg-[#EBECED]", text: "text-[#787774]", border: "border-[#D3D3D3]" },
  brown: { bg: "bg-[#F4EEEE]", text: "text-[#9F6B53]", border: "border-[#E9DDDD]" },
  orange: { bg: "bg-[#FAEBDD]", text: "text-[#D9730D]", border: "border-[#F5E0CC]" },
  yellow: { bg: "bg-[#FBF3DB]", text: "text-[#CB912F]", border: "border-[#F7EBCA]" },
  green: { bg: "bg-[#EDF3EC]", text: "text-[#448361]", border: "border-[#DFE9DD]" },
  blue: { bg: "bg-[#E7F3F8]", text: "text-[#337EA9]", border: "border-[#D3E5EF]" },
  purple: { bg: "bg-[#F6F3F9]", text: "text-[#9065B0]", border: "border-[#E9E3EF]" },
  pink: { bg: "bg-[#FAF1F5]", text: "text-[#C14C8A]", border: "border-[#F5E1EC]" },
  red: { bg: "bg-[#FBEAEA]", text: "text-[#D44C47]", border: "border-[#F5DADA]" },
};

export const getNotionColor = (color: NotionColor, opacity: number = 100) => {
  const colors = notionColors[color];
  return {
    ...colors,
    bgWithOpacity: `${colors.bg} opacity-${opacity}`,
  };
};
