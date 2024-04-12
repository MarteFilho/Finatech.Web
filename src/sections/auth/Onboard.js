// next
import { useRouter } from 'next/router';
// @mui
import { Link, Stack, Typography } from '@mui/material';
// layouts
import LoginLayout from '../../layouts/login';
// routes
//
import AuthOnboardForm from './AuthOnboardForm';

// ----------------------------------------------------------------------

export default function Onboard() {

  const {
    query: { key, type },
  } = useRouter();

  console.log(key, type);

  return (
    <LoginLayout title="Faça sua simulação">
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h2">
          Finatech
        </Typography>
        <Typography variant="h4">
          Encontre a melhor taxa e prazo e realize sua próxima conquista!
        </Typography>
      </Stack>

      <AuthOnboardForm partnerKey={key} partnerType={type} />

      <Typography
        component="div"
        sx={{ color: 'text.secondary', mt: 3, typography: 'caption', textAlign: 'center' }}
      >
        {'Ao enviar, Eu concordo com o '}
        <Link underline="always" color="text.primary">
          Termos de Uso
        </Link>
        {' e '}
        <Link underline="always" color="text.primary">
          Condições
        </Link>
        .
      </Typography>
    </LoginLayout>
  );
}
