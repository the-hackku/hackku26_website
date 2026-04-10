"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GenericDataContainer } from "@/components/admin/GenericDataContainer";
import {
  getUsers,
  batchUpdateUsers,
  getCheckins,
  batchUpdateCheckins,
  getReimbursements,
  batchUpdateReimbursements,
  backupRegistrationScript,
  getTotalRegistrationNumber,
  getHackathonCheckinCount,
  getFoodGroupConfig,
  setFoodGroupConfig,
  getFoodGroupStats,
  setFoodGroupAlias,
} from "@/app/actions/admin";
import { ColumnDef } from "@tanstack/react-table";
import { ROLE, TravelReimbursement } from "@prisma/client";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { EventDetailsDialog } from "@/components/admin/EventDetailsDialog"; // Import EventDetailsDialog
import Link from "next/link";
import { format } from "date-fns";
import { ParticipantInfo } from "@prisma/client";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import AnalyticsChart from "@/components/admin/charts/AnalyticsChart";
import CombinedDashboard from "@/components/admin/charts/combinedDashboard";
import { RoomReservationsTab } from "@/components/admin/RoomReservationsTab";
import { exportEmails, exportParticipantEmails, exportUnregisteredEmails } from "@/scripts/emailExporter";
import { toast } from "sonner";

// Extend the User type to include relations or additional fields
interface ExtendedUser extends User {
  ParticipantInfo?: ParticipantInfo | null;
  checkinsAsUser?: Checkin[];
}

interface User {
  id: string;
  email: string;
  role: ROLE;
  name?: string | null;
}

interface ExtendedTravelReimbursement extends TravelReimbursement {
  creator: {
    id: string;
    email: string;
    ParticipantInfo?: {
      firstName: string;
      lastName: string;
    } | null;
  };
  invites: {
    user: {
      email: string;
    };
  }[];
}

interface Checkin {
  id: string;
  userId: string;
  eventId: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
    participantInfo?: {
      firstName: string;
      lastName: string;
    } | null;
  };
  event: {
    name: string;
  };
}

const handleBackup = async () => {
  const res = await backupRegistrationScript();
  if (!res.success) {
    toast.error("Failed to backup registration");
    return;
  }
  toast.success("Backed up to Google Sheet")
};

const downloadFile = (fileName: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleDownloadUserEmails = async () => {
  const emails = await exportEmails();
  downloadFile("all_emails.txt", emails);
};

const handleDownloadRegistrantEmails = async () => {
  const emails = await exportParticipantEmails();
  downloadFile("participant_emails.txt", emails);
};

const handleDownloadUnregisteredEmails = async () => {
  const emails = await exportUnregisteredEmails();
  downloadFile("unregistered_emails.txt", emails);
};

export default function AdminTabsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null); // Track event selection
  const [totalRegistrations, setTotalRegistrations] = useState<number | null>(
    null
  );
  const [hackathonCheckinCount, setHackathonCheckinCount] = useState<
    number | null
  >(null);
  const [numGroupsInput, setNumGroupsInput] = useState<string>("4");
  const [groupStats, setGroupStats] = useState<{ group: number; count: number; name: string | null }[]>([]);
  const [aliasEdits, setAliasEdits] = useState<Record<number, string>>({});
  const [savingAlias, setSavingAlias] = useState<Record<number, boolean>>({});
  const [isSavingGroupConfig, setIsSavingGroupConfig] = useState(false);

  useEffect(() => {
    const fetchCheckinCount = async () => {
      try {
        const count = await getHackathonCheckinCount();
        setHackathonCheckinCount(count);
      } catch (error) {
        console.error("Failed to fetch check-in count:", error);
      }
    };

    fetchCheckinCount();
  }, []);

  useEffect(() => {
    const fetchTotalRegistrations = async () => {
      try {
        const total = await getTotalRegistrationNumber();
        setTotalRegistrations(total);
      } catch (error) {
        console.error("Error fetching total registration number:", error);
      }
    };

    fetchTotalRegistrations();
  }, []);

  useEffect(() => {
    const loadFoodGroupData = async () => {
      try {
        const [config, stats] = await Promise.all([getFoodGroupConfig(), getFoodGroupStats()]);
        setNumGroupsInput(String(config.numGroups));
        setGroupStats(stats);
        setAliasEdits(Object.fromEntries(stats.map((s) => [s.group, s.name ?? ""])));
      } catch (error) {
        console.error("Failed to load food group data:", error);
      }
    };
    loadFoodGroupData();
  }, []);

  const handleSaveAlias = async (group: number) => {
    setSavingAlias((prev) => ({ ...prev, [group]: true }));
    try {
      await setFoodGroupAlias(group, aliasEdits[group] ?? "");
      const stats = await getFoodGroupStats();
      setGroupStats(stats);
      toast.success(`Group ${group} name saved`);
    } catch {
      toast.error("Failed to save alias");
    } finally {
      setSavingAlias((prev) => ({ ...prev, [group]: false }));
    }
  };

  const handleSaveFoodGroupConfig = async () => {
    const n = parseInt(numGroupsInput, 10);
    if (isNaN(n) || n < 1) {
      toast.error("Number of groups must be at least 1");
      return;
    }
    setIsSavingGroupConfig(true);
    try {
      await setFoodGroupConfig(n);
      const stats = await getFoodGroupStats();
      setGroupStats(stats);
      setAliasEdits(Object.fromEntries(stats.map((s) => [s.group, s.name ?? ""])));
      toast.success(`Food groups updated to ${n}`);
    } catch {
      toast.error("Failed to save food group config");
    } finally {
      setIsSavingGroupConfig(false);
    }
  };

  const userColumns: ColumnDef<ExtendedUser>[] = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center">
            <button
              onClick={() => setSelectedUserId(user.id)}
              className={
                "hover:underline text-left flex flex-row items-center " +
                (user.ParticipantInfo ? "" : "text-red-300")
              }
            >
              {user.ParticipantInfo
                ? `${user.ParticipantInfo.firstName} ${user.ParticipantInfo.lastName}`
                : "Unknown"}
              <IconArrowUpRight size={12} className="ml-1" />
            </button>
          </div>
        );
      },
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => {
        return row.original.email;
      },
    },
    {
      id: "role",
      header: "Role",
      accessorFn: (row) => row.role,
      meta: {
        selectOptions: Object.values(ROLE).map((role) => ({
          value: role,
          label: role,
        })),
      },
    },
  ];

  const reimbursementColumns: ColumnDef<ExtendedTravelReimbursement>[] = [
    {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const reimbursement = row.original;
        const participantInfo = reimbursement.creator?.ParticipantInfo;
        const userName = participantInfo
          ? `${participantInfo.firstName} ${participantInfo.lastName}`
          : "Unknown";

        return (
          <button
            onClick={() => setSelectedUserId(reimbursement.creator.id)}
            className="hover:underline text-left"
          >
            {userName} ({reimbursement.creator.email})
          </button>
        );
      },
    },
    {
      id: "transportationMethod",
      header: "Transport",
      accessorFn: (row) => row.transportationMethod,
    },
    {
      id: "address",
      header: "Address",
      accessorFn: (row) => row.address,
    },
    {
      id: "distance",
      header: "Distance (miles)",
      accessorFn: (row) => row.distance,
    },
    {
      id: "estimatedCost",
      header: "Estimated Cost ($)",
      accessorFn: (row) => row.estimatedCost,
    },
    {
      id: "reason",
      header: "Reason",
      accessorFn: (row) => row.reason,
    },
  ];

  const checkinColumns: ColumnDef<Checkin>[] = [
    {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const checkin = row.original;
        const userName = checkin.user.participantInfo
          ? `${checkin.user.participantInfo.firstName} ${checkin.user.participantInfo.lastName}`
          : checkin.user.name || "Unknown";

        return (
          <button
            onClick={() => setSelectedUserId(checkin.userId)} // Show user details dialog
            className="hover:underline text-left"
          >
            {userName}
          </button>
        );
      },
    },
    {
      id: "event",
      header: "Event",
      cell: ({ row }) => {
        const checkin = row.original;
        return (
          <button
            onClick={() => setSelectedEventId(checkin.eventId)} // Show event details dialog
            className="hover:underline text-left"
          >
            {checkin.event.name}
          </button>
        );
      },
    },
    {
      id: "timestamp",
      header: "Time",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return format(date, "MMMM d, yyyy, h:mm a");
      },
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl py-8">
      {/* Add total registrations display */}
      <div className="mb-4 p-4 border rounded-lg flex flex-row">
        <h2 className="text-xl font-semibold flex flex-row gap-2">
          <span>
            {" "}
            Total Registrations:{" "}
            {totalRegistrations !== null ? totalRegistrations : "Loading..."}
          </span>
          -
          <span>
            People Checked in: {hackathonCheckinCount ?? "Loading..."}
          </span>
        </h2>
      </div>

      {/* User Details Dialog */}
      <UserDetailsDialog
        userId={selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />

      {/* Event Details Dialog */}
      <EventDetailsDialog
        eventId={selectedEventId}
        onOpenChange={(open) => !open && setSelectedEventId(null)} // Reset event ID when closed
      />

      <Tabs defaultValue="analytics">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-row gap-2">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            </TabsList>
            <TabsList className="mb-4">
              <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
              <Link href="/admin/events">
                <TabsTrigger value="events">Manage Events</TabsTrigger>
              </Link>
              <TabsTrigger value="rooms">Room Reservations</TabsTrigger>
              <TabsTrigger value="actions">Admin Actions</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex flex-row gap-2">
            <Link
              href="https://docs.google.com/spreadsheets/d/1BHgfhH0E5Ro5FuzsFgvt-wtNWI9sQ4QPqdk7aNInUi0/edit?gid=0#gid=0"
              target="_blank"
            >
              <Button className="bg-green-600 mb-4">Go to Google Sheet</Button>
            </Link>
            <Link href="/scanner">
              <Button className="bg-blue-400 mb-4">Scan In Hackers</Button>
            </Link>
          </div>
        </div>

        <TabsContent value="users">
          <GenericDataContainer<User>
            title="Users"
            fetchFunction={async (page, pageSize, searchQuery) => {
              const { users, totalUsers } = await getUsers(
                page,
                pageSize,
                searchQuery
              );
              return { data: users, total: totalUsers };
            }}
            updateFunction={async (editedData) => {
              await batchUpdateUsers(editedData);
            }}
            columns={userColumns}
            pageSize={20}
            debounceTime={250}
          />
        </TabsContent>
        <TabsContent value="checkins">
          <GenericDataContainer<Checkin>
            title="Check-ins"
            fetchFunction={async (page, pageSize, searchQuery) => {
              const { checkins, totalCheckins } = await getCheckins(
                page,
                pageSize,
                searchQuery
              );
              return { data: checkins, total: totalCheckins };
            }}
            updateFunction={async (editedData) => {
              await batchUpdateCheckins(editedData);
            }}
            columns={checkinColumns}
            debounceTime={250}
          />
        </TabsContent>
        <TabsContent value="reimbursements">
          <GenericDataContainer<ExtendedTravelReimbursement>
            title="Reimbursements"
            fetchFunction={async (page, pageSize, searchQuery) => {
              const { reimbursements, totalReimbursements } =
                await getReimbursements(page, pageSize, searchQuery);

              // ✅ Ensure `creator` is included correctly
              const formattedReimbursements: ExtendedTravelReimbursement[] =
                reimbursements.map((reimbursement) => ({
                  ...reimbursement,
                  creator: {
                    id: reimbursement.creator.id,
                    email: reimbursement.creator.email,
                    ParticipantInfo: reimbursement.creator.ParticipantInfo
                      ? {
                          firstName:
                            reimbursement.creator.ParticipantInfo.firstName,
                          lastName:
                            reimbursement.creator.ParticipantInfo.lastName,
                        }
                      : null,
                  },
                  invites: reimbursement.invites.map((invite) => ({
                    user: {
                      email: invite.user.email,
                    },
                  })),
                }));

              return {
                data: formattedReimbursements,
                total: totalReimbursements,
              };
            }}
            updateFunction={async (editedData) => {
              await batchUpdateReimbursements(editedData);
            }}
            columns={reimbursementColumns}
            debounceTime={250}
          />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomReservationsTab />
        </TabsContent>

        <TabsContent value="scanner">
          <div className="flex flex-col items-start space-y-2">
            <p className="text-sm text-muted-foreground">
              Use our QR Code scanner to check participants in:
            </p>
            <Link href="/scanner" className="underline text-blue-600">
              Go to Scanner
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="actions">
          <div className="flex flex-col items-start space-y-4">
            {/* Food Group Configuration */}
            <div className="w-full p-4 border rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Food Group Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Hackers are automatically assigned to a food group at check-in. Groups are kept balanced.
              </p>
              <div className="rounded border-l-4 border-yellow-500 bg-yellow-50 p-2">
                <strong>WARNING</strong>: Changing the number of groups will reassign everyone to a new food group!
                <div className="flex items-center gap-2 mt-4">
                  <label className="text-sm font-medium">Number of groups:</label>
                  <input
                    type="number"
                    min={1}
                    value={numGroupsInput}
                    onChange={(e) => setNumGroupsInput(e.target.value)}
                    className="border rounded px-2 py-1 w-20 text-sm"
                  />
                  <Button onClick={handleSaveFoodGroupConfig} disabled={isSavingGroupConfig} size="sm">
                    {isSavingGroupConfig ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
              {groupStats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {groupStats.map(({ group, count, name }) => (
                    <div key={group} className="p-2 border rounded text-sm space-y-1">
                      <div className="font-semibold text-center">{name || `Group ${group}`}</div>
                      <div className="text-muted-foreground text-center">{count} hackers</div>
                      <input
                        type="text"
                        placeholder={`Group ${group}`}
                        value={aliasEdits[group] ?? name ?? ""}
                        onChange={(e) => setAliasEdits((prev) => ({ ...prev, [group]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveAlias(group)}
                        className="border rounded px-2 py-1 w-full text-xs"
                      />
                      <Button
                        size="sm"
                        className="w-full text-xs h-7"
                        disabled={savingAlias[group]}
                        onClick={() => handleSaveAlias(group)}
                      >
                        {savingAlias[group] ? "Saving..." : "Save name"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleBackup}>
              Batch Backup Registration Data
            </Button>
            <Button onClick={handleDownloadUserEmails}>
              Download User Emails
            </Button>
            <Button onClick={handleDownloadRegistrantEmails}>
              Download Registrant Emails
            </Button>
            <Button onClick={handleDownloadUnregisteredEmails}>
              Download Unregistered Emails
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsChart />
          <CombinedDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
