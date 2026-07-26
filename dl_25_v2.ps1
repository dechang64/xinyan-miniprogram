$dst = 'C:\Users\decha\.mavis\agents\mavis\workspace\xinyan-miniprogram\yueji-miniprogram-app\assets\music\v3_5modes_v2'
$urls = @(
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011027_f6a59d5e.mp3|06_gong_guqin_65bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011007_03eab4b0.mp3|07_gong_pipa_70bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011019_eaa2ae97.mp3|08_gong_muyu_75bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011035_05f347bb.mp3|09_gong_bell_80bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011054_12106349.mp3|10_gong_paigu_55bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011024_a8c5bfeb.mp3|06_shang_bamboo_60bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011045_708eb253.mp3|07_shang_qing_65bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011042_c65f8537.mp3|08_shang_gong_75bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011061_ebe48266.mp3|09_shang_paixiao_80bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011110_e9e62432.mp3|10_shang_bronze_55bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011024_703c32f7.mp3|06_jiao_hulusi_60bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011028_a9c7fd1f.mp3|07_jiao_sheng_70bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011018_41ebbf91.mp3|08_jiao_huangguan_75bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011076_44772f1f.mp3|09_jiao_duanxiao_80bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011072_d6dbfafc.mp3|10_jiao_bawu_55bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011032_1a5efee7.mp3|06_zhi_guzheng_65bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011019_de895dc0.mp3|07_zhi_yueqin_70bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011021_6261535b.mp3|08_zhi_ruan_75bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011051_36471c6e.mp3|09_zhi_sanxian_80bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011084_368bb2c6.mp3|10_zhi_banhu_55bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011017_0f2942bd.mp3|06_yu_konghou_60bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011026_d3e1e746.mp3|07_yu_se_65bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011069_455cc9a8.mp3|08_yu_yangqin_70bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011076_27e032e6.mp3|09_yu_bianzhong_75bpm.mp3',
  'https://cdn.hailuoai.com/mcp/u503581678484750338/music_tool/output/1784011078_d33e4d30.mp3|10_yu_bianqing_80bpm.mp3'
)
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$ok = 0
foreach ($u in $urls) {
  $parts = $u -split '\|'
  $url = $parts[0]
  $name = $parts[1]
  $out = Join-Path $dst $name
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "OK $name"
    $ok++
  } catch {
    Write-Host "FAIL $name"
  }
}
Write-Host "DONE $ok / 25"
