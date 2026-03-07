import { NotionAPI } from "notion-client";
import NotionPage from "@/components/NotionPage";

const PAGE_ID = "HackerDoc-HackKU-2024-a878deccbb114cb6846253137c85ee74";
const notion = new NotionAPI();

export default async function TestPage() {
  const recordMap = await notion.getPage(PAGE_ID);
  return (
    <div className="py-8">
      <NotionPage recordMap={recordMap} />
    </div>
  )
}
