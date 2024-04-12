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
// redux
// hooks
// auth
// components
import FormProvider, { RHFTextField } from '../../components/hook-form';
// utils
// ----------------------------------------------------------------------

AuthOnboardAddressForm.propTypes = {
  endUser: PropTypes.string,
  onNextStep: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function AuthOnboardAddressForm({ endUser, onNextStep }) {
  const CreateAddressSchema = Yup.object().shape({
    zipCode: Yup.string().required('Digite o CEP'),
    street: Yup.string().required('Digite o endereço'),
    number: Yup.string().required('Digite o número'),
    complement: Yup.string(),
    neighborhood: Yup.string().required('Digite o bairro'),
    city: Yup.string().required('Digite a cidade'),
    state: Yup.string().required('Digite o estado'),
  });

  const defaultValues = {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  };

  const methods = useForm({
    resolver: yupResolver(CreateAddressSchema),
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

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const createAddressRequest = {
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        endUser,
      };

      const axiosInstanceApi = axios.create({ baseURL: 'https://finatech-api.azurewebsites.net' });
      const response = await axiosInstanceApi.post(
        '/api/v1/endusers/adresses',
        createAddressRequest
      );
      onNextStep();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchAddress = async (event) => {
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${event.target.value}/json/`);
      setValue('city', data.localidade);
      setValue('state', data.uf);
      setValue('neighborhood', data.bairro);
      setValue('street', data.logradouro);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <InputMask
            mask="99999-999"
            value={values.zipCode}
            maskChar=" "
            onChange={(event) => {
              setValue('zipCode', event.target.value);
            }}
            onBlur={(event) => handleSearchAddress(event)}
          >
            {() => <RHFTextField name="zipCode" label="CEP" />}
          </InputMask>

          <RHFTextField name="street" label="Endereço" />
          <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2}>
            <RHFTextField type="number" name="number" label="Número" />
            <RHFTextField name="complement" label="Complemento" />
          </Stack>

          <RHFTextField name="neighborhood" label="Bairro" />
          <RHFTextField name="city" label="Cidade" />
          <RHFTextField name="state" label="Estado" />

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
            Continuar
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
