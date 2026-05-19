// Common disposable/temporary email providers
// Blocks bad-faith free-tier abuse before sending OTP
const BLOCKED = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org',
  'guerrillamail.biz','guerrillamail.de','guerrillamail.info','grr.la','guerrillamailblock.com',
  'spam4.me','trashmail.com','trashmail.me','trashmail.net','trashmail.io',
  'tempmail.com','temp-mail.org','tempinbox.com','tempr.email','dispostable.com',
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf','moncourrier.fr.nf',
  'monemail.fr.nf','monmail.fr.nf','sharklasers.com','guerrillamail.info',
  'throwam.com','throwam.net','throwaway.email','mailnull.com','spamgourmet.com',
  'maildrop.cc','discard.email','inboxbear.com','spambox.us','fakeinbox.com',
  'getonemail.com','mailnesia.com','spamfree24.org','spamgob.com','dodgit.com',
  'filzmail.com','dispostable.com','spamevader.com','mailexpire.com',
])

// Returns true if the email domain is blocked
export function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return true
  return BLOCKED.has(domain)
}
