import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bxhwkuvojijmhvzwcnyx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aHdrdXZvamlqbWh2endjbnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzUzMjYsImV4cCI6MjA4NTc1MTMyNn0.Y9KmQfXaR-Ga9tC7UgezDdJpVX0E5vRpQ8ooQNk17eM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STAFF_LIST = ['知念', '山内', '奥濱', '喜如嘉', '徳田', '稲福', '石田', 'ヴィンス', '伊敷', '嘉数', '青木', '高吉', '橋本', '比嘉裕'];
const OFFICE_LIST = ['ROS', 'TOS'];
const INDUSTRY_LIST = ['製造', '建設', '卸売', '小売', '商社', '不動産', 'サービス', 'IT', '飲食', 'その他'];
const ID_STATUS_LIST = ['開設済', '未開設', '-'];
const RESULT_LIST = ['契約', '内諾', 'トスアップ', 'NG', '検討中', '-'];

const DEFAULT_NG_REASONS = {
  bank: ['複数口座不要', '既存取引優先', '管理が煩雑', '手続きが面倒', '興味なし'],
  pay: ['既存決済システムあり', '手数料が高い', '導入が面倒', '対面販売なし', '商品点数20以上', '興味なし'],
  mall: ['既存の取引先がある', 'アスクル継続', '購入頻度が低い', '価格メリット感じない', '興味なし'],
  meo: ['効果が不明', '自分で管理できる', '予算なし', '店舗がない', '興味なし'],
  video: ['自分で撮れる', '素材が不要', '予算なし', '撮影対象がない', '興味なし']
};

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

const INCENTIVES = { id_open: 3000, mall_purchase: 7000, contract: 10000 };
const REPORT_URL = 'https://share.hsforms.com/1CR3laZLdRtCuUL0eKLTmmQrqgpr';
const MEO_DOC_URL = 'https://www.canva.com/design/DAG-cwH4ZMM/pF1oqPGwuv1x7X0odm8jGw/view';
const PAY_DOC_URL = 'https://rpay.raksul.com/';

const PRODUCT_DETAILS = [
  { id: 'bank', name: 'ラクスルバンク', category: '金融', tagline: '振込手数料119円・ポイント2%還元', color: '#2563EB', icon: '🏦', url: 'https://lp-bank.raksul.com/', docUrl: null, features: [{ label: '振込手数料', value: '119円', highlight: true, note: '業界最安値水準' },{ label: 'ポイント還元', value: '2%', highlight: true, note: 'デビットカード利用時' },{ label: '口座開設', value: '最短翌日', note: 'オンライン完結' },{ label: 'キャンペーン', value: '1万円', highlight: true, note: '10万円入金で' }], target: '創業間もない企業・小規模事業者', merit: '地銀より圧倒的に安い手数料', salesPoint: '地銀の振込手数料は500円前後。年間100回振込なら約4万円の差額', note: '金融商品のため営業行為はNG', incentive: '契約: ¥10,000' },
  { id: 'pay', name: 'ラクスルPay', category: '決済', tagline: '手数料5%・スマホで簡単EC', color: '#059669', icon: '💳', url: 'https://rpay.raksul.com/', docUrl: PAY_DOC_URL, features: [{ label: '決済手数料', value: '5.0%', highlight: true, note: '業界最安値水準' },{ label: 'ページ開設', value: '最短10分', highlight: true, note: 'スマホ特化' },{ label: '初期/月額', value: '0円', highlight: true, note: '売れるまで無料' },{ label: '入金速度', value: '5営業日', note: '申請後' }], target: 'オンライン販売・訪問型サービス', merit: '売れるまで無料', salesPoint: '3つの売り方', note: '店舗レジ決済には向かない', incentive: '契約: ¥10,000', details: { fee: { decision: '3.0%', service: '2.0%', total: '5.0%' }, comparison: '他社比較で約1万円お得', useCase: ['物販', '訪問型', 'BtoB'], support: ['デザインサポート', 'フルサポート', '安心基盤'] } },
  { id: 'mall', name: 'ラクスルビジネスモール', category: '備品購入', tagline: 'オフィス用品が安く買える', color: '#D97706', icon: '🛒', url: 'https://stockroom.raksul.com/', docUrl: null, features: [{ label: 'コピー用紙', value: '業界最安級', highlight: true, note: 'アスクルより安い' },{ label: '初回割引', value: '半額', highlight: true, note: '初回購入時' },{ label: '品揃え', value: '10万点以上', note: '文具・家具・食品' },{ label: 'ポイント', value: '貯まる', note: 'ラクスルポイント' }], target: '全ての法人', merit: 'アスクルより安くなる', salesPoint: 'コピー用紙は必ず買う', note: '一番売りやすい商材', incentive: '購入: ¥7,000' },
  { id: 'meo', name: 'MEO対策', category: '集客支援', tagline: 'Googleマップ上位表示', color: '#7C3AED', icon: '📍', url: null, docUrl: MEO_DOC_URL, features: [{ label: 'セルフプラン', value: '1万円/月', note: '初期設定のみ' },{ label: 'プロプラン', value: '4万円/月', highlight: true, note: '運用代行込み' },{ label: '対策内容', value: '多数', note: '口コミ・投稿等' },{ label: '他社比較', value: '安め', highlight: true, note: '幅広くサポート' }], target: '店舗ビジネス', merit: 'Googleマップで集客強化', salesPoint: '明確なニーズあり', note: 'HPとセットで解約防止', incentive: '契約: ¥10,000' },
  { id: 'video', name: '出張動画撮影', category: 'コンテンツ', tagline: '5万円でまる投げ出張動画', color: '#DC2626', icon: '🎬', url: 'https://st.raksul.com/web-marketing/content', docUrl: null, features: [{ label: '撮影費用', value: '5万円', highlight: true, note: '全国どこでも' },{ label: '納品', value: '写真+動画', note: 'SNSにも使える' },{ label: '用途', value: '多数', note: 'HP・SNS・広告' },{ label: '月額', value: '500円〜', highlight: true, note: 'サブスク提供' }], target: '素材がない企業', merit: '訴求力UP', salesPoint: '写真ないですよね？', note: 'フックにHPを売る', incentive: '契約: ¥10,000' },
  { id: 'raksul_id', name: 'ラクスルID登録', category: '基盤', tagline: 'まず登録してもらう', color: '#6366F1', icon: '🆔', url: 'https://raksul.com/', docUrl: null, features: [{ label: '開設報酬', value: '¥3,000', highlight: true, note: 'ID開設で' },{ label: '登録', value: '無料', highlight: true, note: '即時完了' },{ label: '印刷', value: '業界最安', note: '名刺・チラシ等' },{ label: 'ポイント', value: '貯まる', note: '各サービス共通' }], target: '全ての訪問先', merit: '登録で報酬発生', salesPoint: '全サービス登録してもらう', note: 'まずID登録から', incentive: '開設: ¥3,000' }
];

export default function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [analysisView, setAnalysisView] = useState('product');
  const [customNgReasons, setCustomNgReasons] = useState({ bank: [], pay: [], mall: [], meo: [], video: [] });
  const [showNgManager, setShowNgManager] = useState(false);
  const [newNgReason, setNewNgReason] = useState({ product: 'bank', reason: '' });
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => { fetchRecords(); fetchCustomNgReasons(); }, []);

  async function fetchRecords() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('records').select('*').order('visit_date', { ascending: false });
      if (error) throw error;
      setRecords(data || []);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error:', error);
      setConnectionStatus('error');
    }
    setLoading(false);
  }

  async function fetchCustomNgReasons() {
    try {
      const { data, error } = await supabase.from('custom_ng_reasons').select('*');
      if (!error && data) {
        const grouped = { bank: [], pay: [], mall: [], meo: [], video: [] };
        data.forEach(item => { if (grouped[item.product_id]) grouped[item.product_id].push(item.reason); });
        setCustomNgReasons(grouped);
      }
    } catch (e) { console.error(e); }
  }

  async function handleSubmit() {
    if (!formData.staff || !formData.company || !formData.office) { alert('担当者、企業名、事務所は必須です'); return; }
    setSaving(true);
    const recordData = {
      visit_date: formData.visit_date, staff: formData.staff, company: formData.company,
      industry: formData.industry || null, office: formData.office,
      raksul_id_status: formData.raksul_id_status, raksul_email: formData.raksul_email || null,
      proposal_bank: formData.proposal_bank, proposal_pay: formData.proposal_pay,
      proposal_mall: formData.proposal_mall, proposal_meo: formData.proposal_meo, proposal_video: formData.proposal_video,
      result_bank: formData.result_bank, result_pay: formData.result_pay,
      result_mall: formData.result_mall, result_meo: formData.result_meo, result_video: formData.result_video,
      ng_bank: formData.ng_bank || null, ng_pay: formData.ng_pay || null,
      ng_mall: formData.ng_mall || null, ng_meo: formData.ng_meo || null, ng_video: formData.ng_video || null,
      note: formData.note || null,
    };
    try {
      if (editingId) {
        const { error } = await supabase.from('records').update(recordData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('records').insert([recordData]);
        if (error) throw error;
      }
      await fetchRecords();
      setFormData(getEmptyForm()); setEditingId(null); setShowForm(false);
    } catch (error) { console.error('Error:', error); alert('保存に失敗しました'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('この記録を削除しますか？')) return;
    try {
      const { error } = await supabase.from('records').delete().eq('id', id);
      if (error) throw error;
      await fetchRecords();
    } catch (error) { console.error('Error:', error); alert('削除に失敗しました'); }
  }

  async function addNgReason() {
    if (!newNgReason.reason.trim()) return;
    try {
      const { error } = await supabase.from('custom_ng_reasons').insert([{ product_id: newNgReason.product, reason: newNgReason.reason.trim() }]);
      if (error) throw error;
      await fetchCustomNgReasons();
      setNewNgReason({ ...newNgReason, reason: '' });
    } catch (e) { alert('追加に失敗しました'); }
  }

  async function removeNgReason(productId, reason) {
    try {
      await supabase.from('custom_ng_reasons').delete().eq('product_id', productId).eq('reason', reason);
      await fetchCustomNgReasons();
    } catch (e) { console.error(e); }
  }

  function getNgReasons(productId) { return [...(DEFAULT_NG_REASONS[productId] || []), ...(customNgReasons[productId] || []), 'その他']; }
  function getEmptyForm() { return { visit_date: new Date().toISOString().split('T')[0], staff: '', company: '', industry: '', office: '', raksul_id_status: '-', raksul_email: '', proposal_bank: '-', proposal_pay: '-', proposal_mall: '-', proposal_meo: '-', proposal_video: '-', result_bank: '-', result_pay: '-', result_mall: '-', result_meo: '-', result_video: '-', ng_bank: '', ng_pay: '', ng_mall: '', ng_meo: '', ng_video: '', note: '' }; }
  function calcIncentive(r) { let t = 0; if (r.raksul_id_status === '開設済') t += 3000; if (r.result_mall === '契約') t += 7000; ['bank','pay','meo','video'].forEach(p => { if (r[`result_${p}`] === '契約') t += 10000; }); return t; }
  function handleEdit(r) { setFormData({ ...r }); setEditingId(r.id); setShowForm(true); }
  function exportCSV() {
    const h = ['訪問日','担当者','企業名','業種','事務所','ID状態','報酬'];
    const rows = records.map(r => [r.visit_date,r.staff,r.company,r.industry,r.office,r.raksul_id_status,calcIncentive(r)]);
    const csv = '\uFEFF' + [h,...rows].map(r => r.map(c => `"${c||''}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `訪問記録_${new Date().toISOString().split('T')[0]}.csv`; link.click();
  }

  const stats = useMemo(() => {
    const totalVisits = records.length;
    const idOpened = records.filter(r => r.raksul_id_status === '開設済').length;
    const productStats = PRODUCTS.map(p => {
      const proposed = records.filter(r => r[`proposal_${p.id}`] === '○').length;
      const contracts = records.filter(r => r[`result_${p.id}`] === '契約').length;
      return { ...p, proposed, contracts, proposalRate: totalVisits > 0 ? (proposed/totalVisits*100).toFixed(1) : '0', contractRate: proposed > 0 ? (contracts/proposed*100).toFixed(1) : '0' };
    });
    const totalIncentive = records.reduce((sum, r) => sum + calcIncentive(r), 0);
    const staffStats = STAFF_LIST.map(s => {
      const sr = records.filter(r => r.staff === s); const visits = sr.length;
      const ids = sr.filter(r => r.raksul_id_status === '開設済').length;
      return { name: s, visits, ids, idRate: visits > 0 ? (ids/visits*100).toFixed(1) : '0', incentive: sr.reduce((sum,r) => sum + calcIncentive(r), 0) };
    }).filter(s => s.visits > 0);
    const officeStats = OFFICE_LIST.map(o => {
      const or = records.filter(r => r.office === o); const visits = or.length;
      const ids = or.filter(r => r.raksul_id_status === '開設済').length;
      return { name: o, visits, ids, idRate: visits > 0 ? (ids/visits*100).toFixed(1) : '0', incentive: or.reduce((sum,r) => sum + calcIncentive(r), 0) };
    }).filter(o => o.visits > 0);
    return { totalVisits, idOpened, productStats, staffStats, officeStats, totalIncentive };
  }, [records]);

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>⏳</div><div style={{color:'#64748b'}}>読み込み中...</div></div></div>;

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'system-ui,sans-serif',color:'#1e293b'}}>
      <header style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'12px 16px',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:'1400px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
          <div><h1 style={{fontSize:'18px',fontWeight:'700',margin:0}}>提携商材 効果測定</h1><p style={{fontSize:'11px',color:'#64748b',margin:0}}>ラクスル × ROS <span style={{color:connectionStatus==='connected'?'#059669':'#dc2626'}}>{connectionStatus==='connected'?'● 接続中':'● エラー'}</span></p></div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {[{key:'dashboard',label:'📊集計'},{key:'records',label:'📋記録'},{key:'products',label:'📦商材'}].map(t=><button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:'8px 14px',borderRadius:'6px',border:activeTab===t.key?'none':'1px solid #e2e8f0',background:activeTab===t.key?'#2563eb':'#fff',color:activeTab===t.key?'#fff':'#64748b',fontSize:'13px',cursor:'pointer'}}>{t.label}</button>)}
            <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#059669',color:'#fff',fontSize:'13px',textDecoration:'none'}}>📝報告</a>
          </div>
        </div>
      </header>

      <main style={{maxWidth:'1400px',margin:'0 auto',padding:'16px'}}>
        {activeTab === 'dashboard' && (
          <div style={{display:'grid',gap:'16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'10px'}}>
              {[{title:'総訪問数',value:stats.totalVisits,unit:'件',color:'#2563eb'},{title:'ID開設',value:stats.idOpened,unit:'件',color:'#6366f1'},{title:'モール契約',value:stats.productStats.find(p=>p.id==='mall')?.contracts||0,unit:'件',color:'#d97706'},{title:'総報酬',value:`¥${stats.totalIncentive.toLocaleString()}`,color:'#059669'}].map((c,i)=><div key={i} style={{background:'#fff',borderRadius:'10px',border:'1px solid #e2e8f0',padding:'14px'}}><div style={{fontSize:'11px',color:'#64748b'}}>{c.title}</div><div style={{fontSize:'22px',fontWeight:'700',color:c.color}}>{c.value}<span style={{fontSize:'12px',color:'#94a3b8'}}>{c.unit||''}</span></div></div>)}
            </div>
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
                <div style={{display:'flex',gap:'6px'}}>{[{key:'product',label:'📦商材別'},{key:'staff',label:'👥担当者別'},{key:'office',label:'🏢事務所別'}].map(v=><button key={v.key} onClick={()=>setAnalysisView(v.key)} style={{padding:'6px 12px',borderRadius:'6px',border:analysisView===v.key?'none':'1px solid #e2e8f0',background:analysisView===v.key?'#1e293b':'#fff',color:analysisView===v.key?'#fff':'#64748b',fontSize:'12px',cursor:'pointer'}}>{v.label}</button>)}</div>
                <button onClick={exportCSV} style={{padding:'6px 12px',borderRadius:'6px',border:'1px solid #059669',background:'#fff',color:'#059669',fontSize:'12px',cursor:'pointer'}}>📥CSV</button>
              </div>
              {analysisView==='product'&&<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}><thead><tr style={{borderBottom:'2px solid #e2e8f0',background:'#f8fafc'}}><th style={{padding:'12px 8px',textAlign:'left'}}>商材</th><th style={{padding:'12px 8px',textAlign:'center'}}>提案</th><th style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff'}}>提案率</th><th style={{padding:'12px 8px',textAlign:'center'}}>契約</th><th style={{padding:'12px 8px',textAlign:'center',background:'#dcfce7'}}>成約率</th></tr></thead><tbody>{stats.productStats.map(p=><tr key={p.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'12px 8px'}}><span style={{padding:'4px 10px',borderRadius:'6px',background:`${p.color}15`,color:p.color,fontWeight:'600'}}>{p.name}</span></td><td style={{padding:'12px 8px',textAlign:'center',fontWeight:'600'}}>{p.proposed}</td><td style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff',fontWeight:'700',color:'#2563eb'}}>{p.proposalRate}%</td><td style={{padding:'12px 8px',textAlign:'center',fontWeight:'600',color:'#059669'}}>{p.contracts}</td><td style={{padding:'12px 8px',textAlign:'center',background:'#dcfce7',fontWeight:'700',color:'#059669'}}>{p.contractRate}%</td></tr>)}</tbody></table></div>}
              {analysisView==='staff'&&<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}><thead><tr style={{borderBottom:'2px solid #e2e8f0',background:'#f8fafc'}}><th style={{padding:'12px 8px',textAlign:'left'}}>担当者</th><th style={{padding:'12px 8px',textAlign:'center'}}>訪問</th><th style={{padding:'12px 8px',textAlign:'center'}}>ID開設</th><th style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff'}}>ID率</th><th style={{padding:'12px 8px',textAlign:'center'}}>報酬</th></tr></thead><tbody>{stats.staffStats.map(s=><tr key={s.name} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'12px 8px',fontWeight:'600'}}>{s.name}</td><td style={{padding:'12px 8px',textAlign:'center'}}>{s.visits}</td><td style={{padding:'12px 8px',textAlign:'center'}}>{s.ids}</td><td style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff',fontWeight:'700',color:'#2563eb'}}>{s.idRate}%</td><td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700',color:'#059669'}}>¥{s.incentive.toLocaleString()}</td></tr>)}</tbody></table></div>}
              {analysisView==='office'&&<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}><thead><tr style={{borderBottom:'2px solid #e2e8f0',background:'#f8fafc'}}><th style={{padding:'12px 8px',textAlign:'left'}}>事務所</th><th style={{padding:'12px 8px',textAlign:'center'}}>訪問</th><th style={{padding:'12px 8px',textAlign:'center'}}>ID開設</th><th style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff'}}>ID率</th><th style={{padding:'12px 8px',textAlign:'center'}}>報酬</th></tr></thead><tbody>{stats.officeStats.map(o=><tr key={o.name} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'12px 8px',fontWeight:'700',fontSize:'15px'}}>{o.name}</td><td style={{padding:'12px 8px',textAlign:'center',fontSize:'15px'}}>{o.visits}</td><td style={{padding:'12px 8px',textAlign:'center'}}>{o.ids}</td><td style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff',fontWeight:'700',color:'#2563eb',fontSize:'15px'}}>{o.idRate}%</td><td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700',color:'#059669',fontSize:'15px'}}>¥{o.incentive.toLocaleString()}</td></tr>)}</tbody></table></div>}
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
              <h2 style={{fontSize:'16px',fontWeight:'600',margin:0}}>訪問記録 ({records.length}件)</h2>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={exportCSV} style={{background:'#fff',color:'#059669',border:'1px solid #059669',borderRadius:'6px',padding:'8px 14px',fontSize:'13px',cursor:'pointer'}}>📥CSV</button>
                <button onClick={()=>{setFormData(getEmptyForm());setEditingId(null);setShowForm(true);}} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:'6px',padding:'8px 14px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>＋新規</button>
              </div>
            </div>
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',overflow:'hidden'}}>
              {records.length===0?<p style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>データがありません</p>:
              <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'700px'}}><thead><tr style={{background:'#f8fafc'}}>{['日付','担当','企業名','事務所','ID','提案','報酬','操作'].map(h=><th key={h} style={{padding:'14px 10px',textAlign:'left',fontWeight:'600',color:'#64748b'}}>{h}</th>)}</tr></thead><tbody>{records.map(r=><tr key={r.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'14px 10px',color:'#64748b'}}>{r.visit_date}</td><td style={{padding:'14px 10px',fontWeight:'500'}}>{r.staff}</td><td style={{padding:'14px 10px',fontWeight:'500'}}>{r.company}</td><td style={{padding:'14px 10px'}}><span style={{padding:'4px 10px',background:'#eff6ff',color:'#2563eb',borderRadius:'6px',fontSize:'12px'}}>{r.office}</span></td><td style={{padding:'14px 10px'}}>{r.raksul_id_status==='開設済'&&<span style={{padding:'4px 8px',background:'#dcfce7',color:'#166534',borderRadius:'6px',fontSize:'11px'}}>開設済</span>}</td><td style={{padding:'14px 10px'}}><div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>{PRODUCTS.filter(p=>r[`proposal_${p.id}`]==='○').map(p=><span key={p.id} style={{padding:'3px 8px',background:`${p.color}20`,color:p.color,borderRadius:'4px',fontSize:'11px'}}>{p.name}</span>)}</div></td><td style={{padding:'14px 10px',color:'#059669',fontWeight:'700',fontSize:'15px'}}>¥{calcIncentive(r).toLocaleString()}</td><td style={{padding:'14px 10px'}}><button onClick={()=>handleEdit(r)} style={{background:'#eff6ff',border:'none',borderRadius:'6px',padding:'8px 12px',cursor:'pointer',marginRight:'6px',fontSize:'12px'}}>✏️</button><button onClick={()=>handleDelete(r.id)} style={{background:'#fef2f2',border:'none',borderRadius:'6px',padding:'8px 12px',cursor:'pointer',fontSize:'12px'}}>🗑️</button></td></tr>)}</tbody></table></div>}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={{background:'#fff',borderRadius:'12px',padding:'16px',marginBottom:'16px',border:'1px solid #e2e8f0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px',marginBottom:'14px'}}>
                <h3 style={{margin:0,fontSize:'15px',fontWeight:'600'}}>📚営業資料</h3>
                <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" style={{padding:'8px 16px',borderRadius:'6px',background:'#059669',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>📝申込報告</a>
              </div>
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'16px'}}>
                <a href={MEO_DOC_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'#7C3AED',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>📍MEO資料</a>
                <a href={PAY_DOC_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'#059669',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>💳ラクスルPay</a>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'10px'}}>
                <div style={{padding:'12px',background:'#eff6ff',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'11px',color:'#64748b'}}>ID開設</div><div style={{fontSize:'20px',fontWeight:'700',color:'#6366f1'}}>¥3,000</div></div>
                <div style={{padding:'12px',background:'#fef3c7',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'11px',color:'#64748b'}}>モール購入</div><div style={{fontSize:'20px',fontWeight:'700',color:'#d97706'}}>¥7,000</div></div>
                <div style={{padding:'12px',background:'#dcfce7',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'11px',color:'#64748b'}}>その他契約</div><div style={{fontSize:'20px',fontWeight:'700',color:'#059669'}}>¥10,000</div></div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'12px'}}>
              {PRODUCT_DETAILS.map(product=><div key={product.id} onClick={()=>setSelectedProduct(product)} style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',overflow:'hidden',cursor:'pointer'}}><div style={{background:`linear-gradient(135deg,${product.color},${product.color}dd)`,padding:'14px',color:'#fff'}}><div style={{display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'28px'}}>{product.icon}</span><div><div style={{fontSize:'16px',fontWeight:'700'}}>{product.name}</div><div style={{fontSize:'11px',opacity:0.9}}>{product.tagline}</div></div></div></div><div style={{padding:'14px'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'10px'}}>{product.features.slice(0,4).map((f,i)=><div key={i} style={{padding:'8px',background:f.highlight?`${product.color}10`:'#f8fafc',borderRadius:'6px',textAlign:'center'}}><div style={{fontSize:'10px',color:'#64748b'}}>{f.label}</div><div style={{fontSize:'14px',fontWeight:'700',color:f.highlight?product.color:'#1e293b'}}>{f.value}</div></div>)}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{padding:'4px 10px',background:'#dcfce7',color:'#059669',borderRadius:'8px',fontSize:'12px',fontWeight:'600'}}>{product.incentive}</span><span style={{fontSize:'12px',color:'#3b82f6'}}>詳細→</span></div></div></div>)}
            </div>
          </div>
        )}
      </main>

      {showForm&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',zIndex:200}}><div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'500px',maxHeight:'90vh',overflow:'auto'}}><div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3 style={{margin:0,fontSize:'16px'}}>{editingId?'📝編集':'➕新規登録'}</h3><button onClick={()=>{setShowForm(false);setEditingId(null);setFormData(getEmptyForm());}} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'#64748b'}}>×</button></div><div style={{padding:'16px 20px',display:'grid',gap:'14px'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>訪問日</label><input type="date" value={formData.visit_date} onChange={e=>setFormData({...formData,visit_date:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}/></div><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>担当者*</label><select value={formData.staff} onChange={e=>setFormData({...formData,staff:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff'}}><option value="">選択</option>{STAFF_LIST.map(s=><option key={s} value={s}>{s}</option>)}</select></div></div><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>企業名*</label><input value={formData.company} onChange={e=>setFormData({...formData,company:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>業種</label><select value={formData.industry} onChange={e=>setFormData({...formData,industry:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff'}}><option value="">選択</option>{INDUSTRY_LIST.map(i=><option key={i} value={i}>{i}</option>)}</select></div><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>事務所*</label><select value={formData.office} onChange={e=>setFormData({...formData,office:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff'}}><option value="">選択</option>{OFFICE_LIST.map(o=><option key={o} value={o}>{o}</option>)}</select></div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>ラクスルID</label><select value={formData.raksul_id_status} onChange={e=>setFormData({...formData,raksul_id_status:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff'}}>{ID_STATUS_LIST.map(s=><option key={s} value={s}>{s}</option>)}</select></div><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>メール</label><input type="email" value={formData.raksul_email} onChange={e=>setFormData({...formData,raksul_email:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}/></div></div><div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'8px'}}>提案商材</label><div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>{PRODUCTS.map(p=><button key={p.id} type="button" onClick={()=>setFormData({...formData,[`proposal_${p.id}`]:formData[`proposal_${p.id}`]==='○'?'-':'○'})} style={{padding:'10px 16px',borderRadius:'8px',border:formData[`proposal_${p.id}`]==='○'?`2px solid ${p.color}`:'1px solid #e2e8f0',background:formData[`proposal_${p.id}`]==='○'?`${p.color}15`:'#fff',color:formData[`proposal_${p.id}`]==='○'?p.color:'#64748b',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>{p.name}</button>)}</div></div>{PRODUCTS.filter(p=>formData[`proposal_${p.id}`]==='○').length>0&&<div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'8px'}}>結果</label><div style={{display:'grid',gap:'10px'}}>{PRODUCTS.filter(p=>formData[`proposal_${p.id}`]==='○').map(p=><div key={p.id} style={{padding:'12px',background:'#f8fafc',borderRadius:'10px'}}><div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}><span style={{fontSize:'13px',color:p.color,fontWeight:'600',minWidth:'60px'}}>{p.name}</span><div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>{RESULT_LIST.filter(r=>r!=='-').map(result=><button key={result} type="button" onClick={()=>setFormData({...formData,[`result_${p.id}`]:formData[`result_${p.id}`]===result?'-':result})} style={{padding:'6px 12px',borderRadius:'6px',fontSize:'12px',border:formData[`result_${p.id}`]===result?`1px solid ${RESULT_COLORS[result]?.text||'#64748b'}`:'1px solid #d1d5db',background:formData[`result_${p.id}`]===result?RESULT_COLORS[result]?.bg||'#f3f4f6':'#fff',color:formData[`result_${p.id}`]===result?RESULT_COLORS[result]?.text||'#374151':'#64748b',cursor:'pointer'}}>{result}</button>)}</div></div>{formData[`result_${p.id}`]==='NG'&&<input placeholder="NG理由" value={formData[`ng_${p.id}`]} onChange={e=>setFormData({...formData,[`ng_${p.id}`]:e.target.value})} style={{width:'100%',marginTop:'8px',padding:'10px',borderRadius:'6px',border:'1px solid #fca5a5',fontSize:'13px',boxSizing:'border-box'}}/>}</div>)}</div></div>}<div><label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>備考</label><input value={formData.note} onChange={e=>setFormData({...formData,note:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}/></div></div><div style={{padding:'16px 20px',borderTop:'1px solid #e2e8f0',display:'flex',gap:'10px',justifyContent:'flex-end'}}><button onClick={()=>{setShowForm(false);setEditingId(null);setFormData(getEmptyForm());}} style={{padding:'12px 20px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',cursor:'pointer',fontSize:'14px'}}>キャンセル</button><button onClick={handleSubmit} disabled={saving} style={{padding:'12px 24px',borderRadius:'8px',border:'none',background:saving?'#94a3b8':'#2563eb',color:'#fff',fontWeight:'600',cursor:saving?'not-allowed':'pointer',fontSize:'14px'}}>{saving?'保存中...':editingId?'更新':'登録'}</button></div></div></div>}

      {selectedProduct&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',zIndex:200}} onClick={()=>setSelectedProduct(null)}><div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'550px',maxHeight:'90vh',overflow:'auto'}} onClick={e=>e.stopPropagation()}><div style={{background:`linear-gradient(135deg,${selectedProduct.color},${selectedProduct.color}dd)`,padding:'20px',color:'#fff'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><span style={{fontSize:'36px'}}>{selectedProduct.icon}</span><div><div style={{fontSize:'20px',fontWeight:'700'}}>{selectedProduct.name}</div><div style={{fontSize:'13px',opacity:0.9}}>{selectedProduct.tagline}</div></div></div><button onClick={()=>setSelectedProduct(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'16px'}}>×</button></div></div><div style={{padding:'20px'}}><div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px',marginBottom:'16px'}}>{selectedProduct.features.map((f,i)=><div key={i} style={{padding:'12px',background:f.highlight?`${selectedProduct.color}10`:'#f8fafc',borderRadius:'8px'}}><div style={{fontSize:'11px',color:'#64748b'}}>{f.label}</div><div style={{fontSize:'18px',fontWeight:'700',color:f.highlight?selectedProduct.color:'#1e293b'}}>{f.value}</div><div style={{fontSize:'11px',color:'#94a3b8'}}>{f.note}</div></div>)}</div><div style={{display:'grid',gap:'10px'}}><div style={{padding:'12px',background:'#f8fafc',borderRadius:'8px'}}><div style={{fontSize:'11px',fontWeight:'600',color:'#64748b',marginBottom:'4px'}}>🎯ターゲット</div><div style={{fontSize:'13px',lineHeight:1.5}}>{selectedProduct.target}</div></div><div style={{padding:'12px',background:'#eff6ff',borderRadius:'8px'}}><div style={{fontSize:'11px',fontWeight:'600',color:'#64748b',marginBottom:'4px'}}>💬営業トーク</div><div style={{fontSize:'13px',color:'#1e40af',lineHeight:1.5}}>{selectedProduct.salesPoint}</div></div></div><div style={{marginTop:'16px',padding:'14px',background:'linear-gradient(135deg,#059669,#047857)',borderRadius:'10px',color:'#fff'}}><div style={{fontSize:'11px',opacity:0.9}}>インセンティブ</div><div style={{fontSize:'22px',fontWeight:'700'}}>{selectedProduct.incentive}</div></div><div style={{marginTop:'12px',display:'grid',gap:'8px'}}>{selectedProduct.url&&<a href={selectedProduct.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px',background:selectedProduct.color,color:'#fff',textAlign:'center',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>🌐サービスサイト</a>}{selectedProduct.docUrl&&<a href={selectedProduct.docUrl} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px',background:'#1e293b',color:'#fff',textAlign:'center',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>📄営業資料</a>}<a href={REPORT_URL} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px',background:'#059669',color:'#fff',textAlign:'center',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>📝申込報告</a></div></div></div></div>}

      <style>{`@media(max-width:768px){.desktop-table{display:none!important}}`}</style>
    </div>
  );
}
