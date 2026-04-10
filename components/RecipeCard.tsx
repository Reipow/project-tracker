"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { formatTime } from "@/lib/utils";

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

interface RecipeCardProps {
  recipe: Recipe;
  canEdit: boolean;
  boardId: string;
}

export function RecipeCard({ recipe, canEdit, boardId }: RecipeCardProps) {
  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors overflow-hidden"
    >
      {recipe.image_url && (
        <div className="relative h-48">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {(recipe.prep_time || recipe.cook_time) && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {formatTime(recipe.prep_time)}
                {recipe.prep_time && recipe.cook_time && " / "}
                {formatTime(recipe.cook_time)}
              </span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}