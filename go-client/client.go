package ccxtrest

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/ccxt/ccxt/go"
	"github.com/ccxt/ccxt/go/util"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"path"
)

var (
	debug  = flag.Bool("debug", false, "Log outgoing requests and responses to server")
	server = flag.String("server", "http://localhost:3000/", "ccxt-rest server addr")
)

const (
	endpointExchanges = "exchanges"
)

func ListExchanges(cli *http.Client) ([]string, error) {
	if cli == nil {
		cli = http.DefaultClient
	}
	resp, err := cli.Get(*server + endpointExchanges)
	if err != nil {
		return nil, err
	}
	dec := json.NewDecoder(resp.Body)
	var exchanges []string
	return exchanges, dec.Decode(&exchanges)
}

// Exchange implements ccxt.Exchange interface.
// It forwards requests to ccxt-rest server and
// unwrap responses to relevant models from ccxt.
type Exchange struct {
	ccxt.ExchangeInfo
	Key     string
	ID      string
	Markets map[string]ccxt.Market

	BaseURL string
	*http.Client
}

func NewExchange(exchange string, id string, key, secret string, cli *http.Client) (*Exchange, error) {
	x := &Exchange{
		Client:  cli,
		Key:     exchange,
		ID:      id,
		BaseURL: *server,
	}
	if x.Client == nil {
		x.Client = http.DefaultClient
	}
	return x, x.Init(key, secret)
}

func (x *Exchange) Init(key, secret string) error {
	params := map[string]interface{}{
		"id":     x.ID,
		"apiKey": key,
		"secret": secret,
	}
	return x.Post(path.Join(endpointExchanges, x.Key), &x.ExchangeInfo, params)
}

func (x *Exchange) Info() ccxt.ExchangeInfo {
	return x.ExchangeInfo
}

func (x *Exchange) FetchCurrencies() (c []ccxt.Currency, err error) {
	return c, x.Post(x.Path("fetchCurrencies"), &c, nil)
}

func (x *Exchange) FetchMarkets() (m []ccxt.Market, err error) {
	return m, x.Post(x.Path("fetchMarkets"), &m, nil)
}

func (x *Exchange) LoadMarkets(reload bool) (m map[string]ccxt.Market, err error) {
	if reload || x.Markets == nil {
		x.Markets, err = ccxt.LoadMarkets(x)
	}
	return x.Markets, err
}

func (x *Exchange) GetMarket(id string) (m ccxt.Market, err error) {
	if x.Markets == nil {
		_, err := x.LoadMarkets(false)
		if err != nil {
			return m, err
		}
	}
	m, ok := x.Markets[id]
	if !ok {
		err = ccxt.NotSupportedError(fmt.Sprintf("market %s not found for %s", id, x.Key))
	}
	return m, err
}

func (x *Exchange) FetchTickers(
	symbols []string,
	params map[string]interface{},
) (t map[string]ccxt.Ticker, err error) {
	return t, x.Post(x.Path("fetchTickers"), &t, []interface{}{symbols, params})
}

func (x *Exchange) FetchTicker(
	symbol string,
	params map[string]interface{},
) (t ccxt.Ticker, err error) {
	return t, x.Post(x.Path("fetchTicker"), &t, []interface{}{symbol, params})
}

func (x *Exchange) FetchOHLCV(
	symbol string,
	timeframe string,
	since *util.JSONTime,
	limit *int,
	params map[string]interface{},
) (o []ccxt.OHLCV, err error) {
	return o, x.Post(x.Path("fetchOHLCV"), &o, []interface{}{symbol, timeframe, since, limit, params})
}

func (x *Exchange) FetchOrderBook(
	symbol string,
	limit *int,
	params map[string]interface{},
) (o ccxt.OrderBook, err error) {
	return o, x.Post(x.Path("fetchOrderBook"), &o, []interface{}{symbol, limit, params})
}

func (x *Exchange) FetchL2OrderBook(
	symbol string,
	limit *int,
	params map[string]interface{},
) (o ccxt.OrderBook, err error) {
	return o, x.Post(x.Path("fetchL2OrderBook"), &o, []interface{}{symbol, limit, params})
}

func (x *Exchange) FetchTrades(
	symbol string,
	since *util.JSONTime,
	params map[string]interface{},
) (t []ccxt.Trade, err error) {
	return t, x.Post(x.Path("fetchTrades"), &t, []interface{}{symbol, since, params})
}

func (x *Exchange) FetchOrder(
	id string,
	symbol *string,
	params map[string]interface{},
) (o ccxt.Order, err error) {
	return o, x.Post(x.Path("fetchOrder"), &o, []interface{}{id, symbol, params})
}

func (x *Exchange) FetchOrders(
	symbol *string,
	since *util.JSONTime,
	limit *int,
	params map[string]interface{},
) (o []ccxt.Order, err error) {
	return o, x.Post(x.Path("fetchOrders"), &o, []interface{}{symbol, since, limit, params})
}

func (x *Exchange) FetchOpenOrders(
	symbol *string,
	since *util.JSONTime,
	limit *int,
	params map[string]interface{},
) (o []ccxt.Order, err error) {
	return o, x.Post(x.Path("fetchOpenOrders"), &o, []interface{}{symbol, since, limit, params})
}

func (x *Exchange) FetchClosedOrders(
	symbol *string,
	since *util.JSONTime,
	limit *int,
	params map[string]interface{},
) (o []ccxt.Order, err error) {
	return o, x.Post(x.Path("fetchClosedOrders"), &o, []interface{}{symbol, since, limit, params})
}

func (x *Exchange) FetchMyTrades(
	symbol *string,
	since *util.JSONTime,
	limit *int,
	params map[string]interface{},
) (t []ccxt.Trade, err error) {
	return t, x.Post(x.Path("fetchMyTrades"), &t, []interface{}{symbol, since, limit, params})
}

func (x *Exchange) FetchBalance(params map[string]interface{}) (b ccxt.Balances, err error) {
	return b, x.Post(x.Path("fetchBalance"), &b, []interface{}{params})
}

func (x *Exchange) CreateOrder(
	symbol, t, side string,
	amount float64,
	price *float64,
	params map[string]interface{},
) (o ccxt.Order, err error) {
	return o, x.Post(x.Path("createOrder"), &o, []interface{}{symbol, t, side, amount, price, params})
}

func (x *Exchange) CancelOrder(
	id string,
	symbol *string,
	params map[string]interface{}) error {
	return x.Post(x.Path("cancelOrder"), nil, []interface{}{id, symbol, params})
}

func (x *Exchange) CreateLimitBuyOrder(
	symbol string,
	amount float64,
	price *float64,
	params map[string]interface{},
) (ccxt.Order, error) {
	return x.CreateOrder(symbol, "limit", "buy", amount, price, params)
}

func (x *Exchange) CreateLimitSellOrder(
	symbol string,
	amount float64,
	price *float64,
	params map[string]interface{},
) (ccxt.Order, error) {
	return x.CreateOrder(symbol, "limit", "sell", amount, price, params)
}

func (x *Exchange) CreateMarketBuyOrder(
	symbol string,
	amount float64,
	params map[string]interface{},
) (ccxt.Order, error) {
	return x.CreateOrder(symbol, "market", "buy", amount, nil, params)
}

func (x *Exchange) CreateMarketSellOrder(
	symbol string,
	amount float64,
	params map[string]interface{},
) (ccxt.Order, error) {
	return x.CreateOrder(symbol, "market", "sell", amount, nil, params)
}

func (x *Exchange) Path(endpoint string) string {
	return path.Join(endpointExchanges, x.Key, x.ID, endpoint)
}

func (x *Exchange) Post(endpoint string, dest interface{}, params interface{}) error {
	return x.Do(http.MethodPost, endpoint, dest, params)
}

func (x *Exchange) Get(endpoint string, dest interface{}) error {
	return x.Do(http.MethodGet, endpoint, dest, nil)
}

func (x *Exchange) Do(method, endpoint string, dest interface{}, params interface{}) error {
	if s := path.Base(endpoint); s != x.Key && !x.Has[s] {
		return ccxt.NotSupportedError(s)
	}

	u, err := url.Parse(x.BaseURL)
	if err != nil {
		return fmt.Errorf("couldn't parse BaseURL for %s: %s", x.ID, err)
	}
	u.Path = path.Join(u.Path, endpoint)
	var body io.Reader
	if params != nil {
		body = new(bytes.Buffer)
		enc := json.NewEncoder(body.(*bytes.Buffer))
		err := enc.Encode(params)
		if err != nil {
			return fmt.Errorf("couldn't json encode params: %s", err)
		}
	}
	rq, err := http.NewRequest(method, u.String(), body)
	if err != nil {
		return fmt.Errorf("error making request: %s", err)
	}

	if *debug {
		s := fmt.Sprintf("%s %s", method, u.String())
		if params != nil {
			// do not display api credentials, just in case
			if p, ok := params.(map[string]interface{}); ok {
				if apiKey, ok := p["apiKey"]; ok && apiKey != "" {
					p["apiKey"] = "*"
				}
				if secret, ok := p["secret"]; ok && secret != "" {
					p["secret"] = "*"
				}
			}
			pparams, _ := json.MarshalIndent(params, "", "  ")
			s += "\n" + string(pparams)
		}
		log.Println(s)
	}

	resp, err := x.Client.Do(rq)
	if err != nil {
		return err
	}

	// read body
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error reading body: %s", err)
	}

	if *debug {
		s := fmt.Sprint(resp.StatusCode)
		if len(respBody) > 0 {
			var jsonMapResp map[string]interface{}
			err := json.Unmarshal(respBody, &jsonMapResp)
			if err == nil {
				// do not display api credentials, just in case
				if apiKey, ok := jsonMapResp["apiKey"]; ok && apiKey != "" {
					jsonMapResp["apiKey"] = "*"
				}
				if secret, ok := jsonMapResp["secret"]; ok && secret != "" {
					jsonMapResp["secret"] = "*"
				}
				b, _ := json.MarshalIndent(jsonMapResp, "", "  ")
				s += "\n" + string(b)
			} else {
				prettyBody := bytes.NewBuffer(nil)
				_ = json.Indent(prettyBody, respBody, "", "  ")
				s += "\n" + string(prettyBody.Bytes())
			}
		} else {
			s += " - empty body"
		}
		log.Println(s)
	}

	if resp.StatusCode > 299 || resp.StatusCode < 200 {
		// unpack ccxt-rest error message & type
		var ccxtErr = struct {
			Message string `json:"message"`
			Type    string `json:"type"`
		}{}
		err = json.Unmarshal(respBody, &ccxtErr)
		if err == nil && ccxtErr.Message != "" {
			return ccxt.TypedError(ccxtErr.Type, ccxtErr.Message)
		}
		return fmt.Errorf("%s: %d - %s", u, resp.StatusCode, respBody)
	}

	if dest == nil {
		return nil
	}

	err = json.Unmarshal(respBody, dest)
	if err != nil {
		return fmt.Errorf("error decoding ccxt-rest response: %s\n", err)
	}
	return nil
}
