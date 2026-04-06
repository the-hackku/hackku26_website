import { getInfoPage } from "@/app/actions/infoPage";
import InfoPageView from "@/components/info/InfoPageView";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authoptions";

export default async function EditableInfoPage() {
  const [data, session] = await Promise.all([
    getInfoPage(),
    getServerSession(authOptions),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";

  return <InfoPageView initialData={data} isAdmin={isAdmin} />;
}
