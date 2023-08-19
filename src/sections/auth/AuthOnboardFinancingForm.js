import axios from 'axios';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Stack } from '@mui/material';
// redux
import { getBrands } from '../../redux/slices/vehicle';
import { useDispatch, useSelector } from '../../redux/store';
// mock
import { licensestates as LICENSESTATES } from '../../_mock/map/licensestates';
// auth
import { fCurrency } from '../../utils/formatNumber';
// components
import FormProvider, {
  RHFAutocomplete,
  RHFNumberFormatField,
  RHFSelect,
} from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';

// ----------------------------------------------------------------------

AuthOnboardFinancingForm.propTypes = {
  endUser: PropTypes.string,
  onNextStep: PropTypes.func,
};

// ----------------------------------------------------------------------

export default function AuthOnboardFinancingForm({ endUser, onNextStep }) {
  const axiosInstance = axios.create({ baseURL: 'https://veiculos.fipe.org.br' });
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { brands } = useSelector((state) => state.vehicle);

  const [defaultVehicle, setDefaultVehicle] = useState(true);
  const [selectedDefaultVehicle, setSelectedDefaultVehicle] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [vehicleModels, setVehicleModels] = useState([]);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState(null);

  const [vehicleModelsByYear, setVehicleModelsByYear] = useState([]);

  const [vehicleModelYears, setVehicleModelYears] = useState([]);
  const [selectedVehicleYear, setSelectedVehicleYear] = useState(null);

  const [installmentValues, setInstallmentValues] = useState([]);

  const [financingInputValue, setFinancingInputValue] = useState('');
  const [timer, setTimer] = useState(null);

  const CreateFinancingSchema = Yup.object().shape({
    defaultVehicle: Yup.boolean().required('Selecione uma opção'),
    brand: Yup.lazy((value) =>
      value === false ? Yup.object().required('Selecione a marca') : Yup.mixed()
    ),
    year: Yup.lazy((value) =>
      value === false ? Yup.object().required('Selecione o ano') : Yup.mixed()
    ),
    model: Yup.lazy((value) =>
      value === false ? Yup.object().required('Selecione o modelo') : Yup.mixed()
    ),
    licenseState: Yup.lazy((value) =>
      value === false ? Yup.object().required('Selecione o estado') : Yup.mixed()
    ),
    value: Yup.string().when('defaultVehicle', {
      is: false,
      then: Yup.string().required('Informe o valor a financiar'),
    }),
    installment: Yup.string().when('defaultVehicle', {
      is: false,
      then: Yup.string().required('Selecione o número de parcelas'),
    }),
  });
  

  const defaultValues = {
    defaultVehicle: true,
    brand: '',
    year: '',
    model: '',
    licenseState: '',
    value: 0,
    installment: '',
  };

  const methods = useForm({
    resolver: yupResolver(CreateFinancingSchema),
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

  const [professionalSituation, setProfessionalSituation] = useState('Assalariado');

  const onSubmit = async (data) => {
    console.log(data);
    const createFinancingRequest = {
      endUser,
      brand: data?.brand?.Label,
      model: data?.model?.Label,
      year: data?.year?.Value?.split('-')[0],
      licensingState: data?.licenseState?.sigla,
      finacingValue: parseInt(
        data.value.replace(/R\$\s?([\d.]+),\d{2}/, '$1').replace(/\D/g, ''),
        10
      ),
      installment: data?.installment,
      defaultVehicle: data?.defaultVehicle,
    };

    try {
      const axiosInstanceApi = axios.create({ baseURL: 'https://finatech.azurewebsites.net' });
      const response = await axiosInstanceApi.post(
        '/api/v1/endusers/financings',
        createFinancingRequest
      );
      console.log(response);
      enqueueSnackbar('Financiamento criado com sucesso, preencha os dados seguintes', {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Financiamento com baixa probabilidade, preencha os dados seguintes', {
        variant: 'error',
      });
    }
    onNextStep();
  };

  const getVehicleModels = useCallback(async (brandId) => {
    try {
      const response = await axiosInstance.postForm('/api/veiculos/ConsultarModelos', {
        codigoTabelaReferencia: '299',
        codigoTipoVeiculo: '1',
        codigoMarca: brandId,
      });
      setVehicleModels(response.data);
    } catch (error) {
      console.error(error);
    }
  });

  const getVehicleModelsByYear = useCallback(async (yearId) => {
    try {
      const response = await axiosInstance.postForm('/api/veiculos/ConsultarModelosAtravesDoAno', {
        codigoTabelaReferencia: '299',
        codigoTipoVeiculo: '1',
        codigoMarca: selectedBrand?.Value,
        ano: yearId,
        codigoTipoCombustivel: '1',
        anoModelo: yearId?.split('-')[0],
      });
      setVehicleModelsByYear(response.data);
    } catch (error) {
      console.error(error);
    }
  });

  const getVehicleModelYears = useCallback(async (modelId) => {
    try {
      const response = await axiosInstance.postForm('/api/veiculos/ConsultarAnoModelo', {
        codigoTabelaReferencia: '299',
        codigoTipoVeiculo: '1',
        codigoMarca: selectedBrand?.Value,
        codigoModelo: modelId,
      });
      setVehicleModelYears(response.data);
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);

  const getInstallmentsValues = useCallback(async (financingValue) => {
    const year = parseInt(selectedVehicleYear?.Value?.split('-')[0], 10);
    try {
      const axiosInstanceApi = axios.create({ baseURL: 'https://finatech.azurewebsites.net' });
      const response = await axiosInstanceApi.get('/api/v1/financing-factors/installment', {
        params: {
          year,
          financingValue: parseInt(
            financingValue.replace(/R\$\s?([\d.]+),\d{2}/, '$1').replace(/\D/g, ''),
            10
          ),
        },
      });

      setInstallmentValues(response?.data?.installmentValues);
    } catch (error) {
      console.error(error);
    }
  });

  const inputChanged = (e) => {
    setValue('value', e.target.value);
    setFinancingInputValue(e.target.value);

    clearTimeout(timer);

    const newTimer = setTimeout(() => {
      getInstallmentsValues(e.target.value);
    }, 500);

    setTimer(newTimer);
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <RHFAutocomplete
            label="Veículo"
            placeholder="Selecione o veículo"
            name="defaultVehicle"
            options={[
              { Label: 'Já sei qual veículo desejo', Value: false },
              { Label: 'Ainda não sei qual veículo desejo', Value: true },
            ]}
            getOptionLabel={(vehicleBrand) => vehicleBrand.Label ?? ''}
            isOptionEqualToValue={(option, value) => option.Value === value.Value}
            value={selectedDefaultVehicle}
            onChange={(e, newValue) => {
              if (newValue) {
                setValue('defaultVehicle', newValue?.Value);
                setSelectedDefaultVehicle(newValue);
                setDefaultVehicle(newValue?.Value);
              }
            }}
          />
          {brands?.length > 0 && !defaultVehicle && (
            <RHFAutocomplete
              label="Marca"
              placeholder="Selecione a marca"
              name="brand"
              options={brands?.map((vehicleBrand) => vehicleBrand)}
              getOptionLabel={(vehicleBrand) => vehicleBrand.Label ?? ''}
              isOptionEqualToValue={(option, value) => option.Value === value.Value}
              value={selectedBrand}
              onChange={(e, newValue) => {
                if (newValue) {
                  setValue('brand', newValue);
                  setSelectedBrand(newValue);
                  getVehicleModels(newValue?.Value);
                  setVehicleModelsByYear([]);
                  setValue('year', '');
                }
              }}
            />
          )}

          {vehicleModels?.Anos?.length > 0 && (
            <RHFAutocomplete
              label="Ano"
              placeholder="Selecione o ano"
              name="year"
              options={vehicleModels?.Anos?.map((vehicleModelYear) => vehicleModelYear)}
              getOptionLabel={(vehicleModelYear) => vehicleModelYear.Label ?? ''}
              isOptionEqualToValue={(option, value) => option.Value === value.Value}
              value={selectedVehicleYear}
              onChange={(e, newValue) => {
                if (newValue) {
                  setValue('year', newValue);
                  setSelectedVehicleYear(newValue);
                  getVehicleModelsByYear(newValue?.Value);
                  setValue('model', '');
                }
              }}
            />
          )}

          {vehicleModelsByYear?.length > 0 && (
            <RHFAutocomplete
              label="Modelo"
              placeholder="Selecione o modelo"
              name="model"
              options={vehicleModelsByYear.map((vehicleModel) => vehicleModel)}
              getOptionLabel={(vehicleModel) => vehicleModel.Label ?? ''}
              isOptionEqualToValue={(option, value) => option.Value === value.Value}
              value={selectedVehicleModel}
              onChange={(e, newValue) => {
                if (newValue) {
                  setValue('model', newValue);
                  setSelectedVehicleModel(newValue);
                  getVehicleModelYears(newValue?.Value);
                }
              }}
            />
          )}

          {selectedVehicleModel && (
            <>
              <RHFAutocomplete
                label="UF Licenciamento"
                placeholder="Selecione o estado"
                name="licenseState"
                defaultValue={LICENSESTATES[0]}
                options={LICENSESTATES.map((licenseState) => licenseState)}
                getOptionLabel={(licenseState) => licenseState.nome ?? ''}
                isOptionEqualToValue={(option, value) => option.sigla === value.sigla}
                value={values.licenseState}
              />
              <RHFNumberFormatField
                name="value"
                label="Valor a financiar"
                value={values.value}
                onChange={inputChanged}
              />
            </>
          )}

          {installmentValues?.length > 0 && (
            <RHFSelect native name="installment" label="Parcelas">
              <option value="" />
              {installmentValues.map((financingFactor) => (
                <option key={financingFactor?.id} value={financingFactor?.id}>
                  {financingFactor?.installments}x de {fCurrency(financingFactor?.installmentValue)}
                </option>
              ))}
            </RHFSelect>
          )}

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{
              bgcolor: isSubmitSuccessful || isSubmitting ? 'grey.800' : 'text.primary',
              color: 'common.white',
              '&:hover': {
                bgcolor: isSubmitSuccessful || isSubmitting ? 'grey.800' : 'text.primary',
              },
            }}
          >
            Enviar
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
