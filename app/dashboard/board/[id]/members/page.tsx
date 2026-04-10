import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Crown, Edit, Eye, Trash2 } from "lucide-react";

interface MembersPageProps {
  params: Promise<{ id: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is owner of this board
  const { data: member, error: memberError } = await supabase
    .from("board_members")
    .select("role")
    .eq("board_id", id)
    .eq("user_id", user.id)
    .single();

  if (memberError || !member || member.role !== "owner") {
    notFound();
  }

  // Fetch all members with their profiles
  const { data: members, error: membersError } = await supabase
    .from("board_members")
    .select(`
      id,
      role,
      created_at,
      user_id
    `)
    .eq("board_id", id)
    .order("created_at", { ascending: true });

  if (membersError) {
    console.error("Error fetching members:", membersError);
  }

  // Fetch user profiles for all members
  const userIds = members?.map((m) => m.user_id).filter(Boolean) || [];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  // Create a map for quick lookup
  const profileMap = new Map(
    profiles?.map((p) => [p.id, p]) || []
  );

  // Type for member data from database
  type MemberData = {
    id: string;
    role: string;
    created_at: string;
    user_id: string;
  };

  // Type for member with user profile
  type MemberWithUser = {
    id: string;
    role: string;
    created_at: string;
    user: {
      id: string;
      email: string;
      full_name: string | null;
    } | null;
  };

  const removeMember = async (memberId: string) => {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Check if user is owner
    const { data: currentMember } = await supabase
      .from("board_members")
      .select("role")
      .eq("board_id", id)
      .eq("user_id", user.id)
      .single();

    if (!currentMember || currentMember.role !== "owner") {
      return;
    }

    // Don't allow removing the owner
    const { data: targetMember } = await supabase
      .from("board_members")
      .select("role")
      .eq("id", memberId)
      .single();

    if (targetMember?.role === "owner") {
      return;
    }

    await supabase.from("board_members").delete().eq("id", memberId);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "editor":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "viewer":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/dashboard/board/${id}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Board Members</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {members && members.length > 0 ? (
            <div className="space-y-4">
              {(members as MemberData[]).map((member) => {
                const userProfile = profileMap.get(member.user_id);
                return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {userProfile?.email?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {userProfile?.full_name || userProfile?.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {userProfile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                        member.role
                      )}`}
                    >
                      {getRoleIcon(member.role)}
                      <span className="ml-1 capitalize">{member.role}</span>
                    </span>
                    {member.role !== "owner" && (
                      <form
                        action={async () => {
                          "use server";
                          await removeMember(member.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No members found.</p>
          )}
        </div>
      </div>
    </div>
  );
}