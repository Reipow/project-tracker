import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/RecipeForm";

interface NewRecipePageProps {
  searchParams: Promise<{ boardId?: string }>;
}

export default async function NewRecipePage({ searchParams }: NewRecipePageProps) {
  const { boardId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!boardId) {
    redirect("/dashboard");
  }

  // Check if user has access to this board
  const { data: member, error: memberError } = await supabase
    .from("board_members")
    .select("role")
    .eq("board_id", boardId)
    .eq("user_id", user.id)
    .single();

  if (memberError || !member) {
    redirect("/dashboard");
  }

  if (member.role === "viewer") {
    redirect(`/dashboard/board/${boardId}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Recipe</h1>
      <RecipeForm boardId={boardId} />
    </div>
  );
}