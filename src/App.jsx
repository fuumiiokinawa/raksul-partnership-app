import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const APP_VERSION = '1.4.0';
const LAST_UPDATED = '2026-07-29';

// CSSアニメーション用のスタイルを追加
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('pulse-animation')) {
  pulseStyle.id = 'pulse-animation';
  document.head.appendChild(pulseStyle);
}

const SUPABASE_URL = 'https://bxhwkuvojijmhvzwcnyx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aHdrdXZvamlqbWh2endjbnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzUzMjYsImV4cCI6MjA4NTc1MTMyNn0.Y9KmQfXaR-Ga9tC7UgezDdJpVX0E5vRpQ8ooQNk17eM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 現在在籍している担当者（入力フォーム用）
// ※抜けた担当者はここから外す。過去データは下のALL_STAFFで集計され続けます
const STAFF_LIST = ['知念', '山内', '奥濱', '喜如嘉', '徳田', '稲福', '石田', 'ヴィンス', '伊敷', '嘉数', '青木', '高吉', '鎌倉', '上原', '前原', '大城', '栽', '照屋', '我如古', '當眞', '知念晃矢', '仲尾', '寺内', '宮平'];

// 過去に在籍した担当者を含む全員（集計・絞り込み用）
const RETIRED_STAFF = ['橋本', '比嘉裕', '石嶺', '真栄城', '下地', '城間'];
const ALL_STAFF = [...STAFF_LIST, ...RETIRED_STAFF];
const OFFICE_LIST = ['ROS', 'TOS', 'PCチーム', '大阪オフィス'];
const INDUSTRY_LIST = ['製造', '建設', '卸売', '小売', '商社', '不動産', 'サービス', 'IT', '飲食', 'その他'];
const ID_STATUS_LIST = ['提案⇒開設', '未開設', '開設済みだった', '-'];
const RESULT_LIST = ['契約', '内諾', 'トスアップ', 'NG', '検討中', '未提案', '-'];
const TIMING_LIST = ['営業', '取材', 'PC設置・回収時', 'その他'];

// PC提案の結果まわり
const PC_DEVICE_LIST = ['A4', 'モバイル', 'DT'];
const PC_UNIT_RANGES = ['1〜10台', '10台〜'];
const PC_NG_REASONS = ['既存リースが残っている', '価格が合わない', '社内決裁が下りない', '既存ベンダーを継続', '台数が少なく不要', '検討中で保留', 'その他'];

// ラクスルIDを入力できなかった理由（定型）
const ID_MISSING_REASONS = ['担当者が不在で確認できず', '顧客がID開示を拒否', '後日あらためて登録予定', 'メールアドレスが不明', 'ID登録自体を断られた', 'その他'];

const NG_REASONS = {
  bank: ['複数口座不要', '既存取引優先', '管理が煩雑', '手続きが面倒', '興味なし', 'その他'],
  pay: ['既存決済システムあり', '手数料が高い', '導入が面倒', '対面販売なし', '商品点数20以上', '興味なし', 'その他'],
  mall: ['既存の取引先がある', 'アスクル継続', '購入頻度が低い', '価格メリット感じない', '興味なし', 'その他'],
  meo: ['効果が不明', '自分で管理できる', '予算なし', '店舗がない', '興味なし', 'その他'],
  video: ['自分で撮れる', '素材が不要', '予算なし', '撮影対象がない', '興味なし', 'その他']
};

// 現在提案中の商材（入力フォーム用）
// ※提案停止した商材はここから外す。過去データは下のALL_PRODUCTSで集計され続けます
const PRODUCTS = [
  { id: 'mall', name: 'モール', color: '#D97706' },
  { id: 'meo', name: 'MEO', color: '#7C3AED' },
  { id: 'video', name: '動画', color: '#DC2626' }
];

// 全商材（集計用・過去データ対応）
const ALL_PRODUCTS = [
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
  '検討中': { bg: '#f3f4f6', text: '#374151' },
  '未提案': { bg: '#f1f5f9', text: '#94a3b8' }
};

const REPORT_URL = 'https://share.hsforms.com/1CR3laZLdRtCuUL0eKLTmmQrqgpr';
const VOICE_UPLOAD_URL = 'https://docs.google.com/forms/d/1s9A-FoB5hHKbjL5k6eYpsUkKQOfsnlPLlPBNVpkSOfA/edit';
const MEO_TOSSUP_URL = 'https://share.hsforms.com/1p6DfrcdGSI2g-nClt0KI_Arqgpr?c_code=ros';
const MEO_SCHEDULE_URL = 'https://meetings.hubspot.com/kakitani/hp?uuid=3d87ffc3-5d0b-4f20-9808-ac22a18cc89b';
const MEO_DOC_URL = 'https://www.canva.com/design/DAHB1j6CLwU/kj3m5l9f34jzI0jlF5nkoQ/view?utm_content=DAHB1j6CLwU&utm_campaign=designshare&utm_medium=link&utm_source=viewer';
const PAY_DOC_URL = 'https://drive.google.com/file/d/1YY4OMU3sKSp-pI5oDQWP66dUTFqqE26-/preview';
const POSTING_DOC_URL = 'https://raksul.my.salesforce.com/sfc/p/#5h000000KN3Q/a/TL000009i03x/OtAhNjNEyrrAjMWqjy18Mv6jD3ZVjibX1hHUv_MIQB8';
const ORIKOM_DOC_URL = 'https://raksul.my.salesforce.com/sfc/p/#5h000000KN3Q/a/TL000009i00j/cSYfNLeTjLNVC31uiahe1XSUDGtUlUgTxpblSU6qE1A';
const VIDEO_ORDER_URL = 'https://docs.google.com/spreadsheets/d/12t_wiganb3k3NLK5DFjEYgFeXXHvOpRQHVa2ELuEJvY/edit?gid=272384739#gid=272384739';
const VIDEO_CUSTOMER_URL = 'https://web-marketing.raksul.com/content/orders/new?coupon_code=JQW6R7WX';
const VIDEO_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1BdGmXvHDllF1vmA7njwsU7Vbxd6gqI30Vc6ZcbR_5os/edit?gid=1729332928#gid=1729332928';

const PRODUCT_DETAILS = [
  { id: 'bank', name: 'ラクスルバンク', tagline: '振込手数料119円', color: '#2563EB', icon: '🏦', url: 'https://lp-bank.raksul.com/', active: true, restricted: true, restrictedNote: '⚠️ 金融商品のため営業案内不可（紹介のみ）', features: [{ label: '振込手数料', value: '119円', highlight: true },{ label: 'ポイント還元', value: '2%', highlight: true },{ label: '口座開設', value: '最短翌日' },{ label: 'キャンペーン', value: '1万円', highlight: true }], target: '創業間もない企業', salesPoint: '地銀の振込手数料は500円前後。年間100回振込なら約4万円の差額', incentive: '契約: ¥10,000' },
  { id: 'pay', name: 'ラクスルPay', tagline: '手数料5%', color: '#059669', icon: '💳', url: 'https://rpay.raksul.com/', active: true, docUrl: PAY_DOC_URL, features: [{ label: '決済手数料', value: '5.0%', highlight: true },{ label: 'ページ開設', value: '最短10分', highlight: true },{ label: '初期/月額', value: '0円', highlight: true },{ label: '入金速度', value: '5営業日' }], target: 'オンライン販売', salesPoint: '3つの売り方', incentive: '契約: ¥10,000' },
  { id: 'mall', name: 'ビジネスモール', tagline: 'オフィス用品が安い', color: '#D97706', icon: '🛒', url: 'https://stockroom.raksul.com/', active: true, features: [{ label: 'コピー用紙', value: '業界最安級', highlight: true },{ label: '初回割引', value: '半額', highlight: true },{ label: '品揃え', value: '10万点以上' },{ label: 'ポイント', value: '貯まる' }], target: '全ての法人', salesPoint: 'コピー用紙は必ず買う', incentive: '購入: ¥7,000' },
  { id: 'meo', name: 'MEO対策', tagline: 'Googleマップ上位表示', color: '#7C3AED', icon: '📍', active: true, docUrl: MEO_DOC_URL, tossupUrl: MEO_TOSSUP_URL, videos: [{name:'🎯 トスアップ商談',url:'https://drive.google.com/file/d/1R3P3DpAELwqnZH4oi3i77CrLPM7_RkXk/preview',highlight:true},{name:'HPセット販売',url:'https://drive.google.com/file/d/1KhMfd8E-8Jab1MeogEIR6SF30Od5fNsh/preview'},{name:'不動産事例',url:'https://drive.google.com/file/d/18YqR-2-6x4eSFmG7mat_uvQTWOhw_Ivw/preview'},{name:'塾事例',url:'https://drive.google.com/file/d/1wR77lpmFr2apHUnVFRuLnNuVE--8fdsH/preview'}], features: [{ label: 'セルフプラン', value: '1万円/月' },{ label: 'プロプラン', value: '4万円/月', highlight: true },{ label: '対策内容', value: '多数' },{ label: '他社比較', value: '安め', highlight: true }], target: '店舗ビジネス', salesPoint: '明確なニーズあり', incentive: '契約: ¥10,000' },
  { id: 'video', name: '出張動画撮影', tagline: '5万円で撮影', color: '#DC2626', icon: '🎬', url: 'https://st.raksul.com/web-marketing/content', active: true, orderUrl: VIDEO_ORDER_URL, sheetUrl: VIDEO_SHEET_URL, features: [{ label: '撮影費用', value: '5万円', highlight: true },{ label: '納品', value: '写真+動画' },{ label: '用途', value: '多数' },{ label: '月額', value: '500円〜', highlight: true }], target: '素材がない企業', salesPoint: '写真ないですよね？', incentive: '契約: ¥10,000' },
  { id: 'raksul_id', name: 'ラクスルID', tagline: 'まず登録', color: '#6366F1', icon: '🆔', url: 'https://raksul.com/', active: true, features: [{ label: '開設報酬', value: '¥3,000', highlight: true },{ label: '登録', value: '無料', highlight: true },{ label: '印刷', value: '業界最安' },{ label: 'ポイント', value: '貯まる' }], target: '全ての訪問先', salesPoint: '全サービス登録してもらう', incentive: '開設: ¥3,000' }
];

const MANUAL_SECTIONS = [
  { 
    id: 'overview', 
    title: '📱 アプリ概要',
    sections: [
      {
        subtitle: 'このアプリでできること',
        items: [
          '訪問記録の登録・編集・削除',
          '提案タイミング（営業/取材/その他）の記録',
          '商材別・担当者別・事務所別の成果分析',
          'インセンティブ（報酬）の自動計算',
          'NG理由の集計・分析',
          'CSVファイルへの出力（Excel対応・メールアドレス含む）',
          '商材情報・営業トーク・動画資料の確認',
          'MEOトスアップ報告フォームへのアクセス'
        ]
      },
      {
        subtitle: 'アプリの構成',
        items: [
          '📊 集計タブ：成果の数値を確認',
          '📋 記録タブ：訪問記録を入力・管理',
          '📦 商材タブ：商材情報・営業資料・動画資料を確認',
          '📖 使い方タブ：使い方を確認（このページ）',
          '📝 報告ボタン：契約報告フォームへ移動'
        ]
      },
      {
        subtitle: 'データについて',
        items: [
          'データはクラウド（Supabase）に保存されます',
          'チーム全員で同じデータを共有できます',
          'スマホ・タブレット・PCどれでも利用可能',
          'インターネット接続が必要です'
        ]
      }
    ]
  },
  { 
    id: 'records', 
    title: '📋 記録の入力方法',
    sections: [
      {
        subtitle: '新規登録の手順',
        items: [
          '①「＋新規」ボタンをタップ',
          '② 訪問日を選択（初期値は今日）',
          '③ 担当者を選択（必須）',
          '④ 企業名を入力（必須）',
          '⑤ 業種を選択（任意）',
          '⑥ 事務所を選択：ROS or TOS（必須）',
          '⑦ ラクスルIDの状態を選択（提案⇒開設 / 未開設 / 開設済みだった）',
          '⑧ メールアドレスを入力（※ID開設時は必須）',
          '⑨ 提案タイミングを選択：営業 / 取材 / その他',
          '⑩ 全商材の結果をそれぞれ選択（必須・未選択は赤枠で表示）',
          '⑪ NGの場合はプルダウンから理由を選択',
          '⑫「登録」ボタンで保存完了'
        ]
      },
      {
        subtitle: '結果の選択肢',
        items: [
          '契約：成約した場合',
          '内諾：口頭OKをもらった場合',
          'トスアップ：上司や別担当に引き継ぐ場合（MEOはトスアップ報告フォームあり）',
          'NG：断られた場合（プルダウンから理由を選択、その他は自由入力）',
          '検討中：保留・後日連絡の場合',
          '未提案：今回提案しなかった場合'
        ]
      },
      {
        subtitle: '編集・削除',
        items: [
          '✏️ ボタン：記録を編集できます',
          '🗑️ ボタン：記録を削除できます（確認あり）'
        ]
      }
    ]
  },
  { 
    id: 'dashboard', 
    title: '📊 集計画面の見方',
    sections: [
      {
        subtitle: 'サマリーカード（上部）',
        items: [
          '総訪問数：登録された訪問記録の合計',
          'ID開設：提案して新規開設した件数（インセンティブ対象）',
          'トスアップ：全商材のトスアップ合計件数',
          '動画申込：出張動画撮影の申込済み件数',
          '総報酬：チーム全体の報酬合計額'
        ]
      },
      {
        subtitle: '🏆 個人ランキング',
        items: [
          'サマリーカードの下に表示',
          '総報酬額の高い順にランキング表示',
          '🥇1位：ゴールド、🥈2位：シルバー、🥉3位：ブロンズ',
          '4位以下は「▼ 4位以下を表示」ボタンで展開'
        ]
      },
      {
        subtitle: '分析ビュー（3種類）',
        items: [
          '📦 商材別：各商材の提案数・契約数・成約率・トスアップ数・NG数',
          '👥 担当者別：担当者ごとの訪問数・ID開設数・報酬',
          '🏢 事務所別：ROS/TOSごとの成績比較'
        ]
      },
      {
        subtitle: 'NG理由の集計',
        items: [
          '商材ごとにNG理由と件数を表示',
          'どの理由が多いか一目でわかる',
          '営業トーク改善のヒントになります'
        ]
      },
      {
        subtitle: '記録一覧の表示項目',
        items: [
          '日付・担当・企業名・事務所・タイミング',
          'ID状態・メールアドレス（ID/メール列にまとめて表示）',
          '提案商材・結果・報酬・操作ボタン'
        ]
      },
      {
        subtitle: 'CSV出力',
        items: [
          '「📥CSV」ボタンで訪問記録をダウンロード',
          'メールアドレス・提案タイミングも出力されます',
          'Excelで開ける形式（UTF-8 BOM付き）'
        ]
      }
    ]
  },
  { 
    id: 'products', 
    title: '📦 商材情報',
    sections: [
      {
        subtitle: '取扱商材一覧',
        items: [
          '🏦 ラクスルバンク：振込手数料119円の法人口座',
          '💳 ラクスルPay：手数料5%のオンライン決済',
          '🛒 ビジネスモール：オフィス用品の通販',
          '📍 MEO対策：Googleマップの上位表示対策',
          '🎬 出張動画撮影：5万円で動画・写真撮影',
          '🆔 ラクスルID：全サービス共通のアカウント'
        ]
      },
      {
        subtitle: '商材カードの見方',
        items: [
          'カードをタップすると詳細情報を表示',
          'ターゲット顧客・営業トーク例が確認できます',
          'サービスサイト・営業資料へのリンクあり'
        ]
      },
      {
        subtitle: '営業資料リンク',
        items: [
          '📍 MEO資料：Canvaで作成した提案資料',
          '💳 ラクスルPay：サービス概要PDF',
          '🔄 MEOトスアップ：トスアップ時のラクスル共有フォーム',
          '📝 申込報告：契約時の報告フォーム'
        ]
      },
      {
        subtitle: 'MEO参考事例',
        items: [
          '事例①ゴルフ場（Gamma）',
          '事例②（Gamma）'
        ]
      },
      {
        subtitle: 'MEO動画資料',
        items: [
          '🎬 HPセット販売：HPとMEOのセット提案動画',
          '🎬 不動産事例：不動産業界向けMEO事例動画',
          '🎬 塾事例：学習塾向けMEO事例動画'
        ]
      },
      {
        subtitle: '出張動画撮影',
        items: [
          '📝 動画撮影 入力シート：撮影依頼の入力用スプレッドシート',
          '📊 案件進捗シート：ラクスル側の管理スプレッドシート'
        ]
      }
    ]
  },
  { 
    id: 'incentive', 
    title: '💰 インセンティブ',
    sections: [
      {
        subtitle: '報酬単価',
        items: [
          'ラクスルID開設（提案⇒開設）：¥3,000',
          'モール購入（契約）：¥7,000',
          'バンク契約：¥10,000',
          'Pay契約：¥10,000',
          'MEO契約：¥10,000',
          '動画契約：¥10,000',
          '※インセンティブは仮の為、変更される場合があります'
        ]
      },
      {
        subtitle: '計算例',
        items: [
          '例1）ID開設のみ → ¥3,000',
          '例2）ID開設 + モール購入 → ¥10,000',
          '例3）ID開設 + Pay契約 → ¥13,000',
          '例4）ID開設 + モール + MEO → ¥20,000'
        ]
      },
      {
        subtitle: '注意事項',
        items: [
          '報酬は「結果」の入力内容で自動計算されます',
          '「契約」を選択した商材のみカウントされます',
          '実際の支払いは別途確認が必要です'
        ]
      }
    ]
  },
  { 
    id: 'tips', 
    title: '💡 営業のコツ',
    sections: [
      {
        subtitle: '売りやすさランキング',
        items: [
          '1位 🛒 モール：「今どこで買ってますか？」が起点',
          '2位 🆔 ID登録：受注時に全サービス登録してもらう',
          '3位 💳 Pay：オンライン販売ニーズがあれば',
          '4位 📍 MEO：店舗ビジネスに有効',
          '5位 🎬 動画：HP制作のフックとして',
          '6位 🏦 バンク：紹介ベースで（⚠️営業案内不可）'
        ]
      },
      {
        subtitle: '効果的なアプローチ',
        items: [
          'まずラクスルID登録から始める',
          'モールは全訪問先に必ず提案する',
          'HPとMEOはセットで提案すると効果的（動画資料あり）',
          '動画はHP素材として提案する',
          'バンクは金融商品なので「ご紹介」として案内のみ',
          'MEOのトスアップ時は専用フォームで報告'
        ]
      },
      {
        subtitle: 'NG対策のヒント',
        items: [
          'NG理由の集計を見て多い理由を把握する',
          '「興味なし」が多い → 商材メリットの伝え方を改善',
          '「既存取引先がある」が多い → 切替メリットを強調',
          '「手数料が高い」が多い → 他社比較を用意する'
        ]
      }
    ]
  },
  { 
    id: 'faq', 
    title: '❓ よくある質問',
    sections: [
      {
        subtitle: 'データについて',
        items: [
          'Q: データは消えませんか？',
          'A: クラウドに保存されるので消えません',
          '',
          'Q: 他の人が入力したデータも見えますか？',
          'A: はい、チーム全員で共有されます',
          '',
          'Q: オフラインで使えますか？',
          'A: インターネット接続が必要です'
        ]
      },
      {
        subtitle: '操作について',
        items: [
          'Q: 間違えて登録した場合は？',
          'A: ✏️ボタンで編集、🗑️ボタンで削除できます',
          '',
          'Q: 過去の日付で登録できますか？',
          'A: はい、訪問日は自由に変更できます',
          '',
          'Q: 全商材に回答が必要ですか？',
          'A: 全商材の結果ボタンが表示されます。提案しなかった商材は「未提案」を選択してください',
          '',
          'Q: 提案タイミングとは？',
          'A: 営業・取材・その他から選択。どの場面で提案したか記録します'
        ]
      },
      {
        subtitle: '報告について',
        items: [
          'Q: 契約報告はどこから？',
          'A: ヘッダーの「📝報告」ボタンから',
          '',
          'Q: MEOのトスアップ報告は？',
          'A: 商材タブの「🔄MEOトスアップ」ボタン、またはMEO詳細モーダルから',
          '',
          'Q: CSVはExcelで開けますか？',
          'A: はい、文字化けしないよう対応済みです。メールアドレス・提案タイミングも出力されます'
        ]
      }
    ]
  }
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
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [manualSection, setManualSection] = useState('overview');
  const [showOtherInput, setShowOtherInput] = useState({});
  const [showAllRanking, setShowAllRanking] = useState(false);
  const [showVideoOrderModal, setShowVideoOrderModal] = useState(false);
  
  // フィルター用state
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterOffice, setFilterOffice] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  
  // 詳細データ表示用state
  const [detailModal, setDetailModal] = useState(null); // { title, records }
  
  // NG理由折りたたみ用state
  const [showAllNgReasons, setShowAllNgReasons] = useState(false);

  // PC NG理由「その他」入力用state
  const [showPcNgOther, setShowPcNgOther] = useState(false);

  // ラクスルID未入力（理由記載）モード用state
  const [idBlocked, setIdBlocked] = useState(false);
  const [showIdReasonOther, setShowIdReasonOther] = useState(false);

  // PC提案セクション折りたたみ用state
  const [showPcReasons, setShowPcReasons] = useState(false);
  const [showPcByStaff, setShowPcByStaff] = useState(false);

  useEffect(() => { fetchRecords(); }, []);

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

  async function handleSubmit() {
    if (!formData.staff || !formData.company || !formData.office) { alert('担当者、企業名、事務所は必須です'); return; }
    
    // 提案タイミング必須チェック
    if (!formData.timing) {
      alert('提案タイミングを選択してください');
      return;
    }
    
    // 営業を選択した場合は「受注」か「受注以外」の選択が必須
    if (formData.timing === '営業') {
      alert('営業を選択した場合は「受注」か「受注以外」を選択してください');
      return;
    }
    
    // ラクスルリスト選択時はエリア必須
    if (formData.sales_source === 'ラクスルリスト' && !formData.sales_area) {
      alert('ラクスルリストを選択した場合はエリアを選択してください');
      return;
    }
    
    // 顧客種別必須チェック
    if (!formData.customer_type) {
      alert('顧客種別（新規/既存）を選択してください');
      return;
    }
    
    // ラクスルID：入力できない場合は理由の記載が必須
    if (idBlocked) {
      if (!(formData.raksul_id_missing_reason || '').trim()) {
        alert('ラクスルIDを入力できない場合は、その理由を必ず記載してください');
        return;
      }
    } else {
      // 新規：ID登録＋メールアドレス必須
      if (formData.customer_type === '新規') {
        if (formData.raksul_id_status !== '提案⇒開設') {
          alert('新規ユーザーはラクスルID登録が必須です\n\n登録できなかった場合は「⚠️ IDを入力できない場合はこちら」から理由を記載してください');
          return;
        }
        if (!(formData.raksul_email || '').trim()) {
          alert('登録したラクスルID（メールアドレス）を入力してください');
          return;
        }
      }
      // 既存：ID記録必須
      if (formData.customer_type === '既存' && !(formData.existing_raksul_id || '').trim()) {
        alert('既存ユーザーはラクスルIDの確認・記録が必須です\n\n確認できなかった場合は「⚠️ IDを入力できない場合はこちら」から理由を記載してください');
        return;
      }
    }
    
    // 訪問時はPC提案の選択必須
    if (formData.sales_method === '訪問' && !formData.pc_proposal) {
      alert('訪問時はPC提案の有無を選択してください');
      return;
    }
    
    // PC提案しなかった場合は理由必須
    // PC提案した場合は結果の入力が必須
    if (formData.pc_proposal === '提案した') {
      if (!formData.pc_result) {
        alert('PCを提案した場合は「受注」か「NG」を選択してください');
        return;
      }
      if (formData.pc_result === '受注') {
        if (!formData.pc_devices) {
          alert('受注した機種（A4／モバイル／DT）を選択してください');
          return;
        }
        if (!formData.pc_units) {
          alert('受注台数を選択してください');
          return;
        }
      }
      if (formData.pc_result === 'NG' && !(formData.pc_ng_reason || '').trim()) {
        alert('PCがNGだった理由を選択してください');
        return;
      }
    }

    if (formData.pc_proposal === '提案しなかった' && !formData.pc_not_proposed_reason) {
      alert('PC提案しなかった理由を入力してください');
      return;
    }
    
    // 全商材の結果が選択されているかチェック
    const unselectedProducts = PRODUCTS.filter(p => !formData[`result_${p.id}`] || formData[`result_${p.id}`] === '-');
    if (unselectedProducts.length > 0) {
      alert(`以下の商材の結果を選択してください：\n${unselectedProducts.map(p => p.name).join('、')}`);
      return;
    }
    
    // 提案⇒開設の場合はメールアドレス必須
    if ((formData.raksul_id_status === '提案⇒開設' || formData.raksul_id_status === '開設済') && !formData.raksul_email) {
      alert('ID開設時はメールアドレスの入力が必須です');
      return;
    }
    
    // モール：ID開設かつ購入以外の場合は理由必須
    if (formData.raksul_id_status === '提案⇒開設' && formData.result_mall && formData.result_mall !== '-' && formData.result_mall !== '契約' && !formData.mall_not_purchased_reason) {
      alert('ID開設時にモールで購入以外を選択した場合は「購入に至らなかった理由」の入力が必須です');
      return;
    }
    
    // モール：ID未開設かつNGの場合は理由必須
    if (formData.raksul_id_status === '未開設' && formData.result_mall === 'NG' && !formData.id_not_opened_reason) {
      alert('ID未開設でモールNGの場合は「ID開設できなかった理由」の入力が必須です');
      return;
    }
    
    setSaving(true);
    const recordData = {
      visit_date: formData.visit_date, staff: formData.staff, company: formData.company,
      industry: formData.industry || null, office: formData.office,
      sales_source: formData.sales_source || null,
      sales_area: formData.sales_area || null,
      sales_method: formData.sales_method || null,
      customer_type: formData.customer_type || null,
      timing: formData.timing || null,
      raksul_id_status: formData.raksul_id_status, raksul_email: formData.raksul_email || null,
      existing_raksul_id: formData.existing_raksul_id || null,
      raksul_id_missing_reason: formData.raksul_id_missing_reason || null,
      pc_proposal: formData.pc_proposal || null,
      pc_not_proposed_reason: formData.pc_not_proposed_reason || null,
      pc_result: formData.pc_result || null,
      pc_devices: formData.pc_devices || null,
      pc_units: formData.pc_units || null,
      pc_ng_reason: formData.pc_ng_reason || null,
      proposal_bank: formData.proposal_bank, proposal_pay: formData.proposal_pay,
      proposal_mall: formData.proposal_mall, proposal_meo: formData.proposal_meo, proposal_video: formData.proposal_video,
      result_bank: formData.result_bank, result_pay: formData.result_pay,
      result_mall: formData.result_mall, result_meo: formData.result_meo, result_video: formData.result_video,
      ng_bank: formData.ng_bank || null, ng_pay: formData.ng_pay || null,
      ng_mall: formData.ng_mall || null, ng_meo: formData.ng_meo || null, ng_video: formData.ng_video || null,
      video_ordered: formData.video_ordered || null,
      mall_not_purchased_reason: formData.mall_not_purchased_reason || null,
      id_not_opened_reason: formData.id_not_opened_reason || null,
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
      setFormData(getEmptyForm()); setEditingId(null); setShowForm(false); setShowOtherInput({});
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

  function getEmptyForm() { 
    return { 
      visit_date: new Date().toISOString().split('T')[0], 
      staff: '', company: '', industry: '', office: '', 
      sales_source: '',
      sales_area: '',
      sales_method: '',
      customer_type: '', // 新規/既存
      raksul_id_status: '-', raksul_email: '', 
      existing_raksul_id: '', // 既存ユーザーのID記録用
      raksul_id_missing_reason: '', // IDを入力できなかった理由
      pc_proposal: '', // 提案した/提案しなかった
      pc_not_proposed_reason: '', // 提案しなかった理由
      pc_result: '', // 受注/NG
      pc_devices: '', // A4/モバイル/DT（カンマ区切り）
      pc_units: '', // 台数レンジ
      pc_ng_reason: '', // PC NG理由
      timing: '',
      proposal_bank: '-', proposal_pay: '-', proposal_mall: '-', proposal_meo: '-', proposal_video: '-', 
      result_bank: '-', result_pay: '-', result_mall: '-', result_meo: '-', result_video: '-', 
      ng_bank: '', ng_pay: '', ng_mall: '', ng_meo: '', ng_video: '', 
      video_ordered: '-',
      mall_not_purchased_reason: '',
      id_not_opened_reason: '',
      note: '' 
    }; 
  }

  function calcIncentive(r) { 
    let t = 0; 
    if (r.raksul_id_status === '提案⇒開設' || r.raksul_id_status === '開設済') t += 3000; 
    if (r.result_mall === '契約') t += 7000; 
    ['bank','pay','meo','video'].forEach(p => { if (r[`result_${p}`] === '契約') t += 10000; }); 
    return t; 
  }

  function handleEdit(r) { 
    setFormData({ ...r }); 
    setEditingId(r.id); 
    setShowForm(true);
    // ID未入力（理由記載）モードの復元
    const missing = r.raksul_id_missing_reason || '';
    setIdBlocked(!!missing);
    setShowPcNgOther(!!r.pc_ng_reason && !PC_NG_REASONS.includes(r.pc_ng_reason));
    setShowIdReasonOther(!!missing && !ID_MISSING_REASONS.includes(missing));
    // 既存のNG理由が定型外なら「その他」入力を表示
    const otherInputs = {};
    ALL_PRODUCTS.forEach(p => {
      if (r[`ng_${p.id}`] && !NG_REASONS[p.id].includes(r[`ng_${p.id}`])) {
        otherInputs[p.id] = true;
      }
    });
    setShowOtherInput(otherInputs);
  }

  function handleNgReasonChange(productId, value) {
    if (value === 'その他') {
      setShowOtherInput({ ...showOtherInput, [productId]: true });
      setFormData({ ...formData, [`ng_${productId}`]: '' });
    } else {
      setShowOtherInput({ ...showOtherInput, [productId]: false });
      setFormData({ ...formData, [`ng_${productId}`]: value });
    }
  }

  // フィルタリング済みレコード（商材フィルターなし）- 訪問数計算用
  const baseFilteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterDateFrom && r.visit_date < filterDateFrom) return false;
      if (filterDateTo && r.visit_date > filterDateTo) return false;
      if (filterStaff && r.staff !== filterStaff) return false;
      if (filterOffice && r.office !== filterOffice) return false;
      return true;
    });
  }, [records, filterDateFrom, filterDateTo, filterStaff, filterOffice]);

  // フィルタリング済みレコード（商材フィルターあり）
  const filteredRecords = useMemo(() => {
    return baseFilteredRecords.filter(r => {
      if (filterProduct && r[`proposal_${filterProduct}`] !== '○') return false;
      return true;
    });
  }, [baseFilteredRecords, filterProduct]);

  const stats = useMemo(() => {
    // 訪問数は商材フィルターに関係なくbaseFilteredRecordsから算出
    const totalVisits = baseFilteredRecords.length;
    const idOpened = baseFilteredRecords.filter(r => r.raksul_id_status === '提案⇒開設' || r.raksul_id_status === '開設済').length;
    // 商材フィルターがある場合はその商材だけで計算
    const targetProducts = filterProduct ? ALL_PRODUCTS.filter(p => p.id === filterProduct) : ALL_PRODUCTS;
    const totalTossups = targetProducts.reduce((sum, p) => sum + baseFilteredRecords.filter(r => r[`result_${p.id}`] === 'トスアップ').length, 0);
    const productStats = ALL_PRODUCTS.map(p => {
      const proposed = baseFilteredRecords.filter(r => r[`proposal_${p.id}`] === '○').length;
      const contracts = baseFilteredRecords.filter(r => r[`result_${p.id}`] === '契約').length;
      const tossups = baseFilteredRecords.filter(r => r[`result_${p.id}`] === 'トスアップ').length;
      const ngs = baseFilteredRecords.filter(r => r[`result_${p.id}`] === 'NG').length;
      return { ...p, proposed, contracts, tossups, ngs, proposalRate: totalVisits > 0 ? (proposed/totalVisits*100).toFixed(1) : '0', contractRate: proposed > 0 ? (contracts/proposed*100).toFixed(1) : '0', tossupRate: proposed > 0 ? (tossups/proposed*100).toFixed(1) : '0' };
    }).filter(p => p.proposed > 0 || p.contracts > 0 || p.tossups > 0 || p.ngs > 0);
    const totalIncentive = baseFilteredRecords.reduce((sum, r) => sum + calcIncentive(r), 0);

    // 表に出す商材（商材フィルタ時はその商材のみ、通常は現行商材のみ）
    const rateProducts = filterProduct ? ALL_PRODUCTS.filter(p => p.id === filterProduct) : PRODUCTS;

    // ID取得の判定（新規=開設、既存=ID記録済、種別未設定の過去データ=開設で判定）
    const hasId = (r) => {
      const opened = r.raksul_id_status === '提案⇒開設' || r.raksul_id_status === '開設済';
      if (r.customer_type === '既存') return !!r.existing_raksul_id;
      if (r.customer_type === '新規') return opened;
      return opened;
    };

    // 担当者・事務所に共通する行動指標
    const groupMetrics = (rs) => {
      const pcTargetRecords = rs.filter(r => r.sales_method === '訪問');
      const pcDoneRecords = pcTargetRecords.filter(r => r.pc_proposal === '提案した');
      const idDoneRecords = rs.filter(hasId);
      return {
        pcTarget: pcTargetRecords.length,
        pcDone: pcDoneRecords.length,
        pcRate: pcTargetRecords.length > 0 ? (pcDoneRecords.length / pcTargetRecords.length * 100).toFixed(1) : null,
        pcTargetRecords, pcDoneRecords,
        idDone: idDoneRecords.length,
        idRate: rs.length > 0 ? (idDoneRecords.length / rs.length * 100).toFixed(1) : '0',
        idDoneRecords,
        productRates: rateProducts.map(p => {
          const pr = rs.filter(r => r[`proposal_${p.id}`] === '○');
          return { id: p.id, name: p.name, color: p.color, proposed: pr.length, rate: rs.length > 0 ? (pr.length / rs.length * 100).toFixed(1) : '0', records: pr };
        })
      };
    };
    const staffStats = ALL_STAFF.map(s => {
      const sr = baseFilteredRecords.filter(r => r.staff === s);
      const proposed = targetProducts.reduce((sum, p) => sum + sr.filter(r => r[`proposal_${p.id}`] === '○').length, 0);
      const tossups = targetProducts.reduce((sum, p) => sum + sr.filter(r => r[`result_${p.id}`] === 'トスアップ').length, 0);
      const contracts = targetProducts.reduce((sum, p) => sum + sr.filter(r => r[`result_${p.id}`] === '契約').length, 0);
      return { ...groupMetrics(sr), name: s, visits: sr.length, ids: sr.filter(r => r.raksul_id_status === '提案⇒開設' || r.raksul_id_status === '開設済').length, proposed, tossups, contracts, proposalRate: sr.length > 0 ? (proposed / sr.length * 100).toFixed(1) : '0', tossupRate: proposed > 0 ? (tossups/proposed*100).toFixed(1) : '0', contractRate: proposed > 0 ? (contracts/proposed*100).toFixed(1) : '0', incentive: sr.reduce((sum,r) => sum + calcIncentive(r), 0) };
    }).filter(s => s.visits > 0);
    const officeStats = OFFICE_LIST.map(o => {
      const or = baseFilteredRecords.filter(r => r.office === o);
      const proposed = targetProducts.reduce((sum, p) => sum + or.filter(r => r[`proposal_${p.id}`] === '○').length, 0);
      const tossups = targetProducts.reduce((sum, p) => sum + or.filter(r => r[`result_${p.id}`] === 'トスアップ').length, 0);
      const contracts = targetProducts.reduce((sum, p) => sum + or.filter(r => r[`result_${p.id}`] === '契約').length, 0);
      return { ...groupMetrics(or), name: o, visits: or.length, ids: or.filter(r => r.raksul_id_status === '提案⇒開設' || r.raksul_id_status === '開設済').length, proposed, tossups, contracts, proposalRate: or.length > 0 ? (proposed / or.length * 100).toFixed(1) : '0', tossupRate: proposed > 0 ? (tossups/proposed*100).toFixed(1) : '0', contractRate: proposed > 0 ? (contracts/proposed*100).toFixed(1) : '0', incentive: or.reduce((sum,r) => sum + calcIncentive(r), 0) };
    }).filter(o => o.visits > 0);
    const ngStatsByProduct = ALL_PRODUCTS.map(p => {
      const reasons = baseFilteredRecords.map(r => r[`ng_${p.id}`]).filter(Boolean);
      const counts = {};
      reasons.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
      return { product: p, ngCounts: Object.entries(counts).map(([reason, count]) => ({ reason, count })).sort((a,b) => b.count - a.count) };
    }).filter(p => p.ngCounts.length > 0);
    const videoOrdered = baseFilteredRecords.filter(r => r.video_ordered === '申込済').length;

    // ===== PC提案（母数は「訪問」の記録のみ） =====
    const pcVisitRecords = baseFilteredRecords.filter(r => r.sales_method === '訪問');
    const pcProposedRecords = pcVisitRecords.filter(r => r.pc_proposal === '提案した');
    const pcNotProposedRecords = pcVisitRecords.filter(r => r.pc_proposal === '提案しなかった');
    const pcUnrecordedRecords = pcVisitRecords.filter(r => !r.pc_proposal);
    const pcReasonCounts = {};
    pcNotProposedRecords.forEach(r => {
      const key = (r.pc_not_proposed_reason || '').trim() || '理由未入力';
      pcReasonCounts[key] = (pcReasonCounts[key] || 0) + 1;
    });
    const pcOrderedRecords = pcProposedRecords.filter(r => r.pc_result === '受注');
    const pcNgRecords = pcProposedRecords.filter(r => r.pc_result === 'NG');
    const pcResultUnrecordedRecords = pcProposedRecords.filter(r => !r.pc_result);
    const pcDeviceCounts = {};
    pcOrderedRecords.forEach(r => {
      (r.pc_devices || '').split(',').filter(Boolean).forEach(d => { pcDeviceCounts[d] = (pcDeviceCounts[d] || 0) + 1; });
    });
    const pcUnitCounts = {};
    pcOrderedRecords.forEach(r => {
      const key = r.pc_units || '未入力';
      pcUnitCounts[key] = (pcUnitCounts[key] || 0) + 1;
    });
    const pcNgReasonCounts = {};
    pcNgRecords.forEach(r => {
      const key = (r.pc_ng_reason || '').trim() || '理由未入力';
      pcNgReasonCounts[key] = (pcNgReasonCounts[key] || 0) + 1;
    });
    const pcStats = {
      ordered: pcOrderedRecords.length,
      ngCount: pcNgRecords.length,
      resultUnrecorded: pcResultUnrecordedRecords.length,
      orderRate: pcProposedRecords.length > 0 ? (pcOrderedRecords.length / pcProposedRecords.length * 100).toFixed(1) : '0',
      orderedRecords: pcOrderedRecords,
      ngRecords: pcNgRecords,
      resultUnrecordedRecords: pcResultUnrecordedRecords,
      devices: Object.entries(pcDeviceCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      units: Object.entries(pcUnitCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      ngReasons: Object.entries(pcNgReasonCounts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
      targetVisits: pcVisitRecords.length,
      proposed: pcProposedRecords.length,
      notProposed: pcNotProposedRecords.length,
      unrecorded: pcUnrecordedRecords.length,
      rate: pcVisitRecords.length > 0 ? (pcProposedRecords.length / pcVisitRecords.length * 100).toFixed(1) : '0',
      visitRecords: pcVisitRecords,
      proposedRecords: pcProposedRecords,
      notProposedRecords: pcNotProposedRecords,
      unrecordedRecords: pcUnrecordedRecords,
      reasons: Object.entries(pcReasonCounts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
      byStaff: ALL_STAFF.map(s => {
        const sv = pcVisitRecords.filter(r => r.staff === s);
        const sp = sv.filter(r => r.pc_proposal === '提案した');
        return { name: s, visits: sv.length, proposed: sp.length, rate: sv.length > 0 ? (sp.length / sv.length * 100).toFixed(1) : '0', records: sv, proposedRecords: sp };
      }).filter(s => s.visits > 0).sort((a, b) => Number(b.rate) - Number(a.rate) || b.visits - a.visits)
    };

    // ===== 顧客種別（新規／既存）とラクスルID回収状況 =====
    const newRecords = baseFilteredRecords.filter(r => r.customer_type === '新規');
    const existingRecords = baseFilteredRecords.filter(r => r.customer_type === '既存');
    const unsetTypeRecords = baseFilteredRecords.filter(r => !r.customer_type);
    const newIdOpenedRecords = newRecords.filter(r => r.raksul_id_status === '提案⇒開設' || r.raksul_id_status === '開設済');
    const newIdMissingRecords = newRecords.filter(r => !(r.raksul_id_status === '提案⇒開設' || r.raksul_id_status === '開設済'));
    const existingIdRecordedRecords = existingRecords.filter(r => r.existing_raksul_id);
    const existingIdMissingRecords = existingRecords.filter(r => !r.existing_raksul_id);
    const idMissingRecords = baseFilteredRecords.filter(r => r.raksul_id_missing_reason);
    const idMissingReasonCounts = {};
    idMissingRecords.forEach(r => {
      const key = (r.raksul_id_missing_reason || '').trim() || '理由未入力';
      idMissingReasonCounts[key] = (idMissingReasonCounts[key] || 0) + 1;
    });
    const customerStats = {
      newCount: newRecords.length,
      existingCount: existingRecords.length,
      unsetCount: unsetTypeRecords.length,
      newRecords, existingRecords, unsetTypeRecords,
      newIdOpened: newIdOpenedRecords.length,
      newIdMissing: newIdMissingRecords.length,
      newIdRate: newRecords.length > 0 ? (newIdOpenedRecords.length / newRecords.length * 100).toFixed(1) : '0',
      newIdOpenedRecords, newIdMissingRecords,
      existingIdRecorded: existingIdRecordedRecords.length,
      existingIdMissing: existingIdMissingRecords.length,
      existingIdRate: existingRecords.length > 0 ? (existingIdRecordedRecords.length / existingRecords.length * 100).toFixed(1) : '0',
      existingIdRecordedRecords, existingIdMissingRecords,
      idMissingRecords: idMissingRecords,
      idMissingCount: idMissingRecords.length,
      idMissingReasons: Object.entries(idMissingReasonCounts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count)
    };

    return { totalVisits, idOpened, totalTossups, productStats, staffStats, officeStats, totalIncentive, ngStatsByProduct, videoOrdered, pcStats, customerStats, rateProducts, groupMetrics };
  }, [filterProduct, baseFilteredRecords]);

  // ===== 分析テーブル用ヘルパー =====
  const rateColor = (v) => (v === null || v === undefined) ? '#94a3b8' : (Number(v) >= 80 ? '#059669' : Number(v) >= 50 ? '#d97706' : '#dc2626');
  const rateBg = (v) => (v === null || v === undefined) ? '#f8fafc' : (Number(v) >= 80 ? '#dcfce7' : Number(v) >= 50 ? '#fef3c7' : '#fee2e2');

  function RateCell({ rate, sub, title, records, dark }) {
    const clickable = records && records.length > 0;
    return (
      <td onClick={()=>clickable&&setDetailModal({title, records})}
          style={{padding:'10px 8px',textAlign:'center',background:dark?'transparent':rateBg(rate),cursor:clickable?'pointer':'default'}}>
        <div style={{fontSize:'14px',fontWeight:'700',color:dark?'#fff':rateColor(rate)}}>{(rate === null || rate === undefined) ? '\u2013' : `${rate}%`}</div>
        {sub && <div style={{fontSize:'10px',color:dark?'#cbd5e1':'#64748b',marginTop:'2px'}}>{sub}</div>}
      </td>
    );
  }

  function CountCell({ count, sub, title, records, color, dark }) {
    const clickable = records && records.length > 0;
    return (
      <td onClick={()=>clickable&&setDetailModal({title, records})}
          style={{padding:'10px 8px',textAlign:'center',cursor:clickable?'pointer':'default'}}>
        <div style={{fontSize:'14px',fontWeight:'700',color:dark?'#fff':(color||'#1e293b'),textDecoration:clickable?'underline':'none'}}>{count}</div>
        {sub && <div style={{fontSize:'10px',color:dark?'#cbd5e1':'#94a3b8',marginTop:'2px'}}>{sub}</div>}
      </td>
    );
  }

  // 担当者別／事務所別の分析テーブル
  function renderGroupTable(rows, headLabel, field) {
    const rp = stats.rateProducts;
    const totals = stats.groupMetrics(baseFilteredRecords);
    const tProducts = filterProduct ? ALL_PRODUCTS.filter(p => p.id === filterProduct) : ALL_PRODUCTS;
    const tVisits = rows.reduce((a,r)=>a+r.visits,0);
    const tTossups = rows.reduce((a,r)=>a+r.tossups,0);
    const tContracts = rows.reduce((a,r)=>a+r.contracts,0);
    const tProposed = rows.reduce((a,r)=>a+r.proposed,0);
    const tIncentive = rows.reduce((a,r)=>a+r.incentive,0);
    return (
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
          <thead><tr style={{borderBottom:'2px solid #e2e8f0',background:'#f8fafc'}}>
            <th style={{padding:'12px 8px',textAlign:'left',whiteSpace:'nowrap'}}>{headLabel}</th>
            <th style={{padding:'12px 8px',textAlign:'center',whiteSpace:'nowrap'}}>訪問</th>
            <th style={{padding:'12px 8px',textAlign:'center',whiteSpace:'nowrap'}}>💻PC提案率</th>
            <th style={{padding:'12px 8px',textAlign:'center',whiteSpace:'nowrap'}}>🆔ID取得率</th>
            {rp.map(p=><th key={p.id} style={{padding:'12px 8px',textAlign:'center',whiteSpace:'nowrap'}}>{p.name}提案率</th>)}
            <th style={{padding:'12px 8px',textAlign:'center',whiteSpace:'nowrap'}}>トスアップ</th>
            <th style={{padding:'12px 8px',textAlign:'center',whiteSpace:'nowrap'}}>契約</th>
            <th style={{padding:'12px 8px',textAlign:'center',whiteSpace:'nowrap'}}>報酬</th>
          </tr></thead>
          <tbody>
            {rows.map(row=>{
              const groupRecords = baseFilteredRecords.filter(r => r[field] === row.name);
              const tossupRecords = groupRecords.filter(r => tProducts.some(p => r[`result_${p.id}`] === 'トスアップ'));
              const contractRecords = groupRecords.filter(r => tProducts.some(p => r[`result_${p.id}`] === '契約'));
              return (
                <tr key={row.name} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'10px 8px',fontWeight:'600',whiteSpace:'nowrap'}}>{row.name}</td>
                  <CountCell count={row.visits} title={`${row.name} 訪問`} records={groupRecords} />
                  <RateCell rate={row.pcRate} sub={row.pcTarget>0?`${row.pcDone}/${row.pcTarget}`:'訪問なし'} title={`${row.name} PC提案あり`} records={row.pcDoneRecords} />
                  <RateCell rate={row.idRate} sub={`${row.idDone}/${row.visits}`} title={`${row.name} ID取得`} records={row.idDoneRecords} />
                  {row.productRates.map(pr=>(
                    <RateCell key={pr.id} rate={pr.rate} sub={`${pr.proposed}件`} title={`${row.name} ${pr.name}提案`} records={pr.records} />
                  ))}
                  <CountCell count={row.tossups} sub={`${row.tossupRate}%`} title={`${row.name} トスアップ`} records={tossupRecords} color="#1e40af" />
                  <CountCell count={row.contracts} sub={`成約 ${row.contractRate}%`} title={`${row.name} 契約`} records={contractRecords} color="#059669" />
                  <td style={{padding:'10px 8px',textAlign:'center',fontWeight:'700',color:'#059669',whiteSpace:'nowrap'}}>¥{row.incentive.toLocaleString()}</td>
                </tr>
              );
            })}
            {/* 合計行 */}
            <tr style={{borderTop:'2px solid #1e293b',background:'#1e293b',color:'#fff'}}>
              <td style={{padding:'10px 8px',fontWeight:'700'}}>合計</td>
              <CountCell dark count={tVisits} title="全体 訪問" records={baseFilteredRecords} />
              <RateCell dark rate={totals.pcRate} sub={totals.pcTarget>0?`${totals.pcDone}/${totals.pcTarget}`:'訪問なし'} title="全体 PC提案あり" records={totals.pcDoneRecords} />
              <RateCell dark rate={totals.idRate} sub={`${totals.idDone}/${tVisits}`} title="全体 ID取得" records={totals.idDoneRecords} />
              {totals.productRates.map(pr=>(
                <RateCell key={pr.id} dark rate={pr.rate} sub={`${pr.proposed}件`} title={`全体 ${pr.name}提案`} records={pr.records} />
              ))}
              <CountCell dark count={tTossups} sub={tProposed>0?`${(tTossups/tProposed*100).toFixed(1)}%`:'0%'} title="全体 トスアップ" records={baseFilteredRecords.filter(r => tProducts.some(p => r[`result_${p.id}`] === 'トスアップ'))} />
              <CountCell dark count={tContracts} sub={tProposed>0?`成約 ${(tContracts/tProposed*100).toFixed(1)}%`:'成約 0%'} title="全体 契約" records={baseFilteredRecords.filter(r => tProducts.some(p => r[`result_${p.id}`] === '契約'))} />
              <td style={{padding:'10px 8px',textAlign:'center',fontWeight:'700'}}>¥{tIncentive.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <div style={{marginTop:'8px',fontSize:'11px',color:'#94a3b8'}}>
          ※ PC提案率は「訪問」した記録のみが母数です（遠隔は対象外）。ID取得率は新規のID開設と既存のID記録を合算した割合です。数字をタップすると該当企業を確認できます。
        </div>
      </div>
    );
  }

  function exportCSV() {
    const h = ['訪問日','担当者','企業名','業種','事務所','営業先','商談方法','顧客種別','PC提案','PC未提案理由','PC結果','PC機種','PC台数','PC NG理由','提案タイミング','ID状態','メールアドレス','既存ID','ID未入力理由','バンク提案','ペイ提案','モール提案','MEO提案','動画提案','バンク結果','ペイ結果','モール結果','MEO結果','動画結果','バンクNG','ペイNG','モールNG','MEONG','動画NG','モール未購入理由','ID未開設理由','動画申込','報酬','備考'];
    const rows = filteredRecords.map(r => {
      const idStatus = r.raksul_id_status === '開設済' ? '提案⇒開設' : r.raksul_id_status;
      return [r.visit_date,r.staff,r.company,r.industry,r.office,r.sales_source,r.sales_method,r.customer_type,r.pc_proposal,r.pc_not_proposed_reason,r.pc_result,r.pc_devices,r.pc_units,r.pc_ng_reason,r.timing,idStatus,r.raksul_email,r.existing_raksul_id,r.raksul_id_missing_reason,r.proposal_bank,r.proposal_pay,r.proposal_mall,r.proposal_meo,r.proposal_video,r.result_bank,r.result_pay,r.result_mall,r.result_meo,r.result_video,r.ng_bank,r.ng_pay,r.ng_mall,r.ng_meo,r.ng_video,r.mall_not_purchased_reason,r.id_not_opened_reason,r.video_ordered,calcIncentive(r),r.note];
    });
    const csv = '\uFEFF' + [h,...rows].map(r => r.map(c => `"${c||''}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const filterInfo = (filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct) ? '_絞込' : '';
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `訪問記録${filterInfo}_${new Date().toISOString().split('T')[0]}.csv`; link.click();
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc'}}><div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>⏳</div><div style={{color:'#64748b'}}>読み込み中...</div></div></div>;

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'system-ui,sans-serif',color:'#1e293b'}}>
      {/* ヘッダー */}
      <header style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'12px 16px',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:'1400px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
          <div>
            <h1 style={{fontSize:'18px',fontWeight:'700',margin:0}}>提携商材 効果測定</h1>
            <p style={{fontSize:'11px',color:'#64748b',margin:0}}>ラクスル × ROS <span style={{color:connectionStatus==='connected'?'#059669':'#dc2626'}}>{connectionStatus==='connected'?'● 接続中':'● エラー'}</span></p>
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {[{key:'dashboard',label:'📊集計'},{key:'records',label:'📋記録'},{key:'products',label:'📦商材'},{key:'manual',label:'📖使い方'}].map(t=>
              <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:'8px 14px',borderRadius:'6px',border:activeTab===t.key?'none':'1px solid #e2e8f0',background:activeTab===t.key?'#2563eb':'#fff',color:activeTab===t.key?'#fff':'#64748b',fontSize:'13px',cursor:'pointer'}}>{t.label}</button>
            )}
            <a href={VOICE_UPLOAD_URL} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',fontSize:'13px',textDecoration:'none',fontWeight:'600',animation:'pulse 2s infinite'}}>🎤音声</a>
            <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'#fff',fontSize:'13px',textDecoration:'none',fontWeight:'700',boxShadow:'0 4px 12px rgba(220,38,38,0.4)',animation:'pulse 2s infinite'}}>🎯 全商材申込はこちら</a>
          </div>
        </div>
      </header>

      <main style={{maxWidth:'1400px',margin:'0 auto',padding:'16px'}}>
        
        {/* ========== 集計タブ ========== */}
        {activeTab === 'dashboard' && (
          <div style={{display:'grid',gap:'16px'}}>
            {/* フィルターセクション */}
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',overflow:'hidden'}}>
              <button 
                onClick={()=>setShowFilter(!showFilter)} 
                style={{width:'100%',padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:'600',color:'#374151'}}
              >
                <span>🔍 絞り込み {(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct) && <span style={{background:'#2563eb',color:'#fff',padding:'2px 8px',borderRadius:'10px',fontSize:'11px',marginLeft:'8px'}}>適用中</span>}</span>
                <span style={{transform:showFilter?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}>▼</span>
              </button>
              {showFilter && (
                <div style={{padding:'16px',borderTop:'1px solid #e2e8f0',display:'grid',gap:'12px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'12px'}}>
                    <div>
                      <label style={{fontSize:'12px',color:'#64748b',display:'block',marginBottom:'4px'}}>開始日</label>
                      <input type="date" value={filterDateFrom} onChange={e=>setFilterDateFrom(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'13px',boxSizing:'border-box'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'12px',color:'#64748b',display:'block',marginBottom:'4px'}}>終了日</label>
                      <input type="date" value={filterDateTo} onChange={e=>setFilterDateTo(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'13px',boxSizing:'border-box'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'12px',color:'#64748b',display:'block',marginBottom:'4px'}}>担当者</label>
                      <select value={filterStaff} onChange={e=>setFilterStaff(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'13px',background:'#fff'}}>
                        <option value="">全員</option>
                        {ALL_STAFF.map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:'12px',color:'#64748b',display:'block',marginBottom:'4px'}}>事務所</label>
                      <select value={filterOffice} onChange={e=>setFilterOffice(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'13px',background:'#fff'}}>
                        <option value="">全て</option>
                        {OFFICE_LIST.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:'12px',color:'#64748b',display:'block',marginBottom:'4px'}}>商材</label>
                      <select value={filterProduct} onChange={e=>setFilterProduct(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'13px',background:'#fff'}}>
                        <option value="">全て</option>
                        {ALL_PRODUCTS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
                    <button onClick={()=>{setFilterDateFrom('');setFilterDateTo('');setFilterStaff('');setFilterOffice('');setFilterProduct('');}} style={{padding:'8px 16px',borderRadius:'6px',border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>クリア</button>
                  </div>
                  {(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct) && (
                    <div style={{fontSize:'12px',color:'#64748b',textAlign:'right'}}>
                      {filteredRecords.length} / {records.length} 件表示中
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* サマリーカード */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'10px'}}>
              <div style={{background:'#fff',borderRadius:'10px',border:'1px solid #e2e8f0',padding:'14px'}}><div style={{fontSize:'11px',color:'#64748b'}}>総訪問数</div><div style={{fontSize:'22px',fontWeight:'700',color:'#2563eb'}}>{stats.totalVisits}<span style={{fontSize:'12px',color:'#94a3b8'}}>件</span></div></div>
              <div style={{background:'#fff',borderRadius:'10px',border:'1px solid #e2e8f0',padding:'14px'}}><div style={{fontSize:'11px',color:'#64748b'}}>ID開設</div><div style={{fontSize:'22px',fontWeight:'700',color:'#6366f1'}}>{stats.idOpened}<span style={{fontSize:'12px',color:'#94a3b8'}}>件</span></div></div>
              <div style={{background:'#fff',borderRadius:'10px',border:Number(stats.pcStats.rate)>=100&&stats.pcStats.targetVisits>0?'1px solid #059669':'1px solid #e2e8f0',padding:'14px'}}><div style={{fontSize:'11px',color:'#64748b'}}>💻 PC提案率</div><div style={{fontSize:'22px',fontWeight:'700',color:Number(stats.pcStats.rate)>=100?'#059669':Number(stats.pcStats.rate)>=70?'#d97706':'#dc2626'}}>{stats.pcStats.rate}<span style={{fontSize:'12px',color:'#94a3b8'}}>%</span></div></div>
              <div style={{background:'#fff',borderRadius:'10px',border:'1px solid #e2e8f0',padding:'14px'}}><div style={{fontSize:'11px',color:'#64748b'}}>トスアップ</div><div style={{fontSize:'22px',fontWeight:'700',color:'#1e40af'}}>{stats.totalTossups}<span style={{fontSize:'12px',color:'#94a3b8'}}>件</span></div></div>
              <div style={{background:'#fff',borderRadius:'10px',border:'1px solid #e2e8f0',padding:'14px'}}><div style={{fontSize:'11px',color:'#64748b'}}>動画申込</div><div style={{fontSize:'22px',fontWeight:'700',color:'#dc2626'}}>{stats.videoOrdered}<span style={{fontSize:'12px',color:'#94a3b8'}}>件</span></div></div>
              <div style={{background:'#fff',borderRadius:'10px',border:'1px solid #e2e8f0',padding:'14px'}}><div style={{fontSize:'11px',color:'#64748b'}}>総報酬</div><div style={{fontSize:'22px',fontWeight:'700',color:'#059669'}}>¥{stats.totalIncentive.toLocaleString()}</div></div>
            </div>

            {/* 💻 PC提案 ＆ 👤 顧客種別 */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'12px'}}>

              {/* PC提案 */}
              <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px',flexWrap:'wrap',gap:'8px'}}>
                  <h3 style={{margin:0,fontSize:'14px',fontWeight:'600'}}>💻 訪問時のPC提案</h3>
                  <span style={{padding:'3px 10px',background:'#f1f5f9',color:'#64748b',borderRadius:'10px',fontSize:'11px'}}>対象：訪問 {stats.pcStats.targetVisits}件</span>
                </div>

                {stats.pcStats.targetVisits === 0 ? (
                  <div style={{padding:'24px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>対象となる訪問記録がありません</div>
                ) : (
                  <>
                    {/* 提案率バー */}
                    <div style={{marginBottom:'14px'}}>
                      <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'6px'}}>
                        <span style={{fontSize:'32px',fontWeight:'700',color:Number(stats.pcStats.rate)>=100?'#059669':Number(stats.pcStats.rate)>=70?'#d97706':'#dc2626'}}>{stats.pcStats.rate}<span style={{fontSize:'16px'}}>%</span></span>
                        <span style={{fontSize:'12px',color:'#64748b'}}>提案率（目標 100%）</span>
                      </div>
                      <div style={{height:'8px',background:'#f1f5f9',borderRadius:'4px',overflow:'hidden'}}>
                        <div style={{width:`${Math.min(Number(stats.pcStats.rate),100)}%`,height:'100%',background:Number(stats.pcStats.rate)>=100?'#059669':Number(stats.pcStats.rate)>=70?'#f59e0b':'#dc2626',borderRadius:'4px',transition:'width 0.3s'}}></div>
                      </div>
                    </div>

                    {/* 内訳チップ */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'12px'}}>
                      <div onClick={()=>stats.pcStats.proposed>0&&setDetailModal({title:'PC提案あり',records:stats.pcStats.proposedRecords})} style={{padding:'10px',background:'#dcfce7',borderRadius:'8px',textAlign:'center',cursor:stats.pcStats.proposed>0?'pointer':'default'}}>
                        <div style={{fontSize:'11px',color:'#166534'}}>✓ 提案した</div>
                        <div style={{fontSize:'20px',fontWeight:'700',color:'#059669',textDecoration:stats.pcStats.proposed>0?'underline':'none'}}>{stats.pcStats.proposed}</div>
                      </div>
                      <div onClick={()=>stats.pcStats.notProposed>0&&setDetailModal({title:'PC提案なし',records:stats.pcStats.notProposedRecords})} style={{padding:'10px',background:'#fef3c7',borderRadius:'8px',textAlign:'center',cursor:stats.pcStats.notProposed>0?'pointer':'default'}}>
                        <div style={{fontSize:'11px',color:'#92400e'}}>✗ しなかった</div>
                        <div style={{fontSize:'20px',fontWeight:'700',color:'#d97706',textDecoration:stats.pcStats.notProposed>0?'underline':'none'}}>{stats.pcStats.notProposed}</div>
                      </div>
                      <div onClick={()=>stats.pcStats.unrecorded>0&&setDetailModal({title:'PC提案 未記録',records:stats.pcStats.unrecordedRecords})} style={{padding:'10px',background:stats.pcStats.unrecorded>0?'#fee2e2':'#f8fafc',borderRadius:'8px',textAlign:'center',cursor:stats.pcStats.unrecorded>0?'pointer':'default'}}>
                        <div style={{fontSize:'11px',color:'#64748b'}}>― 未記録</div>
                        <div style={{fontSize:'20px',fontWeight:'700',color:stats.pcStats.unrecorded>0?'#dc2626':'#94a3b8',textDecoration:stats.pcStats.unrecorded>0?'underline':'none'}}>{stats.pcStats.unrecorded}</div>
                      </div>
                    </div>

                    {/* 提案後の結果 */}
                    {stats.pcStats.proposed > 0 && (
                      <div style={{marginBottom:'12px',padding:'12px',background:'#f8fafc',borderRadius:'8px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'8px'}}>
                          <span style={{fontSize:'12px',fontWeight:'600',color:'#166534'}}>🎉 提案後の受注率</span>
                          <span style={{fontSize:'18px',fontWeight:'700',color:Number(stats.pcStats.orderRate)>=50?'#059669':Number(stats.pcStats.orderRate)>=20?'#d97706':'#dc2626'}}>{stats.pcStats.orderRate}%</span>
                        </div>
                        <div style={{display:'flex',gap:'8px',fontSize:'11px',flexWrap:'wrap',marginBottom:'8px'}}>
                          <span onClick={()=>stats.pcStats.ordered>0&&setDetailModal({title:'PC受注',records:stats.pcStats.orderedRecords})} style={{color:'#059669',fontWeight:'600',cursor:stats.pcStats.ordered>0?'pointer':'default',textDecoration:stats.pcStats.ordered>0?'underline':'none'}}>受注 {stats.pcStats.ordered}件</span>
                          <span onClick={()=>stats.pcStats.ngCount>0&&setDetailModal({title:'PC NG',records:stats.pcStats.ngRecords})} style={{color:'#dc2626',cursor:stats.pcStats.ngCount>0?'pointer':'default',textDecoration:stats.pcStats.ngCount>0?'underline':'none'}}>NG {stats.pcStats.ngCount}件</span>
                          {stats.pcStats.resultUnrecorded>0 && (
                            <span onClick={()=>setDetailModal({title:'PC結果 未記録',records:stats.pcStats.resultUnrecordedRecords})} style={{color:'#94a3b8',cursor:'pointer',textDecoration:'underline'}}>未記録 {stats.pcStats.resultUnrecorded}件</span>
                          )}
                        </div>
                        {stats.pcStats.devices.length > 0 && (
                          <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'6px'}}>
                            <span style={{fontSize:'11px',color:'#64748b',alignSelf:'center'}}>機種：</span>
                            {stats.pcStats.devices.map(d=>(
                              <span key={d.name} style={{padding:'3px 10px',background:'#dcfce7',color:'#166534',borderRadius:'8px',fontSize:'11px'}}>{d.name} <strong>{d.count}</strong></span>
                            ))}
                          </div>
                        )}
                        {stats.pcStats.units.length > 0 && (
                          <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'6px'}}>
                            <span style={{fontSize:'11px',color:'#64748b',alignSelf:'center'}}>台数：</span>
                            {stats.pcStats.units.map(u=>(
                              <span key={u.name} style={{padding:'3px 10px',background:'#eff6ff',color:'#1e40af',borderRadius:'8px',fontSize:'11px'}}>{u.name} <strong>{u.count}</strong></span>
                            ))}
                          </div>
                        )}
                        {stats.pcStats.ngReasons.length > 0 && (
                          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                            <span style={{fontSize:'11px',color:'#64748b',alignSelf:'center'}}>NG理由：</span>
                            {stats.pcStats.ngReasons.map((n,idx)=>(
                              <span key={n.reason} style={{padding:'3px 10px',background:idx===0?'#fecaca':'#fee2e2',color:'#991b1b',borderRadius:'8px',fontSize:'11px',fontWeight:idx===0?'600':'400'}}>{idx===0?'🥇 ':''}{n.reason} <strong>{n.count}</strong></span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 提案しなかった理由 */}
                    {stats.pcStats.reasons.length > 0 && (
                      <div style={{marginBottom:'10px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                          <span style={{fontSize:'12px',fontWeight:'600',color:'#92400e'}}>提案しなかった理由（件数順）</span>
                          {stats.pcStats.reasons.length > 3 && (
                            <button onClick={()=>setShowPcReasons(!showPcReasons)} style={{padding:'4px 10px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'11px',color:'#64748b',cursor:'pointer'}}>
                              {showPcReasons ? '▲ 閉じる' : `▼ 他${stats.pcStats.reasons.length - 3}件`}
                            </button>
                          )}
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                          {(showPcReasons ? stats.pcStats.reasons : stats.pcStats.reasons.slice(0,3)).map((n,idx)=>(
                            <span key={n.reason} style={{padding:'4px 10px',background:idx===0?'#fde68a':'#fef3c7',color:'#92400e',borderRadius:'8px',fontSize:'12px',fontWeight:idx===0?'600':'400',border:idx===0?'1px solid #f59e0b':'none'}}>
                              {idx===0?'🥇 ':idx===1?'🥈 ':idx===2?'🥉 ':''}{n.reason} <strong>{n.count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 担当者別 提案率 */}
                    {stats.pcStats.byStaff.length > 0 && (
                      <div style={{borderTop:'1px solid #f1f5f9',paddingTop:'10px'}}>
                        <button onClick={()=>setShowPcByStaff(!showPcByStaff)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',background:'none',border:'none',padding:'4px 0',cursor:'pointer',fontSize:'12px',fontWeight:'600',color:'#374151'}}>
                          <span>👥 担当者別 PC提案率（{stats.pcStats.byStaff.length}名）</span>
                          <span style={{transform:showPcByStaff?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s',color:'#94a3b8'}}>▼</span>
                        </button>
                        {showPcByStaff && (
                          <div style={{marginTop:'8px',display:'grid',gap:'4px',maxHeight:'260px',overflowY:'auto'}}>
                            {stats.pcStats.byStaff.map(s=>(
                              <div key={s.name} onClick={()=>setDetailModal({title:`${s.name} 訪問（PC提案 ${s.proposed}/${s.visits}）`,records:s.records})} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 8px',borderRadius:'6px',background:'#f8fafc',cursor:'pointer'}}>
                                <span style={{fontSize:'12px',width:'56px',flexShrink:0}}>{s.name}</span>
                                <div style={{flex:1,height:'6px',background:'#e2e8f0',borderRadius:'3px',overflow:'hidden'}}>
                                  <div style={{width:`${Math.min(Number(s.rate),100)}%`,height:'100%',background:Number(s.rate)>=100?'#059669':Number(s.rate)>=70?'#f59e0b':'#dc2626'}}></div>
                                </div>
                                <span style={{fontSize:'12px',fontWeight:'600',width:'46px',textAlign:'right',color:Number(s.rate)>=100?'#059669':Number(s.rate)>=70?'#d97706':'#dc2626'}}>{s.rate}%</span>
                                <span style={{fontSize:'11px',color:'#94a3b8',width:'44px',textAlign:'right'}}>{s.proposed}/{s.visits}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 顧客種別・ラクスルID */}
              <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px',flexWrap:'wrap',gap:'8px'}}>
                  <h3 style={{margin:0,fontSize:'14px',fontWeight:'600'}}>🆔 顧客種別とラクスルID</h3>
                  <span style={{padding:'3px 10px',background:'#f1f5f9',color:'#64748b',borderRadius:'10px',fontSize:'11px'}}>全 {stats.totalVisits}件</span>
                </div>

                {stats.totalVisits === 0 ? (
                  <div style={{padding:'24px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>データがありません</div>
                ) : (
                  <>
                    {/* 種別内訳 */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'14px'}}>
                      <div onClick={()=>stats.customerStats.newCount>0&&setDetailModal({title:'新規ユーザー',records:stats.customerStats.newRecords})} style={{padding:'10px',background:'#dcfce7',borderRadius:'8px',textAlign:'center',cursor:stats.customerStats.newCount>0?'pointer':'default'}}>
                        <div style={{fontSize:'11px',color:'#166534'}}>🆕 新規</div>
                        <div style={{fontSize:'20px',fontWeight:'700',color:'#059669',textDecoration:stats.customerStats.newCount>0?'underline':'none'}}>{stats.customerStats.newCount}</div>
                      </div>
                      <div onClick={()=>stats.customerStats.existingCount>0&&setDetailModal({title:'既存ユーザー',records:stats.customerStats.existingRecords})} style={{padding:'10px',background:'#eff6ff',borderRadius:'8px',textAlign:'center',cursor:stats.customerStats.existingCount>0?'pointer':'default'}}>
                        <div style={{fontSize:'11px',color:'#1e40af'}}>📋 既存</div>
                        <div style={{fontSize:'20px',fontWeight:'700',color:'#2563eb',textDecoration:stats.customerStats.existingCount>0?'underline':'none'}}>{stats.customerStats.existingCount}</div>
                      </div>
                      <div onClick={()=>stats.customerStats.unsetCount>0&&setDetailModal({title:'顧客種別 未設定',records:stats.customerStats.unsetTypeRecords})} style={{padding:'10px',background:stats.customerStats.unsetCount>0?'#fee2e2':'#f8fafc',borderRadius:'8px',textAlign:'center',cursor:stats.customerStats.unsetCount>0?'pointer':'default'}}>
                        <div style={{fontSize:'11px',color:'#64748b'}}>― 未設定</div>
                        <div style={{fontSize:'20px',fontWeight:'700',color:stats.customerStats.unsetCount>0?'#dc2626':'#94a3b8',textDecoration:stats.customerStats.unsetCount>0?'underline':'none'}}>{stats.customerStats.unsetCount}</div>
                      </div>
                    </div>

                    {/* 新規：ID開設率 */}
                    <div style={{marginBottom:'12px',padding:'12px',background:'#f8fafc',borderRadius:'8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'6px'}}>
                        <span style={{fontSize:'12px',fontWeight:'600',color:'#166534'}}>🆕 新規のID開設率（原則例外なし＝100%）</span>
                        <span style={{fontSize:'16px',fontWeight:'700',color:Number(stats.customerStats.newIdRate)>=100?'#059669':'#dc2626'}}>{stats.customerStats.newIdRate}%</span>
                      </div>
                      <div style={{height:'6px',background:'#e2e8f0',borderRadius:'3px',overflow:'hidden',marginBottom:'6px'}}>
                        <div style={{width:`${Math.min(Number(stats.customerStats.newIdRate),100)}%`,height:'100%',background:Number(stats.customerStats.newIdRate)>=100?'#059669':'#dc2626'}}></div>
                      </div>
                      <div style={{display:'flex',gap:'8px',fontSize:'11px'}}>
                        <span onClick={()=>stats.customerStats.newIdOpened>0&&setDetailModal({title:'新規：ID開設済み',records:stats.customerStats.newIdOpenedRecords})} style={{color:'#059669',cursor:stats.customerStats.newIdOpened>0?'pointer':'default',textDecoration:stats.customerStats.newIdOpened>0?'underline':'none'}}>開設 {stats.customerStats.newIdOpened}件</span>
                        <span onClick={()=>stats.customerStats.newIdMissing>0&&setDetailModal({title:'⚠️ 新規：ID未開設',records:stats.customerStats.newIdMissingRecords})} style={{color:stats.customerStats.newIdMissing>0?'#dc2626':'#94a3b8',fontWeight:stats.customerStats.newIdMissing>0?'600':'400',cursor:stats.customerStats.newIdMissing>0?'pointer':'default',textDecoration:stats.customerStats.newIdMissing>0?'underline':'none'}}>未開設 {stats.customerStats.newIdMissing}件</span>
                      </div>
                    </div>

                    {/* 既存：ID記録率 */}
                    <div style={{padding:'12px',background:'#f8fafc',borderRadius:'8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'6px'}}>
                        <span style={{fontSize:'12px',fontWeight:'600',color:'#1e40af'}}>📋 既存のID確認・記録率</span>
                        <span style={{fontSize:'16px',fontWeight:'700',color:Number(stats.customerStats.existingIdRate)>=100?'#2563eb':'#dc2626'}}>{stats.customerStats.existingIdRate}%</span>
                      </div>
                      <div style={{height:'6px',background:'#e2e8f0',borderRadius:'3px',overflow:'hidden',marginBottom:'6px'}}>
                        <div style={{width:`${Math.min(Number(stats.customerStats.existingIdRate),100)}%`,height:'100%',background:Number(stats.customerStats.existingIdRate)>=100?'#2563eb':'#dc2626'}}></div>
                      </div>
                      <div style={{display:'flex',gap:'8px',fontSize:'11px'}}>
                        <span onClick={()=>stats.customerStats.existingIdRecorded>0&&setDetailModal({title:'既存：ID記録済み',records:stats.customerStats.existingIdRecordedRecords})} style={{color:'#2563eb',cursor:stats.customerStats.existingIdRecorded>0?'pointer':'default',textDecoration:stats.customerStats.existingIdRecorded>0?'underline':'none'}}>記録済 {stats.customerStats.existingIdRecorded}件</span>
                        <span onClick={()=>stats.customerStats.existingIdMissing>0&&setDetailModal({title:'⚠️ 既存：ID未記録',records:stats.customerStats.existingIdMissingRecords})} style={{color:stats.customerStats.existingIdMissing>0?'#dc2626':'#94a3b8',fontWeight:stats.customerStats.existingIdMissing>0?'600':'400',cursor:stats.customerStats.existingIdMissing>0?'pointer':'default',textDecoration:stats.customerStats.existingIdMissing>0?'underline':'none'}}>未記録 {stats.customerStats.existingIdMissing}件</span>
                      </div>
                    </div>

                    {/* ID未入力の理由 */}
                    {stats.customerStats.idMissingReasons.length > 0 && (
                      <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid #f1f5f9'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                          <span style={{fontSize:'12px',fontWeight:'600',color:'#dc2626'}}>⚠️ IDを入力できなかった理由</span>
                          <span onClick={()=>setDetailModal({title:'⚠️ ラクスルID未入力',records:stats.customerStats.idMissingRecords})} style={{fontSize:'11px',color:'#dc2626',cursor:'pointer',textDecoration:'underline'}}>計 {stats.customerStats.idMissingCount}件</span>
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                          {stats.customerStats.idMissingReasons.map((n,idx)=>(
                            <span key={n.reason} style={{padding:'4px 10px',background:idx===0?'#fecaca':'#fee2e2',color:'#991b1b',borderRadius:'8px',fontSize:'12px',fontWeight:idx===0?'600':'400',border:idx===0?'1px solid #dc2626':'none'}}>
                              {idx===0?'🥇 ':idx===1?'🥈 ':idx===2?'🥉 ':''}{n.reason} <strong>{n.count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 個人ランキング - 一旦非表示 */}
            {/* stats.staffStats.length > 0 && (
              <div style={{background:'linear-gradient(135deg,#1e293b,#334155)',borderRadius:'12px',padding:'16px',border:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                  <span style={{fontSize:'20px'}}>🏆</span>
                  <span style={{fontSize:'15px',fontWeight:'700',color:'#fff'}}>個人ランキング（総報酬順）</span>
                </div>
                <div style={{display:'grid',gap:'8px'}}>
                  {[...stats.staffStats].sort((a,b)=>b.incentive-a.incentive).slice(0,3).map((s,i)=>{
                    const rankStyles = [
                      {bg:'linear-gradient(135deg,#fbbf24,#d97706)',border:'2px solid #fbbf24',numBg:'#fff',numColor:'#d97706',icon:'🥇'},
                      {bg:'linear-gradient(135deg,#94a3b8,#64748b)',border:'2px solid #94a3b8',numBg:'#fff',numColor:'#64748b',icon:'🥈'},
                      {bg:'linear-gradient(135deg,#ea580c,#c2410c)',border:'2px solid #ea580c',numBg:'#fff',numColor:'#ea580c',icon:'🥉'}
                    ];
                    const style = rankStyles[i];
                    return (
                      <div key={s.name} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',background:style.bg,borderRadius:'10px',border:style.border}}>
                        <div style={{fontSize:'28px'}}>{style.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:'700',fontSize:'16px',color:'#fff'}}>{s.name}</div>
                          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.8)'}}>訪問{s.visits}件 / ID開設{s.ids}件</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:'22px',fontWeight:'800',color:'#fff'}}>¥{s.incentive.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {[...stats.staffStats].sort((a,b)=>b.incentive-a.incentive).length > 3 && (
                  <div style={{marginTop:'10px'}}>
                    <button onClick={()=>setShowAllRanking(!showAllRanking)} style={{width:'100%',padding:'10px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'8px',color:'#94a3b8',fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                      {showAllRanking ? '▲ 閉じる' : `▼ 4位以下を表示（${[...stats.staffStats].sort((a,b)=>b.incentive-a.incentive).length - 3}名）`}
                    </button>
                    {showAllRanking && (
                      <div style={{display:'grid',gap:'6px',marginTop:'8px'}}>
                        {[...stats.staffStats].sort((a,b)=>b.incentive-a.incentive).slice(3).map((s,i)=>(
                          <div key={s.name} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',background:'rgba(255,255,255,0.05)',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)'}}>
                            <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'13px',color:'#94a3b8'}}>{i+4}</div>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:'600',fontSize:'14px',color:'#e2e8f0'}}>{s.name}</div>
                              <div style={{fontSize:'10px',color:'#64748b'}}>訪問{s.visits}件 / ID開設{s.ids}件</div>
                            </div>
                            <div style={{fontSize:'16px',fontWeight:'700',color:'#94a3b8'}}>¥{s.incentive.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) */}

            {/* 分析テーブル */}
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
                <div style={{display:'flex',gap:'6px'}}>
                  {[{key:'product',label:'📦商材別'},{key:'staff',label:'👥担当者別'},{key:'office',label:'🏢事務所別'}].map(v=>
                    <button key={v.key} onClick={()=>setAnalysisView(v.key)} style={{padding:'6px 12px',borderRadius:'6px',border:analysisView===v.key?'none':'1px solid #e2e8f0',background:analysisView===v.key?'#1e293b':'#fff',color:analysisView===v.key?'#fff':'#64748b',fontSize:'12px',cursor:'pointer'}}>{v.label}</button>
                  )}
                </div>
                <button onClick={exportCSV} style={{padding:'6px 12px',borderRadius:'6px',border:'1px solid #059669',background:(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct)?'#059669':'#fff',color:(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct)?'#fff':'#059669',fontSize:'12px',cursor:'pointer'}}>📥CSV{(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct)?'（絞込）':''}</button>
              </div>

              {analysisView==='product' && (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                    <thead><tr style={{borderBottom:'2px solid #e2e8f0',background:'#f8fafc'}}>
                      <th style={{padding:'12px 8px',textAlign:'left'}}>商材</th>
                      <th style={{padding:'12px 8px',textAlign:'center'}}>提案</th>
                      <th style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff',whiteSpace:'nowrap'}}>提案率<div style={{fontSize:'10px',fontWeight:'400',color:'#64748b'}}>対訪問</div></th>
                      <th style={{padding:'12px 8px',textAlign:'center'}}>契約</th>
                      <th style={{padding:'12px 8px',textAlign:'center',background:'#dcfce7'}}>成約率</th>
                      <th style={{padding:'12px 8px',textAlign:'center'}}>トスアップ</th>
                      <th style={{padding:'12px 8px',textAlign:'center',background:'#dbeafe'}}>トスアップ率</th>
                      <th style={{padding:'12px 8px',textAlign:'center'}}>NG</th>
                    </tr></thead>
                    <tbody>
                      {/* PC提案（母数は訪問のみ） */}
                      <tr style={{borderBottom:'1px solid #f1f5f9',background:'#fafafa'}}>
                        <td style={{padding:'12px 8px'}}><span style={{padding:'4px 10px',borderRadius:'6px',background:'#64748b15',color:'#475569',fontWeight:'600'}}>💻 PC</span></td>
                        <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'600',cursor:stats.pcStats.proposed>0?'pointer':'default',textDecoration:stats.pcStats.proposed>0?'underline':'none'}} onClick={()=>stats.pcStats.proposed>0&&setDetailModal({title:'PC提案あり',records:stats.pcStats.proposedRecords})}>{stats.pcStats.proposed}</td>
                        <td style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff',fontWeight:'700',color:rateColor(stats.pcStats.targetVisits>0?stats.pcStats.rate:null)}}>{stats.pcStats.targetVisits>0?`${stats.pcStats.rate}%`:'\u2013'}</td>
                        <td colSpan={5} style={{padding:'12px 8px',textAlign:'center',color:'#94a3b8',fontSize:'11px'}}>提案有無のみ記録（母数は訪問{stats.pcStats.targetVisits}件）</td>
                      </tr>
                      {stats.productStats.map(p=>{
                        const proposedRecords = baseFilteredRecords.filter(r => r[`proposal_${p.id}`] === '○');
                        const contractRecords = baseFilteredRecords.filter(r => r[`result_${p.id}`] === '契約');
                        const tossupRecords = baseFilteredRecords.filter(r => r[`result_${p.id}`] === 'トスアップ');
                        const ngRecords = baseFilteredRecords.filter(r => r[`result_${p.id}`] === 'NG');
                        return (
                        <tr key={p.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                          <td style={{padding:'12px 8px'}}><span style={{padding:'4px 10px',borderRadius:'6px',background:`${p.color}15`,color:p.color,fontWeight:'600'}}>{p.name}</span></td>
                          <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'600',cursor:p.proposed>0?'pointer':'default',textDecoration:p.proposed>0?'underline':'none'}} onClick={()=>p.proposed>0&&setDetailModal({title:`${p.name} 提案`,records:proposedRecords})}>{p.proposed}</td>
                          <td style={{padding:'12px 8px',textAlign:'center',background:'#eff6ff',fontWeight:'700',color:'#2563eb'}}>{p.proposalRate}%</td>
                          <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'600',color:'#059669',cursor:p.contracts>0?'pointer':'default',textDecoration:p.contracts>0?'underline':'none'}} onClick={()=>p.contracts>0&&setDetailModal({title:`${p.name} 契約`,records:contractRecords})}>{p.contracts}</td>
                          <td style={{padding:'12px 8px',textAlign:'center',background:'#dcfce7',fontWeight:'700',color:'#059669'}}>{p.contractRate}%</td>
                          <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'600',color:'#1e40af',cursor:p.tossups>0?'pointer':'default',textDecoration:p.tossups>0?'underline':'none'}} onClick={()=>p.tossups>0&&setDetailModal({title:`${p.name} トスアップ`,records:tossupRecords})}>{p.tossups}</td>
                          <td style={{padding:'12px 8px',textAlign:'center',background:'#dbeafe',fontWeight:'700',color:'#1e40af'}}>{p.tossupRate}%</td>
                          <td style={{padding:'12px 8px',textAlign:'center',color:'#dc2626',cursor:p.ngs>0?'pointer':'default',textDecoration:p.ngs>0?'underline':'none'}} onClick={()=>p.ngs>0&&setDetailModal({title:`${p.name} NG`,records:ngRecords})}>{p.ngs}</td>
                        </tr>
                      );})}
                      {/* 合計行 */}
                      {(() => {
                        const totalProposed = stats.productStats.reduce((sum, p) => sum + p.proposed, 0);
                        const totalContracts = stats.productStats.reduce((sum, p) => sum + p.contracts, 0);
                        const totalTossups = stats.productStats.reduce((sum, p) => sum + p.tossups, 0);
                        const totalNgs = stats.productStats.reduce((sum, p) => sum + p.ngs, 0);
                        const avgProposalRate = stats.totalVisits > 0 ? (totalProposed / (stats.totalVisits * stats.productStats.length) * 100).toFixed(1) : '0';
                        const avgContractRate = totalProposed > 0 ? (totalContracts / totalProposed * 100).toFixed(1) : '0';
                        const avgTossupRate = totalProposed > 0 ? (totalTossups / totalProposed * 100).toFixed(1) : '0';
                        const allProposedRecords = baseFilteredRecords.filter(r => ALL_PRODUCTS.some(p => r[`proposal_${p.id}`] === '○'));
                        const allContractRecords = baseFilteredRecords.filter(r => ALL_PRODUCTS.some(p => r[`result_${p.id}`] === '契約'));
                        const allTossupRecords = baseFilteredRecords.filter(r => ALL_PRODUCTS.some(p => r[`result_${p.id}`] === 'トスアップ'));
                        const allNgRecords = baseFilteredRecords.filter(r => ALL_PRODUCTS.some(p => r[`result_${p.id}`] === 'NG'));
                        return (
                          <tr style={{borderTop:'2px solid #1e293b',background:'#1e293b',color:'#fff'}}>
                            <td style={{padding:'12px 8px',fontWeight:'700'}}>合計</td>
                            <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700',cursor:totalProposed>0?'pointer':'default',textDecoration:totalProposed>0?'underline':'none'}} onClick={()=>totalProposed>0&&setDetailModal({title:'全商材 提案',records:allProposedRecords})}>{totalProposed}</td>
                            <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700'}}>{avgProposalRate}%</td>
                            <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700',cursor:totalContracts>0?'pointer':'default',textDecoration:totalContracts>0?'underline':'none'}} onClick={()=>totalContracts>0&&setDetailModal({title:'全商材 契約',records:allContractRecords})}>{totalContracts}</td>
                            <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700'}}>{avgContractRate}%</td>
                            <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700',cursor:totalTossups>0?'pointer':'default',textDecoration:totalTossups>0?'underline':'none'}} onClick={()=>totalTossups>0&&setDetailModal({title:'全商材 トスアップ',records:allTossupRecords})}>{totalTossups}</td>
                            <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700'}}>{avgTossupRate}%</td>
                            <td style={{padding:'12px 8px',textAlign:'center',fontWeight:'700',cursor:totalNgs>0?'pointer':'default',textDecoration:totalNgs>0?'underline':'none'}} onClick={()=>totalNgs>0&&setDetailModal({title:'全商材 NG',records:allNgRecords})}>{totalNgs}</td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                  <div style={{marginTop:'8px',fontSize:'11px',color:'#94a3b8'}}>
                    ※ 提案率は全訪問に対する割合です。💻PCのみ「訪問」した記録が母数（遠隔は対象外）。成約率・トスアップ率は提案数に対する割合です。
                  </div>
                </div>
              )}

              {analysisView==='staff' && renderGroupTable(stats.staffStats, '担当者', 'staff')}

              {analysisView==='office' && renderGroupTable(stats.officeStats, '事務所', 'office')}
            </div>

            {/* NG理由集計 */}
            {stats.ngStatsByProduct.length > 0 && (
              <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                  <h3 style={{margin:0,fontSize:'14px',fontWeight:'600'}}>❌ NG理由（商材別・件数順）</h3>
                  <button onClick={()=>setShowAllNgReasons(!showAllNgReasons)} style={{padding:'6px 12px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:'6px',fontSize:'12px',color:'#64748b',cursor:'pointer'}}>
                    {showAllNgReasons ? '▲ 閉じる' : '▼ すべて表示'}
                  </button>
                </div>
                {stats.ngStatsByProduct.map(({ product, ngCounts }) => {
                  const sortedNgCounts = [...ngCounts].sort((a,b) => b.count - a.count);
                  const topItem = sortedNgCounts[0];
                  const restItems = sortedNgCounts.slice(1);
                  if (!topItem) return null;
                  return (
                    <div key={product.id} style={{marginBottom:'10px'}}>
                      <div style={{fontSize:'13px',fontWeight:'600',color:product.color,marginBottom:'6px'}}>{product.name}</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                        <span style={{padding:'4px 10px',background:'#fecaca',color:'#991b1b',borderRadius:'8px',fontSize:'12px',fontWeight:'600',border:'1px solid #f87171'}}>
                          🥇 {topItem.reason} <strong>{topItem.count}</strong>
                        </span>
                        {showAllNgReasons && restItems.map((n, idx) => (
                          <span key={n.reason} style={{padding:'4px 10px',background:'#fee2e2',color:'#991b1b',borderRadius:'8px',fontSize:'12px'}}>
                            {idx === 0 ? '🥈' : idx === 1 ? '🥉' : ''} {n.reason} <strong>{n.count}</strong>
                          </span>
                        ))}
                        {!showAllNgReasons && restItems.length > 0 && (
                          <span style={{padding:'4px 10px',background:'#f1f5f9',color:'#64748b',borderRadius:'8px',fontSize:'12px'}}>
                            +{restItems.length}件
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========== 記録タブ ========== */}
        {activeTab === 'records' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
              <h2 style={{fontSize:'16px',fontWeight:'600',margin:0}}>訪問記録 ({records.length}件)</h2>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={exportCSV} style={{background:(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct)?'#059669':'#fff',color:(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct)?'#fff':'#059669',border:'1px solid #059669',borderRadius:'6px',padding:'8px 14px',fontSize:'13px',cursor:'pointer'}}>📥CSV{(filterDateFrom || filterDateTo || filterStaff || filterOffice || filterProduct)?`（${filteredRecords.length}件）`:''}</button>
                <button onClick={()=>{setFormData(getEmptyForm());setEditingId(null);setShowForm(true);setShowOtherInput({});}} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:'6px',padding:'8px 14px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>＋新規</button>
              </div>
            </div>

            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',overflow:'hidden'}}>
              {records.length===0 ? (
                <p style={{textAlign:'center',padding:'40px',color:'#94a3b8'}}>データがありません</p>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:'800px'}}>
                    <thead>
                      <tr style={{background:'#f8fafc'}}>
                        {['日付','担当','企業名','事務所','タイミング','ID/メール','提案','結果','報酬','操作'].map(h=>
                          <th key={h} style={{padding:'14px 10px',textAlign:'left',fontWeight:'600',color:'#64748b'}}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r=>(
                        <tr key={r.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                          <td style={{padding:'14px 10px',color:'#64748b'}}>{r.visit_date}</td>
                          <td style={{padding:'14px 10px',fontWeight:'500'}}>{r.staff}</td>
                          <td style={{padding:'14px 10px',fontWeight:'500'}}>{r.company}</td>
                          <td style={{padding:'14px 10px'}}><span style={{padding:'4px 10px',background:'#eff6ff',color:'#2563eb',borderRadius:'6px',fontSize:'12px'}}>{r.office}</span></td>
                          <td style={{padding:'14px 10px'}}>{r.timing&&<span style={{padding:'4px 8px',background:'#f3f4f6',color:'#374151',borderRadius:'6px',fontSize:'11px'}}>{r.timing}</span>}</td>
                          <td style={{padding:'14px 10px'}}>
                            <div>{(r.raksul_id_status==='提案⇒開設'||r.raksul_id_status==='開設済'||r.raksul_id_status==='開設済みだった')&&<span style={{padding:'4px 8px',background:(r.raksul_id_status==='提案⇒開設'||r.raksul_id_status==='開設済')?'#dcfce7':'#f3f4f6',color:(r.raksul_id_status==='提案⇒開設'||r.raksul_id_status==='開設済')?'#166534':'#64748b',borderRadius:'6px',fontSize:'11px'}}>{(r.raksul_id_status==='提案⇒開設'||r.raksul_id_status==='開設済')?'開設🎉':'既存'}</span>}</div>
                            {r.raksul_email&&<div style={{fontSize:'11px',color:'#64748b',marginTop:'4px',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.raksul_email}</div>}
                          </td>
                          <td style={{padding:'14px 10px'}}>
                            <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                              {ALL_PRODUCTS.filter(p=>r[`proposal_${p.id}`]==='○').map(p=>
                                <span key={p.id} style={{padding:'3px 8px',background:`${p.color}20`,color:p.color,borderRadius:'4px',fontSize:'11px'}}>{p.name}</span>
                              )}
                            </div>
                          </td>
                          <td style={{padding:'14px 10px'}}>
                            <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                              {ALL_PRODUCTS.filter(p=>r[`result_${p.id}`]&&r[`result_${p.id}`]!=='-'&&r[`result_${p.id}`]!=='未提案').map(p=>{
                                const result=r[`result_${p.id}`];
                                const colors=RESULT_COLORS[result]||{bg:'#f3f4f6',text:'#374151'};
                                return <span key={p.id} style={{padding:'3px 8px',background:colors.bg,color:colors.text,borderRadius:'4px',fontSize:'11px'}}>{p.name}:{result}</span>;
                              })}
                            </div>
                          </td>
                          <td style={{padding:'14px 10px',color:'#059669',fontWeight:'700',fontSize:'15px'}}>¥{calcIncentive(r).toLocaleString()}</td>
                          <td style={{padding:'14px 10px'}}>
                            <button onClick={()=>handleEdit(r)} style={{background:'#eff6ff',border:'none',borderRadius:'6px',padding:'8px 12px',cursor:'pointer',marginRight:'6px',fontSize:'12px'}}>✏️</button>
                            <button onClick={()=>handleDelete(r.id)} style={{background:'#fef2f2',border:'none',borderRadius:'6px',padding:'8px 12px',cursor:'pointer',fontSize:'12px'}}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== 商材タブ ========== */}
        {activeTab === 'products' && (
          <div>
            <div style={{background:'#fff',borderRadius:'12px',padding:'16px',marginBottom:'16px',border:'1px solid #e2e8f0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px',marginBottom:'14px'}}>
                <h3 style={{margin:0,fontSize:'15px',fontWeight:'600'}}>📚営業資料</h3>
                <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" style={{padding:'8px 16px',borderRadius:'6px',background:'#059669',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>📝申込報告</a>
              </div>
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'10px'}}>
                <a href={MEO_DOC_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'#7C3AED',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>📍MEO資料</a>
                <a href={PAY_DOC_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'#059669',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>💳ラクスルPay</a>
                <a href={POSTING_DOC_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'#ea580c',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>📮ポスティング</a>
                <a href={ORIKOM_DOC_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'#0284c7',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>📰新聞折込</a>
                <a href={MEO_SCHEDULE_URL} target="_blank" rel="noopener noreferrer" style={{padding:'10px 16px',borderRadius:'8px',background:'#0ea5e9',color:'#fff',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>📅 MEO商談可能スケジュール</a>
              </div>
              <div style={{marginBottom:'16px'}}>
                <div style={{fontSize:'12px',color:'#64748b',marginBottom:'6px'}}>📍 MEO提案 参考事例</div>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <a href="https://bullet-golf--kijqxhy.gamma.site/" target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#f3e8ff',color:'#7c3aed',fontSize:'12px',fontWeight:'500',textDecoration:'none',border:'1px solid #e9d5ff'}}>事例①ゴルフ場</a>
                  <a href="https://tame-lion-3uuhlde.gamma.site/" target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#f3e8ff',color:'#7c3aed',fontSize:'12px',fontWeight:'500',textDecoration:'none',border:'1px solid #e9d5ff'}}>事例②</a>
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                <div style={{fontSize:'12px',color:'#64748b',marginBottom:'6px'}}>🎬 MEO提案 動画資料</div>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <a href="https://drive.google.com/file/d/1R3P3DpAELwqnZH4oi3i77CrLPM7_RkXk/preview" target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',fontSize:'12px',fontWeight:'600',textDecoration:'none',border:'2px solid #7c3aed'}}>⭐ トスアップ商談</a>
                  <a href="https://drive.google.com/file/d/1KhMfd8E-8Jab1MeogEIR6SF30Od5fNsh/preview" target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#fef3c7',color:'#92400e',fontSize:'12px',fontWeight:'500',textDecoration:'none',border:'1px solid #fde68a'}}>🎬 HPセット販売</a>
                  <a href="https://drive.google.com/file/d/18YqR-2-6x4eSFmG7mat_uvQTWOhw_Ivw/preview" target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#fef3c7',color:'#92400e',fontSize:'12px',fontWeight:'500',textDecoration:'none',border:'1px solid #fde68a'}}>🎬 不動産事例</a>
                  <a href="https://drive.google.com/file/d/1wR77lpmFr2apHUnVFRuLnNuVE--8fdsH/preview" target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#fef3c7',color:'#92400e',fontSize:'12px',fontWeight:'500',textDecoration:'none',border:'1px solid #fde68a'}}>🎬 塾事例</a>
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                <div style={{fontSize:'12px',color:'#64748b',marginBottom:'6px'}}>🎬 出張動画撮影</div>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <a href={VIDEO_ORDER_URL} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#dc2626',color:'#fff',fontSize:'12px',fontWeight:'600',textDecoration:'none'}}>📝 動画撮影 入力シート</a>
                  <a href={VIDEO_CUSTOMER_URL} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#059669',color:'#fff',fontSize:'12px',fontWeight:'600',textDecoration:'none'}}>🎟️ お客様用申込フォーム</a>
                  <a href={VIDEO_SHEET_URL} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:'6px',background:'#0ea5e9',color:'#fff',fontSize:'12px',fontWeight:'600',textDecoration:'none'}}>📊 案件進捗シート</a>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'10px'}}>
                <div style={{padding:'12px',background:'#eff6ff',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'11px',color:'#64748b'}}>ID開設</div><div style={{fontSize:'20px',fontWeight:'700',color:'#6366f1'}}>¥3,000</div></div>
                <div style={{padding:'12px',background:'#fef3c7',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'11px',color:'#64748b'}}>モール購入</div><div style={{fontSize:'20px',fontWeight:'700',color:'#d97706'}}>¥7,000</div></div>
                <div style={{padding:'12px',background:'#dcfce7',borderRadius:'8px',textAlign:'center'}}><div style={{fontSize:'11px',color:'#64748b'}}>その他契約</div><div style={{fontSize:'20px',fontWeight:'700',color:'#059669'}}>¥10,000</div></div>
              </div>
              <div style={{marginTop:'8px',fontSize:'11px',color:'#94a3b8',textAlign:'right'}}>※インセンティブは仮の為、変更される場合があります</div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'12px'}}>
              {PRODUCT_DETAILS.filter(p=>p.active!==false).map(product=>(
                <div key={product.id} onClick={()=>setSelectedProduct(product)} style={{background:'#fff',borderRadius:'12px',border:product.restricted?'2px solid #fca5a5':'1px solid #e2e8f0',overflow:'hidden',cursor:'pointer',position:'relative'}}>
                  {product.restricted && <div style={{background:'#dc2626',color:'#fff',fontSize:'11px',fontWeight:'600',padding:'4px 12px',textAlign:'center'}}>⚠️ 営業案内不可（紹介のみ）</div>}
                  <div style={{background:`linear-gradient(135deg,${product.color},${product.color}dd)`,padding:'14px',color:'#fff',opacity:product.restricted?0.7:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <span style={{fontSize:'28px'}}>{product.icon}</span>
                      <div>
                        <div style={{fontSize:'16px',fontWeight:'700'}}>{product.name}</div>
                        <div style={{fontSize:'11px',opacity:0.9}}>{product.tagline}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{padding:'14px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'10px'}}>
                      {product.features.slice(0,4).map((f,i)=>
                        <div key={i} style={{padding:'8px',background:f.highlight?`${product.color}10`:'#f8fafc',borderRadius:'6px',textAlign:'center'}}>
                          <div style={{fontSize:'10px',color:'#64748b'}}>{f.label}</div>
                          <div style={{fontSize:'14px',fontWeight:'700',color:f.highlight?product.color:'#1e293b'}}>{f.value}</div>
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{padding:'4px 10px',background:'#dcfce7',color:'#059669',borderRadius:'8px',fontSize:'12px',fontWeight:'600'}}>{product.incentive}</span>
                      <span style={{fontSize:'12px',color:'#3b82f6'}}>詳細→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== マニュアルタブ ========== */}
        {activeTab === 'manual' && (
          <div style={{display:'grid',gap:'16px'}}>
            {/* セクション選択ボタン */}
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {MANUAL_SECTIONS.map(s => (
                <button key={s.id} onClick={() => setManualSection(s.id)} style={{padding:'8px 14px',borderRadius:'8px',border:manualSection===s.id?'none':'1px solid #e2e8f0',background:manualSection===s.id?'#2563eb':'#fff',color:manualSection===s.id?'#fff':'#64748b',fontSize:'13px',cursor:'pointer'}}>{s.title}</button>
              ))}
            </div>
            
            {/* マニュアル内容 */}
            <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'24px'}}>
              {MANUAL_SECTIONS.filter(s => s.id === manualSection).map(section => (
                <div key={section.id}>
                  <h2 style={{margin:'0 0 24px 0',fontSize:'20px',fontWeight:'700',color:'#1e293b',borderBottom:'2px solid #2563eb',paddingBottom:'12px'}}>{section.title}</h2>
                  
                  {section.sections && section.sections.map((sub, idx) => (
                    <div key={idx} style={{marginBottom:'24px'}}>
                      <h3 style={{margin:'0 0 12px 0',fontSize:'15px',fontWeight:'600',color:'#374151',display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{width:'6px',height:'6px',background:'#2563eb',borderRadius:'50%'}}></span>
                        {sub.subtitle}
                      </h3>
                      <div style={{paddingLeft:'14px'}}>
                        {sub.items.map((item, i) => {
                          // 空行
                          if (item === '') return <div key={i} style={{height:'8px'}}></div>;
                          // Q&A形式
                          if (item.startsWith('Q:')) return <div key={i} style={{fontWeight:'600',color:'#1e293b',marginTop:'12px',fontSize:'14px'}}>{item}</div>;
                          if (item.startsWith('A:')) return <div key={i} style={{color:'#475569',marginBottom:'8px',paddingLeft:'16px',fontSize:'14px'}}>{item}</div>;
                          // 番号付き手順
                          if (/^[①-⑪]/.test(item)) return <div key={i} style={{padding:'8px 12px',background:'#f8fafc',borderRadius:'6px',marginBottom:'6px',fontSize:'14px',color:'#374151'}}>{item}</div>;
                          // 通常のリストアイテム
                          return <div key={i} style={{padding:'6px 0',fontSize:'14px',color:'#475569',display:'flex',alignItems:'flex-start',gap:'8px'}}>
                            <span style={{color:'#94a3b8',marginTop:'2px'}}>•</span>
                            <span>{item}</span>
                          </div>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {/* バージョン情報 */}
              <div style={{marginTop:'32px',padding:'16px',background:'linear-gradient(135deg,#f8fafc,#eff6ff)',borderRadius:'10px',border:'1px solid #e2e8f0'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'12px',color:'#64748b'}}>アプリバージョン</div>
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#2563eb'}}>v{APP_VERSION}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'12px',color:'#64748b'}}>最終更新</div>
                    <div style={{fontSize:'14px',fontWeight:'500',color:'#374151'}}>{LAST_UPDATED}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========== 入力フォームモーダル ========== */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',zIndex:200}}>
          <div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'500px',maxHeight:'90vh',overflow:'auto'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{margin:0,fontSize:'16px'}}>{editingId?'📝編集':'➕新規登録'}</h3>
              <button onClick={()=>{setShowForm(false);setEditingId(null);setFormData(getEmptyForm());setShowOtherInput({});}} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'#64748b'}}>×</button>
            </div>
            
            <div style={{padding:'16px 20px',display:'grid',gap:'14px'}}>
              {/* 訪問日・担当者 */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>訪問日</label>
                  <input type="date" value={formData.visit_date} onChange={e=>setFormData({...formData,visit_date:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>担当者 *</label>
                  <select value={formData.staff} onChange={e=>setFormData({...formData,staff:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff'}}>
                    <option value="">選択</option>
                    {STAFF_LIST.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* 企業名 */}
              <div>
                <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>企業名 *</label>
                <input value={formData.company} onChange={e=>setFormData({...formData,company:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}/>
              </div>

              {/* 業種・事務所 */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>業種</label>
                  <select value={formData.industry} onChange={e=>setFormData({...formData,industry:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff'}}>
                    <option value="">選択</option>
                    {INDUSTRY_LIST.map(i=><option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>事務所 *</label>
                  <select value={formData.office} onChange={e=>setFormData({...formData,office:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',background:'#fff'}}>
                    <option value="">選択</option>
                    {OFFICE_LIST.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* 営業先種別 */}
              <div>
                <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>営業先</label>
                <div style={{display:'flex',gap:'10px'}}>
                  {['直販', 'ラクスルリスト'].map(source => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => setFormData({...formData, sales_source: formData.sales_source === source ? '' : source, sales_area: source !== 'ラクスルリスト' ? '' : formData.sales_area})}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: formData.sales_source === source ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        background: formData.sales_source === source ? '#eff6ff' : '#fff',
                        color: formData.sales_source === source ? '#2563eb' : '#64748b',
                        fontSize: '14px',
                        fontWeight: formData.sales_source === source ? '600' : '400',
                        cursor: 'pointer'
                      }}
                    >
                      {source === '直販' ? '🏢 直販' : '📋 ラクスルリスト'}
                    </button>
                  ))}
                </div>
                {/* ラクスルリスト選択時のエリア選択 */}
                {formData.sales_source === 'ラクスルリスト' && (
                  <div style={{marginTop:'10px',paddingLeft:'16px',borderLeft:'3px solid #2563eb'}}>
                    <div style={{fontSize:'12px',color:'#64748b',marginBottom:'6px'}}>エリア選択<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></div>
                    <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                      {['沖縄', '四国', '中国', '関西'].map(area => (
                        <button 
                          key={area}
                          type="button" 
                          onClick={()=>setFormData({...formData,sales_area:formData.sales_area===area?'':area})} 
                          style={{padding:'8px 16px',borderRadius:'6px',border:formData.sales_area===area?'2px solid #2563eb':'1px solid #e2e8f0',background:formData.sales_area===area?'#eff6ff':'#fff',color:formData.sales_area===area?'#2563eb':'#64748b',fontSize:'12px',fontWeight:formData.sales_area===area?'600':'400',cursor:'pointer'}}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 商談方法 */}
              <div>
                <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>商談方法</label>
                <div style={{display:'flex',gap:'10px'}}>
                  {['訪問', '遠隔'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({...formData, sales_method: formData.sales_method === method ? '' : method})}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: formData.sales_method === method ? '2px solid #059669' : '1px solid #e2e8f0',
                        background: formData.sales_method === method ? '#ecfdf5' : '#fff',
                        color: formData.sales_method === method ? '#059669' : '#64748b',
                        fontSize: '14px',
                        fontWeight: formData.sales_method === method ? '600' : '400',
                        cursor: 'pointer'
                      }}
                    >
                      {method === '訪問' ? '🚗 訪問' : '💻 遠隔'}
                    </button>
                  ))}
                </div>
                {/* 訪問時のPC提案 */}
                {formData.sales_method === '訪問' && (
                  <div style={{marginTop:'10px',paddingLeft:'16px',borderLeft:!formData.pc_proposal?'3px solid #dc2626':'3px solid #059669',background:!formData.pc_proposal?'#fef2f2':'transparent',padding:!formData.pc_proposal?'10px 10px 10px 16px':'0 0 0 16px',borderRadius:!formData.pc_proposal?'0 8px 8px 0':'0'}}>
                    <div style={{fontSize:'12px',color:!formData.pc_proposal?'#dc2626':'#64748b',marginBottom:'6px'}}>💻 PC提案<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></div>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button type="button" onClick={()=>setFormData({...formData,pc_proposal:'提案した',pc_not_proposed_reason:''})} style={{padding:'8px 16px',borderRadius:'6px',border:formData.pc_proposal==='提案した'?'2px solid #059669':'1px solid #e2e8f0',background:formData.pc_proposal==='提案した'?'#dcfce7':'#fff',color:formData.pc_proposal==='提案した'?'#059669':'#64748b',fontSize:'12px',fontWeight:formData.pc_proposal==='提案した'?'600':'400',cursor:'pointer'}}>✓ 提案した</button>
                      <button type="button" onClick={()=>{setFormData({...formData,pc_proposal:'提案しなかった',pc_result:'',pc_devices:'',pc_units:'',pc_ng_reason:''});setShowPcNgOther(false);}} style={{padding:'8px 16px',borderRadius:'6px',border:formData.pc_proposal==='提案しなかった'?'2px solid #f59e0b':'1px solid #e2e8f0',background:formData.pc_proposal==='提案しなかった'?'#fef3c7':'#fff',color:formData.pc_proposal==='提案しなかった'?'#b45309':'#64748b',fontSize:'12px',fontWeight:formData.pc_proposal==='提案しなかった'?'600':'400',cursor:'pointer'}}>✗ 提案しなかった</button>
                    </div>
                    {/* 提案した場合：受注 / NG */}
                    {formData.pc_proposal === '提案した' && (
                      <div style={{marginTop:'10px',padding:'12px',background:'#fff',borderRadius:'8px',border:'2px solid #059669'}}>
                        <div style={{fontSize:'12px',color:'#059669',fontWeight:'700',marginBottom:'8px'}}>提案の結果<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></div>
                        <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
                          <button type="button" onClick={()=>{setFormData({...formData,pc_result:'受注',pc_ng_reason:''});setShowPcNgOther(false);}} style={{flex:1,padding:'10px',borderRadius:'6px',border:formData.pc_result==='受注'?'2px solid #059669':'1px solid #e2e8f0',background:formData.pc_result==='受注'?'#dcfce7':'#fff',color:formData.pc_result==='受注'?'#059669':'#64748b',fontSize:'13px',fontWeight:formData.pc_result==='受注'?'700':'400',cursor:'pointer'}}>🎉 受注</button>
                          <button type="button" onClick={()=>setFormData({...formData,pc_result:'NG',pc_devices:'',pc_units:''})} style={{flex:1,padding:'10px',borderRadius:'6px',border:formData.pc_result==='NG'?'2px solid #dc2626':'1px solid #e2e8f0',background:formData.pc_result==='NG'?'#fee2e2':'#fff',color:formData.pc_result==='NG'?'#991b1b':'#64748b',fontSize:'13px',fontWeight:formData.pc_result==='NG'?'700':'400',cursor:'pointer'}}>✗ NG</button>
                        </div>

                        {/* 受注：機種＋台数 */}
                        {formData.pc_result === '受注' && (
                          <div style={{padding:'10px',background:'#f0fdf4',borderRadius:'6px'}}>
                            <div style={{fontSize:'11px',color:'#166534',fontWeight:'600',marginBottom:'6px'}}>機種（複数選択可）<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'10px'}}>
                              {PC_DEVICE_LIST.map(d=>{
                                const selected = (formData.pc_devices || '').split(',').filter(Boolean).includes(d);
                                return (
                                  <button key={d} type="button" onClick={()=>{
                                    const cur = (formData.pc_devices || '').split(',').filter(Boolean);
                                    const next = selected ? cur.filter(x=>x!==d) : [...cur, d];
                                    setFormData({...formData, pc_devices: PC_DEVICE_LIST.filter(x=>next.includes(x)).join(',')});
                                  }} style={{padding:'8px 16px',borderRadius:'6px',border:selected?'2px solid #059669':'1px solid #e2e8f0',background:selected?'#dcfce7':'#fff',color:selected?'#059669':'#64748b',fontSize:'12px',fontWeight:selected?'600':'400',cursor:'pointer'}}>{selected?'✓ ':''}{d}</button>
                                );
                              })}
                            </div>
                            <div style={{fontSize:'11px',color:'#166534',fontWeight:'600',marginBottom:'6px'}}>台数<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                              {PC_UNIT_RANGES.map(u=>(
                                <button key={u} type="button" onClick={()=>setFormData({...formData,pc_units:formData.pc_units===u?'':u})} style={{padding:'8px 16px',borderRadius:'6px',border:formData.pc_units===u?'2px solid #059669':'1px solid #e2e8f0',background:formData.pc_units===u?'#dcfce7':'#fff',color:formData.pc_units===u?'#059669':'#64748b',fontSize:'12px',fontWeight:formData.pc_units===u?'600':'400',cursor:'pointer'}}>{u}</button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* NG：理由 */}
                        {formData.pc_result === 'NG' && (
                          <div style={{padding:'10px',background:'#fef2f2',borderRadius:'6px'}}>
                            <div style={{fontSize:'11px',color:'#991b1b',fontWeight:'600',marginBottom:'6px'}}>NG理由<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                              {PC_NG_REASONS.map(reason=>{
                                const selected = reason === 'その他' ? showPcNgOther : (!showPcNgOther && formData.pc_ng_reason === reason);
                                return (
                                  <button key={reason} type="button" onClick={()=>{
                                    if (reason === 'その他') { setShowPcNgOther(true); setFormData({...formData, pc_ng_reason:''}); }
                                    else { setShowPcNgOther(false); setFormData({...formData, pc_ng_reason:reason}); }
                                  }} style={{padding:'8px 12px',borderRadius:'6px',border:selected?'2px solid #dc2626':'1px solid #e2e8f0',background:selected?'#fee2e2':'#fff',color:selected?'#991b1b':'#64748b',fontSize:'12px',fontWeight:selected?'600':'400',cursor:'pointer'}}>{reason}</button>
                                );
                              })}
                            </div>
                            {showPcNgOther && (
                              <input type="text" placeholder="NG理由を具体的に入力 *必須" value={formData.pc_ng_reason || ''} onChange={e=>setFormData({...formData,pc_ng_reason:e.target.value})} style={{width:'100%',marginTop:'8px',padding:'10px',borderRadius:'6px',border:'1px solid #e2e8f0',fontSize:'13px',boxSizing:'border-box'}} />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {formData.pc_proposal === '提案しなかった' && (
                      <div style={{marginTop:'8px'}}>
                        <input type="text" placeholder="提案しなかった理由を入力" value={formData.pc_not_proposed_reason} onChange={e=>setFormData({...formData,pc_not_proposed_reason:e.target.value})} style={{width:'100%',padding:'10px',borderRadius:'6px',border:'2px solid #f59e0b',fontSize:'13px',boxSizing:'border-box',background:'#fffbeb'}} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 顧客種別 */}
              <div style={{background:'linear-gradient(135deg,#6366f115,#818cf815)',padding:'16px',borderRadius:'12px',border:'2px solid #6366f1'}}>
                <label style={{fontSize:'14px',color:'#4f46e5',fontWeight:'700',display:'block',marginBottom:'10px'}}>🆔 顧客種別・ラクスルID<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></label>
                <div style={{display:'flex',gap:'10px',marginBottom:'12px'}}>
                  <button type="button" onClick={()=>setFormData({...formData,customer_type:'新規',raksul_id_status:'-',existing_raksul_id:''})} style={{flex:1,padding:'14px',borderRadius:'8px',border:formData.customer_type==='新規'?'2px solid #059669':'1px solid #e2e8f0',background:formData.customer_type==='新規'?'#dcfce7':'#fff',color:formData.customer_type==='新規'?'#059669':'#64748b',fontSize:'14px',fontWeight:formData.customer_type==='新規'?'700':'400',cursor:'pointer'}}>🆕 新規ユーザー</button>
                  <button type="button" onClick={()=>setFormData({...formData,customer_type:'既存',raksul_id_status:'-',raksul_email:''})} style={{flex:1,padding:'14px',borderRadius:'8px',border:formData.customer_type==='既存'?'2px solid #2563eb':'1px solid #e2e8f0',background:formData.customer_type==='既存'?'#eff6ff':'#fff',color:formData.customer_type==='既存'?'#2563eb':'#64748b',fontSize:'14px',fontWeight:formData.customer_type==='既存'?'700':'400',cursor:'pointer'}}>📋 既存ユーザー</button>
                </div>
                
                {/* 新規ユーザーの場合：ID登録必須 */}
                {formData.customer_type === '新規' && !idBlocked && (
                  <div style={{padding:'12px',background:'#fff',borderRadius:'8px',border:'1px solid #dcfce7'}}>
                    <div style={{fontSize:'12px',color:'#059669',fontWeight:'600',marginBottom:'8px'}}>⚠️ 新規ユーザーはラクスルID登録が必須です</div>
                    <button type="button" onClick={()=>setFormData({...formData,raksul_id_status:formData.raksul_id_status==='提案⇒開設'?'-':'提案⇒開設'})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:formData.raksul_id_status==='提案⇒開設'?'2px solid #059669':'2px solid #dc2626',background:formData.raksul_id_status==='提案⇒開設'?'#dcfce7':'#fef2f2',color:formData.raksul_id_status==='提案⇒開設'?'#059669':'#dc2626',fontSize:'14px',fontWeight:'700',cursor:'pointer',marginBottom:'10px'}}>{formData.raksul_id_status==='提案⇒開設'?'✓ ID登録完了':'ID登録をタップして確認'}</button>
                    {formData.raksul_id_status === '提案⇒開設' && (
                      <input type="email" placeholder="登録メールアドレス *必須" value={formData.raksul_email} onChange={e=>setFormData({...formData,raksul_email:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}} />
                    )}
                  </div>
                )}
                
                {/* 既存ユーザーの場合：ID確認・記録 */}
                {formData.customer_type === '既存' && !idBlocked && (
                  <div style={{padding:'12px',background:'#fff',borderRadius:'8px',border:'1px solid #dbeafe'}}>
                    <div style={{fontSize:'12px',color:'#2563eb',fontWeight:'600',marginBottom:'8px'}}>📝 ラクスルIDを確認・記録してください</div>
                    <input type="text" placeholder="ラクスルID（メールアドレス）を入力 *必須" value={formData.existing_raksul_id} onChange={e=>setFormData({...formData,existing_raksul_id:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}} />
                  </div>
                )}

                {/* IDを入力できない場合：理由の記載を必須にする */}
                {formData.customer_type && (
                  <div style={{marginTop:'10px'}}>
                    <button
                      type="button"
                      onClick={()=>{
                        const next = !idBlocked;
                        setIdBlocked(next);
                        setShowIdReasonOther(false);
                        setFormData(next
                          ? {...formData, raksul_id_missing_reason:'', raksul_id_status:'-', raksul_email:'', existing_raksul_id:''}
                          : {...formData, raksul_id_missing_reason:''});
                      }}
                      style={{width:'100%',padding:'10px',borderRadius:'8px',border:idBlocked?'1px solid #94a3b8':'1px dashed #dc2626',background:idBlocked?'#f1f5f9':'#fff',color:idBlocked?'#475569':'#dc2626',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}
                    >
                      {idBlocked ? '↩ IDを入力する' : '⚠️ IDを入力できない場合はこちら'}
                    </button>

                    {idBlocked && (
                      <div style={{marginTop:'10px',padding:'12px',background:'#fff',borderRadius:'8px',border:'2px solid #dc2626'}}>
                        <div style={{fontSize:'12px',color:'#dc2626',fontWeight:'700',marginBottom:'8px'}}>入力できない理由を選択<span style={{marginLeft:'4px'}}>*必須</span></div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                          {ID_MISSING_REASONS.map(reason => {
                            const selected = reason === 'その他'
                              ? showIdReasonOther
                              : (!showIdReasonOther && formData.raksul_id_missing_reason === reason);
                            return (
                              <button
                                key={reason}
                                type="button"
                                onClick={()=>{
                                  if (reason === 'その他') { setShowIdReasonOther(true); setFormData({...formData, raksul_id_missing_reason:''}); }
                                  else { setShowIdReasonOther(false); setFormData({...formData, raksul_id_missing_reason:reason}); }
                                }}
                                style={{padding:'8px 12px',borderRadius:'6px',border:selected?'2px solid #dc2626':'1px solid #e2e8f0',background:selected?'#fee2e2':'#fff',color:selected?'#991b1b':'#64748b',fontSize:'12px',fontWeight:selected?'600':'400',cursor:'pointer'}}
                              >
                                {reason}
                              </button>
                            );
                          })}
                        </div>
                        {showIdReasonOther && (
                          <input
                            type="text"
                            placeholder="理由を具体的に入力 *必須"
                            value={formData.raksul_id_missing_reason || ''}
                            onChange={e=>setFormData({...formData, raksul_id_missing_reason:e.target.value})}
                            style={{width:'100%',marginTop:'8px',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 提案タイミング */}
              <div>
                <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'8px'}}>提案タイミング<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></label>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {TIMING_LIST.map(t=>(
                    <button key={t} type="button" onClick={()=>setFormData({...formData,timing:t===formData.timing||formData.timing?.startsWith(t+'（')?'':t})} style={{padding:'10px 20px',borderRadius:'8px',border:(formData.timing===t||formData.timing?.startsWith(t+'（'))?'2px solid #2563eb':'1px solid #e2e8f0',background:(formData.timing===t||formData.timing?.startsWith(t+'（'))?'#eff6ff':'#fff',color:(formData.timing===t||formData.timing?.startsWith(t+'（'))?'#2563eb':'#64748b',fontSize:'13px',fontWeight:(formData.timing===t||formData.timing?.startsWith(t+'（'))?'600':'400',cursor:'pointer'}}>{t}</button>
                  ))}
                </div>
                {/* 営業選択時のサブ選択 */}
                {(formData.timing === '営業' || formData.timing?.startsWith('営業（')) && (
                  <div style={{marginTop:'10px',paddingLeft:'16px',borderLeft:formData.timing==='営業'?'3px solid #dc2626':'3px solid #2563eb',background:formData.timing==='営業'?'#fef2f2':'transparent',padding:formData.timing==='営業'?'10px 10px 10px 16px':'0 0 0 16px',borderRadius:formData.timing==='営業'?'0 8px 8px 0':'0'}}>
                    <div style={{fontSize:'12px',color:formData.timing==='営業'?'#dc2626':'#64748b',marginBottom:'6px'}}>詳細を選択<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span></div>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button type="button" onClick={()=>setFormData({...formData,timing:'営業（受注）'})} style={{padding:'8px 16px',borderRadius:'6px',border:formData.timing==='営業（受注）'?'2px solid #059669':'1px solid #e2e8f0',background:formData.timing==='営業（受注）'?'#dcfce7':'#fff',color:formData.timing==='営業（受注）'?'#059669':'#64748b',fontSize:'12px',fontWeight:formData.timing==='営業（受注）'?'600':'400',cursor:'pointer'}}>受注</button>
                      <button type="button" onClick={()=>setFormData({...formData,timing:'営業（受注以外）'})} style={{padding:'8px 16px',borderRadius:'6px',border:formData.timing==='営業（受注以外）'?'2px solid #f59e0b':'1px solid #e2e8f0',background:formData.timing==='営業（受注以外）'?'#fef3c7':'#fff',color:formData.timing==='営業（受注以外）'?'#b45309':'#64748b',fontSize:'12px',fontWeight:formData.timing==='営業（受注以外）'?'600':'400',cursor:'pointer'}}>受注以外</button>
                    </div>
                  </div>
                )}
              </div>

              {/* 各商材の結果 */}
              <div>
                <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'8px'}}>
                  各商材の結果<span style={{color:'#dc2626',marginLeft:'4px'}}>*必須</span>
                </label>
                <div style={{display:'grid',gap:'12px'}}>
                  {PRODUCTS.map(p=>{
                    const isSelected = formData[`result_${p.id}`] && formData[`result_${p.id}`] !== '-';
                    // 全商材で内諾を無効化、モールはトスアップも無効化、動画もトスアップ無効化、MEOは契約とトスアップ無効化
                    const disabledResults = p.id === 'mall' ? ['内諾', 'トスアップ'] : p.id === 'video' ? ['内諾', 'トスアップ'] : p.id === 'meo' ? ['内諾', '契約'] : ['内諾'];
                    return (
                    <div key={p.id} style={{padding:'14px',background:isSelected?'#f8fafc':'#fef2f2',borderRadius:'10px',border:isSelected?`2px solid ${RESULT_COLORS[formData[`result_${p.id}`]]?.text||p.color}20`:'2px solid #fca5a5'}}>
                      {/* 商材名と結果ボタン */}
                      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px',flexWrap:'wrap'}}>
                        <span style={{fontSize:'14px',color:p.color,fontWeight:'600',minWidth:'70px'}}>{p.name}{!isSelected && <span style={{color:'#dc2626',fontSize:'11px',marginLeft:'4px'}}>未選択</span>}</span>
                        <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                          {RESULT_LIST.filter(r=>r!=='-').map(result=>{
                            const isDisabled = disabledResults.includes(result);
                            // モールの「契約」は「購入」と表示
                            const displayLabel = (p.id === 'mall' && result === '契約') ? '購入' : result;
                            return (
                            <button 
                              key={result} 
                              type="button" 
                              disabled={isDisabled}
                              onClick={()=>{
                                if (isDisabled) return;
                                const newResult = formData[`result_${p.id}`]===result?'-':result;
                                const newProposal = (newResult === '未提案' || newResult === '-') ? '-' : '○';
                                setFormData({...formData,[`result_${p.id}`]:newResult,[`proposal_${p.id}`]:newProposal,[`ng_${p.id}`]:result!=='NG'?'':formData[`ng_${p.id}`]});
                                if(result!=='NG') setShowOtherInput({...showOtherInput,[p.id]:false});
                                // 動画撮影で契約を選択した場合にモーダル表示
                                if(p.id === 'video' && result === '契約' && newResult === '契約') {
                                  setShowVideoOrderModal(true);
                                }
                              }} 
                              style={{
                                padding:'7px 11px',
                                borderRadius:'6px',
                                fontSize:'12px',
                                border: isDisabled ? '1px solid #e5e7eb' : (formData[`result_${p.id}`]===result?`2px solid ${RESULT_COLORS[result]?.text||'#64748b'}`:'1px solid #d1d5db'),
                                background: isDisabled ? '#f3f4f6' : (formData[`result_${p.id}`]===result?RESULT_COLORS[result]?.bg||'#f3f4f6':'#fff'),
                                color: isDisabled ? '#d1d5db' : (formData[`result_${p.id}`]===result?RESULT_COLORS[result]?.text||'#374151':'#64748b'),
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                fontWeight:formData[`result_${p.id}`]===result?'600':'400',
                                position: 'relative'
                              }}
                            >
                              {isDisabled && <span style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'16px',color:'#dc2626'}}>×</span>}
                              <span style={{opacity: isDisabled ? 0.3 : 1}}>{displayLabel}</span>
                            </button>
                          )})}
                        </div>
                      </div>

                      {/* モール：ID開設かつ購入以外の場合の理由入力 */}
                      {p.id === 'mall' && formData.raksul_id_status === '提案⇒開設' && formData.result_mall && formData.result_mall !== '-' && formData.result_mall !== '契約' && (
                        <div style={{marginTop:'10px'}}>
                          <label style={{fontSize:'12px',color:'#991b1b',fontWeight:'600',display:'block',marginBottom:'6px'}}>購入に至らなかった理由 <span style={{color:'#dc2626'}}>*必須</span></label>
                          <input 
                            type="text" 
                            placeholder="理由を入力してください" 
                            value={formData.mall_not_purchased_reason} 
                            onChange={e=>setFormData({...formData,mall_not_purchased_reason:e.target.value})} 
                            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #fca5a5',fontSize:'14px',boxSizing:'border-box',background:'#fef2f2'}}
                          />
                        </div>
                      )}

                      {/* モール：ID未開設かつNGの場合の理由入力 */}
                      {p.id === 'mall' && formData.raksul_id_status === '未開設' && formData.result_mall === 'NG' && (
                        <div style={{marginTop:'10px'}}>
                          <label style={{fontSize:'12px',color:'#991b1b',fontWeight:'600',display:'block',marginBottom:'6px'}}>ID開設できなかった理由は？ <span style={{color:'#dc2626'}}>*必須</span></label>
                          <input 
                            type="text" 
                            placeholder="理由を入力してください" 
                            value={formData.id_not_opened_reason} 
                            onChange={e=>setFormData({...formData,id_not_opened_reason:e.target.value})} 
                            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #fca5a5',fontSize:'14px',boxSizing:'border-box',background:'#fef2f2'}}
                          />
                        </div>
                      )}

                      {/* MEO：トスアップ・NG・検討中・未提案の詳細入力 */}
                      {p.id === 'meo' && ['トスアップ', 'NG', '検討中', '未提案'].includes(formData.result_meo) && (
                        <div style={{marginTop:'10px'}}>
                          <label style={{fontSize:'12px',color:'#7C3AED',fontWeight:'600',display:'block',marginBottom:'6px'}}>
                            {formData.result_meo === 'トスアップ' && '📋 トスアップ詳細'}
                            {formData.result_meo === 'NG' && '❌ NG理由'}
                            {formData.result_meo === '検討中' && '🤔 検討中の詳細'}
                            {formData.result_meo === '未提案' && '📝 未提案の理由'}
                          </label>
                          <input 
                            type="text" 
                            placeholder={
                              formData.result_meo === 'トスアップ' ? 'トスアップの詳細を入力' :
                              formData.result_meo === 'NG' ? 'NG理由を入力' :
                              formData.result_meo === '検討中' ? '検討中の状況を入力' :
                              '未提案の理由を入力'
                            }
                            value={formData.ng_meo || ''} 
                            onChange={e=>setFormData({...formData,ng_meo:e.target.value})} 
                            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #7C3AED',fontSize:'14px',boxSizing:'border-box',background:'#f5f3ff'}}
                          />
                        </div>
                      )}

                      {/* NG理由セレクト（モール・MEO以外） */}
                      {p.id !== 'mall' && p.id !== 'meo' && formData[`result_${p.id}`]==='NG' && (
                        <div style={{marginTop:'10px'}}>
                          <label style={{fontSize:'12px',color:'#991b1b',fontWeight:'500',display:'block',marginBottom:'6px'}}>NG理由を選択</label>
                          <select 
                            value={showOtherInput[p.id] ? 'その他' : (NG_REASONS[p.id].includes(formData[`ng_${p.id}`]) ? formData[`ng_${p.id}`] : '')}
                            onChange={e=>handleNgReasonChange(p.id, e.target.value)} 
                            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'2px solid #fca5a5',fontSize:'14px',background:'#fef2f2'}}
                          >
                            <option value="">-- 選択してください --</option>
                            {NG_REASONS[p.id].map(r=><option key={r} value={r}>{r}</option>)}
                          </select>

                          {/* その他の自由入力 */}
                          {showOtherInput[p.id] && (
                            <input 
                              type="text" 
                              placeholder="NG理由を入力してください" 
                              value={formData[`ng_${p.id}`]} 
                              onChange={e=>setFormData({...formData,[`ng_${p.id}`]:e.target.value})} 
                              style={{width:'100%',marginTop:'8px',padding:'12px',borderRadius:'8px',border:'2px solid #fca5a5',fontSize:'14px',boxSizing:'border-box'}}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label style={{fontSize:'13px',color:'#374151',fontWeight:'500',display:'block',marginBottom:'6px'}}>備考</label>
                <input value={formData.note} onChange={e=>setFormData({...formData,note:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'14px',boxSizing:'border-box'}}/>
              </div>
            </div>

            {/* ボタン */}
            <div style={{padding:'16px 20px',borderTop:'1px solid #e2e8f0',display:'flex',gap:'10px',justifyContent:'flex-end'}}>
              <button onClick={()=>{setShowForm(false);setEditingId(null);setFormData(getEmptyForm());setShowOtherInput({});}} style={{padding:'12px 20px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',cursor:'pointer',fontSize:'14px'}}>キャンセル</button>
              <button onClick={handleSubmit} disabled={saving} style={{padding:'12px 24px',borderRadius:'8px',border:'none',background:saving?'#94a3b8':'#2563eb',color:'#fff',fontWeight:'600',cursor:saving?'not-allowed':'pointer',fontSize:'14px'}}>{saving?'保存中...':editingId?'更新':'登録'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 商材詳細モーダル ========== */}
      {selectedProduct && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',zIndex:200}} onClick={()=>setSelectedProduct(null)}>
          <div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'500px',maxHeight:'90vh',overflow:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{background:`linear-gradient(135deg,${selectedProduct.color},${selectedProduct.color}dd)`,padding:'20px',color:'#fff'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{fontSize:'36px'}}>{selectedProduct.icon}</span>
                  <div>
                    <div style={{fontSize:'20px',fontWeight:'700'}}>{selectedProduct.name}</div>
                    <div style={{fontSize:'13px',opacity:0.9}}>{selectedProduct.tagline}</div>
                  </div>
                </div>
                <button onClick={()=>setSelectedProduct(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'16px'}}>×</button>
              </div>
            </div>
            <div style={{padding:'20px'}}>
              {selectedProduct.restricted && (
                <div style={{padding:'12px',background:'#fef2f2',border:'2px solid #fca5a5',borderRadius:'10px',marginBottom:'16px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{fontSize:'20px'}}>⚠️</span>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:'700',color:'#dc2626'}}>営業案内不可</div>
                    <div style={{fontSize:'12px',color:'#991b1b'}}>金融商品のため、積極的な営業はできません。お客様からの問い合わせや紹介ベースでのご案内のみとなります。</div>
                  </div>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px',marginBottom:'16px'}}>
                {selectedProduct.features.map((f,i)=>
                  <div key={i} style={{padding:'12px',background:f.highlight?`${selectedProduct.color}10`:'#f8fafc',borderRadius:'8px'}}>
                    <div style={{fontSize:'11px',color:'#64748b'}}>{f.label}</div>
                    <div style={{fontSize:'18px',fontWeight:'700',color:f.highlight?selectedProduct.color:'#1e293b'}}>{f.value}</div>
                  </div>
                )}
              </div>
              <div style={{display:'grid',gap:'10px'}}>
                <div style={{padding:'12px',background:'#f8fafc',borderRadius:'8px'}}><div style={{fontSize:'11px',fontWeight:'600',color:'#64748b',marginBottom:'4px'}}>🎯ターゲット</div><div style={{fontSize:'13px'}}>{selectedProduct.target}</div></div>
                <div style={{padding:'12px',background:'#eff6ff',borderRadius:'8px'}}><div style={{fontSize:'11px',fontWeight:'600',color:'#64748b',marginBottom:'4px'}}>💬営業トーク</div><div style={{fontSize:'13px',color:'#1e40af'}}>{selectedProduct.salesPoint}</div></div>
              </div>
              <div style={{marginTop:'16px',padding:'14px',background:'linear-gradient(135deg,#059669,#047857)',borderRadius:'10px',color:'#fff'}}><div style={{fontSize:'11px',opacity:0.9}}>インセンティブ</div><div style={{fontSize:'22px',fontWeight:'700'}}>{selectedProduct.incentive}</div></div>
              <div style={{marginTop:'12px',display:'grid',gap:'8px'}}>
                {selectedProduct.url&&<a href={selectedProduct.url} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px',background:selectedProduct.color,color:'#fff',textAlign:'center',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>🌐サービスサイト</a>}
                {selectedProduct.orderUrl&&<a href={selectedProduct.orderUrl} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px',background:'#7c3aed',color:'#fff',textAlign:'center',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>📝 動画撮影 入力シート</a>}
                {selectedProduct.sheetUrl&&<a href={selectedProduct.sheetUrl} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px',background:'#0ea5e9',color:'#fff',textAlign:'center',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>📊 案件進捗スプレッドシート</a>}
                {selectedProduct.docUrl&&<a href={selectedProduct.docUrl} target="_blank" rel="noopener noreferrer" style={{display:'block',padding:'12px',background:'#1e293b',color:'#fff',textAlign:'center',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'14px'}}>📄営業資料</a>}
              </div>
              {selectedProduct.videos && selectedProduct.videos.length > 0 && (
                <div style={{marginTop:'16px'}}>
                  <div style={{fontSize:'12px',color:'#64748b',fontWeight:'600',marginBottom:'8px'}}>🎬 動画資料</div>
                  <div style={{display:'grid',gap:'6px'}}>
                    {selectedProduct.videos.map((v,i)=>(
                      <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px',background:v.highlight?'linear-gradient(135deg,#7c3aed,#6d28d9)':'#fef3c7',borderRadius:'8px',textDecoration:'none',border:v.highlight?'2px solid #7c3aed':'1px solid #fde68a'}}>
                        <span style={{fontSize:'20px'}}>{v.highlight?'⭐':'🎬'}</span>
                        <span style={{fontSize:'14px',fontWeight:'600',color:v.highlight?'#fff':'#92400e'}}>{v.name}</span>
                        {v.highlight && <span style={{marginLeft:'auto',fontSize:'11px',background:'#fbbf24',color:'#78350f',padding:'2px 8px',borderRadius:'10px',fontWeight:'700'}}>必見</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 動画撮影申込確認モーダル */}
      {showVideoOrderModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001,padding:'20px'}}>
          <div style={{background:'#fff',borderRadius:'16px',maxWidth:'380px',width:'100%',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'20px',background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'#fff',textAlign:'center'}}>
              <div style={{fontSize:'36px',marginBottom:'6px'}}>🎬</div>
              <div style={{fontSize:'16px',fontWeight:'700'}}>出張動画撮影 契約</div>
            </div>
            <div style={{padding:'20px'}}>
              <div style={{textAlign:'center',marginBottom:'20px'}}>
                <div style={{fontSize:'15px',fontWeight:'600',color:'#1e293b',marginBottom:'8px'}}>お客様用申込フォームより</div>
                <div style={{fontSize:'18px',fontWeight:'700',color:'#dc2626'}}>申込済ですか？</div>
              </div>
              <div style={{display:'grid',gap:'10px'}}>
                <button 
                  onClick={()=>{setFormData({...formData,video_ordered:'申込済'});setShowVideoOrderModal(false);}} 
                  style={{padding:'14px',background:'#059669',color:'#fff',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}
                >
                  ✅ はい（申込済）
                </button>
                <button 
                  onClick={()=>{setFormData({...formData,video_ordered:'未申込'});window.open(VIDEO_CUSTOMER_URL,'_blank');setShowVideoOrderModal(false);}} 
                  style={{padding:'14px',background:'#dc2626',color:'#fff',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}
                >
                  🎟️ 今から申込む
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細データ表示モーダル */}
      {detailModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1002,padding:'20px'}} onClick={()=>setDetailModal(null)}>
          <div style={{background:'#fff',borderRadius:'16px',maxWidth:'850px',width:'100%',maxHeight:'80vh',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#1e293b,#334155)',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:'16px',fontWeight:'700'}}>📋 {detailModal.title} ({detailModal.records.length}件)</div>
              <button onClick={()=>setDetailModal(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'16px'}}>×</button>
            </div>
            <div style={{maxHeight:'calc(80vh - 60px)',overflowY:'auto'}}>
              {detailModal.records.length === 0 ? (
                <div style={{padding:'40px',textAlign:'center',color:'#64748b'}}>データがありません</div>
              ) : (
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                  <thead style={{position:'sticky',top:0,background:'#f8fafc'}}>
                    <tr style={{borderBottom:'2px solid #e2e8f0'}}>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>日付</th>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>企業名</th>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>担当者</th>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>事務所</th>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>方法</th>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>種別</th>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>PC提案</th>
                      <th style={{padding:'10px 8px',textAlign:'left'}}>タイミング</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailModal.records.map((r,i)=>(
                      <tr key={r.id||i} style={{borderBottom:'1px solid #f1f5f9',cursor:'pointer'}} onClick={()=>{handleEdit(r);setDetailModal(null);setActiveTab('records');setShowForm(true);}}>
                        <td style={{padding:'10px 8px'}}>{r.visit_date}</td>
                        <td style={{padding:'10px 8px',fontWeight:'600',color:'#1e293b'}}>{r.company}</td>
                        <td style={{padding:'10px 8px'}}>{r.staff}</td>
                        <td style={{padding:'10px 8px'}}><span style={{padding:'2px 8px',background:'#e0f2fe',color:'#0369a1',borderRadius:'4px',fontSize:'11px'}}>{r.office}</span></td>
                        <td style={{padding:'10px 8px'}}><span style={{padding:'2px 8px',background:r.sales_method==='訪問'?'#dcfce7':'#fae8ff',color:r.sales_method==='訪問'?'#166534':'#86198f',borderRadius:'4px',fontSize:'11px'}}>{r.sales_method==='訪問'?'🚗訪問':r.sales_method==='遠隔'?'💻遠隔':'-'}</span></td>
                        <td style={{padding:'10px 8px'}}><span style={{padding:'2px 8px',background:r.customer_type==='新規'?'#dcfce7':r.customer_type==='既存'?'#eff6ff':'#f1f5f9',color:r.customer_type==='新規'?'#166534':r.customer_type==='既存'?'#1e40af':'#94a3b8',borderRadius:'4px',fontSize:'11px'}}>{r.customer_type || '-'}</span></td>
                        <td style={{padding:'10px 8px'}}><span style={{padding:'2px 8px',background:r.pc_proposal==='提案した'?'#dcfce7':r.pc_proposal==='提案しなかった'?'#fef3c7':'#f1f5f9',color:r.pc_proposal==='提案した'?'#166534':r.pc_proposal==='提案しなかった'?'#92400e':'#94a3b8',borderRadius:'4px',fontSize:'11px'}}>{r.pc_proposal==='提案した'?'✓ あり':r.pc_proposal==='提案しなかった'?'✗ なし':'-'}</span></td>
                        <td style={{padding:'10px 8px'}}><span style={{padding:'2px 8px',background:'#fef3c7',color:'#92400e',borderRadius:'4px',fontSize:'11px'}}>{r.timing || '-'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
