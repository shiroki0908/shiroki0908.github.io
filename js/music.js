class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.isLyricsVisible = false;
        this.currentAplayer = null;
        this.currentSong = null;
        this.lyricEventsBound = false;
        this.init();
    }

    init() {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        this.initVinylPlayer();
        this.getCustomPlayList();
        this.addEventListeners();
    }

    getCustomPlayList() {
        this.changeMusicBg(false);
    }

    addEventListeners() {
        document.addEventListener("keydown", this.handleKeydown.bind(this));
        
        // 原有的PC端事件（保持原有交互）
        const aplayerList = document.querySelector(".aplayer-list");
        const aplayerLrc = document.querySelector(".aplayer-lrc");
        
        if (aplayerLrc && !aplayerLrc.dataset.clickBound) {
            aplayerLrc.addEventListener("click", () => {
                aplayerList.classList.toggle("aplayer-list-hide");
            });
            aplayerLrc.dataset.clickBound = true;
        }

        // 手机端事件
        this.addMobileEventListeners();
    }

    addMobileEventListeners() {
        // 检查是否为移动端（屏幕宽度小于798px），确保手机端功能只在移动端生效
        if (window.innerWidth > 798) {
            return; // 非移动端直接返回
        }
        
        // 手机端播放控制按钮（现在在固定控制栏中）
        const mobilePlayBtn = document.querySelector('.mobile-player-controls .mobile-control-btn.play-btn');
        const mobilePrevBtn = document.querySelector('.mobile-player-controls .mobile-control-btn.prev-btn');
        const mobileNextBtn = document.querySelector('.mobile-player-controls .mobile-control-btn.next-btn');
        const mobileRepeatBtn = document.querySelector('.mobile-player-controls .mobile-control-btn.repeat-btn');
        const mobileListBtn = document.querySelector('.mobile-player-controls .mobile-control-btn.list-btn');

        if (mobilePlayBtn) {
            mobilePlayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 添加按钮点击的视觉反馈
                mobilePlayBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    mobilePlayBtn.style.transform = '';
                }, 150);
                
                this.togglePlayback();
            }, { passive: false });
        }
        if (mobilePrevBtn) {
            mobilePrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 添加按钮点击的视觉反馈
                mobilePrevBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    mobilePrevBtn.style.transform = '';
                }, 150);
                
                this.previousSong();
            }, { passive: false });
        }
        if (mobileNextBtn) {
            mobileNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 添加按钮点击的视觉反馈
                mobileNextBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    mobileNextBtn.style.transform = '';
                }, 150);
                
                this.nextSong();
            }, { passive: false });
        }
        if (mobileRepeatBtn) {
            mobileRepeatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 添加按钮点击的视觉反馈
                mobileRepeatBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    mobileRepeatBtn.style.transform = '';
                }, 150);
                
                this.toggleRepeatMode();
            }, { passive: false });
        }
        if (mobileListBtn) {
            mobileListBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 添加按钮点击的视觉反馈
                mobileListBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    mobileListBtn.style.transform = '';
                }, 150);
                
                this.toggleMobilePlaylist();
            }, { passive: false });
        }

        // 手机端进度条（现在在固定控制栏中）
        const mobileProgressBar = document.querySelector('.mobile-player-controls .mobile-progress-bar');
        if (mobileProgressBar) {
            mobileProgressBar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.seekMobile(e);
            }, { passive: false });
            mobileProgressBar.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.startDrag(e);
            }, { passive: false });
            mobileProgressBar.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startDrag(e);
            }, { passive: false });
        }

        // 延迟绑定歌词切换事件，确保DOM完全加载
        setTimeout(() => {
            this.bindLyricToggleEvents();
        }, 100);
    }

    bindLyricToggleEvents() {
        // 防止重复绑定
        if (this.lyricEventsBound) {
            console.log('歌词事件已绑定，跳过');
            return;
        }

        // 等待DOM完全加载，最多尝试10次
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryBind = () => {
            attempts++;
            console.log(`尝试绑定歌词事件 (第${attempts}次)`);
            
            // 手机端点击区域切换歌词
            const mobileVinylRecord = document.querySelector('.mobile-vinyl-record');
            const mobileVinylNeedle = document.querySelector('.mobile-vinyl-needle');
            const mobileAlbumCover = document.querySelector('.mobile-album-cover');
            const mobileLyricView = document.querySelector('.mobile-lyric-view');
            
            console.log('DOM元素检查:', {
                mobileVinylRecord: !!mobileVinylRecord,
                mobileVinylNeedle: !!mobileVinylNeedle,
                mobileAlbumCover: !!mobileAlbumCover,
                mobileLyricView: !!mobileLyricView
            });
            
            // 如果所有元素都存在，则绑定事件
            if (mobileVinylRecord && mobileVinylNeedle && mobileAlbumCover && mobileLyricView) {
                console.log('所有元素找到，开始绑定事件');
                
                // 唱片点击
                mobileVinylRecord.addEventListener('click', (e) => {
                    console.log('唱片被点击');
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileLyrics();
                });
                
                // 唱针点击
                mobileVinylNeedle.addEventListener('click', (e) => {
                    console.log('唱针被点击');
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileLyrics();
                });
                
                // 专辑图点击
                mobileAlbumCover.addEventListener('click', (e) => {
                    console.log('专辑图被点击');
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileLyrics();
                });
                
                // 手机端歌词点击返回唱片
                mobileLyricView.addEventListener('click', (e) => {
                    console.log('歌词区域被点击');
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileLyrics();
                });
                
                this.lyricEventsBound = true;
                console.log('歌词事件绑定完成');
                return;
            }
            
            // 如果元素不全或达到最大尝试次数，重试或放弃
            if (attempts < maxAttempts) {
                console.log(`部分元素未找到，${attempts < maxAttempts ? '500ms后重试' : '放弃绑定'}`);
                setTimeout(tryBind, 500);
            } else {
                console.error('达到最大尝试次数，歌词事件绑定失败');
            }
        };
        
        tryBind();
    }

    changeMusicBg(isChangeBg = true) {
        const musicBg = document.getElementById("Music-bg");
        const musicLoading = document.getElementsByClassName("Music-loading")[0];

        isChangeBg ? this.updateBackgroundImage(musicBg) : this.setLoadingScreen(musicLoading, musicBg);
    }

    updateBackgroundImage(element) {
        const musicCover = document.querySelector("#Music-page .aplayer-pic");
        const img = new Image();
        img.src = this.extractValue(musicCover.style.backgroundImage);
        img.onload = () => {
            element.style.backgroundImage = musicCover.style.backgroundImage;
            element.className = 'show';
        };
    }

    setLoadingScreen(loadingElement, backgroundElement) {
        const timer = setInterval(() => {
            this.addEventListeners();
            const musicCover = document.querySelector("#Music-page .aplayer-pic");
            if (musicCover) {
                loadingElement.style.display = "none";
                clearInterval(timer);
                this.addEventListenerChangeMusicBg();
                backgroundElement.style.display = "block";
            }
        }, 100);
    }

    extractValue(input) {
        const match = /url\("([^"]+)"\)/.exec(input);
        return match ? match[1] : '';
    }

    addEventListenerChangeMusicBg() {
        const aplayer = document.querySelector("#Music-page meting-js").aplayer;
        aplayer.on('loadeddata', () => this.changeMusicBg(true));
        aplayer.on('timeupdate', this.lrcUpdate.bind(this));
    }

    lrcUpdate() {
        const aplayerLrcContents = document.querySelector('.aplayer-lrc-contents');
        const currentLrc = aplayerLrcContents.querySelector('p.aplayer-lrc-current');
        if (currentLrc) {
            const currentIndex = Array.from(aplayerLrcContents.children).indexOf(currentLrc);
            aplayerLrcContents.style.transform = `translateY(${-currentIndex * 80}px)`;
        }
    }

    handleKeydown(event) {
        const aplayer = document.querySelector('meting-js').aplayer;
        const actions = {
            "Space": () => aplayer.toggle(),
            "ArrowRight": () => aplayer.skipForward(),
            "ArrowLeft": () => aplayer.skipBack(),
            "ArrowUp": () => { if (aplayer.volume < 1) aplayer.volume(aplayer.volume + 0.1); },
            "ArrowDown": () => { if (aplayer.volume > 0) aplayer.volume(aplayer.volume - 0.1); }
        };

        if (actions[event.code]) {
            event.preventDefault();
            actions[event.code]();
        }
    }



    initVinylPlayer() {
        // 等待原始播放器加载
        const timer = setInterval(() => {
            const aplayer = document.querySelector('#Music-page meting-js');
            if (aplayer && aplayer.aplayer) {
                this.currentAplayer = aplayer.aplayer;
                this.setupVinylPlayerEvents();
                this.updateVinylInfo();
                // 确保在播放器初始化后重新绑定歌词事件
                this.bindLyricToggleEvents();
                clearInterval(timer);
            }
        }, 100);
    }

    setupVinylPlayerEvents() {
        if (!this.currentAplayer) return;

        // 监听播放状态变化
        this.currentAplayer.on('play', () => {
            this.startVinylAnimation();
            // 确保播放时歌词内容是最新的
            setTimeout(() => {
                this.updateMobileLyricContent();
            }, 100);
        });

        this.currentAplayer.on('pause', () => {
            this.stopVinylAnimation();
        });

        this.currentAplayer.on('ended', () => {
            this.stopVinylAnimation();
        });

        // 监听歌曲切换
        this.currentAplayer.on('loadeddata', () => {
            this.changeMusicBg(true);
            this.updateVinylInfo();
            this.updatePlaylistStatus();
            // 减少延迟更新歌词内容，确保歌词已加载
            setTimeout(() => {
                this.updateMobileLyricContent();
            }, 100); // 从500ms减少到100ms
        });
        
        // 监听歌词显示事件
        this.currentAplayer.on('lrcshow', () => {
            setTimeout(() => {
                this.updateMobileLyricContent();
            }, 100);
        });

        // 监听歌词更新和手机端进度更新
        this.currentAplayer.on('timeupdate', () => {
            this.lrcUpdate();
            this.updateMobileLyricView(); // 更新为新的方法名
            this.updateMobileProgress();
            this.updatePlaylistProgress();
        });
    }

    togglePlayback() {
        if (!this.currentAplayer) return;

        if (this.isPlaying) {
            this.currentAplayer.pause();
        } else {
            this.currentAplayer.play();
        }
    }

    startVinylAnimation() {
        this.isPlaying = true;
        // 手机端唱片旋转动画
        const mobileVinylRecord = document.querySelector('.mobile-vinyl-record');
        if (mobileVinylRecord) {
            // 记录开始播放的时间
            if (!mobileVinylRecord.dataset.playStartTime) {
                mobileVinylRecord.dataset.playStartTime = Date.now();
            }
            mobileVinylRecord.classList.add('playing');
            // 恢复动画播放
            mobileVinylRecord.style.animationPlayState = 'running';
        }
        
        // 手机端指针动画
        const mobileVinylNeedle = document.querySelector('.mobile-vinyl-needle');
        if (mobileVinylNeedle) mobileVinylNeedle.classList.add('playing');

        // 更新播放按钮图标
        this.updatePlayButtonIcon(true);
    }

    stopVinylAnimation() {
        this.isPlaying = false;
        // 手机端唱片停止旋转 - 停在当前位置
        const mobileVinylRecord = document.querySelector('.mobile-vinyl-record');
        if (mobileVinylRecord) {
            // 暂停动画，但保持在当前位置
            mobileVinylRecord.style.animationPlayState = 'paused';
        }
        
        // 手机端指针离开唱片
        const mobileVinylNeedle = document.querySelector('.mobile-vinyl-needle');
        if (mobileVinylNeedle) mobileVinylNeedle.classList.remove('playing');

        // 更新播放按钮图标
        this.updatePlayButtonIcon(false);
    }

    updatePlayButtonIcon(isPlaying) {
        const playBtnIcon = document.querySelector('.mobile-player-controls .mobile-control-btn.play-btn i');
        if (playBtnIcon) {
            playBtnIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    updateVinylInfo() {
        if (!this.currentAplayer || !this.currentAplayer.list.audios[this.currentAplayer.list.index]) return;

        const currentSong = this.currentAplayer.list.audios[this.currentAplayer.list.index];
        this.currentSong = currentSong;

        // 手机端歌曲信息
        const mobileTitleEl = document.querySelector('.mobile-song-title');
        const mobileArtistEl = document.querySelector('.mobile-artist-name');
        if (mobileTitleEl) mobileTitleEl.textContent = currentSong.name || 'Unknown Title';
        if (mobileArtistEl) mobileArtistEl.textContent = currentSong.artist || 'Unknown Artist';

        // 手机端专辑封面
        const mobileAlbumCover = document.querySelector('.mobile-album-cover');
        if (mobileAlbumCover && currentSong.cover) {
            mobileAlbumCover.style.backgroundImage = `url("${currentSong.cover}")`;
        }

        // 初始化循环模式图标
        this.updateRepeatModeIcon();
        
        // 如果歌词界面已打开，更新歌词内容
        if (this.isLyricsVisible) {
            this.updateMobileLyricContent();
        }
    }



    // 手机端专用方法
    previousSong() {
        if (!this.currentAplayer) return;
        
        // 添加按钮点击的视觉反馈
        const prevBtn = document.querySelector('.mobile-control-btn.prev-btn');
        if (prevBtn) {
            prevBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                prevBtn.style.transform = '';
            }, 150);
        }
        
        // 立即切换歌曲
        this.currentAplayer.list.switch(this.currentAplayer.list.index - 1);
        
        // 立即更新歌曲信息，不等待loadeddata事件
        setTimeout(() => {
            this.updateVinylInfo();
        }, 50);
    }

    nextSong() {
        if (!this.currentAplayer) return;
        
        // 添加按钮点击的视觉反馈
        const nextBtn = document.querySelector('.mobile-control-btn.next-btn');
        if (nextBtn) {
            nextBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                nextBtn.style.transform = '';
            }, 150);
        }
        
        // 立即切换歌曲
        this.currentAplayer.list.switch(this.currentAplayer.list.index + 1);
        
        // 立即更新歌曲信息，不等待loadeddata事件
        setTimeout(() => {
            this.updateVinylInfo();
        }, 50);
    }

    seekMobile(event) {
        if (!this.currentAplayer) return;
        
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const seekTime = percent * this.currentAplayer.audio.duration;
        
        this.currentAplayer.seek(seekTime);
    }

    updateMobileProgress() {
        if (!this.currentAplayer) return;

        const current = this.currentAplayer.audio.currentTime;
        const duration = this.currentAplayer.audio.duration;
        
        if (duration) {
            const percent = (current / duration) * 100;
            const progressCurrent = document.querySelector('.mobile-player-controls .mobile-progress-current');
            if (progressCurrent) {
                progressCurrent.style.width = `${percent}%`;
            }
        }

        // 更新时间显示
        const currentTimeEl = document.querySelector('.mobile-player-controls .mobile-current-time');
        const totalTimeEl = document.querySelector('.mobile-player-controls .mobile-total-time');
        
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(current);
        if (totalTimeEl && duration) totalTimeEl.textContent = this.formatTime(duration);
    }

    startDrag(event) {
        event.preventDefault();

        const progressBar = document.querySelector('.mobile-player-controls .mobile-progress-bar');
        const isDragging = true;

        const handleMove = (e) => {
            if (!isDragging) return;
            
            const rect = progressBar.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            
            if (this.currentAplayer && this.currentAplayer.audio.duration) {
                const seekTime = percent * this.currentAplayer.audio.duration;
                this.currentAplayer.seek(seekTime);
            }
        };

        const handleEnd = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    toggleRepeatMode() {
        if (!this.currentAplayer) return;
        
        const repeatBtn = document.querySelector('.mobile-control-btn.repeat-btn i');
        if (!repeatBtn) return;

        // 循环模式：列表循环 -> 单曲循环 -> 随机播放 -> 列表循环
        const currentOrder = this.currentAplayer.options.order;
        let newOrder;
        let newIcon;

        switch (currentOrder) {
            case 'list':
                newOrder = 'repeat';
                newIcon = 'fas fa-sync-alt'; // 单曲循环图标 - 使用不同的图标
                break;
            case 'repeat':
                newOrder = 'random';
                newIcon = 'fas fa-random'; // 随机播放图标
                break;
            case 'random':
                newOrder = 'list';
                newIcon = 'fas fa-redo'; // 列表循环图标
                break;
            default:
                newOrder = 'list';
                newIcon = 'fas fa-redo';
        }

        // 立即更新按钮图标，提供即时反馈
        repeatBtn.className = newIcon;
        
        // 立即更新播放器设置
        this.currentAplayer.options.order = newOrder;
        
        // 显示切换提示
        let modeText;
        switch (newOrder) {
            case 'list':
                modeText = '列表循环';
                break;
            case 'repeat':
                modeText = '单曲循环';
                break;
            case 'random':
                modeText = '随机播放';
                break;
        }
        
        // 添加按钮点击的视觉反馈
        const repeatBtnContainer = document.querySelector('.mobile-control-btn.repeat-btn');
        if (repeatBtnContainer) {
            repeatBtnContainer.style.transform = 'scale(0.9)';
            setTimeout(() => {
                repeatBtnContainer.style.transform = '';
            }, 150);
        }
        
        console.log(`已切换到：${modeText}`);
    }

    updateRepeatModeIcon() {
        if (!this.currentAplayer) return;
        
        const repeatBtn = document.querySelector('.mobile-player-controls .mobile-control-btn.repeat-btn i');
        if (!repeatBtn) return;

        const currentOrder = this.currentAplayer.options.order;
        let icon;

        switch (currentOrder) {
            case 'repeat':
                icon = 'fas fa-sync-alt'; // 单曲循环图标 - 使用不同的图标
                break;
            case 'random':
                icon = 'fas fa-random'; // 随机播放图标
                break;
            case 'list':
            default:
                icon = 'fas fa-redo'; // 列表循环图标
        }

        repeatBtn.className = icon;
    }

    toggleMobilePlaylist() {
        const playlistContainer = document.querySelector('.mobile-playlist-container');
        if (!playlistContainer) return;

        if (playlistContainer.classList.contains('show')) {
            this.hideMobilePlaylist();
        } else {
            this.showMobilePlaylist();
        }
    }

    showMobilePlaylist() {
        const playlistContainer = document.querySelector('.mobile-playlist-container');
        if (!playlistContainer) return;

        // 生成播放列表
        this.generatePlaylist();
        
        // 显示播放列表 - 减少延迟时间
        playlistContainer.classList.remove('hidden');
        setTimeout(() => {
            playlistContainer.classList.add('show');
        }, 5); // 从10ms减少到5ms

        // 添加事件监听
        this.addPlaylistEventListeners();
    }

    hideMobilePlaylist() {
        const playlistContainer = document.querySelector('.mobile-playlist-container');
        if (!playlistContainer) return;

        playlistContainer.classList.remove('show');
        setTimeout(() => {
            playlistContainer.classList.add('hidden');
        }, 150); // 从300ms减少到150ms

        // 移除事件监听
        this.removePlaylistEventListeners();
    }

    generatePlaylist() {
        if (!this.currentAplayer || !this.currentAplayer.list) return;

        const playlistList = document.querySelector('.mobile-playlist-list');
        if (!playlistList) return;

        const songs = this.currentAplayer.list.audios;
        const currentIndex = this.currentAplayer.list.index;

        playlistList.innerHTML = '';

        songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = 'mobile-playlist-item';
            if (index === currentIndex) {
                item.classList.add('playing');
            }
            item.dataset.index = index;

            item.innerHTML = `
                <div class="mobile-playlist-number">${index + 1}</div>
                <div class="mobile-playlist-info">
                    <span class="mobile-playlist-song">${song.name || '未知曲目'}</span><span class="mobile-playlist-artist">${song.artist || '未知艺术家'}</span>
                </div>
            `;

            // 添加点击事件
            item.addEventListener('click', () => {
                // 添加点击的视觉反馈
                item.style.transform = 'scale(0.95)';
                item.style.opacity = '0.8';
                setTimeout(() => {
                    item.style.transform = '';
                    item.style.opacity = '';
                }, 150);
                
                // 立即切换歌曲
                this.currentAplayer.list.switch(index);
                
                // 立即更新歌曲信息，不等待loadeddata事件
                setTimeout(() => {
                    this.updateVinylInfo();
                }, 50);
                
                // 快速关闭播放列表
                this.hideMobilePlaylist();
            });

            playlistList.appendChild(item);
        });
    }

    locateCurrentSong() {
        if (!this.currentAplayer) return;

        const currentIndex = this.currentAplayer.list.index;
        const playlistItems = document.querySelectorAll('.mobile-playlist-item');
        
        if (playlistItems[currentIndex]) {
            playlistItems[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    addPlaylistEventListeners() {
        // 点击播放列表外部关闭
        this.playlistOverlayHandler = (e) => {
            const playlistContainer = document.querySelector('.mobile-playlist-container');
            
            // 如果点击的不是播放列表内部任何元素，则关闭播放列表
            if (playlistContainer && !playlistContainer.contains(e.target)) {
                this.hideMobilePlaylist();
            }
        };
        
        // 定位按钮事件
        const locateBtn = document.querySelector('.mobile-playlist-locate');
        this.locateHandler = () => {
            // 添加按钮点击的视觉反馈
            if (locateBtn) {
                locateBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    locateBtn.style.transform = '';
                }, 150);
            }
            this.locateCurrentSong();
        };
        
        // 拖拽关闭事件
        const handle = document.querySelector('.mobile-playlist-handle');
        this.handleDragHandler = this.setupPlaylistDrag.bind(this);

        document.addEventListener('click', this.playlistOverlayHandler);
        if (locateBtn) locateBtn.addEventListener('click', this.locateHandler);
        if (handle) handle.addEventListener('mousedown', this.handleDragHandler);
        if (handle) handle.addEventListener('touchstart', this.handleDragHandler);
    }

    removePlaylistEventListeners() {
        document.removeEventListener('click', this.playlistOverlayHandler);
        
        const locateBtn = document.querySelector('.mobile-playlist-locate');
        if (locateBtn && this.locateHandler) {
            locateBtn.removeEventListener('click', this.locateHandler);
        }

        const handle = document.querySelector('.mobile-playlist-handle');
        if (handle && this.handleDragHandler) {
            handle.removeEventListener('mousedown', this.handleDragHandler);
            handle.removeEventListener('touchstart', this.handleDragHandler);
        }
    }

    setupPlaylistDrag(startEvent) {
        startEvent.preventDefault();
        const playlistContainer = document.querySelector('.mobile-playlist-container');
        if (!playlistContainer) return;

        const startY = startEvent.touches ? startEvent.touches[0].clientY : startEvent.clientY;
        const containerHeight = playlistContainer.offsetHeight;
        let currentY = 0;

        const handleMove = (moveEvent) => {
            const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
            currentY = clientY - startY;
            
            if (currentY > 0) { // 只允许向下拖拽
                const progress = Math.min(currentY / (containerHeight * 0.3), 1);
                playlistContainer.style.transform = `translateY(${currentY}px)`;
                playlistContainer.style.opacity = 1 - progress * 0.5;
            }
        };

        const handleEnd = () => {
            if (currentY > containerHeight * 0.15) { // 从0.2减少到0.15，更容易关闭
                this.hideMobilePlaylist();
            } else {
                playlistContainer.style.transform = 'translateY(0)';
                playlistContainer.style.opacity = '1';
            }

            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
    }

    updatePlaylistProgress() {
        if (!this.currentAplayer) return;

        const currentItem = document.querySelector('.mobile-playlist-item.playing');
        if (currentItem && this.currentAplayer.audio.duration) {
            const progress = (this.currentAplayer.audio.currentTime / this.currentAplayer.audio.duration) * 100;
            currentItem.style.setProperty('--progress', `${progress}%`);
        }
    }

    updatePlaylistStatus() {
        if (!this.currentAplayer) return;

        const playlistItems = document.querySelectorAll('.mobile-playlist-item');
        const currentIndex = this.currentAplayer.list.index;

        playlistItems.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('playing');
                item.style.setProperty('--progress', '0%'); // 重置进度
            } else {
                item.classList.remove('playing');
                item.style.removeProperty('--progress');
            }
        });
    }



    // 手机端歌词方法
    showMobileLyrics() {
        const mobileLyricsContainer = document.querySelector('.mobile-lyrics-container');
        if (mobileLyricsContainer) {
            mobileLyricsContainer.classList.remove('hidden');
        }
        this.updateMobileLyrics();
    }

    hideMobileLyrics() {
        const mobileLyricsContainer = document.querySelector('.mobile-lyrics-container');
        if (mobileLyricsContainer) {
            mobileLyricsContainer.classList.add('hidden');
        }
    }

    updateMobileLyrics() {
        if (!this.currentAplayer) return;

        const mobileLyricsContent = document.querySelector('.mobile-lyrics-content');
        if (!mobileLyricsContent) return;

        // 获取当前歌曲的歌词
        const lrcContainer = document.querySelector('.aplayer-lrc-contents');
        if (lrcContainer) {
            const lrcLines = lrcContainer.querySelectorAll('p');
            mobileLyricsContent.innerHTML = '';
            
            lrcLines.forEach(line => {
                const p = document.createElement('p');
                p.textContent = line.textContent;
                p.setAttribute('data-time', line.getAttribute('data-time') || '0');
                mobileLyricsContent.appendChild(p);
            });
        } else {
            mobileLyricsContent.innerHTML = '<p>暂无歌词</p>';
        }
    }

    // 旧方法已移除，功能合并到updateMobileLyricView中

    // 手机端歌词显示切换
    toggleMobileLyrics() {
        // 检查是否为移动端
        if (window.innerWidth > 798) {
            console.log('非移动端，跳过歌词切换');
            return;
        }
        
        console.log('toggleMobileLyrics 被调用, 当前状态:', this.isLyricsVisible);
        
        const vinylContainer = document.querySelector('.mobile-vinyl-container');
        const lyricView = document.querySelector('.mobile-lyric-view');
        const musicInfo = document.querySelector('.mobile-music-info');
        
        console.log('DOM元素检查:', {
            vinylContainer: !!vinylContainer,
            lyricView: !!lyricView,
            musicInfo: !!musicInfo
        });
        
        if (!vinylContainer || !lyricView) {
            console.error('缺少必要的DOM元素');
            return;
        }
        
        this.isLyricsVisible = !this.isLyricsVisible;
        console.log('切换到状态:', this.isLyricsVisible);
        
        if (this.isLyricsVisible) {
            // 显示歌词，隐藏唱片容器和歌曲信息
            console.log('显示歌词模式');
            vinylContainer.style.display = 'none';
            musicInfo.style.display = 'none';
            lyricView.classList.add('show');
            
            // 更新歌词内容
            this.updateMobileLyricContent();
        } else {
            // 显示唱片，隐藏歌词
            console.log('显示唱片模式');
            vinylContainer.style.display = 'flex';
            musicInfo.style.display = 'block';
            lyricView.classList.remove('show');
            
            // 恢复唱片动画状态
            this.restoreVinylAnimationState();
        }
    }

    // 更新手机端歌词视图内容
    updateMobileLyricContent() {
        if (!this.currentAplayer || !this.currentAplayer.list) {
            console.log('歌词内容更新失败: 播放器或歌单不存在');
            return;
        }

        const currentSong = this.currentAplayer.list.audios[this.currentAplayer.list.index];
        if (!currentSong) {
            console.log('歌词内容更新失败: 当前歌曲不存在');
            return;
        }

        console.log('更新歌词内容:', {
            songName: currentSong.name,
            artist: currentSong.artist,
            currentIndex: this.currentAplayer.list.index
        });

        // 更新歌曲信息
        const songTitle = document.querySelector('.mobile-lyric-song-title');
        const artistName = document.querySelector('.mobile-lyric-artist-name');
        const lyricWrapper = document.querySelector('.mobile-lyric-wrapper');

        if (songTitle) songTitle.textContent = currentSong.name || '未知曲目';
        if (artistName) artistName.textContent = currentSong.artist || '未知艺术家';

        // 获取歌词
        const aplayerLrc = document.querySelector('.aplayer-lrc-contents');
        // 简化的调试信息
        if (window.innerWidth <= 798) {
            console.log('手机端歌词更新:', {
                hasLyricContainer: !!aplayerLrc,
                lrcLines: aplayerLrc ? aplayerLrc.children.length : 0
            });
        }
        
        if (lyricWrapper) {
            lyricWrapper.innerHTML = '';
            
            if (aplayerLrc && aplayerLrc.children.length > 0) {
                // 添加一些空行在开始，让第一行歌词能在屏幕中央显示
                for (let i = 0; i < 6; i++) {
                    const spacer = document.createElement('p');
                    spacer.textContent = '';
                    spacer.className = 'lyric-spacer';
                    spacer.setAttribute('data-time', '-1');
                    lyricWrapper.appendChild(spacer);
                }
                
                Array.from(aplayerLrc.children).forEach((lrcLine, index) => {
                    const p = document.createElement('p');
                    p.textContent = lrcLine.textContent;
                    const timeAttr = lrcLine.getAttribute('data-time') || '0';
                    p.setAttribute('data-time', timeAttr);
                    lyricWrapper.appendChild(p);
                    
                    // 调试信息：打印前几行歌词的时间数据
                    if (index < 5) {
                        console.log(`歌词行 ${index}:`, {
                            text: lrcLine.textContent.substring(0, 30),
                            dataTime: timeAttr,
                            parsedTime: parseFloat(timeAttr)
                        });
                    }
                });
                
                // 添加一些空行在结尾，让最后一行歌词能在屏幕中央显示
                for (let i = 0; i < 6; i++) {
                    const spacer = document.createElement('p');
                    spacer.textContent = '';
                    spacer.className = 'lyric-spacer';
                    spacer.setAttribute('data-time', '999999');
                    lyricWrapper.appendChild(spacer);
                }
            } else {
                const p = document.createElement('p');
                p.textContent = '暂无歌词';
                p.setAttribute('data-time', '0');
                lyricWrapper.appendChild(p);
            }
        }
    }

    // 更新手机端歌词视图的当前播放状态
    updateMobileLyricView() {
        // 检查是否为移动端
        if (window.innerWidth > 798 || !this.currentAplayer) return;

        // 基于PC端的歌词状态同步到手机端
        const aplayerLrcContents = document.querySelector('.aplayer-lrc-contents');
        const pcCurrentLrc = aplayerLrcContents ? aplayerLrcContents.querySelector('p.aplayer-lrc-current') : null;
        
        const allLines = document.querySelectorAll('.mobile-lyric-wrapper p');
        const lyricLines = document.querySelectorAll('.mobile-lyric-wrapper p:not(.lyric-spacer)');
        
        if (allLines.length === 0) return;
        
        // 重置所有行的状态
        allLines.forEach(line => {
            line.classList.remove('current', 'past', 'next');
        });
        
        let currentIndex = -1;
        
        if (pcCurrentLrc) {
            // 如果PC端有当前歌词，通过文本匹配找到对应的手机端歌词行
            const currentLrcText = pcCurrentLrc.textContent.trim();
            
            lyricLines.forEach((line, index) => {
                if (line.textContent.trim() === currentLrcText) {
                    currentIndex = index + 6; // 加上前面的spacer
                }
            });
            
            if (this.isLyricsVisible) {
                console.log('PC端歌词同步:', {
                    pcCurrentText: currentLrcText.substring(0, 20) + '...',
                    foundIndex: currentIndex
                });
            }
        }

        // 设置歌词状态
        allLines.forEach((line, index) => {
            if (line.classList.contains('lyric-spacer')) {
                return; // 跳过spacer
            }
            
            if (currentIndex !== -1) {
                if (index < currentIndex) {
                    line.classList.add('past');
                } else if (index === currentIndex) {
                    line.classList.add('current');
                } else {
                    line.classList.add('next');
                }
            } else {
                line.classList.add('next'); // 默认状态
            }
        });

        // 滚动逻辑：让高亮的歌词行显示在容器中央
        const wrapper = document.querySelector('.mobile-lyric-wrapper');
        const container = document.querySelector('.mobile-lyric-container');
        if (wrapper && container && currentIndex >= 0) {
            const allLinesArray = Array.from(allLines);
            const currentLine = allLinesArray[currentIndex];
            
            if (currentLine) {
                // 获取当前行相对于wrapper的位置
                const currentLineTop = currentLine.offsetTop;
                const currentLineHeight = currentLine.offsetHeight;
                
                // 计算容器中心位置
                const containerCenter = container.clientHeight / 2;
                
                // 计算当前行中心位置
                const currentLineCenter = currentLineTop + (currentLineHeight / 2);
                
                // 计算需要的滚动距离，让当前行中心对齐到容器中心
                const translateY = containerCenter - currentLineCenter;
                
                wrapper.style.transform = `translateY(${translateY}px)`;
                
                if (this.isLyricsVisible) {
                    console.log('歌词居中滚动:', {
                        currentIndex,
                        currentLineTop,
                        currentLineHeight,
                        currentLineCenter,
                        containerCenter,
                        translateY
                    });
                }
            }
        } else if (wrapper) {
            // 如果没有当前行，居中显示第一行
            wrapper.style.transform = `translateY(${container ? container.clientHeight / 2 : 50}%)`;
        }
    }

    // 恢复唱片动画状态
    restoreVinylAnimationState() {
        if (!this.currentAplayer) return;
        
        const mobileVinylRecord = document.querySelector('.mobile-vinyl-record');
        const mobileVinylNeedle = document.querySelector('.mobile-vinyl-needle');
        
        if (!mobileVinylRecord || !mobileVinylNeedle) return;
        
        // 根据当前播放状态恢复动画
        if (!this.currentAplayer.audio.paused) {
            // 正在播放 - 添加旋转动画和唱针接触状态
            mobileVinylRecord.classList.add('playing');
            mobileVinylRecord.style.animationPlayState = 'running';
            mobileVinylNeedle.classList.add('playing');
            this.isPlaying = true;
        } else {
            // 暂停状态 - 暂停动画但保持在当前位置
            mobileVinylRecord.classList.add('playing'); // 保持动画类
            mobileVinylRecord.style.animationPlayState = 'paused'; // 暂停动画
            mobileVinylNeedle.classList.remove('playing');
            this.isPlaying = false;
        }
    }

    // 调试歌词内容的方法
    debugLyricContent() {
        console.log('=== 歌词调试信息开始 ===');
        
        const aplayerLrc = document.querySelector('.aplayer-lrc');
        const aplayerLrcContents = document.querySelector('.aplayer-lrc-contents');
        const metingJs = document.querySelector('meting-js');
        
        console.log('DOM元素检查:', {
            aplayerLrc: !!aplayerLrc,
            aplayerLrcContents: !!aplayerLrcContents,
            metingJs: !!metingJs,
            currentAplayer: !!this.currentAplayer
        });
        
        if (this.currentAplayer) {
            console.log('APlayer实例详情:', {
                hasLrc: !!this.currentAplayer.lrc,
                listLength: this.currentAplayer.list ? this.currentAplayer.list.audios.length : 0,
                currentIndex: this.currentAplayer.list ? this.currentAplayer.list.index : -1,
                currentAudio: this.currentAplayer.list && this.currentAplayer.list.audios[this.currentAplayer.list.index] ? 
                    this.currentAplayer.list.audios[this.currentAplayer.list.index].name : 'N/A'
            });
            
            // 检查当前歌曲的歌词信息
            if (this.currentAplayer.list && this.currentAplayer.list.audios[this.currentAplayer.list.index]) {
                const currentSong = this.currentAplayer.list.audios[this.currentAplayer.list.index];
                console.log('当前歌曲信息:', {
                    name: currentSong.name,
                    artist: currentSong.artist,
                    lrc: currentSong.lrc ? currentSong.lrc.substring(0, 100) + '...' : 'N/A'
                });
            }
        }
        
        if (aplayerLrcContents) {
            console.log('歌词容器内容:', {
                childrenCount: aplayerLrcContents.children.length,
                innerHTML: aplayerLrcContents.innerHTML.substring(0, 300) + '...'
            });
            
            // 打印前3行歌词
            Array.from(aplayerLrcContents.children).slice(0, 3).forEach((child, index) => {
                console.log(`歌词行 ${index}:`, {
                    tagName: child.tagName,
                    textContent: child.textContent,
                    dataTime: child.getAttribute('data-time'),
                    className: child.className
                });
            });
        }
        
        console.log('=== 歌词调试信息结束 ===');
    }

    destroy() {
        document.removeEventListener("keydown", this.handleKeydown);
    }
}

function initializeMusicPlayer() {
    const exitingMusic = window.scoMusic;
    if (exitingMusic) exitingMusic.destroy();
    window.scoMusic = new MusicPlayer();
}

// 调试函数 - 手动测试歌词切换
window.testLyricToggle = function() {
    if (window.scoMusic) {
        console.log('手动测试歌词切换');
        window.scoMusic.toggleMobileLyrics();
    } else {
        console.error('音乐播放器未初始化');
    }
};

// 调试函数 - 手动重新绑定事件
window.rebindLyricEvents = function() {
    if (window.scoMusic) {
        console.log('手动重新绑定歌词事件');
        window.scoMusic.lyricEventsBound = false;
        window.scoMusic.bindLyricToggleEvents();
    } else {
        console.error('音乐播放器未初始化');
    }
};

// 调试函数 - 检查歌词数据
window.debugLyrics = function() {
    if (window.scoMusic) {
        console.log('手动检查歌词数据');
        window.scoMusic.debugLyricContent();
        window.scoMusic.updateMobileLyricContent();
    } else {
        console.error('音乐播放器未初始化');
    }
};

// 调试函数 - 强制更新歌词
window.forceUpdateLyrics = function() {
    if (window.scoMusic) {
        console.log('强制更新歌词内容');
        setTimeout(() => {
            window.scoMusic.updateMobileLyricContent();
        }, 100);
    } else {
        console.error('音乐播放器未初始化');
    }
};