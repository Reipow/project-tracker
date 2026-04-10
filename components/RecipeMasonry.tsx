"use client";

import { RecipeCard } from "./RecipeCard";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  ingredients: string[];
  instructions: string;
  board_id: string;
  created_at: string;
}

interface RecipeMasonryProps {
  recipes: Recipe[];
  canEdit: boolean;
  boardId: string;
}

export function RecipeMasonry({ recipes, canEdit, boardId }: RecipeMasonryProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="break-inside-avoid">
          <RecipeCard recipe={recipe} canEdit={canEdit} boardId={boardId} />
        </div>
      ))}
    </div>
  );
}