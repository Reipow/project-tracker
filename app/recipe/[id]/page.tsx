import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Clock, Users, Edit, Trash2 } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch recipe
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select(`
      *,
      boards!inner(
        board_members!inner(user_id, role)
      )
    `)
    .eq("id", id)
    .single();

  if (recipeError || !recipe) {
    notFound();
  }

  // Check if user has access to this board
  const member = recipe.boards.board_members.find(
    (m: { user_id: string }) => m.user_id === user.id
  );

  if (!member) {
    notFound();
  }

  const canEdit = member.role === "owner" || member.role === "editor";

  const deleteRecipe = async () => {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Check permissions
    const { data: memberData } = await supabase
      .from("board_members")
      .select("role")
      .eq("board_id", recipe.board_id)
      .eq("user_id", user.id)
      .single();

    if (!memberData || memberData.role === "viewer") {
      return;
    }

    await supabase.from("recipes").delete().eq("id", id);
    redirect(`/dashboard/board/${recipe.board_id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/board/${recipe.board_id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
        </div>
        {canEdit && (
          <div className="flex items-center space-x-2">
            <Link
              href={`/recipe/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <form action={deleteRecipe}>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {recipe.image_url && (
          <div className="relative h-64 md:h-96">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            {(recipe.prep_time || recipe.cook_time) && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {formatTime(recipe.prep_time)}
                  {recipe.prep_time && recipe.cook_time && " / "}
                  {formatTime(recipe.cook_time)}
                </span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
          </div>

          {recipe.description && (
            <p className="text-gray-600">{recipe.description}</p>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="text-gray-700">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {recipe.instructions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}