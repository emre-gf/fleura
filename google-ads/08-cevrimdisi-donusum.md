# 08 — Dönüşüm değeri + çevrimdışı randevu yükleme (OCI)

Durum: **site tarafı hazır (24.10.2026)** · hesap tarafı aşağıdaki adımları bekliyor.

Amaç: Google'a "WhatsApp'a basan" yerine "randevuya gelen" müşteriyi öğretmek ve
protez tırnağı (1.500 ₺) manikürle (650 ₺) eşit saymayı bırakmak.

## Sitede ne değişti

| Değişiklik | Nerede |
|---|---|
| Dönüşüm değeri artık sabit 250/400 ₺ değil, **hizmetin site fiyatı** (protez 1.500, kalıcı oje 1.150, manikür 650…). Hizmet bilinmiyorsa 650 ₺. | `fn-events.js` → `FIYAT` tablosu (tek kaynak) |
| Hizmet sırası: reklam URL'sindeki `?hizmet=` → sayfa yolu → varsayılan. Blog yazıları hizmete bağlanmaz. | `fn-events.js` → `hizmet()` |
| Reklamdan gelen kişinin WhatsApp mesajının sonuna **tıklama kimliği** eklenir: `#rez-Cj0KCQjw…` | `fn-events.js` → `rezKodu()` |
| GA4 `whatsapp_click` / `phone_click` olaylarına `service` parametresi eklendi | `fn-events.js` → `base()` |
| KVKK metnine reklam tıklama kimliği ve Google Ads aktarımı eklendi | `kvkk-aydinlatma-metni.html` |
| Haftalık yükleme dosyasını üreten araç | `tools/oci-csv.js` (`npm run ads:oci`) |

### WhatsApp mesajındaki kodlar

| Kod | Anlamı | Yüklenir mi |
|---|---|---|
| `#rez-Cj0KCQjw…` (uzun) | Google Ads, tıklama kimliği (gclid) var | **Evet** |
| `#rez-gb-…` / `#rez-wb-…` | Google Ads, iOS kimliği | Hayır — dosya şablonu yalnızca gclid alır |
| `#rez-342` (3 hane) | Google Ads, ama kimlik alınamadı* | Hayır — yalnızca oran hesabına girer |
| `#rez.233` (noktalı) | ChatGPT / AI asistanı | Hayır |
| kod yok | Organik, doğrudan, sosyal | Hayır |

\* Kimlik iki yerden okunur: açılış sayfasının URL'si ve Google'ın `_gcl_aw` çerezi.
Çerez yalnızca çerez bildiriminde "Kabul et" diyenlerde vardır. Rıza vermeyen biri
anasayfadan başka bir sayfaya geçip oradan yazarsa kimlik kaybolur. Bu bilinçli bir
sınır: rıza almadan kimliği kendi depolamamıza yazmıyoruz.

## Hesapta bir kez yapılacaklar

1. **Yeni dönüşüm işlemi:** Hedefler → Dönüşümler → Özet → **+ Yeni dönüşüm işlemi** →
   **İçe aktar** → *CRM'ler, dosyalar veya diğer veri kaynakları* → *Tıklamalardan dönüşümleri izle*.
   - Ad: **`Randevu Gerceklesen`** (araç bu adı yazar; farklıysa `--ad "..."` verin)
   - Kategori: Kesinleşmiş potansiyel müşteri (veya Satın alma)
   - Değer: **Her dönüşüm için farklı değerler kullan** (varsayılan 650 ₺)
   - Sayım: **Her biri**
   - Tıklama penceresi: **90 gün**
   - Başlangıçta **İkincil**. Aşağıdaki "Geçiş" bölümüne bakın.
   - Oluşturduktan sonra ilk yükleme için **4-6 saat bekleyin** (Google'ın önerisi).
2. **Mevcut 3 dönüşüm işleminin değer ayarı** (WhatsApp Randevu, Telefon Tiklamasi,
   Randevu Formu Tamamlandi): Değer → **"Her dönüşüm için farklı değerler kullan"**,
   varsayılan 650 ₺. Bu yapılmazsa site değeri yok sayılır ve 250 ₺ kalır.
3. **Reklam grubu "Nihai URL son eki"** (Reklam grubu → Ayarlar → Reklam grubu URL seçenekleri).
   Anasayfaya inen reklamlarda hizmeti yalnızca bu söyler:

   | Reklam grubu | Nihai URL son eki |
   |---|---|
   | Protez & Jel Tirnak | `hizmet=protez-tirnak` |
   | Kalici Oje | `hizmet=kalici-oje` |
   | Manikur Pedikur | `hizmet=manikur-pedikur` |
   | Gelin Tirnagi (açıldığında) | `hizmet=gelin-tirnagi` |
   | Eve Gelen Nail Artist | boş bırak (genel → 650 ₺) |

4. **Otomatik etiketleme açık** olmalı (Yönetici → Hesap ayarları). Açık değilse gclid hiç gelmez.

## Her hafta (Pazartesi, ~10 dk)

1. Geçen haftanın **her** WhatsApp görüşmesini `google-ads/oci/randevular.csv`'ye bir satır olarak yazın.
   İlk sefer: `cp google-ads/oci/randevular.ornek.csv google-ads/oci/randevular.csv`, örnek satırları silin.
   - `kod`: mesajın sonundaki `#rez…` kodunun **tamamı** (yoksa boş)
   - `durum`: `randevu` (hizmet verildi) · `iptal` · `soru` · `salon-sandi` · `pahali` …
   - `tutar`: alınan ücret; boşsa hizmetin site fiyatı kullanılır
   - `saat`: hizmetin verildiği saat
   - **Ad, telefon, adres yazmayın.** Dosya git'e ve siteye girmez.
2. `npm run ads:oci -- --since 2026-10-27` (geçen yüklemenin tarihi)
   → `google-ads/oci/yukleme-<tarih>.csv` + kanal bazında randevuya dönüş oranı.
3. Ads → Hedefler → Dönüşümler → **Yüklemeler** → **+** → dosyayı seç → Önizle → Uygula.
4. 24-48 saat sonra aynı ekranda "Teşhis"e bakın: eşleşmeyen veya reddedilen satır var mı?

Aracın ilk satırı açık sorunun cevabını verir: **"Google Ads 6/20 (%30)"** = reklamdan
gelen 20 görüşmenin 6'sı randevuya döndü. 2-3 haftalık kayıt bu oranı netleştirir.
Mesajlara geriye doğru bakarak (eski `#rez-342` kodları) geçmiş ay da sayılabilir;
o satırlar yüklenemez ama oran hesabına girer.

## Geçiş: tıklamadan randevuya

Kampanya **Hedef EBM** ile çalışıyor. Hedef EBM dönüşüm **değerine bakmaz**, yalnızca sayıya bakar.
Yani hizmet fiyatlarının teklife etkisi ancak strateji **"Dönüşüm değerini en üst düzeye çıkar"**
olduğunda başlar.

1. **0-3. hafta:** `Randevu Gerceklesen` İkincil. Yüklemelerin eşleştiğini doğrulayın.
2. **Eşleşme çalışıyor ve ayda ~15+ randevu yükleniyorsa:** `Randevu Gerceklesen` → Birincil;
   WhatsApp / Telefon / Form → İkincil (aynı müşteri iki kez sayılmasın).
3. Teklif stratejisi → **Dönüşüm değerini en üst düzeye çıkar** (önce hedef ROAS'sız).

Randevu sayısı ayda 15'in altında kalırsa 2. adımı yapmayın: Google o kadar az sinyalle
öğrenemez. Tıklamalar Birincil kalsın, değerleri zaten artık hizmete göre farklı.

## Bilinen sınırlar

- Google dosyayla yüklemeyi "legacy" olarak işaretliyor ve **Google Ads Data Manager**'ı öneriyor.
  Dosya yöntemi bugün çalışıyor; şablon değişirse `tools/oci-csv.js` başlık satırı güncellenmeli.
- Müşteri mesajdaki kodu silebilir. Bu normal; o görüşme oranda "kod yok" olarak görünür.
- Fiyat değişirse yalnızca `fn-events.js` → `FIYAT` güncellenir (araç oradan okur),
  ardından tüm sayfalarda `fn-events.js?v=` sürümü artırılır (dosya 1 yıl önbellekte kalır).
