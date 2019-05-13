# Introduction

Thank you for your interest into contributing CCXT-REST. This project needs all the help it can get given all the breadth and depth of its scope :) We hope to make your contribution easier through this guide. For any question, feel free to shoot as an email over contact@ccxt-rest.io.


# Types of Contributions

CCXT-REST is an open source project and we love to receive contributions from our community — you! There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code which can be incorporated into CCXT-REST itself.

A few aspects though which is of particular interest right now for the CCXT-REST team (which may change in the future) are the following:

# New to Open Source Contribution and not just on CCXT-REST?

You can check this out [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

# Your First Contribution

Unsure where to begin contributing to CCXT-REST? You can start by looking through the [Exchange Summary Dashboard](https://ccxt-rest.io/#exchange-api-statuses) and check out the exchanges that are not fully green. 

The fix there may be in [CCXT](https://github.com/ccxt/ccxt), in CCXT-REST, or both. 

If you see a particular exchange you want to try to investigate, you can clone this repo

```
git clone https://github.com/ccxt-rest/ccxt-rest.git
```

And then run the Exchange Summary Dashboard test.

```
npm run generate:exchangeSummary
```

This would create the test results in `./out/exchange-summary-dashboard/mochaaweseom.html` and the Exchange Summary Dashboard in `./out/exchanges/index.html`. Both of which you can open in your browser to view. 

If you want to run the test against a particular exchange only (for example, you are investigating binance), you can run the following command

```
npm run generate:exchangeSummary -- --fgrep '[binance]'
```

_Note: the `--` after the script name `generate:exchangeSummary` means whatever follows the `--` would be passed as parameters to the contents of `generate:exchangeSummary`. That means if you want to pass in more mocha specific parameters, you can add it after `--`. Furthermore, the parameters passed here are not passed directly into the mocha cli (command line interface). That's because the way `generate:exchangeSummary` is designed, is that it generates one test file per exchange under `./scripts/exchange-summary-dashboard/generated/`, and then uses `mocha-parallel-tests` [programmatically](https://github.com/mocha-parallel/mocha-parallel-tests#programmatic-api) in order to pass the parameters after `--` into `Mocha` parallel. And because we are setting this parameters programatically instead of directly into the cli, we are actually 'reimplementing' how parameters are passed into the the `Mocha` object. Which means the normal mocha cli parameters may not be same as that of `generate:exchangeSummary` . In any case, if you make a mistake, it should throw an error and some hints as to which parameters you can actually use._


# How to Submit a Contribution

If there are no existing [issues](https://github.com/ccxt-rest/ccxt-rest/issues) yet

1. Create your own fork of the code
2. Do the changes in your fork
3. Submit a Pull Request
4. Comment your Pull Request URL into the Github Issue that that pull request is for.
   * Note: If there are no associated issues yet for your Pull Request, kindly [create an issue](https://github.com/ccxt-rest/ccxt-rest/issues/new/choose) first


# How to file a Bug / Feature Request / Other Issues

***
**IMPORTANT** : If you find a security vulnerability, do NOT open an issue. Email security@ccxt-rest.io instead, with the subject "SECURITY BUG: **`xyz`**" (_where **`xyz`** is a short description of the bug_). Then in the body of the email, kindly provide as much information abou the security bug and how to reproduce it.

In order to determine whether you are dealing with a security issue, ask yourself these two questions:

* Can I access something that's not mine, or something I shouldn't have access to?
* Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you're unsure, just email us at security@ccxt-rest.io.
***

When filing a bug or feature request or other types of issues, there are already template setup for each issue type. Kindly read through the template and follow the instructions there.


# Code review process

The core team looks at Pull Requests and would comment on things to improve, or whether it would be accepted or rejected, or possibly ask questions about the Pull Request.

# Community

You can chat with the core team on https://gitter.im/ccxt-rest/community. We may not always be online but we will try to respond as prompt as possible :)

