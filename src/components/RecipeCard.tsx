import { Link } from "react-router-dom"
import { categoryLabels, type Recipe } from "../types.ts"

type RecipeCardProps = {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link className="card" to={`/recept/${recipe.id}`}>
      <div className="card-emoji" data-category={recipe.category} aria-hidden="true">
        {recipe.emoji}
      </div>
      <div className="card-body">
        <p className="eyebrow">{categoryLabels[recipe.category]}</p>
        <h2>{recipe.title}</h2>
        <p className="meta">
          {recipe.minutes} min · {recipe.servings} portioner
        </p>
      </div>
    </Link>
  )
}
