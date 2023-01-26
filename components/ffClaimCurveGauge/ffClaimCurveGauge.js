import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';

import { formatCurrency } from '../../utils';
import classes from './ffClaimCurveGauge.module.css';

import stores from '../../stores'
import { ERROR, FIXED_FOREX_CLAIM_CURVE_REWARDS, FIXED_FOREX_CURVE_REWARD_CLAIMED } from '../../stores/constants';

export default function ffClaimCurveGauge({ asset }) {

  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
    const rewardClaimed = () => {
      setLoading(false)
    }

    stores.emitter.on(FIXED_FOREX_CURVE_REWARD_CLAIMED, rewardClaimed);
    stores.emitter.on(ERROR, rewardClaimed);
    return () => {
      stores.emitter.removeListener(FIXED_FOREX_CURVE_REWARD_CLAIMED, rewardClaimed);
      stores.emitter.removeListener(ERROR, rewardClaimed);
    };
  }, []);

  const claim = () => {
    if(BigNumber(asset && asset.gauge ? asset.gauge.earned : 0).gt(0)) {
      setLoading(true)
      stores.dispatcher.dispatch({ type: FIXED_FOREX_CLAIM_CURVE_REWARDS, content: { asset }})
    }
  }

  return (
    <div className={ classes.container}>
      <Paper elevation={0} className={ classes.lpOptionsContainer }>
        <div className={ classes.lpOption } onClick={ () => { claim() } }>
        <Grid container spacing={2}>
          <Grid item lg={12} md={12} xs={12}>
            <div className={ classes.lpOptionTitle }>
              <img className={ classes.lpOptionIcon } src='/images/Curve.png' alt='Curve Logo' width={ 60 } height={ 60 } />
              <div>
                <Typography className={ classes.lpOptionName }>Curve</Typography>
                <Typography className={ classes.lpOptionDescription }>Gauge Rewards</Typography>
              </div>
            </div>
          </Grid>
          <Grid item lg={12} md={12} xs={12}>
            <div>
              <Typography className={ classes.amountText }>{ formatCurrency(asset && asset.gauge ? asset.gauge.earned : 0) } CRV</Typography>
              { BigNumber(asset && asset.gauge ? asset.gauge.earned : 0).gt(0) &&
                <div>
                  <Typography className={classes.dollarValue}>
                  ${ formatCurrency(asset && asset.gauge ? asset.gauge.earned : 0) }
                  &nbsp;(Pull Dollar value here)
                  </Typography>
                </div>
              }
            </div>
          </Grid>
          <Grid item lg={12} md={12} xs={12}>
            <div className={ classes.center}>
              { BigNumber(asset && asset.gauge ? asset.gauge.earned : 0).gt(0) &&
                <Typography className={classes.iHazRewardz}>Claim Now</Typography>
              }
              { !BigNumber(asset && asset.gauge ? asset.gauge.earned : 0).gt(0) &&
                <Typography className={classes.iHazNoRewardz}>Stake in gauge to earn rewards</Typography>
              }
            </div>
          </Grid>
        </Grid>
        { BigNumber(asset && asset.gauge ? asset.gauge.earned : 0).gt(0) &&
          <div className={ classes.activeIcon }></div>
        }
      </div>
      </Paper>
    </div>
  );
}
