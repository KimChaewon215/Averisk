import React, { useState } from "react";
import "./App.css";

export default function AveriskApp() {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);
  const [fee, setFee] = useState(0.001);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const totalCost = avgPrice * quantity + newPrice * newQuantity;
    const totalQuantity = quantity + newQuantity;
    const newAvg = totalQuantity ? totalCost / totalQuantity : 0;

    const currentLossRate = ((currentPrice - avgPrice) / avgPrice) * 100;
    const newLossRate = ((currentPrice - newAvg) / newAvg) * 100;
    const improvement = newLossRate - currentLossRate;

    const originalCost = avgPrice * quantity;
    const addedCost = newPrice * newQuantity;
    const riskIncrease = (addedCost / originalCost) * 100;

    const breakevenPrice = newAvg * (1 + fee);
    const requiredReturn =
      ((breakevenPrice - currentPrice) / currentPrice) * 100;

    // 🔥 추가: 본전 도달 필요 수량 계산
    let neededQuantity = null;
    if (newPrice < currentPrice) {
      neededQuantity =
        (avgPrice * quantity - currentPrice * quantity) /
        (currentPrice - newPrice);

      if (neededQuantity < 0) neededQuantity = 0;
    }

    let decision = "";
    let reason = "";

    if (currentLossRate < 0 && newLossRate > 0) {
      decision = "✅ 손실 → 수익 전환";
      reason = "손실에서 수익으로 전환된 구조입니다.";
    } else if (currentLossRate > 0) {
      decision = "⚠️ 수익 구간 추가 매수";
      reason = "수익률이 감소할 수 있습니다.";
    } else if (riskIncrease > 100) {
      decision = "❌ 리스크 과도 증가";
      reason = "투자 비중이 과도하게 증가합니다.";
    } else if (improvement > 5 && riskIncrease < 50) {
      decision = "✅ 손실 완화 효과 양호";
      reason = "리스크 대비 효율적인 물타기입니다.";
    } else if (improvement < 2) {
      decision = "⚠️ 효과 미미";
      reason = "평단 개선 효과가 작습니다.";
    } else {
      decision = "⚠️ 신중한 판단 필요";
      reason = "리스크 대비 효과가 애매합니다.";
    }

    // 🔥 리스크 점수
    let riskScore = 0;
    riskScore += Math.abs(newLossRate);
    riskScore += riskIncrease * 0.5;
    riskScore -= improvement * 2;
    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel = "";
    if (riskScore < 30) riskLevel = "safe";
    else if (riskScore < 70) riskLevel = "medium";
    else riskLevel = "danger";

    return {
      newAvg,
      newLossRate,
      decision,
      reason,
      breakevenPrice,
      requiredReturn,
      riskScore,
      riskLevel,
      neededQuantity,
    };
  };

  const handleCalculate = () => {
    setResult(calculate());
  };

  const handleFeeApply = () => {
    if (!result) return;
    setResult(calculate());
  };

  const isProfit = result?.newLossRate > 0;

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Averisk</h1>
        <p>평균단가 변화와 리스크를 분석해</p>
        <p>물타기 전략의 합리성을 판단하는 서비스</p>
        <br></br>
        <input
          type="number"
          placeholder="현재 주가"
          className="input center"
          onChange={(e) => setCurrentPrice(Number(e.target.value))}
        />

        <div className="row">
          <input
            type="number"
            placeholder="기존 평단가"
            className="input"
            onChange={(e) => setAvgPrice(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="보유 수량"
            className="input"
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div className="row">
          <input
            type="number"
            placeholder="추가 매수 가격"
            className="input"
            onChange={(e) => setNewPrice(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="추가 매수 수량"
            className="input"
            onChange={(e) => setNewQuantity(Number(e.target.value))}
          />
        </div>

        <button className="btn" onClick={handleCalculate}>
          계산하기
        </button>

        {result && (
          <>
            <div className="result">
              <p>📊 평단가: {result.newAvg.toFixed(2)}</p>
              <p>📉 수익률: {result.newLossRate.toFixed(2)}%</p>

              <div className="decision">{result.decision}</div>
              <div className="reason">💡 {result.reason}</div>
            </div>

            {/* 수수료 */}
            <div className="fee-box">
              <p className="fee-title">수수료 선택</p>

              <div className="fee-row">
                <label>
                  <input
                    type="radio"
                    value={0.0005}
                    checked={fee === 0.0005}
                    onChange={(e) => setFee(Number(e.target.value))}
                  />
                  0.05%
                </label>

                <label>
                  <input
                    type="radio"
                    value={0.001}
                    checked={fee === 0.001}
                    onChange={(e) => setFee(Number(e.target.value))}
                  />
                  0.1%
                </label>

                <label>
                  <input
                    type="radio"
                    value={0.002}
                    checked={fee === 0.002}
                    onChange={(e) => setFee(Number(e.target.value))}
                  />
                  0.2%
                </label>

                <input
                  type="number"
                  placeholder="직접 입력(%)"
                  className="fee-input"
                  onChange={(e) => setFee(Number(e.target.value) / 100)}
                />
              </div>

              <button className="fee-btn" onClick={handleFeeApply}>
                수수료 적용
              </button>
            </div>

            <div className="extra">
              <p>📌 현재 기준 수익률: {result.newLossRate.toFixed(2)}%</p>

              {result.neededQuantity !== null ? (
                <p>
                  🧮 본전 도달 필요 추가 매수:{" "}
                  {Math.ceil(result.neededQuantity)}주
                </p>
              ) : (
                <p className="warning-msg">
                  ⚠️ 현재 가격보다 높은 가격으로는 본전 도달이 불가능합니다
                </p>
              )}

              {isProfit && (
                <p className="profit-msg">🎉 이미 수익 구간입니다</p>
              )}

              <div className={`risk-box ${result.riskLevel}`}>
                ⚠️ 리스크 점수: {result.riskScore.toFixed(0)} / 100
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}