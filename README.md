# Donat Alert Tizimi (Demo)

Bu — streamer uchun oddiy "donat + ekranga chiqarish" tizimining ishlaydigan namunasi.

## Tarkibi
- `server.js` — Node.js/Express server, WebSocket (Socket.io) orqali real-vaqt xabar yuboradi.
- `public/donate.html` — tomoshabin donat yuboradigan forma.
- `public/overlay.html` — OBS/Streamlabs'da "Browser Source" sifatida qo'shiladigan overlay sahifa.

## Ishga tushirish
```bash
npm install
node server.js
```

Keyin brauzerda:
- Donat forma: `http://localhost:3000/donate.html`
- OBS overlay:  `http://localhost:3000/overlay.html`

OBS'da: **Sources → Add → Browser Source** → URL qismiga overlay havolasini qo'ying,
o'lchamni masalan 800x300 qilib qo'ying, fon shaffof chiqadi.

## Haqiqiy pul bilan ishlashi uchun keyingi qadamlar

Hozircha `/api/donate` — bu **simulyatsiya**: forma to'g'ridan-to'g'ri "donat keldi" deb
serverga xabar beradi, pul aslida o'tmaydi. Haqiqiy loyiha uchun:

1. **Click yoki Payme'da merchant (savdo nuqtasi) sifatida ro'yxatdan o'ting**
   (buning uchun odatda YaTT yoki yuridik shaxs kerak bo'ladi).
2. Ular sizga **API kalitlari** va **to'lov formasi/SDK** beradi.
3. `donate.html`'dagi forma o'rniga ularning rasmiy to'lov widgetini joylashtirasiz.
4. To'lov muvaffaqiyatli bo'lganda, Click/Payme sizning serveringizga
   **webhook** (bildirishnoma) yuboradi — shu yerda pul haqiqatan tushganini
   tekshirib, keyin `io.emit("new-donation", ...)` chaqirilishi kerak
   (hozir bu qism `/api/donate` ichida, simulyatsiya sifatida bor).
5. Pul avtomatik ravishda sizning Uzcard/Humo hisobingizga bank shartnomangizga
   ko'ra tushadi (odatda 1–3 ish kunida).

## Eslatma
Bu fayllar faqat boshlang'ich namunadir — production'da foydalanishdan oldin:
xavfsizlik (HTTPS, so'rovlarni tekshirish), ma'lumotlar bazasi (hozircha xotirada
saqlanadi, server qayta ishga tushsa o'chib ketadi), va real to'lov integratsiyasi
qo'shilishi kerak.
