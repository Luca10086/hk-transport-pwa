/* 森友出行手册 - 数据表与常量（零依赖，最先加载） */

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

/* Sushiro official queue API (no CORS header → must go through corsproxy.io) */
const SUSHIRO_STORE_API = 'https://sushipass.sushiro.com.hk/api/2.0/info/storelist?latitude=22&longitude=114&numresults=50&region=HK';
const SUSHIRO_PROXY = (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

/* HKO weather icon → description mapping */
const HKO_ICONS = {
  50: '阳光充沛', 51: '间有阳光', 52: '短暂阳光', 53: '间有阳光几阵骤雨', 54: '短暂阳光有骤雨',
  60: '多云', 61: '密云', 62: '微雨', 63: '雨', 64: '大雨', 65: '雷暴',
  70: '天色良好', 71: '天色良好', 72: '天色良好', 73: '天色良好', 74: '天色良好', 75: '天色良好',
  76: '大致多云', 77: '天色大致良好',
  80: '大风', 81: '干燥', 82: '潮湿', 83: '雾', 84: '薄雾', 85: '烟霞',
  90: '热', 91: '暖', 92: '凉', 93: '冷'
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
  AEL: '机场快线', TCL: '东涌线', TML: '屯马线', TKL: '将军澳线',
  EAL: '东铁线', SIL: '南港岛线', TWL: '荃湾线', ISL: '港岛线',
  KTL: '观塘线', DRL: '迪士尼线'
};

/* MTR 各线车站表（站码均经 getSchedule.php 实测验证） */
const MTR_LINE_STOPS = {
  TWL: [
    { code: 'TSW', name: '荃湾' }, { code: 'TWH', name: '大窝口' }, { code: 'KWH', name: '葵兴' },
    { code: 'KWF', name: '葵芳' }, { code: 'LAK', name: '荔景' }, { code: 'MEF', name: '美孚' },
    { code: 'LCK', name: '荔枝角' }, { code: 'CSW', name: '长沙湾' }, { code: 'SSP', name: '深水埗' },
    { code: 'PRE', name: '太子' }, { code: 'MOK', name: '旺角' }, { code: 'YMT', name: '油麻地' },
    { code: 'JOR', name: '佐敦' }, { code: 'TST', name: '尖沙咀' }, { code: 'ADM', name: '金钟' },
    { code: 'CEN', name: '中环' }
  ],
  ISL: [
    { code: 'KET', name: '坚尼地城' }, { code: 'HKU', name: '香港大学' }, { code: 'SYP', name: '西营盘' },
    { code: 'SHW', name: '上环' }, { code: 'CEN', name: '中环' }, { code: 'ADM', name: '金钟' },
    { code: 'WAC', name: '湾仔' }, { code: 'CAB', name: '铜锣湾' }, { code: 'TIH', name: '天后' },
    { code: 'FOH', name: '炮台山' }, { code: 'NOP', name: '北角' }, { code: 'QUB', name: '鲗鱼涌' },
    { code: 'TAK', name: '太古' }, { code: 'SWH', name: '西湾河' }, { code: 'SKW', name: '筲箕湾' },
    { code: 'HFC', name: '杏花邨' }, { code: 'CHW', name: '柴湾' }
  ],
  KTL: [
    { code: 'WHA', name: '黄埔' }, { code: 'HOM', name: '何文田' }, { code: 'YMT', name: '油麻地' },
    { code: 'MOK', name: '旺角' }, { code: 'PRE', name: '太子' }, { code: 'SKM', name: '石硖尾' },
    { code: 'KOT', name: '九龙塘' }, { code: 'LOF', name: '乐富' }, { code: 'WTS', name: '黄大仙' },
    { code: 'DIH', name: '钻石山' }, { code: 'CHH', name: '彩虹' }, { code: 'KOB', name: '九龙湾' },
    { code: 'NTK', name: '牛头角' }, { code: 'KWT', name: '观塘' }, { code: 'LAT', name: '蓝田' },
    { code: 'YAT', name: '油塘' }, { code: 'TIK', name: '调景岭' }
  ],
  TCL: [
    { code: 'HOK', name: '香港' }, { code: 'KOW', name: '九龙' }, { code: 'OLY', name: '奥运' },
    { code: 'NAC', name: '南昌' }, { code: 'LAK', name: '荔景' }, { code: 'TSY', name: '青衣' },
    { code: 'SUN', name: '欣澳' }, { code: 'TUC', name: '东涌' }
  ],
  TKL: [
    { code: 'NOP', name: '北角' }, { code: 'QUB', name: '鲗鱼涌' }, { code: 'YAT', name: '油塘' },
    { code: 'TIK', name: '调景岭' }, { code: 'TKO', name: '将军澳' }, { code: 'HAH', name: '坑口' },
    { code: 'POA', name: '宝琳' }, { code: 'LHP', name: '康城' }
  ],
  EAL: [
    { code: 'LMC', name: '落马洲' }, { code: 'LOW', name: '罗湖' }, { code: 'SHS', name: '上水' },
    { code: 'FAN', name: '粉岭' }, { code: 'TWO', name: '太和' }, { code: 'TAP', name: '大埔墟' },
    { code: 'UNI', name: '大学' }, { code: 'RAC', name: '马场' }, { code: 'FOT', name: '火炭' },
    { code: 'SHT', name: '沙田' }, { code: 'TAW', name: '大围' }, { code: 'KOT', name: '九龙塘' },
    { code: 'MKK', name: '旺角东' }, { code: 'HUH', name: '红磡' }, { code: 'ADM', name: '金钟' },
    { code: 'EXC', name: '会展' }
  ],
  TML: [
    { code: 'TUM', name: '屯门' }, { code: 'SIH', name: '兆康' }, { code: 'TIS', name: '天水围' },
    { code: 'LOP', name: '朗屏' }, { code: 'YUL', name: '元朗' }, { code: 'KSR', name: '锦上路' },
    { code: 'TWW', name: '荃湾西' }, { code: 'MEF', name: '美孚' }, { code: 'NAC', name: '南昌' },
    { code: 'AUS', name: '柯士甸' }, { code: 'ETS', name: '尖东' }, { code: 'HUH', name: '红磡' },
    { code: 'HOM', name: '何文田' }, { code: 'TKW', name: '土瓜湾' }, { code: 'SUW', name: '宋皇台' },
    { code: 'KAT', name: '启德' }, { code: 'DIH', name: '钻石山' }, { code: 'HIK', name: '显径' },
    { code: 'TAW', name: '大围' }, { code: 'CKT', name: '车公庙' }, { code: 'SHM', name: '石门' },
    { code: 'CIO', name: '第一城' }, { code: 'STW', name: '沙田围' }, { code: 'TSH', name: '大水坑' },
    { code: 'HEO', name: '恒安' }, { code: 'MOS', name: '马鞍山' }, { code: 'WKS', name: '乌溪沙' }
  ],
  SIL: [
    { code: 'ADM', name: '金钟' }, { code: 'OCP', name: '海洋公园' }, { code: 'WCH', name: '黄竹坑' },
    { code: 'LET', name: '利东' }, { code: 'SOH', name: '海怡半岛' }
  ],
  DRL: [
    { code: 'SUN', name: '欣澳' }, { code: 'DIS', name: '迪士尼' }
  ],
  AEL: [
    { code: 'HOK', name: '香港' }, { code: 'KOW', name: '九龙' }, { code: 'TSY', name: '青衣' },
    { code: 'AIR', name: '机场' }, { code: 'AWE', name: '博览馆' }
  ]
};

/* MTR 站码 → 中文站名（用于方向终点显示） */
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
  'K52': { orig: '屯门站', dest: '龙鼓滩', orig_en: 'Tuen Mun Station', dest_en: 'Lung Kwu Tan' },
  'K53': { orig: '屯门站', dest: '扫管笏', orig_en: 'Tuen Mun Station', dest_en: 'So Kwun Wat' },
  'K58': { orig: '富泰', dest: '青山湾', orig_en: 'Fu Tai', dest_en: 'Castle Peak Bay' },
  'K65': { orig: '元朗站', dest: '流浮山', orig_en: 'Yuen Long Station', dest_en: 'Lau Fau Shan' },
  'K66': { orig: '大棠', dest: '朗屏', orig_en: 'Tai Tong', dest_en: 'Long Ping' },
  'K68': { orig: '元朗公园', dest: '元朗站(循环线)', orig_en: 'Yuen Long Park', dest_en: 'Yuen Long Station (Circular)' },
  'K73': { orig: '天恒', dest: '元朗西', orig_en: 'Tin Heng', dest_en: 'Yuen Long West' },
  'K74': { orig: '天瑞', dest: '凹头(循环线)', orig_en: 'Tin Shui', dest_en: 'Au Tau (Circular)' },
  'K75': { orig: '天水围站', dest: '洪水桥(循环线)', orig_en: 'Tin Shui Wai Station', dest_en: 'Hung Shui Kiu (Circular)' },
  'K76': { orig: '天恒', dest: '天水围站', orig_en: 'Tin Heng', dest_en: 'Tin Shui Wai Station' },
  'K12': { orig: '大埔墟站', dest: '大埔八号花园', orig_en: 'Tai Po Market Station', dest_en: 'Eightland Gardens' },
  'K14': { orig: '大埔中心', dest: '大埔墟站', orig_en: 'Tai Po Centre', dest_en: 'Tai Po Market Station' },
  'K17': { orig: '大埔墟站', dest: '富善', orig_en: 'Tai Po Market Station', dest_en: 'Fu Shin' },
  'K18': { orig: '大埔墟站', dest: '广福', orig_en: 'Tai Po Market Station', dest_en: 'Kwong Fuk' },
};

/* CORS proxy list – try each in order on failure */
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];
