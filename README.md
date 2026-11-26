# Sum up 26 November's world news in one image

[![make.fun](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126)
[![Rank](https://make.fun/badge/news-image-20261126/wongjinwei/makefun-news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126)
[![Reward](https://make.fun/badge/news-image-20261126/wongjinwei/makefun-news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126)

Entry for the [make.fun](https://make.fun) bounty
[news-image-20261126](https://make.fun/bounty/news-image-20261126):
a program that draws one image summing up the world's news of
Thursday 26 November 2026.

## The image

`main.ts` draws a 1024×1024 front page covering six stories from
26 November 2026 — Brent near 95 as Gulf attacks roil oil, the US
proposing tariffs on 14 economies, Ukraine hitting a Russian airbase,
the UK writing to 100,000 veterans, Kim vowing more nukes and
expelling the Swiss, and the Macy's Thanksgiving parade moved by
storm — and writes it to `entry.png`.

- Size: 17,133 bytes (limit 1 MiB), 1024×1024 pixels
- Deterministic: two runs produce byte-identical output
  (sha256 `bc45654e3676171d0daa23853dcb869760016d64be459c68133ac5175cae2253`)

## Run it

Node 22.18+ (tested on Node v24.22.1), standard library only, no network:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
