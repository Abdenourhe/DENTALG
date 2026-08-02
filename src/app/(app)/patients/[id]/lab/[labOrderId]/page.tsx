import { getLabOrder } from "@/app/(app)/lab/actions";
import LabOrderDetail, { type LabOrder } from "./lab-order-detail";

interface Props {
  params: Promise<{ id: string; labOrderId: string }>;
}

export default async function LabOrderDetailPage({ params }: Props) {
  const { id, labOrderId } = await params;
  const order = await getLabOrder(labOrderId);

  return (
    <LabOrderDetail
      order={order as unknown as LabOrder}
      backUrl={`/patients/${id}/lab`}
    />
  );
}
