import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/routes/app/routes";

export default function GamePage() {
  return (
    <main className="grid min-h-svh place-items-center bg-secondary-main px-6 text-center text-secondary-light">
      <section className="max-w-md">
        <Button href={AppRoutes.home} variant="primary" className="mt-8">
          กลับ Lobby
        </Button>
      </section>
    </main>
  );
}
