import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/fipeAxios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: null,
  brands: [],
};

const slice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // CREATE ENDUSER
    getBrandsSuccess(state, action) {
      state.isLoading = false;
      state.brands = action.payload;
    }
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getBrands() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.postForm('/api/veiculos/ConsultarMarcas', {
        codigoTabelaReferencia: '299',
        codigoTipoVeiculo: '1',
      });
      dispatch(slice.actions.getBrandsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getProduct(name) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/products/product', {
        params: { name },
      });
      dispatch(slice.actions.getProductSuccess(response.data.product));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}
