import React, { useState, useEffect } from 'react';
import { Paper, Typography, SvgIcon, Button, TextField, InputAdornment, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Skeleton from '@material-ui/lab/Skeleton';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import TimerIcon from '@material-ui/icons/Timer';

import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ffStakeOverview.module.css';

import stores from '../../stores'
import { FIXED_FOREX_UPDATED } from '../../stores/constants';

function BalanceIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 32 32" strokeWidth="1" className={className}>
    <g strokeWidth="2" transform="translate(0, 0)"><line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="28" y1="12" x2="25" y2="12" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="21" y1="12" x2="19" y2="12" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="15" y1="12" x2="13" y2="12" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="9" y1="12" x2="7" y2="12" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="3" y1="12" x2="1" y2="12" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="28" y1="26" x2="25" y2="26" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="21" y1="26" x2="19" y2="26" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="15" y1="26" x2="13" y2="26" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="9" y1="26" x2="7" y2="26" strokeLinejoin="miter"></line> <line fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" x1="3" y1="26" x2="1" y2="26" strokeLinejoin="miter"></line> <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M28,16V8h-6H9H4 C2.343,8,1,6.657,1,5v21c0,2.209,1.791,4,4,4h23v-8" strokeLinejoin="miter"></path> <path data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M31,22h-7 c-1.657,0-3-1.343-3-3v0c0-1.657,1.343-3,3-3h7V22z" strokeLinejoin="miter"></path> <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M22,4V2H4 C2.343,2,1,3.343,1,5v0c0,1.657,1.343,3,3,3" strokeLinejoin="miter"></path></g>
  </SvgIcon>
  );
}

function VestedBalanceIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 32 32" strokeWidth="1" className={className}>
      <g strokeWidth="2" transform="translate(0, 0)"><polyline fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" points="14,8 14,14 8,14 " strokeLinejoin="miter"></polyline> <path data-cap="butt" data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M19,20v4c0,1.657,2.686,3,6,3 s6-1.343,6-3v-4" strokeLinejoin="miter" strokeLinecap="butt"></path> <path data-cap="butt" data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M19,24v4c0,1.657,2.686,3,6,3 s6-1.343,6-3v-4" strokeLinejoin="miter" strokeLinecap="butt"></path> <ellipse data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" cx="25" cy="20" rx="6" ry="3" strokeLinejoin="miter"></ellipse> <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" d="M15,26.962 C14.67,26.987,14.336,27,14,27C6.82,27,1,21.18,1,14S6.82,1,14,1c6.843,0,12.452,5.288,12.962,12" strokeLinejoin="miter"></path></g>
    </SvgIcon>
  );
}

function IbBalanceIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 32 32" strokeWidth="1" className={className}>
      <g strokeWidth="2" transform="translate(0, 0)"><path data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M1,5v4c0,1.657,2.686,3,6,3 s6-1.343,6-3V5" strokeLinejoin="miter" strokeLinecap="butt"></path> <path data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M1,9v4c0,1.657,2.686,3,6,3 s6-1.343,6-3V9" strokeLinejoin="miter" strokeLinecap="butt"></path> <line data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" x1="13" y1="16.401" x2="13" y2="13" strokeLinejoin="miter" strokeLinecap="butt"></line> <path data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M1,13v4c0,1.657,2.686,3,6,3 c1.093,0,2.117-0.147,3-0.402" strokeLinejoin="miter" strokeLinecap="butt"></path> <path data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M1,17v4c0,1.657,2.686,3,6,3 c1.093,0,2.118-0.147,3-0.402" strokeLinejoin="miter" strokeLinecap="butt"></path> <ellipse fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" cx="7" cy="5" rx="6" ry="3" strokeLinejoin="miter"></ellipse> <path data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M19,9v4c0,1.657,2.686,3,6,3 s6-1.343,6-3V9" strokeLinejoin="miter" strokeLinecap="butt"></path> <path data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M22,19.594 C22.883,19.85,23.906,20,25,20c3.314,0,6-1.343,6-3v-4" strokeLinejoin="miter" strokeLinecap="butt"></path> <line data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" x1="19" y1="13" x2="19" y2="16.401" strokeLinejoin="miter" strokeLinecap="butt"></line> <path data-cap="butt" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M22,23.596 C22.883,23.851,23.907,24,25,24c3.314,0,6-1.343,6-3v-4" strokeLinejoin="miter" strokeLinecap="butt"></path> <ellipse fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" cx="25" cy="9" rx="6" ry="3" strokeLinejoin="miter"></ellipse> <path data-cap="butt" data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M10,19v4c0,1.657,2.686,3,6,3 s6-1.343,6-3v-4" strokeLinejoin="miter" strokeLinecap="butt"></path> <path data-cap="butt" data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeMiterlimit="10" d="M10,23v4c0,1.657,2.686,3,6,3 s6-1.343,6-3v-4" strokeLinejoin="miter" strokeLinecap="butt"></path> <ellipse data-color="color-2" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeMiterlimit="10" cx="16" cy="19" rx="6" ry="3" strokeLinejoin="miter"></ellipse></g>
    </SvgIcon>
  );
}

export default function ffStakeOverview() {

  const [ uniV3Positions, setUniV3Positions] = useState([])
  const [ totalUniV3Positions, setTotalUniV3Positions] = useState(null)
  const [ stakingV3Positions, setStakingV3Positions] = useState([])
  const [ totalStakingV3Positions, setTotalStakingV3Positions] = useState(null)
  const [ totalRewards, setTotalRewards ] = useState(null)

  useEffect(() => {
    const forexUpdated = () => {
      calcTotals()
    }

    calcTotals()

    stores.emitter.on(FIXED_FOREX_UPDATED, forexUpdated);
    return () => {
      stores.emitter.removeListener(FIXED_FOREX_UPDATED, forexUpdated);
    };
  }, []);

  const calcTotals = () => {
    const uniPos = stores.fixedForexStore.getStore('uniV3Positions')
    if(uniPos) {
      setUniV3Positions(uniPos)
      setTotalUniV3Positions(uniPos.reduce((curr, acc) => { return BigNumber(curr).plus(acc.balance).toFixed(18) }, 0))
    }

    const stakingPos = stores.fixedForexStore.getStore('stakingV3Positions')
    if(stakingPos) {
      setStakingV3Positions(stakingPos)
      setTotalStakingV3Positions(stakingPos.reduce((curr, acc) => { return BigNumber(curr).plus(acc.balance).toFixed(18) }, 0))
      setTotalRewards(stakingPos.reduce((curr, acc) => { return BigNumber(curr).plus(acc.earned).toFixed(18) }, 0))
    }
  }

  return (
    <div className={ classes.container }>
      <div className={ classes.fieldsContainer }>
        <div className={ classes.field }>
          <div className={classes.iconWrap}>
            <BalanceIcon className={ classes.overviewIcon } />
          </div>
          <div>
            <Typography className={ classes.title }>UNI-V3-POS Balance:</Typography>
            <div className={ classes.inline }>
              <Typography className={ classes.value }>{ formatCurrency(totalUniV3Positions) }</Typography>
              <Typography className={ classes.valueSymbol }>KP3R/ETH</Typography>
            </div>
          </div>
        </div>
        <div className={ classes.field }>
          <div className={classes.iconWrap}>
            <VestedBalanceIcon className={ classes.overviewIcon } />
          </div>
          <div>
            <Typography className={ classes.title }>Staked Balance:</Typography>
            <div className={ classes.inline }>
              <Typography className={ classes.value }>{ formatCurrency(totalStakingV3Positions) }</Typography>
              <Typography className={ classes.valueSymbol }>KP3R/ETH</Typography>
            </div>
          </div>
        </div>
        <div className={ classes.field }>
          <div className={classes.iconWrap}>
            <IbBalanceIcon className={ classes.overviewIcon } />
          </div>
          <div>
            <Typography className={ classes.title }>Rewards Available:</Typography>
            <div className={ classes.inline }>
              <Typography className={ classes.value }>{ formatCurrency(totalRewards) }</Typography>
              <Typography className={ classes.valueSymbol }>rKP3R</Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
