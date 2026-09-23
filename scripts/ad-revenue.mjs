// Hypothetical planning inputs, not observed AdMob rates. Amounts are KRW.
const defaults = {
  jjigeuljido: { name: '찍을지도', bannerImpressions: 3, interstitialImpressions: 0.25 },
  'match-diary': { name: '직관일기', bannerImpressions: 3, interstitialImpressions: 0.15 },
  'vita-mango': { name: '비타망고', bannerImpressions: 3, interstitialImpressions: 0.4 },
};
const scenarios = { low: [200, 2000], base: [500, 5000], high: [1000, 10000] };
const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  return [key, value];
}));
const scenario = args.scenario ?? 'base';
if (!scenarios[scenario]) throw Error('scenario must be low, base or high');
const positive = (value, fallback, allowZero = false) => {
  const number = value === undefined ? fallback : Number(value);
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) throw Error('Invalid numeric input');
  return number;
};
const days = positive(args.days, 30);
const dau = positive(args.dau, 1000, true);
const target = positive(args.target, 1000000);
const bannerEcpm = positive(args['banner-ecpm'], scenarios[scenario][0], true);
const interstitialEcpm = positive(args['interstitial-ecpm'], scenarios[scenario][1], true);
const apps = args.app ? { [args.app]: defaults[args.app] } : defaults;
if (Object.values(apps).some(app => !app)) throw Error('Unknown app');
const results = Object.entries(apps).map(([key, app]) => {
  const bannerImpressions = positive(args['banner-impressions'], app.bannerImpressions, true);
  const interstitialImpressions = positive(args['interstitial-impressions'], app.interstitialImpressions, true);
  const bannerMonthlyPerDAU = days * bannerImpressions * bannerEcpm / 1000;
  const monthlyPerDAU = bannerMonthlyPerDAU + days * interstitialImpressions * interstitialEcpm / 1000;
  return { app: key, name: app.name, bannerImpressions, interstitialImpressions, monthlyPerDAU,
    monthlyRevenue: Number((monthlyPerDAU * dau).toFixed(2)),
    bannerOnlyRevenue: Number((bannerMonthlyPerDAU * dau).toFixed(2)),
    requiredDAU: monthlyPerDAU ? Math.ceil(target / monthlyPerDAU) : 'unreachable' };
});
console.log(JSON.stringify({ assumptions: { scenario, days, dau, target, bannerEcpm, interstitialEcpm }, results }, null, 2));
