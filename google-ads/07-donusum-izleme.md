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

> **24.10.2026:** Site artık sabit 250/400 ₺ yerine **hizmetin fiyatını** gönderiyor
> (protez 1.500, kalıcı oje 1.150, manikür 650 ₺). Hesapta üç işlemin değer ayarı
> "Her dönüşüm için farklı değerler kullan" yapılmalı → `08-cevrimdisi-donusum.md`.
"Gelişmiş dönüşümler" bilinçli olarak **kapalı** bırakıldı — açmak Google'ın veri işleme
şartlarını kabul etmek demek ve KVKK metninin buna göre güncellenmesi gerekir.

## ✅ Tamamlandı — site tarafı

- 65 HTML dosyasının tamamına `gtag('config', 'AW-10868274290');` eklendi
- `fn-events.js` içine `conv()` fonksiyonu ve 4 çağrı eklendi
  (whatsapp_click → 250 ₺, phone_click → 250 ₺, booking_complete ×2 → 400 ₺)
- Sözdizimi `node --check` ile doğrulandı

## ✅ TAMAMLANDI — Consent Mode izinleri

**Durum: kapandı (14.10.2026 denetiminde doğrulandı).**

`cookie-consent.js:47-51` ve `:65-69` dört izni birden yönetiyor
(`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`).
Ölçüm: **70 canlı sayfada** `ad_storage: 'granted'` satırı var.

> Bu bölüm daha önce "bu adım olmadan hiçbiri veri toplamaz, kampanyayı
> başlatma" diyordu. Artık geçerli değil; güncellenmeseydi kampanya **yanlış
> sebeple** bekletilecekti.

### ⛔ KALAN GERÇEK ENGELLER (kampanyayı başlatmadan önce)

**1. 6 Rusça alt sayfası eski blokta kalmış — düzeltildi (14.10.2026)**
`ru/{dizayn-nogtey,gel-lak,manikyur-pedikyur,narashchivanie-nogtey,svadebnyy-manikyur,tseny}-izmir/`
sayfalarında rıza verildiğinde yalnızca `analytics_storage` açılıyordu;
`ad_storage` denied kalıyordu → o oturumda Ads dönüşümü ölçülmüyordu.

**2. Eski GA4 dönüşümleri hâlâ Birincil → çift sayım (HESAPTA yapılmalı)**
`fn-events.js:210` her WhatsApp tıklamasında GA4'e `generate_lead` gönderiyor
**ve aynı tıklamada** `:211` AW etiketini yakıyor. Hesapta GA4'ten içe aktarılmış
"Kişi" / "Kişi (1)" / "Kişi (2)" / "Randevu rezervasyonları" dönüşümleri
**Birincil** kaldığı sürece aynı tıklama iki kez sayılır.
→ Dördünü de **İkincil**'e çevir.

**3. 400 ₺'lik "Randevu Formu Tamamlandı" reklam trafiğinden tetiklenemiyor**
8 reklam açılış sayfasının hiçbirinde `<form>`, takvim veya `#randevu-al` yok;
bu sayfalar `script.js` yüklemiyor. `fnTrackBookingRequest` yalnızca
`script.js`'ten çağrılıyor ve onu yükleyen tek sayfa `index.html`.
→ Bu dönüşümü **İkincil**'e al. Açılış sayfalarına randevu bloğu eklenirse
tekrar Birincil yapılabilir.

**4. WhatsApp + Telefon ikisi de Birincil → çift sayım riski**
Aynı oturumda ikisine de basan kullanıcı 250 + 250 = **500 ₺** üretir.
"Bir" sayma kuralı yalnız **aynı** dönüşüm işlemi içinde tekrarı engeller,
iki farklı işlem arasında dedupe yapmaz.
→ Ya ikisini tek "İletişim" işleminde birleştir, ya telefonu İkincil'e al.
Kanal kırılımını GA4'teki `whatsapp_click` / `phone_click` olaylarından raporla.

### Consent Mode v2 + Türkiye — modellenmiş dönüşüm ÇALIŞMAYACAK

İki bağımsız sebeple:
1. **Coğrafya** — Türkiye AEA/İngiltere/İsviçre dışında. Dönüşüm modellemesi
   AEA trafiği için sunuluyor; TR'de `ad_storage: denied` ile gelen dönüşüm
   modelleme ile geri gelmez.
2. **Hacim** — modelleme eşiği ülke+alan adı başına 7 günde ~700 reklam tıklaması.
   45 ₺/gün ≈ haftada 45-50 tıklama.

**Pratik sonuç:** çerez bildirimine dokunmadan WhatsApp'a basan her kullanıcı
kalıcı olarak ölçülmemiş bir dönüşümdür.

**✅ 24.10.2026'da uygulandı → `08-cevrimdisi-donusum.md`.** Aşağıdaki not tarihçe için duruyor.

**Önerilen çözüm (rızayı kaldırmadan): gclid → WhatsApp mesajı → Çevrimdışı
Dönüşüm Yükleme (OCI).** `fn-events.js:86` gclid'i zaten okuyor ama yalnız
kaynağı etiketlemek için kullanıp atıyor; `tagWhatsApp()` mesaj sonuna zaten
`— Google Reklam · /sayfa` ekliyor. gclid'i de oraya ekle, randevu
gerçekleştiğinde gclid + **gerçek ciro** (1.150-1.500 ₺) Ads'e yüklenir.
Üstünlüğü: çerez rızasından bağımsız (URL parametresi, depolama yok),
250 ₺ vekil değer yerine gerçek ciro, iptal edilen randevu yüklenmez.
Dikkat: gclid'i `sessionStorage`'a **yazma** (rıza öncesi depolama olur),
90 gün içinde yükle, KVKK metnine "reklam ölçümleme tanımlayıcısı" satırı ekle.

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
