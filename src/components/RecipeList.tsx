import { useMemo, useState } from "react"
import { recipes } from "../data/recipes.ts"
import { categories, categoryLabels, type Category } from "../types.ts"
import RecipeCard from "./RecipeCard.tsx"

type Filter = Category | "alla"

const filters: { id: Filter; label: string }[] = [
  { id: "alla", label: "Alla" },
  ...categories.map((id) => ({ id, label: categoryLabels[id] })),
]

function matchesQuery(title: string, ingredients: string[], query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [title, ...ingredients].join(" ").toLowerCase()
  return haystack.includes(needle)
}

export default function RecipeList() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Filter>("alla")

  const visible = useMemo(
    () =>
      recipes.filter(
        (recipe) =>
          (category === "alla" || recipe.category === category) &&
          matchesQuery(recipe.title, recipe.ingredients, query),
      ),
    [category, query],
  )

  return (
    <section className="list">
      <header className="page-intro">
        <h1>Kokbok</h1>
        <p>Bläddra bland recepten, sök på namn eller ingrediens och filtrera på kategori.</p>
      </header>

      <form className="search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="recipe-search">Sök</label>
        <input
          id="recipe-search"
          type="search"
          value={query}
          placeholder="Till exempel tomat eller pannkaka"
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>

      <div className="filters" role="group" aria-label="Kategori">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={category === filter.id}
            onClick={() => setCategory(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <p className="count" aria-live="polite">
        {visible.length === 0 ? "Inga recept" : `Visar ${visible.length} recept`}
      </p>

      {visible.length === 0 ? (
        <p className="empty">Inga recept matchade sökningen. Prova ett annat ord eller en annan kategori.</p>
      ) : (
        <ul className="grid">
          {visible.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
