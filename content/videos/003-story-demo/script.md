# নিজের ভয়েস দিয়ে কার্টুন গল্প বানানোর নিয়ম

## ১. ভয়েস রেকর্ড করুন
- পুরো গল্প এক ফাইলে রেকর্ড করুন (mp3 বা wav), যেমন `amar-golpo.mp3`।
- ফাইলটা প্রজেক্টের `public` ফোল্ডারে রাখুন।

## ২. সাবটাইটেল ফাইল (SRT) বানান
- প্রতিটা লাইনের শুরু আর শেষের সময় লিখুন। এই ফোল্ডারের `example-voice.srt` দেখুন।
- লাইনের শুরুতে চরিত্রের নাম লিখলে (`রাফি: ...`) সেই চরিত্রের ঠোঁট নড়বে।
- নাম না থাকলে লাইনটা বর্ণনাকারীর (narrator) হিসেবে শুধু সাবটাইটেলে দেখাবে।
- সহজ উপায়: CapCut বা YouTube Studio-র অটো-ক্যাপশন থেকে SRT ডাউনলোড করে নাম বসিয়ে দিন।
- SRT ফাইলটাও `public` ফোল্ডারে রাখুন।

## ৩. video.json-এ বসান
```json
"props": {
  "voiceSrc": "amar-golpo.mp3",
  "srtSrc": "amar-golpo.srt",
  "musicSrc": "",
  "subtitles": "karaoke"
}
```
- `voiceSrc` দিলে চরিত্রের মুখ আপনার আসল ভয়েসের জোর অনুযায়ী নড়বে।
- `musicSrc`-এ মিউজিক দিলে কথা বলার সময় মিউজিক নিজে থেকে আস্তে হয়ে যাবে।

## ৪. দৃশ্য (scenes) সাজান
প্রতিটা দৃশ্যে এগুলো ঠিক করা যায়:
- `background`: village / river / road / field / night
- `time`: day / sunset / night
- `camera`: wide / speaker (যে কথা বলছে তার দিকে) / pushIn / pullOut / panRight / panLeft
- `transition`: cut / fade / iris / wipe / zoom
- `extras`: birds, butterflies, smoke, boat, car, fireflies, rain
- `cast`: কোন চরিত্র কোথায় দাঁড়াবে (`x` 0 থেকে 1), কখন হাঁটবে (`walk`), হাত নাড়বে (`gestures`: wave / point / explain / cheer), কী অনুভূতি দেখাবে (`emotions`: happy / sad / surprised / angry)

## ৫. রেন্ডার
```
npm run render -- 003-story-demo
```
