<?php
header('Content-Type: application/json; charset=utf-8');

$host = "localhost";
$user = "root";
$password = "";
$database = "dwh_supply_chain";

$conn = mysqli_connect($host, $user, $password, $database);

if (!$conn) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Koneksi database gagal: " . mysqli_connect_error()
    ]);
    exit;
}

mysqli_set_charset($conn, "utf8mb4");

$query = "
    SELECT
        nama_produk,
        kategori,
        kota,
        departemen,
        total_unit,
        total_biaya,
        rata_waktu_siklus,
        kategori_cacat,
        kategori_waktu_siklus,
        kategori_biaya_pengiriman,
        cluster_kinerja
    FROM v_clustering_supply_chain
";

$result = mysqli_query($conn, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Query gagal: " . mysqli_error($conn)
    ]);
    mysqli_close($conn);
    exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    $row["total_unit"] = (float) $row["total_unit"];
    $row["total_biaya"] = (float) $row["total_biaya"];
    $row["rata_waktu_siklus"] = (float) $row["rata_waktu_siklus"];
    $data[] = $row;
}

echo json_encode([
    "success" => true,
    "total" => count($data),
    "data" => $data
], JSON_UNESCAPED_UNICODE);

mysqli_close($conn);
?>
