import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Globe, X, Menu, ChevronRight, Check, AlertCircle } from 'lucide-react';
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
    image: 'https://images.unsplash.com/photo-1515347619362-7ddfe2ba16d8?auto=format&fit=crop&q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800'
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
    image: 'https://images.unsplash.com/photo-1600180758890-6b95b8d234ce?auto=format&fit=crop&q=80&w=800'
  }
];

const TRANSLATIONS = {
  en: { shop: 'Shop Collection', new: 'New Arrivals', cart: 'Cart', total: 'Total', checkout: 'Checkout', empty: 'Your cart is empty', login: 'Login', register: 'Register', outOfStock: 'Out of Stock', add: 'Add to Cart' },
  jp: { shop: 'コレクションを見る', new: '新着アイテム', cart: 'カート', total: '合計', checkout: 'レジに進む', empty: 'カートは空です', login: 'ログイン', register: '新規登録', outOfStock: '在庫切れ', add: 'カートに追加' },
  cn: { shop: '购买系列', new: '新品上市', cart: '购物车', total: '总计', checkout: '结账', empty: '您的购物车是空的', login: '登录', register: '注册', outOfStock: '缺货', add: '加入购物车' }
} as const;

type Language = keyof typeof TRANSLATIONS;
type TranslationMap = (typeof TRANSLATIONS)[Language];

const LEGAL_COPY = {
  en: {
    notice: { title: 'Legal notice (Specified Commercial Transactions Act)', lines: ['Seller: 株式会社静安 (SEIAN Co., Ltd.) | Corporate number: 4010501050662', 'Representative: 趙 岩', 'Address: 〒151-0053, 3F ACN Yoyogi Building, 1-44-12 Yoyogi, Shibuya-ku, Tokyo, Japan', 'Telephone: +81-90-4832-6638 | Customer-service email: not supplied — add a monitored address before launch.', 'Prices: Product pages are stated to show tax-inclusive prices (10% consumption tax); verify before launch. Shipping amounts, free-shipping threshold, and any payment fees are still undecided and must be filled in.', 'Payment: Credit cards, Apple Pay, and Google Pay are proposed, but payment processing is not connected in this prototype. Do not advertise them as available until enabled and tested. Payment timing, any other methods, and deadlines remain to be confirmed.', 'Delivery: The suggested 2–5 business days is an example, not a confirmed promise. Confirm dispatch estimates for stocked and preorder items.', 'Returns: Proposed terms include customer-paid return shipping for customer-remorse returns and seller-paid shipping for defects/wrong items. The request windows, condition requirements, exclusions, refunds, and cancellation rules are not finalized; publish confirmed terms before taking orders.', 'This prototype does not accept orders. No second-hand goods permit details are included because the supplied business description is new-goods sales only.'] },
    privacy: { title: 'Privacy policy', lines: ['This prototype has no production checkout. Do not enter real payment or sensitive personal information. Firebase anonymous authentication is initialized in the background and may create an anonymous identifier.', 'A production operator must document purposes, data categories, retention, processors (including Firebase/payment providers), user rights, contact details, and applicable APPI procedures before collecting customer data.', 'No analytics or advertising cookies are configured here. If non-essential cookies or EU/EEA tracking are added, obtain and record valid consent before loading them, and provide withdrawal controls.'] },
    terms: { title: 'Terms of service', lines: ['This storefront is a visual prototype; account, payment, order, and delivery services are not production-ready.', 'Before launch, publish reviewed terms covering eligibility, ordering, payment, delivery, cancellations, intellectual property, liability, governing law, and customer support.'] },
    returns: { title: 'Returns and exchanges', lines: ['Proposed policy — must be confirmed and legally reviewed before launch.', 'Size/fit: Publish the application window, condition/packaging requirements, process, and who pays return shipping.', 'Defects or wrong items: Publish a contact method, notification deadline, inspection and replacement/refund process, and seller-paid shipping rules.', 'No purchases can currently be made through this prototype.'] },
    size: { title: 'Size & materials guide', lines: ['Garment measurements (shoulder, chest, length), model measurements/fit notes, and measured tolerances have not been supplied; do not rely on S/M/L alone. Add verified item-specific measurements before launch.', 'Materials shown from the current product descriptions: linen set — European linen (fiber composition/percentages to verify); T-shirt — 100% organic cotton (supplier certification to verify); apron — cotton canvas; room shoes — faux-suede exterior and plush lining. Confirm labels against supplier records.'] }
  },
  jp: {
    notice: { title: '特定商取引法に基づく表記', lines: ['販売業者：株式会社静安', '法人番号：4010501050662', '運営統括責任者：趙 岩', '所在地：〒151-0053 東京都渋谷区代々木1-44-12 ACN代々木ビル3階', '電話番号：090-4832-6638', 'メールアドレス：未提供（公開前に連絡確認ができるメールアドレスを設定してください）。', '販売価格：商品詳細ページに税込価格を表示（消費税10%との記載は公開前に要確認）。送料、送料無料条件、決済手数料は未確定のため、注文受付前に確定・表示してください。', '支払方法・時期：クレジットカード、Apple Pay、Google Payは導入予定として提示されていますが、本デモでは決済未接続です。利用可能な決済手段・課金時期・その他の支払期限は、導入確認後に確定してください。', '商品の引渡時期：例示の「2〜5営業日」は確定情報ではありません。在庫品・予約品ごとの発送目安を確認してから掲載してください。', '返品・交換・キャンセル：案として、お客様都合の返送料はお客様負担、不良品・誤配送の返送料は当社負担とされています。申請期限、商品状態、返品不可条件、返金・キャンセル条件は未確定のため、実運用に合わせて確定してください。', '本デモでは注文を受け付けていません。新品のみの販売との提供情報に基づき、古物商許可の記載は設けていません。'] },
    privacy: { title: 'プライバシーポリシー', lines: ['本デモに本番用の決済機能はありません。実際の決済情報や機微な個人情報を入力しないでください。Firebaseの匿名認証をバックグラウンドで初期化しており、匿名識別子が作成される場合があります。', '本番運用前に、利用目的・取得情報・保存期間・委託先（Firebase／決済事業者等）・利用者の権利・窓口および個人情報保護法上の手続きを確認し、明記してください。', '本画面ではアクセス解析・広告Cookieを設定していません。将来、必須でないCookie等を導入する場合、EU/EEA向けには事前同意と撤回手段を実装してください。'] },
    terms: { title: '利用規約', lines: ['本サイトは表示用プロトタイプです。会員、決済、注文、配送機能は本番利用できません。', '公開前に、利用条件、注文、支払、配送、キャンセル、知的財産、責任、準拠法および問い合わせ窓口を定めた規約を確認・掲載してください。'] },
    returns: { title: '返品・交換ポリシー', lines: ['以下は案です。公開前に実際の運用に合わせて確定し、法的確認を行ってください。', 'サイズ・フィット：申請期限、商品の状態・梱包条件、手続、返送料の負担者を明記してください。', '不良品・誤配送：連絡先、申告期限、確認・交換／返金手続、返送料の負担を明記してください。', '本デモでは購入できません。'] },
    size: { title: 'サイズ・素材ガイド', lines: ['肩幅・胸囲・着丈などの実寸、モデル情報・着用感、許容差は未提供です。S/M/Lだけに頼らず、公開前に商品ごとの確認済み寸法を追加してください。', '現行説明に記載の素材：リネンセット — 欧州産リネン（組成・混率要確認）、Tシャツ — オーガニックコットン100%（認証要確認）、エプロン — コットンキャンバス、ルームシューズ — フェイクスエード外側・起毛裏地。仕入先資料と照合してください。'] }
  },
  cn: {
    notice: { title: '特定商取引法披露（日本）', lines: ['销售方：株式会社静安 | 法人编号：4010501050662', '运营负责人：趙 岩', '地址：〒151-0053 日本东京都涩谷区代代木1-44-12 ACN代代木大厦3层', '电话：+81-90-4832-6638 | 客服邮箱：尚未提供，上线前请设置可接收并回复的邮箱。', '商品价格：商品详情页标注含税价格（消费税10%的说明需上线前核实）。运费、免邮门槛及支付手续费尚未确定，接单前必须确认并公布。', '支付方式/时间：信用卡、Apple Pay、Google Pay目前仅为拟采用方式；此原型未接通支付。完成集成和测试前不得宣传为可用。其他支付方式及付款期限待确认。', '交付时间：所提供的“2–5个工作日”为示例，并非已确认承诺。请核实现货和预售商品的发货时限。', '退换货/取消：草案提出个人原因退货由顾客承担运费，瑕疵或错发由销售方承担运费。申请期限、商品状态、不可退条件、退款和取消规则尚未确定，正式接单前请完成并公布。', '此原型不接受订单。根据所提供的仅销售新品的信息，本披露未列古物商许可信息。'] },
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

  const addToCart = (product: Product, size: string, color: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id && item.size === size && item.color === color);
      if (existingIndex >= 0) {
        return prev.map((item, index) => index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, size, color, quantity: 1 }];
    });
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const removeFromCart = (indexToRemove: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans selection:bg-stone-200">
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Left Nav */}
          <div className="hidden lg:flex items-center space-x-8 text-sm uppercase tracking-widest">
            <a href="#" className="hover:text-stone-500 transition-colors">Women</a>
            <a href="#" className="hover:text-stone-500 transition-colors">Men</a>
            <a href="#" className="hover:text-stone-500 transition-colors">About</a>
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-3xl font-light tracking-[0.2em] cursor-pointer">SEIAN</h1>
          </div>

          {/* Right Nav */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative group hidden sm:block">
              <button className="flex items-center space-x-1 p-2 hover:text-stone-500 transition-colors">
                <Globe size={18} />
                <span className="text-xs uppercase font-medium">{lang}</span>
              </button>
              <div className="absolute right-0 mt-2 w-24 bg-white border border-stone-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {(['en', 'jp', 'cn'] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)} className="block w-full text-left px-4 py-2 text-sm uppercase hover:bg-stone-50">
                    {l}
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={() => setIsLoginOpen(true)} className="p-2 hover:text-stone-500 transition-colors hidden sm:block">
              <User size={20} />
            </button>
            
            <button onClick={() => setIsCartOpen(true)} className="p-2 hover:text-stone-500 transition-colors relative">
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
             <a href="#" className="uppercase tracking-widest text-sm py-2 border-b border-stone-100">Women</a>
             <a href="#" className="uppercase tracking-widest text-sm py-2 border-b border-stone-100">Men</a>
             <a href="#" className="uppercase tracking-widest text-sm py-2 border-b border-stone-100">About</a>
             <div className="flex space-x-4 pt-4">
                {(['en', 'jp', 'cn'] as const).map(l => (
                  <button key={l} onClick={() => {setLang(l); setIsMobileMenuOpen(false);}} className={`text-sm uppercase ${lang === l ? 'font-bold' : ''}`}>{l}</button>
                ))}
             </div>
             <button onClick={() => {setIsLoginOpen(true); setIsMobileMenuOpen(false);}} className="text-sm uppercase text-left pt-2">Login / Register</button>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
          alt="Fashion Editorial" 
          className="absolute inset-0 w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white flex flex-col items-center">
          <h2 className="text-sm sm:text-lg uppercase tracking-[0.3em] mb-6 font-light">Spring / Summer 2026</h2>
          <h3 className="text-4xl sm:text-6xl font-light tracking-widest mb-10">THE NEW ESSENTIALS</h3>
          <button className="bg-white text-stone-900 px-8 py-3 text-sm uppercase tracking-widest hover:bg-stone-100 hover:scale-105 transition-all duration-300">
            {t.shop}
          </button>
        </div>
      </section>

      {/* --- Brand Highlights --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURE_PILLARS.map(({ title, text, icon: Icon }) => (
            <div key={title} className="flex items-center gap-4 rounded-full border border-stone-200 bg-white/70 px-5 py-4 shadow-[0_10px_30px_rgba(28,25,23,0.03)] backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">SEIAN</p>
                <p className="text-sm font-medium text-stone-800">{title}</p>
                <p className="text-xs text-stone-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {COLLECTION_SPOTS.map((item, index) => (
            <article key={item.name} className={`group relative overflow-hidden rounded-[2rem] bg-stone-200 ${index === 1 ? 'lg:translate-y-8' : ''}`}>
              <img src={item.image} alt={item.name} className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone-200">Curated</p>
                <h3 className="mt-3 text-2xl font-light tracking-[0.08em]">{item.name}</h3>
                <p className="mt-2 max-w-xs text-sm text-stone-200">{item.copy}</p>
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
            View All <ChevronRight size={16} className="ml-1"/>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map(product => (
            <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-stone-900 uppercase tracking-widest text-sm font-medium">{t.outOfStock}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-stone-500 uppercase tracking-wider">{product.category}</span>
                <h3 className="text-sm font-medium">{product.name}</h3>
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
            <h4 className="text-white text-xl tracking-[0.2em] mb-6 font-light">SEIAN</h4>
            <p className="text-sm font-light leading-relaxed max-w-xs">
              Defining the modern standard through minimalist design, premium materials, and uncompromised craftsmanship.
            </p>
          </div>
          <div className="flex flex-col space-y-3 text-sm font-light">
            <h5 className="text-white tracking-widest uppercase mb-3">Links</h5>
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Store Locator</a>
            <a href="#" className="hover:text-white transition-colors">Careers</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex flex-col space-y-3 text-sm font-light">
            <h5 className="text-white tracking-widest uppercase mb-3">Company</h5>
            <p>株式会社静安 (SEIAN Co., Ltd.)</p>
            <p>Corporate No. 4010501050662</p>
            <p>Representative: 趙 岩</p>
            <p>〒151-0053 東京都渋谷区代々木1-44-12 ACN代々木ビル3階</p>
            <a href="tel:+819048326638" className="hover:text-white transition-colors">090-4832-6638</a>
          </div>
          <div className="flex flex-col space-y-3 text-sm font-light">
            <h5 className="text-white tracking-widest uppercase mb-3">Policies</h5>
            {([['notice', '特定商取引法に基づく表記'], ['privacy', 'Privacy / プライバシー'], ['terms', 'Terms / 利用規約'], ['returns', 'Returns / 返品・退换货']] as const).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setLegalPage(key)} className="text-left hover:text-white transition-colors">{label}</button>
            ))}
            <button type="button" onClick={() => setLegalPage('size')} className="text-left hover:text-white transition-colors">Size & Materials / サイズ・素材</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-stone-800 text-xs text-center font-light">
          &copy; {new Date().getFullYear()} SEIAN Co., Ltd. All Rights Reserved.
        </div>
      </footer>

      {/* --- Product Detail Modal --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
              <X size={20} />
            </button>
            
            <div className="w-full md:w-1/2 bg-stone-100">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover min-h-[40vh]" />
            </div>
            
            <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
              <span className="text-xs text-stone-500 uppercase tracking-wider mb-2">{selectedProduct.category}</span>
              <h2 className="text-2xl sm:text-3xl font-light mb-4">{selectedProduct.name}</h2>
              <p className="text-xl mb-6 font-light">¥{selectedProduct.price.toLocaleString()}</p>
              <p className="text-stone-600 text-sm leading-relaxed mb-8 font-light">{selectedProduct.description}</p>
              <button type="button" onClick={() => { setSelectedProduct(null); setLegalPage('size'); }} className="text-left text-sm underline underline-offset-4 mb-6 hover:text-stone-500">Size & Materials Guide / サイズ・素材ガイド</button>
              
              <ProductOptions product={selectedProduct} onAdd={addToCart} t={t} />
            </div>
          </div>
        </div>
      )}

      {/* --- Cart Drawer --- */}
      <div className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-[#faf9f6] shadow-2xl pointer-events-auto flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-6 py-6 border-b border-stone-200 flex items-center justify-between bg-white">
            <h2 className="text-lg tracking-widest uppercase font-light">{t.cart} ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X size={20} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="uppercase tracking-widest text-sm">{t.empty}</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex space-x-4 border-b border-stone-100 pb-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="w-20 h-24 bg-stone-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-stone-500 mt-1 capitalize">{item.color} / {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">¥{item.price.toLocaleString()}</span>
                      <div className="flex items-center text-xs">
                        <span className="mx-2 text-stone-500">Qty: {item.quantity}</span>
                        <button onClick={() => removeFromCart(index)} className="text-stone-400 hover:text-stone-900 underline ml-2 transition-colors">Remove</button>
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
              <p className="text-xs text-stone-500 mb-3">JPY only. Payment processing is not connected; this prototype does not collect card details.</p>
              <button type="button" disabled className="w-full bg-stone-300 text-stone-600 py-4 uppercase tracking-widest text-sm cursor-not-allowed" aria-disabled="true">
                {t.checkout}
              </button>
              <p className="text-xs text-stone-500 mt-2">Checkout unavailable until a compliant payment provider and server-side order flow are configured.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Login / Register Modal (Placeholder) --- */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsLoginOpen(false)} />
          <div className="relative bg-white w-full max-w-md p-8 sm:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl tracking-[0.2em] uppercase font-light mb-2">SEIAN Account</h2>
              <p className="text-sm text-stone-500 font-light">Access your exclusive benefits</p>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-sm text-stone-600">Account registration and sign-in are not available in this prototype. No email or password is requested or stored here.</p>
              <button type="button" disabled className="w-full bg-stone-300 text-stone-600 py-4 uppercase tracking-widest text-sm cursor-not-allowed" aria-disabled="true">
                {t.login} / {t.register}
              </button>
              <p className="text-xs text-stone-400">Production authentication requires a verified provider flow, abuse prevention, and a published privacy notice.</p>
            </div>
          </div>
        </div>
      )}

      {legalPage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="legal-page-title">
          <button type="button" className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" aria-label="Close policy" onClick={() => setLegalPage(null)} />
          <section className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl">
            <button type="button" onClick={() => setLegalPage(null)} className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full" aria-label="Close"><X size={20} /></button>
            <h2 id="legal-page-title" className="text-xl sm:text-2xl font-light tracking-wide pr-10 mb-6">{LEGAL_COPY[lang][legalPage].title}</h2>
            <div className="space-y-4 text-sm leading-7 text-stone-600">
              {LEGAL_COPY[lang][legalPage].lines.map((line, index) => <p key={index}>{line}</p>)}
            </div>
            <p className="mt-8 pt-4 border-t border-stone-200 text-xs text-stone-500">Policy details and seller information require confirmation before this prototype is used for real sales.</p>
          </section>
        </div>
      )}

    </div>
  );
}

// --- Helper Component for Product Modal ---
type ProductOptionsProps = {
  product: Product;
  onAdd: (product: Product, size: string, color: string) => void;
  t: TranslationMap;
};

function ProductOptions({ product, onAdd, t }: ProductOptionsProps) {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] ?? '');
  const isOutOfStock = product.stock === 0;

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <span className="block text-xs uppercase tracking-widest text-stone-500 mb-3">Color: <span className="text-stone-900 ml-1">{selectedColor}</span></span>
        <div className="flex space-x-3">
          {product.colors.map((color: string) => (
            <button 
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 border text-sm transition-colors ${selectedColor === color ? 'border-stone-900 text-stone-900 bg-stone-50' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <span className="block text-xs uppercase tracking-widest text-stone-500 mb-3">Size: <span className="text-stone-900 ml-1">{selectedSize}</span></span>
        <div className="flex flex-wrap gap-3">
          {product.sizes.map((size: string) => (
            <button 
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-12 h-12 flex items-center justify-center border text-sm transition-colors ${selectedSize === size ? 'border-stone-900 text-stone-900 bg-stone-50' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="pt-4">
        <button 
          onClick={() => onAdd(product, selectedSize, selectedColor)}
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