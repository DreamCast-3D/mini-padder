/**
 * @typedef {Object} GamepadChanges
 * @description
 * This object contains axes and buttons data from Gamepad with 'delta' property added to each.
 * Unchanged values will be represented as null.
 * @property {Object.<string, string>} id `gamepad.id` formatted into the name and the vendor-product code.
 * @property {string} id.name name of the gamepad
 * @property {string} id.id vendor-product code of the gamepad
 * @property {(?axisChange)[]} axes
 * @property {(?buttonChange)[]} buttons
 */
/**
 * @typedef axisChange
 * @type {Object}
 * @property {number} value value Raw value of the axis.
 * @property {number} delta value Represents how much it moved from the last position.
 */
/**
 * @typedef buttonChange
 * @type {Object}
 * @property {boolean} pressed Tells if the button is pressed.
 * @property {number} value State of the button. 0 when not pressed, 1 when fully pressed. Can be a number between 0 and 1 if the button is an analog kind.
 * @property {number} delta Represents how much it moved from the last position.
 */

class GamepadRenderer {
  constructor (canvasArray) {
    this.canvas = canvasArray
    this.skins = []
    this.ready = Array(4).fill(false)
    this.renderPending = false
    window.addEventListener('gamepadChange', this.requestRender.bind(this))
  }
  
  static announceMessage (message, type) {
    const messageType = {
      log: 'log',
      error: 'error'
    }
    window.dispatchEvent(new CustomEvent('GPVMessage', {
      detail: {
        from: 'Gamepad Renderer',
        type: messageType[type] || messageType.log,
        message: message
      }
    }))
  }
  
  getSkin (gamepadIndex, dirname) {
    this.ready[gamepadIndex] = false
    if (dirname.search(/[^0-9a-zA-Z_\-]/) !== -1) return false
    
    const skinpath = `./skin/${dirname}/`
    fetch(skinpath + 'config.json')
      .then(response => response.json())
      .then(data => {
        this.skins[gamepadIndex] = {
          path: skinpath, config: data
        }
        this.ready[gamepadIndex] = true
        this.applySkin(gamepadIndex)
        GamepadRenderer.announceMessage(
          `Gamepad ${gamepadIndex} now has ` +
          `'${this.skins[gamepadIndex].config.name}' skin.`
        )
      })
      .catch(error => {
        this.skins[gamepadIndex] = null
        GamepadRenderer.announceMessage(error, 'error')
      })
  }
  applySkin (gamepadIndex) {
    this.skins[gamepadIndex].img = []
    this.skins[gamepadIndex].layer = []
    this.skins[gamepadIndex].tool = {}
    const { config, img, layer, tool } =
      this.skins[gamepadIndex]
    const canvas = this.canvas[gamepadIndex]
    
    for (let i = 0; i < config.src.length; i++) {
      img[i] = new Image()
      img[i].src = this.skins[gamepadIndex].path + config.src[i]
    }
    for (let i = 0; i < config.layer.length; i++) {
      switch (config.layer[i].dynamic) {
        case false:
          layer[i] = document.createElement('div')
          layer[i].style.backgroundImage =
            `url(${img[config.layer[i].src].src})`
          layer[i].style.backgroundPosition =
            config.layer[i].x + 'px ' +
            config.layer[i].y + 'px'
          canvas.appendChild(layer[i])
          break;
        case true:
          layer[i] = document.createElement('canvas')
          layer[i].setAttribute('width', config.layer[i].width)
          layer[i].setAttribute('height', config.layer[i].height)
          layer[i].style.top = config.layer[i].y + 'px'
          layer[i].style.left = config.layer[i].x + 'px'
          tool[config.layer[i].name] = {
            ctx: layer[i].getContext('2d'),
            src: img[config.layer[i].src]
          }
          canvas.appendChild(layer[i])
          break;
      }
    }
  }
  
  requestRender () {
    if (this.renderPending) { return false }
    this.renderPending = true
    requestAnimationFrame(this.renderAll.bind(this))
  }
  renderAll () {
    this.renderPending = false
    
    this.render(0)
    this.render(1)
    this.render(2)
    this.render(3)
  }
  render (gamepadIndex) {
    if (!this.ready[gamepadIndex]) { return false }
    
    
  }
}
