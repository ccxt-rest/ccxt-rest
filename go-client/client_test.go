package ccxtrest

import (
	"flag"
	"github.com/ccxt/ccxt/go/ccxttest"
	"log"
	"testing"
)

var (
	exchange = flag.String("exchange", "bitfinex", "exchange to test")
	key      = flag.String("key", "", "api key")
	secret   = flag.String("secret", "", "api secret")

	x   *Exchange
	err error
)

func init() {
	flag.Parse()
	x, err = NewExchange(*exchange, *exchange, *key, *secret, nil)
	if err != nil {
		log.Fatalf("couldn't create exchange %s: %s", *exchange, err)
	}
	log.Printf("testing exchange \"%s\"", *exchange)
}

// TestNewExchange cannot fail, it tries to instanciate
// each available exchanges listed by ccxt via ListExchanges
// and logs error for those who failed.
// Errors should be unmarshalling errors when structure
// don't match expected.
func TestNewExchange(t *testing.T) {
	exchanges, err := ListExchanges(nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("%d available exchanges\n", len(exchanges))

	var ok []string
	for _, v := range exchanges {
		// init each exchange
		_, err := NewExchange(v, "test"+v, "", "", nil)
		if err != nil {
			t.Logf("couldnt create %s: %s", v, err)
		} else {
			ok = append(ok, v)
		}
	}
	t.Logf("successfully created %d/%d exchange instances", len(ok), len(exchanges))
	t.Logf("\t%v", ok)
}

func TestExchange(t *testing.T) {
	ccxttest.TestExchange(t, x)
}
