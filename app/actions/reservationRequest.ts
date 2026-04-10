"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import { TimeSlot } from "@prisma/client";

import { exportReservationRequestToGoogleSheet } from "@/scripts/googleSheetsExport";


export async function createReservationRequest(input: {
  teamName: string;
  teamMembers: string;
  memberEmails: string;
  outOfState: boolean;
  themedRoomId: string;
  timeSlot: TimeSlot;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated! Please sign in first.");
  }

  // Check if the room+timeSlot combo is already taken
  const existingCombo = await prisma.reservationRequest.findFirst({
    where: { themedRoomId: input.themedRoomId, timeSlot: input.timeSlot },
  });
  if (existingCombo) {
    throw new Error(
      "That room and time slot is already taken. Please choose another."
    );
  }

  const aggEmails = `${session.user.email}, ${input.memberEmails}`;
  const reservation = await prisma.reservationRequest.create({
    data: {
      userId: session.user.id,
      teamName: input.teamName,
      memberEmails: aggEmails,
      outOfState: input.outOfState,
      themedRoomId: input.themedRoomId,
      timeSlot: input.timeSlot,
    },
  });

  await exportReservationRequestToGoogleSheet(reservation);

  return reservation;
}

export async function getPublicThemedRooms() {
  return prisma.themedRoom.findMany({ orderBy: { name: "asc" } });
}

export async function getTakenRoomTimeCombos() {
  const reservations = await prisma.reservationRequest.findMany({
    where: {
      themedRoomId: { not: null },
      timeSlot: { not: null },
    },
    select: {
      themedRoomId: true,
      timeSlot: true,
    },
  });
  return reservations as { themedRoomId: string; timeSlot: TimeSlot }[];
}
