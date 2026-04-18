import { NotionAPI } from "notion-client";
import NotionPage from "@/components/NotionPage";

const PAGE_ID = "MLH-Challenges-3449e50fddb580aba99cea90aa12fb15";
const notion = new NotionAPI();

export default async function TestPage() {
  try {
    const recordMap = await notion.getPage(PAGE_ID);
    return (
      <div className="py-8">
        <NotionPage recordMap={recordMap} />
      </div>
    )
  } catch {
    return (
      <div className="flex items-center justify-center h-screen py-8">
        <p>This page isn&apos;t public yet!</p>
      </div>
    )
  }
}
