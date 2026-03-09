
import fs from 'fs';
import path from 'path';

const files = [
    'd:/my portfolio/Mohamed-Mohsen/LALEN-PERFUME/src/pages/Dashboard/Analytics/AnalyticsDashboard.jsx',
    'd:/my portfolio/Mohamed-Mohsen/LALEN-PERFUME/src/pages/Dashboard/Analytics/DateRangeFilter.jsx',
    'd:/my portfolio/Mohamed-Mohsen/LALEN-PERFUME/src/pages/Dashboard/Analytics/KPICards.jsx',
    'd:/my portfolio/Mohamed-Mohsen/LALEN-PERFUME/src/pages/Dashboard/Analytics/SalesTrendChart.jsx',
    'd:/my portfolio/Mohamed-Mohsen/LALEN-PERFUME/src/pages/Dashboard/Analytics/TopProductsChart.jsx'
];

files.forEach(f => {
    try {
        if (fs.existsSync(f)) {
            fs.unlinkSync(f);
            console.log(`Deleted: ${f}`);
        } else {
            console.log(`Not found: ${f}`);
        }
    } catch (e) {
        console.error(`Error deleting ${f}: ${e.message}`);
    }
});
