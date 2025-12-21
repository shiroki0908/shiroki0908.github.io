// 已读乱回微信聊天机器人
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    // 拉黑状态管理
    let isBlocked = false;
    let blockedMessageCount = 0; // 被拉黑后发送的消息次数
    
    // 无厘头表情包库
    const stickers = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
        '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎',
        '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
        '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
        '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
        '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
        '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
        '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗',
        '💓', '💞', '💕', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '❤️', '🧡',
        '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥',
        '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭',
        '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
        '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
        '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲',
        '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
        '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄',
        '💅', '🤳', '💃', '🕺', '🕴️', '👯', '🧘', '🧑‍🤝‍🧑', '👭', '👫',
        '👬', '💏', '💑', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👩‍👩‍👦',
        '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦',
        '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👦‍👦', '👩‍👧‍👧',
        '👨‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👦‍👦', '👨‍👧‍👧'
    ];
    
    // 关键词匹配规则（无厘头回复）
    const keywordResponses = {
        // 问候类
        '你好': ['🙋‍♂️', '👋', '😊', '🤝', '🙌'],
        'hello': ['👋', '🙋‍♀️', '😄', '💫', '🌟'],
        'hi': ['👋', '🙋', '😊', '✨', '💥'],
        
        // 情绪类
        '开心': ['😄', '😆', '🤣', '😂', '😊', '🥳', '🎉', '🎊'],
        '难过': ['😢', '😭', '🥺', '😔', '💔', '🤧', '😿'],
        '生气': ['😠', '😡', '🤬', '💢', '😤', '👿'],
        '累': ['😴', '😪', '😑', '😵‍💫', '💤', '🥱'],
        '困': ['😴', '😪', '💤', '🥱', '😑'],
        
        // 食物类
        '吃': ['🍔', '🍕', '🍖', '🍗', '🥩', '🍝', '🍜', '🍱', '🍙', '🍘'],
        '饭': ['🍚', '🍛', '🍜', '🍝', '🍲', '🍱', '🥘'],
        '饿': ['🍔', '🍕', '🍗', '🥩', '🍖', '🍝'],
        
        // 动作类
        '睡觉': ['😴', '💤', '😪', '🛌', '🌙'],
        '工作': ['💼', '📊', '📈', '💻', '⌨️', '😫'],
        '学习': ['📚', '📖', '✏️', '📝', '💡', '🧠'],
        
        // 动物类
        '猫': ['🐱', '😸', '😹', '😻', '😼', '😽'],
        '狗': ['🐶', '🐕', '🐩', '🦮', '🐕‍🦺'],
        '可爱': ['🥰', '😍', '🤩', '😘', '💕', '💖'],
        
        // 时间类
        '早上': ['🌅', '🌄', '☀️', '🌞', '☕'],
        '晚上': ['🌙', '🌃', '🌆', '🌉', '🌌'],
        '中午': ['☀️', '🌞', '🍽️', '🍜'],
        
        // 天气类
        '雨': ['🌧️', '☔', '🌦️', '⛈️'],
        '太阳': ['☀️', '🌞', '🌻', '😎'],
        '雪': ['❄️', '☃️', '⛄', '🌨️'],
        
        // 无厘头通用回复
        '什么': ['🤔', '🤷', '🤷‍♂️', '🤷‍♀️', '😕', '🙄'],
        '为什么': ['🤔', '🧐', '🤷', '😶', '🤐'],
        '怎么': ['🤔', '🤷', '🤯', '💭', '💡'],
        '吗': ['🤔', '😊', '🤷', '😏', '🤐'],
        '？': ['🤔', '🤷', '😊', '🤐', '🤯'],
        '!': ['😄', '🤣', '😆', '🤯', '💥', '✨'],
        
        // 默认随机
        'default': stickers
    };
    
    // 无厘头对话元素库
    const dialogueElements = {
        time: ['凌晨3点', '中午12点', '下午5点', '晚上11点', '早上6点', '深夜2点', '傍晚7点', '清晨5点', '午夜12点', '下午3点'],
        place: ['厕所里', '冰箱里', '屋顶上', '床底下', '厨房里', '阳台上', '地铁上', '电梯里', '停车场', '公园里', '咖啡店里', '图书馆', '天台上', '地下室', '游泳池'],
        person: ['一只猫', '外星人', '机器人', '我的影子', '冰箱', '洗衣机', '电脑', '手机', '一只狗', '邻居', '老板', '快递员', '陌生人', '我自己', '一朵云'],
        action: ['在跳舞', '在吃披萨', '在看电影', '在睡觉', '在唱歌', '在跑步', '在游泳', '在做饭', '在思考人生', '在刷手机', '在写代码', '在画画', '在遛狗', '在找钥匙', '在发呆'],
        mood: ['很开心', '很困惑', '很兴奋', '很累', '很饿', '很困', '很无聊', '很激动', '很紧张', '很放松'],
        thing: ['一根香蕉', '一个苹果', '一本书', '一只袜子', '一包薯片', '一杯咖啡', '一把雨伞', '一只鞋子', '一个枕头', '一张纸']
    };
    
    // 生成无厘头对话模板（多样化句式，避免重复）
    const dialogueTemplates = [
        // 简单对话，不包含时间地点
        '{person}{action}，{mood}',
        '刚才{person}{action}',
        '我发现{person}{action}',
        '{person}在{action}',
        '听说{person}{action}，{mood}',
        '{person}说他在{action}',
        '{person}告诉我他在{action}',
        '看到{person}{action}了',
        '{person}居然{action}',
        '没想到{person}{action}',
        '{person}突然{action}',
        '{person}正在{action}',
        '听说{person}最近{action}',
        '{person}好像{action}',
        '{person}竟然{action}',
        
        // 包含地点的对话（多样化表达）
        '{person}在{place}{action}',
        '刚才在{place}看到{person}{action}',
        '我发现{place}有{person}{action}',
        '路过{place}，{person}{action}',
        '{place}有{person}在{action}，{mood}',
        '在{place}遇到{person}，他在{action}',
        '{place}那边{person}{action}',
        '去{place}的时候看到{person}{action}',
        '{person}跑到{place}{action}',
        '从{place}传来消息，{person}{action}',
        '{place}里{person}{action}，{mood}',
        
        // 包含时间的对话（较少）
        '{time}{person}在{action}',
        '{time}的时候{person}{action}',
        '刚才{time}路过{place}，{person}{action}',
        '{time}收到消息，{person}在{action}',
        '记得{time}{person}在{place}{action}',
        
        // 包含物品的对话（较少）
        '{person}手里拿着{thing}{action}',
        '发现{person}在{place}{action}，拿着{thing}',
        '{person}带着{thing}在{action}',
        '看到{person}拿着{thing}{action}',
        
        // 疑问句式
        '为什么{person}在{action}？',
        '{person}为什么要{action}？',
        '你知道{person}在{action}吗？',
        '有没有看到{person}{action}？',
        
        // 感叹句式
        '天哪！{person}在{action}！',
        '太奇怪了，{person}{action}',
        '不可思议，{person}居然{action}',
        
        // 超简单对话
        '哦',
        '是吗',
        '真的吗',
        '哈哈{emoji}',
        '这样啊{emoji}',
        '有意思{emoji}',
        '嗯嗯',
        '好吧',
        '哦哦',
        '懂了',
        '原来如此',
        '有意思',
        '哈哈哈',
        '笑死',
        '离谱',
        '绝了',
        '666{emoji}',
        '这都行？',
        '什么情况',
        '不会吧',
        
        // 搞心态对话
        '这...',
        'emmm...',
        '额...',
        '这很难评',
        '我不知道该说什么',
        '你开心就好',
        '你觉得呢',
        '你说是就是吧',
        '你说是那就是',
        '你说是就是',
        '行吧',
        '行',
        '可以',
        '嗯',
        '哦',
        '哦哦',
        '哦哦哦',
        '哦，这样啊',
        '哦，原来如此',
        '哦，好的',
        '哦，知道了',
        '哦，懂了',
        '哦，明白了',
        '哦，这样',
        '哦，行',
        '哦，可以',
        '哦，随便',
        '哦，都好',
        '哦，都行',
        '哦，无所谓',
        '哦，你开心就好',
        '哦，你觉得呢',
        '哦，你说是就是',
        '哦，你觉得对就对',
        '哦，你开心就好吧',
        '哦，你高兴就好',
        '哦，你觉得可以就可以',
        '哦，你觉得行就行',
        '哦，你觉得没问题就没问题',
        '哦，你觉得怎么样就怎么样',
        '哦，你决定就好',
        '哦，你说了算',
        '哦，听你的',
        '哦，你定',
        '哦，你看着办',
        '哦，你说了算吧',
        '哦，听你的吧',
        '哦，你定吧',
        '哦，你看着办吧',
        '哦，都可以',
        '哦，都行吧',
        '哦，无所谓了',
        '哦，随便吧',
        '哦，都可以吧',
        '哦，都行',
        '哦，无所谓',
        '哦，随便',
        '哦，都好',
        '哦，都可以',
        
        // 毒舌对话
        '啊？你在说什么？',
        '你在说什么东西？',
        '你说的什么玩意？',
        '你说的是人话吗？',
        '我听不懂你在说什么',
        '你能不能好好说话',
        '你说话能不能正常点',
        '你能不能别说话了',
        '你闭嘴吧',
        '你能不能安静点',
        '你话怎么这么多',
        '你话怎么这么密',
        '你能不能少说两句',
        '你能不能别说了',
        '你能不能安静会',
        '你能不能闭嘴',
        '你能不能别吵',
        '你能不能别闹',
        '你能不能别这样',
        '你能不能正常点',
        '你能不能别搞',
        '你能不能别作',
        '你能不能别作死',
        '你能不能别闹了',
        '你能不能别搞了',
        '你能不能别作了',
        '你能不能别作死了',
        '你能不能别这样了',
        '你能不能正常点了',
        '你能不能别吵了',
        '你能不能安静点了',
        '你能不能闭嘴了',
        '你能不能少说两句了',
        '你话怎么这么多了',
        '你话怎么这么密了',
        '你能不能别说话了',
        '你说话能不能正常点了',
        '你能不能好好说话了',
        '我听不懂你在说什么了',
        '你说的是人话吗？',
        '你说的什么玩意？',
        '你在说什么东西？',
        '啊？你在说什么？',
        '你在说什么？',
        '你说什么？',
        '你说啥？',
        '你在说啥？',
        '你说的是啥？',
        '你在说的是啥？',
        '你说的是什么？',
        '你在说的是什么？',
        '你说的是人话吗？',
        '你说的什么玩意？',
        '你在说什么东西？',
        '啊？你在说什么？',
        
        // 阴阳对话（阴阳怪气）
        '啊对对对',
        '啊是是是',
        '啊对对对，你说得对',
        '啊是是是，你说得是',
        '啊对对对，你说得都对',
        '啊是是是，你说得都是',
        '啊对对对，你说的都对',
        '啊是是是，你说的都是',
        '对对对，你说得对',
        '是是是，你说得是',
        '对对对，你说得都对',
        '是是是，你说得都是',
        '对对对，你说的都对',
        '是是是，你说的都是',
        '你说得对，你说的都对',
        '你说得是，你说的都是',
        '你说得都对',
        '你说得都是',
        '你说什么都是对的',
        '你说什么都是是的',
        '你说得对，你说得对',
        '你说得是，你说得是',
        '你说得都对，你说得对',
        '你说得都是，你说得是',
        '啊对对对，你说的都对',
        '啊是是是，你说的都是',
        '对对对，你说的都对',
        '是是是，你说的都是',
        
        // 流行梗和抽象发言
        '啊？',
        '啊这',
        '绷不住了',
        '蚌埠住了',
        '6',
        '6的',
        '太6了',
        '逆天',
        '逆大天',
        '难绷',
        '真难绷',
        '我是真难绷',
        '这很难评',
        '我不好说',
        '不好说',
        '不好评价',
        '这',
        '这这这',
        '草',
        '草（一种植物）',
        '笑死我了',
        '笑不活了',
        '笑拥了',
        '属实是',
        '确实是',
        '真不错',
        '那确实',
        '那确实不错',
        '雀食',
        '确实',
        '确实如此',
        '确实是这样',
        '是这样的',
        '是这样的捏',
        '好家伙',
        '好家伙，我直接好家伙',
        '我直接好家伙',
        '直呼好家伙',
        '我人都傻了',
        '我傻了',
        '人傻了',
        '直接傻了',
        '太抽象了',
        '抽象',
        '太抽象了兄弟',
        '这也太抽象了',
        '抽象派艺术家',
        '整不会了',
        '给我整不会了',
        '属实整不会了',
        '我直接整不会了',
        '整麻了',
        '给我整麻了',
        '属实整麻了',
        '我直接整麻了',
        '太秀了',
        '秀',
        '太秀了兄弟',
        '这也太秀了',
        '秀儿',
        '你是秀儿吗',
        '不会吧不会吧',
        '不会真有人...吧',
        '不会只有我一个人...吧',
        '好活',
        '好活当赏',
        '好活，当赏',
        '整的好活',
        '整了个好活',
        '什么好活',
        '典',
        '太典了',
        '典中典',
        '典中典中典',
        '经典',
        '太经典了',
        '经典永流传',
        '典中典永流传',
        '逆天',
        '太逆天了',
        '逆天而行',
        '我直接逆天',
        '属实逆天',
        '真的逆天',
        '什么逆天发言',
        '逆天发言',
        '逆天操作',
        '什么逆天操作',
        '好一个逆天',
        '好家伙好家伙',
        '好家伙好家伙好家伙',
        '我直接好家伙好家伙',
        '属实是好家伙',
        '确实好家伙',
        '雀食好家伙',
        '6的飞起',
        '6翻了',
        '6的起飞',
        '太6了兄弟',
        '属实是6',
        '确实6',
        '雀食6',
        '绷',
        '绷不住了',
        '属实绷不住了',
        '确实绷不住了',
        '我直接绷不住了',
        '蚌埠住了',
        '蚌埠住了家人们',
        '家人们蚌埠住了',
        '属实蚌埠住了',
        '确实蚌埠住了',
        '我直接蚌埠住了',
        '难绷',
        '属实难绷',
        '确实难绷',
        '我直接难绷',
        '真难绷',
        '我是真难绷',
        '真的难绷',
        '确实难绷',
        '属实难绷',
        '这很难评',
        '我不好说',
        '不好说',
        '不好评价',
        '这很难评价',
        '我不好评价',
        '不好说，我不好说',
        '属实不好说',
        '确实不好说',
        '雀食不好说',
        '草',
        '草（一种植物）',
        '草，这也太草了',
        '太草了',
        '属实草',
        '确实草',
        '雀食草',
        '笑死',
        '笑死我了',
        '笑不活了',
        '笑拥了',
        '给我笑拥了',
        '属实笑拥了',
        '确实笑拥了',
        '我直接笑拥了',
        '属实',
        '确实是',
        '属实是',
        '确实是这样的',
        '属实是这样的',
        '确实如此',
        '属实如此',
        '确实是这样',
        '属实是这样',
        '确实',
        '属实',
        '雀食',
        '确实如此',
        '属实如此',
        '确实是这样',
        '属实是这样',
        '确实是',
        '属实是',
        '那确实',
        '那确实不错',
        '那确实',
        '确实是这样的',
        '属实是这样的',
        '好家伙',
        '好家伙，我直接好家伙',
        '我直接好家伙',
        '直呼好家伙',
        '属实好家伙',
        '确实好家伙',
        '雀食好家伙',
        '我人都傻了',
        '我傻了',
        '人傻了',
        '直接傻了',
        '属实傻了',
        '确实傻了',
        '雀食傻了',
        '太抽象了',
        '抽象',
        '太抽象了兄弟',
        '这也太抽象了',
        '抽象派艺术家',
        '属实抽象',
        '确实抽象',
        '雀食抽象',
        '整不会了',
        '给我整不会了',
        '属实整不会了',
        '我直接整不会了',
        '确实整不会了',
        '雀食整不会了',
        '整麻了',
        '给我整麻了',
        '属实整麻了',
        '我直接整麻了',
        '确实整麻了',
        '雀食整麻了',
        '太秀了',
        '秀',
        '太秀了兄弟',
        '这也太秀了',
        '秀儿',
        '你是秀儿吗',
        '属实秀',
        '确实秀',
        '雀食秀',
        '不会吧不会吧',
        '不会真有人...吧',
        '不会只有我一个人...吧',
        '好活',
        '好活当赏',
        '好活，当赏',
        '整的好活',
        '整了个好活',
        '什么好活',
        '属实好活',
        '确实好活',
        '雀食好活',
        '典',
        '太典了',
        '典中典',
        '典中典中典',
        '经典',
        '太经典了',
        '经典永流传',
        '典中典永流传',
        '属实典',
        '确实典',
        '雀食典',
        '逆天',
        '太逆天了',
        '逆天而行',
        '我直接逆天',
        '属实逆天',
        '确实逆天',
        '雀食逆天',
        '真的逆天',
        '什么逆天发言',
        '逆天发言',
        '逆天操作',
        '什么逆天操作',
        '好一个逆天',
        '什么逆天',
        '属实逆天',
        '确实逆天',
        '雀食逆天'
    ];
    
    // 关键词与对话元素的关联映射
    const keywordMapping = {
        '吃': { place: ['厨房里', '餐厅', '冰箱里'], action: ['在做饭', '在吃披萨', '在吃东西'], thing: ['一个苹果', '一根香蕉', '一包薯片', '一杯咖啡'] },
        '饿': { place: ['厨房里', '餐厅', '冰箱前'], action: ['在找吃的', '在做饭', '在吃东西'], thing: ['一个苹果', '一根香蕉', '一包薯片'] },
        '饭': { place: ['厨房里', '餐厅', '饭桌前'], action: ['在做饭', '在吃饭', '在洗碗'], thing: ['一个苹果', '一根香蕉', '一包薯片'] },
        '睡': { place: ['床上', '沙发上', '床上'], action: ['在睡觉', '在打盹', '在休息'], mood: ['很困', '很累'] },
        '困': { place: ['床上', '沙发上'], action: ['在睡觉', '在打盹'], mood: ['很困', '很累'] },
        '累': { place: ['床上', '沙发上', '椅子上'], action: ['在休息', '在睡觉'], mood: ['很累', '很困'] },
        '开心': { place: ['公园里', '咖啡店里', '阳台上'], action: ['在跳舞', '在唱歌', '在笑'], mood: ['很开心', '很兴奋'] },
        '难过': { place: ['房间里', '角落', '床上'], action: ['在发呆', '在思考'], mood: ['很难过', '很困惑'] },
        '生气': { place: ['房间里', '厨房里'], action: ['在大喊', '在生气'], mood: ['很生气', '很愤怒'] },
        '工作': { place: ['办公室', '家里', '咖啡店里'], action: ['在工作', '在写代码', '在开会'], thing: ['一本书', '一台电脑', '一张纸'] },
        '学习': { place: ['图书馆', '房间里', '咖啡店里'], action: ['在学习', '在看书', '在写作业'], thing: ['一本书', '一支笔', '一张纸'] },
        '猫': { person: ['一只猫', '我的猫', '邻居的猫'], action: ['在睡觉', '在玩', '在叫'], place: ['阳台上', '沙发上', '床上'] },
        '狗': { person: ['一只狗', '我的狗'], action: ['在跑', '在玩', '在叫'], place: ['公园里', '家里', '阳台上'] },
        '雨': { place: ['房间里', '家里', '咖啡店里'], action: ['在躲雨', '在看雨'], mood: ['很放松'] },
        '太阳': { place: ['阳台上', '公园里', '户外'], action: ['在晒太阳', '在玩耍'], mood: ['很开心'] },
        '晚上': { time: ['晚上11点', '深夜2点', '午夜12点'], place: ['床上', '房间里'], action: ['在睡觉', '在发呆'] },
        '早上': { time: ['早上6点', '清晨5点', '早上7点'], place: ['床上', '阳台上'], action: ['在醒来', '在刷牙'] },
        '中午': { time: ['中午12点', '下午1点'], place: ['餐厅', '厨房里'], action: ['在吃饭', '在做饭'] }
    };
    
    // 随机选择数组元素
    function randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // 根据关键词智能选择对话元素
    function getContextualElement(category, userText) {
        const lowerText = userText.toLowerCase();
        
        // 检查关键词映射
        for (const [keyword, mapping] of Object.entries(keywordMapping)) {
            if (lowerText.includes(keyword) && mapping[category]) {
                // 如果找到匹配的关键词，有70%概率使用相关的元素
                if (Math.random() < 0.7) {
                    return randomElement(mapping[category]);
                }
            }
        }
        
        // 没有匹配或随机选择，使用默认元素
        return randomElement(dialogueElements[category]);
    }
    
    // 生成有逻辑性的无厘头对话
    function generateRandomDialogue(userText) {
        const template = randomElement(dialogueTemplates);
        let dialogue = template;
        
        // 如果模板中没有占位符，直接返回（流行梗和抽象发言）
        if (!dialogue.includes('{')) {
            return dialogue;
        }
        
        // 只替换模板中实际存在的占位符
        if (dialogue.includes('{time}')) {
            dialogue = dialogue.replace('{time}', getContextualElement('time', userText));
        }
        if (dialogue.includes('{place}')) {
            dialogue = dialogue.replace('{place}', getContextualElement('place', userText));
        }
        if (dialogue.includes('{person}')) {
            dialogue = dialogue.replace('{person}', getContextualElement('person', userText));
        }
        if (dialogue.includes('{action}')) {
            dialogue = dialogue.replace('{action}', getContextualElement('action', userText));
        }
        if (dialogue.includes('{mood}')) {
            dialogue = dialogue.replace('{mood}', getContextualElement('mood', userText));
        }
        if (dialogue.includes('{thing}')) {
            dialogue = dialogue.replace('{thing}', getContextualElement('thing', userText));
        }
        if (dialogue.includes('{emoji}')) {
            dialogue = dialogue.replace('{emoji}', randomElement(stickers));
        }
        
        return dialogue;
    }
    
    // 获取无厘头表情包回复
    function getRandomStickerResponse(text) {
        const lowerText = text.toLowerCase().trim();
        
        // 检查关键词匹配
        for (const [keyword, responses] of Object.entries(keywordResponses)) {
            if (keyword !== 'default' && lowerText.includes(keyword)) {
                // 随机选择一个表情包
                const randomSticker = responses[Math.floor(Math.random() * responses.length)];
                // 有时返回单个，有时返回多个表情包组合（增加无厘头感）
                if (Math.random() > 0.5) {
                    return randomSticker + randomSticker + randomSticker;
                }
                return randomSticker + randomSticker;
            }
        }
        
        // 如果没有匹配，根据文本长度生成随机表情包
        const count = Math.floor(Math.random() * 3) + 1; // 1-3个表情包
        let response = '';
        for (let i = 0; i < count; i++) {
            response += stickers[Math.floor(Math.random() * stickers.length)];
        }
        return response;
    }
    
    // 添加系统提示消息
    function addSystemNotice(text, className = 'system-notice') {
        const noticeDiv = document.createElement('div');
        noticeDiv.className = className;
        noticeDiv.textContent = text;
        chatMessages.appendChild(noticeDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 显示拉黑提示
    function showBlockedNotice() {
        const noticeDiv = document.createElement('div');
        noticeDiv.className = 'friend-verification-notice';
        noticeDiv.innerHTML = '对方开启了朋友验证，你还不是他（她）朋友。请先发送朋友验证请求，对方验证通过后，才能聊天。';
        chatMessages.appendChild(noticeDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 显示重新添加好友提示
    function showFriendAddedNotice() {
        const noticeDiv = document.createElement('div');
        noticeDiv.className = 'friend-added-notice';
        noticeDiv.textContent = '你已添加了已读乱回机器人，现在可以开始聊天了。';
        chatMessages.appendChild(noticeDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 获取回复（表情包或对话，或者不回复）
    function getRandomResponse(text, responseType = 'normal') {
        // 如果被拉黑，不回复
        if (isBlocked) {
            return null;
        }
        
        // responseType: 'sticker_only' 表示只发送表情包
        if (responseType === 'sticker_only') {
            return {
                text: getRandomStickerResponse(text),
                isSticker: true
            };
        }
        
        // 正常回复：13%表情包，87%对话（相对于88%正常回复）
        if (Math.random() < 0.13) {
            return {
                text: getRandomStickerResponse(text),
                isSticker: true
            };
        } else {
            return {
                text: generateRandomDialogue(text), // 传入用户输入以便生成相关对话
                isSticker: false
            };
        }
    }
    
    // 添加消息到聊天区域
    function addMessage(text, isUser = false, isSticker = false, messageId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        if (messageId) {
            messageDiv.dataset.messageId = messageId;
        }
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = isUser ? '👤' : '🤖';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const textDiv = document.createElement('div');
        if (isSticker) {
            textDiv.className = 'message-text message-sticker';
            const stickerDiv = document.createElement('div');
            stickerDiv.className = 'sticker-content';
            stickerDiv.textContent = text;
            textDiv.appendChild(stickerDiv);
        } else {
            textDiv.className = 'message-text';
            textDiv.textContent = text;
        }
        
        content.appendChild(textDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }
    
    // 撤回消息
    function revokeMessage(messageId) {
        const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageDiv) return;
        
        const textDiv = messageDiv.querySelector('.message-text');
        if (!textDiv) return;
        
        // 添加淡出动画
        textDiv.style.animation = 'fadeOut 0.3s ease-out';
        
        setTimeout(() => {
            // 替换为撤回提示
            textDiv.className = 'message-text message-revoked';
            textDiv.innerHTML = '<span class="message-revoked-text">对方撤回了一条消息</span>';
            textDiv.style.animation = '';
        }, 300);
    }
    
    // 显示"正在输入"指示器
    function showTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message typing-message';
        messageDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message-text typing-indicator';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDiv.appendChild(dot);
        }
        
        content.appendChild(typingDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }
    
    // 移除"正在输入"指示器
    function removeTypingIndicator() {
        const typingMessage = document.getElementById('typingIndicator');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
    
    // 发送消息
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;
        
        // 如果被拉黑，处理拉黑逻辑
        if (isBlocked) {
            addMessage(text, true);
            messageInput.value = '';
            sendBtn.disabled = true;
            
            blockedMessageCount++;
            
            // 第1、2、3次都显示拉黑提示，第4次解除拉黑
            if (blockedMessageCount < 4) {
                // 第1、2、3次显示拉黑提示
                setTimeout(() => {
                    showBlockedNotice();
                }, 500);
            } else if (blockedMessageCount === 4) {
                // 第4次解除拉黑
                setTimeout(() => {
                    isBlocked = false;
                    blockedMessageCount = 0;
                    showFriendAddedNotice();
                }, 1000);
            }
            
            sendBtn.disabled = false;
            messageInput.focus();
            return;
        }
        
        // 添加用户消息
        addMessage(text, true);
        messageInput.value = '';
        sendBtn.disabled = true;
        
        // 概率分配：84%正常回复，5%只表情包，5%发言后撤回，3%发言中撤回，3%拉黑
        const random = Math.random();
        
        // 3%概率拉黑
        if (random < 0.03) {
            isBlocked = true;
            blockedMessageCount = 0;
            setTimeout(() => {
                showBlockedNotice();
                sendBtn.disabled = false;
                messageInput.focus();
            }, 800);
            return;
        }
        
        // 3%概率发言中撤回（正在输入时撤回，不显示消息）
        if (random >= 0.03 && random < 0.06) {
            const typingDelay = 300 + Math.random() * 500;
            setTimeout(() => {
                showTypingIndicator();
                // 1-2秒后移除输入指示器，不发送消息
                setTimeout(() => {
                    removeTypingIndicator();
                    sendBtn.disabled = false;
                    messageInput.focus();
                }, 1000 + Math.random() * 1000);
            }, typingDelay);
            return;
        }
        
        // 5%概率只发送表情包（从84%正常回复中分出来）
        const isStickerOnly = (random >= 0.06 && random < 0.11);
        
        // 84%正常回复，5%会在发言后撤回
        // 先显示"正在输入"效果（随机0.3-0.8秒后显示）
        const typingDelay = 300 + Math.random() * 500;
        let typingIndicator = null;
        let willRevokeAfterSend = false; // 是否在发送后撤回
        
        // 判断是否发言后撤回（5%概率，在84%正常回复中）
        // 因为5%表情包 + 84%正常 = 89%，所以5%撤回是在这89%中的
        // 实际上应该在84%正常回复中的约6.0%（5/84）会撤回，但为了简化，我们按总概率5%来计算
        // 但由于5%表情包不撤回，所以撤回只发生在84%正常回复中
        if (random >= 0.11 && random < 0.16 && !isStickerOnly) {
            willRevokeAfterSend = true;
        }
        
        setTimeout(() => {
            typingIndicator = showTypingIndicator();
        }, typingDelay);
        
        // 模拟"已读乱回"延迟（随机1-3秒）
        const responseDelay = 1000 + Math.random() * 2000;
        
        setTimeout(() => {
            // 移除"正在输入"指示器
            removeTypingIndicator();
            
            // 生成无厘头回复（如果是2%表情包模式，强制只发送表情包）
            const response = getRandomResponse(text, isStickerOnly ? 'sticker_only' : 'normal');
            if (response) {
                // 生成消息ID
                const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const messageDiv = addMessage(response.text, false, response.isSticker, messageId);
                
                // 如果标记为发言后撤回（只对文字消息，表情包不撤回）
                if (willRevokeAfterSend && !response.isSticker) {
                    // 显示1-3秒后撤回
                    const revokeDelay = 1000 + Math.random() * 2000;
                    setTimeout(() => {
                        revokeMessage(messageId);
                    }, revokeDelay);
                }
            }
            
            sendBtn.disabled = false;
            messageInput.focus();
        }, responseDelay);
    }
    
    // 绑定发送按钮事件
    sendBtn.addEventListener('click', sendMessage);
    
    // 绑定回车键发送
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 输入框内容变化时启用/禁用发送按钮
    messageInput.addEventListener('input', function() {
        sendBtn.disabled = !messageInput.value.trim();
    });
    
    // 初始化：禁用发送按钮
    sendBtn.disabled = true;
    messageInput.focus();
});

