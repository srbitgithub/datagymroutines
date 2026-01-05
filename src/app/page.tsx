import Link from "next/link";
import { Dumbbell, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-brand-primary/10 p-4">
            <Dumbbell className="h-12 w-12 text-brand-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl">
          DataGym
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground text-lg sm:text-xl">
          La tecnología invisible para atletas de alto rendimiento. Registro de fuerza puro, sin distracciones.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-md bg-brand-primary px-8 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Empezar a entrenar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
