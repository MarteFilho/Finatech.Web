import axios from 'axios';
import { useState } from 'react';
import * as Yup from 'yup';
  // form
import { yupResolver } from '@hookform/resolvers/yup';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { Controller, useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Grid, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// hooks
import useIsMountedRef from '../../hooks/useIsMountedRef';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import FormProvider, {
  RHFCheckbox,
  RHFInputMaskField,
  RHFTextField,
} from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';
import AuthOnboardAddressForm from './AuthOnboardAddressForm';
import AuthOnboardFinancingForm from './AuthOnboardFinancingForm';
import AuthOnboardProfessionalForm from './AuthOnboardProfessionalForm';
// utils
import OnboardSteps from '../@dashboard/onboard/OnboardSteps';
// assets
import { MotivationIllustration } from '../../assets/illustrations';

// ----------------------------------------------------------------------

const STEPS = ['Dados pessoais', 'Endereço', 'Veículo', 'Dados profissionais'];

// ----------------------------------------------------------------------

export default function AuthOnboardForm() {
  const isMountedRef = useIsMountedRef();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [endUser, setEndUser] = useState(null);

  const { register } = useAuthContext();

  const [activeStep, setActiveStep] = useState(0);
  const completed = activeStep === STEPS.length;

  const { enduser, isLoading } = useSelector((state) => state.enduser);

  const handleNextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required('Digite o seu nome completo'),
    motherName: Yup.string().required('Digite o nome completo da sua mãe'),
    document: Yup.string()
      .length(14, 'O CPF deve conter 11 caracteres')
      .required('Preencha o documento')
      .test('document', 'CPF inválido', (value) => {
        if (value === '___.___.___-__') {
          return true;
        }
        if (value && value.length < 14) {
          return true;
        }
        return cpfValidator.isValid(value);
      }),
    nationalIdentification: Yup.string().required('Digite o seu RG').length(12, 'O RG deve conter no minimo 12 caracteres'),
    birthDate: Yup.string().required('Digite a sua data de nascimento'),
    phone: Yup.string().required('Digite o seu telefone'),
    email: Yup.string().required('Digite o seu E-mail').email('O E-mail deve ser válido'),
  });

  const defaultValues = {
    fullName: '',
    motherName: '',
    document: '',
    nationalIdentification: '',
    birthDate: '',
    phone: '',
    email: '',
    hasDriverLicense: false,
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    control,
    watch,
    trigger,
  } = methods;

  const values = watch();

  const onSubmit = async (data) => {
    const birthDate = new Date(data.birthDate);
    const year = birthDate.getFullYear();
    const month = String(birthDate.getMonth() + 1).padStart(2, '0');
    const day = String(birthDate.getDate()).padStart(2, '0');

    const formattedBirthDate = `${year}-${month}-${day}`;
    const formatedDocument = data?.document?.replace('.', '').replace('.', '').replace('-', '');
    const formatedNationalIdentification = data?.nationalIdentification
      .replace('.', '')
      .replace('.', '')
      .replace('-', '')
      .replace('_', '');
    const cleanedPhoneNumber = data?.phone?.replace(/[^\d]/g, '');

    const createEndUserRequest = {
      fullName: data?.fullName,
      motherName: data?.motherName,
      document: formatedDocument,
      nationalIdentification: formatedNationalIdentification,
      birthDate: formattedBirthDate,
      email: data?.email,
      phone: cleanedPhoneNumber,
      hasDriverLicense: data?.hasDriverLicense,
    };
    try {
      const axiosInstanceApi = axios.create({ baseURL: 'https://finatech.azurewebsites.net' });
      const response = await axiosInstanceApi.post('/api/v1/endusers', createEndUserRequest);
      setEndUser(response?.data);
      handleNextStep();
    } catch (error) {
      console.error(error);
      setError('afterSubmit', {
        ...error,
        message: 'Erro ao criar usuário',
      });
    }
  };

  return (
    <>
      <Grid container justifyContent={completed ? 'center' : 'flex-start'}>
        <Grid item xs={12} md={12}>
          <OnboardSteps activeStep={activeStep} steps={STEPS} />
        </Grid>
      </Grid>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

          {activeStep === 0 && (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RHFTextField name="fullName" label="Nome completo" />
              </Stack>

              <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2}>
                <RHFInputMaskField name="document" label="CPF" mask="999.999.999-99" />
                <RHFInputMaskField name="nationalIdentification" label="RG" mask="99.999.999-9" />
              </Stack>
              <RHFTextField name="motherName" label="Nome da mãe (completo)" />

              <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Data de nascimento"
                      value={field.value}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      inputFormat="dd/MM/yyyy"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                      views={['day', 'month', 'year']}
                    />
                  )}
                />
                <RHFCheckbox name="hasDriverLicense" label="Possui CNH?" />
              </Stack>

              <RHFTextField name="email" label="E-mail" />

              <RHFInputMaskField name="phone" label="Telefone" mask="(+55) 99 99999-9999" />

              <LoadingButton
                fullWidth
                color="inherit"
                size="large"
                variant="contained"
                loading={isSubmitSuccessful || isSubmitting}
                type="submit"
                sx={{
                  bgcolor: isSubmitSuccessful || isSubmitting ? 'grey.800' : 'text.primary',
                  color: 'common.white',
                  '&:hover': {
                    bgcolor: isSubmitSuccessful || isSubmitting ? 'grey.800' : 'text.primary',
                  },
                }}
              >
                Continuar
              </LoadingButton>
            </>
          )}
        </Stack>
      </FormProvider>

      {activeStep === 1 && (
        <AuthOnboardAddressForm endUser={endUser?.id} onNextStep={handleNextStep} />
      )}

      {activeStep === 2 && (
        <AuthOnboardFinancingForm endUser={endUser?.id} onNextStep={handleNextStep} />
      )}

      {activeStep === 3 && (
        <AuthOnboardProfessionalForm endUser={endUser?.id} onNextStep={handleNextStep} />
      )}

      {completed && (
        <>
          <Grid container justifyContent="center">
            {/* Added container for centering */}
            <Grid item xs={12} md={8}>
              <Stack spacing={2.5}>
                <Typography variant="h4">Obrigado por confiar na Finatech!</Typography>
                <Typography>
                  Em breve um de nossos consultores entrará em contato com você.
                </Typography>
                <MotivationIllustration
                  sx={{
                    p: 3,
                    width: 360,
                    margin: { xs: 'auto', md: 'inherit' },
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
