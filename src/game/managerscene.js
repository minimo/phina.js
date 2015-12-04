
phina.namespace(function() {

  /**
   * @class phina.game.ManagerScene
   * 
   */
  phina.define('phina.game.ManagerScene', {
    superClass: 'phina.app.Scene',
    /**
     * @constructor
     */
    init: function(params) {
      this.superInit();

      this.setScenes(params.scenes);

      this.on("enter", function() {
        this.gotoScene(params.startLabel || 0);
      }.bind(this));

      this.on("resume", this.onnext.bind(this));

      this.commonArguments = {};
    },


    /**
     * scenes をセット
     */
    setScenes: function(scenes) {
      this.scenes = scenes;
      this.sceneIndex = 0;

      return this;
    },

    /**
     * index(or label) のシーンへ飛ぶ
     */
    gotoScene: function(index, args) {
      index = (typeof index == 'string') ? this.labelToIndex(index) : index||0;

      // イベント発火

      this.flare('prepare');

      var data = this.scenes[index];
      var klass = phina.using(data.className);
      var initArguments = data.arguments;
      var initArguments = {}.$extend(initArguments, args);
      var scene = klass.call(null, initArguments);
      if (!scene.nextLabel) {
          scene.nextLabel = data.nextLabel;
      }
      if (!scene.nextArguments) {
          scene.nextArguments = data.nextArguments;
      }
      this.app.pushScene(scene);

      this.sceneIndex = index;
      this.currentScene = scene;

      // イベント発火
      this.flare('goto', {
        scene: scene,
      });

      return this;
    },

    /**
     * 次のシーンへ飛ぶ
     */
    gotoNext: function(args) {
      var data = this.scenes[this.sceneIndex];
      var nextIndex = null;

      // 次のラベルが設定されていた場合
      if (data.nextLabel) {
          nextIndex = this.labelToIndex(data.nextLabel);
      }
      // 次のシーンに遷移
      else if (this.sceneIndex+1 < this.scenes.length) {
          nextIndex = this.sceneIndex+1;
      }

      if (nextIndex !== null) {
          this.gotoScene(nextIndex, args);
      }
      else {
          this.flare("finish");
      }

      return this;
    },

    /**
     * シーンインデックスを取得
     */
    getCurrentIndex: function() {
      return this.sceneIndex;
    },

    /**
     * シーンラベルを取得
     */
    getCurrentLabel: function() {
      return this.scenes[this.sceneIndex].label;
    },

    /**
     * ラベルからインデックスに変換
     */
    labelToIndex: function(label) {
      var data = this.scenes.filter(function(data) {
        return data.label == label;
      })[0];

      return this.scenes.indexOf(data);
    },

    /**
     * インデックスからラベルに変換
     */
    indexToLabel: function(index) {
      return this.scenes[index].label;
    },

    onnext: function(e) {
      var nextLabel = e.prevScene.nextLabel;
      var nextArguments = e.prevScene.nextArguments;
      if (nextLabel) {
        this.gotoScene(nextLabel, nextArguments);
      }
      else {
        this.gotoNext(nextArguments);
      }
    },

  });

});
