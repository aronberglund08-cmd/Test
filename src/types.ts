export const categories = ["frukost", "lunch", "middag", "dessert", "bakning"] as const

export type Category = (typeof categories)[number]

export const categoryLabels: Record<Category, string> = {
  frukost: "Frukost",
  lunch: "Lunch",
  middag: "Middag",
  dessert: "Dessert",
  bakning: "Bakning",
}

export type Recipe = {
  id: string
  title: string
  category: Category
  summary: string
  minutes: number
  servings: number
  emoji: string
  ingredients: string[]
  steps: string[]
}
