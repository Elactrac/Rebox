import React, { useState, useEffect } from 'react';
import { rewardsAPI } from '../services/api';
import { Gift, Star, Trophy, TrendingUp, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const Rewards = () => {
  const [rewards, setRewards] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemModal, setRedeemModal] = useState(false);
  const [redeemData, setRedeemData] = useState({ points: 100, rewardType: 'CASH' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, transRes, leaderRes, levelsRes] = await Promise.all([
        rewardsAPI.get(),
        rewardsAPI.getTransactions({ limit: 10 }),
        rewardsAPI.getLeaderboard(5),
        rewardsAPI.getLevels()
      ]);
      setRewards(rewardsRes.data.data);
      setTransactions(transRes.data.data.transactions);
      setLeaderboard(leaderRes.data.data);
      setLevels(levelsRes.data.data);
    } catch (error) {
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (redeemData.points > rewards.availablePoints) {
      toast.error('Insufficient points');
      return;
    }
    
    try {
      await rewardsAPI.redeem(redeemData);
      toast.success('Points redeemed successfully!');
      setRedeemModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  const levelProgress = rewards?.nextLevelConfig 
    ? ((rewards.lifetimePoints - rewards.currentLevelConfig.min) / 
       (rewards.nextLevelConfig.min - rewards.currentLevelConfig.min)) * 100
    : 100;

  return (
    <div className="rewards-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rewards</h1>
          <p className="page-description">Earn points and redeem rewards</p>
        </div>
        <button className="btn btn-primary" onClick={() => setRedeemModal(true)}>
          <Gift size={18} /> Redeem Points
        </button>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-3 mb-6">
        <div className="card points-card">
          <div className="points-header">
            <Star className="points-icon" />
            <span className="points-label">Available Points</span>
          </div>
          <div className="points-value">{rewards?.availablePoints.toLocaleString()}</div>
          <div className="points-cash">
            Worth ${(rewards?.availablePoints / 100).toFixed(2)}
          </div>
        </div>

        <div className="card level-card">
          <div className="level-badge">
            <Trophy size={24} />
            <span>{rewards?.level}</span>
          </div>
          <div className="level-progress">
            <div className="progress">
              <div className="progress-bar" style={{ width: `${levelProgress}%` }}></div>
            </div>
            {rewards?.nextLevel && (
              <span className="level-next">
                {rewards.pointsToNextLevel.toLocaleString()} pts to {rewards.nextLevel}
              </span>
            )}
          </div>
          <div className="level-multiplier">
            {rewards?.currentLevelConfig?.multiplier}x points multiplier
          </div>
        </div>

        <div className="card lifetime-card">
          <div className="lifetime-header">
            <TrendingUp size={20} />
            <span>Lifetime Points</span>
          </div>
          <div className="lifetime-value">{rewards?.lifetimePoints.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Recent Transactions */}
        <div className="card">
          <h3 className="card-title">Recent Transactions</h3>
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="tx-info">
                    <span className="tx-type">{tx.type.replace('_', ' ')}</span>
                    <span className="tx-desc">{tx.description}</span>
                  </div>
                  <span className={`tx-points ${tx.points >= 0 ? 'positive' : 'negative'}`}>
                    {tx.points >= 0 ? '+' : ''}{tx.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h3 className="card-title">Top Recyclers</h3>
          <div className="leaderboard">
            {leaderboard.map((entry, index) => (
              <div key={entry.userId} className="leaderboard-item">
                <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                <div className="leader-info">
                  <span className="leader-name">{entry.name}</span>
                  <span className="leader-level">{entry.level}</span>
                </div>
                <span className="leader-points">{entry.lifetimePoints.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward Levels */}
      <div className="card mt-6">
        <h3 className="card-title">Reward Levels</h3>
        <div className="levels-grid">
          {levels.map((level) => (
            <div 
              key={level.level} 
              className={`level-item ${rewards?.level === level.level ? 'current' : ''}`}
            >
              <div className="level-header">
                <Award size={20} />
                <span className="level-name">{level.level}</span>
              </div>
              <div className="level-points">
                {level.minPoints.toLocaleString()}+ pts
              </div>
              <div className="level-multiplier-badge">
                {level.multiplier}x multiplier
              </div>
              <ul className="level-benefits">
                {level.benefits.slice(0, 3).map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Modal */}
      {redeemModal && (
        <div className="modal-backdrop" onClick={() => setRedeemModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Redeem Points</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Points to Redeem</label>
                <input
                  type="number"
                  className="form-input"
                  value={redeemData.points}
                  onChange={(e) => setRedeemData({ ...redeemData, points: parseInt(e.target.value) })}
                  min="100"
                  step="100"
                  max={rewards?.availablePoints}
                />
                <span className="form-hint">
                  Value: ${(redeemData.points / 100).toFixed(2)} (100 pts = $1)
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Reward Type</label>
                <select
                  className="form-select"
                  value={redeemData.rewardType}
                  onChange={(e) => setRedeemData({ ...redeemData, rewardType: e.target.value })}
                >
                  <option value="CASH">Cash</option>
                  <option value="GIFTCARD">Gift Card</option>
                  <option value="DONATION">Donate to Charity</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRedeemModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRedeem}>
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }

        .points-card {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
        }

        .points-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .points-icon {
          color: rgba(255,255,255,0.8);
        }

        .points-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .points-value {
          font-size: 2.5rem;
          font-weight: 800;
        }

        .points-cash {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-top: 0.25rem;
        }

        .level-card {
          text-align: center;
        }

        .level-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(245, 158, 11, 0.1);
          color: #D97706;
          border-radius: 2rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .level-progress {
          margin-bottom: 0.75rem;
        }

        .level-next {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-top: 0.5rem;
          display: block;
        }

        .level-multiplier {
          font-size: 0.875rem;
          color: var(--gray-600);
        }

        .lifetime-card {
          background: var(--gray-900);
          color: white;
        }

        .lifetime-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }

        .lifetime-value {
          font-size: 2rem;
          font-weight: 800;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--gray-100);
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .tx-type {
          font-weight: 500;
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        .tx-desc {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .tx-points {
          font-weight: 600;
        }

        .tx-points.positive {
          color: var(--primary);
        }

        .tx-points.negative {
          color: var(--danger);
        }

        .leaderboard {
          display: flex;
          flex-direction: column;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--gray-100);
        }

        .rank {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          background: var(--gray-100);
        }

        .rank-1 { background: #FFD700; color: white; }
        .rank-2 { background: #C0C0C0; color: white; }
        .rank-3 { background: #CD7F32; color: white; }

        .leader-info {
          flex: 1;
        }

        .leader-name {
          font-weight: 500;
        }

        .leader-level {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .leader-points {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .levels-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .level-item {
          padding: 1rem;
          border: 2px solid var(--gray-200);
          border-radius: 0.75rem;
          text-align: center;
        }

        .level-item.current {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .level-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
        }

        .level-name {
          font-weight: 600;
        }

        .level-points {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .level-multiplier-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: var(--gray-100);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .level-benefits {
          text-align: left;
          font-size: 0.75rem;
          color: var(--gray-600);
          padding-left: 1rem;
        }

        .level-benefits li {
          margin-bottom: 0.25rem;
        }

        @media (max-width: 1024px) {
          .levels-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 640px) {
          .levels-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Rewards;
