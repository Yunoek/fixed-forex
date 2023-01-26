import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Button, TextField, InputAdornment, CircularProgress, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { formatCurrency } from '../../utils';
import classes from './ffCurveLiquidity.module.css';

import stores from '../../stores'
import {
  ERROR,
  MAX_UINT256,
  FIXED_FOREX_APPROVE_DEPOSIT_CURVE,
  FIXED_FOREX_DEPOSIT_CURVE_APPROVED,
  FIXED_FOREX_DEPOSIT_CURVE,
  FIXED_FOREX_CURVE_DEPOSITED,
  FIXED_FOREX_WITHDRAW_CURVE,
  FIXED_FOREX_CURVE_WITHDRAWN,
  FIXED_FOREX_GET_SLIPPAGE_INFO,
  FIXED_FOREX_SLIPPAGE_INFO_RETURNED,
} from '../../stores/constants';
import SlippageInfo from './slippageInfo'

export default function ffCurveLiquidity({ asset }) {

  const [ approvalLoading0, setApprovalLoading0 ] = useState(false)
  const [ approvalLoading1, setApprovalLoading1 ] = useState(false)
  const [ depositLoading, setDepositLoading ] = useState(false)

  const [ amount0, setAmount0 ] = useState('');
  const [ amount0Error/*, setAmount0Error*/ ] = useState(false);
  const [ amount1, setAmount1 ] = useState('');
  const [ amount1Error/*, setAmount1Error*/ ] = useState(false);

  const [ withdrawAmount, setWithdrawAmount ] = useState('');
  const [ withdrawAmountError/*, setWithdrawAmountError*/ ] = useState(false);
  const [ withdrawAmount0, setWithdrawAmount0 ] = useState('');
  const [ withdrawAmount0Error/*, setWithdrawAmount0Error*/ ] = useState(false);
  const [ withdrawAmount1, setWithdrawAmount1 ] = useState('');
  const [ withdrawAmount1Error/*, setWithdrawAmount1Error*/ ] = useState(false);

  const [ withdrawAmount0Percent, setWithdrawAmount0Percent ] = useState('');
  const [ withdrawAmount1Percent, setWithdrawAmount1Percent ] = useState('');

  const [ slippageInfo, setSlippageInfo ] = useState(0)

  const [ activeTab, setActiveTab ] = useState('deposit')

  useEffect(() => {
    const approveReturned = () => {
      setApprovalLoading0(false)
      setApprovalLoading1(false)
    }

    const depositReturned = () => {
      setDepositLoading(false)
    }

    const errorReturned = () => {
      setDepositLoading(false)
      setApprovalLoading0(false)
      setApprovalLoading1(false)
    }

    const slippageInfoReturned = (info) => {
      setSlippageInfo(info)
    }

    stores.emitter.on(FIXED_FOREX_DEPOSIT_CURVE_APPROVED, approveReturned);
    stores.emitter.on(FIXED_FOREX_CURVE_DEPOSITED, depositReturned);
    stores.emitter.on(FIXED_FOREX_CURVE_WITHDRAWN, depositReturned);
    stores.emitter.on(FIXED_FOREX_SLIPPAGE_INFO_RETURNED, slippageInfoReturned);
    stores.emitter.on(ERROR, errorReturned);
    return () => {
      stores.emitter.removeListener(FIXED_FOREX_DEPOSIT_CURVE_APPROVED, approveReturned);
      stores.emitter.removeListener(FIXED_FOREX_CURVE_DEPOSITED, depositReturned);
      stores.emitter.removeListener(FIXED_FOREX_CURVE_WITHDRAWN, depositReturned);
      stores.emitter.removeListener(FIXED_FOREX_SLIPPAGE_INFO_RETURNED, slippageInfoReturned);
      stores.emitter.removeListener(ERROR, errorReturned);
    };
  }, []);

  const setAmountPercent = (input, percent) => {
    if(input === 'amount0') {
      let am = BigNumber(asset.gauge.coin0.balance).times(percent).div(100).toFixed(asset.gauge.coin0.decimals)
      setAmount0(am);
      stores.dispatcher.dispatch({ type: FIXED_FOREX_GET_SLIPPAGE_INFO, content: { asset, amount0: am, amount1 } })

    } else if (input === 'amount1') {
      let am = BigNumber(asset.gauge.coin1.balance).times(percent).div(100).toFixed(asset.gauge.coin1.decimals)
      setAmount1(am);
      stores.dispatcher.dispatch({ type: FIXED_FOREX_GET_SLIPPAGE_INFO, content: { asset, amount0, amount1: am } })

    } else if (input === 'withdraw') {
      let am = BigNumber(asset.gauge.userPoolBalance).times(percent).div(100).toFixed(18)
      setWithdrawAmount(am);

      if(am === '') {
        setWithdrawAmount0('')
        setWithdrawAmount1('')
      } else if(am !== '' && !isNaN(am)) {
        const totalBalances = BigNumber(asset.gauge.coin0.poolBalance).plus(asset.gauge.coin1.poolBalance)
        const coin0Ratio = BigNumber(asset.gauge.coin0.poolBalance).div(totalBalances).toFixed(18)
        const coin1Ratio = BigNumber(asset.gauge.coin1.poolBalance).div(totalBalances).toFixed(18)
        setWithdrawAmount0(BigNumber(coin0Ratio).times(am).toFixed(18))
        setWithdrawAmount1(BigNumber(coin1Ratio).times(am).toFixed(18))
      }
    } else if (input === 'withdrawAmount0') {
      setWithdrawAmount0Percent(percent)
      setWithdrawAmount0(BigNumber(asset.gauge.coin0.balance).times(percent).div(100).toFixed(asset.gauge.coin0.decimals));
    } else if (input === 'withdrawAmount1') {
      setWithdrawAmount1Percent(percent)
      setWithdrawAmount1(BigNumber(asset.gauge.coin1.balance).times(percent).div(100).toFixed(asset.gauge.coin1.decimals));
    }
  }

  const onApprove = (idx) => {

    let coin = null
    let amount = ''
    if(idx === '0') {
      coin = asset.gauge.coin0
      amount = amount0
      setApprovalLoading0(true)
    } else {
      coin = asset.gauge.coin1
      amount = amount1
      setApprovalLoading1(true)
    }

    stores.dispatcher.dispatch({ type: FIXED_FOREX_APPROVE_DEPOSIT_CURVE, content: { asset, coin, amount } })
  }

  const onDeposit = () => {
    setDepositLoading(true)
    stores.dispatcher.dispatch({ type: FIXED_FOREX_DEPOSIT_CURVE, content: { asset, amount0, amount1 } })
  }

  const onWithdraw = () => {
    setDepositLoading(true)
    stores.dispatcher.dispatch({ type: FIXED_FOREX_WITHDRAW_CURVE, content: { asset, withdrawAmount, withdrawAmount0, withdrawAmount1 } })
  }

  const toggleDeposit = () => {
    setActiveTab('deposit')
  }

  const toggleWithdraw = () => {
    setActiveTab('withdraw')
  }

  const formatApproved = (am) => {
    if(BigNumber(am).gte(1000000000000000)) {
      return 'Approved Forever'
    }

    return `Approved ${formatCurrency(am)}`
  }

  let coin0DepositApprovalNotRequired = false
  let coin1DepositApprovalNotRequired = false
  if(asset && asset.gauge && asset.gauge.coin0) {
    coin0DepositApprovalNotRequired = BigNumber(asset.gauge.coin0.gaugeAllowance).gte(amount0) || (!amount0 || amount0 === '')
  }
  if(asset && asset.gauge && asset.gauge.coin1) {
    coin1DepositApprovalNotRequired = BigNumber(asset.gauge.coin1.gaugeAllowance).gte(amount1) || (!amount1 || amount1 === '')
  }

  return (
    <div className={classes.retain}>
      <Typography variant="h5" className={ classes.title}>Deposit &amp; Withdraw</Typography>
      <Tooltip placement="top-left" title="Earn Rewards. Providing liquidity to these LP’s allows you to hedge against USD risk, or simply have exposure in your own preferred currency, while earning LP incentives.">
      <div className={classes.helpIcon}>?</div>
      </Tooltip>
    <Paper elevation={0} className={ classes.container }>
      <Grid container spacing={0}>
        <Grid item lg={12} md={12} xs={12}>
          <div className={classes.toggleButtons}>
            <Grid container spacing={0}>
              <Grid item lg={6} md={6} sm={6} xs={6}>
                <Paper className={ `${activeTab === 'deposit' ? classes.buttonActive : classes.button} ${ classes.topLeftButton }` } onClick={ toggleDeposit } disabled={ depositLoading || approvalLoading0 || approvalLoading1 }>
                  <Typography variant='h5'>Deposit</Typography>
                  <div className={ `${activeTab === 'deposit' ? classes.activeIcon : ''}` }></div>
                </Paper>
              </Grid>
              <Grid item lg={6} md={6} sm={6} xs={6}>
                <Paper className={ `${activeTab === 'withdraw' ? classes.buttonActive : classes.button}  ${ classes.bottomLeftButton }` } onClick={ toggleWithdraw } disabled={ depositLoading || approvalLoading0 || approvalLoading1 }>
                  <Typography variant='h5'>Withdraw</Typography>
                  <div className={ `${activeTab === 'withdraw' ? classes.activeIcon : ''}` }></div>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item lg={12} md={12} sm={12}>
          <div className={ classes.reAddPadding }>
            <Grid container spacing={0}>
              <Grid item lg={9} xs={12}>
                <div className={ classes.inputsContainer }>
                  {
                    activeTab === 'deposit' &&
                    <>
                      <Grid container spacing={2}>
                        <Grid item lg={12} xs={12}>
                          <div className={classes.textField}>
                            <div className={classes.inputTitleContainer}>
                              <div className={classes.inputTitle}>
                                <Typography variant="h5" className={ classes.inputTitleText }>
                                  Deposit Amounts:
                                </Typography>
                              </div>
                            </div>
                            <Grid container spacing={2}>
                            <Grid item lg={6} xs={12}>
                            <div className={ classes.extraTF }>
                              <div className={classes.balances}>
                                <Typography
                                  variant="h5"
                                  onClick={() => {
                                    setAmountPercent('amount0', 100);
                                  }}
                                  className={classes.value}
                                  noWrap
                                >
                                  Balance: {formatCurrency(asset && asset.gauge && asset.gauge.coin0 ? asset.gauge.coin0.balance : 0)}
                                </Typography>
                              </div>
                              <TextField
                                variant="outlined"
                                fullWidth
                                placeholder="0.00"
                                value={amount0}
                                error={amount0Error}
                                onChange={(e) => {
                                  setAmount0(e.target.value);
                                  stores.dispatcher.dispatch({ type: FIXED_FOREX_GET_SLIPPAGE_INFO, content: { asset, amount0: e.target.value, amount1 } })
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography>{asset?.gauge?.coin0?.symbol}</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </div>
                            </Grid>
                            <Grid item lg={6} xs={12}>
                            <div className={ classes.extraTF }>
                              <div className={classes.balances}>
                                <Typography
                                  variant="h5"
                                  onClick={() => {
                                    setAmountPercent('amount1', 100);
                                  }}
                                  className={classes.value}
                                  noWrap
                                >
                                  Balance: {formatCurrency(asset && asset.gauge && asset.gauge.coin1 ? asset.gauge.coin1.balance : 0)}
                                </Typography>
                              </div>
                              <TextField
                                variant="outlined"
                                fullWidth
                                placeholder="0.00"
                                value={amount1}
                                error={amount1Error}
                                onChange={(e) => {
                                  setAmount1(e.target.value);
                                  stores.dispatcher.dispatch({ type: FIXED_FOREX_GET_SLIPPAGE_INFO, content: { asset, amount0, amount1: e.target.value } })
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography>{asset?.gauge?.coin1?.symbol}</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </div>
                            </Grid>
                            </Grid>
                          </div>
                        </Grid>
                        <Grid item lg={12} xs={12}>
                          <div className={classes.textField}>
                            <SlippageInfo slippagePcent={slippageInfo} />
                          </div>
                        </Grid>
                      </Grid>
                    </>
                  }
                  {
                    activeTab === 'withdraw' &&
                    <>
                      <Grid container spacing={2}>
                        <Grid item lg={12} xs={12}>
                          <div className={classes.textField}>
                            <div className={classes.inputTitleContainer}>
                              <div className={classes.inputTitle}>
                                <Typography variant="h5" className={ classes.inputTitleText }>
                                  Withdraw Amount:
                                </Typography>
                              </div>
                              <div className={classes.balances}>
                                <Typography
                                  variant="h5"
                                  onClick={() => {
                                    setAmountPercent('withdraw', 100);
                                  }}
                                  className={classes.value}
                                  noWrap
                                >
                                  Balance: {formatCurrency(asset?.gauge?.userPoolBalance)}
                                </Typography>
                              </div>
                            </div>
                            <TextField
                              variant="outlined"
                              fullWidth
                              placeholder="0.00"
                              value={withdrawAmount}
                              error={withdrawAmountError}
                              onChange={(e) => {
                                setWithdrawAmount(e.target.value);
                                if(e.target.value === '') {
                                  setWithdrawAmount0('')
                                  setWithdrawAmount1('')
                                } else if(e.target.value !== '' && !isNaN(e.target.value)) {
                                  const totalBalances = BigNumber(asset.gauge.coin0.poolBalance).plus(asset.gauge.coin1.poolBalance)
                                  const coin0Ratio = BigNumber(asset.gauge.coin0.poolBalance).div(totalBalances).toFixed(18)
                                  const coin1Ratio = BigNumber(asset.gauge.coin1.poolBalance).div(totalBalances).toFixed(18)
                                  setWithdrawAmount0(BigNumber(coin0Ratio).times(asset.gauge.virtualPrice).times(e.target.value).toFixed(18))
                                  setWithdrawAmount1(BigNumber(coin1Ratio).times(asset.gauge.virtualPrice).times(e.target.value).toFixed(18))
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Typography>{asset?.gauge?.poolSymbol}</Typography>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </div>
                        </Grid>
                        <Grid item lg={12} xs={12}>
                          <div className={classes.textField}>
                            <div className={classes.inputTitleContainer}>
                              <div className={classes.inputTitle}>
                                <Typography variant="h5" className={ classes.inputTitleText }>
                                  Estimated Receive Amounts:
                                </Typography>
                              </div>
                            </div>
                            <Grid container spacing={2}>
                              <Grid item lg={6} xs={12}>
                                <div className={ classes.amountAndPercent }>
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    value={withdrawAmount0}
                                    error={withdrawAmount0Error}
                                    disabled={ true }
                                    onChange={(e) => {
                                      setWithdrawAmount0(e.target.value);
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                        </InputAdornment>
                                      ),
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>{asset?.gauge?.coin0?.symbol}</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  {/*<TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    value={withdrawAmount0Percent}
                                    onChange={(e) => {
                                      setAmountPercent('withdrawAmount0', e.target.value);
                                    }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>%</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />*/}
                                </div>
                              </Grid>
                              <Grid item lg={6} xs={12}>
                                <div className={ classes.amountAndPercent }>
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    disabled={ true }
                                    value={withdrawAmount1}
                                    error={withdrawAmount1Error}
                                    onChange={(e) => {
                                      setWithdrawAmount1(e.target.value);
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <img src={ `/tokens/unknown-logo.png` } alt="" width={30} height={30} />
                                        </InputAdornment>
                                      ),
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>{asset?.gauge?.coin1?.symbol}</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  {/*<TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="0.00"
                                    value={withdrawAmount1Percent}
                                    onChange={(e) => {
                                      setAmountPercent('withdrawAmount1', e.target.value);
                                    }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography>%</Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                  />*/}
                                </div>
                              </Grid>
                            </Grid>
                          </div>
                        </Grid>
                      </Grid>
                    </>
                  }
                </div>
              </Grid>
              <Grid item lg={3} xs={12} className={classes.buttonWrap}>
            {
              activeTab === 'deposit' &&
              <div className={ classes.actionsContainer }>
                <div className={ classes.multiApproval }>
                  <Button
                    className={ classes.multiApprovalButton }
                    variant='contained'
                    size='large'
                    color='primary'
                    disabled={ coin0DepositApprovalNotRequired || approvalLoading0 || approvalLoading1 }
                    onClick={ () => { onApprove('0') } }
                    >
                    <Typography className={ classes.actionButtonText }>{ coin0DepositApprovalNotRequired ? formatApproved(asset?.gauge?.coin0?.gaugeAllowance) : (approvalLoading0 ? `Approving` : `Approve ${asset?.gauge?.coin0?.symbol}`)} </Typography>
                    { approvalLoading0 && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                  </Button>
                  <Button
                    className={ classes.multiApprovalButton }
                    variant='contained'
                    size='large'
                    color='primary'
                    disabled={ coin1DepositApprovalNotRequired || approvalLoading0 || approvalLoading1 }
                    onClick={ () => { onApprove('1') } }
                    >
                    <Typography className={ classes.actionButtonText }>{ coin1DepositApprovalNotRequired ? formatApproved(asset?.gauge?.coin1?.gaugeAllowance) : (approvalLoading1 ? `Approving` : `Approve ${asset?.gauge?.coin1?.symbol}`)} </Typography>
                    { approvalLoading1 && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                  </Button>
                </div>
                <Button
                  variant='contained'
                  size='large'
                  className={classes.buttonOverride}
                  color='primary'
                  disabled={ depositLoading || !coin0DepositApprovalNotRequired || !coin1DepositApprovalNotRequired }
                  onClick={ onDeposit }
                  >
                  <Typography className={ classes.actionButtonText }>{ depositLoading ? `Depositing` : `Deposit` }</Typography>
                  { depositLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                </Button>
              </div>
            }
            {
              activeTab === 'withdraw' &&
              <div className={ classes.actionsContainer }>
                <Button
                  variant='contained'
                  size='large'
                  color='primary'
                  className={classes.buttonOverride}
                  disabled={ depositLoading }
                  onClick={ onWithdraw }
                  >
                  <Typography className={ classes.actionButtonText }>{ depositLoading ? `Withdrawing` : `Withdraw` }</Typography>
                  { depositLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                </Button>
              </div>
            }
            </Grid>
          </Grid>
          </div>
        </Grid>
      </Grid>
    </Paper>
    </div>
  );
}
