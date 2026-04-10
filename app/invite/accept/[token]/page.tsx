import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AcceptInviteForm } from "./AcceptInviteForm";

interface AcceptInvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch invite
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select(`
      *,
      boards!inner(name)
    `)
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Invalid Invitation
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This invitation is invalid or has expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if invite has expired
  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Invitation Expired
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This invitation has expired. Please ask the board owner for a new invitation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is already logged in, show accept form
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Join Board
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You have been invited to join "{invite.boards?.name}" as a {invite.role}.
            </p>
          </div>
          <AcceptInviteForm invite={invite} />
        </div>
      </div>
    );
  }

  // If not logged in, show login/register prompt
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Join Board
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You have been invited to join "{invite.boards?.name}" as a {invite.role}.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Please sign in or create an account to accept this invitation.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <a
              href={`/login?redirect=/invite/accept/${token}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </a>
            <a
              href={`/register?redirect=/invite/accept/${token}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}