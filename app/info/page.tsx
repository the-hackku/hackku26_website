import { NotionAPI } from "notion-client";
import NotionPage from "@/components/NotionPage";

const PAGE_ID = "HackerDoc-HackKU-26-2be9e50fddb580418f10d4c9ba1b14e1";
const notion = new NotionAPI();

export default async function TestPage() {
  const recordMap = await notion.getPage(PAGE_ID);
  console.log(recordMap);
  return (
    <div className="py-8">
      <NotionPage recordMap={recordMap} />
    </div>
  )
}
