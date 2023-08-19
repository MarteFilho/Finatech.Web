import { TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

// ----------------------------------------------------------------------
RHFNumberFormatField.propTypes = {
  name: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFNumberFormatField({ name, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <NumericFormat
          customInput={TextField}
          thousandSeparator="."
          allowNegative={false}
          allowedDecimalSeparators={[',']}
          decimalSeparator=","
          prefix="R$ "
          value={field.value}
          max={999000}
          displayType="input"
          decimalScale={2}
          fixedDecimalScale={true}
          valueIsNumericString={false}
          onValueChange={(values) => {
            field.onChange(values.floatValue || 0);
          }}
          fullWidth
          error={!!error}
          helperText={error ? error.message : helperText}
          {...other}
        />
      )}
    />
  );
}
