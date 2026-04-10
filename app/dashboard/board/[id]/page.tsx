import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeMasonry } from "@/components/RecipeMasonry";
import { InviteDialog } from "@/components/InviteDialog";
import { Plus, Settings, ArrowLeft } from "lucide-react";

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has access to this board
  const { data: member, error: memberError } = await supabase
    .from("board_members")
    .select("role, boards(id, name, description)")
    .eq("board_id", id)
    .eq("user_id", user.id)
    .single();

  if (memberError || !member) {
    notFound();
  }

  // Type for board data
  type BoardData = {
    id: string;
    name: string;
    description: string | null;
  };

  const board = member.boards as unknown as BoardData;

  // Fetch recipes for this board
  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("*")
    .eq("board_id", id)
    .order("created_at", { ascending: false });

  if (recipesError) {
    console.error("Error fetching recipes:", recipesError);
  }

  const canEdit = member.role === "owner" || member.role === "editor";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
            {board.description && (
              <p className="text-gray-600 mt-1">{board.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canEdit && (
            <Link
              href={`/recipe/new?boardId=${id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Link>
          )}
          {member.role === "owner" && (
            <>
              <InviteDialog boardId={id} />
              <Link
                href={`/dashboard/board/${id}/members`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Members
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recipes</h2>
        {recipes && recipes.length > 0 ? (
          <RecipeMasonry
            recipes={recipes}
            canEdit={canEdit}
            boardId={id}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No recipes yet.</p>
            {canEdit && (
              <Link
                href={`/recipe/new?boardId=${id}`}
                className="text-blue-600 hover:text-blue-500"
              >
                Add your first recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}