import axios from 'axios';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Stack } from '@mui/material';
// components
import FormProvider, {
  RHFAutocomplete,
  RHFNumberFormatField,
  RHFTextField,
} from '../../components/hook-form';
// utils
import { roles as ROLES } from '../../_mock/arrays/_roles';
import { professionalsituations as PROFESSIONALSITUATIONS } from '../../_mock/map/professionalsituations';
// ----------------------------------------------------------------------

AuthOnboardProfessionalForm.propTypes = {
  endUser: PropTypes.string,
  onNextStep: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function AuthOnboardProfessionalForm({ endUser, onNextStep }) {
  const CreateProfessionalSchema = Yup.object().shape({
    professionalSituation: Yup.string().nullable().notOneOf(['Selecione'], 'Selecione uma situação profissional').required('Selecione uma situação profissional'),
    grossIncome: Yup.string().required('Informe a renda mensal'),
    serviceTime: Yup.string().required('Informe o tempo de serviço'),

    company: Yup.lazy((value) => {
      if (
        values.professionalSituation === 'Assalariado' ||
        values.professionalSituation === 'Funcionário Público' ||
        values.professionalSituation === 'Empresário'
      ) {
        return Yup.object({
          name: Yup.string().required('Informe o nome da empresa'),
        });
      }
      if (values.professionalSituation === 'Empresário') {
        return Yup.object({
          registry: Yup.string().required('Digite o CNPJ'),
          address: Yup.object().shape({
            zipCode: Yup.string().required('Digite o CEP'),
            street: Yup.string().required('Digite o endereço'),
            number: Yup.string().required('Digite o número'),
            complement: Yup.string(),
            neighborhood: Yup.string().required('Digite o bairro'),
            city: Yup.string().required('Digite a cidade'),
            state: Yup.string().required('Digite o estado'),
          }),
        });
      }
      return Yup.object({});
    }),

    role: Yup.lazy((value) => {
      if (
        values.professionalSituation === 'Assalariado' ||
        values.professionalSituation === 'Funcionário Público' ||
        values.professionalSituation === 'Autônomo'
      ) {
        return Yup.string().nullable().required('Selecione uma profissão');
      }
      return Yup.string().nullable();
    }),
  });

  const defaultValues = {
    professionalSituation: 'Assalariado',
    role: capitalizeWord(ROLES[0]),
    grossIncome: '',
    retirementTime: 0,
    serviceTime: 0,
    company: {
      name: '',
      registry: '',
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
  };

  const methods = useForm({
    resolver: yupResolver(CreateProfessionalSchema),
    defaultValues,
  });

  const {
    register,
    getValues,
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

  const getOccupationType = (professionalSituation) => {
    switch (professionalSituation) {
      case 'Assalariado':
        return 1;
      case 'Aposentado':
        return 2;
      case 'Empresário':
        return 3;
      case 'Funcionário Público':
        return 4;
      case 'Autônomo':
        return 5;

      default:
        return 0;
    }
  };

  const onSubmit = async (data) => {
    try {
      const createOccupationRequest = {
        endUser,
        role: data.role,
        grossIncome: data.grossIncome,
        serviceTime: data.serviceTime,
        retirementTime: data.retirementTime ?? 0,
        type: getOccupationType(data.professionalSituation),
        company: {
          name: data.company?.name.trim(),
        },
      };

      if (data.professionalSituation === 'Empresário') {
        createOccupationRequest.company.registry = data.company?.registry;
        createOccupationRequest.company.address = {
          zipCode: data.company?.address?.zipCode,
          street: data.company?.address?.street,
          number: data.company?.address?.number,
          complement: data.company?.address?.complement,
          neighborhood: data.company?.address?.neighborhood,
          city: data.company?.address?.city,
          state: data.company?.address?.state,
        };
      }

      const axiosInstanceApi = axios.create({ baseURL: 'https://finatech-api.azurewebsites.net' });
      const response = await axiosInstanceApi.post(
        '/api/v1/endusers/occupations',
        createOccupationRequest
      );
      onNextStep();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchAddress = async (event) => {
    try {
      const { data } = await axios.get(`https://brasilapi.com.br/api/cep/v2/${event.target.value}`);
      setValue('company.address.city', data.city);
      setValue('company.address.state', data.state);
      setValue('company.address.neighborhood', data.neighborhood);
      setValue('company.address.street', data.street);
    } catch (error) {
      console.error(error);
    }
  };

  function capitalizeWords(arr) {
    return arr.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();

      return firstLetter + rest;
    });
  }

  function capitalizeWord(word) {
    const firstLetter = word.charAt(0).toUpperCase();
    const rest = word.slice(1).toLowerCase();

    return firstLetter + rest;
  }

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <RHFAutocomplete
            label="Situação profissional"
            placeholder="Selecione uma situação profissional"
            name="professionalSituation"
            options={PROFESSIONALSITUATIONS}
            isOptionEqualToValue={(option, value) => option === value}
            onChange={(event, newValue) => {
              reset();
              setValue('professionalSituation', newValue, { shouldValidate: true });
            }}
          />

          {values.professionalSituation === 'Assalariado' && (
            <>
              <RHFTextField name="company.name" label="Nome da empresa" />
              {values.professionalSituation === 'Assalariado' && (
                <RHFAutocomplete
                  label="Profissão"
                  placeholder="Selecione uma profissão"
                  name="role"
                  options={capitalizeWords(ROLES)}
                  getOptionLabel={(option) => capitalizeWord(option)}
                  isOptionEqualToValue={(option, value) => option === value}
                />
              )}
            </>
          )}

          {values.professionalSituation === 'Empresário' && (
            <RHFTextField name="company.name" label="Nome da sua empresa" />
          )}

          {values.professionalSituation === 'Funcionário Público' && (
            <>
              <RHFTextField name="company.name" label="Nome da instituição" />
              <RHFAutocomplete
                label="Profissão"
                placeholder="Selecione uma profissão"
                name="role"
                options={capitalizeWords(ROLES)}
                getOptionLabel={(option) => capitalizeWord(option)}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </>
          )}

          {values.professionalSituation === 'Autônomo' && (
            <RHFAutocomplete
              label="Profissão"
              placeholder="Selecione uma profissão"
              name="role"
              options={capitalizeWords(ROLES)}
              isOptionEqualToValue={(option, value) => option === value}
            />
          )}

          <RHFNumberFormatField name="grossIncome" label="Renda mensal" />

          {values.professionalSituation === 'Aposentado' ? (
            <RHFTextField type="number" name="retirementTime" label="Tempo de aposentadoria" />
          ) : (
            <RHFTextField type="number" name="serviceTime" label="Tempo de serviço" />
          )}
          {values.professionalSituation === 'Empresário' && (
            <>
              <RHFTextField name="company.registry" label="CNPJ" />
              <InputMask
                mask="99999-999"
                value={values.zipCode}
                maskChar=" "
                onChange={(event) => {
                  setValue('company.address.zipCode', event.target.value);
                }}
                onBlur={(event) => handleSearchAddress(event)}
              >
                {() => <RHFTextField name="company.address.zipCode" label="CEP" />}
              </InputMask>

              <RHFTextField name="company.address.street" label="Endereço" />
              <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2}>
                <RHFTextField type="number" name="company.address.number" label="Número" />
                <RHFTextField name="company.address.complement" label="Complemento" />
              </Stack>

              <RHFTextField name="company.address.neighborhood" label="Bairro" />
              <RHFTextField name="company.address.city" label="Cidade" />
              <RHFTextField name="company.address.state" label="Estado" disabled />
            </>
          )}

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            variant="contained"
            type="submit"
            loading={isSubmitting}
            sx={{
              bgcolor: isSubmitSuccessful || isSubmitting ? 'grey.800' : 'text.primary',
              color: 'common.white',
              '&:hover': {
                bgcolor: isSubmitSuccessful || isSubmitting ? 'grey.800' : 'text.primary',
              },
            }}
          >
            Enviar dados
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
