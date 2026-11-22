# কোন ধরনের ভিডিও বেশি ভিউ পায় — স্ক্রিপ্ট লেখার গাইড (নভেম্বর ২০২৬)

> সতর্কতা: নিচের বেশিরভাগ তথ্য মার্কেটিং ব্লগ আর চ্যানেল পেজ থেকে। YouTube বা Meta নিজে এই র‍্যাংকিং প্রকাশ করে না। তাই এগুলো "শুরুর দিকনির্দেশনা" হিসেবে নিন। আসল উত্তর আসবে আপনার নিজের ভিডিওর Analytics থেকে।

## ১. বাংলাদেশে প্ল্যাটফর্মের অবস্থা
- **Facebook সবচেয়ে বড়:** সোশ্যাল মিডিয়া ব্যবহারের প্রায় ৭৭% Facebook-এ, YouTube-এ প্রায় ১৭% (StatCounter, অক্টোবর ২০২৬)। তাই Reels আর Facebook ভিডিওকে সমান গুরুত্ব দিন।
- **YouTube-এ শীর্ষে:** বিনোদন, নাটক, মিউজিক আর কমেডি। শিক্ষা আর টেক টিউটোরিয়ালে এনগেজমেন্ট বেশি।
- **বাংলা কার্টুন গল্প:** নীতিকথা, রূপকথা আর পশুপাখির গল্পের অনেক চ্যানেল চলছে, অর্থাৎ চাহিদা আছে, প্রতিযোগিতাও আছে। আলাদা হতে হলে নিজস্ব চরিত্র আর ভালো গল্প লাগবে।

## ২. যে ধরনের অ্যানিমেটেড ভিডিও এখন বেশি চলছে
| ধরন | কেন চলে | ইঞ্জিনের কোন টেমপ্লেট |
|---|---|---|
| **কার্টুন গল্প / নীতিকথা** (পরিবার, গ্রাম, মজার ঘটনা) | পুরো পরিবার দেখে, বারবার দেখে | `StoryScene` + `CAST_LIBRARY` চরিত্র |
| **"কী হতো যদি…" (What if)** | কৌতূহল জাগায়, Shorts-এ দারুণ | `EarthZoom`, `Globe`, `SolarSystem`, `StormTrack` |
| **ভূগোল / ম্যাপ তথ্য** ("কোন দেশ আসলে কত বড়?") | চোখে দেখার মতো, শেয়ার হয় | `CountryCompare`, `CountryHighlight`, `MapTour`, `MapSearch` |
| **শিক্ষামূলক ব্যাখ্যা** (বিজ্ঞান, টাকা-পয়সা, টেক) | সার্চে আসে, বিজ্ঞাপনের রেট বেশি | `RoughSketch`, `Flowchart`, `Equation`, `DNAHelix`, `LineChart` |
| **বই/জীবনের শিক্ষা (অ্যানিমেটেড সারাংশ)** | দীর্ঘদিন ভিউ আসে | `KineticText`, `HighlightText`, `Mascot` |
| **ভয়ের/রহস্যের গল্প (Shorts)** | পুরোটা দেখে শেষ করে | `StoryScene` (night), `ScrambleText`, `GlitchText` |
| **খবর / তথ্য-ব্যাখ্যা** (ঘূর্ণিঝড়, বাজেট, পরিসংখ্যান) | সময়োপযোগী, দ্রুত ভিউ | `NewsTicker`, `StormTrack`, `BarChartRace`, `StatCounter` |
| **উৎসব / বিশেষ দিন** (ঈদ, পহেলা বৈশাখ, ২১শে ফেব্রুয়ারি) | Facebook-এ প্রচুর শেয়ার | `EidGreeting`, `Celebration`, `CityNight` |

## ৩. ভাইরাল হওয়ার নিয়ম (সব ধরনের ভিডিওতে)
1. **প্রথম ১–২ সেকেন্ডই সব।** শুরুতে প্রশ্ন, চমক বা ফলাফল দেখান। ধীরে শুরু করবেন না।
   - Shorts-এ ২ সেকেন্ডের মধ্যে, Reels-এ ১ সেকেন্ডের মধ্যে হুক দিন।
   - প্রথম ফ্রেমেই স্ক্রিনে লেখা রাখুন, কারণ অনেকে সাউন্ড বন্ধ রেখে দেখে।
2. **প্রতি ১০–১৫ সেকেন্ডে নতুন কিছু:** নতুন দৃশ্য, ক্যামেরা জুম, প্রশ্ন বা চমক। ইঞ্জিনের ট্রানজিশন আর ক্যামেরা মুভ এই কাজেই।
3. **শেষ পর্যন্ত টেনে রাখুন।** উত্তর বা চমক শেষে রাখুন ("শেষে দেখুন কী হলো…")।
4. **বাংলা সাবটাইটেল সবসময়।** `WordCaptions` বা `StoryScene`-এর karaoke সাবটাইটেল ব্যবহার করুন।
5. **নিয়মিত সিরিজ বানান।** একই চরিত্র নিয়ে পর্বে পর্বে গল্প হলে দর্শক ফিরে আসে।

## ৪. যা করবেন না (মনিটাইজেশন বাঁচাতে)
- **YouTube-এর নিয়ম:** "inauthentic content" নিয়ম জুলাই ২০২৬-এ আরও পরিষ্কার করা হয়েছে। টেমপ্লেট দিয়ে প্রায় একই রকম ভিডিও গণহারে বানালে পুরো চ্যানেলের মনিটাইজেশন বন্ধ হতে পারে।
  - টেমপ্লেট ব্যবহার করা সমস্যা না, কিন্তু প্রতিটা ভিডিওতে নিজের গল্প, নিজের ভয়েস, নিজের তথ্য আর নতুন দৃশ্য থাকতে হবে।
  - শুধু রোবটিক ভয়েস আর স্টক ছবি দিয়ে ভিডিও বানালে ঝুঁকি বেশি।
- **অন্যের ভিডিও, গান বা কার্টুন চরিত্র কপি করবেন না।** ইঞ্জিনের চরিত্রগুলো নিজস্ব, সেগুলোই ব্যবহার করুন।
- **খবর বা তথ্যে ভুল সংখ্যা দেবেন না।** সূত্র উল্লেখ করুন (যেমন ঘূর্ণিঝড়ের জন্য BMD-র তথ্য)।

## ৫. Facebook থেকে আয়ের অবস্থা (নিশ্চিত না)
- সূত্রগুলো একমত না।
  - কয়েকটা বলছে পুরনো "In-stream ads" প্রোগ্রাম ৩১ আগস্ট ২০২৫-এ বন্ধ হয়েছে। এখন "Content Monetization" প্রোগ্রাম চলে, যেটা আমন্ত্রণভিত্তিক।
  - বাংলাদেশ আর বাংলা ভাষা এতে যোগ্য বলে কয়েকটা সূত্র দাবি করে।
- আপনার পেজের Professional Dashboard-এ গিয়ে "Monetization" অংশে নিজে দেখে নিন।

## ৬. স্ক্রিপ্টের কাঠামো (যেকোনো ভিডিওতে বসিয়ে নিন)
**Shorts / Reels (৩০–৬০ সেকেন্ড)**
```
০–২ সে.   হুক: চমকপ্রদ প্রশ্ন বা দৃশ্য           ("বাংলাদেশ কি আসলে ইংল্যান্ডের চেয়ে ছোট?")
২–১০ সে.  সমস্যা / প্রেক্ষাপট
১০–৪০ সে. ৩টা তথ্য বা গল্পের ৩টা ধাপ (প্রতিটায় নতুন দৃশ্য)
৪০–৫০ সে. চমক / উত্তর
শেষ      এক লাইনের CTA ("পরের পর্বে দেখুন…" / ফলো করুন)
```
**কার্টুন গল্প (৩–৮ মিনিট)**
```
দৃশ্য ১  সাধারণ দিন, চরিত্র পরিচয় (৩০ সে.)
দৃশ্য ২  সমস্যা শুরু (হুক — কেন দেখবে)
দৃশ্য ৩–৫ চেষ্টা, ভুল, মজার মুহূর্ত (প্রতি দৃশ্যে লোকেশন বদল)
দৃশ্য ৬  সমাধান + শিক্ষা
শেষ      পরের পর্বের ইঙ্গিত + SubscribeCTA
```

## ৭. প্রথম ১০টা ভিডিওর আইডিয়া
1. "বাংলাদেশ বনাম যুক্তরাজ্য — আসল আকার" → `CountryCompare` (Shorts)
2. "মহাকাশ থেকে আমার গ্রাম পর্যন্ত" → `EarthZoom` (Shorts)
3. "ঢাকা থেকে কক্সবাজার — কত সময় লাগে?" → `MapSearch` (Shorts)
4. "রাফি আর নৌকার গল্প" পর্ব ১ → `StoryScene` (লম্বা ভিডিও + Shorts কাট)
5. "ঘূর্ণিঝড় কীভাবে তৈরি হয়?" → `StormTrack` + `RoughSketch`
6. "সার্কের ৮ দেশ — কে কত বড়?" → `CountryHighlight` + `BarChartRace`
7. "DNA কী? ১ মিনিটে" → `DNAHelix` + `HighlightText`
8. "সৌরজগৎ — বাচ্চাদের জন্য" → `SolarSystem` + `Mascot`
9. ঈদ শুভেচ্ছা (চ্যানেলের নামসহ) → `EidGreeting` (Facebook)
10. "আমাদের চরিত্রদের সাথে পরিচয়" → `CharacterGallery` (চ্যানেল ট্রেলার)

## সূত্র
- [Fliki — faceless niches 2026](https://fliki.ai/blog/best-faceless-youtube-niches) · [OpusClip — niches 2026](https://www.opus.pro/blog/faceless-youtube-niches-2026) · [virvid.ai — channel ideas](https://virvid.ai/blog/faceless-youtube-channel-ideas-20-profitable-niches-2026) · [flowshorts — channel ideas](https://flowshorts.app/blog/faceless-youtube-channel-ideas) · [pixo — channel ideas](https://pixo.video/blog/faceless-youtube-channel-ideas) · [trending faceless channels](https://bestproductivityresources.com/guides/10-new-trending-faceless-youtube-channels-and-how-to-create-such-videos-with-ai-tools)
- [StatCounter — Bangladesh social media](https://gs.statcounter.com/social-media-stats/all/bangladesh) · [Semrush — Bangladesh top sites](https://www.semrush.com/trending-websites/bd/all) · [NoxInfluencer — top BD channels](https://www.noxinfluencer.com/youtube-channel-rank/top-100-bd-all-youtuber-sorted-by-subs-weekly) · [Agent Wise X — video marketing BD](https://agentwisex.com/video-marketing-bangladesh-2025/)
- [Bangla Animation Golpo](https://www.youtube.com/c/BanglaAnimationGolpo) · [Golpo Sholpo Animation](https://www.youtube.com/@golposholpoanimation2031)
- [Hook timing (yiha.ai)](https://yiha.ai/blogs/hook-timing-in-short-form-video-first-3-seconds-retention-rules) · [Retention hooks 2026 (Terra Market Group)](https://terramarketgroup.com/blog/short-form-video-retention-hooks-2026-25-openings-that-keep-viewers-watching) · [Hooks & pattern interrupts (virvid.ai)](https://virvid.ai/blog/hooks-pattern-interrupts-viral-openers-in-2026)
- [TechCrunch — YouTube AI slop policy (Jul 2026)](https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/) · [Tubefilter — inauthentic content update](https://www.tubefilter.com/2026/07/13/youtube-inauthentic-content-monetization-policy-update/) · [YouTube monetization policies](https://support.google.com/youtube/answer/1311392)
- [Prothom Alo — Facebook content monetisation](https://en.prothomalo.com/science-technology/social-media/3ucvlrm8v4) · [Insighthive — eligible countries](https://insighthive.app/resources/facebook-content-monetization-eligible-countries) · [smmsun — Facebook monetization BD](https://smmsun.com/blog/facebook-monetization-guide-bangladesh)
