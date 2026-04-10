import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Trash2, Users } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: boards, error } = await supabase
    .from("boards")
    .select(`
      *,
      board_members!inner(user_id, role)
    `)
    .eq("board_members.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching boards:", error);
  }

  const createBoard = async () => {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: board, error } = await supabase
      .from("boards")
      .insert({
        name: "My New Board",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating board:", error);
      return;
    }

    // Add owner as member
    await supabase.from("board_members").insert({
      board_id: board.id,
      user_id: user.id,
      role: "owner",
    });

    redirect(`/dashboard/board/${board.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Your Boards</h1>
        <form action={createBoard}>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </button>
        </form>
      </div>

      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/dashboard/board/${board.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {board.name}
              </h3>
              {board.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {board.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>
                  {
                    board.board_members?.filter(
                      (m: { role: string }) => m.role === "owner"
                    ).length
                  }{" "}
                  member
                  {(board.board_members?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You don't have any boards yet.</p>
          <p className="text-gray-400">
            Create your first board to start adding recipes!
          </p>
        </div>
      )}
    </div>
  );
}