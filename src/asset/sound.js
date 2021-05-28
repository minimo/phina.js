import phina from "../phina";
import { Asset } from "./asset";
import { Support } from "../util/support";

/**
 * @class phina.asset.Sound
 * _extends phina.asset.Asset
 */
export class Sound extends Asset {

  /**
   * @constructor
   */
  constructor() {
    super();
    this._loop = false
    this._loopStart = 0
    this._loopEnd = 0
    this._playbackRate = 1
    this.context = Sound.getAudioContext();
    this.gainNode = this.context.createGain();

    /** @type {(AudioBufferSourceNode | OscillatorNode)?} */
    this.source;

    /** @type {string} */
    this.src;
  }

  /**
   * 音源を再生
   * 音源終了時に"ended"イベントを発生
   * 
   * @param {number} [when=0] 指定の秒数、再生を遅らせる
   * @param {number} [offset=0] 音源のどの時間位置で再生するかを秒数指定
   * @param {number} [duration] 再生時間を秒数指定
   * @returns {this}
   */
  play(when, offset, duration) {
    when = when ? when + this.context.currentTime : 0;
    offset = offset || 0;

    if (this.source) {
      // TODO: キャッシュする？
    }

    var source = this.source = this.context.createBufferSource();
    var buffer = source.buffer = this.buffer;
    source.loop = this._loop;
    source.loopStart = this._loopStart;
    source.loopEnd = this._loopEnd;
    source.playbackRate.value = this._playbackRate;

    // connect
    source.connect(this.gainNode);
    this.gainNode.connect(Sound.getMasterGain());

    // play
    if (duration !== undefined) {
      source.start(when, offset, duration);
    }
    else {
      source.start(when, offset);
    }

    // check play end
    source.addEventListener('ended', function(){
      this.flare('ended');
    }.bind(this));

    return this;
  }

  /**
   * 再生を停止（再生中でなかった時は何もしない）  
   * 再生中だった場合、同時に"stop", "ended"イベントを発火する
   * 
   * @returns {this}
   */
  stop() {
    if (this.source) {
      // stop すると source.endedも発火する
      this.source.stop && this.source.stop(0);
      this.source = null;
      this.flare('stop');
    }

    return this;
  }

  /**
   * 再生を一時停止
   * 同時に"pause"イベントを発火する
   * 
   * @returns {this}
   */
  pause() {
    /** @type {AudioBufferSourceNode} */
    (this.source).playbackRate.value = 0;
    this.flare('pause');
    return this;
  }

  /**
   * 再生を再開
   * 同時に"resume"イベントを発火する
   * 
   * @returns {this}
   */
  resume() {
    /** @type {AudioBufferSourceNode} */
    (this.source).playbackRate.value = this._playbackRate;
    this.flare('resume');
    return this;
  }

  /**
   * @private
   * 未実装
   * 
   * @param {*} type 
   */
  _oscillator(type) {
    var context = this.context;

    var oscillator = context.createOscillator();

    // Sine wave is type = “sine”
    // Square wave is type = “square”
    // Sawtooth wave is type = “saw”
    // Triangle wave is type = “triangle”
    // Custom wave is type = “custom” 
    oscillator.type = type || 'sine';

    this.source = oscillator;
    // connect
    this.source.connect(context.destination);
  }

  /**
   * AudioBufferからロード
   * 
   * @param {AudioBuffer} [buffer] 
   */
  loadFromBuffer(buffer) {
    var context = this.context;

    // set default buffer
    if (!buffer) {
      buffer = context.createBuffer( 1, 44100, 44100 );
      var channel = buffer.getChannelData(0);

      for( var i=0; i < channel.length; i++ )
      {
        channel[i] = Math.sin( i / 100 * Math.PI);
      }
    }

    // source
    this.buffer = buffer;
  }

  /**
   * ループ設定
   * 
   * @param {boolean} loop
   * @returns {this}
   */
  setLoop(loop) {
    this.loop = loop;
    return this;
  }

  /**
   * ループ開始位置を秒数で設定
   * 
   * @param {number} loopStart
   * @returns {this}
   */
  setLoopStart(loopStart) {
    this.loopStart = loopStart;
    return this;
  }

  /**
   * ループ終了位置を秒数で設定
   * 
   * @param {number} loopEnd
   * @returns {this}
   */
  setLoopEnd(loopEnd) {
    this.loopEnd = loopEnd;
    return this;
  }
  
  /**
   * 再生速度を設定
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate
   * 
   * @param {number} playbackRate
   * @returns {this}
   */
  setPlaybackRate(playbackRate) {
    this.playbackRate = playbackRate;
    return this;
  }

  /**
   * @override
   * @param {(...args: any) => any} r
   */
  _load(r) {
    if (/^data:/.test(this.src)) {
      this._loadFromURIScheme(r);
    }
    else {
      this._loadFromFile(r);
    }
  }

  /**
   * @private
   * @param {(...args: any) => any} r
   */
  _loadFromFile(r) {
    var self = this;

    var xml = new XMLHttpRequest();
    xml.open('GET', this.src);
    xml.onreadystatechange = function() {
      if (xml.readyState === 4) {
        if ([200, 201, 0].indexOf(xml.status) !== -1) {

          // 音楽バイナリーデータ
          var data = xml.response;

          // webaudio 用に変換
          self.context.decodeAudioData(data, function(buffer) {
            self.loadFromBuffer(buffer);
            r(self);
          }, function() {
            console.warn("音声ファイルのデコードに失敗しました。(" + self.src + ")");
            r(self);
            self.flare('decodeerror');
          });

        } else if (xml.status === 404) {
          // not found

          self.loadError = true;
          self.notFound= true;
          r(self);
          self.flare('loaderror');
          self.flare('notfound');

        } else {
          // サーバーエラー

          self.loadError = true;
          self.serverError = true;
          r(self);
          self.flare('loaderror');
          self.flare('servererror');
        }
      }
    };

    xml.responseType = 'arraybuffer';

    xml.send(null);
  }

  /**
   * @private
   * @param {(...args: any) => any} r
   */
  _loadFromURIScheme(r) {
    var byteString = '';
    if (this.src.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(this.src.split(',')[1]);
    }
    else {
      byteString = unescape(this.src.split(',')[1]);
    }

    var self = this;
    var len = byteString.length;
    var buffer = new Uint8Array(len);

    for (var i=0; i<len; ++i) {
      buffer[i] = byteString.charCodeAt(i);
    }

    // webaudio 用に変換
    this.context.decodeAudioData(buffer.buffer, function(buffer) {
      self.loadFromBuffer(buffer);
      r(self);
    }, function() {
      console.warn("音声ファイルのデコードに失敗しました。(" + self.src + ")");
      self.loaded = true;
      r(self);
    });
  }

  /**
   * @override
   * ダミーバッファをロード
   */
  loadDummy() {
    this.loadFromBuffer();
  }

  /**
   * 音量
   */
  get volume()  { return this.gainNode.gain.value; }
  set volume(v) { this.gainNode.gain.value = v; }

  /**
   * ループ設定
   */
  get loop()  { return this._loop; }
  set loop(v) {
    this._loop = v;
  }

  /**
   * ループ開始時間位置(second)
   */
  get loopStart()  { return this._loopStart; }
  set loopStart(v) {
    this._loopStart = v;
  }

  /**
   * ループ終了時間位置(second)
   */
  get loopEnd()  { return this._loopEnd; }
  set loopEnd(v) {
    this._loopEnd = v;
  }

  /**
   * 再生速度
   */
  get playbackRate() { return this._playbackRate; }
  set playbackRate(v) {
    this._playbackRate = v;
    this.source = /** @type {AudioBufferSourceNode} */(this.source);
    if (this.source && this.source.playbackRate.value !== 0) {
      this.source.playbackRate.value = v;
    }
  }

  /**
   * マスターのゲインノードを返します。  
   * GainNodeが未生成の場合は生成して返します。
   * @returns {GainNode}
   */
  static getMasterGain() {
    if(!this._masterGain) {
      var context = this.getAudioContext();
      this._masterGain = context.createGain();
      this._masterGain.connect(context.destination);
    }
    return this._masterGain;
  }

  /**
   * WebAudioのコンテキストを生成して返します。  
   * すでに生成済みの場合はそれを返します。  
   * WebAudio未サポートの場合はnullを返します。
   * @returns {AudioContext | null}
   */
  static getAudioContext() {
    if (!Support.webAudio) return null;

    if (this.context) return this.context;

    var g = phina.global;
    var context = null;

    if (g.AudioContext) {
      context = new AudioContext();
    }
    else if (g['webkitAudioContext']) {
      context = new g['webkitAudioContext']();
    }
    else if (g['mozAudioContext']) {
      context = new g['mozAudioContext']();
    }

    this.context = context;

    return context;
  }

  /**
   * マスター音量を取得
   */
  static get volume() {
    return this.getMasterGain().gain.value;
  }

  /**
   * マスター音量をセット
   * @param {number} v
   */
  static set volume(v) {
    this.getMasterGain().gain.value = v;
  }
}

/**
 * WebAudioコンテキスト
 * @type {AudioContext}
 */
Sound.context;
