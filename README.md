# Sum up 26 November's world news in one image

[![make.fun](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126)
[![Rank](https://make.fun/badge/news-image-20261126/wongjinwei/makefun-news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126)
[![Reward](https://make.fun/badge/news-image-20261126/wongjinwei/makefun-news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126)

Entry for the [make.fun](https://make.fun) bounty
[news-image-20261126](https://make.fun/bounty/news-image-20261126):
a program that draws one image summing up the world's news of
Thursday 26 November 2026.

## The image

`main.py` draws a 1024×1024 front page covering six stories from
26 November 2026 — Brent near 95 as Gulf attacks roil oil, the US
proposing tariffs on 14 economies, Ukraine hitting a Russian airbase,
the UK writing to 100,000 veterans, Kim vowing more nukes and
expelling the Swiss, and the Macy's Thanksgiving parade moved by
storm — and writes it to `entry.png`.

- Size: 17,158 bytes (limit 1 MiB), 1024×1024 pixels
- Deterministic: two runs produce byte-identical output
  (sha256 `800ff97056346f09a9289b06153c2a3b675de1c2beeaa34f73d38686609b9470`)

## Run it

Python 3.13 (tested on Python 3.12.3), standard library only, no network:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out python3 main.py
```

## License

MIT — see [LICENSE](LICENSE).
