import { createProcedure } from "@/app/(app)/procedures/actions";
import ProcedureForm from "@/app/(app)/procedures/procedure-form";

export default function NewProcedurePage() {
  return (
    <ProcedureForm
      action={createProcedure}
      backUrl="/procedures"
      title="Nouvel acte"
    />
  );
}
