import { useState, useEffect } from 'react';

// PayPal client ID — replace with your actual PayPal Client ID
const PAYPAL_CLIENT_ID = 'YOUR_PAYPAL_CLIENT_ID';

const creditPackages = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4.99,
    credits: 10,
    features: ['10 HD outputs', 'JPG / PNG / WebP', 'Commercial use', 'Never expires'],
    popular: false,
  },
  {
    id: 'popular',
    name: 'Popular',
    price: 12.99,
    credits: 30,
    features: ['30 HD outputs', 'JPG / PNG / WebP', 'Commercial use', 'Never expires', 'Priority processing'],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 29.99,
    credits: 80,
    features: ['80 HD outputs', 'JPG / PNG / WebP', 'Commercial use', 'Never expires', 'Priority processing', 'Bulk processing'],
    popular: false,
  },
];

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    period: 'month',
    credits: 25,
    creditsPeriod: 'per month',
    features: ['25 outputs / month', 'JPG / PNG / WebP', 'Commercial use', 'Auto-renew'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    period: 'month',
    credits: 60,
    creditsPeriod: 'per month',
    features: ['60 outputs / month', 'JPG / PNG / WebP', 'Commercial use', 'Auto-renew', 'Priority processing'],
    popular: true,
  },
];

const pricingFaqs = [
  { q: 'Do credits expire?', a: 'No! One-time credit packages never expire. Monthly subscription credits refresh each billing cycle.' },
  { q: 'What payment methods do you accept?', a: 'We accept PayPal and all major credit cards (Visa, Mastercard, Amex). All payments are processed securely.' },
  { q: 'Can I get a refund?', a: 'Yes, within 7 days of purchase if you\'re unsatisfied. Contact us with your order details.' },
  { q: 'What counts as 1 credit?', a: 'Each background removal = 1 credit, regardless of image size. Failed or invalid requests are not charged.' },
  { q: 'Is there a free trial?', a: 'Yes! New users get 3 free credits just by signing in with Google.' },
  { q: 'Can I upgrade or downgrade my plan?', a: 'Absolutely. You can change your subscription at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
];

export default function Pricing({ user }) {
  const [tab, setTab] = useState('credits');
  const [openFaq, setOpenFaq] = useState(null);
  const [purchasing, setPurchasing] = useState(null); // package key being purchased
  const [paypalReady, setPaypalReady] = useState(false);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  // Load PayPal script on mount
  useEffect(() => {
    if (window.paypal) { setPaypalReady(true); return; }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = () => setPaypalReady(true);
    document.head.appendChild(script);
  }, []);

  const handlePurchase = async (type, packageId) => {
    if (!user?.email) {
      alert('Please sign in with Google first to make a purchase.');
      return;
    }

    setPurchasing(`${type}_${packageId}`);

    try {
      const res = await fetch('/api/paypal-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, packageId, email: user.email }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create order');

      // Redirect to PayPal approval URL
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (err) {
      alert(`Purchase failed: ${err.message}`);
      setPurchasing(null);
    }
  };

  return (
    <div className="pricing-page">
      {/* Hero */}
      <section className="pricing-hero">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="container">
          <div className="pricing-hero-content">
            <h1 className="pricing-title">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="pricing-subtitle">
              Remove backgrounds instantly. No hidden fees.
            </p>

            {/* Tab Switch */}
            <div className="tab-switch">
              <button
                className={`tab-btn ${tab === 'credits' ? 'active' : ''}`}
                onClick={() => setTab('credits')}
              >
                Credit Packs
              </button>
              <button
                className={`tab-btn ${tab === 'monthly' ? 'active' : ''}`}
                onClick={() => setTab('monthly')}
              >
                Monthly
              </button>
            </div>

            {/* Credit Packs */}
            {tab === 'credits' && (
              <div className="plans-grid">
                {creditPackages.map((pkg) => (
                  <div key={pkg.name} className={`plan-card glass-card ${pkg.popular ? 'popular' : ''}`}>
                    {pkg.popular && <div className="popular-badge">Most Popular</div>}
                    <div className="plan-header">
                      <h3 className="plan-name">{pkg.name}</h3>
                      <div className="plan-price">
                        <span className="currency">$</span>
                        <span className="amount">{pkg.price}</span>
                      </div>
                      <p className="plan-credits">{pkg.credits} credits</p>
                    </div>
                    <ul className="plan-features">
                      {pkg.features.map((f) => (
                        <li key={f}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`btn btn-lg ${pkg.popular ? 'btn-primary' : 'btn-secondary'} w-full`}
                      onClick={() => handlePurchase('credit', pkg.id)}
                      disabled={purchasing === `${pkg.id}`}
                    >
                      {purchasing === `credit_${pkg.id}` ? 'Redirecting...' : pkg.popular ? 'Buy Now' : 'Get Started'}
                    </button>
                    <p className="plan-cta-hint">PayPal • Secure payment</p>
                  </div>
                ))}
              </div>
            )}

            {/* Monthly Plans */}
            {tab === 'monthly' && (
              <div className="plans-grid plans-grid-2">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.name} className={`plan-card glass-card ${plan.popular ? 'popular' : ''}`}>
                    {plan.popular && <div className="popular-badge">Best Value</div>}
                    <div className="plan-header">
                      <h3 className="plan-name">{plan.name}</h3>
                      <div className="plan-price">
                        <span className="currency">$</span>
                        <span className="amount">{plan.price}</span>
                        <span className="period">/{plan.period}</span>
                      </div>
                      <p className="plan-credits">{plan.credits} outputs {plan.creditsPeriod}</p>
                    </div>
                    <ul className="plan-features">
                      {plan.features.map((f) => (
                        <li key={f}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`btn btn-lg ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full`}
                      onClick={() => handlePurchase('subscription', plan.id)}
                      disabled={purchasing === `subscription_${plan.id}`}
                    >
                      {purchasing === `subscription_${plan.id}` ? 'Redirecting...' : plan.popular ? 'Subscribe Now' : 'Subscribe'}
                    </button>
                    <p className="plan-cta-hint">PayPal • Auto-renew monthly</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom perks */}
            <div className="perks-row">
              <span>✓ Never expires</span>
              <span>✓ JPG / PNG / WebP</span>
              <span>✓ Commercial use</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
            <p className="section-subtitle">Got questions? We've got answers.</p>
          </div>
          <div className="faq-list">
            {pricingFaqs.map((faq, i) => (
              <div key={i} className={`faq-item glass-card ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(i)}>
                  <span>{faq.q}</span>
                  <svg className="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`faq-answer ${openFaq === i ? 'visible' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pricing-cta section">
        <div className="container">
          <div className="pricing-cta-card glass-card">
            <h2>Start Removing Backgrounds for Free</h2>
            <p>No signup required. Get 3 free credits just by signing in with Google.</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => window.location.hash = ''}
            >
              Try for Free
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .pricing-page {
          padding-top: 80px;
        }

        /* Hero */
        .pricing-hero {
          position: relative;
          padding: 5rem 0 4rem;
          overflow: hidden;
        }
        .pricing-hero .hero-bg,
        .pricing-hero .hero-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .pricing-hero .hero-bg {
          background: var(--color-bg-primary);
        }
        .pricing-hero .hero-glow {
          background: radial-gradient(ellipse at 50% -20%, rgba(124, 58, 237, 0.2) 0%, transparent 60%);
        }
        .pricing-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        .pricing-title {
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          margin-bottom: 1rem;
        }
        .pricing-subtitle {
          font-size: 1.15rem;
          color: var(--color-text-secondary);
          margin-bottom: 3rem;
        }

        /* Tab Switch */
        .tab-switch {
          display: inline-flex;
          background: var(--color-glass-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 0.3rem;
          margin-bottom: 3rem;
          gap: 0.25rem;
        }
        .tab-btn {
          padding: 0.6rem 1.8rem;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          background: none;
          transition: all var(--transition-base);
        }
        .tab-btn.active {
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
        }
        .tab-btn:hover:not(.active) {
          color: var(--color-text-primary);
          background: rgba(124, 58, 237, 0.1);
        }

        /* Plans Grid */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto 2.5rem;
        }
        .plans-grid-2 {
          grid-template-columns: repeat(2, 1fr);
          max-width: 700px;
        }

        /* Plan Card */
        .plan-card {
          padding: 2rem 1.75rem;
          text-align: left;
          position: relative;
          transition: all var(--transition-base);
          display: flex;
          flex-direction: column;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
          border-color: var(--color-border-hover);
        }
        .plan-card.popular {
          border-color: var(--color-accent-purple);
          background: rgba(124, 58, 237, 0.08);
        }
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gradient-primary);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 1rem;
          border-radius: 999px;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.5);
        }
        .plan-header {
          margin-bottom: 1.5rem;
        }
        .plan-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--color-text-primary);
        }
        .plan-price {
          display: flex;
          align-items: baseline;
          gap: 0.15rem;
          margin-bottom: 0.25rem;
        }
        .currency {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-secondary);
        }
        .amount {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .period {
          font-size: 1rem;
          color: var(--color-text-secondary);
          margin-left: 0.15rem;
        }
        .plan-credits {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
        .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          margin-bottom: 2rem;
          flex: 1;
        }
        .plan-features li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
        .plan-features li svg {
          flex-shrink: 0;
          color: var(--color-accent-purple);
        }
        .w-full { width: 100%; }
        .plan-cta-hint {
          text-align: center;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 0.75rem;
        }

        /* Perks Row */
        .perks-row {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }
        .perks-row span {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* FAQ — reuse existing FAQ styles */
        .section-header { text-align: center; max-width: 600px; margin: 0 auto 4rem; }
        .section-title { font-size: clamp(2rem, 4vw, 2.8rem); margin-bottom: 1rem; }
        .section-subtitle { font-size: 1.1rem; color: var(--color-text-secondary); }
        .faq-list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; }
        .faq-item { padding: 0; overflow: hidden; transition: all var(--transition-base); }
        .faq-item.open { border-color: var(--color-border-hover); }
        .faq-question {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          padding: 1.25rem 1.5rem; background: none; color: var(--color-text-primary);
          font-size: 1rem; font-weight: 600; text-align: left;
        }
        .faq-question:hover { color: var(--color-accent-purple); }
        .faq-chevron { flex-shrink: 0; color: var(--color-text-muted); transition: transform var(--transition-base); }
        .faq-item.open .faq-chevron { transform: rotate(180deg); color: var(--color-accent-purple); }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height var(--transition-base); }
        .faq-answer.visible { max-height: 300px; }
        .faq-answer p { padding: 0 1.5rem 1.25rem; color: var(--color-text-secondary); font-size: 0.95rem; line-height: 1.7; }

        /* CTA */
        .pricing-cta-card {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
          border-color: rgba(124, 58, 237, 0.3);
        }
        .pricing-cta-card h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          margin-bottom: 1rem;
        }
        .pricing-cta-card p {
          color: var(--color-text-secondary);
          font-size: 1.05rem;
          margin-bottom: 2rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr; max-width: 400px; }
          .plans-grid-2 { max-width: 400px; }
        }
        @media (max-width: 600px) {
          .perks-row { gap: 0.75rem; flex-direction: column; align-items: center; }
          .tab-btn { padding: 0.5rem 1.2rem; font-size: 0.875rem; }
        }
      `}</style>
    </div>
  );
}
