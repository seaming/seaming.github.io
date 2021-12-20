// Values from https://sites.uni.edu/morgans/astro/course/Notes/section2/spectraltemps.html
const STELLAR_CLASSIFICATION_DATA = [
    {'class': 'M8V', T: 2700, L: 0.002},
    {'class': 'M6III', T: 2800, L: 3.3},
    {'class': 'M7V', T: 2900, L: 0.0032},
    {'class': 'M5I', T: 2950, L: 58000},
    {'class': 'M5III', T: 2950, L: 5.1},
    {'class': 'M4I', T: 3100, L: 56000},
    {'class': 'M4III', T: 3100, L: 7.4},
    {'class': 'M6V', T: 3100, L: 0.0051},
    {'class': 'M5V', T: 3200, L: 0.011},
    {'class': 'M3I', T: 3300, L: 54000},
    {'class': 'M3III', T: 3300, L: 9.5},
    {'class': 'M4V', T: 3400, L: 0.022},
    {'class': 'M2I', T: 3500, L: 53000},
    {'class': 'M2III', T: 3500, L: 11},
    {'class': 'M3V', T: 3500, L: 0.027},
    {'class': 'M1I', T: 3600, L: 52000},
    {'class': 'M1III', T: 3600, L: 13},
    {'class': 'M2V', T: 3600, L: 0.035},
    {'class': 'M0I', T: 3660, L: 50600},
    {'class': 'M0III', T: 3660, L: 15},
    {'class': 'M1V', T: 3700, L: 0.055},
    {'class': 'K5I', T: 3750, L: 20000},
    {'class': 'M0V', T: 3750, L: 0.08},
    {'class': 'K5III', T: 3780, L: 32},
    {'class': 'K7V', T: 4000, L: 0.11},
    {'class': 'K4III', T: 4010, L: 45},
    {'class': 'K4I', T: 4100, L: 18300},
    {'class': 'K3III', T: 4210, L: 58},
    {'class': 'K3I', T: 4300, L: 17000},
    {'class': 'K5V', T: 4400, L: 0.15},
    {'class': 'K2III', T: 4460, L: 70},
    {'class': 'K2I', T: 4500, L: 15200},
    {'class': 'K1III', T: 4580, L: 82},
    {'class': 'K4V', T: 4600, L: 0.18},
    {'class': 'K1I', T: 4700, L: 13500},
    {'class': 'K0III', T: 4720, L: 96},
    {'class': 'K3V', T: 4800, L: 0.24},
    {'class': 'G8III', T: 4870, L: 113},
    {'class': 'K0I', T: 4900, L: 12000},
    {'class': 'K2V', T: 4960, L: 0.29},
    {'class': 'G5III', T: 5010, L: 127},
    {'class': 'G8I', T: 5050, L: 11000},
    {'class': 'G5I', T: 5100, L: 9800},
    {'class': 'K1V', T: 5110, L: 0.32},
    {'class': 'K0V', T: 5240, L: 0.38},
    {'class': 'G8V', T: 5440, L: 0.51},
    {'class': 'G2I', T: 5500, L: 9500},
    {'class': 'G5V', T: 5660, L: 0.73},
    {'class': 'G0I', T: 5800, L: 9600},
    {'class': 'G2V', T: 5800, L: 1},
    {'class': 'G1V', T: 5930, L: 1.1},
    {'class': 'G0V', T: 6050, L: 1.2},
    {'class': 'F8I', T: 6150, L: 12000},
    {'class': 'F8V', T: 6300, L: 1.4},
    {'class': 'F7V', T: 6400, L: 1.5},
    {'class': 'F6V', T: 6550, L: 2},
    {'class': 'F5V', T: 6700, L: 2.7},
    {'class': 'F5I', T: 6800, L: 16000},
    {'class': 'F3V', T: 6850, L: 3.2},
    {'class': 'F2V', T: 7050, L: 3.8},
    {'class': 'F2I', T: 7200, L: 18000},
    {'class': 'F0V', T: 7350, L: 5.1},
    {'class': 'F0I', T: 7500, L: 20000},
    {'class': 'A7V', T: 7920, L: 8.8},
    {'class': 'A5I', T: 8300, L: 36000},
    {'class': 'A5V', T: 8310, L: 11},
    {'class': 'A4V', T: 8480, L: 12},
    {'class': 'A3V', T: 8750, L: 14},
    {'class': 'A2I', T: 8900, L: 40000},
    {'class': 'A2V', T: 9040, L: 17},
    {'class': 'A1I', T: 9100, L: 44000},
    {'class': 'A1V', T: 9330, L: 20},
    {'class': 'A0I', T: 9400, L: 50600},
    {'class': 'A0V', T: 9600, L: 24},
    {'class': 'B9I', T: 9700, L: 61000},
    {'class': 'B8I', T: 10000, L: 73000},
    {'class': 'B7I', T: 10500, L: 82000},
    {'class': 'B6I', T: 11000, L: 98000},
    {'class': 'B9V', T: 11400, L: 42},
    {'class': 'B5I', T: 11500, L: 140000},
    {'class': 'B8V', T: 12300, L: 73},
    {'class': 'B3I', T: 12800, L: 180000},
    {'class': 'B7V', T: 13500, L: 140},
    {'class': 'B2I', T: 14000, L: 220000},
    {'class': 'B6V', T: 14300, L: 240},
    {'class': 'B5V', T: 15200, L: 380},
    {'class': 'B1I', T: 16000, L: 280000},
    {'class': 'B3V', T: 17600, L: 1060},
    {'class': 'B0I', T: 21000, L: 320000},
    {'class': 'B2V', T: 21000, L: 3190},
    {'class': 'B1V', T: 23000, L: 5550},
    {'class': 'B0V', T: 29200, L: 24000},
    {'class': 'O9V', T: 37800, L: 55000},
    {'class': 'O8V', T: 40600, L: 80000},
    {'class': 'O7V', T: 43300, L: 120000},
    {'class': 'O6V', T: 45000, L: 140000},
    {'class': 'O5V', T: 54000, L: 200000}
];

function stellar_classification(T,L) {
    var x = STELLAR_CLASSIFICATION_DATA.sort((a,b) => {
        var a_dist = Math.pow(a.T-T, 2) + Math.pow(a.L-L, 2);
        var b_dist = Math.pow(b.T-T, 2) + Math.pow(b.L-L, 2);
        return a_dist - b_dist;
    });
    return x[0]['class'];
}