# Apple App Store Storefront Reference

Source: Apple App Store Connect — country default and additional supported languages.
Use this to advise users which metadata locales matter most for their target markets.

**Key insight:** The "Default language" is what Apple shows users in that country
by default. "Additional supported" means Apple can show that language if the user's
device is set to it. You need metadata for BOTH to reach all users in a market.

## Strategic tier groupings

### Tier 1 — English-primary markets (en-US or en-GB)
USA, GBR, CAN (with fr-CA), AUS, NZL, IRL, SGP, IND, PHL, ZAF, NGA, GHA, KEN

### Tier 2 — Non-English primary markets (need native language)
JPN (ja), KOR (ko), DEU + AUT + CHE (de), FRA (fr), BRA (pt-BR), RUS (ru),
ITA (it), POL (pl), NLD (nl), SWE (sv), NOR (nb), FIN (fi), DNK (da), TUR (tr),
ARG + MEX + COL + ESP (es), CHN (zh-Hans), TWN + HKG (zh-Hant)

### Tier 3 — Arabic markets (ar) ⚠️ RTL
SAU, ARE, EGY, KWT, QAT, OMN, JOR, IRQ, LBN, BHR, MAR, DZA, TUN, YEM, LBY

### Turkish market (TUR)
- Default language: English (U.K.)
- Additional: Turkish
- Implication: ALWAYS provide both `en-US` and `tr-TR` metadata for Turkey

## Full storefront table (175 countries)

| ISO3 | Country | Default Language | Additional Languages |
|---|---|---|---|
| AFG | Afghanistan | English (U.K.) | |
| ALB | Albania | English (U.K.) | |
| DZA | Algeria | English (U.K.) | Arabic, French |
| AGO | Angola | English (U.K.) | |
| AIA | Anguilla | English (U.K.) | |
| ATG | Antigua and Barbuda | English (U.K.) | |
| ARG | Argentina | Spanish (Mexico) | English (U.K.) |
| ARM | Armenia | English (U.K.) | |
| AUS | Australia | English (Australia) | English (U.K.) |
| AUT | Austria | German | English (U.K.) |
| AZE | Azerbaijan | English (U.K.) | |
| BHS | Bahamas | English (U.K.) | |
| BHR | Bahrain | English (U.K.) | Arabic |
| BRB | Barbados | English (U.K.) | |
| BLR | Belarus | English (U.K.) | |
| BEL | Belgium | English (U.K.) | Dutch, French |
| BLZ | Belize | English (U.K.) | Spanish (Mexico) |
| BEN | Benin | English (U.K.) | French |
| BMU | Bermuda | English (U.K.) | |
| BTN | Bhutan | English (U.K.) | |
| BOL | Bolivia | Spanish (Mexico) | English (U.K.) |
| BIH | Bosnia and Herzegovina | English (U.K.) | Croatian |
| BWA | Botswana | English (U.K.) | |
| BRA | Brazil | Portuguese (Brazil) | English (U.K.) |
| VGB | British Virgin Islands | English (U.K.) | |
| BRN | Brunei | English (U.K.) | |
| BGR | Bulgaria | English (U.K.) | |
| BFA | Burkina Faso | English (U.K.) | French |
| KHM | Cambodia | English (U.K.) | French |
| CMR | Cameroon | French | English (U.K.) |
| CAN | Canada | English (Canada) | French (Canada) |
| CPV | Cape Verde | English (U.K.) | |
| CYM | Cayman Islands | English (U.K.) | |
| TCD | Chad | English (U.K.) | French |
| CHL | Chile | Spanish (Mexico) | English (U.K.) |
| CHN | China mainland | Simplified Chinese | English (U.K.) |
| COL | Colombia | Spanish (Mexico) | English (U.K.) |
| COD | Congo (DRC) | English (U.K.) | French |
| COG | Congo (Republic) | English (U.K.) | French |
| CRI | Costa Rica | Spanish (Mexico) | English (U.K.) |
| CIV | Cote d'Ivoire | French | English (U.K.) |
| HRV | Croatia | English (U.K.) | Croatian |
| CYP | Cyprus | English (U.K.) | Greek, Turkish |
| CZE | Czech Republic | English (U.K.) | Czech |
| DNK | Denmark | English (U.K.) | Danish |
| DMA | Dominica | English (U.K.) | |
| DOM | Dominican Republic | Spanish (Mexico) | English (U.K.) |
| ECU | Ecuador | Spanish (Mexico) | English (U.K.) |
| EGY | Egypt | English (U.K.) | Arabic, French |
| SLV | El Salvador | Spanish (Mexico) | English (U.K.) |
| EST | Estonia | English (U.K.) | |
| SWZ | Eswatini | English (U.K.) | |
| FJI | Fiji | English (U.K.) | |
| FIN | Finland | English (U.K.) | Finnish |
| FRA | France | French | English (U.K.) |
| GAB | Gabon | French | English (U.K.) |
| GMB | Gambia | English (U.K.) | |
| GEO | Georgia | English (U.K.) | |
| DEU | Germany | German | English (U.K.) |
| GHA | Ghana | English (U.K.) | |
| GRC | Greece | English (U.K.) | Greek |
| GRD | Grenada | English (U.K.) | |
| GTM | Guatemala | Spanish (Mexico) | English (U.K.) |
| GNB | Guinea-Bissau | English (U.K.) | French |
| GUY | Guyana | English (U.K.) | French |
| HND | Honduras | Spanish (Mexico) | English (U.K.) |
| HKG | Hong Kong | Chinese (Traditional) | English (U.K.) |
| HUN | Hungary | English (U.K.) | Hungarian |
| ISL | Iceland | English (U.K.) | |
| IND | India | English (U.K.) | Bangla, Gujarati, Hindi, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Urdu |
| IDN | Indonesia | English (U.K.) | Indonesian |
| IRQ | Iraq | English (U.K.) | Arabic |
| IRL | Ireland | English (U.K.) | |
| ISR | Israel | English (U.K.) | Hebrew |
| ITA | Italy | Italian | English (U.K.) |
| JAM | Jamaica | English (U.K.) | |
| JPN | Japan | Japanese | English (US) |
| JOR | Jordan | English (U.K.) | Arabic |
| KAZ | Kazakhstan | English (U.K.) | |
| KEN | Kenya | English (U.K.) | |
| XKS | Kosovo | English (U.K.) | |
| KWT | Kuwait | English (U.K.) | Arabic |
| KGZ | Kyrgyzstan | English (U.K.) | |
| LAO | Laos | English (U.K.) | French |
| LVA | Latvia | English (U.K.) | |
| LBN | Lebanon | English (U.K.) | Arabic, French |
| LBR | Liberia | English (U.K.) | |
| LBY | Libya | English (U.K.) | Arabic |
| LTU | Lithuania | English (U.K.) | |
| LUX | Luxembourg | English (U.K.) | French, German |
| MAC | Macau | Chinese (Traditional) | English (U.K.) |
| MDG | Madagascar | English (U.K.) | French |
| MWI | Malawi | English (U.K.) | |
| MYS | Malaysia | English (U.K.) | Malay |
| MDV | Maldives | English (U.K.) | |
| MLI | Mali | English (U.K.) | French |
| MLT | Malta | English (U.K.) | |
| MRT | Mauritania | English (U.K.) | Arabic, French |
| MUS | Mauritius | English (U.K.) | French |
| MEX | Mexico | Spanish (Mexico) | English (U.K.) |
| FSM | Micronesia | English (U.K.) | |
| MDA | Moldova | English (U.K.) | |
| MNG | Mongolia | English (U.K.) | |
| MNE | Montenegro | English (U.K.) | Croatian |
| MSR | Montserrat | English (U.K.) | |
| MAR | Morocco | English (U.K.) | Arabic, French |
| MOZ | Mozambique | English (U.K.) | |
| MMR | Myanmar | English (U.K.) | |
| NAM | Namibia | English (U.K.) | |
| NRU | Nauru | English (U.K.) | |
| NPL | Nepal | English (U.K.) | |
| NLD | Netherlands | Dutch | English (U.K.) |
| NZL | New Zealand | English (Australia) | English (U.K.) |
| NIC | Nicaragua | Spanish (Mexico) | English (U.K.) |
| NER | Niger | English (U.K.) | French |
| NGA | Nigeria | English (U.K.) | |
| MKD | North Macedonia | English (U.K.) | |
| NOR | Norway | English (U.K.) | Norwegian |
| OMN | Oman | English (U.K.) | Arabic |
| PAK | Pakistan | English (U.K.) | Urdu |
| PLW | Palau | English (U.K.) | |
| PAN | Panama | Spanish (Mexico) | English (U.K.) |
| PNG | Papua New Guinea | English (U.K.) | |
| PRY | Paraguay | Spanish (Mexico) | English (U.K.) |
| PER | Peru | Spanish (Mexico) | English (U.K.) |
| PHL | Philippines | English (U.K.) | |
| POL | Poland | English (U.K.) | Polish |
| PRT | Portugal | Portuguese (Portugal) | English (U.K.) |
| QAT | Qatar | English (U.K.) | Arabic |
| KOR | Republic of Korea | Korean | English (U.K.) |
| ROU | Romania | English (U.K.) | Romanian |
| RUS | Russia | Russian | English (U.K.), Ukrainian |
| RWA | Rwanda | English (U.K.) | French |
| STP | Sao Tome and Principe | English (U.K.) | |
| SAU | Saudi Arabia | English (U.K.) | Arabic |
| SEN | Senegal | English (U.K.) | French |
| SRB | Serbia | English (U.K.) | Croatian |
| SYC | Seychelles | English (U.K.) | French |
| SLE | Sierra Leone | English (U.K.) | |
| SGP | Singapore | English (U.K.) | Chinese (Simplified) |
| SVK | Slovakia | English (U.K.) | Slovak |
| SVN | Slovenia | English (U.K.) | Slovenian |
| SLB | Solomon Islands | English (U.K.) | |
| ZAF | South Africa | English (U.K.) | |
| ESP | Spain | Spanish (Spain) | Catalan, English (U.K.) |
| LKA | Sri Lanka | English (U.K.) | |
| KNA | St. Kitts and Nevis | English (U.K.) | |
| LCA | St. Lucia | English (U.K.) | |
| VCT | St. Vincent and the Grenadines | English (U.K.) | |
| SUR | Suriname | English (U.K.) | Dutch |
| SWE | Sweden | Swedish | English (U.K.) |
| CHE | Switzerland | German | English (U.K.), French, Italian |
| TWN | Taiwan | Chinese (Traditional) | English (U.K.) |
| TJK | Tajikistan | English (U.K.) | |
| TZA | Tanzania | English (U.K.) | |
| THA | Thailand | English (U.K.) | Thai |
| TON | Tonga | English (U.K.) | |
| TTO | Trinidad and Tobago | English (U.K.) | French |
| TUN | Tunisia | English (U.K.) | Arabic, French |
| TUR | Türkiye | English (U.K.) | Turkish |
| TKM | Turkmenistan | English (U.K.) | |
| TCA | Turks and Caicos Islands | English (U.K.) | |
| UGA | Uganda | English (U.K.) | |
| UKR | Ukraine | English (U.K.) | Russian, Ukrainian |
| ARE | United Arab Emirates | English (U.K.) | Arabic |
| GBR | United Kingdom | English (U.K.) | |
| USA | United States | English (US) | Arabic, Chinese (Simplified), Chinese (Traditional), French, Korean, Portuguese (Brazil), Russian, Spanish (Mexico), Vietnamese |
| URY | Uruguay | English (U.K.) | Spanish (Mexico) |
| UZB | Uzbekistan | English (U.K.) | |
| VUT | Vanuatu | English (U.K.) | French |
| VEN | Venezuela | Spanish (Mexico) | English (U.K.) |
| VNM | Vietnam | English (U.K.) | Vietnamese |
| YEM | Yemen | English (U.K.) | Arabic |
| ZMB | Zambia | English (U.K.) | |
| ZWE | Zimbabwe | English (U.K.) | |

## App Store Connect locale codes (for metadata folder names)

| Apple Store language | ASC folder code |
|---|---|
| English (US) | `en-US` |
| English (UK) | `en-GB` |
| English (Australia) | `en-AU` |
| English (Canada) | `en-CA` |
| Turkish | `tr-TR` |
| German | `de-DE` |
| French (France) | `fr-FR` |
| French (Canada) | `fr-CA` |
| Spanish (Spain) | `es-ES` |
| Spanish (Mexico) | `es-MX` |
| Portuguese (Brazil) | `pt-BR` |
| Portuguese (Portugal) | `pt-PT` |
| Japanese | `ja` |
| Korean | `ko` |
| Chinese (Simplified) | `zh-Hans` |
| Chinese (Traditional) | `zh-Hant` |
| Arabic | `ar-SA` |
| Hebrew | `he` |
| Russian | `ru` |
| Italian | `it` |
| Dutch | `nl-NL` |
| Polish | `pl` |
| Swedish | `sv` |
| Danish | `da` |
| Norwegian | `nb` |
| Finnish | `fi` |
| Hungarian | `hu` |
| Czech | `cs` |
| Romanian | `ro` |
| Croatian | `hr` |
| Slovak | `sk` |
| Ukrainian | `uk` |
| Greek | `el` |
| Indonesian | `id` |
| Malay | `ms` |
| Thai | `th` |
| Vietnamese | `vi` |
| Hindi | `hi` |

## Recommended locale sets by launch strategy

| Strategy | Locales | Why |
|---|---|---|
| MVP launch | `en-US` | Minimum viable — English-primary markets only |
| Omer's apps (Turkish creator) | `en-US`, `tr-TR` | Turkish users + global English reach |
| European expansion | `en-US`, `tr-TR`, `de-DE`, `fr-FR`, `it`, `es-ES` | EU major markets |
| Asia expansion | `en-US`, `ja`, `ko`, `zh-Hans`, `zh-Hant` | Japan/Korea/China/Taiwan |
| Global tier 1 | `en-US`, `tr-TR`, `de-DE`, `fr-FR`, `es-MX`, `pt-BR`, `ja`, `ko`, `ru` | Top 9 revenue markets |
