import { getWhatsAppFlowsConfig } from '@/lib/actions/admin-whatsapp';
import FlowsClient from './FlowsClient';

export const dynamic = 'force-dynamic';

export default async function WhatsAppFlowsPage() {
  const initialFlows = await getWhatsAppFlowsConfig();
  return <FlowsClient initialFlows={initialFlows} />;
}
