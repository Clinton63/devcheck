export default function PrivacyPolicy({ onClose }) {
  return (
    <div
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9999,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'24px 16px',overflowY:'auto'}}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{background:'#1C1C1C',border:'1px solid #2E2E2E',borderRadius:12,maxWidth:680,width:'100%',padding:'32px',position:'relative',marginBottom:24}}>
        <button
          onClick={onClose}
          style={{position:'absolute',top:16,right:16,background:'none',border:'none',color:'#6B7280',fontSize:20,cursor:'pointer',lineHeight:1}}
          aria-label="Close"
        >✕</button>

        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#F2F2F2',marginBottom:4}}>Privacy Policy</div>
        <div style={{fontSize:11,color:'#6B7280',marginBottom:8}}>Effective Date: 30 May 2026 &nbsp;·&nbsp; Last Updated: 30 May 2026</div>
        <div style={{borderBottom:'1px solid #2E2E2E',marginBottom:24}}/>

        <Section title="1. Introduction">
          DevCheck is a South Australian property development feasibility tool operated by Clinton Barker Property. We are committed to protecting your privacy in accordance with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).
        </Section>

        <Section title="2. What Information We Collect">
          DevCheck collects only one piece of personal information:
          <Li>Your <strong style={{color:'#F2F2F2'}}>email address</strong>, used solely to log in and manage your account.</Li>
          <div style={{marginTop:6}}>That's it.</div>
        </Section>

        <Section title="3. What We Do NOT Collect or Store">
          We want to be absolutely clear:
          <Li><strong style={{color:'#F2F2F2'}}>Property addresses</strong> you enter into DevCheck are not recorded, stored, or retained in any way.</Li>
          <Li><strong style={{color:'#F2F2F2'}}>Financial figures, development costs, valuations, or any other data</strong> you input during a feasibility assessment are not recorded, stored, or retained in any way.</Li>
          <Li>No assessment inputs or results are saved to any database or server once your session ends.</Li>
          <Li>We cannot access, view, or retrieve anything you have entered into the tool.</Li>
          <div style={{marginTop:10,padding:'10px 14px',background:'rgba(52,168,110,0.08)',border:'1px solid rgba(52,168,110,0.3)',borderRadius:6,fontSize:13,color:'#8ECFB0'}}>
            Every assessment you run is completely private to you.
          </div>
        </Section>

        <Section title="4. How We Use Your Email Address">
          Your email address is used only to:
          <Li>Verify your identity and provide access to DevCheck</Li>
          <Li>Communicate with you about your account or subscription</Li>
          <Li>Send service-related notifications (e.g. billing, updates)</Li>
          <Li>Send marketing communications, only if you have opted in</Li>
          <div style={{marginTop:6}}>We do not share your email address with third parties for marketing purposes.</div>
        </Section>

        <Section title="5. AI-Powered Processing">
          DevCheck uses the Anthropic Claude API to generate feasibility assessments. Inputs you enter are transmitted to Anthropic's servers for processing in real time and are not retained after your session ends. Anthropic does not store your inputs for training purposes under standard API usage. For full details see{' '}
          <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{color:'#34A86E'}}>anthropic.com/privacy</a>.
        </Section>

        <Section title="6. Payment Processing">
          Subscriptions are processed securely by Stripe. We do not store your payment card details. See{' '}
          <a href="https://stripe.com/au/privacy" target="_blank" rel="noopener noreferrer" style={{color:'#34A86E'}}>stripe.com/au/privacy</a>{' '}
          for how Stripe handles billing data.
        </Section>

        <Section title="7. Data Storage & Security">
          The only data we hold is your email address, stored securely for account access purposes. We take reasonable steps to protect it from unauthorised access or disclosure.
        </Section>

        <Section title="8. Third-Party Disclosure">
          We do not sell your personal information. The only third parties involved are:
          <Li><strong style={{color:'#F2F2F2'}}>Anthropic</strong> — real-time AI processing (no data retained)</Li>
          <Li><strong style={{color:'#F2F2F2'}}>Stripe</strong> — subscription billing only</Li>
        </Section>

        <Section title="9. Your Rights">
          You may at any time:
          <Li>Request access to or deletion of your email address from our records</Li>
          <Li>Cancel your subscription</Li>
          <Li>Opt out of any marketing communications</Li>
          <div style={{marginTop:6}}>To make a request, contact us below.</div>
        </Section>

        <Section title="10. Contact Us">
          <strong style={{color:'#F2F2F2'}}>Clinton Barker Property</strong><br/>
          Email:{' '}<a href="mailto:clinton.barker@expaustralia.com.au" style={{color:'#34A86E'}}>clinton.barker@expaustralia.com.au</a><br/>
          Phone:{' '}<a href="tel:0409904473" style={{color:'#34A86E'}}>0409 904 473</a>
        </Section>

        <Section title="11. Changes to This Policy">
          We may update this policy from time to time. Material changes will be communicated via email or in-app notification.
        </Section>

        <div style={{marginTop:28,textAlign:'center'}}>
          <button
            onClick={onClose}
            style={{background:'#34A86E',border:'none',borderRadius:6,color:'#fff',fontSize:13,padding:'10px 28px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:22}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:700,color:'#F2F2F2',marginBottom:7}}>{title}</div>
      <div style={{fontSize:13,color:'#A0A8B0',lineHeight:1.8}}>{children}</div>
    </div>
  )
}

function Li({ children }) {
  return (
    <div style={{display:'flex',gap:8,margin:'4px 0',paddingLeft:4}}>
      <span style={{color:'#34A86E',flexShrink:0,marginTop:2}}>▸</span>
      <span>{children}</span>
    </div>
  )
}
