import { DiskCalculator } from "@/modules/tools/infrastructure/components/DiskCalculator";
import { RestTimer } from "@/modules/tools/infrastructure/components/RestTimer";
import { Wrench } from "lucide-react";

export default function ToolsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Herramientas</h1>
                <p className="text-muted-foreground">Utilidades para optimizar tu entrenamiento.</p>
            </header>

            <div className="grid gap-4 md:gap-8 md:grid-cols-2 w-full overflow-hidden">
                <DiskCalculator />
                <RestTimer />
            </div>
        </div>
    );
}
