// 初始化 canvas 动画的主函数
function initCanvas() {
  const canvas = document.querySelector('#peopleCanvas');
  if (!canvas) return; // 如果 canvas 不存在，直接退出

  console.clear();
  console.log('Initializing canvas...');

  // 清理现有动画和事件监听器，避免重复初始化
  gsap.globalTimeline.clear();
  window.removeEventListener('resize', resize);

  const ctx = canvas.getContext('2d');
  const stage = { width: 0, height: 0 };

  const config = {
    src: 'https://i.imgur.com/ptbvi85.pngg', // 图片资源路径
    rows: 15, // 图片被分割的行数
    cols: 7,  // 图片被分割的列数
  };

  const img = document.createElement('img');
  img.onload = () => {
    createPeeps(); // 创建所有角色的实例
    resize(); // 初始化舞台尺寸
    gsap.ticker.add(render); // 启动动画渲染
    window.addEventListener('resize', resize); // 窗口大小变化时重置舞台
  };
  img.src = config.src;

  const allPeeps = []; // 存储所有角色实例
  const availablePeeps = []; // 存储可用的角色
  const crowd = []; // 当前显示在画布上的角色

  function createPeeps() {
    const { rows, cols } = config;
    const { naturalWidth: width, naturalHeight: height } = img;
    const total = rows * cols; // 总角色数
    const rectWidth = width / rows; // 每个角色的宽度
    const rectHeight = height / cols; // 每个角色的高度

    for (let i = 0; i < total; i++) {
      allPeeps.push(
        new Peep({
          image: img,
          rect: [
            (i % rows) * rectWidth, // x 坐标
            Math.floor(i / rows) * rectHeight, // y 坐标
            rectWidth, // 宽度
            rectHeight, // 高度
          ],
        })
      );
    }
  }

  function resize() {
    stage.width = canvas.clientWidth; // 获取 canvas 的宽度
    stage.height = canvas.clientHeight; // 获取 canvas 的高度
    canvas.width = stage.width * devicePixelRatio; // 设置高分辨率支持
    canvas.height = stage.height * devicePixelRatio;

    crowd.forEach((peep) => peep.walk.kill()); // 停止所有角色的动画
    crowd.length = 0; // 清空当前角色
    availablePeeps.length = 0; // 清空可用角色
    availablePeeps.push(...allPeeps); // 将所有角色重新加入可用队列

    initCrowd(); // 重新初始化角色群
  }

  function initCrowd() {
    while (availablePeeps.length) {
      addPeepToCrowd().walk.progress(Math.random()); // 随机化动画进度
    }
  }

  function addPeepToCrowd() {
    const peep = removeRandomFromArray(availablePeeps); // 随机取一个可用角色
    const walk = getRandomFromArray(walks)({
      peep,
      props: resetPeep({ peep, stage }),
    }).eventCallback('onComplete', () => {
      removePeepFromCrowd(peep); // 动画完成后移除角色
      addPeepToCrowd(); // 添加一个新角色
    });

    peep.walk = walk;
    crowd.push(peep);
    crowd.sort((a, b) => a.anchorY - b.anchorY); // 按 y 坐标排序以模拟层次
    return peep;
  }

  function removePeepFromCrowd(peep) {
    removeItemFromArray(crowd, peep); // 从当前角色中移除
    availablePeeps.push(peep); // 放回可用队列
  }

  function render() {
    canvas.width = canvas.width; // 清空画布
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);

    crowd.forEach((peep) => peep.render(ctx)); // 渲染所有角色
    ctx.restore();
  }
}

// 页面首次加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#peopleCanvas')) {
    initCanvas();
  }
});

// 监听 PJAX 或页面切换事件
document.addEventListener('pjax:complete', () => {
  if (document.querySelector('#peopleCanvas')) {
    initCanvas();
  }
});

// 工具函数：生成指定范围的随机数
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

// 工具函数：从数组中随机获取索引
function randomIndex(array) {
  return randomRange(0, array.length) | 0;
}

// 工具函数：移除数组中的指定索引
function removeFromArray(array, i) {
  return array.splice(i, 1)[0];
}

// 工具函数：移除数组中的指定项
function removeItemFromArray(array, item) {
  return removeFromArray(array, array.indexOf(item));
}

// 工具函数：随机移除数组中的一项
function removeRandomFromArray(array) {
  return removeFromArray(array, randomIndex(array));
}

// 工具函数：随机获取数组中的一项
function getRandomFromArray(array) {
  return array[randomIndex(array) | 0];
}

// 动画重置函数：根据方向和位置初始化角色
function resetPeep({ stage, peep }) {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random());
  const startY = stage.height - peep.height + offsetY;
  let startX, endX;

  if (direction === 1) {
    startX = -peep.width;
    endX = stage.width;
    peep.scaleX = 1;
  } else {
    startX = stage.width + peep.width;
    endX = 0;
    peep.scaleX = -1;
  }

  peep.x = startX;
  peep.y = startY;
  peep.anchorY = startY;

  return { startX, startY, endX };
}

// 正常行走动画
function normalWalk({ peep, props }) {
  const { startX, startY, endX } = props;

  const xDuration = 10;
  const yDuration = 0.25;

  const tl = gsap.timeline();
  tl.timeScale(randomRange(0.5, 1.5));
  tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0);
  tl.to(peep, {
    duration: yDuration,
    repeat: xDuration / yDuration,
    yoyo: true,
    y: startY - 10,
  }, 0);

  return tl;
}

const walks = [normalWalk];

// Peep 类：表示一个角色
class Peep {
  constructor({ image, rect }) {
    this.image = image;
    this.setRect(rect);
    this.x = 0;
    this.y = 0;
    this.anchorY = 0;
    this.scaleX = 1;
    this.walk = null;
  }

  setRect(rect) {
    this.rect = rect;
    this.width = rect[2];
    this.height = rect[3];
    this.drawArgs = [this.image, ...rect, 0, 0, this.width, this.height];
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, 1);
    ctx.drawImage(...this.drawArgs);
    ctx.restore();
  }
}