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


/* Sushiro 分店快照（離線兜底；由 tools/update-sushiro-snapshot.mjs 生成） */
const SUSHIRO_SNAPSHOT_AT = "2026-09-06 21:01";
const SUSHIRO_SNAPSHOT = [{"id":34,"name":"香港仔利港商場店","area":"南區","address":"香港香港仔成都道38號利港商場3樓301號舖","wait":0,"waitingGroup":0,"storeStatus":"OPEN","latitude":22.2491,"longitude":114.1549},{"id":8,"name":"上環店","area":"中西區","address":"香港上環德輔道中199號無限極廣場2樓201號舖","wait":35,"waitingGroup":35,"storeStatus":"OPEN","latitude":22.2864,"longitude":114.1535},{"id":18,"name":"銅鑼灣廣場2期店","area":"灣仔區","address":"香港銅鑼灣駱克道463-483號銅鑼灣廣場2期3樓3A號舖","wait":45,"waitingGroup":28,"storeStatus":"OPEN","latitude":22.2805,"longitude":114.1821},{"id":14,"name":"佐敦薈店","area":"油尖旺區","address":"香港油尖旺九龍佐敦彌敦道233-239號佐敦薈1樓","wait":20,"waitingGroup":22,"storeStatus":"OPEN","latitude":22.305,"longitude":114.1715},{"id":22,"name":"尖沙咀加連威老道店","area":"油尖旺區","address":"九龍尖沙咀加連威老道2-6號愛賓商業大廈地下G2, G3 & 103號舖","wait":25,"waitingGroup":29,"storeStatus":"OPEN","latitude":22.2996,"longitude":114.1726},{"id":2,"name":"黃埔享膳坊店","area":"九龍城區","address":"黃埔天地享膳坊地下G10號舖  ","wait":40,"waitingGroup":17,"storeStatus":"OPEN","latitude":22.3036,"longitude":114.1883},{"id":10,"name":"旺角店","area":"油尖旺區","address":"香港九龍旺角彌敦道628號瓊華中心地庫 ","wait":50,"waitingGroup":60,"storeStatus":"OPEN","latitude":22.3177,"longitude":114.17},{"id":19,"name":"鰂魚涌店","area":"東區","address":"香港鰂魚涌英皇道1060號栢惠苑購物商場UG樓B號舖","wait":10,"waitingGroup":10,"storeStatus":"OPEN","latitude":22.2845,"longitude":114.2131},{"id":30,"name":"奧海城 2 期店","area":"九龍城區","address":"九龍旺角西海庭道18號奧海城2期1樓146C-146D號舖","wait":5,"waitingGroup":2,"storeStatus":"OPEN","latitude":22.3168,"longitude":114.1616},{"id":37,"name":"北角匯2期店","area":"東區","address":"香港北角渣華道123號北角匯2期1樓110-112號舖 ","wait":15,"waitingGroup":9,"storeStatus":"OPEN","latitude":22.2927,"longitude":114.2012},{"id":43,"name":"黃埔時尚坊店","area":"九龍城區","address":"九龍紅磡黃埔天地時尚坊(第二期)地下G42-G43號舖","wait":25,"waitingGroup":11,"storeStatus":"OPEN","latitude":22.3049,"longitude":114.1888},{"id":27,"name":"旺角東Moko店","area":"油尖旺區","address":"九龍旺角太子道西193號MOKO新世紀廣場3樓350-351號舖","wait":0,"waitingGroup":0,"storeStatus":"OPEN","latitude":22.3233,"longitude":114.1723},{"id":29,"name":"南昌V-Walk店","area":"深水埗區","address":"九龍深水埗深旺道28號V Walk 2樓138AB號舖","wait":35,"waitingGroup":39,"storeStatus":"OPEN","latitude":22.3266,"longitude":114.1544},{"id":3,"name":"荔枝角店","area":"深水埗區","address":"長沙灣道680號麗新商業中心G樓G38號舖","wait":15,"waitingGroup":16,"storeStatus":"OPEN","latitude":22.3392,"longitude":114.152},{"id":32,"name":"油塘店","area":"觀塘區","address":"九龍油塘高超道38號大本型3樓311號舖","wait":10,"waitingGroup":6,"storeStatus":"OPEN","latitude":22.2967,"longitude":114.239},{"id":33,"name":"青衣城1期店","area":"葵青區","address":"新界青衣青敬路31-33號青衣城1期2樓211號舖","wait":0,"waitingGroup":0,"storeStatus":"OPEN","latitude":22.3589,"longitude":114.1084},{"id":36,"name":"啟德零售館2店","area":"九龍城區","address":"九龍啟德承啟道38-39號啟德體育園啟德零售館2, 3樓M2-302號舖","wait":30,"waitingGroup":35,"storeStatus":"OPEN","latitude":22.3262,"longitude":114.1958},{"id":5,"name":"樂富店","area":"黃大仙區","address":"香港九龍聯合道198號樂富廣場UG1樓L109號舖","wait":0,"waitingGroup":0,"storeStatus":"OPEN","latitude":22.3387,"longitude":114.1869},{"id":6,"name":"藍田店","area":"觀塘區","address":"香港九龍藍田啓田道50號啓田商場2樓208號舖","wait":10,"waitingGroup":8,"storeStatus":"OPEN","latitude":22.3083,"longitude":114.2352},{"id":12,"name":"葵芳店","area":"葵青區","address":"香港新界葵芳興芳路223號新都會廣場1樓176-177號舖","wait":75,"waitingGroup":92,"storeStatus":"OPEN","latitude":22.3571,"longitude":114.1268},{"id":21,"name":"新蒲崗Mikiki店","area":"黃大仙區","address":"九龍新蒲崗太子道東638號Mikiki 1樓110號舖","wait":15,"waitingGroup":14,"storeStatus":"OPEN","latitude":22.3333,"longitude":114.1961},{"id":31,"name":"觀塘店","area":"觀塘區","address":"九龍觀塘開源道64號源成中心1樓","wait":10,"waitingGroup":3,"storeStatus":"OPEN","latitude":22.311,"longitude":114.2254},{"id":38,"name":"九龍灣德福廣場2期店","area":"觀塘區","address":"九龍九龍灣偉業街33號德福廣場二期6樓615號舖","wait":10,"waitingGroup":11,"storeStatus":"OPEN","latitude":22.3207,"longitude":114.2135},{"id":44,"name":"九龍灣淘大店","area":"觀塘區","address":"九龍九龍灣牛頭角道77號淘大商場1期2樓S150號舖","wait":20,"waitingGroup":8,"storeStatus":"OPEN","latitude":22.3247,"longitude":114.2163},{"id":4,"name":"黃大仙店","area":"黃大仙區","address":"香港九龍黃大仙龍翔道110號豪苑G3/F翔盈里5號舖","wait":25,"waitingGroup":22,"storeStatus":"OPEN","latitude":22.342,"longitude":114.1969},{"id":16,"name":"荃灣廣場店","area":"荃灣區","address":"香港荃灣區新界荃灣大壩街4-30號荃灣廣場第3層301-302號鋪","wait":0,"waitingGroup":0,"storeStatus":"OPEN","latitude":22.3712,"longitude":114.1111},{"id":25,"name":"荃灣綠楊店","area":"荃灣區","address":"新界荃灣蕙荃路22-66號綠楊坊2樓S20-23號舖","wait":35,"waitingGroup":15,"storeStatus":"OPEN","latitude":22.3729,"longitude":114.1192},{"id":45,"name":"康城店","area":"西貢區","address":"新界將軍澳康城路1號The LOHAS康城4樓406C號舖","wait":125,"waitingGroup":134,"storeStatus":"OPEN","latitude":22.2968,"longitude":114.2692},{"id":7,"name":"屯門市廣場店","area":"屯門區","address":"香港新界屯門屯順街1號屯門市廣場1期2樓2192, 2193A及2193B號舖","wait":25,"waitingGroup":27,"storeStatus":"OPEN","latitude":22.3932,"longitude":113.9772},{"id":26,"name":"將軍澳廣場店","area":"西貢區","address":"新界西貢將軍澳唐德街1號將軍澳廣場2樓2012-2017號舖","wait":25,"waitingGroup":24,"storeStatus":"OPEN","latitude":22.3083,"longitude":114.2628},{"id":28,"name":"屯門華都店","area":"屯門區","address":"新界屯門屯利街1號華都大道3樓2C&2D號舖","wait":20,"waitingGroup":19,"storeStatus":"OPEN","latitude":22.3918,"longitude":113.9781},{"id":11,"name":"坑口店","area":"西貢區","address":"香港新界將軍澳常寧路2號TKO Gateway西翼1樓W101A號舖","wait":20,"waitingGroup":23,"storeStatus":"OPEN","latitude":22.3171,"longitude":114.2643},{"id":15,"name":"寶琳店","area":"西貢區","address":"香港西貢區新界西貢將軍澳貿業路8號新都城三期2樓201-202號舖","wait":20,"waitingGroup":18,"storeStatus":"OPEN","latitude":22.3228,"longitude":114.2568},{"id":35,"name":"沙田新城市廣場3期店","area":"沙田區","address":"新界沙田沙田正街2-8號新城市廣場3期1樓A101號舖","wait":115,"waitingGroup":55,"storeStatus":"OPEN","latitude":22.3807,"longitude":114.1875},{"id":42,"name":"沙田中心店","area":"沙田區","address":"新界沙田橫壆街2-16號沙田中心3樓32A及69A號舖","wait":40,"waitingGroup":44,"storeStatus":"OPEN","latitude":22.3824,"longitude":114.1907},{"id":23,"name":"禾輋店","area":"沙田區","address":"新界沙田德厚街3號禾輋廣場2樓227號舖","wait":10,"waitingGroup":10,"storeStatus":"OPEN","latitude":22.3884,"longitude":114.1948},{"id":40,"name":"元朗千色匯店","area":"元朗區","address":"新界元朗教育路1號元朗千色匯2樓1號舖","wait":10,"waitingGroup":9,"storeStatus":"OPEN","latitude":22.4428,"longitude":114.0285},{"id":17,"name":"元朗廣場店","area":"元朗區","address":"香港元朗區新界元朗青山公路249-251號元朗廣場3樓341-348號舖","wait":20,"waitingGroup":21,"storeStatus":"OPEN","latitude":22.4448,"longitude":114.0237},{"id":13,"name":"天水圍 T Town店","area":"元朗區","address":"香港新界天水圍天華路30號T Town South地下SG17號舖","wait":45,"waitingGroup":46,"storeStatus":"OPEN","latitude":22.4615,"longitude":113.9975},{"id":9,"name":"大埔店","area":"大埔區","address":"香港大埔安邦路8及10號大埔超級城B區1樓128號舖","wait":5,"waitingGroup":4,"storeStatus":"OPEN","latitude":22.4514,"longitude":114.1702},{"id":20,"name":"馬鞍山店","area":"沙田區","address":"新界馬鞍山鞍祿街18號新港城中心四期3樓3231-32號舖","wait":75,"waitingGroup":65,"storeStatus":"OPEN","latitude":22.4239,"longitude":114.2313},{"id":39,"name":"太和廣場店","area":"大埔區","address":"新界大埔太和路12號太和廣場西翼2樓225-226號舖","wait":0,"waitingGroup":0,"storeStatus":"OPEN","latitude":22.4513,"longitude":114.1617},{"id":24,"name":"上水匯店","area":"北區","address":" 新界上水石湖墟龍琛路48號上水匯1樓103A, 103B & 104號舖","wait":10,"waitingGroup":8,"storeStatus":"OPEN","latitude":22.5031,"longitude":114.1279},{"id":41,"name":"粉嶺中心店","area":"北區","address":"新界粉嶺新運路33號粉嶺中心購物商場地下130及130A號舖","wait":45,"waitingGroup":20,"storeStatus":"OPEN","latitude":22.4911,"longitude":114.141}];

/* K75P 站點座標（GPS 定位標準的靜態基準；tools/geocode-k75p-stops.mjs 生成） */
const K75P_STOP_COORDS = {"D010":{"lat":22.45595,"lng":113.99793,"name":"天瑞"},"D020":{"lat":22.4567,"lng":114.00121,"name":"天水圍公園"},"D030":{"lat":22.45229,"lng":114.00228,"name":"天耀邨耀盛樓"},"D040":{"lat":22.44982,"lng":114.00296,"name":"輕鐵天耀站"},"D050":{"lat":22.44835,"lng":114.0016,"name":"天盛苑"},"D060":{"lat":22.44665,"lng":113.99826,"name":"石埗路"},"D070":{"lat":22.44705,"lng":113.99532,"name":"沙洲里村"},"D080":{"lat":22.44745,"lng":113.99238,"name":"廈村市"},"U011":{"lat":22.44505,"lng":113.99233,"name":"新屋村"},"U010":{"lat":22.44358,"lng":113.99136,"name":"李屋村"},"U020":{"lat":22.44009,"lng":113.99071,"name":"新生村"},"U030":{"lat":22.43641,"lng":113.99285,"name":"新李屋村"},"U040":{"lat":22.43153,"lng":113.9923,"name":"田心"},"U050":{"lat":22.4327,"lng":113.99509,"name":"鄉事委員會"},"U060":{"lat":22.43387,"lng":113.99788,"name":"輕鐵洪水橋站"},"U070":{"lat":22.43624,"lng":113.99978,"name":"洪水橋巴士廠"},"U080":{"lat":22.43756,"lng":113.99773,"name":"洪福邨"},"U090":{"lat":22.44035,"lng":113.99839,"name":"石埗村"},"U100":{"lat":22.44835,"lng":114.0016,"name":"天盛苑"},"U110":{"lat":22.45023,"lng":114.0025,"name":"天水圍警署"},"U120":{"lat":22.45264,"lng":114.00239,"name":"賞湖居"},"U130":{"lat":22.4567,"lng":114.00121,"name":"天水圍公園"},"U140":{"lat":22.45595,"lng":113.99793,"name":"天瑞"}};
