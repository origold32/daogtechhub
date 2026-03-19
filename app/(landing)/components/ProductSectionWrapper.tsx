"use client";
import { forwardRef } from "react";
import { ProductSection } from "./ProductSection";
import type { ComponentProps } from "react";

// Wrapper to allow dynamic() import of a forwardRef component
const ProductSectionWrapper = forwardRef<HTMLElement, ComponentProps<typeof ProductSection>>(
  (props, ref) => <ProductSection {...props} ref={ref} />
);
ProductSectionWrapper.displayName = "ProductSectionWrapper";
export default ProductSectionWrapper;
