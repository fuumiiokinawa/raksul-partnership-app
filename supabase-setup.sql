-- Supabaseで実行するSQL
-- プロジェクト作成後、SQL Editorで以下を実行してください

-- 訪問記録テーブル
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_date DATE NOT NULL,
  staff VARCHAR(50) NOT NULL,
  company VARCHAR(100) NOT NULL,
  industry VARCHAR(50),
  office VARCHAR(10) NOT NULL,
  raksul_id_status VARCHAR(20) DEFAULT '-',
  raksul_email VARCHAR(100),
  -- 提案
  proposal_bank VARCHAR(5) DEFAULT '-',
  proposal_pay VARCHAR(5) DEFAULT '-',
  proposal_mall VARCHAR(5) DEFAULT '-',
  proposal_meo VARCHAR(5) DEFAULT '-',
  proposal_video VARCHAR(5) DEFAULT '-',
  -- 結果
  result_bank VARCHAR(20) DEFAULT '-',
  result_pay VARCHAR(20) DEFAULT '-',
  result_mall VARCHAR(20) DEFAULT '-',
  result_meo VARCHAR(20) DEFAULT '-',
  result_video VARCHAR(20) DEFAULT '-',
  -- その他
  ng_reason VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 全員が読み書きできるポリシー（社内ツール用）
CREATE POLICY "Allow all access" ON visits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- インデックス
CREATE INDEX idx_visits_date ON visits(visit_date DESC);
CREATE INDEX idx_visits_staff ON visits(staff);
CREATE INDEX idx_visits_office ON visits(office);
