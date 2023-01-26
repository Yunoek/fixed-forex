import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { formatCurrency } from '../../utils';
import classes from './ffVest.module.css';
import stores from '../../stores'
import {
  ERROR,
  FIXED_FOREX_VEST_DURATION,
  FIXED_FOREX_DURATION_VESTED
} from '../../stores/constants';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';

export default function ffLockDuration({ ibff, veIBFF, veIBFFOld }) {

  const [ lockLoading, setLockLoading ] = useState(false)

  const [selectedDate, setSelectedDate] = useState(moment().add(8, 'days').format('YYYY-MM-DD'));
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [selectedValue, setSelectedValue] = useState('week');

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false)
    }
    const errorReturned = () => {
      setLockLoading(false)
    }

    stores.emitter.on(ERROR, errorReturned);
    stores.emitter.on(FIXED_FOREX_DURATION_VESTED, lockReturned);
    return () => {
      stores.emitter.removeListener(ERROR, errorReturned);
      stores.emitter.removeListener(FIXED_FOREX_DURATION_VESTED, lockReturned);
    };
  }, []);

  useEffect(() => {
    if(veIBFF && veIBFF.vestingInfo && veIBFF.vestingInfo.lockEnds) {
      setSelectedDate(moment.unix(veIBFF.vestingInfo.lockEnds).format('YYYY-MM-DD'))
      setSelectedValue(null)
    }
  }, [ veIBFF ])

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedValue(null);
  }

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    let days = 0;
    switch (event.target.value) {
      case 'week':
        days = 8;
        break;
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 365;
        break;
      case 'years':
        days = 1461;
        break;
      default:
    }
    const newDate = moment().add(days, 'days').format('YYYY-MM-DD');

    setSelectedDate(newDate);
  }

  const onLock = () => {
    setLockLoading(true)

    const selectedDateUnix = moment(selectedDate).unix()
    stores.dispatcher.dispatch({ type: FIXED_FOREX_VEST_DURATION, content: { unlockTime: selectedDateUnix } })
  }

  return (
    <>
      <Grid container spacing={4}>
        <Grid item lg={8}>
          <div className={ classes.inputsContainer3 }>
            <div className={classes.textField}>
              <TextField
                fullWidth
                id="date"
                type="date"
                variant="outlined"
                className={classes.textField}
                onChange={handleDateChange}
                value={selectedDate}
                error={selectedDateError}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <div className={ classes.inline }>
                <Typography className={ classes.expiresIn }>Expires in </Typography>
                <RadioGroup className={classes.vestPeriodToggle} row aria-label="position" name="position" onChange={handleChange} value={selectedValue}>
                  <FormControlLabel value="week" control={<Radio color="primary" />} label="1 week" labelPlacement="left" />
                  <FormControlLabel value="month" control={<Radio color="primary" />} label="1 month" labelPlacement="left" />
                  <FormControlLabel value="year" control={<Radio color="primary" />} label="1 year" labelPlacement="left" />
                  <FormControlLabel value="years" control={<Radio color="primary" />} label="4 years" labelPlacement="left" />
                </RadioGroup>
              </div>
            </div>
          </div>
        </Grid>
        <Grid item lg={4}>
          <div className={ classes.actionsContainer3 }>
            <Button
              className={classes.actionBtn}
              variant='contained'
              size='large'
              color='primary'
              disabled={ lockLoading }
              onClick={ onLock }
              >
              <Typography className={ classes.actionButtonText }>{ lockLoading ? `Increasing Duration` : `Increase Duration` }</Typography>
              { lockLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
            </Button>
          </div>
        </Grid>
      </Grid>
    </>
  );
}
