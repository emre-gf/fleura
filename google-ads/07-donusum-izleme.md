# 07 — Dönüşüm izleme (durum: 2/3 tamamlandı)

## ✅ Tamamlandı — Google Ads tarafı

Hesap: **emrebaris** · Google Ads etiketi: **AW-10868274290**
Site etiketi (`fleura`, G-5MWKVSGTQV / GT-M39Z8P9Q) Ads hesabına bağlandı.

| Dönüşüm adı | Kategori | Değer | Sayma | Etiket |
|---|---|---|---|---|
| WhatsApp Randevu | Potansiyel müşteri formu gönderimi | 250 ₺ | Bir | `AW-10868274290/FzsFCMvl8PccEPLosr4o` |
| Telefon Tiklamasi | Kişi | 250 ₺ | Bir | `AW-10868274290/_VwpCNHl8PccEPLosr4o` |
| Randevu Formu Tamamlandi | Randevu rezervasyonu | 400 ₺ | Bir | `AW-10868274290/XHvaCM7l8PccEPLosr4o` |

Üçü de **Birincil** (teklif optimizasyonunda kullanılır).
"Gelişmiş dönüşümler" bilinçli olarak **kapalı** bırakıldı — açmak Google'ın veri işleme
şartlarını kabul etmek demek ve KVKK metninin buna göre güncellenmesi gerekir.

## ✅ Tamamlandı — site tarafı

- 65 HTML dosyasının tamamına `gtag('config', 'AW-10868274290');` eklendi
- `fn-events.js` içine `conv()` fonksiyonu ve 4 çağrı eklendi
  (whatsapp_click → 250 ₺, phone_click → 250 ₺, booking_complete ×2 → 400 ₺)
- Sözdizimi `node --check` ile doğrulandı

## ⛔ YAPILMASI GEREKEN — Consent Mode izinleri

**Bu adım olmadan yukarıdakilerin hiçbiri veri toplamaz.**

Şu an Consent Mode v2 bloğu `ad_storage`, `ad_user_data` ve `ad_personalization`
izinlerini `denied` ile başlatıyor ve çerez onayı verildiğinde **yalnızca**
`analytics_storage`'ı `granted` yapıyor. Reklam izinleri hiçbir zaman açılmıyor,
dolayısıyla Ads dönüşümleri ölçülemez.

### Değişiklik 1 — `cookie-consent.js` (satır ~46 ve ~56)

```js
// grantAnalytics() — MEVCUT:
window.gtag('consent', 'update', { analytics_storage: 'granted' });
// OLMASI GEREKEN:
window.gtag('consent', 'update', {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted'
});

// denyAnalytics() — MEVCUT:
window.gtag('consent', 'update', { analytics_storage: 'denied' });
// OLMASI GEREKEN:
window.gtag('consent', 'update', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
```

### Değişiklik 2 — 65 HTML dosyasının head bloğu (satır ~29)

```js
// MEVCUT:
gtag('consent', 'update', { analytics_storage: 'granted' });
// OLMASI GEREKEN: (aynı dört anahtar, hepsi 'granted')
```

Tek komutla (repo kökünde):

```bash
grep -rl "gtag('consent', 'update', { analytics_storage: 'granted' });" --include=*.html . \
  | xargs sed -i '' "s/gtag('consent', 'update', { analytics_storage: 'granted' });/gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });/"
```

### Değişiklik 3 — KVKK / çerez metni

Reklam çerezleri devreye girdiği için `kvkk-aydinlatma-metni.html` ve çerez banner
metnine "reklam ve ölçümleme çerezleri" ifadesi eklenmeli. Şu an yalnızca analitikten
söz ediliyor; bu haliyle rıza metni kapsamı eksik kalır.

## Doğrulama

1. Chrome'a **Google Tag Assistant** kur, fleura.com.tr'yi aç, çerez banner'ında "Kabul et".
2. WhatsApp butonuna tıkla → Tag Assistant'ta `conversion` olayı ve
   `AW-10868274290/FzsFCMvl8PccEPLosr4o` görünmeli.
3. Ads → Dönüşümler: durum 24-48 saat içinde "Etkin" olmalı.
4. Ancak bundan sonra kampanyayı başlat.

## Hesapta temizlenmesi gereken eski dönüşümler

Akıllı kampanya ve GA4 içe aktarmalarından kalma, **hesap hedeflerine dahil** işlemler var:

- `Kişi` (GA4) — durumu **"Hatalı yapılandırılmış"**
- `Kişi (1)`, `Kişi (2)` (GA4) — aynı şeyin kopyaları
- `Randevu rezervasyonları` (GA4)

Bunlar Birincil olarak kaldığı sürece teklif algoritması bozuk/çift sayılan veriyle
optimize eder. Yeni kampanya açılmadan önce hepsini **İkincil**'e çevir.

## Teklif stratejisi

- İlk 2-4 hafta: Tıklama sayısını en üst düzeye çıkar, maks. TBM dosya 01'deki gibi.
- Ayda ~30 dönüşüm biriktiğinde: Dönüşümleri en üst düzeye çıkar.
- Hedef EBM için en az 30 dönüşüm/ay şart; öncesinde koyma.
