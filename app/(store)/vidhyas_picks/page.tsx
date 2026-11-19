import { redirect } from 'next/navigation';

// ISR: rebuilds at most every 600s
export const revalidate = 600;

export default function VidhyasPicksRedirect() {
  redirect('/vidhyas-picks');
}
