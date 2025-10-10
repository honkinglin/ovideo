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
  languageOptions: Record<Language, string>
}

export type VideoPlayerMessages = {
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
      linkDialogDescription: "支持 http 或 https 协议的视频文件地址。",
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
      languageOptions: {
        zh: "中文",
        en: "英文",
      },
    },
  },
  en: {
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
      linkDialogDescription: "Supports video URLs over HTTP or HTTPS.",
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
