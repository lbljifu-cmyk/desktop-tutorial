import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Globe, X, Menu, ChevronRight, Check, AlertCircle, Minus, Plus } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  colors: string[];
  sizes: string[];
  stock: number;
  description: string;
  image: string;
  images: string[];
};

type CartItem = Product & {
  size: string;
  color: string;
  quantity: number;
};

// --- Firebase client initialization ---
// Firebase web apiKey values identify a project and are public client configuration, not secrets.
// Never put service-account credentials, private keys, payment secrets, or admin tokens in this file.
// The fallback below is dummy demo data and must be replaced with the deployed project's public config.
const fallbackConfig = {
  apiKey: "AIzaSyDummyKey123",
  authDomain: "dummy-domain.firebaseapp.com",
  projectId: "dummy-project",
  storageBucket: "dummy-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : undefined;
const app = firebaseConfig ? initializeApp(firebaseConfig) : undefined;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'seian-store-id';

const FEATURE_PILLARS = [
  { title: 'Free shipping', text: 'On orders above ¥12,000 in Japan', icon: Check },
  { title: '30-day returns', text: 'Straightforward exchange and support', icon: Check },
  { title: 'Crafted essentials', text: 'Premium materials, understated silhouettes', icon: Check }
] as const;

const COLLECTION_SPOTS = [
  { name: 'At home', copy: 'Layered essentials for calm evenings', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=900' },
  { name: 'Workday', copy: 'Refined silhouettes built for movement', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=900' },
  { name: 'Footwear', copy: 'Textured finishes and quiet luxury', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=900' }
] as const;

// --- Mock Data ---
const PRODUCTS = [
  {
    id: 1,
    name: 'Premium Linen Room Wear Set',
    category: 'Unisex',
    price: 8900,
    colors: ['Oatmeal', 'Charcoal', 'Navy'],
    sizes: ['M', 'L', 'XL'],
    stock: 15,
    description: 'Crafted from premium European linen for ultimate breathability and comfort. Perfect for lounging or sleeping.',
    image: 'https://images.unsplash.com/photo-1515347619362-7ddfe2ba16d8?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1515347619362-7ddfe2ba16d8?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 2,
    name: 'Minimalist Heavyweight T-Shirt',
    category: 'Unisex',
    price: 4500,
    colors: ['White', 'Black', 'Greige'],
    sizes: ['S', 'M', 'L'],
    stock: 50,
    description: 'A structural, boxy fit t-shirt made from 100% organic heavy cotton. Designed to hold its shape over time.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 3,
    name: 'Craftsman Canvas Apron',
    category: 'Unisex',
    price: 3900,
    colors: ['Camel', 'Olive', 'Black'],
    sizes: ['Free'],
    stock: 5,
    description: 'Durable cotton canvas with reinforced stitching and multiple utility pockets. Ideal for creators and chefs.',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1600180758890-6b95b8d234ce?auto=format&fit=crop&q=80&w=1000'
    ]
  },
  {
    id: 4,
    name: 'Classic Suede Room Shoes',
    category: 'Unisex',
    price: 3200,
    colors: ['Sand', 'Ash'],
    sizes: ['M', 'L'],
    stock: 0,
    description: 'Soft faux-suede exterior with a plush interior lining. Designed for silent steps and warm feet.',
    image: 'https://images.unsplash.com/photo-1600180758890-6b95b8d234ce?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1600180758890-6b95b8d234ce?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&q=80&w=1000'
    ]
  }
];

const TRANSLATIONS = {
  en: {
    shop: 'Shop Collection', new: 'New Arrivals', cart: 'Shopping Bag', total: 'Total', checkout: 'Checkout', heroImage: 'SEAN fashion collection',
    empty: 'Your shopping bag is empty', login: 'Login', register: 'Register', outOfStock: 'Out of Stock',
    add: 'Add to Bag', women: 'Women', men: 'Men', about: 'About', language: 'Select language',
    season: 'Spring / Summer 2026', headline: 'THE NEW ESSENTIALS', featureTitles: ['Free shipping', '30-day returns', 'Crafted essentials'],
    featureTexts: ['On orders above ¥12,000 in Japan', 'Straightforward exchange and support', 'Premium materials, understated silhouettes'],
    collectionNames: ['At home', 'Workday', 'Footwear'],
    collectionTexts: ['Layered essentials for calm evenings', 'Refined silhouettes built for movement', 'Textured finishes and quiet luxury'],
    curated: 'Curated', viewAll: 'View All', footerDescription: 'Defining the modern standard through minimalist design, premium materials, and uncompromised craftsmanship.',
    links: 'Links', aboutUs: 'About Us', storeLocator: 'Store Locator', careers: 'Careers', contact: 'Contact',
    company: 'Company', corporateNumber: 'Corporate No.', representative: 'Representative', policies: 'Policies', brandCompany: 'SEAN (株式会社静安)',
    notice: 'Legal notice', privacy: 'Privacy policy', terms: 'Terms of service', returns: 'Returns & exchanges',
    sizeMaterials: 'Size & materials guide', rights: 'All Rights Reserved.',
    color: 'Color', size: 'Size', quantity: 'Quantity', decreaseQuantity: 'Decrease quantity', increaseQuantity: 'Increase quantity',
    productImage: 'Product image', sizeGuide: 'Size & Materials Guide', remove: 'Remove', qty: 'Qty',
    paymentNotice: 'JPY only. Payment processing is not connected; this prototype does not collect card details.',
    checkoutNotice: 'Checkout is unavailable until a compliant payment provider and server-side order flow are configured.',
    accountTitle: 'SEAN Account', accountIntro: 'Access your exclusive benefits',
    accountNotice: 'Account registration and sign-in are not available in this prototype. No email or password is requested or stored here.',
    authNotice: 'Production authentication requires a verified provider flow, abuse prevention, and a published privacy notice.',
    policyClose: 'Close policy', policyDisclaimer: 'Policy details and seller information require confirmation before this prototype is used for real sales.',
    menu: 'Menu', close: 'Close'
  },
  jp: {
    shop: 'コレクションを見る', new: '新着アイテム', cart: 'ショッピングバッグ', total: '合計', checkout: 'レジに進む', heroImage: 'SEAN ファッションコレクション',
    empty: 'バッグは空です', login: 'ログイン', register: '新規登録', outOfStock: '在庫切れ', add: 'バッグに追加',
    women: 'ウィメンズ', men: 'メンズ', about: 'ブランドについて', language: '言語を選択',
    season: '2026年 春夏コレクション', headline: '新しい定番', featureTitles: ['送料無料', '30日間返品', '丁寧なものづくり'],
    featureTexts: ['日本国内、12,000円以上のご注文', '交換・サポートもスムーズに', '上質な素材と控えめなシルエット'],
    collectionNames: ['くつろぎの時間', 'ワークスタイル', 'フットウェア'],
    collectionTexts: ['穏やかな夜に寄り添うレイヤードアイテム', '動きやすさを備えた洗練されたシルエット', '素材の表情と控えめな上質さ'],
    curated: 'セレクト', viewAll: 'すべて見る', footerDescription: 'ミニマルなデザイン、上質な素材、妥協のないクラフツマンシップで、現代のスタンダードを提案します。',
    links: 'リンク', aboutUs: 'SEANについて', storeLocator: '店舗情報', careers: '採用情報', contact: 'お問い合わせ',
    company: '会社情報', corporateNumber: '法人番号', representative: '代表者', policies: '各種ポリシー', brandCompany: 'SEAN（株式会社静安）',
    notice: '特定商取引法に基づく表記', privacy: 'プライバシーポリシー', terms: '利用規約', returns: '返品・交換',
    sizeMaterials: 'サイズ・素材ガイド', rights: '無断転載を禁じます。',
    color: 'カラー', size: 'サイズ', quantity: '数量', decreaseQuantity: '数量を減らす', increaseQuantity: '数量を増やす',
    productImage: '商品画像', sizeGuide: 'サイズ・素材ガイド', remove: '削除', qty: '数量',
    paymentNotice: '日本円のみ対応しています。決済機能は未接続のため、カード情報は収集しません。',
    checkoutNotice: '決済サービスとサーバー側の注文処理を設定するまで、購入手続きはご利用いただけません。',
    accountTitle: 'SEAN アカウント', accountIntro: '会員限定の特典をご覧ください',
    accountNotice: '本デモでは会員登録・ログインはご利用いただけません。メールアドレスやパスワードの入力・保存は行いません。',
    authNotice: '本番運用には、認証プロバイダーの設定、不正利用対策、プライバシー告知が必要です。',
    policyClose: 'ポリシーを閉じる', policyDisclaimer: '実際の販売に利用する前に、ポリシーと販売者情報をご確認ください。',
    menu: 'メニュー', close: '閉じる'
  },
  cn: {
    shop: '浏览系列', new: '新品上市', cart: '购物袋', total: '总计', checkout: '结账', heroImage: 'SEAN 时尚系列',
    empty: '购物袋为空', login: '登录', register: '注册', outOfStock: '暂时缺货', add: '加入购物袋',
    women: '女装', men: '男装', about: '品牌介绍', language: '选择语言',
    season: '2026 春夏系列', headline: '全新日常之选', featureTitles: ['免费配送', '30 天退换', '匠心甄选'],
    featureTexts: ['日本境内订单满 ¥12,000', '便捷的换货与客户支持', '优质材质，简约廓形'],
    collectionNames: ['居家时光', '日常工作', '鞋履系列'],
    collectionTexts: ['陪伴宁静夜晚的层次搭配', '兼顾活动与优雅的简洁廓形', '细腻质感与低调奢雅'],
    curated: '精选', viewAll: '查看全部', footerDescription: '以简约设计、优质材质与精湛工艺，定义现代生活的日常标准。',
    links: '相关链接', aboutUs: '关于我们', storeLocator: '门店查询', careers: '加入我们', contact: '联系我们',
    company: '公司信息', corporateNumber: '法人编号', representative: '代表人', policies: '政策与说明', brandCompany: 'SEAN（株式会社静安）',
    notice: '特定商业交易法说明', privacy: '隐私政策', terms: '服务条款', returns: '退换货政策',
    sizeMaterials: '尺码与材质指南', rights: '版权所有。',
    color: '颜色', size: '尺码', quantity: '数量', decreaseQuantity: '减少数量', increaseQuantity: '增加数量',
    productImage: '商品图片', sizeGuide: '尺码与材质指南', remove: '移除', qty: '数量',
    paymentNotice: '仅支持日元。此原型尚未接入支付，不会收集银行卡信息。',
    checkoutNotice: '配置合规支付服务和服务端订单流程后，方可开放结账。',
    accountTitle: 'SEAN 账户', accountIntro: '查看您的专属权益',
    accountNotice: '此原型暂不支持账户注册或登录，也不会请求或保存邮箱及密码。',
    authNotice: '正式上线前需配置经过验证的身份服务、防滥用措施并公布隐私政策。',
    policyClose: '关闭政策说明', policyDisclaimer: '用于真实销售前，请确认政策内容和销售方信息。',
    menu: '菜单', close: '关闭'
  }
} as const;

type Language = keyof typeof TRANSLATIONS;
type TranslationMap = (typeof TRANSLATIONS)[Language];
const LANGUAGE_LABELS: Record<Language, string> = { en: 'English', jp: '日本語', cn: '中文' };
const PRODUCT_COPY: Record<Language, Record<number, { name: string; category: string; description: string }>> = {
  en: {
    1: { name: 'Premium Linen Room Wear Set', category: 'Unisex', description: 'Crafted from premium European linen for ultimate breathability and comfort. Perfect for lounging or sleeping.' },
    2: { name: 'Minimalist Heavyweight T-Shirt', category: 'Unisex', description: 'A structural, boxy fit t-shirt made from 100% organic heavy cotton. Designed to hold its shape over time.' },
    3: { name: 'Craftsman Canvas Apron', category: 'Unisex', description: 'Durable cotton canvas with reinforced stitching and multiple utility pockets. Ideal for creators and chefs.' },
    4: { name: 'Classic Suede Room Shoes', category: 'Unisex', description: 'Soft faux-suede exterior with a plush interior lining. Designed for silent steps and warm feet.' }
  },
  jp: {
    1: { name: '上質リネン ルームウェアセット', category: 'ユニセックス', description: 'ヨーロッパ産の上質なリネンを使用。通気性と心地よさに優れ、くつろぎの時間や睡眠にぴったりです。' },
    2: { name: 'ミニマル ヘビーウェイトTシャツ', category: 'ユニセックス', description: 'オーガニックコットン100%を使用した、構築的なボックスシルエット。長く着ても型崩れしにくい一枚です。' },
    3: { name: '職人仕立て キャンバスエプロン', category: 'ユニセックス', description: '丈夫なコットンキャンバスに補強ステッチと複数のポケットを備えた、ものづくりや料理に適したエプロンです。' },
    4: { name: 'クラシック スエード調ルームシューズ', category: 'ユニセックス', description: '柔らかなフェイクスエードの表地とふんわりした裏地。静かな足音と暖かな履き心地を叶えます。' }
  },
  cn: {
    1: { name: '优质亚麻居家服套装', category: '中性款', description: '采用优质欧洲亚麻，透气舒适，适合居家休憩与睡眠时穿着。' },
    2: { name: '简约重磅 T 恤', category: '中性款', description: '采用 100% 有机厚棉，呈现利落的箱型版型，经久穿着依然挺括。' },
    3: { name: '匠心帆布围裙', category: '中性款', description: '耐用棉帆布搭配加固缝线与多个实用口袋，适合创作与烹饪。' },
    4: { name: '经典麂皮居家鞋', category: '中性款', description: '柔软仿麂皮鞋面搭配蓬松内衬，带来安静步履与温暖触感。' }
  }
};
const COLOR_LABELS: Record<Language, Record<string, string>> = {
  en: { Oatmeal: 'Oatmeal', Charcoal: 'Charcoal', Navy: 'Navy', White: 'White', Black: 'Black', Greige: 'Greige', Camel: 'Camel', Olive: 'Olive', Sand: 'Sand', Ash: 'Ash' },
  jp: { Oatmeal: 'オートミール', Charcoal: 'チャコール', Navy: 'ネイビー', White: 'ホワイト', Black: 'ブラック', Greige: 'グレージュ', Camel: 'キャメル', Olive: 'オリーブ', Sand: 'サンド', Ash: 'アッシュ' },
  cn: { Oatmeal: '燕麦色', Charcoal: '炭灰色', Navy: '藏青色', White: '白色', Black: '黑色', Greige: '米灰色', Camel: '驼色', Olive: '橄榄绿', Sand: '沙色', Ash: '灰色' }
};

const LEGAL_COPY = {
  en: {
    notice: { title: 'Legal notice (Specified Commercial Transactions Act)', lines: ['Seller: SEAN (株式会社静安) | Corporate number: 4010501050662', 'Representative: 趙 岩', 'Address: 〒151-0053, 3F ACN Yoyogi Building, 1-44-12 Yoyogi, Shibuya-ku, Tokyo, Japan', 'Telephone: +81-3-5356-8460 | Customer-service email: not supplied — add a monitored address before launch.', 'Prices: Product pages are stated to show tax-inclusive prices (10% consumption tax); verify before launch. Shipping amounts, free-shipping threshold, and any payment fees are still undecided and must be filled in.', 'Payment: Credit cards, Apple Pay, and Google Pay are proposed, but payment processing is not connected in this prototype. Do not advertise them as available until enabled and tested. Payment timing, any other methods, and deadlines remain to be confirmed.', 'Delivery: The suggested 2–5 business days is an example, not a confirmed promise. Confirm dispatch estimates for stocked and preorder items.', 'Returns: Proposed terms include customer-paid return shipping for customer-remorse returns and seller-paid shipping for defects/wrong items. The request windows, condition requirements, exclusions, refunds, and cancellation rules are not finalized; publish confirmed terms before taking orders.', 'This prototype does not accept orders. No second-hand goods permit details are included because the supplied business description is new-goods sales only.'] },
    privacy: { title: 'Privacy policy', lines: ['This prototype has no production checkout. Do not enter real payment or sensitive personal information. Firebase anonymous authentication is initialized in the background and may create an anonymous identifier.', 'A production operator must document purposes, data categories, retention, processors (including Firebase/payment providers), user rights, contact details, and applicable APPI procedures before collecting customer data.', 'No analytics or advertising cookies are configured here. If non-essential cookies or EU/EEA tracking are added, obtain and record valid consent before loading them, and provide withdrawal controls.'] },
    terms: { title: 'Terms of service', lines: ['This storefront is a visual prototype; account, payment, order, and delivery services are not production-ready.', 'Before launch, publish reviewed terms covering eligibility, ordering, payment, delivery, cancellations, intellectual property, liability, governing law, and customer support.'] },
    returns: { title: 'Returns and exchanges', lines: ['Proposed policy — must be confirmed and legally reviewed before launch.', 'Size/fit: Publish the application window, condition/packaging requirements, process, and who pays return shipping.', 'Defects or wrong items: Publish a contact method, notification deadline, inspection and replacement/refund process, and seller-paid shipping rules.', 'No purchases can currently be made through this prototype.'] },
    size: { title: 'Size & materials guide', lines: ['Garment measurements (shoulder, chest, length), model measurements/fit notes, and measured tolerances have not been supplied; do not rely on S/M/L alone. Add verified item-specific measurements before launch.', 'Materials shown from the current product descriptions: linen set — European linen (fiber composition/percentages to verify); T-shirt — 100% organic cotton (supplier certification to verify); apron — cotton canvas; room shoes — faux-suede exterior and plush lining. Confirm labels against supplier records.'] }
  },
  jp: {
    notice: { title: '特定商取引法に基づく表記', lines: ['販売業者：SEAN（株式会社静安）', '法人番号：4010501050662', '運営統括責任者：趙 岩', '所在地：〒151-0053 東京都渋谷区代々木1-44-12 ACN代々木ビル3階', '電話番号：03-5356-8460', 'メールアドレス：未提供（公開前に連絡確認ができるメールアドレスを設定してください）。', '販売価格：商品詳細ページに税込価格を表示（消費税10%との記載は公開前に要確認）。送料、送料無料条件、決済手数料は未確定のため、注文受付前に確定・表示してください。', '支払方法・時期：クレジットカード、Apple Pay、Google Payは導入予定として提示されていますが、本デモでは決済未接続です。利用可能な決済手段・課金時期・その他の支払期限は、導入確認後に確定してください。', '商品の引渡時期：例示の「2〜5営業日」は確定情報ではありません。在庫品・予約品ごとの発送目安を確認してから掲載してください。', '返品・交換・キャンセル：案として、お客様都合の返送料はお客様負担、不良品・誤配送の返送料は当社負担とされています。申請期限、商品状態、返品不可条件、返金・キャンセル条件は未確定のため、実運用に合わせて確定してください。', '本デモでは注文を受け付けていません。新品のみの販売との提供情報に基づき、古物商許可の記載は設けていません。'] },
    privacy: { title: 'プライバシーポリシー', lines: ['本デモに本番用の決済機能はありません。実際の決済情報や機微な個人情報を入力しないでください。Firebaseの匿名認証をバックグラウンドで初期化しており、匿名識別子が作成される場合があります。', '本番運用前に、利用目的・取得情報・保存期間・委託先（Firebase／決済事業者等）・利用者の権利・窓口および個人情報保護法上の手続きを確認し、明記してください。', '本画面ではアクセス解析・広告Cookieを設定していません。将来、必須でないCookie等を導入する場合、EU/EEA向けには事前同意と撤回手段を実装してください。'] },
    terms: { title: '利用規約', lines: ['本サイトは表示用プロトタイプです。会員、決済、注文、配送機能は本番利用できません。', '公開前に、利用条件、注文、支払、配送、キャンセル、知的財産、責任、準拠法および問い合わせ窓口を定めた規約を確認・掲載してください。'] },
    returns: { title: '返品・交換ポリシー', lines: ['以下は案です。公開前に実際の運用に合わせて確定し、法的確認を行ってください。', 'サイズ・フィット：申請期限、商品の状態・梱包条件、手続、返送料の負担者を明記してください。', '不良品・誤配送：連絡先、申告期限、確認・交換／返金手続、返送料の負担を明記してください。', '本デモでは購入できません。'] },
    size: { title: 'サイズ・素材ガイド', lines: ['肩幅・胸囲・着丈などの実寸、モデル情報・着用感、許容差は未提供です。S/M/Lだけに頼らず、公開前に商品ごとの確認済み寸法を追加してください。', '現行説明に記載の素材：リネンセット — 欧州産リネン（組成・混率要確認）、Tシャツ — オーガニックコットン100%（認証要確認）、エプロン — コットンキャンバス、ルームシューズ — フェイクスエード外側・起毛裏地。仕入先資料と照合してください。'] }
  },
  cn: {
    notice: { title: '特定商取引法披露（日本）', lines: ['销售方：SEAN（株式会社静安） | 法人编号：4010501050662', '运营负责人：趙 岩', '地址：〒151-0053 日本东京都涩谷区代代木1-44-12 ACN代代木大厦3层', '电话：+81-3-5356-8460 | 客服邮箱：尚未提供，上线前请设置可接收并回复的邮箱。', '商品价格：商品详情页标注含税价格（消费税10%的说明需上线前核实）。运费、免邮门槛及支付手续费尚未确定，接单前必须确认并公布。', '支付方式/时间：信用卡、Apple Pay、Google Pay目前仅为拟采用方式；此原型未接通支付。完成集成和测试前不得宣传为可用。其他支付方式及付款期限待确认。', '交付时间：所提供的“2–5个工作日”为示例，并非已确认承诺。请核实现货和预售商品的发货时限。', '退换货/取消：草案提出个人原因退货由顾客承担运费，瑕疵或错发由销售方承担运费。申请期限、商品状态、不可退条件、退款和取消规则尚未确定，正式接单前请完成并公布。', '此原型不接受订单。根据所提供的仅销售新品的信息，本披露未列古物商许可信息。'] },
    privacy: { title: '隐私政策', lines: ['此原型没有正式结账功能。请勿输入真实支付信息或敏感个人信息。后台会初始化 Firebase 匿名身份验证，可能创建匿名标识符。', '正式收集客户数据前，运营方应确认并披露处理目的、数据类别、保存期限、受托方（含 Firebase/支付服务商）、用户权利、联系渠道及日本个人信息保护法（APPI）相关流程。', '当前未配置分析或广告 Cookie。若新增非必要 Cookie 或面向欧盟/欧洲经济区的追踪，应在加载前取得并记录有效同意，并提供撤回方式。'] },
    terms: { title: '服务条款', lines: ['本网站目前仅为展示原型；账户、支付、订单和配送功能尚不能用于正式运营。', '上线前应审核并发布涵盖使用资格、订单、支付、配送、取消、知识产权、责任、适用法律及客服渠道的条款。'] },
    returns: { title: '退换货政策', lines: ['以下为待确认草案。上线前须按实际流程确定并进行法律审核。', '尺码/版型：明确申请期限、商品及包装状态要求、办理流程和退货邮费承担方。', '质量问题/错发：明确联系渠道、申报期限、核验及换货/退款流程、邮费承担方式。', '当前原型不支持购买。'] },
    size: { title: '尺码与面料指南', lines: ['目前未提供肩宽、胸围、衣长等实测尺寸、模特数据/试穿报告及测量误差。上线前应补充逐款核实的数据，不能仅依赖 S/M/L。', '当前商品描述中的面料：亚麻套装 — 欧洲亚麻（成分比例待核实）；T 恤 — 100% 有机棉（认证待核实）；围裙 — 棉帆布；室内鞋 — 仿麂皮外层及绒感内衬。请以供应商资料核验。'] }
  }
} as const;

type LegalPageKey = keyof typeof LEGAL_COPY.en;

// --- Main Application Component ---
export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [legalPage, setLegalPage] = useState<LegalPageKey | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[lang];
  const availableQuantity = selectedProduct
    ? Math.max(0, selectedProduct.stock - cart.filter((item) => item.id === selectedProduct.id).reduce((sum, item) => sum + item.quantity, 0))
    : 0;

  useEffect(() => {
    document.documentElement.lang = lang === 'jp' ? 'ja' : lang === 'cn' ? 'zh-CN' : 'en';
  }, [lang]);

  // Mandatory Firebase Auth Effect
  useEffect(() => {
    if (!auth) {
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product, size: string, color: string, quantity: number) => {
    setCart((prev) => {
      const alreadyInCart = prev.filter((item) => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
      const quantityToAdd = Math.min(quantity, Math.max(0, product.stock - alreadyInCart));
      if (quantityToAdd === 0) return prev;
      const existingIndex = prev.findIndex((item) => item.id === product.id && item.size === size && item.color === color);
      if (existingIndex >= 0) {
        return prev.map((item, index) => index === existingIndex ? { ...item, quantity: item.quantity + quantityToAdd } : item);
      }
      return [...prev, { ...product, size, color, quantity: quantityToAdd }];
    });
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const updateCartQuantity = (indexToUpdate: number, quantity: number) => {
    setCart((prev) => prev.flatMap((item, index) => {
      if (index !== indexToUpdate) return [item];
      const quantityInOtherVariants = prev
        .filter((otherItem, otherIndex) => otherIndex !== index && otherItem.id === item.id)
        .reduce((sum, otherItem) => sum + otherItem.quantity, 0);
      const nextQuantity = Math.min(item.stock - quantityInOtherVariants, Math.max(0, quantity));
      return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans selection:bg-stone-200">
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" aria-label={isMobileMenuOpen ? t.close : t.menu} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Left Nav */}
          <div className="hidden lg:flex items-center space-x-8 text-sm uppercase tracking-widest">
            <a href="#" className="hover:text-stone-500 transition-colors">{t.women}</a>
            <a href="#" className="hover:text-stone-500 transition-colors">{t.men}</a>
            <a href="#" className="hover:text-stone-500 transition-colors">{t.about}</a>
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-3xl font-light tracking-[0.2em] cursor-pointer">SEAN</h1>
          </div>

          {/* Right Nav */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="hidden sm:flex items-center gap-2">
              <Globe size={18} aria-hidden="true" />
              <select
                aria-label={t.language}
                value={lang}
                onChange={(event) => setLang(event.target.value as Language)}
                className="bg-transparent text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-stone-500"
              >
                {(['en', 'jp', 'cn'] as const).map((language) => (
                  <option key={language} value={language}>{LANGUAGE_LABELS[language]}</option>
                ))}
              </select>
            </div>
            
            <button onClick={() => setIsLoginOpen(true)} aria-label={`${t.login} / ${t.register}`} className="p-2 hover:text-stone-500 transition-colors hidden sm:block">
              <User size={20} />
            </button>
            
            <button onClick={() => setIsCartOpen(true)} aria-label={t.cart} className="p-2 hover:text-stone-500 transition-colors relative">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-[#faf9f6] border-b border-stone-200 px-4 py-6 flex flex-col space-y-4 shadow-xl">
             <a href="#" className="uppercase tracking-widest text-sm py-2 border-b border-stone-100">{t.women}</a>
             <a href="#" className="uppercase tracking-widest text-sm py-2 border-b border-stone-100">{t.men}</a>
             <a href="#" className="uppercase tracking-widest text-sm py-2 border-b border-stone-100">{t.about}</a>
             <div className="flex space-x-4 pt-4">
                {(['en', 'jp', 'cn'] as const).map(l => (
                  <button key={l} onClick={() => {setLang(l); setIsMobileMenuOpen(false);}} className={`text-sm ${lang === l ? 'font-bold' : ''}`}>{LANGUAGE_LABELS[l]}</button>
                ))}
             </div>
             <button onClick={() => {setIsLoginOpen(true); setIsMobileMenuOpen(false);}} className="text-sm uppercase text-left pt-2">{t.login} / {t.register}</button>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
          alt={t.heroImage}
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white flex flex-col items-center">
          <h2 className="text-sm sm:text-lg uppercase tracking-[0.3em] mb-6 font-light">{t.season}</h2>
          <h3 className="text-4xl sm:text-6xl font-light tracking-widest mb-10">{t.headline}</h3>
          <button className="bg-white text-stone-900 px-8 py-3 text-sm uppercase tracking-widest hover:bg-stone-100 hover:scale-105 transition-all duration-300">
            {t.shop}
          </button>
        </div>
      </section>

      {/* --- Brand Highlights --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURE_PILLARS.map(({ icon: Icon }, index) => (
            <div key={t.featureTitles[index]} className="flex items-center gap-4 rounded-full border border-stone-200 bg-white/70 px-5 py-4 shadow-[0_10px_30px_rgba(28,25,23,0.03)] backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">SEAN</p>
                <p className="text-sm font-medium text-stone-800">{t.featureTitles[index]}</p>
                <p className="text-xs text-stone-500">{t.featureTexts[index]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {COLLECTION_SPOTS.map((item, index) => (
            <article key={item.name} className={`group relative overflow-hidden rounded-[2rem] bg-stone-200 ${index === 1 ? 'lg:translate-y-8' : ''}`}>
              <img src={item.image} alt={t.collectionNames[index]} className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone-200">{t.curated}</p>
                <h3 className="mt-3 text-2xl font-light tracking-[0.08em]">{t.collectionNames[index]}</h3>
                <p className="mt-2 max-w-xs text-sm text-stone-200">{t.collectionTexts[index]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* --- New Arrivals Section --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-light tracking-widest uppercase">{t.new}</h2>
          <a href="#" className="text-sm uppercase tracking-widest hover:text-stone-500 transition-colors flex items-center">
            {t.viewAll} <ChevronRight size={16} className="ml-1"/>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map(product => (
            <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedProduct(product); }}>
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
                <img 
                  src={product.image} 
                  alt={PRODUCT_COPY[lang][product.id].name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-stone-900 uppercase tracking-widest text-sm font-medium">{t.outOfStock}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-stone-500 uppercase tracking-wider">{PRODUCT_COPY[lang][product.id].category}</span>
                <h3 className="text-sm font-medium">{PRODUCT_COPY[lang][product.id].name}</h3>
                <span className="text-sm font-light">¥{product.price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h4 className="text-white text-xl tracking-[0.2em] mb-6 font-light">SEAN</h4>
            <p className="text-sm font-light leading-relaxed max-w-xs">
                {t.footerDescription}
            </p>
          </div>
          <div className="flex flex-col space-y-3 text-sm font-light">
              <h5 className="text-white tracking-widest uppercase mb-3">{t.links}</h5>
              <a href="#" className="hover:text-white transition-colors">{t.aboutUs}</a>
              <a href="#" className="hover:text-white transition-colors">{t.storeLocator}</a>
              <a href="#" className="hover:text-white transition-colors">{t.careers}</a>
              <a href="#" className="hover:text-white transition-colors">{t.contact}</a>
          </div>
          <div className="flex flex-col space-y-3 text-sm font-light">
              <h5 className="text-white tracking-widest uppercase mb-3">{t.company}</h5>
            <p>{t.brandCompany}</p>
              <p>{t.corporateNumber}: 4010501050662</p>
              <p>{t.representative}: 趙 岩</p>
            <p>〒151-0053 東京都渋谷区代々木1-44-12 ACN代々木ビル3階</p>
            <a href="tel:+81353568460" className="hover:text-white transition-colors">03-5356-8460</a>
          </div>
          <div className="flex flex-col space-y-3 text-sm font-light">
            <h5 className="text-white tracking-widest uppercase mb-3">{t.policies}</h5>
            {(['notice', 'privacy', 'terms', 'returns'] as const).map((key) => (
              <button key={key} type="button" onClick={() => setLegalPage(key)} className="text-left hover:text-white transition-colors">{t[key]}</button>
            ))}
            <button type="button" onClick={() => setLegalPage('size')} className="text-left hover:text-white transition-colors">{t.sizeMaterials}</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-stone-800 text-xs text-center font-light">
          &copy; {new Date().getFullYear()} SEAN {t.rights}
        </div>
      </footer>

      {/* --- Product Detail Modal --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedProduct(null)} aria-label={t.close} className="absolute top-4 right-4 z-10 p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
              <X size={20} />
            </button>
            
            <ProductGallery key={selectedProduct.id} product={selectedProduct} t={t} />
            
            <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
              <span className="text-xs text-stone-500 uppercase tracking-wider mb-2">{PRODUCT_COPY[lang][selectedProduct.id].category}</span>
              <h2 id="product-detail-title" className="text-2xl sm:text-3xl font-light mb-4">{PRODUCT_COPY[lang][selectedProduct.id].name}</h2>
              <p className="text-xl mb-6 font-light">¥{selectedProduct.price.toLocaleString()}</p>
              <p className="text-stone-600 text-sm leading-relaxed mb-8 font-light">{PRODUCT_COPY[lang][selectedProduct.id].description}</p>
              <button type="button" onClick={() => { setSelectedProduct(null); setLegalPage('size'); }} className="text-left text-sm underline underline-offset-4 mb-6 hover:text-stone-500">{t.sizeGuide}</button>
              
              <ProductOptions key={selectedProduct.id} product={selectedProduct} onAdd={addToCart} t={t} lang={lang} availableQuantity={availableQuantity} />
            </div>
          </div>
        </div>
      )}

      {/* --- Cart Drawer --- */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isCartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        role={isCartOpen ? 'dialog' : undefined}
        aria-modal={isCartOpen}
        aria-hidden={!isCartOpen}
        aria-labelledby="shopping-bag-title"
      >
        <div className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setIsCartOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-[#faf9f6] shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCartOpen ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'}`}>
          <div className="px-6 py-6 border-b border-stone-200 flex items-center justify-between bg-white">
            <h2 id="shopping-bag-title" className="text-lg tracking-widest uppercase font-light">{t.cart} ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
            <button onClick={() => setIsCartOpen(false)} aria-label={t.close} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X size={20} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="uppercase tracking-widest text-sm">{t.empty}</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="flex space-x-4 border-b border-stone-100 pb-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="w-20 h-24 bg-stone-100 flex-shrink-0">
                    <img src={item.image} alt={PRODUCT_COPY[lang][item.id].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium line-clamp-1">{PRODUCT_COPY[lang][item.id].name}</h3>
                      <p className="text-xs text-stone-500 mt-1 capitalize">{COLOR_LABELS[lang][item.color] ?? item.color} / {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">¥{item.price.toLocaleString()}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <button type="button" aria-label={t.decreaseQuantity} onClick={() => updateCartQuantity(index, item.quantity - 1)} className="p-1 hover:bg-stone-100" disabled={item.quantity <= 0}><Minus size={14} /></button>
                        <span className="px-1 text-stone-500">{t.qty}: {item.quantity}</span>
                        <button type="button" aria-label={t.increaseQuantity} onClick={() => updateCartQuantity(index, item.quantity + 1)} disabled={cart.filter((cartItem) => cartItem.id === item.id).reduce((sum, cartItem) => sum + cartItem.quantity, 0) >= item.stock} className="p-1 hover:bg-stone-100 disabled:opacity-40"><Plus size={14} /></button>
                        <button onClick={() => updateCartQuantity(index, 0)} className="text-stone-400 hover:text-stone-900 underline ml-2 transition-colors">{t.remove}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-stone-200">
              <div className="flex justify-between items-center mb-6 text-lg">
                <span className="uppercase tracking-widest font-light">{t.total}</span>
                <span className="font-medium">¥{cartTotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-stone-500 mb-3">{t.paymentNotice}</p>
              <button type="button" disabled className="w-full bg-stone-300 text-stone-600 py-4 uppercase tracking-widest text-sm cursor-not-allowed" aria-disabled="true">
                {t.checkout}
              </button>
              <p className="text-xs text-stone-500 mt-2">{t.checkoutNotice}</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Login / Register Modal (Placeholder) --- */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsLoginOpen(false)} />
          <div className="relative bg-white w-full max-w-md p-8 sm:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsLoginOpen(false)} aria-label={t.close} className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl tracking-[0.2em] uppercase font-light mb-2">{t.accountTitle}</h2>
              <p className="text-sm text-stone-500 font-light">{t.accountIntro}</p>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-sm text-stone-600">{t.accountNotice}</p>
              <button type="button" disabled className="w-full bg-stone-300 text-stone-600 py-4 uppercase tracking-widest text-sm cursor-not-allowed" aria-disabled="true">
                {t.login} / {t.register}
              </button>
              <p className="text-xs text-stone-400">{t.authNotice}</p>
            </div>
          </div>
        </div>
      )}

      {legalPage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="legal-page-title">
          <button type="button" className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" aria-label={t.policyClose} onClick={() => setLegalPage(null)} />
          <section className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl">
            <button type="button" onClick={() => setLegalPage(null)} className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full" aria-label={t.policyClose}><X size={20} /></button>
            <h2 id="legal-page-title" className="text-xl sm:text-2xl font-light tracking-wide pr-10 mb-6">{LEGAL_COPY[lang][legalPage].title}</h2>
            <div className="space-y-4 text-sm leading-7 text-stone-600">
              {LEGAL_COPY[lang][legalPage].lines.map((line, index) => <p key={index}>{line}</p>)}
            </div>
            <p className="mt-8 pt-4 border-t border-stone-200 text-xs text-stone-500">{t.policyDisclaimer}</p>
          </section>
        </div>
      )}

    </div>
  );
}

type ProductGalleryProps = {
  product: Product;
  t: TranslationMap;
};

function ProductGallery({ product, t }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0] ?? product.image);

  return (
    <div className="w-full md:w-1/2 bg-stone-100 p-3 sm:p-5">
      <img
        src={selectedImage}
        alt={t.productImage}
        className="w-full h-[42vh] md:h-[65vh] object-cover"
      />
      <div className="flex gap-2 overflow-x-auto pt-3" aria-label={t.productImage}>
        {product.images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setSelectedImage(image)}
            aria-label={`${t.productImage} ${index + 1}`}
            aria-pressed={selectedImage === image}
            className={`h-16 w-14 flex-shrink-0 overflow-hidden border-2 ${selectedImage === image ? 'border-stone-900' : 'border-transparent'}`}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Helper Component for Product Modal ---
type ProductOptionsProps = {
  product: Product;
  onAdd: (product: Product, size: string, color: string, quantity: number) => void;
  t: TranslationMap;
  lang: Language;
  availableQuantity: number;
};

function ProductOptions({ product, onAdd, t, lang, availableQuantity }: ProductOptionsProps) {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = availableQuantity === 0;

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <span className="block text-xs uppercase tracking-widest text-stone-500 mb-3">{t.color}: <span className="text-stone-900 ml-1">{COLOR_LABELS[lang][selectedColor] ?? selectedColor}</span></span>
        <div className="flex flex-wrap gap-3">
          {product.colors.map((color: string) => (
            <button 
              type="button"
              key={color}
              onClick={() => setSelectedColor(color)}
              aria-pressed={selectedColor === color}
              className={`px-4 py-2 border text-sm transition-colors ${selectedColor === color ? 'border-stone-900 text-stone-900 bg-stone-50' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}
            >
              {COLOR_LABELS[lang][color] ?? color}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <span className="block text-xs uppercase tracking-widest text-stone-500 mb-3">{t.size}: <span className="text-stone-900 ml-1">{selectedSize}</span></span>
        <div className="flex flex-wrap gap-3">
          {product.sizes.map((size: string) => (
            <button 
              type="button"
              key={size}
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize === size}
              className={`w-12 h-12 flex items-center justify-center border text-sm transition-colors ${selectedSize === size ? 'border-stone-900 text-stone-900 bg-stone-50' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-xs uppercase tracking-widest text-stone-500 mb-3">{t.quantity}</span>
        <div className="inline-flex items-center border border-stone-200">
          <button
            type="button"
            aria-label={t.decreaseQuantity}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-3 hover:bg-stone-50 disabled:opacity-40"
          >
            <Minus size={16} />
          </button>
          <span aria-live="polite" className="min-w-10 text-center text-sm">{isOutOfStock ? 0 : quantity}</span>
          <button
            type="button"
            aria-label={t.increaseQuantity}
            onClick={() => setQuantity((current) => Math.min(availableQuantity, current + 1))}
            disabled={isOutOfStock || quantity >= availableQuantity}
            className="p-3 hover:bg-stone-50 disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Action */}
      <div className="pt-4">
        <button 
          type="button"
          onClick={() => onAdd(product, selectedSize, selectedColor, quantity)}
          disabled={isOutOfStock}
          className={`w-full py-4 uppercase tracking-widest text-sm transition-all flex justify-center items-center ${isOutOfStock ? 'bg-stone-200 text-stone-500 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg'}`}
        >
          {isOutOfStock ? (
            <><AlertCircle size={18} className="mr-2"/> {t.outOfStock}</>
          ) : (
             <>{t.add}</>
          )}
        </button>
      </div>
    </div>
  );
}