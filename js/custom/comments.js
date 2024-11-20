'use strict'

const pug = require('pug')
const path = require('path')
const urlFor = require('hexo-util').url_for.bind(hexo)
const util = require('hexo-util')
hexo.extend.generator.register('comments', function (locals) {
  const config = hexo.theme.config.envelope_comment || hexo.config.envelope_comment;
  // 确保 `enable` 为 false 时完全跳过生成
  if (!config || !config.enable) {
    console.log('envelope_comment is disabled, skipping generation...');
    return null; // 确保返回 null 而非其他值
  }

  const data = {
    custom_pic: config.custom_pic || {},
    message: Array.isArray(config.message) ? config.message : [],
    bottom: config.bottom ? config.bottom : "自动书记人偶竭诚为您服务",
  };
  const content = pug.renderFile(path.join(__dirname, './lib/html.pug'), data);

  return {
    path: pathPre + 'message/index.html',
    data,
    layout: false,
  };
});
