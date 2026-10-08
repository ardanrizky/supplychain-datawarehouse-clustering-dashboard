-- ====================================================================
-- View: v_clustering_supply_chain
-- Digunakan untuk agregasi indikator performa logistik dan input dashboard
-- ====================================================================

CREATE OR REPLACE VIEW v_clustering_supply_chain AS
SELECT 
    p.nama_produk,
    p.kategori,
    l.kota,
    k.departemen,
    SUM(f.jumlah_unit) AS total_unit,
    SUM(f.biaya_pengiriman) AS total_biaya,
    ROUND(AVG(f.waktu_siklus_hari), 1) AS rata_waktu_siklus,
    CASE 
        WHEN SUM(f.jumlah_cacat) = 0 THEN 'SANGAT BAIK'
        WHEN SUM(f.jumlah_cacat) <= 3 THEN 'NORMAL'
        ELSE 'TINGGI'
    END AS kategori_cacat,
    CASE 
        WHEN AVG(f.waktu_siklus_hari) <= 3 THEN 'CEPAT'
        WHEN AVG(f.waktu_siklus_hari) <= 6 THEN 'NORMAL'
        ELSE 'LAMBAT'
    END AS kategori_waktu_siklus,
    CASE 
        WHEN SUM(f.biaya_pengiriman) >= 10000000 THEN 'TINGGI'
        WHEN SUM(f.biaya_pengiriman) >= 5000000 THEN 'SEDANG'
        ELSE 'RENDAH'
    END AS kategori_biaya_pengiriman,
    CASE 
        WHEN AVG(f.waktu_siklus_hari) <= 3 AND SUM(f.jumlah_cacat) <= 2 THEN 'Cluster A'
        WHEN AVG(f.waktu_siklus_hari) <= 6 THEN 'Cluster B'
        ELSE 'Cluster C'
    END AS cluster_kinerja
FROM fakta_pergerakan_rantai_pasok f
JOIN dimensi_produk p ON f.id_produk = p.id_produk
JOIN dimensi_lokasi l ON f.id_lokasi = l.id_lokasi
JOIN dimensi_karyawan k ON f.id_karyawan = k.id_karyawan
GROUP BY p.nama_produk, p.kategori, l.kota, k.departemen;
