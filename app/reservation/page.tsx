"use client";

import constants from "@/constants";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IconLoader } from "@tabler/icons-react";
import Link from "next/link";
import { debounce } from "lodash";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IconUser } from "@tabler/icons-react";

import { searchUsersByEmail } from "@/app/actions/reimbursement";
import {
  createReservationRequest,
  getPublicThemedRooms,
  getTakenRoomTimeCombos,
} from "@/app/actions/reservationRequest";
import { TimeSlot } from "@prisma/client";
import { ALL_TIMESLOTS, formatTimeSlot } from "@/lib/reservationRequests";

const reservationSchema = z.object({
  teamName: z.string().min(1, { message: "Team Name is required." }),
  isOutOfStateOrHighSchool: z.enum(["Yes", "No"], {
    errorMap: () => ({ message: "Please select Yes or No." }),
  }),
  groupMembers: z
    .array(
      z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string(),
      })
    )
    .min(1, { message: "Please add at least one group member." }),
  memberEmails: z.string().optional(),
  themedRoomId: z.string().min(1, { message: "Please select a room." }),
  timeSlot: z.string().min(1, { message: "Please select a time slot." }),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

type ThemedRoom = { id: string; name: string; location: string };

export default function RoomReservationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; email: string; name: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [themedRooms, setThemedRooms] = useState<ThemedRoom[]>([]);
  const [takenCombos, setTakenCombos] = useState<
    { themedRoomId: string; timeSlot: TimeSlot }[]
  >([]);

  useEffect(() => {
    Promise.all([getPublicThemedRooms(), getTakenRoomTimeCombos()])
      .then(([rooms, combos]) => {
        setThemedRooms(rooms);
        setTakenCombos(combos);
      })
      .catch(console.error);
  }, []);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      teamName: "",
      isOutOfStateOrHighSchool: "No",
      groupMembers: [],
      memberEmails: "",
      themedRoomId: "",
      timeSlot: "",
    },
  });

  const groupMembers = form.watch("groupMembers");
  const selectedRoomId = form.watch("themedRoomId");

  // When rooms load, set the default themedRoomId
  useEffect(() => {
    if (themedRooms.length > 0 && !form.getValues("themedRoomId")) {
      form.setValue("themedRoomId", themedRooms[0].id);
    }
  }, [themedRooms]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableTimeSlots = ALL_TIMESLOTS.filter(
    (slot) =>
      !takenCombos.some(
        (r) => r.themedRoomId === selectedRoomId && r.timeSlot === slot
      )
  );

  // Reset timeSlot when room changes and current slot is no longer available
  useEffect(() => {
    const currentSlot = form.getValues("timeSlot");
    if (
      availableTimeSlots.length > 0 &&
      (!currentSlot || !availableTimeSlots.includes(currentSlot as TimeSlot))
    ) {
      form.setValue("timeSlot", availableTimeSlots[0]);
    }
  }, [selectedRoomId, takenCombos]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim().length < 3) {
          setSearchResults([]);
          setHasSearched(false);
          return;
        }
        try {
          setIsSearching(true);
          const results = await searchUsersByEmail(query);
          setSearchResults(results);
          setHasSearched(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    []
  );

  const handleAddMember = (user: {
    id: string;
    email: string;
    name: string;
  }) => {
    if (groupMembers.some((m) => m.id === user.id)) return;
    if (groupMembers.length >= 4) {
      toast.error("A group can have a maximum of 4 members.");
      return;
    }
    form.setValue("groupMembers", [...groupMembers, user]);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleRemoveMember = (userId: string) => {
    const updated = groupMembers.filter((m) => m.id !== userId);
    form.setValue("groupMembers", updated);
  };

  const onSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true);

    const groupMemberEmails = data.groupMembers.map((m) => m.email);
    const uniqueEmails = Array.from(new Set(groupMemberEmails));
    const finalEmailString = uniqueEmails.join(", ");
    const teamMembersList = data.groupMembers.map((m) => m.id).join(", ");

    try {
      await toast.promise(
        createReservationRequest({
          teamName: data.teamName,
          memberEmails: finalEmailString,
          teamMembers: teamMembersList,
          outOfState: data.isOutOfStateOrHighSchool === "Yes",
          themedRoomId: data.themedRoomId,
          timeSlot: data.timeSlot as TimeSlot,
        }),
        {
          loading: "Submitting your room reservation...",
          success: "Room reservation submitted successfully!",
          error: "That room and time slot was just taken. Please try another.",
        }
      );

      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white my-6 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold mb-4">{constants.hackathonName} Room Reservation</h1>

      {/* Explanatory Text */}
      <div className="space-y-4 mb-6 text-sm leading-6">
        <p>
          HackKU uses an{" "}
          <strong>optional room reservation system</strong> to ensure fair and
          organized space allocation for all participants during the 36-hour
          hackathon.
        </p>
        <div className="px-2 py-3 rounded border-l-4 border-indigo-500 bg-indigo-50">
          <p>
            If your reservation is confirmed, you will see the room you are assigned{" "}
            show up in the
            <Link href="/profile" className="border-2 border-gray-400 bg-gray-200 rounded p-[3px] mx-1">
              <IconUser size={16} className="inline-flex align-middle mr-2" />
              Profile
            </Link>
            tab!
          </p>
        </div>
        <div className="px-2 py-3 rounded border-l-4 border-yellow-500 bg-yellow-50">
          <h1 className="text-xl font-bold mb-2">Notice:</h1>
          <p>
            In order to keep access to themed rooms fair, rooms will be <strong>first-come first-serve</strong>. 
            Your team will be only be allocated <strong>one time slot for one room total</strong>. 
            If you have any issues, questions, and or concerns reserving or claiming a room 
            during the event please find an organizer or reach out to us over the{" "}
            <a className="font-bold text-blue-500 hover:text-blue-400" href={constants.discordInvite}>discord</a>.
            Make your choice wisely!

            <br />
            <strong>Contact Us:</strong>{" "}
            <Link href="mailto:hack@ku.edu" className="underline">
              hack@ku.edu
            </Link>
          </p>
        </div>
      </div>

      {/* The Actual Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Team Name */}
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Your Team Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Group Member Search/Select */}
          <div>
            <FormLabel>
              Search and Add Registered Users to Your Team (up to 4)
            </FormLabel>
            {form.formState.errors.groupMembers && (
              <p className="text-sm font-medium text-destructive mt-1">
                {form.formState.errors.groupMembers.message}
              </p>
            )}
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />

            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <IconLoader className="animate-spin" size={16} />
                Searching...
              </div>
            )}

            {!isSearching &&
              hasSearched &&
              searchResults.length === 0 &&
              searchQuery.trim().length >= 3 && (
                <div className="mt-2 text-sm text-red-500">
                  No user found. Are you sure they registered?
                </div>
              )}

            {searchResults.length > 0 && (
              <div className="border bg-gray-50 rounded p-2 mt-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center py-1"
                  >
                    <span>
                      {user.name} ({user.email})
                    </span>
                    <Button size="sm" onClick={() => handleAddMember(user)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {groupMembers.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Selected Members:</h4>
                {groupMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span>
                      {member.name} ({member.email})
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Out-of-state or High-school? */}
          <FormField
            control={form.control}
            name="isOutOfStateOrHighSchool"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Are you an out-of-state or high-school team? *
                </FormLabel>
                <FormControl>
                  <div className="space-x-4">
                    <label>
                      <input
                        type="radio"
                        value="Yes"
                        checked={field.value === "Yes"}
                        onChange={(e) => field.onChange(e.target.value)}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="No"
                        checked={field.value === "No"}
                        onChange={(e) => field.onChange(e.target.value)}
                      />{" "}
                      No
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room selection */}
          <FormField
            control={form.control}
            name="themedRoomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Room *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border p-2 rounded text-sm"
                    disabled={themedRooms.length === 0}
                  >
                    {themedRooms.length === 0 && (
                      <option value="">Loading rooms...</option>
                    )}
                    {themedRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} — {room.location}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time slot selection */}
          <FormField
            control={form.control}
            name="timeSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Time Slot *</FormLabel>
                {availableTimeSlots.length === 0 ? (
                  <p className="text-sm text-red-500">
                    All time slots for this room are taken. Please select a
                    different room.
                  </p>
                ) : (
                  <FormControl>
                    <select
                      {...field}
                      className="w-full border p-2 rounded text-sm"
                    >
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatTimeSlot(slot)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <IconLoader className="animate-spin" size={20} />
                Submitting...
              </div>
            ) : (
              "Submit Reservation"
            )}
          </Button>
          <p className="text-xs text-muted-foreground pt-1">
            By submitting this form, you agree that the information provided is
            accurate and complete.
          </p>
        </form>
      </Form>
    </div>
  );
}
