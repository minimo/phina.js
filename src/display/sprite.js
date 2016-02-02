
phina.namespace(function() {

  /**
   * @class phina.display.Sprite
   * 
   */
  phina.define('phina.display.Sprite', {
    superClass: 'phina.display.DisplayElement',

    init: function(image, width, height) {
      this.superInit();

      if (typeof image === 'string') {
        image = phina.asset.AssetManager.get('image', image);
      }
      
      this.image = image;
      this.width = width || this.image.domElement.width;
      this.height = height || this.image.domElement.height;
      this._frameIndex = 0;

      this._frameTrimX = 0;
      this._frameTrimY = 0;
      this._frameTrimW = this.image.domElement.width;
      this._frameTrimH = this.image.domElement.height;

      this.srcRect = {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      };
    },

    draw: function(canvas) {
      var image = this.image.domElement;


      // canvas.context.drawImage(image,
      //   0, 0, image.width, image.height,
      //   -this.width*this.origin.x, -this.height*this.origin.y, this.width, this.height
      //   );

      var srcRect = this.srcRect;
      canvas.context.drawImage(image,
        srcRect.x, srcRect.y, srcRect.width, srcRect.height,
        -this.width*this.originX, -this.height*this.originY, this.width, this.height
        );
    },

    setFrameIndex: function(index, width, height) {
      var sx = this._frameTrimX || 0;
      var sy = this._frameTrimY || 0;
      var sw = this._frameTrimW || (this.image.domElement.width-sx);
      var sh = this._frameTrimH || (this.image.domElement.height-sy);

      var tw  = width || this.width;      // tw
      var th  = height || this.height;    // th
      var row = ~~(sw / tw);
      var col = ~~(sh / th);
      var maxIndex = row*col;
      index = index%maxIndex;
      
      var x   = index%row;
      var y   = ~~(index/row);
      this.srcRect.x = sx+x*tw;
      this.srcRect.y = sy+y*th;
      this.srcRect.width  = tw;
      this.srcRect.height = th;

      this._frameIndex = index;

      return this;
    },

    setFrameTrimming: function(x, y, width, height) {
      this._frameTrimX = x || 0;
      this._frameTrimY = y || 0;
      this._frameTrimW = width || this.image.domElement.width - this._frameTrimX;
      this._frameTrimH = height || this.image.domElement.height - this._frameTrimY;
      return this;
    },

    _accessor: {
      frameIndex: {
        get: function() {return this._frameIndex;},
        set: function(idx) {
          this.setFrameIndex(idx);
          return this;
        }
      },
      frameTrimX: {
        get: function() {return this._frameTrimY;},
        set: function(x) {
          this._frameTrimX = x;
          return this;
        }
      },
      frameTrimY: {
        get: function() {return this._frameTrimY;},
        set: function(y) {
          this._frameTrimY = y;
          return this;
        }
      },
      frameTrimW: {
        get: function() {return this._frameTrimW;},
        set: function(w) {
          this._frameTrimW = w;
          return this;
        }
      },
      frameTrimH: {
        get: function() {return this._frameTrimH;},
        set: function(h) {
          this._frameTrimH = h;
          return this;
        }
      },
    },
  });

});

