"use client";

import { useState } from "react";
import {
  Mail,
  Circle,
  Phone,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  MailOpen,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MessageItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  read: boolean;
  createdAt: string | Date;
}

export default function AdminMessagesClient({
  initialMessages,
}: {
  initialMessages: MessageItem[];
}) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal confirm states
  const [confirmSingleDelete, setConfirmSingleDelete] = useState<MessageItem | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const unreadCount = messages.filter((m) => !m.read).length;

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id));
    }
  };

  // Mark single message read/unread
  const handleToggleRead = async (msg: MessageItem) => {
    const newReadState = !msg.read;
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: newReadState } : m))
    );

    try {
      await fetch(`/api/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: newReadState }),
      });
    } catch (err) {
      console.error(err);
      // Revert on error
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: msg.read } : m))
      );
    }
  };

  // Permanently delete single message
  const executeSingleDelete = async () => {
    if (!confirmSingleDelete) return;
    const msg = confirmSingleDelete;
    setDeletingId(msg.id);
    setConfirmSingleDelete(null);

    try {
      const res = await fetch(`/api/messages/${msg.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      // Remove from state immediately
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      setSelectedIds((prev) => prev.filter((id) => id !== msg.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete message. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk delete selected messages
  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    setShowBulkDeleteConfirm(false);

    try {
      const res = await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Bulk delete failed");

      // Remove selected from state immediately
      setMessages((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected messages. Please try again.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk mark as read / unread
  const handleBulkMarkRead = async (readState: boolean) => {
    if (selectedIds.length === 0) return;
    setIsActionLoading(true);

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (selectedIds.includes(m.id) ? { ...m, read: readState } : m))
    );

    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, read: readState }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-blue-600" size={24} /> Messages Inbox
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {messages.length} total messages
            {unreadCount > 0 && (
              <span className="ml-2 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && selectedIds.length === 0 && (
            <Button
              type="button"
              onClick={async () => {
                const unreadIds = messages.filter((m) => !m.read).map((m) => m.id);
                if (unreadIds.length === 0) return;
                setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
                try {
                  await fetch("/api/messages", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: unreadIds, read: true }),
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
              variant="secondary"
              size="sm"
              className="text-xs rounded-xl"
            >
              <MailOpen size={14} className="mr-1.5 text-blue-600" /> Mark All as Read ({unreadCount})
            </Button>
          )}

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-700 px-2">
                {selectedIds.length} Selected
              </span>

              <Button
                type="button"
                onClick={() => handleBulkMarkRead(true)}
                variant="secondary"
                size="sm"
                disabled={isActionLoading}
                className="text-xs py-1 px-2.5 rounded-lg"
              >
                Mark Read
              </Button>

              <Button
                type="button"
                onClick={() => handleBulkMarkRead(false)}
                variant="secondary"
                size="sm"
                disabled={isActionLoading}
                className="text-xs py-1 px-2.5 rounded-lg"
              >
                Mark Unread
              </Button>

              <Button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(true)}
                variant="danger"
                size="sm"
                disabled={isBulkDeleting}
                className="text-xs py-1 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                {isBulkDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Select All Checkbox Strip */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50/80 rounded-xl border border-gray-200/80 text-xs text-gray-600">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 hover:text-gray-900 font-medium"
          >
            {selectedIds.length === messages.length ? (
              <CheckSquare size={16} className="text-blue-600" />
            ) : (
              <Square size={16} className="text-gray-400" />
            )}
            <span>Select All Messages ({messages.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Deselect All
            </button>
          )}
        </div>
      )}

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center space-y-3">
          <Mail size={36} className="text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium text-sm">No contact messages in your inbox.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isSelected = selectedIds.includes(msg.id);
            const isDeleting = deletingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`group bg-white rounded-2xl border p-5 transition-all relative ${
                  !msg.read
                    ? "border-blue-200 bg-blue-50/30 shadow-xs"
                    : "border-gray-200/90 hover:border-gray-300"
                } ${isSelected ? "ring-2 ring-blue-500/40 bg-blue-50/50" : ""}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Select Checkbox + Unread Indicator + Sender Info */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(msg.id)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} className="text-gray-300" />
                      )}
                    </button>

                    {!msg.read ? (
                      <Circle size={8} className="text-blue-600 fill-blue-600 shrink-0" />
                    ) : (
                      <div className="w-2 h-2" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{msg.name}</span>
                        <span className="text-gray-400 text-xs font-mono">&lt;{msg.email}&gt;</span>
                        {msg.phone && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full font-medium">
                            <Phone size={11} className="text-gray-400" />
                            {msg.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp & Delete Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <time className="text-xs text-gray-400 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>

                    <button
                      type="button"
                      onClick={() => setConfirmSingleDelete(msg)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-70 group-hover:opacity-100"
                      title="Delete message"
                    >
                      {isDeleting ? (
                        <Loader2 size={15} className="animate-spin text-red-600" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap pl-11 pr-2">
                  {msg.message}
                </p>

                {/* Bottom Actions Bar */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between pl-11">
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your message`}
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Reply via email →
                    </a>
                    {msg.phone && (
                      <a
                        href={`tel:${msg.phone}`}
                        className="text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Call {msg.phone}
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleRead(msg)}
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
                  >
                    {msg.read ? (
                      <>
                        <Mail size={12} /> Mark as Unread
                      </>
                    ) : (
                      <>
                        <MailOpen size={12} className="text-blue-600" /> Mark as Read
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Single Delete */}
      {confirmSingleDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Delete Message</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
              Are you sure you want to delete this message from{" "}
              <strong className="text-gray-900">{confirmSingleDelete.name}</strong> ({confirmSingleDelete.email})? This row will be permanently removed from the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmSingleDelete(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeSingleDelete}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Delete */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Delete {selectedIds.length} Messages</h3>
                <p className="text-xs text-gray-500">Permanent database deletion</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
              Are you sure you want to permanently delete the <strong>{selectedIds.length}</strong> selected messages from the database? This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeBulkDelete}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Delete {selectedIds.length} Messages
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
