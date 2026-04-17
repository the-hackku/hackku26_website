"use client";

import type { ExtendedRecordMap } from "notion-types";
import { NotionRenderer } from "react-notion-x";
import Link from "next/link";
import "react-notion-x/src/styles.css";

export default function NotionPage({ recordMap }: { recordMap: ExtendedRecordMap }) {
  return (
    <NotionRenderer 
      recordMap={recordMap} 
      fullPage={true}
      darkMode={false}
      components={{
        nextLink: Link,
      }}
      disableHeader={true}
    />
  )
}
