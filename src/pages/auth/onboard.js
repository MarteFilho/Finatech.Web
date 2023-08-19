// next
import Head from 'next/head';
// auth
import GuestGuard from '../../auth/GuestGuard';
// sections
import Onboard from '../../sections/auth/Onboard';

// ----------------------------------------------------------------------

export default function OnboardPage() {
  return (
    <>
      <Head>
        <title> Onboard | Finatech</title>
      </Head>

      <GuestGuard>
        <Onboard />
      </GuestGuard>
    </>
  );
}
