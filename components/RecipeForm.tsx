"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recipeSchema } from "@/lib/validations/recipes";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

interface RecipeFormProps {
  boardId: string;
}

export function RecipeForm({ boardId }: RecipeFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Invalid file type. Allowed: jpeg, png, webp, gif");
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setError("File too large. Max size: 5MB");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("boardId", boardId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to upload image");
        return;
      }

      setImageUrl(data.url);
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const filteredIngredients = ingredients.filter((i) => i.trim() !== "");

    const formData = {
      title,
      description: description || undefined,
      ingredients: filteredIngredients,
      instructions,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      cookTime: cookTime ? parseInt(cookTime) : undefined,
      servings: servings ? parseInt(servings) : undefined,
      imageUrl: imageUrl || undefined,
      boardId,
    };

    const result = recipeSchema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      setError(errors);
      setLoading(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from("recipes")
        .insert(formData)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push(`/dashboard/board/${boardId}`);
      router.refresh();
    } catch (err) {
      setError("An error occurred while saving the recipe");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="My Recipe"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="A brief description of your recipe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          {imagePreview || imageUrl ? (
            <div className="space-y-1 text-center">
              <div className="relative h-48 w-64 mx-auto">
                <img
                  src={imagePreview || imageUrl}
                  alt="Preview"
                  className="h-48 w-64 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Change image</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              {uploading ? (
                <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              ) : (
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">
            Prep Time (min)
          </label>
          <input
            id="prepTime"
            type="number"
            min="0"
            max="1440"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="15"
          />
        </div>
        <div>
          <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700">
            Cook Time (min)
          </label>
          <input
            id="cookTime"
            type="number"
            min="0"
            max="1440"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="30"
          />
        </div>
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
            Servings
          </label>
          <input
            id="servings"
            type="number"
            min="1"
            max="100"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="4"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ingredients *
        </label>
        <div className="mt-1 space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Ingredient ${index + 1}`}
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            + Add ingredient
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
          Instructions *
        </label>
        <textarea
          id="instructions"
          required
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Step by step instructions..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading || uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Save Recipe
        </button>
      </div>
    </form>
  );
}