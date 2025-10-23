// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// !!! 新增：用於煙火特效的粒子陣列 !!!
let fireworksParticles = [];
const GRAVITY = 0.2; // 模擬重力

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // 由於 draw() 會持續執行，這裡不需要手動呼叫 redraw()
    }
}, false);

// =================================================================
// 步驟三：新增 Particle 類別 (用於煙火)
// -----------------------------------------------------------------

class Particle {
    constructor(x, y, hu) {
        this.pos = createVector(x, y);
        // 給予一個隨機的爆炸速度
        this.vel = p5.Vector.random2D(); 
        this.vel.mult(random(2, 10)); // 速度範圍
        this.acc = createVector(0, 0);
        this.lifespan = 255;
        this.hu = hu || random(255); // 色相 (Hue)
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.applyForce(createVector(0, GRAVITY)); // 套用重力
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.lifespan -= 4; // 減少生命值 (模擬粒子淡出)
        this.vel.mult(0.95); // 模擬空氣阻力或減速
    }

    show() {
        // 注意：這裡不設定 colorMode，因為 draw() 會在繪製粒子前設定為 HSB
        noStroke();
        // fill(Hue, Saturation, Brightness, Alpha)
        // 這裡的 255 是因為 setup 中已將 HSB 的範圍設為 255
        fill(this.hu, 255, 255, this.lifespan); 
        ellipse(this.pos.x, this.pos.y, 4, 4);
    }

    isFinished() {
        return this.lifespan < 0;
    }
}

// !!! 新增：觸發爆炸的函數 !!!
function explodeFirework() {
    // 爆炸點設在畫面中央上方
    let x = width / 2;
    let y = height / 2 - 100;
    let hu = random(255); // 隨機顏色

    // 產生大量粒子 (模擬爆炸)
    for (let i = 0; i < 100; i++) {
        fireworksParticles.push(new Particle(x, y, hu));
    }
}

// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    createCanvas(windowWidth / 2, windowHeight / 2); 
    // ***** 關鍵修正 1：設定 HSB 顏色模式的範圍 *****
    // 讓 HSB 的 H, S, B, Alpha 都使用 0-255 的範圍，與粒子的 lifespan 匹配
    colorMode(HSB, 255); 
    // 確保 noLoop() 被移除，draw() 才能持續執行
} 

function draw() { 
    // ***** 關鍵修正 2：使用帶透明度的背景 *****
    // 使用 RGB 模式設定背景，帶透明度 (例如 50)，實現粒子殘影效果
    colorMode(RGB); 
    background(255, 50); // 白色背景 + 透明度 50
    

    // 計算百分比
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    textSize(80); 
    textAlign(CENTER);
    
    
    // !!! 關鍵修改點：檢查是否滿分，並觸發煙火 !!!
    if (finalScore > 0 && finalScore === maxScore) {
        // 滿分：顯示鼓勵文本，並在畫面上觸發煙火爆炸
        fill(0, 200, 50); // 綠色 
        text("滿分！完美表現！", width / 2, height / 2 - 50);
        
        // ******* 觸發煙火特效 *******
        // 增加發射頻率，確保更容易看到
        if (random(1) < 0.2) { // 將機率提高到 20%
            explodeFirework(); 
        }
        
    } else if (percentage >= 90) {
        // 高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
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
    // C. 煙火粒子系統更新與繪製
    // -----------------------------------------------------------------
    
    // ***** 關鍵修正 3：切換到 HSB 模式繪製粒子 *****
    colorMode(HSB, 255); 
    for (let i = fireworksParticles.length - 1; i >= 0; i--) {
        fireworksParticles[i].update();
        fireworksParticles[i].show();
        
        // 移除已經結束生命的粒子
        if (fireworksParticles[i].isFinished()) {
            fireworksParticles.splice(i, 1);
        }
    }
    // draw() 迴圈下一幀會重新開始，並設置 background(RGB)，所以這裡不需要切換回 RGB。
}
