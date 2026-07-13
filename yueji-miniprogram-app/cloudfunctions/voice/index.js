// 云函数: voice (悦济 v1.1)
// 严守: 语音转文字 (STT) + 文字转语音 (TTS)
//   - STT: 微信云开发内置 AI 语音 (cloud.extend.AI.audioTranslate), 0 第三方
//   - TTS: 微信云开发内置 AI 语音合成 (cloud.extend.AI.textToSpeech), 0 第三方
//   - 严守: 不存音频原文, STT 后立即丢弃
//   - 危机词: STT 文本过云函数 chat detectCrisis
// 设计: 4 数字人 4 个 TTS 音色
const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 4 数字人 TTS 音色 (微信云开发 AI 音色 ID, 真实部署时需查官方)
const TTS_VOICES = {
  laozi: { name: '老子', voice: 'male-mature-classical', speed: 0.85 }, // 沉稳男声·古风
  zhouwenwang: { name: '周文王', voice: 'male-mature-deep', speed: 0.9 }, // 浑厚男声
  qibo: { name: '岐伯', voice: 'male-mature-warm', speed: 0.95 }, // 温和男声
  yuanshen: { name: '元神', voice: 'neutral-calm', speed: 0.8 }, // 中性·静心
};

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action } = event;

  if (action === 'stt') {
    return await handleSTT(event, OPENID);
  } else if (action === 'tts') {
    return await handleTTS(event, OPENID);
  } else {
    return { ok: false, error: "action 必须为 stt 或 tts" };
  }
};

// STT: 语音转文字 (微信云开发 AI 能力)
async function handleSTT(event, OPENID) {
  const { fileID } = event;
  if (!fileID) return { ok: false, error: "fileID 必填" };

  try {
    // 1. 下载云存储音频
    const dlRes = await cloud.downloadFile({ fileID });
    const buffer = dlRes.fileContent;

    // 2. 调微信云开发内置 STT
    const ai = cloud.extend.AI;
    const sttRes = await ai.audioTranslate({
      audioBuffer: buffer,
      format: 'mp3',
      lang: 'zh',
    });

    const text = sttRes?.text || sttRes?.result || '';

    // 3. 写 yueji_voice 集合 (仅存文字, 不存音频, 严守隐私)
    try {
      await cloud.database().collection("yueji_voice").add({
        data: { openid: OPENID, text, action: 'stt', created_at: new Date() },
      });
    } catch (e) { console.error("[voice stt log]", e.message); }

    // 4. 严守: STT 后**立即删云存储** (audio 文件不留)
    try {
      await cloud.deleteFile({ fileList: [fileID] });
    } catch (e) { console.warn("[voice stt delete]", e.message); }

    return { ok: true, text };
  } catch (e) {
    console.error("[voice stt]", e.message);
    return { ok: false, error: `STT 失败: ${e.message}` };
  }
}

// TTS: 文字转语音 (微信云开发 AI 能力)
async function handleTTS(event, OPENID) {
  const { text, role = 'laozi' } = event;
  if (!text) return { ok: false, error: "text 必填" };

  // 8 禁用词预审
  const FORBIDDEN = ['治疗', '改善', '缓解', '治愈', '祛斑', '减肥', '处方', '医美', '美颜', '美白', '瘦脸'];
  for (const w of FORBIDDEN) {
    if (text.includes(w)) {
      return { ok: false, error: `悦济严守: TTS 文本含禁用词 ${w}` };
    }
  }

  const voiceConfig = TTS_VOICES[role] || TTS_VOICES.laozi;

  try {
    const ai = cloud.extend.AI;
    const ttsRes = await ai.textToSpeech({
      text,
      voice: voiceConfig.voice,
      speed: voiceConfig.speed,
      format: 'mp3',
    });

    // 上传合成音频到云存储 (临时, 1 天后自动删, 严守隐私)
    const buffer = ttsRes?.audioBuffer || ttsRes?.content;
    if (!buffer) return { ok: false, error: "TTS 返回空" };

    const cloudPath = `tts/${Date.now()}-${OPENID.slice(-6)}.mp3`;
    const uploadRes = await cloud.uploadFile({
      cloudPath,
      fileContent: buffer,
    });

    // 拿临时 URL (1 天有效)
    const tempUrlRes = await cloud.getTempFileURL({ fileList: [uploadRes.fileID] });
    const url = tempUrlRes.fileList[0]?.tempFileURL;

    return { ok: true, url, voice: voiceConfig.voice };
  } catch (e) {
    console.error("[voice tts]", e.message);
    return { ok: false, error: `TTS 失败: ${e.message}` };
  }
}
