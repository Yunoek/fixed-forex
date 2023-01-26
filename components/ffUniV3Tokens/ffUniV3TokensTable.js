import React from 'react';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography, Button, CircularProgress, SvgIcon, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';

import stores from '../../stores'
import {
  ERROR,
  FIXED_FOREX_DEPOSIT_UNI,
  FIXED_FOREX_UNI_DEPOSITED,
  FIXED_FOREX_APPROVE_DEPOSIT_UNI,
  FIXED_FOREX_DEPOSIT_UNI_APPROVED
} from '../../stores/constants';
import { formatCurrency } from '../../utils';

function NoneIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
    <g strokeWidth="2" transform="translate(0, 0)"><path d="M15.029,48.971A24,24,0,0,1,48.971,15.029" fill="none" stroke="#686c7a" strokeMiterlimit="10" strokeWidth="2" data-cap="butt" strokeLinecap="butt" strokeLinejoin="miter"></path><path d="M52.789,20A24.006,24.006,0,0,1,20,52.789" fill="none" stroke="#686c7a" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2" strokeLinejoin="miter"></path><line x1="60" y1="4" x2="4" y2="60" fill="none" stroke="#686c7a" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2" data-color="color-2" strokeLinejoin="miter"></line></g>
    </SvgIcon>
  );
}

function descendingComparator(a, b, orderBy) {
  if (!a || !b) {
    return 0;
  }

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'asset', numeric: false, disablePadding: false, label: 'Asset' },
  {
    id: 'status',
    numeric: true,
    disablePadding: false,
    label: 'Price Range',
  },
  {
    id: 'claim',
    numeric: true,
    disablePadding: false,
    label: '',
  }
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell className={classes.overrideTableHead} key={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={'normal'} sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}>
              <Typography variant="h5">{headCell.label}</Typography>
              {orderBy === headCell.id ? <span className={classes.visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span> : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '12px',
  },
  textSpaced: {
    lineHeight: '1.5',
  },
  cell: {
    position: 'relative'
  },
  cellSuccess: {
    color: '#4eaf0a',
  },
  cellAddress: {
    cursor: 'pointer',
  },
  aligntRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  skelly: {
    marginBottom: '12px',
    marginTop: '12px',
  },
  skelly1: {
    marginBottom: '12px',
    marginTop: '24px',
  },
  skelly2: {
    margin: '12px 6px',
  },
  tableBottomSkelly: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  assetInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(104, 108, 122, 0.2)',
    background: 'radial-gradient(circle, rgba(63,94,251,0.7) 0%, rgba(47,128,237,0.7) 48%) rgba(63,94,251,0.7) 100%',
  },
  assetInfoError: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '24px',
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(104, 108, 122, 0.2)',
    background: '#dc3545',
  },
  infoField: {
    flex: 1,
  },
  flexy: {
    padding: '6px 0px',
  },
  overrideCell: {
    padding: '0px',
  },
  hoverRow: {
    cursor: 'pointer',
  },
  statusLiquid: {
    color: '#dc3545',
  },
  statusWarning: {
    color: '#FF9029',
  },
  statusSafe: {
    color: 'green',
  },
  imgLogo: {
    marginRight: '12px'
  },
  tableContainer: {
    overflowX: 'hidden'
  },
  buttonOverride: {
    fontWeight: '700 !important',
    boxShadow: 'none !important',
    width: '160px',
    marginLeft: '12px'
  },
  actionButtonText: {
    fontSize: '12px !important',
    textTransform: 'capitalize !important'
  },
  loadingCircle: {
    marginLeft: '6px !important'
  },
  doubleIcon: {
    width: '80px',
    height: '34px',
    position: 'relative'
  },
  imgLogoFirst: {
    position: 'absolute',
    left: '0px',
    top: '0px',
    borderRadius: '30px',
    border: '1px solid rgba(128, 128, 128, 0.2)',
    background: '#FFF'
  },
  imgLogoSecond: {
    position: 'absolute',
    left: '20px',
    top: '0px',
    borderRadius: '30px',
    border: '1px solid rgba(128, 128, 128, 0.2)',
    background: '#FFF'
  },
  greenDot: {
    borderRadius: '10px',
    width: '10px',
    height: '10px',
    background: 'green',
    position: 'absolute',
    right: '0px',
    top: '24px'
  },
  redDot: {
    borderRadius: '10px',
    width: '10px',
    height: '10px',
    background: 'red',
    position: 'absolute',
    right: '0px',
    top: '24px'
  },
  dontUnderline: {
    textDecoration: 'none !important',
    background: 'linear-gradient(-45deg, #6e23d5, #ff007a)',
    backgroundSize: '200% 200%',
    padding: '5px 11px 4px 10px',
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#FFF',
    fontSize: '80%',
    borderRadius: '30px',
  },
  nothingTitle: {
    fontSize: '1.2rem',
    marginBottom: '10px',
  },
  nothingDesc: {
    fontSize: '1rem',
    color: 'rgba(104,108,122,1)',
  },
  nothingWrap: {
    background: '',
    textAlign: 'center',
    padding: '60px 40px',
  },
  noneIcon: {
    fontSize: '70px',
    marginBottom: '20px',
    opacity: '0.2',
  },
  overrideTableHead: {
    borderBottom: '1px solid rgba(104,108,122,0.2) !important',
  },
  errorTho: {
    background: 'rgb(237, 67, 55)',
    borderRadius: '12px',
    padding: '12px 24px',
    width: 'fit-content',
    float: 'right'
  }
}));

export default function EnhancedTable({ tokens, rKP3R }) {
  const classes = useStyles();

  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('balance');
  const [stakeLoading, setStakeLoading ] = React.useState(false);
  const [approveLoading, setApproveLoading] = React.useState(false);

  React.useEffect(() => {
    const uniDeposited = () => {
      setStakeLoading(false)
      setApproveLoading(false)
    }

    stores.emitter.on(FIXED_FOREX_UNI_DEPOSITED, uniDeposited);
    stores.emitter.on(FIXED_FOREX_DEPOSIT_UNI_APPROVED, uniDeposited);

    stores.emitter.on(ERROR, uniDeposited);
    return () => {
      stores.emitter.removeListener(FIXED_FOREX_UNI_DEPOSITED, uniDeposited);
      stores.emitter.removeListener(FIXED_FOREX_DEPOSIT_UNI_APPROVED, uniDeposited);
      stores.emitter.removeListener(ERROR, uniDeposited);
    };
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const onStake = (token) => {
    setStakeLoading(true)
    stores.dispatcher.dispatch({ type: FIXED_FOREX_DEPOSIT_UNI, content: { tokenID: token.tokenID }})
  }

  const onApprove = (token) => {
    setApproveLoading(true)
    stores.dispatcher.dispatch({ type: FIXED_FOREX_APPROVE_DEPOSIT_UNI, content: { tokenID: token.tokenID }})
  }

  if (!tokens) {
    return (
      <div className={classes.root}>
        <Skeleton variant="rect" width={'100%'} height={40} className={classes.skelly1} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
        <Skeleton variant="rect" width={'100%'} height={70} className={classes.skelly} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <TableContainer className={ classes.tableContainer }>
        <Table className={classes.table} aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
          <EnhancedTableHead classes={classes} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            { tokens.length === 0 &&
              <TableRow key={'nothing'}>
                <TableCell className={classes.cell} colspan={5} className={classes.nothingWrap}>
                  <NoneIcon className={ classes.noneIcon } />
                  <Typography className={classes.nothingTitle} variant='h2'>No unstaked positions available</Typography>
                  <Typography className={classes.nothingDesc}>Create your Uniswap position <a className={ classes.dontUnderline } target='_blank' href='https://app.uniswap.org/#/add/ETH/0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44/10000'>here</a></Typography>
                </TableCell>
              </TableRow>
            }
            { tokens.length > 0 &&
              stableSort(tokens, getComparator(order, orderBy)).map((row) => {
              if (!row) {
                return null;
              }

              return (
                <TableRow key={row.type+'_'+row.description}>
                  <TableCell className={classes.cell}>
                    <div className={ classes.inline }>
                      <div className={ classes.doubleIcon }>
                        <img className={ classes.imgLogoFirst } src={`https://assets.coingecko.com/coins/images/12966/large/kp3r_logo.jpg`} width='35' height='35' alt='' />
                        <img className={ classes.imgLogoSecond } src={`https://assets.coingecko.com/coins/images/279/large/ethereum.png`} width='35' height='35' alt='' />
                      </div>
                      <div>
                        <Typography variant="h2" className={classes.textSpaced}>
                          { formatCurrency(row?.balance) } KP3R / ETH
                        </Typography>
                        <Typography variant="h5" className={classes.textSpaced} color='textSecondary'>
                          Uniswap LP Position
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={classes.cell} align="right">
                    {
                      (row && row.prices) ? (
                        BigNumber(row.prices.currentPrice).gt(row.prices.lowPrice) && BigNumber(row.prices.currentPrice).lt(row.prices.highPrice) ? <Tooltip title='In range'><div className={ classes.greenDot }></div></Tooltip> : <Tooltip title='Out of range'><div className={ classes.redDot }></div></Tooltip>
                      ) : 'Fetching'
                    }
                    <Typography variant="h2" className={classes.textSpaced}>
                      {
                        row && row.prices && formatCurrency(row?.prices?.currentPrice)
                      } KP3R per ETH
                    </Typography>
                    <Typography variant="h5" className={classes.textSpaced} color='textSecondary'>
                      Min: { formatCurrency(row?.prices?.lowPrice) } -  Max: { formatCurrency(row?.prices?.highPrice) }
                    </Typography>
                  </TableCell>
                  { !(BigNumber(row.prices.currentPrice).gt(row.prices.lowPrice) && BigNumber(row.prices.currentPrice).lt(row.prices.highPrice)) &&
                    <TableCell className={classes.cell} align="right">
                      <Button
                        disabled
                        className={ classes.buttonOverride }
                        variant='contained'
                        size='large'
                        color='primary'>
                        <Typography className={ classes.actionButtonText }>Position out of range</Typography>
                      </Button>
                    </TableCell>
                  }
                  { BigNumber(row.prices.currentPrice).gt(row.prices.lowPrice) && BigNumber(row.prices.currentPrice).lt(row.prices.highPrice) &&
                    <TableCell className={classes.cell} align="right">
                      <Typography variant='h2' className={ classes.errorTho }>Deposits are disabled</Typography>
                      {/*<Button
                        className={ classes.buttonOverride }
                        variant='contained'
                        size='large'
                        color='primary'
                        disabled={ true } // || approveLoading || row.stakingApproved
                        onClick={ () => { onApprove(row) } }>
                        <Typography className={ classes.actionButtonText }>{ approveLoading ? `Approving` : `Approve` }</Typography>
                        { approveLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                      </Button>
                      <Button
                        className={ classes.buttonOverride }
                        variant='contained'
                        size='large'
                        color='primary'
                        disabled={ true } // || stakeLoading || !row.stakingApproved
                        onClick={ () => { onStake(row) } }>
                        <Typography className={ classes.actionButtonText }>{ stakeLoading ? `Staking` : `Stake` }</Typography>
                        { stakeLoading && <CircularProgress size={10} className={ classes.loadingCircle } /> }
                      </Button>*/}
                    </TableCell>
                  }
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
