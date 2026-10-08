let allData = [];
let filtered = [];
let currentPage = 1;
const perPage = 25;
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-filter').addEventListener('click', applyFilter);
  document.getElementById('btn-reset').addEventListener('click', resetFilter);
  document.getElementById('f-search').addEventListener('input', applyFilter);

  loadData();
});

async function loadData() {
  showLoading(true);

  try {
    const response = await fetch('get_data.php', { cache: 'no-store' });
    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Gagal mengambil data');
    }

    allData = Array.isArray(result.data) ? result.data : [];
    filtered = [...allData];
    currentPage = 1;

    populateFilters();
    renderKPI();
    renderCharts();
    renderTable();
  } catch (error) {
    document.getElementById('tbl-body').innerHTML =
      `<tr><td colspan="12" class="empty-state">Gagal mengambil data dari database: ${error.message}</td></tr>`;
    document.getElementById('row-count').textContent = '0 baris';
  }

  showLoading(false);
}

function renderKPI() {
  const total = allData.length;

  const a = allData.filter(row =>
    String(row.cluster_kinerja || '').trim().startsWith('CLUSTER A')
  ).length;

  const b = allData.filter(row =>
    String(row.cluster_kinerja || '').trim().startsWith('CLUSTER B')
  ).length;

  const c = allData.filter(row =>
    String(row.cluster_kinerja || '').trim().startsWith('CLUSTER C')
  ).length;

  const totalBiaya = allData.reduce((sum, row) =>
    sum + Number(row.total_biaya || 0), 0
  );

  document.getElementById('kpi-total').textContent = total.toLocaleString('id-ID');
  document.getElementById('kpi-a').textContent = a.toLocaleString('id-ID');
  document.getElementById('kpi-b').textContent = b.toLocaleString('id-ID');
  document.getElementById('kpi-c').textContent = c.toLocaleString('id-ID');
  document.getElementById('kpi-biaya').textContent =
    'Rp ' + (totalBiaya / 1000000).toFixed(1) + 'M';
}

function renderCharts() {
  renderClusterChart();
  renderKotaChart();
  renderWaktuChart();
}

function renderClusterChart() {
  const clusterCount = {};

  allData.forEach(row => {
    const cluster = String(row.cluster_kinerja || 'UNKNOWN').trim();
    clusterCount[cluster] = (clusterCount[cluster] || 0) + 1;
  });

  const labels = Object.keys(clusterCount).map(cluster => {
    if (cluster.startsWith('CLUSTER A')) return 'A High';
    if (cluster.startsWith('CLUSTER B')) return 'B Medium';
    if (cluster.startsWith('CLUSTER C')) return 'C Low';
    return cluster;
  });

  createChart('chartCluster', 'doughnut', labels, Object.values(clusterCount),
    ['#16a34a', '#0ea5e9', '#f59e0b', '#e11d48']);
}

function renderKotaChart() {
  const kotaUnit = {};

  allData.forEach(row => {
    const kota = row.kota || 'Tidak diketahui';
    kotaUnit[kota] = (kotaUnit[kota] || 0) + Number(row.total_unit || 0);
  });

  const sorted = Object.entries(kotaUnit)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  createChart('chartKota', 'bar',
    sorted.map(item => item[0]),
    sorted.map(item => item[1]),
    ['#2563eb']);
}

function renderWaktuChart() {
  const waktuCount = {};

  allData.forEach(row => {
    const waktu = row.kategori_waktu_siklus || 'Tidak diketahui';
    waktuCount[waktu] = (waktuCount[waktu] || 0) + 1;
  });

  createChart('chartWaktu', 'pie',
    Object.keys(waktuCount),
    Object.values(waktuCount),
    ['#16a34a', '#f59e0b', '#e11d48', '#7c3aed']);
}

function createChart(id, type, labels, data, colors) {
  if (charts[id]) charts[id].destroy();

  const ctx = document.getElementById(id).getContext('2d');

  charts[id] = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        label: id === 'chartKota' ? 'Total Unit' : 'Jumlah Data',
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: type === 'bar' ? 10 : 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#64748b',
            boxWidth: 14,
            font: { size: 12, weight: '600' }
          }
        }
      },
      scales: type === 'bar' ? {
        x: {
          ticks: { color: '#64748b', font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: '#64748b' },
          grid: { color: '#e5e7eb' }
        }
      } : {}
    }
  });
}

function populateFilters() {
  fillSelect('f-kategori', [...new Set(allData.map(row => row.kategori).filter(Boolean))]);
  fillSelect('f-kota', [...new Set(allData.map(row => row.kota).filter(Boolean))]);
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Semua</option>';

  values.sort().forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function applyFilter() {
  const cluster = document.getElementById('f-cluster').value;
  const kategori = document.getElementById('f-kategori').value;
  const kota = document.getElementById('f-kota').value;
  const waktu = document.getElementById('f-waktu').value;
  const search = document.getElementById('f-search').value.toLowerCase();

  filtered = allData.filter(row => {
    if (cluster && String(row.cluster_kinerja || '').trim() !== cluster) return false;
    if (kategori && row.kategori !== kategori) return false;
    if (kota && row.kota !== kota) return false;
    if (waktu && row.kategori_waktu_siklus !== waktu) return false;
    if (search && !String(row.nama_produk || '').toLowerCase().includes(search)) return false;
    return true;
  });

  currentPage = 1;
  renderTable();
}

function resetFilter() {
  document.getElementById('f-cluster').value = '';
  document.getElementById('f-kategori').value = '';
  document.getElementById('f-kota').value = '';
  document.getElementById('f-waktu').value = '';
  document.getElementById('f-search').value = '';

  filtered = [...allData];
  currentPage = 1;
  renderTable();
}

function renderTable() {
  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);
  const tbody = document.getElementById('tbl-body');

  document.getElementById('row-count').textContent =
    filtered.length.toLocaleString('id-ID') + ' baris';

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="12" class="empty-state">Tidak ada data ditemukan</td></tr>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = pageData.map((row, index) => `
    <tr>
      <td>${start + index + 1}</td>
      <td><strong>${row.nama_produk || '-'}</strong></td>
      <td>${row.kategori || '-'}</td>
      <td>${row.kota || '-'}</td>
      <td>${row.departemen || '-'}</td>
      <td style="text-align:right">${Number(row.total_unit || 0).toLocaleString('id-ID')}</td>
      <td style="text-align:right">Rp ${Number(row.total_biaya || 0).toLocaleString('id-ID')}</td>
      <td style="text-align:right">${Number(row.rata_waktu_siklus || 0).toFixed(1)}</td>
      <td>${cacatBadge(row.kategori_cacat)}</td>
      <td>${waktuBadge(row.kategori_waktu_siklus)}</td>
      <td>${row.kategori_biaya_pengiriman || '-'}</td>
      <td>${clusterBadge(row.cluster_kinerja)}</td>
    </tr>
  `).join('');

  renderPagination();
}

function clusterBadge(value) {
  if (!value) return '-';

  const cluster = String(value).trim();

  if (cluster.startsWith('CLUSTER A')) return '<span class="badge badge-A">A High</span>';
  if (cluster.startsWith('CLUSTER B')) return '<span class="badge badge-B">B Medium</span>';

  return '<span class="badge badge-C">C Low</span>';
}

function waktuBadge(value) {
  if (!value) return '-';

  const cls = value === 'CEPAT' ? 'cepat' :
              value === 'NORMAL' ? 'normal' : 'lambat';

  return `<span class="badge badge-${cls}">${value}</span>`;
}

function cacatBadge(value) {
  if (!value) return '-';

  const cls = value === 'CACAT RENDAH' ? 'cacat-rendah' :
              value === 'CACAT SEDANG' ? 'cacat-sedang' : 'tanpa-cacat';

  return `<span class="badge badge-${cls}">${value}</span>`;
}

function renderPagination() {
  const totalPages = Math.ceil(filtered.length / perPage);
  const pagination = document.getElementById('pagination');

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page++) {
    html += `<button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="goPage(${page})">${page}</button>`;
  }

  html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

  pagination.innerHTML = html;
}

function goPage(page) {
  const totalPages = Math.ceil(filtered.length / perPage);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderTable();
}

function showLoading(status) {
  document.getElementById('loading').style.display = status ? 'flex' : 'none';
}
