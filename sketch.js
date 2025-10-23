// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的預設文字

// 確保這是全域變數，用於煙火特效
let fireworksParticles = [];
const GRAVITY = 0.2; // 模擬重力

window.addEventListener('message', function (event) {
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        // 更新全域變數
        finalScore = data.score; 
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
    }
}, false);

// =================================================================
// 步驟三：Particle 類別 (用於煙火)
// -----------------------------------------------------------------

class Particle {
    constructor(x, y, hu) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D(); 
        this.vel.mult(random(2, 10)); 
        this.acc = createVector(0, 0);
        this.lifespan = 255;
        this.hu = hu || random(255); 
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.applyForce(createVector(0, GRAVITY)); 
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.lifespan -= 4; 
        this.vel.mult(0.95); 
    }

    show() {
        // 注意：這裡不設定 colorMode，因為 draw() 會在繪製粒子前設定為 HSB
        noStroke();
        // fill(Hue, Saturation, Brightness, Alpha)
        fill(this.hu, 255, 255, this.lifespan); 
        ellipse(this.pos.x, this.pos.y, 4, 4);
    }

    isFinished() {
        return this.lifespan < 0;
    }
}

function explodeFirework() {
    let x = width / 2;
    let y = height / 2 - 100;
    let hu = random(255); 

    for (let i = 0; i < 100; i++) {
        fireworksParticles.push(new Particle(x, y, hu));
    }
}

// =================================================================
// 步驟二：使用 p5.js 繪製分數
// -----------------------------------------------------------------

function setup() { 
    createCanvas(windowWidth / 2, windowHeight / 2); 
    // 設置 HSB 模式的範圍，供粒子使用
    colorMode(HSB, 255); 
} 

function draw() { 
    
    // ***** 背景處理 (必須使用 RGB) *****
    // 確保使用 RGB 模式來繪製帶透明度的背景，以產生殘影效果
    colorMode(RGB); 
    background(255, 50); // 白色背景 + 透明度 50
    
    
    // --- 1. 初始化文本變數 ---
    // 預設訊息 (0/0 時顯示)
    let mainMessage = `尚未收到成績。`; 
    let mainColor = color(150);  // 預設顏色 (灰色)
    let messageY = height / 2;   // 預設 Y 座標
    
    // 計算百分比
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
    
    // -----------------------------------------------------------------
    // A. 根據分數區間設定文本內容和顏色
    // -----------------------------------------------------------------
    
    // 只有當分數大於 0 時，才執行分數判斷邏輯
    if (finalScore > 0 || maxScore > 0) {
        messageY = height / 2 - 50; // 文本上移，為具體分數騰出空間
        mainMessage = "分數已更新。"; // 預設更新後的訊息
        mainColor = color(50); // 深灰色
        
        if (finalScore === maxScore && maxScore > 0) {
            // 滿分
            mainMessage = "滿分！完美表現！";
            mainColor = color(0, 200, 50); // 綠色
            
            // ******* 觸發煙火特效 *******
            if (random(1) < 0.2) { 
                explodeFirework(); 
            }
            
        } else if (percentage >= 90) {
            // 90% 以上
            mainMessage = "恭喜！優異成績！";
            mainColor = color(0, 200, 50); // 綠色
            
        } else if (percentage >= 60) {
            // 60% - 89%
            mainMessage = "成績良好，請再接再厲。";
            mainColor = color(255, 181, 35); // 黃色
            
        } else if (percentage > 0) {
            // 1% - 59%
            mainMessage = "需要加強努力！";
            mainColor = color(200, 0, 0); // 紅色
            
        }
    } 

    
    // -----------------------------------------------------------------
    // B. 繪製文本 (統一繪製邏輯)
    // -----------------------------------------------------------------
    
    // 繪製主要的成績訊息 (例如：滿分！完美表現！)
    textSize(80); 
    textAlign(CENTER);
    fill(mainColor); 
    text(mainMessage, width / 2, messageY);
    
    // 繪製具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // C. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // -----------------------------------------------------------------
    // D. 煙火粒子系統更新與繪製
    // -----------------------------------------------------------------
    
    // ***** 關鍵：切換到 HSB 模式繪製粒子 *****
    colorMode(HSB, 255); 
    for (let i = fireworksParticles.length - 1; i >= 0; i--) {
        fireworksParticles[i].update();
        fireworksParticles[i].show();
        
        // 移除已經結束生命的粒子
        if (fireworksParticles[i].isFinished()) {
            fireworksParticles.splice(i, 1);
        }
    }
}
