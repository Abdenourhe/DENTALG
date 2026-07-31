import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        DENTALG
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Gérez votre cabinet dentaire en toute simplicité.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Connexion
        </Link>
        <Link
          href="/register"
          className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Créer un compte
        </Link>
      </div>
    </main>
  );
}
