import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
// form
import { Controller, useFormContext } from 'react-hook-form';
// @mui
import { TextField } from '@mui/material';

// ----------------------------------------------------------------------

RHFInputMaskField.propTypes = {
  name: PropTypes.string,
  helperText: PropTypes.node,
  mask: PropTypes.string,
};

export default function RHFInputMaskField({ name, helperText, mask, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <InputMask mask={mask} value={field.value || ''} onChange={field.onChange} onBlur={
          field.onBlur
        }>
          {() => (
            <TextField
              {...field}
              fullWidth
              error={!!error}
              helperText={error ? error.message : helperText}
              {...other}
            />
          )}
        </InputMask>
      )}
    />
  );
}
