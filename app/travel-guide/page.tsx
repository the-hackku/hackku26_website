import { NotionAPI } from "notion-client";
import NotionPage from "@/components/NotionPage";

const PAGE_ID = "Travel-Guide-33a9e50fddb580b5a15af1e605489642";
const notion = new NotionAPI();

export default async function TestPage() {
  const recordMap = await notion.getPage(PAGE_ID);
  return (
    <div className="py-8">
      <NotionPage recordMap={recordMap} />
    </div>
  )
}
