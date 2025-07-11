import React, { Suspense } from "react";
import AddProductClient from "./AddProductClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddProductClient />
    </Suspense>
  );
}
