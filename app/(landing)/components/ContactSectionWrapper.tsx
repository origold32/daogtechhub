"use client";
import { forwardRef } from "react";
import { ContactSection } from "./ContactSection";

const ContactSectionWrapper = forwardRef<HTMLElement>((props, ref) => (
  <ContactSection {...props} ref={ref} />
));
ContactSectionWrapper.displayName = "ContactSectionWrapper";
export default ContactSectionWrapper;
