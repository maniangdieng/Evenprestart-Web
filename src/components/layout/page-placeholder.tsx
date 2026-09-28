import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
          {description && <p className="mt-3 text-muted">{description}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}
