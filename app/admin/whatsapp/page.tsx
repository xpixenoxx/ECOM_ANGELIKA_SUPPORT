import { getWhatsAppConversationsData } from '@/lib/actions/admin-whatsapp';
import WhatsAppClient from './WhatsAppClient';

export const dynamic = 'force-dynamic';

export default async function WhatsAppPage() {
  const initialData = await getWhatsAppConversationsData();
  return <WhatsAppClient initialData={initialData} />;
}
