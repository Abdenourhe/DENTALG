import { signIn } from "../../../../auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            ...Object.fromEntries(formData.entries()),
            redirectTo: "/dashboard",
          });
        }}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold">Connexion</h1>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          className="w-full rounded border p-2"
        />
        <input name="provider" type="hidden" value="clinic" />
        <button
          type="submit"
          className="w-full rounded bg-foreground p-2 text-background"
        >
          Se connecter
        </button>
        <p className="text-sm">
          Pas de compte ?{" "}
          <Link href="/register" className="underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </main>
  );
}
