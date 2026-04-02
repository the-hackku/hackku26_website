"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { IconLoader, IconX } from "@tabler/icons-react";
import {
  type AdminThemedRoom,
  type AdminReservationRequest,
  getThemedRooms,
  createThemedRoom,
  updateAdminThemedRoom,
  deleteAdminThemedRoom,
  getReservationRequests,
  assignRoomToRequest,
  deleteReservationRequest,
} from "@/app/actions/admin";

const PAGE_SIZE = 10;

const EMPTY_ROOM_FORM = { name: "", location: "" };

export function RoomReservationsTab() {
  // ── Themed Rooms ──────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState<AdminThemedRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM_FORM);
  const [editingRoom, setEditingRoom] = useState<AdminThemedRoom | null>(null);
  const [roomSaving, setRoomSaving] = useState(false);

  // ── Reservation Requests ──────────────────────────────────────────────────
  const [requests, setRequests] = useState<AdminReservationRequest[]>([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsSearch, setRequestsSearch] = useState("");
  const [requestsDebouncedSearch, setRequestsDebouncedSearch] = useState("");
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // ── Debounce request search ───────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setRequestsDebouncedSearch(requestsSearch), 300);
    return () => clearTimeout(t);
  }, [requestsSearch]);

  // ── Fetch rooms ───────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      setRooms(await getThemedRooms());
    } catch {
      toast.error("Failed to load themed rooms.");
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ── Fetch requests ────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const { requests: data, total } = await getReservationRequests(
        requestsPage,
        PAGE_SIZE,
        requestsDebouncedSearch
      );
      setRequests(data);
      setRequestsTotal(total);
    } catch {
      toast.error("Failed to load reservation requests.");
    } finally {
      setRequestsLoading(false);
    }
  }, [requestsPage, requestsDebouncedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Room CRUD handlers ────────────────────────────────────────────────────
  function openAddRoom() {
    setEditingRoom(null);
    setRoomForm(EMPTY_ROOM_FORM);
    setRoomDialogOpen(true);
  }

  function openEditRoom(room: AdminThemedRoom) {
    setEditingRoom(room);
    setRoomForm({ name: room.name, location: room.location });
    setRoomDialogOpen(true);
  }

  async function handleSaveRoom() {
    if (!roomForm.name.trim() || !roomForm.location.trim()) {
      toast.error("Name and location are required.");
      return;
    }
    setRoomSaving(true);
    try {
      if (editingRoom) {
        await updateAdminThemedRoom(editingRoom.id, roomForm);
        toast.success("Room updated.");
      } else {
        await createThemedRoom(roomForm);
        toast.success("Room created.");
      }
      setRoomDialogOpen(false);
      fetchRooms();
    } catch {
      toast.error("Failed to save room.");
    } finally {
      setRoomSaving(false);
    }
  }

  async function handleDeleteRoom(id: string) {
    if (!window.confirm("Delete this room? Existing assignments will be cleared.")) return;
    try {
      await deleteAdminThemedRoom(id);
      toast.success("Room deleted.");
      fetchRooms();
      fetchRequests(); // assignments may have been cleared
    } catch {
      toast.error("Failed to delete room.");
    }
  }

  // ── Request handlers ──────────────────────────────────────────────────────
  async function handleAssignRoom(requestId: string, themedRoomId: string) {
    setAssigningId(requestId);
    try {
      await assignRoomToRequest(requestId, themedRoomId === "none" ? null : themedRoomId);
      toast.success("Room assigned.");
      fetchRequests();
    } catch {
      toast.error("Failed to assign room.");
    } finally {
      setAssigningId(null);
    }
  }

  async function handleCancelRequest(requestId: string) {
    if (!window.confirm("Delete this reservation request? This cannot be undone.")) return;
    try {
      await deleteReservationRequest(requestId);
      toast.success("Request cancelled.");
      fetchRequests();
    } catch {
      toast.error("Failed to cancel request.");
    }
  }

  const requestsTotalPages = Math.max(1, Math.ceil(requestsTotal / PAGE_SIZE));

  return (
    <div className="space-y-10">
      {/* ── Themed Rooms ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">Themed Rooms</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage the available rooms that can be assigned to reservation requests.
            </p>
          </div>
          <Button size="sm" onClick={openAddRoom}>
            Add Room
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomsLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    <IconLoader size={18} className="animate-spin inline" />
                  </TableCell>
                </TableRow>
              )}
              {!roomsLoading && rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No rooms yet. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell className="text-sm">{room.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditRoom(room)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ── Reservation Requests ── */}
      <section>
        <h2 className="text-xl font-semibold mb-1">Reservation Requests</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Assign a room to each request using the dropdown. Unassigned requests have no room yet.
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="relative max-w-sm w-full">
            <Input
              placeholder="Search by team or members..."
              value={requestsSearch}
              onChange={(e) => {
                setRequestsSearch(e.target.value);
                setRequestsPage(1);
              }}
              className="pr-8"
            />
            {requestsSearch && (
              <button
                onClick={() => setRequestsSearch("")}
                className="absolute inset-y-0 right-2 flex items-center"
              >
                <IconX size={16} />
              </button>
            )}
          </div>
          {requestsLoading && <IconLoader size={18} className="animate-spin" />}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Out of State</TableHead>
                <TableHead>Assigned Room</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 && !requestsLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No reservation requests found.
                  </TableCell>
                </TableRow>
              )}
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.teamName}</TableCell>
                  <TableCell className="text-sm">{req.userEmail}</TableCell>
                  <TableCell
                    className="text-sm max-w-[180px] truncate"
                    title={req.memberEmails}
                  >
                    {req.memberEmails}
                  </TableCell>
                  <TableCell>{req.outOfState ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {assigningId === req.id ? (
                      <IconLoader size={16} className="animate-spin" />
                    ) : (
                      <Select
                        value={req.themedRoomId ?? "none"}
                        onValueChange={(val) => handleAssignRoom(req.id, val)}
                        disabled={rooms.length === 0}
                      >
                        <SelectTrigger className="h-8 text-sm w-48">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground italic">Unassigned</span>
                          </SelectItem>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name} — {room.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelRequest(req.id)}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-3">
          <Button
            variant="outline"
            size="sm"
            disabled={requestsPage <= 1}
            onClick={() => setRequestsPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {requestsPage} of {requestsTotalPages} ({requestsTotal} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={requestsPage >= requestsTotalPages}
            onClick={() => setRequestsPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </section>

      {/* ── Add / Edit Room Dialog ── */}
      <Dialog
        open={roomDialogOpen}
        onOpenChange={(open) => !open && setRoomDialogOpen(false)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add Room"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={roomForm.name}
                onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Dungeons & Dragons"
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={roomForm.location}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Room 2324"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoomDialogOpen(false)}
              disabled={roomSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRoom} disabled={roomSaving}>
              {roomSaving && <IconLoader size={16} className="animate-spin mr-1" />}
              {editingRoom ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
