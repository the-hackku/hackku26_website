import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authoptions";
import { prisma } from "@/lib/prisma";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
// import constants from "@/constants";

// const REGISTRATION_CUTOFF = new Date(constants.startDate);
const REGISTRATION_CUTOFF = new Date("Sat Apr 18 12:00:00 PM CDT 2026");

export default async function RegisterPage() {
  // Close registration past checkin
  if (new Date() >= REGISTRATION_CUTOFF) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Registration is closed, please come back for HackKU next year!</p>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  // If the user is not authenticated, redirect to the signin page
  if (!session) {
    redirect("/signin");
  }

  // Fetch user details from the database to check if they are already registered
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? undefined },
    include: { ParticipantInfo: true },
  });

  const participant = user?.ParticipantInfo;

  if (participant) {
    redirect("/profile");
  }

  // If not registered, show the registration form
  return (
    <div className="mb-10">
      <RegistrationForm />
    </div>
  );
}
