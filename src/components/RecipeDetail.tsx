import { Link, useParams } from "react-router-dom"
import { recipes } from "../data/recipes.ts"
import { categoryLabels } from "../types.ts"

export default function RecipeDetail() {
  const { id } = useParams()
  const recipe = recipes.find((item) => item.id === id)

  if (!recipe) {
    return (
      <section className="missing">
        <h1>Receptet finns inte</h1>
        <p>Det finns inget recept med den adressen.</p>
        <Link className="text-link" to="/">
          Tillbaka till recepten
        </Link>
      </section>
    )
  }

  return (
    <article className="detail">
      <Link className="text-link back" to="/">
        Tillbaka till recepten
      </Link>
      <div className="detail-hero" data-category={recipe.category} aria-hidden="true">
        <span>{recipe.emoji}</span>
      </div>
      <p className="eyebrow">{categoryLabels[recipe.category]}</p>
      <h1>{recipe.title}</h1>
      <p className="summary">{recipe.summary}</p>
      <p className="meta">
        {recipe.minutes} min · {recipe.servings} portioner
      </p>

      <h2>Ingredienser</h2>
      <ul className="ingredients">
        {recipe.ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>

      <h2>Gör så här</h2>
      <ol className="steps">
        {recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  )
}
