import type { Category } from "@/src/lib/domain";
import { ON_BODY, SHOTS, STUDIO, VINTED, shotsFor } from "@/src/lib/photos";

export function PhotoGuide({ category, part = "all" }: { category?: Category; part?: "all" | "product" | "body" }) {
  const shots = category ? shotsFor(category) : SHOTS;
  return (
    <div className="guide">
      {part !== "body" ? (
        <>
          <h2>{STUDIO.title}</h2>
          <ol>
            {STUDIO.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {shots.map((shot) => (
            <section key={shot.id}>
              <h2>{shot.title}</h2>
              <ol>
                {shot.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          ))}
          <h2>{VINTED.title}</h2>
          <ol>
            {VINTED.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </>
      ) : null}
      {part !== "product" ? (
        <>
          <h2>{ON_BODY.title}</h2>
          <ol>
            {ON_BODY.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h2>Det du tittar efter</h2>
          <ul>
            {ON_BODY.lookFor.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
