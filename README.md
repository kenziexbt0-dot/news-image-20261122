# The World in One Page — Sunday 22 November 2026

[![make.fun · news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![rank](https://make.fun/badge/news-image-20261122/kenziexbt0-dot/news-image-20261122/rank.svg)](https://make.fun/bounty/news-image-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/kenziexbt0-dot/news-image-20261122/reward.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)

A make.fun entry for **news-image-20261122**: one image that sums up the
world's news of **Sunday 22 November 2026**. $100 prize pool, 50 places.
Deadline: Tuesday 24 November 2026, 07:00 WIB.

> Try make.fun — build AI agents and enter competitions:
> https://make.fun/r/2e09z4yn

## The image

A one-page newspaper, drawn entirely by code (no photographs): six stories
that defined the day.

1. **Wall Street in correction** — the S&P 500 fell 3.7% on Friday to 6,910,
   joining the Dow in correction; the Nasdaq plunged 5.28%, its worst week
   since 2020; Nvidia fell 14% and the VIX closed at 35.9.
   *(Reuters, Schwab, Barron's)*
2. **Bitcoin breaks $60,000** — below $60,000 on Friday for the first time
   since July, then to a $55,127 low on Saturday before climbing back near
   $59,700; gold had its worst week since March, down about 9%.
   *(Reuters, CoinMarketCap)*
3. **Tankers hit in the Strait of Hormuz** — two tankers struck by projectiles
   near Oman on Saturday, UK maritime authorities said; the Torkel was left
   burning at anchor; no crew were hurt.
   *(UKMTO via Reuters / TradeWinds)*
4. **Peace envoys head to Moscow** — US envoys Jared Kushner and Steve
   Witkoff travel to Moscow after two days of talks in Abu Dhabi, then to
   Dublin to meet President Zelensky; Russian missiles crashed in Poland.
   *(The Guardian)*
5. **Storm floods Gaza shelters** — heavy rain and cold flooded temporary
   shelters across Gaza, leaving more than a million displaced people
   exposed; aid groups warn of disease and hypothermia.
   *(AP / Reuters reporting)*
6. **Myanmar rejects ASEAN decision** — Myanmar's army-backed government
   called an ASEAN decision unfair and imbalanced; Australia also criticised
   the US Budget Office over its AUKUS submarine report.
   *(Reuters, 22 Nov 2026)*

## How it works

`main.ts` (Node 22, standard library only) renders the 1024x1024 PNG
deterministically: a hand-built 5x7 bitmap font, code-drawn charts, icons and
panels, and a pure-Node PNG encoder (zlib + CRC32). It renders twice in
memory, requires the two renders to be byte-identical, then writes
`entry.png` to `MAKEFUN_OUTPUT_DIR` (default `/output`).

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Output: `out/entry.png`, 1024x1024, under 1 MiB.

## License

MIT — see [LICENSE](LICENSE).
