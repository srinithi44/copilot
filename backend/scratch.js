import { Resend } from 'resend';

const resend = new Resend('re_4hwoFfgM_EsARcmduGPhCYpFRUzwP1VPN');

async function checkDomains() {
  const domains = await resend.domains.list();
  console.log(JSON.stringify(domains, null, 2));
}

checkDomains();
