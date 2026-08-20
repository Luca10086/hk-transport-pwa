/* 森友出行手册 - 数据表與常量（零依赖，最先加载） */

/* ==========================================================================
   Global State & Constants
   ========================================================================== */

const STORAGE_KEY = 'hk_transport_favorites';

/* API endpoints */
const KMB_BASE = 'https://data.etabus.gov.hk/v1/transport/kmb';
const CTB_BASE = 'https://rt.data.gov.hk/v2/transport/citybus';
const MTR_BASE = 'https://rt.data.gov.hk/v1/transport/mtr';

/* Weather API (HKO open data, supports CORS) */
const WEATHER_API = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc';
const WEATHER_FND_API = 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc';

/* 香港要聞（Google News RSS，需經 CORS 代理） */
const NEWS_RSS = 'https://news.google.com/rss?hl=zh-HK&gl=HK&ceid=HK:zh-Hant';

/* Sushiro official queue API (no CORS header → must go through corsproxy.io) */
const SUSHIRO_STORE_API = 'https://sushipass.sushiro.com.hk/api/2.0/info/storelist?latitude=22&longitude=114&numresults=50&region=HK';
const SUSHIRO_PROXY = (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

/* HKO weather icon → description mapping */
const HKO_ICONS = {
  50: '陽光充沛', 51: '間有陽光', 52: '短暂陽光', 53: '間有陽光几阵驟雨', 54: '短暂陽光有驟雨',
  60: '多雲', 61: '密雲', 62: '微雨', 63: '雨', 64: '大雨', 65: '雷暴',
  70: '天色良好', 71: '天色良好', 72: '天色良好', 73: '天色良好', 74: '天色良好', 75: '天色良好',
  76: '大致多雲', 77: '天色大致良好',
  80: '大風', 81: '干燥', 82: '潮濕', 83: '霧', 84: '薄霧', 85: '煙霞',
  90: '熱', 91: '暖', 92: '涼', 93: '冷'
};
const HKO_ICON_EMOJI = {
  50: '☀️', 51: '🌤️', 52: '🌤️', 53: '🌦️', 54: '🌦️',
  60: '☁️', 61: '☁️', 62: '🌧️', 63: '🌧️', 64: '🌧️', 65: '⛈️',
  70: '🌙', 71: '🌙', 72: '🌙', 73: '🌙', 74: '🌙', 75: '🌙',
  76: '☁️', 77: '🌙',
  80: '💨', 81: '💧', 82: '💦', 83: '🌫️', 84: '🌫️', 85: '🌫️',
  90: '🥵', 91: '🌡️', 92: '🍂', 93: '🥶'
};

/* MTR line code → display name mapping */
const MTR_LINES = {
  AEL: '機場快線', TCL: '東涌線', TML: '屯馬線', TKL: '將軍澳線',
  EAL: '東鐵線', SIL: '南港島線', TWL: '荃灣線', ISL: '港島線',
  KTL: '觀塘線', DRL: '迪士尼線'
};

/* MTR 各線車站表（站码均经 getSchedule.php 實测验证） */
const MTR_LINE_STOPS = {
  TWL: [
    { code: 'TSW', name: '荃灣' }, { code: 'TWH', name: '大窩口' }, { code: 'KWH', name: '葵興' },
    { code: 'KWF', name: '葵芳' }, { code: 'LAK', name: '荔景' }, { code: 'MEF', name: '美孚' },
    { code: 'LCK', name: '荔枝角' }, { code: 'CSW', name: '長沙灣' }, { code: 'SSP', name: '深水埗' },
    { code: 'PRE', name: '太子' }, { code: 'MOK', name: '旺角' }, { code: 'YMT', name: '油麻地' },
    { code: 'JOR', name: '佐敦' }, { code: 'TST', name: '尖沙咀' }, { code: 'ADM', name: '金鐘' },
    { code: 'CEN', name: '中環' }
  ],
  ISL: [
    { code: 'KET', name: '堅尼地城' }, { code: 'HKU', name: '香港大學' }, { code: 'SYP', name: '西營盘' },
    { code: 'SHW', name: '上環' }, { code: 'CEN', name: '中環' }, { code: 'ADM', name: '金鐘' },
    { code: 'WAC', name: '灣仔' }, { code: 'CAB', name: '銅鑼灣' }, { code: 'TIH', name: '天後' },
    { code: 'FOH', name: '炮台山' }, { code: 'NOP', name: '北角' }, { code: 'QUB', name: '鰂魚涌' },
    { code: 'TAK', name: '太古' }, { code: 'SWH', name: '西灣河' }, { code: 'SKW', name: '筲箕灣' },
    { code: 'HFC', name: '杏花邨' }, { code: 'CHW', name: '柴灣' }
  ],
  KTL: [
    { code: 'WHA', name: '黃埔' }, { code: 'HOM', name: '何文田' }, { code: 'YMT', name: '油麻地' },
    { code: 'MOK', name: '旺角' }, { code: 'PRE', name: '太子' }, { code: 'SKM', name: '石硤尾' },
    { code: 'KOT', name: '九龍塘' }, { code: 'LOF', name: '樂富' }, { code: 'WTS', name: '黃大仙' },
    { code: 'DIH', name: '鑽石山' }, { code: 'CHH', name: '彩虹' }, { code: 'KOB', name: '九龍灣' },
    { code: 'NTK', name: '牛頭角' }, { code: 'KWT', name: '觀塘' }, { code: 'LAT', name: '藍田' },
    { code: 'YAT', name: '油塘' }, { code: 'TIK', name: '調景嶺' }
  ],
  TCL: [
    { code: 'HOK', name: '香港' }, { code: 'KOW', name: '九龍' }, { code: 'OLY', name: '奧運' },
    { code: 'NAC', name: '南昌' }, { code: 'LAK', name: '荔景' }, { code: 'TSY', name: '青衣' },
    { code: 'SUN', name: '欣澳' }, { code: 'TUC', name: '東涌' }
  ],
  TKL: [
    { code: 'NOP', name: '北角' }, { code: 'QUB', name: '鰂魚涌' }, { code: 'YAT', name: '油塘' },
    { code: 'TIK', name: '調景嶺' }, { code: 'TKO', name: '將軍澳' }, { code: 'HAH', name: '坑口' },
    { code: 'POA', name: '寶琳' }, { code: 'LHP', name: '康城' }
  ],
  EAL: [
    { code: 'LMC', name: '落馬洲' }, { code: 'LOW', name: '羅湖' }, { code: 'SHS', name: '上水' },
    { code: 'FAN', name: '粉嶺' }, { code: 'TWO', name: '太和' }, { code: 'TAP', name: '大埔墟' },
    { code: 'UNI', name: '大學' }, { code: 'RAC', name: '馬場' }, { code: 'FOT', name: '火炭' },
    { code: 'SHT', name: '沙田' }, { code: 'TAW', name: '大圍' }, { code: 'KOT', name: '九龍塘' },
    { code: 'MKK', name: '旺角東' }, { code: 'HUH', name: '紅磡' }, { code: 'ADM', name: '金鐘' },
    { code: 'EXC', name: '會展' }
  ],
  TML: [
    { code: 'TUM', name: '屯門' }, { code: 'SIH', name: '兆康' }, { code: 'TIS', name: '天水圍' },
    { code: 'LOP', name: '朗屏' }, { code: 'YUL', name: '元朗' }, { code: 'KSR', name: '錦上路' },
    { code: 'TWW', name: '荃灣西' }, { code: 'MEF', name: '美孚' }, { code: 'NAC', name: '南昌' },
    { code: 'AUS', name: '柯士甸' }, { code: 'ETS', name: '尖東' }, { code: 'HUH', name: '紅磡' },
    { code: 'HOM', name: '何文田' }, { code: 'TKW', name: '土瓜灣' }, { code: 'SUW', name: '宋皇台' },
    { code: 'KAT', name: '啟德' }, { code: 'DIH', name: '鑽石山' }, { code: 'HIK', name: '顯徑' },
    { code: 'TAW', name: '大圍' }, { code: 'CKT', name: '車公廟' }, { code: 'SHM', name: '石門' },
    { code: 'CIO', name: '第一城' }, { code: 'STW', name: '沙田圍' }, { code: 'TSH', name: '大水坑' },
    { code: 'HEO', name: '恆安' }, { code: 'MOS', name: '馬鞍山' }, { code: 'WKS', name: '烏溪沙' }
  ],
  SIL: [
    { code: 'ADM', name: '金鐘' }, { code: 'OCP', name: '海洋公園' }, { code: 'WCH', name: '黃竹坑' },
    { code: 'LET', name: '利東' }, { code: 'SOH', name: '海怡半島' }
  ],
  DRL: [
    { code: 'SUN', name: '欣澳' }, { code: 'DIS', name: '迪士尼' }
  ],
  AEL: [
    { code: 'HOK', name: '香港' }, { code: 'KOW', name: '九龍' }, { code: 'TSY', name: '青衣' },
    { code: 'AIR', name: '機場' }, { code: 'AWE', name: '博覽館' }
  ]
};

/* MTR 站码 → 中文站名（用于方向终點顯示） */
const MTR_STATION_NAMES = (() => {
  const map = {};
  for (const line of Object.values(MTR_LINE_STOPS)) {
    for (const s of line) map[s.code] = s.name;
  }
  return map;
})();

/* MTR Bus route data */
const MTR_BUS_ROUTES = {
  'K51': { orig: '富泰', dest: '大榄', orig_en: 'Fu Tai', dest_en: 'Tai Lam' },
  'K52': { orig: '屯門站', dest: '龍鼓灘', orig_en: 'Tuen Mun Station', dest_en: 'Lung Kwu Tan' },
  'K53': { orig: '屯門站', dest: '掃管笏', orig_en: 'Tuen Mun Station', dest_en: 'So Kwun Wat' },
  'K58': { orig: '富泰', dest: '青山灣', orig_en: 'Fu Tai', dest_en: 'Castle Peak Bay' },
  'K65': { orig: '元朗站', dest: '流浮山', orig_en: 'Yuen Long Station', dest_en: 'Lau Fau Shan' },
  'K66': { orig: '大棠', dest: '朗屏', orig_en: 'Tai Tong', dest_en: 'Long Ping' },
  'K68': { orig: '元朗公園', dest: '元朗站(循環線)', orig_en: 'Yuen Long Park', dest_en: 'Yuen Long Station (Circular)' },
  'K73': { orig: '天恆', dest: '元朗西', orig_en: 'Tin Heng', dest_en: 'Yuen Long West' },
  'K74': { orig: '天瑞', dest: '凹頭(循環線)', orig_en: 'Tin Shui', dest_en: 'Au Tau (Circular)' },
  'K75': { orig: '天水圍站', dest: '洪水橋(循環線)', orig_en: 'Tin Shui Wai Station', dest_en: 'Hung Shui Kiu (Circular)' },
  'K76': { orig: '天恆', dest: '天水圍站', orig_en: 'Tin Heng', dest_en: 'Tin Shui Wai Station' },
  'K12': { orig: '大埔墟站', dest: '大埔八號花園', orig_en: 'Tai Po Market Station', dest_en: 'Eightland Gardens' },
  'K14': { orig: '大埔中心', dest: '大埔墟站', orig_en: 'Tai Po Centre', dest_en: 'Tai Po Market Station' },
  'K17': { orig: '大埔墟站', dest: '富善', orig_en: 'Tai Po Market Station', dest_en: 'Fu Shin' },
  'K18': { orig: '大埔墟站', dest: '廣福', orig_en: 'Tai Po Market Station', dest_en: 'Kwong Fuk' },
};

/* K75P 循環線 23 站（按實際行經順序：去程 D010-D080，回程 U011→U010→U020→…→U140）
   港鐵巴士 API 只回傳 busStopId（如 K75P-D010），不帶中文站名，故內建此表映射 */
const K75P_STOPS = [
  { id: 'D010', name: '天瑞' },
  { id: 'D020', name: '天水圍公園', fold: true },
  { id: 'D030', name: '天耀邨耀盛樓', fold: true },
  { id: 'D040', name: '輕鐵天耀站', fold: true },
  { id: 'D050', name: '天盛苑', fold: true },
  { id: 'D060', name: '石埗路', fold: true },
  { id: 'D070', name: '沙洲里村', fold: true },
  { id: 'D080', name: '廈村市', fold: true },
  { id: 'U011', name: '新屋村', fold: true },
  { id: 'U010', name: '李屋村', fold: true },
  { id: 'U020', name: '新生村', fold: true },
  { id: 'U030', name: '新李屋村', fold: true },
  { id: 'U040', name: '田心', fold: true },
  { id: 'U050', name: '鄉事委員會', fold: true },
  { id: 'U060', name: '輕鐵洪水橋站' },
  { id: 'U070', name: '洪水橋巴士廠' },
  { id: 'U080', name: '洪福邨' },
  { id: 'U090', name: '石埗村' },
  { id: 'U100', name: '天盛苑' },
  { id: 'U110', name: '天水圍警署' },
  { id: 'U120', name: '賞湖居' },
  { id: 'U130', name: '天水圍公園' },
  { id: 'U140', name: '天瑞' }
];

/* CORS proxy list – try each in order on failure */
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];
