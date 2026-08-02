import { getProcedure, updateProcedure } from "../../actions";
import ProcedureForm from "../../procedure-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProcedurePage({ params }: Props) {
  const { id } = await params;
  const procedure = await getProcedure(id);

  return (
    <ProcedureForm
      procedure={procedure}
      action={updateProcedure.bind(null, id)}
      backUrl="/procedures"
      title="Modifier l'acte"
    />
  );
}
