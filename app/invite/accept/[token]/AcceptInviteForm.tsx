"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { useState } from "react";

interface AcceptInviteFormProps {
  invite: {
    id: string;
    board_id: string;
    email: string;
    role: string;
    boards?: {
      name: string;
    };
  };
}

export function AcceptInviteForm({ invite }: AcceptInviteFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("board_members")
        .select("id")
        .eq("board_id", invite.board_id)
        .single();

      if (existingMember) {
        setError("You are already a member of this board");
        setLoading(false);
        return;
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from("board_members")
        .insert({
          board_id: invite.board_id,
          role: invite.role,
        });

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      // Delete the invite
      await supabase.from("invites").delete().eq("id", invite.id);

      setSuccess(true);
      router.push(`/dashboard/board/${invite.board_id}`);
    } catch (err) {
      setError("An error occurred while accepting the invitation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <p className="mt-2 text-sm text-green-600">
          You have successfully joined the board!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
      )}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Accept Invitation"
        )}
      </button>
    </div>
  );
}