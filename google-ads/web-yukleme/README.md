# Google Ads — WEB toplu yükleme formatı (Ads Editor değil)

Bu klasördeki dosyalar Google Ads arayüzündeki
**Araçlar → Toplu işlemler → Yüklemeler → Yeni Yükleme → Dosyayı karşıya yükle**
ekranına doğrudan yüklenmek üzere, Google'ın **resmî şablon kolonlarıyla** üretildi.
(Üst klasördeki `google-ads/` dosyaları Ads Editor formatındadır — ikisini karıştırma.)

## Yükleme sırası — bu sırayla, her birinde "Önizleme" → hata yoksa "Uygula"

| # | Dosya | İçerik |
|---|---|---|
| 1 | `01-kampanya.csv` | Kampanya: 45 ₺/gün, Arama, Duraklatılmış, konum İzmir + Urla + Çeşme |
| 2 | `02-reklam-gruplari.csv` | 8 reklam grubu (3 etkin, 5 duraklatılmış) |
| 3 | `03-anahtar-kelimeler.csv` | 68 anahtar kelime (tam + ifade eşlemesi) |
| 4 | `04-negatif-anahtar-kelimeler.csv` | 115 kampanya seviyesi negatif |
| 5 | `05-reklamlar-rsa.csv` | 8 duyarlı arama reklamı, Başlık 1 birinci pozisyona sabitli |

Sıra önemli: kampanya oluşmadan reklam grubu, reklam grubu oluşmadan anahtar
kelime/reklam yüklenemez ("The entity does not exist" hatası alırsın).

## Çözülen format tuzakları

- Kolon adları **İngilizce** olmalı (arayüz Türkçe olsa bile).
- `Budget` kolonu zorunlu (Ads Editor'deki "Campaign Daily Budget" değil).
- `EU political ads` kolonu zorunlu — geçerli değerler yalnızca **Yes / No**.
- Konum formatı `Izmir,İzmir,Turkey` şeklinde (şehir, il, ülke). Düz
  `Izmir, Turkey` reddediliyor.
- Dil kodu `tr`.
- Her satırın başında `Row Type` (Campaign / Ad group / Keyword / Negative keyword / Ad)
  ve `Action` (Add) bulunmalı.

## Yükledikten sonra elle yapılacaklar

- Konum seçeneği → "Bulunduğu yer"
- Reklam zamanlaması → Pzt-Cmt 09:00-20:30
- Öğeler (site bağlantıları, açıklama metinleri, arama uzantısı) → `../google-ads/06-oge-uzantilar.csv`
- Otomatik oluşturulan öğeler → KAPAT
- Eski Akıllı kampanyayı (`İzmir Protez Tırnak`) duraklat
