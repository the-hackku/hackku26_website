import { NotionAPI } from "notion-client";
import NotionPage from "@/components/NotionPage";

const PAGE_ID = "Venue-Map-Parking-33a9e50fddb580a79f8cef6a95035858";
const notion = new NotionAPI();

export default async function TestPage() {
  const recordMap = await notion.getPage(PAGE_ID);
  return (
    <div className="py-8">
      <NotionPage recordMap={recordMap} />
    </div>
  )
}

