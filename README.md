# 📦 Supply Chain Data Warehouse & Performance Clustering Dashboard

Proyek ini adalah implementasi *End-to-End Data Warehouse* dan antarmuka dashboard analitik untuk memantau performa rantai pasok (*Supply Chain Management*). 

Alur proyek mencakup:
1. **ETL Pipeline:** Ekstraksi, pembersihan, dan pemuatan data menggunakan **Pentaho Data Integration (PDI)**.
2. **Data Warehouse (Star Schema):** Pemodelan 1 tabel fakta dan 5 tabel dimensi di **MySQL**.
3. **Clustering Kinerja:** Segmentasi produk dan pengiriman ke dalam 3 kelompok performa (Cluster A, B, dan C).
4. **Interactive Dashboard:** Dashboard web responsif berbasis PHP & Chart.js dengan filter multi-parameter.

---

## 🏗️ Arsitektur & Pemodelan Data

Data warehouse dirancang menggunakan skema bintang (*Star Schema*):

* **Tabel Fakta:**
  * `fakta_pergerakan_rantai_pasok` (mencatat jumlah unit, biaya pengiriman, waktu siklus hari, nilai inventaris, dan jumlah cacat).
* **Tabel Dimensi:**
  * `dimensi_produk` (nama produk, kategori, merek)
  * `dimensi_lokasi` (kota, provinsi)
  * `dimensi_pemasok` (nama pemasok, jenis pemasok)
  * `dimensi_karyawan` (karyawan penanggung jawab, departemen)
  * `dimensi_waktu` (hari, bulan, kuartal, tahun)

Seluruh proses integrasi data dimodelkan di Pentaho menggunakan berkas `.ktr` (transformasi) dan `.kjb` (job orchestrator).

---

## 🎯 Kategori Clustering Kinerja

Data produk disegmentasi menjadi 3 klaster operasional:
* **Cluster A (High Performance):** Waktu siklus pengiriman cepat dengan tingkat cacat minimal (kinerja terbaik).
* **Cluster B (Medium Performance):** Performa stabil dalam batas toleransi standar operasional.
* **Cluster C (Low Performance):** Waktu pengiriman lebih lambat atau biaya pengiriman tinggi (membutuhkan evaluasi logistik).

---

## 📂 Struktur Repositori

```text
supply-chain-dw-clustering-dashboard/
├── database/
│   ├── supply_chain_dw_final.sql     # Skema DDL tabel fakta & dimensi beserta data
│   └── create_view_clustering.sql    # View agregasi untuk clustering & dashboard
├── pentaho_etl/
│   ├── job1.kjb                      # Master ETL Job di Pentaho
│   ├── etl_fakta_pasok.ktr           # Transformasi tabel fakta
│   ├── etl_dim_karyawan.ktr          # Transformasi dimensi karyawan
│   ├── etl_dim_lokasi.ktr            # Transformasi dimensi lokasi
│   ├── etl_dim_pemasok.ktr           # Transformasi dimensi pemasok
│   └── etl_dim_waktu.ktr             # Transformasi dimensi waktu
├── dashboard/
│   ├── index.html                    # Halaman utama clustering dashboard
│   ├── get_data.php                  # Endpoint data JSON dari MySQL
│   ├── css/style.css                 # Desain antarmuka dashboard
│   └── js/script.js                  # Logika interaktif filter & Chart.js
├── .gitignore
└── README.md
```

---

## 🚀 Cara Menjalankan Dashboard

### 1. Siapkan Database MySQL
1. Buka phpMyAdmin atau MySQL CLI.
2. Buat database baru bernama `dwh_supply_chain`.
3. Import berkas `database/supply_chain_dw_final.sql`.
4. Jalankan script `database/create_view_clustering.sql` untuk membuat view agregasi.

### 2. Jalankan Dashboard Web
Kamu bisa menjalankannya lewat XAMPP atau PHP built-in server:

**Menggunakan PHP Built-in Server (Cepat):**
```bash
cd dashboard
php -S localhost:8080
```
Buka browser di: `http://localhost:8080`

**Menggunakan XAMPP:**
1. Salin isi folder `dashboard/` ke folder `C:/xampp/htdocs/supply_chain_dashboard/`.
2. Pastikan service **Apache** dan **MySQL** di XAMPP Control Panel aktif.
3. Buka browser di: `http://localhost/supply_chain_dashboard/`

---

## 👤 Author
* **May Rizky Ardanata** (D4 Sains Data - PENS)
* GitHub: [@ardanrizky](https://github.com/ardanrizky)
