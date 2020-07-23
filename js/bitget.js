'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, NotSupported, BadSymbol } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitget extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitget',
            'name': 'BITGET',
            'countries': [ 'SG' ],
            'version': 'v1',
            'rateLimit': 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'pro': false,
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTime': true,
                'fetchTransactions': false,
                'fetchMyTrades': true,
                'fetchDepositAddress': false,
                'fetchOrderTrades': false,
                'fetchTickers': true,
                'fetchLedger': false,
                'withdraw': false,
                'futures': false,
                'cancelOrder': true,
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
            },
            'hostname': 'bitget.com',
            'urls': {
                'logo': 'https://h5.appwebbg.com/statics/images/common/logo-ccxt1.png',
                'api': {
                    'data': 'https://api.{hostname}',
                    'api': 'https://api.{hostname}',
                    'capi': 'https://capi.{hostname}',
                    'swap': 'https://capi.{hostname}',
                },
                'www': 'https://www.bitget.com',
                'doc': [
                    'https://bitgetlimited.github.io/apidoc/en/swap',
                    'https://bitgetlimited.github.io/apidoc/en/spot',
                ],
                'fees': 'https://www.bitget.cc/zh-CN/rate?tab=1',
                'test': {
                    'rest': 'https://testnet.bitget.com',
                },
            },
            'api': {
                'data': {
                    'get': [
                        'market/history/kline', // Kline data
                        'market/detail/merged', // Get aggregated ticker
                        'market/tickers', // Get all trading tickers
                        'market/allticker', // Get all trading market method 2
                        'market/depth', // Get Market Depth Data
                        'market/trade', // Get Trade Detail Data
                        'market/history/trade', // Get record of trading
                        'market/detail', // Get Market Detail 24h Volume
                        'common/symbols', // Query all trading pairs and accuracy supported in the station
                        'common/currencys', // Query all currencies supported in the station
                        'common/timestamp', // Query system current time
                    ],
                },
                'api': {
                    'get': [
                        'account/accounts', // Get all accounts of current user(即account_id)。
                        'accounts/{account_id}/balance', // Get the balance of the specified account
                        'order/orders', // Query current order, history order
                        'dw/query/deposit_withdraw', // Query assets history
                    ],
                    'post': [
                        'order/orders/place', // Place order
                        'order/orders/{order_id}/submitcancel', // Request to cancel an order request
                        'order/orders/batchcancel', // Bulk order cancellation
                        'order/orders/{order_id}', // Query an order details
                        'order/orders/{order_id}/matchresults', // Query the transaction details of an order
                        'order/matchresults', // Query current order, order history
                    ],
                },
                'capi': {
                    'get': [
                        'instruments/{symbol}/ticker',
                        'instruments/{symbol}/depth', // ?size=20
                        'instruments/{symbol}/trades', // ?limit=20
                        'instruments/{symbol}/index',
                        'instruments/{symbol}/candles', // ?start=2019-05-01T04:12:12.000Z&end=2019-05-01T05:12:12.000Z&granularity=60
                        'instruments/{symbol}/open_interest',
                        'instruments/{symbol}/price_limit',
                        'instruments/{symbol}/mark_price',
                        'instruments',
                        'calOpenCount',
                    ],
                },
                'swap': {
                    'get': [
                        'accounts', // ?accesskey=ak3565fe42ed3d4d03&method=accounts&req_time=1558098686700&sign=83cb5eb84a7b6e3890abf77c8fa8c519
                        '{instrument_id}/accounts', // ?accesskey=ak170c05584dca4c85&method=singleAccount&req_time=1575356480842&sign=be76477fcbe1b7095df102ac3d513d53=83cb5eb84a7b6e3890abf77c8fa8c519
                        '{symbol}/position', // ?accesskey=ak3565fe42ed3d4d03&method=position&req_time=1558099045557&sign=8b5d51f0f2d23f61709ed4be620a9789
                        'orders/{symbol}/{orderId}', // ?accesskey=ak899e552618ef4500&method=getOrderDetail&req_time=1558148224422&sign=ee38a2fd36f6aca3e8886bbc31da038f
                        'orders/{symbol}', // ?accesskey=ak899e552618ef4500&from=null&limit=5&method=orders&req_time=1558148543438&sign=55820582491bb5549ef717a0c1d8b9da&status=-1&to=5
                        'symbol/adjustMargin', // ?accesskey=ak8623d66898904322&amount=0.001&method=adjustMargin&positionType=1&req_time=1561432607808&sign=53af39178d3d5676010b39a503abe046&type=2
                        'fills', // ?accesskey=ak8623d66898904322&instrument_id=btcusd&method=fills&order_id=525946425993854915&req_time=1561463413324&sign=453797b90dbabdf75a7d0585411dc77f
                        '{symbo}/settings', // ?accesskey=ak3565fe42ed3d4d03&method=settings&req_time=1558099045557&sign=8b5d51f0f2d23f61709ed4be620a9789
                        '{symbo}/leverage', // ?leverage=10&side=1&accesskey=ak3565fe42ed3d4d03&method=leverage&req_time=1558099045557&sign=8b5d51f0f2d23f61709ed4be620a9789
                        '{instrument_id}/modifyAutoAppendMargin', // ?accesskey=ak185723cdcfc54471&append_type=1&method=modifyAutoAppendMargin&req_time=1576291417317&side=1&sign=44fa76a445fb8f67b982298d5ca6fd93
                        'currentPlan/{instrument_id}', // ?accesskey=ak185723cdcfc54471&dateType=1&endTime=1222222&instrument_id=ethusd&method=currentPlan&page_index=1&page_size=4&req_time=1576293950097&side=1&sign=7e49fe8bcedffd99f784f7511f35d04a&startTime=1576293950097
                        'historyPlan/{instrument_id}', // ?accesskey=ak185723cdcfc54471&dateType=1&endTime=1222222&instrument_id=ethusd&method=historyPlan&page_index=1&page_size=4&req_time=1576293950097&side=1&sign=7e49fe8bcedffd99f784f7511f35d04a&startTime=1576293950097

                    ],
                    'post': [
                        'order', // ?sign=bb9c72e8b3fe8a4f066e8d629e29d8a9&req_time=1558099275296&accesskey=ak3565fe42ed3d4d03
                        'orders', // ?sign=7cd7ea462e1dbc3312639d855c201ef8&req_time=1558146239275&accesskey=ak899e552618ef4500
                        'cancel_order/{symbol}/{orderId}', // ?sign=9c6b152f61da109bbc41e128180e46f8&method=cancel_order&req_time=1558146612156&accesskey=ak899e552618ef4500
                        'plan_order', // ?sign=619d0e84e0b711aeaa21d6f436fccbeb&req_time=1576292699607&accesskey=ak185723cdcfc54471
                        'cancel_plan/{instrument_id}/{orderId}', // ?sign=948d93640053053743f5d7ec84e94168&req_time=1576293315943&accesskey=ak185723cdcfc54471                                            ],
                    ],
                },
            },
            'fees': {
                'spot': {
                    'taker': 0.002,
                    'maker': 0.002,
                },
                'swap': {
                    'taker': 0.0006,
                    'maker': 0.0004,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                // http error codes
                // 400 Bad Request — Invalid request format
                // 401 Unauthorized — Invalid API Key
                // 403 Forbidden — You do not have access to the requested resource
                // 404 Not Found
                // 500 Internal Server Error — We had a problem with our server
                'exact': {
                    '1': ExchangeError, // { "code": 1, "message": "System error" }
                    // undocumented
                    'failure to get a peer from the ring-balancer': ExchangeNotAvailable, // { "message": "failure to get a peer from the ring-balancer" }
                    '4010': PermissionDenied, // { "code": 4010, "message": "For the security of your funds, withdrawals are not permitted within 24 hours after changing fund password  / mobile number / Google Authenticator settings " }
                    // common
                    // '0': ExchangeError, // 200 successful,when the order placement / cancellation / operation is successful
                    '4001': ExchangeError, // no data received in 30s
                    '4002': ExchangeError, // Buffer full. cannot write data
                    // --------------------------------------------------------
                    '30001': AuthenticationError, // { "code": 30001, "message": 'request header "OK_ACCESS_KEY" cannot be blank'}
                    '30002': AuthenticationError, // { "code": 30002, "message": 'request header "OK_ACCESS_SIGN" cannot be blank'}
                    '30003': AuthenticationError, // { "code": 30003, "message": 'request header "OK_ACCESS_TIMESTAMP" cannot be blank'}
                    '30004': AuthenticationError, // { "code": 30004, "message": 'request header "OK_ACCESS_PASSPHRASE" cannot be blank'}
                    '30005': InvalidNonce, // { "code": 30005, "message": "invalid OK_ACCESS_TIMESTAMP" }
                    '30006': AuthenticationError, // { "code": 30006, "message": "invalid OK_ACCESS_KEY" }
                    '30007': BadRequest, // { "code": 30007, "message": 'invalid Content_Type, please use "application/json" format'}
                    '30008': RequestTimeout, // { "code": 30008, "message": "timestamp request expired" }
                    '30009': ExchangeError, // { "code": 30009, "message": "system error" }
                    '30010': AuthenticationError, // { "code": 30010, "message": "API validation failed" }
                    '30011': PermissionDenied, // { "code": 30011, "message": "invalid IP" }
                    '30012': AuthenticationError, // { "code": 30012, "message": "invalid authorization" }
                    '30013': AuthenticationError, // { "code": 30013, "message": "invalid sign" }
                    '30014': DDoSProtection, // { "code": 30014, "message": "request too frequent" }
                    '30015': AuthenticationError, // { "code": 30015, "message": 'request header "OK_ACCESS_PASSPHRASE" incorrect'}
                    '30016': ExchangeError, // { "code": 30015, "message": "you are using v1 apiKey, please use v1 endpoint. If you would like to use v3 endpoint, please subscribe to v3 apiKey" }
                    '30017': ExchangeError, // { "code": 30017, "message": "apikey's broker id does not match" }
                    '30018': ExchangeError, // { "code": 30018, "message": "apikey's domain does not match" }
                    '30019': ExchangeNotAvailable, // { "code": 30019, "message": "Api is offline or unavailable" }
                    '30020': BadRequest, // { "code": 30020, "message": "body cannot be blank" }
                    '30021': BadRequest, // { "code": 30021, "message": "Json data format error" }, { "code": 30021, "message": "json data format error" }
                    '30022': PermissionDenied, // { "code": 30022, "message": "Api has been frozen" }
                    '30023': BadRequest, // { "code": 30023, "message": "{0} parameter cannot be blank" }
                    '30024': BadSymbol, // {"code":30024,"message":"\"instrument_id\" is an invalid parameter"}
                    '30025': BadRequest, // { "code": 30025, "message": "{0} parameter category error" }
                    '30026': DDoSProtection, // { "code": 30026, "message": "requested too frequent" }
                    '30027': AuthenticationError, // { "code": 30027, "message": "login failure" }
                    '30028': PermissionDenied, // { "code": 30028, "message": "unauthorized execution" }
                    '30029': AccountSuspended, // { "code": 30029, "message": "account suspended" }
                    '30030': ExchangeError, // { "code": 30030, "message": "endpoint request failed. Please try again" }
                    '30031': BadRequest, // { "code": 30031, "message": "token does not exist" }
                    '30032': BadSymbol, // { "code": 30032, "message": "pair does not exist" }
                    '30033': BadRequest, // { "code": 30033, "message": "exchange domain does not exist" }
                    '30034': ExchangeError, // { "code": 30034, "message": "exchange ID does not exist" }
                    '30035': ExchangeError, // { "code": 30035, "message": "trading is not supported in this website" }
                    '30036': ExchangeError, // { "code": 30036, "message": "no relevant data" }
                    '30037': ExchangeNotAvailable, // { "code": 30037, "message": "endpoint is offline or unavailable" }
                    // '30038': AuthenticationError, // { "code": 30038, "message": "user does not exist" }
                    '30038': OnMaintenance, // {"client_oid":"","code":"30038","error_code":"30038","error_message":"Matching engine is being upgraded. Please try in about 1 minute.","message":"Matching engine is being upgraded. Please try in about 1 minute.","order_id":"-1","result":false}
                    // futures
                    '32001': AccountSuspended, // { "code": 32001, "message": "futures account suspended" }
                    '32002': PermissionDenied, // { "code": 32002, "message": "futures account does not exist" }
                    '32003': CancelPending, // { "code": 32003, "message": "canceling, please wait" }
                    '32004': ExchangeError, // { "code": 32004, "message": "you have no unfilled orders" }
                    '32005': InvalidOrder, // { "code": 32005, "message": "max order quantity" }
                    '32006': InvalidOrder, // { "code": 32006, "message": "the order price or trigger price exceeds USD 1 million" }
                    '32007': InvalidOrder, // { "code": 32007, "message": "leverage level must be the same for orders on the same side of the contract" }
                    '32008': InvalidOrder, // { "code": 32008, "message": "Max. positions to open (cross margin)" }
                    '32009': InvalidOrder, // { "code": 32009, "message": "Max. positions to open (fixed margin)" }
                    '32010': ExchangeError, // { "code": 32010, "message": "leverage cannot be changed with open positions" }
                    '32011': ExchangeError, // { "code": 32011, "message": "futures status error" }
                    '32012': ExchangeError, // { "code": 32012, "message": "futures order update error" }
                    '32013': ExchangeError, // { "code": 32013, "message": "token type is blank" }
                    '32014': ExchangeError, // { "code": 32014, "message": "your number of contracts closing is larger than the number of contracts available" }
                    '32015': ExchangeError, // { "code": 32015, "message": "margin ratio is lower than 100% before opening positions" }
                    '32016': ExchangeError, // { "code": 32016, "message": "margin ratio is lower than 100% after opening position" }
                    '32017': ExchangeError, // { "code": 32017, "message": "no BBO" }
                    '32018': ExchangeError, // { "code": 32018, "message": "the order quantity is less than 1, please try again" }
                    '32019': ExchangeError, // { "code": 32019, "message": "the order price deviates from the price of the previous minute by more than 3%" }
                    '32020': ExchangeError, // { "code": 32020, "message": "the price is not in the range of the price limit" }
                    '32021': ExchangeError, // { "code": 32021, "message": "leverage error" }
                    '32022': ExchangeError, // { "code": 32022, "message": "this function is not supported in your country or region according to the regulations" }
                    '32023': ExchangeError, // { "code": 32023, "message": "this account has outstanding loan" }
                    '32024': ExchangeError, // { "code": 32024, "message": "order cannot be placed during delivery" }
                    '32025': ExchangeError, // { "code": 32025, "message": "order cannot be placed during settlement" }
                    '32026': ExchangeError, // { "code": 32026, "message": "your account is restricted from opening positions" }
                    '32027': ExchangeError, // { "code": 32027, "message": "cancelled over 20 orders" }
                    '32028': ExchangeError, // { "code": 32028, "message": "account is suspended and liquidated" }
                    '32029': ExchangeError, // { "code": 32029, "message": "order info does not exist" }
                    '32030': InvalidOrder, // The order cannot be cancelled
                    '32031': ArgumentsRequired, // client_oid or order_id is required.
                    '32038': AuthenticationError, // User does not exist
                    '32040': ExchangeError, // User have open contract orders or position
                    '32044': ExchangeError, // { "code": 32044, "message": "The margin ratio after submitting this order is lower than the minimum requirement ({0}) for your tier." }
                    '32045': ExchangeError, // String of commission over 1 million
                    '32046': ExchangeError, // Each user can hold up to 10 trade plans at the same time
                    '32047': ExchangeError, // system error
                    '32048': InvalidOrder, // Order strategy track range error
                    '32049': ExchangeError, // Each user can hold up to 10 track plans at the same time
                    '32050': InvalidOrder, // Order strategy rang error
                    '32051': InvalidOrder, // Order strategy ice depth error
                    '32052': ExchangeError, // String of commission over 100 thousand
                    '32053': ExchangeError, // Each user can hold up to 6 ice plans at the same time
                    '32057': ExchangeError, // The order price is zero. Market-close-all function cannot be executed
                    '32054': ExchangeError, // Trade not allow
                    '32055': InvalidOrder, // cancel order error
                    '32056': ExchangeError, // iceberg per order average should between {0}-{1} contracts
                    '32058': ExchangeError, // Each user can hold up to 6 initiative plans at the same time
                    '32059': InvalidOrder, // Total amount should exceed per order amount
                    '32060': InvalidOrder, // Order strategy type error
                    '32061': InvalidOrder, // Order strategy initiative limit error
                    '32062': InvalidOrder, // Order strategy initiative range error
                    '32063': InvalidOrder, // Order strategy initiative rate error
                    '32064': ExchangeError, // Time Stringerval of orders should set between 5-120s
                    '32065': ExchangeError, // Close amount exceeds the limit of Market-close-all (999 for BTC, and 9999 for the rest tokens)
                    '32066': ExchangeError, // You have open orders. Please cancel all open orders before changing your leverage level.
                    '32067': ExchangeError, // Account equity < required margin in this setting. Please adjust your leverage level again.
                    '32068': ExchangeError, // The margin for this position will fall short of the required margin in this setting. Please adjust your leverage level or increase your margin to proceed.
                    '32069': ExchangeError, // Target leverage level too low. Your account balance is insufficient to cover the margin required. Please adjust the leverage level again.
                    '32070': ExchangeError, // Please check open position or unfilled order
                    '32071': ExchangeError, // Your current liquidation mode does not support this action.
                    '32072': ExchangeError, // The highest available margin for your order’s tier is {0}. Please edit your margin and place a new order.
                    '32073': ExchangeError, // The action does not apply to the token
                    '32074': ExchangeError, // The number of contracts of your position, open orders, and the current order has exceeded the maximum order limit of this asset.
                    '32075': ExchangeError, // Account risk rate breach
                    '32076': ExchangeError, // Liquidation of the holding position(s) at market price will require cancellation of all pending close orders of the contracts.
                    '32077': ExchangeError, // Your margin for this asset in futures account is insufficient and the position has been taken over for liquidation. (You will not be able to place orders, close positions, transfer funds, or add margin during this period of time. Your account will be restored after the liquidation is complete.)
                    '32078': ExchangeError, // Please cancel all open orders before switching the liquidation mode(Please cancel all open orders before switching the liquidation mode)
                    '32079': ExchangeError, // Your open positions are at high risk.(Please add margin or reduce positions before switching the mode)
                    '32080': ExchangeError, // Funds cannot be transferred out within 30 minutes after futures settlement
                    '32083': ExchangeError, // The number of contracts should be a positive multiple of %%. Please place your order again
                    // token and margin trading
                    '33001': PermissionDenied, // { "code": 33001, "message": "margin account for this pair is not enabled yet" }
                    '33002': AccountSuspended, // { "code": 33002, "message": "margin account for this pair is suspended" }
                    '33003': InsufficientFunds, // { "code": 33003, "message": "no loan balance" }
                    '33004': ExchangeError, // { "code": 33004, "message": "loan amount cannot be smaller than the minimum limit" }
                    '33005': ExchangeError, // { "code": 33005, "message": "repayment amount must exceed 0" }
                    '33006': ExchangeError, // { "code": 33006, "message": "loan order not found" }
                    '33007': ExchangeError, // { "code": 33007, "message": "status not found" }
                    '33008': InsufficientFunds, // { "code": 33008, "message": "loan amount cannot exceed the maximum limit" }
                    '33009': ExchangeError, // { "code": 33009, "message": "user ID is blank" }
                    '33010': ExchangeError, // { "code": 33010, "message": "you cannot cancel an order during session 2 of call auction" }
                    '33011': ExchangeError, // { "code": 33011, "message": "no new market data" }
                    '33012': ExchangeError, // { "code": 33012, "message": "order cancellation failed" }
                    '33013': InvalidOrder, // { "code": 33013, "message": "order placement failed" }
                    '33014': OrderNotFound, // { "code": 33014, "message": "order does not exist" }
                    '33015': InvalidOrder, // { "code": 33015, "message": "exceeded maximum limit" }
                    '33016': ExchangeError, // { "code": 33016, "message": "margin trading is not open for this token" }
                    '33017': InsufficientFunds, // { "code": 33017, "message": "insufficient balance" }
                    '33018': ExchangeError, // { "code": 33018, "message": "this parameter must be smaller than 1" }
                    '33020': ExchangeError, // { "code": 33020, "message": "request not supported" }
                    '33021': BadRequest, // { "code": 33021, "message": "token and the pair do not match" }
                    '33022': InvalidOrder, // { "code": 33022, "message": "pair and the order do not match" }
                    '33023': ExchangeError, // { "code": 33023, "message": "you can only place market orders during call auction" }
                    '33024': InvalidOrder, // { "code": 33024, "message": "trading amount too small" }
                    '33025': InvalidOrder, // { "code": 33025, "message": "base token amount is blank" }
                    '33026': ExchangeError, // { "code": 33026, "message": "transaction completed" }
                    '33027': InvalidOrder, // { "code": 33027, "message": "cancelled order or order cancelling" }
                    '33028': InvalidOrder, // { "code": 33028, "message": "the decimal places of the trading price exceeded the limit" }
                    '33029': InvalidOrder, // { "code": 33029, "message": "the decimal places of the trading size exceeded the limit" }
                    '33034': ExchangeError, // { "code": 33034, "message": "You can only place limit order after Call Auction has started" }
                    '33035': ExchangeError, // This type of order cannot be canceled(This type of order cannot be canceled)
                    '33036': ExchangeError, // Exceeding the limit of entrust order
                    '33037': ExchangeError, // The buy order price should be lower than 130% of the trigger price
                    '33038': ExchangeError, // The sell order price should be higher than 70% of the trigger price
                    '33039': ExchangeError, // The limit of callback rate is 0 < x <= 5%
                    '33040': ExchangeError, // The trigger price of a buy order should be lower than the latest transaction price
                    '33041': ExchangeError, // The trigger price of a sell order should be higher than the latest transaction price
                    '33042': ExchangeError, // The limit of price variance is 0 < x <= 1%
                    '33043': ExchangeError, // The total amount must be larger than 0
                    '33044': ExchangeError, // The average amount should be 1/1000 * total amount <= x <= total amount
                    '33045': ExchangeError, // The price should not be 0, including trigger price, order price, and price limit
                    '33046': ExchangeError, // Price variance should be 0 < x <= 1%
                    '33047': ExchangeError, // Sweep ratio should be 0 < x <= 100%
                    '33048': ExchangeError, // Per order limit: Total amount/1000 < x <= Total amount
                    '33049': ExchangeError, // Total amount should be X > 0
                    '33050': ExchangeError, // Time interval should be 5 <= x <= 120s
                    '33051': ExchangeError, // cancel order number not higher limit: plan and track entrust no more than 10, ice and time entrust no more than 6
                    '33059': BadRequest, // { "code": 33059, "message": "client_oid or order_id is required" }
                    '33060': BadRequest, // { "code": 33060, "message": "Only fill in either parameter client_oid or order_id" }
                    '33061': ExchangeError, // Value of a single market price order cannot exceed 100,000 USD
                    '33062': ExchangeError, // The leverage ratio is too high. The borrowed position has exceeded the maximum position of this leverage ratio. Please readjust the leverage ratio
                    '33063': ExchangeError, // Leverage multiple is too low, there is insufficient margin in the account, please readjust the leverage ratio
                    '33064': ExchangeError, // The setting of the leverage ratio cannot be less than 2, please readjust the leverage ratio
                    '33065': ExchangeError, // Leverage ratio exceeds maximum leverage ratio, please readjust leverage ratio
                    // account
                    '21009': ExchangeError, // Funds cannot be transferred out within 30 minutes after swap settlement(Funds cannot be transferred out within 30 minutes after swap settlement)
                    '34001': PermissionDenied, // { "code": 34001, "message": "withdrawal suspended" }
                    '34002': InvalidAddress, // { "code": 34002, "message": "please add a withdrawal address" }
                    '34003': ExchangeError, // { "code": 34003, "message": "sorry, this token cannot be withdrawn to xx at the moment" }
                    '34004': ExchangeError, // { "code": 34004, "message": "withdrawal fee is smaller than minimum limit" }
                    '34005': ExchangeError, // { "code": 34005, "message": "withdrawal fee exceeds the maximum limit" }
                    '34006': ExchangeError, // { "code": 34006, "message": "withdrawal amount is lower than the minimum limit" }
                    '34007': ExchangeError, // { "code": 34007, "message": "withdrawal amount exceeds the maximum limit" }
                    '34008': InsufficientFunds, // { "code": 34008, "message": "insufficient balance" }
                    '34009': ExchangeError, // { "code": 34009, "message": "your withdrawal amount exceeds the daily limit" }
                    '34010': ExchangeError, // { "code": 34010, "message": "transfer amount must be larger than 0" }
                    '34011': ExchangeError, // { "code": 34011, "message": "conditions not met" }
                    '34012': ExchangeError, // { "code": 34012, "message": "the minimum withdrawal amount for NEO is 1, and the amount must be an integer" }
                    '34013': ExchangeError, // { "code": 34013, "message": "please transfer" }
                    '34014': ExchangeError, // { "code": 34014, "message": "transfer limited" }
                    '34015': ExchangeError, // { "code": 34015, "message": "subaccount does not exist" }
                    '34016': PermissionDenied, // { "code": 34016, "message": "transfer suspended" }
                    '34017': AccountSuspended, // { "code": 34017, "message": "account suspended" }
                    '34018': AuthenticationError, // { "code": 34018, "message": "incorrect trades password" }
                    '34019': PermissionDenied, // { "code": 34019, "message": "please bind your email before withdrawal" }
                    '34020': PermissionDenied, // { "code": 34020, "message": "please bind your funds password before withdrawal" }
                    '34021': InvalidAddress, // { "code": 34021, "message": "Not verified address" }
                    '34022': ExchangeError, // { "code": 34022, "message": "Withdrawals are not available for sub accounts" }
                    '34023': PermissionDenied, // { "code": 34023, "message": "Please enable futures trading before transferring your funds" }
                    '34026': ExchangeError, // transfer too frequently(transfer too frequently)
                    '34036': ExchangeError, // Parameter is incorrect, please refer to API documentation
                    '34037': ExchangeError, // Get the sub-account balance interface, account type is not supported
                    '34038': ExchangeError, // Since your C2C transaction is unusual, you are restricted from fund transfer. Please contact our customer support to cancel the restriction
                    '34039': ExchangeError, // You are now restricted from transferring out your funds due to abnormal trades on C2C Market. Please transfer your fund on our website or app instead to verify your identity
                    // swap
                    '35001': ExchangeError, // { "code": 35001, "message": "Contract does not exist" }
                    '35002': ExchangeError, // { "code": 35002, "message": "Contract settling" }
                    '35003': ExchangeError, // { "code": 35003, "message": "Contract paused" }
                    '35004': ExchangeError, // { "code": 35004, "message": "Contract pending settlement" }
                    '35005': AuthenticationError, // { "code": 35005, "message": "User does not exist" }
                    '35008': InvalidOrder, // { "code": 35008, "message": "Risk ratio too high" }
                    '35010': InvalidOrder, // { "code": 35010, "message": "Position closing too large" }
                    '35012': InvalidOrder, // { "code": 35012, "message": "Incorrect order size" }
                    '35014': InvalidOrder, // { "code": 35014, "message": "Order price is not within limit" }
                    '35015': InvalidOrder, // { "code": 35015, "message": "Invalid leverage level" }
                    '35017': ExchangeError, // { "code": 35017, "message": "Open orders exist" }
                    '35019': InvalidOrder, // { "code": 35019, "message": "Order size too large" }
                    '35020': InvalidOrder, // { "code": 35020, "message": "Order price too high" }
                    '35021': InvalidOrder, // { "code": 35021, "message": "Order size exceeded current tier limit" }
                    '35022': ExchangeError, // { "code": 35022, "message": "Contract status error" }
                    '35024': ExchangeError, // { "code": 35024, "message": "Contract not initialized" }
                    '35025': InsufficientFunds, // { "code": 35025, "message": "No account balance" }
                    '35026': ExchangeError, // { "code": 35026, "message": "Contract settings not initialized" }
                    '35029': OrderNotFound, // { "code": 35029, "message": "Order does not exist" }
                    '35030': InvalidOrder, // { "code": 35030, "message": "Order size too large" }
                    '35031': InvalidOrder, // { "code": 35031, "message": "Cancel order size too large" }
                    '35032': ExchangeError, // { "code": 35032, "message": "Invalid user status" }
                    '35037': ExchangeError, // No last traded price in cache
                    '35039': ExchangeError, // { "code": 35039, "message": "Open order quantity exceeds limit" }
                    '35040': InvalidOrder, // {"error_message":"Invalid order type","result":"true","error_code":"35040","order_id":"-1"}
                    '35044': ExchangeError, // { "code": 35044, "message": "Invalid order status" }
                    '35046': InsufficientFunds, // { "code": 35046, "message": "Negative account balance" }
                    '35047': InsufficientFunds, // { "code": 35047, "message": "Insufficient account balance" }
                    '35048': ExchangeError, // { "code": 35048, "message": "User contract is frozen and liquidating" }
                    '35049': InvalidOrder, // { "code": 35049, "message": "Invalid order type" }
                    '35050': InvalidOrder, // { "code": 35050, "message": "Position settings are blank" }
                    '35052': InsufficientFunds, // { "code": 35052, "message": "Insufficient cross margin" }
                    '35053': ExchangeError, // { "code": 35053, "message": "Account risk too high" }
                    '35055': InsufficientFunds, // { "code": 35055, "message": "Insufficient account balance" }
                    '35057': ExchangeError, // { "code": 35057, "message": "No last traded price" }
                    '35058': ExchangeError, // { "code": 35058, "message": "No limit" }
                    '35059': BadRequest, // { "code": 35059, "message": "client_oid or order_id is required" }
                    '35060': BadRequest, // { "code": 35060, "message": "Only fill in either parameter client_oid or order_id" }
                    '35061': BadRequest, // { "code": 35061, "message": "Invalid instrument_id" }
                    '35062': InvalidOrder, // { "code": 35062, "message": "Invalid match_price" }
                    '35063': InvalidOrder, // { "code": 35063, "message": "Invalid order_size" }
                    '35064': InvalidOrder, // { "code": 35064, "message": "Invalid client_oid" }
                    '35066': InvalidOrder, // Order interval error
                    '35067': InvalidOrder, // Time-weighted order ratio error
                    '35068': InvalidOrder, // Time-weighted order range error
                    '35069': InvalidOrder, // Time-weighted single transaction limit error
                    '35070': InvalidOrder, // Algo order type error
                    '35071': InvalidOrder, // Order total must be larger than single order limit
                    '35072': InvalidOrder, // Maximum 6 unfulfilled time-weighted orders can be held at the same time
                    '35073': InvalidOrder, // Order price is 0. Market-close-all not available
                    '35074': InvalidOrder, // Iceberg order single transaction average error
                    '35075': InvalidOrder, // Failed to cancel order
                    '35076': InvalidOrder, // LTC 20x leverage. Not allowed to open position
                    '35077': InvalidOrder, // Maximum 6 unfulfilled iceberg orders can be held at the same time
                    '35078': InvalidOrder, // Order amount exceeded 100,000
                    '35079': InvalidOrder, // Iceberg order price variance error
                    '35080': InvalidOrder, // Callback rate error
                    '35081': InvalidOrder, // Maximum 10 unfulfilled trail orders can be held at the same time
                    '35082': InvalidOrder, // Trail order callback rate error
                    '35083': InvalidOrder, // Each user can only hold a maximum of 10 unfulfilled stop-limit orders at the same time
                    '35084': InvalidOrder, // Order amount exceeded 1 million
                    '35085': InvalidOrder, // Order amount is not in the correct range
                    '35086': InvalidOrder, // Price exceeds 100 thousand
                    '35087': InvalidOrder, // Price exceeds 100 thousand
                    '35088': InvalidOrder, // Average amount error
                    '35089': InvalidOrder, // Price exceeds 100 thousand
                    '35090': ExchangeError, // No stop-limit orders available for cancelation
                    '35091': ExchangeError, // No trail orders available for cancellation
                    '35092': ExchangeError, // No iceberg orders available for cancellation
                    '35093': ExchangeError, // No trail orders available for cancellation
                    '35094': ExchangeError, // Stop-limit order last traded price error
                    '35095': BadRequest, // Instrument_id error
                    '35096': ExchangeError, // Algo order status error
                    '35097': ExchangeError, // Order status and order ID cannot exist at the same time
                    '35098': ExchangeError, // An order status or order ID must exist
                    '35099': ExchangeError, // Algo order ID error
                    // option
                    '36001': BadRequest, // Invalid underlying index.
                    '36002': BadRequest, // Instrument does not exist.
                    '36005': ExchangeError, // Instrument status is invalid.
                    '36101': AuthenticationError, // Account does not exist.
                    '36102': PermissionDenied, // Account status is invalid.
                    '36103': PermissionDenied, // Account is suspended due to ongoing liquidation.
                    '36104': PermissionDenied, // Account is not enabled for options trading.
                    '36105': PermissionDenied, // Please enable the account for option contract.
                    '36106': PermissionDenied, // Funds cannot be transferred in or out, as account is suspended.
                    '36107': PermissionDenied, // Funds cannot be transferred out within 30 minutes after option exercising or settlement.
                    '36108': InsufficientFunds, // Funds cannot be transferred in or out, as equity of the account is less than zero.
                    '36109': PermissionDenied, // Funds cannot be transferred in or out during option exercising or settlement.
                    '36201': PermissionDenied, // New order function is blocked.
                    '36202': PermissionDenied, // Account does not have permission to short option.
                    '36203': InvalidOrder, // Invalid format for client_oid.
                    '36204': ExchangeError, // Invalid format for request_id.
                    '36205': BadRequest, // Instrument id does not match underlying index.
                    '36206': BadRequest, // Order_id and client_oid can not be used at the same time.
                    '36207': InvalidOrder, // Either order price or fartouch price must be present.
                    '36208': InvalidOrder, // Either order price or size must be present.
                    '36209': InvalidOrder, // Either order_id or client_oid must be present.
                    '36210': InvalidOrder, // Either order_ids or client_oids must be present.
                    '36211': InvalidOrder, // Exceeding max batch size for order submission.
                    '36212': InvalidOrder, // Exceeding max batch size for oder cancellation.
                    '36213': InvalidOrder, // Exceeding max batch size for order amendment.
                    '36214': ExchangeError, // Instrument does not have valid bid/ask quote.
                    '36216': OrderNotFound, // Order does not exist.
                    '36217': InvalidOrder, // Order submission failed.
                    '36218': InvalidOrder, // Order cancellation failed.
                    '36219': InvalidOrder, // Order amendment failed.
                    '36220': InvalidOrder, // Order is pending cancel.
                    '36221': InvalidOrder, // Order qty is not valid multiple of lot size.
                    '36222': InvalidOrder, // Order price is breaching highest buy limit.
                    '36223': InvalidOrder, // Order price is breaching lowest sell limit.
                    '36224': InvalidOrder, // Exceeding max order size.
                    '36225': InvalidOrder, // Exceeding max open order count for instrument.
                    '36226': InvalidOrder, // Exceeding max open order count for underlying.
                    '36227': InvalidOrder, // Exceeding max open size across all orders for underlying
                    '36228': InvalidOrder, // Exceeding max available qty for instrument.
                    '36229': InvalidOrder, // Exceeding max available qty for underlying.
                    '36230': InvalidOrder, // Exceeding max position limit for underlying.
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'fetchMarkets': [
                    'spot',
                    'swap',
                ],
                'defaultType': 'swap', // 'account', 'spot', 'margin', 'futures', 'swap', 'option'
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.dataGetCommonTimestamp (params);
        //
        //     {
        //         "status":"ok",
        //         "data":"1595525139400"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchMarkets (params = {}) {
        let types = this.safeValue (this.options, 'fetchMarkets');
        if (!types.length) {
            types = [ this.options['defaultType'] ];
        }
        let result = [];
        for (let i = 0; i < types.length; i++) {
            const markets = await this.fetchMarketsByType (types[i], params);
            result = this.arrayConcat (result, markets);
        }
        return result;
    }

    parseMarkets (markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    parseMarket (market) {
        //
        // spot
        //
        //     {
        //         "base_currency":"btc",
        //         "quote_currency":"usdt",
        //         "symbol":"btc_usdt",
        //         "tick_size":"2",
        //         "size_increment":"4",
        //         "status":"1",
        //         "base_asset_precision":"8"
        //     }
        //
        //
        // swap
        //
        //     {
        //         "instrument_id":"btcusd",
        //         "underlying_index":"BTC",
        //         "quote_currency":"USD",
        //         "coin":"BTC",
        //         "contract_val":"1",
        //         "delivery":["07:00:00","15:00:00","23:00:00"],
        //         "size_increment":"0",
        //         "tick_size":"1",
        //         "forwardContractFlag":false,
        //         "priceEndStep":"5"
        //     }
        //
        //
        const id = this.safeString2 (market, 'symbol', 'instrument_id');
        let marketType = 'spot';
        let spot = true;
        let swap = false;
        const baseId = this.safeString2 (market, 'base_currency', 'coin');
        const quoteId = this.safeString (market, 'quote_currency');
        const contractVal = this.safeFloat (market, 'contract_val');
        if (contractVal !== undefined) {
            marketType = 'swap';
            spot = false;
            swap = true;
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = id.toUpperCase ();
        if (spot) {
            symbol = base + '/' + quote;
        }
        const lotSize = this.safeFloat2 (market, 'lot_size', 'trade_increment');
        const tick_size = this.safeFloat (market, 'tick_size');
        const newtick_size = parseFloat ('1e-' + this.numberToString (tick_size));
        const precision = {
            'amount': this.safeFloat (market, 'size_increment', lotSize),
            'price': newtick_size,
        };
        const minAmount = this.safeFloat2 (market, 'min_size', 'base_min_size');
        const status = this.safeString (market, 'status');
        let active = undefined;
        if (status !== undefined) {
            active = (status === '1');
        }
        const fees = this.safeValue2 (this.fees, marketType, 'trading', {});
        return this.extend (fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
            'type': marketType,
            'spot': spot,
            'swap': swap,
            'active': active,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': precision['price'],
                    'max': undefined,
                },
                'cost': {
                    'min': precision['price'],
                    'max': undefined,
                },
            },
        });
    }

    async fetchMarketsByType (type, params = {}) {
        if (type === 'spot') {
            const response = await this.dataGetCommonSymbols (params);
            //
            //     {
            //         "status":"ok",
            //         "ts":1595526622408,
            //         "data":[
            //             {
            //                 "base_currency":"btc",
            //                 "quote_currency":"usdt",
            //                 "symbol":"btc_usdt",
            //                 "tick_size":"2",
            //                 "size_increment":"4",
            //                 "status":"1",
            //                 "base_asset_precision":"8"
            //             },
            //         ]
            //     }
            //
            const data = this.safeValue (response, 'data', []);
            return this.parseMarkets (data);
        } else if (type === 'swap') {
            const response = await this.capiGetInstruments (params);
            //
            //     {
            //         "data":{
            //             "contractApis":[
            //                 {
            //                     "instrument_id":"btcusd",
            //                     "underlying_index":"BTC",
            //                     "quote_currency":"USD",
            //                     "coin":"BTC",
            //                     "contract_val":"1",
            //                     "delivery":["07:00:00","15:00:00","23:00:00"],
            //                     "size_increment":"0",
            //                     "tick_size":"1",
            //                     "forwardContractFlag":false,
            //                     "priceEndStep":"5"
            //                 },
            //             ]
            //         },
            //         "status":"ok",
            //         "err_code":"00000"
            //     }
            //
            const data = this.safeValue (response, 'data');
            const contractApis = this.safeValue (data, 'contractApis', []);
            return this.parseMarkets (contractApis);
        } else {
            throw new NotSupported (this.id + ' fetchMarketsByType does not support market type ' + type);
        }
    }

    async fetchCurrencies (params = {}) {
        const response = await this.dataGetCommonCurrencys (params);
        //
        //     {
        //         "status":"ok",
        //         "ts":1595537740466,
        //         "data":[
        //             "btc",
        //             "bft",
        //             "usdt",
        //             "usdt-omni",
        //             "usdt-erc20"
        //         ]
        //     }
        //
        const result = {};
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': id,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'fee': undefined, // todo: redesign
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = market['type'] + 'GetInstrumentsInstrumentId';
        method += (market['type'] === 'swap') ? 'Depth' : 'Book';
        const request = {
            'instrument_id': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // max 200
        }
        let response = await this[method] (this.extend (request, params));
        //
        //     {      asks: [ ["0.02685268", "0.242571", "1"],
        //                    ["0.02685493", "0.164085", "1"],
        //                    ...
        //                    ["0.02779", "1.039", "1"],
        //                    ["0.027813", "0.0876", "1"]        ],
        //            bids: [ ["0.02684052", "10.371849", "1"],
        //                    ["0.02684051", "3.707", "4"],
        //                    ...
        //                    ["0.02634963", "0.132934", "1"],
        //                    ["0.02634962", "0.264838", "2"]    ],
        //       timestamp:   "2018-12-17T20:24:16.159Z"            }
        //
        if (response['status'] === 'ok') {
            response = response['data'];
        }
        const timestamp = this.safeString (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {         best_ask: "0.02665472",
        //               best_bid: "0.02665221",
        //          instrument_id: "ETH-BTC",
        //             product_id: "ETH-BTC",
        //                   last: "0.02665472",
        //                    ask: "0.02665472", // missing in the docs
        //                    bid: "0.02665221", // not mentioned in the docs
        //               open_24h: "0.02645482",
        //               high_24h: "0.02714633",
        //                low_24h: "0.02614109",
        //        base_volume_24h: "572298.901923",
        //              timestamp: "2018-12-17T21:20:07.856Z",
        //       quote_volume_24h: "15094.86831261"            }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'instrument_id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        } else if (marketId !== undefined) {
            const parts = marketId.split ('-');
            const numParts = parts.length;
            if (numParts === 2) {
                const [ baseId, quoteId ] = parts;
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            } else {
                symbol = marketId;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (ticker, 'open_24h');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_24h'),
            'low': this.safeFloat (ticker, 'low_24h'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': this.safeFloat (ticker, 'best_bid_size'),
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': this.safeFloat (ticker, 'best_ask_size'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'base_volume_24h'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume_24h'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdTicker';
        const request = {
            'instrument_id': market['id'],
        };
        let response = await this[method] (this.extend (request, params));
        //
        //     {         best_ask: "0.02665472",
        //               best_bid: "0.02665221",
        //          instrument_id: "ETH-BTC",
        //             product_id: "ETH-BTC",
        //                   last: "0.02665472",
        //                    ask: "0.02665472",
        //                    bid: "0.02665221",
        //               open_24h: "0.02645482",
        //               high_24h: "0.02714633",
        //                low_24h: "0.02614109",
        //        base_volume_24h: "572298.901923",
        //              timestamp: "2018-12-17T21:20:07.856Z",
        //       quote_volume_24h: "15094.86831261"            }
        //
        if (response['status'] === 'ok') {
            response = response['data'];
        }
        return this.parseTicker (response);
    }

    async fetchTickersByType (type, symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const method = type + 'GetInstrumentsTicker';
        let response = await this[method] (params);
        if (response['status'] === 'ok') {
            response = response['data']['info'];
        }
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        return await this.fetchTickersByType (type, symbols, this.omit (params, 'type'));
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     spot trades
        //
        //         {
        //             time: "2018-12-17T23:31:08.268Z",
        //             timestamp: "2018-12-17T23:31:08.268Z",
        //             trade_id: "409687906",
        //             price: "0.02677805",
        //             size: "0.923467",
        //             side: "sell"
        //         }
        //
        //
        // fetchOrderTrades (private)
        //
        //     futures trades, swap trades
        //
        //         {
        //             "trade_id":"197429674631450625",
        //             "instrument_id":"EOS-USD-SWAP",
        //             "order_id":"6a-7-54d663a28-0",
        //             "price":"3.633",
        //             "order_qty":"1.0000",
        //             "fee":"-0.000551",
        //             "created_at":"2019-03-21T04:41:58.0Z", // missing in swap trades
        //             "timestamp":"2019-03-25T05:56:31.287Z", // missing in futures trades
        //             "exec_type":"M", // whether the order is taker or maker
        //             "side":"short", // "buy" in futures trades
        //         }
        //
        let symbol = undefined;
        const marketId = this.safeString (trade, 'instrument_id');
        let base = undefined;
        let quote = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        } else if (marketId !== undefined) {
            const parts = marketId.split ('-');
            const numParts = parts.length;
            if (numParts === 2) {
                const [ baseId, quoteId ] = parts;
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            } else {
                symbol = marketId;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        const timestamp = this.parse8601 (this.safeString2 (trade, 'timestamp', 'created_at'));
        const price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat2 (trade, 'size', 'qty');
        amount = this.safeFloat (trade, 'order_qty', amount);
        let takerOrMaker = this.safeString2 (trade, 'exec_type', 'liquidity');
        if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        }
        const side = this.safeString (trade, 'side');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        const feeCost = this.safeFloat (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = (side === 'buy') ? base : quote;
            fee = {
                // fee is either a positive number (invitation rebate)
                // or a negative number (transaction fee deduction)
                // therefore we need to invert the fee
                // more about it https://github.com/ccxt/ccxt/issues/5909
                'cost': -feeCost,
                'currency': feeCurrency,
            };
        }
        const orderId = this.safeString (trade, 'order_id');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString2 (trade, 'trade_id', 'ledger_id'),
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, limit = undefined, since = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdTrades';
        if ((limit === undefined) || (limit > 100)) {
            limit = 100; // maximum = default = 100
        }
        const request = {
            'instrument_id': market['id'],
            'limit': limit,
        };
        const response = await this[method] (this.extend (request, params));
        //
        // spot markets
        //
        //     [
        //         {
        //             time: "2018-12-17T23:31:08.268Z",
        //             timestamp: "2018-12-17T23:31:08.268Z",
        //             trade_id: "409687906",
        //             price: "0.02677805",
        //             size: "0.923467",
        //             side: "sell"
        //         }
        //     ]
        //
        // futures markets, swap markets
        //
        //     [
        //         {
        //             trade_id: "1989230840021013",
        //             side: "buy",
        //             price: "92.42",
        //             qty: "184", // missing in swap markets
        //             size: "5", // missing in futures markets
        //             timestamp: "2018-12-17T23:26:04.613Z"
        //         }
        //     ]
        //
        let result = this.safeValue (response, 'data', {});
        result = this.safeValue (result, 'tradeApiDtos', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        //
        // spot markets
        //
        //     {
        //         close: "0.02684545",
        //         high: "0.02685084",
        //         low: "0.02683312",
        //         open: "0.02683894",
        //         time: "2018-12-17T20:28:00.000Z",
        //         volume: "101.457222"
        //     }
        //
        //
        if (Array.isArray (ohlcv)) {
            const numElements = ohlcv.length;
            const volumeIndex = (numElements > 6) ? 6 : 5;
            const timestamp = this.safeInteger (ohlcv, 0);
            // if (typeof timestamp === 'string') {
            //     timestamp = this.parse8601 (timestamp);
            // }
            return [
                timestamp, // timestamp
                this.safeFloat (ohlcv, 1),            // Open
                this.safeFloat (ohlcv, 2),            // High
                this.safeFloat (ohlcv, 3),            // Low
                this.safeFloat (ohlcv, 4),            // Close
                // this.safeFloat (ohlcv, 5),         // Quote Volume
                // this.safeFloat (ohlcv, 6),         // Base Volume
                this.safeFloat (ohlcv, volumeIndex),  // Volume, bitget will return base volume in the 7th element for future markets
            ];
        } else {
            return [
                this.parse8601 (this.safeString (ohlcv, 'time')),
                this.safeFloat (ohlcv, 'open'),    // Open
                this.safeFloat (ohlcv, 'high'),    // High
                this.safeFloat (ohlcv, 'low'),     // Low
                this.safeFloat (ohlcv, 'close'),   // Close
                this.safeFloat (ohlcv, 'volume'),  // Base Volume
            ];
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['type'] + 'GetInstrumentsInstrumentIdCandles';
        const request = {
            'instrument_id': market['id'],
            'granularity': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            if (limit !== undefined) {
                request['end'] = this.iso8601 (this.sum (since, limit * duration * 1000));
            }
            request['start'] = this.iso8601 (since);
        } else {
            const now = this.milliseconds ();
            if (limit !== undefined) {
                request['start'] = this.iso8601 (now - limit * duration * 1000);
                request['end'] = this.iso8601 (now);
            } else {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV requires either `limit` or `since` to be defined');
            }
        }
        let response = await this[method] (this.extend (request, params));
        if (response['status'] !== 'ok') {
            return response;
        }
        response = response['data']['data'];
        //
        // spot markets
        //
        //     [
        //         {
        //             close: "0.02683401",
        //             high: "0.02683401",
        //             low: "0.02683401",
        //             open: "0.02683401",
        //             time: "2018-12-17T23:47:00.000Z",
        //             volume: "0"
        //         },
        //         {
        //             close: "0.02684545",
        //             high: "0.02685084",
        //             low: "0.02683312",
        //             open: "0.02683894",
        //             time: "2018-12-17T20:28:00.000Z",
        //             volume: "101.457222"
        //         }
        //     ]
        //
        //
        return this.parseOHLCVs (response, market, timeframe);
    }

    parseAccountBalance (response) {
        //
        // account
        //
        //     [
        //         {
        //             balance:  0,
        //             available:  0,
        //             currency: "BTC",
        //             hold:  0
        //         },
        //         {
        //             balance:  0,
        //             available:  0,
        //             currency: "ETH",
        //             hold:  0
        //         }
        //     ]
        //
        // spot
        //
        //     [
        //         {
        //             frozen: "0",
        //             hold: "0",
        //             id: "2149632",
        //             currency: "BTC",
        //             balance: "0.0000000497717339",
        //             available: "0.0000000497717339",
        //             holds: "0"
        //         },
        //         {
        //             frozen: "0",
        //             hold: "0",
        //             id: "2149632",
        //             currency: "ICN",
        //             balance: "0.00000000925",
        //             available: "0.00000000925",
        //             holds: "0"
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'hold');
            account['free'] = this.safeFloat (balance, 'available');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseSwapBalance (response) {
        //
        //     {
        //         "info": [
        //             {
        //                 "equity":"3.0139",
        //                 "fixed_balance":"0.0000",
        //                 "instrument_id":"EOS-USD-SWAP",
        //                 "margin":"0.5523",
        //                 "margin_frozen":"0.0000",
        //                 "margin_mode":"crossed",
        //                 "margin_ratio":"1.0913",
        //                 "realized_pnl":"-0.0006",
        //                 "timestamp":"2019-03-25T03:46:10.336Z",
        //                 "total_avail_balance":"3.0000",
        //                 "unrealized_pnl":"0.0145"
        //             }
        //         ]
        //     }
        //
        // their root field name is "info", so our info will contain their info
        const result = { 'info': response };
        const info = this.safeValue (response, 'info', []);
        for (let i = 0; i < info.length; i++) {
            const balance = info[i];
            const marketId = this.safeString (balance, 'instrument_id');
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                symbol = this.markets_by_id[marketId]['symbol'];
            }
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeFloat (balance, 'equity');
            account['free'] = this.safeFloat (balance, 'total_avail_balance');
            result[symbol] = account;
        }
        return this.parseBalance (result);
    }

    async fetchBalance (params = {}) {
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchBalance requires a type parameter (one of 'account', 'spot', 'margin', 'futures', 'swap')");
        }
        await this.loadMarkets ();
        const suffix = (type === 'account') ? 'Wallet' : 'Accounts';
        const method = type + 'Get' + suffix;
        const query = this.omit (params, 'type');
        let response = await this[method] (query);
        //
        // account
        //
        //     [
        //         {
        //             balance:  0,
        //             available:  0,
        //             currency: "BTC",
        //             hold:  0
        //         },
        //         {
        //             balance:  0,
        //             available:  0,
        //             currency: "ETH",
        //             hold:  0
        //         }
        //     ]
        //
        // spot
        //
        //     [
        //         {
        //             frozen: "0",
        //             hold: "0",
        //             id: "2149632",
        //             currency: "BTC",
        //             balance: "0.0000000497717339",
        //             available: "0.0000000497717339",
        //             holds: "0"
        //         },
        //         {
        //             frozen: "0",
        //             hold: "0",
        //             id: "2149632",
        //             currency: "ICN",
        //             balance: "0.00000000925",
        //             available: "0.00000000925",
        //             holds: "0"
        //         }
        //     ]
        //
        // swap
        //
        //     {
        //         "info": [
        //             {
        //                 "equity":"3.0139",
        //                 "fixed_balance":"0.0000",
        //                 "instrument_id":"EOS-USD-SWAP",
        //                 "margin":"0.5523",
        //                 "margin_frozen":"0.0000",
        //                 "margin_mode":"crossed",
        //                 "margin_ratio":"1.0913",
        //                 "realized_pnl":"-0.0006",
        //                 "timestamp":"2019-03-25T03:46:10.336Z",
        //                 "total_avail_balance":"3.0000",
        //                 "unrealized_pnl":"0.0145"
        //             }
        //         ]
        //     }
        //
        if (response['status'] === 'ok') {
            response = response['data'];
        } else {
            return response;
        }
        return this.parseBalanceByType (type, response);
    }

    parseBalanceByType (type, response) {
        if ((type === 'account') || (type === 'spot')) {
            return this.parseAccountBalance (response);
        } else if (type === 'swap') {
            return this.parseSwapBalance (response);
        }
        throw new NotSupported (this.id + " fetchBalance does not support the '" + type + "' type (the type must be one of 'account', 'spot', 'margin', 'futures', 'swap')");
    }

    async createOrder (symbol, type, amount, price = undefined, match_price = 0, order_type = 0, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'instrument_id': market['id'],
            // 'client_oid': 'abcdef1234567890', // [a-z0-9]{1,32}
            // 'order_type': '0', // 0: Normal limit order (Unfilled and 0 represent normal limit order) 1: Post only 2: Fill Or Kill 3: Immediatel Or Cancel
        };
        const clientOrderId = this.safeString2 (params, 'client_oid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_oid'] = clientOrderId;
            params = this.omit (params, [ 'client_oid', 'clientOrderId' ]);
        }
        let method = undefined;
        if (market['swap']) {
            // const size = market['futures'] ? this.numberToString (amount) : this.amountToPrecision (symbol, amount);
            const size = this.numberToString (amount);
            request = this.extend (request, {
                'type': type, // 1:open long 2:open short 3:close long 4:close short for futures
                'size': size,
                'price': this.priceToPrecision (symbol, price),
                'match_price': match_price, // Order at best counter party price? (0:no 1:yes). The default is 0. If it is set as 1, the price parameter will be ignored. When posting orders at best bid price, order_type can only be 0 (regular order).
                'order_type': order_type,
            });
            method = market['type'] + 'PostOrder';
        }
        let response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "client_oid":"oktspot79",
        //         "error_code":"",
        //         "error_message":"",
        //         "order_id":"2510789768709120",
        //         "result":true
        //     }
        //
        if (response['status'] === 'ok') {
            response = response['data'];
        } else {
            return response;
        }
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'cancelOrder', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " cancelOrder requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
        }
        let method = type + 'PostCancelOrder';
        const request = {
            'instrument_id': market['id'],
        };
        if (market['swap']) {
            method += 'InstrumentId';
        } else {
            method += 's';
        }
        const clientOrderId = this.safeString2 (params, 'client_oid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            method += 'ClientOid';
            request['client_oid'] = clientOrderId;
        } else {
            method += 'OrderId';
            request['order_id'] = id;
        }
        const query = this.omit (params, [ 'type', 'client_oid', 'clientOrderId' ]);
        let response = await this[method] (this.extend (request, query));
        //
        //
        // futures, swap
        //
        //     {
        //         "result": true,
        //         "client_oid": "oktfuture10", // missing if requested by order_id
        //         "order_id": "2517535534836736",
        //         "instrument_id": "EOS-USD-190628"
        //     }
        //
        if (response['status'] === 'ok') {
            response = response['data'];
        } else {
            return response;
        }
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '-2': 'failed',
            '-1': 'canceled',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderSide (side) {
        const sides = {
            '1': 'buy', // open long
            '2': 'sell', // open short
            '3': 'sell', // close long
            '4': 'buy', // close short
        };
        return this.safeString (sides, side, side);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "client_oid":"oktspot79",
        //         "error_code":"",
        //         "error_message":"",
        //         "order_id":"2510789768709120",
        //         "result":true
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "result": true,
        //         "client_oid": "oktfuture10", // missing if requested by order_id
        //         "order_id": "2517535534836736",
        //         // instrument_id is missing for spot/margin orders
        //         // available in futures and swap orders only
        //         "instrument_id": "EOS-USD-190628",
        //     }
        //
        // fetchOrder, fetchOrdersByState, fetchOpenOrders, fetchClosedOrders
        //
        //     // spot and margin orders
        //
        //     {
        //         "client_oid":"oktspot76",
        //         "created_at":"2019-03-18T07:26:49.000Z",
        //         "filled_notional":"3.9734",
        //         "filled_size":"0.001", // filled_qty in futures and swap orders
        //         "funds":"", // this is most likely the same as notional
        //         "instrument_id":"BTC-USDT",
        //         "notional":"",
        //         "order_id":"2500723297813504",
        //         "order_type":"0",
        //         "price":"4013",
        //         "product_id":"BTC-USDT", // missing in futures and swap orders
        //         "side":"buy",
        //         "size":"0.001",
        //         "status":"filled",
        //         "state": "2",
        //         "timestamp":"2019-03-18T07:26:49.000Z",
        //         "type":"limit"
        //     }
        //
        //     // futures and swap orders
        //
        //     {
        //         "instrument_id":"EOS-USD-190628",
        //         "size":"10",
        //         "timestamp":"2019-03-20T10:04:55.000Z",
        //         "filled_qty":"10", // filled_size in spot and margin orders
        //         "fee":"-0.00841043",
        //         "order_id":"2512669605501952",
        //         "price":"3.668",
        //         "price_avg":"3.567", // missing in spot and margin orders
        //         "status":"2",
        //         "state": "2",
        //         "type":"4",
        //         "contract_val":"10",
        //         "leverage":"10", // missing in swap, spot and margin orders
        //         "client_oid":"",
        //         "pnl":"1.09510794", // missing in swap, spo and margin orders
        //         "order_type":"0"
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        let side = this.safeString (order, 'side');
        let type = this.safeString (order, 'type');
        if ((side !== 'buy') && (side !== 'sell')) {
            side = this.parseOrderSide (type);
        }
        if ((type !== 'limit') && (type !== 'market')) {
            if ('pnl' in order) {
                type = 'futures';
            } else {
                type = 'swap';
            }
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'instrument_id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        } else {
            symbol = marketId;
        }
        if (market !== undefined) {
            if (symbol === undefined) {
                symbol = market['symbol'];
            }
        }
        let amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat2 (order, 'filled_size', 'filled_qty');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                amount = Math.max (amount, filled);
                remaining = Math.max (0, amount - filled);
            }
        }
        if (type === 'market') {
            remaining = 0;
        }
        let cost = this.safeFloat2 (order, 'filled_notional', 'funds');
        const price = this.safeFloat (order, 'price');
        let average = this.safeFloat (order, 'price_avg');
        if (cost === undefined) {
            if (filled !== undefined && average !== undefined) {
                cost = average * filled;
            }
        } else {
            if ((average === undefined) && (filled !== undefined) && (filled > 0)) {
                average = cost / filled;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const feeCost = this.safeFloat (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrency = undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const clientOrderId = this.safeString (order, 'client_oid');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchOrder requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
        }
        const instrumentId = (market['swap']) ? 'InstrumentId' : '';
        let method = type + 'GetOrders' + instrumentId;
        const request = {
            'instrument_id': market['id'],
            // 'client_oid': 'abcdef12345', // optional, [a-z0-9]{1,32}
            // 'order_id': id,
        };
        const clientOid = this.safeString (params, 'client_oid');
        if (clientOid !== undefined) {
            method += 'ClientOid';
            request['client_oid'] = clientOid;
        } else {
            method += 'OrderId';
            request['order_id'] = id;
        }
        const query = this.omit (params, 'type');
        let response = await this[method] (this.extend (request, query));
        // swap
        //
        //     {
        //         "instrument_id":"EOS-USD-190628",
        //         "size":"10",
        //         "timestamp":"2019-03-20T02:46:38.000Z",
        //         "filled_qty":"10",
        //         "fee":"-0.0080819",
        //         "order_id":"2510946213248000",
        //         "price":"3.712",
        //         "price_avg":"3.712",
        //         "status":"2",
        //         "state": "2",
        //         "type":"2",
        //         "contract_val":"10",
        //         "leverage":"10",
        //         "client_oid":"", // missing in swap orders
        //         "pnl":"0", // missing in swap orders
        //         "order_type":"0"
        //     }
        //
        if (response['status'] === 'ok') {
            response = response['data'];
        } else {
            return response;
        }
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, status = 5, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrders', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        const instrumentId = (market['swap']) ? 'InstrumentId' : '';
        const method = type + 'GetOrders' + instrumentId;
        const request = {
            'instrument_id': market['id'],
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (status !== undefined) {
            request['status'] = status;
        }
        const query = this.omit (params, 'type');
        let response = await this[method] (this.extend (request, query));
        //
        //  spot
        //
        //     [
        //     {
        //         "instrument_id":"EOS-USD-190628",
        //         "size":"10",
        //         "filled_qty":"10",
        //         "fee":"-0.0080819",
        //         "order_id":"2510946213248000",
        //         "price":"3.712",
        //         "status":"2",
        //         "type":"2"
        //     }
        //     ]
        //
        if (response['status'] === 'ok') {
            response = response['data']['list'];
        } else {
            return response;
        }
        return this.parseOrders (response, market, undefined, limit);
    }

    async fetchOrdersByState (state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByState requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', market['type']);
        const type = this.safeString (params, 'type', defaultType);
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchOrder requires a type parameter (one of 'spot', 'margin', 'futures', 'swap').");
        }
        const request = {
            'instrument_id': market['id'],
            // '-1': cancelled,
            //  '0': Unsold ,
            //  '1': partially filled,
            //  '2': fully filled,
            //  '3': Unsold or partially filled,
            //  '4': cancelling or fully filled,
            //  '5': all,
            'status': state,
        };
        let method = type + 'GetOrders';
        if (market['swap']) {
            method += 'InstrumentId';
        }
        const query = this.omit (params, 'type');
        let response = await this[method] (this.extend (request, query));
        // swap
        //
        //     {
        //         "result":true,  // missing in swap orders
        //         "list": [
        //             {
        //                 "size":"10",
        //                 "timestamp":"1592306780681",
        //                 "filled_qty":"10",
        //                 "fee":"-0.00841043",
        //                 "order_id":"2512669605501952",
        //                 "price":"3.668",
        //                 "price_avg":"3.567",
        //                 "status":"2",
        //                 "type":"4",
        //                 "contract_val":"10",
        //                 "totalProfits": "47186.674999997342"
        //                 "order_type":"0"
        //             },
        //         ]
        //     }
        //
        if (response['status'] === 'ok') {
            response = response['data'];
        } else {
            return response;
        }
        let orders = undefined;
        if (market['type'] === 'swap' || market['type'] === 'futures') {
            orders = this.safeValue (response, 'list', []);
        } else {
            orders = response;
            const responseLength = response.length;
            if (responseLength < 1) {
                return [];
            }
            // in fact, this documented API response does not correspond
            // to their actual API response for spot markets
            // OKEX v3 API returns a plain array of orders
            if (responseLength > 1) {
                const before = this.safeValue (response[1], 'before');
                if (before !== undefined) {
                    orders = response[0];
                }
            }
        }
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // '-1': cancelled,
        //  '0': Unsold ,
        //  '1': partially filled,
        //  '2': fully filled,
        //  '3': Unsold or partially filled,
        //  '4': cancelling or fully filled,
        //  '5': all,
        return await this.fetchOrdersByState ('3', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('4', symbol, since, limit, params);
    }

    parseDepositAddresses (addresses) {
        const result = {};
        for (let i = 0; i < addresses.length; i++) {
            const address = this.parseDepositAddress (addresses[i]);
            const code = address['currency'];
            result[code] = address;
        }
        return result;
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         address: '0x696abb81974a8793352cbd33aadcf78eda3cfdfa',
        //         currency: 'eth'
        //         tag: 'abcde12345', // will be missing if the token does not require a deposit tag
        //         payment_id: 'abcde12345', // will not be returned if the token does not require a payment_id
        //         // can_deposit: 1, // 0 or 1, documented but missing
        //         // can_withdraw: 1, // 0 or 1, documented but missing
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        let tag = this.safeString2 (depositAddress, 'tag', 'payment_id');
        tag = this.safeString (depositAddress, 'memo', tag);
        const currencyId = this.safeString (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.accountGetDepositAddress (this.extend (request, params));
        //
        //     [
        //         {
        //             address: '0x696abb81974a8793352cbd33aadcf78eda3cfdfa',
        //             currency: 'eth'
        //         }
        //     ]
        //
        const addresses = this.parseDepositAddresses (response);
        const address = this.safeValue (addresses, code);
        if (address === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress cannot return nonexistent addresses, you should create withdrawal addresses with the exchange website first');
        }
        return address;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag) {
            address = address + ':' + tag;
        }
        const fee = this.safeString (params, 'fee');
        if (fee === undefined) {
            throw new ArgumentsRequired (this.id + " withdraw() requires a `fee` string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set '0'. Withdrawing to external digital asset address requires network transaction fee.");
        }
        const request = {
            'currency': currency['id'],
            'to_address': address,
            'destination': '4', // 2 = OKCoin International, 3 = OKEx 4 = others
            'amount': this.numberToString (amount),
            'fee': fee, // String. Network transaction fee ≥ 0. Withdrawals to OKCoin or OKEx are fee-free, please set as 0. Withdrawal to external digital asset address requires network transaction fee.
        };
        if ('password' in params) {
            request['trade_pwd'] = params['password'];
        } else if ('trade_pwd' in params) {
            request['trade_pwd'] = params['trade_pwd'];
        } else if (this.password) {
            request['trade_pwd'] = this.password;
        }
        const query = this.omit (params, [ 'fee', 'password', 'trade_pwd' ]);
        if (!('trade_pwd' in request)) {
            throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a password / trade_pwd parameter');
        }
        const response = await this.accountPostWithdrawal (this.extend (request, query));
        //
        //     {
        //         "amount":"0.1",
        //         "withdrawal_id":"67485",
        //         "currency":"btc",
        //         "result":true
        //     }
        //
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawal_id'),
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'accountGetDepositHistory';
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['code'] = currency['code'];
            method += 'Currency';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'accountGetWithdrawalHistory';
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['code'] = currency['code'];
            method += 'Currency';
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit, params);
    }

    parseTransactionStatus (status) {
        //
        // deposit statuses
        //
        //     {
        //         '0': 'waiting for confirmation',
        //         '1': 'confirmation account',
        //         '2': 'recharge success'
        //     }
        //
        // withdrawal statues
        //
        //     {
        //        '-3': 'pending cancel',
        //        '-2': 'cancelled',
        //        '-1': 'failed',
        //         '0': 'pending',
        //         '1': 'sending',
        //         '2': 'sent',
        //         '3': 'email confirmation',
        //         '4': 'manual confirmation',
        //         '5': 'awaiting identity confirmation'
        //     }
        //
        const statuses = {
            '-3': 'pending',
            '-2': 'pending',
            '-1': 'failed',
            '0': 'pending',
            '1': 'pending',
            '2': 'ok',
            '3': 'pending',
            '4': 'pending',
            '5': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "amount":"0.1",
        //         "withdrawal_id":"67485",
        //         "currency":"btc",
        //         "result":true
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         amount: "4.72100000",
        //         withdrawal_id: "1729116",
        //         fee: "0.01000000eth",
        //         txid: "0xf653125bbf090bcfe4b5e8e7b8f586a9d87aa7de94598702758c0802b…",
        //         currency: "ETH",
        //         from: "7147338839",
        //         to: "0x26a3CB49578F07000575405a57888681249c35Fd",
        //         timestamp: "2018-08-17T07:03:42.000Z",
        //         status: "2"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "amount": "4.19511659",
        //         "txid": "14c9a8c925647cdb7e5b2937ea9aefe2b29b2c273150ad3f44b3b8a4635ed437",
        //         "currency": "XMR",
        //         "from": "",
        //         "to": "48PjH3ksv1fiXniKvKvyH5UtFs5WhfS2Vf7U3TwzdRJtCc7HJWvCQe56dRahyhQyTAViXZ8Nzk4gQg6o4BJBMUoxNy8y8g7",
        //         "deposit_id": 11571659, <-- we can use this
        //         "timestamp": "2019-10-01T14:54:19.000Z",
        //         "status": "2"
        //     }
        //
        let type = undefined;
        let id = undefined;
        let address = undefined;
        const withdrawalId = this.safeString (transaction, 'withdrawal_id');
        const addressFrom = this.safeString (transaction, 'from');
        const addressTo = this.safeString (transaction, 'to');
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
            id = withdrawalId;
            address = addressTo;
        } else {
            // the payment_id will appear on new deposits but appears to be removed from the response after 2 months
            id = this.safeString2 (transaction, 'payment_id', 'deposit_id');
            type = 'deposit';
            address = addressTo;
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeFloat (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.parse8601 (this.safeString (transaction, 'timestamp'));
        let feeCost = undefined;
        if (type === 'deposit') {
            feeCost = 0;
        } else {
            if (currencyId !== undefined) {
                const feeWithCurrencyId = this.safeString (transaction, 'fee');
                if (feeWithCurrencyId !== undefined) {
                    // https://github.com/ccxt/ccxt/pull/5748
                    const lowercaseCurrencyId = currencyId.toLowerCase ();
                    const feeWithoutCurrencyId = feeWithCurrencyId.replace (lowercaseCurrencyId, '');
                    feeCost = parseFloat (feeWithoutCurrencyId);
                }
            }
        }
        // todo parse tags
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': address,
            'tagFrom': undefined,
            'tagTo': undefined,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseMyTrade (pair, market = undefined) {
        // check that trading symbols match in both entries
        const first = pair[0];
        const second = pair[1];
        const firstMarketId = this.safeString (first, 'instrument_id');
        const secondMarketId = this.safeString (second, 'instrument_id');
        if (firstMarketId !== secondMarketId) {
            throw new NotSupported (this.id + ' parseMyTrade() received unrecognized response format, differing instrument_ids in one fill, the exchange API might have changed, paste your verbose output: https://github.com/ccxt/ccxt/wiki/FAQ#what-is-required-to-get-help');
        }
        const marketId = firstMarketId;
        // determine the base and quote
        let quoteId = undefined;
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            quoteId = market['quoteId'];
            symbol = market['symbol'];
        } else {
            const parts = marketId.split ('-');
            quoteId = this.safeString (parts, 1);
            symbol = marketId;
        }
        const id = this.safeString (first, 'trade_id');
        const price = this.safeFloat (first, 'price');
        // determine buy/sell side and amounts
        // get the side from either the first trade or the second trade
        let feeCost = this.safeFloat (first, 'fee');
        const index = (feeCost !== 0) ? 0 : 1;
        const userTrade = this.safeValue (pair, index);
        const otherTrade = this.safeValue (pair, 1 - index);
        const receivedCurrencyId = this.safeString (userTrade, 'currency');
        let side = undefined;
        let amount = undefined;
        let cost = undefined;
        if (receivedCurrencyId === quoteId) {
            side = 'sell';
            amount = this.safeFloat (otherTrade, 'size');
            cost = this.safeFloat (userTrade, 'size');
        } else {
            side = 'buy';
            amount = this.safeFloat (userTrade, 'size');
            cost = this.safeFloat (otherTrade, 'size');
        }
        feeCost = (feeCost !== 0) ? feeCost : this.safeFloat (second, 'fee');
        const trade = this.safeValue (pair, index);
        //
        // simplified structures to show the underlying semantics
        //
        //     // market/limit sell
        //
        //     {
        //         "currency":"USDT",
        //         "fee":"-0.04647925", // ←--- fee in received quote currency
        //         "price":"129.13", // ←------ price
        //         "size":"30.98616393", // ←-- cost
        //     },
        //     {
        //         "currency":"ETH",
        //         "fee":"0",
        //         "price":"129.13",
        //         "size":"0.23996099", // ←--- amount
        //     },
        //
        //     // market/limit buy
        //
        //     {
        //         "currency":"ETH",
        //         "fee":"-0.00036049", // ←--- fee in received base currency
        //         "price":"129.16", // ←------ price
        //         "size":"0.240322", // ←----- amount
        //     },
        //     {
        //         "currency":"USDT",
        //         "fee":"0",
        //         "price":"129.16",
        //         "size":"31.03998952", // ←-- cost
        //     }
        //
        const timestamp = this.parse8601 (this.safeString2 (trade, 'timestamp', 'created_at'));
        let takerOrMaker = this.safeString2 (trade, 'exec_type', 'liquidity');
        if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        } else if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (userTrade, 'currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                // fee is either a positive number (invitation rebate)
                // or a negative number (transaction fee deduction)
                // therefore we need to invert the fee
                // more about it https://github.com/ccxt/ccxt/issues/5909
                'cost': -feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'order_id');
        return {
            'info': pair,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        const grouped = this.groupBy (trades, 'trade_id');
        const tradeIds = Object.keys (grouped);
        const result = [];
        for (let i = 0; i < tradeIds.length; i++) {
            const tradeId = tradeIds[i];
            const pair = grouped[tradeId];
            // make sure it has exactly 2 trades, no more, no less
            const numTradesInPair = pair.length;
            if (numTradesInPair === 2) {
                const trade = this.parseMyTrade (pair);
                result.push (trade);
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // okex actually returns ledger entries instead of fills here, so each fill in the order
        // is represented by two trades with opposite buy/sell sides, not one :\
        // this aspect renders the 'fills' endpoint unusable for fetchOrderTrades
        // until either OKEX fixes the API or we workaround this on our side somehow
        return await this.fetchOrdersByState ('4', symbol, since, limit, params);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            // 'instrument_id': market['id'],
            'order_id': id,
            // 'after': '1', // return the page after the specified page number
            // 'before': '1', // return the page before the specified page number
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchLedger', 'defaultType');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const suffix = (type === 'account') ? '' : 'Accounts';
        let argument = '';
        const request = {
            // 'from': 'id',
            // 'to': 'id',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if ((type === 'spot') || (type === 'futures')) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger requires a currency code argument for '" + type + "' markets");
            }
            argument = 'Currency';
            currency = this.currency (code);
            request['currency'] = currency['id'];
        } else if ((type === 'margin') || (type === 'swap')) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + " fetchLedger requires a code argument (a market symbol) for '" + type + "' markets");
            }
            argument = 'InstrumentId';
            const market = this.market (code); // we intentionally put a market inside here for the margin and swap ledgers
            currency = this.currency (market['base']);
            request['instrument_id'] = market['id'];
            //
            //     if (type === 'margin') {
            //         //
            //         //      3. Borrow
            //         //      4. Repayment
            //         //      5. Interest
            //         //      7. Buy
            //         //      8. Sell
            //         //      9. From capital account
            //         //     10. From C2C
            //         //     11. From Futures
            //         //     12. From Spot
            //         //     13. From ETT
            //         //     14. To capital account
            //         //     15. To C2C
            //         //     16. To Spot
            //         //     17. To Futures
            //         //     18. To ETT
            //         //     19. Mandatory Repayment
            //         //     20. From Piggybank
            //         //     21. To Piggybank
            //         //     22. From Perpetual
            //         //     23. To Perpetual
            //         //     24. Liquidation Fee
            //         //     54. Clawback
            //         //     59. Airdrop Return.
            //         //
            //         request['type'] = 'number'; // All types will be returned if this filed is left blank
            //     }
            //
        } else if (type === 'account') {
            if (code !== undefined) {
                currency = this.currency (code);
                request['currency'] = currency['id'];
            }
            //
            //     //
            //     //      1. deposit
            //     //      2. withdrawal
            //     //     13. cancel withdrawal
            //     //     18. into futures account
            //     //     19. out of futures account
            //     //     20. into sub account
            //     //     21. out of sub account
            //     //     28. claim
            //     //     29. into ETT account
            //     //     30. out of ETT account
            //     //     31. into C2C account
            //     //     32. out of C2C account
            //     //     33. into margin account
            //     //     34. out of margin account
            //     //     37. into spot account
            //     //     38. out of spot account
            //     //
            //     request['type'] = 'number';
            //
        } else {
            throw new NotSupported (this.id + " fetchLedger does not support the '" + type + "' type (the type must be one of 'account', 'spot', 'margin', 'futures', 'swap')");
        }
        const method = type + 'Get' + suffix + argument + 'Ledger';
        const response = await this[method] (this.extend (request, query));
        //
        // transfer     funds transfer in/out
        // trade        funds moved as a result of a trade, spot and margin accounts only
        // rebate       fee rebate as per fee schedule, spot and margin accounts only
        // match        open long/open short/close long/close short (futures) or a change in the amount because of trades (swap)
        // fee          fee, futures only
        // settlement   settlement/clawback/settle long/settle short
        // liquidation  force close long/force close short/deliver close long/deliver close short
        // funding      funding fee, swap only
        // margin       a change in the amount after adjusting margin, swap only
        //
        // swap
        //
        //     [
        //         {
        //             "amount":"0.004742",
        //             "fee":"-0.000551",
        //             "type":"match",
        //             "instrument_id":"EOS-USD-SWAP",
        //             "ledger_id":"197429674941902848",
        //             "timestamp":"2019-03-25T05:56:31.286Z"
        //         },
        //     ]
        //
        const responseLength = response.length;
        if (responseLength < 1) {
            return [];
        }
        const isArray = Array.isArray (response[0]);
        const isMargin = (type === 'margin');
        const entries = (isMargin && isArray) ? response[0] : response;
        return this.parseLedger (entries, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            'transfer': 'transfer', // // funds transfer in/out
            'trade': 'trade', // funds moved as a result of a trade, spot and margin accounts only
            'rebate': 'rebate', // fee rebate as per fee schedule, spot and margin accounts only
            'match': 'trade', // open long/open short/close long/close short (futures) or a change in the amount because of trades (swap)
            'fee': 'fee', // fee, futures only
            'settlement': 'trade', // settlement/clawback/settle long/settle short
            'liquidation': 'trade', // force close long/force close short/deliver close long/deliver close short
            'funding': 'fee', // funding fee, swap only
            'margin': 'margin', // a change in the amount after adjusting margin, swap only
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //
        // account
        //
        //     {
        //         "amount":0.00051843,
        //         "balance":0.00100941,
        //         "currency":"BTC",
        //         "fee":0,
        //         "ledger_id":8987285,
        //         "timestamp":"2018-10-12T11:01:14.000Z",
        //         "typename":"Get from activity"
        //     }
        //
        // spot
        //
        //     {
        //         "timestamp":"2019-03-18T07:08:25.000Z",
        //         "ledger_id":"3995334780",
        //         "created_at":"2019-03-18T07:08:25.000Z",
        //         "currency":"BTC",
        //         "amount":"0.0009985",
        //         "balance":"0.0029955",
        //         "type":"trade",
        //         "details":{
        //             "instrument_id":"BTC-USDT",
        //             "order_id":"2500650881647616",
        //             "product_id":"BTC-USDT"
        //         }
        //     }
        //
        // margin
        //
        //     {
        //         "created_at":"2019-03-20T03:45:05.000Z",
        //         "ledger_id":"78918186",
        //         "timestamp":"2019-03-20T03:45:05.000Z",
        //         "currency":"EOS",
        //         "amount":"0", // ?
        //         "balance":"0.59957711",
        //         "type":"transfer",
        //         "details":{
        //             "instrument_id":"EOS-USDT",
        //             "order_id":"787057",
        //             "product_id":"EOS-USDT"
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "amount":"0.004742",
        //         "fee":"-0.000551",
        //         "type":"match",
        //         "instrument_id":"EOS-USD-SWAP",
        //         "ledger_id":"197429674941902848",
        //         "timestamp":"2019-03-25T05:56:31.286Z"
        //     },
        //
        const id = this.safeString (item, 'ledger_id');
        const account = undefined;
        const details = this.safeValue (item, 'details', {});
        const referenceId = this.safeString (details, 'order_id');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'currency'), currency);
        const amount = this.safeFloat (item, 'amount');
        const timestamp = this.parse8601 (this.safeString (item, 'timestamp'));
        const fee = {
            'cost': this.safeFloat (item, 'fee'),
            'currency': code,
        };
        const before = undefined;
        const after = this.safeFloat (item, 'balance');
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': before, // balance before
            'after': after, // balance after
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + this.implodeParams (path, params);
        if (api === 'capi') {
            request = '/api/swap' + request;
        } else {
            request = '/' + api + request;
        }
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeParams (this.urls['api'][api], { 'hostname': this.hostname }) + request;
        if ((api === 'data') || (api === 'capi')) {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.numberToString (this.milliseconds ());
            query['method'] = path;
            let querystr = '';
            if (Object.keys (query).length) {
                querystr = this.urlencode (query);
            }
            let auth = timestamp + method + request;
            headers = {};
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    const urlencodedQuery = '?' + this.urlencode (query);
                    url += urlencodedQuery;
                    auth += urlencodedQuery;
                }
                // url += '?' + queryparam + '&accesskey=' + this.apiKey + '&sign=' + sign + '&req_time=' + timestamp;
                url += '&accesskey=' + this.apiKey + '&req_time=' + timestamp + '&sign=ccxt';
                auth += '&accesskey=' + this.apiKey + '&req_time=' + timestamp + '&sign=ccxt';
            } else {
                url += '?' + querystr + '&accesskey=' + this.apiKey + '&req_time=' + timestamp + '&sign=ccxt';
                auth += '?' + querystr + '&accesskey=' + this.apiKey + '&req_time=' + timestamp + '&sign=ccxt';
                // if (isArray || Object.keys (query).length) {
                //     body = this.json (query);
                //     auth += body;
                // }
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            const sign = signature;
            headers['ACCESS-SIGN'] = sign;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const feedback = this.id + ' ' + body;
        if (code === 503) {
            // {"message":"name resolution failed"}
            throw new ExchangeNotAvailable (feedback);
        }
        if (!response) {
            return; // fallback to default error handler
        }
        const message = this.safeString (response, 'message');
        const errorCode = this.safeString2 (response, 'code', 'error_code');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            const nonEmptyMessage = (message !== '');
            const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '0');
            if (nonZeroErrorCode || nonEmptyMessage) {
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
