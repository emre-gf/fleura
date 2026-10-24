# Fleura Nails — Google Ads toplu kurulum dosyaları

Kampanyayı elle kurmak yerine bu dosyaları **Google Ads Editor**'e içe aktar.
Editor ücretsiz masaüstü uygulaması: https://ads.google.com/home/tools/ads-editor/

> **ÖNCE DOSYA 07.** Sitede Google Ads dönüşüm etiketi yok ve Consent Mode reklam
> izinlerini hiç açmıyor. `07-donusum-izleme.md` tamamlanmadan kampanyayı başlatma.

## Sıra (bu sırayla yükle — bağımlılık var)

| # | Dosya | İçerik |
|---|---|---|
| 1 | `01-kampanya-ve-reklam-gruplari.csv` | 1 kampanya + 8 reklam grubu (**45 ₺/gün**; 3 aktif, 5 duraklatılmış) |
| 2 | `05-konum-hedefleme.csv` | İzmir + 13 ilçe/bölge (Urla ve Çeşme dahil) |
| 3 | `02-anahtar-kelimeler.csv` | 68 anahtar kelime (37'si aktif) — baş terimlerde tam + ifade eşlemesi |
| 4 | `03-negatif-anahtar-kelimeler.csv` | 115 negatif ifade (kampanya seviyesi) |
| 5 | `04-reklamlar-rsa.csv` | 8 duyarlı arama reklamı (3'ü aktif), her biri 15 başlık + 4 açıklama |
| 6 | `06-oge-uzantilar.csv` | Öğe/uzantı metinleri — **elle** girilecek referans listesi |
| 7 | `07-donusum-izleme.md` | Dönüşüm izleme kurulumu (kod değişiklikleri dahil) |
| 8 | `08-cevrimdisi-donusum.md` | Hizmete göre dönüşüm değeri + haftalık randevu yükleme (OCI) |

> Bu klasör siteye **yüklenmez** (`.vercelignore`). 24.10.2026'ya kadar canlıda
> herkese açıktı: anahtar kelime, negatif ve reklam metinleri okunabiliyordu.

`06` dosyası Ads Editor içe aktarma formatı **değildir**; öğe formatları Editor sürümüne
göre değişiyor, o yüzden metinleri hazır liste olarak veriyor — Ads arayüzünden yapıştır.

## Adımlar

1. Ads Editor'ü aç → hesabını indir (**Get recent changes**).
2. **Account > Import > From file...** → dosyayı seç.
3. Önizlemede **"Errors"** sekmesine bak. Hata varsa o satırı düzelt.
4. 1-5 arası dosyalar için 2-3'ü tekrarla.
5. Sol üstten **Post changes** → kampanya hesaba çıkar.
6. `06` dosyasındaki öğeleri Ads arayüzünden gir.

## Yükledikten sonra ELLE yapılacaklar

- **Konum seçeneği** → "Bulunduğu yer" *(varsayılan "ilgi duyduğu yer" — mutlaka değiştir;
  yoksa İstanbul'dan İzmir arayanlara reklam çıkar)*
- **Görüntülü Reklam Ağı** → kapalı olduğunu doğrula
- **Arama ortakları** → dosya 01'de kapalı geliyor; ilk ay kapalı kalsın
- **Reklam zamanlaması** → **Pzt-Paz 09:30-23:00** (hafta sonu dahil)
  *(site çalışma saati her gün 10:00-23:00, Pazar dahil — şemada 75× `opens 10:00` /
  `closes 23:00`, 7 gün. Yarım saat önce başlatmak WhatsApp mesajını yakalar.)*
  ⚠️ Eski ayar Pzt-Cmt 09:00-20:30 idi: **haftada 1 gün + her gün 2,5 saat** kapalıydı.
- **Başlık sabitleme (pin)** → her reklamda Başlık 1'i **1. pozisyona** sabitle,
  `{KeyWord:…}` başlığını sabitleme
- **Otomatik oluşturulan öğeler** → KAPAT *(uydurma başlık üretiyor, fiyat iddialarını bozar)*
- **Dil** → Türkçe + İngilizce + Rusça *(sitede /en ve /ru sayfaları var)*
- **Cihaz** → başlangıçta ayarlama; 2 hafta sonra masaüstü zayıfsa -%30 ayarla

## 45 ₺/gün bütçe için yapı kararı

45 ₺/gün ≈ **günde 6-7 tıklama**. Bunu 8 reklam gruba bölersen hiçbiri istatistiksel
olarak anlamlı veri toplayamaz ve 3 ay sonra da neyin çalıştığını bilemezsin.
Bu yüzden sadece **3 grup aktif** geliyor:

| Reklam grubu | Neden aktif |
|---|---|
| **Protez Tirnak** | En yüksek sepet (1.500 ₺), en net satın alma niyeti |
| **Kalici Oje** | En yüksek arama hacmi, 1.150 ₺ sepet, tekrar eden müşteri |
| **Eve Gelen Nail Artist** | Markanın tek gerçek farkı; rakiplerin girmediği alan |

Kalan 5 grup (Manikür/Pedikür, Rus Manikürü, Fiyatlar, Gelin Tırnağı, Nail Art)
dosyalarda **hazır ama duraklatılmış**. Bütçe 90 ₺'ye çıktığında Ads Editor'e tekrar
yüklemene gerek yok — arayüzden durumu "Etkin" yapman yeterli.

**Sıralama önerisi:** bütçe artınca önce `Gelin Tirnagi` (en yüksek sepet, mevsimsel),
sonra `Fiyatlar`, sonra `Manikur Pedikur`.

## Neyi neden değiştirdik (önceki sürüme göre)

- **Arama ortakları kapatıldı** — 45 ₺/gün bütçede kaliteyi düşürüyordu.
- **Saat iddiaları 14.10.2026'da güncellendi** — site Pazartesi-Cumartesi 09:00-21:00.
- **"Belgeli Nail Artist" → "Google'da 5,0 Puan · 20 Yorum"** — 7/8 reklamda tekrar
  ediyordu ve açılış sayfalarında "belge" kelimesi geçmiyor. Yeni iddia `aggregateRating`
  şemasında ve `llms.txt`'te doğrulanabilir.
- **"Otoklavda Steril Aletler" → "Gece 23:00'a Kadar Randevu"** — aynı reklamdaki
  "Tek Kullanımlık Steril Set" ile aynı temadaydı; sterilizasyon iddiası D3
  açıklamasında zaten duruyor.
- **Reklam metni ↔ sayfa çelişkileri giderildi** (reklam sayfaya uyduruldu, tersi değil):
  protez süresi 90-150 dk → **2-2,5 saat**; kalıcı oje 45-60 → **45-75 dk**;
  "söküm 400 ₺" ve "Pedikür + Kalıcı Oje 1.250 ₺" o sayfalarda yok → kaldırıldı;
  "Cat Eye" iki sayfada da geçmiyor → **French ve Ombre**; evde sayfasında "ofis"
  geçmiyor → **rezidans/otel/villa**.
- **Türkçe ekli negatifler eklendi (+43)** — Google negatiflerde yakın varyant
  eşleştirmez; `kurs` negatifi `kursu`/`kursları`/`kursa`'yı engellemiyordu.
- **Dil hedefi Türkçe → Türkçe + İngilizce + Rusça** — eşleştirme anahtar kelimeyle
  yapıldığı için alaka kaybı yaratmaz, erişim ekler (EN/RU sayfalarınız var).
- **"Grup Randevusu Yapıyoruz" ve grup randevu açıklaması kaldırıldı** — sitenin hiçbir
  yerinde bu iddiayı destekleyen içerik yok, açılış sayfası eşleşmiyordu.
- **Açıklamalar reklam grubuna özel yazıldı** — 6 reklamın 4 açıklaması da aynıydı,
  RSA kombinasyon havuzunu daraltıyordu.
- **Baş terimlerde tam eşleme eklendi** — "izmir kalıcı oje" gibi terimlerde ifade
  eşlemesi alakasız uzun kuyruğa bütçe kaçırıyordu.
- **Negatifler 59 → 115** — ürün/malzeme satın alma, model/görsel arama, bilgi amaçlı
  ("nedir", "zararlı mı") ve komşu il sorguları eklendi. `oje`, `tırnak`, `manikür` gibi
  çekirdek kelimeler bilerek negatif listesine ALINMADI.
- **Urla ve Çeşme konum hedefine eklendi** — o bölgeler için ayrı açılış sayfalarınız var.
- **Gelin Tırnağı ve Nail Art reklam grupları** eklendi (duraklatılmış) — yüksek sepetli
  ve mevcut açılış sayfaları var; bütçe artınca aç.
- **Hesapta zaten bir Akıllı (Smart) kampanya var** (`İzmir Protez Tırnak`, 4,70 ₺/gün).
  Bu kampanya aynı aramalarda yeni kampanyayla yarışır — yeni kampanya `Enabled`
  olduğu gün eskisini duraklat.
- **Reklam grubu bazlı maks. TBM** — 45 ₺/gün bütçeye göre 5,00-9,00 ₺ arasında ayarlandı.
