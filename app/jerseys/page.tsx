// app/jerseys/page.tsx

import GoBack from "@/components/go-back";
import React from "react";

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2>Check back soon for our jerseys section!</h2>
      <GoBack label="Return to Homepage" link="/" showIcon={false} />
    </div>
  );
}
