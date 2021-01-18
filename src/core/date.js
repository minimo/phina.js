/**
 * @class global.Date
 * # 拡張した Date クラス
 * 日付を扱う Date クラスを拡張しています。
 */
import { padding } from "./string";

var MONTH = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

var WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * @method format
 * 指定したフォーマットに従って日付を文字列化します。
 *
 * <table border="1">
 *   <tr><td>変換指定文字列</td><td>意味</td></tr>
 *   <tr><td>yyyy</td><td>西暦年（4桁）</td></tr>
 *   <tr><td>yy</td><td>西暦年（2桁）</td></tr>
 *   <tr><td>y</td><td>西暦年</td></tr>
 *   <tr><td>MMMM</td><td>月（英語名）</td></tr>
 *   <tr><td>MMM</td><td>月（英語省略名）</td></tr>
 *   <tr><td>MM</td><td>月（2桁数字）</td></tr>
 *   <tr><td>M</td><td>月</td></tr>
 *   <tr><td>dd</td><td>日（2桁）</td></tr>
 *   <tr><td>d</td><td>日</td></tr>
 *   <tr><td>EEEE</td><td>曜日（英語名）</td></tr>
 *   <tr><td>EEE</td><td>曜日（英語省略名）</td></tr>
 *   <tr><td>HH</td><td>時（24時間表記・2桁）</td></tr>
 *   <tr><td>H</td><td>時（24時間表記）</td></tr>
 *   <tr><td>mm</td><td>分（2桁）</td></tr>
 *   <tr><td>m</td><td>分</td></tr>
 *   <tr><td>ss</td><td>秒（2桁）</td></tr>
 *   <tr><td>s</td><td>秒</td></tr>
 * </table>
 * 桁数が指定されているものは0パディングされます。
 *
 * ### Example
 *     (new Date()).format("yyyy-MM-dd(EEE)"); // => "2016-04-05(Tue)" など
 *
 * @this Date
 * @param {String} pattern フォーマット文字列
 * @return {String} フォーマット文字列に従って生成された文字列
 */
export function format(pattern) {
// Date.prototype.$method('format', function(pattern) {
  var year    = this.getFullYear();
  var month   = this.getMonth();
  var date    = this.getDate();
  var day     = this.getDay();
  var hours   = this.getHours();
  var minutes = this.getMinutes();
  var seconds = this.getSeconds();
  var millseconds = this.getMilliseconds();
  
  var patterns = {
    'yyyy': padding.call(String(year), 4, '0'),
    // 'yyyy': String(year).padding(4, '0'),
    'yy': year.toString().substr(2, 2),
    'y': year,

    'MMMM': MONTH[month],
    'MMM': MONTH[month].substr(0, 3),
    'MM': padding.call(String(month+1), 2, '0'),
    // 'MM': String(month+1).padding(2, '0'),
    'M': (month+1),

    'dd': padding.call(String(date), 2, '0'),
    // 'dd': String(date).padding(2, '0'),
    'd': date,

    'EEEE': WEEK[day],
    'EEE': WEEK[day].substr(0, 3),

    'HH': padding.call(String(hours), 2, '0'),
    // 'HH': String(hours).padding(2, '0'),
    'H': hours,

    'mm': padding.call(String(minutes), 2, '0'),
    // 'mm': String(minutes).padding(2, '0'),
    'm': minutes,

    'ss': padding.call(String(seconds), 2, '0'),
    // 'ss': String(seconds).padding(2, '0'),
    's': seconds,
    
    // // date
    // 'd': String('00' + date).slice(-2),
    // 'D': WEEK[day].substr(0, 3),
    // 'j': date,
    // 'l': WEEK[day],
    
    // // month
    // 'm': String('00' + (month+1)).slice(-2),
    // 'M': MONTH[month].substr(0, 3),
    // 'n': (month+1),
    // 'F': MONTH[month],
    
    // // year
    // 'y': year.toString().substr(2, 2),
    // 'Y': year,
    
    // // time
    // 'G': hours,
    // 'H': String('00' + hours).slice(-2),
    // 'i': String('00' + minutes).slice(-2),
    // 's': String('00' + seconds).slice(-2),
    // 'S': String('000' + millseconds).slice(-3),
  };

  var regstr = '(' + Object.keys(patterns).join('|') + ')';
  var re = new RegExp(regstr, 'g');

  return pattern.replace(re, function(str) {
    return patterns[str];
  });
}
