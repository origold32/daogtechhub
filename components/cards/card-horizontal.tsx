import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { ReactNode } from "react";

export interface CardHorizonProps {
  title: string;
  description?: string;
  link?: string;
  imageSrc: string;
  imageAlt?: string;
  className?: string;
  imgClassName?: string;
  containerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
  badge?: BadgeProps;
  children?: ReactNode;
}

const CardHorizon = (props: CardHorizonProps) => {
  const {
    title,
    description,
    link,
    imageSrc,
    imageAlt = "CardHorizon image", // Default alt text
    className = "",
    imgClassName = "",
    containerClassName = "",
    titleClassName = "",
    descriptionClassName = "",
    imageWidth = 192,
    imageHeight = 100,
    badge,
    children,
  } = props;

  const CardContent = () => (
    <Card
      className={cn(
        "flex flex-col md:flex-row md:items-stretch p-2 bg-white border border-gray-200 rounded-lg min-w-72 w-full md:min-w-[600px] hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ",
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        objectFit="cover"
        className={cn("w-full h-36 object-cover md:min-h-[200px] md:h-auto md:w-48 rounded-lg ", imgClassName)}
        width={imageWidth}
        height={imageHeight}
      />

      <div className={`flex flex-col flex-1 justify-center p-4 leading-normal ${containerClassName}`}>
        {badge ? <Badge size={"sm"} className="mb-2" {...badge} /> : null}
        <h5 className={` text-2xl font-bold tracking-tight text-gray-900 dark:text-white ${titleClassName}`}>{title}</h5>
        {description && <p className={` font-normal text-gray-700 dark:text-gray-400 ${descriptionClassName}`}>{description}</p>}
        {children}
      </div>
    </Card>
  );

  return link ? (
    <Link href={link}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
};

export default CardHorizon;
