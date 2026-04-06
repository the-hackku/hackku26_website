import { redirect } from "next/navigation";
import { isAdminOrVolunteer } from "@/middlewares/isAdmin";

export default async function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await isAdminOrVolunteer();
  } catch (error) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">{children}</div>
  );
}
