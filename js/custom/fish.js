var RENDERER = {
	POINT_INTERVAL : 5,
	FISH_COUNT : 3,
	MAX_INTERVAL_COUNT : 50,
	INIT_HEIGHT_RATE : 0.5,
	THRESHOLD : 50,
	
	init : function(){
		this.setParameters();
		// 如果容器不存在，不继续初始化
		if (!this.$container || this.$container.length === 0) {
			return;
		}
		// 如果canvas创建失败，不继续
		if (!this.$canvas || this.$canvas.length === 0 || !this.context) {
			return;
		}
		this.reconstructMethods();
		this.setup();
		this.bindEvent();
		this.render();
	},
	setParameters : function(){
		this.$window = $(window);
		// 重新获取容器引用（PJAX后容器可能被重新创建）
		this.$container = $('#jsi-flying-fish-container');
		if (this.$container.length === 0) {
			// 容器不存在，设置基本状态
			this.points = [];
			this.fishes = [];
			this.watchIds = [];
			this.isRunning = false;
			this.$canvas = null;
			this.context = null;
			return;
		}
		// 清空容器中可能存在的旧内容
		this.$container.empty();
		// 创建新的canvas
		this.$canvas = $('<canvas />');
		this.context = this.$canvas.appendTo(this.$container).get(0).getContext('2d');
		this.points = [];
		this.fishes = [];
		this.watchIds = [];
		this.isRunning = false; // 标志位：控制动画循环是否运行
	},
	createSurfacePoints : function(){
		var count = Math.round(this.width / this.POINT_INTERVAL);
		this.pointInterval = this.width / (count - 1);
		this.points.push(new SURFACE_POINT(this, 0));
		
		for(var i = 1; i < count; i++){
			var point = new SURFACE_POINT(this, i * this.pointInterval),
				previous = this.points[i - 1];
				
			point.setPreviousPoint(previous);
			previous.setNextPoint(point);
			this.points.push(point);
		}
	},
	reconstructMethods : function(){
		this.watchWindowSize = this.watchWindowSize.bind(this);
		this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
		this.startEpicenter = this.startEpicenter.bind(this);
		this.moveEpicenter = this.moveEpicenter.bind(this);
		this.reverseVertical = this.reverseVertical.bind(this);
		this.render = this.render.bind(this);
	},
	setup : function(){
		// 确保容器引用有效
		if (!this.$container || this.$container.length === 0) {
			this.$container = $('#jsi-flying-fish-container');
			if (this.$container.length === 0) {
				return; // 容器不存在，不初始化
			}
		}
		
		// 确保canvas存在（setParameters中应该已经创建，这里只是确认）
		if (!this.$canvas || this.$canvas.length === 0 || !this.context) {
			return; // canvas不存在，说明setParameters失败了
		}
		
		this.points.length = 0;
		this.fishes.length = 0;
		this.watchIds.length = 0;
		this.intervalCount = this.MAX_INTERVAL_COUNT;
		this.width = this.$container.width();
		this.height = this.$container.height();
		
		// 检查尺寸是否有效
		if (this.width === 0 || this.height === 0) {
			// 如果尺寸为0，延迟重试
			var self = this;
			setTimeout(function() {
				if (self.$container && self.$container.length > 0) {
					self.setup();
				}
			}, 100);
			return;
		}
		
		this.fishCount = this.FISH_COUNT * this.width / 500 * this.height / 500;
		this.$canvas.attr({width : this.width, height : this.height});
		this.reverse = false;
		this.isRunning = true; // 启动动画循环
		
		this.fishes.push(new FISH(this));
		this.createSurfacePoints();
	},
	watchWindowSize : function(){
		this.clearTimer();
		this.tmpWidth = this.$window.width();
		this.tmpHeight = this.$window.height();
		this.watchIds.push(setTimeout(this.jdugeToStopResize, this.WATCH_INTERVAL));
	},
	clearTimer : function(){
		while(this.watchIds.length > 0){
			clearTimeout(this.watchIds.pop());
		}
	},
	jdugeToStopResize : function(){
		var width = this.$window.width(),
			height = this.$window.height(),
			stopped = (width == this.tmpWidth && height == this.tmpHeight);
			
		this.tmpWidth = width;
		this.tmpHeight = height;
		
		if(stopped){
			this.setup();
		}
	},
	bindEvent : function(){
		this.$window.on('resize', this.watchWindowSize);
		this.$container.on('mouseenter', this.startEpicenter);
		this.$container.on('mousemove', this.moveEpicenter);
		// 禁用点击反转功能，防止鱼儿入水后点击时颜色反转
		// this.$container.on('click', this.reverseVertical);
	},
	getAxis : function(event){
		var offset = this.$container.offset();
		
		return {
			x : event.clientX - offset.left + this.$window.scrollLeft(),
			y : event.clientY - offset.top + this.$window.scrollTop()
		};
	},
	startEpicenter : function(event){
		this.axis = this.getAxis(event);
	},
	moveEpicenter : function(event){
		var axis = this.getAxis(event);
		
		if(!this.axis){
			this.axis = axis;
		}
		this.generateEpicenter(axis.x, axis.y, axis.y - this.axis.y);
		this.axis = axis;
	},
	generateEpicenter : function(x, y, velocity){
		if(y < this.height / 2 - this.THRESHOLD || y > this.height / 2 + this.THRESHOLD){
			return;
		}
		var index = Math.round(x / this.pointInterval);
		
		if(index < 0 || index >= this.points.length){
			return;
		}
		this.points[index].interfere(y, velocity);
	},
	reverseVertical : function(){
		this.reverse = !this.reverse;
		
		for(var i = 0, count = this.fishes.length; i < count; i++){
			this.fishes[i].reverseVertical();
		}
	},
	controlStatus : function(){
		for(var i = 0, count = this.points.length; i < count; i++){
			this.points[i].updateSelf();
		}
		for(var i = 0, count = this.points.length; i < count; i++){
			this.points[i].updateNeighbors();
		}
		if(this.fishes.length < this.fishCount){
			if(--this.intervalCount == 0){
				this.intervalCount = this.MAX_INTERVAL_COUNT;
				this.fishes.push(new FISH(this));
			}
		}
	},
	render : function(){
		// 如果动画已停止，不再继续（必须在最开始检查）
		if (!this.isRunning) {
			return;
		}
		
		// 检查context是否有效（如果canvas被移除，context也会失效）
		if (!this.context || !this.$canvas || this.$canvas.length === 0) {
			this.isRunning = false;
			return;
		}
		
		// 在检查通过后再注册下一帧
		requestAnimationFrame(this.render);
		
		this.controlStatus();
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.fillStyle = 'hsl(0, 0%, 95%)';
		
		for(var i = 0, count = this.fishes.length; i < count; i++){
			this.fishes[i].render(this.context);
		}
		this.context.save();
		this.context.globalCompositeOperation = 'xor';
		this.context.beginPath();
		this.context.moveTo(0, this.reverse ? 0 : this.height);
		
		for(var i = 0, count = this.points.length; i < count; i++){
			this.points[i].render(this.context);
		}
		this.context.lineTo(this.width, this.reverse ? 0 : this.height);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}
};
var SURFACE_POINT = function(renderer, x){
	this.renderer = renderer;
	this.x = x;
	this.init();
};
SURFACE_POINT.prototype = {
	SPRING_CONSTANT : 0.03,
	SPRING_FRICTION : 0.9,
	WAVE_SPREAD : 0.3,
	ACCELARATION_RATE : 0.01,
	
	init : function(){
		this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE;
		this.height = this.initHeight;
		this.fy = 0;
		this.force = {previous : 0, next : 0};
	},
	setPreviousPoint : function(previous){
		this.previous = previous;
	},
	setNextPoint : function(next){
		this.next = next;
	},
	interfere : function(y, velocity){
		this.fy = this.renderer.height * this.ACCELARATION_RATE * ((this.renderer.height - this.height - y) >= 0 ? -1 : 1) * Math.abs(velocity);
	},
	updateSelf : function(){
		this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height);
		this.fy *= this.SPRING_FRICTION;
		this.height += this.fy;
	},
	updateNeighbors : function(){
		if(this.previous){
			this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height);
		}
		if(this.next){
			this.force.next = this.WAVE_SPREAD * (this.height - this.next.height);
		}
	},
	render : function(context){
		if(this.previous){
			this.previous.height += this.force.previous;
			this.previous.fy += this.force.previous;
		}
		if(this.next){
			this.next.height += this.force.next;
			this.next.fy += this.force.next;
		}
		context.lineTo(this.x, this.renderer.height - this.height);
	}
};
var FISH = function(renderer){
	this.renderer = renderer;
	this.init();
};
FISH.prototype = {
	GRAVITY : 0.4,
	
	init : function(){
		this.direction = Math.random() < 0.5;
		this.x = this.direction ? (this.renderer.width + this.renderer.THRESHOLD) : -this.renderer.THRESHOLD;
		this.previousY = this.y;
		this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1);
		
		if(this.renderer.reverse){
			this.y = this.getRandomValue(this.renderer.height * 1 / 10, this.renderer.height * 4 / 10);
			this.vy = this.getRandomValue(2, 5);
			this.ay = this.getRandomValue(0.05, 0.2);
		}else{
			this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 / 10);
			this.vy = this.getRandomValue(-5, -2);
			this.ay = this.getRandomValue(-0.2, -0.05);
		}
		this.isOut = false;
		this.theta = 0;
		this.phi = 0;
	},
	getRandomValue : function(min, max){
		return min + (max - min) * Math.random();
	},
	reverseVertical : function(){
		this.isOut = !this.isOut;
		this.ay *= -1;
	},
	controlStatus : function(context){
		this.previousY = this.y;
		this.x += this.vx;
		this.y += this.vy;
		this.vy += this.ay;
		
		if(this.renderer.reverse){
			if(this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE){
				this.vy -= this.GRAVITY;
				this.isOut = true;
			}else{
				if(this.isOut){
					this.ay = this.getRandomValue(0.05, 0.2);
				}
				this.isOut = false;
			}
		}else{
			if(this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE){
				this.vy += this.GRAVITY;
				this.isOut = true;
			}else{
				if(this.isOut){
					this.ay = this.getRandomValue(-0.2, -0.05);
				}
				this.isOut = false;
			}
		}
		if(!this.isOut){
			this.theta += Math.PI / 20;
			this.theta %= Math.PI * 2;
			this.phi += Math.PI / 30;
			this.phi %= Math.PI * 2;
		}
		this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD, this.y, this.y - this.previousY);
		
		if(this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD || this.vx < 0 && this.x < -this.renderer.THRESHOLD){
			this.init();
		}
	},
	render : function(context){
		context.save();
		context.translate(this.x, this.y);
		context.rotate(Math.PI + Math.atan2(this.vy, this.vx));
		context.scale(1, this.direction ? 1 : -1);
		context.beginPath();
		context.moveTo(-30, 0);
		context.bezierCurveTo(-20, 15, 15, 10, 40, 0);
		context.bezierCurveTo(15, -10, -20, -15, -30, 0);
		context.fill();
		
		context.save();
		context.translate(40, 0);
		context.scale(0.9 + 0.2 * Math.sin(this.theta), 1);
		context.beginPath();
		context.moveTo(0, 0);
		context.quadraticCurveTo(5, 10, 20, 8);
		context.quadraticCurveTo(12, 5, 10, 0);
		context.quadraticCurveTo(12, -5, 20, -8);
		context.quadraticCurveTo(5, -10, 0, 0);
		context.fill();
		context.restore();
		
		context.save();
		context.translate(-3, 0);
		context.rotate((Math.PI / 3 + Math.PI / 10 * Math.sin(this.phi)) * (this.renderer.reverse ? -1 : 1));
		
		context.beginPath();
		
		if(this.renderer.reverse){
			context.moveTo(5, 0);
			context.bezierCurveTo(10, 10, 10, 30, 0, 40);
			context.bezierCurveTo(-12, 25, -8, 10, 0, 0);
		}else{
			context.moveTo(-5, 0);
			context.bezierCurveTo(-10, -10, -10, -30, 0, -40);
			context.bezierCurveTo(12, -25, 8, -10, 0, 0);
		}
		context.closePath();
		context.fill();
		context.restore();
		context.restore();
		this.controlStatus(context);
	}
};
// 初始化函数
function initFishRenderer() {
	// 如果已经初始化过，先清理
	if (window.fishRendererInitialized) {
		// 停止动画循环
		RENDERER.isRunning = false;
		
		// 清理事件监听
		if (RENDERER.$window) {
			RENDERER.$window.off('resize', RENDERER.watchWindowSize);
		}
		if (RENDERER.$container) {
			RENDERER.$container.off('mouseenter', RENDERER.startEpicenter);
			RENDERER.$container.off('mousemove', RENDERER.moveEpicenter);
		}
		
		// 移除canvas
		if (RENDERER.$canvas && RENDERER.$canvas.length > 0) {
			RENDERER.$canvas.remove();
		}
		
		// 重置状态和引用
		RENDERER.points = [];
		RENDERER.fishes = [];
		RENDERER.watchIds = [];
		RENDERER.$container = null;
		RENDERER.$canvas = null;
		RENDERER.context = null;
	}
	
	// 重置标志位
	window.fishRendererInitialized = false;
	
	// 直接尝试初始化，使用简单的延迟
	setTimeout(function() {
		var $container = $('#jsi-flying-fish-container');
		if ($container.length > 0) {
			// 容器存在，尝试初始化
			RENDERER.init();
			// 检查是否成功初始化（通过检查canvas是否存在）
			if (RENDERER.$canvas && RENDERER.$canvas.length > 0) {
				window.fishRendererInitialized = true;
			} else {
				// 如果初始化失败，再延迟重试一次
				setTimeout(function() {
					var $containerRetry = $('#jsi-flying-fish-container');
					if ($containerRetry.length > 0) {
						RENDERER.init();
						if (RENDERER.$canvas && RENDERER.$canvas.length > 0) {
							window.fishRendererInitialized = true;
						}
					}
				}, 500);
			}
		}
	}, 100);
}

// 页面加载时初始化
$(function(){
	initFishRenderer();
});

// PJAX支持：页面跳转后重新初始化
// 只监听pjax:complete，避免重复触发
// pjax:complete在DOM更新完成后触发，比pjax:success更可靠
document.addEventListener('pjax:complete', function() {
	initFishRenderer();
});