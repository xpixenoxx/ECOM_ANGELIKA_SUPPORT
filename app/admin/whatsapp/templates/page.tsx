import { getWhatsAppContextData } from '@/lib/actions/admin-whatsapp';
import TemplatesClient from './TemplatesClient';

export const dynamic = 'force-dynamic';

export default async function WhatsAppTemplatesPage() {
  const contextData = await getWhatsAppContextData();
  return <TemplatesClient initialData={contextData} />;
}
