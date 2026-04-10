"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inviteSchema } from "@/lib/validations/recipes";
import { generateToken } from "@/lib/utils";
import { INVITE_TOKEN_EXPIRY_DAYS } from "@/lib/constants";
import { Loader2, Mail, X } from "lucide-react";

interface InviteDialogProps {
  boardId: string;
}

export function InviteDialog({ boardId }: InviteDialogProps) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = inviteSchema.safeParse({
      email,
      role,
      boardId,
    });

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      setError(errors);
      setLoading(false);
      return;
    }

    try {
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);

      const { error: inviteError } = await supabase.from("invites").insert({
        email,
        role,
        board_id: boardId,
        token,
        expires_at: expiresAt.toISOString(),
      });

      if (inviteError) {
        if (inviteError.code === "23505") {
          setError("An invitation has already been sent to this email");
        } else {
          setError(inviteError.message);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError("An error occurred while sending the invitation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <Mail className="h-4 w-4 mr-2" />
        Invite
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invite to Board</h3>
          <button
            onClick={() => {
              setIsOpen(false);
              setSuccess(false);
              setError(null);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-600">
              Invitation sent successfully!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The invite link will expire in {INVITE_TOKEN_EXPIRY_DAYS} days.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-500"
            >
              Send another invitation
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="colleague@example.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="editor"
                    checked={role === "editor"}
                    onChange={() => setRole("editor")}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Editor</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="viewer"
                    checked={role === "viewer"}
                    onChange={() => setRole("viewer")}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Viewer</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSuccess(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Invitation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}