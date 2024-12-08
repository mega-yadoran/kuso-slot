const canvas = document.getElementById("slotCanvas");
const ctx = canvas.getContext("2d");

let reelWidth = 150;

// ウィンドウリサイズ時や初期ロード時にキャンバスサイズを更新する関数
function resizeCanvas() {
  // 現在表示中のサイズを取得
  const rect = canvas.getBoundingClientRect();

  // 高解像度対応（オプション）：デバイスピクセル比
  const dpr = window.devicePixelRatio || 1;

  // 表示領域に合わせてcanvasの内部解像度を再設定
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // コンテキストをスケーリング（高解像度対応）
  ctx.scale(dpr, dpr);

  // リール描画用のフォント
  ctx.font = "bold " + (80 / dpr) * (dpr > 1 ? 1.5 : 1) + "px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  reelWidth = (150 / dpr) * (dpr > 1 ? 1.2 : 1);

  // サイズ変更後に描画
  draw();
}

// リールの設定
const reelHeight = 400;
const reelCount = 3;
const symbolHeight = 100;
const symbols = [
  ["🎉", "🍒", "🍒", "🍒", "🍒", "🍒"],
  ["🎉", "🍭", "🍭", "🍭", "🍭", "🍭"],
  ["🎉", "🍇", "🍇", "🍇", "🍇", "🍇"],
];
const symbolCount = symbols[0].length;

// リールの状態
const reels = [];
const reelSpeeds = [5, 5, 5];
let isSpinning = [true, true, true];

// リールの初期化
for (let i = 0; i < reelCount; i++) {
  reels.push({
    position: Math.floor(Math.random() * symbolCount) * symbolHeight,
  });
}

// キャンバス全体の中央にリールを配置
const totalReelsWidth = reelWidth * reelCount;
const offsetX = (canvas.width - totalReelsWidth) / 2;

// リールを回転させる
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < reelCount; i++) {
    const reelX = offsetX + i * reelWidth;

    if (isSpinning[i]) {
      // リールを回転させる
      reels[i].position -= reelSpeeds[i];
      if (reels[i].position < 0) {
        reels[i].position =
          symbolCount * symbolHeight - Math.abs(reels[i].position);
      }
    }

    // 各リールにシンボルを描画
    for (let j = -1; j <= Math.ceil(reelHeight / symbolHeight); j++) {
      let symbolIndex =
        Math.floor((reels[i].position + j * symbolHeight) / symbolHeight) %
        symbolCount;
      if (symbolIndex < 0) {
        symbolIndex += symbolCount;
      }
      const y = j * symbolHeight - (reels[i].position % symbolHeight);
      ctx.fillText(
        symbols[i][symbolIndex],
        reelX + reelWidth / 2,
        y + symbolHeight / 2
      );
    }
  }

  // 全てのリールが停止している場合、赤い線を引く処理
  if (!isSpinning.some((spinning) => spinning)) {
    highlightMatchingSymbols();
  }

  requestAnimationFrame(draw);
}

// リール停止
function stopReel(index) {
  isSpinning[index] = false;
}

// 🎉の絵柄に水平線を引く
function highlightMatchingSymbols() {
  const highlightedSymbol = symbols[0][0];

  // 水平線を描画
  for (let i = 0; i < reelCount; i++) {
    // 各リール内のシンボルをチェック
    for (let j = -1; j <= Math.ceil(reelHeight / symbolHeight); j++) {
      const symbolIndex = Math.floor(
        (reels[i].position + j * symbolHeight) / symbolHeight
      );

      // 負のインデックスまたはシンボル数を超えるインデックスを修正
      const correctedIndex =
        symbolIndex < 0
          ? symbolIndex + symbolCount
          : symbolIndex >= symbolCount
          ? symbolIndex - symbolCount
          : symbolIndex;
      console.log(
        `${correctedIndex}, ${symbols[i][correctedIndex]}, ${highlightedSymbol}`
      );

      // 同じ絵柄の場合、線を引く
      if (symbols[i][correctedIndex] === highlightedSymbol) {
        const y =
          j * symbolHeight -
          (reels[i].position % symbolHeight) +
          symbolHeight / 2;

        // 赤い線をキャンバス全体に引く
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.moveTo(0, y); // キャンバスの左端
        ctx.lineTo(canvas.width, y); // キャンバスの右端
        ctx.stroke();
      }
    }
  }
}

// ウィンドウリサイズ時にキャンバスサイズ更新
window.addEventListener("resize", resizeCanvas);

// 初期ロード時にキャンバスサイズを更新
// ここで一度リサイズして描画を行う
resizeCanvas();
