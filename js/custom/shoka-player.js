/**
 * Shoka Player - 独立音乐播放器
 * 致敬 Shoka 主题的播放器设计
 */

class ShokaPlayer {
  constructor() {
    this.isPlaying = false
    this.currentSong = null
    this.popupTimer = null
    this.lastScrollTop = 0
    this.isScrolled = false
    this.aplayer = null
    
    // 播放控制相关属性
    this.playHistory = [] // 播放历史记录，用于上一首按钮
    this.maxHistorySize = 50 // 最大历史记录数量
    this.currentLoopMode = 0 // 当前循环模式：0=随机播放，1=列表循环
    
    this.init()
  }

  init() {
    this.createElements()
    this.bindEvents()
    this.waitForAplayer()
  }

  createElements() {
    // 创建左侧中央播放按钮
    const centerBtn = document.createElement('div')
    centerBtn.id = 'shoka-player-center-btn'
    centerBtn.innerHTML = '<i class="fas fa-play"></i>'
    document.body.appendChild(centerBtn)

    // 创建中央歌曲信息弹窗
    const popup = document.createElement('div')
    popup.id = 'shoka-player-popup'
    popup.innerHTML = `
      <div class="song-info">
        <div class="song-title">未播放</div>
        <div class="song-artist">未知歌手</div>
      </div>
    `
    document.body.appendChild(popup)

    // 创建左侧底部播放控制栏
    const sidebar = document.createElement('div')
    sidebar.id = 'shoka-player-sidebar'
    sidebar.innerHTML = `
      <div class="control-group">
        <button class="control-btn music-btn" title="音乐控制">
          <i class="fas fa-music"></i>
        </button>
        <button class="control-btn play-pause-btn" title="播放/暂停">
          <i class="fas fa-play"></i>
        </button>
      </div>
    `
    document.body.appendChild(sidebar)

    // 保存引用
    this.centerBtn = centerBtn
    this.popup = popup
    this.sidebar = sidebar
  }

  waitForAplayer() {
    // 等待 APlayer 初始化完成
    const checkAplayer = () => {
      const metingElement = document.querySelector('meting-js')
      if (metingElement && metingElement.aplayer) {
        this.aplayer = metingElement.aplayer
        this.setupAplayerEvents()
        this.updateDisplay()
        console.log('Shoka Player: APlayer 初始化完成')
        
        // 延迟初始化歌词，确保歌词容器已加载
        setTimeout(() => {
          this.updateLyrics()
          console.log('Shoka Player: 歌词初始化完成')
        }, 1000) // 增加到1秒
        
        // 再次延迟检查歌词，确保完全加载
        setTimeout(() => {
          this.updateLyrics()
          console.log('Shoka Player: 歌词二次检查完成')
        }, 2000) // 2秒后再次检查
      } else {
        setTimeout(checkAplayer, 100)
      }
    }
    checkAplayer()
  }

  setupAplayerEvents() {
    if (!this.aplayer) return

    // 监听播放状态变化
    this.aplayer.on('play', () => {
      this.isPlaying = true
      this.updateDisplay()
      this.updateSongInfo()
      this.showPopup()
      // 添加歌词更新
      this.updateLyrics()
      
      // 启动歌词同步定时器
      this.startLyricsSyncTimer()
    })

    this.aplayer.on('pause', () => {
      this.isPlaying = false
      this.updateDisplay()
      
      // 停止歌词同步定时器
      this.stopLyricsSyncTimer()
    })

    this.aplayer.on('ended', () => {
      this.isPlaying = false
      this.updateDisplay()
      
      // 停止歌词同步定时器
      this.stopLyricsSyncTimer()
      
      // 处理播放结束，根据循环模式自动播放下一首
      this.handlePlayEnd()
    })

    // 监听歌曲切换
    this.aplayer.on('listswitch', () => {
      // 添加到播放历史记录
      this.addToPlayHistory(this.aplayer.list.index)
      
      setTimeout(() => {
        this.updateSongInfo()
        this.updateLyrics() // 添加歌词更新
        if (this.isPlaying) {
          this.showPopup()
          // 重新启动歌词同步定时器
          this.startLyricsSyncTimer()
        }
      }, 100)
    })

    // 监听时间更新
    this.aplayer.on('timeupdate', () => {
      this.updateTimeDisplay()
      this.updateLyrics() // 添加歌词更新
    })

    // 监听音频加载完成
    this.aplayer.on('loadedmetadata', () => {
      this.updateTimeDisplay()
    })

    // 监听歌词显示事件
    this.aplayer.on('lrcshow', () => {
      setTimeout(() => {
        this.updateLyrics()
      }, 100)
    })

    // 获取初始播放状态
    this.isPlaying = !this.aplayer.audio.paused
    this.updateDisplay()
    
    // 禁用APlayer的自动循环，完全由我们控制
    this.aplayer.list.loop = 'none'
    
    // 初始化循环模式UI
    this.updateLoopModeUI()
    
    // 如果没有正在播放的歌曲，随机选择一首作为默认歌曲
    if (!this.isPlaying && this.aplayer.list.audios.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.aplayer.list.audios.length)
      this.aplayer.list.switch(randomIndex)
      this.updateSongInfo()
      this.updateLyrics() // 添加歌词更新
    } else if (this.isPlaying) {
      this.updateSongInfo()
      this.updateLyrics() // 添加歌词更新
      // 启动歌词同步定时器
      this.startLyricsSyncTimer()
    }
  }

  bindEvents() {
    // 绑定滚动事件处理函数
    this.handleScroll = this.handleScroll.bind(this)
    
    // 中央播放按钮点击事件
    this.centerBtn.addEventListener('click', () => {
      this.togglePlay()
    })

    // 侧边栏播放按钮点击事件
    const playPauseBtn = this.sidebar.querySelector('.play-pause-btn')
    playPauseBtn.addEventListener('click', () => {
      this.togglePlay()
    })

    // 侧边栏音乐按钮点击事件
    const musicBtn = this.sidebar.querySelector('.music-btn')
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      this.toggleMusicControl()
    })

    // 滚动事件监听
    window.addEventListener('scroll', this.handleScroll)

    // 点击弹窗外部关闭弹窗
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.hidePopup()
      }
    })
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const isAtTop = scrollTop <= 50

    // 检查中央播放按钮是否可见
    this.checkMiniPlayerVisibility()

    // 确保音乐按钮状态与mini-player状态同步
    this.syncMusicButtonState()

    // 立即响应滚动，不使用防抖延迟
    if (scrollTop > this.lastScrollTop && scrollTop > 100) {
      // 向下滚动且不在顶部
      if (!this.isScrolled) {
        this.isScrolled = true
        this.centerBtn.style.display = 'none'
        this.sidebar.classList.add('show')
      }
    } else if (isAtTop) {
      // 回到顶部
      if (this.isScrolled) {
        this.isScrolled = false
        this.centerBtn.style.display = 'flex'
        this.sidebar.classList.remove('show')
      }
    }

    this.lastScrollTop = scrollTop
  }

  // 检查mini-player可见性，如果中央播放按钮可见则收起mini-player
  checkMiniPlayerVisibility() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel || !musicPanel.classList.contains('show')) return

    // 检查中央播放按钮是否在视口中可见
    const centerBtnRect = this.centerBtn.getBoundingClientRect()
    const isCenterBtnVisible = centerBtnRect.top < window.innerHeight && centerBtnRect.bottom > 0

    if (isCenterBtnVisible) {
      // 中央播放按钮可见，收起mini-player
      this.hideMusicPanel()
      console.log('Shoka Player: 检测到中央播放按钮可见，mini-player已自动收起')
    }
  }

  // 同步音乐按钮状态与mini-player状态
  syncMusicButtonState() {
    const musicPanel = document.getElementById('shoka-music-panel')
    const musicBtn = this.sidebar.querySelector('.music-btn')
    
    if (!musicBtn) return
    
    const isPanelShowing = musicPanel && musicPanel.classList.contains('show')
    const isButtonActive = musicBtn.classList.contains('active')
    
    // 如果mini-player没有显示但按钮是激活状态，则恢复按钮状态
    if (!isPanelShowing && isButtonActive) {
      musicBtn.classList.remove('active')
      
      // 强制恢复音乐按钮的初始样式
      musicBtn.removeAttribute('style')
      
      // 检测是否为夜间模式
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
      
      if (isDarkMode) {
        // 夜间模式：恢复为白色背景
        musicBtn.style.cssText = `
          background: rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        `
        
        const icon = musicBtn.querySelector('i')
        if (icon) {
          icon.removeAttribute('style')
          icon.style.cssText = 'color: #333 !important;'
        }
      } else {
        // 白天模式：恢复为白色背景
        musicBtn.style.cssText = `
          background: rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        `
        
        const icon = musicBtn.querySelector('i')
        if (icon) {
          icon.removeAttribute('style')
          icon.style.cssText = 'color: #333 !important;'
        }
      }
      
      console.log('Shoka Player: 滚动时检测到状态不一致，已同步音乐按钮状态')
    }
  }

  togglePlay() {
    if (!this.aplayer) return

    if (this.isPlaying) {
      this.aplayer.pause()
    } else {
      this.aplayer.play()
    }
  }

  toggleMusicControl() {
    // 切换音乐控制面板
    this.toggleMusicPanel()
  }

  toggleMusicPanel() {
    // 创建或切换音乐控制面板
    let musicPanel = document.getElementById('shoka-music-panel')
    
    if (!musicPanel) {
      // 创建音乐控制面板
      musicPanel = document.createElement('div')
      musicPanel.id = 'shoka-music-panel'
      musicPanel.innerHTML = `
        <div class="music-panel-container">
          <!-- 模块一：控制模块 -->
          <div class="shoka-player-control">
            <!-- 顶部区域：唱片区域 + 歌曲信息区域 -->
            <div class="top-section">
              <!-- 唱片区域（左侧） -->
              <div class="vinyl-disc-area">
                <div class="vinyl-disc">
                  <div class="disc-inner">
                    <div class="album-art">
                      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGM0Y2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNjAiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iI0YwRjNGNiIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik04MCAxMDBMMTIwIDEwMEwxMDAgODBWMTIwWiIgZmlsbD0iI0YwRjNGNiIvPgo8L3N2Zz4K" alt="专辑封面" class="album-img">
                    </div>
                  </div>
                  <div class="needle"></div>
                </div>
              </div>
              
              <!-- 歌曲信息区域（右侧） -->
              <div class="song-info-area">
                <div class="song-title">未播放</div>
                <div class="song-artist">未知歌手</div>
                <div class="lyrics-container">
                  <div class="lyric-line prev-lyric">上一句歌词</div>
                  <div class="lyric-line current-lyric">当前播放歌词</div>
                  <div class="lyric-line next-lyric">下一句歌词</div>
                </div>
              </div>
            </div>
            
            <!-- 控制区域（底部） -->
            <div class="control-area">
              <div class="playback-controls">
                <button class="control-btn shuffle-btn" title="随机播放">
                  <i class="fas fa-random"></i>
                </button>
                <button class="control-btn prev-btn" title="上一首">
                  <i class="fas fa-step-backward"></i>
                </button>
                <button class="control-btn play-pause-btn" title="播放/暂停">
                  <i class="fas fa-play"></i>
                </button>
                <button class="control-btn next-btn" title="下一首">
                  <i class="fas fa-step-forward"></i>
                </button>
                <div class="volume-group">
                  <button class="control-btn volume-btn" title="音量">
                    <i class="fas fa-volume-up"></i>
                  </button>
                  <div class="volume-slider-container">
                    <input type="range" class="volume-slider" min="0" max="100" value="70">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 模块二：歌曲列表模块 -->
          <div class="shoka-playList-control">
            <div class="playlist-container">
              <div class="playlist-scroll">
                <div class="playlist-items">
                  <!-- 歌曲列表将通过 JavaScript 动态生成 -->
                </div>
              </div>
            </div>
          </div>
          
          <!-- 定位按钮 - 使用内联样式确保可见 -->
          <button class="locate-btn" title="定位到当前播放歌曲" style="position: absolute; bottom: 15px; right: 15px; width: 28px; height: 28px; border-radius: 50%; background: #ffffff; border: 2px solid #e0e0e0; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 9999; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
            <i class="fas fa-crosshairs" style="font-size: 12px; color: #ff0000;"></i>
          </button>
        </div>
        
        <!-- 关闭按钮 -->
        <button class="close-btn" title="关闭">
          <i class="fas fa-times"></i>
        </button>
      `
      document.body.appendChild(musicPanel)
      
      // 测试定位按钮是否被正确创建
      const locateBtn = musicPanel.querySelector('.locate-btn')
      if (locateBtn) {
        console.log('Shoka Player: 定位按钮创建成功', {
          exists: true,
          position: locateBtn.style.position,
          display: locateBtn.style.display,
          zIndex: locateBtn.style.zIndex
        })
      } else {
        console.log('Shoka Player: 定位按钮创建失败')
      }
      
      // 绑定面板事件
      this.bindMusicPanelEvents(musicPanel)
    }
    
    // 切换面板显示状态
    if (musicPanel.classList.contains('show')) {
      // 如果面板已显示，则隐藏并取消激活音乐按钮
      this.hideMusicPanel()
    } else {
      // 如果面板未显示，则显示并激活音乐按钮
      this.showMusicPanel()
    }
  }

  showMusicPanel() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (musicPanel) {
      musicPanel.classList.add('show')
      this.updateMusicPanelContent()
      
      // 激活音乐按钮
      const musicBtn = this.sidebar.querySelector('.music-btn')
      if (musicBtn) {
        musicBtn.classList.add('active')
        // 移除可能的内联样式，让CSS类生效
        musicBtn.removeAttribute('style')
        const icon = musicBtn.querySelector('i')
        if (icon) {
          icon.removeAttribute('style')
        }
        console.log('Shoka Player: mini-player展开，音乐按钮已激活', {
          hasActiveClass: musicBtn.classList.contains('active'),
          isDarkMode: document.documentElement.getAttribute('data-theme') === 'dark'
        })
      }
      
      // 强制显示定位按钮
      setTimeout(() => {
        const locateBtn = musicPanel.querySelector('.locate-btn')
        if (locateBtn) {
          locateBtn.style.position = 'absolute'
          locateBtn.style.bottom = '15px'
          locateBtn.style.right = '15px'
          locateBtn.style.width = '28px'
          locateBtn.style.height = '28px'
          locateBtn.style.borderRadius = '50%'
          locateBtn.style.background = '#ffffff'
          locateBtn.style.border = '2px solid #e0e0e0'
          locateBtn.style.cursor = 'pointer'
          locateBtn.style.display = 'flex'
          locateBtn.style.alignItems = 'center'
          locateBtn.style.justifyContent = 'center'
          locateBtn.style.zIndex = '9999'
          locateBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
          locateBtn.style.visibility = 'visible'
          locateBtn.style.opacity = '1'
          
          const icon = locateBtn.querySelector('i')
          if (icon) {
            icon.style.fontSize = '12px'
            icon.style.color = '#ff0000'
          }
          
          console.log('Shoka Player: 强制设置定位按钮样式完成')
        }
      }, 100)
    }
  }

  hideMusicPanel() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (musicPanel) {
      musicPanel.classList.remove('show')
      
      // 取消激活音乐按钮并强制恢复样式
      const musicBtn = this.sidebar.querySelector('.music-btn')
      if (musicBtn) {
        musicBtn.classList.remove('active')
        
        // 强制恢复音乐按钮的初始样式
        musicBtn.removeAttribute('style')
        
        // 检测是否为夜间模式
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
        
        if (isDarkMode) {
          // 夜间模式：恢复为白色背景
          musicBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.8) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          `
          
          const icon = musicBtn.querySelector('i')
          if (icon) {
            icon.removeAttribute('style')
            icon.style.cssText = 'color: #333 !important;'
          }
        } else {
          // 白天模式：恢复为白色背景
          musicBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.8) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          `
          
          const icon = musicBtn.querySelector('i')
          if (icon) {
            icon.removeAttribute('style')
            icon.style.cssText = 'color: #333 !important;'
          }
        }
        
        console.log('Shoka Player: mini-player收起，音乐按钮状态已重置', {
          isDarkMode: isDarkMode,
          hasActiveClass: musicBtn.classList.contains('active'),
          background: musicBtn.style.background
        })
      }
    }
  }
  
  // 添加全局点击事件处理函数
  handleGlobalClick(e) {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (musicPanel && musicPanel.classList.contains('show') && !musicPanel.contains(e.target)) {
      this.hideMusicPanel()
    }
  }

  bindMusicPanelEvents(musicPanel) {
    // 关闭按钮事件
    const closeBtn = musicPanel.querySelector('.close-btn')
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      this.hideMusicPanel()
    })
    
    // 播放/暂停按钮事件
    const playPauseBtn = musicPanel.querySelector('.play-pause-btn')
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      this.togglePlay()
    })
    
    // 上一首按钮事件
    const prevBtn = musicPanel.querySelector('.prev-btn')
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      this.playPreviousSong()
      // 点击后恢复按钮样式
      setTimeout(() => {
        prevBtn.style.background = 'rgba(255, 255, 255, 0.8)'
        prevBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        const icon = prevBtn.querySelector('i')
        if (icon) icon.style.color = '#333'
      }, 150)
    })
    
    // 下一首按钮事件
    const nextBtn = musicPanel.querySelector('.next-btn')
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      this.playNextSongManual()
      // 点击后恢复按钮样式
      setTimeout(() => {
        nextBtn.style.background = 'rgba(255, 255, 255, 0.8)'
        nextBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        const icon = nextBtn.querySelector('i')
        if (icon) icon.style.color = '#333'
      }, 150)
    })
    
    // 循环播放按钮事件
    const shuffleBtn = musicPanel.querySelector('.shuffle-btn')
    shuffleBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      this.toggleLoopMode()
      // 点击后恢复按钮样式
      setTimeout(() => {
        shuffleBtn.style.background = 'rgba(255, 255, 255, 0.8)'
        shuffleBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        const icon = shuffleBtn.querySelector('i')
        if (icon) icon.style.color = '#333'
      }, 150)
    })
    
    // 音量按钮事件
    const volumeBtn = musicPanel.querySelector('.volume-btn')
    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      if (this.aplayer) {
        const currentVolume = this.aplayer.volume()
        if (currentVolume > 0) {
          this.lastVolume = currentVolume
          this.aplayer.volume(0)
          volumeBtn.querySelector('i').className = 'fas fa-volume-mute'
        } else {
          this.aplayer.volume(this.lastVolume || 0.5)
          volumeBtn.querySelector('i').className = 'fas fa-volume-up'
        }
      }
      // 点击后恢复按钮样式
      setTimeout(() => {
        volumeBtn.style.background = 'rgba(255, 255, 255, 0.8)'
        volumeBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        const icon = volumeBtn.querySelector('i')
        if (icon) icon.style.color = '#333'
      }, 150)
    })
    
    // 音量控制事件
    const volumeSlider = musicPanel.querySelector('.volume-slider')
    volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      if (this.aplayer) {
        const volume = e.target.value / 100
        this.aplayer.volume(volume)
        
        // 更新音量按钮图标
        const volumeBtn = musicPanel.querySelector('.volume-btn')
        const volumeIcon = volumeBtn.querySelector('i')
        if (volume === 0) {
          volumeIcon.className = 'fas fa-volume-mute'
        } else if (volume < 0.5) {
          volumeIcon.className = 'fas fa-volume-down'
        } else {
          volumeIcon.className = 'fas fa-volume-up'
        }
        
        // 更新音量按钮标题
        volumeBtn.title = `音量 ${Math.round(volume * 100)}%`
        
        // 更新音量滑块背景颜色
        this.updateVolumeSliderBackground(volumeSlider, volume)
      }
    })
    
    // 定位按钮事件
    const locateBtn = musicPanel.querySelector('.locate-btn')
    locateBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止事件冒泡
      this.locateCurrentSong()
    })
    
    // 调试：检查定位按钮状态
    console.log('Shoka Player: 定位按钮状态检查', {
      exists: !!locateBtn,
      visible: locateBtn ? locateBtn.offsetParent !== null : false,
      position: locateBtn ? {
        top: locateBtn.offsetTop,
        left: locateBtn.offsetLeft,
        width: locateBtn.offsetWidth,
        height: locateBtn.offsetHeight
      } : null
    })
    
    // 播放列表滚动事件处理 - 防止滚动事件传播到页面
    const playlistScroll = musicPanel.querySelector('.playlist-scroll')
    if (playlistScroll) {
      playlistScroll.addEventListener('wheel', (e) => {
        const { scrollTop, scrollHeight, clientHeight } = playlistScroll
        
        // 检查是否滚动到顶部或底部
        const isAtTop = scrollTop === 0
        const isAtBottom = scrollTop + clientHeight >= scrollHeight
        
        // 如果滚动到顶部且向上滚动，或者滚动到底部且向下滚动，则阻止事件传播
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault()
          e.stopPropagation()
        }
      })
    }
    
    // 点击面板外部关闭
    musicPanel.addEventListener('click', (e) => {
      if (e.target === musicPanel) {
        this.hideMusicPanel()
      }
    })
    
    // 阻止面板内部元素的点击事件冒泡
    musicPanel.addEventListener('click', (e) => {
      if (e.target !== musicPanel) {
        e.stopPropagation()
      }
    })
    
    // 添加全局点击事件监听器，点击面板外部关闭
    this.handleGlobalClick = this.handleGlobalClick.bind(this)
    document.addEventListener('click', this.handleGlobalClick)
    
    // 初始化音量滑块背景颜色
    const initialVolumeSlider = musicPanel.querySelector('.volume-slider')
    if (initialVolumeSlider) {
      const initialVolume = initialVolumeSlider.value / 100
      this.updateVolumeSliderBackground(initialVolumeSlider, initialVolume)
    }
  }

  updateMusicPanelContent() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel) return
    
    // 更新歌曲信息
    const songTitles = musicPanel.querySelectorAll('.song-title')
    const songArtists = musicPanel.querySelectorAll('.song-artist')
    
    if (this.currentSong) {
      songTitles.forEach(title => {
        title.textContent = this.currentSong.title
      })
      songArtists.forEach(artist => {
        artist.textContent = this.currentSong.artist
      })
      
      // 更新专辑图片
      this.updateAlbumArt()
    } else {
      songTitles.forEach(title => {
        title.textContent = '未播放'
      })
      songArtists.forEach(artist => {
        artist.textContent = '未知歌手'
      })
      
      // 重置专辑图片为默认图片
      this.resetAlbumArt()
    }
    
    // 更新播放按钮状态
    const playPauseBtn = musicPanel.querySelector('.play-pause-btn')
    const playIcon = playPauseBtn.querySelector('i')
    
    if (this.isPlaying) {
      playIcon.className = 'fas fa-pause'
      playPauseBtn.classList.add('playing')
    } else {
      playIcon.className = 'fas fa-play'
      playPauseBtn.classList.remove('playing')
    }
    
    // 更新唱片和唱针动画
    const discInner = musicPanel.querySelector('.disc-inner')
    const needle = musicPanel.querySelector('.needle')
    
    if (discInner && needle) {
      if (this.isPlaying) {
        discInner.classList.add('playing')
        needle.classList.add('playing')
      } else {
        discInner.classList.remove('playing')
        needle.classList.remove('playing')
      }
    }
    
    // 更新音量滑块
    const volumeSlider = musicPanel.querySelector('.volume-slider')
    if (this.aplayer) {
      volumeSlider.value = this.aplayer.volume() * 100
    }
    
    // 更新播放列表
    this.updatePlaylist()
    
    // 更新时间显示
    this.updateTimeDisplay()
    
    // 更新歌词显示
    this.updateLyrics()
  }

  // 更新专辑图片
  updateAlbumArt() {
    if (!this.aplayer) return
    
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel) return
    
    const albumImg = musicPanel.querySelector('.album-img')
    if (!albumImg) return
    
    const currentSong = this.aplayer.list.audios[this.aplayer.list.index]
    if (currentSong && currentSong.cover) {
      // 使用歌曲的封面图片
      albumImg.src = currentSong.cover
      albumImg.alt = `${currentSong.name} - ${currentSong.artist}`
    } else {
      // 如果没有封面，使用默认图片
      this.resetAlbumArt()
    }
  }

  // 重置专辑图片为默认图片
  resetAlbumArt() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel) return
    
    const albumImg = musicPanel.querySelector('.album-img')
    if (!albumImg) return
    
    // 使用默认的SVG图片
    albumImg.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGM0Y2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNjAiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iI0YwRjNGNiIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjE1IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik04MCAxMDBMMTIwIDEwMEwxMDAgODBWMTIwWiIgZmlsbD0iI0YwRjNGNiIvPgo8L3N2Zz4K"
    albumImg.alt = "专辑封面"
  }

  updatePlaylist() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel || !this.aplayer) return
    
    const playlistItems = musicPanel.querySelector('.playlist-items')
    
    if (!playlistItems) return
    
    // 清空现有列表
    playlistItems.innerHTML = ''
    
    // 生成播放列表（显示所有歌曲）
    const songsToShow = this.aplayer.list.audios
    
    songsToShow.forEach((song, index) => {
      const item = document.createElement('div')
      item.className = 'playlist-item'
      if (index === this.aplayer.list.index) {
        item.classList.add('current-playing')
      }
      
      if (index === this.aplayer.list.index) {
        // 当前播放歌曲的特殊样式
        item.innerHTML = `
          <div class="current-song-item">
            <div class="play-icon">
              <i class="fas fa-play"></i>
            </div>
            <div class="song-info">
              <div class="song-name" data-title="${song.name}">${song.name}</div>
            </div>
            <div class="artist-info">
              <span class="artist-name">${song.artist}</span>
            </div>
          </div>
        `
      } else {
        // 普通歌曲项
        item.innerHTML = `
          <div class="song-item">
            <div class="item-index">${String(index + 1).padStart(3, '0')}</div>
            <div class="item-info">
              <div class="item-title" data-title="${song.name}">${song.name}</div>
            </div>
            <div class="item-artist">${song.artist}</div>
          </div>
        `
      }
      
      // 点击切换歌曲
      item.addEventListener('click', (e) => {
        e.stopPropagation() // 阻止事件冒泡
        // 如果当前是暂停状态，先切换到目标歌曲，然后开始播放
        if (!this.isPlaying) {
          this.aplayer.list.switch(index)
          this.aplayer.play()
        } else {
          // 如果正在播放，只切换歌曲
          this.aplayer.list.switch(index)
        }
      })
      
      playlistItems.appendChild(item)
    })
  }

  updateTimeDisplay() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel || !this.aplayer) return
    
    // 更新播放列表中的进度显示
    const currentSongItem = musicPanel.querySelector('.current-song-item')
    if (currentSongItem) {
      // 更新播放进度背景
      const currentTime = this.aplayer.audio.currentTime || 0
      const totalTime = this.aplayer.audio.duration || 0
      
      if (totalTime > 0) {
        const progress = (currentTime / totalTime) * 100
        currentSongItem.style.setProperty('--progress-width', `${progress}%`)
      }
    }
  }

  // 新增：歌词更新方法
  updateLyrics() {
    if (!this.aplayer) {
      console.log('Shoka Player: APlayer未初始化，跳过歌词更新')
      return
    }

    // 获取当前播放时间和总时长
    const currentTime = this.aplayer.audio.currentTime || 0
    let totalDuration = this.aplayer.audio.duration || 0
    
    // 如果总时长为0，尝试从当前歌曲获取
    if (totalDuration === 0 && this.aplayer.list && this.aplayer.list.audios && this.aplayer.list.audios[this.aplayer.list.index]) {
      const currentSong = this.aplayer.list.audios[this.aplayer.list.index]
      totalDuration = currentSong.duration || 0
    }

    console.log('Shoka Player: 从当前页面meting-js获取歌词')

    // 查找APlayer的歌词容器
    let aplayerLrcContents = null
    
    // 方法1：从当前页面的APlayer实例获取
    if (this.aplayer.lrc && this.aplayer.lrc.contents) {
      aplayerLrcContents = this.aplayer.lrc.contents
      console.log('Shoka Player: 从APlayer实例获取歌词容器')
    }
    
    // 方法2：从DOM中查找
    if (!aplayerLrcContents) {
      aplayerLrcContents = document.querySelector('.aplayer-lrc-contents')
      if (aplayerLrcContents) {
        console.log('Shoka Player: 从DOM获取歌词容器')
      }
    }
    
    // 方法3：从meting-js容器中查找
    if (!aplayerLrcContents) {
      const metingContainer = document.querySelector('.meting-js')
      if (metingContainer) {
        aplayerLrcContents = metingContainer.querySelector('.aplayer-lrc-contents')
        if (aplayerLrcContents) {
          console.log('Shoka Player: 从meting-js容器获取歌词容器')
        }
      }
    }

    if (!aplayerLrcContents) {
      console.log('Shoka Player: 未找到歌词容器')
      return
    }

    // 获取所有歌词行
    const lrcLines = aplayerLrcContents.querySelectorAll('p')
    if (lrcLines.length === 0) {
      console.log('Shoka Player: 歌词容器中没有歌词行')
      return
    }

    // 详细调试：查看前几行歌词的内容
    console.log('Shoka Player: 歌词数据详情')
    console.log('歌词容器:', aplayerLrcContents)
    console.log('歌词行数量:', lrcLines.length)
    
    // 显示前5行歌词的详细信息
    for (let i = 0; i < Math.min(5, lrcLines.length); i++) {
      const line = lrcLines[i]
      console.log(`歌词行 ${i}:`, {
        text: line.textContent,
        dataTime: line.getAttribute('data-time'),
        className: line.className,
        innerHTML: line.innerHTML
      })
    }

    console.log('Shoka Player: 歌词更新', {
      currentTime: currentTime,
      totalDuration: totalDuration,
      totalLines: lrcLines.length,
      hasTimeAttributes: lrcLines[0]?.getAttribute('data-time') !== null
    })

    // 找到当前应该显示的歌词行
    let currentIndex = -1
    let prevIndex = -1
    let nextIndex = -1

    // 优先使用APlayer内置的歌词同步逻辑
    const currentHighlightedLine = aplayerLrcContents.querySelector('p.aplayer-lrc-current')
    if (currentHighlightedLine) {
      currentIndex = Array.from(lrcLines).indexOf(currentHighlightedLine)
      console.log('Shoka Player: 使用APlayer高亮行作为当前歌词', {
        currentIndex: currentIndex,
        currentText: currentHighlightedLine.textContent
      })
    } else {
      // 如果没有高亮行，使用时间属性匹配
      const hasTimeAttributes = lrcLines[0]?.getAttribute('data-time') !== null
      
      if (hasTimeAttributes) {
        // 使用时间属性匹配歌词
        let lastValidIndex = -1
        
        for (let i = 0; i < lrcLines.length; i++) {
          const timeAttr = lrcLines[i].getAttribute('data-time')
          if (timeAttr) {
            const lineTime = parseFloat(timeAttr)
            if (lineTime <= currentTime) {
              lastValidIndex = i
            } else {
              break
            }
          }
        }
        
        // 设置当前歌词索引
        if (lastValidIndex >= 0) {
          currentIndex = lastValidIndex
        }
        
        console.log('Shoka Player: 使用时间属性匹配歌词', {
          currentTime: currentTime,
          currentIndex: currentIndex,
          lastValidIndex: lastValidIndex
        })
      } else {
        // 使用播放进度估算
        if (totalDuration > 0 && lrcLines.length > 0) {
          const progress = currentTime / totalDuration
          const estimatedIndex = Math.floor(progress * lrcLines.length)
          
          currentIndex = Math.min(estimatedIndex, lrcLines.length - 1)
          
          console.log('Shoka Player: 使用进度估算歌词位置', {
            progress: progress,
            estimatedIndex: estimatedIndex,
            currentIndex: currentIndex
          })
        } else {
          // 简单时间估算
          if (lrcLines.length > 0) {
            const estimatedIndex = Math.floor(currentTime / 3)
            currentIndex = Math.min(estimatedIndex, lrcLines.length - 1)
            
            console.log('Shoka Player: 使用时间估算歌词位置', {
              currentTime: currentTime,
              estimatedIndex: estimatedIndex,
              currentIndex: currentIndex
            })
          }
        }
      }
    }

    // 确保索引在有效范围内
    if (currentIndex < 0) currentIndex = 0
    if (currentIndex >= lrcLines.length) currentIndex = lrcLines.length - 1
    
    // 计算上一句和下一句歌词索引
    if (currentIndex > 0) {
      prevIndex = currentIndex - 1
    }
    if (currentIndex < lrcLines.length - 1) {
      nextIndex = currentIndex + 1
    }

    console.log('Shoka Player: 最终歌词索引', {
      prevIndex: prevIndex,
      currentIndex: currentIndex,
      nextIndex: nextIndex,
      currentText: lrcLines[currentIndex]?.textContent || '无歌词'
    })

    // 更新Shoka Player面板中的歌词显示
    this.updateMusicPanelLyrics(lrcLines, prevIndex, currentIndex, nextIndex)
  }

  // 新增：更新音乐面板中的歌词显示
  updateMusicPanelLyrics(lrcLines, prevIndex, currentIndex, nextIndex) {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel) {
      console.log('Shoka Player: 音乐面板未打开，跳过歌词更新')
      return
    }

    const prevLyric = musicPanel.querySelector('.prev-lyric')
    const currentLyric = musicPanel.querySelector('.current-lyric')
    const nextLyric = musicPanel.querySelector('.next-lyric')

    console.log('Shoka Player: 歌词元素检查', {
      hasPrevLyric: !!prevLyric,
      hasCurrentLyric: !!currentLyric,
      hasNextLyric: !!nextLyric
    })

    // 更新上一句歌词 - 初期不显示
    if (prevLyric) {
      if (prevIndex >= 0 && prevIndex < lrcLines.length) {
        const prevText = lrcLines[prevIndex].textContent || ''
        // 检查是否为作词、作曲等信息行，或者初期状态
        if (prevText.trim() === '' || prevText.includes('作词') || prevText.includes('作曲') || prevText.includes('编曲') || prevText.includes('制作人')) {
          prevLyric.textContent = ''
        } else {
          // 歌词过长时换行显示
          prevLyric.textContent = prevText
          prevLyric.style.whiteSpace = 'pre-wrap'
          prevLyric.style.wordBreak = 'break-word'
        }
        console.log('Shoka Player: 更新上一句歌词:', prevLyric.textContent)
      } else {
        prevLyric.textContent = ''
        console.log('Shoka Player: 清空上一句歌词')
      }
    }

    // 更新当前歌词 - 对齐时间轴，支持换行
    if (currentLyric) {
      if (currentIndex >= 0 && currentIndex < lrcLines.length) {
        const currentText = lrcLines[currentIndex].textContent || ''
        
        // 检查是否为作词、作曲等信息行
        if (currentText.includes('作词') || currentText.includes('作曲') || currentText.includes('编曲') || currentText.includes('制作人')) {
          currentLyric.textContent = ''
        } else {
          // 只显示歌词内容，不显示时间轴
          currentLyric.textContent = currentText
          currentLyric.style.whiteSpace = 'pre-wrap'
          currentLyric.style.wordBreak = 'break-word'
          currentLyric.style.lineHeight = '1.4'
        }
        console.log('Shoka Player: 更新当前歌词:', currentLyric.textContent)
      } else {
        // 没有歌词时什么都不显示
        currentLyric.textContent = ''
        console.log('Shoka Player: 清空当前歌词')
      }
    }

    // 更新下一句歌词 - 支持换行
    if (nextLyric) {
      if (nextIndex >= 0 && nextIndex < lrcLines.length) {
        const nextText = lrcLines[nextIndex].textContent || ''
        
        // 检查是否为作词、作曲等信息行
        if (nextText.includes('作词') || nextText.includes('作曲') || nextText.includes('编曲') || nextText.includes('制作人')) {
          nextLyric.textContent = ''
        } else {
          // 检查当前歌词是否太长，如果太长则隐藏下一句歌词
          const currentText = currentLyric ? currentLyric.textContent || '' : ''
          const currentTextLength = currentText.length
          
          // 如果当前歌词超过50个字符，则隐藏下一句歌词
          if (currentTextLength > 50) {
            nextLyric.textContent = ''
            console.log('Shoka Player: 当前歌词过长，隐藏下一句歌词')
          } else {
            // 歌词过长时换行显示
            nextLyric.textContent = nextText
            nextLyric.style.whiteSpace = 'pre-wrap'
            nextLyric.style.wordBreak = 'break-word'
            console.log('Shoka Player: 更新下一句歌词:', nextLyric.textContent)
          }
        }
      } else {
        nextLyric.textContent = ''
        console.log('Shoka Player: 清空下一句歌词')
      }
    }
  }

  updateSongInfo() {
    if (!this.aplayer) return

    const currentSong = this.aplayer.list.audios[this.aplayer.list.index]
    if (currentSong) {
      this.currentSong = {
        title: currentSong.name,
        artist: currentSong.artist
      }
    }
    
    // 更新音乐面板内容
    this.updateMusicPanelContent()
  }

  showPopup() {
    // 清除之前的定时器
    clearTimeout(this.popupTimer)
    
    // 更新弹窗内容
    const songTitle = this.currentSong ? this.currentSong.title : '未播放'
    const songArtist = this.currentSong ? this.currentSong.artist : '未知歌手'
    
    this.popup.querySelector('.song-title').textContent = songTitle
    this.popup.querySelector('.song-artist').textContent = songArtist
    
    // 显示弹窗
    this.popup.classList.add('show')
    
    // 5秒后自动隐藏
    this.popupTimer = setTimeout(() => {
      this.hidePopup()
    }, 5000)
  }

  hidePopup() {
    this.popup.classList.remove('show')
    clearTimeout(this.popupTimer)
  }

  updateDisplay() {
    // 更新播放按钮状态
    const centerIcon = this.centerBtn.querySelector('i')
    const sidebarIcon = this.sidebar.querySelector('.play-pause-btn i')
    
    if (this.isPlaying) {
      centerIcon.className = 'fas fa-pause'
      sidebarIcon.className = 'fas fa-pause'
      this.centerBtn.classList.add('playing')
      this.sidebar.querySelector('.play-pause-btn').classList.add('playing')
    } else {
      centerIcon.className = 'fas fa-play'
      sidebarIcon.className = 'fas fa-play'
      this.centerBtn.classList.remove('playing')
      this.sidebar.querySelector('.play-pause-btn').classList.remove('playing')
    }
    
    // 更新音乐面板中的播放按钮状态
    const musicPanel = document.getElementById('shoka-music-panel')
    if (musicPanel) {
      const musicPanelPlayBtn = musicPanel.querySelector('.play-pause-btn')
      const musicPanelIcon = musicPanelPlayBtn?.querySelector('i')
      
      if (musicPanelPlayBtn && musicPanelIcon) {
        if (this.isPlaying) {
          musicPanelIcon.className = 'fas fa-pause'
          musicPanelPlayBtn.classList.add('playing')
        } else {
          musicPanelIcon.className = 'fas fa-play'
          musicPanelPlayBtn.classList.remove('playing')
        }
      }
    }
    
    // 更新音乐面板内容
    this.updateMusicPanelContent()
  }

  // 公共方法：获取播放状态
  getPlayingState() {
    return this.isPlaying
  }

  // 公共方法：获取当前歌曲信息
  getCurrentSong() {
    return this.currentSong
  }

  // 定位到当前播放歌曲
  locateCurrentSong() {
    if (!this.aplayer) return
    
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel) return
    
    const playlistScroll = musicPanel.querySelector('.playlist-scroll')
    const currentSongItem = musicPanel.querySelector('.current-playing')
    
    if (playlistScroll && currentSongItem) {
      // 计算当前歌曲在滚动容器中的位置
      const scrollTop = currentSongItem.offsetTop - playlistScroll.offsetTop - 50
      
      // 平滑滚动到当前歌曲位置
      playlistScroll.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      })
      
      // 添加定位成功的视觉反馈
      currentSongItem.style.animation = 'locate-pulse 0.6s ease-in-out'
      setTimeout(() => {
        currentSongItem.style.animation = ''
      }, 600)
    }
  }

  // 更新音量滑块背景颜色
  updateVolumeSliderBackground(volumeSlider, volume) {
    const percentage = Math.round(volume * 100)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    
    if (isDark) {
      // 暗色模式
      volumeSlider.style.background = `linear-gradient(to right, #ffc107 0%, #ffc107 ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(255, 255, 255, 0.2) 100%)`
    } else {
      // 亮色模式
      volumeSlider.style.background = `linear-gradient(to right, #007bff 0%, #007bff ${percentage}%, rgba(0, 0, 0, 0.1) ${percentage}%, rgba(0, 0, 0, 0.1) 100%)`
    }
  }

  // 更新所有音量滑块的主题颜色
  updateVolumeSliderTheme() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (musicPanel) {
      const volumeSlider = musicPanel.querySelector('.volume-slider')
      if (volumeSlider) {
        const currentVolume = volumeSlider.value / 100
        // 强制重新检测主题状态
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                      document.body.classList.contains('dark') ||
                      document.documentElement.classList.contains('dark')
        
        const percentage = Math.round(currentVolume * 100)
        
        if (isDark) {
          // 暗色模式
          volumeSlider.style.background = `linear-gradient(to right, #ffc107 0%, #ffc107 ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(255, 255, 255, 0.2) 100%)`
        } else {
          // 亮色模式
          volumeSlider.style.background = `linear-gradient(to right, #007bff 0%, #007bff ${percentage}%, rgba(0, 0, 0, 0.1) ${percentage}%, rgba(0, 0, 0, 0.1) 100%)`
        }
      }
    }
  }

  // 新增：手动更新歌词的公共方法
  forceUpdateLyrics() {
    console.log('Shoka Player: 手动触发歌词更新')
    this.updateLyrics()
  }

  // 新增：检查歌词状态的调试方法
  debugLyricsStatus() {
    console.log('Shoka Player: 歌词状态调试信息')
    console.log('APlayer状态:', {
      hasAplayer: !!this.aplayer,
      isPlaying: this.isPlaying,
      currentSong: this.currentSong
    })
    
    // 检查各种歌词容器
    const containers = {
      mainMusicPage: document.querySelector('#Music-page .aplayer-lrc-contents'),
      currentMeting: document.querySelector('meting-js .aplayer-lrc-contents'),
      hiddenMeting: document.querySelector('meting-js[style*="display: none"] .aplayer-lrc-contents')
    }
    
    console.log('歌词容器状态:', containers)
    
    // 检查音乐面板
    const musicPanel = document.getElementById('shoka-music-panel')
    if (musicPanel) {
      const lyricsElements = {
        prevLyric: musicPanel.querySelector('.prev-lyric'),
        currentLyric: musicPanel.querySelector('.current-lyric'),
        nextLyric: musicPanel.querySelector('.next-lyric')
      }
      console.log('歌词元素状态:', lyricsElements)
    }
  }

  // 启动歌词同步定时器
  startLyricsSyncTimer() {
    // 清除之前的定时器
    this.stopLyricsSyncTimer()
    
    // 每500毫秒更新一次歌词，确保同步更准确
    this.lyricsSyncTimer = setInterval(() => {
      if (this.isPlaying && this.aplayer) {
        this.updateLyrics()
      }
    }, 200) // 从500ms改为200ms，提高同步频率
  }

  // 停止歌词同步定时器
  stopLyricsSyncTimer() {
    if (this.lyricsSyncTimer) {
      clearInterval(this.lyricsSyncTimer)
      this.lyricsSyncTimer = null
    }
  }

  // 新增：播放控制相关方法
  
  /**
   * 添加播放历史记录
   * @param {number} songIndex 歌曲索引
   */
  addToPlayHistory(songIndex) {
    // 如果当前歌曲已经在历史记录中，不重复添加
    if (this.playHistory.length > 0 && this.playHistory[this.playHistory.length - 1] === songIndex) {
      return
    }
    
    // 添加到历史记录
    this.playHistory.push(songIndex)
    
    // 限制历史记录大小
    if (this.playHistory.length > this.maxHistorySize) {
      this.playHistory.shift()
    }
    
    console.log('Shoka Player: 添加到播放历史', songIndex, '历史记录:', this.playHistory)
  }
  
  /**
   * 获取上一首歌曲索引
   * @returns {number|null} 上一首歌曲索引，如果没有历史记录则返回null
   */
  getPreviousSongIndex() {
    if (this.playHistory.length <= 1) {
      return null
    }
    
    // 移除当前歌曲，返回上一首
    this.playHistory.pop()
    const previousIndex = this.playHistory[this.playHistory.length - 1]
    
    console.log('Shoka Player: 获取上一首歌曲', previousIndex, '剩余历史:', this.playHistory)
    return previousIndex
  }
  
  /**
   * 根据循环模式获取下一首歌曲索引（用于自动播放）
   * @returns {number} 下一首歌曲索引
   */
  getNextSongIndex() {
    if (!this.aplayer || !this.aplayer.list.audios.length) {
      console.log('Shoka Player: getNextSongIndex - APlayer未初始化或没有歌曲')
      return 0
    }
    
    const currentIndex = this.aplayer.list.index
    const totalSongs = this.aplayer.list.audios.length
    
    console.log('Shoka Player: getNextSongIndex 开始执行', {
      currentLoopMode: this.currentLoopMode,
      currentIndex: currentIndex,
      totalSongs: totalSongs
    })
    
    switch (this.currentLoopMode) {
      case 0: // 随机播放
        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * totalSongs)
        } while (randomIndex === currentIndex && totalSongs > 1)
        console.log('Shoka Player: 自动播放 - 随机播放模式，下一首:', randomIndex)
        return randomIndex
        
      case 1: // 列表循环
        const nextIndex = (currentIndex + 1) % totalSongs
        console.log('Shoka Player: 自动播放 - 列表循环模式，下一首:', nextIndex)
        return nextIndex
        
      default:
        console.log('Shoka Player: getNextSongIndex - 未知循环模式:', this.currentLoopMode)
        return (currentIndex + 1) % totalSongs
    }
  }

  /**
   * 根据循环模式获取下一首歌曲索引（用于手动点击）
   * @returns {number} 下一首歌曲索引
   */
  getNextSongIndexForManual() {
    if (!this.aplayer || !this.aplayer.list.audios.length) {
      return 0
    }
    
    const currentIndex = this.aplayer.list.index
    const totalSongs = this.aplayer.list.audios.length
    
    switch (this.currentLoopMode) {
      case 0: // 随机播放模式：手动点击下一首是随机的
        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * totalSongs)
        } while (randomIndex === currentIndex && totalSongs > 1)
        console.log('Shoka Player: 手动点击 - 随机播放模式，下一首:', randomIndex)
        return randomIndex
        
      case 1: // 列表循环模式：手动点击下一首是列表的下一首
        const nextIndex = (currentIndex + 1) % totalSongs
        console.log('Shoka Player: 手动点击 - 列表循环模式，下一首:', nextIndex)
        return nextIndex
        
      default:
        return (currentIndex + 1) % totalSongs
    }
  }
  
  /**
   * 播放上一首歌曲
   */
  playPreviousSong() {
    const previousIndex = this.getPreviousSongIndex()
    if (previousIndex !== null && this.aplayer) {
      this.aplayer.list.switch(previousIndex)
      console.log('Shoka Player: 播放上一首歌曲', previousIndex)
      
      // 延迟执行定位，确保歌曲切换完成
      setTimeout(() => {
        this.locateCurrentSong()
        console.log('Shoka Player: 播放上一首后执行定位')
      }, 200)
    } else {
      console.log('Shoka Player: 没有播放历史记录')
    }
  }
  
  /**
   * 播放下一首歌曲（用于自动播放）
   */
  playNextSong() {
    if (!this.aplayer) return
    
    console.log('Shoka Player: playNextSong 开始执行', {
      currentLoopMode: this.currentLoopMode,
      currentSongIndex: this.aplayer.list.index,
      totalSongs: this.aplayer.list.audios.length
    })
    
    const nextIndex = this.getNextSongIndex()
    console.log('Shoka Player: getNextSongIndex 返回:', nextIndex)
    
    // 切换到下一首歌曲
    console.log('Shoka Player: 执行切歌逻辑，切换到索引:', nextIndex)
    this.aplayer.list.switch(nextIndex)
    console.log('Shoka Player: 自动播放下一首歌曲', nextIndex)
    
    // 延迟执行定位，确保歌曲切换完成
    setTimeout(() => {
      this.locateCurrentSong()
      console.log('Shoka Player: 自动切歌后执行定位')
    }, 200)
  }

  /**
   * 手动播放下一首歌曲
   */
  playNextSongManual() {
    if (!this.aplayer) return
    
    const nextIndex = this.getNextSongIndexForManual()
    this.aplayer.list.switch(nextIndex)
    console.log('Shoka Player: 手动播放下一首歌曲', nextIndex)
    
    // 延迟执行定位，确保歌曲切换完成
    setTimeout(() => {
      this.locateCurrentSong()
      console.log('Shoka Player: 手动切歌后执行定位')
    }, 200)
  }
  
  /**
   * 切换循环模式
   */
  toggleLoopMode() {
    if (!this.aplayer) return
    
    // 切换循环模式：随机播放 -> 列表循环 -> 随机播放
    this.currentLoopMode = (this.currentLoopMode + 1) % 2
    
    // 禁用APlayer的自动循环，完全由我们控制
    this.aplayer.list.loop = 'none'
    
    // 更新UI显示
    this.updateLoopModeUI()
    
    console.log('Shoka Player: 切换循环模式', this.currentLoopMode, '禁用APlayer自动循环')
  }
  
  /**
   * 更新循环模式UI显示
   */
  updateLoopModeUI() {
    const musicPanel = document.getElementById('shoka-music-panel')
    if (!musicPanel) return
    
    const shuffleBtn = musicPanel.querySelector('.shuffle-btn')
    if (!shuffleBtn) return
    
    const icon = shuffleBtn.querySelector('i')
    
    switch (this.currentLoopMode) {
      case 0: // 随机播放
        icon.className = 'fas fa-random'
        shuffleBtn.title = '随机播放'
        break
      case 1: // 列表循环
        icon.className = 'fas fa-list-ul'
        shuffleBtn.title = '列表循环'
        break
    }
  }
  
  /**
   * 处理播放结束事件
   */
  handlePlayEnd() {
    console.log('Shoka Player: 播放结束事件触发', {
      currentLoopMode: this.currentLoopMode,
      currentSongIndex: this.aplayer ? this.aplayer.list.index : '无',
      aplayerLoopMode: this.aplayer ? this.aplayer.list.loop : '无'
    })
    
    // 根据循环模式自动播放下一首
    setTimeout(() => {
      console.log('Shoka Player: 延迟执行 playNextSong')
      this.playNextSong()
    }, 100) // 延迟一点时间确保状态更新
  }

  // 销毁方法
  destroy() {
    this.stopLyricsSyncTimer()
    // 清除定时器
    clearTimeout(this.popupTimer)
    
    // 移除事件监听器
    if (this.handleScroll) {
      window.removeEventListener('scroll', this.handleScroll)
    }
    
    // 移除全局点击事件监听器
    if (this.handleGlobalClick) {
      document.removeEventListener('click', this.handleGlobalClick)
    }
    
    // 移除 DOM 元素
    if (this.centerBtn && this.centerBtn.parentNode) {
      this.centerBtn.parentNode.removeChild(this.centerBtn)
    }
    if (this.popup && this.popup.parentNode) {
      this.popup.parentNode.removeChild(this.popup)
    }
    if (this.sidebar && this.sidebar.parentNode) {
      this.sidebar.parentNode.removeChild(this.sidebar)
    }
    
    // 移除音乐面板
    const musicPanel = document.getElementById('shoka-music-panel')
    if (musicPanel && musicPanel.parentNode) {
      musicPanel.parentNode.removeChild(musicPanel)
    }
    
    // 重置状态
    this.isPlaying = false
    this.currentSong = null
    this.popupTimer = null
    this.lastScrollTop = 0
    this.isScrolled = false
    this.aplayer = null
    this.centerBtn = null
    this.popup = null
    this.sidebar = null
  }
}

// 全局变量
window.shokaPlayer = null

// 初始化函数
function initShokaPlayer() {
  if (!window.shokaPlayer) {
    window.shokaPlayer = new ShokaPlayer()
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化，确保 meting-js 已加载
  setTimeout(() => {
    initShokaPlayer()
  }, 1500)
})

// 监听主题切换事件
document.addEventListener('themeChange', () => {
  // 主题切换时重新初始化
  if (window.shokaPlayer) {
    window.shokaPlayer.destroy()
    window.shokaPlayer = null
  }
  setTimeout(() => {
    initShokaPlayer()
  }, 500)
})

// 监听主题切换完成事件
document.addEventListener('DOMContentLoaded', () => {
  // 监听主题切换的多种事件
  const themeEvents = ['themeChange', 'theme:change', 'theme-switch']
  
  themeEvents.forEach(eventName => {
    document.addEventListener(eventName, () => {
      // 延迟更新音量滑块颜色，确保主题切换完成
      setTimeout(() => {
        if (window.shokaPlayer) {
          window.shokaPlayer.updateVolumeSliderTheme()
        }
      }, 100)
    })
  })
  
  // 使用 MutationObserver 监听 data-theme 属性变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        // 延迟更新音量滑块颜色，确保主题切换完成
        setTimeout(() => {
          if (window.shokaPlayer) {
            window.shokaPlayer.updateVolumeSliderTheme()
          }
        }, 100)
      }
    })
  })
  
  // 开始监听 document.documentElement 的 data-theme 属性变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

// 新增：全局调试函数
window.debugShokaPlayerLyrics = function() {
  if (window.shokaPlayer) {
    window.shokaPlayer.debugLyricsStatus()
  } else {
    console.log('Shoka Player 未初始化')
  }
}

window.forceUpdateShokaPlayerLyrics = function() {
  if (window.shokaPlayer) {
    window.shokaPlayer.forceUpdateLyrics()
  } else {
    console.log('Shoka Player 未初始化')
  }
}

// 新增：播放控制调试函数
window.debugShokaPlayerPlayControl = function() {
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer) {
    console.log('Shoka Player: 播放器未初始化')
    return
  }
  
  console.log('Shoka Player: 播放控制信息', {
    currentLoopMode: shokaPlayer.currentLoopMode,
    playHistory: shokaPlayer.playHistory,
    currentSongIndex: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.index : 'N/A',
    totalSongs: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.audios.length : 'N/A',
    isPlaying: shokaPlayer.isPlaying
  })
  
  // 显示循环模式说明
  const modeNames = ['随机播放', '单曲循环', '列表循环']
  console.log('Shoka Player: 当前循环模式:', modeNames[shokaPlayer.currentLoopMode])
}

window.testShokaPlayerNextSong = function() {
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer) {
    console.log('Shoka Player: 播放器未初始化')
    return
  }
  
  const nextIndex = shokaPlayer.getNextSongIndex()
  console.log('Shoka Player: 测试下一首歌曲索引:', nextIndex)
}

// 新增：定位按钮调试函数
window.debugShokaPlayerLocateBtn = function() {
  const musicPanel = document.getElementById('shoka-music-panel')
  if (!musicPanel) {
    console.log('Shoka Player: 音乐面板不存在')
    return
  }
  
  const locateBtn = musicPanel.querySelector('.locate-btn')
  if (!locateBtn) {
    console.log('Shoka Player: 定位按钮不存在')
    return
  }
  
  console.log('Shoka Player: 定位按钮信息', {
    exists: !!locateBtn,
    visible: locateBtn.offsetParent !== null,
    position: {
      top: locateBtn.offsetTop,
      left: locateBtn.offsetLeft,
      width: locateBtn.offsetWidth,
      height: locateBtn.offsetHeight
    },
    style: {
      display: locateBtn.style.display,
      visibility: locateBtn.style.visibility,
      opacity: locateBtn.style.opacity,
      zIndex: locateBtn.style.zIndex
    },
    computedStyle: {
      display: getComputedStyle(locateBtn).display,
      visibility: getComputedStyle(locateBtn).visibility,
      opacity: getComputedStyle(locateBtn).opacity,
      zIndex: getComputedStyle(locateBtn).zIndex
    }
  })
  
  // 尝试点击定位按钮
  console.log('Shoka Player: 尝试点击定位按钮')
  locateBtn.click()
}

// 新增：强制显示定位按钮
window.forceShowLocateBtn = function() {
  const musicPanel = document.getElementById('shoka-music-panel')
  if (!musicPanel) {
    console.log('Shoka Player: 音乐面板不存在')
    return
  }
  
  const locateBtn = musicPanel.querySelector('.locate-btn')
  if (!locateBtn) {
    console.log('Shoka Player: 定位按钮不存在')
    return
  }
  
  // 强制设置样式
  locateBtn.style.display = 'flex'
  locateBtn.style.visibility = 'visible'
  locateBtn.style.opacity = '1'
  locateBtn.style.zIndex = '9999'
  locateBtn.style.position = 'absolute'
  locateBtn.style.bottom = '10px'
  locateBtn.style.right = '10px'
  locateBtn.style.width = '40px'
  locateBtn.style.height = '40px'
  locateBtn.style.background = '#ff0066'
  locateBtn.style.border = '3px solid #ffffff'
  locateBtn.style.borderRadius = '50%'
  locateBtn.style.cursor = 'pointer'
  locateBtn.style.alignItems = 'center'
  locateBtn.style.justifyContent = 'center'
  locateBtn.style.boxShadow = '0 4px 16px rgba(255, 0, 102, 0.6)'
  
  console.log('Shoka Player: 强制显示定位按钮完成')
}

// 新增：创建测试定位按钮
window.createTestLocateBtn = function() {
  // 移除已存在的测试按钮
  const existingBtn = document.getElementById('test-locate-btn')
  if (existingBtn) {
    existingBtn.remove()
  }
  
  // 创建新的测试按钮
  const testBtn = document.createElement('button')
  testBtn.id = 'test-locate-btn'
  testBtn.innerHTML = '<i class="fas fa-crosshairs"></i>'
  testBtn.title = '测试定位按钮'
  testBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #e0e0e0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: #ff0000;
  `
  
  testBtn.addEventListener('click', () => {
    console.log('Shoka Player: 测试定位按钮被点击')
    alert('测试定位按钮工作正常！')
  })
  
  document.body.appendChild(testBtn)
  console.log('Shoka Player: 测试定位按钮创建完成')
}

// 全局调试函数
window.debugShokaPlayerTime = function() {
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer || !shokaPlayer.aplayer) {
    console.log('Shoka Player: 播放器未初始化')
    return
  }
  
  const currentTime = shokaPlayer.aplayer.audio.currentTime || 0
  const totalDuration = shokaPlayer.aplayer.audio.duration || 0
  
  console.log('Shoka Player: 时间信息', {
    currentTime: currentTime,
    totalDuration: totalDuration,
    formattedTime: `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${Math.floor(currentTime % 60).toString().padStart(2, '0')}`,
    isPlaying: shokaPlayer.isPlaying
  })
  
  // 检查音乐面板中的歌词显示
  const musicPanel = document.getElementById('shoka-music-panel')
  if (musicPanel) {
    const currentLyric = musicPanel.querySelector('.current-lyric')
    if (currentLyric) {
      console.log('Shoka Player: 当前歌词显示', {
        textContent: currentLyric.textContent,
        hasTimePrefix: currentLyric.textContent.startsWith('[')
      })
    }
  }
}

window.forceUpdateShokaPlayerTime = function() {
  const shokaPlayer = window.shokaPlayer
  if (shokaPlayer) {
    shokaPlayer.updateLyrics()
    console.log('Shoka Player: 强制更新歌词完成')
  }
}

// 新增：播放列表调试函数
window.debugShokaPlayerPlaylist = function() {
  const musicPanel = document.getElementById('shoka-music-panel')
  if (!musicPanel) {
    console.log('Shoka Player: 音乐面板不存在')
    return
  }
  
  const playlistItems = musicPanel.querySelector('.playlist-items')
  if (!playlistItems) {
    console.log('Shoka Player: 播放列表容器不存在')
    return
  }
  
  const items = playlistItems.querySelectorAll('.playlist-item')
  console.log('Shoka Player: 播放列表信息', {
    totalItems: items.length,
    containerHeight: playlistItems.offsetHeight,
    scrollHeight: playlistItems.scrollHeight,
    clientHeight: playlistItems.clientHeight,
    canScroll: playlistItems.scrollHeight > playlistItems.clientHeight
  })
  
  // 检查最后几首歌是否可见
  if (items.length > 0) {
    const lastItem = items[items.length - 1]
    const lastItemRect = lastItem.getBoundingClientRect()
    const containerRect = playlistItems.getBoundingClientRect()
    
    console.log('Shoka Player: 最后一首歌位置信息', {
      lastItemBottom: lastItemRect.bottom,
      containerBottom: containerRect.bottom,
      isLastItemVisible: lastItemRect.bottom <= containerRect.bottom
    })
  }
}

// 新增：专辑图片调试函数
window.debugShokaPlayerAlbumArt = function() {
  const musicPanel = document.getElementById('shoka-music-panel')
  if (!musicPanel) {
    console.log('Shoka Player: 音乐面板不存在')
    return
  }
  
  const albumImg = musicPanel.querySelector('.album-img')
  if (!albumImg) {
    console.log('Shoka Player: 专辑图片元素不存在')
    return
  }
  
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer || !shokaPlayer.aplayer) {
    console.log('Shoka Player: APlayer未初始化')
    return
  }
  
  const currentSong = shokaPlayer.aplayer.list.audios[shokaPlayer.aplayer.list.index]
  
  console.log('Shoka Player: 专辑图片信息', {
    currentSongIndex: shokaPlayer.aplayer.list.index,
    currentSongName: currentSong ? currentSong.name : '无',
    currentSongArtist: currentSong ? currentSong.artist : '无',
    currentSongCover: currentSong ? currentSong.cover : '无',
    albumImgSrc: albumImg.src,
    albumImgAlt: albumImg.alt,
    albumImgWidth: albumImg.offsetWidth,
    albumImgHeight: albumImg.offsetHeight,
    albumImgVisible: albumImg.offsetWidth > 0 && albumImg.offsetHeight > 0
  })
}

// 新增：播放控制逻辑测试函数
window.testShokaPlayerPlayControl = function() {
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer) {
    console.log('Shoka Player: 播放器未初始化')
    return
  }
  
  console.log('Shoka Player: 播放控制逻辑测试', {
    currentLoopMode: shokaPlayer.currentLoopMode,
    currentSongIndex: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.index : '无',
    totalSongs: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.audios.length : 0,
    playHistory: shokaPlayer.playHistory
  })
  
  // 测试自动播放下一首逻辑
  const autoNextIndex = shokaPlayer.getNextSongIndex()
  console.log('Shoka Player: 自动播放下一首索引:', autoNextIndex)
  
  // 测试手动播放下一首逻辑
  const manualNextIndex = shokaPlayer.getNextSongIndexForManual()
  console.log('Shoka Player: 手动播放下一首索引:', manualNextIndex)
}

// 新增：自动播放逻辑测试函数
window.testShokaPlayerAutoPlay = function() {
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer) {
    console.log('Shoka Player: 播放器未初始化')
    return
  }
  
  console.log('Shoka Player: 自动播放逻辑测试', {
    currentLoopMode: shokaPlayer.currentLoopMode,
    currentSongIndex: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.index : '无',
    currentTime: shokaPlayer.aplayer ? shokaPlayer.aplayer.audio.currentTime : '无',
    duration: shokaPlayer.aplayer ? shokaPlayer.aplayer.audio.duration : '无'
  })
  
  // 模拟播放结束事件
  console.log('Shoka Player: 模拟播放结束事件')
  shokaPlayer.handlePlayEnd()
}

// 新增：循环模式检查函数
window.checkShokaPlayerLoopMode = function() {
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer) {
    console.log('Shoka Player: 播放器未初始化')
    return
  }
  
  console.log('Shoka Player: 循环模式检查', {
    ourLoopMode: shokaPlayer.currentLoopMode,
    aplayerLoopMode: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.loop : '无',
    currentSongIndex: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.index : '无',
    totalSongs: shokaPlayer.aplayer ? shokaPlayer.aplayer.list.audios.length : 0
  })
  
  // 强制设置APlayer循环模式为none
  if (shokaPlayer.aplayer) {
    shokaPlayer.aplayer.list.loop = 'none'
    console.log('Shoka Player: 已强制设置APlayer循环模式为none')
  }
}

// 新增：强制设置循环模式函数
window.forceShokaPlayerLoopMode = function(mode) {
  const shokaPlayer = window.shokaPlayer
  if (!shokaPlayer) {
    console.log('Shoka Player: 播放器未初始化')
    return
  }
  
  if (mode < 0 || mode > 2) {
    console.log('Shoka Player: 循环模式无效，请输入 0(随机)、1(单曲)、2(列表)')
    return
  }
  
  shokaPlayer.currentLoopMode = mode
  shokaPlayer.aplayer.list.loop = 'none'
  shokaPlayer.updateLoopModeUI()
  
  console.log('Shoka Player: 强制设置循环模式为', mode, {
    0: '随机播放',
    1: '单曲循环', 
    2: '列表循环'
  }[mode])
}

// 导出类供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShokaPlayer
}
