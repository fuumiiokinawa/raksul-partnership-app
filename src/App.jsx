import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const STAFF_LIST = ['知念', '山内', '奥濱', '喜如嘉', '徳田', '稲福', '石田', 'ヴィンス', '伊敷', '嘉数', '青木', '高吉', '橋本', '比嘉裕'];
const OFFICE_LIST = ['ROS', 'TOS'];
const INDUSTRY_LIST = ['製造', '建設', '卸売', '小売', '商社', '不動産', 'サービス', 'IT', '飲食', 'その他'];
const ID_STATUS_LIST = ['開設済', '未開設', '-'];
const RESULT_LIST = ['契約', '内諾', 'トスアップ', 'NG', '検討中', '-'];
const NG_REASONS = ['複数口座不要', '既存取引優先', '既存決済システムあり', '管理が煩雑', '予算なし', '決裁者不在', 'タイミング合わず', '興味なし', '他サービス利用中', 'その他'];

const PRODUCTS = [
  { id: 'bank', name: 'バンク', color: '#2563EB' },
  { id: 'pay', name: 'ペイ', color: '#059669' },
  { id: 'mall', name: 'モール', color: '#D97706' },
  { id: 'meo', name: 'MEO', color: '#7C3AED' },
  { id: 'video', name: '動画', color: '#DC2626' }
];

const RESULT_COLORS = {
  '契約': { bg: '#dcfce7', text: '#166534' },
  '内諾': { bg: '#fef9c3', text: '#854d0e' },
  'トスアップ': { bg: '#dbeafe', text: '#1e40af' },
  'NG': { bg: '#fee2e2', text: '#991b1b' },
  '検討中': { bg: '#f3f4f6', text: '#374151' }
};

const PRODUCT_DETAILS = [
  { id: 'bank', name: 'ラクスルバンク', category: '金融', tagline: '振込手数料119円・ポイント2%還元', color: '#2563EB', icon: '🏦', url: 'https://lp-bank.raksul.com/',
    features: [{ label: '振込手数料', value: '119円', highlight: true, note: '業界最安値水準' },{ label: 'ポイント還元', value: '2%', highlight: true, note: 'デビットカード利用時' },{ label: '口座開設', value: '最短翌日', note: 'オンライン完結' },{ label: 'キャンペーン', value: '1万円', highlight: true, note: '10万円入金で' }],
    target: '創業間もない企業・小規模事業者', merit: '地銀より圧倒的に安い手数料。サブ口座として持っておくだけでお得', salesPoint: '地銀の振込手数料は500円前後。年間100回振込なら約4万円の差額', ngReason: '複数口座を持ちたくない（管理が煩雑）', note: '⚠️ 金融商品のため、営業行為はNG。「ご紹介」として案内' },
  { id: 'pay', name: 'ラクスルペイ', category: '決済', tagline: '決済手数料5%で集客支援付き', color: '#059669', icon: '💳', url: 'https://rpay.raksul.com/',
    features: [{ label: '決済手数料', value: '5%', highlight: true, note: '集客支援込み' },{ label: '集客支援', value: '3ヶ月無料', highlight: true, note: 'SNS・LINE・MEO' },{ label: 'ページ作成', value: '約10分', note: 'スマホで簡単' },{ label: '初期費用', value: '0円', highlight: true, note: '完全成果報酬' }],
    target: 'レジャー・サービス業・対面販売事業者', merit: '決済と集客をセットで提供。小規模事業者の集客課題を解決', salesPoint: '5%の中に集客支援も含まれる。SMBにとって集客を5000円で相手してくれるところはない', ngReason: '既存の決済システムがある', note: '暮らしのマーケット等からのリプレースを狙う' },
  { id: 'mall', name: 'ラクスルビジネスモール', category: '備品購入', tagline: 'オフィス用品が安く買える', color: '#D97706', icon: '🛒', url: 'https://stockroom.raksul.com/',
    features: [{ label: 'コピー用紙', value: '業界最安級', highlight: true, note: 'アスクルより安い' },{ label: '初回割引', value: '半額', highlight: true, note: '初回購入時' },{ label: '品揃え', value: '10万点以上', note: '文具・家具・食品' },{ label: 'ポイント', value: '貯まる', note: 'ラクスルポイント' }],
    target: '全ての法人（特にコピー用紙を使う企業）', merit: 'どこで買うかを変えるだけ。アスクルからの切り替えで安くなる', salesPoint: 'コピー用紙は必ず買うもの。「今どこで買ってますか？」がトーク起点', ngReason: '既存の取引先がある', note: '一番売りやすい商材。ID開設→初回購入まで追う' },
  { id: 'meo', name: 'MEO対策', category: '集客支援', tagline: 'Googleマップ上位表示', color: '#7C3AED', icon: '📍', url: null,
    features: [{ label: 'セルフプラン', value: '1万円/月', note: '初期設定のみ' },{ label: 'プロプラン', value: '4万円/月', highlight: true, note: '運用代行込み' },{ label: '対策内容', value: '多数', note: '口コミ・投稿・写真等' },{ label: '他社比較', value: '安め', highlight: true, note: '幅広くサポート' }],
    target: '店舗ビジネス（飲食・小売・サービス）', merit: 'Googleマップでの集客を強化。ホームページと連携すると効果的', salesPoint: 'ホームページ単体では提供できない集客支援。明確なニーズあり', ngReason: '上位表示されたらやめてしまう', note: 'ホームページとセットで売ると解約防止になる' },
  { id: 'video', name: '出張動画撮影', category: 'コンテンツ', tagline: '5万円でまる投げ出張動画', color: '#DC2626', icon: '🎬', url: 'https://st.raksul.com/web-marketing/content',
    features: [{ label: '撮影費用', value: '5万円', highlight: true, note: '全国どこでも' },{ label: '納品', value: '写真+動画', note: 'SNSにも使える' },{ label: '用途', value: '多数', note: 'HP・SNS・広告' },{ label: '月額', value: '500円〜', highlight: true, note: 'サブスク提供' }],
    target: '動画・写真素材がない企業', merit: 'ホームページに動画があると訴求力UP。SNS素材としても使える', salesPoint: '「御社のHP、写真ないですよね？動画もないですよね？」がトーク起点', ngReason: '自分で撮れる（スマホで十分）', note: 'SK通信はこれをフックにホームページを売っている' },
  { id: 'raksul_id', name: 'ラクスルID登録', category: '基盤', tagline: 'まず登録してもらう', color: '#6366F1', icon: '🆔', url: 'https://raksul.com/',
    features: [{ label: '登録特典', value: '500円', highlight: true, note: '登録するだけ' },{ label: '登録', value: '無料', highlight: true, note: '即時完了' },{ label: '印刷', value: '業界最安', note: '名刺・チラシ等' },{ label: 'ポイント', value: '貯まる', note: '各サービス共通' }],
    target: '全ての訪問先', merit: '登録するだけで500円。その後の各サービス利用の入口になる', salesPoint: '受注時に初期費用を無料にする代わりに全サービス登録してもらう', ngReason: '-', note: 'まずID登録→各商材提案の流れ' }
];

export default function App() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [selectedProduct, setSelectedProduct] = useState(null);

  function getEmptyForm() {
    return { visit_date: new Date().toISOString().split('T')[0], staff: '', company: '', industry: '', office: '', raksul_id_status: '-', raksul_email: '', proposal_bank: '-', proposal_pay: '-', proposal_mall: '-', proposal_meo: '-', proposal_video: '-', result_bank: '-', result_pay: '-', result_mall: '-', result_meo: '-', result_video: '-', ng_reason: '', note: '' };
  }

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (!supabase) { setIsLoading(false); return; }
    try { const { data, error } = await supabase.from('visits').select('*').order('visit_date', { ascending: false }); if (error) throw error; setRecords(data || []); }
    catch (error) { console.error('Load error:', error); }
    finally { setIsLoading(false); }
  }

  async function saveRecord(record) {
    if (!supabase) return;
    setSaveStatus('保存中...');
    try {
      if (editingId) { const { error } = await supabase.from('visits').update({ ...record, updated_at: new Date().toISOString() }).eq('id', editingId); if (error) throw error; }
      else { const { error } = await supabase.from('visits').insert([record]); if (error) throw error; }
      setSaveStatus('✓ 保存完了'); setTimeout(() => setSaveStatus(''), 2000); await loadData();
    } catch (error) { setSaveStatus('⚠ エラー'); console.error('Save error:', error); }
  }

  async function deleteRecord(id) {
    if (!supabase) return;
    if (!confirm('この記録を削除しますか？')) return;
    try { const { error } = await supabase.from('visits').delete().eq('id', id); if (error) throw error; await loadData(); }
    catch (error) { console.error('Delete error:', error); }
  }

  const stats = useMemo(() => {
    const totalVisits = records.length;
    const idOpened = records.filter(r => r.raksul_id_status === '開設済').length;
    const productStats = PRODUCTS.map(p => {
      const proposed = records.filter(r => r[`proposal_${p.id}`] === '○').length;
      const contracts = records.filter(r => r[`result_${p.id}`] === '契約').length;
      const approvals = records.filter(r => r[`result_${p.id}`] === '内諾').length;
      const tossups = records.filter(r => r[`result_${p.id}`] === 'トスアップ').length;
      const ngs = records.filter(r => r[`result_${p.id}`] === 'NG').length;
      return { ...p, proposed, contracts, approvals, tossups, ngs, proposalRate: totalVisits > 0 ? (proposed / totalVisits * 100).toFixed(1) : 0, successRate: proposed > 0 ? ((contracts + approvals + tossups) / proposed * 100).toFixed(1) : 0 };
    });
    const staffStats = STAFF_LIST.map(s => {
      const visits = records.filter(r => r.staff === s).length;
      const proposals = records.filter(r => r.staff === s).reduce((sum, r) => sum + PRODUCTS.filter(p => r[`proposal_${p.id}`] === '○').length, 0);
      const contracts = records.filter(r => r.staff === s).reduce((sum, r) => sum + PRODUCTS.filter(p => r[`result_${p.id}`] === '契約').length, 0);
      const ids = records.filter(r => r.staff === s && r.raksul_id_status === '開設済').length;
      return { name: s, visits, proposals, contracts, ids, incentive: contracts * 10000 };
    }).filter(s => s.visits > 0);
    const officeStats = OFFICE_LIST.map(o => {
      const visits = records.filter(r => r.office === o).length;
      const contracts = records.filter(r => r.office === o).reduce((sum, r) => sum + PRODUCTS.filter(p => r[`result_${p.id}`] === '契約').length, 0);
      return { name: o, visits, contracts, rate: visits > 0 ? (contracts / visits * 100).toFixed(1) : 0 };
    }).filter(o => o.visits > 0);
    const ngStats = NG_REASONS.map(reason => ({ reason, count: records.filter(r => r.ng_reason === reason).length })).filter(n => n.count > 0).sort((a, b) => b.count - a.count);
    return { totalVisits, idOpened, productStats, staffStats, officeStats, ngStats };
  }, [records]);

  function handleSubmit() { if (!formData.staff || !formData.company || !formData.office) { alert('担当者、訪問先企業、事務所は必須です'); return; } saveRecord(formData); setFormData(getEmptyForm()); setEditingId(null); setShowForm(false); }
  function handleEdit(record) { setFormData({ ...record, visit_date: record.visit_date?.split('T')[0] || record.visit_date }); setEditingId(record.id); setShowForm(true); }

  if (!supabase) return <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}><div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}><h2 style={{ color: '#dc2626', marginBottom: '16px' }}>⚠️ 設定が必要です</h2><p style={{ color: '#64748b' }}>環境変数にSupabaseの設定を追加してください</p></div></div>;
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div><div style={{ color: '#64748b' }}>データを読み込み中...</div></div></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Noto Sans JP", sans-serif', color: '#1e293b' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div><h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>提携商材 効果測定</h1><p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>ラクスル × ROS{saveStatus && <span style={{ marginLeft: '8px', color: saveStatus.includes('完了') ? '#059669' : '#d97706' }}>{saveStatus}</span>}</p></div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[{ key: 'dashboard', label: '📊 集計' },{ key: 'records', label: '📋 記録' },{ key: 'products', label: '📦 商材' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '6px 14px', borderRadius: '6px', border: activeTab === tab.key ? 'none' : '1px solid #e2e8f0', background: activeTab === tab.key ? '#2563eb' : '#fff', color: activeTab === tab.key ? '#fff' : '#64748b', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <StatCard title="総訪問数" value={stats.totalVisits} unit="件" color="#2563eb" />
              <StatCard title="ID開設" value={stats.idOpened} unit="件" color="#059669" />
              <StatCard title="契約数" value={stats.productStats.reduce((s, p) => s + p.contracts, 0)} unit="件" color="#7c3aed" />
              <StatCard title="インセンティブ" value={(stats.productStats.reduce((s, p) => s + p.contracts, 0) * 10000).toLocaleString()} unit="円" color="#d97706" />
            </div>
            <Card title="📦 商材別"><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}><thead><tr style={{ borderBottom: '2px solid #e2e8f0' }}>{['商材', '提案', '提案率', '内諾', '契約', 'トスアップ', '成約率', 'NG'].map(h => <th key={h} style={{ padding: '8px 6px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '11px' }}>{h}</th>)}</tr></thead><tbody>{stats.productStats.map(p => <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '10px 6px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: `${p.color}15`, color: p.color, fontWeight: '600', fontSize: '12px' }}>{p.name}</span></td><td style={{ padding: '10px 6px', fontWeight: '600' }}>{p.proposed}</td><td style={{ padding: '10px 6px' }}>{p.proposalRate}%</td><td style={{ padding: '10px 6px', color: '#d97706' }}>{p.approvals}</td><td style={{ padding: '10px 6px', color: '#059669', fontWeight: '600' }}>{p.contracts}</td><td style={{ padding: '10px 6px', color: '#2563eb' }}>{p.tossups}</td><td style={{ padding: '10px 6px' }}>{p.successRate}%</td><td style={{ padding: '10px 6px', color: '#dc2626' }}>{p.ngs}</td></tr>)}</tbody></table></div></Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <Card title="👥 担当者別">{stats.staffStats.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>データなし</p> : stats.staffStats.map(s => <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}><div><div style={{ fontWeight: '600' }}>{s.name}</div><div style={{ fontSize: '11px', color: '#64748b' }}>訪問{s.visits} / 提案{s.proposals} / ID{s.ids}</div></div><div style={{ textAlign: 'right' }}><div style={{ color: '#059669', fontWeight: '600' }}>契約 {s.contracts}</div><div style={{ fontSize: '12px', color: '#7c3aed' }}>¥{s.incentive.toLocaleString()}</div></div></div>)}</Card>
              <div style={{ display: 'grid', gap: '16px' }}><Card title="🏢 事務所別">{stats.officeStats.map(o => <div key={o.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}><span style={{ fontWeight: '600' }}>{o.name}</span><span>訪問{o.visits} / 契約{o.contracts} ({o.rate}%)</span></div>)}</Card>{stats.ngStats.length > 0 && <Card title="❌ NG理由"><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{stats.ngStats.map(n => <span key={n.reason} style={{ padding: '4px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontSize: '12px' }}>{n.reason} <strong>{n.count}</strong></span>)}</div></Card>}</div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h2 style={{ fontSize: '16px', fontWeight: '600' }}>訪問記録 ({records.length}件)</h2><button onClick={() => { setFormData(getEmptyForm()); setEditingId(null); setShowForm(true); }} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>＋ 新規登録</button></div>
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>{records.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>データがありません</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px' }}><thead><tr style={{ background: '#f8fafc' }}>{['日付', '担当', '企業', '事務所', 'ID', '提案', '結果', 'NG理由', '操作'].map(h => <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>{h}</th>)}</tr></thead><tbody>{records.map(r => <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '10px 8px', color: '#64748b' }}>{r.visit_date}</td><td style={{ padding: '10px 8px', fontWeight: '500' }}>{r.staff}</td><td style={{ padding: '10px 8px' }}><div style={{ fontWeight: '500' }}>{r.company}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{r.industry}</div></td><td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 6px', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontSize: '11px' }}>{r.office}</span></td><td style={{ padding: '10px 8px' }}>{r.raksul_id_status === '開設済' && <span style={{ padding: '2px 6px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '10px' }}>開設済</span>}</td><td style={{ padding: '10px 8px' }}><div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>{PRODUCTS.filter(p => r[`proposal_${p.id}`] === '○').map(p => <span key={p.id} style={{ padding: '1px 4px', background: `${p.color}20`, color: p.color, borderRadius: '3px', fontSize: '10px' }}>{p.name}</span>)}</div></td><td style={{ padding: '10px 8px' }}><div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>{PRODUCTS.filter(p => r[`result_${p.id}`] && r[`result_${p.id}`] !== '-').map(p => { const result = r[`result_${p.id}`]; const colors = RESULT_COLORS[result] || { bg: '#f3f4f6', text: '#374151' }; return <span key={p.id} style={{ padding: '1px 4px', background: colors.bg, color: colors.text, borderRadius: '3px', fontSize: '10px' }}>{p.name}:{result}</span>; })}</div></td><td style={{ padding: '10px 8px', color: '#dc2626', fontSize: '11px' }}>{r.ng_reason || '-'}</td><td style={{ padding: '10px 8px' }}><button onClick={() => handleEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '4px' }}>✏️</button><button onClick={() => deleteRecord(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button></td></tr>)}</tbody></table></div>}</div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#64748b' }}>インセンティブ単価</div><div style={{ fontSize: '20px', fontWeight: '700', color: '#059669' }}>¥10,000<span style={{ fontSize: '11px', color: '#94a3b8' }}>/件</span></div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#64748b' }}>商材数</div><div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>5種類</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#64748b' }}>営業方法</div><div style={{ fontSize: '20px', fontWeight: '700', color: '#7c3aed' }}>訪問</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#64748b' }}>目標</div><div style={{ fontSize: '20px', fontWeight: '700', color: '#d97706' }}>利用まで</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {PRODUCT_DETAILS.map(product => (
                <div key={product.id} onClick={() => setSelectedProduct(product)} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ background: `linear-gradient(135deg, ${product.color}, ${product.color}dd)`, padding: '16px', color: '#fff' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '28px' }}>{product.icon}</span><div><div style={{ fontSize: '16px', fontWeight: '700' }}>{product.name}</div><div style={{ fontSize: '11px', opacity: 0.9 }}>{product.tagline}</div></div></div></div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>{product.features.slice(0, 4).map((f, i) => <div key={i} style={{ padding: '6px', background: f.highlight ? `${product.color}10` : '#f8fafc', borderRadius: '4px', textAlign: 'center' }}><div style={{ fontSize: '10px', color: '#64748b' }}>{f.label}</div><div style={{ fontSize: '14px', fontWeight: '700', color: f.highlight ? product.color : '#1e293b' }}>{f.value}</div></div>)}</div>
                    <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '4px', fontSize: '11px', color: '#475569' }}><strong>ターゲット:</strong> {product.target}</div>
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ padding: '3px 8px', background: `${product.color}15`, color: product.color, borderRadius: '10px', fontSize: '10px', fontWeight: '600' }}>{product.category}</span><span style={{ fontSize: '11px', color: '#3b82f6' }}>詳細を見る →</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>🔗 各サービスへのリンク</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>{PRODUCT_DETAILS.filter(p => p.url).map(p => <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', background: '#fff', border: `1px solid ${p.color}`, borderRadius: '16px', color: p.color, textDecoration: 'none', fontSize: '11px', fontWeight: '500' }}>{p.icon} {p.name}</a>)}</div>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, fontSize: '16px' }}>{editingId ? '記録を編集' : '新規訪問記録'}</h3><button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button></div>
            <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}><FormField label="訪問日" type="date" value={formData.visit_date} onChange={v => setFormData({...formData, visit_date: v})} /><FormSelect label="担当者 *" value={formData.staff} options={STAFF_LIST} onChange={v => setFormData({...formData, staff: v})} /></div>
              <FormField label="訪問先企業 *" value={formData.company} onChange={v => setFormData({...formData, company: v})} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}><FormSelect label="業種" value={formData.industry} options={INDUSTRY_LIST} onChange={v => setFormData({...formData, industry: v})} /><FormSelect label="事務所 *" value={formData.office} options={OFFICE_LIST} onChange={v => setFormData({...formData, office: v})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}><FormSelect label="ラクスルID" value={formData.raksul_id_status} options={ID_STATUS_LIST} onChange={v => setFormData({...formData, raksul_id_status: v})} /><FormField label="開設メールアドレス" type="email" value={formData.raksul_email} onChange={v => setFormData({...formData, raksul_email: v})} /></div>
              <div><label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>提案商材</label><div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>{PRODUCTS.map(p => <button key={p.id} type="button" onClick={() => setFormData({ ...formData, [`proposal_${p.id}`]: formData[`proposal_${p.id}`] === '○' ? '-' : '○' })} style={{ padding: '6px 12px', borderRadius: '6px', border: formData[`proposal_${p.id}`] === '○' ? `2px solid ${p.color}` : '2px solid #e2e8f0', background: formData[`proposal_${p.id}`] === '○' ? `${p.color}15` : '#fff', color: formData[`proposal_${p.id}`] === '○' ? p.color : '#64748b', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>{p.name}</button>)}</div></div>
              {PRODUCTS.filter(p => formData[`proposal_${p.id}`] === '○').length > 0 && <div><label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>結果</label><div style={{ marginTop: '6px', display: 'grid', gap: '8px' }}>{PRODUCTS.filter(p => formData[`proposal_${p.id}`] === '○').map(p => <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '50px', fontSize: '12px', color: p.color, fontWeight: '500' }}>{p.name}</span><div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>{RESULT_LIST.filter(r => r !== '-').map(result => <button key={result} type="button" onClick={() => setFormData({ ...formData, [`result_${p.id}`]: formData[`result_${p.id}`] === result ? '-' : result })} style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', border: formData[`result_${p.id}`] === result ? `1px solid ${RESULT_COLORS[result]?.text || '#64748b'}` : '1px solid #e2e8f0', background: formData[`result_${p.id}`] === result ? RESULT_COLORS[result]?.bg : '#fff', color: formData[`result_${p.id}`] === result ? RESULT_COLORS[result]?.text : '#64748b', cursor: 'pointer' }}>{result}</button>)}</div></div>)}</div></div>}
              <FormSelect label="NG理由" value={formData.ng_reason} options={['', ...NG_REASONS]} onChange={v => setFormData({...formData, ng_reason: v})} />
              <FormField label="備考" value={formData.note} onChange={v => setFormData({...formData, note: v})} />
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>キャンセル</button><button onClick={handleSubmit} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>{editingId ? '更新' : '登録'}</button></div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 200 }} onClick={() => setSelectedProduct(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: `linear-gradient(135deg, ${selectedProduct.color}, ${selectedProduct.color}dd)`, padding: '20px', color: '#fff' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '36px' }}>{selectedProduct.icon}</span><div><div style={{ fontSize: '20px', fontWeight: '700' }}>{selectedProduct.name}</div><div style={{ fontSize: '13px', opacity: 0.9 }}>{selectedProduct.tagline}</div></div></div><button onClick={() => setSelectedProduct(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>×</button></div></div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>{selectedProduct.features.map((f, i) => <div key={i} style={{ padding: '10px', background: f.highlight ? `${selectedProduct.color}10` : '#f8fafc', borderRadius: '6px', border: f.highlight ? `1px solid ${selectedProduct.color}30` : '1px solid #e2e8f0' }}><div style={{ fontSize: '10px', color: '#64748b' }}>{f.label}</div><div style={{ fontSize: '18px', fontWeight: '700', color: f.highlight ? selectedProduct.color : '#1e293b' }}>{f.value}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{f.note}</div></div>)}</div>
              <div style={{ display: 'grid', gap: '12px' }}><DetailBox title="🎯 ターゲット" content={selectedProduct.target} /><DetailBox title="✨ メリット" content={selectedProduct.merit} /><DetailBox title="💬 営業トーク" content={selectedProduct.salesPoint} type="highlight" /><DetailBox title="❌ よくあるNG理由" content={selectedProduct.ngReason} type="warning" />{selectedProduct.note && <DetailBox title="📝 注意事項" content={selectedProduct.note} type="note" />}</div>
              <div style={{ marginTop: '16px', padding: '14px', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: '8px', color: '#fff' }}><div style={{ fontSize: '11px', opacity: 0.9 }}>インセンティブ</div><div style={{ fontSize: '24px', fontWeight: '700' }}>¥10,000 <span style={{ fontSize: '11px', opacity: 0.9 }}>（申込¥3,000 + 利用¥7,000）</span></div></div>
              {selectedProduct.url && <a href={selectedProduct.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '12px', padding: '10px', background: selectedProduct.color, color: '#fff', textAlign: 'center', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>サービスサイトを開く →</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, unit, color }) { return <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px' }}><div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{title}</div><div style={{ fontSize: '22px', fontWeight: '700', color }}>{value}<span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '2px' }}>{unit}</span></div></div>; }
function Card({ title, children }) { return <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px' }}><h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>{title}</h3>{children}</div>; }
function FormField({ label, type = 'text', value, onChange }) { return <div><label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{label}</label><input type={type} value={value || ''} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', marginTop: '4px', boxSizing: 'border-box' }} /></div>; }
function FormSelect({ label, value, options, onChange }) { return <div><label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{label}</label><select value={value || ''} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', marginTop: '4px', background: '#fff' }}><option value="">選択</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>; }
function DetailBox({ title, content, type }) { let bg = '#f8fafc', text = '#475569'; if (type === 'highlight') { bg = '#eff6ff'; text = '#1e40af'; } else if (type === 'warning') { bg = '#fef2f2'; text = '#991b1b'; } else if (type === 'note') { bg = '#fefce8'; text = '#854d0e'; } return <div style={{ padding: '10px', background: bg, borderRadius: '6px' }}><div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '3px' }}>{title}</div><div style={{ fontSize: '13px', color: text, lineHeight: 1.5 }}>{content}</div></div>; }
