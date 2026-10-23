export type Language = "zh" | "en"

export type ThemeMode = "light" | "dark"

type ToolbarMessages = {
  openVideo: string
  importFolder: string
  addLink: string
  clearList: string
  linkDialogTitle: string
  linkDialogDescription: string
  linkPlaceholder: string
  linkInputLabel: string
  confirm: string
  cancel: string
  clearConfirmTitle: string
  clearConfirmDescription: string
}

type PlaybackMessages = {
  noSelection: string
  tsUnsupported: string
  speedLabel: string
  play: string
  pause: string
}

type PlayerSurfaceMessages = {
  idlePrompt: string
  dragOverlay: string
  tsUnsupported: string
}

type PlaylistMessages = {
  sort: string; sortAsc: string; sortDesc: string; sorted: string; moveUp: string; moveDown: string
  removed: string; undo: string; matches: string; noMatches: string; clearSearch: string; reorderHint: string
  progress: string; clearHistory: string; clearHistoryDescription: string; confirmClearHistory: string; cancel: string
  historyCleared: string; historyFailed: string

  title: string
  countLabel: string
  empty: string
  localSource: string
  remoteSource: string
}

type UrlDialogErrors = {
  empty: string
  protocol: string
  invalid: string
}

type PreferencesMessages = {
  languageLabel: string
  themeLabel: string
  themeToggle: {
    toDark: string
    toLight: string
  }
  languageToggle: {
    toZh: string
    toEn: string
  }
  languageOptions: Record<Language, string>
}

export type VideoPlayerMessages = {
  study: {
    title: string; importSubtitle: string; reading: string; showSubtitle: string; hideSubtitle: string; removeSubtitle: string
    invalid: string; tooLarge: string; readFailed: string; markA: string; markB: string; pauseLoop: string; resumeLoop: string; clearLoop: string
    invalidB: string; hint: string; shortcuts: string; fullscreenError: string
  }

  feedback: {
    loading: string; buffering: string; unsupported: string; network: string; decode: string; unknown: string; retry: string
    importing: string; imported: string; previous: string; next: string; remove: string; search: string
    repeat: string; repeatOff: string; repeatAll: string; repeatOne: string; localHint: string
    update: string; updateReady: string; later: string; updateFailed: string
  }

  app: {
    title: string
    subtitle: string
    controlPanelTitle: string
  }
  toolbar: ToolbarMessages
  playback: PlaybackMessages
  playerSurface: PlayerSurfaceMessages
  playlist: PlaylistMessages
  urlErrors: UrlDialogErrors
  preferences: PreferencesMessages
}

const translations: Record<Language, VideoPlayerMessages> = {
  zh: {
    study: {
      title: "字幕、片段循环与快捷键", importSubtitle: "导入字幕", reading: "正在读取…", showSubtitle: "显示字幕", hideSubtitle: "隐藏字幕", removeSubtitle: "移除字幕",
      invalid: "字幕格式无效，请选择包含有效时间轴的 UTF-8 SRT 或 VTT 文件。", tooLarge: "字幕文件不能超过 2 MB。", readFailed: "字幕读取失败，请重新选择文件。",
      markA: "设置 A 点", markB: "设置 B 点", pauseLoop: "暂停片段循环", resumeLoop: "启用片段循环", clearLoop: "清除片段",
      invalidB: "B 点必须比 A 点至少晚 0.5 秒。", hint: "设置 B 点后自动循环 A–B；切换视频会清除字幕和片段。字幕仅在本机读取。",
      shortcuts: "快捷键：空格/K 播放暂停 · ←/→ 跳转 5 秒 · ↑/↓ 音量 · M 静音 · F 全屏 · [ 设置 A · ] 设置 B · \u005c 清除片段。输入框和原生视频控件聚焦时保留其键盘操作。",
      fullscreenError: "当前无法进入全屏，请使用视频控件的全屏按钮。",
    },
    feedback: {
      loading: "正在加载视频…", buffering: "正在缓冲…", unsupported: "浏览器无法播放此媒体或访问该资源，请检查视频编码和地址。",
      network: "视频加载失败，请检查网络和资源地址后重试。", decode: "视频解码失败，文件可能损坏或编码不受支持。", unknown: "播放失败，请重试或选择其他视频。", retry: "重试",
      importing: "正在读取文件夹…", imported: "已导入 {added} 个，跳过 {skipped} 个（重复或非视频），读取失败 {failed} 个。",
      previous: "上一集", next: "下一集", remove: "移除", search: "搜索视频或路径", repeat: "循环模式", repeatOff: "顺序播放", repeatAll: "列表循环", repeatOne: "单集循环",
      localHint: "本地文件重新选择后可恢复进度；在线列表会保存在此浏览器。", update: "保存进度并更新", updateReady: "新版本已就绪，可稍后更新，避免打断播放。", later: "稍后", updateFailed: "更新失败，请稍后重试。",
    },
    app: {
      title: "在线视频播放器",
      subtitle: "加载本地文件或在线链接，管理播放列表，并自定义播放倍速。",
      controlPanelTitle: "媒体控制台",
    },
    toolbar: {
      openVideo: "打开视频",
      importFolder: "导入文件夹",
      addLink: "添加链接",
      clearList: "清空列表",
      linkDialogTitle: "添加视频链接",
      linkDialogDescription: "请输入 HTTP/HTTPS 视频资源直链，不是视频网站页面地址。",
      linkPlaceholder: "https://example.com/video.mp4",
      linkInputLabel: "视频地址",
      confirm: "确认添加",
      cancel: "取消",
      clearConfirmTitle: "确认清空播放列表？",
      clearConfirmDescription: "此操作将移除所有已添加的视频资源，且本地文件的临时链接会被释放。",
    },
    playback: {
      noSelection: "当前未选择视频",
      tsUnsupported: "未检测到 MediaSource 支持，无法播放 TS 格式。",
      speedLabel: "倍速",
      play: "播放",
      pause: "暂停",
    },
    playerSurface: {
      idlePrompt: "选择或导入一个视频开始播放",
      dragOverlay: "松开鼠标以导入视频",
      tsUnsupported:
        "当前浏览器不支持直接播放 MPEG-TS 视频，请转换为 MP4/HLS 或更换支持 MediaSource 的浏览器。",
    },
    playlist: {
      title: "播放列表",
      sort: "排序整个列表", sortAsc: "名称升序（1、2、10）", sortDesc: "名称降序", sorted: "列表顺序已更新，当前播放不受影响。", moveUp: "上移", moveDown: "下移",
      removed: "已移除 {name}", undo: "撤销移除", matches: "找到 {count} 个视频。", noMatches: "没有匹配的视频，试试其他名称或路径。", clearSearch: "清除搜索", reorderHint: "清除搜索后可手动调整顺序。",
      progress: "已看到 {time}", clearHistory: "清除观看记录", clearHistoryDescription: "删除此浏览器保存的全部观看进度，不移除播放列表或偏好设置。当前播放不停止；继续观看会重新记录进度。", confirmClearHistory: "确认清除记录", cancel: "取消",
      historyCleared: "观看记录已清除。继续观看会重新记录进度。", historyFailed: "无法清除记录，请检查浏览器存储权限后重试。",
      countLabel: "{count} 个视频",
      empty: "播放列表为空，添加本地文件或在线视频即可开始。",
      localSource: "本地文件",
      remoteSource: "在线视频",
    },
    urlErrors: {
      empty: "请输入视频链接",
      protocol: "仅支持 http 或 https 协议",
      invalid: "请输入有效的视频链接",
    },
    preferences: {
      languageLabel: "语言",
      themeLabel: "主题",
      themeToggle: {
        toDark: "切换到夜间模式",
        toLight: "切换到日间模式",
      },
      languageToggle: {
        toZh: "切换为中文",
        toEn: "Switch to English",
      },
      languageOptions: {
        zh: "中文",
        en: "英文",
      },
    },
  },
  en: {
    study: {
      title: "Subtitles, segment loop & shortcuts", importSubtitle: "Import subtitles", reading: "Reading…", showSubtitle: "Show subtitles", hideSubtitle: "Hide subtitles", removeSubtitle: "Remove subtitles",
      invalid: "Invalid subtitles. Choose a UTF-8 SRT or VTT file with valid cue timings.", tooLarge: "Subtitle files must be 2 MB or smaller.", readFailed: "Unable to read subtitles. Please select the file again.",
      markA: "Set A", markB: "Set B", pauseLoop: "Pause segment loop", resumeLoop: "Enable segment loop", clearLoop: "Clear segment",
      invalidB: "B must be at least 0.5 seconds after A.", hint: "Setting B loops A–B. Switching videos clears subtitles and the segment. Subtitles stay on this device.",
      shortcuts: "Shortcuts: Space/K play/pause · ←/→ seek 5s · ↑/↓ volume · M mute · F fullscreen · [ set A · ] set B · \u005c clear segment. Focused inputs and native video controls keep their own keyboard behavior.",
      fullscreenError: "Fullscreen is unavailable. Try the video's fullscreen control.",
    },
    feedback: {
      loading: "Loading video…", buffering: "Buffering…", unsupported: "This media cannot be played or accessed. Check the codec and resource URL.",
      network: "Unable to load video. Check your connection and resource URL.", decode: "Decoding failed. The file may be damaged or use an unsupported codec.", unknown: "Playback failed. Retry or choose another video.", retry: "Retry",
      importing: "Reading folder…", imported: "Imported {added}; skipped {skipped} (duplicate or non-video); failed to read {failed}.",
      previous: "Previous", next: "Next", remove: "Remove", search: "Search videos or paths", repeat: "Repeat mode", repeatOff: "In order", repeatAll: "Repeat all", repeatOne: "Repeat one",
      localHint: "Reselect local files to resume progress. Online playlists are saved in this browser.", update: "Save progress and update", updateReady: "An update is ready. You can update later to avoid interrupting playback.", later: "Later", updateFailed: "Update failed. Please try again later.",
    },
    app: {
      title: "Online Video Player",
      subtitle:
        "Load local files or remote links, manage your playlist, and fine-tune playback speed.",
      controlPanelTitle: "Media Console",
    },
    toolbar: {
      openVideo: "Open Videos",
      importFolder: "Import Folder",
      addLink: "Add Link",
      clearList: "Clear Playlist",
      linkDialogTitle: "Add Video Link",
      linkDialogDescription: "Enter a direct HTTP/HTTPS media URL, not a video website page.",
      linkPlaceholder: "https://example.com/video.mp4",
      linkInputLabel: "Video URL",
      confirm: "Add",
      cancel: "Cancel",
      clearConfirmTitle: "Clear the playlist?",
      clearConfirmDescription:
        "This will remove all videos you added and revoke any temporary links created for local files.",
    },
    playback: {
      noSelection: "No video selected",
      tsUnsupported: "MediaSource is not available, TS format cannot be played.",
      speedLabel: "Speed",
      play: "Play",
      pause: "Pause",
    },
    playerSurface: {
      idlePrompt: "Choose or import a video to start playback",
      dragOverlay: "Drop to import videos",
      tsUnsupported:
        "Your browser cannot play MPEG-TS directly. Convert to MP4/HLS or switch to a MediaSource-capable browser.",
    },
    playlist: {
      title: "Playlist",
      sort: "Sort entire playlist", sortAsc: "Name ascending (1, 2, 10)", sortDesc: "Name descending", sorted: "Playlist reordered. Current playback is unchanged.", moveUp: "Move up", moveDown: "Move down",
      removed: "Removed {name}", undo: "Undo removal", matches: "{count} matching videos.", noMatches: "No matching videos. Try another name or path.", clearSearch: "Clear search", reorderHint: "Clear search to reorder manually.",
      progress: "Watched to {time}", clearHistory: "Clear watch history", clearHistoryDescription: "Delete all saved playback positions in this browser, keeping the playlist and preferences. Playback continues; further viewing records new progress.", confirmClearHistory: "Confirm clear history", cancel: "Cancel",
      historyCleared: "Watch history cleared. Further viewing will save new progress.", historyFailed: "Unable to clear history. Check browser storage permissions and retry.",
      countLabel: "{count} videos",
      empty: "The playlist is empty. Import local files or add online videos to begin.",
      localSource: "Local file",
      remoteSource: "Online video",
    },
    urlErrors: {
      empty: "Enter a video link",
      protocol: "Only HTTP or HTTPS sources are supported",
      invalid: "Enter a valid video link",
    },
    preferences: {
      languageLabel: "Language",
      themeLabel: "Theme",
      themeToggle: {
        toDark: "Switch to dark mode",
        toLight: "Switch to light mode",
      },
      languageToggle: {
        toZh: "Switch to Chinese",
        toEn: "切换为英文",
      },
      languageOptions: {
        zh: "Chinese",
        en: "English",
      },
    },
  },
}

export function getMessages(language: Language): VideoPlayerMessages {
  return translations[language]
}
