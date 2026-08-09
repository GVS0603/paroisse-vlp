// Relais AELF — renvoie l'évangile du jour (zone France)
// Textes liturgiques © AELF, Paris — https://www.aelf.org
exports.handler = async () => {
  try {
    const date = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date()); // -> AAAA-MM-JJ

    const r = await fetch(`https://api.aelf.org/v1/messes/${date}/france`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!r.ok) throw new Error('AELF ' + r.status);
    const data = await r.json();

    const messe = (data.messes && data.messes[0]) || {};
    const lectures = messe.lectures || [];
    const ev = lectures.find(l => (l.type || '').toLowerCase() === 'evangile') || {};
    const info = data.informations || {};

    const payload = {
      date,
      jour: info.jour_liturgique_nom || info.ligne1 || '',
      reference: ev.reference || '',
      titre: ev.titre || '',
      intro: ev.intro_lue || '',
      contenu: ev.contenu || ''
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify(payload)
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'indisponible' })
    };
  }
};
